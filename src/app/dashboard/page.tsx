'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { 
  Cpu, Terminal, TrendingUp, IndianRupee, ShieldAlert, ArrowRight, 
  MessageSquare, Send, CheckCircle2, Upload, AlertCircle,
  Network, BarChart3, SlidersHorizontal, RefreshCw, AlertTriangle
} from 'lucide-react';

type TabType = 'home' | 'plan' | 'chat' | 'import' | 'alerts';

interface MetricCardProps {
  title: string;
  value: string;
  subtitle: string;
  trend: string;
  isNegativeTrend?: boolean;
  icon: React.ReactNode;
}

function StatCard({ title, value, subtitle, trend, isNegativeTrend, icon }: MetricCardProps) {
  return (
    <div className="group relative overflow-hidden bg-surface border border-border-subtle rounded-card p-6 shadow-soft transition-all duration-300 hover:-translate-y-1">
      <div className="absolute -right-8 -bottom-8 h-24 w-24 bg-primary/5 rounded-full blur-2xl group-hover:bg-primary/10 transition-all duration-300"></div>
      
      <div className="flex justify-between items-start">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-background border border-border-subtle text-primary transition-all duration-300 group-hover:bg-primary group-hover:text-surface">
          {icon}
        </div>
        <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${
          isNegativeTrend ? 'bg-red-50 text-primary' : 'bg-emerald-50 text-emerald-600'
        }`}>
          {trend}
        </span>
      </div>

      <span className="block text-[10px] font-semibold uppercase tracking-wider text-text-muted mt-5">
        {title}
      </span>
      <h3 className="text-2xl font-display font-semibold text-foreground mt-1">
        {value}
      </h3>
      <p className="text-xs text-text-muted mt-1">
        {subtitle}
      </p>
    </div>
  );
}

function DashboardContent() {
  const searchParams = useSearchParams();
  const [profile, setProfile] = useState<any>(null);
  const [tier, setTier] = useState<'beginner' | 'intermediate' | 'expert'>('beginner');
  const [activeTab, setActiveTab] = useState<TabType>('home');
  
  const [askInput, setAskInput] = useState('');
  const [chatLog, setChatLog] = useState<Array<{ role: 'user' | 'assistant'; text: string; logs?: string[] }>>([]);
  const [isAsking, setIsAsking] = useState(false);
  const [customMarkup, setCustomMarkup] = useState(8);

  // Simulated file upload states
  const [uploadedFile, setUploadedFile] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [extractedData, setExtractedData] = useState<any[] | null>(null);

  // Custom UI category setup states
  // 1. Analog Invoicing
  const [analogScanning, setAnalogScanning] = useState(false);
  const [analogResult, setAnalogResult] = useState<any | null>(null);
  // 2. Fragmented Document
  const [pdfMappingCoordinates, setPdfMappingCoordinates] = useState({ clientName: 'Region A (Header)', cgst: 'Region D (Footer)', total: 'Region E (Summary)' });
  const [pdfMappingSuccess, setPdfMappingSuccess] = useState(false);
  // 3. High-Maintenance Excel
  const [excelMappingColumns, setExcelMappingColumns] = useState({ supplierName: 'Party Name', materialName: 'Item Description', amount: 'Grand Total', dueDate: 'Due Date' });
  const [excelMappingSuccess, setExcelMappingSuccess] = useState(false);
  // 4. Isolated Digital
  const [historyMonths, setHistoryMonths] = useState(3);
  const [historyLogsSuccess, setHistoryLogsSuccess] = useState(false);
  // 5. Integrated System
  const [apiProvider, setApiProvider] = useState('Tally Prime');
  const [apiUrl, setApiUrl] = useState('http://localhost:9000/api/v1/sync');
  const [apiAuthKey, setApiAuthKey] = useState('tally_sec_auth_991823');
  const [apiSyncing, setApiSyncing] = useState(false);
  const [apiSyncSuccess, setApiSyncSuccess] = useState(false);

  // Weekly plan action states
  const [acceptedActions, setAcceptedActions] = useState<Record<string, 'pending' | 'accepted' | 'snoozed'>>({
    pricing: 'pending',
    payment: 'pending',
    purchase: 'pending',
  });

  // Load presentation tier on mount
  useEffect(() => {
    const urlTier = searchParams.get('tier') as any;
    const urlTab = searchParams.get('tab') as TabType;
    const localTier = localStorage.getItem('sme_maturity_tier') as any;
    const activeTier = urlTier || localTier || 'beginner';
    setTier(activeTier);
    if (urlTab) {
      setActiveTab(urlTab);
    }
    
    // Default chat logs based on tier
    resetChat(activeTier);

    // Retrieve onboarding profile
    const saved = localStorage.getItem('sme_onboarding_profile');
    if (saved) {
      try {
        setProfile(JSON.parse(saved));
      } catch (e) {}
    }
  }, [searchParams]);

  const resetChat = (activeTier: string) => {
    if (activeTier === 'expert') {
      setChatLog([
        {
          role: 'assistant',
          text: "A 5% price increase on CNC machining Product A improves projected margin by 1.8 points, but Customer Segment C shows higher churn sensitivity. Outstanding cash flow deficit is predicted at ₹2.5L next month, primarily driven by Raghav Industrial's 34 days delay.",
          logs: ["[Function Call: getPricingData() -> Returns: Steel rate increase: +12.4% over 14 days]"]
        }
      ]);
    } else if (activeTier === 'intermediate') {
      setChatLog([
        {
          role: 'assistant',
          text: "Your margin fell 2.1% this month, Suresh. The main drivers were the steel rate increase and delayed payments from Raghav Industrial. A 3% increase on your standard quotes should restore margin with limited risk.",
          logs: ["[Function Call: getPricingData() -> Returns: Steel inflation: 12.4%]"]
        }
      ]);
    } else {
      setChatLog([
        {
          role: 'assistant',
          text: "Steel costs rose this week in Peenya. I recommend increasing the price of Product A by 3% for new quotes to protect your margin without affecting your most price-sensitive customers.",
          logs: ["[Function Call: getPricingData() -> Returns: Steel +12.4%]"]
        }
      ]);
    }
  };

  const handleTierChange = (newTier: 'beginner' | 'intermediate' | 'expert') => {
    setTier(newTier);
    localStorage.setItem('sme_maturity_tier', newTier);
    resetChat(newTier);
  };

  const handleAskGemma = async (e: React.FormEvent | string) => {
    if (typeof e !== 'string') {
      e.preventDefault();
    }
    const userText = typeof e === 'string' ? e : askInput;
    if (!userText.trim() || isAsking) return;

    setAskInput('');
    setChatLog((prev) => [...prev, { role: 'user', text: userText }]);
    setIsAsking(true);

    try {
      const response = await fetch('/api/gemma', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{ role: 'user', content: userText }],
          tier: tier
        }),
      });
      const data = await response.json();
      if (data.text) {
        const lines = data.text.split('\n');
        const logs: string[] = [];
        const textLines: string[] = [];
        lines.forEach((line: string) => {
          if (line.trim().startsWith('[') && line.trim().endsWith(']')) {
            logs.push(line.trim());
          } else if (line.trim()) {
            textLines.push(line);
          }
        });

        setChatLog((prev) => [...prev, { 
          role: 'assistant', 
          text: textLines.join('\n'), 
          logs: logs 
        }]);
      }
    } catch (err) {
      setTimeout(() => {
        setChatLog((prev) => [...prev, {
          role: 'assistant',
          text: "Simulated offline response. Connect your local Ollama Gemma node to enable live reasoning models.",
          logs: ["[Offline Fallback Log]"]
        }]);
      }, 1000);
    } finally {
      setIsAsking(false);
    }
  };

  const handleAction = (key: string, type: 'pending' | 'accepted' | 'snoozed', rationale?: string) => {
    setAcceptedActions(prev => ({ ...prev, [key]: type }));
    if (rationale) {
      setChatLog(prev => [
        ...prev,
        { role: 'user', text: `Why should I: ${rationale}?` },
        { 
          role: 'assistant', 
          text: key === 'pricing' 
            ? "Gemma: Steel raw sheet rates in Peenya rose 12.4% over the last 14 days. If you keep quoting at the old rate, you absorb this entire loss. A 3% price adjustment keeps your margin stable with minimal customer churn risk."
            : key === 'payment'
            ? "Gemma: Raghav Industrial has missed their past 3 invoice cycles, averaging 34 days late. Following up now secures cash for your upcoming payroll without needing a working capital credit line."
            : "Gemma: Postponing the steel pipe order by 5 days matches your production schedule gap and saves ₹30,000 in immediate cash flow outlays, buffering next week's grid surcharge bills.",
          logs: key === 'pricing' ? ["[Function Call: getPricingData()]"] : key === 'payment' ? ["[Function Call: getCashFlowData()]"] : ["[Function Call: getSupplierRiskData()]"]
        }
      ]);
      setActiveTab('chat');
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground font-sans">
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
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 bg-background border border-border-subtle px-2.5 py-1.5 rounded-xl">
            <span className="text-[10px] uppercase font-bold text-text-muted">View Mode:</span>
            <select
              value={tier}
              onChange={(e) => handleTierChange(e.target.value as any)}
              className="bg-transparent text-xs font-semibold text-primary focus:outline-none cursor-pointer border-none p-0"
            >
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="expert">Expert</option>
            </select>
          </div>
          <div className="hidden md:flex items-center gap-1.5 text-xs text-text-muted bg-background border border-border-subtle rounded-xl px-2.5 py-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Postgres Connected</span>
          </div>
        </div>
      </header>

      {/* Padded layout body */}
      <main className="flex-1 max-w-6xl mx-auto w-full px-6 py-8 flex flex-col gap-6">
        {/* Navigation Tab Switched Container */}
        <div className="flex flex-wrap gap-2 border-b border-border-subtle pb-4">
          {(['home', 'plan', 'chat', 'import', 'alerts'] as const).map((t) => {
          const isSelected = activeTab === t;
          return (
            <button
              key={t}
              onClick={() => setActiveTab(t)}
              className={`px-4 py-2 rounded-full text-xs font-semibold capitalize font-sans transition-all cursor-pointer border ${
                isSelected
                  ? 'bg-primary text-surface border-primary shadow-sm'
                  : 'bg-surface text-text-muted hover:text-foreground border-border-subtle'
              }`}
            >
              {t === 'import' ? 'Import Data' : t === 'plan' ? 'Weekly Plan' : t === 'chat' ? 'Ask Gemma' : t}
            </button>
          );
        })}
      </div>

      {/* ==================== HOME TAB ==================== */}
      {activeTab === 'home' && (
        <div className="animate-fade-in space-y-8">
          
          {/* 🟢 CATEGORY 1: Analog Invoicing (No Digital) */}
          {profile?.category === 'Analog Invoicing' && (
            <div className="space-y-6 max-w-xl mx-auto text-foreground animate-fade-in">
              {/* Profile Card */}
              <div className="bg-surface border border-border-subtle rounded-card p-6 shadow-soft space-y-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary animate-pulse">
                    <Cpu className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="font-display font-semibold text-lg text-foreground">Suresh's CNC Shop Ledger</h2>
                    <span className="text-xs text-text-muted">Analog Invoicing Mode</span>
                  </div>
                </div>
                <p className="text-xs text-text-muted leading-relaxed">
                  Namaste Suresh. You rely on paper invoices. Use the quick OCR camera tool below to snap a bill, or check who you owe payment to.
                </p>
              </div>

              {/* Simple Scan Bill Box */}
              <div className="bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20 rounded-card p-6 shadow-soft space-y-4">
                <h3 className="font-display font-semibold text-sm text-foreground">Quick Paper Bill Camera Scan</h3>
                <p className="text-xs text-text-muted">Take a photo of a supplier receipt to log the payment details instantly.</p>
                {!analogResult ? (
                  <button
                    onClick={() => {
                      setAnalogScanning(true);
                      setTimeout(() => {
                        setAnalogScanning(false);
                        setAnalogResult({
                          supplierName: "Peenya Iron & Steel Yard",
                          materialName: "Standard MS Angle Plate",
                          amount: 145000,
                          dueDate: "2026-08-10",
                          tax: 26100,
                        });
                      }, 1800);
                    }}
                    className="w-full py-3 rounded-xl bg-primary hover:bg-primary-dark text-surface font-sans font-medium text-xs shadow-tactile cursor-pointer flex items-center justify-center gap-2"
                  >
                    {analogScanning ? "Scanning Paper Receipt..." : "📸 Simulate Snap & OCR Scan"}
                  </button>
                ) : (
                  <div className="bg-surface border border-border-subtle rounded-xl p-4 space-y-3 animate-fade-in text-xs">
                    <div className="font-semibold text-foreground border-b border-border-subtle pb-1.5 uppercase tracking-wider text-[10px]">Verify Extracted Bill Details</div>
                    <div className="space-y-1">
                      <div><strong>Supplier:</strong> {analogResult.supplierName}</div>
                      <div><strong>Material:</strong> {analogResult.materialName}</div>
                      <div><strong>Amount:</strong> ₹{analogResult.amount.toLocaleString('en-IN')}</div>
                    </div>
                    <button
                      onClick={async () => {
                        try {
                          await fetch('/api/invoices', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                              supplierName: analogResult.supplierName,
                              materialName: analogResult.materialName,
                              amount: analogResult.amount,
                              dueDate: new Date(analogResult.dueDate).toISOString(),
                              status: 'pending'
                            })
                          });
                          alert("Invoice saved to local database!");
                          setAnalogResult(null);
                        } catch (e) {
                          alert("Error logging invoice.");
                        }
                      }}
                      className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-surface rounded-lg font-semibold cursor-pointer text-center"
                    >
                      Save Bill to Dues Log
                    </button>
                  </div>
                )}
              </div>

              {/* Simple Dues Checklist */}
              <div className="bg-surface border border-border-subtle rounded-card p-6 shadow-soft space-y-4">
                <h3 className="font-display font-semibold text-sm text-foreground flex items-center justify-between">
                  <span>Dues to Suppliers</span>
                  <span className="text-[10px] text-text-muted uppercase font-bold">Unpaid Dues</span>
                </h3>
                <div className="space-y-3">
                  <div className="p-3 bg-zinc-50 border border-border-subtle rounded-xl flex justify-between items-center text-xs">
                    <div>
                      <span className="font-semibold text-foreground">Raghav Industrial Traders</span>
                      <span className="block text-[10px] text-text-muted">Due Date: 2026-07-28</span>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-primary block">₹4,80,000</span>
                      <a 
                        href="https://wa.me/919361779326?text=Hi%20Raghav,%20checking%20on%20the%20pending%20dues%20amount..." 
                        target="_blank" 
                        className="text-[10px] text-primary font-bold hover:underline"
                      >
                        Send WhatsApp Reminder
                      </a>
                    </div>
                  </div>

                  <div className="p-3 bg-zinc-50 border border-border-subtle rounded-xl flex justify-between items-center text-xs">
                    <div>
                      <span className="font-semibold text-foreground">Vikas Pressing Unit</span>
                      <span className="block text-[10px] text-text-muted">Due Date: 2026-08-05</span>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-foreground block">₹2,20,000</span>
                      <span className="text-[10px] text-emerald-600 font-medium">Wait for Call</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 2️⃣ CATEGORY 2: Somewhat Digital (Spreadsheets / Loose PDFs) */}
          {(profile?.category === 'Fragmented Document Shop' || 
            profile?.category === 'High-Maintenance Excel' || 
            profile?.category === 'Isolated Digital Shop') && (
            <div className="space-y-8 text-foreground animate-fade-in">
              <div className="bg-surface border border-border-subtle rounded-card p-6 md:p-8 shadow-soft relative overflow-hidden">
                <div className="absolute right-0 top-0 h-40 w-40 bg-primary/5 rounded-full blur-3xl"></div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                    <TrendingUp className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="font-display font-semibold text-xl text-foreground">Spreadsheet Margin Calibrator</h2>
                    <span className="text-xs text-text-muted capitalize">Maturity Mode: {tier}</span>
                  </div>
                </div>
                <p className="text-xs text-text-muted max-w-xl">
                  Suresh, since you save invoices offline or in client Excel sheets, Gemma parses historical uploads to calculate your average profit margins and raw steel inflations.
                </p>
              </div>

              {/* Historical Margin Grid Charts */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Visual Line Chart block */}
                <div className="bg-surface border border-border-subtle rounded-card p-6 shadow-soft space-y-4">
                  <h3 className="font-display font-semibold text-sm text-foreground">6-Month Margin Trend Calibrations</h3>
                  <div className="h-40 flex items-end justify-between gap-4 pt-4 border-b border-l border-zinc-200 px-4 pb-1">
                    {[
                      { month: "Jan", val: "18.1%", height: "h-20" },
                      { month: "Feb", val: "20.2%", height: "h-24" },
                      { month: "Mar", val: "15.4%", height: "h-16" },
                      { month: "Apr", val: "12.4%", height: "h-12" },
                      { month: "May", val: "24.1%", height: "h-28" },
                      { month: "Jun", val: "19.5%", height: "h-22" },
                    ].map((item, idx) => (
                      <div key={idx} className="flex-1 flex flex-col items-center gap-1.5">
                        <span className="text-[8px] font-mono text-primary font-bold">{item.val}</span>
                        <div className={`w-full ${item.height} bg-primary/80 hover:bg-primary rounded-t-sm transition-all duration-300`}></div>
                        <span className="text-[9px] text-text-muted mt-1">{item.month}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Status Column Maps */}
                <div className="bg-surface border border-border-subtle rounded-card p-6 shadow-soft space-y-4 flex flex-col justify-between">
                  <div>
                    <h3 className="font-display font-semibold text-sm text-foreground">Local Sheet Configurations</h3>
                    <p className="text-xs text-text-muted mt-1.5">Active column bindings mapping Excel templates to central database fields:</p>
                    <div className="mt-4 space-y-2 text-xs">
                      <div className="flex justify-between py-1.5 border-b border-border-subtle">
                        <span className="text-text-muted">Supplier Column:</span>
                        <span className="font-semibold text-foreground">Party Details Name</span>
                      </div>
                      <div className="flex justify-between py-1.5 border-b border-border-subtle">
                        <span className="text-text-muted">Rate Column:</span>
                        <span className="font-semibold text-foreground">Grand Total</span>
                      </div>
                      <div className="flex justify-between py-1.5 border-b border-border-subtle">
                        <span className="text-text-muted">Tax Column:</span>
                        <span className="font-semibold text-foreground">SGST Rate</span>
                      </div>
                    </div>
                  </div>
                  <button 
                    onClick={() => setActiveTab('import')} 
                    className="w-full py-2 bg-background border border-border-subtle text-foreground text-xs font-semibold rounded-lg hover:border-primary/30 transition-all cursor-pointer"
                  >
                    Adjust CSV Fields Mapping
                  </button>
                </div>
              </div>

              {/* Simple Metrics Strip */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard
                  title="Average Margin"
                  value="18.3%"
                  subtitle="Average CNC shop margin"
                  trend="Calibrated"
                  icon={<BarChart3 className="h-5 w-5" />}
                />
                <StatCard
                  title="Outstanding Invoices"
                  value="₹7,00,000"
                  subtitle="Overdue client spreadsheet items"
                  trend="High Risk"
                  isNegativeTrend={true}
                  icon={<IndianRupee className="h-5 w-5" />}
                />
                <StatCard
                  title="Raw Steel Inflation"
                  value="+12.4%"
                  subtitle="Hike over past 14 days"
                  trend="Hike Active"
                  isNegativeTrend={true}
                  icon={<TrendingUp className="h-5 w-5" />}
                />
              </div>
            </div>
          )}

          {/* 3️⃣ CATEGORY 3: Integrated System Shop (Fully Digital) */}
          {(profile?.category === 'Integrated System Shop' || !profile?.category) && (
            <div className="space-y-8 animate-fade-in text-foreground">
              {/* Gemma Action Digest Summary */}
              <section className="bg-surface border border-border-subtle rounded-card shadow-soft p-6 md:p-8 relative overflow-hidden">
                <div className="absolute right-0 top-0 h-40 w-40 bg-primary/5 rounded-full blur-3xl"></div>
                
                <div className="flex items-center gap-3 mb-6">
                  <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                    <Cpu className="h-5 w-5 animate-pulse" />
                  </div>
                  <div>
                    <h2 className="font-display font-semibold text-xl text-foreground">Gemma Weekly Action Digest</h2>
                    <p className="text-xs text-text-muted">
                      Advisor Mode: <span className="capitalize font-bold text-primary">{tier}</span>
                    </p>
                  </div>
                </div>

                <div className="space-y-4 font-sans text-sm md:text-base leading-relaxed text-foreground border-l-2 border-primary pl-4 py-1 bg-zinc-50/50 pr-4 rounded-r-xl">
                  {tier === 'beginner' && (
                    <p>
                      <strong>Namaste Suresh.</strong> Steel costs rose this week. Focus on increasing your price on new quotes by <strong>3%</strong>, and request Raghav Industrial to clear their overdue payment today.
                    </p>
                  )}
                  {tier === 'intermediate' && (
                    <p>
                      <strong>Namaste Suresh.</strong> Your margin fell <strong>2.1%</strong> this month. The main drivers were the steel rate increase and delayed payments from Raghav Industrial. A <strong>3% increase</strong> on Product A should restore margin with limited risk.
                    </p>
                  )}
                  {tier === 'expert' && (
                    <p>
                      <strong>Namaste Suresh.</strong> A <strong>5% price increase</strong> on Product A improves projected margin by <strong>1.8 points</strong>, but Customer Segment C shows higher churn sensitivity. If supplier delay exceeds <strong>7 days</strong>, cash-flow stress will rise in week 3.
                    </p>
                  )}
                </div>

                {/* Gemma logs toggle (expert check) */}
                {tier === 'expert' && (
                  <div className="mt-6">
                    <details className="group border border-border-subtle rounded-xl bg-[#171717] overflow-hidden" open={true}>
                      <summary className="flex items-center justify-between px-4 py-3 text-xs font-mono text-zinc-400 cursor-pointer list-none select-none hover:text-zinc-200">
                        <div className="flex items-center gap-2">
                          <Terminal className="h-3.5 w-3.5 text-primary" />
                          <span>Orchestrator Core Function Calls (Access pricing, cash flow, risk)</span>
                        </div>
                        <span className="text-[10px] text-zinc-500 group-open:rotate-180 transition-all duration-200">{" > "}</span>
                      </summary>
                      <div className="px-4 pb-4 pt-2 space-y-2 text-xs font-mono text-emerald-400/90 border-t border-zinc-800">
                        <div className="flex gap-2">
                          <span className="text-zinc-600">{" > "}</span>
                          <span>{"[Function Call: getPricingData() -> Returns: Steel rate increase: +12.4% over 14 days]"}</span>
                        </div>
                        <div className="flex gap-2">
                          <span className="text-zinc-600">{" > "}</span>
                          <span>{"[Function Call: getCashFlowData() -> Returns: Outstanding: ₹4,80,000, Deficit Forecast: ₹2.5L]"}</span>
                        </div>
                        <div className="flex gap-2">
                          <span className="text-zinc-600">{" > "}</span>
                          <span>{"[Function Call: getSupplierRiskData() -> Returns: Peenya Grid Power Outages: High (4h/wk)]"}</span>
                        </div>
                      </div>
                    </details>
                  </div>
                )}
              </section>

              {/* Simple Health Strip */}
              <section className="bg-surface border border-border-subtle rounded-card p-5 shadow-soft flex flex-wrap gap-4 items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] uppercase font-bold text-text-muted">Business Health:</span>
                  <span className="text-xs bg-emerald-50 text-emerald-600 px-2.5 py-0.5 rounded-full font-medium flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3" /> Pricing Stable
                  </span>
                  <span className="text-xs bg-red-50 text-primary px-2.5 py-0.5 rounded-full font-medium flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" /> Cash Deficit Warning
                  </span>
                </div>
                <button 
                  onClick={() => setActiveTab('chat')} 
                  className="text-xs font-semibold text-primary hover:text-primary-dark flex items-center gap-1 cursor-pointer"
                >
                  <span>Ask Gemma about this</span>
                  <ArrowRight className="h-3 w-3" />
                </button>
              </section>

              {/* Top 3 Action Cards */}
              <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Action 1: Pricing */}
                <div className="bg-surface border border-border-subtle rounded-card p-6 shadow-soft flex flex-col justify-between hover:border-primary/30 transition-all duration-300">
                  <div>
                    <div className="flex justify-between items-start mb-4">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                        High Priority
                      </span>
                      <span className="text-xs text-text-muted">Pricing</span>
                    </div>
                    <h4 className="text-base font-display font-medium text-foreground">
                      Adjust standard CNC quote markup by +3%
                    </h4>
                    <p className="text-xs text-text-muted mt-2">
                      Protects your margins from the 12.4% steel rate hike this week in Peenya.
                    </p>
                  </div>

                  <div className="mt-6 flex flex-col gap-2">
                    {acceptedActions.pricing === 'pending' ? (
                      <>
                        <button
                          onClick={() => handleAction('pricing', 'accepted')}
                          className="w-full py-2 rounded-full bg-primary text-surface text-xs font-semibold hover:bg-primary-dark shadow-tactile cursor-pointer"
                        >
                          Accept Recommendation
                        </button>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleAction('pricing', 'accepted', 'adjust standard quote markup by 3%')}
                            className="flex-1 py-1.5 rounded-full border border-border-subtle hover:border-primary/30 text-[11px] text-foreground font-semibold cursor-pointer"
                          >
                            Ask Why
                          </button>
                          <button
                            onClick={() => handleAction('pricing', 'snoozed')}
                            className="flex-1 py-1.5 rounded-full border border-border-subtle hover:bg-zinc-50 text-[11px] text-text-muted cursor-pointer"
                          >
                            Remind Later
                          </button>
                        </div>
                      </>
                    ) : (
                      <div className={`text-center py-2 rounded-full text-xs font-medium ${
                        acceptedActions.pricing === 'accepted' ? 'bg-emerald-50 text-emerald-600' : 'bg-zinc-100 text-text-muted'
                      }`}>
                        {acceptedActions.pricing === 'accepted' ? '✓ Action Accepted' : '⏳ Snoozed'}
                      </div>
                    )}
                  </div>
                </div>

                {/* Action 2: Cash Flow */}
                <div className="bg-surface border border-border-subtle rounded-card p-6 shadow-soft flex flex-col justify-between hover:border-primary/30 transition-all duration-300">
                  <div>
                    <div className="flex justify-between items-start mb-4">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                        Critical
                      </span>
                      <span className="text-xs text-text-muted">Cash Flow</span>
                    </div>
                    <h4 className="text-base font-display font-medium text-foreground">
                      Follow up on Raghav Industrial payment
                    </h4>
                    <p className="text-xs text-text-muted mt-2">
                      Invoice ₹4,80,000 is 34 days late. Gemma detects working capital squeeze.
                    </p>
                  </div>

                  <div className="mt-6 flex flex-col gap-2">
                    {acceptedActions.payment === 'pending' ? (
                      <>
                        <button
                          onClick={() => handleAction('payment', 'accepted')}
                          className="w-full py-2 rounded-full bg-primary text-surface text-xs font-semibold hover:bg-primary-dark shadow-tactile cursor-pointer"
                        >
                          Accept Action
                        </button>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleAction('payment', 'accepted', 'follow up on Raghav Industrial overdue payment')}
                            className="flex-1 py-1.5 rounded-full border border-border-subtle hover:border-primary/30 text-[11px] text-foreground font-semibold cursor-pointer"
                          >
                            Ask Why
                          </button>
                          <button
                            onClick={() => handleAction('payment', 'snoozed')}
                            className="flex-1 py-1.5 rounded-full border border-border-subtle hover:bg-zinc-50 text-[11px] text-text-muted cursor-pointer"
                          >
                            Remind Later
                          </button>
                        </div>
                      </>
                    ) : (
                      <div className={`text-center py-2 rounded-full text-xs font-medium ${
                        acceptedActions.payment === 'accepted' ? 'bg-emerald-50 text-emerald-600' : 'bg-zinc-100 text-text-muted'
                      }`}>
                        {acceptedActions.payment === 'accepted' ? '✓ Follow-up Initiated' : '⏳ Snoozed'}
                      </div>
                    )}
                  </div>
                </div>

                {/* Action 3: Supplier */}
                <div className="bg-surface border border-border-subtle rounded-card p-6 shadow-soft flex flex-col justify-between hover:border-primary/30 transition-all duration-300">
                  <div>
                    <div className="flex justify-between items-start mb-4">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
                        Medium
                      </span>
                      <span className="text-xs text-text-muted">Procurement</span>
                    </div>
                    <h4 className="text-base font-display font-medium text-foreground">
                      Postpone steel pipe order by 5 days
                    </h4>
                    <p className="text-xs text-text-muted mt-2">
                      Buffers working capital against upcoming grid tax bills.
                    </p>
                  </div>

                  <div className="mt-6 flex flex-col gap-2">
                    {acceptedActions.purchase === 'pending' ? (
                      <>
                        <button
                          onClick={() => handleAction('purchase', 'accepted')}
                          className="w-full py-2 rounded-full bg-primary text-surface text-xs font-semibold hover:bg-primary-dark shadow-tactile cursor-pointer"
                        >
                          Accept Action
                        </button>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleAction('purchase', 'accepted', 'postpone steel pipe purchase by 5 days')}
                            className="flex-1 py-1.5 rounded-full border border-border-subtle hover:border-primary/30 text-[11px] text-foreground font-semibold cursor-pointer"
                          >
                            Ask Why
                          </button>
                          <button
                            onClick={() => handleAction('purchase', 'snoozed')}
                            className="flex-1 py-1.5 rounded-full border border-border-subtle hover:bg-zinc-50 text-[11px] text-text-muted cursor-pointer"
                          >
                            Remind Later
                          </button>
                        </div>
                      </>
                    ) : (
                      <div className={`text-center py-2 rounded-full text-xs font-medium ${
                        acceptedActions.purchase === 'accepted' ? 'bg-emerald-50 text-emerald-600' : 'bg-zinc-100 text-text-muted'
                      }`}>
                        {acceptedActions.purchase === 'accepted' ? '✓ Postponed successfully' : '⏳ Snoozed'}
                      </div>
                    )}
                  </div>
                </div>
              </section>

              {/* Core Metrics Cards */}
              <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard
                  title="Pricing Index"
                  value="+12.4%"
                  subtitle="Steel Sheet average Peenya price rate"
                  trend="Raw Material Hike"
                  isNegativeTrend={true}
                  icon={<TrendingUp className="h-5 w-5" />}
                />
                <StatCard
                  title="Cash Flow Risk"
                  value="₹4,80,000"
                  subtitle="Outstanding invoices (Raghav Industrial)"
                  trend="High Late Risk"
                  isNegativeTrend={true}
                  icon={<IndianRupee className="h-5 w-5" />}
                />
                <StatCard
                  title="Power Grid Risk"
                  value="4 Hours"
                  subtitle="Avg weekly Peenya power outages"
                  trend="Outage Alert"
                  icon={<ShieldAlert className="h-5 w-5" />}
                />
              </section>

              {/* Dynamic layout sections for Intermediate/Expert */}
              {tier !== 'beginner' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 border-t border-border-subtle pt-8">
                  <div className="bg-surface border border-border-subtle rounded-card p-6">
                    <div className="flex items-center justify-between mb-4 border-b border-border-subtle pb-3">
                      <h3 className="font-display font-medium text-base text-foreground flex items-center gap-2">
                        <BarChart3 className="h-5 w-5 text-primary" />
                        <span>Customer Payment Risk Indicators</span>
                      </h3>
                      <span className="text-xs text-text-muted">Tally Records</span>
                    </div>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-3 bg-zinc-50/50 rounded-xl">
                        <div>
                          <span className="text-xs font-semibold text-foreground">Raghav Industrial Traders</span>
                          <span className="block text-[10px] text-text-muted">Auto Components Client</span>
                        </div>
                        <div className="text-right">
                          <span className="text-xs font-bold text-primary">₹4,80,000</span>
                          <span className="block text-[10px] text-primary bg-primary/10 rounded-full px-2 py-0.5 mt-1 font-medium">34 Days Overdue</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-zinc-50/50 rounded-xl">
                        <div>
                          <span className="text-xs font-semibold text-foreground">Vikas Pressing Unit</span>
                          <span className="block text-[10px] text-text-muted">CNC Tooling Buyer</span>
                        </div>
                        <div className="text-right">
                          <span className="text-xs font-bold text-foreground">₹2,20,000</span>
                          <span className="block text-[10px] text-amber-600 bg-amber-50 rounded-full px-2 py-0.5 mt-1 font-medium">15 Days Overdue</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-surface border border-border-subtle rounded-card p-6 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-4 border-b border-border-subtle pb-3">
                        <h3 className="font-display font-medium text-base text-foreground flex items-center gap-2">
                          <SlidersHorizontal className="h-5 w-5 text-primary" />
                          <span>What-If Simulator Presets</span>
                        </h3>
                        <span className="text-xs text-text-muted">Quick Calibration</span>
                      </div>
                      <p className="text-xs text-text-muted mb-4">
                        Select a market shift to run Gemma's custom reasoning models instantly.
                      </p>
                      <div className="grid grid-cols-1 gap-2.5">
                        <button
                          onClick={() => handleAskGemma("What happens if raw steel costs rise another 5% in Peenya?")}
                          className="w-full text-left bg-background hover:bg-primary/5 hover:border-primary border border-border-subtle rounded-xl p-3 text-xs font-sans text-foreground transition-all cursor-pointer flex justify-between items-center"
                        >
                          <span>📈 +5% Raw Steel price increase</span>
                          <ArrowRight className="h-3.5 w-3.5 text-primary" />
                        </button>
                        <button
                          onClick={() => handleAskGemma("Predict cash flow if Raghav Industrial pays 15 days later.")}
                          className="w-full text-left bg-background hover:bg-primary/5 hover:border-primary border border-border-subtle rounded-xl p-3 text-xs font-sans text-foreground transition-all cursor-pointer flex justify-between items-center"
                        >
                          <span>⏳ +15 Days late customer payment delay</span>
                          <ArrowRight className="h-3.5 w-3.5 text-primary" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {tier === 'expert' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 border-t border-border-subtle pt-8">
                  <div className="bg-surface border border-border-subtle rounded-card p-6">
                    <div className="flex items-center justify-between mb-4 border-b border-border-subtle pb-3">
                      <h3 className="font-display font-medium text-base text-foreground flex items-center gap-2">
                        <Network className="h-5 w-5 text-primary" />
                        <span>Supply Chain & Resource Nodes</span>
                      </h3>
                      <span className="text-xs text-emerald-600 font-medium">Auto Monitored</span>
                    </div>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-foreground">Imported Tooling Bits (Germany)</span>
                        <span className="text-primary bg-primary/10 rounded-full px-2 py-0.5 font-mono text-[10px]">7 Days delay</span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-foreground">Peenya Electricity Substation (BESCOM)</span>
                        <span className="text-amber-600 bg-amber-50 rounded-full px-2 py-0.5 font-mono text-[10px]">12% load shedding risk</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-surface border border-border-subtle rounded-card p-6 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-4 border-b border-border-subtle pb-3">
                        <h3 className="font-display font-medium text-base text-foreground flex items-center gap-2">
                          <SlidersHorizontal className="h-5 w-5 text-primary" />
                          <span>Advanced Quote Sensitivity Controller</span>
                        </h3>
                        <span className="text-xs text-text-muted">Simulate Override</span>
                      </div>
                      <div className="space-y-4">
                        <div>
                          <div className="flex justify-between text-xs font-semibold text-foreground mb-1.5">
                            <span>Interactive Quote Markup Override</span>
                            <span className="text-primary">{customMarkup}%</span>
                          </div>
                          <input
                            type="range"
                            min="1"
                            max="25"
                            className="w-full accent-primary bg-background rounded-lg h-1 border border-border-subtle"
                            value={customMarkup}
                            onChange={(e) => setCustomMarkup(parseInt(e.target.value))}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ==================== WEEKLY PLAN TAB ==================== */}
      {activeTab === 'plan' && (
        <div className="bg-surface border border-border-subtle rounded-card p-6 md:p-8 shadow-soft space-y-6 animate-fade-in text-foreground">
          <div className="border-b border-border-subtle pb-4">
            <h2 className="text-2xl font-display font-semibold text-foreground">Weekly Action Plan</h2>
            <p className="text-xs text-text-muted mt-1">Checklist calibrated by Gemma reasoning core.</p>
          </div>

          <div className="space-y-4">
            {/* Item 1 */}
            <div className="flex items-start gap-4 p-4 bg-zinc-50/50 border border-border-subtle rounded-xl">
              <input 
                type="checkbox" 
                checked={acceptedActions.pricing === 'accepted'} 
                onChange={() => handleAction('pricing', acceptedActions.pricing === 'accepted' ? 'pending' : 'accepted')}
                className="h-5 w-5 accent-primary rounded cursor-pointer mt-1" 
              />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs bg-red-50 text-primary px-2 py-0.5 rounded-full font-medium">High</span>
                  <span className="text-[10px] text-text-muted">Pricing</span>
                </div>
                <h4 className={`text-sm font-semibold mt-1.5 ${acceptedActions.pricing === 'accepted' ? 'line-through text-text-muted' : 'text-foreground'}`}>
                  Adjust quote markup by +3% for new orders
                </h4>
                <p className="text-xs text-text-muted mt-1">Protects margin from steel rate spike.</p>
              </div>
            </div>

            {/* Item 2 */}
            <div className="flex items-start gap-4 p-4 bg-zinc-50/50 border border-border-subtle rounded-xl">
              <input 
                type="checkbox" 
                checked={acceptedActions.payment === 'accepted'} 
                onChange={() => handleAction('payment', acceptedActions.payment === 'accepted' ? 'pending' : 'accepted')}
                className="h-5 w-5 accent-primary rounded cursor-pointer mt-1" 
              />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs bg-red-50 text-primary px-2 py-0.5 rounded-full font-medium">Critical</span>
                  <span className="text-[10px] text-text-muted">Collection</span>
                </div>
                <h4 className={`text-sm font-semibold mt-1.5 ${acceptedActions.payment === 'accepted' ? 'line-through text-text-muted' : 'text-foreground'}`}>
                  Collect overdue payment of ₹4,80,000 from Raghav Industrial
                </h4>
                <p className="text-xs text-text-muted mt-1">Invoice is 34 days overdue.</p>
              </div>
            </div>

            {/* Item 3 */}
            <div className="flex items-start gap-4 p-4 bg-zinc-50/50 border border-border-subtle rounded-xl">
              <input 
                type="checkbox" 
                checked={acceptedActions.purchase === 'accepted'} 
                onChange={() => handleAction('purchase', acceptedActions.purchase === 'accepted' ? 'pending' : 'accepted')}
                className="h-5 w-5 accent-primary rounded cursor-pointer mt-1" 
              />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs bg-amber-50 text-amber-600 px-2 py-0.5 rounded-full font-medium">Medium</span>
                  <span className="text-[10px] text-text-muted">Procurement</span>
                </div>
                <h4 className={`text-sm font-semibold mt-1.5 ${acceptedActions.purchase === 'accepted' ? 'line-through text-text-muted' : 'text-foreground'}`}>
                  Postpone steel pipe order by 5 days
                </h4>
                <p className="text-xs text-text-muted mt-1">Buffers working capital against upcoming grid tax bills.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==================== ASK GEMMA TAB ==================== */}
      {activeTab === 'chat' && (
        <div className="bg-surface border border-border-subtle rounded-card shadow-soft overflow-hidden flex flex-col h-[500px] animate-fade-in text-foreground">
          <div className="px-5 py-3 border-b border-border-subtle flex items-center justify-between bg-zinc-50/50">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-4.5 w-4.5 text-primary" />
              <h3 className="font-display font-medium text-sm text-foreground">Ask Gemma Anything</h3>
            </div>
            <span className="text-[10px] bg-primary/10 text-primary px-2.5 py-0.5 rounded-full font-bold capitalize">
              {tier} Tone Active
            </span>
          </div>
          
          <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-zinc-50/30">
            {chatLog.map((log, idx) => (
              <div key={idx} className={`flex flex-col ${log.role === 'user' ? 'items-end' : 'items-start'} space-y-1.5`}>
                {log.logs && log.logs.map((toolLog, lIdx) => (
                  <div key={lIdx} className="bg-[#171717] rounded-lg px-2.5 py-1 text-[10px] font-mono text-emerald-400 border border-zinc-800 shadow-sm max-w-sm">
                    {toolLog}
                  </div>
                ))}
                <div className={`px-4 py-2.5 rounded-2xl text-xs leading-relaxed max-w-sm shadow-sm ${
                  log.role === 'user'
                    ? 'bg-primary text-surface rounded-tr-sm font-medium'
                    : 'bg-surface border border-border-subtle text-foreground rounded-tl-sm'
                }`}>
                  {log.text}
                </div>
              </div>
            ))}
            {isAsking && (
              <div className="flex flex-col items-start space-y-1.5">
                <div className="bg-[#171717] rounded-lg px-2.5 py-1 text-[10px] font-mono text-zinc-400 flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary animate-ping"></span>
                  <span>Querying Gemma core...</span>
                </div>
                <div className="px-4 py-2 rounded-2xl rounded-tl-sm text-xs italic text-text-muted bg-surface border border-border-subtle">
                  Formulating plain-language response...
                </div>
              </div>
            )}
          </div>

          <div className="p-4 bg-surface border-t border-border-subtle space-y-3">
            {!isAsking && chatLog.length < 5 && (
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => handleAskGemma("Why is my cash tight this month?")}
                  className="text-[11px] text-foreground bg-background hover:bg-primary/5 hover:border-primary border border-border-subtle rounded-full px-3 py-1.5 transition-all cursor-pointer shadow-sm"
                >
                  ❓ Why is my cash tight this month?
                </button>
                <button
                  onClick={() => handleAskGemma("Should I raise prices now?")}
                  className="text-[11px] text-foreground bg-background hover:bg-primary/5 hover:border-primary border border-border-subtle rounded-full px-3 py-1.5 transition-all cursor-pointer shadow-sm"
                >
                  📈 Should I raise prices now?
                </button>
                <button
                  onClick={() => handleAskGemma("Which customer should I follow up with first?")}
                  className="text-[11px] text-foreground bg-background hover:bg-primary/5 hover:border-primary border border-border-subtle rounded-full px-3 py-1.5 transition-all cursor-pointer shadow-sm"
                >
                  👥 Which customer is high risk?
                </button>
              </div>
            )}

            <form 
              onSubmit={(e) => {
                e.preventDefault();
                handleAskGemma(askInput);
              }} 
              className="flex gap-2"
            >
              <input
                type="text"
                className="flex-1 bg-background border border-border-subtle rounded-full px-4 py-2 text-xs focus:outline-none focus:border-primary"
                placeholder="Ask Gemma a question..."
                value={askInput}
                disabled={isAsking}
                onChange={(e) => setAskInput(e.target.value)}
              />
              <button
                type="submit"
                disabled={isAsking || !askInput.trim()}
                className="h-8 px-4 rounded-full bg-primary hover:bg-primary-dark text-surface flex items-center justify-center gap-1 shadow-tactile transition-all cursor-pointer text-xs disabled:opacity-50"
              >
                <span>Ask</span>
                <Send className="h-3 w-3" />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ==================== IMPORT DATA TAB ==================== */}
      {activeTab === 'import' && (
        <div className="bg-surface border border-border-subtle rounded-card p-6 md:p-8 shadow-soft space-y-6 animate-fade-in text-foreground">
          <div className="border-b border-border-subtle pb-4 flex justify-between items-center">
            <div>
              <h2 className="text-xl font-display font-semibold text-foreground">
                {profile?.category ? `Module: ${profile.category}` : "Import Business Data"}
              </h2>
              <p className="text-xs text-text-muted mt-1">
                {profile?.category === 'Analog Invoicing' && "Scan paper bills or upload photo documents for automatic OCR ledger routing."}
                {profile?.category === 'Fragmented Document Shop' && "Map client invoice templates and bind bounding box extraction regions."}
                {profile?.category === 'High-Maintenance Excel' && "Match Excel or CSV column headers to align with the gemma_sme schema."}
                {profile?.category === 'Isolated Digital Shop' && "Upload past months of local spreadsheets to calibrate historical margins."}
                {profile?.category === 'Integrated System Shop' && "Configure Live Webhooks or Tally Prime API connectors to sync ledgers."}
                {!profile?.category && "Upload supplier quotes, invoices, or sheets without configuration."}
              </p>
            </div>
            <span className="text-[10px] uppercase font-bold text-primary bg-primary/10 px-2.5 py-1 rounded-full shrink-0">
              {profile?.category ? "Action Enabled" : "Generic Loader"}
            </span>
          </div>

          {/* 1️⃣ ANALOG INVOICING: Physical Bill OCR Scanner */}
          {profile?.category === 'Analog Invoicing' && (
            <div className="space-y-6 animate-fade-in">
              {!analogResult ? (
                <div className="border-2 border-dashed border-border-subtle hover:border-primary/40 rounded-xl p-10 text-center space-y-4 transition-all">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary mx-auto">
                    <Upload className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">Scan or upload a physical supplier bill</p>
                    <p className="text-xs text-text-muted mt-1">Supports raw photo uploads (JPG, PNG) or PDF scans</p>
                  </div>
                  <div className="flex justify-center gap-3 pt-2">
                    <button
                      onClick={() => {
                        setAnalogScanning(true);
                        setTimeout(() => {
                          setAnalogScanning(false);
                          setAnalogResult({
                            supplierName: "Peenya Iron & Steel Yard",
                            materialName: "Standard MS Angle Plate",
                            amount: 145000,
                            dueDate: "2026-08-10",
                            tax: 26100, // 18% GST
                          });
                        }, 2000);
                      }}
                      className="bg-primary text-surface text-xs font-semibold px-5 py-2 rounded-full hover:bg-primary-dark shadow-tactile cursor-pointer"
                      disabled={analogScanning}
                    >
                      {analogScanning ? "Running OCR Analysis..." : "Upload simulated paper bill receipt"}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-5 animate-fade-in">
                  <div className="bg-emerald-50/50 border border-emerald-100 rounded-xl p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center text-xs font-bold">
                        OCR
                      </div>
                      <div>
                        <span className="text-xs font-semibold text-foreground block">Simulated_Paper_Bill_Scan.jpg</span>
                        <span className="text-[10px] text-text-muted">Extracted using Gemma OCR core engine</span>
                      </div>
                    </div>
                    <button 
                      onClick={() => setAnalogResult(null)} 
                      className="text-xs text-primary font-medium hover:text-primary-dark cursor-pointer"
                    >
                      Scan Another
                    </button>
                  </div>

                  <div className="bg-surface border border-border-subtle rounded-xl p-5 space-y-4">
                    <div className="text-xs font-bold uppercase tracking-wider text-text-muted pb-2 border-b border-border-subtle">
                      AI Extracted Fields (Verify values below)
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-text-muted">Supplier Name</span>
                        <input type="text" className="w-full bg-background border border-border-subtle rounded-lg px-3 py-1.5 text-xs text-foreground mt-1" defaultValue={analogResult.supplierName} />
                      </div>
                      <div>
                        <span className="text-[10px] uppercase font-bold text-text-muted">Material Type</span>
                        <input type="text" className="w-full bg-background border border-border-subtle rounded-lg px-3 py-1.5 text-xs text-foreground mt-1" defaultValue={analogResult.materialName} />
                      </div>
                      <div>
                        <span className="text-[10px] uppercase font-bold text-text-muted">Total Amount (incl. Tax)</span>
                        <input type="text" className="w-full bg-background border border-border-subtle rounded-lg px-3 py-1.5 text-xs text-foreground mt-1" defaultValue={`₹${analogResult.amount.toLocaleString('en-IN')}`} />
                      </div>
                      <div>
                        <span className="text-[10px] uppercase font-bold text-text-muted">Extracted Tax</span>
                        <input type="text" className="w-full bg-background border border-border-subtle rounded-lg px-3 py-1.5 text-xs text-foreground mt-1" defaultValue={`₹${analogResult.tax.toLocaleString('en-IN')} (CGST/SGST)`} />
                      </div>
                    </div>

                    <button
                      onClick={async () => {
                        try {
                          await fetch('/api/invoices', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                              supplierName: analogResult.supplierName,
                              materialName: analogResult.materialName,
                              amount: analogResult.amount,
                              dueDate: new Date(analogResult.dueDate).toISOString(),
                              status: 'pending'
                            })
                          });
                          alert("Invoice successfully logged in local PostgreSQL database!");
                          setAnalogResult(null);
                          setActiveTab('home');
                        } catch (e) {
                          alert("Failed to save invoice.");
                        }
                      }}
                      className="bg-primary text-surface text-xs font-semibold px-6 py-2.5 rounded-full hover:bg-primary-dark shadow-tactile cursor-pointer"
                    >
                      Confirm and Save to Invoice Database
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 2️⃣ FRAGMENTED DOCUMENT SHOP: PDF Template Field Mapper */}
          {profile?.category === 'Fragmented Document Shop' && (
            <div className="space-y-6 animate-fade-in">
              {!pdfMappingSuccess ? (
                <div className="space-y-4">
                  <div className="bg-zinc-50 border border-border-subtle rounded-xl p-5 space-y-4">
                    <div className="text-xs font-bold uppercase tracking-wider text-text-muted pb-2 border-b border-border-subtle">
                      Map Coordinates on Client Invoice Template
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-[10px] uppercase font-bold text-text-muted mb-1">Client Name Region</label>
                        <select 
                          className="w-full bg-background border border-border-subtle rounded-lg px-3 py-1.5 text-xs text-foreground"
                          value={pdfMappingCoordinates.clientName}
                          onChange={(e) => setPdfMappingCoordinates(prev => ({ ...prev, clientName: e.target.value }))}
                        >
                          <option value="Region A (Header)">Region A (Top Header Left)</option>
                          <option value="Region B (Metadata)">Region B (Top Metadata Box)</option>
                          <option value="Region C (Items)">Region C (Middle Details Tab)</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase font-bold text-text-muted mb-1">CGST / SGST Region</label>
                        <select 
                          className="w-full bg-background border border-border-subtle rounded-lg px-3 py-1.5 text-xs text-foreground"
                          value={pdfMappingCoordinates.cgst}
                          onChange={(e) => setPdfMappingCoordinates(prev => ({ ...prev, cgst: e.target.value }))}
                        >
                          <option value="Region D (Footer)">Region D (Bottom GST Column)</option>
                          <option value="Region E (Summary)">Region E (Totals Details Row)</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase font-bold text-text-muted mb-1">Total Bill Amount Region</label>
                        <select 
                          className="w-full bg-background border border-border-subtle rounded-lg px-3 py-1.5 text-xs text-foreground"
                          value={pdfMappingCoordinates.total}
                          onChange={(e) => setPdfMappingCoordinates(prev => ({ ...prev, total: e.target.value }))}
                        >
                          <option value="Region E (Summary)">Region E (Bottom Summary Box)</option>
                          <option value="Region F (Total Words)">Region F (Words Summary Row)</option>
                        </select>
                      </div>
                    </div>

                    <div className="border border-dashed border-border-subtle rounded-xl p-6 text-center space-y-2 bg-background/50">
                      <div className="text-xs font-semibold text-text-muted">Template Visual Mapping Preview</div>
                      <div className="flex h-36 items-center justify-center bg-zinc-100 rounded-lg relative overflow-hidden">
                        <div className="absolute top-2 left-2 bg-primary/20 border border-primary text-[8px] px-1 py-0.5 rounded font-mono">Client Name Map: {pdfMappingCoordinates.clientName}</div>
                        <div className="absolute bottom-10 right-2 bg-amber-600/20 border border-amber-600 text-[8px] px-1 py-0.5 rounded font-mono">GST Map: {pdfMappingCoordinates.cgst}</div>
                        <div className="absolute bottom-2 right-2 bg-emerald-600/20 border border-emerald-600 text-[8px] px-1 py-0.5 rounded font-mono">Total Amount Map: {pdfMappingCoordinates.total}</div>
                        <span className="text-[10px] font-mono text-zinc-400">PDF PAGE PREVIEW</span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setPdfMappingSuccess(true);
                      setTimeout(() => {
                        setPdfMappingSuccess(false);
                        alert("PDF layout coordinates successfully registered! Gemma will use this template config for all future incoming Client PDFs.");
                        setActiveTab('home');
                      }, 2500);
                    }}
                    className="bg-primary text-surface text-xs font-semibold px-6 py-2.5 rounded-full hover:bg-primary-dark shadow-tactile cursor-pointer"
                  >
                    Register Mapping Coordinates Template
                  </button>
                </div>
              ) : (
                <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-5 text-center text-xs text-emerald-600 space-y-2">
                  <span className="font-bold block">✓ Template Registration Running...</span>
                  <p className="text-text-muted">Writing template coordinates schema to local disk config...</p>
                </div>
              )}
            </div>
          )}

          {/* 3️⃣ HIGH-MAINTENANCE EXCEL: Column Header Mapper */}
          {profile?.category === 'High-Maintenance Excel' && (
            <div className="space-y-6 animate-fade-in">
              {!excelMappingSuccess ? (
                <div className="space-y-5">
                  <div className="bg-[#171717] rounded-xl p-4 border border-zinc-800 text-xs font-mono text-emerald-400">
                    <span className="text-zinc-500 block mb-1"># Simulated Uploaded Sheet Headers Detected:</span>
                    <span>["Sl No", "Party Details Name", "Item Description", "Billing Rate", "SGST Rate", "Grand Total", "Due Date", "Remarks"]</span>
                  </div>

                  <div className="bg-surface border border-border-subtle rounded-xl p-5 space-y-4">
                    <div className="text-xs font-bold uppercase tracking-wider text-text-muted pb-2 border-b border-border-subtle">
                      Map CSV Columns to System Fields
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] uppercase font-bold text-text-muted mb-1">System field: Supplier Name</label>
                        <select 
                          className="w-full bg-background border border-border-subtle rounded-lg px-3 py-1.5 text-xs text-foreground"
                          value={excelMappingColumns.supplierName}
                          onChange={(e) => setExcelMappingColumns(prev => ({ ...prev, supplierName: e.target.value }))}
                        >
                          <option value="Party Details Name">Party Details Name</option>
                          <option value="Remarks">Remarks</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase font-bold text-text-muted mb-1">System field: Material Type</label>
                        <select 
                          className="w-full bg-background border border-border-subtle rounded-lg px-3 py-1.5 text-xs text-foreground"
                          value={excelMappingColumns.materialName}
                          onChange={(e) => setExcelMappingColumns(prev => ({ ...prev, materialName: e.target.value }))}
                        >
                          <option value="Item Description">Item Description</option>
                          <option value="Remarks">Remarks</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase font-bold text-text-muted mb-1">System field: Bill Amount</label>
                        <select 
                          className="w-full bg-background border border-border-subtle rounded-lg px-3 py-1.5 text-xs text-foreground"
                          value={excelMappingColumns.amount}
                          onChange={(e) => setExcelMappingColumns(prev => ({ ...prev, amount: e.target.value }))}
                        >
                          <option value="Grand Total">Grand Total</option>
                          <option value="Billing Rate">Billing Rate</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase font-bold text-text-muted mb-1">System field: Payment Due Date</label>
                        <select 
                          className="w-full bg-background border border-border-subtle rounded-lg px-3 py-1.5 text-xs text-foreground"
                          value={excelMappingColumns.dueDate}
                          onChange={(e) => setExcelMappingColumns(prev => ({ ...prev, dueDate: e.target.value }))}
                        >
                          <option value="Due Date">Due Date</option>
                          <option value="Remarks">Remarks</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setExcelMappingSuccess(true);
                      setTimeout(() => {
                        setExcelMappingSuccess(false);
                        alert("Excel column header configurations bound successfully! General Excel layouts will now import smoothly.");
                        setActiveTab('home');
                      }, 2500);
                    }}
                    className="bg-primary text-surface text-xs font-semibold px-6 py-2.5 rounded-full hover:bg-primary-dark shadow-tactile cursor-pointer"
                  >
                    Confirm & Bind Column Mapping Template
                  </button>
                </div>
              ) : (
                <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-5 text-center text-xs text-emerald-600 space-y-2">
                  <span className="font-bold block">✓ Saving configurations...</span>
                  <p className="text-text-muted">Creating local parser header mappings...</p>
                </div>
              )}
            </div>
          )}

          {/* 4️⃣ ISOLATED DIGITAL SHOP: Historical spreadsheet parser */}
          {profile?.category === 'Isolated Digital Shop' && (
            <div className="space-y-6 animate-fade-in">
              {!historyLogsSuccess ? (
                <div className="space-y-5">
                  <div className="bg-surface border border-border-subtle rounded-xl p-5 space-y-4">
                    <span className="text-xs font-bold text-foreground block">Select past months of Excel data to import:</span>
                    <div className="flex items-center gap-4">
                      <input 
                        type="range" 
                        min="1" 
                        max="6" 
                        className="flex-1 accent-primary h-1 bg-zinc-200 rounded" 
                        value={historyMonths}
                        onChange={(e) => setHistoryMonths(parseInt(e.target.value))}
                      />
                      <span className="text-xs font-bold bg-primary/10 text-primary px-3 py-1 rounded-full shrink-0">
                        {historyMonths} Months of Logs
                      </span>
                    </div>

                    <div className="border border-border-subtle bg-zinc-50/50 rounded-xl p-5 space-y-3">
                      <div className="text-[10px] uppercase font-bold text-text-muted">Simulated Historical Margins Trend Calibration</div>
                      <div className="h-28 flex items-end justify-between gap-3 pt-4 border-b border-l border-zinc-200 px-4 pb-1">
                        {Array.from({ length: historyMonths }).map((_, mIdx) => {
                          const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
                          const heights = ["h-16", "h-20", "h-14", "h-10", "h-24", "h-18"];
                          const margins = ["18.1%", "20.2%", "15.4%", "12.4%", "24.1%", "19.5%"];
                          return (
                            <div key={mIdx} className="flex-1 flex flex-col items-center gap-1.5">
                              <span className="text-[8px] font-mono text-primary font-bold">{margins[mIdx]}</span>
                              <div className={`w-full ${heights[mIdx]} bg-primary hover:bg-primary-dark rounded-t-sm transition-all duration-300`}></div>
                              <span className="text-[9px] text-text-muted mt-1">{months[mIdx]}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setHistoryLogsSuccess(true);
                      setTimeout(() => {
                        setHistoryLogsSuccess(false);
                        alert("Historical margins analysis complete! Gemma base pricing points calibrated.");
                        setActiveTab('home');
                      }, 2500);
                    }}
                    className="bg-primary text-surface text-xs font-semibold px-6 py-2.5 rounded-full hover:bg-primary-dark shadow-tactile cursor-pointer"
                  >
                    Trigger Historical Baseline Calibration
                  </button>
                </div>
              ) : (
                <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-5 text-center text-xs text-emerald-600 space-y-2">
                  <span className="font-bold block">✓ Calibrating pricing baselines...</span>
                  <p className="text-text-muted">Parsing historical raw metal inflation coefficients...</p>
                </div>
              )}
            </div>
          )}

          {/* 5️⃣ INTEGRATED SYSTEM SHOP: Tally & Zoho Live Connector */}
          {profile?.category === 'Integrated System Shop' && (
            <div className="space-y-6 animate-fade-in">
              <div className="bg-surface border border-border-subtle rounded-xl p-5 space-y-4">
                <div className="text-xs font-bold uppercase tracking-wider text-text-muted pb-2 border-b border-border-subtle flex justify-between items-center">
                  <span>API Integration Credentials</span>
                  <span className="text-[9px] bg-emerald-50 text-emerald-600 border border-emerald-100 rounded px-1.5">Auto-Verify</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-text-muted mb-1">Accounting System</label>
                    <select 
                      className="w-full bg-background border border-border-subtle rounded-lg px-3 py-1.5 text-xs text-foreground"
                      value={apiProvider}
                      onChange={(e) => setApiProvider(e.target.value)}
                    >
                      <option value="Tally Prime">Tally Prime ERP</option>
                      <option value="Zoho Books">Zoho Books</option>
                      <option value="QuickBooks Online">QuickBooks Online</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-text-muted mb-1">Live Endpoint Server URL</label>
                    <input 
                      type="text" 
                      className="w-full bg-background border border-border-subtle rounded-lg px-3 py-1.5 text-xs text-foreground" 
                      value={apiUrl}
                      onChange={(e) => setApiUrl(e.target.value)}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-[10px] uppercase font-bold text-text-muted mb-1">API Secret Access Key / Token</label>
                    <input 
                      type="password" 
                      className="w-full bg-background border border-border-subtle rounded-lg px-3 py-1.5 text-xs text-foreground font-mono" 
                      value={apiAuthKey}
                      onChange={(e) => setApiAuthKey(e.target.value)}
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => {
                      setApiSyncing(true);
                      setTimeout(() => {
                        setApiSyncing(false);
                        setApiSyncSuccess(true);
                      }, 1500);
                    }}
                    disabled={apiSyncing}
                    className="bg-background border border-border-subtle hover:border-primary/30 text-foreground text-xs font-semibold px-4 py-2 rounded-full transition-all cursor-pointer shadow-sm disabled:opacity-50"
                  >
                    {apiSyncing ? "Testing Endpoint..." : "Test Connection Auth"}
                  </button>

                  <button
                    onClick={() => {
                      if (!apiSyncSuccess) {
                        alert("Please test and authorize credentials connection first!");
                        return;
                      }
                      alert("Tally ledger data synced successfully! Extracted invoices updated.");
                      setActiveTab('home');
                    }}
                    disabled={!apiSyncSuccess}
                    className="bg-primary text-surface text-xs font-semibold px-5 py-2 rounded-full hover:bg-primary-dark shadow-tactile cursor-pointer disabled:opacity-50"
                  >
                    Sync Live Ledger Accounts
                  </button>
                </div>

                {apiSyncSuccess && (
                  <div className="text-xs text-emerald-600 font-semibold flex items-center gap-1.5 mt-2 animate-fade-in">
                    <CheckCircle2 className="h-4 w-4" /> Endpoint online. Credentials verified. Ready to sync.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ==================== ALERTS TAB ==================== */}
      {activeTab === 'alerts' && (
        <div className="bg-surface border border-border-subtle rounded-card p-6 md:p-8 shadow-soft space-y-6 animate-fade-in text-foreground">
          <div className="border-b border-border-subtle pb-4">
            <h2 className="text-2xl font-display font-semibold text-foreground">Active Business Alerts</h2>
            <p className="text-xs text-text-muted mt-1">High-priority warning thresholds triggered by your local parameters.</p>
          </div>

          <div className="space-y-4">
            {/* Alert 1 */}
            <div className="flex gap-4 p-4 border border-red-100 bg-red-50/30 rounded-xl">
              <AlertTriangle className="h-5 w-5 text-primary shrink-0 mt-0.5" />
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-primary">Critical Cash Alert</span>
                <h4 className="text-sm font-semibold text-foreground mt-1">Raghav Industrial Traders is 34 days late</h4>
                <p className="text-xs text-text-muted mt-1">
                  Outstanding balance: ₹4,80,000. Collect from this customer today to prevent working capital gap next week.
                </p>
                <button
                  onClick={() => handleAskGemma("Draft a WhatsApp follow up message for Raghav Industrial Traders")}
                  className="mt-3 bg-primary text-surface text-[11px] font-semibold px-4 py-1.5 rounded-full hover:bg-primary-dark shadow-sm cursor-pointer"
                >
                  Draft WhatsApp Follow-up
                </button>
              </div>
            </div>

            {/* Alert 2 */}
            <div className="flex gap-4 p-4 border border-amber-100 bg-amber-50/30 rounded-xl">
              <ShieldAlert className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600">Material Cost Alert</span>
                <h4 className="text-sm font-semibold text-foreground mt-1">Steel sheet rates rose +12.4% in Bengaluru</h4>
                <p className="text-xs text-text-muted mt-1">
                  Supplier price hikes are now active. Adjust the pricing of standard quotes immediately to prevent margin reduction.
                </p>
                <button
                  onClick={() => handleAskGemma("How should I raise prices to absorb the 12.4% steel hike?")}
                  className="mt-3 bg-background border border-border-subtle text-foreground text-[11px] font-semibold px-4 py-1.5 rounded-full hover:border-primary/30 transition-all cursor-pointer shadow-sm"
                >
                  Adjust Price Quote
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>

      {/* Footer */}
      <footer className="py-4 text-center text-xs text-text-muted border-t border-border-subtle bg-surface/50 mt-12">
        Designed for owner-operators in Peenya Industrial Area • Local Gemma reasoning core • Secure Offline First
      </footer>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-[#fcfcfc] font-sans text-[#8e8e93]">
        <div className="flex flex-col items-center gap-2">
          <Cpu className="h-8 w-8 text-[#ff383c] animate-pulse" />
          <span>Calibrating dashboard metrics...</span>
        </div>
      </div>
    }>
      <DashboardContent />
    </Suspense>
  );
}
