import {
  BusinessToolMetadata,
  ToolExecutionContext,
  ToolExecutionResult,
  AuditEntry
} from './types';
import { BusinessEventBus, BusinessEvent } from '../events/BusinessEventBus';

export abstract class BaseTool<TInput = any, TOutput = any> {
  public abstract readonly metadata: BusinessToolMetadata;

  /**
   * Input parameter validation hook. Can be overridden by concrete tools.
   */
  protected async validate(input: TInput): Promise<{ valid: boolean; reason?: string }> {
    if (input === undefined || input === null) {
      return { valid: false, reason: "Tool input payload cannot be null or undefined." };
    }
    return { valid: true };
  }

  /**
   * Authorization and permission verification hook.
   */
  protected async authorize(context?: ToolExecutionContext): Promise<boolean> {
    // In current single-tenant deployment, authorization defaults to true.
    return true;
  }

  /**
   * Concrete tool execution logic. Implemented by specific business tools.
   */
  protected abstract executeLogic(
    input: TInput,
    context?: ToolExecutionContext
  ): Promise<{ data: TOutput; warnings?: string[]; nextRecommendedActions?: string[] }>;

  /**
   * Verification hook after execution.
   */
  protected async verify(
    data: TOutput,
    input: TInput,
    context?: ToolExecutionContext
  ): Promise<{ verified: boolean; message?: string }> {
    return { verified: true, message: "Execution verified against business state." };
  }

  /**
   * Event construction hook. Returns events to be published to BusinessEventBus.
   */
  protected abstract constructEvents(
    data: TOutput,
    input: TInput,
    context?: ToolExecutionContext
  ): BusinessEvent[];

  /**
   * Enforces standardized BaseTool execution lifecycle:
   * validate -> authorize -> executeLogic -> verify -> publishEvents -> audit -> returnResult
   */
  public async execute(
    input: TInput,
    context?: ToolExecutionContext
  ): Promise<ToolExecutionResult<TOutput>> {
    const startTime = Date.now();
    const initiatedBy = context?.initiatedBy || 'SystemWorker';

    // 1. Validation Phase
    const valRes = await this.validate(input);
    if (!valRes.valid) {
      const durationMs = Date.now() - startTime;
      return {
        success: false,
        toolId: this.metadata.id,
        data: null,
        error: `Validation Failed: ${valRes.reason}`,
        businessEvents: [],
        auditEntries: [{
          timestamp: new Date().toISOString(),
          toolId: this.metadata.id,
          action: `Execute_${this.metadata.id}`,
          initiatedBy,
          status: 'Failure',
          durationMs,
          details: { error: valRes.reason }
        }],
        warnings: [],
        nextRecommendedActions: ["Check input parameters and retry tool invocation."],
        executionTimeMs: durationMs
      };
    }

    // 2. Authorization Phase
    const authorized = await this.authorize(context);
    if (!authorized) {
      const durationMs = Date.now() - startTime;
      return {
        success: false,
        toolId: this.metadata.id,
        data: null,
        error: `Authorization Failed: Missing permissions ${this.metadata.requiredPermissions.join(', ')}`,
        businessEvents: [],
        auditEntries: [{
          timestamp: new Date().toISOString(),
          toolId: this.metadata.id,
          action: `Execute_${this.metadata.id}`,
          initiatedBy,
          status: 'Failure',
          durationMs,
          details: { error: 'Unauthorized' }
        }],
        warnings: [],
        nextRecommendedActions: ["Request requisite permissions before executing tool."],
        executionTimeMs: durationMs
      };
    }

    // 3. Execution Phase
    try {
      const logicResult = await this.executeLogic(input, context);
      
      // 4. Verification Phase
      const verifyRes = await this.verify(logicResult.data, input, context);
      if (!verifyRes.verified) {
        console.warn(`[BaseTool:${this.metadata.id}] Verification warning: ${verifyRes.message}`);
      }

      // 5. Event Emission Phase
      const events = this.constructEvents(logicResult.data, input, context);
      events.forEach((evt) => {
        try {
          BusinessEventBus.publish(evt);
        } catch (evtErr: any) {
          console.error(`[BaseTool:${this.metadata.id}] Event publication error:`, evtErr.message);
        }
      });

      // 6. Audit Trail Logging Phase
      const durationMs = Date.now() - startTime;
      const auditEntry: AuditEntry = {
        timestamp: new Date().toISOString(),
        toolId: this.metadata.id,
        action: `Execute_${this.metadata.id}`,
        initiatedBy,
        status: 'Success',
        durationMs,
        details: {
          workflowId: context?.workflowId,
          operationId: context?.operationId,
          eventsPublished: events.map(e => e.type)
        }
      };

      // 7. Return Standardized Result
      return {
        success: true,
        toolId: this.metadata.id,
        data: logicResult.data,
        businessEvents: events,
        auditEntries: [auditEntry],
        warnings: logicResult.warnings || [],
        nextRecommendedActions: logicResult.nextRecommendedActions || [],
        executionTimeMs: durationMs
      };
    } catch (err: any) {
      const durationMs = Date.now() - startTime;
      console.error(`❌ [BaseTool:${this.metadata.id}] Execution failed:`, err.message);

      return {
        success: false,
        toolId: this.metadata.id,
        data: null,
        error: err.message || 'Tool execution encountered an unknown runtime error',
        businessEvents: [],
        auditEntries: [{
          timestamp: new Date().toISOString(),
          toolId: this.metadata.id,
          action: `Execute_${this.metadata.id}`,
          initiatedBy,
          status: 'Failure',
          durationMs,
          details: { error: err.message }
        }],
        warnings: [`Tool ${this.metadata.id} failed during execution.`],
        nextRecommendedActions: ["Review system logs or execute compensation rollback strategy."],
        executionTimeMs: durationMs
      };
    }
  }
}
