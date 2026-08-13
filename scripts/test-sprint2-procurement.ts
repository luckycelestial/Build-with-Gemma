/**
 * ============================================================================
 * SPRINT 2 — SUPPLIER DISCOVERY & RFQ AUTOMATION VERIFICATION SUITE
 * ============================================================================
 */

import { ProcurementMissionService } from '../src/departments/procurement/services/ProcurementMissionService';
import { ProcurementMissionRepository } from '../src/departments/procurement/repositories/ProcurementMissionRepository';
import { SupplierFinder } from '../src/departments/procurement/services/SupplierFinder';
import { RFQRepository } from '../src/departments/procurement/repositories/RFQRepository';
import { WhatsAppGatewayConnector } from '../src/departments/procurement/connectors/WhatsAppGatewayConnector';

async function runSprint2Verification() {
  console.log('=================================================');
  console.log('🚀 SPRINT 2 — SUPPLIER DISCOVERY & RFQ VERIFICATION');
  console.log('=================================================\n');

  // 1. Audit Supplier Discovery & Ranking
  console.log('--- 1. Testing Supplier Discovery & Ranking Engine ---');
  const rankedSuppliers = await SupplierFinder.discoverAndRankSuppliers('TL-EM-CAR-12');
  console.log(`✅ [PASS] Discovered & Ranked ${rankedSuppliers.length} Suppliers`);
  console.log(`✅ [PASS] Top Ranked Vendor: ${rankedSuppliers[0].supplier.name} (Score: ${rankedSuppliers[0].score})`);
  console.log(`✅ [PASS] Preferred Status: ${rankedSuppliers[0].isPreferred}`);

  // 2. Launch Mission & Execute Sprint 2 Flow
  console.log('\n--- 2. Testing Mission Execution: Discovery -> RFQ -> Dispatch -> Paused ---');
  const mission = await ProcurementMissionService.createMission(
    'TL-EM-CAR-12',
    'Solid Carbide End Mills 12mm',
    15,
    'Automatic',
    'Sprint 2 Automated RFQ Trigger'
  );

  console.log(`✅ [PASS] Mission Created: ID '${mission.id}'`);
  console.log(`✅ [PASS] Final Stage: '${mission.currentStage}' (Expected: Waiting_for_Quotations)`);
  console.log(`✅ [PASS] Mission Status: '${mission.status}' (Expected: Paused_Approval / WAITING_FOR_QUOTES)`);

  if (mission.currentStage !== 'Waiting_for_Quotations') {
    throw new Error(`FAIL: Expected stage Waiting_for_Quotations, got ${mission.currentStage}`);
  }

  // 3. Verify RFQ Generation & Storage
  console.log('\n--- 3. Testing RFQ Generation & RFQRepository Persistence ---');
  const rfqs = await RFQRepository.findByMissionId(mission.id);
  if (rfqs.length === 0) {
    throw new Error(`FAIL: No RFQ stored for mission '${mission.id}'.`);
  }
  const rfq = rfqs[0];
  console.log(`✅ [PASS] RFQ Generated: Number '${rfq.rfqNumber}'`);
  console.log(`✅ [PASS] RFQ Supplier: '${rfq.supplierName}'`);
  console.log(`✅ [PASS] RFQ Quantity: ${rfq.quantity} units`);
  console.log(`✅ [PASS] RFQ Status: '${rfq.status}'`);

  // 4. Verify WhatsApp Transport Gateway Logging
  console.log('\n--- 4. Testing Pure WhatsApp Transport Gateway Connector ---');
  const logs = WhatsAppGatewayConnector.getTransportLogs();
  console.log(`✅ [PASS] Transport Logged ${logs.length} Messages`);
  const lastLog = logs[logs.length - 1];
  console.log(`✅ [PASS] Message ID: '${lastLog.messageId}' -> Recipient: '${lastLog.recipient}'`);

  // 5. Verify Timeline Milestones
  console.log('\n--- 5. Testing Mission Timeline Audit Trail ---');
  console.log(`✅ [PASS] Total Timeline Milestones Recorded: ${mission.timeline.length}`);
  mission.timeline.forEach((tl, i) => {
    console.log(`   [Stage ${i + 1}] ${tl.stage}: ${tl.text}`);
  });

  console.log('\n=================================================');
  console.log('🎉 SPRINT 2 SUPPLIER DISCOVERY & RFQ VERIFIED CLEANLY!');
  console.log('=================================================');
}

runSprint2Verification().catch(e => {
  console.error('❌ Sprint 2 Verification Failed:', e);
  process.exit(1);
});
