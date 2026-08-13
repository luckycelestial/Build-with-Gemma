import React from 'react';
import { 
  DollarSign, 
  Cpu, 
  ShieldAlert, 
  ArrowRightLeft, 
  AlertTriangle,
  CheckCircle2
} from 'lucide-react';
import { StatCard } from './ui/stat-card';
import { DashboardData } from '../api-client/api';

interface KPISectionProps {
  data: DashboardData;
}

export const KPISection: React.FC<KPISectionProps> = ({ data }) => {
  const { kpis } = data;

  const formatLakh = (value: number) => {
    return `₹${value.toFixed(1)} Lakh`;
  };

  const formatDifference = (value: number) => {
    const absVal = Math.abs(value * 100000);
    const formatted = absVal.toLocaleString('en-IN', { maximumFractionDigits: 0 });
    return value < 0 ? `-₹${formatted}` : `+₹${formatted}`;
  };

  const diffVal = kpis.ai_scenario_forecast_lakh - kpis.ml_forecast_8_weeks_avg_lakh;
  const diffPct = kpis.ml_forecast_8_weeks_avg_lakh > 0 
    ? Math.round((diffVal / kpis.ml_forecast_8_weeks_avg_lakh) * 100) 
    : -8;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      {/* 1. Avg Monthly Revenue */}
      <StatCard
        label="Avg Monthly Revenue"
        value={formatLakh(kpis.avg_monthly_revenue_lakh)}
        subtext="vs previous 3 months"
        icon={DollarSign}
        trend={{
          value: `${Math.abs(kpis.revenue_change_pct)}%`,
          isUp: kpis.revenue_change_pct >= 0
        }}
      />

      {/* 2. ML Forecast (Next 8 Weeks) */}
      <StatCard
        label="ML Forecast (8 Wks)"
        value={formatLakh(kpis.ml_forecast_8_weeks_avg_lakh)}
        subtext="vs last 8 weeks baseline"
        icon={Cpu}
        trend={{
          value: `${Math.abs(kpis.forecast_change_pct)}%`,
          isUp: kpis.forecast_change_pct >= 0
        }}
      />

      {/* 3. AI Scenario Forecast */}
      <StatCard
        label="AI Scenario Forecast"
        value={formatLakh(kpis.ai_scenario_forecast_lakh)}
        subtext="Adjusted for external risks"
        icon={ShieldAlert}
        trend={{
          value: `${diffPct < 0 ? '' : '+'}${diffPct}%`,
          isUp: diffPct >= 0
        }}
        highlight={true}
      />

      {/* 4. Scenario Impact */}
      <StatCard
        label="Scenario Impact"
        value={diffVal < 0 ? 'Margin Headwind' : 'Margin Growth'}
        subtext={formatDifference(diffVal)}
        icon={ArrowRightLeft}
        trend={{
          value: `${diffPct < 0 ? '' : '+'}${diffPct}%`,
          isUp: diffVal >= 0
        }}
      >
        <div className="flex flex-col gap-0.5 mt-2 border-t border-[var(--border-subtle)] pt-2 text-[9px]">
          <span className="font-semibold text-[var(--text-muted)]">Primary Risk Drivers:</span>
          <div className="flex flex-wrap gap-1 mt-1">
            <span className="px-1.5 py-0.5 bg-[var(--bg-subtle)] border border-[var(--border-subtle)] text-[var(--text-muted)] rounded-[6px] text-[8px] font-bold">Steel Index</span>
            <span className="px-1.5 py-0.5 bg-[var(--bg-subtle)] border border-[var(--border-subtle)] text-[var(--text-muted)] rounded-[6px] text-[8px] font-bold">Payment Delays</span>
          </div>
        </div>
      </StatCard>

      {/* 5. Business Risk & AI Confidence */}
      <StatCard
        label="Risk & Confidence"
        value={`${kpis.business_risk_category}`}
        subtext={`Score: ${kpis.business_risk_score}/100`}
        icon={AlertTriangle}
      >
        <div className="flex flex-col gap-2 mt-3 border-t border-[var(--border-subtle)] pt-2">
          <div className="flex justify-between items-center text-[10px]">
            <span className="text-[var(--text-muted)] font-bold flex items-center gap-1">
              <CheckCircle2 size={11} className="text-emerald-500" />
              AI Conf:
            </span>
            <span className="font-extrabold text-[var(--text-primary)]">{kpis.confidence_pct}%</span>
          </div>
          <div className="flex flex-col gap-1 text-[9px] text-[var(--text-muted)]">
            {kpis.risk_factors.slice(0, 2).map((factor, i) => (
              <div key={i} className="flex justify-between border-t border-[var(--border-subtle)] pt-1">
                <span className="truncate max-w-[80px]">{factor.factor}</span>
                <span className="font-bold text-[var(--text-primary)]">{factor.score}%</span>
              </div>
            ))}
          </div>
        </div>
      </StatCard>
    </div>
  );
};

export default KPISection;
