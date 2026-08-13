"use client";

import React from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
export const dynamic = "force-dynamic";
import { ScenarioSimulator } from '@/components/ScenarioSimulator';
import { RevenueIntelligence } from '@/components/RevenueIntelligence';
import { useBusinessData } from '@/context/BusinessDataContext';

export default function WhatIfSimulatorPage() {
  const { data, setData, loadSample } = useBusinessData();

  return (
    <DashboardLayout activeRoute="/what-if-simulator">
      {data && (
        <div className="space-y-6 text-[var(--text-primary)]">
          <div>
            <h2 className="text-base font-black text-[var(--text-primary)] tracking-tight font-display">What-If Scenario Simulator</h2>
            <p className="text-[11px] text-[var(--text-muted)] mt-0.5 font-sans">Simulate operational overrides to re-estimate XGBoost weekly forecast and evaluate business risk parameters.</p>
          </div>

          <ScenarioSimulator 
            data={data}
            onSimulationResult={(result) => setData(result)}
            onReset={loadSample}
          />

          <div className="border-t border-[var(--border-subtle)] pt-6">
            <h3 className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider mb-4 font-display">Simulation Forecast Output</h3>
            <RevenueIntelligence data={data} onExplain={() => {}} />
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
