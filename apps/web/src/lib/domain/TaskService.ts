import { WorkflowEngine } from '../workflows/WorkflowEngine';
import { WorkerType } from '../tools/types';

export interface TaskItem {
  id: string;
  workflowId: string;
  title: string;
  assignedWorker: WorkerType;
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  status: 'Pending' | 'InProgress' | 'Blocked' | 'Completed';
  businessImpact?: string;
  currentStepName?: string;
  createdAt: string;
}

export class TaskService {
  /**
   * Derives current operational tasks from active workflow steps.
   */
  static getActiveTasks(): TaskItem[] {
    const workflows = WorkflowEngine.getAllWorkflows();
    const tasks: TaskItem[] = [];

    workflows.forEach(wf => {
      if (wf.status !== 'Completed' && wf.status !== 'Failed' && wf.status !== 'Cancelled') {
        const currentStepObj = wf.steps[wf.currentStep];
        tasks.push({
          id: `task-${wf.id}`,
          workflowId: wf.id,
          title: `Step: ${currentStepObj?.name || wf.title}`,
          assignedWorker: wf.assignedWorker,
          priority: wf.status === 'Pending_Approval' ? 'Critical' : 'High',
          status: wf.status === 'Pending_Approval' ? 'Blocked' : 'InProgress',
          businessImpact: wf.businessImpact,
          currentStepName: currentStepObj?.name,
          createdAt: wf.createdAt
        });
      }
    });

    return tasks;
  }
}
