"use client";

import React, { useState } from 'react';
import { Play, Sparkles } from 'lucide-react';

export interface DemoStepStatus {
  stepIndex: number;
  timeLabel: string;
  title: string;
  description: string;
  status: 'Pending' | 'Active' | 'Completed';
}

const DEMO_STEPS: DemoStepStatus[] = [
  { stepIndex: 0, timeLabel: '09:00 AM', title: 'Market Alert Detected', description: 'Market Analyst detects +4.1% raw steel price index surge in Peenya cluster.', status: 'Pending' },
  { stepIndex: 1, timeLabel: '09:05 AM', title: 'Executive CTO Workflow Planning', description: 'Executive CTO evaluates SOPs and creates Pricing Surcharge & RFQ Workflows.', status: 'Pending' },
  { stepIndex: 2, timeLabel: '09:15 AM', title: 'AI Manager Tool Execution', description: 'Pricing Manager recalculates BOM margins; Procurement Manager generates RFQs.', status: 'Pending' },
  { stepIndex: 3, timeLabel: '09:30 AM', title: 'Owner Approval Gate Requested', description: 'Action card posted to Action Center & WhatsApp for factory owner sign-off.', status: 'Pending' },
  { stepIndex: 4, timeLabel: '09:45 AM', title: '1-Click Owner Approval Executed', description: 'Owner approves step; tool updates Tally ERP and restores safety stock.', status: 'Pending' },
  { stepIndex: 5, timeLabel: '10:00 AM', title: 'Morning Brief Memo Updated', description: 'Business Story Engine updates Morning Briefing Memo with ₹82,000 protected margin.', status: 'Pending' }
];

export const DemoModeController: React.FC<{ onUpdate?: () => void }> = ({ onUpdate }) => {
  const [isRunning, setIsRunning] = useState(false);
  const [steps, setSteps] = useState<DemoStepStatus[]>(DEMO_STEPS);

  const handleRunDemo = async () => {
    if (isRunning) return;
    setIsRunning(true);

    // Reset steps
    const activeSteps = DEMO_STEPS.map(s => ({ ...s, status: 'Pending' as const }));
    setSteps(activeSteps);

    // Simulate step progression visually while calling server API
    for (let i = 0; i < activeSteps.length; i++) {
      activeSteps[i].status = 'Active';
      setSteps([...activeSteps]);
      await new Promise(r => setTimeout(r, 1200));
      activeSteps[i].status = 'Completed';
      setSteps([...activeSteps]);
    }

    try {
      await fetch('/api/demo/run', { method: 'POST' });
    } catch (e) {
      console.error(e);
    }

    setIsRunning(false);
    if (onUpdate) onUpdate();
  };

  return (
    <div className="bg-gradient-to-r from-blue-950 via-indigo-950 to-purple-950 border border-blue-500/40 rounded-3xl p-5 shadow-2xl space-y-3">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-blue-600/30 border border-blue-400/40 flex items-center justify-center text-blue-300">
            <Sparkles className="w-5 h-5 animate-pulse" />
          </div>

          <div>
            <h4 className="text-xs font-black text-white uppercase tracking-wider font-display">
              Executive Startup Pitch Demo Mode
            </h4>
            <p className="text-[10px] text-blue-200/80 font-sans">
              Simulate a live manufacturing business day: Market steel alert ➔ CTO planning ➔ Manager execution ➔ 1-Click Approval ➔ Impact reporting.
            </p>
          </div>
        </div>

        <button
          onClick={handleRunDemo}
          disabled={isRunning}
          className={`px-5 py-2.5 rounded-full font-bold text-xs flex items-center gap-2 transition-all cursor-pointer shadow-lg ${
            isRunning ? 'bg-blue-800 text-blue-300 cursor-not-allowed' : 'bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-400 hover:to-indigo-500 text-white'
          }`}
        >
          <Play className={`w-4 h-4 ${isRunning ? 'animate-spin' : ''}`} />
          <span>{isRunning ? 'Simulating Live Business Day...' : 'Run Live Pitch Demo (120s)'}</span>
        </button>
      </div>

      {/* Live Simulation Step Indicators */}
      {isRunning && (
        <div className="grid grid-cols-2 md:grid-cols-6 gap-2 pt-2 border-t border-blue-500/20">
          {steps.map((s) => (
            <div key={s.stepIndex} className={`p-2 rounded-xl text-[9px] border font-sans ${
              s.status === 'Completed' ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30' :
              s.status === 'Active' ? 'bg-blue-500/20 text-blue-200 border-blue-400 animate-pulse font-bold' :
              'bg-blue-950/40 text-blue-400/60 border-blue-900/30'
            }`}>
              <div className="font-mono text-[8px] opacity-75">{s.timeLabel}</div>
              <div className="line-clamp-1 mt-0.5">{s.title}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
