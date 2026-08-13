/**
 * ============================================================================
 * MODULE PURPOSE: Procurement Domain Supplier Types
 * RESPONSIBILITIES:
 *  - Defines vendor metadata, material quotes, and reliability rating models.
 * OWNS: SupplierData, VendorQuote, and SupplierRating interfaces.
 * SHOULD NOT OWN: Network HTTP requests or UI rendering.
 * ============================================================================
 */

export interface SupplierData {
  id: number;
  name: string;
  materials: string[];
  avgLeadTime: string;
  estimatedQuote: string;
  reliabilityRating: number;
  contactChannel: string;
  whatsappJid?: string;
  sourceUrl?: string;
}

export interface VendorQuoteComparison {
  supplierId: number;
  supplierName: string;
  materialName: string;
  quotedPrice: number;
  unit: string;
  leadTimeDays: number;
  reliabilityRating: number;
  recommended: boolean;
}
