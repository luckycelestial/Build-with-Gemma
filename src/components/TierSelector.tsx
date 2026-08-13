"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Compass, ChevronDown, Check, RotateCcw } from 'lucide-react';
import { useOnboarding, MaturityTier } from '@/context/OnboardingContext';

interface TierSelectorProps {
  variant?: 'compact' | 'full';
}

export const TierSelector: React.FC<TierSelectorProps> = () => {
  const { tier, setTier, openWizard } = useOnboarding();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getTierBadgeClass = (t: MaturityTier) => {
    switch (t) {
      case 'beginner': return 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30';
      case 'intermediate': return 'bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30';
      case 'expert': return 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30';
    }
  };

  const handleSelectTier = (t: MaturityTier) => {
    setTier(t);
    setIsOpen(false);
  };

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border transition-all cursor-pointer shadow-xs ${getTierBadgeClass(tier)}`}
        title="Change Presentation Mode / Re-run Onboarding"
      >
        <Compass size={13} />
        <span>{tier.charAt(0).toUpperCase() + tier.slice(1)} Mode</span>
        <ChevronDown size={13} className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-2xl shadow-xl z-50 p-1.5 space-y-1 animate-scale-up text-[var(--text-primary)] font-sans">
          <div className="px-3 py-1.5 text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider font-display border-b border-[var(--border-subtle)]">
            Select Presentation Tier
          </div>

          <button
            onClick={() => handleSelectTier('beginner')}
            className={`w-full flex items-center justify-between px-3 py-2 text-xs font-bold rounded-xl transition-colors cursor-pointer ${
              tier === 'beginner' ? 'bg-[var(--primary-subtle)] text-[var(--primary)]' : 'hover:bg-[var(--bg-card-hover)] text-[var(--text-primary)]'
            }`}
          >
            <span>Beginner (Action-First)</span>
            {tier === 'beginner' && <Check size={14} />}
          </button>

          <button
            onClick={() => handleSelectTier('intermediate')}
            className={`w-full flex items-center justify-between px-3 py-2 text-xs font-bold rounded-xl transition-colors cursor-pointer ${
              tier === 'intermediate' ? 'bg-[var(--primary-subtle)] text-[var(--primary)]' : 'hover:bg-[var(--bg-card-hover)] text-[var(--text-primary)]'
            }`}
          >
            <span>Intermediate (Balanced)</span>
            {tier === 'intermediate' && <Check size={14} />}
          </button>

          <button
            onClick={() => handleSelectTier('expert')}
            className={`w-full flex items-center justify-between px-3 py-2 text-xs font-bold rounded-xl transition-colors cursor-pointer ${
              tier === 'expert' ? 'bg-[var(--primary-subtle)] text-[var(--primary)]' : 'hover:bg-[var(--bg-card-hover)] text-[var(--text-primary)]'
            }`}
          >
            <span>Expert (Full Suite)</span>
            {tier === 'expert' && <Check size={14} />}
          </button>

          <div className="border-t border-[var(--border-subtle)] pt-1 mt-1">
            <button
              onClick={() => {
                setIsOpen(false);
                openWizard();
              }}
              className="w-full flex items-center gap-2 px-3 py-2 text-xs font-bold text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card-hover)] rounded-xl transition-colors cursor-pointer"
            >
              <RotateCcw size={13} />
              <span>Re-run Onboarding Wizard</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TierSelector;
