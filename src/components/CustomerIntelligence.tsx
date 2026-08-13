import React from 'react';
import { 
  ResponsiveContainer, 
  Tooltip, 
  Cell,
  PieChart,
  Pie
} from 'recharts';
import { 
  Users, 
  UserCheck, 
  AlertTriangle, 
  TrendingUp, 
  TrendingDown, 
  Minus,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import { DashboardData } from '../api-client/api';

interface CustomerIntelligenceProps {
  data: DashboardData;
  onExplain: (section: string) => void;
}

export const CustomerIntelligence: React.FC<CustomerIntelligenceProps> = ({ data, onExplain }) => {
  const { customer_intelligence } = data;
  const [selectedCustKey, setSelectedCustKey] = React.useState<string>('');

  React.useEffect(() => {
    if (customer_intelligence.customers.length > 0) {
      setSelectedCustKey(customer_intelligence.customers[0].key);
    }
  }, [customer_intelligence.customers]);

  const selectedCustomer = customer_intelligence.customers.find(c => c.key === selectedCustKey) 
    || customer_intelligence.customers[0]
    || {
      name: 'Key Customer',
      key: '',
      revenue_share: 0,
      avg_payment_delay: 0,
      delayed_invoices: 0,
      total_invoices: 0,
      risk_score: 'Low',
      trend: 'stable',
      history: [],
      ai_summary: 'No insights available.',
      ai_observed_behavior: '',
      ai_business_impact: '',
      ai_recommendation: '',
      ai_confidence: ''
    };

  const pieData = customer_intelligence.customers.map(c => ({
    name: c.name,
    value: c.revenue_share
  }));

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#f43f5e', '#06b6d4', '#ec4899', '#6366f1'];

  const customerInvoiceValue = selectedCustomer.history.reduce((sum, h) => sum + h.orders, 0).toFixed(2);

  const getRiskBadge = (score: string) => {
    switch (score) {
      case 'High':
        return 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30';
      case 'Medium':
        return 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30';
      default:
        return 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp size={14} className="text-[var(--primary)]" />;
      case 'down':
        return <TrendingDown size={14} className="text-emerald-500" />;
      default:
        return <Minus size={14} className="text-[var(--text-muted)]" />;
    }
  };

  return (
    <div id="customers" className="flex flex-col gap-6 scroll-mt-6">
      {/* KPI Stats Panel */}
      <div className="bg-[var(--bg-card)] rounded-3xl border border-[var(--border-subtle)] shadow-xs p-6">
        <div className="flex justify-between items-center border-b border-[var(--border-subtle)] pb-4 mb-4">
          <div>
            <h2 className="text-lg font-black text-[var(--text-primary)] tracking-tight flex items-center gap-2 font-display">
              <span className="w-6 h-6 bg-[var(--primary-subtle)] text-[var(--primary)] rounded-full flex items-center justify-center text-xs font-black">2</span>
              Customer Intelligence
            </h2>
            <p className="text-xs text-[var(--text-muted)] mt-0.5 font-sans">Deep analysis of customer behaviour & payment patterns</p>
          </div>
        </div>

        {/* Small customer indicators */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          <div className="bg-[var(--bg-subtle)] p-4 rounded-2xl border border-[var(--border-subtle)] flex items-center gap-3">
            <div className="p-2 bg-[var(--primary-subtle)] text-[var(--primary)] rounded-xl"><Users size={16} /></div>
            <div>
              <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider font-display">Active Customers</p>
              <h4 className="text-base font-black text-[var(--text-primary)] font-display">{customer_intelligence.active_customers}</h4>
            </div>
          </div>
          <div className="bg-[var(--bg-subtle)] p-4 rounded-2xl border border-[var(--border-subtle)] flex items-center gap-3">
            <div className="p-2 bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 rounded-xl"><UserCheck size={16} /></div>
            <div>
              <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider font-display">Healthy Accounts</p>
              <h4 className="text-base font-black text-emerald-600 dark:text-emerald-400 font-display">
                {customer_intelligence.healthy_customers_count} ({customer_intelligence.healthy_customers_pct}%)
              </h4>
            </div>
          </div>
          <div className="bg-[var(--bg-subtle)] p-4 rounded-2xl border border-[var(--border-subtle)] flex items-center gap-3">
            <div className="p-2 bg-amber-500/15 text-amber-600 dark:text-amber-400 rounded-xl"><AlertTriangle size={16} /></div>
            <div>
              <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider font-display">Medium Risk</p>
              <h4 className="text-base font-black text-amber-600 dark:text-amber-400 font-display">
                {customer_intelligence.medium_risk_count} ({customer_intelligence.medium_risk_pct}%)
              </h4>
            </div>
          </div>
          <div className="bg-[var(--bg-subtle)] p-4 rounded-2xl border border-[var(--border-subtle)] flex items-center gap-3 col-span-2">
            <div className="p-2 bg-[var(--primary-subtle)] text-[var(--primary)] rounded-xl"><AlertTriangle size={16} /></div>
            <div className="flex-1">
              <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider font-display">High Risk Concentration</p>
              <h4 className="text-base font-black text-[var(--primary)] font-display">
                {customer_intelligence.revenue_concentration_pct}% <span className="text-[10px] text-[var(--text-muted)] font-normal">(Top 3)</span>
              </h4>
            </div>
          </div>
        </div>

        {/* Customer selection table */}
        <div className="overflow-x-auto border border-[var(--border-subtle)] rounded-2xl">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[var(--bg-subtle)] text-[var(--text-muted)] border-b border-[var(--border-subtle)] font-display uppercase font-bold">
                <th className="p-3">Customer Account</th>
                <th className="p-3">Revenue Share</th>
                <th className="p-3">Avg Delay</th>
                <th className="p-3">Invoices Delayed</th>
                <th className="p-3">Trend</th>
                <th className="p-3">Risk Level</th>
                <th className="p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {customer_intelligence.customers.map((c) => (
                <tr 
                  key={c.key} 
                  className={`border-b border-[var(--border-subtle)] hover:bg-[var(--primary-subtle)] cursor-pointer transition-colors ${
                    selectedCustKey === c.key ? 'bg-[var(--primary-subtle)] font-semibold text-[var(--primary)]' : ''
                  }`}
                  onClick={() => setSelectedCustKey(c.key)}
                >
                  <td className="p-3 font-bold text-[var(--text-primary)]">{c.name}</td>
                  <td className="p-3">{c.revenue_share}%</td>
                  <td className="p-3">{c.avg_payment_delay} days</td>
                  <td className="p-3">{c.delayed_invoices} of {c.total_invoices}</td>
                  <td className="p-3 flex items-center gap-1 mt-1">{getTrendIcon(c.trend)} <span className="capitalize text-[10px]">{c.trend}</span></td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${getRiskBadge(c.risk_score)}`}>
                      {c.risk_score}
                    </span>
                  </td>
                  <td className="p-3">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedCustKey(c.key);
                      }}
                      className="px-2.5 py-1 bg-[var(--primary)] text-white text-[10px] font-bold rounded-full hover:bg-[var(--primary-dark)] transition-colors cursor-pointer"
                    >
                      Analyze
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Customer Specific Trend and AI Insights Panel */}
      <div className="bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-3xl shadow-xs p-6">
        <div className="flex justify-between items-center border-b border-[var(--border-subtle)] pb-4 mb-4">
          <h3 className="text-sm font-black text-[var(--text-primary)] font-display">
            AI Customer Insights &mdash; <span className="text-[var(--primary)]">{selectedCustomer.name}</span>
          </h3>
          <span className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold ${getRiskBadge(selectedCustomer.risk_score)}`}>
            {selectedCustomer.risk_score} Risk Account
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Customer stats summary */}
          <div className="bg-[var(--bg-subtle)] border border-[var(--border-subtle)] rounded-2xl p-4 flex flex-col justify-between gap-3 text-xs">
            <div>
              <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider font-display">Revenue Contribution</p>
              <h4 className="text-lg font-black text-[var(--text-primary)] mt-0.5 font-display">{selectedCustomer.revenue_share}%</h4>
              <p className="text-[9px] text-[var(--text-muted)]">of total business revenue</p>
            </div>
            <div className="border-t border-[var(--border-subtle)] pt-2">
              <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider font-display">Total Invoices (Last 12W)</p>
              <h4 className="text-sm font-bold text-[var(--text-primary)] mt-0.5">₹{customerInvoiceValue} Lakh <span className="text-xs text-[var(--text-muted)]">({selectedCustomer.total_invoices} invoices)</span></h4>
            </div>
            <div className="border-t border-[var(--border-subtle)] pt-2">
              <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider font-display">Avg Payment Delay</p>
              <h4 className="text-sm font-bold text-[var(--text-primary)] mt-0.5">{selectedCustomer.avg_payment_delay} Days</h4>
            </div>
            <div className="border-t border-[var(--border-subtle)] pt-2">
              <div className="flex justify-between items-center text-[10px] font-bold text-[var(--text-muted)] uppercase font-display">
                <span>On-time Payment Rate</span>
                <span className={`font-black ${
                  selectedCustomer.delayed_invoices === 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-[var(--text-primary)]'
                }`}>
                  {Math.round(((selectedCustomer.total_invoices - selectedCustomer.delayed_invoices) / selectedCustomer.total_invoices) * 100)}%
                </span>
              </div>
            </div>
          </div>

          {/* AI Narrative insight block */}
          <div className="lg:col-span-2 bg-[var(--primary-subtle)] border border-[var(--primary)]/20 rounded-2xl p-4 flex flex-col justify-between relative overflow-hidden">
            <div>
              <h4 className="text-xs font-bold text-[var(--primary)] uppercase tracking-wider mb-2 flex items-center gap-1.5 font-display">
                <ShieldCheck size={14} />
                AI Analysis
              </h4>
              <p className="text-xs text-[var(--text-primary)] leading-relaxed font-bold">
                {selectedCustomer.ai_summary}
              </p>
              <p className="text-xs text-[var(--text-muted)] mt-2">
                <span className="font-bold text-[var(--text-primary)]">Observed Behavior: </span>{selectedCustomer.ai_observed_behavior}
              </p>
              <p className="text-xs text-[var(--primary)] mt-2.5 font-medium bg-[var(--bg-card)]/50 p-2.5 rounded-xl border border-[var(--border-subtle)]">
                <span className="font-bold text-[var(--text-primary)]">Business Cash Flow Impact: </span>{selectedCustomer.ai_business_impact}
              </p>
            </div>
            <div className="text-[10px] text-[var(--text-muted)] border-t border-[var(--border-subtle)] pt-2 mt-4 flex justify-between items-center">
              <span>Confidence: <strong className="text-[var(--text-primary)] font-black">{selectedCustomer.ai_confidence}</strong></span>
              <span className="text-[var(--primary)] font-bold flex items-center gap-0.5 hover:underline cursor-pointer">
                View Customer Details <ArrowRight size={10} />
              </span>
            </div>
          </div>

          {/* Revenue Contribution by Customer Pie Chart */}
          <div className="bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-2xl p-4 flex flex-col justify-between">
            <h4 className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider mb-1 font-display">
              Revenue Share
            </h4>
            <div className="h-36 w-full relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={30}
                    outerRadius={45}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `${value}%`} />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-base font-black text-[var(--text-primary)] leading-none">₹{data.kpis.avg_monthly_revenue_lakh.toFixed(1)}L</span>
                <span className="text-[8px] text-[var(--text-muted)]">Total (Monthly)</span>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-1 text-[8px] mt-1 border-t border-[var(--border-subtle)] pt-1.5 text-[var(--text-muted)]">
              {pieData.slice(0, 4).map((entry, idx) => (
                <div key={idx} className="flex items-center gap-1">
                  <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: COLORS[idx] }} />
                  <span className="truncate">{entry.name} ({entry.value}%)</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Customer specific Recommendations row */}
        <div className="mt-4 p-4 bg-[var(--bg-subtle)] border border-[var(--border-subtle)] rounded-2xl">
          <h4 className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider mb-2 font-display">
            Top Recommendations for {selectedCustomer.name} (AI)
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            <div className="flex items-start gap-2 bg-[var(--bg-card)] p-3 rounded-xl border border-[var(--border-subtle)]">
              <div className="w-1.5 h-1.5 bg-[var(--primary)] rounded-full mt-1.5 flex-shrink-0" />
              <div>
                <p className="font-bold text-[var(--text-primary)]">Actionable Credit Strategy</p>
                <p className="text-[11px] text-[var(--text-muted)] mt-0.5">{selectedCustomer.ai_recommendation}</p>
              </div>
            </div>
            <div className="flex items-start gap-2 bg-[var(--bg-card)] p-3 rounded-xl border border-[var(--border-subtle)]">
              <div className="w-1.5 h-1.5 bg-[var(--primary)] rounded-full mt-1.5 flex-shrink-0" />
              <div>
                <p className="font-bold text-[var(--text-primary)]">Operational Capacity Alignment</p>
                <p className="text-[11px] text-[var(--text-muted)] mt-0.5">
                  {selectedCustomer.risk_score === 'High' 
                    ? 'Tighten credit limits and request advance payment before machining operations.' 
                    : 'Maintain current relationship strength and plan capacity allocation for recurring parts.'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerIntelligence;
