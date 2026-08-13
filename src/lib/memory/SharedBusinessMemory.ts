import { OperationService } from '../operations/OperationService';
import { WorkflowService } from '../workflows/WorkflowService';
import { KnowledgeBaseService } from '../knowledge/KnowledgeBaseService';
import { BusinessContextService } from '../domain/BusinessContextService';

export interface LayeredBusinessMemory {
  globalProfile: {
    companyName: string;
    industry: string;
    location: string;
    machinesCount: number;
    employeesCount: number;
  };
  activeGoals: Array<{ name: string; target: string; status: string }>;
  operationsState: any[];
  runningWorkflows: any[];
  currentTasks: any[];
  knowledgeSOPs: any[];
  recentConversationMemory: any[];
  lastUpdated: string;
}

class SharedBusinessMemoryClass {
  public async getLayeredMemory(): Promise<LayeredBusinessMemory> {
    const opsOverview = await OperationService.getOperationsOverview();
    const runningWorkflows = WorkflowService.getRunningWorkflows();
    const knowledgeItems = KnowledgeBaseService.getAllKnowledgeItems();
    const baseContext = BusinessContextService.getContext();

    return {
      globalProfile: {
        companyName: baseContext.businessName || "Meenakshi Precision Components",
        industry: baseContext.industry || "CNC Precision Machining",
        location: baseContext.location || "Peenya, Bengaluru",
        machinesCount: 8,
        employeesCount: 18
      },
      activeGoals: [
        { name: "Maintain Gross Margin Corridor", target: ">= 16.5%", status: "OnTrack" },
        { name: "Zero Raw Material Stockout", target: "0 Days Downtime", status: "OnTrack" },
        { name: "Reduce AR Collection Lag", target: "< 15 Days", status: "OnTrack" }
      ],
      operationsState: opsOverview,
      runningWorkflows,
      currentTasks: [],
      knowledgeSOPs: knowledgeItems,
      recentConversationMemory: [],
      lastUpdated: new Date().toISOString()
    };
  }
}

export const SharedBusinessMemoryInstance = new SharedBusinessMemoryClass();
