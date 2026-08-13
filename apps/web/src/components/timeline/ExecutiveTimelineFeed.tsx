"use client";

import React, { useState, useEffect } from 'react';
import { Activity, Clock, CheckCircle2, ShieldAlert } from 'lucide-react';
import { TimelineEntry } from '@/lib/domain/TimelineService';

export const ExecutiveTimelineFeed: React.FC = () => {
  const [timeline, setTimeline] = useState<TimelineEntry[]>([]);

  useEffect(() => {
    fetch('/api/operations')
      .then(res => res.json())
      .then(data => {
        if (data.timeline) setTimeline(data.timeline);
      })
      .catch(() => {});
  }, []);

  return (
    <div className="bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-3xl p-6 space-y-4 shadow-xs">
      <div className="flex justify-between items-center border-b border-[var(--border-subtle)] pb-3">
        <h3 className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider font-display flex items-center gap-2">
          <Clock className="w-4 h-4 text-blue-400" />
          Executive Business Storytelling Timeline
        </h3>
        <span className="text-[10px] font-mono text-[var(--text-muted)]">Live Event Stream</span>
      </div>

      <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
        {timeline.map((item) => (
          <div key={item.id} className="flex items-start gap-3 p-3 bg-[var(--bg-subtle)] border border-[var(--border-subtle)] rounded-2xl">
            <div className="mt-0.5">
              {item.category === 'Event' && <Activity className="w-4 h-4 text-blue-400" />}
              {item.category === 'Tool' && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
              {item.category === 'Approval' && <ShieldAlert className="w-4 h-4 text-amber-400" />}
            </div>

            <div className="flex-1 space-y-0.5">
              <div className="flex justify-between items-center">
                <span className="text-[11px] font-bold text-[var(--text-primary)]">{item.title}</span>
                <span className="text-[9px] font-mono text-[var(--text-muted)]">{item.timestamp}</span>
              </div>
              <p className="text-[10px] text-[var(--text-muted)] font-sans">{item.summary}</p>
              <div className="text-[8px] font-mono text-blue-300/80">Actor: {item.actor}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
