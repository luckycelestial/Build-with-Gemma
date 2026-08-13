import { WorkerType } from '../../tools/types';
import { WorkflowEngine } from '../../workflows/WorkflowEngine';

export class MarketWorker {
  public readonly workerType: WorkerType = 'MarketIntelligenceWorker';

  public async executeAssignedWorkflowStep(workflowId: string): Promise<void> {
    console.log(`🌐 [MarketWorker] Executing assigned workflow '${workflowId}' step...`);
    await WorkflowEngine.advanceWorkflow(workflowId);
  }
}
