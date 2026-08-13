import { WorkerType } from '../../tools/types';
import { WorkflowEngine } from '../../workflows/WorkflowEngine';

export class CustomerSuccessWorker {
  public readonly workerType: WorkerType = 'CustomerIntelligenceWorker';

  public async executeAssignedWorkflowStep(workflowId: string): Promise<void> {
    console.log(`🤝 [CustomerSuccessWorker] Executing assigned workflow '${workflowId}' step...`);
    await WorkflowEngine.advanceWorkflow(workflowId);
  }
}
