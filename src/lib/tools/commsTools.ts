import { BaseTool } from './BaseTool';
import { BusinessToolMetadata, ToolExecutionContext } from './types';
import { BusinessEvent } from '../events/BusinessEventBus';

// --- 1. Send WhatsApp Message Tool ---
export interface SendWhatsAppMessageInput {
  recipient: string; // Phone number or JID
  message: string;
}

export class SendWhatsAppMessageTool extends BaseTool<SendWhatsAppMessageInput, { sent: boolean; channel: string }> {
  public readonly metadata: BusinessToolMetadata = {
    id: 'send_whatsapp_message',
    name: 'Send Outbound WhatsApp Message',
    description: 'Dispatches an outbound text message or notification via Neonize WhatsApp daemon client.',
    category: 'Communication',
    capabilityName: 'OutboundMessaging',
    ownedByWorker: 'ReportingWorker',
    supportedOperations: ['ReportingOperation', 'CollectionsOperation', 'SupplierOperation'],
    requiredPermissions: ['comms:send'],
    executionMode: 'Autonomous',
    estimatedExecutionTimeMs: 400,
    producesEvents: [],
    consumesEvents: [],
    verificationStrategy: { type: 'ExternalAcknowledgement', description: 'Confirms receipt by WhatsApp client.' },
    retryPolicy: { maxRetries: 2, backoffMs: 500 },
    approvalPolicy: { required: false },
    tags: ['whatsapp', 'message', 'comms', 'outbound']
  };

  protected async executeLogic(input: SendWhatsAppMessageInput, context?: ToolExecutionContext) {
    console.log(`📱 [SendWhatsAppMessageTool] Transmitting to ${input.recipient}: "${input.message.slice(0, 60)}..."`);
    return { data: { sent: true, channel: 'WhatsApp' } };
  }

  protected constructEvents(): BusinessEvent[] {
    return [];
  }
}

// --- Placeholder Communication Tools ---
export class SendEmailTool extends BaseTool {
  public readonly metadata: BusinessToolMetadata = {
    id: 'send_email',
    name: 'Send Outbound Email Notice',
    description: 'Dispatches formal email notification or PDF attachment via SMTP / SendGrid gateway.',
    category: 'Communication',
    capabilityName: 'EmailMessaging',
    ownedByWorker: 'ReportingWorker',
    supportedOperations: ['ReportingOperation', 'CollectionsOperation', 'SupplierOperation'],
    requiredPermissions: ['comms:send'],
    executionMode: 'Autonomous',
    producesEvents: [],
    consumesEvents: [],
    verificationStrategy: { type: 'ExternalAcknowledgement', description: 'Confirms SMTP transmission.' },
    retryPolicy: { maxRetries: 2, backoffMs: 500 },
    approvalPolicy: { required: false },
    tags: ['email', 'smtp', 'comms']
  };
  protected async executeLogic(input: any) {
    return { data: { status: 'Email Sent (Contract Placeholder)', input } };
  }
  protected constructEvents() { return []; }
}

export class SendNotificationTool extends BaseTool {
  public readonly metadata: BusinessToolMetadata = {
    id: 'send_notification',
    name: 'Send Push / Web Notification',
    description: 'Pushes real-time toast / browser notification to factory owner dashboard.',
    category: 'Communication',
    capabilityName: 'WebNotification',
    ownedByWorker: 'ReportingWorker',
    supportedOperations: ['ReportingOperation'],
    requiredPermissions: ['comms:send'],
    executionMode: 'Autonomous',
    producesEvents: [],
    consumesEvents: [],
    verificationStrategy: { type: 'None', description: 'Pushes UI toast.' },
    retryPolicy: { maxRetries: 1, backoffMs: 200 },
    approvalPolicy: { required: false },
    tags: ['notification', 'push', 'ui']
  };
  protected async executeLogic(input: any) {
    return { data: { status: 'Pushed (Contract Placeholder)', input } };
  }
  protected constructEvents() { return []; }
}

export class CreateApprovalRequestTool extends BaseTool {
  public readonly metadata: BusinessToolMetadata = {
    id: 'create_approval_request',
    name: 'Create Human Approval Sign-off Request',
    description: 'Posts an approval card to the Executive Advisor board or sends interactive WhatsApp sign-off buttons.',
    category: 'Communication',
    capabilityName: 'HumanApprovalGovernance',
    ownedByWorker: 'ExecutiveCTO',
    supportedOperations: ['WorkflowGovernanceOperation'],
    requiredPermissions: ['workflow:manage', 'comms:send'],
    executionMode: 'Autonomous',
    producesEvents: [],
    consumesEvents: [],
    verificationStrategy: { type: 'StateComparison', description: 'Tracks sign-off response state.' },
    retryPolicy: { maxRetries: 1, backoffMs: 200 },
    approvalPolicy: { required: false },
    tags: ['approval', 'human_in_the_loop', 'signoff']
  };
  protected async executeLogic(input: any) {
    return { data: { status: 'Approval Requested (Contract Placeholder)', input } };
  }
  protected constructEvents() { return []; }
}
