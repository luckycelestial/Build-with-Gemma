"use client";

import React, { useEffect, useState } from 'react';
import { Layers } from 'lucide-react';
import { OperationSnapshot } from '@/lib/operations/types';

export const LiveOperationsBoard: React.FC = () => {
  const [operations, setOperations] = useState<OperationSnapshot[]>([]);

  useEffect(() => {
    fetch('/api/operations')
      .then(res => res.json())
      .then(data => {
        if (data.operations) setOperations(data.operations);
      })
      .catch(() => {});
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider font-display flex items-center gap-2">
          <Layers className="w-4 h-4 text-blue-400" />
          Live Business Operations Matrix
        </h3>
        <span className="text-[10px] font-mono text-[var(--text-muted)]">Real-Time Sync</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {operations.map((op) => (
          <div key={op.operationId} className="bg-[var(--bg-card)] border border-[var(--border-subtle)] hover:border-blue-500/30 rounded-3xl p-5 space-y-4 transition-all shadow-xs flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className={`px-2.5 py-0.5 rounded-full text-[8px] font-bold ${
                  op.status === 'Optimal' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                }`}>
                  {op.status}
                </span>
                <span className="text-[9px] font-mono text-[var(--text-muted)]">{op.primaryWorker}</span>
              </div>

              <h4 className="text-xs font-bold text-[var(--text-primary)] font-display">
                {op.name}
              </h4>
              <p className="text-[10px] text-[var(--text-muted)] line-clamp-2 leading-relaxed">
                {op.description}
              </p>
            </div>

            <div className="space-y-2 pt-3 border-t border-[var(--border-subtle)]">
              <div className="text-[9px] text-emerald-400 font-sans font-medium line-clamp-1">
                Outcome: {op.expectedBusinessOutcome}
              </div>

              <div className="flex justify-between items-center text-[10px] text-[var(--text-muted)] pt-1">
                <span>{op.runningWorkflowsCount} Workflows Running</span>
                <span>{op.completedWorkflowsCount} Done</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
