/**
 * ============================================================================
 * MODULE PURPOSE: Procurement Domain Quotation Entity & Types
 * RESPONSIBILITIES:
 *  - Defines structured QuotationEntity data model for parsed supplier responses.
 * OWNS: QuotationEntity and QuotationComparisonResult interfaces.
 * SHOULD NOT OWN: DB CRUD or WhatsApp transport logic.
 * ============================================================================
 */

export interface QuotationEntity {
  id: string;               // e.g. "quote-88201"
  rfqNumber: string;        // e.g. "RFQ-88102"
  missionId: string;        // e.g. "mission-proc-101"
  supplierName: string;     // e.g. "Jigani Tooling Labs Ltd"
  price: number;            // e.g. 4200
  currency: string;         // e.g. "INR"
  moq: number;              // e.g. 5
  deliveryDays: number;     // e.g. 2
  paymentTerms: string;     // e.g. "Net 30 Days"
  validityDays: number;     // e.g. 7
  notes: string;            // e.g. "Includes 1-year tooling warranty"
  createdAt: string;
}

export interface QuotationComparisonResult {
  supplierName: string;
  price: number;
  deliveryDays: number;
  reliabilityScore: number;
  qualityScore: number;
  pastExperienceOrders: number;
  weightedScore: number;     // 0 to 100
  rank: number;              // 1, 2, 3
  isRecommended: boolean;
  businessReasoning: string;
  confidencePercent: number; // 0 to 100
}
