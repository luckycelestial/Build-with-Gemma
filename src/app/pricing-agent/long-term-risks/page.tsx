"use client";

import React from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import StructuralRisk from '@/components/pricing/StructuralRisk';

export const dynamic = "force-dynamic";

export default function LongTermRisksPage() {
  return (
    <DashboardLayout activeRoute="/pricing-agent/long-term-risks">
      <div className="space-y-6 text-[var(--text-primary)]">
        <div>
          <h2 className="text-base font-black text-[var(--text-primary)] tracking-tight font-display">Long-Term Structural Risks</h2>
          <p className="text-[11px] text-[var(--text-muted)] mt-0.5 font-sans">Assess macro-environmental shifts, ICE-to-EV transitions, and labor bottlenecks.</p>
        </div>
        
        <StructuralRisk />
      </div>
    </DashboardLayout>
  );
}
