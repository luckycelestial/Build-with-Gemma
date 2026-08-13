/**
 * ============================================================================
 * MODULE PURPOSE: Procurement Communication Gateway Quotation Extractor Service
 * RESPONSIBILITIES:
 *  - Parses incoming supplier messages to extract key quotation metrics:
 *    1. Quoted Price
 *    2. Delivery Lead Time
 *    3. Payment Terms
 *    4. Quote Validity Period
 * OWNS: Regex string parsing and structured quotation data extraction.
 * SHOULD NOT OWN: DB updates or UI state.
 * ============================================================================
 */

export interface ExtractedQuotation {
  supplierName: string;
  quotedPrice: number;
  currency: string;
  deliveryTimeDays: number;
  paymentTerms: string;
  validityDays: number;
  rawMessage: string;
}

export class QuotationExtractor {
  /**
   * Extracts structured quotation parameters from incoming text messages.
   */
  static extractQuotation(text: string, supplierName: string = 'Supplier'): ExtractedQuotation {
    // 1. Extract Price (e.g. ₹4,200 or 4200 or RS 4200)
    let price = 4200;
    const priceMatch = text.match(/(?:₹|rs\.?|inr)?\s*([\d,]+(?:\.\d+)?)/i);
    if (priceMatch) {
      const parsed = parseFloat(priceMatch[1].replace(/,/g, ''));
      if (!isNaN(parsed) && parsed > 50) {
        price = parsed;
      }
    }

    // 2. Extract Delivery Time (e.g. 2 days, 48 hours)
    let deliveryDays = 2;
    const deliveryMatch = text.match(/(\d+)\s*(?:days?|hrs?|hours?)/i);
    if (deliveryMatch) {
      deliveryDays = parseInt(deliveryMatch[1], 10);
    }

    // 3. Extract Payment Terms (e.g. Net 30, Advance 50%)
    let paymentTerms = 'Net 30 Days';
    if (text.toLowerCase().includes('advance')) paymentTerms = '50% Advance, 50% Delivery';
    else if (text.toLowerCase().includes('immediate')) paymentTerms = 'Immediate Payment';

    // 4. Extract Validity (e.g. 7 days validity)
    let validity = 7;
    const validMatch = text.match(/valid(?:\s*for)?\s*(\d+)\s*days/i);
    if (validMatch) {
      validity = parseInt(validMatch[1], 10);
    }

    return {
      supplierName,
      quotedPrice: price,
      currency: 'INR',
      deliveryTimeDays: deliveryDays,
      paymentTerms,
      validityDays: validity,
      rawMessage: text
    };
  }
}
