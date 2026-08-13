"use client";

import React from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import MarketSignals from '@/components/pricing/MarketSignals';

export const dynamic = "force-dynamic";

export default function MarketIntelligencePage() {
  return (
    <DashboardLayout activeRoute="/market-intelligence">
      <div className="space-y-6 text-[var(--text-primary)]">
        <div>
          <h2 className="text-base font-black text-[var(--text-primary)] tracking-tight font-display">Market Intelligence & News Crawler</h2>
          <p className="text-[11px] text-[var(--text-muted)] mt-0.5 font-sans">Tracks real-time industry updates from Google News RSS feeds, steel index fluctuations, and EV policy transitions.</p>
        </div>
        
        <MarketSignals />
      </div>
    </DashboardLayout>
  );
}
