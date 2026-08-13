"use client";

import React from 'react';
import { OperationsHub } from '@/components/operations/OperationsHub';
import { ExecutiveTimelineFeed } from '@/components/timeline/ExecutiveTimelineFeed';
import DashboardLayout from '@/components/DashboardLayout';

export default function OperationsPage() {
  return (
    <DashboardLayout activeRoute="/operations">
      <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8">
        <OperationsHub />
        <ExecutiveTimelineFeed />
      </div>
    </DashboardLayout>
  );
}
