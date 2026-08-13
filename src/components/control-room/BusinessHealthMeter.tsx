"use client";

import React from 'react';
import { ShieldCheck, TrendingUp, DollarSign, Clock, AlertTriangle } from 'lucide-react';

export const BusinessHealthMeter: React.FC = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      {/* 1. Composite Business Health Score */}
      <div className="bg-gradient-to-br from-blue-900/30 via-indigo-900/20 to-purple-900/30 border border-blue-500/30 rounded-3xl p-5 space-y-2 shadow-xs">
        <div className="flex justify-between items-center text-[10px] uppercase font-bold text-blue-300 tracking-wider">
          <span>AI Health Score</span>
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
        </div>

        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-black text-white font-display">94</span>
          <span className="text-xs text-emerald-400 font-bold">/ 100</span>
        </div>

        <p className="text-[10px] text-blue-200/80 font-sans leading-tight">
          Optimal operating status. Gross margin protected &gt;= 16.5%. Zero stockout risk.
        </p>
      </div>

      {/* 2. Today's Financial Impact */}
      <div className="bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-3xl p-5 space-y-2 shadow-xs">
        <div className="flex justify-between items-center text-[10px] uppercase font-bold text-[var(--text-muted)] tracking-wider">
          <span>Financial Savings Today</span>
          <DollarSign className="w-4 h-4 text-emerald-400" />
        </div>

        <div className="text-3xl font-black text-[var(--text-primary)] font-display">
          ₹82,000
        </div>

        <p className="text-[10px] text-emerald-400 font-sans font-medium">
          Saved via automated steel surcharge pass-through.
        </p>
      </div>

      {/* 3. Stockouts Prevented */}
      <div className="bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-3xl p-5 space-y-2 shadow-xs">
        <div className="flex justify-between items-center text-[10px] uppercase font-bold text-[var(--text-muted)] tracking-wider">
          <span>Stockouts Prevented</span>
          <AlertTriangle className="w-4 h-4 text-amber-400" />
        </div>

        <div className="text-3xl font-black text-[var(--text-primary)] font-display">
          2 Incidents
        </div>

        <p className="text-[10px] text-[var(--text-muted)] font-sans">
          Tooling safety stock auto-replenished via RFQs.
        </p>
      </div>

      {/* 4. Manual Hours Saved */}
      <div className="bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-3xl p-5 space-y-2 shadow-xs">
        <div className="flex justify-between items-center text-[10px] uppercase font-bold text-[var(--text-muted)] tracking-wider">
          <span>Manual Hours Saved</span>
          <Clock className="w-4 h-4 text-blue-400" />
        </div>

        <div className="text-3xl font-black text-[var(--text-primary)] font-display">
          14.5 Hours
        </div>

        <p className="text-[10px] text-blue-400 font-sans font-medium">
          Automated collection letters & quote parsing.
        </p>
      </div>
    </div>
  );
};
