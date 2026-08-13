import { Operation } from './Operation';
import { OperationId, OperationSnapshot } from './types';

class OperationRegistryClass {
  private operations: Map<OperationId, Operation> = new Map();

  constructor() {
    this.initializeDefaultOperations();
  }

  private initializeDefaultOperations(): void {
    // 1. Procurement Operation
    this.register(new Operation({
      operationId: 'procurement',
      name: 'Procurement & Raw Material Operation',
      description: 'Manages raw material inventory, low-stock alerts, supplier RFQs, and purchase order fulfillment.',
      primaryWorker: 'ProcurementWorker',
      status: 'Optimal',
      goals: [
        { id: 'g-proc-1', name: 'Zero Stockout Downtime', targetMetric: '0 Stockouts', currentMetric: '0 Stockouts', status: 'OnTrack' }
      ],
      kpis: [
        { label: 'Active SKUs', value: 42, status: 'healthy' },
        { label: 'Low Stock Alerts', value: 2, status: 'warning' }
      ],
      expectedBusinessOutcome: 'Secure uninterrupted raw material supply at optimal unit purchase rates.'
    }));

    // 2. Pricing Operation
    this.register(new Operation({
      operationId: 'pricing',
      name: 'Pricing & Margin Defense Operation',
      description: 'Monitors raw material spot market indices, calculates product gross margins, and enforces price pass-through surcharges.',
      primaryWorker: 'PricingWorker',
      status: 'Optimal',
      goals: [
        { id: 'g-prc-1', name: 'Maintain Gross Margin Corridor', targetMetric: '>= 16.5%', currentMetric: '16.8%', status: 'OnTrack' }
      ],
      kpis: [
        { label: 'Average Margin', value: '16.8%', status: 'healthy' },
        { label: 'Pending Surcharges', value: 1, status: 'warning' }
      ],
      expectedBusinessOutcome: 'Protect shop floor operating margins against raw steel price inflation.'
    }));

    // 3. Revenue Protection Operation
    this.register(new Operation({
      operationId: 'revenue',
      name: 'Revenue & Risk Protection Operation',
      description: 'Executes time-series revenue forecasting (XGBoost), SHAP explainability analysis, and business risk scoring.',
      primaryWorker: 'RevenueWorker',
      status: 'Optimal',
      goals: [
        { id: 'g-rev-1', name: 'Protect Baseline Monthly Revenue', targetMetric: '₹18.6 Lakh', currentMetric: '₹18.6 Lakh', status: 'OnTrack' }
      ],
      kpis: [
        { label: 'Monthly Revenue Avg', value: '₹18.6 Lakh', status: 'healthy' },
        { label: 'Forecast Confidence', value: '88%', status: 'healthy' }
      ],
      expectedBusinessOutcome: 'Maintain stable weekly revenue trajectory and flag client concentration risks.'
    }));

    // 4. Collections Operation
    this.register(new Operation({
      operationId: 'collections',
      name: 'Collections & Accounts Receivable Operation',
      description: 'Monitors client aging balances, generates multi-channel collection reminders, and enforces credit limits.',
      primaryWorker: 'CollectionsWorker',
      status: 'Attention_Required',
      goals: [
        { id: 'g-col-1', name: 'Reduce Collection Lag', targetMetric: '< 15 days', currentMetric: '14.1 days', status: 'OnTrack' }
      ],
      kpis: [
        { label: 'Outstanding Balance', value: '₹3.8 Lakh', status: 'warning' },
        { label: 'Overdue Accounts', value: 3, status: 'warning' }
      ],
      expectedBusinessOutcome: 'Accelerate liquidity inflow and eliminate overdue receivables.'
    }));

    // 5. Supplier Operation
    this.register(new Operation({
      operationId: 'supplier',
      name: 'Supplier & Supply Chain Operation',
      description: 'Tracks multi-node shipment status, vendor lead times, and supplier reliability ratings.',
      primaryWorker: 'SupplierWorker',
      status: 'Optimal',
      goals: [
        { id: 'g-sup-1', name: 'Supplier On-Time Delivery', targetMetric: '>= 90%', currentMetric: '92%', status: 'OnTrack' }
      ],
      kpis: [
        { label: 'Active Shipments', value: 3, status: 'healthy' },
        { label: 'Vendor Rating', value: '4.6 / 5.0', status: 'healthy' }
      ],
      expectedBusinessOutcome: 'Maintain high vendor reliability and visibility across supply chain transit nodes.'
    }));

    // 6. Market Intelligence Operation
    this.register(new Operation({
      operationId: 'market_intelligence',
      name: 'Market Intelligence & Signal Crawling Operation',
      description: 'Crawls industry RSS feeds, commodity spot quotes, and government MSME policies for proactive operational hedging.',
      primaryWorker: 'MarketWorker',
      status: 'Optimal',
      goals: [
        { id: 'g-mkt-1', name: 'Proactive Price Inflation Detection', targetMetric: '100% Coverage', currentMetric: 'Active Feed', status: 'OnTrack' }
      ],
      kpis: [
        { label: 'Steel Price Index', value: '138.4 (+4%)', status: 'warning' },
        { label: 'Crawled Signals', value: 8, status: 'healthy' }
      ],
      expectedBusinessOutcome: 'Early detection of macro cost headwinds to inform raw material hedging strategy.'
    }));

    // 7. Customer Success Operation
    this.register(new Operation({
      operationId: 'customer_success',
      name: 'Customer Success & Account Intelligence Operation',
      description: 'Analyzes client ordering patterns, payment behaviors, and contract renewal terms.',
      primaryWorker: 'CustomerSuccessWorker',
      status: 'Optimal',
      goals: [
        { id: 'g-cs-1', name: 'Key Account Retention', targetMetric: '100%', currentMetric: '100%', status: 'OnTrack' }
      ],
      kpis: [
        { label: 'Active Customers', value: 26, status: 'healthy' },
        { label: 'High Risk Clients', value: 3, status: 'warning' }
      ],
      expectedBusinessOutcome: 'Deep customer insight to prevent account churn and manage risk.'
    }));

    // 8. Reporting Operation
    this.register(new Operation({
      operationId: 'reporting',
      name: 'Executive Reporting & Governance Operation',
      description: 'Compiles PDF briefings, board memos, and automated WhatsApp status digests for factory owners.',
      primaryWorker: 'ReportingWorker',
      status: 'Optimal',
      goals: [
        { id: 'g-rep-1', name: 'Automated Daily Executive Briefings', targetMetric: 'Daily Delivery', currentMetric: 'Active', status: 'OnTrack' }
      ],
      kpis: [
        { label: 'Memos Compiled', value: 12, status: 'healthy' },
        { label: 'WhatsApp Digests', value: 'Daily', status: 'healthy' }
      ],
      expectedBusinessOutcome: 'Clear executive visibility and governance reporting for factory leadership.'
    }));
  }

  public register(operation: Operation): void {
    this.operations.set(operation.operationId, operation);
  }

  public getOperation(id: OperationId): Operation | undefined {
    return this.operations.get(id);
  }

  public getAllOperations(): Operation[] {
    return Array.from(this.operations.values());
  }

  public getAllSnapshots(): OperationSnapshot[] {
    return this.getAllOperations().map(op => op.getSnapshot());
  }
}

export const OperationRegistryInstance = new OperationRegistryClass();
