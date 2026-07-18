'use client';

import React, { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
  Building2, MapPin, ArrowRight, ArrowLeft 
} from 'lucide-react';

export interface BusinessProfile {
  companyName: string;
  industry: string;
  location: string;
  turnover: string;
  employees: number;
  trackingMethod: 'manual' | 'digital';
  primaryDataFormat?: 'pdf' | 'spreadsheet';
  excelStructure?: 'chaotic' | 'separate';
  syncsAccounting?: boolean;
  category: 'Analog Invoicing' | 'Fragmented Document Shop' | 'High-Maintenance Excel' | 'Isolated Digital Shop' | 'Integrated System Shop';
  suggestedTier: 'beginner' | 'intermediate' | 'expert';
}

interface StepProps {
  onNext: (profile: BusinessProfile) => void;
}

export default function BusinessProfileStep({ onNext }: StepProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const subStep = parseInt(searchParams.get('substep') || '1') || 1;

  const setSubStep = (newSub: number) => {
    router.push(`?step=profile&substep=${newSub}`);
  };
  
  // Screen 1: Simplified Profile details
  const [companyName, setCompanyName] = useState('Kumar CNC Machining Unit');
  const [location, setLocation] = useState('Peenya Industrial Area, Bengaluru');
  
  // Hardcoded or deferred profile parameters
  const [industry] = useState('CNC Manufacturers who make precision parts');
  const [turnover] = useState('₹3-8 crore');
  const [employees] = useState(22);

  // Decision Tree Parameters
  const [trackingMethod, setTrackingMethod] = useState<'manual' | 'digital'>('manual');
  const [primaryDataFormat, setPrimaryDataFormat] = useState<'pdf' | 'spreadsheet' | null>(null);
  const [excelStructure, setExcelStructure] = useState<'chaotic' | 'separate' | null>(null);
  const [syncsAccounting, setSyncsAccounting] = useState<boolean | null>(null);

  const handleNextSubStep = () => {
    if (subStep === 1) {
      setSubStep(2);
    } else if (subStep === 2) {
      if (trackingMethod === 'manual') {
        submitOnboarding('Analog Invoicing');
      } else {
        setSubStep(3);
      }
    } else if (subStep === 3) {
      if (primaryDataFormat === 'pdf') {
        submitOnboarding('Fragmented Document Shop');
      } else {
        setSubStep(4);
      }
    } else if (subStep === 4) {
      if (excelStructure === 'chaotic') {
        submitOnboarding('High-Maintenance Excel');
      } else {
        setSubStep(5);
      }
    } else if (subStep === 5) {
      if (syncsAccounting === false) {
        submitOnboarding('Isolated Digital Shop');
      } else {
        submitOnboarding('Integrated System Shop');
      }
    }
  };

  const handlePrevSubStep = () => {
    if (subStep === 2) {
      setSubStep(1);
    } else if (subStep === 3) {
      setSubStep(2);
    } else if (subStep === 4) {
      setSubStep(3);
    } else if (subStep === 5) {
      setSubStep(4);
    }
  };

  const submitOnboarding = (finalCat: BusinessProfile['category']) => {
    let tier: 'beginner' | 'intermediate' | 'expert' = 'beginner';
    if (finalCat === 'High-Maintenance Excel' || finalCat === 'Isolated Digital Shop') {
      tier = 'intermediate';
    } else if (finalCat === 'Integrated System Shop') {
      tier = 'expert';
    }

    onNext({
      companyName,
      industry,
      location,
      turnover,
      employees,
      trackingMethod,
      primaryDataFormat: primaryDataFormat || undefined,
      excelStructure: excelStructure || undefined,
      syncsAccounting: syncsAccounting !== null ? syncsAccounting : undefined,
      category: finalCat,
      suggestedTier: tier
    });
  };

  return (
    <div className="w-full max-w-lg mx-auto bg-surface border border-border-subtle rounded-card shadow-soft p-8 md:p-10 transition-all duration-300">
      
      {/* 🟢 SCREEN 1: Simplified Business Profile */}
      {subStep === 1 && (
        <div className="space-y-6 animate-fade-in">
          <div className="mb-6">
            <span className="text-xs font-semibold uppercase tracking-wider text-primary bg-primary/10 px-3 py-1 rounded-full">
              Screen 1: Profile
            </span>
            <h2 className="text-2xl font-display font-semibold tracking-tight text-foreground mt-4">
              Tell us about your business
            </h2>
            <p className="text-xs text-text-muted mt-1.5">
              Input standard CNC machining details to calibrate layout metrics.
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-foreground mb-1.5">
                Company Name
              </label>
              <div className="relative">
                <Building2 className="absolute left-4 top-3 h-4.5 w-4.5 text-text-muted" />
                <input
                  type="text"
                  required
                  className="w-full pl-12 pr-4 py-2.5 rounded-xl border border-border-subtle bg-background focus:outline-none focus:border-primary text-xs font-sans transition-all"
                  placeholder="e.g. Kumar CNC Machining Unit"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-foreground mb-1.5">
                Location
              </label>
              <div className="relative">
                <MapPin className="absolute left-4 top-3 h-4.5 w-4.5 text-text-muted" />
                <input
                  type="text"
                  required
                  className="w-full pl-12 pr-4 py-2.5 rounded-xl border border-border-subtle bg-background focus:outline-none focus:border-primary text-xs font-sans transition-all"
                  placeholder="e.g. Peenya Industrial Area, Bengaluru"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />
              </div>
            </div>
          </div>

          <button
            onClick={handleNextSubStep}
            className="w-full mt-6 bg-primary text-surface font-sans font-medium py-3 rounded-full hover:bg-primary-dark shadow-tactile transition-all duration-200 cursor-pointer flex items-center justify-center gap-1.5 text-xs"
          >
            <span>Proceed to Invoicing Mode</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* 🟢 SCREEN 2: Quote & Customer Invoice Tracking Method */}
      {subStep === 2 && (
        <div className="space-y-6 animate-fade-in">
          <div className="mb-6">
            <span className="text-xs font-semibold uppercase tracking-wider text-primary bg-primary/10 px-3 py-1 rounded-full">
              Screen 2: Invoicing Method
            </span>
            <h2 className="text-2xl font-display font-semibold tracking-tight text-foreground mt-4">
              How do you issue quotes and track customer invoices?
            </h2>
            <p className="text-xs text-text-muted mt-1.5">
              Select your primary invoicing and job tracking medium.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4">
            <button
              onClick={() => { setTrackingMethod('manual'); }}
              className={`w-full text-left p-4 rounded-xl border transition-all cursor-pointer ${
                trackingMethod === 'manual'
                  ? 'border-primary bg-primary/5 text-foreground'
                  : 'border-border-subtle bg-background text-text-muted hover:border-primary/20'
              }`}
            >
              <div className="font-semibold text-xs text-foreground">Manual / Paper-based</div>
              <p className="text-[10px] text-text-muted mt-1">Written carbon copy invoice books or physical bills.</p>
            </button>

            <button
              onClick={() => { setTrackingMethod('digital'); }}
              className={`w-full text-left p-4 rounded-xl border transition-all cursor-pointer ${
                trackingMethod === 'digital'
                  ? 'border-primary bg-primary/5 text-foreground'
                  : 'border-border-subtle bg-background text-text-muted hover:border-primary/20'
              }`}
            >
              <div className="font-semibold text-xs text-foreground">Digital Formats</div>
              <p className="text-[10px] text-text-muted mt-1">Generated and sent using computer systems or spreadsheets.</p>
            </button>
          </div>

          <div className="flex gap-4 mt-6">
            <button
              onClick={handlePrevSubStep}
              className="flex-1 text-center py-2.5 rounded-full border border-border-subtle text-xs font-semibold text-text-muted hover:text-foreground hover:bg-zinc-50 cursor-pointer flex items-center justify-center gap-1"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> Back
            </button>
            <button
              onClick={handleNextSubStep}
              className="flex-1 bg-primary text-surface py-2.5 rounded-full hover:bg-primary-dark font-semibold text-xs cursor-pointer flex items-center justify-center gap-1"
            >
              <span>Continue</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* 🟢 SCREEN 3: Primary Data Format (If Digital) */}
      {subStep === 3 && (
        <div className="space-y-6 animate-fade-in">
          <div className="mb-6">
            <span className="text-xs font-semibold uppercase tracking-wider text-primary bg-primary/10 px-3 py-1 rounded-full">
              Screen 3: Primary Data Format
            </span>
            <h2 className="text-2xl font-display font-semibold tracking-tight text-foreground mt-4">
              What format is your primary sales & expense data in?
            </h2>
            <p className="text-xs text-text-muted mt-1.5">
              Select the file format used to record business details.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4">
            <button
              onClick={() => { setPrimaryDataFormat('pdf'); }}
              className={`w-full text-left p-4 rounded-xl border transition-all cursor-pointer ${
                primaryDataFormat === 'pdf'
                  ? 'border-primary bg-primary/5 text-foreground'
                  : 'border-border-subtle bg-background text-text-muted hover:border-primary/20'
              }`}
            >
              <div className="font-semibold text-xs text-foreground">Loose PDFs / Word Docs</div>
              <p className="text-[10px] text-text-muted mt-1">Emailed files or saved text documents per order.</p>
            </button>

            <button
              onClick={() => { setPrimaryDataFormat('spreadsheet'); }}
              className={`w-full text-left p-4 rounded-xl border transition-all cursor-pointer ${
                primaryDataFormat === 'spreadsheet'
                  ? 'border-primary bg-primary/5 text-foreground'
                  : 'border-border-subtle bg-background text-text-muted hover:border-primary/20'
              }`}
            >
              <div className="font-semibold text-xs text-foreground">Structured Spreadsheets</div>
              <p className="text-[10px] text-text-muted mt-1">Saved in Excel spreadsheets, CSVs, or Google Sheets.</p>
            </button>
          </div>

          <div className="flex gap-4 mt-6">
            <button
              onClick={handlePrevSubStep}
              className="flex-1 text-center py-2.5 rounded-full border border-border-subtle text-xs font-semibold text-text-muted hover:text-foreground hover:bg-zinc-50 cursor-pointer flex items-center justify-center gap-1"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> Back
            </button>
            <button
              onClick={handleNextSubStep}
              disabled={primaryDataFormat === null}
              className="flex-1 bg-primary text-surface py-2.5 rounded-full hover:bg-primary-dark font-semibold text-xs cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1"
            >
              <span>Continue</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* 🟢 SCREEN 4: Excel Structure (If Spreadsheets) */}
      {subStep === 4 && (
        <div className="space-y-6 animate-fade-in">
          <div className="mb-6">
            <span className="text-xs font-semibold uppercase tracking-wider text-primary bg-primary/10 px-3 py-1 rounded-full">
              Screen 4: Spreadsheet Structure
            </span>
            <h2 className="text-2xl font-display font-semibold tracking-tight text-foreground mt-4">
              How is the Excel sheet structured?
            </h2>
            <p className="text-xs text-text-muted mt-1.5">
              Select the formatting layout used inside your spreadsheets.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4">
            <button
              onClick={() => { setExcelStructure('chaotic'); }}
              className={`w-full text-left p-4 rounded-xl border transition-all cursor-pointer ${
                excelStructure === 'chaotic'
                  ? 'border-primary bg-primary/5 text-foreground'
                  : 'border-border-subtle bg-background text-text-muted hover:border-primary/20'
              }`}
            >
              <div className="font-semibold text-xs text-foreground">Single chaotic sheet</div>
              <p className="text-[10px] text-text-muted mt-1">All client jobs, expenses, and materials are mixed together.</p>
            </button>

            <button
              onClick={() => { setExcelStructure('separate'); }}
              className={`w-full text-left p-4 rounded-xl border transition-all cursor-pointer ${
                excelStructure === 'separate'
                  ? 'border-primary bg-primary/5 text-foreground'
                  : 'border-border-subtle bg-background text-text-muted hover:border-primary/20'
              }`}
            >
              <div className="font-semibold text-xs text-foreground">Separate sheets per client / template</div>
              <p className="text-[10px] text-text-muted mt-1">Organized tabs per supplier or structured templates.</p>
            </button>
          </div>

          <div className="flex gap-4 mt-6">
            <button
              onClick={handlePrevSubStep}
              className="flex-1 text-center py-2.5 rounded-full border border-border-subtle text-xs font-semibold text-text-muted hover:text-foreground hover:bg-zinc-50 cursor-pointer flex items-center justify-center gap-1"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> Back
            </button>
            <button
              onClick={handleNextSubStep}
              disabled={excelStructure === null}
              className="flex-1 bg-primary text-surface py-2.5 rounded-full hover:bg-primary-dark font-semibold text-xs cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1"
            >
              <span>Continue</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* 🟢 SCREEN 5: Sync with Accounting Software (If Separate Client Sheets) */}
      {subStep === 5 && (
        <div className="space-y-6 animate-fade-in">
          <div className="mb-6">
            <span className="text-xs font-semibold uppercase tracking-wider text-primary bg-primary/10 px-3 py-1 rounded-full">
              Screen 5: Systems Sync
            </span>
            <h2 className="text-2xl font-display font-semibold tracking-tight text-foreground mt-4">
              Do you sync this with accounting software?
            </h2>
            <p className="text-xs text-text-muted mt-1.5">
              Confirm if data is loaded into Tally, QuickBooks, Zoho, etc.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4">
            <button
              onClick={() => { setSyncsAccounting(true); }}
              className={`w-full text-left p-4 rounded-xl border transition-all cursor-pointer ${
                syncsAccounting === true
                  ? 'border-primary bg-primary/5 text-foreground'
                  : 'border-border-subtle bg-background text-text-muted hover:border-primary/20'
              }`}
            >
              <div className="font-semibold text-xs text-foreground">Yes, Synced</div>
              <p className="text-[10px] text-text-muted mt-1">Data synced to Tally, QuickBooks, or Zoho books.</p>
            </button>

            <button
              onClick={() => { setSyncsAccounting(false); }}
              className={`w-full text-left p-4 rounded-xl border transition-all cursor-pointer ${
                syncsAccounting === false
                  ? 'border-primary bg-primary/5 text-foreground'
                  : 'border-border-subtle bg-background text-text-muted hover:border-primary/20'
              }`}
            >
              <div className="font-semibold text-xs text-foreground">No, Excel is final source</div>
              <p className="text-[10px] text-text-muted mt-1">Excel sheets are the only records stored locally.</p>
            </button>
          </div>

          <div className="flex gap-4 mt-6">
            <button
              onClick={handlePrevSubStep}
              className="flex-1 text-center py-2.5 rounded-full border border-border-subtle text-xs font-semibold text-text-muted hover:text-foreground hover:bg-zinc-50 cursor-pointer flex items-center justify-center gap-1"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> Back
            </button>
            <button
              onClick={handleNextSubStep}
              disabled={syncsAccounting === null}
              className="flex-1 bg-primary text-surface py-2.5 rounded-full hover:bg-primary-dark font-semibold text-xs cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1"
            >
              <span>Calculate Outcomes</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
