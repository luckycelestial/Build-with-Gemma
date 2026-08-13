/**
 * ============================================================================
 * MODULE PURPOSE: Procurement Mission Detail Stepper Component
 * RESPONSIBILITIES:
 *  - Renders 17-stage lifecycle progress bar and active status indicators.
 *  - Provides 1-Click approval and quote response simulation triggers.
 * OWNS: 17-Stage stepper visualization and action button triggers.
 * SHOULD NOT OWN: Network HTTP calls directly (accepts callbacks).
 * ============================================================================
 */

"use client";

import React from 'react';
import { Target, CheckCircle2, AlertTriangle, Play, Sparkles } from 'lucide-react';
import { ProcurementMissionEntity, MissionStage } from '../types/mission';

interface ProcurementMissionDetailProps {
  mission: ProcurementMissionEntity;
  onSimulateReply?: (missionId: string) => void;
  onApproveAction?: (missionId: string) => void;
}

const LIFECYCLE_STAGES: MissionStage[] = [
  'Inventory_Low',
  'Mission_Created',
  'Requirement_Analysis',
  'Supplier_Discovery',
  'RFQ_Generation',
  'RFQ_Dispatch',
  'Waiting_for_Quotations',
  'Quotation_Comparison',
  'Supplier_Recommendation',
  'Owner_Approval',
  'Purchase_Order',
  'Supplier_Acceptance',
  'Manufacturing',
  'Dispatch',
  'Goods_Received',
  'Inventory_Updated',
  'Supplier_Rating_Updated',
  'Mission_Complete'
];

export const ProcurementMissionDetail: React.FC<ProcurementMissionDetailProps> = ({
  mission,
  onSimulateReply,
  onApproveAction,
}) => {
  const currentIdx = LIFECYCLE_STAGES.indexOf(mission.currentStage);

  return (
    <div className="bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-3xl p-6 shadow-xs space-y-6">
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-[var(--border-subtle)] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-[var(--primary-subtle)] text-[var(--primary)] border border-[var(--primary)]/20 text-[10px] font-bold uppercase tracking-wider font-mono">
              {mission.id}
            </span>
            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
              mission.status === 'Completed' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' :
              mission.status === 'Paused_Approval' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' :
              'bg-blue-500/10 text-blue-500 border-blue-500/20'
            }`}>
              {mission.status.replace(/_/g, ' ')}
            </span>
          </div>
          <h2 className="text-base font-black text-[var(--text-primary)] mt-1 font-display">
            {mission.title}
          </h2>
          <p className="text-xs text-[var(--text-muted)] mt-0.5">
            SKU: <span className="font-mono text-[var(--text-primary)] font-bold">{mission.sku}</span> &mdash; {mission.businessImpact}
          </p>
        </div>

        {/* Action Triggers */}
        <div className="flex items-center gap-2">
          {mission.currentStage === 'Waiting_for_Quotations' && onSimulateReply && (
            <button
              onClick={() => onSimulateReply(mission.id)}
              className="px-3.5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center gap-1.5"
            >
              <Play size={13} />
              <span>Simulate Supplier Quote Reply</span>
            </button>
          )}

          {mission.currentStage === 'Owner_Approval' && onApproveAction && (
            <button
              onClick={() => onApproveAction(mission.id)}
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center gap-1.5 animate-pulse"
            >
              <CheckCircle2 size={13} />
              <span>1-Click Owner PO Sign-Off</span>
            </button>
          )}
        </div>
      </div>

      {/* Progress Bar & Stage Stepper */}
      <div>
        <div className="flex justify-between items-center text-xs mb-2">
          <span className="font-bold text-[var(--text-muted)] uppercase tracking-wider font-display">
            17-Stage Mission Lifecycle Progress
          </span>
          <span className="font-black text-[var(--primary)] font-mono">{mission.progress}%</span>
        </div>

        <div className="w-full h-2.5 bg-[var(--bg-subtle)] rounded-full overflow-hidden mb-4 border border-[var(--border-subtle)]">
          <div
            className="h-full bg-gradient-to-r from-[var(--primary)] to-emerald-500 transition-all duration-500"
            style={{ width: `${mission.progress}%` }}
          />
        </div>

        {/* Stage Pills Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
          {LIFECYCLE_STAGES.map((stg, idx) => {
            const isDone = idx < currentIdx || mission.status === 'Completed';
            const isCurrent = idx === currentIdx && mission.status !== 'Completed';

            return (
              <div
                key={stg}
                className={`p-2 rounded-xl border text-[10px] font-bold flex items-center gap-1.5 transition-all ${
                  isDone ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400' :
                  isCurrent ? 'bg-[var(--primary-subtle)] border-[var(--primary)] text-[var(--primary)] shadow-xs font-black' :
                  'bg-[var(--bg-subtle)] border-[var(--border-subtle)] text-[var(--text-muted)] opacity-50'
                }`}
              >
                <span className="w-4 h-4 rounded-full bg-[var(--bg-card)] border flex items-center justify-center text-[8px] flex-shrink-0">
                  {isDone ? '✓' : idx + 1}
                </span>
                <span className="truncate">{stg.replace(/_/g, ' ')}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
