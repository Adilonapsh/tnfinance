// PostgreSQL Schema Types (Updated - Best Practice & Scalable)
// TypeScript types untuk tabel PostgreSQL dengan fitur fintech modern

// ====================
// Table: users
// ====================
interface PostgresUser {
  id: string;
  firebaseUid: string;
  email: string;
  emailVerified: boolean;
  displayName?: string;
  photoUrl?: string;
  phoneNumber?: string;
  currency: string;
  locale: string;
  timezone: string;
  dateFormat: string;
  isPremium: boolean;
  premiumExpiresAt?: Date;
  onboardingCompleted: boolean;
  lastLoginAt?: Date;
  settings: {
    notifications: {
      email: boolean;
      push: boolean;
      transactionAlerts: boolean;
      budgetAlerts: boolean;
      subscriptionReminders: boolean;
    };
    privacy: {
      showBalanceOnDashboard: boolean;
      requireAuthForSensitiveActions: boolean;
    };
  };
  isDeleted: boolean;
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// ====================
// Table: accounts
// ====================
interface PostgresAccount {
  id: string;
  userId: string;
  name: string;
  type: 'bank' | 'ewallet' | 'cash' | 'investment' | 'credit_card' | 'loan';
  subtype?: string;
  institutionName?: string;
  accountNumber?: string;
  balance: number;
  availableBalance?: number;
  creditLimit?: number;
  currency: string;
  color: string;
  icon: string;
  includeInNetWorth: boolean;
  isActive: boolean;
  isDeleted: boolean;
  deletedAt?: Date;
  lastSyncedAt?: Date;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

// ====================
// Table: categories
// ====================
interface PostgresCategory {
  id: string;
  userId?: string;
  name: string;
  type: 'income' | 'expense' | 'transfer';
  parentCategoryId?: string;
  icon: string;
  color: string;
  isDefault: boolean;
  isDeleted: boolean;
  deletedAt?: Date;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

// ====================
// Table: transactions
// ====================
interface PostgresTransaction {
  id: string;
  userId: string;
  accountId: string;
  toAccountId?: string;
  categoryId?: string;
  type: 'income' | 'expense' | 'transfer';
  status: 'pending' | 'completed' | 'failed' | 'cancelled' | 'refunded';
  amount: number;
  fee?: number;
  tax?: number;
  description?: string;
  memo?: string;
  merchantName?: string;
  merchantId?: string;
  transactionDate: Date;
  postingDate?: Date;
  referenceId?: string;
  externalId?: string;
  receiptUrl?: string;
  receiptData?: string;
  location?: {
    latitude: number;
    longitude: number;
    address?: string;
    placeId?: string;
  };
  tags?: string[];
  notes?: string;
  isRecurring: boolean;
  recurringTransactionId?: string;
  isSplit: boolean;
  splitDetails?: Array<{
    userId?: string;
    amount: number;
    percentage?: number;
    status: 'pending' | 'paid';
  }>;
  isReconciled: boolean;
  reconciledAt?: Date;
  isDeleted: boolean;
  deletedAt?: Date;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

// ====================
// Table: recurring_transactions
// ====================
interface PostgresRecurringTransaction {
  id: string;
  userId: string;
  accountId: string;
  categoryId?: string;
  name: string;
  type: 'income' | 'expense';
  amount: number;
  description?: string;
  frequency: 'daily' | 'weekly' | 'biweekly' | 'monthly' | 'bimonthly' | 'quarterly' | 'yearly';
  interval: number;
  startDate: Date;
  endDate?: Date;
  lastOccurrence?: Date;
  nextOccurrence: Date;
  dayOfMonth?: number;
  dayOfWeek?: number;
  isActive: boolean;
  isDeleted: boolean;
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// ====================
// Table: saving_plans
// ====================
interface PostgresSavingPlan {
  id: string;
  userId: string;
  name: string;
  description?: string;
  targetAmount: number;
  currentAmount: number;
  deadline?: Date;
  icon: string;
  color: string;
  priority: number;
  autoSave: boolean;
  autoSaveAmount?: number;
  autoSaveFrequency?: 'weekly' | 'biweekly' | 'monthly';
  autoSaveDay?: number;
  linkedAccountId?: string;
  milestones?: Array<{
    id: string;
    name: string;
    amount: number;
    achievedAt?: Date;
  }>;
  isCompleted: boolean;
  completedAt?: Date;
  isDeleted: boolean;
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// ====================
// Table: budgets
// ====================
interface PostgresBudget {
  id: string;
  userId: string;
  categoryId?: string;
  name: string;
  amount: number;
  period: 'daily' | 'weekly' | 'monthly' | 'yearly';
  month?: number;
  year?: number;
  week?: number;
  rollover: boolean;
  rolloverAmount: number;
  alertThreshold: number;
  alertEnabled: boolean;
  isDeleted: boolean;
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// ====================
// Table: investments
// ====================
interface PostgresInvestment {
  id: string;
  userId: string;
  accountId?: string;
  name: string;
  tickerSymbol?: string;
  type: 'stock' | 'mutual_fund' | 'etf' | 'gold' | 'bond' | 'crypto' | 'real_estate' | 'other';
  subType?: string;
  exchange?: string;
  currency: string;
  currentPrice: number;
  purchasePrice: number;
  quantity: number;
  totalValue: number;
  costBasis: number;
  unrealizedGainLoss?: number;
  unrealizedGainLossPercentage?: number;
  purchaseDate?: Date;
  lastUpdatedPrice?: Date;
  icon: string;
  dividendYield?: number;
  dividendIncome: number;
  isDeleted: boolean;
  deletedAt?: Date;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

// ====================
// Table: investment_transactions
// ====================
interface PostgresInvestmentTransaction {
  id: string;
  userId: string;
  investmentId: string;
  accountId?: string;
  type: 'buy' | 'sell' | 'dividend' | 'split' | 'contribution' | 'withdrawal';
  quantity: number;
  price: number;
  amount: number;
  fee?: number;
  tax?: number;
  transactionDate: Date;
  notes?: string;
  referenceId?: string;
  isDeleted: boolean;
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// ====================
// Table: subscriptions
// ====================
interface PostgresSubscription {
  id: string;
  userId: string;
  name: string;
  provider?: string;
  amount: number;
  currency: string;
  billingDate: number;
  billingPeriod: 'monthly' | 'quarterly' | 'yearly';
  categoryId?: string;
  icon: string;
  nextBillingDate: Date;
  lastPaymentDate?: Date;
  isActive: boolean;
  isPaused: boolean;
  pauseUntil?: Date;
  isDeleted: boolean;
  deletedAt?: Date;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

// ====================
// Table: debts
// ====================
interface PostgresDebt {
  id: string;
  userId: string;
  name: string;
  type: 'credit_card' | 'personal_loan' | 'mortgage' | 'auto_loan' | 'student_loan' | 'other';
  lenderName?: string;
  originalAmount: number;
  currentBalance: number;
  interestRate: number;
  minimumPayment?: number;
  dueDate: number;
  startDate?: Date;
  endDate?: Date;
  linkedAccountId?: string;
  icon: string;
  color: string;
  isPaidOff: boolean;
  paidOffAt?: Date;
  isDeleted: boolean;
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// ====================
// Table: debt_payments
// ====================
interface PostgresDebtPayment {
  id: string;
  userId: string;
  debtId: string;
  amount: number;
  principalAmount: number;
  interestAmount: number;
  paymentDate: Date;
  transactionId?: string;
  notes?: string;
  isDeleted: boolean;
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// ====================
// Table: notifications
// ====================
interface PostgresNotification {
  id: string;
  userId: string;
  type: 'transaction' | 'budget' | 'subscription' | 'saving_plan' | 'investment' | 'debt' | 'system' | 'marketing';
  title: string;
  body: string;
  data?: Record<string, any>;
  isRead: boolean;
  readAt?: Date;
  isArchived: boolean;
  archivedAt?: Date;
  actionUrl?: string;
  createdAt: Date;
}

// ====================
// Table: user_sessions
// ====================
interface PostgresUserSession {
  id: string;
  userId: string;
  deviceId?: string;
  deviceName?: string;
  deviceType?: string;
  ipAddress?: string;
  location?: string;
  userAgent?: string;
  expiresAt: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// ====================
// Table: admin_settings
// ====================
// Hanya untuk admin (global settings aplikasi)
interface PostgresAdminSettings {
  id: string;
  enableOnboarding: boolean;
  onboardingSteps: string[];
  enablePremiumFeatures: boolean;
  maintenanceMode: boolean;
  maintenanceMessage?: string;
  latestAppVersion?: string;
  forceUpdateVersion?: string;
  createdAt: Date;
  updatedAt: Date;
}

// ====================
// Table: net_worth_history
// ====================
interface PostgresNetWorthHistory {
  id: string;
  userId: string;
  value: number;
  date: string; // YYYY-MM
  createdAt: Date;
}

// ====================
// Table: portfolio_history
// ====================
interface PostgresPortfolioHistory {
  id: string;
  userId: string;
  value: number;
  date: string; // YYYY-MM-DD
  createdAt: Date;
}

export type {
  PostgresUser,
  PostgresAccount,
  PostgresCategory,
  PostgresTransaction,
  PostgresRecurringTransaction,
  PostgresSavingPlan,
  PostgresBudget,
  PostgresInvestment,
  PostgresInvestmentTransaction,
  PostgresSubscription,
  PostgresDebt,
  PostgresDebtPayment,
  PostgresNotification,
  PostgresUserSession,
  PostgresAdminSettings,
  PostgresNetWorthHistory,
  PostgresPortfolioHistory,
};
