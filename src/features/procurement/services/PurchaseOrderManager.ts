/**
 * ============================================================================
 * MODULE PURPOSE: Single Responsibility Purchase Order Manager Service
 * RESPONSIBILITIES:
 *  - Formats binding corporate Purchase Order (PO) documents.
 *  - Manages owner approval gates before binding PO commitment.
 * OWNS: Purchase Order data structure formatting and approval status tracking.
 * SHOULD NOT OWN: Shipment checkpoint monitoring or supplier reliability scoring.
 * ============================================================================
 */

export interface PurchaseOrderData {
  poNumber: string;
  supplierName: string;
  materialName: string;
  sku: string;
  quantity: number;
  totalCost: number;
  status: 'Draft' | 'Pending_Approval' | 'Approved' | 'Sent';
  createdAt: string;
}

export class PurchaseOrderManager {
  /**
   * Generates a unique PO document structure for a target supplier order.
   */
  static createPurchaseOrder(input: {
    supplierName: string;
    materialName: string;
    sku: string;
    quantity: number;
    unitPrice: number;
  }): PurchaseOrderData {
    const poNumber = `PO-${Date.now().toString().slice(-6)}`;
    return {
      poNumber,
      supplierName: input.supplierName,
      materialName: input.materialName,
      sku: input.sku,
      quantity: input.quantity,
      totalCost: input.quantity * input.unitPrice,
      status: 'Pending_Approval',
      createdAt: new Date().toISOString()
    };
  }
}
