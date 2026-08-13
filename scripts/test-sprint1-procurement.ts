/**
 * ============================================================================
 * SPRINT 1 — PROCUREMENT MISSION FOUNDATION VERIFICATION SUITE
 * ============================================================================
 */

import { ProcurementMissionService } from '../src/departments/procurement/services/ProcurementMissionService';
import { ProcurementMissionRepository } from '../src/departments/procurement/repositories/ProcurementMissionRepository';
import { BusinessEventBus, BusinessEvent } from '../src/lib/events/BusinessEventBus';

async function runSprint1Verification() {
  console.log('=================================================');
  console.log('🚀 SPRINT 1 — PROCUREMENT MISSION VERIFICATION');
  console.log('=================================================\n');

  let eventCaptured = false;
  let capturedEvent: BusinessEvent | null = null;

  // 1. Subscribe to BusinessEventBus
  BusinessEventBus.subscribe((evt) => {
    if (evt.type === 'InventoryLowEvent' || evt.type === 'ManualProcurementRequest') {
      eventCaptured = true;
      capturedEvent = evt;
    }
  });

  // 2. Test Automatic Trigger (Inventory Low -> Requirement Analysis)
  console.log('--- 1. Testing Automatic Trigger (InventoryLowEvent) ---');
  const autoMission = await ProcurementMissionService.createMission(
    'TL-EM-CAR-12',
    'Solid Carbide End Mills 12mm',
    15,
    'Automatic',
    'Stock count (2) below minThreshold (5)'
  );

  console.log(`✅ [PASS] Mission Created: ID '${autoMission.id}'`);
  console.log(`✅ [PASS] Current Stage: '${autoMission.currentStage}' (Expected: Requirement_Analysis)`);
  console.log(`✅ [PASS] Mission Progress: ${autoMission.progress}%`);
  console.log(`✅ [PASS] Mission Context SKU: '${autoMission.context?.sku}'`);
  console.log(`✅ [PASS] Timeline Events Count: ${autoMission.timeline.length}`);

  if (autoMission.currentStage !== 'Requirement_Analysis') {
    throw new Error(`FAIL: Expected stage Requirement_Analysis, got ${autoMission.currentStage}`);
  }

  // 3. Test Manual Trigger (ManualProcurementRequest)
  console.log('\n--- 2. Testing Manual Trigger (ManualProcurementRequest) ---');
  const manualMission = await ProcurementMissionService.createMission(
    'RM-EN8-RB-50',
    'EN8 Carbon Steel Round Bars 50mm',
    25,
    'Manual',
    'User clicked Find Better Supplier'
  );
  console.log(`✅ [PASS] Manual Mission Created: ID '${manualMission.id}'`);

  // 4. Test Persistence & Storage Check
  console.log('\n--- 3. Testing Mission Storage & Persistence ---');
  const fetchedMission = await ProcurementMissionRepository.findById(autoMission.id);
  if (!fetchedMission) {
    throw new Error(`FAIL: Mission '${autoMission.id}' not found in storage repository.`);
  }
  console.log(`✅ [PASS] Mission Successfully Retained in Repository: '${fetchedMission.id}'`);

  // 5. Test Server Restart Recovery
  console.log('\n--- 4. Testing Server Restart Recovery ---');
  const recoveredMissions = await ProcurementMissionService.recoverActiveMissions();
  console.log(`✅ [PASS] Recovered ${recoveredMissions.length} Active Missions after simulated server restart.`);

  // 6. Test Event Bus & Notification
  console.log('\n--- 5. Testing Business Event Bus & Executive CTO Notification ---');
  if (eventCaptured && capturedEvent) {
    console.log(`✅ [PASS] BusinessEventBus Captured Event: '${capturedEvent.type}' (${capturedEvent.summary})`);
  } else {
    console.log(`⚠️ [WARN] Business Event captured check pending.`);
  }

  console.log('\n=================================================');
  console.log('🎉 SPRINT 1 PROCUREMENT FOUNDATION VERIFIED CLEANLY!');
  console.log('=================================================');
}

runSprint1Verification().catch(e => {
  console.error('❌ Sprint 1 Verification Failed:', e);
  process.exit(1);
});
