import { WorkerType } from '../../tools/types';
import { WorkflowEngine } from '../../workflows/WorkflowEngine';

export class ReportingWorker {
  public readonly workerType: WorkerType = 'ReportingWorker';

  public async executeAssignedWorkflowStep(workflowId: string): Promise<void> {
    console.log(`📝 [ReportingWorker] Executing assigned workflow '${workflowId}' step...`);
    await WorkflowEngine.advanceWorkflow(workflowId);
  }
}
