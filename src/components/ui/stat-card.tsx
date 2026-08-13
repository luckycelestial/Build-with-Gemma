import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  label: string;
  value: string | number;
  subtext: string;
  icon: LucideIcon;
  trend?: {
    value: string;
    isUp: boolean;
  };
  highlight?: boolean;
  children?: React.ReactNode;
}

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  subtext,
  icon: Icon,
  trend,
  highlight = false,
  children
}) => {
  return (
    <div className={`group relative overflow-hidden rounded-3xl border ${
      highlight ? 'border-[var(--primary)]/30 bg-[var(--primary-subtle)]' : 'border-[var(--border-subtle)] bg-[var(--bg-card)]'
    } p-5 shadow-xs transition-all duration-300 hover:-translate-y-1 hover:shadow-md flex flex-col justify-between h-full`}>
      {/* Decorative Blur Background */}
      <div className="absolute right-0 top-0 -translate-y-6 translate-x-6 h-32 w-32 bg-[var(--primary)]/5 rounded-full blur-3xl transition-all duration-300 group-hover:bg-[var(--primary)]/10 group-hover:scale-110 pointer-events-none" />
      
      <div className="flex justify-between items-start z-10">
        {/* Icon Bucket */}
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--bg-subtle)] border border-[var(--border-subtle)] text-[var(--primary)] transition-all duration-200 group-hover:bg-[var(--primary)] group-hover:text-white shadow-xs">
          <Icon size={20} />
        </div>
        
        {trend && (
          <span className={`flex items-center gap-0.5 text-xs font-semibold px-2 py-0.5 rounded-full ${
            trend.isUp 
              ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400' 
              : 'bg-rose-500/15 text-rose-600 dark:text-rose-400'
          }`}>
            <span>{trend.value}</span>
          </span>
        )}
      </div>

      <div className="mt-4 z-10">
        <p className="text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-wider font-display">{label}</p>
        <h3 className="text-2xl font-black text-[var(--text-primary)] tracking-tight mt-1 font-display">
          {value}
        </h3>
        <p className="text-[11px] text-[var(--text-muted)] mt-0.5 leading-snug">{subtext}</p>
        {children}
      </div>
    </div>
  );
};
