import { WorkerType } from '../../tools/types';
import { WorkflowEngine } from '../../workflows/WorkflowEngine';

export class ProcurementWorker {
  public readonly workerType: WorkerType = 'ProcurementWorker';

  public async executeAssignedWorkflowStep(workflowId: string): Promise<void> {
    console.log(`🔨 [ProcurementWorker] Executing assigned workflow '${workflowId}' step...`);
    await WorkflowEngine.advanceWorkflow(workflowId);
  }
}
