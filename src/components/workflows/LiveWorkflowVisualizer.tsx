"use client";

import React, { useEffect, useState } from 'react';
import { Workflow, CheckCircle2, Clock, Play, ArrowRight } from 'lucide-react';
import { WorkflowInstanceData } from '@/lib/workflows/types';

export const LiveWorkflowVisualizer: React.FC = () => {
  const [workflows, setWorkflows] = useState<WorkflowInstanceData[]>([]);

  useEffect(() => {
    fetch('/api/operations')
      .then(res => res.json())
      .then(data => {
        if (data.workflows) setWorkflows(data.workflows);
      })
      .catch(() => {});
  }, []);

  return (
    <div className="bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-3xl p-6 space-y-4 shadow-xs">
      <div className="flex justify-between items-center border-b border-[var(--border-subtle)] pb-3">
        <div className="flex items-center gap-2">
          <Workflow className="w-4 h-4 text-blue-400" />
          <h3 className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider font-display">
            Live Workflow Graph Visualizer
          </h3>
        </div>
        <span className="text-[10px] font-mono text-[var(--text-muted)]">Active Execution Graphs</span>
      </div>

      {workflows.length === 0 ? (
        <div className="p-6 text-center text-xs text-[var(--text-muted)] font-sans border border-dashed border-[var(--border-subtle)] rounded-2xl">
          No active workflow graphs running. Click <span className="font-semibold text-blue-400">Run Pitch Demo</span> to trigger live workflow executions.
        </div>
      ) : (
        <div className="space-y-4">
          {workflows.map((wf) => (
            <div key={wf.id} className="bg-[var(--bg-subtle)] border border-[var(--border-subtle)] rounded-2xl p-4 space-y-3">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2">
                <div>
                  <h4 className="text-xs font-bold text-[var(--text-primary)]">{wf.title}</h4>
                  <p className="text-[10px] text-[var(--text-muted)] font-sans mt-0.5">
                    Operation: <span className="font-semibold text-[var(--text-primary)]">{wf.operationId}</span> | Worker: <span className="text-blue-400">{wf.assignedWorker}</span>
                  </p>
                </div>

                <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold ${
                  wf.status === 'Executing' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
                  wf.status === 'Pending_Approval' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                  'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                }`}>
                  Status: {wf.status}
                </span>
              </div>

              {/* Step Progression Graph */}
              <div className="flex items-center gap-2 overflow-x-auto pt-2">
                {wf.steps.map((step, idx) => (
                  <React.Fragment key={step.id}>
                    <div className={`px-3 py-2 rounded-xl text-[10px] font-medium border flex items-center gap-2 flex-shrink-0 ${
                      step.status === 'Completed' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' :
                      step.status === 'Executing' ? 'bg-blue-500/10 text-blue-400 border-blue-500/30 animate-pulse' :
                      step.status === 'Pending' ? 'bg-[var(--bg-card)] text-[var(--text-muted)] border-[var(--border-subtle)]' :
                      'bg-amber-500/10 text-amber-400 border-amber-500/30'
                    }`}>
                      {step.status === 'Completed' && <CheckCircle2 className="w-3.5 h-3.5" />}
                      {step.status === 'Executing' && <Play className="w-3.5 h-3.5 animate-spin" />}
                      {step.status === 'Pending' && <Clock className="w-3.5 h-3.5" />}
                      <span>{step.sequence}. {step.name}</span>
                    </div>

                    {idx < wf.steps.length - 1 && (
                      <ArrowRight className="w-3 h-3 text-[var(--text-muted)] flex-shrink-0" />
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
