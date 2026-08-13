import React from 'react';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend,
} from 'recharts';
import { 
  BookOpen,
  Newspaper,
} from 'lucide-react';
import { DashboardData } from '../api-client/api';

interface RevenueIntelligenceProps {
  data: DashboardData;
  onExplain: (section: string) => void;
}

export const RevenueIntelligence: React.FC<RevenueIntelligenceProps> = ({ data, onExplain }) => {
  const { forecast_data, shap_importance, shap_explanation, market_intelligence } = data;

  const chartData: any[] = [];
  
  forecast_data.historical.forEach((item) => {
    chartData.push({
      name: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      'Historical (Actual)': item.revenue,
      'ML Forecast (Data Only)': null,
      'AI Scenario Forecast (With External Intelligence)': null,
    });
  });

  const lastHistoricalVal = forecast_data.historical[forecast_data.historical.length - 1].revenue;
  const lastHistoricalName = chartData[chartData.length - 1].name;

  chartData.push({
    name: lastHistoricalName,
    'Historical (Actual)': lastHistoricalVal,
    'ML Forecast (Data Only)': lastHistoricalVal,
    'AI Scenario Forecast (With External Intelligence)': lastHistoricalVal,
  });

  forecast_data.weeks_labels.forEach((label, i) => {
    chartData.push({
      name: label,
      'Historical (Actual)': null,
      'ML Forecast (Data Only)': forecast_data.ml_prediction[i],
      'AI Scenario Forecast (With External Intelligence)': forecast_data.ai_scenario_prediction[i],
    });
  });

  const baseValue = data.kpis.avg_monthly_revenue_lakh / 4.33;
  const shapFactors = [
    { name: 'Base Value (Avg. Revenue)', value: baseValue, type: 'base' },
    { name: 'Customer Orders', value: shap_importance['Customer Orders'] || 0.42, type: 'positive' },
    { name: 'Steel Cost', value: shap_importance['Steel Cost'] || -0.52, type: 'negative' },
    { name: 'Machine Utilization', value: shap_importance['Machine Utilization'] || 0.32, type: 'positive' },
    { name: 'Seasonality', value: shap_importance['Seasonality'] || 0.16, type: 'positive' },
    { name: 'Payment Delays', value: shap_importance['Payment Delays'] || -0.25, type: 'negative' },
    { name: 'ML Forecast', value: data.kpis.ml_forecast_8_weeks_avg_lakh, type: 'total' }
  ];

  const formatAdjustmentImpact = (value: number) => {
    const formatted = Math.abs(value).toLocaleString('en-IN');
    return value < 0 ? `-₹${formatted}` : `+₹${formatted}`;
  };

  return (
    <div id="forecast" className="flex flex-col gap-6 scroll-mt-6">
      {/* 1. Main Forecast & Why AI Adjusted */}
      <div className="bg-[var(--bg-card)] rounded-3xl border border-[var(--border-subtle)] shadow-xs p-6">
        <div className="flex justify-between items-center border-b border-[var(--border-subtle)] pb-4 mb-4">
          <div>
            <h2 className="text-lg font-black text-[var(--text-primary)] tracking-tight flex items-center gap-2 font-display">
              <span className="w-6 h-6 bg-[var(--primary-subtle)] text-[var(--primary)] rounded-full flex items-center justify-center text-xs font-black">1</span>
              Revenue Intelligence
            </h2>
            <p className="text-xs text-[var(--text-muted)] mt-0.5">Revenue forecast based on your data vs AI scenario (with real-world intelligence)</p>
          </div>
          <button
            onClick={() => onExplain('forecast')}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[var(--primary-subtle)] text-[var(--primary)] hover:bg-[var(--primary)] hover:text-white rounded-full text-xs font-bold transition-all border border-[var(--primary)]/10 duration-200 cursor-pointer"
          >
            <BookOpen size={14} />
            <span>Explain Forecast</span>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Chart Section */}
          <div className="lg:col-span-2">
            <h4 className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider mb-4 font-display">
              Revenue Forecast: Historical vs ML vs AI Scenario
            </h4>
            <div className="h-72 w-full text-xs">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-subtle)" />
                  <XAxis dataKey="name" stroke="var(--text-muted)" tickLine={false} axisLine={false} />
                  <YAxis stroke="var(--text-muted)" tickLine={false} axisLine={false} domain={['dataMin - 1', 'dataMax + 1']} />
                  <Tooltip 
                    contentStyle={{ background: 'var(--bg-card)', color: 'var(--text-primary)', borderRadius: '12px', border: '1px solid var(--border-subtle)', boxShadow: 'var(--shadow-card)' }}
                    labelClassName="font-bold text-[var(--text-primary)]"
                  />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" />
                  
                  {/* Historical Revenue */}
                  <Line 
                    type="monotone" 
                    dataKey="Historical (Actual)" 
                    stroke="var(--primary)" 
                    strokeWidth={2.5} 
                    dot={{ r: 4, strokeWidth: 0, fill: 'var(--primary)' }} 
                    activeDot={{ r: 6 }} 
                  />
                  
                  {/* ML Forecast */}
                  <Line 
                    type="monotone" 
                    dataKey="ML Forecast (Data Only)" 
                    stroke="var(--text-muted)" 
                    strokeWidth={2} 
                    strokeDasharray="4 4" 
                    dot={false}
                  />
                  
                  {/* AI Scenario Adjusted Forecast */}
                  <Line 
                    type="monotone" 
                    dataKey="AI Scenario Forecast (With External Intelligence)" 
                    stroke="#f43f5e" 
                    strokeWidth={2.5} 
                    dot={{ r: 4, strokeWidth: 0, fill: '#f43f5e' }} 
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Impact Adjustments list */}
          <div className="bg-[var(--bg-subtle)] p-5 rounded-2xl border border-[var(--border-subtle)] flex flex-col justify-between">
            <div>
              <h4 className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider mb-4 font-display">
                AI Scenario Adjustments
              </h4>
              <div className="flex flex-col gap-2.5">
                {forecast_data.why_adjusted.map((adj, i) => (
                  <div key={i} className="flex justify-between items-start gap-2 text-xs border-b border-[var(--border-subtle)] pb-2">
                    <div>
                      <p className="font-bold text-[var(--text-primary)] leading-tight">{adj.factor}</p>
                      <span className="text-[10px] text-[var(--text-muted)]">Source: {adj.source}</span>
                    </div>
                    <span className={`font-bold flex-shrink-0 whitespace-nowrap ${
                      adj.impact < 0 ? 'text-[var(--primary)]' : 'text-emerald-600 dark:text-emerald-400'
                    }`}>
                      {formatAdjustmentImpact(adj.impact)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="border-t border-[var(--border-subtle)] pt-3 mt-4 flex justify-between items-center">
              <span className="text-xs font-bold text-[var(--text-primary)] font-display">Total Estimated Impact</span>
              <span className="text-sm font-black text-[var(--primary)] font-display">
                {formatAdjustmentImpact(forecast_data.why_adjusted.reduce((acc, curr) => acc + curr.impact, 0))}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. SHAP & Latest Market News Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* SHAP Waterfall Plot */}
        <div className="bg-[var(--bg-card)] rounded-3xl border border-[var(--border-subtle)] shadow-xs p-6 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center border-b border-[var(--border-subtle)] pb-3 mb-4">
              <div>
                <h3 className="font-black text-[var(--text-primary)] text-sm font-display">ML Model Explainability (SHAP)</h3>
                <p className="text-[11px] text-[var(--text-muted)]">Prediction contribution of key business features</p>
              </div>
              <button 
                onClick={() => onExplain('shap')}
                className="text-[10px] font-bold text-[var(--primary)] hover:underline font-display cursor-pointer"
              >
                View Full SHAP
              </button>
            </div>

            <div className="flex flex-col gap-2 mt-4 text-xs">
              <div className="flex justify-between items-center text-[10px] font-bold text-[var(--text-muted)] border-b border-[var(--border-subtle)] pb-1 uppercase font-display">
                <span>Feature / Driver</span>
                <span className="w-48 text-center">Impact waterfall</span>
                <span>Val (Lakh)</span>
              </div>
              {shapFactors.map((f, i) => {
                const isPositive = f.type === 'positive';
                const isBase = f.type === 'base';
                const isTotal = f.type === 'total';
                const isNegative = f.type === 'negative';
                
                return (
                  <div key={i} className="flex justify-between items-center py-1">
                    <span className={`truncate max-w-[150px] ${isTotal || isBase ? 'font-bold text-[var(--text-primary)]' : 'text-[var(--text-muted)]'}`}>
                      {f.name}
                    </span>
                    
                    <div className="w-48 h-4 bg-[var(--bg-subtle)] rounded-[6px] relative overflow-hidden flex-shrink-0">
                      {isBase && (
                        <div className="h-full bg-[var(--text-muted)]" style={{ width: '60%' }} />
                      )}
                      {isTotal && (
                        <div className="h-full bg-[var(--primary)]" style={{ width: '58%' }} />
                      )}
                      {isPositive && (
                        <div className="h-full bg-emerald-500 absolute" style={{ left: '60%', width: '12%' }} />
                      )}
                      {isNegative && (
                        <div className="h-full bg-[var(--primary)] absolute opacity-45" style={{ left: '42%', width: '18%' }} />
                      )}
                    </div>

                    <span className={`font-bold text-right w-14 ${
                      isBase || isTotal ? 'text-[var(--text-primary)] font-extrabold' : isPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-[var(--primary)]'
                    }`}>
                      {isBase || isTotal ? `₹${f.value.toFixed(1)}` : `${isPositive ? '+' : ''}₹${f.value.toFixed(2)}`}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-[var(--bg-subtle)] p-3 rounded-2xl border border-[var(--border-subtle)] mt-4">
            <p className="text-[11px] text-[var(--text-muted)] font-medium italic">
              &ldquo;{shap_explanation}&rdquo;
            </p>
          </div>
        </div>

        {/* Latest Market & Industry News */}
        <div className="bg-[var(--bg-card)] rounded-3xl border border-[var(--border-subtle)] shadow-xs p-6 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center border-b border-[var(--border-subtle)] pb-3 mb-4">
              <div>
                <h3 className="font-black text-[var(--text-primary)] text-sm font-display">Latest Market & Industry News</h3>
                <p className="text-[11px] text-[var(--text-muted)]">AI-screened real-time macroeconomic updates</p>
              </div>
              <button 
                onClick={() => onExplain('market_impact')}
                className="text-[10px] font-bold text-[var(--primary)] hover:underline font-display cursor-pointer"
              >
                View All
              </button>
            </div>

            <div className="flex flex-col gap-3 max-h-[260px] overflow-y-auto pr-1">
              {market_intelligence.slice(0, 3).map((news, i) => (
                <div key={i} className="flex items-start gap-3 border-b border-[var(--border-subtle)] pb-3 last:border-0 last:pb-0 group">
                  <div className="p-2 bg-[var(--bg-subtle)] rounded-xl text-[var(--text-muted)] flex-shrink-0 group-hover:bg-[var(--primary-subtle)] group-hover:text-[var(--primary)] transition-colors">
                    <Newspaper size={16} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start gap-1">
                      <h4 className="text-xs font-bold text-[var(--text-primary)] truncate leading-snug group-hover:text-[var(--primary)] transition-colors" title={news.title}>
                        <a href={news.link} target="_blank" rel="noopener noreferrer" className="hover:underline">
                          {news.title}
                        </a>
                      </h4>
                      <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded-[6px] flex-shrink-0 ${
                        news.category === 'Raw Material' ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400' :
                        news.category === 'Industry Trend' ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400' : 'bg-[var(--primary-subtle)] text-[var(--primary)]'
                      }`}>
                        {news.category}
                      </span>
                    </div>
                    <div className="flex gap-2 text-[9px] text-[var(--text-muted)] mt-1">
                      <span>{news.source}</span>
                      <span>&bull;</span>
                      <span>{news.pubDate}</span>
                    </div>
                    <div className="bg-[var(--bg-subtle)] rounded-xl p-2 mt-1.5 text-[10px] border border-[var(--border-subtle)]">
                      <p className="text-[var(--text-muted)]"><span className="font-bold text-[var(--text-primary)]">Impact: </span>{news.business_impact}</p>
                      <p className="text-[var(--primary)] mt-0.5 font-bold"><span className="text-[var(--text-primary)]">Suggested Action: </span>{news.suggested_action}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="text-[10px] text-[var(--text-muted)] mt-3 flex justify-between items-center">
            <span>Showing top {Math.min(3, market_intelligence.length)} of {market_intelligence.length} relevant news</span>
            <span className="flex items-center gap-1.5 font-bold">
              {(market_intelligence[0] as any)?.isLive ? (
                <>
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-emerald-600 dark:text-emerald-400">Live RSS News Feed</span>
                </>
              ) : (
                <span className="text-[var(--text-muted)]">Feed Cache: {(market_intelligence[0] as any)?.timestamp || "Offline"}</span>
              )}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
