"use client";

import React, { useState } from 'react';
import { 
  Sparkles, 
  CheckCircle2, 
  ArrowRight, 
  MessageSquare, 
  Upload, 
  Coins,
  DollarSign,
  Package,
  BookOpen
} from 'lucide-react';
import { DashboardData } from '@/api-client/api';
import { useBusinessData } from '@/context/BusinessDataContext';

interface BeginnerHomeProps {
  data: DashboardData;
  onOpenChat: () => void;
  onTriggerUpload: () => void;
}

export const BeginnerHome: React.FC<BeginnerHomeProps> = ({ data, onOpenChat, onTriggerUpload }) => {
  const { handleExplain } = useBusinessData();
  const [completedActions, setCompletedActions] = useState<Record<string, boolean>>({});

  const toggleAction = (id: string) => {
    setCompletedActions(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto font-sans animate-fade-in text-[var(--text-primary)]">
      
      {/* 1. Gemma Weekly Summary Card */}
      <div className="p-6 rounded-3xl bg-[var(--primary-subtle)] border border-[var(--primary)]/20 shadow-xs relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-[var(--primary)] uppercase tracking-wider font-display">
              <Sparkles size={16} className="animate-pulse" />
              <span>Gemma Weekly Advisory &mdash; Beginner Mode</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-[var(--text-primary)] tracking-tight font-display">
              Welcome back, Suresh Kumar
            </h2>
            <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed max-w-2xl font-medium">
              &ldquo;Steel costs increased this week and two customers have delayed payments. Focus on adjusting prices for new orders and following up on pending receivables today.&rdquo;
            </p>
          </div>

          <button
            onClick={onOpenChat}
            className="flex-shrink-0 px-4 py-2.5 bg-[var(--primary)] hover:bg-[var(--primary-dark)] text-white rounded-full text-xs font-bold transition-all shadow-xs flex items-center gap-2 cursor-pointer"
          >
            <MessageSquare size={14} />
            <span>Ask Gemma</span>
          </button>
        </div>
      </div>

      {/* 2. Top 3 Recommended Action Cards */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-black text-[var(--text-primary)] font-display flex items-center gap-2">
              <span className="w-5 h-5 bg-[var(--primary-subtle)] text-[var(--primary)] rounded-full flex items-center justify-center text-xs font-bold">3</span>
              What To Do This Week
            </h3>
            <p className="text-xs text-[var(--text-muted)]">Ranked by direct margin and cash impact</p>
          </div>
          <span className="text-xs font-bold text-[var(--text-muted)]">3 Priority Items</span>
        </div>

        <div className="grid grid-cols-1 gap-4">
          
          {/* Action Card 1: Pricing */}
          <div className={`p-5 rounded-3xl border transition-all ${
            completedActions['action1'] 
              ? 'bg-[var(--bg-subtle)] border-emerald-500/30 opacity-75' 
              : 'bg-[var(--bg-card)] border-[var(--border-subtle)] shadow-xs'
          }`}>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div className="flex items-start gap-3.5">
                <div className="p-3 bg-amber-500/15 text-amber-600 dark:text-amber-400 rounded-2xl flex-shrink-0 mt-0.5">
                  <Coins size={20} />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/20 uppercase font-sans">High Priority</span>
                    <span className="text-xs text-[var(--text-muted)] font-bold font-sans">Pricing Action</span>
                  </div>
                  <h4 className="font-black text-sm text-[var(--text-primary)] font-display">
                    Increase Product A pricing by 3% for new orders
                  </h4>
                  <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                    Steel prices jumped 11% this month. A 3% price adjustment protects your CNC machining margin without affecting price-sensitive accounts.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-center flex-shrink-0 pt-2 sm:pt-0">
                <button
                  onClick={() => handleExplain('pricing')}
                  className="px-3 py-1.5 bg-[var(--bg-subtle)] text-[var(--text-primary)] hover:bg-[var(--bg-card-hover)] text-xs font-bold rounded-full transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <BookOpen size={13} />
                  <span>Why</span>
                </button>
                <button
                  onClick={() => toggleAction('action1')}
                  className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    completedActions['action1']
                      ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                      : 'bg-[var(--primary)] text-white shadow-xs hover:bg-[var(--primary-dark)]'
                  }`}
                >
                  <CheckCircle2 size={13} />
                  <span>{completedActions['action1'] ? 'Completed' : 'Accept Action'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Action Card 2: Cash Collections */}
          <div className={`p-5 rounded-3xl border transition-all ${
            completedActions['action2'] 
              ? 'bg-[var(--bg-subtle)] border-emerald-500/30 opacity-75' 
              : 'bg-[var(--bg-card)] border-[var(--border-subtle)] shadow-xs'
          }`}>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div className="flex items-start gap-3.5">
                <div className="p-3 bg-blue-500/15 text-blue-600 dark:text-blue-400 rounded-2xl flex-shrink-0 mt-0.5">
                  <DollarSign size={20} />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/20 uppercase font-sans">High Priority</span>
                    <span className="text-xs text-[var(--text-muted)] font-bold font-sans">Collections Follow-up</span>
                  </div>
                  <h4 className="font-black text-sm text-[var(--text-primary)] font-display">
                    Follow up with ABC Industries on overdue payment (₹2.4 Lakh)
                  </h4>
                  <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                    ABC Industries has payment delays rising to 18 days with 3 overdue invoices. Send a payment reminder before month end.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-center flex-shrink-0 pt-2 sm:pt-0">
                <button
                  onClick={() => handleExplain('collections')}
                  className="px-3 py-1.5 bg-[var(--bg-subtle)] text-[var(--text-primary)] hover:bg-[var(--bg-card-hover)] text-xs font-bold rounded-full transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <BookOpen size={13} />
                  <span>Why</span>
                </button>
                <button
                  onClick={() => toggleAction('action2')}
                  className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    completedActions['action2']
                      ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                      : 'bg-[var(--primary)] text-white shadow-xs hover:bg-[var(--primary-dark)]'
                  }`}
                >
                  <CheckCircle2 size={13} />
                  <span>{completedActions['action2'] ? 'Completed' : 'Remind Client'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Action Card 3: Inventory */}
          <div className={`p-5 rounded-3xl border transition-all ${
            completedActions['action3'] 
              ? 'bg-[var(--bg-subtle)] border-emerald-500/30 opacity-75' 
              : 'bg-[var(--bg-card)] border-[var(--border-subtle)] shadow-xs'
          }`}>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div className="flex items-start gap-3.5">
                <div className="p-3 bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 rounded-2xl flex-shrink-0 mt-0.5">
                  <Package size={20} />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[var(--bg-subtle)] text-[var(--text-muted)] border border-[var(--border-subtle)] uppercase font-sans">Medium Priority</span>
                    <span className="text-xs text-[var(--text-muted)] font-bold font-sans">CNC Tooling Stock</span>
                  </div>
                  <h4 className="font-black text-sm text-[var(--text-primary)] font-display">
                    Restock Carbide Insert Cutters (+20 pcs)
                  </h4>
                  <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                    Carbide insert stock has dropped to 4 pcs (minimum safe threshold is 10 pcs). Restock to avoid CNC spindle downtime.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-center flex-shrink-0 pt-2 sm:pt-0">
                <button
                  onClick={() => handleExplain('inventory')}
                  className="px-3 py-1.5 bg-[var(--bg-subtle)] text-[var(--text-primary)] hover:bg-[var(--bg-card-hover)] text-xs font-bold rounded-full transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <BookOpen size={13} />
                  <span>Why</span>
                </button>
                <button
                  onClick={() => toggleAction('action3')}
                  className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    completedActions['action3']
                      ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                      : 'bg-[var(--primary)] text-white shadow-xs hover:bg-[var(--primary-dark)]'
                  }`}
                >
                  <CheckCircle2 size={13} />
                  <span>{completedActions['action3'] ? 'Completed' : 'Order Stock'}</span>
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* 3. Simple Business Health Strip */}
      <div className="p-5 bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-3xl shadow-xs space-y-3">
        <h4 className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider font-display">Business Health Summary</h4>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          
          <div className="p-3.5 rounded-2xl bg-[var(--bg-subtle)] border border-[var(--border-subtle)] space-y-1">
            <div className="flex justify-between items-center text-xs">
              <span className="text-[var(--text-muted)] font-medium">Cash Flow Risk</span>
              <span className="font-bold text-amber-600 dark:text-amber-400">Medium Risk</span>
            </div>
            <p className="text-[11px] text-[var(--text-muted)]">2 customer payments delayed</p>
          </div>

          <div className="p-3.5 rounded-2xl bg-[var(--bg-subtle)] border border-[var(--border-subtle)] space-y-1">
            <div className="flex justify-between items-center text-xs">
              <span className="text-[var(--text-muted)] font-medium">Monthly Revenue</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400">₹{data.kpis.avg_monthly_revenue_lakh} Lakh</span>
            </div>
            <p className="text-[11px] text-[var(--text-muted)]">Healthy +6.3% growth trend</p>
          </div>

          <div className="p-3.5 rounded-2xl bg-[var(--bg-subtle)] border border-[var(--border-subtle)] space-y-1">
            <div className="flex justify-between items-center text-xs">
              <span className="text-[var(--text-muted)] font-medium">Active Accounts</span>
              <span className="font-bold text-blue-600 dark:text-blue-400">{data.customer_intelligence.active_customers} Clients</span>
            </div>
            <p className="text-[11px] text-[var(--text-muted)]">Top 3 accounts = {data.customer_intelligence.revenue_concentration_pct}% share</p>
          </div>

        </div>
      </div>

      {/* 4. Guided CTAs */}
      <div className="flex flex-col sm:flex-row gap-3 pt-2">
        <button
          onClick={onOpenChat}
          className="flex-1 p-4 rounded-2xl border border-[var(--primary)]/20 bg-[var(--primary-subtle)] hover:bg-[var(--primary)] hover:text-white text-[var(--primary)] transition-all flex items-center justify-between font-bold text-xs cursor-pointer"
        >
          <div className="flex items-center gap-2.5">
            <MessageSquare size={18} />
            <span>Ask Gemma Any Business Question</span>
          </div>
          <ArrowRight size={16} />
        </button>

        <button
          onClick={onTriggerUpload}
          className="flex-1 p-4 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-card)] hover:bg-[var(--bg-card-hover)] transition-all flex items-center justify-between font-bold text-xs cursor-pointer text-[var(--text-primary)]"
        >
          <div className="flex items-center gap-2.5">
            <Upload size={18} className="text-[var(--text-muted)]" />
            <span>Upload New Excel or Invoice File</span>
          </div>
          <ArrowRight size={16} className="text-[var(--text-muted)]" />
        </button>
      </div>

    </div>
  );
};

export default BeginnerHome;
