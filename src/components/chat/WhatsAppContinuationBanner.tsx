"use client";

import React from 'react';
import { LuMessageSquare, LuArrowRight } from 'react-icons/lu';

interface WhatsAppContinuationBannerProps {
  lastWhatsAppMsg?: string;
  timestamp?: string;
}

export const WhatsAppContinuationBanner: React.FC<WhatsAppContinuationBannerProps> = ({
  lastWhatsAppMsg = "Supplier invoice logged (₹45,000 - Peenya Steel)",
  timestamp = "Today 09:12 AM"
}) => {
  return (
    <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-300 flex items-center justify-between gap-3 text-xs">
      <div className="flex items-center gap-2.5 min-w-0">
        <div className="p-1.5 rounded-xl bg-emerald-500/20 shrink-0">
          <LuMessageSquare size={14} className="text-emerald-600" />
        </div>
        <div className="truncate">
          <span className="font-bold text-[10px] uppercase tracking-wider block text-emerald-800 dark:text-emerald-200">
            Continued from WhatsApp ({timestamp})
          </span>
          <p className="truncate font-medium text-xs text-emerald-900 dark:text-emerald-100">
            "{lastWhatsAppMsg}"
          </p>
        </div>
      </div>
      <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-emerald-500/20 shrink-0">
        Sync Active
      </span>
    </div>
  );
};
