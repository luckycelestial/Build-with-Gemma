"use client";

import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';

interface ThemeToggleProps {
  variant?: 'compact' | 'full';
  className?: string;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ variant = 'compact', className = '' }) => {
  const { theme, toggleTheme } = useTheme();

  if (variant === 'full') {
    return (
      <button
        onClick={toggleTheme}
        className={`flex items-center justify-between w-full p-2.5 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-subtle)] hover:bg-[var(--bg-card-hover)] transition-all cursor-pointer text-[var(--text-primary)] ${className}`}
        title={`Switch to ${theme === 'bright' ? 'Dark' : 'Bright'} Mode`}
      >
        <div className="flex items-center gap-2.5">
          <div className={`p-1.5 rounded-xl transition-colors ${
            theme === 'bright' ? 'bg-amber-500/15 text-amber-500' : 'bg-[var(--primary-subtle)] text-[var(--primary)]'
          }`}>
            {theme === 'bright' ? <Sun size={16} /> : <Moon size={16} />}
          </div>
          <span className="text-xs font-bold font-sans">
            {theme === 'bright' ? 'Bright Mode' : 'Dark Mode'}
          </span>
        </div>
        
        {/* Toggle Pill Switch */}
        <div className={`w-9 h-5 rounded-full p-0.5 transition-colors relative flex items-center ${
          theme === 'bright' ? 'bg-[var(--primary)]' : 'bg-[var(--bg-muted)]'
        }`}>
          <div className={`w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-200 ${
            theme === 'bright' ? 'translate-x-4' : 'translate-x-0'
          }`} />
        </div>
      </button>
    );
  }

  return (
    <button
      onClick={toggleTheme}
      className={`relative flex items-center gap-1 p-1 rounded-full border border-[var(--border-subtle)] bg-[var(--bg-subtle)] hover:bg-[var(--bg-card-hover)] transition-all cursor-pointer shadow-xs ${className}`}
      title={`Switch to ${theme === 'bright' ? 'Dark' : 'Bright'} Mode`}
      aria-label="Toggle Bright / Dark Mode"
    >
      <div className={`flex items-center justify-center w-7 h-7 rounded-full text-xs transition-all ${
        theme === 'bright' 
          ? 'bg-[var(--primary)] text-white shadow-sm font-bold' 
          : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
      }`}>
        <Sun size={14} />
      </div>
      <div className={`flex items-center justify-center w-7 h-7 rounded-full text-xs transition-all ${
        theme === 'dark' 
          ? 'bg-[var(--primary)] text-white shadow-sm font-bold' 
          : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
      }`}>
        <Moon size={14} />
      </div>
    </button>
  );
};

export default ThemeToggle;
