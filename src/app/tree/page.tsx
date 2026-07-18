'use client';

import React from 'react';
import Link from 'next/link';
import { Cpu, ArrowRight, Layout, Database, Milestone, Eye } from 'lucide-react';

interface NodeProps {
  title: string;
  route: string;
  description: string;
  badge?: string;
  badgeColor?: string;
}

function ScreenNode({ title, route, description, badge, badgeColor }: NodeProps) {
  return (
    <div className="group relative bg-surface border border-border-subtle rounded-card p-6 shadow-soft hover:-translate-y-1 hover:border-primary/30 transition-all duration-300">
      <div className="absolute -right-8 -bottom-8 h-20 w-20 bg-primary/5 rounded-full blur-2xl group-hover:bg-primary/10 transition-all duration-300"></div>
      
      <div className="flex justify-between items-start mb-2">
        <h4 className="font-display font-semibold text-base text-foreground group-hover:text-primary transition-colors">
          {title}
        </h4>
        {badge && (
          <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${badgeColor || 'bg-primary/10 text-primary'}`}>
            {badge}
          </span>
        )}
      </div>

      <code className="text-[10px] font-mono text-zinc-500 bg-background border border-border-subtle rounded px-2 py-0.5 block w-fit mb-4">
        {route}
      </code>

      <p className="text-xs text-text-muted leading-relaxed mb-4">
        {description}
      </p>

      {route.startsWith('/') && (
        <Link 
          href={route} 
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:text-primary-dark cursor-pointer mt-auto"
        >
          <span>Open Screen</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      )}
    </div>
  );
}

export default function TreePage() {
  return (
    <div className="min-h-screen bg-background text-foreground font-sans flex flex-col">
      {/* Header */}
      <header className="px-6 py-4 bg-surface border-b border-border-subtle flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-9 w-9 rounded-xl bg-primary flex items-center justify-center text-surface shadow-tactile">
            <Cpu className="h-5 w-5" />
          </div>
          <span className="font-display font-semibold text-lg tracking-tight">
            Gemma SME <span className="text-primary">Orchestrator</span>
          </span>
        </div>
        <div className="text-xs text-text-muted">
          Application Screen Architecture Map
        </div>
      </header>

      {/* Main Map */}
      <main className="flex-1 max-w-5xl mx-auto w-full p-6 md:p-10 space-y-12">
        <div className="space-y-3 text-center md:text-left">
          <h1 className="text-3xl md:text-4xl font-display font-semibold tracking-tight text-foreground">
            App Map & Screen Tree
          </h1>
          <p className="text-sm text-text-muted max-w-xl">
            This visual map illustrates the flow of screens and background routes running on <code className="bg-surface border border-border-subtle px-1.5 py-0.5 rounded font-mono text-xs">localhost:3000</code>.
          </p>
        </div>

        {/* Level 1: Root */}
        <section className="space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-text-muted flex items-center gap-2">
            <Milestone className="h-4 w-4 text-primary" />
            <span>Root Entrypoint</span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <ScreenNode
              title="Home Redirect"
              route="/"
              description="Automatically detects request on root path and redirects to the Onboarding wizard flow."
              badge="Redirect"
              badgeColor="bg-zinc-100 text-text-muted"
            />
          </div>
        </section>

        {/* Level 2: Onboarding */}
        <section className="space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-text-muted flex items-center gap-2">
            <Layout className="h-4 w-4 text-primary" />
            <span>Onboarding Flow Wizard</span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <ScreenNode
              title="Business Profile"
              route="/onboarding"
              description="Step 1: Dynamic branching wizard following the Financial Data Onboarding decision tree. Captures invoicing formats, spreadsheets layout, and sync metrics."
              badge="Step 1"
            />
            <ScreenNode
              title="Gemma Calibration"
              route="/onboarding"
              description="Step 2: Interactive chat dialogue with local Gemma core. User replies using simple conversational buttons."
              badge="Step 2"
            />
            <ScreenNode
              title="Category Summary"
              route="/onboarding"
              description="Step 3: Classifies shop into one of five categories (Analog Invoicing, Fragmented Document Shop, High-Maintenance Excel, Isolated Digital Shop, or Integrated System Shop) and defines custom integration actions."
              badge="Step 3"
            />
          </div>
        </section>

        {/* Level 3: Dashboard Modes */}
        <section className="space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-text-muted flex items-center gap-2">
            <Eye className="h-4 w-4 text-primary" />
            <span>Dynamic SME Dashboard</span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <ScreenNode
              title="Beginner Layout"
              route="/dashboard?tier=beginner"
              description="Simplified action-first checklist UI. Hides advanced charts, tables, and sensitivity sliders. Short plain-text tone."
              badge="Beginner Mode"
              badgeColor="bg-emerald-50 text-emerald-600"
            />
            <ScreenNode
              title="Intermediate Layout"
              route="/dashboard?tier=intermediate"
              description="Adds revenue/margin summaries, buyer payment delay cards, and preset what-if sliders. Contextual advisory tone."
              badge="Intermediate Mode"
              badgeColor="bg-amber-50 text-amber-600"
            />
            <ScreenNode
              title="Expert Layout"
              route="/dashboard?tier=expert"
              description="Unlocks supply chain node statuses, churn sensitivity matrices, and advanced manual markup controllers."
              badge="Expert Mode"
              badgeColor="bg-red-50 text-primary"
            />
          </div>
        </section>

        {/* Level 4: Backend APIs */}
        <section className="space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-text-muted flex items-center gap-2">
            <Database className="h-4 w-4 text-primary" />
            <span>API Route Handlers</span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <ScreenNode
              title="Gemma Reasoning LLM"
              route="/api/gemma"
              description="Connects to local Ollama. Formulates Suresh's plain-language reasoning output and mock tool call logs."
              badge="POST API"
              badgeColor="bg-purple-50 text-purple-600"
            />
            <ScreenNode
              title="Invoice Ingest"
              route="/api/invoices"
              description="Receives parsed WhatsApp supplier invoices and writes details directly to the PostgreSQL database."
              badge="GET/POST API"
              badgeColor="bg-purple-50 text-purple-600"
            />
            <ScreenNode
              title="Invoices List Page"
              route="/invoices"
              description="Displays all logged supplier invoices, total outstanding balances, and allows status toggle updates."
              badge="Page UI"
              badgeColor="bg-emerald-50 text-emerald-600"
            />
            <ScreenNode
              title="Visual Screen Tree"
              route="/tree"
              description="Helper page listing the routing architecture and layout maps (this current view)."
              badge="Visualizer"
              badgeColor="bg-zinc-100 text-text-muted"
            />
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="py-4 text-center text-xs text-text-muted border-t border-border-subtle bg-surface/50 mt-auto">
        Gemma SME Orchestrator App Map • Secure Local Host Port 3000
      </footer>
    </div>
  );
}
