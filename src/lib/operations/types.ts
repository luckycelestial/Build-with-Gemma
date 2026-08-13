import { WorkerType } from '../tools/types';

export type OperationId =
  | 'procurement'
  | 'pricing'
  | 'revenue'
  | 'collections'
  | 'customer_success'
  | 'supplier'
  | 'market_intelligence'
  | 'reporting';

export type OperationStatus = 'Optimal' | 'Attention_Required' | 'Critical';

export interface OperationGoal {
  id: string;
  name: string;
  targetMetric: string;
  currentMetric: string;
  status: 'OnTrack' | 'AtRisk' | 'Achieved';
}

export interface OperationKPI {
  label: string;
  value: string | number;
  changePct?: number;
  status?: 'healthy' | 'warning' | 'critical';
}

export interface OperationSnapshot {
  operationId: OperationId;
  name: string;
  description: string;
  status: OperationStatus;
  primaryWorker: WorkerType;
  goals: OperationGoal[];
  kpis: OperationKPI[];
  runningWorkflowsCount: number;
  completedWorkflowsCount: number;
  pendingApprovalsCount: number;
  expectedBusinessOutcome: string;
  lastUpdated: string;
}
