export interface HistoricalRecord {
  date: string;
  revenue: number;
  orders: number;
  steel_price: number;
  machine_utilization: number;
  active_customers: number;
  inventory_level: number;
  payment_delays: number;
}

export interface CustomerHistoryRecord {
  month: string;
  orders: number;
  payments: number;
  delay: number;
}

export interface CustomerRecord {
  name: string;
  key: string;
  revenue_share: number;
  avg_payment_delay: number;
  delayed_invoices: number;
  total_invoices: number;
  trend: 'up' | 'down' | 'stable';
  risk_score: 'High' | 'Medium' | 'Low';
  history: CustomerHistoryRecord[];
  ai_summary?: string;
  ai_observed_behavior?: string;
  ai_business_impact?: string;
  ai_recommendation?: string;
  ai_confidence?: string;
}

export interface RiskFactor {
  factor: string;
  impact: string;
  score: number;
}

export interface RecommendedAction {
  action: string;
  internal_evidence: string | null;
  external_evidence: string | null;
}

export interface WhyAdjustedRecord {
  factor: string;
  impact: number;
  source: string;
}

export interface DashboardData {
  success: boolean;
  summary: {
    business_name: string;
    industry: string;
    location: string;
    employees: number;
    machines: number;
    total_records_months: number;
    last_upload_filename: string;
    last_upload_date: string;
    data_records_count: number;
  };
  kpis: {
    avg_monthly_revenue_lakh: number;
    revenue_change_pct: number;
    ml_forecast_8_weeks_avg_lakh: number;
    forecast_change_pct: number;
    confidence_pct: number;
    confidence_category: 'High' | 'Medium' | 'Low';
    business_risk_score: number;
    business_risk_category: 'High' | 'Medium' | 'Low';
    risk_factors: RiskFactor[];
    ai_scenario_forecast_lakh: number;
    forecast_difference_lakh: number;
    ai_executive_summary: string;
    forecast_explanation?: string;
  };
  forecast_data: {
    historical: HistoricalRecord[];
    ml_prediction: number[];
    prediction_interval_std: number;
    weeks_labels: string[];
    ai_scenario_prediction: number[];
    why_adjusted: WhyAdjustedRecord[];
  };
  shap_importance: Record<string, number>;
  shap_explanation: string;
  market_intelligence: {
    title: string;
    source: string;
    pubDate: string;
    link: string;
    category: 'Raw Material' | 'Industry Trend' | 'Government';
    business_impact: string;
    suggested_action: string;
  }[];
  customer_intelligence: {
    active_customers: number;
    healthy_customers_count: number;
    healthy_customers_pct: number;
    medium_risk_count: number;
    medium_risk_pct: number;
    high_risk_count: number;
    high_risk_pct: number;
    revenue_concentration_pct: number;
    customers: CustomerRecord[];
  };
  executive_recommendation: {
    summary: string;
    recommended_actions: RecommendedAction[];
    potential_impact: {
      cash_flow_improvement: string;
      revenue_protection: string;
    };
    confidence_score: number;
  };
}

export const uploadDataset = async (file: File): Promise<DashboardData> => {
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await fetch('/api/upload', {
    method: 'POST',
    body: formData,
  });
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || 'Failed to upload dataset.');
  }
  return response.json();
};

export const DEFAULT_DASHBOARD_DATA: DashboardData = {
  success: true,
  summary: {
    business_name: "Meenakshi Precision Components",
    industry: "CNC Machining | Auto Ancillary",
    location: "Peenya, Bengaluru",
    employees: 18,
    machines: 8,
    total_records_months: 36,
    last_upload_filename: "history_data.csv",
    last_upload_date: "14 Jul 2025, 11:32 AM",
    data_records_count: 180
  },
  kpis: {
    avg_monthly_revenue_lakh: 18.6,
    revenue_change_pct: 6.3,
    ml_forecast_8_weeks_avg_lakh: 17.8,
    forecast_change_pct: -4.2,
    confidence_pct: 88,
    confidence_category: "High",
    business_risk_score: 54,
    business_risk_category: "Medium",
    risk_factors: [
      { factor: "Customer Concentration", impact: "High (Top 3 accounts = 58%)", score: 58 },
      { factor: "Payment Delays", impact: "Average 14.1 days", score: 56 },
      { factor: "Market Price Fluctuations", impact: "Steel Index at 138.4", score: 45 }
    ],
    ai_scenario_forecast_lakh: 17.1,
    forecast_difference_lakh: -0.7,
    ai_executive_summary: "Financial performance is stable but vulnerable to raw material index volatility in Peenya clusters.",
    forecast_explanation: "Baseline forecast is model-predicted at 17.8 Lakh avg weekly."
  },
  forecast_data: {
    historical: [
      { date: "2025-01-03", revenue: 14.1, orders: 40, steel_price: 135, machine_utilization: 82, active_customers: 6, inventory_level: 120, payment_delays: 12 },
      { date: "2025-01-10", revenue: 14.5, orders: 42, steel_price: 136, machine_utilization: 84, active_customers: 6, inventory_level: 122, payment_delays: 13 },
      { date: "2025-01-17", revenue: 14.9, orders: 44, steel_price: 137, machine_utilization: 85, active_customers: 6, inventory_level: 125, payment_delays: 14 },
      { date: "2025-01-24", revenue: 15.3, orders: 45, steel_price: 138, machine_utilization: 86, active_customers: 6, inventory_level: 128, payment_delays: 14 },
      { date: "2025-01-31", revenue: 15.6, orders: 46, steel_price: 138, machine_utilization: 88, active_customers: 6, inventory_level: 130, payment_delays: 15 }
    ],
    ml_prediction: [17.8, 17.9, 18.0, 18.2, 18.1, 18.3, 18.4, 18.5],
    prediction_interval_std: 0.8,
    weeks_labels: ["W1", "W2", "W3", "W4", "W5", "W6", "W7", "W8"],
    ai_scenario_prediction: [17.1, 17.2, 17.3, 17.4, 17.3, 17.5, 17.6, 17.7],
    why_adjusted: [
      { factor: "Raw Material Inflation", impact: -0.4, source: "Steel Index" },
      { factor: "Payment Collection Lag", impact: -0.3, source: "AR Aging" }
    ]
  },
  shap_importance: {
    "Order Volume": 0.42,
    "Steel Price": -0.28,
    "Payment Delay": -0.18,
    "Machine Downtime": -0.12
  },
  shap_explanation: "Order volume remains the strongest positive driver (+42%).",
  market_intelligence: [
    {
      title: "Steel prices rise +4% in Bengaluru industrial clusters",
      source: "Economic Times",
      pubDate: "Recent",
      link: "https://economictimes.indiatimes.com",
      category: "Raw Material",
      business_impact: "Raw material inflation compresses product margins by 2-4%.",
      suggested_action: "Consider index-linked pricing in long-term supply contracts."
    }
  ],
  customer_intelligence: {
    active_customers: 4,
    healthy_customers_count: 2,
    healthy_customers_pct: 50,
    medium_risk_count: 1,
    medium_risk_pct: 25,
    high_risk_count: 1,
    high_risk_pct: 25,
    revenue_concentration_pct: 72,
    customers: [
      {
        name: "ABC Industries",
        key: "cust_abc",
        revenue_share: 38,
        avg_payment_delay: 38,
        delayed_invoices: 4,
        total_invoices: 10,
        trend: "down",
        risk_score: "High",
        history: [{ month: "Jan", orders: 10, payments: 6, delay: 38 }],
        ai_summary: "High payment delay client needing credit limits.",
        ai_observed_behavior: "Delayed payment cycle over 30 days.",
        ai_business_impact: "Compresses monthly liquidity.",
        ai_recommendation: "Require 30% advance deposit.",
        ai_confidence: "High"
      }
    ]
  },
  executive_recommendation: {
    summary: "Initiate +3.4% steel surcharge on CNC orders to protect gross margin corridor.",
    recommended_actions: [
      { action: "Apply Raw Material Surcharge", internal_evidence: "Steel cost up 4%", external_evidence: "Peenya spot prices" }
    ],
    potential_impact: {
      cash_flow_improvement: "+₹1.2 Lakh / month",
      revenue_protection: "Guarantees 16.5% operating margin"
    },
    confidence_score: 92
  }
};

export const loadSampleData = async (): Promise<DashboardData> => {
  try {
    const response = await fetch('/api/load-sample', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    if (!response.ok) {
      throw new Error('Failed to load sample data.');
    }
    return await response.json();
  } catch (err) {
    console.warn("Using default fallback sample data:", err);
    return DEFAULT_DASHBOARD_DATA;
  }
};

export const getSectionExplanation = async (section: string, context: any): Promise<string> => {
  const response = await fetch('/api/explain', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ section, context }),
  });
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || 'Failed to get explanation.');
  }
  const data = await response.json();
  return data.explanation;
};

export interface ChatHistoryItem {
  role: 'user' | 'model';
  parts: string;
}

export const queryAIAnalyst = async (
  question: string, 
  history: ChatHistoryItem[], 
  context: any
): Promise<string> => {
  const response = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ question, history, context }),
  });
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || 'Failed to query AI analyst.');
  }
  const data = await response.json();
  return data.response;
};

export interface SimulationParams {
  ordersMultiplier: number;
  steelPriceMultiplier: number;
  paymentDelayModifier: number;
  utilizationMultiplier: number;
  filePath?: string;
}

export const runSimulation = async (params: SimulationParams): Promise<DashboardData> => {
  const response = await fetch('/api/simulate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || 'Failed to run simulation.');
  }
  return response.json();
};
