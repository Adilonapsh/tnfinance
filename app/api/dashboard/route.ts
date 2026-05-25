import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/firebase-admin';
import { prisma } from '@/lib/prisma';
import { startOfMonth, startOfWeek } from 'date-fns';

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split('Bearer ')[1];
    const { uid: firebaseUid } = await verifyToken(token);

    const user = await prisma.user.findUnique({
      where: { firebaseUid },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found in Postgres' }, { status: 404 });
    }

    return await getDashboardData(user);
  } catch (error) {
    console.error('Error in /api/dashboard:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

async function getDashboardData(user: any) {
  const userId = user.id;
  const userSettings = (user.settings as any) || {};

  // Fetch all parallel data from Postgres
  const [
    accounts,
    transactions,
    investments,
    budgets,
    savingPlans,
    netWorthHistory,
    portfolioHistory,
    categories,
    subscriptions
  ] = await Promise.all([
    prisma.account.findMany({ where: { userId, isDeleted: false } }),
    prisma.transaction.findMany({ 
      where: { userId, isDeleted: false },
      orderBy: { transactionDate: 'desc' },
    }),
    prisma.investment.findMany({ where: { userId, isDeleted: false } }),
    prisma.budget.findMany({ where: { userId, isDeleted: false } }),
    prisma.savingPlan.findMany({ where: { userId, isDeleted: false } }),
    prisma.netWorthHistory.findMany({ where: { userId }, orderBy: { date: 'asc' } }),
    prisma.portfolioHistory.findMany({ where: { userId }, orderBy: { date: 'asc' } }),
    prisma.category.findMany({ where: { OR: [{ userId }, { userId: null }] } }),
    prisma.subscription.findMany({ where: { userId, isDeleted: false, isActive: true }, include: { category: true }, orderBy: { nextBillingDate: 'asc' } })
  ]);

  // Aggregate Data
  const now = new Date();
  const startOfCurrentMonth = startOfMonth(now);
  const startOfCurrentWeek = startOfWeek(now, { weekStartsOn: 1 });

  let totalIncome = 0;
  let totalExpense = 0;
  let weeklyIncome = 0;
  let weeklyExpense = 0;
  let totalSavings = 0;
  let totalInvestments = 0;

  const cashflowMap = new Map();
  const expenseByCategoryMap = new Map();

  transactions.forEach((tx) => {
    const txDate = tx.transactionDate instanceof Date ? tx.transactionDate : new Date(tx.transactionDate);
    const isThisMonth = txDate >= startOfCurrentMonth;
    const isThisWeek = txDate >= startOfCurrentWeek;

    if (isThisMonth) {
      const type = tx.type?.toLowerCase();
      if (type === 'income' || type === 'credit') {
        totalIncome += tx.amount;
        if (isThisWeek) weeklyIncome += tx.amount;
      } else if (type === 'expense' || type === 'debit') {
        totalExpense += tx.amount;
        if (isThisWeek) weeklyExpense += tx.amount;

        // Breakdown
        const current = expenseByCategoryMap.get(tx.categoryId) || 0;
        expenseByCategoryMap.set(tx.categoryId, current + tx.amount);
      }
    }

    // Cashflow Monthly
    const monthKey = txDate.toLocaleString('default', { month: 'short' });
    if (!cashflowMap.has(monthKey)) {
      cashflowMap.set(monthKey, { name: monthKey, income: 0, expense: 0 });
    }
    const type = tx.type?.toLowerCase();
    if (type === 'income' || type === 'credit') cashflowMap.get(monthKey).income += tx.amount;
    if (type === 'expense' || type === 'debit') cashflowMap.get(monthKey).expense += tx.amount;
  });

  const cashflowData = Array.from(cashflowMap.values());

  // Accounts
  accounts.forEach(acc => {
    if (acc.type === 'ewallet' || acc.type === 'bank' || acc.type === 'cash') {
      totalSavings += acc.balance;
    }
  });

  // Investments
  investments.forEach(inv => {
    totalInvestments += inv.totalValue;
  });

  // Expense Breakdown formatting
  const expenseBreakdownData = Array.from(expenseByCategoryMap.entries()).map(([catId, amount]) => {
    const cat = categories.find(c => c.id === catId);
    return {
      name: cat?.name || 'Uncategorized',
      amount,
      value: Math.round((amount / (totalExpense || 1)) * 100),
      color: cat?.color || '#cbd5e1'
    };
  }).sort((a, b) => b.amount - a.amount);

  // Variance Data (Budgets vs Actual)
  const varianceData = budgets.map(b => {
    const spent = expenseByCategoryMap.get(b.categoryId) || 0;
    const category = categories.find(c => c.id === b.categoryId);
    return {
      name: b.name || category?.name || 'Budget',
      variance: b.amount - spent,
      budget: b.amount,
      actual: spent
    };
  });

  // Map saving plans
  const savingPlansData = savingPlans.map(sp => ({
    id: sp.id,
    title: sp.name,
    current: sp.currentAmount,
    target: sp.targetAmount,
    percent: Math.min(100, Math.round((sp.currentAmount / (sp.targetAmount || 1)) * 100))
  }));

  // Format transactions for UI
  const recentTransactions = transactions.slice(0, 5).map(tx => {
    const cat = categories.find(c => c.id === tx.categoryId);
    return {
      id: tx.id,
      title: tx.description || cat?.name || 'Transaction',
      category: cat?.name || 'Uncategorized',
      date: (tx.transactionDate instanceof Date ? tx.transactionDate : new Date(tx.transactionDate)).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      amount: tx.amount,
      isPositive: tx.type?.toLowerCase() === 'income' || tx.type?.toLowerCase() === 'credit'
    };
  });

  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  let spentToday = 0;
  transactions.forEach(tx => {
    const txDate = tx.transactionDate instanceof Date ? tx.transactionDate : new Date(tx.transactionDate);
    const type = tx.type?.toLowerCase();
    if ((type === 'expense' || type === 'debit') && txDate >= startOfToday) {
      spentToday += tx.amount;
    }
  });

  // Calculate total budget
  const totalMonthlyBudget = budgets.reduce((sum, b) => {
    if (b.period === 'monthly') return sum + b.amount;
    if (b.period === 'daily') return sum + (b.amount * 30);
    if (b.period === 'weekly') return sum + (b.amount * 4);
    return sum;
  }, 0) || (totalIncome * 0.7) || 10000000;

  // Priority: User Setting > Calculated Default
  const dailyLimit = userSettings.dailyLimit || (totalMonthlyBudget / 30);

  return NextResponse.json({
    totalIncome,
    totalExpense,
    spentToday,
    dailyLimit,
    weeklyIncome,
    weeklyExpense,
    totalSavings,
    totalInvestments,
    totalMonthlyBudget,
    cashflowData,
    expenseBreakdownData,
    varianceData,
    savingPlans: savingPlansData,
    recentTransactions,
    accounts: accounts.map(acc => ({
      id: acc.id,
      name: acc.name,
      type: acc.type,
      balance: acc.balance,
      color: acc.color,
      icon: acc.icon,
      accountNumber: acc.accountNumber
    })),
    subscriptions: subscriptions.map(sub => ({
      id: sub.id,
      name: sub.name,
      amount: sub.amount,
      nextBillingDate: sub.nextBillingDate,
      billingPeriod: sub.billingPeriod,
      icon: sub.icon,
      category: sub.category?.name
    })),
    netWorthData: netWorthHistory.map(n => ({ 
      name: n.date instanceof Date ? n.date.toLocaleDateString() : new Date(n.date).toLocaleDateString(), 
      value: n.netWorth 
    })),
    portfolioData: portfolioHistory
  });
}
