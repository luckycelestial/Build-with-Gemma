/**
 * ============================================================================
 * MODULE PURPOSE: Procurement Communication Gateway Message Formatter Service
 * RESPONSIBILITIES:
 *  - Formats outgoing procurement messages tagged with explicit missionId:
 *    1. RFQ (Request for Quotation)
 *    2. Purchase Order (Dynamic Quantity × Unit Price)
 *    3. Approval Request
 *    4. Reminder
 *    5. Shipment Request
 * OWNS: Outgoing procurement message formatting logic.
 * SHOULD NOT OWN: WhatsApp network transport.
 * ============================================================================
 */

export type OutgoingMessageType =
  | 'RFQ'
  | 'PO'
  | 'Purchase_Order'
  | 'Approval_Request'
  | 'Reminder'
  | 'Shipment_Request';

export class MessageFormatter {
  static formatOutgoingMessage(
    type: OutgoingMessageType,
    missionId: string,
    payload: {
      supplierName: string;
      itemName?: string;
      sku?: string;
      quantity?: number;
      unitPrice?: number;
      deliveryDays?: number;
      poNumber?: string;
      totalCost?: number;
    }
  ): string {
    const item = payload.itemName || 'Stainless Steel';
    const qty = payload.quantity || 15;
    const poNum = payload.poNumber || `PO-${missionId.slice(-6)}`;
    const unitPrice = payload.unitPrice || 95;
    const totalCost = payload.totalCost || (qty * unitPrice);
    const deliveryDays = payload.deliveryDays || 2;

    switch (type) {
      case 'RFQ':
        return `Hello ${payload.supplierName},\n\nThis is Procurement AI.\n\nMaterial:\n${item}\n\nRequired Quantity:\n${qty}kg\n\nPlease reply with:\n• Price per kg\n• Delivery Time\n• MOQ\n\nThank you.`;

      case 'PO':
      case 'Purchase_Order':
        return `OFFICIAL PURCHASE ORDER\n\nMission:\n${missionId}\n\nSupplier:\n${payload.supplierName}\n\nMaterial:\n${item}\n\nQuantity:\n${qty}kg\n\nUnit Price:\n₹${unitPrice}/kg\n\nTotal Amount:\n₹${totalCost.toLocaleString('en-IN')}\n\nExpected Delivery:\n${deliveryDays} Days\n\nPlease reply "Confirmed" to accept this Purchase Order and unlock shipment transit tracking.`;

      case 'Approval_Request':
        return `[${missionId}] OWNER APPROVAL GATE REQUIRED\nAttention Factory Owner,\n\nProcurement Mission '${missionId}' requires PO approval for ${payload.supplierName}.\nTotal Commitment: ₹${totalCost.toLocaleString('en-IN')}.\n\nReply 'APPROVE ${missionId}' or click Approval on Action Center.`;

      case 'Reminder':
        return `[${missionId}] QUOTATION REMINDER\nDear ${payload.supplierName},\n\nFriendly reminder regarding our RFQ for ${item} (${qty}kg). Please share your quotation at your earliest convenience.`;

      case 'Shipment_Request':
        return `[${missionId}] SHIPMENT TRANSIT UPDATE QUERY\nDear ${payload.supplierName},\n\nPlease provide current logistics transit status and tracking details for PO ${poNum}.`;

      default:
        return `[${missionId}] Message regarding ${item}`;
    }
  }
}
