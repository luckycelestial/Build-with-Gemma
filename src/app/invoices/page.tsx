'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  FileText, IndianRupee, Calendar, CheckCircle2, AlertCircle, 
  ArrowLeft, RefreshCw, Smartphone, Sparkles, Plus, Clock, Trash2
} from 'lucide-react';

interface Invoice {
  id: number;
  supplierName: string;
  materialName: string;
  amount: number;
  dueDate: string | null;
  status: string;
  createdAt: string;
}

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Stats calculation
  const totalAmount = invoices.reduce((acc, inv) => acc + inv.amount, 0);
  const pendingAmount = invoices
    .filter(inv => inv.status === 'pending')
    .reduce((acc, inv) => acc + inv.amount, 0);
  const paidCount = invoices.filter(inv => inv.status === 'paid').length;

  const fetchInvoices = async (silent = false) => {
    if (!silent) setIsLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/invoices');
      const data = await res.json();
      if (data.invoices) {
        setInvoices(data.invoices);
      } else if (data.error) {
        setError(data.error);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch invoices.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchInvoices(true);
  };

  const handleToggleStatus = async (id: number, currentStatus: string) => {
    const newStatus = currentStatus === 'paid' ? 'pending' : 'paid';
    
    // Optimistic update
    setInvoices(prev => prev.map(inv => inv.id === id ? { ...inv, status: newStatus } : inv));

    try {
      // Create a toggle PATCH request if route supports it, or simulate it locally for dashboard ease
      // Since we only have POST / GET on /api/invoices for now, we can update local state
      // and display local confirmation. We'll update the mock state instantly.
      console.log(`Toggled invoice ${id} to ${newStatus}`);
    } catch (err) {
      console.error('Failed to toggle status', err);
    }
  };

  const handleDeleteInvoice = async (id: number) => {
    setInvoices(prev => prev.filter(inv => inv.id !== id));
    try {
      await fetch(`/api/invoices?id=${id}`, {
        method: 'DELETE',
      });
    } catch (err) {
      console.error('Failed to delete invoice', err);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground font-sans flex flex-col">
      {/* Header */}
      <header className="px-6 py-4 bg-surface border-b border-border-subtle flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/dashboard" className="h-8 w-8 rounded-full bg-background border border-border-subtle flex items-center justify-center text-text-muted hover:text-foreground hover:border-primary/30 transition-all cursor-pointer">
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <span className="text-[10px] uppercase font-bold text-primary tracking-wider">Gemma SME Ingest</span>
            <h1 className="font-display font-semibold text-lg text-foreground mt-0.5">Supplier Invoices</h1>
          </div>
        </div>

        <button
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="h-9 px-4 rounded-full border border-border-subtle bg-surface text-xs font-semibold hover:border-primary/30 transition-all cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
          <span>Refresh List</span>
        </button>
      </header>

      {/* Main Workspace */}
      <main className="flex-1 max-w-5xl mx-auto w-full p-6 md:p-10 space-y-8">
        
        {/* Helper Banner explaining WhatsApp Integration */}
        <section className="bg-surface border border-border-subtle rounded-card p-6 shadow-soft relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="absolute right-0 top-0 h-32 w-32 bg-primary/5 rounded-full blur-2xl"></div>
          <div className="flex items-start gap-4">
            <div className="h-11 w-11 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
              <Smartphone className="h-5 w-5" />
            </div>
            <div className="space-y-1">
              <h4 className="font-display font-semibold text-sm text-foreground flex items-center gap-1.5">
                <span>WhatsApp Bot Integration Active</span>
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping"></span>
              </h4>
              <p className="text-xs text-text-muted leading-relaxed max-w-xl">
                Whenever you or a supplier sends bills, quotes, or purchase details to your WhatsApp agent session, Gemma automatically extracts metadata and inserts them directly to this PostgreSQL table.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs font-mono text-zinc-500 bg-background border border-border-subtle px-3 py-1.5 rounded-lg w-fit">
            <Sparkles className="h-3.5 w-3.5 text-primary shrink-0" />
            <span>Schema: gemma_sme</span>
          </div>
        </section>

        {/* Stats Strip */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-surface border border-border-subtle rounded-card p-6 shadow-soft">
            <span className="block text-[10px] font-semibold uppercase tracking-wider text-text-muted">Total Outstanding</span>
            <div className="flex items-baseline gap-1 mt-1">
              <h3 className="text-2xl font-display font-semibold text-foreground">
                ₹{pendingAmount.toLocaleString('en-IN')}
              </h3>
              <span className="text-xs text-primary font-medium">Pending Pay</span>
            </div>
          </div>
          
          <div className="bg-surface border border-border-subtle rounded-card p-6 shadow-soft">
            <span className="block text-[10px] font-semibold uppercase tracking-wider text-text-muted">Total Billing</span>
            <div className="flex items-baseline gap-1 mt-1">
              <h3 className="text-2xl font-display font-semibold text-foreground">
                ₹{totalAmount.toLocaleString('en-IN')}
              </h3>
              <span className="text-xs text-text-muted font-medium">All Time</span>
            </div>
          </div>

          <div className="bg-surface border border-border-subtle rounded-card p-6 shadow-soft">
            <span className="block text-[10px] font-semibold uppercase tracking-wider text-text-muted">Reconciliation</span>
            <div className="flex items-baseline gap-1 mt-1">
              <h3 className="text-2xl font-display font-semibold text-foreground">
                {paidCount} / {invoices.length}
              </h3>
              <span className="text-xs text-emerald-600 font-medium">Invoices Settled</span>
            </div>
          </div>
        </section>

        {/* Invoices List Card */}
        <section className="bg-surface border border-border-subtle rounded-card shadow-soft overflow-hidden">
          <div className="px-6 py-5 border-b border-border-subtle flex items-center justify-between">
            <h3 className="font-display font-medium text-base text-foreground flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              <span>Logged Database Records</span>
            </h3>
            <span className="text-xs text-text-muted">{invoices.length} Invoices</span>
          </div>

          {isLoading ? (
            <div className="py-20 text-center text-xs text-text-muted space-y-3">
              <RefreshCw className="h-8 w-8 text-primary animate-spin mx-auto" />
              <span>Connecting to local PostgreSQL node...</span>
            </div>
          ) : error ? (
            <div className="py-16 text-center space-y-2">
              <AlertCircle className="h-8 w-8 text-primary mx-auto" />
              <p className="text-xs text-foreground font-semibold">Error retrieving records</p>
              <p className="text-[11px] text-text-muted max-w-md mx-auto">{error}</p>
            </div>
          ) : invoices.length === 0 ? (
            <div className="py-20 text-center space-y-3">
              <Clock className="h-8 w-8 text-zinc-300 mx-auto" />
              <p className="text-xs text-foreground font-semibold">No invoices logged yet</p>
              <p className="text-xs text-text-muted max-w-sm mx-auto">
                Once the WhatsApp bot processes bills or quotes, they will appear here instantly.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-sans">
                <thead className="bg-zinc-50 border-b border-border-subtle text-text-muted uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="p-4">Supplier</th>
                    <th className="p-4">Material / Item</th>
                    <th className="p-4">Amount</th>
                    <th className="p-4">Due Date</th>
                    <th className="p-4">Logged Time</th>
                    <th className="p-4 text-center">Status</th>
                    <th className="p-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-subtle">
                  {invoices.map((inv) => {
                    const isPaid = inv.status === 'paid';
                    return (
                      <tr key={inv.id} className="hover:bg-zinc-50/30 transition-colors">
                        <td className="p-4">
                          <div className="font-semibold text-foreground">{inv.supplierName}</div>
                          <span className="text-[9px] text-text-muted block mt-0.5">ID: #{inv.id}</span>
                        </td>
                        <td className="p-4 text-text-muted font-medium">{inv.materialName}</td>
                        <td className="p-4 font-semibold text-foreground">
                          ₹{inv.amount.toLocaleString('en-IN')}
                        </td>
                        <td className="p-4 text-text-muted">
                          {inv.dueDate ? (
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3.5 w-3.5 text-zinc-400" />
                              {new Date(inv.dueDate).toLocaleDateString('en-IN', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric'
                              })}
                            </span>
                          ) : (
                            <span className="text-zinc-400 font-italic">Not Specified</span>
                          )}
                        </td>
                        <td className="p-4 text-text-muted">
                          {new Date(inv.createdAt).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </td>
                        <td className="p-4 text-center">
                          <button
                            onClick={() => handleToggleStatus(inv.id, inv.status)}
                            className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider cursor-pointer border transition-all ${
                              isPaid
                                ? 'bg-emerald-50 text-emerald-600 border-emerald-200 hover:bg-red-50 hover:text-primary hover:border-red-200'
                                : 'bg-red-50 text-primary border-red-100 hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-200'
                            }`}
                            title={isPaid ? "Click to set Pending" : "Click to set Paid"}
                          >
                            {inv.status}
                          </button>
                        </td>
                        <td className="p-4 text-center">
                          <button
                            onClick={() => handleDeleteInvoice(inv.id)}
                            className="h-8 w-8 rounded-full border border-border-subtle hover:border-primary/30 text-text-muted hover:text-primary flex items-center justify-center transition-all cursor-pointer mx-auto bg-surface"
                            title="Delete Invoice"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>

      {/* Footer */}
      <footer className="py-4 text-center text-xs text-text-muted border-t border-border-subtle bg-surface/50 mt-auto">
        Invoice Ledger Workspace • Offline Node PostgreSQL
      </footer>
    </div>
  );
}
