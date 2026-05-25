import { PrismaClient } from '@prisma/client'
import { subMonths, subDays, format, startOfMonth } from 'date-fns'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Start seeding...')

  console.log('🗑️  Cleaning up previous seed data...')
  // Delete in FK-safe order
  await prisma.debtPayment.deleteMany()
  await prisma.debt.deleteMany()
  await prisma.subscription.deleteMany()
  await prisma.investmentTransaction.deleteMany()
  await prisma.investment.deleteMany()
  await prisma.portfolioHistory.deleteMany()
  await prisma.netWorthHistory.deleteMany()
  await prisma.budget.deleteMany()
  await prisma.savingPlan.deleteMany()
  await prisma.transaction.deleteMany()
  await prisma.recurringTransaction.deleteMany()
  await prisma.notification.deleteMany()
  await prisma.userSession.deleteMany()
  await prisma.category.deleteMany({ where: { userId: { not: null } } })
  await prisma.account.deleteMany()
  await prisma.user.deleteMany()
  console.log('✅ Cleanup done')

  // ========================
  // 1. USER
  // ========================
  const user = await prisma.user.upsert({
    where: { firebaseUid: 'F6GdbUU8jnQBuXifCuAaXEN4kJj2' },
    update: {},
    create: {
      email: 'demo@fintrack.app',
      firebaseUid: 'F6GdbUU8jnQBuXifCuAaXEN4kJj2',
      displayName: 'Demo User',
      emailVerified: true,
      currency: 'IDR',
      locale: 'id-ID',
      timezone: 'Asia/Jakarta',
      onboardingCompleted: true,
    },
  })
  console.log('✅ User created:', user.email)

  // ========================
  // 2. ACCOUNTS
  // ========================
  const bankAccount = await prisma.account.upsert({
    where: { id: 'acc-bank-001' },
    update: {},
    create: {
      id: 'acc-bank-001',
      userId: user.id,
      name: 'BCA Tabungan',
      type: 'bank',
      institutionName: 'Bank Central Asia',
      balance: 18500000,
      currency: 'IDR',
      color: '#1f4842',
      icon: 'building-2',
    },
  })

  const ewalletAccount = await prisma.account.upsert({
    where: { id: 'acc-ewallet-001' },
    update: {},
    create: {
      id: 'acc-ewallet-001',
      userId: user.id,
      name: 'GoPay',
      type: 'ewallet',
      balance: 2300000,
      currency: 'IDR',
      color: '#00aa5b',
      icon: 'smartphone',
    },
  })

  const cashAccount = await prisma.account.upsert({
    where: { id: 'acc-cash-001' },
    update: {},
    create: {
      id: 'acc-cash-001',
      userId: user.id,
      name: 'Dompet Tunai',
      type: 'cash',
      balance: 800000,
      currency: 'IDR',
      color: '#f59e0b',
      icon: 'wallet',
    },
  })
  console.log('✅ Accounts created')

  // ========================
  // 3. CATEGORIES
  // ========================
  const categories = await Promise.all([
    prisma.category.upsert({ where: { id: 'cat-salary' }, update: {}, create: { id: 'cat-salary', userId: user.id, name: 'Gaji', type: 'income', icon: 'briefcase', color: '#bdf29f', sortOrder: 1 } }),
    prisma.category.upsert({ where: { id: 'cat-freelance' }, update: {}, create: { id: 'cat-freelance', userId: user.id, name: 'Freelance', type: 'income', icon: 'laptop', color: '#a5f3fc', sortOrder: 2 } }),
    prisma.category.upsert({ where: { id: 'cat-investment-income' }, update: {}, create: { id: 'cat-investment-income', userId: user.id, name: 'Dividen / Investasi', type: 'income', icon: 'trending-up', color: '#fde68a', sortOrder: 3 } }),
    prisma.category.upsert({ where: { id: 'cat-food' }, update: {}, create: { id: 'cat-food', userId: user.id, name: 'Makanan & Minuman', type: 'expense', icon: 'utensils', color: '#fca5a5', sortOrder: 4 } }),
    prisma.category.upsert({ where: { id: 'cat-transport' }, update: {}, create: { id: 'cat-transport', userId: user.id, name: 'Transportasi', type: 'expense', icon: 'car', color: '#c4b5fd', sortOrder: 5 } }),
    prisma.category.upsert({ where: { id: 'cat-shopping' }, update: {}, create: { id: 'cat-shopping', userId: user.id, name: 'Belanja', type: 'expense', icon: 'shopping-bag', color: '#fdba74', sortOrder: 6 } }),
    prisma.category.upsert({ where: { id: 'cat-bills' }, update: {}, create: { id: 'cat-bills', userId: user.id, name: 'Tagihan & Utilitas', type: 'expense', icon: 'zap', color: '#6ee7b7', sortOrder: 7 } }),
    prisma.category.upsert({ where: { id: 'cat-health' }, update: {}, create: { id: 'cat-health', userId: user.id, name: 'Kesehatan', type: 'expense', icon: 'heart', color: '#fb7185', sortOrder: 8 } }),
    prisma.category.upsert({ where: { id: 'cat-entertainment' }, update: {}, create: { id: 'cat-entertainment', userId: user.id, name: 'Hiburan', type: 'expense', icon: 'tv', color: '#818cf8', sortOrder: 9 } }),
    prisma.category.upsert({ where: { id: 'cat-education' }, update: {}, create: { id: 'cat-education', userId: user.id, name: 'Pendidikan', type: 'expense', icon: 'book-open', color: '#60a5fa', sortOrder: 10 } }),
  ])
  const [catSalary, catFreelance, catInvIncome, catFood, catTransport, catShopping, catBills, catHealth, catEntertainment, catEducation] = categories
  console.log('✅ Categories created')

  // ========================
  // 4. TRANSACTIONS (12 months of history)
  // ========================
  await prisma.transaction.deleteMany({ where: { userId: user.id } })

  const txData = []
  const now = new Date()

  for (let m = 11; m >= 0; m--) {
    const monthDate = subMonths(now, m)
    const monthStart = startOfMonth(monthDate)
    const salaryDate = new Date(monthStart); salaryDate.setDate(25)

    // Income: Gaji bulanan
    txData.push({
      userId: user.id,
      accountId: bankAccount.id,
      categoryId: catSalary.id,
      type: 'income',
      status: 'completed',
      amount: 8500000,
      description: 'Gaji Bulanan',
      transactionDate: salaryDate,
      tags: ['salary'],
    })

    // Income: Freelance (bulan acak)
    if (m % 3 === 0) {
      txData.push({
        userId: user.id,
        accountId: bankAccount.id,
        categoryId: catFreelance.id,
        type: 'income',
        status: 'completed',
        amount: 1500000 + Math.floor(Math.random() * 1000000),
        description: 'Project Freelance',
        transactionDate: subDays(salaryDate, 5),
        tags: ['freelance'],
      })
    }

    // Expenses per month
    const expenseItems = [
      { cat: catFood.id, amount: 800000, desc: 'Belanja groceries & makan', account: bankAccount.id },
      { cat: catFood.id, amount: 250000, desc: 'Makan siang kantor', account: ewalletAccount.id },
      { cat: catTransport.id, amount: 350000, desc: 'Bensin & parkir', account: ewalletAccount.id },
      { cat: catShopping.id, amount: 450000 + Math.floor(Math.random() * 200000), desc: 'Belanja bulanan Shopee', account: bankAccount.id },
      { cat: catBills.id, amount: 150000, desc: 'Listrik PLN', account: bankAccount.id },
      { cat: catBills.id, amount: 200000, desc: 'Internet & Pulsa', account: ewalletAccount.id },
      { cat: catEntertainment.id, amount: 100000, desc: 'Netflix & Spotify', account: bankAccount.id },
      { cat: catHealth.id, amount: Math.floor(Math.random() * 300000) + 100000, desc: 'Apotek & Vitamin', account: cashAccount.id },
    ]

    expenseItems.forEach((item, idx) => {
      txData.push({
        userId: user.id,
        accountId: item.account,
        categoryId: item.cat,
        type: 'expense',
        status: 'completed',
        amount: item.amount,
        description: item.desc,
        transactionDate: new Date(monthStart.getFullYear(), monthStart.getMonth(), idx + 2),
        tags: [],
      })
    })
  }

  await prisma.transaction.createMany({ data: txData })
  console.log(`✅ ${txData.length} Transactions created`)

  // ========================
  // 5. INVESTMENTS
  // ========================
  const investments = await Promise.all([
    prisma.investment.upsert({
      where: { id: 'inv-bbca' },
      update: {},
      create: {
        id: 'inv-bbca',
        userId: user.id,
        name: 'Bank Central Asia',
        tickerSymbol: 'BBCA',
        type: 'stock',
        exchange: 'IDX',
        currency: 'IDR',
        currentPrice: 9850,
        purchasePrice: 8200,
        quantity: 100,
        totalValue: 985000,
        costBasis: 820000,
        unrealizedGainLoss: 165000,
        unrealizedGainLossPercentage: 20.12,
        icon: 'trending-up',
        purchaseDate: subMonths(now, 8),
      }
    }),
    prisma.investment.upsert({
      where: { id: 'inv-rdpu' },
      update: {},
      create: {
        id: 'inv-rdpu',
        userId: user.id,
        name: 'Reksa Dana Pasar Uang',
        type: 'mutual_fund',
        currency: 'IDR',
        currentPrice: 1250,
        purchasePrice: 1000,
        quantity: 5000,
        totalValue: 6250000,
        costBasis: 5000000,
        unrealizedGainLoss: 1250000,
        unrealizedGainLossPercentage: 25,
        icon: 'pie-chart',
        purchaseDate: subMonths(now, 12),
      }
    }),
    prisma.investment.upsert({
      where: { id: 'inv-gold' },
      update: {},
      create: {
        id: 'inv-gold',
        userId: user.id,
        name: 'Emas Antam',
        type: 'gold',
        currency: 'IDR',
        currentPrice: 1200000,
        purchasePrice: 950000,
        quantity: 5,
        totalValue: 6000000,
        costBasis: 4750000,
        unrealizedGainLoss: 1250000,
        unrealizedGainLossPercentage: 26.3,
        icon: 'gem',
        purchaseDate: subMonths(now, 18),
      }
    }),
  ])
  console.log('✅ Investments created')

  // ========================
  // 6. SAVING PLANS
  // ========================
  await Promise.all([
    prisma.savingPlan.upsert({
      where: { id: 'sp-emergency' },
      update: {},
      create: {
        id: 'sp-emergency',
        userId: user.id,
        name: 'Dana Darurat',
        description: 'Target 6 bulan pengeluaran',
        targetAmount: 30000000,
        currentAmount: 18500000,
        icon: 'shield',
        color: '#1f4842',
        priority: 1,
      }
    }),
    prisma.savingPlan.upsert({
      where: { id: 'sp-vacation' },
      update: {},
      create: {
        id: 'sp-vacation',
        userId: user.id,
        name: 'Liburan Jepang',
        description: 'Trip ke Jepang tahun depan',
        targetAmount: 20000000,
        currentAmount: 7500000,
        deadline: new Date(now.getFullYear() + 1, 5, 1),
        icon: 'plane',
        color: '#3b82f6',
        priority: 2,
      }
    }),
    prisma.savingPlan.upsert({
      where: { id: 'sp-laptop' },
      update: {},
      create: {
        id: 'sp-laptop',
        userId: user.id,
        name: 'Laptop Baru',
        description: 'MacBook Pro M3',
        targetAmount: 25000000,
        currentAmount: 12000000,
        deadline: new Date(now.getFullYear(), now.getMonth() + 4, 1),
        icon: 'laptop',
        color: '#8b5cf6',
        priority: 3,
      }
    }),
  ])
  console.log('✅ Saving Plans created')

  // ========================
  // 7. BUDGETS
  // ========================
  await Promise.all([
    prisma.budget.upsert({ where: { id: 'bgt-food' }, update: {}, create: { id: 'bgt-food', userId: user.id, categoryId: catFood.id, name: 'Makanan', amount: 1500000, period: 'monthly', month: now.getMonth() + 1, year: now.getFullYear(), alertThreshold: 80 } }),
    prisma.budget.upsert({ where: { id: 'bgt-transport' }, update: {}, create: { id: 'bgt-transport', userId: user.id, categoryId: catTransport.id, name: 'Transportasi', amount: 500000, period: 'monthly', month: now.getMonth() + 1, year: now.getFullYear(), alertThreshold: 80 } }),
    prisma.budget.upsert({ where: { id: 'bgt-shopping' }, update: {}, create: { id: 'bgt-shopping', userId: user.id, categoryId: catShopping.id, name: 'Belanja', amount: 700000, period: 'monthly', month: now.getMonth() + 1, year: now.getFullYear(), alertThreshold: 75 } }),
    prisma.budget.upsert({ where: { id: 'bgt-entertainment' }, update: {}, create: { id: 'bgt-entertainment', userId: user.id, categoryId: catEntertainment.id, name: 'Hiburan', amount: 300000, period: 'monthly', month: now.getMonth() + 1, year: now.getFullYear(), alertThreshold: 80 } }),
  ])
  console.log('✅ Budgets created')

  // ========================
  // 8. NET WORTH HISTORY (12 months)
  // ========================
  await prisma.netWorthHistory.deleteMany({ where: { userId: user.id } })
  let nw = 20000000
  for (let m = 11; m >= 0; m--) {
    const d = subMonths(now, m)
    await prisma.netWorthHistory.create({
      data: {
        userId: user.id,
        value: nw,
        date: format(d, 'yyyy-MM'),
      }
    })
    nw += Math.floor(Math.random() * 2500000) + 500000
  }
  console.log('✅ Net Worth History created')

  // ========================
  // 9. PORTFOLIO HISTORY (30 days)
  // ========================
  await prisma.portfolioHistory.deleteMany({ where: { userId: user.id } })
  let portfolio = 12500000
  for (let d = 29; d >= 0; d--) {
    const date = subDays(now, d)
    portfolio += Math.floor(Math.random() * 300000) - 100000
    await prisma.portfolioHistory.create({
      data: {
        userId: user.id,
        value: Math.max(portfolio, 10000000),
        date: format(date, 'yyyy-MM-dd'),
      }
    })
  }
  console.log('✅ Portfolio History created')

  // ========================
  // 10. SUBSCRIPTIONS
  // ========================
  await Promise.all([
    prisma.subscription.upsert({ where: { id: 'sub-netflix' }, update: {}, create: { id: 'sub-netflix', userId: user.id, name: 'Netflix', provider: 'Netflix Inc.', amount: 54000, currency: 'IDR', billingDate: 15, billingPeriod: 'monthly', icon: 'tv', nextBillingDate: new Date(now.getFullYear(), now.getMonth(), 15) } }),
    prisma.subscription.upsert({ where: { id: 'sub-spotify' }, update: {}, create: { id: 'sub-spotify', userId: user.id, name: 'Spotify', provider: 'Spotify AB', amount: 54990, currency: 'IDR', billingDate: 20, billingPeriod: 'monthly', icon: 'music', nextBillingDate: new Date(now.getFullYear(), now.getMonth(), 20) } }),
    prisma.subscription.upsert({ where: { id: 'sub-icloud' }, update: {}, create: { id: 'sub-icloud', userId: user.id, name: 'iCloud 50GB', provider: 'Apple', amount: 16000, currency: 'IDR', billingDate: 5, billingPeriod: 'monthly', icon: 'cloud', nextBillingDate: new Date(now.getFullYear(), now.getMonth(), 5) } }),
  ])
  console.log('✅ Subscriptions created')

  // ========================
  // 11. DEBT
  // ========================
  await prisma.debt.upsert({
    where: { id: 'debt-kpr' },
    update: {},
    create: {
      id: 'debt-kpr',
      userId: user.id,
      name: 'KPR Rumah',
      type: 'mortgage',
      lenderName: 'BTN',
      originalAmount: 350000000,
      currentBalance: 287000000,
      interestRate: 7.5,
      minimumPayment: 2800000,
      dueDate: 10,
      startDate: subMonths(now, 24),
      endDate: new Date(now.getFullYear() + 13, now.getMonth(), 1),
      icon: 'home',
      color: '#dc2626',
    }
  })
  console.log('✅ Debt created')

  console.log('\n🎉 Seeding completed successfully!')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error('❌ Seeding error:', e)
    await prisma.$disconnect()
    process.exit(1)
  })
