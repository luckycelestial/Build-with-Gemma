/**
 * ============================================================================
 * MODULE PURPOSE: Procurement Mission Timestamped Timeline Component
 * RESPONSIBILITIES:
 *  - Renders chronological event feed for a specific Procurement Mission.
 * OWNS: Timeline milestone rendering & actor badges.
 * SHOULD NOT OWN: State transitions or API calls.
 * ============================================================================
 */

"use client";

import React from 'react';
import { Clock, CheckCircle2, User, Sparkles } from 'lucide-react';
import { MissionMilestone } from '../types/mission';

interface ProcurementMissionTimelineProps {
  timeline: MissionMilestone[];
}

export const ProcurementMissionTimeline: React.FC<ProcurementMissionTimelineProps> = ({ timeline }) => {
  return (
    <div className="bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-3xl p-5 shadow-xs">
      <div className="flex items-center gap-2 border-b border-[var(--border-subtle)] pb-3 mb-4">
        <div className="w-7 h-7 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
          <Clock size={15} />
        </div>
        <div>
          <h3 className="text-sm font-bold text-[var(--text-primary)] font-display">
            Mission Timeline & Audit Trail
          </h3>
          <p className="text-[10px] text-[var(--text-muted)]">
            Real-time chronological milestone progression
          </p>
        </div>
      </div>

      <div className="relative pl-6 space-y-4 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-[var(--border-subtle)]">
        {timeline.map((item, idx) => (
          <div key={idx} className="relative flex items-start gap-3 text-xs">
            <span className="absolute -left-6 top-0.5 w-5 h-5 rounded-full bg-[var(--bg-card)] border border-[var(--primary)] text-[var(--primary)] flex items-center justify-center text-[10px]">
              <CheckCircle2 size={12} />
            </span>
            <div className="flex-1 bg-[var(--bg-subtle)] p-3 rounded-2xl border border-[var(--border-subtle)]">
              <div className="flex items-center justify-between gap-2 mb-1">
                <span className="font-bold text-[var(--text-primary)] font-mono">
                  {item.stage.replace(/_/g, ' ')}
                </span>
                <span className="text-[10px] text-[var(--text-muted)] font-mono">{item.timestamp}</span>
              </div>
              <p className="text-xs text-[var(--text-primary)] leading-relaxed">{item.text}</p>
              <div className="mt-2 flex items-center gap-1 text-[10px] text-[var(--primary)] font-bold">
                {item.actor === 'ExecutiveCTO' ? <Sparkles size={10} /> : <User size={10} />}
                <span>Actor: {item.actor}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
