'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ArrowRight, CheckCircle2, TrendingUp, AlertTriangle, 
  BatteryCharging, ShieldAlert, Sparkles, CheckSquare 
} from 'lucide-react';

interface StepProps {
  priorities: {
    pricing: string;
    cashflow: string;
    supplierRisk: string;
    suggestedTier: 'beginner' | 'intermediate' | 'expert';
  };
  profile: {
    category: 'Analog Invoicing' | 'Fragmented Document Shop' | 'High-Maintenance Excel' | 'Isolated Digital Shop' | 'Integrated System Shop';
    companyName: string;
    turnover: string;
    employees: number;
  };
}

export default function OnboardingSuccessStep({ priorities, profile }: StepProps) {
  const router = useRouter();
  const [selectedTier, setSelectedTier] = useState<'beginner' | 'intermediate' | 'expert'>(
    priorities.suggestedTier || 'beginner'
  );

  const handleFinish = () => {
    localStorage.setItem('sme_maturity_tier', selectedTier);
    router.push(`/dashboard?tier=${selectedTier}&tab=import`);
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-8 animate-fade-in">
      <div className="text-center space-y-3">
        <div className="inline-flex items-center justify-center h-14 w-14 rounded-full bg-emerald-100 text-emerald-600 mb-2">
          <CheckCircle2 className="h-8 w-8" />
        </div>
        <h2 className="text-3xl md:text-4xl font-display font-semibold tracking-tight text-foreground">
          Financial Calibration Complete
        </h2>
        <p className="text-sm text-text-muted max-w-md mx-auto">
          Gemma has classified your unit as an <span className="text-primary font-bold">{profile.category}</span>.
        </p>
      </div>

      {/* Suggested Actions based on Financial Categories */}
      <section className="bg-surface border border-border-subtle rounded-card p-6 md:p-8 shadow-soft space-y-5">
        <div className="flex items-center gap-2 pb-3 border-b border-border-subtle">
          <Sparkles className="h-5 w-5 text-primary" />
          <h3 className="font-display font-medium text-base text-foreground">
            Gemma Action Plan & System Integration
          </h3>
        </div>

        {profile.category === 'Analog Invoicing' && (
          <div className="space-y-4">
            <div className="text-xs text-text-muted leading-relaxed">
              <strong>Category Profile:</strong> Your shop relies on manual or paper-based invoicing methods. To streamline tracking, we have configured the following setup:
            </div>
            <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 space-y-3">
              <span className="text-xs font-bold text-primary block uppercase tracking-wider">Recommended Action: Enable OCR Scanner & PDF Upload</span>
              <p className="text-xs text-foreground leading-relaxed">
                Forward images or PDFs of physical supplier receipts directly to the WhatsApp agent, or drag and drop files onto the dashboard invoices screen to parse details automatically.
              </p>
            </div>
            <ul className="space-y-2 text-xs text-foreground">
              <li className="flex gap-2 items-center">
                <CheckSquare className="h-4 w-4 text-primary shrink-0" />
                <span>Activate WhatsApp document download and OCR triggers.</span>
              </li>
              <li className="flex gap-2 items-center">
                <CheckSquare className="h-4 w-4 text-primary shrink-0" />
                <span>Format mock invoices to verify parser extraction accuracies.</span>
              </li>
            </ul>
          </div>
        )}

        {profile.category === 'Fragmented Document Shop' && (
          <div className="space-y-4">
            <div className="text-xs text-text-muted leading-relaxed">
              <strong>Category Profile:</strong> Your shop operates using digital, but fragmented, loose text files or Word documents. We recommend mapping raw file headers:
            </div>
            <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 space-y-3">
              <span className="text-xs font-bold text-primary block uppercase tracking-wider">Recommended Action: PDF Field Extraction Mapper</span>
              <p className="text-xs text-foreground leading-relaxed">
                Map the extraction parameters (such as Client Name, Machined Items, Total Amount, and CGST/SGST Tax headers) to synchronize details into the central database.
              </p>
            </div>
          </div>
        )}

        {profile.category === 'High-Maintenance Excel' && (
          <div className="space-y-4">
            <div className="text-xs text-text-muted leading-relaxed">
              <strong>Category Profile:</strong> Your data is saved in structured spreadsheets, but mixed into a single chaotic sheet. We need to align columns:
            </div>
            <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 space-y-3">
              <span className="text-xs font-bold text-primary block uppercase tracking-wider">Recommended Action: Column Aligning Template Mapper</span>
              <p className="text-xs text-foreground leading-relaxed">
                Download our standard CSV onboarding template. Import your chaotic sheets, match columns (Client, Date, Amount), and let Gemma parse the logs to clean historical records.
              </p>
            </div>
          </div>
        )}

        {profile.category === 'Isolated Digital Shop' && (
          <div className="space-y-4">
            <div className="text-xs text-text-muted leading-relaxed">
              <strong>Category Profile:</strong> You use organized Excel templates per client, but store them offline as the final source of truth. Let's build baseline margins:
            </div>
            <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 space-y-3">
              <span className="text-xs font-bold text-primary block uppercase tracking-wider">Recommended Action: Import Spreadsheet History</span>
              <p className="text-xs text-foreground leading-relaxed">
                Upload your historical client logs from the past 3 months. Gemma will extract cost margins to calibrate live dashboard gauges and forecast payment risks.
              </p>
            </div>
          </div>
        )}

        {profile.category === 'Integrated System Shop' && (
          <div className="space-y-4">
            <div className="text-xs text-text-muted leading-relaxed">
              <strong>Category Profile:</strong> Your unit runs integrated accounting platforms (Tally, QuickBooks, Zoho). Let's ingest raw ledger dumps:
            </div>
            <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 space-y-3">
              <span className="text-xs font-bold text-primary block uppercase tracking-wider">Recommended Action: API Sync / JSON Ledger Dump</span>
              <p className="text-xs text-foreground leading-relaxed">
                Connect API authorization keys, or export and upload an XML/JSON ledger statement directly to the dashboard to sync complete active supplier databases instantly.
              </p>
            </div>
          </div>
        )}
      </section>

      {/* Priority Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="group bg-surface border border-border-subtle rounded-card p-6 shadow-soft hover:-translate-y-1 transition-all duration-300">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-background border border-border-subtle text-primary">
            <TrendingUp className="h-5 w-5" />
          </div>
          <span className="block text-[10px] font-semibold uppercase tracking-wider text-text-muted mt-5">Data Domain</span>
          <h3 className="text-base font-display font-medium text-foreground mt-1">Pricing Accuracy</h3>
          <span className="inline-block mt-3 text-xs bg-red-50 text-primary px-2.5 py-0.5 rounded-full font-medium">
            {priorities.pricing}
          </span>
        </div>

        <div className="group bg-surface border border-border-subtle rounded-card p-6 shadow-soft hover:-translate-y-1 transition-all duration-300">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-background border border-border-subtle text-primary">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <span className="block text-[10px] font-semibold uppercase tracking-wider text-text-muted mt-5">Data Domain</span>
          <h3 className="text-base font-display font-medium text-foreground mt-1">Cash Flow Health</h3>
          <span className="inline-block mt-3 text-xs bg-primary/10 text-primary px-2.5 py-0.5 rounded-full font-medium">
            {priorities.cashflow}
          </span>
        </div>

        <div className="group bg-surface border border-border-subtle rounded-card p-6 shadow-soft hover:-translate-y-1 transition-all duration-300">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-background border border-border-subtle text-primary">
            <BatteryCharging className="h-5 w-5" />
          </div>
          <span className="block text-[10px] font-semibold uppercase tracking-wider text-text-muted mt-5">Data Domain</span>
          <h3 className="text-base font-display font-medium text-foreground mt-1">Peenya Grid Risk</h3>
          <span className="inline-block mt-3 text-xs bg-amber-50 text-amber-600 px-2.5 py-0.5 rounded-full font-medium">
            {priorities.supplierRisk}
          </span>
        </div>
      </div>

      {/* Suggested Maturity Tier Selection Box */}
      <div className="bg-surface border border-border-subtle rounded-card p-6 md:p-8 shadow-soft">
        <div className="flex items-center gap-3 mb-4">
          <div className="h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
            <ShieldAlert className="h-4.5 w-4.5" />
          </div>
          <div>
            <h4 className="font-display font-medium text-base text-foreground leading-none">
              Suggested Presentation Tier
            </h4>
            <p className="text-xs text-text-muted mt-1.5">
              Based on your custom category choice, Gemma recommends the following dashboard layout:
            </p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 bg-background p-1.5 rounded-xl border border-border-subtle">
          {(['beginner', 'intermediate', 'expert'] as const).map((tier) => {
            const isSelected = selectedTier === tier;
            return (
              <button
                key={tier}
                type="button"
                onClick={() => setSelectedTier(tier)}
                className={`py-2.5 rounded-lg text-xs font-semibold capitalize font-sans transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-primary text-surface shadow-sm'
                    : 'text-text-muted hover:text-foreground'
                }`}
              >
                {tier} {priorities.suggestedTier === tier && '(Suggested)'}
              </button>
            );
          })}
        </div>
      </div>

      <div className="text-center pt-2">
        <button
          onClick={handleFinish}
          className="inline-flex items-center gap-2 bg-primary text-surface font-sans font-medium px-8 py-3.5 rounded-full hover:bg-primary-dark shadow-tactile transition-all duration-200 cursor-pointer"
        >
          <span>Open Gemma SME Dashboard</span>
          <ArrowRight className="h-4.5 w-4.5" />
        </button>
      </div>
    </div>
  );
}
