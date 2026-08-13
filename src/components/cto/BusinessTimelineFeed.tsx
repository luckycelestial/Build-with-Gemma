"use client";

import React from 'react';
import Link from 'next/link';
import { 
  LuHistory, 
  LuMessageSquare, 
  LuFileText, 
  LuGlobe, 
  LuArrowRight,
  LuSparkles
} from 'react-icons/lu';
import { useExecutiveContext } from '@/context/ExecutiveContextProvider';

export const BusinessTimelineFeed: React.FC = () => {
  const { events } = useExecutiveContext();

  const getSourceIcon = (source: string) => {
    switch (source) {
      case 'WhatsApp':
        return <LuMessageSquare className="text-emerald-500" size={14} />;
      case 'PDF Scanner':
        return <LuFileText className="text-blue-500" size={14} />;
      case 'Market Feed':
        return <LuGlobe className="text-purple-500" size={14} />;
      default:
        return <LuSparkles className="text-[var(--primary)]" size={14} />;
    }
  };

  return (
    <div className="space-y-4 pt-4 border-t border-[var(--border-subtle)]">
      <div className="flex items-center justify-between">
        <h3 className="font-display font-black text-sm sm:text-base text-[var(--text-primary)] flex items-center gap-2">
          <LuHistory size={18} className="text-[var(--primary)] animate-pulse" />
          <span>Business Timeline (Live Input Channel Stream)</span>
        </h3>
        <span className="text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
          WhatsApp & Inputs Connected
        </span>
      </div>

      <div className="space-y-2.5">
        {events.length === 0 ? (
          <div className="text-xs text-[var(--text-muted)] italic py-4">No recent inputs logged.</div>
        ) : (
          events.slice(0, 5).map((evt) => (
            <div 
              key={evt.id} 
              className="p-3.5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-subtle)] hover:border-[var(--primary)]/30 transition-all flex items-start justify-between gap-3 shadow-2xs"
            >
              <div className="flex items-start gap-3 min-w-0">
                <div className="p-2 rounded-xl bg-[var(--bg-subtle)] mt-0.5 shrink-0">
                  {getSourceIcon(evt.source)}
                </div>
                <div className="space-y-0.5 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black uppercase tracking-wider text-[var(--text-muted)]">
                      {evt.timestamp}
                    </span>
                    <span className="px-2 py-0.2 rounded-md bg-[var(--primary-subtle)] text-[var(--primary)] text-[10px] font-bold">
                      {evt.source}
                    </span>
                  </div>
                  <p className="text-xs font-bold text-[var(--text-primary)] truncate">
                    {evt.summary}
                  </p>
                </div>
              </div>

              {evt.deepLink && (
                <Link 
                  href={evt.deepLink}
                  className="text-xs font-bold text-[var(--primary)] hover:underline shrink-0 flex items-center gap-1 mt-1"
                >
                  <span>Investigate</span>
                  <LuArrowRight size={12} />
                </Link>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
