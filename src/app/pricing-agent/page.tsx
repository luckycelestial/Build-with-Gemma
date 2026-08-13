"use client";

import React, { useState } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import PricingRecommendations from '@/components/pricing/PricingRecommendations';
import PricingDashboardWidgets from '@/components/pricing/PricingDashboardWidgets';
import DataImportPanel from '@/components/pricing/DataImportPanel';

export const dynamic = "force-dynamic";

export default function PricingAgentPage() {
  const [reloadKey, setReloadKey] = useState(0);

  const handleDataImported = () => {
    setReloadKey(prev => prev + 1);
  };

  return (
    <DashboardLayout activeRoute="/pricing-agent">
      <div className="space-y-6">
        <div>
          <h2 className="text-base font-black text-[var(--text-primary)] tracking-tight font-display">AI Pricing Advisory & Margin Protection</h2>
          <p className="text-[11px] text-[var(--text-muted)] mt-0.5 font-sans">Watches raw material indices, calculates margin impact per product, and recommends contract adjustments.</p>
        </div>
        
        <DataImportPanel onDataImported={handleDataImported} />
        
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">
          <div className="xl:col-span-2">
            <PricingRecommendations key={`rec-${reloadKey}`} />
          </div>

          <div className="xl:col-span-1">
            <PricingDashboardWidgets key={`wid-${reloadKey}`} />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
