import { BaseTool } from './BaseTool';
import { BusinessToolMetadata, ToolExecutionContext } from './types';
import { runPythonAnalysis, runJSFallback, queryGemmaAnalysis } from '../revenue-orchestrator';
import { AIService } from '../ai';
import { BusinessEvent } from '../events/BusinessEventBus';

// --- 1. Run Revenue Forecast Tool ---
export interface RunRevenueForecastInput {
  filePath: string;
  ordersMultiplier?: number;
  steelPriceMultiplier?: number;
  paymentDelayModifier?: number;
  utilizationMultiplier?: number;
}

export class RunRevenueForecastTool extends BaseTool<RunRevenueForecastInput, any> {
  public readonly metadata: BusinessToolMetadata = {
    id: 'run_revenue_forecast',
    name: 'Run XGBoost Revenue Forecast & SHAP Analysis',
    description: 'Executes time-series revenue predictions and SHAP feature explainability via Python ML engine or statistical fallback.',
    category: 'Revenue',
    capabilityName: 'RevenueForecasting',
    ownedByWorker: 'RevenueWorker',
    supportedOperations: ['RevenueProtectionOperation'],
    requiredPermissions: ['revenue:read'],
    executionMode: 'Autonomous',
    estimatedExecutionTimeMs: 2200,
    producesEvents: [],
    consumesEvents: [],
    verificationStrategy: { type: 'StateComparison', description: 'Verifies 8-week forecast prediction values generated.' },
    retryPolicy: { maxRetries: 2, backoffMs: 1000 },
    approvalPolicy: { required: false },
    tags: ['ml', 'forecast', 'xgboost', 'shap', 'revenue']
  };

  protected async executeLogic(input: RunRevenueForecastInput, context?: ToolExecutionContext) {
    let mlData;
    try {
      mlData = await runPythonAnalysis(
        input.filePath,
        input.ordersMultiplier || 1.0,
        input.steelPriceMultiplier || 1.0,
        input.paymentDelayModifier || 0.0,
        input.utilizationMultiplier || 1.0
      );
    } catch (pyErr: any) {
      console.warn("[RunRevenueForecastTool] Python execution failed, using JS fallback:", pyErr.message);
      mlData = runJSFallback(input.filePath);
    }
    return { data: mlData };
  }

  protected constructEvents(): BusinessEvent[] {
    return [];
  }
}

// --- 2. Query Gemma Advisory Tool ---
export interface QueryGemmaAdvisoryInput {
  businessContext: any;
  simulationParams?: any;
  shapWhyAdjusted?: any;
}

export class QueryGemmaAdvisoryTool extends BaseTool<QueryGemmaAdvisoryInput, any> {
  public readonly metadata: BusinessToolMetadata = {
    id: 'query_gemma_advisory',
    name: 'Query Gemma AI Executive Advisory Engine',
    description: 'Synthesizes internal sales context, ML predictions, SHAP factors, and market news into executive actions.',
    category: 'Revenue',
    capabilityName: 'ExecutiveAdvisory',
    ownedByWorker: 'ExecutiveCTO',
    supportedOperations: ['RevenueProtectionOperation', 'ReportingOperation'],
    requiredPermissions: ['revenue:read'],
    executionMode: 'Autonomous',
    estimatedExecutionTimeMs: 3500,
    producesEvents: [],
    consumesEvents: [],
    verificationStrategy: { type: 'None', description: 'Generates JSON structured advisory payload.' },
    retryPolicy: { maxRetries: 2, backoffMs: 1000 },
    approvalPolicy: { required: false },
    tags: ['ai', 'cfo', 'gemma', 'reasoning', 'advisory']
  };

  protected async executeLogic(input: QueryGemmaAdvisoryInput, context?: ToolExecutionContext) {
    const analysis = await queryGemmaAnalysis(
      input.businessContext,
      input.simulationParams || null,
      input.shapWhyAdjusted || null
    );
    return { data: analysis };
  }

  protected constructEvents(): BusinessEvent[] {
    return [];
  }
}

// --- 3. Generate Section Explanation Tool ---
export interface GenerateExplanationInput {
  section: string;
  context: any;
}

export class GenerateSectionExplanationTool extends BaseTool<GenerateExplanationInput, { explanation: string }> {
  public readonly metadata: BusinessToolMetadata = {
    id: 'generate_section_explanation',
    name: 'Generate Plain Business Section Explanation',
    description: 'Translates complex ML charts, SHAP waterfalls, or customer matrices into plain business Markdown.',
    category: 'Revenue',
    capabilityName: 'ExplanationGeneration',
    ownedByWorker: 'RevenueWorker',
    supportedOperations: ['RevenueProtectionOperation', 'ReportingOperation'],
    requiredPermissions: ['revenue:read'],
    executionMode: 'Autonomous',
    estimatedExecutionTimeMs: 1200,
    producesEvents: [],
    consumesEvents: [],
    verificationStrategy: { type: 'None', description: 'Generates plain business Markdown explanation.' },
    retryPolicy: { maxRetries: 1, backoffMs: 500 },
    approvalPolicy: { required: false },
    tags: ['explain', 'markdown', 'narrative']
  };

  protected async executeLogic(input: GenerateExplanationInput, context?: ToolExecutionContext) {
    const prompt = `
You are the Revenue Intelligence AI Analyst.
Provide a clear plain business explanation for section "${input.section}" based on context:
${JSON.stringify(input.context, null, 2)}
`;

    try {
      const text = await AIService.generateCompletion(prompt);
      if (text) return { data: { explanation: text } };
    } catch (e: any) {
      console.warn("[GenerateSectionExplanationTool] AI call failed, using local explanation fallback.");
    }

    const localExplanation = `### Analysis Narrative for ${input.section}\n\nMetrics demonstrate stable operating performance. Operational adjustments are recommended to mitigate supply chain volatility.`;
    return { data: { explanation: localExplanation } };
  }

  protected constructEvents(): BusinessEvent[] {
    return [];
  }
}

// --- Placeholder Revenue Tools ---
export class RefreshForecastTool extends BaseTool {
  public readonly metadata: BusinessToolMetadata = {
    id: 'refresh_forecast',
    name: 'Refresh Revenue Forecast Data',
    description: 'Triggers cache invalidation and re-computes 8-week ML predictions.',
    category: 'Revenue',
    capabilityName: 'RevenueForecasting',
    ownedByWorker: 'RevenueWorker',
    supportedOperations: ['RevenueProtectionOperation'],
    requiredPermissions: ['revenue:read'],
    executionMode: 'Autonomous',
    producesEvents: [],
    consumesEvents: [],
    verificationStrategy: { type: 'None', description: 'Refreshes forecast.' },
    retryPolicy: { maxRetries: 1, backoffMs: 200 },
    approvalPolicy: { required: false },
    tags: ['refresh', 'forecast']
  };
  protected async executeLogic(input: any) {
    return { data: { status: 'Refreshed (Contract Placeholder)', input } };
  }
  protected constructEvents() { return []; }
}

export class AnalyzeRevenueRiskTool extends BaseTool {
  public readonly metadata: BusinessToolMetadata = {
    id: 'analyze_revenue_risk',
    name: 'Analyze Revenue Risk Profile',
    description: 'Calculates business composite risk score based on concentration, payment delays, and commodity inflation.',
    category: 'Revenue',
    capabilityName: 'RiskAnalysis',
    ownedByWorker: 'RevenueWorker',
    supportedOperations: ['RevenueProtectionOperation'],
    requiredPermissions: ['revenue:read'],
    executionMode: 'Autonomous',
    producesEvents: [],
    consumesEvents: [],
    verificationStrategy: { type: 'None', description: 'Calculates composite risk score.' },
    retryPolicy: { maxRetries: 1, backoffMs: 200 },
    approvalPolicy: { required: false },
    tags: ['risk', 'composite', 'revenue']
  };
  protected async executeLogic(input: any) {
    return { data: { status: 'Analyzed (Contract Placeholder)', input } };
  }
  protected constructEvents() { return []; }
}
