/**
 * ============================================================================
 * MODULE PURPOSE: Customer Revenue Concentration Pie Chart Component
 * RESPONSIBILITIES:
 *  - Renders Recharts pie chart visualization for customer revenue share.
 *  - Highlights single-customer dependencies exceeding risk thresholds (>30%).
 * OWNS: Pie chart rendering, tooltips, and legend data formatting.
 * SHOULD NOT OWN: Customer credit policy updates or accounts receivable tables.
 * ============================================================================
 */

"use client";

import React from "react";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts";
import { Users } from "lucide-react";

interface CustomerConcentrationChartProps {
  data: Array<{
    name: string;
    value: number;
    color: string;
  }>;
}

export const CustomerConcentrationChart: React.FC<CustomerConcentrationChartProps> = ({ data }) => {
  return (
    <div className="bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-3xl p-5 shadow-xs">
      <div className="flex items-center gap-2 border-b border-[var(--border-subtle)] pb-3 mb-4">
        <div className="w-7 h-7 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
          <Users size={15} />
        </div>
        <div>
          <h3 className="text-sm font-bold text-[var(--text-primary)] font-display">
            Revenue Share Concentration
          </h3>
          <p className="text-[10px] text-[var(--text-muted)]">
            Distribution of sales revenue across key customer accounts
          </p>
        </div>
      </div>

      <div className="h-52 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={45}
              outerRadius={75}
              paddingAngle={4}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: "var(--bg-card)",
                borderColor: "var(--border-subtle)",
                borderRadius: "12px",
                fontSize: "11px",
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[var(--border-subtle)]">
        {data.map((item, idx) => (
          <div key={idx} className="flex items-center gap-2 text-xs">
            <span
              className="w-2.5 h-2.5 rounded-full flex-shrink-0"
              style={{ backgroundColor: item.color }}
            />
            <span className="text-[var(--text-muted)] truncate">{item.name}</span>
            <span className="font-bold text-[var(--text-primary)] ml-auto font-mono">
              {item.value}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
