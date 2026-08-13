import { ExecutiveCTOAgent } from '../agents/ExecutiveCTOAgent';
import { ProcurementWorker } from '../agents/workers/ProcurementWorker';
import { ActionCenterService } from '../domain/ActionCenterService';
import { BusinessEventBus } from '../events/BusinessEventBus';

export interface DemoStepStatus {
  stepIndex: number;
  timeLabel: string;
  title: string;
  description: string;
  status: 'Pending' | 'Active' | 'Completed';
}

export class ExecutiveDemoSimulator {
  private static isRunning = false;
  private static currentStep = 0;

  private static demoSteps: DemoStepStatus[] = [
    { stepIndex: 0, timeLabel: '09:00 AM', title: 'Market Alert Detected', description: 'Market Analyst detects +4.1% raw steel price index surge in Peenya cluster.', status: 'Pending' },
    { stepIndex: 1, timeLabel: '09:05 AM', title: 'Executive CTO Workflow Planning', description: 'Executive CTO evaluates SOPs and creates Pricing Surcharge & RFQ Workflows.', status: 'Pending' },
    { stepIndex: 2, timeLabel: '09:15 AM', title: 'AI Manager Tool Execution', description: 'Pricing Manager recalculates BOM margins; Procurement Manager generates RFQs.', status: 'Pending' },
    { stepIndex: 3, timeLabel: '09:30 AM', title: 'Owner Approval Gate Requested', description: 'Action card posted to Action Center & WhatsApp for factory owner sign-off.', status: 'Pending' },
    { stepIndex: 4, timeLabel: '09:45 AM', title: '1-Click Owner Approval Executed', description: 'Owner approves step; tool updates Tally ERP and restores safety stock.', status: 'Pending' },
    { stepIndex: 5, timeLabel: '10:00 AM', title: 'Morning Brief Memo Updated', description: 'Business Story Engine updates Morning Briefing Memo with ₹82,000 protected margin.', status: 'Pending' }
  ];

  public static getDemoSteps(): DemoStepStatus[] {
    return [...this.demoSteps];
  }

  public static getIsRunning(): boolean {
    return this.isRunning;
  }

  public static async runDemoSimulation(onProgress?: (steps: DemoStepStatus[]) => void): Promise<void> {
    if (this.isRunning) return;
    this.isRunning = true;
    console.log("🎬 [DemoSimulator] Initializing Executive Startup Pitch Simulation...");

    // Reset steps
    this.demoSteps.forEach(s => s.status = 'Pending');

    // Step 0: Market Alert
    this.demoSteps[0].status = 'Active';
    if (onProgress) onProgress([...this.demoSteps]);
    
    BusinessEventBus.publish({
      id: `evt-demo-market-${Date.now()}`,
      type: 'PriceChangeDetected' as any,
      timestamp: '09:00 AM',
      source: 'Market Analyst',
      summary: 'Raw steel price index surged +4.1% in Peenya manufacturing hub',
      details: { indexIncrease: 4.1 },
      deepLink: '/market-intelligence'
    });

    await new Promise(r => setTimeout(r, 2000));
    this.demoSteps[0].status = 'Completed';

    // Step 1: CTO Workflow Planning
    this.demoSteps[1].status = 'Active';
    if (onProgress) onProgress([...this.demoSteps]);

    const workflow = await ExecutiveCTOAgent.evaluateAndPlanWorkflow({
      id: `evt-demo-trigger-${Date.now()}`,
      type: 'InventoryThresholdBreached' as any,
      timestamp: '09:05 AM',
      source: 'InventorySensor',
      summary: 'Low Stock Threshold Breached for Solid Carbide End Mills 12mm (SKU: TL-EM-CAR-12)',
      details: { name: 'Solid Carbide End Mills 12mm', sku: 'TL-EM-CAR-12', supplierName: 'Jigani Tooling Labs' }
    });

    await new Promise(r => setTimeout(r, 2500));
    this.demoSteps[1].status = 'Completed';

    // Step 2: AI Manager Execution
    this.demoSteps[2].status = 'Active';
    if (onProgress) onProgress([...this.demoSteps]);

    if (workflow) {
      const worker = new ProcurementWorker();
      await worker.executeAssignedWorkflowStep(workflow.id);
    }

    await new Promise(r => setTimeout(r, 2500));
    this.demoSteps[2].status = 'Completed';

    // Step 3: Owner Approval Gate
    this.demoSteps[3].status = 'Active';
    if (onProgress) onProgress([...this.demoSteps]);

    const acState = ActionCenterService.getActionCenterState();
    await new Promise(r => setTimeout(r, 2500));
    this.demoSteps[3].status = 'Completed';

    // Step 4: 1-Click Approval
    this.demoSteps[4].status = 'Active';
    if (onProgress) onProgress([...this.demoSteps]);

    if (acState.pendingApprovals.length > 0) {
      await ActionCenterService.approveAction(acState.pendingApprovals[0].workflowId);
    }

    await new Promise(r => setTimeout(r, 2000));
    this.demoSteps[4].status = 'Completed';

    // Step 5: Morning Brief Memo Update
    this.demoSteps[5].status = 'Active';
    if (onProgress) onProgress([...this.demoSteps]);

    await new Promise(r => setTimeout(r, 2000));
    this.demoSteps[5].status = 'Completed';
    if (onProgress) onProgress([...this.demoSteps]);

    this.isRunning = false;
    console.log("🎉 [DemoSimulator] Executive Startup Pitch Simulation Complete!");
  }
}
