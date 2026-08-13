"use client";

import React from 'react';
import { 
  LuTrendingUp, 
  LuPercent, 
  LuBoxes, 
  LuWallet, 
  LuShieldAlert, 
  LuActivity 
} from 'react-icons/lu';

interface BusinessSnapshotBarProps {
  data: any;
}

export const BusinessSnapshotBar: React.FC<BusinessSnapshotBarProps> = ({ data }) => {
  const revenue = data?.kpis?.avg_monthly_revenue_lakh || 18.6;
  const revenueChange = data?.kpis?.revenue_change_pct || 6.3;
  const marginScore = 12.4;
  const marginVariance = -4.2;
  const inventoryHealth = "Low Stock Alert (1 Tool)";
  const arDelay = "24.1 Days Avg Delay";
  const marketRisk = "Medium (Steel +4.1%)";

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-black uppercase tracking-widest text-[var(--text-muted)] font-display flex items-center gap-1.5">
          <LuActivity size={14} className="text-[var(--primary)] animate-pulse" />
          <span>📊 Business Snapshot & Factory Health Pulse</span>
        </h3>
        <span className="text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
          Factory Status: Operational & Stable
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* Metric 1: Revenue Trend */}
        <div className="p-3.5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-subtle)] space-y-1 shadow-2xs hover:border-[var(--primary)]/30 transition-all">
          <div className="flex items-center justify-between text-[10px] font-bold text-[var(--text-muted)] uppercase">
            <span>Revenue Trend</span>
            <LuTrendingUp className="text-emerald-500" size={14} />
          </div>
          <div className="text-base font-black font-display text-[var(--text-primary)]">
            ₹{revenue}L <span className="text-[10px] text-emerald-500 font-bold">+{revenueChange}%</span>
          </div>
          <p className="text-[10px] text-[var(--text-muted)] truncate">Weekly Average</p>
        </div>

        {/* Metric 2: Margin Status */}
        <div className="p-3.5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-subtle)] space-y-1 shadow-2xs hover:border-[var(--primary)]/30 transition-all">
          <div className="flex items-center justify-between text-[10px] font-bold text-[var(--text-muted)] uppercase">
            <span>Gross Margin</span>
            <LuPercent className="text-amber-500" size={14} />
          </div>
          <div className="text-base font-black font-display text-[var(--text-primary)]">
            {marginScore}% <span className="text-[10px] text-rose-500 font-bold">{marginVariance}%</span>
          </div>
          <p className="text-[10px] text-[var(--text-muted)] truncate">Compressed by raw materials</p>
        </div>

        {/* Metric 3: Inventory Health */}
        <div className="p-3.5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-subtle)] space-y-1 shadow-2xs hover:border-[var(--primary)]/30 transition-all">
          <div className="flex items-center justify-between text-[10px] font-bold text-[var(--text-muted)] uppercase">
            <span>Inventory Health</span>
            <LuBoxes className="text-amber-500" size={14} />
          </div>
          <div className="text-sm font-black font-display text-amber-500 truncate">
            4 Units Left
          </div>
          <p className="text-[10px] text-[var(--text-muted)] truncate">Carbide End Mills (4 days)</p>
        </div>

        {/* Metric 4: Outstanding Collections */}
        <div className="p-3.5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-subtle)] space-y-1 shadow-2xs hover:border-[var(--primary)]/30 transition-all">
          <div className="flex items-center justify-between text-[10px] font-bold text-[var(--text-muted)] uppercase">
            <span>AR Collections</span>
            <LuWallet className="text-purple-500" size={14} />
          </div>
          <div className="text-base font-black font-display text-[var(--text-primary)]">
            ₹3.8L <span className="text-[10px] text-rose-500 font-bold">Late</span>
          </div>
          <p className="text-[10px] text-[var(--text-muted)] truncate">ABC Industries (38 days)</p>
        </div>

        {/* Metric 5: Market Risk */}
        <div className="p-3.5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-subtle)] space-y-1 shadow-2xs hover:border-[var(--primary)]/30 transition-all">
          <div className="flex items-center justify-between text-[10px] font-bold text-[var(--text-muted)] uppercase">
            <span>Market Index</span>
            <LuShieldAlert className="text-amber-500" size={14} />
          </div>
          <div className="text-sm font-black font-display text-[var(--text-primary)] truncate">
            Steel Index 138
          </div>
          <p className="text-[10px] text-rose-500 font-semibold truncate">+4.1% Peenya cluster surge</p>
        </div>

        {/* Metric 6: Overall Status */}
        <div className="p-3.5 rounded-2xl bg-[var(--bg-card)] border border-[var(--primary)]/30 bg-[var(--primary-subtle)]/10 space-y-1 shadow-2xs">
          <div className="flex items-center justify-between text-[10px] font-bold text-[var(--primary)] uppercase">
            <span>AI CTO Guard</span>
            <LuActivity className="text-[var(--primary)] animate-pulse" size={14} />
          </div>
          <div className="text-sm font-black font-display text-[var(--primary)]">
            3 Actions Ready
          </div>
          <p className="text-[10px] text-[var(--text-muted)] truncate">Review decisions below</p>
        </div>
      </div>
    </div>
  );
};
