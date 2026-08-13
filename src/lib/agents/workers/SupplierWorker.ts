import { WorkerType } from '../../tools/types';
import { WorkflowEngine } from '../../workflows/WorkflowEngine';

export class SupplierWorker {
  public readonly workerType: WorkerType = 'SupplierWorker';

  public async executeAssignedWorkflowStep(workflowId: string): Promise<void> {
    console.log(`🚚 [SupplierWorker] Executing assigned workflow '${workflowId}' step...`);
    await WorkflowEngine.advanceWorkflow(workflowId);
  }
}
