-- Migration: 001_initial_schema (Updated - Best Practice & Scalable)
-- Database: PostgreSQL
-- Description: Initial schema for FinTrack application with modern fintech features

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ====================
-- Table: users
-- ====================
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  firebase_uid VARCHAR(255) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  email_verified BOOLEAN DEFAULT FALSE,
  display_name VARCHAR(255),
  photo_url VARCHAR(500),
  phone_number VARCHAR(50),
  currency VARCHAR(10) DEFAULT 'IDR',
  locale VARCHAR(20) DEFAULT 'id-ID',
  timezone VARCHAR(50) DEFAULT 'Asia/Jakarta',
  date_format VARCHAR(20) DEFAULT 'DD/MM/YYYY',
  is_premium BOOLEAN DEFAULT FALSE,
  premium_expires_at TIMESTAMP WITH TIME ZONE,
  onboarding_completed BOOLEAN DEFAULT FALSE,
  last_login_at TIMESTAMP WITH TIME ZONE,
  settings JSONB DEFAULT jsonb_build_object(
    'notifications', jsonb_build_object(
      'email', true,
      'push', true,
      'transaction_alerts', true,
      'budget_alerts', true,
      'subscription_reminders', true
    ),
    'privacy', jsonb_build_object(
      'show_balance_on_dashboard', true,
      'require_auth_for_sensitive_actions', false
    )
  ),
  is_deleted BOOLEAN DEFAULT FALSE,
  deleted_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ====================
-- Table: accounts
-- ====================
CREATE TABLE IF NOT EXISTS accounts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  type VARCHAR(50) NOT NULL CHECK (type IN ('bank', 'ewallet', 'cash', 'investment', 'credit_card', 'loan')),
  subtype VARCHAR(100),
  institution_name VARCHAR(255),
  account_number VARCHAR(100),
  balance NUMERIC(15, 2) DEFAULT 0,
  available_balance NUMERIC(15, 2),
  credit_limit NUMERIC(15, 2),
  currency VARCHAR(10) DEFAULT 'IDR',
  color VARCHAR(20) DEFAULT '#1f4842',
  icon VARCHAR(100) DEFAULT 'wallet',
  include_in_net_worth BOOLEAN DEFAULT TRUE,
  is_active BOOLEAN DEFAULT TRUE,
  is_deleted BOOLEAN DEFAULT FALSE,
  deleted_at TIMESTAMP WITH TIME ZONE,
  last_synced_at TIMESTAMP WITH TIME ZONE,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ====================
-- Table: categories
-- ====================
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  type VARCHAR(20) NOT NULL CHECK (type IN ('income', 'expense', 'transfer')),
  parent_category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  icon VARCHAR(100) DEFAULT 'tag',
  color VARCHAR(20) DEFAULT '#64748b',
  is_default BOOLEAN DEFAULT FALSE,
  is_deleted BOOLEAN DEFAULT FALSE,
  deleted_at TIMESTAMP WITH TIME ZONE,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, name, type)
);

-- ====================
-- Table: transactions
-- ====================
CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  to_account_id UUID REFERENCES accounts(id) ON DELETE SET NULL,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  type VARCHAR(20) NOT NULL CHECK (type IN ('income', 'expense', 'transfer')),
  status VARCHAR(20) NOT NULL DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'failed', 'cancelled', 'refunded')),
  amount NUMERIC(15, 2) NOT NULL,
  fee NUMERIC(15, 2),
  tax NUMERIC(15, 2),
  description TEXT,
  memo TEXT,
  merchant_name VARCHAR(255),
  merchant_id VARCHAR(255),
  transaction_date TIMESTAMP WITH TIME ZONE NOT NULL,
  posting_date TIMESTAMP WITH TIME ZONE,
  reference_id VARCHAR(255),
  external_id VARCHAR(255),
  receipt_url VARCHAR(500),
  receipt_data TEXT,
  location JSONB,
  tags TEXT[],
  notes TEXT,
  is_recurring BOOLEAN DEFAULT FALSE,
  recurring_transaction_id UUID,
  is_split BOOLEAN DEFAULT FALSE,
  split_details JSONB,
  is_reconciled BOOLEAN DEFAULT FALSE,
  reconciled_at TIMESTAMP WITH TIME ZONE,
  is_deleted BOOLEAN DEFAULT FALSE,
  deleted_at TIMESTAMP WITH TIME ZONE,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ====================
-- Table: recurring_transactions
-- ====================
CREATE TABLE IF NOT EXISTS recurring_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  name VARCHAR(255) NOT NULL,
  type VARCHAR(20) NOT NULL CHECK (type IN ('income', 'expense')),
  amount NUMERIC(15, 2) NOT NULL,
  description TEXT,
  frequency VARCHAR(20) NOT NULL CHECK (frequency IN ('daily', 'weekly', 'biweekly', 'monthly', 'bimonthly', 'quarterly', 'yearly')),
  interval INTEGER DEFAULT 1,
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE,
  last_occurrence TIMESTAMP WITH TIME ZONE,
  next_occurrence TIMESTAMP WITH TIME ZONE NOT NULL,
  day_of_month INTEGER CHECK (day_of_month BETWEEN 1 AND 31),
  day_of_week INTEGER CHECK (day_of_week BETWEEN 0 AND 6),
  is_active BOOLEAN DEFAULT TRUE,
  is_deleted BOOLEAN DEFAULT FALSE,
  deleted_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ====================
-- Table: saving_plans
-- ====================
CREATE TABLE IF NOT EXISTS saving_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  target_amount NUMERIC(15, 2) NOT NULL,
  current_amount NUMERIC(15, 2) DEFAULT 0,
  deadline TIMESTAMP WITH TIME ZONE,
  icon VARCHAR(100) DEFAULT 'piggy-bank',
  color VARCHAR(20) DEFAULT '#1f4842',
  priority INTEGER DEFAULT 0,
  auto_save BOOLEAN DEFAULT FALSE,
  auto_save_amount NUMERIC(15, 2),
  auto_save_frequency VARCHAR(20) CHECK (auto_save_frequency IN ('weekly', 'biweekly', 'monthly')),
  auto_save_day INTEGER,
  linked_account_id UUID REFERENCES accounts(id) ON DELETE SET NULL,
  milestones JSONB,
  is_completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMP WITH TIME ZONE,
  is_deleted BOOLEAN DEFAULT FALSE,
  deleted_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ====================
-- Table: budgets
-- ====================
CREATE TABLE IF NOT EXISTS budgets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  category_id UUID REFERENCES categories(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  amount NUMERIC(15, 2) NOT NULL,
  period VARCHAR(20) NOT NULL CHECK (period IN ('daily', 'weekly', 'monthly', 'yearly')),
  month INTEGER CHECK (month BETWEEN 1 AND 12),
  year INTEGER,
  week INTEGER,
  rollover BOOLEAN DEFAULT FALSE,
  rollover_amount NUMERIC(15, 2) DEFAULT 0,
  alert_threshold INTEGER DEFAULT 80,
  alert_enabled BOOLEAN DEFAULT TRUE,
  is_deleted BOOLEAN DEFAULT FALSE,
  deleted_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ====================
-- Table: investments
-- ====================
CREATE TABLE IF NOT EXISTS investments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  account_id UUID REFERENCES accounts(id) ON DELETE SET NULL,
  name VARCHAR(255) NOT NULL,
  ticker_symbol VARCHAR(50),
  type VARCHAR(50) NOT NULL CHECK (type IN ('stock', 'mutual_fund', 'etf', 'gold', 'bond', 'crypto', 'real_estate', 'other')),
  sub_type VARCHAR(100),
  exchange VARCHAR(100),
  currency VARCHAR(10) DEFAULT 'IDR',
  current_price NUMERIC(15, 4) NOT NULL,
  purchase_price NUMERIC(15, 4) NOT NULL,
  quantity NUMERIC(15, 6) NOT NULL,
  total_value NUMERIC(15, 2) NOT NULL,
  cost_basis NUMERIC(15, 2) NOT NULL,
  unrealized_gain_loss NUMERIC(15, 2),
  unrealized_gain_loss_percentage NUMERIC(10, 4),
  purchase_date TIMESTAMP WITH TIME ZONE,
  last_updated_price TIMESTAMP WITH TIME ZONE,
  icon VARCHAR(100) DEFAULT 'trending-up',
  dividend_yield NUMERIC(10, 4),
  dividend_income NUMERIC(15, 2) DEFAULT 0,
  is_deleted BOOLEAN DEFAULT FALSE,
  deleted_at TIMESTAMP WITH TIME ZONE,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ====================
-- Table: investment_transactions
-- ====================
CREATE TABLE IF NOT EXISTS investment_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  investment_id UUID NOT NULL REFERENCES investments(id) ON DELETE CASCADE,
  account_id UUID REFERENCES accounts(id) ON DELETE SET NULL,
  type VARCHAR(50) NOT NULL CHECK (type IN ('buy', 'sell', 'dividend', 'split', 'contribution', 'withdrawal')),
  quantity NUMERIC(15, 6) NOT NULL,
  price NUMERIC(15, 4) NOT NULL,
  amount NUMERIC(15, 2) NOT NULL,
  fee NUMERIC(15, 2),
  tax NUMERIC(15, 2),
  transaction_date TIMESTAMP WITH TIME ZONE NOT NULL,
  notes TEXT,
  reference_id VARCHAR(255),
  is_deleted BOOLEAN DEFAULT FALSE,
  deleted_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ====================
-- Table: subscriptions
-- ====================
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  provider VARCHAR(255),
  amount NUMERIC(15, 2) NOT NULL,
  currency VARCHAR(10) DEFAULT 'IDR',
  billing_date INTEGER NOT NULL CHECK (billing_date BETWEEN 1 AND 31),
  billing_period VARCHAR(20) NOT NULL CHECK (billing_period IN ('monthly', 'quarterly', 'yearly')),
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  icon VARCHAR(100) DEFAULT 'repeat',
  next_billing_date TIMESTAMP WITH TIME ZONE NOT NULL,
  last_payment_date TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT TRUE,
  is_paused BOOLEAN DEFAULT FALSE,
  pause_until TIMESTAMP WITH TIME ZONE,
  is_deleted BOOLEAN DEFAULT FALSE,
  deleted_at TIMESTAMP WITH TIME ZONE,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ====================
-- Table: debts
-- ====================
CREATE TABLE IF NOT EXISTS debts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  type VARCHAR(50) NOT NULL CHECK (type IN ('credit_card', 'personal_loan', 'mortgage', 'auto_loan', 'student_loan', 'other')),
  lender_name VARCHAR(255),
  original_amount NUMERIC(15, 2) NOT NULL,
  current_balance NUMERIC(15, 2) NOT NULL,
  interest_rate NUMERIC(10, 4) NOT NULL,
  minimum_payment NUMERIC(15, 2),
  due_date INTEGER NOT NULL CHECK (due_date BETWEEN 1 AND 31),
  start_date TIMESTAMP WITH TIME ZONE,
  end_date TIMESTAMP WITH TIME ZONE,
  linked_account_id UUID REFERENCES accounts(id) ON DELETE SET NULL,
  icon VARCHAR(100) DEFAULT 'credit-card',
  color VARCHAR(20) DEFAULT '#ef4444',
  is_paid_off BOOLEAN DEFAULT FALSE,
  paid_off_at TIMESTAMP WITH TIME ZONE,
  is_deleted BOOLEAN DEFAULT FALSE,
  deleted_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ====================
-- Table: debt_payments
-- ====================
CREATE TABLE IF NOT EXISTS debt_payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  debt_id UUID NOT NULL REFERENCES debts(id) ON DELETE CASCADE,
  amount NUMERIC(15, 2) NOT NULL,
  principal_amount NUMERIC(15, 2) NOT NULL,
  interest_amount NUMERIC(15, 2) NOT NULL,
  payment_date TIMESTAMP WITH TIME ZONE NOT NULL,
  transaction_id UUID REFERENCES transactions(id) ON DELETE SET NULL,
  notes TEXT,
  is_deleted BOOLEAN DEFAULT FALSE,
  deleted_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ====================
-- Table: notifications
-- ====================
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL CHECK (type IN ('transaction', 'budget', 'subscription', 'saving_plan', 'investment', 'debt', 'system', 'marketing')),
  title VARCHAR(255) NOT NULL,
  body TEXT NOT NULL,
  data JSONB,
  is_read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMP WITH TIME ZONE,
  is_archived BOOLEAN DEFAULT FALSE,
  archived_at TIMESTAMP WITH TIME ZONE,
  action_url VARCHAR(500),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ====================
-- Table: user_sessions
-- ====================
CREATE TABLE IF NOT EXISTS user_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  device_id VARCHAR(255),
  device_name VARCHAR(255),
  device_type VARCHAR(50),
  ip_address VARCHAR(50),
  location VARCHAR(255),
  user_agent TEXT,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ====================
-- Indexes for performance
-- ====================
CREATE INDEX idx_users_firebase_uid ON users(firebase_uid);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_is_deleted ON users(is_deleted);

CREATE INDEX idx_accounts_user_id ON accounts(user_id);
CREATE INDEX idx_accounts_is_deleted ON accounts(is_deleted);
CREATE INDEX idx_accounts_is_active ON accounts(is_active);

CREATE INDEX idx_categories_user_id ON categories(user_id);
CREATE INDEX idx_categories_type ON categories(type);
CREATE INDEX idx_categories_is_default ON categories(is_default);
CREATE INDEX idx_categories_is_deleted ON categories(is_deleted);

CREATE INDEX idx_transactions_user_id ON transactions(user_id);
CREATE INDEX idx_transactions_account_id ON transactions(account_id);
CREATE INDEX idx_transactions_category_id ON transactions(category_id);
CREATE INDEX idx_transactions_type ON transactions(type);
CREATE INDEX idx_transactions_status ON transactions(status);
CREATE INDEX idx_transactions_date ON transactions(transaction_date DESC);
CREATE INDEX idx_transactions_is_recurring ON transactions(is_recurring);
CREATE INDEX idx_transactions_is_deleted ON transactions(is_deleted);

CREATE INDEX idx_recurring_transactions_user_id ON recurring_transactions(user_id);
CREATE INDEX idx_recurring_transactions_is_active ON recurring_transactions(is_active);
CREATE INDEX idx_recurring_transactions_next_occurrence ON recurring_transactions(next_occurrence);
CREATE INDEX idx_recurring_transactions_is_deleted ON recurring_transactions(is_deleted);

CREATE INDEX idx_saving_plans_user_id ON saving_plans(user_id);
CREATE INDEX idx_saving_plans_is_completed ON saving_plans(is_completed);
CREATE INDEX idx_saving_plans_is_deleted ON saving_plans(is_deleted);

CREATE INDEX idx_budgets_user_id ON budgets(user_id);
CREATE INDEX idx_budgets_period ON budgets(period);
CREATE INDEX idx_budgets_year_month ON budgets(year, month);
CREATE INDEX idx_budgets_is_deleted ON budgets(is_deleted);

CREATE INDEX idx_investments_user_id ON investments(user_id);
CREATE INDEX idx_investments_type ON investments(type);
CREATE INDEX idx_investments_ticker_symbol ON investments(ticker_symbol);
CREATE INDEX idx_investments_is_deleted ON investments(is_deleted);

CREATE INDEX idx_investment_transactions_user_id ON investment_transactions(user_id);
CREATE INDEX idx_investment_transactions_investment_id ON investment_transactions(investment_id);
CREATE INDEX idx_investment_transactions_type ON investment_transactions(type);
CREATE INDEX idx_investment_transactions_date ON investment_transactions(transaction_date DESC);
CREATE INDEX idx_investment_transactions_is_deleted ON investment_transactions(is_deleted);

CREATE INDEX idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_is_active ON subscriptions(is_active);
CREATE INDEX idx_subscriptions_next_billing_date ON subscriptions(next_billing_date);
CREATE INDEX idx_subscriptions_is_deleted ON subscriptions(is_deleted);

CREATE INDEX idx_debts_user_id ON debts(user_id);
CREATE INDEX idx_debts_is_paid_off ON debts(is_paid_off);
CREATE INDEX idx_debts_is_deleted ON debts(is_deleted);

CREATE INDEX idx_debt_payments_user_id ON debt_payments(user_id);
CREATE INDEX idx_debt_payments_debt_id ON debt_payments(debt_id);
CREATE INDEX idx_debt_payments_date ON debt_payments(payment_date DESC);
CREATE INDEX idx_debt_payments_is_deleted ON debt_payments(is_deleted);

CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_type ON notifications(type);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);
CREATE INDEX idx_notifications_is_archived ON notifications(is_archived);
CREATE INDEX idx_notifications_created_at ON notifications(created_at DESC);

CREATE INDEX idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX idx_user_sessions_is_active ON user_sessions(is_active);
CREATE INDEX idx_user_sessions_expires_at ON user_sessions(expires_at);

-- ====================
-- Function: update_updated_at_column
-- ====================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ language 'plpgsql';

-- ====================
-- Triggers for updated_at
-- ====================
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_accounts_updated_at BEFORE UPDATE ON accounts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_transactions_updated_at BEFORE UPDATE ON transactions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_recurring_transactions_updated_at BEFORE UPDATE ON recurring_transactions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_saving_plans_updated_at BEFORE UPDATE ON saving_plans
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_budgets_updated_at BEFORE UPDATE ON budgets
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_investments_updated_at BEFORE UPDATE ON investments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_investment_transactions_updated_at BEFORE UPDATE ON investment_transactions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON subscriptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_debts_updated_at BEFORE UPDATE ON debts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_debt_payments_updated_at BEFORE UPDATE ON debt_payments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_sessions_updated_at BEFORE UPDATE ON user_sessions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
