import React, { useState } from 'react';
import { 
  Sparkles, 
  CheckSquare, 
  Square, 
  TrendingUp, 
  Coins, 
  Bookmark,
  Info
} from 'lucide-react';
import { DashboardData } from '../api-client/api';

interface ExecutiveRecommendationProps {
  data: DashboardData;
  onExplain: (section: string) => void;
}

export const ExecutiveRecommendation: React.FC<ExecutiveRecommendationProps> = ({ data, onExplain }) => {
  const executive_recommendation = data?.executive_recommendation || {
    summary: "Standard operational strategy active across sales ledger and material margins.",
    recommended_actions: [],
    potential_impact: { cash_flow_improvement: "₹0", revenue_protection: "0%" },
    confidence_score: 90
  };
  const [checkedActions, setCheckedActions] = useState<Record<number, boolean>>({});

  const toggleAction = (idx: number) => {
    setCheckedActions(prev => ({
      ...prev,
      [idx]: !prev[idx]
    }));
  };

  return (
    <div id="executive" className="bg-[var(--primary-subtle)] border border-[var(--primary)]/20 rounded-3xl shadow-xs p-6 scroll-mt-6 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--primary)]/5 rounded-full translate-x-8 -translate-y-8 pointer-events-none" />
      
      {/* Header */}
      <div className="flex justify-between items-center border-b border-[var(--border-subtle)] pb-4 mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-[var(--primary)]/10 text-[var(--primary)] rounded-xl flex items-center justify-center">
            <Sparkles size={18} />
          </div>
          <div>
            <h2 className="text-base font-black text-[var(--text-primary)] tracking-tight font-display">AI Executive Recommendation</h2>
            <p className="text-[11px] text-[var(--text-muted)] mt-0.5 font-sans">Synthesized operational strategy from internal metrics & external market signals</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recommendation Narrative */}
        <div className="lg:col-span-2 flex flex-col justify-between">
          <div>
            <p className="text-sm text-[var(--text-primary)] font-semibold leading-relaxed">
              {executive_recommendation.summary}
            </p>
            
            {/* Recommended Action Checklist */}
            <div className="mt-5">
              <h4 className="text-xs font-bold text-[var(--primary)] uppercase tracking-wider mb-3 font-display">
                Recommended Actions
              </h4>
              <div className="flex flex-col gap-3">
                {executive_recommendation.recommended_actions.map((act, idx) => {
                  const isChecked = checkedActions[idx] || false;
                  return (
                    <div 
                      key={idx}
                      onClick={() => toggleAction(idx)}
                      className={`flex items-start gap-3 p-3.5 rounded-2xl border transition-all duration-200 cursor-pointer ${
                        isChecked 
                          ? 'bg-[var(--bg-subtle)] border-[var(--border-subtle)] text-[var(--text-muted)]' 
                          : 'bg-[var(--bg-card)] border-[var(--border-subtle)] hover:border-[var(--primary)]/30 text-[var(--text-primary)] shadow-xs'
                      }`}
                    >
                      <button className="mt-0.5 text-[var(--primary)] flex-shrink-0 cursor-pointer">
                        {isChecked ? <CheckSquare size={16} /> : <Square size={16} />}
                      </button>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <p className={`text-xs font-bold leading-tight ${isChecked ? 'line-through text-[var(--text-muted)]' : 'text-[var(--text-primary)]'}`}>
                            {act.action}
                          </p>
                          <span className={`px-2 py-0.5 rounded-md text-[8px] font-bold border uppercase tracking-wider flex-shrink-0 ${
                            idx === 0 ? 'bg-[var(--primary-subtle)] text-[var(--primary)] border-[var(--primary)]/20' :
                            idx === 1 ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30' :
                            idx === 2 ? 'bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30' :
                            'bg-[var(--bg-subtle)] text-[var(--text-muted)] border-[var(--border-subtle)]'
                          }`}>
                            {idx === 0 ? 'Immediate' :
                             idx === 1 ? 'This Week' :
                             idx === 2 ? 'This Month' : 'Next Quarter'}
                          </span>
                        </div>
                        
                        {!isChecked && (
                          <div className="flex flex-wrap gap-1.5 mt-2">
                            {act.internal_evidence && (
                              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-blue-500/10 text-blue-600 dark:text-blue-400 text-[9px] font-bold rounded-md border border-blue-500/20">
                                <Bookmark size={8} />
                                <span>Internal: {act.internal_evidence}</span>
                              </span>
                            )}
                            {act.external_evidence && (
                              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-[var(--primary-subtle)] text-[var(--primary)] text-[9px] font-bold rounded-md border border-[var(--primary)]/20">
                                <Info size={8} />
                                <span>External: {act.external_evidence}</span>
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Potential Impact summary */}
        <div className="bg-[var(--bg-card)] text-[var(--text-primary)] rounded-3xl p-5 border border-[var(--border-subtle)] flex flex-col justify-between shadow-xs">
          <div>
            <h4 className="text-xs font-bold text-[var(--primary)] uppercase tracking-wider mb-4 font-display">
              Potential Impact
            </h4>
            
            <div className="flex flex-col gap-4">
              {/* Cash Flow Improvement */}
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-[var(--primary-subtle)] text-[var(--primary)] rounded-xl">
                  <Coins size={18} />
                </div>
                <div>
                  <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider font-display">Cash Flow Improvement</p>
                  <h5 className="text-lg font-black text-[var(--text-primary)] mt-0.5 font-display">
                    {executive_recommendation.potential_impact.cash_flow_improvement}
                  </h5>
                </div>
              </div>

              {/* Revenue Protection */}
              <div className="flex items-center gap-3 border-t border-[var(--border-subtle)] pt-3">
                <div className="p-2.5 bg-[var(--primary-subtle)] text-[var(--primary)] rounded-xl">
                  <TrendingUp size={18} />
                </div>
                <div>
                  <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider font-display">Revenue Protection</p>
                  <h5 className="text-lg font-black text-[var(--text-primary)] mt-0.5 font-display">
                    {executive_recommendation.potential_impact.revenue_protection}
                  </h5>
                </div>
              </div>
            </div>
          </div>

          {/* Confidence bar */}
          <div className="border-t border-[var(--border-subtle)] pt-4 mt-6">
            <div className="flex justify-between items-center text-xs mb-1.5">
              <span className="text-[var(--text-muted)] font-bold font-display">Recommendation Confidence</span>
              <span className="font-black text-[var(--text-primary)] font-display">{executive_recommendation.confidence_score}%</span>
            </div>
            <div className="w-full h-2 bg-[var(--bg-subtle)] rounded-full overflow-hidden">
              <div 
                className="h-full bg-[var(--primary)] rounded-full transition-all duration-500" 
                style={{ width: `${executive_recommendation.confidence_score}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
