"use client";

import React, { useState } from 'react';
import { 
  FileText, 
  Printer, 
  Sparkles, 
  Loader2, 
  FileCheck
} from 'lucide-react';
import { DashboardLayout } from '@/components/DashboardLayout';
export const dynamic = "force-dynamic";
import { useBusinessData } from '@/context/BusinessDataContext';
import { queryAIAnalyst } from '@/api-client/api';

export default function ReportsPage() {
  const { data } = useBusinessData();
  const [reportType, setReportType] = useState<'board' | 'cashflow' | 'ops'>('board');
  const [reportContent, setReportContent] = useState<string>('');
  const [generating, setGenerating] = useState(false);

  const handleGenerateReport = async () => {
    if (!data) return;
    setGenerating(true);
    setReportContent('');
    
    let promptSubject = "";
    if (reportType === 'board') {
      promptSubject = "Board of Directors Executive Summary briefing. Summarize our overall business health, monthly revenue average, 8-week ML forecast trends, highest risk accounts (like payment delays), and strategic material recommendations.";
    } else if (reportType === 'cashflow') {
      promptSubject = "Cash Flow & Credit Control Report. Detail accounts receivable collections warnings, concentration risk thresholds, and specific credit limit actions for primary clients.";
    } else {
      promptSubject = "Operational & Material Hedging Memo. Detail raw material cost projections (steel price rises), BOM margins impact, machine capacity optimization, and alternate supplier sources.";
    }

    const prompt = `
Generate a formal business consultation report matching:
Report Type: ${promptSubject}

Ground the report thoroughly in our business context for ${data.summary.business_name}:
Industry: ${data.summary.industry}
Location: ${data.summary.location}
Average Monthly Revenue: ${data.kpis.avg_monthly_revenue_lakh} Lakh
Business Risk Rating: ${data.kpis.business_risk_category} (${data.kpis.business_risk_score}/100)

Use clean Markdown formatting. Include a header section, bulleted key findings, structured tables for forecast values, and detailed numbered action roadmaps. Write in a formal, executive-consulting style.
`;

    try {
      const response = await queryAIAnalyst(prompt, [], data);
      setReportContent(response);
    } catch (e: any) {
      setReportContent("Failed to compile report: " + e.message);
    } finally {
      setGenerating(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <DashboardLayout activeRoute="/reports">
      {data && (
        <div className="space-y-6 max-w-4xl mx-auto no-print text-[var(--text-primary)]">
          <div>
            <h2 className="text-base font-black text-[var(--text-primary)] tracking-tight font-display">AI Executive Report Center</h2>
            <p className="text-[11px] text-[var(--text-muted)] mt-0.5 font-sans">Compile formal PDF-ready advisory briefs synthesizing internal metrics, supplier lead times, raw material cost indexes, and collection warnings.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Left: Template Selector */}
            <div className="md:col-span-1 space-y-4">
              <div className="bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-3xl p-5 shadow-xs">
                <h3 className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider mb-4 font-display">Select Report Template</h3>
                
                <div className="flex flex-col gap-2">
                  {[
                    { id: 'board', title: 'Board Briefing Memo', desc: 'High-level synthesis of margins, forecast and customer risk.' },
                    { id: 'cashflow', title: 'Credit Control Brief', desc: 'Receivables delay warnings and credit policies.' },
                    { id: 'ops', title: 'Operational Hedging Memo', desc: 'BOM margin impacts and supply chain alternatives.' }
                  ].map((tpl) => (
                    <button
                      key={tpl.id}
                      onClick={() => setReportType(tpl.id as any)}
                      className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                        reportType === tpl.id 
                          ? 'border-[var(--primary)] bg-[var(--primary-subtle)] text-[var(--primary)] font-bold' 
                          : 'border-[var(--border-subtle)] bg-[var(--bg-card)] text-[var(--text-muted)] hover:border-[var(--primary)]/30'
                      }`}
                    >
                      <h4 className="text-xs font-bold text-[var(--text-primary)]">{tpl.title}</h4>
                      <p className="text-[9px] text-[var(--text-muted)] mt-1 leading-snug">{tpl.desc}</p>
                    </button>
                  ))}
                </div>

                <button
                  onClick={handleGenerateReport}
                  disabled={generating}
                  className="w-full py-2.5 bg-[var(--primary)] hover:bg-[var(--primary-dark)] disabled:opacity-50 text-white rounded-full text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5 mt-6 cursor-pointer"
                >
                  {generating ? (
                    <>
                      <Loader2 size={12} className="animate-spin" />
                      <span>Compiling Brief...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles size={12} />
                      <span>Compile Report</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Right: Preview Block */}
            <div className="md:col-span-2 space-y-4">
              <div className="bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-3xl p-6 shadow-xs min-h-[50vh] flex flex-col justify-between">
                {reportContent ? (
                  <div className="space-y-6">
                    <div className="flex justify-between items-center border-b border-[var(--border-subtle)] pb-4 no-print">
                      <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold text-xs">
                        <FileCheck size={16} />
                        <span>Brief Compiled Successfully</span>
                      </div>
                      <div className="flex gap-2">
                        <button 
                          onClick={handlePrint}
                          className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[var(--bg-subtle)] border border-[var(--border-subtle)] hover:bg-[var(--bg-card-hover)] text-[var(--text-primary)] rounded-full text-[10px] font-bold transition-all cursor-pointer"
                        >
                          <Printer size={12} />
                          <span>Print Memo</span>
                        </button>
                      </div>
                    </div>

                    <div className="print-report text-xs text-[var(--text-primary)] leading-relaxed whitespace-pre-wrap font-sans bg-[var(--bg-subtle)] p-6 rounded-2xl border border-[var(--border-subtle)]">
                      {reportContent}
                    </div>
                  </div>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center text-center p-6 space-y-3">
                    <FileText size={36} className="text-[var(--text-muted)] animate-pulse" />
                    <div>
                      <h4 className="text-xs font-bold text-[var(--text-primary)] font-display">No Active Report Compiled</h4>
                      <p className="text-[10px] text-[var(--text-muted)] max-w-xs mt-1">Select a briefing template on the left and click Compile to feed business variables to the advisor engine.</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>
      )}

      <style jsx global>{`
        @media print {
          .no-print, header, nav, button {
            display: none !important;
          }
          .print-report {
            border: none !important;
            background: white !important;
            color: black !important;
            padding: 0 !important;
            font-size: 14px !important;
          }
        }
      `}</style>
    </DashboardLayout>
  );
}
