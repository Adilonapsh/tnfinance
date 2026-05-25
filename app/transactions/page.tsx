"use client";

import React, { useState, useMemo } from 'react';
import { Download, Filter, Search, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { formatCurrency } from '@/lib/format';
import PageTemplate from '@/components/PageTemplate';
import { useTransactions } from '@/lib/hooks/useTransactions';
import { useEffect } from 'react';
import { useAuthStore } from '@/lib/authStore';

import * as XLSX from 'xlsx';

export default function Transactions() {
  const { user } = useAuthStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({
    status: '',
    categoryId: '',
    type: '',
    startDate: '',
    endDate: '',
  });

  const [categories, setCategories] = useState<any[]>([]);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPage(1); // Reset to page 1 on new search
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const { loading, transactions, pagination, refetch } = useTransactions({
    search: debouncedSearch,
    page,
    limit: 10,
    ...filters
  });

  useEffect(() => {
    if (!user) return;
    const fetchCategories = async () => {
      try {
        const token = await user.getIdToken();
        const res = await fetch('/api/categories', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setCategories(data);
        }
      } catch (err) {
        console.error("Error fetching categories:", err);
      }
    };
    fetchCategories();
  }, [user]);

  const handleExport = () => {
    if (!transactions.length) return;
    
    // Format data for Excel
    const data = transactions.map(tx => ({
      'Description': tx.description || tx.merchantName || 'Transaction',
      'Category': tx.category?.name || 'Uncategorized',
      'Account': tx.account?.name || '-',
      'Date': new Date(tx.transactionDate).toLocaleDateString('id-ID'),
      'Type': tx.type.toUpperCase(),
      'Status': tx.status.toUpperCase(),
      'Amount': tx.type === 'income' ? tx.amount : -tx.amount,
      'Notes': tx.notes || ''
    }));

    // Create workbook and worksheet
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Transactions");

    // Adjust column widths
    const maxWidths = [
      { wch: 30 }, // Description
      { wch: 15 }, // Category
      { wch: 15 }, // Account
      { wch: 12 }, // Date
      { wch: 10 }, // Type
      { wch: 12 }, // Status
      { wch: 15 }, // Amount
      { wch: 30 }, // Notes
    ];
    worksheet['!cols'] = maxWidths;

    // Download file
    XLSX.writeFile(workbook, `transactions_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
    setPage(1); // Reset to page 1 on new filter
  };

  const clearFilters = () => {
    setFilters({
      status: '',
      categoryId: '',
      type: '',
      startDate: '',
      endDate: '',
    });
    setSearchTerm('');
    setPage(1);
  };

  const activeFiltersCount = Object.values(filters).filter(v => v !== '').length;

  return (
    <PageTemplate 
      title="Transactions" 
      subtitle="Kelola semua transaksi keuanganmu"
    >
      <div className="flex flex-col gap-6">
        {/* Actions Row */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="relative w-full md:w-96">
            <input
              type="text"
              placeholder="Search by description or merchant..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-white dark:bg-[#1f1f23] border border-slate-200 dark:border-slate-700 rounded-2xl py-3 pl-10 pr-4 text-sm focus:border-[#1f4842] focus:outline-none focus:ring-2 focus:ring-[#1f4842]/50 transition-all text-slate-900 dark:text-slate-100 w-full shadow-sm"
            />
            <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <button 
              onClick={() => setShowFilters(!showFilters)}
              className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl text-sm font-medium transition-all border ${
                showFilters || activeFiltersCount > 0
                ? 'bg-[#1f4842] border-[#1f4842] text-white' 
                : 'bg-white dark:bg-[#1f1f23] border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              <Filter className="w-4 h-4" /> 
              Filter {activeFiltersCount > 0 && `(${activeFiltersCount})`}
            </button>
            <button 
              onClick={handleExport}
              disabled={loading || transactions.length === 0}
              className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-white dark:bg-[#1f1f23] border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 px-4 py-2.5 rounded-2xl text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors disabled:opacity-50 shadow-sm"
            >
              <Download className="w-4 h-4" /> Export
            </button>
          </div>
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <div className="bg-white dark:bg-[#1f1f23] border border-slate-200 dark:border-slate-700 rounded-3xl p-6 shadow-sm animate-in fade-in slide-in-from-top-4 duration-300">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-slate-900 dark:text-slate-100">Filters</h3>
              <button onClick={clearFilters} className="text-xs text-[#1f4842] dark:text-[#bdf29f] hover:underline font-medium">
                Clear all filters
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">Status</label>
                <select 
                  name="status"
                  value={filters.status}
                  onChange={handleFilterChange}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1f4842]/50 text-slate-900 dark:text-slate-100"
                >
                  <option value="">All Statuses</option>
                  <option value="completed">Completed</option>
                  <option value="pending">Pending</option>
                  <option value="failed">Failed</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">Category</label>
                <select 
                  name="categoryId"
                  value={filters.categoryId}
                  onChange={handleFilterChange}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1f4842]/50 text-slate-900 dark:text-slate-100"
                >
                  <option value="">All Categories</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">Type</label>
                <select 
                  name="type"
                  value={filters.type}
                  onChange={handleFilterChange}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1f4842]/50 text-slate-900 dark:text-slate-100"
                >
                  <option value="">All Types</option>
                  <option value="income">Income</option>
                  <option value="expense">Expense</option>
                  <option value="transfer">Transfer</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">Date Range</label>
                <div className="flex gap-2">
                  <input 
                    type="date"
                    name="startDate"
                    value={filters.startDate}
                    onChange={handleFilterChange}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-[10px] focus:outline-none focus:ring-2 focus:ring-[#1f4842]/50 text-slate-900 dark:text-slate-100"
                  />
                  <input 
                    type="date"
                    name="endDate"
                    value={filters.endDate}
                    onChange={handleFilterChange}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-[10px] focus:outline-none focus:ring-2 focus:ring-[#1f4842]/50 text-slate-900 dark:text-slate-100"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Table Section */}
        <div className="bg-white dark:bg-[#1f1f23] border border-slate-200 dark:border-slate-700 rounded-3xl shadow-sm overflow-hidden flex flex-col">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-slate-600 dark:text-slate-300">
              <thead className="text-xs text-slate-500 dark:text-slate-400 uppercase bg-slate-50/50 dark:bg-slate-800/50">
                <tr>
                  <th className="px-6 py-4 font-semibold">Description</th>
                  <th className="px-6 py-4 font-semibold">Category</th>
                  <th className="px-6 py-4 font-semibold">Account</th>
                  <th className="px-6 py-4 font-semibold">Date</th>
                  <th className="px-6 py-4 font-semibold">Status</th>
                  <th className="px-6 py-4 font-semibold text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td colSpan={6} className="px-6 py-4">
                        <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded w-full"></div>
                      </td>
                    </tr>
                  ))
                ) : transactions.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                      No transactions found.
                    </td>
                  </tr>
                ) : (
                  transactions.map((tx) => (
                    <tr key={tx.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-medium text-slate-900 dark:text-slate-100">
                          {tx.description || tx.merchantName || 'Transaction'}
                        </div>
                        {tx.notes && <div className="text-xs text-slate-400 mt-0.5">{tx.notes}</div>}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span 
                            className="w-2 h-2 rounded-full" 
                            style={{ backgroundColor: tx.category?.color || '#cbd5e1' }}
                          ></span>
                          {tx.category?.name || 'Uncategorized'}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-xs">
                        {tx.account?.name || '-'}
                      </td>
                      <td className="px-6 py-4 text-xs">
                        {new Date(tx.transactionDate).toLocaleDateString('id-ID', { 
                          day: 'numeric', 
                          month: 'short', 
                          year: 'numeric' 
                        })}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${
                          tx.status === 'completed' 
                          ? 'bg-[#ecf4e9] dark:bg-[#1f4842]/20 text-[#1f4842] dark:text-[#bdf29f]' 
                          : tx.status === 'failed'
                          ? 'bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400'
                          : 'bg-yellow-50 dark:bg-yellow-500/10 text-yellow-600 dark:text-yellow-400'
                        }`}>
                          {tx.status}
                        </span>
                      </td>
                      <td className={`px-6 py-4 text-right font-bold ${
                        tx.type === 'income' 
                        ? 'text-[#1f4842] dark:text-[#bdf29f]' 
                        : 'text-slate-900 dark:text-slate-100'
                      }`}>
                        {tx.type === 'income' ? '+' : '-'}{formatCurrency(Math.abs(tx.amount))}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Footer */}
          {!loading && transactions.length > 0 && (
            <div className="flex items-center justify-between px-6 py-4 bg-slate-50/30 dark:bg-slate-800/30 border-t border-slate-100 dark:border-slate-800">
              <div className="text-xs text-slate-500">
                Showing <span className="font-medium text-slate-700 dark:text-slate-300">{(pagination.page - 1) * pagination.limit + 1}</span> to <span className="font-medium text-slate-700 dark:text-slate-300">{Math.min(pagination.page * pagination.limit, pagination.total)}</span> of <span className="font-medium text-slate-700 dark:text-slate-300">{pagination.total}</span> entries
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-white dark:hover:bg-slate-800 disabled:opacity-50 transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, pagination.totalPages) }).map((_, i) => {
                    // Simple pagination logic for displaying page numbers
                    let pageNum = page;
                    if (pagination.totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (page <= 3) {
                      pageNum = i + 1;
                    } else if (page >= pagination.totalPages - 2) {
                      pageNum = pagination.totalPages - 4 + i;
                    } else {
                      pageNum = page - 2 + i;
                    }

                    return (
                      <button 
                        key={pageNum}
                        onClick={() => setPage(pageNum)}
                        className={`w-8 h-8 rounded-xl text-xs font-medium transition-all ${
                          page === pageNum 
                          ? 'bg-[#1f4842] text-white' 
                          : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>
                <button 
                  onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))}
                  disabled={page === pagination.totalPages}
                  className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-white dark:hover:bg-slate-800 disabled:opacity-50 transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </PageTemplate>
  );
}


