"use client";

import React, { useEffect, useState } from 'react';
import { Sparkles } from 'lucide-react';
import { BusinessStory } from '@/lib/story/BusinessStoryEngine';

export const MorningBriefingCard: React.FC = () => {
  const [stories, setStories] = useState<BusinessStory[]>([]);

  useEffect(() => {
    fetch('/api/operations')
      .then(res => res.json())
      .then(data => {
        if (data.stories) setStories(data.stories);
      })
      .catch(() => {});
  }, []);

  return (
    <div className="bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-3xl p-6 space-y-4 shadow-xs">
      <div className="flex justify-between items-center border-b border-[var(--border-subtle)] pb-3">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <h3 className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider font-display">
            Executive AI CTO Morning Brief Memo
          </h3>
        </div>
        <span className="text-[10px] font-mono text-[var(--text-muted)]">
          {new Date().toLocaleDateString('en-IN', { weekday: 'long', month: 'short', day: 'numeric' })}
        </span>
      </div>

      <div className="space-y-3 font-sans">
        <p className="text-xs text-[var(--text-primary)] leading-relaxed">
          <strong className="text-blue-400">Good Morning, Director.</strong> Overnight your AI Operations Team completed <span className="font-semibold text-emerald-400">5 Procurement Tasks</span>, <span className="font-semibold text-blue-400">2 Pricing Updates</span>, and <span className="font-semibold text-amber-400">4 Collections Follow-ups</span>. Protected <strong className="text-emerald-400">₹82,000</strong> gross margin and prevented 2 stockouts.
        </p>

        <div className="space-y-2 pt-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] block">
            Top Executive Stories & Impact:
          </span>

          {stories.slice(0, 3).map((s) => (
            <div key={s.id} className="bg-[var(--bg-subtle)] p-3 rounded-2xl border border-[var(--border-subtle)] space-y-1">
              <div className="flex justify-between items-center">
                <span className="text-[11px] font-bold text-[var(--text-primary)]">{s.headline}</span>
                <span className="text-[9px] font-mono text-blue-400">{s.sourceActor}</span>
              </div>
              <p className="text-[10px] text-[var(--text-muted)] leading-relaxed">{s.narrative}</p>
              <div className="text-[9px] text-emerald-400 font-semibold mt-1">Impact: {s.businessValue}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
