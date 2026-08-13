"use client";

import React from 'react';
import Link from 'next/link';
import { 
  LuShieldAlert, 
  LuTrendingUp, 
  LuArrowRight, 
  LuCircleCheck, 
  LuSparkles,
  LuTag,
  LuWallet,
  LuBoxes,
  LuGlobe,
  LuInfo
} from 'react-icons/lu';
import { AgentCollaborationBadge } from './AgentCollaborationBadge';

interface CriticalDecisionsSectionProps {
  data: any;
}

export const CriticalDecisionsSection: React.FC<CriticalDecisionsSectionProps> = ({ data }) => {
  return (
    <div className="space-y-8">
      
      {/* SECTION 1: CRITICAL DECISIONS */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-2">
          <h3 className="font-display font-black text-sm sm:text-base text-rose-500 flex items-center gap-2">
            <LuShieldAlert size={18} className="animate-pulse" />
            <span>Critical Decisions (Requires Immediate Approval)</span>
          </h3>
          <span className="text-[10px] font-black uppercase tracking-wider text-[var(--text-muted)] bg-rose-500/10 text-rose-500 px-2.5 py-0.5 rounded-full border border-rose-500/20">
            2 Urgent Actions
          </span>
        </div>

        <div className="grid grid-cols-1 gap-4">
          
          {/* Critical Decision 1: Price Pass-Through */}
          <div className="p-5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-subtle)] hover:border-[var(--primary)]/40 transition-all shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-md bg-rose-500/10 text-rose-500 text-[10px] font-black uppercase tracking-wider">
                    Price Adjustment
                  </span>
                  <span className="text-xs text-[var(--text-muted)] font-bold">Material: Aluminium Alloy 6061-T6</span>
                </div>
                <h4 className="font-display font-black text-base text-[var(--text-primary)]">
                  Execute +4.8% Steel & Material Inflation Surcharge
                </h4>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-right">
                  <span className="block text-xs font-black text-emerald-500 font-display">+₹85,000 / month</span>
                  <span className="block text-[10px] text-[var(--text-muted)]">Margin Recovery</span>
                </div>
                <Link
                  href="/pricing-agent?highlight=rec-101"
                  className="px-4 py-2 bg-[var(--primary)] hover:bg-[var(--primary-dark)] text-white text-xs font-bold rounded-xl transition-all shadow-xs flex items-center gap-1.5 shrink-0"
                >
                  <span>Open Pricing Workspace</span>
                  <LuArrowRight size={14} />
                </Link>
              </div>
            </div>

            <p className="text-xs text-[var(--text-muted)] leading-relaxed">
              Domestic aluminium ingot quotes in Bengaluru Peenya cluster surged 6.3% over the past 14 days. Passing through a +4.8% surcharge on 2 major auto ancillary contracts restores the operating margin corridor from 11.2% back to 16.5%.
            </p>

            {/* Agent Collaboration Proof */}
            <AgentCollaborationBadge 
              agents={[
                { name: 'Market Intelligence', role: 'Flagged +6.3% Peenya aluminium spot price surge' },
                { name: 'Pricing Agent', role: 'Calculated margin compression to 11.2%' },
                { name: 'Revenue Intelligence', role: 'Estimated +₹85K/mo margin protection' }
              ]}
            />
          </div>

          {/* Critical Decision 2: Overdue AR Collections */}
          <div className="p-5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-subtle)] hover:border-[var(--primary)]/40 transition-all shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-md bg-purple-500/10 text-purple-500 text-[10px] font-black uppercase tracking-wider">
                    Accounts Receivable
                  </span>
                  <span className="text-xs text-[var(--text-muted)] font-bold">Client: ABC Industries</span>
                </div>
                <h4 className="font-display font-black text-base text-[var(--text-primary)]">
                  Execute Formal Collections Outreach for ₹3,80,000 Overdue
                </h4>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-right">
                  <span className="block text-xs font-black text-rose-500 font-display">38 Days Overdue</span>
                  <span className="block text-[10px] text-[var(--text-muted)]">4 Delayed Invoices</span>
                </div>
                <Link
                  href="/collections-agent?customer=cust_abc"
                  className="px-4 py-2 bg-[var(--primary)] hover:bg-[var(--primary-dark)] text-white text-xs font-bold rounded-xl transition-all shadow-xs flex items-center gap-1.5 shrink-0"
                >
                  <span>Open Collections Workspace</span>
                  <LuArrowRight size={14} />
                </Link>
              </div>
            </div>

            <p className="text-xs text-[var(--text-muted)] leading-relaxed">
              ABC Industries ledger balance has reached ₹3.8 Lakh with an average delay of 38 days across 4 invoices. Automated outreach draft (Email + WhatsApp) is compiled and ready for approval.
            </p>

            {/* Agent Collaboration Proof */}
            <AgentCollaborationBadge 
              agents={[
                { name: 'Customer Intelligence', role: 'Identified payment delay exceeding 30-day threshold' },
                { name: 'Collections Agent', role: 'Compiled tailored multi-channel reminder draft' },
                { name: 'Revenue Intelligence', role: 'Assessed liquidity risk on cash buffer' }
              ]}
            />
          </div>

        </div>
      </div>


      {/* SECTION 2: NEEDS ATTENTION */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-2">
          <h3 className="font-display font-black text-sm sm:text-base text-amber-500 flex items-center gap-2">
            <LuShieldAlert size={18} />
            <span>Needs Attention (Operational & Supplier Alerts)</span>
          </h3>
          <span className="text-[10px] font-black uppercase tracking-wider text-[var(--text-muted)] bg-amber-500/10 text-amber-500 px-2.5 py-0.5 rounded-full border border-amber-500/20">
            2 Alerts
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* Alert 1: Inventory Depletion */}
          <div className="p-4 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-subtle)] space-y-3 shadow-xs">
            <div className="flex items-start justify-between">
              <div className="space-y-0.5">
                <span className="text-[10px] font-bold uppercase text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-md">
                  Inventory Depletion
                </span>
                <h5 className="font-display font-bold text-sm text-[var(--text-primary)]">
                  Solid Carbide End Mills (12mm)
                </h5>
              </div>
              <span className="text-xs font-black text-amber-500">4 Units Left</span>
            </div>
            <p className="text-xs text-[var(--text-muted)] leading-relaxed">
              Consumable stock will last only 4 days under current 4-axis milling cell utilization rate.
            </p>
            <div className="pt-2 flex items-center justify-between border-t border-[var(--border-subtle)]">
              <span className="text-[10px] text-[var(--text-muted)] font-bold">Generated by Supplier Agent + Pricing Agent</span>
              <Link href="/supplier-agent" className="text-xs font-bold text-[var(--primary)] hover:underline flex items-center gap-1">
                <span>Open Supplier Workspace</span>
                <LuArrowRight size={12} />
              </Link>
            </div>
          </div>

          {/* Alert 2: Steel Price Inflation Watch */}
          <div className="p-4 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-subtle)] space-y-3 shadow-xs">
            <div className="flex items-start justify-between">
              <div className="space-y-0.5">
                <span className="text-[10px] font-bold uppercase text-blue-500 bg-blue-500/10 px-2 py-0.5 rounded-md">
                  Market Inflation Watch
                </span>
                <h5 className="font-display font-bold text-sm text-[var(--text-primary)]">
                  Mild Steel Rods Index +4.1%
                </h5>
              </div>
              <span className="text-xs font-black text-blue-500">Index 138.4</span>
            </div>
            <p className="text-xs text-[var(--text-muted)] leading-relaxed">
              Iron ore supply constraints in Karnataka have triggered +4.1% quote hikes across Peenya distributors.
            </p>
            <div className="pt-2 flex items-center justify-between border-t border-[var(--border-subtle)]">
              <span className="text-[10px] text-[var(--text-muted)] font-bold">Generated by Market Intelligence Agent</span>
              <Link href="/market-intelligence" className="text-xs font-bold text-[var(--primary)] hover:underline flex items-center gap-1">
                <span>Open Market Workspace</span>
                <LuArrowRight size={12} />
              </Link>
            </div>
          </div>

        </div>
      </div>


      {/* SECTION 3: OPPORTUNITIES */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-2">
          <h3 className="font-display font-black text-sm sm:text-base text-emerald-500 flex items-center gap-2">
            <LuTrendingUp size={18} />
            <span>Strategic Opportunities (Expansion & Savings)</span>
          </h3>
        </div>

        <div className="p-4 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-subtle)] space-y-3 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <span className="text-[10px] font-bold uppercase text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-md">
                EV Ancillary Demand
              </span>
              <h5 className="font-display font-bold text-sm text-[var(--text-primary)] mt-1">
                EV Battery Housing Aluminum Machining Contract
              </h5>
            </div>
            <Link href="/what-if-simulator" className="px-3 py-1.5 bg-[var(--bg-subtle)] hover:bg-[var(--bg-card-hover)] border border-[var(--border-subtle)] text-[var(--text-primary)] text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 w-fit">
              <span>Simulate Margin Impact</span>
              <LuArrowRight size={12} />
            </Link>
          </div>
          <p className="text-xs text-[var(--text-muted)] leading-relaxed">
            Reallocating 1 CNC milling cell to EV battery aluminum housing prototypes offers a +22% higher hourly billing rate compared to standard mild steel turnings.
          </p>
          <div className="pt-2 border-t border-[var(--border-subtle)] flex items-center justify-between text-[10px] text-[var(--text-muted)] font-bold">
            <span>Collaborating Agents: Market Intelligence + Executive Advisor</span>
            <Link href="/executive-advisor" className="text-[var(--primary)] hover:underline">View Roadmap</Link>
          </div>
        </div>
      </div>

    </div>
  );
};
