"use client";

import { useState, useEffect } from "react";
import { LuTrendingDown, LuLayers, LuSparkles, LuBookmark } from "react-icons/lu";
import { getStructuralRisks } from "@/app/pricing-agent/actions";

export default function StructuralRisk() {
  const [risks, setRisks] = useState<any[]>([]);

  useEffect(() => {
    getStructuralRisks().then((data) => {
      setRisks(data);
    });
  }, []);

  return (
    <div id="long-term-risks" className="bg-[var(--bg-card)] border border-[var(--border-subtle)] p-6 rounded-3xl shadow-xs space-y-6 text-[var(--text-primary)]">
      <div className="flex items-center justify-between pb-4 border-b border-[var(--border-subtle)]">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-[var(--bg-subtle)] text-[var(--primary)] flex items-center justify-center">
            <LuLayers size={18} />
          </div>
          <div>
            <h3 className="font-display font-bold text-[var(--text-primary)] text-sm sm:text-base">
              Long-Term Demand Signals
            </h3>
            <p className="text-xs font-semibold text-[var(--text-muted)]">
              Structural market transitions & diversification guidance
            </p>
          </div>
        </div>
        <span className="flex items-center gap-1.5 text-[9px] font-black uppercase text-amber-600 dark:text-amber-400 bg-amber-500/15 px-2 py-0.5 rounded border border-amber-500/30">
          <LuBookmark size={10} /> Watch List
        </span>
      </div>

      <div className="space-y-6">
        {risks.map((risk: any, idx: number) => (
          <div key={idx} className="p-5 rounded-2xl bg-[var(--bg-subtle)] border border-[var(--border-subtle)] space-y-4">
            <div className="flex justify-between items-center text-xs font-black uppercase text-[var(--text-muted)]">
              <span>Obsolescence Trend: {risk.trend}</span>
              <span className="text-rose-500 font-bold flex items-center gap-1">
                <LuTrendingDown size={14} /> {risk.status}
              </span>
            </div>

            <div className="space-y-3">
              <h4 className="font-display font-bold text-[var(--text-primary)] text-sm">
                {risk.title}
              </h4>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed font-medium">
                {risk.description}
              </p>
            </div>

            <div className="p-4 rounded-xl bg-[var(--bg-card)] border border-[var(--border-subtle)] flex items-start gap-3">
              <div className="h-6 w-6 rounded bg-[var(--primary-subtle)] text-[var(--primary)] flex items-center justify-center shrink-0 mt-0.5">
                <LuSparkles size={12} />
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-black uppercase text-[var(--text-muted)] tracking-wider">Gemma Diversification Advisory</p>
                <p className="text-xs text-[var(--text-primary)] leading-relaxed font-semibold">
                  &ldquo;{risk.gemmaAdvisory}&rdquo;
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
