/**
 * ============================================================================
 * MODULE PURPOSE: Executive Procurement Business Story Feed Component
 * RESPONSIBILITIES:
 *  - Converts raw technical inventory & procurement events into executive business narratives.
 *  - Highlights financial impact: downtime prevented, gross margin protected, and cost savings.
 * OWNS: Executive business story cards.
 * SHOULD NOT OWN: Low-level data parsing.
 * ============================================================================
 */

"use client";

import React from 'react';
import { BookOpen, Sparkles, TrendingUp, ShieldCheck, DollarSign } from 'lucide-react';

export const ProcurementBusinessStoryFeed: React.FC = () => {
  const stories = [
    {
      id: 'story-1',
      title: 'Inventory Replenishment & Production Downtime Avoidance',
      category: 'Inventory Replenishment',
      impact: 'Saved ~₹82,000 in idle labor & machine downtime costs',
      summary: 'Inventory for Solid Carbide End Mills 12mm dropped below safety stock threshold. Procurement AI initiated Mission PROC-839052. Dispatched RFQs to 3 registered suppliers via WhatsApp Gateway. Jigani Tooling Labs Ltd was selected due to the optimal balance of unit cost (₹4,200), 2-day delivery lead time, and 96% reliability rating. 1-Click PO sign-off was executed, goods were received defect-free, inventory was replenished to 17 units (OPTIMAL), and supplier performance records were updated.',
      timestamp: '10 mins ago',
      badge: 'Mission Completed'
    },
    {
      id: 'story-2',
      title: 'Supplier Lead-Time Compliance Rating Boosted',
      category: 'Vendor Optimization',
      impact: 'Reliability rating increased from 94% to 96%',
      summary: 'Jigani Tooling Labs Ltd successfully delivered PO-813099 in 48 hours without quality defects. ProcurementWorker automatically updated supplier reliability score to 96% and order fulfillment success rate to 100%.',
      timestamp: '2 hours ago',
      badge: 'Rating Updated'
    }
  ];

  return (
    <div className="bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-3xl p-6 shadow-xs space-y-4">
      <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
            <BookOpen size={15} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[var(--text-primary)] font-display">
              Executive Business Story Feed
            </h3>
            <p className="text-[10px] text-[var(--text-muted)]">
              AI-generated executive narratives converting operational events into financial impact
            </p>
          </div>
        </div>
        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/20">
          Executive Briefing
        </span>
      </div>

      <div className="space-y-3">
        {stories.map(s => (
          <div key={s.id} className="p-4 rounded-2xl bg-[var(--bg-subtle)] border border-[var(--border-subtle)] space-y-2">
            <div className="flex justify-between items-start gap-2">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-md bg-[var(--primary-subtle)] text-[var(--primary)] text-[9px] font-bold uppercase tracking-wider">
                  {s.category}
                </span>
                <span className="text-xs font-bold text-[var(--text-primary)] font-display">
                  {s.title}
                </span>
              </div>
              <span className="text-[10px] text-[var(--text-muted)] flex-shrink-0">{s.timestamp}</span>
            </div>

            <p className="text-xs text-[var(--text-muted)] leading-relaxed font-sans">
              {s.summary}
            </p>

            <div className="flex items-center justify-between text-[11px] pt-1 border-t border-[var(--border-subtle)]/50">
              <span className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                <Sparkles size={12} />
                {s.impact}
              </span>
              <span className="text-[10px] font-bold text-[var(--text-muted)]">
                Status: <span className="text-emerald-500">{s.badge}</span>
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
