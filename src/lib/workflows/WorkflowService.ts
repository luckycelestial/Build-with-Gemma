import { WorkflowEngine } from './WorkflowEngine';
import { WorkflowInstanceData } from './types';
import { OperationId } from '../operations/types';

export class WorkflowService {
  /**
   * Retrieves all running workflows.
   */
  static getRunningWorkflows(): WorkflowInstanceData[] {
    return WorkflowEngine.getAllWorkflows().filter(
      wf => wf.status !== 'Completed' && wf.status !== 'Failed' && wf.status !== 'Cancelled'
    );
  }

  /**
   * Retrieves all completed workflows.
   */
  static getCompletedWorkflows(): WorkflowInstanceData[] {
    return WorkflowEngine.getAllWorkflows().filter(wf => wf.status === 'Completed');
  }

  /**
   * Retrieves workflows pending owner approval.
   */
  static getPendingApprovalWorkflows(): WorkflowInstanceData[] {
    return WorkflowEngine.getAllWorkflows().filter(wf => wf.status === 'Pending_Approval');
  }

  /**
   * Retrieves workflows bound to a specific operation.
   */
  static getWorkflowsByOperation(operationId: OperationId): WorkflowInstanceData[] {
    return WorkflowEngine.getAllWorkflows().filter(wf => wf.operationId === operationId);
  }
}
