import { BaseTool } from './BaseTool';
import {
  BusinessToolMetadata,
  ToolCategory,
  WorkerType,
  OperationType,
  ToolExecutionContext,
  ToolExecutionResult,
  AuditEntry
} from './types';

class CapabilityRegistry {
  private tools: Map<string, BaseTool> = new Map();
  private auditLog: AuditEntry[] = [];

  /**
   * Registers a BusinessTool instance in the catalog.
   */
  public registerTool(tool: BaseTool): void {
    const id = tool.metadata.id;
    if (this.tools.has(id)) {
      console.warn(`[CapabilityRegistry] Overwriting existing tool registration for '${id}'`);
    }
    this.tools.set(id, tool);
  }

  /**
   * Retrieves a tool instance by ID.
   */
  public getTool(id: string): BaseTool | undefined {
    return this.tools.get(id);
  }

  /**
   * Returns metadata for all registered tools in the catalog.
   */
  public getCatalog(): BusinessToolMetadata[] {
    return Array.from(this.tools.values()).map(t => t.metadata);
  }

  /**
   * Query tools by Category.
   */
  public getToolsByCategory(category: ToolCategory): BusinessToolMetadata[] {
    return this.getCatalog().filter(t => t.category === category);
  }

  /**
   * Query tools by Owner Worker.
   */
  public getToolsByWorker(worker: WorkerType): BusinessToolMetadata[] {
    return this.getCatalog().filter(t => t.ownedByWorker === worker);
  }

  /**
   * Query tools by Operation type.
   */
  public getToolsByOperation(operation: OperationType): BusinessToolMetadata[] {
    return this.getCatalog().filter(t => t.supportedOperations.includes(operation));
  }

  /**
   * Query tools by Capability name.
   */
  public getToolsByCapability(capabilityName: string): BusinessToolMetadata[] {
    return this.getCatalog().filter(
      t => t.capabilityName.toLowerCase() === capabilityName.toLowerCase()
    );
  }

  /**
   * Search tool catalog based on free-text query (tags, name, description).
   */
  public searchCatalog(query: string): BusinessToolMetadata[] {
    const q = query.toLowerCase();
    return this.getCatalog().filter(
      t =>
        t.id.toLowerCase().includes(q) ||
        t.name.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q) ||
        t.tags.some(tag => tag.toLowerCase().includes(q))
    );
  }

  /**
   * Executes a tool by ID with context tracking and audit trail logging.
   */
  public async executeTool<TInput = any, TOutput = any>(
    toolId: string,
    input: TInput,
    context?: ToolExecutionContext
  ): Promise<ToolExecutionResult<TOutput>> {
    const tool = this.getTool(toolId);
    if (!tool) {
      const durationMs = 0;
      const errorMsg = `Business Tool '${toolId}' is not registered in the Capability Registry.`;
      console.error(`[CapabilityRegistry] ${errorMsg}`);

      return {
        success: false,
        toolId,
        data: null,
        error: errorMsg,
        businessEvents: [],
        auditEntries: [{
          timestamp: new Date().toISOString(),
          toolId,
          action: `Execute_${toolId}`,
          initiatedBy: context?.initiatedBy || 'SystemWorker',
          status: 'Failure',
          durationMs,
          details: { error: 'ToolNotRegistered' }
        }],
        warnings: [`Attempted invocation of un-registered tool '${toolId}'.`],
        nextRecommendedActions: ["Verify tool registration in index.ts."],
        executionTimeMs: durationMs
      };
    }

    const result = await tool.execute(input, context);
    if (result.auditEntries) {
      this.auditLog.push(...result.auditEntries);
      if (this.auditLog.length > 500) {
        this.auditLog = this.auditLog.slice(-500); // Keep last 500 audit entries
      }
    }
    return result;
  }

  /**
   * Retrieves overall execution audit log entries.
   */
  public getAuditLog(): AuditEntry[] {
    return [...this.auditLog];
  }
}

export const CapabilityRegistryInstance = new CapabilityRegistry();
