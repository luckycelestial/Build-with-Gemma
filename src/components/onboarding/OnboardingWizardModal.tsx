"use client";

import React, { useState } from 'react';
import { 
  Sparkles, 
  X, 
  Check, 
  ArrowRight, 
  ArrowLeft,
  BookOpen,
  FileSpreadsheet,
  Building2,
  Calendar,
  Zap,
  DollarSign,
  TrendingUp,
  Boxes,
  Compass
} from 'lucide-react';
import { useOnboarding, OnboardingAnswers, MaturityTier } from '@/context/OnboardingContext';

export const OnboardingWizardModal: React.FC = () => {
  const { isWizardOpen, closeWizard, completeOnboarding, setTier } = useOnboarding();
  const [step, setStep] = useState<number>(1);
  const [answers, setAnswers] = useState<OnboardingAnswers>({
    trackingMethod: 'excel',
    reviewFrequency: 'monthly',
    primaryHelpNeed: 'pricing'
  });

  if (!isWizardOpen) return null;

  const handleNext = () => {
    if (step < 3) {
      setStep(step + 1);
    } else {
      setStep(4);
    }
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const getRecommendedTier = (): { tier: MaturityTier; title: string; desc: string } => {
    if (answers.trackingMethod === 'notebook' || answers.reviewFrequency === 'rarely') {
      return {
        tier: 'beginner',
        title: 'Beginner Mode (Action-First)',
        desc: 'Focuses on direct weekly recommendations, simple health strips, and clear plain-language guidance without overwhelming charts.'
      };
    } else if (answers.trackingMethod === 'software' && answers.reviewFrequency === 'weekly') {
      return {
        tier: 'expert',
        title: 'Expert Mode (Full Suite)',
        desc: 'Unlocks the full operational suite — SHAP waterfall drivers, supply-chain node explorer, simulation sliders, and dense ledger tables.'
      };
    }
    return {
      tier: 'intermediate',
      title: 'Intermediate Mode (Balanced)',
      desc: 'Combines actionable recommendations with financial trends, customer risk breakdowns, and forecast comparisons.'
    };
  };

  const recommendation = getRecommendedTier();

  const handleFinish = (chosenTier?: MaturityTier) => {
    const finalTier = chosenTier || recommendation.tier;
    completeOnboarding(answers);
    setTier(finalTier);
    closeWizard();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-[var(--bg-card)] rounded-3xl border border-[var(--border-subtle)] w-full max-w-2xl shadow-2xl p-6 sm:p-8 relative overflow-hidden animate-scale-up text-[var(--text-primary)] font-sans">
        
        {/* Top Header Bar */}
        <div className="flex justify-between items-center border-b border-[var(--border-subtle)] pb-4 mb-6">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-[var(--primary-subtle)] text-[var(--primary)] rounded-xl flex items-center justify-center">
              <Sparkles size={20} className="animate-pulse" />
            </div>
            <div>
              <h2 className="font-black text-[var(--text-primary)] tracking-tight text-base font-display flex items-center gap-2">
                FinCent Onboarding &mdash; Setup Your Experience
              </h2>
              <p className="text-xs text-[var(--text-muted)]">Tailoring Gemma intelligence for your manufacturing business</p>
            </div>
          </div>
          <button 
            onClick={closeWizard}
            className="p-1.5 hover:bg-[var(--bg-subtle)] rounded-full text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Progress Bar (Steps 1-3) */}
        {step <= 3 && (
          <div className="mb-6">
            <div className="flex justify-between items-center text-xs font-bold text-[var(--text-muted)] mb-2 font-display">
              <span>Step {step} of 3</span>
              <span>{step === 1 ? 'Tracking Method' : step === 2 ? 'Review Rhythm' : 'Primary Priority'}</span>
            </div>
            <div className="h-1.5 w-full bg-[var(--bg-subtle)] rounded-full overflow-hidden flex">
              <div 
                className="h-full bg-[var(--primary)] transition-all duration-300 rounded-full"
                style={{ width: `${(step / 3) * 100}%` }}
              />
            </div>
          </div>
        )}

        {/* Question 1: Tracking Method */}
        {step === 1 && (
          <div className="space-y-4 animate-fade-in">
            <div className="space-y-1">
              <h3 className="text-lg font-black text-[var(--text-primary)] font-display">How do you currently track your business?</h3>
              <p className="text-xs text-[var(--text-muted)]">This helps us format how data and recommendations are presented to you.</p>
            </div>

            <div className="grid grid-cols-1 gap-3 pt-2">
              <button
                type="button"
                onClick={() => setAnswers({ ...answers, trackingMethod: 'notebook' })}
                className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex items-start gap-3.5 ${
                  answers.trackingMethod === 'notebook'
                    ? 'border-[var(--primary)] bg-[var(--primary-subtle)] shadow-xs'
                    : 'border-[var(--border-subtle)] bg-[var(--bg-subtle)] hover:bg-[var(--bg-card-hover)]'
                }`}
              >
                <div className={`p-2.5 rounded-xl ${answers.trackingMethod === 'notebook' ? 'bg-[var(--primary)] text-white' : 'bg-[var(--bg-card)] text-[var(--text-muted)] border border-[var(--border-subtle)]'}`}>
                  <BookOpen size={20} />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-[var(--text-primary)] font-display">Notebook & Instinct</h4>
                  <p className="text-xs text-[var(--text-muted)] mt-0.5">I manage pricing, orders, and payments mainly from memory, WhatsApp, or shop notes.</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setAnswers({ ...answers, trackingMethod: 'excel' })}
                className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex items-start gap-3.5 ${
                  answers.trackingMethod === 'excel'
                    ? 'border-[var(--primary)] bg-[var(--primary-subtle)] shadow-xs'
                    : 'border-[var(--border-subtle)] bg-[var(--bg-subtle)] hover:bg-[var(--bg-card-hover)]'
                }`}
              >
                <div className={`p-2.5 rounded-xl ${answers.trackingMethod === 'excel' ? 'bg-[var(--primary)] text-white' : 'bg-[var(--bg-card)] text-[var(--text-muted)] border border-[var(--border-subtle)]'}`}>
                  <FileSpreadsheet size={20} />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-[var(--text-primary)] font-display">Excel & Spreadsheets</h4>
                  <p className="text-xs text-[var(--text-muted)] mt-0.5">I track customer orders and raw material quotes across Excel files and email threads.</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setAnswers({ ...answers, trackingMethod: 'software' })}
                className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex items-start gap-3.5 ${
                  answers.trackingMethod === 'software'
                    ? 'border-[var(--primary)] bg-[var(--primary-subtle)] shadow-xs'
                    : 'border-[var(--border-subtle)] bg-[var(--bg-subtle)] hover:bg-[var(--bg-card-hover)]'
                }`}
              >
                <div className={`p-2.5 rounded-xl ${answers.trackingMethod === 'software' ? 'bg-[var(--primary)] text-white' : 'bg-[var(--bg-card)] text-[var(--text-muted)] border border-[var(--border-subtle)]'}`}>
                  <Building2 size={20} />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-[var(--text-primary)] font-display">Bookkeeping Software (Tally / Zoho)</h4>
                  <p className="text-xs text-[var(--text-muted)] mt-0.5">I use Tally or accounting software for regular invoicing and GST filing.</p>
                </div>
              </button>
            </div>
          </div>
        )}

        {/* Question 2: Review Frequency */}
        {step === 2 && (
          <div className="space-y-4 animate-fade-in">
            <div className="space-y-1">
              <h3 className="text-lg font-black text-[var(--text-primary)] font-display">How often do you review pricing and cash flow?</h3>
              <p className="text-xs text-[var(--text-muted)]">We use this to set the alert frequency and default dashboard depth.</p>
            </div>

            <div className="grid grid-cols-1 gap-3 pt-2">
              <button
                type="button"
                onClick={() => setAnswers({ ...answers, reviewFrequency: 'rarely' })}
                className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex items-start gap-3.5 ${
                  answers.reviewFrequency === 'rarely'
                    ? 'border-[var(--primary)] bg-[var(--primary-subtle)] shadow-xs'
                    : 'border-[var(--border-subtle)] bg-[var(--bg-subtle)] hover:bg-[var(--bg-card-hover)]'
                }`}
              >
                <div className={`p-2.5 rounded-xl ${answers.reviewFrequency === 'rarely' ? 'bg-[var(--primary)] text-white' : 'bg-[var(--bg-card)] text-[var(--text-muted)] border border-[var(--border-subtle)]'}`}>
                  <Calendar size={20} />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-[var(--text-primary)] font-display">Rarely / When Cash Gets Tight</h4>
                  <p className="text-xs text-[var(--text-muted)] mt-0.5">I usually review numbers during end-of-month pressure or when there is an emergency.</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setAnswers({ ...answers, reviewFrequency: 'monthly' })}
                className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex items-start gap-3.5 ${
                  answers.reviewFrequency === 'monthly'
                    ? 'border-[var(--primary)] bg-[var(--primary-subtle)] shadow-xs'
                    : 'border-[var(--border-subtle)] bg-[var(--bg-subtle)] hover:bg-[var(--bg-card-hover)]'
                }`}
              >
                <div className={`p-2.5 rounded-xl ${answers.reviewFrequency === 'monthly' ? 'bg-[var(--primary)] text-white' : 'bg-[var(--bg-card)] text-[var(--text-muted)] border border-[var(--border-subtle)]'}`}>
                  <TrendingUp size={20} />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-[var(--text-primary)] font-display">Once or Twice a Month</h4>
                  <p className="text-xs text-[var(--text-muted)] mt-0.5">I review pricing and pending receivables during monthly accounting routines.</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setAnswers({ ...answers, reviewFrequency: 'weekly' })}
                className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex items-start gap-3.5 ${
                  answers.reviewFrequency === 'weekly'
                    ? 'border-[var(--primary)] bg-[var(--primary-subtle)] shadow-xs'
                    : 'border-[var(--border-subtle)] bg-[var(--bg-subtle)] hover:bg-[var(--bg-card-hover)]'
                }`}
              >
                <div className={`p-2.5 rounded-xl ${answers.reviewFrequency === 'weekly' ? 'bg-[var(--primary)] text-white' : 'bg-[var(--bg-card)] text-[var(--text-muted)] border border-[var(--border-subtle)]'}`}>
                  <Zap size={20} />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-[var(--text-primary)] font-display">Weekly or Continuously</h4>
                  <p className="text-xs text-[var(--text-muted)] mt-0.5">I actively track raw material market shifts and customer payment delays every week.</p>
                </div>
              </button>
            </div>
          </div>
        )}

        {/* Question 3: Primary Priority */}
        {step === 3 && (
          <div className="space-y-4 animate-fade-in">
            <div className="space-y-1">
              <h3 className="text-lg font-black text-[var(--text-primary)] font-display">What do you need help with first?</h3>
              <p className="text-xs text-[var(--text-muted)]">Gemma will highlight recommendations tailored to your top priority.</p>
            </div>

            <div className="grid grid-cols-1 gap-3 pt-2">
              <button
                type="button"
                onClick={() => setAnswers({ ...answers, primaryHelpNeed: 'pricing' })}
                className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex items-start gap-3.5 ${
                  answers.primaryHelpNeed === 'pricing'
                    ? 'border-[var(--primary)] bg-[var(--primary-subtle)] shadow-xs'
                    : 'border-[var(--border-subtle)] bg-[var(--bg-subtle)] hover:bg-[var(--bg-card-hover)]'
                }`}
              >
                <div className={`p-2.5 rounded-xl ${answers.primaryHelpNeed === 'pricing' ? 'bg-[var(--primary)] text-white' : 'bg-[var(--bg-card)] text-[var(--text-muted)] border border-[var(--border-subtle)]'}`}>
                  <TrendingUp size={20} />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-[var(--text-primary)] font-display">Pricing & Margin Protection</h4>
                  <p className="text-xs text-[var(--text-muted)] mt-0.5">Know immediately when raw steel/aluminum costs jump and adjust product pricing.</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setAnswers({ ...answers, primaryHelpNeed: 'cashflow' })}
                className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex items-start gap-3.5 ${
                  answers.primaryHelpNeed === 'cashflow'
                    ? 'border-[var(--primary)] bg-[var(--primary-subtle)] shadow-xs'
                    : 'border-[var(--border-subtle)] bg-[var(--bg-subtle)] hover:bg-[var(--bg-card-hover)]'
                }`}
              >
                <div className={`p-2.5 rounded-xl ${answers.primaryHelpNeed === 'cashflow' ? 'bg-[var(--primary)] text-white' : 'bg-[var(--bg-card)] text-[var(--text-muted)] border border-[var(--border-subtle)]'}`}>
                  <DollarSign size={20} />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-[var(--text-primary)] font-display">Cash Flow & Overdue Collections</h4>
                  <p className="text-xs text-[var(--text-muted)] mt-0.5">Spot payment delay trends early and automate customer receivables follow-ups.</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setAnswers({ ...answers, primaryHelpNeed: 'demand' })}
                className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex items-start gap-3.5 ${
                  answers.primaryHelpNeed === 'demand'
                    ? 'border-[var(--primary)] bg-[var(--primary-subtle)] shadow-xs'
                    : 'border-[var(--border-subtle)] bg-[var(--bg-subtle)] hover:bg-[var(--bg-card-hover)]'
                }`}
              >
                <div className={`p-2.5 rounded-xl ${answers.primaryHelpNeed === 'demand' ? 'bg-[var(--primary)] text-white' : 'bg-[var(--bg-card)] text-[var(--text-muted)] border border-[var(--border-subtle)]'}`}>
                  <Boxes size={20} />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-[var(--text-primary)] font-display">Demand & Inventory Planning</h4>
                  <p className="text-xs text-[var(--text-muted)] mt-0.5">Optimize tool stock buffers, lead times, and alternative supplier directory quotes.</p>
                </div>
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Recommendation & Tier Selection */}
        {step === 4 && (
          <div className="space-y-5 animate-fade-in">
            <div className="p-5 bg-[var(--primary-subtle)] border border-[var(--primary)]/20 rounded-2xl space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-[var(--primary)] uppercase tracking-wider font-display">
                <Compass size={16} />
                <span>Gemma Recommendation Result</span>
              </div>
              <h3 className="text-xl font-black text-[var(--text-primary)] font-display">{recommendation.title}</h3>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">{recommendation.desc}</p>
            </div>

            <div className="space-y-2">
              <span className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider font-display">Select Your Mode:</span>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => handleFinish('beginner')}
                  className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                    recommendation.tier === 'beginner' 
                      ? 'border-[var(--primary)] bg-[var(--primary-subtle)] text-[var(--primary)] font-bold' 
                      : 'border-[var(--border-subtle)] hover:bg-[var(--bg-subtle)] text-[var(--text-primary)]'
                  }`}
                >
                  <span className="text-xs font-bold block font-display">Beginner</span>
                  <span className="text-[10px] text-[var(--text-muted)] block mt-0.5">Action-first</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleFinish('intermediate')}
                  className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                    recommendation.tier === 'intermediate' 
                      ? 'border-[var(--primary)] bg-[var(--primary-subtle)] text-[var(--primary)] font-bold' 
                      : 'border-[var(--border-subtle)] hover:bg-[var(--bg-subtle)] text-[var(--text-primary)]'
                  }`}
                >
                  <span className="text-xs font-bold block font-display">Intermediate</span>
                  <span className="text-[10px] text-[var(--text-muted)] block mt-0.5">Balanced</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleFinish('expert')}
                  className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                    recommendation.tier === 'expert' 
                      ? 'border-[var(--primary)] bg-[var(--primary-subtle)] text-[var(--primary)] font-bold' 
                      : 'border-[var(--border-subtle)] hover:bg-[var(--bg-subtle)] text-[var(--text-primary)]'
                  }`}
                >
                  <span className="text-xs font-bold block font-display">Expert</span>
                  <span className="text-[10px] text-[var(--text-muted)] block mt-0.5">Full suite</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Footer Navigation Buttons */}
        <div className="border-t border-[var(--border-subtle)] pt-4 mt-6 flex justify-between items-center">
          {step > 1 && step <= 3 ? (
            <button
              onClick={handleBack}
              className="flex items-center gap-1.5 px-4 py-2 bg-[var(--bg-subtle)] text-[var(--text-primary)] text-xs font-bold rounded-full hover:bg-[var(--bg-card-hover)] transition-colors cursor-pointer"
            >
              <ArrowLeft size={14} />
              <span>Back</span>
            </button>
          ) : (
            <div />
          )}

          {step <= 3 ? (
            <button
              onClick={handleNext}
              className="flex items-center gap-1.5 px-6 py-2.5 bg-[var(--primary)] hover:bg-[var(--primary-dark)] text-white text-xs font-bold rounded-full transition-all shadow-xs cursor-pointer"
            >
              <span>Next</span>
              <ArrowRight size={14} />
            </button>
          ) : (
            <button
              onClick={() => handleFinish()}
              className="flex items-center gap-1.5 px-6 py-2.5 bg-[var(--primary)] hover:bg-[var(--primary-dark)] text-white text-xs font-bold rounded-full transition-all shadow-xs cursor-pointer"
            >
              <Check size={14} />
              <span>Start Platform in {recommendation.title.split(' ')[0]} Mode</span>
            </button>
          )}
        </div>

      </div>
    </div>
  );
};

export default OnboardingWizardModal;
