import { initializeApp } from 'firebase/app';
import { getFirestore, doc, writeBatch } from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app, (firebaseConfig as any).firestoreDatabaseId);

// Helper function to generate ID
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
}

// Ensure USER_ID is provided
const USER_ID = process.argv[2];
if (!USER_ID) {
  console.error('❌ Error: Please provide a USER_ID as an argument.');
  console.error('Usage: bun run scripts/seed-firestore.ts <YOUR_FIREBASE_UID>');
  process.exit(1);
}

// Default Categories
const defaultCategories = [
  { id: generateId(), name: 'Salary', type: 'income', icon: '💼', color: '#1f4842', isDefault: true, sortOrder: 1 },
  { id: generateId(), name: 'Food & Drink', type: 'expense', icon: '🍔', color: '#f59e0b', isDefault: true, sortOrder: 2 },
  { id: generateId(), name: 'Transport', type: 'expense', icon: '🚗', color: '#3b82f6', isDefault: true, sortOrder: 3 },
  { id: generateId(), name: 'Rent & Living', type: 'expense', icon: '🏠', color: '#ef4444', isDefault: true, sortOrder: 4 },
  { id: generateId(), name: 'Shopping', type: 'expense', icon: '🛍️', color: '#a855f7', isDefault: true, sortOrder: 5 },
  { id: generateId(), name: 'Investment', type: 'income', icon: '📈', color: '#10b981', isDefault: true, sortOrder: 6 },
  { id: generateId(), name: 'Education', type: 'expense', icon: '📚', color: '#ecf4e9', isDefault: true, sortOrder: 7 },
  { id: generateId(), name: 'Entertainment', type: 'expense', icon: '🎬', color: '#94a3b8', isDefault: true, sortOrder: 8 },
];

// Default Accounts
const defaultAccounts = [
  { id: generateId(), name: 'Bank BCA', type: 'bank', balance: 8500000, currency: 'IDR', color: '#1f4842', icon: '🏦', includeInNetWorth: true, isActive: true },
  { id: generateId(), name: 'Cash', type: 'cash', balance: 2000000, currency: 'IDR', color: '#f59e0b', icon: '💵', includeInNetWorth: true, isActive: true },
  { id: generateId(), name: 'Gopay', type: 'ewallet', balance: 3500000, currency: 'IDR', color: '#3b82f6', icon: '📱', includeInNetWorth: true, isActive: true },
];

// Generate 12 months of Transactions
const historicalTransactions: any[] = [];
const months = 12;
const today = new Date();

const foodCat = defaultCategories.find(c => c.name === 'Food & Drink')?.id;
const salaryCat = defaultCategories.find(c => c.name === 'Salary')?.id;
const rentCat = defaultCategories.find(c => c.name === 'Rent & Living')?.id;
const shoppingCat = defaultCategories.find(c => c.name === 'Shopping')?.id;
const transportCat = defaultCategories.find(c => c.name === 'Transport')?.id;
const eduCat = defaultCategories.find(c => c.name === 'Education')?.id;
const entCat = defaultCategories.find(c => c.name === 'Entertainment')?.id;

for (let i = 0; i < months; i++) {
  const d = new Date(today.getFullYear(), today.getMonth() - i, 15);
  
  // Income
  historicalTransactions.push({ id: generateId(), accountId: defaultAccounts[0].id, categoryId: salaryCat, type: 'income', amount: 15000000 + Math.random() * 2000000, description: 'Salary', transactionDate: d, status: 'completed' });
  
  // Expenses
  historicalTransactions.push({ id: generateId(), accountId: defaultAccounts[0].id, categoryId: rentCat, type: 'expense', amount: 3500000, description: 'Monthly Rent', transactionDate: new Date(d.getFullYear(), d.getMonth(), 1), status: 'completed' });
  historicalTransactions.push({ id: generateId(), accountId: defaultAccounts[1].id, categoryId: foodCat, type: 'expense', amount: 1500000 + Math.random() * 1000000, description: 'Groceries & Food', transactionDate: new Date(d.getFullYear(), d.getMonth(), 5), status: 'completed' });
  historicalTransactions.push({ id: generateId(), accountId: defaultAccounts[2].id, categoryId: transportCat, type: 'expense', amount: 800000 + Math.random() * 400000, description: 'Transport', transactionDate: new Date(d.getFullYear(), d.getMonth(), 10), status: 'completed' });
  historicalTransactions.push({ id: generateId(), accountId: defaultAccounts[0].id, categoryId: shoppingCat, type: 'expense', amount: 500000 + Math.random() * 1000000, description: 'Shopping', transactionDate: new Date(d.getFullYear(), d.getMonth(), 20), status: 'completed' });
  historicalTransactions.push({ id: generateId(), accountId: defaultAccounts[2].id, categoryId: entCat, type: 'expense', amount: 300000 + Math.random() * 500000, description: 'Entertainment', transactionDate: new Date(d.getFullYear(), d.getMonth(), 25), status: 'completed' });
  historicalTransactions.push({ id: generateId(), accountId: defaultAccounts[0].id, categoryId: eduCat, type: 'expense', amount: 500000, description: 'Online Courses', transactionDate: new Date(d.getFullYear(), d.getMonth(), 12), status: 'completed' });
}

// Generate Net Worth History (12 months)
const netWorthHistory: any[] = [];
let currentNW = 85000000;
for (let i = 11; i >= 0; i--) {
  const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
  const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  netWorthHistory.push({ id: generateId(), value: currentNW, date: dateStr });
  currentNW += 2000000 + Math.random() * 3000000; // increasing net worth
}

// Generate Portfolio History (last 7 days)
const portfolioHistory: any[] = [];
let currentPort = 12000000;
for (let i = 6; i >= 0; i--) {
  const d = new Date(today.getTime() - i * 24 * 60 * 60 * 1000);
  const dateStr = d.toISOString().split('T')[0];
  portfolioHistory.push({ id: generateId(), value: currentPort, date: dateStr });
  currentPort += (Math.random() - 0.3) * 500000; // random fluctuations trending up
}

// Sample Saving Plans
const sampleSavingPlans = [
  { id: generateId(), name: 'Emergency Fund', targetAmount: 20000000, currentAmount: 8000000, icon: '🚨', color: '#ef4444', priority: 1, autoSave: false },
  { id: generateId(), name: 'New Laptop', targetAmount: 15000000, currentAmount: 5000000, icon: '💻', color: '#3b82f6', priority: 2, autoSave: true, autoSaveAmount: 1000000, autoSaveFrequency: 'monthly' },
];

// Sample Subscriptions
const sampleSubscriptions = [
  { id: generateId(), name: 'Spotify', provider: 'Spotify AB', amount: 54990, currency: 'IDR', billingDate: 15, billingPeriod: 'monthly', icon: '🎵', nextBillingDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 10), isActive: true },
  { id: generateId(), name: 'Netflix', provider: 'Netflix Inc.', amount: 186000, currency: 'IDR', billingDate: 20, billingPeriod: 'monthly', icon: '📺', nextBillingDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 15), isActive: true },
];

// Sample Budgets
const sampleBudgets = [
  { id: generateId(), name: 'Food & Drink', categoryId: foodCat, amount: 2500000, period: 'monthly', month: today.getMonth() + 1, year: today.getFullYear(), rollover: true, alertEnabled: true, alertThreshold: 80 },
  { id: generateId(), name: 'Transport', categoryId: transportCat, amount: 1200000, period: 'monthly', month: today.getMonth() + 1, year: today.getFullYear(), rollover: false, alertEnabled: true, alertThreshold: 90 },
  { id: generateId(), name: 'Shopping', categoryId: shoppingCat, amount: 1000000, period: 'monthly', month: today.getMonth() + 1, year: today.getFullYear(), rollover: false, alertEnabled: true, alertThreshold: 90 },
  { id: generateId(), name: 'Entertainment', categoryId: entCat, amount: 800000, period: 'monthly', month: today.getMonth() + 1, year: today.getFullYear(), rollover: false, alertEnabled: true, alertThreshold: 90 },
];

// Sample Investments
const sampleInvestments = [
  { id: generateId(), name: 'Saham BBCA', tickerSymbol: 'BBCA.JK', type: 'stock', currency: 'IDR', currentPrice: 9875, purchasePrice: 8500, quantity: 100, totalValue: 987500, costBasis: 850000, unrealizedGainLoss: 137500, unrealizedGainLossPercentage: 16.18, icon: '📊' },
];

// Admin Settings
const adminSettings = {
  id: 'global_settings',
  enableOnboarding: true,
  onboardingSteps: ['profile', 'accounts', 'budgets'],
  enablePremiumFeatures: true,
  maintenanceMode: false
};

async function seedFirestore() {
  console.log(`🚀 Starting Firestore seed for user: ${USER_ID}...`);
  
  const batch = writeBatch(db);
  
  // 1. User
  const userRef = doc(db, 'users', USER_ID);
  batch.set(userRef, {
    uid: USER_ID,
    email: 'user@example.com',
    emailVerified: true,
    displayName: 'FinTrack User',
    photoURL: 'https://ui-avatars.com/api/?name=FinTrack+User&background=random',
    currency: 'IDR',
    locale: 'id-ID',
    timezone: 'Asia/Jakarta',
    dateFormat: 'dd/MM/yyyy',
    isPremium: false,
    onboardingCompleted: true,
    settings: {
      notifications: { email: true, push: true, transactionAlerts: true, budgetAlerts: true, subscriptionReminders: true },
      privacy: { showBalanceOnDashboard: true, requireAuthForSensitiveActions: false }
    },
    isDeleted: false,
    createdAt: new Date(),
    updatedAt: new Date()
  });
  
  // 2. Categories
  for (const category of defaultCategories) {
    const catRef = doc(db, 'categories', category.id);
    batch.set(catRef, { ...category, userId: USER_ID, isDeleted: false, createdAt: new Date(), updatedAt: new Date() });
  }
  
  // 3. Accounts
  for (const account of defaultAccounts) {
    const accRef = doc(db, 'accounts', account.id);
    batch.set(accRef, { ...account, userId: USER_ID, isDeleted: false, createdAt: new Date(), updatedAt: new Date() });
  }
  
  // 4. Transactions
  for (let i = 0; i < historicalTransactions.length; i++) {
    const tx = historicalTransactions[i];
    const txRef = doc(db, 'transactions', tx.id);
    batch.set(txRef, {
      ...tx,
      userId: USER_ID,
      tags: [],
      isRecurring: false,
      isSplit: false,
      isReconciled: true,
      isDeleted: false,
      createdAt: new Date(),
      updatedAt: new Date()
    });
  }
  
  // 5. Saving Plans
  for (const plan of sampleSavingPlans) {
    const planRef = doc(db, 'saving_plans', plan.id);
    batch.set(planRef, { ...plan, userId: USER_ID, isCompleted: false, isDeleted: false, createdAt: new Date(), updatedAt: new Date() });
  }
  
  // 6. Subscriptions
  for (const sub of sampleSubscriptions) {
    const subRef = doc(db, 'subscriptions', sub.id);
    batch.set(subRef, { ...sub, userId: USER_ID, isPaused: false, isDeleted: false, createdAt: new Date(), updatedAt: new Date() });
  }
  
  // 7. Budgets
  for (const budget of sampleBudgets) {
    const budgetRef = doc(db, 'budgets', budget.id);
    batch.set(budgetRef, { ...budget, userId: USER_ID, isDeleted: false, createdAt: new Date(), updatedAt: new Date() });
  }
  
  // 8. Investments
  for (const inv of sampleInvestments) {
    const invRef = doc(db, 'investments', inv.id);
    batch.set(invRef, { ...inv, userId: USER_ID, isDeleted: false, createdAt: new Date(), updatedAt: new Date() });
  }
  
  // 9. Net Worth History
  for (const nw of netWorthHistory) {
    const nwRef = doc(db, 'net_worth_history', nw.id);
    batch.set(nwRef, { ...nw, userId: USER_ID, createdAt: new Date() });
  }

  // 10. Portfolio History
  for (const port of portfolioHistory) {
    const portRef = doc(db, 'portfolio_history', port.id);
    batch.set(portRef, { ...port, userId: USER_ID, createdAt: new Date() });
  }
  
  // 11. Admin Settings
  const adminSettingsRef = doc(db, 'admin_settings', adminSettings.id);
  batch.set(adminSettingsRef, { ...adminSettings, createdAt: new Date(), updatedAt: new Date() });

  await batch.commit();
  
  console.log('✅ Firestore seeded successfully!');
  console.log('📋 Summary:');
  console.log(`  - 1 User (${USER_ID})`);
  console.log(`  - ${defaultCategories.length} Categories`);
  console.log(`  - ${defaultAccounts.length} Accounts`);
  console.log(`  - ${historicalTransactions.length} Transactions (12 months)`);
  console.log(`  - ${sampleSavingPlans.length} Saving Plans`);
  console.log(`  - ${sampleSubscriptions.length} Subscriptions`);
  console.log(`  - ${sampleBudgets.length} Budgets`);
  console.log(`  - ${sampleInvestments.length} Investments`);
  console.log(`  - ${netWorthHistory.length} Net Worth History Records`);
  console.log(`  - ${portfolioHistory.length} Portfolio History Records`);
}

seedFirestore().catch((error) => {
  console.error('❌ Error seeding Firestore:', error);
  process.exit(1);
});
