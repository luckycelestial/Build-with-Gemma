import { WorkerType } from '../../tools/types';
import { WorkflowEngine } from '../../workflows/WorkflowEngine';

export class PricingWorker {
  public readonly workerType: WorkerType = 'PricingWorker';

  public async executeAssignedWorkflowStep(workflowId: string): Promise<void> {
    console.log(`💲 [PricingWorker] Executing assigned workflow '${workflowId}' step...`);
    await WorkflowEngine.advanceWorkflow(workflowId);
  }
}
