/**
 * ============================================================================
 * MODULE PURPOSE: SKU Stock Quantity Adjuster Component
 * RESPONSIBILITIES:
 *  - Handles increment (+) and decrement (-) inventory stock adjustments.
 *  - Triggers server action update calls and optimistic UI state updates.
 * OWNS: Local button click handlers and loading spinners for quantity changes.
 * SHOULD NOT OWN: Global inventory fetching or full SKU table rendering.
 * ============================================================================
 */

"use client";

import React from "react";
import { LuPlus, LuMinus } from "react-icons/lu";

interface StockQuantityAdjusterProps {
  itemId: number;
  quantity: number;
  onUpdateQty: (id: number, delta: number) => void;
  disabled?: boolean;
}

export const StockQuantityAdjuster: React.FC<StockQuantityAdjusterProps> = ({
  itemId,
  quantity,
  onUpdateQty,
  disabled = false,
}) => {
  return (
    <div className="flex items-center gap-1.5 bg-[var(--bg-subtle)] p-1 rounded-xl border border-[var(--border-subtle)]">
      <button
        onClick={(e) => {
          e.stopPropagation();
          onUpdateQty(itemId, -1);
        }}
        disabled={disabled || quantity <= 0}
        className="p-1 text-[var(--text-muted)] hover:text-rose-500 hover:bg-[var(--bg-card)] rounded-lg transition-all disabled:opacity-30 cursor-pointer"
        title="Decrease quantity"
      >
        <LuMinus size={12} />
      </button>
      <span className="text-xs font-black min-w-[24px] text-center font-mono text-[var(--text-primary)]">
        {quantity}
      </span>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onUpdateQty(itemId, 1);
        }}
        disabled={disabled}
        className="p-1 text-[var(--text-muted)] hover:text-emerald-500 hover:bg-[var(--bg-card)] rounded-lg transition-all disabled:opacity-30 cursor-pointer"
        title="Increase quantity"
      >
        <LuPlus size={12} />
      </button>
    </div>
  );
};
