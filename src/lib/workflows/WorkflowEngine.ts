import { WorkflowInstanceData, WorkflowStatus, WorkflowStepDefinition, WorkflowStepState } from './types';
import { OperationId } from '../operations/types';
import { WorkerType } from '../tools/types';
import { CapabilityRegistryInstance } from '../tools';
import { OperationRegistryInstance } from '../operations/OperationRegistry';
import { BusinessEventBus } from '../events/BusinessEventBus';

export class WorkflowEngine {
  private static instances: Map<string, WorkflowInstanceData> = new Map();

  /**
   * Creates a new Workflow Instance bound to a Business Operation.
   */
  static createWorkflow(config: {
    operationId: OperationId;
    title: string;
    assignedWorker: WorkerType;
    steps: WorkflowStepDefinition[];
    goalId?: string;
    businessImpact?: string;
    expectedOutcome?: string;
    contextSnapshot?: Record<string, any>;
  }): WorkflowInstanceData {
    const id = `wf-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    const stepsState: WorkflowStepState[] = config.steps.map((s, idx) => ({
      id: `step-${id}-${idx + 1}`,
      ...s,
      status: 'Pending'
    }));

    const workflow: WorkflowInstanceData = {
      id,
      operationId: config.operationId,
      goalId: config.goalId,
      workflowType: config.title.replace(/\s+/g, '_'),
      title: config.title,
      assignedWorker: config.assignedWorker,
      status: 'Created',
      currentStep: 0,
      businessImpact: config.businessImpact || 'Operational risk mitigation',
      expectedOutcome: config.expectedOutcome || 'Successful multi-step action execution',
      contextSnapshot: config.contextSnapshot || {},
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      steps: stepsState
    };

    this.instances.set(id, workflow);

    // Register with Business Operation
    const op = OperationRegistryInstance.getOperation(config.operationId);
    if (op) op.addWorkflow(id);

    // Emit Event
    BusinessEventBus.publish({
      id: `evt-wf-created-${Date.now()}`,
      type: 'WorkflowCreated' as any,
      timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }),
      source: 'WorkflowEngine' as any,
      summary: `Workflow '${config.title}' initialized by Executive AI CTO for Operation: ${config.operationId}`,
      details: { workflowId: id, operationId: config.operationId, assignedWorker: config.assignedWorker },
      deepLink: '/'
    });

    console.log(`⚡ [WorkflowEngine] Created Workflow '${id}' (${config.title}) for Operation '${config.operationId}'`);

    return workflow;
  }

  /**
   * Advances the workflow through state machine execution.
   */
  static async advanceWorkflow(id: string): Promise<WorkflowInstanceData> {
    const wf = this.instances.get(id);
    if (!wf) throw new Error(`Workflow '${id}' not found`);

    if (wf.status === 'Completed' || wf.status === 'Failed' || wf.status === 'Cancelled') {
      return wf;
    }

    if (wf.status === 'Created') {
      wf.status = 'Planning';
      wf.updatedAt = new Date().toISOString();
    }

    if (wf.status === 'Planning') {
      // Evaluate first step requirements
      const currentStepObj = wf.steps[wf.currentStep];
      if (!currentStepObj) {
        wf.status = 'Completed';
        wf.updatedAt = new Date().toISOString();
        const op = OperationRegistryInstance.getOperation(wf.operationId);
        if (op) op.completeWorkflow(id);
        return wf;
      }

      if (currentStepObj.executionMode === 'Approval_Required') {
        wf.status = 'Pending_Approval';
        currentStepObj.status = 'Pending';
        wf.updatedAt = new Date().toISOString();

        const op = OperationRegistryInstance.getOperation(wf.operationId);
        if (op) op.addPendingApproval(id);

        BusinessEventBus.publish({
          id: `evt-wf-appr-${Date.now()}`,
          type: 'ApprovalRequested' as any,
          timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }),
          source: 'WorkflowEngine' as any,
          summary: `Action approval requested for Workflow '${wf.title}' (Step: ${currentStepObj.name})`,
          details: { workflowId: id, stepId: currentStepObj.id, toolId: currentStepObj.toolId },
          deepLink: '/'
        });

        return wf;
      } else {
        wf.status = 'Executing';
        wf.updatedAt = new Date().toISOString();
      }
    }

    if (wf.status === 'Executing') {
      const currentStepObj = wf.steps[wf.currentStep];
      if (!currentStepObj) {
        wf.status = 'Completed';
        wf.updatedAt = new Date().toISOString();
        return wf;
      }

      currentStepObj.status = 'Executing';

      console.log(`⚙️ [WorkflowEngine] Executing Step ${wf.currentStep + 1}/${wf.steps.length} (${currentStepObj.name}) via Tool '${currentStepObj.toolId}'...`);

      // Invoke Tool Registry Tool!
      const toolRes = await CapabilityRegistryInstance.executeTool(
        currentStepObj.toolId,
        currentStepObj.inputParameters,
        {
          workflowId: wf.id,
          operationId: wf.operationId,
          initiatedBy: wf.assignedWorker
        }
      );

      if (toolRes.success) {
        currentStepObj.status = 'Completed';
        currentStepObj.outputResult = toolRes.data;
        currentStepObj.executedAt = new Date().toISOString();
        currentStepObj.verificationState = 'Verified';

        wf.currentStep += 1;

        if (wf.currentStep >= wf.steps.length) {
          wf.status = 'Completed';
          wf.updatedAt = new Date().toISOString();

          const op = OperationRegistryInstance.getOperation(wf.operationId);
          if (op) op.completeWorkflow(id);

          BusinessEventBus.publish({
            id: `evt-wf-comp-${Date.now()}`,
            type: 'WorkflowCompleted' as any,
            timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }),
            source: 'WorkflowEngine' as any,
            summary: `Workflow '${wf.title}' successfully completed all steps`,
            details: { workflowId: id },
            deepLink: '/'
          });
        } else {
          wf.status = 'Planning'; // Continue to next step
          return await this.advanceWorkflow(id);
        }
      } else {
        currentStepObj.status = 'Failed';
        currentStepObj.verificationState = `Error: ${toolRes.error}`;
        wf.status = 'Failed';
        wf.updatedAt = new Date().toISOString();

        BusinessEventBus.publish({
          id: `evt-wf-fail-${Date.now()}`,
          type: 'ActionFailed' as any,
          timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }),
          source: 'WorkflowEngine' as any,
          summary: `Workflow '${wf.title}' failed at step '${currentStepObj.name}': ${toolRes.error}`,
          details: { workflowId: id, error: toolRes.error },
          deepLink: '/'
        });
      }
    }

    return wf;
  }

  /**
   * Approves a pending approval step in a workflow.
   */
  static async approveWorkflowStep(id: string): Promise<WorkflowInstanceData> {
    const wf = this.instances.get(id);
    if (!wf || wf.status !== 'Pending_Approval') {
      throw new Error(`Workflow '${id}' is not pending approval`);
    }

    const currentStepObj = wf.steps[wf.currentStep];
    if (currentStepObj) {
      currentStepObj.status = 'Approved';
    }

    const op = OperationRegistryInstance.getOperation(wf.operationId);
    if (op) op.resolvePendingApproval(id);

    wf.status = 'Executing';
    wf.updatedAt = new Date().toISOString();

    BusinessEventBus.publish({
      id: `evt-wf-appr-grant-${Date.now()}`,
      type: 'ApprovalGranted' as any,
      timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }),
      source: 'FactoryOwner' as any,
      summary: `Owner approved step '${currentStepObj?.name}' for Workflow '${wf.title}'`,
      details: { workflowId: id },
      deepLink: '/'
    });

    return await this.advanceWorkflow(id);
  }

  public static getWorkflow(id: string): WorkflowInstanceData | undefined {
    return this.instances.get(id);
  }

  public static getAllWorkflows(): WorkflowInstanceData[] {
    return Array.from(this.instances.values());
  }
}
