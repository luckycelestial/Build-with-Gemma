/**
 * ============================================================================
 * MODULE PURPOSE: 6-Node Shipment Logistics Transit Node Tracker Component
 * RESPONSIBILITIES:
 *  - Visualizes real-time progress across 6 formal logistics nodes:
 *    1. Supplier Accepted
 *    2. Manufacturing
 *    3. Quality Inspection
 *    4. Dispatched
 *    5. Received
 *    6. Inventory Updated
 * OWNS: 6-Node transit node checkpoint visualizer.
 * SHOULD NOT OWN: DB updates directly.
 * ============================================================================
 */

"use client";

import React from 'react';
import { Truck, CheckCircle2, Clock, AlertCircle } from 'lucide-react';

interface ShipmentNodeTrackerProps {
  shipmentId?: string;
  supplierName?: string;
  currentStepIndex?: number; // 0 to 5
}

const SHIPMENT_NODES = [
  'Supplier Accepted',
  'Manufacturing',
  'Quality Inspection',
  'Dispatched',
  'Received',
  'Inventory Updated'
];

export const ShipmentNodeTracker: React.FC<ShipmentNodeTrackerProps> = ({
  shipmentId = 'SH-88219',
  supplierName = 'Jigani Tooling Labs Ltd',
  currentStepIndex = 3,
}) => {
  return (
    <div className="bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-3xl p-6 shadow-xs space-y-4">
      <div className="flex justify-between items-center border-b border-[var(--border-subtle)] pb-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <Truck size={15} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[var(--text-primary)] font-display">
              6-Node Logistics Shipment Transit Tracker
            </h3>
            <p className="text-[10px] text-[var(--text-muted)]">
              Shipment ID: <span className="font-mono text-[var(--text-primary)] font-bold">{shipmentId}</span> &mdash; Vendor: {supplierName}
            </p>
          </div>
        </div>
        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-500 border border-blue-500/20">
          In Transit
        </span>
      </div>

      {/* 6 Node Stepper */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
        {SHIPMENT_NODES.map((node, idx) => {
          const isCompleted = idx < currentStepIndex;
          const isCurrent = idx === currentStepIndex;

          return (
            <div
              key={node}
              className={`p-3 rounded-2xl border text-xs flex flex-col justify-between space-y-2 transition-all ${
                isCompleted
                  ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                  : isCurrent
                  ? 'bg-blue-500/10 border-blue-500/30 text-blue-600 dark:text-blue-400 font-bold shadow-xs'
                  : 'bg-[var(--bg-subtle)] border-[var(--border-subtle)] text-[var(--text-muted)] opacity-50'
              }`}
            >
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider">Node 0{idx + 1}</span>
                {isCompleted ? <CheckCircle2 size={13} /> : isCurrent ? <Clock size={13} className="animate-spin" /> : null}
              </div>

              <div>
                <p className="text-xs font-bold font-display leading-tight">{node}</p>
                <p className="text-[9px] text-[var(--text-muted)] mt-0.5 font-mono">
                  {isCompleted ? 'Completed' : isCurrent ? 'Active Transit' : 'Pending'}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
