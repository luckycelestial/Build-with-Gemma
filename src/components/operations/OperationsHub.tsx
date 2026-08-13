"use client";

import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Activity, 
  Workflow, 
  CheckCircle2, 
  AlertTriangle, 
  Sparkles
} from 'lucide-react';
import { OperationSnapshot } from '@/lib/operations/types';

export interface ActionCenterState {
  pendingApprovals: Array<{
    workflowId: string;
    title: string;
    stepName: string;
    toolId: string;
    businessImpact: string;
  }>;
  runningWorkflowsCount: number;
  completedWorkflowsCount: number;
  auditTrailCount: number;
}

export const OperationsHub: React.FC = () => {
  const [operations, setOperations] = useState<OperationSnapshot[]>([]);
  const [actionState, setActionState] = useState<ActionCenterState | null>(null);

  const refreshData = async () => {
    try {
      const res = await fetch('/api/operations');
      const data = await res.json();
      if (data.operations) setOperations(data.operations);
      if (data.actionCenter) setActionState(data.actionCenter);
    } catch {
      // Fallback
    }
  };

  useEffect(() => {
    refreshData();
  }, []);

  const handleApprove = async (workflowId: string) => {
    try {
      await fetch('/api/action-center/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ workflowId })
      });
    } catch (e) {
      console.error(e);
    }
    refreshData();
  };

  return (
    <div className="space-y-6 text-[var(--text-primary)]">
      {/* Top Banner: Executive AI CTO Operations Control */}
      <div className="bg-gradient-to-r from-blue-900/40 via-indigo-900/30 to-purple-900/40 border border-blue-500/30 rounded-3xl p-6 backdrop-blur-md shadow-lg">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-blue-400 animate-pulse" />
              <h2 className="text-lg font-black text-white tracking-tight font-display">
                Executive AI CTO Operations Engine
              </h2>
            </div>
            <p className="text-xs text-blue-200/80 font-sans max-w-2xl">
              Autonomous manufacturing operations hub. Managing 8 specialized domain workers, active workflow DAGs, and real-time execution verification.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-blue-950/80 border border-blue-400/30 px-4 py-2 rounded-2xl flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-400 animate-spin" />
              <span className="text-xs font-bold text-white">System Active</span>
            </div>
          </div>
        </div>
      </div>

      {/* Pending Approvals Inbox (Action Center Banner) */}
      {actionState && actionState.pendingApprovals.length > 0 && (
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-3xl p-5 shadow-xs">
          <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase tracking-wider mb-3">
            <AlertTriangle className="w-4 h-4" />
            <span>Action Center Inbox: Pending Owner Approvals ({actionState.pendingApprovals.length})</span>
          </div>

          <div className="space-y-2">
            {actionState.pendingApprovals.map((appr) => (
              <div key={appr.workflowId} className="bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-2xl p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
                <div>
                  <h4 className="text-xs font-bold text-[var(--text-primary)]">{appr.title}</h4>
                  <p className="text-[10px] text-[var(--text-muted)] mt-0.5">
                    Step: <span className="font-semibold text-[var(--text-primary)]">{appr.stepName}</span> | Tool: <code className="text-amber-400 font-mono">{appr.toolId}</code>
                  </p>
                  <p className="text-[9px] text-emerald-400 mt-1 font-sans">
                    Business Impact: {appr.businessImpact}
                  </p>
                </div>

                <button
                  onClick={() => handleApprove(appr.workflowId)}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-full transition-all cursor-pointer shadow-xs"
                >
                  Approve Action
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Operations Grid (8 Business Operations) */}
      <div>
        <h3 className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider mb-3 font-display">
          Active Business Operations ({operations.length})
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {operations.map((op) => (
            <div 
              key={op.operationId}
              className="bg-[var(--bg-card)] border border-[var(--border-subtle)] hover:border-[var(--primary)]/40 rounded-3xl p-5 space-y-4 transition-all shadow-xs flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className={`px-2.5 py-1 rounded-full text-[9px] font-bold ${
                    op.status === 'Optimal' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                  }`}>
                    {op.status}
                  </span>
                  <span className="text-[9px] font-mono text-[var(--text-muted)]">{op.primaryWorker}</span>
                </div>

                <h4 className="text-xs font-bold text-[var(--text-primary)] font-display leading-tight">
                  {op.name}
                </h4>
                <p className="text-[10px] text-[var(--text-muted)] line-clamp-2 leading-relaxed">
                  {op.description}
                </p>
              </div>

              {/* KPIs & Workflow Counts */}
              <div className="space-y-3 pt-3 border-t border-[var(--border-subtle)]">
                <div className="grid grid-cols-2 gap-2">
                  {op.kpis.slice(0, 2).map((kpi, idx) => (
                    <div key={idx} className="bg-[var(--bg-subtle)] p-2 rounded-xl border border-[var(--border-subtle)]">
                      <span className="text-[8px] text-[var(--text-muted)] block">{kpi.label}</span>
                      <span className="text-[11px] font-bold text-[var(--text-primary)]">{kpi.value}</span>
                    </div>
                  ))}
                </div>

                <div className="flex justify-between items-center text-[10px] text-[var(--text-muted)]">
                  <span className="flex items-center gap-1">
                    <Workflow className="w-3 h-3 text-blue-400" />
                    <span>{op.runningWorkflowsCount} Running</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                    <span>{op.completedWorkflowsCount} Completed</span>
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
