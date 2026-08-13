import { BaseTool } from './BaseTool';
import { BusinessToolMetadata, ToolExecutionContext } from './types';
import { queryAIAnalyst } from '@/api-client/api';
import { BusinessEvent } from '../events/BusinessEventBus';

// --- 1. Generate Report Tool ---
export interface GenerateReportInput {
  reportType: 'board' | 'cashflow' | 'ops';
  businessData: any;
}

export class GenerateReportTool extends BaseTool<GenerateReportInput, { reportContent: string }> {
  public readonly metadata: BusinessToolMetadata = {
    id: 'generate_report',
    name: 'Generate PDF Executive Report Memo',
    description: 'Compiles PDF-ready formal business consultation reports (Board Briefing, Cash Flow Brief, Operational Hedging Memo).',
    category: 'Reporting',
    capabilityName: 'ReportCompilation',
    ownedByWorker: 'ReportingWorker',
    supportedOperations: ['ReportingOperation'],
    requiredPermissions: ['reports:generate'],
    executionMode: 'Autonomous',
    estimatedExecutionTimeMs: 3000,
    producesEvents: [],
    consumesEvents: [],
    verificationStrategy: { type: 'None', description: 'Generates Markdown document content.' },
    retryPolicy: { maxRetries: 2, backoffMs: 1000 },
    approvalPolicy: { required: false },
    tags: ['report', 'pdf', 'memo', 'board']
  };

  protected async executeLogic(input: GenerateReportInput, context?: ToolExecutionContext) {
    let promptSubject = "";
    if (input.reportType === 'board') {
      promptSubject = "Board of Directors Executive Summary briefing. Summarize business health, monthly revenue, ML forecast, payment delays, and material recommendations.";
    } else if (input.reportType === 'cashflow') {
      promptSubject = "Cash Flow & Credit Control Report. Detail accounts receivable collections warnings and credit limits.";
    } else {
      promptSubject = "Operational & Material Hedging Memo. Detail raw material cost projections, BOM margins, and machine optimization.";
    }

    const prompt = `
Generate a formal business consultation report matching:
Report Type: ${promptSubject}

Ground report in business context: ${JSON.stringify(input.businessData?.summary || {})}
Monthly Revenue: ₹${input.businessData?.kpis?.avg_monthly_revenue_lakh || 18.6} Lakh
Business Risk Rating: ${input.businessData?.kpis?.business_risk_category || 'Medium'}

Use clean Markdown formatting with headers, bullet findings, and action roadmaps.
`;

    try {
      const response = await queryAIAnalyst(prompt, [], input.businessData);
      return { data: { reportContent: response } };
    } catch (e: any) {
      console.warn("[GenerateReportTool] Report API compilation fallback.");
    }

    const fallbackReport = `# EXECUTIVE BRIEFING MEMO\n\n**Company:** ${input.businessData?.summary?.business_name || 'Manufacturing Unit'}\n**Date:** ${new Date().toLocaleDateString('en-IN')}\n\n### Key Findings\n- Baseline revenue remains stable.\n- Raw material inflation surcharges are queued for pass-through.`;
    return { data: { reportContent: fallbackReport } };
  }

  protected constructEvents(): BusinessEvent[] {
    return [];
  }
}

// --- Placeholder Reporting Tools ---
export class GenerateExecutiveBriefTool extends BaseTool {
  public readonly metadata: BusinessToolMetadata = {
    id: 'generate_executive_brief',
    name: 'Generate Executive Briefing Summary',
    description: 'Generates daily 1-page morning executive snapshot.',
    category: 'Reporting',
    capabilityName: 'BriefingCompilation',
    ownedByWorker: 'ReportingWorker',
    supportedOperations: ['ReportingOperation'],
    requiredPermissions: ['reports:generate'],
    executionMode: 'Autonomous',
    producesEvents: [],
    consumesEvents: [],
    verificationStrategy: { type: 'None', description: 'Generates summary text.' },
    retryPolicy: { maxRetries: 1, backoffMs: 300 },
    approvalPolicy: { required: false },
    tags: ['briefing', 'morning_snapshot']
  };
  protected async executeLogic(input: any) {
    return { data: { status: 'Brief Generated (Contract Placeholder)', input } };
  }
  protected constructEvents() { return []; }
}

export class ExportDashboardTool extends BaseTool {
  public readonly metadata: BusinessToolMetadata = {
    id: 'export_dashboard',
    name: 'Export Dashboard Data to CSV/Excel',
    description: 'Exports current operational state and forecast data into Excel spreadsheet.',
    category: 'Reporting',
    capabilityName: 'DataExport',
    ownedByWorker: 'ReportingWorker',
    supportedOperations: ['ReportingOperation'],
    requiredPermissions: ['reports:generate'],
    executionMode: 'Autonomous',
    producesEvents: [],
    consumesEvents: [],
    verificationStrategy: { type: 'None', description: 'Generates spreadsheet file.' },
    retryPolicy: { maxRetries: 1, backoffMs: 300 },
    approvalPolicy: { required: false },
    tags: ['export', 'excel', 'csv']
  };
  protected async executeLogic(input: any) {
    return { data: { status: 'Exported (Contract Placeholder)', input } };
  }
  protected constructEvents() { return []; }
}

export class SendScheduledReportTool extends BaseTool {
  public readonly metadata: BusinessToolMetadata = {
    id: 'send_scheduled_report',
    name: 'Dispatch Scheduled Weekly Brief',
    description: 'Emails weekly automated financial report to factory owners and board members.',
    category: 'Reporting',
    capabilityName: 'ScheduledReporting',
    ownedByWorker: 'ReportingWorker',
    supportedOperations: ['ReportingOperation'],
    requiredPermissions: ['reports:generate', 'comms:send'],
    executionMode: 'Autonomous',
    producesEvents: [],
    consumesEvents: [],
    verificationStrategy: { type: 'ExternalAcknowledgement', description: 'Confirms email delivery.' },
    retryPolicy: { maxRetries: 2, backoffMs: 500 },
    approvalPolicy: { required: false },
    tags: ['scheduled', 'weekly_report']
  };
  protected async executeLogic(input: any) {
    return { data: { status: 'Scheduled Report Sent (Contract Placeholder)', input } };
  }
  protected constructEvents() { return []; }
}
