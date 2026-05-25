import { LayoutDashboard, WalletCards, ArrowRightLeft, FileText, CreditCard, PiggyBank, TrendingUp, Inbox, Tag, BarChart3 } from 'lucide-react';

export const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
  { icon: WalletCards, label: 'Payments', path: '/payments' },
  { icon: ArrowRightLeft, label: 'Transactions', path: '/transactions' },
  { icon: FileText, label: 'Invoices', path: '/invoices' },
  { icon: CreditCard, label: 'Cards', path: '/cards' },
  { icon: PiggyBank, label: 'Saving Plans', path: '/saving-plans' },
  { icon: TrendingUp, label: 'Investments', path: '/investments' },
  { icon: Inbox, label: 'Inbox', path: '/inbox', badge: 99 },
  { icon: Tag, label: 'Promos', path: '/promos' },
  { icon: BarChart3, label: 'Insights', path: '/insights' },
  { icon: CreditCard, label: 'Subscriptions', path: '/subscriptions' },
];
