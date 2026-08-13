import { OperationId } from '../operations/types';
import { WorkerType } from '../tools/types';
import { WorkflowEngine } from '../workflows/WorkflowEngine';
import { WorkflowInstanceData } from '../workflows/types';
import { SharedBusinessMemoryInstance } from '../memory/SharedBusinessMemory';
import { KnowledgeBaseService } from '../knowledge/KnowledgeBaseService';
import { BusinessEvent } from '../events/BusinessEventBus';

export class ExecutiveCTOAgent {
  /**
   * Evaluates an incoming business event or directive, consults Knowledge Base SOPs,
   * and plans a multi-step Workflow Graph bound to a Business Operation.
   * Executive AI CTO NEVER executes tools directly. It plans & delegates to Worker Agents.
   */
  static async evaluateAndPlanWorkflow(event: BusinessEvent): Promise<WorkflowInstanceData | null> {
    console.log(`🤖 [ExecutiveCTO] Evaluating incoming event '${event.type}': "${event.summary}"`);

    const memory = await SharedBusinessMemoryInstance.getLayeredMemory();

    // 1. Handling Inventory Low Stock / Threshold Events
    if (event.type === ('InventoryThresholdBreached' as any) || event.summary.toLowerCase().includes('low stock')) {
      const sops = KnowledgeBaseService.queryKnowledge('min_threshold');
      console.log(`📚 [ExecutiveCTO] Consulted ${sops.length} SOPs for inventory procurement workflow planning.`);

      return WorkflowEngine.createWorkflow({
        operationId: 'procurement',
        title: 'Low Stock Raw Material Procurement & RFQ Workflow',
        assignedWorker: 'ProcurementWorker',
        goalId: 'g-proc-1',
        businessImpact: 'Prevents CNC machine downtime by securing raw material stock.',
        expectedOutcome: 'RFQ dispatched to supplier; purchase order queued for owner approval.',
        steps: [
          {
            sequence: 1,
            name: 'Generate Supplier RFQ Letter',
            toolId: 'generate_rfq',
            inputParameters: {
              name: event.details?.name || 'Solid Carbide End Mills 12mm',
              sku: event.details?.sku || 'TL-EM-CAR-12',
              quantity: 20,
              supplierName: event.details?.supplierName || 'Jigani Tooling Labs'
            },
            executionMode: 'Autonomous'
          },
          {
            sequence: 2,
            name: 'Create Binding Purchase Order',
            toolId: 'create_purchase_order',
            inputParameters: {
              sku: event.details?.sku || 'TL-EM-CAR-12',
              quantity: 20,
              amount: 29000
            },
            executionMode: 'Approval_Required'
          }
        ],
        contextSnapshot: { triggerEvent: event }
      });
    }

    // 2. Handling Raw Material Price Inflation Events
    if (event.type === 'PriceChangeDetected' || event.type === ('CommodityPriceUpdated' as any)) {
      const sops = KnowledgeBaseService.queryKnowledge('surcharge');
      console.log(`📚 [ExecutiveCTO] Consulted ${sops.length} SOPs for pricing pass-through workflow planning.`);

      return WorkflowEngine.createWorkflow({
        operationId: 'pricing',
        title: 'Raw Material Inflation Price Pass-Through Surcharge Workflow',
        assignedWorker: 'PricingWorker',
        goalId: 'g-prc-1',
        businessImpact: 'Defends gross margin corridor (+16.5%) against raw steel inflation.',
        expectedOutcome: 'Margin surcharge calculated; updated pricing recommendation queued for owner sign-off.',
        steps: [
          {
            sequence: 1,
            name: 'Recalculate Product Gross Margins',
            toolId: 'recalculate_margins',
            inputParameters: { material: 'Steel CRCA Sheet', priceIncreasePct: 4.1 },
            executionMode: 'Autonomous'
          },
          {
            sequence: 2,
            name: 'Apply Steel Surcharge (+3.4%)',
            toolId: 'update_pricing_recommendation',
            inputParameters: { id: 'rec-102', status: 'accept' },
            executionMode: 'Approval_Required'
          }
        ],
        contextSnapshot: { triggerEvent: event }
      });
    }

    // 3. Handling Overdue Accounts Receivable / Collection Events
    if (event.type === 'ReminderPrepared' || event.summary.toLowerCase().includes('overdue')) {
      const sops = KnowledgeBaseService.queryKnowledge('credit_limit');

      return WorkflowEngine.createWorkflow({
        operationId: 'collections',
        title: 'Overdue Accounts Receivable Recovery Workflow',
        assignedWorker: 'CollectionsWorker',
        goalId: 'g-col-1',
        businessImpact: 'Accelerates liquidity recovery of ₹3.8 Lakh overdue balance.',
        expectedOutcome: 'Multi-channel collection reminder drafted & logged.',
        steps: [
          {
            sequence: 1,
            name: 'Generate Tailored Collections Reminder Copy',
            toolId: 'generate_collection_outreach',
            inputParameters: {
              client: event.details?.client || 'ABC Industries',
              outstandingBalance: event.details?.amount || 380000,
              delayedInvoices: 3,
              averageDelay: 38,
              tone: 'professional',
              channel: 'email'
            },
            executionMode: 'Approval_Required'
          },
          {
            sequence: 2,
            name: 'Log Outreach Communication Record',
            toolId: 'log_collection_outreach',
            inputParameters: {
              client: event.details?.client || 'ABC Industries',
              channel: 'email',
              tone: 'professional',
              content: 'Overdue invoice payment reminder dispatched.'
            },
            executionMode: 'Autonomous'
          }
        ],
        contextSnapshot: { triggerEvent: event }
      });
    }

    return null;
  }
}
