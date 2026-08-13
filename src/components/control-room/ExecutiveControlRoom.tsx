"use client";

import React, { useState } from 'react';
import { BusinessHealthMeter } from './BusinessHealthMeter';
import { MorningBriefingCard } from './MorningBriefingCard';
import { DigitalEmployeeRoster } from '../workers/DigitalEmployeeRoster';
import { LiveOperationsBoard } from '../operations-board/LiveOperationsBoard';
import { LiveWorkflowVisualizer } from '../workflows/LiveWorkflowVisualizer';
import { ExecutiveTimelineFeed } from '../timeline/ExecutiveTimelineFeed';
import { DemoModeController } from '../demo/DemoModeController';

export const ExecutiveControlRoom: React.FC = () => {
  const [refreshKey, setRefreshKey] = useState(0);

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };

  return (
    <div key={refreshKey} className="space-y-8 p-6 md:p-10 max-w-7xl mx-auto text-[var(--text-primary)]">
      {/* 1. Demo Mode Simulation Floating Controller */}
      <DemoModeController onUpdate={handleRefresh} />

      {/* 2. Executive Business Health Score & Savings Impact Meter */}
      <BusinessHealthMeter />

      {/* 3. Executive Morning Brief Memo Card */}
      <MorningBriefingCard />

      {/* 4. AI Operations Team Roster (Digital Managers) */}
      <DigitalEmployeeRoster />

      {/* 5. Live Workflow Step Progression Graph Visualizer */}
      <LiveWorkflowVisualizer />

      {/* 6. Live Operations Matrix */}
      <LiveOperationsBoard />

      {/* 7. Executive Business Storytelling Timeline Stream */}
      <ExecutiveTimelineFeed />
    </div>
  );
};
