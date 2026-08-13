"use client";

import React from 'react';
import { 
  LuSparkles, 
  LuBuilding2, 
  LuClock, 
  LuCircleCheck, 
  LuArrowUpRight 
} from 'react-icons/lu';
import { BusinessSnapshotBar } from './BusinessSnapshotBar';
import { CriticalDecisionsSection } from './CriticalDecisionsSection';
import { BusinessTimelineFeed } from '../cto/BusinessTimelineFeed';
import { useBusinessData } from '@/context/BusinessDataContext';

export const ExecutiveBriefing: React.FC = () => {
  const { data } = useBusinessData();

  const businessName = data?.summary?.business_name || "Meenakshi Precision Components";
  const location = data?.summary?.location || "Peenya, Bengaluru";
  const currentDate = new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      
      {/* 1. EXECUTIVE BRIEFING HERO BANNER */}
      <div className="relative overflow-hidden p-6 md:p-8 rounded-3xl bg-gradient-to-br from-[var(--bg-card)] via-[var(--bg-card)] to-[var(--primary-subtle)]/20 border border-[var(--border-subtle)] shadow-sm space-y-4">
        
        {/* Subtle decorative glow */}
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-[var(--primary)]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-[var(--primary)]/10 text-[var(--primary)] text-[11px] font-black uppercase tracking-wider border border-[var(--primary)]/20 flex items-center gap-1.5">
                <LuSparkles size={12} className="animate-pulse" />
                Daily Executive AI CTO Briefing
              </span>
              <span className="text-xs text-[var(--text-muted)] font-bold flex items-center gap-1">
                <LuClock size={12} />
                {currentDate}
              </span>
            </div>

            <h1 className="text-xl md:text-2xl font-black font-display text-[var(--text-primary)] tracking-tight">
              Good Morning, Factory Leadership.
            </h1>
            <p className="text-xs text-[var(--text-muted)] max-w-2xl leading-relaxed">
              Here is your 60-second AI CTO briefing for <strong className="text-[var(--text-primary)]">{businessName}</strong> ({location}). Today your factory requires attention in 3 core areas.
            </p>
          </div>

          <div className="shrink-0 p-3 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-subtle)] space-y-1 text-right shadow-2xs">
            <div className="flex items-center gap-1.5 justify-end text-[10px] font-bold text-[var(--text-muted)] uppercase">
              <LuBuilding2 size={12} />
              <span>Plant Operational Mode</span>
            </div>
            <span className="block text-xs font-black font-display text-emerald-500">8 CNC Cells Active</span>
            <span className="block text-[10px] text-[var(--text-muted)]">Peenya Unit 1</span>
          </div>
        </div>
      </div>


      {/* 2. BUSINESS SNAPSHOT & FACTORY HEALTH PULSE BAR */}
      <BusinessSnapshotBar data={data} />


      {/* 3. CRITICAL DECISIONS, NEEDS ATTENTION & OPPORTUNITIES */}
      <CriticalDecisionsSection data={data} />


      {/* 4. BUSINESS TIMELINE FEED (WHATSAPP & INPUT STREAM) */}
      <BusinessTimelineFeed />

    </div>
  );
};
