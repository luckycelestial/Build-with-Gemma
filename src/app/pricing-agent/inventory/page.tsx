"use client";

import React from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import CncInventory from '@/components/pricing/CncInventory';

export const dynamic = "force-dynamic";

export default function InventoryPage() {
  return (
    <DashboardLayout activeRoute="/pricing-agent/inventory">
      <div className="space-y-6 text-[var(--text-primary)]">
        <div>
          <h2 className="text-base font-black text-[var(--text-primary)] tracking-tight font-display">CNC Inventory Tracker</h2>
          <p className="text-[11px] text-[var(--text-muted)] mt-0.5 font-sans">Monitor tooling stock status, carbide drills, mills, and raw metal bars.</p>
        </div>
        
        <CncInventory />
      </div>
    </DashboardLayout>
  );
}
