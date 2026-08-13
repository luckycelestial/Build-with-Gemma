/**
 * ============================================================================
 * MODULE PURPOSE: Pure WhatsApp Gateway Transport Connector
 * RESPONSIBILITIES:
 *  - Exposes pure WhatsApp transport methods connected to CommunicationService:
 *    1. sendMessage()
 *    2. sendDocument()
 *    3. receiveMessage()
 * OWNS: Transport wrapper for WhatsApp message transmission.
 * SHOULD NOT OWN: Business logic, SOP rules, or state machine transitions.
 * ============================================================================
 */

import { CommunicationService } from '@/lib/domain/CommunicationService';

export interface TransportMessageResult {
  success: boolean;
  messageId: string;
  recipient: string;
  timestamp: string;
}

export class WhatsAppGatewayConnector {
  private static messageLog: Array<{ messageId: string; type: string; recipient: string; content: string; timestamp: string }> = [];

  /**
   * Pure transport method to send a text message via WhatsApp & CommunicationService.
   */
  static async sendMessage(to: string, message: string, missionId?: string): Promise<TransportMessageResult> {
    const timestamp = new Date().toISOString();

    // Extract missionId from message tag if present e.g. [mission-proc-123456]
    const tagMatch = message.match(/\[(mission-proc-\d+)\]/i);
    const activeWorkflowId = missionId || (tagMatch ? tagMatch[1] : 'PROC-EVENT');

    // 1. Dispatch real message through CommunicationService -> Python Gateway
    const sendResult = await CommunicationService.send('whatsapp', activeWorkflowId, to, message);
    const messageId = sendResult.messageId || `wa-msg-${Date.now().toString().slice(-6)}`;

    this.messageLog.push({
      messageId,
      type: 'Text',
      recipient: to,
      content: message,
      timestamp
    });

    console.log(`📡 [WhatsAppGatewayConnector] Transport sendMessage() -> To: ${to} (ID: ${messageId})`);
    return { success: true, messageId, recipient: to, timestamp };
  }

  static async sendDocument(to: string, documentUrl: string, fileName: string): Promise<TransportMessageResult> {
    return this.sendMessage(to, `Document Attachment: ${fileName} (${documentUrl})`);
  }

  static async receiveMessage(from: string, content: string): Promise<void> {
    await CommunicationService.receive(from, content);
  }

  static getMessageLog() {
    return [...this.messageLog];
  }
}
