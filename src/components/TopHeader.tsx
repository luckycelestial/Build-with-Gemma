"use client";

import React from "react";
import { MessageSquare, Menu, Bell, Settings, RefreshCw, Upload } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";
import { TierSelector } from "@/components/TierSelector";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useExecutiveContext } from "@/context/ExecutiveContextProvider";

export interface TopHeaderProps {
  title?: string;
  businessName?: string;
  industry?: string;
  location?: string;
  onOpenMobileSidebar?: () => void;
  onLoadSample?: () => void;
  onTriggerUpload?: () => void;
  loading?: boolean;
}

export default function TopHeader({
  title,
  businessName,
  industry,
  location,
  onOpenMobileSidebar,
  onLoadSample,
  onTriggerUpload,
  loading = false,
}: TopHeaderProps) {
  const { theme } = useTheme();
  let setWhatsAppModalOpen: ((open: boolean) => void) | undefined;
  try {
    const ctx = useExecutiveContext();
    setWhatsAppModalOpen = ctx.setWhatsAppModalOpen;
  } catch {
    // Context fallback
  }

  return (
    <header className="sticky top-0 z-20 h-16 bg-[var(--bg-card)]/90 backdrop-blur-md border-b border-[var(--border-subtle)] px-4 md:px-6 flex items-center justify-between transition-colors shadow-xs">
      <div className="flex items-center gap-3 min-w-0">
        {onOpenMobileSidebar && (
          <button
            onClick={onOpenMobileSidebar}
            className="md:hidden p-2 rounded-xl text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-subtle)] transition-colors"
            aria-label="Open navigation menu"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}

        <div className="truncate">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="font-display font-bold text-base md:text-lg text-[var(--text-primary)] tracking-tight truncate">
              {businessName || title || "Meenakshi Precision Components"}
            </h1>
            <span className="text-[10px] bg-[var(--primary-subtle)] text-[var(--primary)] border border-[var(--primary)]/20 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider font-sans whitespace-nowrap">
              Gemma AI
            </span>
          </div>
          {(industry || location) && (
            <p className="text-[11px] text-[var(--text-muted)] truncate hidden sm:block">
              {industry || "CNC Precision Machining"} &mdash; {location || "Peenya, Bengaluru"}
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
        {setWhatsAppModalOpen && (
          <button
            onClick={() => setWhatsAppModalOpen!(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full text-xs font-bold transition-all shadow-xs cursor-pointer"
            title="Open WhatsApp Business Input Simulator"
          >
            <MessageSquare size={13} />
            <span className="hidden sm:inline">WhatsApp</span>
          </button>
        )}

        <div className="hidden sm:block">
          <TierSelector />
        </div>

        <ThemeToggle variant="compact" />

        {onLoadSample && (
          <button
            onClick={onLoadSample}
            disabled={loading}
            className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 bg-[var(--bg-subtle)] border border-[var(--border-subtle)] hover:bg-[var(--bg-card-hover)] text-[var(--text-primary)] rounded-full text-xs font-bold transition-all disabled:opacity-50 cursor-pointer"
            title="Load sample data"
          >
            <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
            <span>Sample</span>
          </button>
        )}

        {onTriggerUpload && (
          <button
            onClick={onTriggerUpload}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[var(--primary)] hover:bg-[var(--primary-dark)] text-white rounded-full text-xs font-bold transition-all shadow-sm disabled:opacity-50 cursor-pointer"
            title="Upload CSV dataset"
          >
            <Upload size={13} />
            <span className="hidden sm:inline">Upload</span>
          </button>
        )}
      </div>
    </header>
  );
}

export { TopHeader };
