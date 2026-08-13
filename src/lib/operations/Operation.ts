import { OperationId, OperationSnapshot, OperationStatus, OperationGoal, OperationKPI } from './types';
import { WorkerType } from '../tools/types';

export class Operation {
  public readonly operationId: OperationId;
  public readonly name: string;
  public readonly description: string;
  public readonly primaryWorker: WorkerType;
  private status: OperationStatus;
  private goals: OperationGoal[];
  private kpis: OperationKPI[];
  private runningWorkflows: string[] = [];
  private completedWorkflows: string[] = [];
  private pendingApprovals: string[] = [];
  private expectedBusinessOutcome: string;

  constructor(config: {
    operationId: OperationId;
    name: string;
    description: string;
    primaryWorker: WorkerType;
    status?: OperationStatus;
    goals?: OperationGoal[];
    kpis?: OperationKPI[];
    expectedBusinessOutcome?: string;
  }) {
    this.operationId = config.operationId;
    this.name = config.name;
    this.description = config.description;
    this.primaryWorker = config.primaryWorker;
    this.status = config.status || 'Optimal';
    this.goals = config.goals || [];
    this.kpis = config.kpis || [];
    this.expectedBusinessOutcome = config.expectedBusinessOutcome || 'Maintain operational excellence and margin stability.';
  }

  public getSnapshot(): OperationSnapshot {
    return {
      operationId: this.operationId,
      name: this.name,
      description: this.description,
      status: this.status,
      primaryWorker: this.primaryWorker,
      goals: [...this.goals],
      kpis: [...this.kpis],
      runningWorkflowsCount: this.runningWorkflows.length,
      completedWorkflowsCount: this.completedWorkflows.length,
      pendingApprovalsCount: this.pendingApprovals.length,
      expectedBusinessOutcome: this.expectedBusinessOutcome,
      lastUpdated: new Date().toISOString()
    };
  }

  public updateMetrics(kpis: OperationKPI[], status?: OperationStatus): void {
    this.kpis = kpis;
    if (status) this.status = status;
  }

  public addWorkflow(workflowId: string): void {
    if (!this.runningWorkflows.includes(workflowId)) {
      this.runningWorkflows.push(workflowId);
    }
  }

  public completeWorkflow(workflowId: string): void {
    this.runningWorkflows = this.runningWorkflows.filter(id => id !== workflowId);
    if (!this.completedWorkflows.includes(workflowId)) {
      this.completedWorkflows.push(workflowId);
    }
  }

  public addPendingApproval(approvalId: string): void {
    if (!this.pendingApprovals.includes(approvalId)) {
      this.pendingApprovals.push(approvalId);
    }
  }

  public resolvePendingApproval(approvalId: string): void {
    this.pendingApprovals = this.pendingApprovals.filter(id => id !== approvalId);
  }
}
