import { WorkerType } from '../../tools/types';
import { WorkflowEngine } from '../../workflows/WorkflowEngine';

export class CollectionsWorker {
  public readonly workerType: WorkerType = 'CollectionsWorker';

  public async executeAssignedWorkflowStep(workflowId: string): Promise<void> {
    console.log(`🏦 [CollectionsWorker] Executing assigned workflow '${workflowId}' step...`);
    await WorkflowEngine.advanceWorkflow(workflowId);
  }
}
