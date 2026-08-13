"use client";

import React, { useState } from 'react';
import { 
  Send, 
  MessageSquare, 
  PhoneCall, 
  Mail, 
  AlertTriangle,
  Copy,
  Check
} from 'lucide-react';
import { DashboardLayout } from '@/components/DashboardLayout';
export const dynamic = "force-dynamic";
import { useBusinessData } from '@/context/BusinessDataContext';

export default function CollectionsAgentPage() {
  const { data } = useBusinessData();
  const [selectedCust, setSelectedCust] = useState<string>('');
  const [channel, setChannel] = useState<'Email' | 'WhatsApp' | 'Phone'>('Email');
  const [tone, setTone] = useState<'Gentle' | 'Professional' | 'Firm'>('Professional');
  const [draft, setDraft] = useState<string>('');
  const [generating, setGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [logStatus, setLogStatus] = useState<string | null>(null);

  const customers = data?.customer_intelligence?.customers || [];

  if (!selectedCust && customers.length > 0) {
    setSelectedCust(customers[0].key);
  }

  const activeCust = customers.find(c => c.key === selectedCust) || customers[0];

  const handleGenerateDraft = async () => {
    if (!activeCust || !data) return;
    setGenerating(true);
    setDraft('');
    setLogStatus(null);
    
    try {
      const res = await fetch("/api/collections/generate-outreach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          client: activeCust.name,
          delayedInvoices: activeCust.delayed_invoices,
          averageDelay: activeCust.avg_payment_delay,
          outstandingBalance: Math.round(activeCust.history.reduce((sum, h) => sum + (h.orders - h.payments), 0) * 100000),
          tone: tone.toLowerCase(),
          channel: channel.toLowerCase()
        })
      });

      if (!res.ok) throw new Error("Failed to contact outreach route");
      const result = await res.json();
      setDraft(result.content);
    } catch (e: any) {
      setDraft("Failed to generate outreach template: " + e.message);
    } finally {
      setGenerating(false);
    }
  };

  const handleLogSent = async () => {
    if (!activeCust || !draft) return;
    try {
      const res = await fetch("/api/collections/log-outreach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          client: activeCust.name,
          channel: channel.toLowerCase(),
          tone: tone.toLowerCase(),
          content: draft
        })
      });
      if (res.ok) {
        setLogStatus("Outreach reminder logged in PostgreSQL database successfully!");
        setTimeout(() => setLogStatus(null), 4000);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(draft);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <DashboardLayout activeRoute="/collections-agent">
      {data && (
        <div className="space-y-6 text-[var(--text-primary)]">
          <div>
            <h2 className="text-base font-black text-[var(--text-primary)] tracking-tight font-display">Collections & Smart Accounts Receivable Agent</h2>
            <p className="text-[11px] text-[var(--text-muted)] mt-0.5 font-sans">Leverage payment ledger history to identify high-risk receivables and generate custom, behavior-grounded recovery communication templates.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-3xl p-5 shadow-xs">
                <h3 className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider mb-4 font-display">Receivables Aging & Risk Tiering</h3>
                
                <div className="flex flex-col gap-3">
                  {customers.map((cust) => (
                    <div 
                      key={cust.key}
                      onClick={() => setSelectedCust(cust.key)}
                      className={`flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 p-4 rounded-2xl border transition-all cursor-pointer ${
                        selectedCust === cust.key 
                          ? 'border-[var(--primary)] bg-[var(--primary-subtle)]' 
                          : 'border-[var(--border-subtle)] bg-[var(--bg-card)] hover:border-[var(--primary)]/30'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs ${
                          cust.risk_score === 'High' ? 'bg-rose-500/15 text-rose-600 dark:text-rose-400' :
                          cust.risk_score === 'Medium' ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400' :
                          'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                        }`}>
                          {cust.name.charAt(0)}
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-[var(--text-primary)]">{cust.name}</h4>
                          <p className="text-[10px] text-[var(--text-muted)] mt-0.5">Share: {cust.revenue_share}% | Avg Delay: {cust.avg_payment_delay} Days</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end border-t sm:border-t-0 border-[var(--border-subtle)] pt-2 sm:pt-0">
                        <div className="text-left sm:text-right">
                          <p className="text-[10px] text-[var(--text-muted)]">Invoices Delayed</p>
                          <p className="text-xs font-bold text-[var(--text-primary)]">{cust.delayed_invoices} / {cust.total_invoices}</p>
                        </div>
                        
                        <span className={`px-2.5 py-0.5 text-[8px] font-bold border rounded-md uppercase tracking-wider ${
                          cust.risk_score === 'High' ? 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30' :
                          cust.risk_score === 'Medium' ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30' :
                          'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
                        }`}>
                          {cust.risk_score} Risk
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="lg:col-span-1 space-y-6">
              {activeCust && (
                <div className="bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-3xl p-5 shadow-xs flex flex-col justify-between h-full space-y-6">
                  <div>
                    <h3 className="text-xs font-bold text-[var(--primary)] uppercase tracking-wider mb-4 font-display">Collections Copilot</h3>
                    
                    <div className="bg-[var(--bg-subtle)] p-3.5 rounded-2xl border border-[var(--border-subtle)] mb-4">
                      <p className="text-[9px] text-[var(--text-muted)] uppercase tracking-wider font-display">Target Client</p>
                      <h4 className="text-xs font-bold text-[var(--text-primary)] mt-0.5">{activeCust.name}</h4>
                      
                      {activeCust.risk_score === 'High' && (
                        <div className="mt-2.5 p-2.5 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-start gap-2 text-[10px] text-rose-600 dark:text-rose-400 font-medium">
                          <AlertTriangle size={14} className="flex-shrink-0 mt-0.5" />
                          <span>High payment delay alert. Gemma recommends setting credit lock-out and requiring 30% advance on future tooling orders.</span>
                        </div>
                      )}
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider font-display mb-1.5 block">Outreach Channel</label>
                        <div className="grid grid-cols-3 gap-2">
                          {[
                            { name: 'Email', icon: Mail },
                            { name: 'WhatsApp', icon: MessageSquare },
                            { name: 'Phone', icon: PhoneCall }
                          ].map((ch) => (
                            <button
                              key={ch.name}
                              onClick={() => setChannel(ch.name as any)}
                              className={`p-2 rounded-xl border text-[10px] font-bold flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                                channel === ch.name 
                                  ? 'border-[var(--primary)] bg-[var(--primary-subtle)] text-[var(--primary)]' 
                                  : 'border-[var(--border-subtle)] bg-[var(--bg-card)] text-[var(--text-muted)] hover:border-[var(--primary)]/30'
                              }`}
                            >
                              <ch.icon size={14} />
                              <span>{ch.name}</span>
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider font-display mb-1.5 block">Outreach Tone</label>
                        <div className="grid grid-cols-3 gap-2">
                          {['Gentle', 'Professional', 'Firm'].map((t) => (
                            <button
                              key={t}
                              onClick={() => setTone(t as any)}
                              className={`py-1.5 px-2 rounded-xl border text-[10px] font-bold transition-all cursor-pointer ${
                                tone === t 
                                  ? 'border-[var(--primary)] bg-[var(--primary-subtle)] text-[var(--primary)]' 
                                  : 'border-[var(--border-subtle)] bg-[var(--bg-card)] text-[var(--text-muted)] hover:border-[var(--primary)]/30'
                              }`}
                            >
                              {t}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <button
                      onClick={handleGenerateDraft}
                      disabled={generating}
                      className="w-full py-2.5 bg-[var(--primary)] hover:bg-[var(--primary-dark)] disabled:opacity-50 text-white rounded-full text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      {generating ? 'Drafting outreach...' : 'Generate Outreach Draft'}
                    </button>

                    {draft && (
                      <div className="bg-[var(--bg-subtle)] border border-[var(--border-subtle)] p-4 rounded-2xl relative animate-fade-in space-y-3">
                        <p className="text-[9px] text-[var(--text-muted)] uppercase tracking-wider font-display">Generated Outreach Copy (Editable)</p>
                        
                        <textarea
                          value={draft}
                          onChange={(e) => setDraft(e.target.value)}
                          className="w-full h-44 text-[10px] leading-relaxed font-sans text-[var(--text-primary)] bg-transparent border-0 focus:ring-0 p-0 resize-y focus:outline-none scrollbar-thin"
                        />
                        
                        <button 
                          onClick={handleCopy}
                          className="absolute top-2.5 right-2.5 p-1.5 bg-[var(--bg-card)] border border-[var(--border-subtle)] hover:border-[var(--primary)]/30 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
                          title="Copy outreach draft"
                        >
                          {copied ? <Check size={12} className="text-emerald-600 dark:text-emerald-400" /> : <Copy size={12} />}
                        </button>

                        <div className="flex gap-2 justify-end pt-2 border-t border-[var(--border-subtle)]">
                          <button
                            onClick={handleLogSent}
                            className="px-3.5 py-1.5 bg-[var(--text-primary)] text-[var(--text-inverse)] hover:opacity-90 text-[9px] font-black uppercase rounded-full transition-colors cursor-pointer flex items-center gap-1"
                          >
                            <Send size={10} /> Mark as Sent
                          </button>
                        </div>
                      </div>
                    )}

                    {logStatus && (
                      <div className="p-3 bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold rounded-xl animate-pulse">
                        {logStatus}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
