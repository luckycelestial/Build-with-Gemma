/**
 * ============================================================================
 * MODULE PURPOSE: Procurement Communication Gateway Orchestrator
 * RESPONSIBILITIES:
 *  - Intercepts incoming WhatsApp messages from suppliers.
 *  - Resolves target supplier (SupplierResolver) and active mission (MissionResolver).
 *  - Extracts quotation metrics (QuotationExtractor) and triggers mission auto-resume.
 * OWNS: Procurement communication routing & mission state machine triggers.
 * SHOULD NOT OWN: Low-level TCP sockets or React DOM rendering.
 * ============================================================================
 */

import { SupplierResolver } from './SupplierResolver';
import { MissionResolver } from './MissionResolver';
import { QuotationExtractor } from './QuotationExtractor';
import { MessageFormatter, OutgoingMessageType } from './MessageFormatter';
import { ProcurementMissionService } from './ProcurementMissionService';

export class ProcurementCommunicationGateway {
  /**
   * Processes an incoming WhatsApp message from a supplier or factory owner.
   */
  static async handleIncomingMessage(senderNameOrPhone: string, messageText: string): Promise<{
    handled: boolean;
    reply: string;
    missionId?: string;
    actionTaken?: string;
  }> {
    // A. Resolve Supplier dynamically from Database
    const supplier = await SupplierResolver.resolveSupplier(senderNameOrPhone);
    const resolvedSupplierName = supplier ? supplier.name : senderNameOrPhone;

    // B. Resolve target Procurement Mission
    const mission = await MissionResolver.resolveMission(messageText, resolvedSupplierName);
    if (!mission) {
      return { handled: false, reply: "No active procurement mission found for message." };
    }

    const textLower = messageText.toLowerCase();

    // C. Check for Quotation reply (Price / Lead Time / Quote terms)
    if (textLower.includes('₹') || textLower.includes('rs') || textLower.includes('quote') || textLower.includes('per unit') || textLower.includes('price')) {
      const extracted = QuotationExtractor.extractQuotation(messageText, resolvedSupplierName);
      
      // Auto-resume Mission!
      const updatedMission = await ProcurementMissionService.receiveSupplierQuotation(mission.id, {
        supplierName: extracted.supplierName,
        quotedPrice: extracted.quotedPrice,
        leadTimeDays: extracted.deliveryTimeDays,
        paymentTerms: extracted.paymentTerms,
        validityDays: extracted.validityDays
      });

      const replyMsg = `[${mission.id}] Received & Logged Supplier Quotation from ${extracted.supplierName}.\n- Price: ₹${extracted.quotedPrice}/unit\n- Lead Time: ${extracted.deliveryTimeDays} days\n- Terms: ${extracted.paymentTerms}\n\nMission Auto-Resumed: Evaluated quote matrix & posted 1-Click Approval Gate for Owner PO Sign-Off.`;
      
      return {
        handled: true,
        reply: replyMsg,
        missionId: mission.id,
        actionTaken: 'Quotation_Extracted_Mission_Resumed'
      };
    }

    // D. Check for PO Acceptance
    if (textLower.includes('accept') || textLower.includes('confirmed po')) {
      await ProcurementMissionService.advanceStage(mission.id, 'Supplier_Acceptance', `Supplier ${resolvedSupplierName} accepted PO.`, 'SupplierWorker');
      return {
        handled: true,
        reply: `[${mission.id}] Logged Purchase Order Acceptance from ${resolvedSupplierName}.`,
        missionId: mission.id,
        actionTaken: 'PO_Accepted'
      };
    }

    // E. Check for Dispatch / Shipment Update
    if (textLower.includes('dispatch') || textLower.includes('shipped') || textLower.includes('tracking')) {
      await ProcurementMissionService.advanceStage(mission.id, 'Dispatch', `Shipment dispatched by ${resolvedSupplierName}.`, 'ShipmentTracker');
      return {
        handled: true,
        reply: `[${mission.id}] Logged Dispatch Checkpoint for Mission ${mission.id}.`,
        missionId: mission.id,
        actionTaken: 'Dispatch_Updated'
      };
    }

    return { handled: false, reply: "Message logged." };
  }

  /**
   * Formats and sends structured outgoing Procurement messages.
   */
  static formatOutgoing(type: OutgoingMessageType, missionId: string, payload: any): string {
    return MessageFormatter.formatOutgoingMessage(type, missionId, payload);
  }
}
