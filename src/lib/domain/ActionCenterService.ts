import { WorkflowService } from '../workflows/WorkflowService';
import { CapabilityRegistryInstance } from '../tools';
import { WorkflowEngine } from '../workflows/WorkflowEngine';

export interface ActionCenterState {
  pendingApprovals: Array<{
    workflowId: string;
    title: string;
    stepName: string;
    toolId: string;
    businessImpact: string;
  }>;
  runningWorkflowsCount: number;
  completedWorkflowsCount: number;
  auditTrailCount: number;
}

export class ActionCenterService {
  /**
   * Retrieves operational inbox state for Action Center UI.
   */
  static getActionCenterState(): ActionCenterState {
    const pendingWorkflows = WorkflowService.getPendingApprovalWorkflows();
    const runningWorkflows = WorkflowService.getRunningWorkflows();
    const completedWorkflows = WorkflowService.getCompletedWorkflows();
    const auditLogs = CapabilityRegistryInstance.getAuditLog();

    const pendingApprovals = pendingWorkflows.map(wf => {
      const currentStepObj = wf.steps[wf.currentStep];
      return {
        workflowId: wf.id,
        title: wf.title,
        stepName: currentStepObj?.name || 'Action Sign-off',
        toolId: currentStepObj?.toolId || 'unknown_tool',
        businessImpact: wf.businessImpact || 'Operational Action'
      };
    });

    return {
      pendingApprovals,
      runningWorkflowsCount: runningWorkflows.length,
      completedWorkflowsCount: completedWorkflows.length,
      auditTrailCount: auditLogs.length
    };
  }

  /**
   * Approves a pending workflow action from Action Center or WhatsApp.
   */
  static async approveAction(workflowId: string): Promise<boolean> {
    try {
      await WorkflowEngine.approveWorkflowStep(workflowId);
      return true;
    } catch (err: any) {
      console.error(`Failed to approve workflow '${workflowId}':`, err.message);
      return false;
    }
  }
}
