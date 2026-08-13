/**
 * ============================================================================
 * MODULE PURPOSE: AI Procurement Manager Employee Header Component
 * RESPONSIBILITIES:
 *  - Displays live AI Employee (ProcurementWorker) status bar and active duty metrics.
 *  - Shows active duty health pulse, monitored SKUs, active missions, and quick audit triggers.
 * OWNS: AI Employee header status bar UI.
 * SHOULD NOT OWN: Low-level database queries or full page layouts.
 * ============================================================================
 */

"use client";

import React from 'react';
import { Bot, Sparkles, Activity, ShieldCheck, RefreshCw, Zap } from 'lucide-react';

interface AiProcurementEmployeeHeaderProps {
  monitoredSkuCount?: number;
  activeMissionCount?: number;
  onTriggerAudit?: () => void;
}

export const AiProcurementEmployeeHeader: React.FC<AiProcurementEmployeeHeaderProps> = ({
  monitoredSkuCount = 14,
  activeMissionCount = 3,
  onTriggerAudit,
}) => {
  return (
    <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 shadow-md border border-indigo-500/20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        {/* Left: AI Employee Identity */}
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="w-14 h-14 rounded-2xl bg-indigo-600/30 border border-indigo-400/40 flex items-center justify-center text-indigo-300 shadow-inner">
              <Bot size={28} />
            </div>
            <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-slate-900 animate-pulse" title="Active Duty" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-black tracking-tight font-display text-white">
                ProcurementWorker &mdash; AI Procurement Manager
              </h1>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold uppercase tracking-wider">
                Autonomous Duty
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-1 flex items-center gap-2">
              <span>Supervising raw material inventory, supplier quotes & shipment transit</span>
              <span className="text-indigo-400 font-mono">• Gemma AI Engine</span>
            </p>
          </div>
        </div>

        {/* Right: Metrics & Actions */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-4 bg-slate-800/60 border border-slate-700/50 px-4 py-2 rounded-2xl">
            <div className="text-center">
              <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Monitored SKUs</p>
              <p className="text-sm font-black text-white font-mono">{monitoredSkuCount}</p>
            </div>
            <div className="w-px h-6 bg-slate-700" />
            <div className="text-center">
              <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Active Missions</p>
              <p className="text-sm font-black text-indigo-400 font-mono">{activeMissionCount}</p>
            </div>
          </div>

          {onTriggerAudit && (
            <button
              onClick={onTriggerAudit}
              className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-2 cursor-pointer"
            >
              <Zap size={14} />
              <span>Trigger AI Stock Audit</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
