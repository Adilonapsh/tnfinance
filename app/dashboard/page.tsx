"use client";

import React, { useState, useEffect } from "react";
import {
  Area,
  AreaChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Cell,
  BarChart,
  Bar,
  CartesianGrid,
} from "recharts";
import {
  ArrowUpRight,
  ArrowDownRight,
  ArrowUpRightFromCircle,
  CreditCard,
  MoreVertical,
  Plus,
  TriangleAlert,
  RefreshCw,
} from "lucide-react";
import { formatCurrency } from "@/lib/format";
import { useAuthStore } from "@/lib/authStore";
import { useDashboardData } from "@/lib/hooks/useDashboardData";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

const CustomBarTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-[#18181b] p-4 border border-slate-100 dark:border-slate-800 rounded-xl shadow-xl min-w-[150px]">
        <div className="text-slate-500 text-sm mb-2 font-medium">
          {label} 2024
        </div>
        {payload.map((entry: any, index: number) => (
          <div
            key={index}
            className="flex justify-between items-center text-sm gap-4 mb-1"
          >
            <span className="text-slate-500 capitalize">{entry.name}</span>
            <span className="font-bold text-slate-800 dark:text-slate-100">
              {formatCurrency(Math.abs(entry.value))}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

const CURRENCIES = ["USD", "EUR", "SGD", "JPY"];

interface Rates {
  [key: string]: number;
}

interface WiseHistoryPoint {
  time: number;
  value: number;
}

interface WiseRate {
  rate: number;
  providerName: string;
}

export default function Dashboard() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuthStore();
  const { data, loading: dataLoading } = useDashboardData();

  const [rates, setRates] = useState<Rates | null>(null);
  const [ratesLoading, setRatesLoading] = useState(true);
  const [ratesUpdated, setRatesUpdated] = useState<Date | null>(null);
  const [wiseHistory, setWiseHistory] = useState<WiseHistoryPoint[]>([]);
  const [wiseCurrent, setWiseCurrent] = useState<WiseRate | null>(null);
  const [wiseLoading, setWiseLoading] = useState(true);
  const [selectedCurrency, setSelectedCurrency] = useState<string>("USD");

  const fetchRates = async () => {
    setRatesLoading(true);
    try {
      const symbols = CURRENCIES.join(",");
      const res = await fetch(
        `https://api.frankfurter.app/latest?from=${symbols}&to=IDR`,
      );
      const data = await res.json();
      // Convert: data.rates gives IDR→X, we want X→IDR
      const inverted: Rates = {};
      for (const [k, v] of Object.entries(data.rates as Rates)) {
        inverted[k] = 1 / v;
      }
      setRates(inverted);
      setRatesUpdated(new Date());
    } catch (e) {
      console.error("Exchange rate fetch failed", e);
    } finally {
      setRatesLoading(false);
    }
  };

  const fetchWiseData = async (currency: string, signal?: AbortSignal) => {
    if (signal?.aborted) return;

    setWiseLoading(true);
    try {
      // Fetch Wise History dari API lokal dengan query parameter
      const historyRes = await fetch(`/api/wise/history?source=${currency}`, { signal });
      if (signal?.aborted) return;

      if (historyRes.ok) {
        const historyData = await historyRes.json();
        if (Array.isArray(historyData)) {
          const formattedHistory = historyData.map((item: any) => ({
            time: item.time,
            value: item.value,
          }));
          setWiseHistory(formattedHistory);
        }
      }

      // Fetch Wise Current Rate dari API lokal dengan query parameter
      const currentRes = await fetch(`/api/wise/current?source=${currency}`, { signal });
      if (signal?.aborted) return;

      if (currentRes.ok) {
        const currentData = await currentRes.json();
        if (currentData.providers) {
          const wiseProvider = currentData.providers.find((p: any) => p.alias === "wise");
          if (wiseProvider && wiseProvider.quotes && wiseProvider.quotes.length > 0) {
            setWiseCurrent({
              rate: wiseProvider.quotes[0].rate,
              providerName: wiseProvider.providerName,
            });
          }
        }
      }
    } catch (e) {
      if ((e as Error).name !== "AbortError") {
        console.error("Wise fetch failed", e);
      }
    } finally {
      if (!signal?.aborted) {
        setWiseLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchRates();
    const abortController = new AbortController();
    fetchWiseData(selectedCurrency, abortController.signal);

    return () => {
      abortController.abort();
    };
  }, [selectedCurrency]);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  if (authLoading) {
    return <div className="flex h-screen items-center justify-center text-slate-500 font-medium">Authenticating...</div>;
  }

  if (dataLoading || !data) {
    return (
      <div className="flex flex-col gap-6 w-full max-w-[1600px] mx-auto pb-10 animate-pulse">
        {/* Row 1: Stat Cards Skeletons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
          <div className="bg-[#1f4842] p-6 rounded-3xl border-none h-32" />
          <div className="bg-white dark:bg-[#18181b] p-6 rounded-3xl border border-slate-200 dark:border-slate-800 h-32" />
          <div className="bg-white dark:bg-[#18181b] p-6 rounded-3xl border border-slate-200 dark:border-slate-800 h-32" />
          <div className="bg-white dark:bg-[#18181b] p-6 rounded-3xl border border-slate-200 dark:border-slate-800 h-32" />
          <div className="bg-white dark:bg-[#18181b] p-6 rounded-3xl border border-slate-200 dark:border-slate-800 h-32" />
          <div className="bg-white dark:bg-[#18181b] p-6 rounded-3xl border border-slate-200 dark:border-slate-800 h-32" />
        </div>

        {/* Main Content Skeletons */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-2 space-y-6">
            {/* Big Chart Skeleton */}
            <div className="bg-white dark:bg-[#18181b] p-8 rounded-3xl border border-slate-200 dark:border-slate-800 h-[450px]" />

            {/* Sub Charts Skeleton */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white dark:bg-[#18181b] p-6 rounded-3xl border border-slate-200 dark:border-slate-800 h-64" />
              <div className="bg-white dark:bg-[#18181b] p-6 rounded-3xl border border-slate-200 dark:border-slate-800 h-64" />
            </div>

            {/* Net Worth Skeleton */}
            <div className="bg-white dark:bg-[#18181b] p-8 rounded-3xl border border-slate-200 dark:border-slate-800 h-64" />
          </div>

          <div className="space-y-6">
            {/* Expense Breakdown Skeleton */}
            <div className="bg-white dark:bg-[#18181b] p-6 rounded-3xl border border-slate-200 dark:border-slate-800 h-80" />

            {/* Daily Limit Skeleton */}
            <div className="bg-white dark:bg-[#18181b] p-6 rounded-3xl border border-slate-200 dark:border-slate-800 h-40" />

            {/* Transactions Skeleton */}
            <div className="bg-white dark:bg-[#18181b] p-6 rounded-3xl border border-slate-200 dark:border-slate-800 h-96" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 w-full max-w-[1600px] mx-auto pb-10">
      {/* Row 1: Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
        <StatCard
          title="Total Balance"
          amount={formatCurrency(data.totalSavings + data.totalInvestments)}
          trend="Overall"
          trendValue="Total Wealth"
          isPositive={true}
          isAccent={true}
        />
        <StatCard
          title="Income (Month)"
          amount={formatCurrency(data.totalIncome)}
          trend="Monthly"
          trendValue=""
          isPositive={true}
        />
        <StatCard
          title="Expense (Month)"
          amount={formatCurrency(data.totalExpense)}
          trend="Monthly"
          trendValue=""
          isPositive={false}
        />
        <StatCard
          title="Savings"
          amount={formatCurrency(data.totalSavings)}
          trend="Liquid"
          trendValue=""
          isPositive={true}
        />
        <StatCard
          title="Investments"
          amount={formatCurrency(data.totalInvestments)}
          trend="Growth"
          trendValue=""
          isPositive={true}
        />

        {/* Exchange Rate Card */}
        <div className="bg-white dark:bg-[#18181b] p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between hover:scale-[1.02] transition-transform duration-300">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
              <CreditCard className="w-5 h-5 text-[#1f4842] dark:text-[#bdf29f]" />
            </div>
            <select
              value={selectedCurrency}
              onChange={(e) => setSelectedCurrency(e.target.value)}
              className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 rounded-xl text-xs px-3 py-1.5 outline-none font-bold"
            >
              <option>USD</option>
              <option>JPY</option>
              <option>MYR</option>
            </select>
          </div>
          <div>
            <div className="text-slate-500 text-xs font-bold mb-1">to IDR</div>
            {wiseLoading ? (
              <div className="text-xs font-bold text-slate-400">Loading...</div>
            ) : wiseCurrent && wiseCurrent.rate ? (
              <div>
                <div className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
                  Rp. {wiseCurrent.rate.toLocaleString("id-ID", { maximumFractionDigits: 0 })}
                </div>
                <div className="text-[10px] text-slate-400 mt-1 font-medium">{wiseCurrent.providerName || "Wise"}</div>
              </div>
            ) : (
              <div className="text-2xl font-bold text-slate-400">—</div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left Section (2/3) */}
        <div className="xl:col-span-2 space-y-6">
          {/* Large Cashflow Chart */}
          <div className="bg-white dark:bg-[#18181b] p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col h-[450px]">
            <div className="flex justify-between items-start mb-8">
              <div>
                <h3 className="font-bold text-2xl text-slate-900 dark:text-slate-100 mb-1">
                  Cashflow Overview
                </h3>
                <p className="text-sm text-slate-500 font-medium">
                  Monthly performance tracking
                </p>
              </div>
              <div className="flex gap-6 items-center">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-[#1f4842]"></div>
                  <span className="text-xs font-bold text-slate-600 dark:text-slate-400">
                    Income
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-[#bdf29f]"></div>
                  <span className="text-xs font-bold text-slate-600 dark:text-slate-400">
                    Expense
                  </span>
                </div>
                <select className="ml-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 rounded-xl text-xs px-4 py-2 outline-none font-bold">
                  <option>Jan - Dec 2024</option>
                  <option>Previous Year</option>
                </select>
              </div>
            </div>
            <div className="flex-1 min-h-0">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={data.cashflowData}
                  margin={{ top: 0, right: 0, left: -20, bottom: 0 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#e2e8f0"
                    opacity={0.3}
                  />
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: "#64748b", fontWeight: 600 }}
                    dy={10}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: "#64748b", fontWeight: 600 }}
                    tickFormatter={(val) =>
                      val === 0 ? "0" : `${val / 1000}K`
                    }
                    domain={[0, "dataMax + 1000"]}
                  />
                  <Tooltip
                    content={<CustomBarTooltip />}
                    cursor={{ fill: "rgba(31, 72, 66, 0.05)", radius: 12 }}
                  />
                  <Bar
                    dataKey="income"
                    stackId="a"
                    fill="#1f4842"
                    barSize={28}
                  />
                  <Bar
                    dataKey="expense"
                    stackId="a"
                    fill="#bdf29f"
                    radius={[8, 8, 0, 0]}
                    barSize={28}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Sub Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Portfolio */}
            <div className="bg-white dark:bg-[#18181b] p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-lg text-slate-900 dark:text-slate-100">
                  Portfolio
                </h3>
                <div className="text-xs font-bold text-green-400 bg-green-400/10 px-2 py-1 rounded-lg">
                  +12.4%
                </div>
              </div>
              <div className="h-44 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data.portfolioData}>
                    <defs>
                      <linearGradient
                        id="colorValue"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor="#1f4842"
                          stopOpacity={0.3}
                        />
                        <stop
                          offset="95%"
                          stopColor="#1f4842"
                          stopOpacity={0}
                        />
                      </linearGradient>
                    </defs>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      stroke="#e2e8f0"
                      opacity={0.3}
                    />
                    <XAxis dataKey="name" hide />
                    <YAxis hide />
                    <Tooltip
                      contentStyle={{
                        borderRadius: "12px",
                        border: "none",
                        boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                      }}
                      formatter={(val) => formatCurrency(Number(val))}
                    />
                    <Area
                      type="monotone"
                      dataKey="value"
                      stroke="#1f4842"
                      fillOpacity={1}
                      fill="url(#colorValue)"
                      strokeWidth={3}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Variance */}
            <div className="bg-white dark:bg-[#18181b] p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-lg text-slate-900 dark:text-slate-100">
                  Budget Variance
                </h3>
                <div className="flex gap-3 items-center">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-[#1f4842]" />
                    <span className="text-[10px] font-bold text-slate-500 uppercase">
                      Under
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-[#bdf29f]" />
                    <span className="text-[10px] font-bold text-slate-500 uppercase">
                      Over
                    </span>
                  </div>
                </div>
              </div>
              <div className="h-44 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.varianceData} layout="vertical">
                    <XAxis type="number" hide />
                    <YAxis
                      dataKey="name"
                      type="category"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 11, fill: "#64748b" }}
                      width={80}
                    />
                    <Tooltip
                      cursor={{ fill: "transparent" }}
                      contentStyle={{
                        borderRadius: "12px",
                        border: "none",
                        boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                      }}
                    />
                    <Bar dataKey="variance" radius={[0, 4, 4, 0]}>
                      {data.varianceData.map((entry: any, index: number) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={entry.variance >= 0 ? "#1f4842" : "#bdf29f"}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
          {/* Net Worth Growth */}
          <div className="bg-white dark:bg-[#18181b] p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col h-64">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-lg text-slate-900 dark:text-slate-100">
                Net Worth Growth
              </h3>
              <div className="flex items-center gap-4 text-xs font-bold">
                <div className="flex items-center gap-1.5 text-emerald-500">
                  <div className="w-2 h-2 rounded-full bg-emerald-500" />
                  Current: Rp 124M
                </div>
                <div className="flex items-center gap-1.5 text-slate-400">
                  <div className="w-2 h-2 rounded-full bg-slate-300 dark:bg-slate-700" />
                  Target: Rp 200M
                </div>
              </div>
            </div>
            <div className="flex-1 min-h-0">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data.netWorthData}>
                  <defs>
                    <linearGradient
                      id="colorNetWorth"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="5%" stopColor="#bdf29f" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#bdf29f" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#e2e8f0"
                    opacity={0.2}
                  />
                  <XAxis dataKey="name" hide />
                  <YAxis hide />
                  <Tooltip
                    contentStyle={{
                      borderRadius: "12px",
                      border: "none",
                      boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                    }}
                    formatter={(val) => formatCurrency(Number(val))}
                  />
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke="#bdf29f"
                    fillOpacity={1}
                    fill="url(#colorNetWorth)"
                    strokeWidth={3}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Recent Transactions */}
          <div className="bg-white dark:bg-[#18181b] p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex-1">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-lg text-slate-900 dark:text-slate-100">
                Transactions
              </h3>
              <button className="text-xs font-bold text-[#1f4842] dark:text-[#bdf29f] hover:underline">
                View All
              </button>
            </div>
            <div className="space-y-5">
              {data.recentTransactions.map((tx: any) => (
                <TransactionItem key={tx.id} title={tx.title} category={tx.category} date={tx.date} amount={`${tx.isPositive ? '+' : '-'}${formatCurrency(tx.amount)}`} isPositive={tx.isPositive} />
              ))}
              {data.recentTransactions.length === 0 && (
                <div className="text-sm text-slate-500 text-center py-4">No transactions found.</div>
              )}
            </div>
          </div>

          {/* Saving Plans */}
          <div className="bg-white dark:bg-[#18181b] p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-lg text-slate-900 dark:text-slate-100">
                Saving Plans
              </h3>
              <Plus className="w-5 h-5 text-slate-400 cursor-pointer" />
            </div>
            <div className="space-y-4">
              {data.savingPlans.map((plan: any) => (
                <SavingPlanItem key={plan.id} title={plan.title} current={plan.current} target={plan.target} percent={plan.percent} />
              ))}
              {data.savingPlans.length === 0 && (
                <div className="text-sm text-slate-500 text-center py-4">No saving plans.</div>
              )}
            </div>
          </div>
        </div>

        {/* Right Sidebar (1/3) */}
        <div className="space-y-6">
          {/* My Cards Widget */}
          <div className="bg-white dark:bg-[#18181b] p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-lg text-slate-900 dark:text-slate-100">
                My Cards
              </h3>
              <button
                onClick={() => router.push('/cards')}
                className="text-xs font-bold text-[#1f4842] dark:text-[#bdf29f] hover:underline"
              >
                Manage
              </button>
            </div>

            <div className="flex gap-4 overflow-x-auto pb-4 hide-scrollbar snap-x">
              {data.accounts?.length > 0 ? (
                data.accounts.map((acc: any) => (
                  <div
                    key={acc.id}
                    className={cn(
                      "min-w-[260px] p-5 rounded-2xl text-white relative overflow-hidden shadow-lg snap-start h-40 flex flex-col justify-between",
                      acc.color === 'emerald' ? 'bg-emerald-600' :
                        acc.color === 'blue' ? 'bg-blue-600' :
                          acc.color === 'purple' ? 'bg-purple-600' :
                            acc.color === 'rose' ? 'bg-rose-600' :
                              acc.color === 'amber' ? 'bg-amber-600' : 'bg-[#1f4842]'
                    )}
                  >
                    <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full blur-2xl -mr-8 -mt-8" />
                    <div className="flex justify-between items-start z-10">
                      <div className="text-[10px] font-bold uppercase opacity-80 tracking-widest">{acc.type}</div>
                      <CreditCard className="w-5 h-5 opacity-50" />
                    </div>

                    <div className="z-10 mt-2">
                      <div className="text-xl font-bold mb-0.5">{formatCurrency(acc.balance)}</div>
                      <div className="text-[10px] opacity-70 font-medium truncate">{acc.name}</div>
                    </div>

                    <div className="flex justify-between items-end z-10 mt-4">
                      <div className="font-mono text-sm tracking-widest">**** {acc.accountNumber?.slice(-4) || '0000'}</div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="w-full h-40 rounded-2xl border-2 border-dashed border-slate-100 dark:border-slate-800 flex flex-col items-center justify-center text-slate-400">
                  <Plus className="w-6 h-6 mb-2" />
                  <span className="text-xs font-bold">Add Account</span>
                </div>
              )}
            </div>
          </div>

          {/* Active Subscriptions Widget */}
          <div className="bg-white dark:bg-[#18181b] p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-lg text-slate-900 dark:text-slate-100">
                Active Subscriptions
              </h3>
              <button
                onClick={() => router.push('/subscriptions')}
                className="text-xs font-bold text-[#1f4842] dark:text-[#bdf29f] hover:underline"
              >
                View All
              </button>
            </div>

            <div className="space-y-4">
              {data.subscriptions?.slice(0, 3).map((sub: any) => (
                <div key={sub.id} className="flex items-center justify-between group">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 flex items-center justify-center text-lg group-hover:scale-110 transition-transform">
                      {sub.name.charAt(0)}
                    </div>
                    <div>
                      <div className="font-bold text-sm text-slate-800 dark:text-slate-200">{sub.name}</div>
                      <div className="text-[10px] text-slate-500 font-medium">
                        Due on {new Date(sub.nextBillingDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-sm text-slate-900 dark:text-slate-100">
                      {formatCurrency(sub.amount)}
                    </div>
                    <div className="text-[8px] font-bold text-slate-400 uppercase">
                      {sub.billingPeriod}
                    </div>
                  </div>
                </div>
              ))}
              {(!data.subscriptions || data.subscriptions.length === 0) && (
                <div className="text-center py-4 text-xs text-slate-400 font-medium">
                  No active subscriptions.
                </div>
              )}
            </div>
          </div>

          {/* Expense Breakdown */}
          <div className="bg-white dark:bg-[#18181b] p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <h3 className="font-bold text-lg text-slate-900 dark:text-slate-100 mb-6">
              Expense Breakdown
            </h3>
            <div className="flex flex-col items-center">
              <div className="h-48 w-48 relative flex items-center justify-center">
                <ResponsiveContainer
                  width="100%"
                  height="100%"
                  className="absolute inset-0"
                >
                  <PieChart>
                    <Pie
                      data={data.expenseBreakdownData}
                      innerRadius={65}
                      outerRadius={80}
                      paddingAngle={4}
                      dataKey="value"
                      stroke="none"
                      cornerRadius={6}
                    >
                      {data.expenseBreakdownData.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <div className="text-slate-500 text-[10px] font-medium">
                    Total Spent
                  </div>
                  <div className="text-base font-bold text-[#1f4842] dark:text-[#bdf29f]">
                    {formatCurrency(data.totalExpense)}
                  </div>
                </div>
              </div>
              <div className="w-full mt-6 space-y-2">
                {data.expenseBreakdownData.slice(0, 4).map((item: any, idx: number) => (
                  <div
                    key={idx}
                    className="flex justify-between items-center text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="text-slate-600 dark:text-slate-400 font-medium">
                        {item.name}
                      </span>
                    </div>
                    <span className="font-bold text-slate-800 dark:text-slate-200">
                      {item.value}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Daily Limit */}
          <div className="bg-white dark:bg-[#18181b] p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-lg text-slate-900 dark:text-slate-100">
                Daily Limit
              </h3>
              <MoreVertical className="w-5 h-5 text-slate-400 cursor-pointer" />
            </div>
            <div className="flex justify-between items-end mb-2 text-xs">
              <div className="text-slate-500 font-medium">
                <span className="font-bold text-slate-900 dark:text-slate-100">
                  {formatCurrency(data.spentToday || 0)}
                </span>{" "}
                spent of {formatCurrency(data.dailyLimit || 100000)}
              </div>
              <div className="font-bold text-[#1f4842] dark:text-[#bdf29f]">
                {Math.round(((data.spentToday || 0) / (data.dailyLimit || 100000)) * 100)}%
              </div>
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-3 overflow-hidden">
              <div
                className={cn(
                  "h-full rounded-full transition-all duration-500",
                  ((data.spentToday || 0) / (data.dailyLimit || 100000)) > 1 ? "bg-red-500" : "bg-[#1f4842] dark:bg-[#bdf29f]"
                )}
                style={{ width: `${Math.min(100, Math.round(((data.spentToday || 0) / (data.dailyLimit || 100000)) * 100))}%` }}
              />
            </div>
            {((data.spentToday || 0) / (data.dailyLimit || 100000)) > 1 && (
              <p className="text-[10px] text-red-500 mt-2 font-medium">Warning: You've exceeded your daily limit!</p>
            )}
          </div>

          {/* Health Score Card */}
          {(() => {
            const income = data.totalIncome || 0;
            const expense = data.totalExpense || 0;
            const savings = data.totalSavings || 0;
            const investments = data.totalInvestments || 0;
            const monthlyNet = Math.max(0, income - expense);

            // 1. Savings Rate Score (Target 30%)
            const sr = income > 0 ? (monthlyNet / income) : 0;
            const srScore = Math.min(100, (sr / 0.3) * 100);

            // 2. Emergency Fund Score (Target 3x monthly expense)
            const efRatio = expense > 0 ? (savings / expense) : (savings > 0 ? 3 : 0);
            const efScore = Math.min(100, (efRatio / 3) * 100);

            // 3. Investment Allocation Score (Target 40% of net worth)
            const netWorth = savings + investments;
            const iaRatio = netWorth > 0 ? (investments / netWorth) : 0;
            const iaScore = Math.min(100, (iaRatio / 0.4) * 100);

            const totalScore = Math.round((srScore * 0.4) + (efScore * 0.4) + (iaScore * 0.2));

            let status = "Critical";
            let statusColor = "text-red-500";
            let strokeColor = "#ef4444";

            if (totalScore >= 80) {
              status = "Excellent";
              statusColor = "text-emerald-500";
              strokeColor = "#10b981";
            } else if (totalScore >= 60) {
              status = "Good";
              statusColor = "text-blue-500";
              strokeColor = "#3b82f6";
            } else if (totalScore >= 40) {
              status = "Fair";
              statusColor = "text-amber-500";
              strokeColor = "#f59e0b";
            }

            return (
              <div className="bg-white dark:bg-[#18181b] p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="font-bold text-slate-800 dark:text-slate-100">Financial Health</h3>
                  <TriangleAlert className={cn("w-5 h-5", totalScore < 40 ? "text-red-500" : "text-amber-500")} />
                </div>
                <div className="flex flex-col items-center gap-4">
                  <div className="relative w-32 h-32">
                    <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                      <circle
                        cx="18" cy="18" r="15.9155"
                        fill="none"
                        stroke="#f1f5f9"
                        strokeWidth="3"
                        className="dark:stroke-slate-800"
                      />
                      <circle
                        cx="18" cy="18" r="15.9155"
                        fill="none"
                        stroke={strokeColor}
                        strokeWidth="3"
                        strokeDasharray={`${totalScore}, 100`}
                        strokeLinecap="round"
                        className="transition-all duration-1000 ease-out"
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-3xl font-extrabold text-slate-900 dark:text-slate-100">
                        {totalScore}
                      </span>
                      <span className="text-[10px] font-bold text-slate-400 uppercase">
                        Score
                      </span>
                    </div>
                  </div>
                  <div className="text-center">
                    <div className={cn("text-sm font-bold mb-1", statusColor)}>{status}</div>
                    <div className="text-[10px] text-slate-400 font-medium">
                      {totalScore >= 80 ? "Your finances are in great shape!" :
                        totalScore >= 60 ? "You're on the right track." :
                          "Consider increasing your savings."}
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}


          {/* Savings Rate Milestone */}
          {(() => {
            const monthlySavings = Math.max(0, data.totalIncome - data.totalExpense);
            const savingsRate = data.totalIncome > 0 ? Math.round((monthlySavings / data.totalIncome) * 100) : 0;

            let level = "Starter";
            if (savingsRate >= 50) level = "Financial Master";
            else if (savingsRate >= 30) level = "Wealth Builder";
            else if (savingsRate >= 20) level = "Active Saver";
            else if (savingsRate >= 10) level = "Budgeter";

            const nextTarget = Math.ceil((savingsRate + 1) / 10) * 10;
            const gap = (data.totalIncome * (nextTarget / 100)) - monthlySavings;

            return (
              <div className="bg-[#1f4842] p-6 rounded-3xl border border-[#1f4842] shadow-xl text-white relative overflow-hidden group">
                <div className="relative z-10">
                  <h3 className="font-bold text-lg mb-2">Monthly Milestone</h3>
                  <p className="text-xs text-[#bdf29f] font-bold mb-4 opacity-80 uppercase tracking-wider">
                    Level: {level}
                  </p>
                  <div className="text-3xl font-bold mb-4">{savingsRate}% <span className="text-sm font-medium opacity-60">Savings Rate</span></div>
                  <div className="w-full bg-white/10 rounded-full h-2 mb-2">
                    <div className="bg-[#bdf29f] h-full rounded-full transition-all duration-1000" style={{ width: `${Math.min(100, savingsRate)}%` }} />
                  </div>
                  <p className="text-[10px] opacity-70">
                    {gap > 0
                      ? `You're ${formatCurrency(gap)} away from the ${nextTarget}% milestone!`
                      : "Outstanding! You've exceeded your targets this month."}
                  </p>
                </div>
                {/* Decorative background circle */}
                <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-[#bdf29f]/10 rounded-full group-hover:scale-110 transition-transform duration-500" />
              </div>
            );
          })()}
        </div>
      </div>
    </div>
  );
}

function BillItem({ title, date, amount, icon }: any) {
  return (
    <div className="flex items-center justify-between group cursor-pointer">
      <div className="flex gap-3 items-center">
        <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 flex items-center justify-center text-lg group-hover:scale-110 transition-transform">
          {icon}
        </div>
        <div>
          <div className="font-bold text-sm text-slate-800 dark:text-slate-200">
            {title}
          </div>
          <div className="text-[10px] text-slate-500 font-medium">
            Due on {date}
          </div>
        </div>
      </div>
      <div className="text-right">
        <div className="font-bold text-sm text-slate-900 dark:text-slate-100">
          {amount}
        </div>
        <div className="text-[8px] font-bold text-emerald-500 uppercase">
          Auto-pay
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, amount, trend, trendValue, isPositive, isAccent }: any) {
  return (
    <div className={`${isAccent ? 'bg-[#1f4842] border-none shadow-xl' : 'bg-white dark:bg-[#18181b] border border-slate-200 dark:border-slate-800 shadow-sm'} p-6 rounded-3xl flex flex-col justify-between hover:scale-[1.02] transition-transform duration-300`}>
      <div className="flex justify-between items-start mb-4">
        <div className={`p-2 rounded-xl ${isAccent ? 'bg-white/10' : 'bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800'}`}>
          <CreditCard className={`w-5 h-5 ${isAccent ? 'text-[#bdf29f]' : 'text-[#1f4842] dark:text-[#bdf29f]'}`} />
        </div>
        <span
          className={`text-[10px] px-2 py-1 rounded-lg font-bold flex items-center gap-1 ${isAccent ? 'bg-white/20 text-[#bdf29f]' : isPositive ? "bg-green-400/10 text-green-400" : "bg-red-400/10 text-red-400"}`}
        >
          {isPositive ? (
            <ArrowUpRight className="w-3 h-3" />
          ) : (
            <ArrowDownRight className="w-3 h-3" />
          )}
          {trend}
        </span>
      </div>
      <div>
        <div className={`${isAccent ? 'text-[#bdf29f] opacity-80' : 'text-slate-500'} text-xs font-bold mb-1`}>{title}</div>
        <div className={`text-2xl font-bold ${isAccent ? 'text-white' : 'text-slate-900 dark:text-slate-100'} tracking-tight`}>
          {amount}
        </div>
        <div className={`${isAccent ? 'text-[#bdf29f] opacity-60' : 'text-slate-400'} text-[10px] mt-1 font-medium`}>
          {trendValue}
        </div>
      </div>
    </div>
  );
}

function TransactionItem({ title, category, date, amount, isPositive }: any) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="flex gap-3 items-center min-w-0">
        <div
          className={`p-2 rounded-xl flex-shrink-0 ${isPositive ? "bg-emerald-500/10 text-emerald-500" : "bg-slate-100 dark:bg-slate-800 text-slate-400"}`}
        >
          <CreditCard className="w-4 h-4" />
        </div>
        <div className="min-w-0">
          <div className="font-bold text-sm text-slate-800 dark:text-slate-200 truncate">
            {title}
          </div>
          <div className="text-[10px] text-slate-500 font-medium truncate">
            {category} • {date}
          </div>
        </div>
      </div>
      <div
        className={`font-bold text-sm whitespace-nowrap flex-shrink-0 ${isPositive ? "text-emerald-500" : "text-slate-900 dark:text-slate-100"}`}
      >
        {amount}
      </div>
    </div>
  );
}

function SavingPlanItem({ title, current, target, percent }: any) {
  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <div className="font-bold text-xs text-slate-700 dark:text-slate-300">
          {title}
        </div>
        <div className="text-[10px] font-bold text-slate-400">{percent}%</div>
      </div>
      <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 mb-2 overflow-hidden">
        {percent > 0 && (
          <div
            className="bg-[#1f4842] dark:bg-[#bdf29f] h-full rounded-full transition-all duration-500"
            style={{ width: `${percent}%` }}
          ></div>
        )}
      </div>
      <div className="flex justify-between text-[9px] text-slate-500 font-bold uppercase tracking-wider">
        <span>{formatCurrency(current)}</span>
        <span>Target: {formatCurrency(target)}</span>
      </div>
    </div>
  );
}
