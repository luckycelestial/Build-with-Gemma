/**
 * ============================================================================
 * MODULE PURPOSE: BOM Surcharge Pass-Through Simulator Component
 * RESPONSIBILITIES:
 *  - Interactive steel/raw material price spike slider adjustments.
 *  - Calculating real-time customer quote gross margin pass-through rates.
 * OWNS: Local price inflation slider state and pass-through math calculations.
 * SHOULD NOT OWN: Global inventory queries or ERP Tally database updates.
 * ============================================================================
 */

"use client";

import React, { useState } from "react";
import { LuTrendingUp, LuPercent, LuShieldCheck } from "react-icons/lu";

interface SurchargePassThroughSimulatorProps {
  initialPriceIncrease?: number;
  onApplyPassThrough?: (surchargePercent: number) => void;
}

export const SurchargePassThroughSimulator: React.FC<SurchargePassThroughSimulatorProps> = ({
  initialPriceIncrease = 4.1,
  onApplyPassThrough,
}) => {
  const [priceIncrease, setPriceIncrease] = useState<number>(initialPriceIncrease);

  const calculatedPassThrough = Math.round(priceIncrease * 0.85 * 10) / 10;
  const protectedMargin = (16.5 + calculatedPassThrough * 0.2).toFixed(1);

  return (
    <div className="bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-3xl p-5 shadow-xs">
      <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-3 mb-4">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
            <LuTrendingUp size={15} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[var(--text-primary)] font-display">
              BOM Surcharge Pass-Through Simulator
            </h3>
            <p className="text-[10px] text-[var(--text-muted)]">
              Simulate raw steel price spikes & customer quote surcharges
            </p>
          </div>
        </div>
        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[var(--primary-subtle)] text-[var(--primary)] border border-[var(--primary)]/20">
          Gemma Formula
        </span>
      </div>

      <div className="space-y-4">
        <div>
          <div className="flex justify-between text-xs font-bold mb-1.5">
            <span className="text-[var(--text-muted)]">Raw Steel Price Inflation</span>
            <span className="text-rose-500 font-mono">+{priceIncrease}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="20"
            step="0.1"
            value={priceIncrease}
            onChange={(e) => setPriceIncrease(parseFloat(e.target.value))}
            className="w-full h-2 bg-[var(--bg-subtle)] rounded-lg appearance-none cursor-pointer accent-[var(--primary)]"
          />
        </div>

        <div className="grid grid-cols-2 gap-3 pt-2">
          <div className="bg-[var(--bg-subtle)] p-3 rounded-2xl border border-[var(--border-subtle)]">
            <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">
              Calculated Pass-Through
            </p>
            <p className="text-base font-black text-[var(--primary)] mt-0.5 font-mono">
              +{calculatedPassThrough}%
            </p>
          </div>
          <div className="bg-[var(--bg-subtle)] p-3 rounded-2xl border border-[var(--border-subtle)]">
            <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">
              Protected Gross Margin
            </p>
            <p className="text-base font-black text-emerald-500 mt-0.5 font-mono">
              {protectedMargin}%
            </p>
          </div>
        </div>

        {onApplyPassThrough && (
          <button
            onClick={() => onApplyPassThrough(calculatedPassThrough)}
            className="w-full py-2 bg-[var(--primary)] hover:bg-[var(--primary-dark)] text-white text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
          >
            <LuShieldCheck size={14} />
            <span>Apply +{calculatedPassThrough}% Quote Surcharge</span>
          </button>
        )}
      </div>
    </div>
  );
};
