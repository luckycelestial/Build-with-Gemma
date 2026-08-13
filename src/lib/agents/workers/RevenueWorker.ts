import { WorkerType } from '../../tools/types';
import { WorkflowEngine } from '../../workflows/WorkflowEngine';

export class RevenueWorker {
  public readonly workerType: WorkerType = 'RevenueWorker';

  public async executeAssignedWorkflowStep(workflowId: string): Promise<void> {
    console.log(`📈 [RevenueWorker] Executing assigned workflow '${workflowId}' step...`);
    await WorkflowEngine.advanceWorkflow(workflowId);
  }
}
