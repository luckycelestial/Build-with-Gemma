import { BaseTool } from './BaseTool';
import { BusinessToolMetadata, ToolExecutionContext } from './types';
import { AIService } from '../ai';
import { BusinessEvent } from '../events/BusinessEventBus';


// --- 1. Generate Collection Outreach Tool ---
export interface GenerateOutreachInput {
  client: string;
  outstandingBalance: number;
  delayedInvoices?: number;
  averageDelay?: number;
  tone?: 'gentle' | 'professional' | 'firm';
  channel?: 'whatsapp' | 'email' | 'phone';
}

export class GenerateCollectionOutreachTool extends BaseTool<GenerateOutreachInput, { content: string; isFallback: boolean }> {
  public readonly metadata: BusinessToolMetadata = {
    id: 'generate_collection_outreach',
    name: 'Generate Collections Outreach Copy',
    description: 'Composes tailored payment reminders and phone call scripts based on customer delay metrics and selected communication tone.',
    category: 'Collections',
    capabilityName: 'CollectionsOutreach',
    ownedByWorker: 'CollectionsWorker',
    supportedOperations: ['CollectionsOperation', 'CustomerSuccessOperation'],
    requiredPermissions: ['collections:write'],
    executionMode: 'Approval_Required',
    estimatedExecutionTimeMs: 1100,
    producesEvents: ['ReminderPrepared'],
    consumesEvents: ['InvoiceOverdue'],
    verificationStrategy: { type: 'None', description: 'Generates outreach copy.' },
    retryPolicy: { maxRetries: 2, backoffMs: 400 },
    approvalPolicy: { required: true, approvalRole: 'CFO', thresholdRule: "tone === 'firm'" },
    tags: ['collections', 'outreach', 'reminder', 'ar']
  };

  protected async executeLogic(input: GenerateOutreachInput, context?: ToolExecutionContext) {
    const currentTone = input.tone || "professional";
    const currentChannel = input.channel || "email";

    const prompt = `
Write a customized collections reminder for the following customer metrics:
- Client Name: ${input.client}
- Total Outstanding Balance: ₹${Number(input.outstandingBalance).toLocaleString("en-IN")}
- Number of Late/Delayed Invoices: ${input.delayedInvoices || 0}
- Average Payment Delay: ${input.averageDelay || 0} days

Communication Criteria:
- Target Channel: ${currentChannel.toUpperCase()}
- Communication Tone: ${currentTone.toUpperCase()}

Instructions:
- If tone is "gentle": Write a friendly check-in reminder.
- If tone is "professional": Write a standard, business-like reminder.
- If tone is "firm": Write a strong payment demand notice.
- If channel is "whatsapp": Keep it under 2-3 short paragraphs.
- If channel is "email": Write a structured email with Subject line.
- If channel is "phone": Write a guided talking-point script.

Return output in plain text.
`;

    try {
      const text = await AIService.generateCompletion(prompt);
      if (text) {
        return { data: { content: text, isFallback: false } };
      }
    } catch (apiErr: any) {
      console.warn("[GenerateCollectionOutreachTool] AI call failed, using fallback copy:", apiErr.message);
    }

    let fallbackText = `Dear ${input.client},\n\nThis is a reminder regarding outstanding invoices totaling ₹${Number(input.outstandingBalance).toLocaleString("en-IN")} (${input.averageDelay || 0} days overdue).\nKindly confirm the bank transfer reference at your earliest convenience.\n\nBest Regards,\nAccounts Receivable Team`;
    return { data: { content: fallbackText, isFallback: true }, warnings: ['Used local collection reminder template.'] };
  }

  protected constructEvents(data: any, input: GenerateOutreachInput, context?: ToolExecutionContext): BusinessEvent[] {
    const timeStr = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
    return [{
      id: `evt-rem-${Date.now()}`,
      type: 'ReminderPrepared',
      timestamp: timeStr,
      source: context?.source === 'WhatsApp' ? 'WhatsApp' : 'Manual Upload',
      summary: `Collection reminder generated for ${input.client} (₹${Number(input.outstandingBalance).toLocaleString("en-IN")})`,
      details: { client: input.client, amount: input.outstandingBalance, channel: input.channel, tone: input.tone },
      deepLink: '/collections-agent'
    }];
  }
}

// --- 2. Log Outreach Tool ---
export interface LogOutreachInput {
  client: string;
  channel: string;
  tone: string;
  content: string;
}

export class LogOutreachTool extends BaseTool<LogOutreachInput, any> {
  public readonly metadata: BusinessToolMetadata = {
    id: 'log_collection_outreach',
    name: 'Log Collection Outreach Record',
    description: 'Persists transmitted outreach communications into the OutreachLog table.',
    category: 'Collections',
    capabilityName: 'CollectionsLogging',
    ownedByWorker: 'CollectionsWorker',
    supportedOperations: ['CollectionsOperation'],
    requiredPermissions: ['collections:write'],
    executionMode: 'Autonomous',
    estimatedExecutionTimeMs: 150,
    producesEvents: ['ReminderPrepared'],
    consumesEvents: [],
    verificationStrategy: { type: 'DatabaseCheck', description: 'Checks record created in OutreachLog table.' },
    retryPolicy: { maxRetries: 2, backoffMs: 300 },
    approvalPolicy: { required: false },
    tags: ['log', 'outreach', 'ar', 'history']
  };

  protected async executeLogic(input: LogOutreachInput, context?: ToolExecutionContext) {
    const newLog = {
      client: input.client,
      channel: input.channel,
      tone: input.tone,
      content: input.content,
      sentAt: new Date()
    };

    try {
      const { prisma } = await import('../prisma-client');
      const saved = await prisma.outreachLog.create({ data: newLog });
      return { data: saved };
    } catch (dbErr: any) {
      console.warn("[LogOutreachTool] Database offline fallback active.");
      return { data: { id: Date.now(), ...newLog, fallback: true } };
    }
  }


  protected constructEvents(data: any, input: LogOutreachInput, context?: ToolExecutionContext): BusinessEvent[] {
    const timeStr = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
    return [{
      id: `evt-log-out-${Date.now()}`,
      type: 'ReminderPrepared',
      timestamp: timeStr,
      source: 'Manual Upload',
      summary: `Collection outreach logged for ${input.client} via ${input.channel}`,
      details: { client: input.client, channel: input.channel, tone: input.tone },
      deepLink: '/collections-agent'
    }];
  }
}

// --- Placeholder Collections Tools ---
export class ScheduleReminderTool extends BaseTool {
  public readonly metadata: BusinessToolMetadata = {
    id: 'schedule_reminder',
    name: 'Schedule Automated Payment Reminder',
    description: 'Schedules automated follow-up reminder for pending client invoices.',
    category: 'Collections',
    capabilityName: 'CollectionsScheduling',
    ownedByWorker: 'CollectionsWorker',
    supportedOperations: ['CollectionsOperation'],
    requiredPermissions: ['collections:write'],
    executionMode: 'Autonomous',
    producesEvents: ['ReminderPrepared'],
    consumesEvents: [],
    verificationStrategy: { type: 'StateComparison', description: 'Verifies cron timer.' },
    retryPolicy: { maxRetries: 1, backoffMs: 200 },
    approvalPolicy: { required: false },
    tags: ['schedule', 'reminder']
  };
  protected async executeLogic(input: any) {
    return { data: { status: 'Scheduled (Contract Placeholder)', input } };
  }
  protected constructEvents() { return []; }
}

export class RecordPaymentTool extends BaseTool {
  public readonly metadata: BusinessToolMetadata = {
    id: 'record_payment',
    name: 'Record Customer Payment Received',
    description: 'Logs customer payment receipt transaction and reduces AR balance.',
    category: 'Collections',
    capabilityName: 'PaymentRecording',
    ownedByWorker: 'CollectionsWorker',
    supportedOperations: ['CollectionsOperation', 'RevenueProtectionOperation'],
    requiredPermissions: ['collections:write'],
    executionMode: 'Autonomous',
    producesEvents: ['CustomerPaymentReceived'],
    consumesEvents: [],
    verificationStrategy: { type: 'DatabaseCheck', description: 'Checks AR balance reduction.' },
    retryPolicy: { maxRetries: 2, backoffMs: 300 },
    approvalPolicy: { required: false },
    tags: ['payment', 'receipt', 'ar']
  };
  protected async executeLogic(input: any) {
    return { data: { status: 'Recorded (Contract Placeholder)', input } };
  }
  protected constructEvents() { return []; }
}

export class EscalateCollectionTool extends BaseTool {
  public readonly metadata: BusinessToolMetadata = {
    id: 'escalate_collection',
    name: 'Escalate High-Risk Account to Legal/Owner',
    description: 'Escalated delinquent client accounts exceeding credit limit thresholds to legal counsel or factory leadership.',
    category: 'Collections',
    capabilityName: 'CollectionsEscalation',
    ownedByWorker: 'CollectionsWorker',
    supportedOperations: ['CollectionsOperation'],
    requiredPermissions: ['collections:write'],
    executionMode: 'Approval_Required',
    producesEvents: [],
    consumesEvents: [],
    verificationStrategy: { type: 'None', description: 'Flags escalation.' },
    retryPolicy: { maxRetries: 1, backoffMs: 200 },
    approvalPolicy: { required: true, approvalRole: 'FactoryOwner' },
    tags: ['escalate', 'credit_hold', 'legal']
  };
  protected async executeLogic(input: any) {
    return { data: { status: 'Escalated (Contract Placeholder)', input } };
  }
  protected constructEvents() { return []; }
}
