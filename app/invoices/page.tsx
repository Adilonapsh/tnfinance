"use client";

import React, { useMemo, useState, useEffect } from 'react';
import { Plus, Download, FileText, Search, MoreHorizontal, X, TrendingUp, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { formatCurrency } from '@/lib/format';
import { cn } from '@/lib/utils';
import PageTemplate from '@/components/PageTemplate';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { useForm, useFieldArray } from 'react-hook-form';

import { useInvoices } from '@/lib/hooks/useInvoices';

const formatDate = (dateStr: string) => {
  if (!dateStr) return '-';
  try {
    const date = new Date(dateStr);
    return date.toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  } catch (e) {
    return dateStr;
  }
};


const InvoiceStatCard = React.memo(({ title, amount, count, icon: Icon, color, loading }: any) => (
  <div className="bg-white dark:bg-[#1f1f23] p-6 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm flex items-center gap-4">
    <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center text-white", color)}>
      <Icon className="w-6 h-6" />
    </div>
    <div className="flex-1">
      <div className="text-slate-500 dark:text-slate-400 text-sm font-medium mb-0.5">{title}</div>
      {loading ? (
        <div className="h-8 bg-slate-100 dark:bg-slate-800 rounded animate-pulse w-3/4 mb-1"></div>
      ) : (
        <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">{formatCurrency(amount)}</div>
      )}
      <div className="text-xs text-slate-400">{count} invoices</div>
    </div>
  </div>
));
InvoiceStatCard.displayName = 'InvoiceStatCard';

const exportInvoiceToPDF = (invoice: any) => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  let yPosition = margin;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(31, 72, 66);
  doc.text('TN', margin, yPosition + 5);

  doc.setFontSize(30);
  doc.text('INVOICE', pageWidth - margin, yPosition + 5, { align: 'right' });

  yPosition += 20;

  doc.setFontSize(10);
  doc.setTextColor(100, 116, 139);
  doc.setFont('helvetica', 'normal');
  doc.text('INVOICE TO', margin, yPosition);

  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(31, 41, 55);
  doc.text(invoice.client, margin, yPosition + 6);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text(invoice.project, margin, yPosition + 11);

  doc.setFontSize(10);
  doc.setTextColor(100, 116, 139);
  doc.text('Invoice No', pageWidth - 80, yPosition);
  doc.text('Invoice Date', pageWidth - 80, yPosition + 6);

  doc.setFontSize(10);
  doc.setTextColor(31, 41, 55);
  doc.text(invoice.invoiceNumber, pageWidth - margin, yPosition, { align: 'right' });
  doc.text(formatDate(invoice.date), pageWidth - margin, yPosition + 6, { align: 'right' });

  yPosition += 25;

  doc.setFontSize(10);
  doc.setTextColor(100, 116, 139);
  doc.text('Contact Person', margin, yPosition);

  doc.setFontSize(10);
  doc.setTextColor(31, 41, 55);
  doc.text('Phone: (+62) 123 456 789', margin, yPosition + 5);
  doc.text(`E-mail: ${invoice.email}`, margin, yPosition + 10);

  doc.setFontSize(10);
  doc.setTextColor(100, 116, 139);
  doc.text('Payment Method', pageWidth - 80, yPosition);

  doc.setFontSize(10);
  doc.setTextColor(31, 41, 55);
  doc.text('Account ID: 123456789', pageWidth - 80, yPosition + 5);
  doc.text('Account Name: FinTrack', pageWidth - 80, yPosition + 10);

  yPosition += 25;

  const subtotal = invoice.items.reduce((sum: number, item: any) => sum + (item.quantity * item.price), 0);
  const taxAmount = (subtotal * invoice.tax) / 100;
  const total = subtotal + taxAmount - ((subtotal * invoice.discount) / 100);

  const formatRupiah = (amount: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
  };

  const tableData = invoice.items.map((item: any, index: number) => [
    String(index + 1).padStart(2, '0'),
    item.description,
    formatRupiah(item.price),
    String(item.quantity),
    formatRupiah(item.quantity * item.price),
  ]);

  autoTable(doc, {
    startY: yPosition,
    head: [['#', 'DESCRIPTION', 'PRICE', 'QUANTITY', 'AMOUNT']],
    body: tableData,
    theme: 'grid',
    styles: { font: 'helvetica', fontSize: 10, cellPadding: 4 },
    headStyles: { fillColor: [50, 50, 50], textColor: 255, fontStyle: 'bold', fontSize: 9 },
    bodyStyles: { textColor: [51, 65, 85] },
    alternateRowStyles: { fillColor: [245, 245, 245] },
    columnStyles: {
      0: { halign: 'center', cellWidth: 15 },
      1: { cellWidth: 'auto' },
      2: { halign: 'right', cellWidth: 55 },
      3: { halign: 'center', cellWidth: 20 },
      4: { halign: 'right', cellWidth: 60, fontStyle: 'bold' },
    },
  });

  const finalY = (doc as any).lastAutoTable.finalY + 8;
  const rightAlign = pageWidth - margin;

  doc.setFontSize(10);
  doc.setTextColor(100, 116, 139);
  doc.text('Sub Total', rightAlign - 50, finalY, { align: 'right' });
  doc.setFontSize(10);
  doc.setTextColor(31, 41, 55);
  doc.text(formatRupiah(subtotal), rightAlign, finalY, { align: 'right' });

  doc.setFontSize(10);
  doc.setTextColor(100, 116, 139);
  doc.text(`Tax (${invoice.tax}%)`, rightAlign - 50, finalY + 6, { align: 'right' });
  doc.setFontSize(10);
  doc.setTextColor(31, 41, 55);
  doc.text(formatRupiah(taxAmount), rightAlign, finalY + 6, { align: 'right' });

  const totalY = finalY + 14;
  doc.setFillColor(50, 50, 50);
  doc.rect(rightAlign - 85, totalY - 4, 85, 12, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('TOTAL', rightAlign - 80, totalY + 4);
  doc.text(formatRupiah(total), rightAlign - 5, totalY + 4, { align: 'right' });

  const leftTotalY = finalY;
  doc.setFontSize(10);
  doc.setTextColor(100, 116, 139);
  doc.text('Total Due', margin, leftTotalY);
  doc.setFontSize(16);
  doc.setTextColor(31, 72, 66);
  doc.setFont('helvetica', 'bold');
  doc.text(formatRupiah(total), margin, leftTotalY + 7);

  doc.save(`${invoice.invoiceNumber}.pdf`);
};

const InvoiceDetailModal = ({ invoice, onClose }: { invoice: any; onClose: () => void }) => {
  const subtotal = invoice.items.reduce((sum: number, item: any) => sum + (item.quantity * item.price), 0);
  const taxAmount = (subtotal * invoice.tax) / 100;
  const total = subtotal + taxAmount - ((subtotal * invoice.discount) / 100);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-[#18181b] rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="flex justify-between items-center p-6 border-b border-slate-100 dark:border-slate-700 sticky top-0 bg-white dark:bg-[#18181b]">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{invoice.invoiceNumber}</h2>
            <p className="text-sm text-slate-500">{invoice.client} • {invoice.project}</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => exportInvoiceToPDF(invoice)}
              className="flex items-center gap-2 px-4 py-2 bg-[#1f4842] text-white rounded-xl text-sm font-bold hover:opacity-90 transition-opacity"
            >
              <Download className="w-4 h-4" /> Export PDF
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
            <div>
              <h4 className="font-bold text-sm text-slate-500 uppercase mb-3">From</h4>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-1">FinTrack</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">finance@fintrack.com</p>
            </div>
            <div className="text-right">
              <div className={cn(
                "inline-block px-4 py-1.5 rounded-full text-sm font-bold uppercase mb-3",
                invoice.status === 'Paid' ? "bg-[#ecf4e9] dark:bg-[#1f4842]/20 text-[#1f4842] dark:text-[#bdf29f]" :
                  invoice.status === 'Overdue' ? "bg-red-500/10 text-red-500" :
                    "bg-orange-500/10 text-orange-500"
              )}>
                {invoice.status}
              </div>
              <div className="space-y-1">
                <div className="text-sm"><span className="text-slate-500">Invoice Date:</span> <span className="font-medium text-slate-900 dark:text-white">{formatDate(invoice.date)}</span></div>
                <div className="text-sm"><span className="text-slate-500">Due Date:</span> <span className="font-medium text-slate-900 dark:text-white">{formatDate(invoice.dueDate)}</span></div>
              </div>
            </div>
          </div>

          <div className="mb-8">
            <h4 className="font-bold text-sm text-slate-500 uppercase mb-3">To</h4>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">{invoice.client}</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">{invoice.email}</p>
          </div>

          <div className="mb-8">
            <div className="overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-700">
              <table className="w-full">
                <thead className="bg-slate-50 dark:bg-slate-800">
                  <tr>
                    <th className="text-left p-4 text-xs font-bold text-slate-500 uppercase">Item</th>
                    <th className="text-right p-4 text-xs font-bold text-slate-500 uppercase">Qty</th>
                    <th className="text-right p-4 text-xs font-bold text-slate-500 uppercase">Price</th>
                    <th className="text-right p-4 text-xs font-bold text-slate-500 uppercase">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                  {invoice.items.map((item: any, i: number) => (
                    <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                      <td className="p-4 text-sm font-medium text-slate-900 dark:text-white">{item.description}</td>
                      <td className="p-4 text-sm text-right text-slate-600 dark:text-slate-400">{item.quantity}</td>
                      <td className="p-4 text-sm text-right text-slate-600 dark:text-slate-400">{formatCurrency(item.price)}</td>
                      <td className="p-4 text-sm text-right font-bold text-slate-900 dark:text-white">{formatCurrency(item.quantity * item.price)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex justify-end mb-8">
            <div className="w-full max-w-sm">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Subtotal</span>
                  <span className="font-medium text-slate-900 dark:text-white">{formatCurrency(subtotal)}</span>
                </div>
                {invoice.tax > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Tax ({invoice.tax}%)</span>
                    <span className="font-medium text-slate-900 dark:text-white">{formatCurrency(taxAmount)}</span>
                  </div>
                )}
                {invoice.discount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Discount ({invoice.discount}%)</span>
                    <span className="font-medium text-red-500">-{formatCurrency((subtotal * invoice.discount) / 100)}</span>
                  </div>
                )}
                <div className="h-px bg-slate-200 dark:bg-slate-700 my-2" />
                <div className="flex justify-between text-lg">
                  <span className="font-bold text-slate-900 dark:text-white">Total</span>
                  <span className="font-bold text-[#1f4842] dark:text-[#bdf29f]">{formatCurrency(total)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const CreateInvoiceModal = ({
  isOpen, onClose, onAddInvoice, onUpdateInvoice, invoiceCount, editingInvoice
}: {
  isOpen: boolean; onClose: () => void; onAddInvoice: (invoice: any) => Promise<void>;
  onUpdateInvoice: (id: string, invoice: any) => Promise<void>;
  invoiceCount: number; editingInvoice?: any
}) => {
  const [submitting, setSubmitting] = useState(false);
  const { register, control, handleSubmit, reset, formState: { errors } } = useForm<any>({
    defaultValues: {
      invoiceNumber: '',
      client: '',
      email: '',
      project: '',
      date: '',
      dueDate: '',
      status: 'Pending',
      tax: 11,
      discount: 0,
      notes: '',
      items: [{ description: '', quantity: 1, price: 0 }],
    },
  });

  useEffect(() => {
    if (editingInvoice) {
      reset({
        ...editingInvoice,
        date: new Date(editingInvoice.date).toISOString().split('T')[0],
        dueDate: new Date(editingInvoice.dueDate).toISOString().split('T')[0],
      });
    } else {
      reset({
        invoiceNumber: `INV-${new Date().getFullYear()}-${String(invoiceCount + 1).padStart(3, '0')}`,
        client: '',
        email: '',
        project: '',
        date: new Date().toISOString().split('T')[0],
        dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        status: 'Pending',
        tax: 11,
        discount: 0,
        notes: '',
        items: [{ description: '', quantity: 1, price: 0 }],
      });
    }
  }, [editingInvoice, reset, invoiceCount]);

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'items',
  });

  const onSubmit = async (data: any) => {
    setSubmitting(true);
    try {
      if (editingInvoice) {
        await onUpdateInvoice(editingInvoice.dbId, data);
        toast.success('Invoice updated successfully!');
      } else {
        await onAddInvoice(data);
        toast.success('Invoice created successfully!');
      }
      reset();
      onClose();
    } catch (err: any) {
      console.log(err);
      toast.error(`Error: ${err.message}`);
      // console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const inputClass = "w-full px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-[#1f1f23] text-slate-900 dark:text-white focus:ring-2 focus:ring-[#1f4842] focus:border-transparent";

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-lg bg-white dark:bg-[#18181b] shadow-2xl h-full overflow-y-auto z-10 animate-in slide-in-from-right duration-300">
        <div className="flex justify-between items-center p-6 border-b border-slate-100 dark:border-slate-700 sticky top-0 bg-white dark:bg-[#18181b] z-20">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
            {editingInvoice ? 'Edit Invoice' : 'Create Invoice'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Invoice Number</label>
              <input
                type="text"
                {...register('invoiceNumber', { required: true })}
                className={inputClass}
              />
              {errors.invoiceNumber && <span className="text-red-500 text-xs mt-1">Required</span>}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Status</label>
              <select
                {...register('status', { required: true })}
                className={inputClass}
              >
                <option value="Pending">Pending</option>
                <option value="Paid">Paid</option>
                <option value="Overdue">Overdue</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Client Name</label>
              <input
                type="text"
                {...register('client', { required: true })}
                className={inputClass}
              />
              {errors.client && <span className="text-red-500 text-xs mt-1">Required</span>}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Client Email</label>
              <input
                type="email"
                {...register('email', { required: true })}
                className={inputClass}
              />
              {errors.email && <span className="text-red-500 text-xs mt-1">Required</span>}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Project</label>
            <input
              type="text"
              {...register('project', { required: true })}
              className={inputClass}
            />
            {errors.project && <span className="text-red-500 text-xs mt-1">Required</span>}
          </div>

          <div className="border-t border-slate-100 dark:border-slate-700 pt-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Items</h3>
              <button
                type="button"
                onClick={() => append({ description: '', quantity: 1, price: 0 })}
                className="flex items-center gap-2 px-3 py-1.5 text-sm font-bold bg-[#1f4842] text-white rounded-xl hover:opacity-90 transition-opacity"
              >
                <Plus className="w-4 h-4" /> Add Item
              </button>
            </div>
            <div className="space-y-3">
              {fields.map((field, index) => (
                <div key={field.id} className="grid grid-cols-12 gap-3 items-end">
                  <div className="col-span-6">
                    <label className="block text-xs font-medium text-slate-500 mb-1">Description</label>
                    <input
                      type="text"
                      {...register(`items.${index}.description` as const, { required: true })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-[#1f1f23] text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-[#1f4842] focus:border-transparent"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs font-medium text-slate-500 mb-1">Qty</label>
                    <input
                      type="number"
                      min="1"
                      {...register(`items.${index}.quantity` as const, { required: true, valueAsNumber: true })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-[#1f1f23] text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-[#1f4842] focus:border-transparent"
                    />
                  </div>
                  <div className="col-span-3">
                    <label className="block text-xs font-medium text-slate-500 mb-1">Price</label>
                    <input
                      type="number"
                      min="0"
                      {...register(`items.${index}.price` as const, { required: true, valueAsNumber: true })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-[#1f1f23] text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-[#1f4842] focus:border-transparent"
                    />
                  </div>
                  <div className="col-span-1">
                    <button
                      type="button"
                      onClick={() => remove(index)}
                      className="p-2 text-red-500 hover:bg-red-500/10 rounded-xl"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 pb-8">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 font-bold hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2.5 rounded-xl bg-[#1f4842] text-white font-bold hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {submitting ? 'Processing...' : (editingInvoice ? 'Update Invoice' : 'Create Invoice')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default function Invoices() {
  const {
    loading, invoices, addInvoice, updateInvoice, deleteInvoice,
    totalPages, currentPage, setPage
  } = useInvoices();
  const [selectedInvoice, setSelectedInvoice] = useState<any | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState<any | null>(null);

  const calculateTotal = (inv: any) => {
    const subtotal = inv.items.reduce((s: number, item: any) => s + (item.quantity * item.price), 0);
    const tax = (subtotal * inv.tax) / 100;
    const discount = (subtotal * inv.discount) / 100;
    return subtotal + tax - discount;
  };

  const totalInvoiced = useMemo(() =>
    invoices.reduce((sum, inv) => sum + calculateTotal(inv), 0),
    [invoices]);

  const totalOutstanding = useMemo(() =>
    invoices
      .filter(inv => inv.status === 'Pending' || inv.status === 'Overdue')
      .reduce((sum, inv) => sum + calculateTotal(inv), 0),
    [invoices]);

  const totalPaid = useMemo(() =>
    invoices
      .filter(inv => inv.status === 'Paid')
      .reduce((sum, inv) => sum + calculateTotal(inv), 0),
    [invoices]);

  return (
    <PageTemplate
      title="Invoices"
      subtitle="Kelola dan kirim invoice dengan mudah"
    >
      <div className="flex justify-between items-center mb-6">
        <div></div>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center gap-2 bg-[#1f4842] text-white px-5 py-2.5 rounded-2xl text-sm font-bold hover:opacity-90 transition-colors"
        >
          <Plus className="w-4 h-4" /> Create Invoice
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <InvoiceStatCard loading={loading} title="Total Invoiced" amount={totalInvoiced} count={invoices.length} icon={FileText} color="bg-blue-500" />
        <InvoiceStatCard loading={loading} title="Outstanding" amount={totalOutstanding} count={invoices.filter(i => i.status !== 'Paid').length} icon={Search} color="bg-orange-500" />
        <InvoiceStatCard loading={loading} title="Paid" amount={totalPaid} count={invoices.filter(i => i.status === 'Paid').length} icon={TrendingUp} color="bg-emerald-500" />
      </div>

      <div className="bg-white dark:bg-[#1f1f23] border border-slate-200 dark:border-slate-700 rounded-3xl p-6 shadow-sm min-h-[400px]">
        {loading ? (
          <div className="flex flex-col gap-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-16 bg-slate-50 dark:bg-slate-800 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : invoices.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400">
            <FileText className="w-12 h-12 opacity-20 mb-4" />
            <p>No invoices found. Create your first one!</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-slate-500 uppercase border-b border-slate-100 dark:border-slate-700">
                <tr>
                  <th className="px-6 py-4 font-semibold">Invoice ID</th>
                  <th className="px-6 py-4 font-semibold">Client</th>
                  <th className="px-6 py-4 font-semibold">Amount</th>
                  <th className="px-6 py-4 font-semibold">Due Date</th>
                  <th className="px-6 py-4 font-semibold">Status</th>
                  <th className="px-6 py-4 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((inv) => (
                  <tr
                    key={inv.invoiceNumber}
                    className="border-b border-slate-50 dark:border-slate-700 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer"
                    onClick={() => setSelectedInvoice(inv)}
                  >
                    <td className="px-6 py-4 font-bold text-slate-900 dark:text-slate-100">{inv.invoiceNumber}</td>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-800 dark:text-slate-200">{inv.client}</div>
                      <div className="text-xs text-slate-500">{inv.project}</div>
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-900 dark:text-slate-100">
                      {formatCurrency(calculateTotal(inv))}
                    </td>
                    <td className="px-6 py-4 text-slate-500">
                      {formatDate(inv.dueDate)}
                    </td>
                    <td className="px-6 py-4">
                      <span className={cn(
                        "px-3 py-1 rounded-xl text-[10px] font-bold uppercase",
                        inv.status === 'Paid' ? "bg-[#ecf4e9] dark:bg-[#1f4842]/20 text-[#1f4842] dark:text-[#bdf29f]" :
                          inv.status === 'Overdue' ? "bg-red-500/10 text-red-500" :
                            "bg-orange-500/10 text-orange-500"
                      )}>
                        {inv.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingInvoice(inv);
                            setIsCreateModalOpen(true);
                          }}
                          className="p-2 text-slate-400 hover:text-[#1f4842] dark:hover:text-[#bdf29f] hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
                          title="Edit Invoice"
                        >
                          <TrendingUp className="w-4 h-4" /> {/* Using TrendingUp as a placeholder for edit if no pen icon, but I'll use FileText or just text */}
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteInvoice(inv.dbId);
                          }}
                          className="p-2 text-slate-400 hover:text-red-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
                          title="Delete Invoice"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div className="text-xs text-slate-500 font-medium">
                  Page {currentPage} of {totalPages}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPage(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-3 py-1.5 text-xs font-bold border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1.5 text-xs font-bold border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {selectedInvoice && (
        <InvoiceDetailModal
          invoice={selectedInvoice}
          onClose={() => setSelectedInvoice(null)}
        />
      )}

      <CreateInvoiceModal
        isOpen={isCreateModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false);
          setEditingInvoice(null);
        }}
        onAddInvoice={addInvoice}
        onUpdateInvoice={updateInvoice}
        editingInvoice={editingInvoice}
        invoiceCount={invoices.length}
      />
    </PageTemplate>
  );
}
