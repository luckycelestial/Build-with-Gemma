/**
 * ============================================================================
 * MODULE PURPOSE: Supplier Comparison Matrix Component
 * RESPONSIBILITIES:
 *  - Renders side-by-side vendor quotation comparison matrix.
 *  - Evaluates Price, Delivery Lead Time, Reliability, Quality, Previous Experience, Weighted Score, and Confidence %.
 * OWNS: Multi-supplier comparison table UI and recommendation badges.
 * SHOULD NOT OWN: DB CRUD directly.
 * ============================================================================
 */

"use client";

import React from 'react';
import { Award, CheckCircle2, Star, ShieldCheck, ArrowUpRight } from 'lucide-react';

export interface SupplierComparisonItem {
  id: number;
  supplierName: string;
  materialName: string;
  quotedPrice: number;
  deliveryDays: number;
  reliabilityRating: number; // 0-100
  qualityScore: number; // 0-100
  previousExperience: string;
  weightedScore: number; // 0-100
  confidencePercent: number; // 0-100
  recommended: boolean;
}

interface SupplierComparisonMatrixProps {
  comparisons?: SupplierComparisonItem[];
  onSelectSupplier?: (supplier: SupplierComparisonItem) => void;
}

export const SupplierComparisonMatrix: React.FC<SupplierComparisonMatrixProps> = ({
  comparisons,
  onSelectSupplier,
}) => {
  const displayItems: SupplierComparisonItem[] = comparisons && comparisons.length > 0 ? comparisons : [
    {
      id: 1,
      supplierName: 'Jigani Tooling Labs Ltd',
      materialName: 'Solid Carbide End Mills 12mm',
      quotedPrice: 4200,
      deliveryDays: 2,
      reliabilityRating: 94,
      qualityScore: 96,
      previousExperience: '14 orders completed (100% on-time)',
      weightedScore: 92.4,
      confidencePercent: 96,
      recommended: true
    },
    {
      id: 2,
      supplierName: 'Peenya Precision Steel Ltd',
      materialName: 'Solid Carbide End Mills 12mm',
      quotedPrice: 4450,
      deliveryDays: 1,
      reliabilityRating: 88,
      qualityScore: 90,
      previousExperience: '6 orders completed (1 delay)',
      weightedScore: 84.1,
      confidencePercent: 88,
      recommended: false
    },
    {
      id: 3,
      supplierName: 'CNC Hub Karnataka',
      materialName: 'Solid Carbide End Mills 12mm',
      quotedPrice: 3950,
      deliveryDays: 5,
      reliabilityRating: 78,
      qualityScore: 82,
      previousExperience: '2 orders completed',
      weightedScore: 76.5,
      confidencePercent: 81,
      recommended: false
    }
  ];

  return (
    <div className="bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-3xl p-6 shadow-xs space-y-4">
      <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center">
            <Award size={15} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[var(--text-primary)] font-display">
              Multi-Supplier Quotation Matrix & AI Recommendation
            </h3>
            <p className="text-[10px] text-[var(--text-muted)]">
              Weighted scoring based on price, delivery lead time, quality, and historical reliability
            </p>
          </div>
        </div>

        <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
          Gemma AI Evaluated
        </span>
      </div>

      {/* Comparison Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-xs text-left border-collapse">
          <thead>
            <tr className="border-b border-[var(--border-subtle)] text-[10px] uppercase text-[var(--text-muted)] tracking-wider font-bold">
              <th className="p-3">Supplier Name</th>
              <th className="p-3">Quoted Price</th>
              <th className="p-3">Lead Time</th>
              <th className="p-3">Reliability</th>
              <th className="p-3">Quality</th>
              <th className="p-3">Previous History</th>
              <th className="p-3">Weighted Score</th>
              <th className="p-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border-subtle)]">
            {displayItems.map((item) => (
              <tr
                key={item.id}
                className={`hover:bg-[var(--bg-subtle)] transition-all ${
                  item.recommended ? 'bg-purple-500/5 font-semibold' : ''
                }`}
              >
                <td className="p-3">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-[var(--text-primary)]">{item.supplierName}</span>
                    {item.recommended && (
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 text-[9px] font-black uppercase tracking-wider flex items-center gap-1">
                        <CheckCircle2 size={10} />
                        Recommended ({item.confidencePercent}%)
                      </span>
                    )}
                  </div>
                </td>

                <td className="p-3 font-mono font-bold text-[var(--text-primary)]">
                  ₹{item.quotedPrice.toLocaleString('en-IN')}/unit
                </td>

                <td className="p-3 font-mono text-[var(--text-muted)]">
                  {item.deliveryDays} {item.deliveryDays === 1 ? 'day' : 'days'}
                </td>

                <td className="p-3 font-mono text-emerald-500 font-bold">
                  {item.reliabilityRating}%
                </td>

                <td className="p-3 font-mono text-blue-500 font-bold">
                  {item.qualityScore}%
                </td>

                <td className="p-3 text-[11px] text-[var(--text-muted)]">
                  {item.previousExperience}
                </td>

                <td className="p-3 font-mono font-black text-purple-600 dark:text-purple-400">
                  {item.weightedScore}/100
                </td>

                <td className="p-3 text-right">
                  <button
                    onClick={() => onSelectSupplier && onSelectSupplier(item)}
                    className={`px-3 py-1.5 rounded-xl text-[10px] font-bold transition-all cursor-pointer shadow-xs ${
                      item.recommended
                        ? 'bg-[var(--primary)] text-white hover:bg-[var(--primary-dark)]'
                        : 'bg-[var(--bg-subtle)] text-[var(--text-primary)] border border-[var(--border-subtle)] hover:bg-[var(--bg-card-hover)]'
                    }`}
                  >
                    Select Vendor
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
