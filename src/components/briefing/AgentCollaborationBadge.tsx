"use client";

import React from 'react';
import { 
  LuTrendingUp, 
  LuTag, 
  LuBoxes, 
  LuWallet, 
  LuGlobe, 
  LuUsers,
  LuSparkles
} from 'react-icons/lu';

interface AgentCollaborationBadgeProps {
  agents: Array<{
    name: 'Market Intelligence' | 'Pricing Agent' | 'Revenue Intelligence' | 'Collections Agent' | 'Supplier Agent' | 'Customer Intelligence' | 'Executive Advisor';
    role: string;
  }>;
}

export const AgentCollaborationBadge: React.FC<AgentCollaborationBadgeProps> = ({ agents }) => {
  const getAgentIcon = (name: string) => {
    switch (name) {
      case 'Market Intelligence':
        return <LuGlobe className="text-emerald-500" size={12} />;
      case 'Pricing Agent':
        return <LuTag className="text-blue-500" size={12} />;
      case 'Revenue Intelligence':
        return <LuTrendingUp className="text-amber-500" size={12} />;
      case 'Collections Agent':
        return <LuWallet className="text-purple-500" size={12} />;
      case 'Supplier Agent':
        return <LuBoxes className="text-cyan-500" size={12} />;
      case 'Customer Intelligence':
        return <LuUsers className="text-indigo-500" size={12} />;
      default:
        return <LuSparkles className="text-[var(--primary)]" size={12} />;
    }
  };

  return (
    <div className="mt-3 p-3 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border-subtle)] space-y-2">
      <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
        <LuSparkles size={12} className="text-[var(--primary)] animate-pulse" />
        <span>Why am I seeing this? (Multi-Agent Collaboration)</span>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
        {agents.map((ag, idx) => (
          <div key={idx} className="flex items-start gap-2 p-2 rounded-lg bg-[var(--bg-card)] border border-[var(--border-subtle)] shadow-2xs">
            <div className="p-1 rounded-md bg-[var(--bg-subtle)] mt-0.5 shrink-0">
              {getAgentIcon(ag.name)}
            </div>
            <div className="min-w-0">
              <span className="block text-[11px] font-bold text-[var(--text-primary)] truncate">{ag.name}</span>
              <span className="block text-[10px] text-[var(--text-muted)] leading-snug">{ag.role}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
