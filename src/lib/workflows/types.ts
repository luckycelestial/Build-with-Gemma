import { OperationId } from '../operations/types';
import { WorkerType, ExecutionMode } from '../tools/types';

export type WorkflowStatus =
  | 'Created'
  | 'Planning'
  | 'Pending_Approval'
  | 'Executing'
  | 'Verifying'
  | 'Completed'
  | 'Failed'
  | 'Cancelled';

export interface WorkflowStepDefinition {
  sequence: number;
  name: string;
  toolId: string;
  inputParameters: Record<string, any>;
  executionMode: ExecutionMode;
}

export interface WorkflowStepState extends WorkflowStepDefinition {
  id: string;
  status: 'Pending' | 'Approved' | 'Executing' | 'Completed' | 'Failed';
  verificationState?: string;
  outputResult?: Record<string, any>;
  executedAt?: string;
}

export interface WorkflowInstanceData {
  id: string;
  operationId: OperationId;
  goalId?: string;
  workflowType: string;
  title: string;
  assignedWorker: WorkerType;
  status: WorkflowStatus;
  currentStep: number;
  businessImpact?: string;
  expectedOutcome?: string;
  contextSnapshot?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
  steps: WorkflowStepState[];
}
