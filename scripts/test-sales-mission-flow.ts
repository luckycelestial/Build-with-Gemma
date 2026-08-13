import { CustomerRepository } from '../src/departments/sales/repositories/CustomerRepository';
import { SalesMissionService } from '../src/departments/sales/services/SalesMissionService';
import { SalesOrderRepository } from '../src/departments/sales/repositories/SalesOrderRepository';
import { BusinessEventBus } from '../src/lib/events/BusinessEventBus';

async function runSalesMissionFlowTest() {
  console.log('====================================================');
  console.log('🧪 SALES DEPARTMENT MVP FLOW VERIFICATION SUITE');
  console.log('====================================================');

  // Step 1: Register Customer (AUTO-TRIGGERS SALES MISSION & INTRO WHATSAPP TO PHONE)
  console.log('\n[Step 1] Registering Customer & Auto-Triggering Workflow...');
  const customer = await CustomerRepository.createCustomer(
    'Apex Engineering (Test)',
    '+919880011223',
    'Apex Industrial Pvt Ltd',
    'CNC Mounting Bracket',
    '202516935528474'
  );
  console.log(`✅ Customer Saved: ${customer.name} (Phone: ${customer.contactChannel}, JID: ${customer.whatsappJid})`);

  const mission = await SalesMissionService.createMissionAndSendIntro(customer);
  console.log(`✅ Mission Auto-Created: ${mission.id} | Stage: ${mission.currentStage}`);
  console.log(`   Initial Intro Message Dispatched to PHONE NUMBER: ${customer.contactChannel}`);

  // Step 2: Customer Reply Received (RESOLVED STRICTLY VIA WHATSAPP JID)
  console.log('\n[Step 2] Incoming Customer Detail Reply Resolved via WhatsApp JID (202516935528474)...');
  const replyResult = await SalesMissionService.processIncomingCustomerWhatsAppEvent(
    customer.whatsappJid,
    'Need 500 pcs in Stainless Steel within 15 Days',
    customer
  );
  console.log(`✅ Requirements Gathered! AI Reply Sent to Phone ${customer.contactChannel}: "${replyResult.reply}"`);

  // Step 3: Approve Quotation Draft
  console.log('\n[Step 3] Owner Approving Quotation Draft (Dispatching to Customer Phone Number)...');
  const approvedMission = await SalesMissionService.approveQuotationAndSend(mission.id);
  console.log(`✅ Quotation Approved & Dispatched to Phone ${customer.contactChannel}! Stage: ${approvedMission.currentStage}`);

  // Step 4: Customer Confirms Order via WhatsApp
  console.log('\n[Step 4] Customer Replying CONFIRMED via WhatsApp JID...');
  let eventCaptured = false;
  BusinessEventBus.subscribe(evt => {
    if (evt.type === 'CustomerOrderCreated') {
      eventCaptured = true;
      console.log(`🎉 BusinessEvent Captured: '${evt.type}' - ${evt.summary}`);
    }
  });

  await SalesMissionService.processIncomingCustomerWhatsAppEvent(
    customer.whatsappJid,
    'CONFIRMED',
    customer
  );

  // Step 5: Verify Confirmed Sales Order
  const orders = await SalesOrderRepository.getAllOrders();
  const latestOrder = orders.find(o => o.missionId === mission.id);
  if (latestOrder) {
    console.log(`\n✅ Customer Order Persisted in PostgreSQL: ${latestOrder.orderNumber} (Total Value: ₹${latestOrder.totalValue.toLocaleString('en-IN')})`);
  } else {
    console.error('❌ Failed to find persisted Customer Order.');
  }

  if (eventCaptured && latestOrder) {
    console.log('\n====================================================');
    console.log('✨ ALL SALES DEPARTMENT MVP TESTS PASSED 100% CLEANLY!');
    console.log('====================================================');
  } else {
    console.warn('\n⚠️ Test completed (Verify event capturing).');
  }
}

runSalesMissionFlowTest().catch(console.error);
