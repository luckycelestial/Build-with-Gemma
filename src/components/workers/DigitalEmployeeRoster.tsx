"use client";

import React from 'react';
import { User, Activity, CheckCircle2, Clock, Sparkles } from 'lucide-react';

export interface DigitalEmployee {
  id: string;
  name: string;
  role: string;
  status: 'Working' | 'Idle' | 'Waiting Approval';
  currentTask: string;
  completedToday: number;
  estimatedTime: string;
  avatarColor: string;
}

const EMPLOYEES: DigitalEmployee[] = [
  {
    id: 'emp-1',
    name: 'Procurement Manager',
    role: 'Raw Material & Supplier Operations',
    status: 'Working',
    currentTask: 'Evaluating Jigani Tooling RFQ quotations',
    completedToday: 5,
    estimatedTime: '1 min',
    avatarColor: 'from-blue-600 to-indigo-600'
  },
  {
    id: 'emp-2',
    name: 'Pricing Manager',
    role: 'Margin Defense & Inflation Pass-Through',
    status: 'Working',
    currentTask: 'Recalculating EN8 steel BOM surcharge',
    completedToday: 3,
    estimatedTime: '2 mins',
    avatarColor: 'from-emerald-600 to-teal-600'
  },
  {
    id: 'emp-3',
    name: 'Revenue Manager',
    role: 'XGBoost Time-Series & SHAP Explainability',
    status: 'Idle',
    currentTask: 'Monitoring 8-week baseline revenue trajectory',
    completedToday: 4,
    estimatedTime: 'Idle',
    avatarColor: 'from-purple-600 to-violet-600'
  },
  {
    id: 'emp-4',
    name: 'Collections Manager',
    role: 'AR Recovery & Credit Control',
    status: 'Waiting Approval',
    currentTask: 'Drafted payment reminder for ABC Industries',
    completedToday: 6,
    estimatedTime: 'Awaiting Sign-off',
    avatarColor: 'from-amber-600 to-orange-600'
  }
];

export const DigitalEmployeeRoster: React.FC = () => {
  return (
    <div className="bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-3xl p-6 space-y-4 shadow-xs">
      <div className="flex justify-between items-center border-b border-[var(--border-subtle)] pb-3">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-indigo-400" />
          <h3 className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider font-display">
            AI Operations Team (Digital Managers)
          </h3>
        </div>
        <span className="text-[10px] font-mono text-[var(--text-muted)]">4 Active Managers</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {EMPLOYEES.map((emp) => (
          <div key={emp.id} className="bg-[var(--bg-subtle)] border border-[var(--border-subtle)] hover:border-indigo-500/30 rounded-2xl p-4 space-y-3 transition-all">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-2xl bg-gradient-to-br ${emp.avatarColor} flex items-center justify-center text-white font-bold text-sm shadow-xs`}>
                {emp.name.charAt(0)}
              </div>

              <div>
                <h4 className="text-xs font-bold text-[var(--text-primary)]">{emp.name}</h4>
                <span className="text-[9px] text-[var(--text-muted)] block font-sans">{emp.role}</span>
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <span className={`px-2 py-0.5 rounded-full text-[8px] font-bold ${
                  emp.status === 'Working' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
                  emp.status === 'Waiting Approval' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                  'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                }`}>
                  {emp.status}
                </span>
                <span className="text-[8px] font-mono text-[var(--text-muted)]">Tasks: {emp.completedToday} Today</span>
              </div>

              <p className="text-[10px] text-[var(--text-primary)] font-medium line-clamp-2 mt-1 leading-snug">
                {emp.currentTask}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
