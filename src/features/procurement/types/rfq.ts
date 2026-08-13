/**
 * ============================================================================
 * MODULE PURPOSE: Procurement Domain RFQ Entity & Types
 * RESPONSIBILITIES:
 *  - Defines the structured Request for Quotation (RFQ) data model.
 * OWNS: RFQEntity and RFQCreationInput interfaces.
 * SHOULD NOT OWN: DB CRUD or WhatsApp transport logic.
 * ============================================================================
 */

export interface RFQEntity {
  rfqNumber: string;         // e.g. "RFQ-88102"
  missionId: string;         // e.g. "mission-proc-101"
  sku: string;               // e.g. "TL-EM-CAR-12"
  materialName: string;      // e.g. "Solid Carbide End Mills 12mm"
  quantity: number;          // e.g. 15
  deliveryDate: string;      // e.g. "2026-07-29"
  terms: string;             // e.g. "Net 30 Days, Delivery to Peenya Factory"
  supplierName: string;      // e.g. "Jigani Tooling Labs Ltd"
  supplierContact: string;   // e.g. "+919880011223"
  status: 'Draft' | 'Sent' | 'Replied';
  createdAt: string;
}

export interface RFQCreationInput {
  missionId: string;
  sku: string;
  materialName: string;
  quantity: number;
  deliveryDate?: string;
  terms?: string;
  supplierName: string;
  supplierContact?: string;
}
