/**
 * ============================================================================
 * MODULE PURPOSE: Inventory Intelligence Cards Component
 * RESPONSIBILITIES:
 *  - Displays raw material and tooling SKU stock cards.
 *  - Provides 1-Click Action Buttons:
 *    1. Restock (Launches new Procurement Mission)
 *    2. Find Cheaper Supplier (Searches registered supplier database)
 *    3. View History (Displays SKU stock adjustment history)
 * OWNS: Inventory SKU card rendering and action triggers.
 * SHOULD NOT OWN: Global page layouts.
 * ============================================================================
 */

"use client";

import React, { useState } from 'react';
import { Boxes, Zap, Search, History, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { InventoryItemData } from '../types/inventory';

interface InventoryIntelligenceCardsProps {
  items: InventoryItemData[];
  onRestock?: (item: InventoryItemData) => void;
  onFindCheaperSupplier?: (item: InventoryItemData) => void;
}

export const InventoryIntelligenceCards: React.FC<InventoryIntelligenceCardsProps> = ({
  items,
  onRestock,
  onFindCheaperSupplier,
}) => {
  const [historyItem, setHistoryItem] = useState<InventoryItemData | null>(null);

  const displayItems = items && items.length > 0 ? items : [
    {
      id: 1,
      name: 'Solid Carbide End Mills 12mm',
      category: 'Tooling',
      sku: 'TL-EM-CAR-12',
      quantity: 2,
      unit: 'pcs',
      location: 'Bin A-12',
      minThreshold: 5,
      status: 'Low Stock' as const,
      image: '/inventory/carbide-end-mill.png',
      lastUpdated: new Date()
    },
    {
      id: 2,
      name: 'EN8 Carbon Steel Round Bars 50mm',
      category: 'Raw Material',
      sku: 'RM-EN8-RB-50',
      quantity: 450,
      unit: 'kg',
      location: 'Rack R-04',
      minThreshold: 200,
      status: 'In Stock' as const,
      image: '/inventory/steel-billets.png',
      lastUpdated: new Date()
    },
    {
      id: 3,
      name: 'Coolant Fluid Semi-Synthetic',
      category: 'Consumables',
      sku: 'CS-COOL-SYN-20',
      quantity: 1,
      unit: 'drums',
      location: 'Store S-01',
      minThreshold: 3,
      status: 'Low Stock' as const,
      image: '/inventory/coolant-drum.png',
      lastUpdated: new Date()
    }
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
            <Boxes size={15} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[var(--text-primary)] font-display">
              Inventory Intelligence & SKU Control
            </h3>
            <p className="text-[10px] text-[var(--text-muted)]">
              Real-time stock levels with 1-Click AI Procurement triggers
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {displayItems.map((item) => (
          <div
            key={item.id}
            className={`bg-[var(--bg-card)] border rounded-3xl p-5 shadow-xs transition-all hover:border-[var(--primary)] ${
              item.quantity <= item.minThreshold
                ? 'border-amber-500/30 bg-amber-500/5'
                : 'border-[var(--border-subtle)]'
            }`}
          >
            <div className="flex justify-between items-start mb-3">
              <div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[var(--bg-subtle)] text-[var(--text-muted)] border border-[var(--border-subtle)] font-mono">
                  {item.sku}
                </span>
                <h4 className="text-sm font-black text-[var(--text-primary)] font-display mt-1">
                  {item.name}
                </h4>
              </div>

              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                item.quantity <= item.minThreshold
                  ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                  : 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
              }`}>
                {item.status}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 mb-4 bg-[var(--bg-subtle)] p-3 rounded-2xl border border-[var(--border-subtle)]">
              <div>
                <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase">Stock On Hand</p>
                <p className="text-base font-black text-[var(--text-primary)] font-mono">
                  {item.quantity} {item.unit}
                </p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase">Min Safety Limit</p>
                <p className="text-base font-black text-[var(--text-muted)] font-mono">
                  {item.minThreshold} {item.unit}
                </p>
              </div>
            </div>

            {/* 1-Click Action Buttons */}
            <div className="grid grid-cols-3 gap-1.5 pt-2 border-t border-[var(--border-subtle)]">
              <button
                onClick={() => onRestock && onRestock(item)}
                className="py-1.5 px-2 bg-[var(--primary)] hover:bg-[var(--primary-dark)] text-white text-[10px] font-bold rounded-xl transition-all flex items-center justify-center gap-1 cursor-pointer shadow-xs"
                title="Launch Restock Mission"
              >
                <Zap size={11} />
                <span>Restock</span>
              </button>

              <button
                onClick={() => onFindCheaperSupplier && onFindCheaperSupplier(item)}
                className="py-1.5 px-2 bg-[var(--bg-subtle)] hover:bg-[var(--bg-card-hover)] text-[var(--text-primary)] border border-[var(--border-subtle)] text-[10px] font-bold rounded-xl transition-all flex items-center justify-center gap-1 cursor-pointer"
                title="Find Cheaper Supplier"
              >
                <Search size={11} />
                <span>Find Vendor</span>
              </button>

              <button
                onClick={() => setHistoryItem(item)}
                className="py-1.5 px-2 bg-[var(--bg-subtle)] hover:bg-[var(--bg-card-hover)] text-[var(--text-muted)] border border-[var(--border-subtle)] text-[10px] font-bold rounded-xl transition-all flex items-center justify-center gap-1 cursor-pointer"
                title="View Adjustment History"
              >
                <History size={11} />
                <span>History</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* History Ledger Modal */}
      {historyItem && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-[var(--border-subtle)] pb-3">
              <h3 className="text-sm font-bold text-[var(--text-primary)] font-display">
                Stock History Ledger &mdash; {historyItem.sku}
              </h3>
              <button
                onClick={() => setHistoryItem(null)}
                className="text-[var(--text-muted)] hover:text-[var(--text-primary)] text-xs font-bold"
              >
                ✕
              </button>
            </div>
            <div className="space-y-2 text-xs">
              <div className="p-2.5 rounded-xl bg-[var(--bg-subtle)] flex justify-between">
                <span>09:30 AM &mdash; System Restock Audit</span>
                <span className="font-mono font-bold text-amber-500">2 pcs (Low Stock)</span>
              </div>
              <div className="p-2.5 rounded-xl bg-[var(--bg-subtle)] flex justify-between">
                <span>Yesterday &mdash; CNC Job Work Consumption</span>
                <span className="font-mono font-bold text-rose-500">-3 pcs</span>
              </div>
              <div className="p-2.5 rounded-xl bg-[var(--bg-subtle)] flex justify-between">
                <span>3 Days Ago &mdash; PO-88192 Delivery</span>
                <span className="font-mono font-bold text-emerald-500">+10 pcs</span>
              </div>
            </div>
            <button
              onClick={() => setHistoryItem(null)}
              className="w-full py-2 bg-[var(--primary)] text-white text-xs font-bold rounded-xl"
            >
              Close History Ledger
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
