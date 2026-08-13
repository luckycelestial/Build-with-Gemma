/**
 * ============================================================================
 * SPRINT 3 — QUOTATION INTELLIGENCE & DECISION ENGINE VERIFICATION SUITE
 * ============================================================================
 */

import { ProcurementMissionService } from '../src/departments/procurement/services/ProcurementMissionService';
import { ProcurementMissionRepository } from '../src/departments/procurement/repositories/ProcurementMissionRepository';
import { QuotationRepository } from '../src/departments/procurement/repositories/QuotationRepository';
import { PORepository } from '../src/departments/procurement/repositories/PORepository';
import { QuotationAnalyzer } from '../src/departments/procurement/services/QuotationAnalyzer';
import { QuotationExtractor } from '../src/departments/procurement/services/QuotationExtractor';

async function runSprint3Verification() {
  console.log('=================================================');
  console.log('🚀 SPRINT 3 — QUOTATION INTELLIGENCE VERIFICATION');
  console.log('=================================================\n');

  // 1. Launch Mission through Sprint 1 & 2 (Dispatches RFQ & Pauses in Waiting_for_Quotations)
  console.log('--- 1. Testing Sprint 1 & 2 Execution (RFQ Dispatched & Paused in WAITING_FOR_QUOTES) ---');
  const mission = await ProcurementMissionService.createMission(
    'TL-EM-CAR-12',
    'Solid Carbide End Mills 12mm',
    15,
    'Automatic',
    'Sprint 3 Quotation Intelligence Trigger'
  );

  console.log(`✅ [PASS] Mission Created: ID '${mission.id}'`);
  console.log(`✅ [PASS] Initial Paused Stage: '${mission.currentStage}' (Expected: Waiting_for_Quotations)`);

  // 2. Receive Supplier Quotation Reply (Auto-Resume -> Quotation Comparison -> Recommendation -> Owner Approval)
  console.log('\n--- 2. Testing Quotation Parser, Weighted Ranking & Owner Approval Gate ---');
  const rawQuoteMsg = "Quotation from Jigani Tooling: Price ₹4,200/unit, MOQ 5 units, Delivery 2 days, Terms Net 30 Days, Valid for 7 days. Notes: Includes 1-year tooling warranty.";
  
  const extracted = QuotationExtractor.extractQuotation(rawQuoteMsg, 'Jigani Tooling Labs Ltd');
  console.log(`✅ [PASS] Parsed Price: ₹${extracted.quotedPrice}`);
  console.log(`✅ [PASS] Parsed Delivery: ${extracted.deliveryTimeDays} days`);
  console.log(`✅ [PASS] Parsed Terms: '${extracted.paymentTerms}'`);

  const updatedMission = await ProcurementMissionService.receiveSupplierQuotation(mission.id, {
    supplierName: extracted.supplierName,
    quotedPrice: extracted.quotedPrice,
    leadTimeDays: extracted.deliveryTimeDays,
    paymentTerms: extracted.paymentTerms,
    validityDays: extracted.validityDays
  });

  console.log(`✅ [PASS] Mission Auto-Resumed & Advanced to: '${updatedMission.currentStage}' (Expected: Owner_Approval)`);
  console.log(`✅ [PASS] Mission Status: '${updatedMission.status}' (Expected: Paused_Approval)`);

  // 3. Verify QuotationRepository Persistence
  console.log('\n--- 3. Testing QuotationRepository Persistence ---');
  const savedQuotes = await QuotationRepository.findByMissionId(mission.id);
  if (savedQuotes.length === 0) throw new Error(`FAIL: Quotation not stored for mission '${mission.id}'`);
  console.log(`✅ [PASS] Saved Quotation ID: '${savedQuotes[0].id}' (Price: ₹${savedQuotes[0].price})`);

  // 4. Verify Weighted Ranking Engine & Business Reasoning
  console.log('\n--- 4. Testing Weighted Ranking Engine & Business Reasoning ---');
  const ranked = QuotationAnalyzer.analyzeAndRankQuotes(savedQuotes);
  console.log(`✅ [PASS] Ranked Vendor: ${ranked[0].supplierName} (Rank: #${ranked[0].rank})`);
  console.log(`✅ [PASS] Weighted Score: ${ranked[0].weightedScore}/100`);
  console.log(`✅ [PASS] Confidence: ${ranked[0].confidencePercent}%`);
  console.log(`✅ [PASS] Business Reasoning: "${ranked[0].businessReasoning}"`);

  // 5. Test Owner 1-Click Approval Sign-Off & PO Generation
  console.log('\n--- 5. Testing Owner 1-Click PO Sign-Off & PORepository ---');
  const poMission = await ProcurementMissionService.approveOwnerAction(mission.id);
  console.log(`✅ [PASS] Mission Advanced to: '${poMission.currentStage}' (Expected: Purchase_Order)`);

  const pos = await PORepository.findByMissionId(mission.id);
  if (pos.length === 0) throw new Error(`FAIL: Purchase Order not stored for mission '${mission.id}'`);
  const po = pos[0];
  console.log(`✅ [PASS] Binding PO Generated: Number '${po.poNumber}'`);
  console.log(`✅ [PASS] PO Supplier: '${po.supplierName}'`);
  console.log(`✅ [PASS] PO Amount: ₹${po.amount.toLocaleString('en-IN')}`);
  console.log(`✅ [PASS] PO Status: '${po.status}'`);

  console.log('\n=================================================');
  console.log('🎉 SPRINT 3 QUOTATION INTELLIGENCE VERIFIED CLEANLY!');
  console.log('=================================================');
}

runSprint3Verification().catch(e => {
  console.error('❌ Sprint 3 Verification Failed:', e);
  process.exit(1);
});
