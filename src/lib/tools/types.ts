import { BusinessEvent } from '../events/BusinessEventBus';

export type ToolCategory =
  | 'Procurement'
  | 'Pricing'
  | 'Collections'
  | 'Revenue'
  | 'Inventory'
  | 'Reporting'
  | 'Market'
  | 'Communication'
  | 'Workflow';

export type WorkerType =
  | 'ExecutiveCTO'
  | 'ProcurementWorker'
  | 'PricingWorker'
  | 'RevenueWorker'
  | 'CollectionsWorker'
  | 'SupplierWorker'
  | 'ReportingWorker'
  | 'CustomerIntelligenceWorker'
  | 'MarketIntelligenceWorker';

export type OperationType =
  | 'ProcurementOperation'
  | 'PricingOperation'
  | 'RevenueProtectionOperation'
  | 'CollectionsOperation'
  | 'SupplierOperation'
  | 'CustomerSuccessOperation'
  | 'ReportingOperation'
  | 'MarketIntelligenceOperation'
  | 'WorkflowGovernanceOperation';

export type Permission =
  | 'inventory:read'
  | 'inventory:write'
  | 'pricing:read'
  | 'pricing:write'
  | 'collections:read'
  | 'collections:write'
  | 'supplier:read'
  | 'supplier:write'
  | 'revenue:read'
  | 'reports:generate'
  | 'comms:send'
  | 'workflow:manage';

export type ExecutionMode = 'Autonomous' | 'Approval_Required' | 'Manual';

export interface VerificationStrategy {
  type: 'DatabaseCheck' | 'StateComparison' | 'ExternalAcknowledgement' | 'None';
  description: string;
}

export interface RetryPolicy {
  maxRetries: number;
  backoffMs: number;
  retryOnErrors?: string[];
}

export interface ApprovalPolicy {
  required: boolean;
  approvalRole?: 'FactoryOwner' | 'CFO' | 'ProcurementHead';
  thresholdRule?: string; // e.g. "amount > 50000" or "margin_impact < -2%"
}

export interface CompensationStrategy {
  canRollback: boolean;
  rollbackToolId?: string;
  description?: string;
}

export interface BusinessToolMetadata {
  id: string;
  name: string;
  description: string;
  category: ToolCategory;
  capabilityName: string;
  ownedByWorker: WorkerType;
  supportedOperations: OperationType[];
  requiredPermissions: Permission[];
  executionMode: ExecutionMode;
  estimatedExecutionTimeMs?: number;
  producesEvents: BusinessEvent['type'][];
  consumesEvents: BusinessEvent['type'][];
  verificationStrategy: VerificationStrategy;
  retryPolicy: RetryPolicy;
  approvalPolicy: ApprovalPolicy;
  compensationStrategy?: CompensationStrategy;
  tags: string[];
}

export interface ToolExecutionContext {
  workflowId?: string;
  operationId?: string;
  goalId?: string;
  initiatedBy?: string;
  source?: 'WebUI' | 'WhatsApp' | 'WorkflowEngine' | 'SystemCron' | 'TallyERP';
  correlationId?: string;
  tenantId?: string;
}

export interface AuditEntry {
  timestamp: string;
  toolId: string;
  action: string;
  initiatedBy: string;
  status: 'Success' | 'Failure' | 'Pending_Approval';
  durationMs: number;
  details?: Record<string, any>;
}

export interface ToolExecutionResult<TData = any> {
  success: boolean;
  toolId: string;
  data: TData | null;
  error?: string;
  businessEvents: BusinessEvent[];
  auditEntries: AuditEntry[];
  warnings: string[];
  nextRecommendedActions: string[];
  executionTimeMs: number;
}
