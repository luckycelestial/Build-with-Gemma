"use client";

import React from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import SupplyChainTracker from '@/components/pricing/SupplyChainTracker';

export const dynamic = "force-dynamic";

export default function SupplyChainPage() {
  return (
    <DashboardLayout activeRoute="/pricing-agent/supply-chain">
      <div className="space-y-6 text-[var(--text-primary)]">
        <div>
          <h2 className="text-base font-black text-[var(--text-primary)] tracking-tight font-display">Supply Chain Tracker</h2>
          <p className="text-[11px] text-[var(--text-muted)] mt-0.5 font-sans">Track primary raw material suppliers, costs per unit, lead times, and alternative vendor sources.</p>
        </div>
        
        <SupplyChainTracker />
      </div>
    </DashboardLayout>
  );
}
