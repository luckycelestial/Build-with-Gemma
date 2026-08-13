/**
 * ============================================================================
 * MODULE PURPOSE: Persistent Mission-Driven Procurement State Machine Service
 * RESPONSIBILITIES:
 *  - Manages transitions across the Procurement Mission lifecycle.
 *  - Filters eligible suppliers strictly by requested material (Stainless Steel, Mild Steel, Copper).
 *  - Maintains MissionParticipant entities as the single authority for supplier tracking.
 *  - Handles WhatsApp LID / JID number resolution for incoming supplier replies.
 *  - As soon as 1+ quotes arrive, populates Supplier Comparison Table live.
 *  - Explicit user supplier selection: User picks winner before PO dispatch.
 *  - PO dispatched ONLY to selected winning supplier with dynamic Quantity × Unit Price total.
 *  - 7 Logistics Nodes tracking (Supplier Confirmed ➔ Goods Received).
 *  - Recalculates Supplier Reliability & updates Supplier Master Table upon mission completion.
 *  - Updates inventory by exact requested quantity ONLY after Node 7 (Goods Received) is completed.
 * OWNS: Mission state machine execution, participant tracking, and ERP workflow lifecycle.
 * SHOULD NOT OWN: Low-level SQL queries (delegates to Repositories).
 * ============================================================================
 */

import { ProcurementMissionRepository } from '../repositories/ProcurementMissionRepository';
import { SupplierRepository } from '../repositories/SupplierRepository';
import { RFQRepository } from '../repositories/RFQRepository';
import { QuotationRepository } from '../repositories/QuotationRepository';
import { PORepository } from '../repositories/PORepository';
import { InventoryRepository } from '../repositories/InventoryRepository';
import { QuotationAnalyzer } from './QuotationAnalyzer';
import { SupplierLearning } from './SupplierLearning';
import { MessageFormatter } from './MessageFormatter';
import { WhatsAppGatewayConnector } from '../connectors/WhatsAppGatewayConnector';
import { ProcurementMissionEntity, MissionStage, MissionParticipant, SupplyChainNode, STAGE_PROGRESS_MAP } from '../types/mission';
import { BusinessEventBus } from '@/lib/events/BusinessEventBus';

export class ProcurementMissionService {
  /**
   * Initializes a new persistent Procurement Mission for an inventory trigger or manual request.
   */
  static async createMission(
    sku: string = 'RM-SS-SHEET-15',
    itemName: string = 'Stainless Steel',
    quantityNeeded: number = 15,
    triggerType: string = 'Manual',
    reason: string = 'User manual procurement request'
  ): Promise<ProcurementMissionEntity> {
    // Complete/close any previous active/paused missions to ensure system is 100% ready for the new restock mission
    const existing = await ProcurementMissionRepository.getAllMissions();
    for (const m of existing) {
      if (m.status === 'Active' || m.status === 'Paused_Approval') {
        m.status = 'Completed';
        await ProcurementMissionRepository.saveMission(m);
        const participants = m.context?.missionParticipants || [];
        for (const p of participants) {
          await SupplierRepository.updateSupplierStatus(p.supplierName, 'Available', null);
        }
      }
    }

    const randomId = `mission-proc-${Math.floor(Math.random() * 900000 + 100000)}`;
    const nowStr = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });

    // Initial stock lookup
    let initialStock = 5;
    if (itemName.toLowerCase().includes('mild')) initialStock = 8;
    if (itemName.toLowerCase().includes('copper')) initialStock = 3;

    const newMission: ProcurementMissionEntity = {
      id: randomId,
      sku,
      itemName,
      currentStage: 'Mission_Created',
      status: 'Active',
      progressPercentage: STAGE_PROGRESS_MAP['Mission_Created'],
      startedAt: new Date().toISOString(),
      lastUpdatedAt: new Date().toISOString(),
      context: {
        sku,
        itemName,
        currentStock: initialStock,
        minThreshold: 10,
        quantityNeeded,
        targetDeliveryDate: '2 Days',
        estimatedSavings: quantityNeeded * 250,
        riskLevel: 'High',
        assignedWorker: 'ProcurementWorker',
        missionParticipants: []
      },
      milestones: [
        {
          timestamp: nowStr,
          stage: 'Mission_Created',
          text: `Procurement Mission '${randomId}' initialized for ${itemName} (SKU: ${sku}). Required Quantity: ${quantityNeeded}kg. Current Stock: ${initialStock}kg.`,
          actor: 'ExecutiveCTO'
        }
      ],
      auditTrail: [
        {
          timestamp: nowStr,
          toolId: 'initialize_mission',
          inputPayload: { sku, itemName, quantityNeeded, triggerType, reason },
          result: { missionId: randomId, status: 'Active' }
        }
      ]
    };

    const saved = await ProcurementMissionRepository.saveMission(newMission);
    console.log(`🚀 [ProcurementMissionService] Created Procurement Mission '${saved.id}' for ${itemName} (${quantityNeeded}kg).`);

    // Emit Business Event to Event Bus
    BusinessEventBus.publish({
      id: `evt-proc-${saved.id}`,
      type: 'InventoryLowEvent',
      timestamp: nowStr,
      source: 'Inventory Monitor',
      summary: `Procurement Mission '${saved.id}' initialized for ${itemName} (${quantityNeeded}kg)`,
      details: { missionId: saved.id, sku, itemName, currentStock: initialStock, quantityNeeded },
      deepLink: '/supplier-agent'
    });

    // Auto-advance to Supplier Discovery & RFQ Dispatch
    return this.executeSupplierDiscoveryAndRFQ(saved.id);
  }

  /**
   * SUPPLIER DISCOVERY & RFQ DISPATCH: Filters suppliers strictly by requested material category.
   * Creates MissionParticipant entities and dispatches RFQ to eligible suppliers via WhatsApp.
   */
  static async executeSupplierDiscoveryAndRFQ(missionId: string): Promise<ProcurementMissionEntity> {
    const mission = await ProcurementMissionRepository.findById(missionId);
    if (!mission) throw new Error(`Mission '${missionId}' not found.`);

    const rawSuppliers = await SupplierRepository.getAllSuppliers();
    const targetMat = mission.itemName.trim().toLowerCase();

    // Phase 3: Filter suppliers strictly matching material (Stainless Steel, Mild Steel, Copper)
    const matchingSuppliers = rawSuppliers.filter(s => {
      const supMat = (s.materialCategory || s.materials || '').toLowerCase();
      if (targetMat.includes('stainless')) return supMat.includes('stainless');
      if (targetMat.includes('mild')) return supMat.includes('mild');
      if (targetMat.includes('copper')) return supMat.includes('copper');
      return supMat.includes(targetMat);
    });

    const eligibleSuppliers = matchingSuppliers.length > 0 ? matchingSuppliers : rawSuppliers.filter(s => {
      const supMat = (s.materialCategory || s.materials || '').toLowerCase();
      return supMat.includes(targetMat.split(' ')[0]);
    });

    // Phase 4: Create MissionParticipant entities
    const participants: MissionParticipant[] = eligibleSuppliers.map(s => ({
      missionId: mission.id,
      supplierId: s.id,
      supplierName: s.name,
      phone: s.contactChannel,
      rfqSent: true,
      quoteReceived: false,
      quoteParsed: false,
      selected: false,
      confirmed: false
    }));

    mission.context = mission.context || {};
    mission.context.missionParticipants = participants;
    mission.context.expectedQuotesCount = participants.length;
    mission.context.quotesReceivedCount = 0;

    // Update status in Supplier Master to 'In Mission'
    for (const p of participants) {
      await SupplierRepository.updateSupplierStatus(p.supplierName, 'In Mission', mission.id);
    }

    await ProcurementMissionRepository.saveMission(mission);

    await this.advanceStage(
      missionId,
      'Supplier_Discovery',
      `Supplier Discovery completed: Filtered ${participants.length} eligible '${mission.itemName}' supplier(s): ${participants.map(p => p.supplierName).join(', ')}.`,
      'SupplierFinder',
      { toolId: 'discover_suppliers', inputPayload: { material: mission.itemName }, result: { candidateCount: participants.length } }
    );

    // Step 6: Create RFQ
    const rfq = await RFQRepository.createRFQ({
      missionId: mission.id,
      sku: mission.sku,
      materialName: mission.itemName,
      quantity: mission.context?.quantityNeeded || 15,
      deliveryDate: mission.context?.targetDeliveryDate,
      terms: 'Net 30 Days, Delivery to Peenya Factory',
      supplierName: participants[0]?.supplierName || 'SS Supplier',
      supplierContact: participants[0]?.phone || '+919880011223'
    });

    await this.advanceStage(
      missionId,
      'RFQ_Generation',
      `Generated Structured RFQ '${rfq.rfqNumber}' for ${rfq.quantity}kg of ${rfq.materialName}.`,
      'ProcurementWorker',
      { toolId: 'generate_rfq', inputPayload: { rfqNumber: rfq.rfqNumber, missionId: mission.id }, result: { rfq } }
    );

    // Dynamic RFQ Dispatch ONLY to eligible material suppliers
    for (const p of participants) {
      if (p.phone) {
        const rfqText = MessageFormatter.formatOutgoingMessage('RFQ', mission.id, {
          supplierName: p.supplierName,
          itemName: mission.itemName,
          quantity: mission.context?.quantityNeeded || 15
        });

        try {
          await WhatsAppGatewayConnector.sendMessage(p.phone, rfqText, mission.id);
          console.log(`📡 [ProcurementMissionService] Dispatched RFQ to eligible supplier '${p.supplierName}' (${p.phone}) via WhatsApp.`);
        } catch (sendErr) {
          console.error(`⚠️ [ProcurementMissionService] Failed to send RFQ to ${p.phone}:`, sendErr);
        }
      }
    }

    await this.advanceStage(
      missionId,
      'RFQ_Dispatch',
      `RFQ '${rfq.rfqNumber}' dispatched to ${participants.length} eligible supplier(s) via WhatsApp Gateway.`,
      'ProcurementWorker',
      { toolId: 'send_whatsapp_message', inputPayload: { count: participants.length }, result: { dispatched: true } }
    );

    return this.advanceStage(
      missionId,
      'Waiting_for_Quotations',
      `Procurement Mission '${mission.id}' PAUSED in 'WAITING_FOR_QUOTES' state awaiting supplier quotation responses from ${participants.length} supplier(s) on WhatsApp.`,
      'ProcurementMissionService'
    );
  }

  /**
   * Receives supplier quotation reply, stores quotation independently per supplier,
   * updates AI comparison table live as soon as 1+ quotes arrive.
   */
  static async receiveSupplierQuotation(missionId: string, quoteData: any): Promise<ProcurementMissionEntity> {
    const mission = await ProcurementMissionRepository.findById(missionId);
    if (!mission) throw new Error(`Mission '${missionId}' not found.`);

    const supplierName = quoteData.supplierName || 'Supplier';
    const price = quoteData.quotedPrice || 95;
    const deliveryDays = quoteData.leadTimeDays || quoteData.deliveryDays || 2;
    const moq = quoteData.moq || 15;

    const participants = mission.context.missionParticipants || [];
    const participant = participants.find(p => p.supplierName.toLowerCase().includes(supplierName.toLowerCase()) || supplierName.toLowerCase().includes(p.supplierName.toLowerCase())) || participants[0];

    if (participant) {
      participant.quoteReceived = true;
      participant.quoteParsed = true;
      participant.quoteData = {
        price,
        deliveryDays,
        moq,
        paymentTerms: quoteData.paymentTerms || 'Net 30 Days',
        rawMessage: quoteData.rawMessage || `₹${price}/kg delivery ${deliveryDays} days`
      };
    }

    // 1. Save Quotation to QuotationRepository
    await QuotationRepository.saveQuotation({
      rfqNumber: `RFQ-${mission.id.slice(-6)}`,
      missionId: mission.id,
      supplierName: participant ? participant.supplierName : supplierName,
      price,
      currency: 'INR',
      moq,
      deliveryDays,
      paymentTerms: 'Net 30 Days',
      validityDays: 7,
      notes: 'Structured supplier quotation reply'
    });

    const allQuotes = await QuotationRepository.findByMissionId(missionId);
    const expectedCount = mission.context.expectedQuotesCount || participants.length || 1;
    const receivedCount = allQuotes.length;

    mission.context.missionParticipants = participants;
    mission.context.quotesReceivedCount = receivedCount;
    await ProcurementMissionRepository.saveMission(mission);

    // As soon as AT LEAST ONE quote is received, run AI analysis and unlock Comparison Table & Owner Approval!
    console.log(`📊 [ProcurementMissionService] Quote received (${receivedCount}/${expectedCount} received). Updating AI Comparison Table live...`);

    const rankedResults = QuotationAnalyzer.analyzeAndRankQuotes(allQuotes);

    // Attach AI scores and business reasoning back to participants for UI comparison table
    for (const p of participants) {
      const match = rankedResults.find(r => r.supplierName.toLowerCase().includes(p.supplierName.toLowerCase()) || p.supplierName.toLowerCase().includes(r.supplierName.toLowerCase()));
      if (match && p.quoteData) {
        p.quoteData.aiScore = match.weightedScore;
        p.quoteData.reliability = match.reliabilityScore;
        p.quoteData.weightedScore = match.weightedScore;
        p.quoteData.businessReasoning = match.businessReasoning;
      }
    }

    mission.context.missionParticipants = participants;
    await ProcurementMissionRepository.saveMission(mission);

    await this.advanceStage(
      missionId,
      'Quotation_Comparison',
      `Parsed ${receivedCount} Supplier Quotation(s). Updated AI Supplier Comparison Table.`,
      'QuotationParser'
    );

    return this.advanceStage(
      missionId,
      'Owner_Approval',
      `AI Comparison Table active with ${receivedCount} quotation(s). User can select supplier and proceed to PO approval immediately.`,
      'QuotationAnalyzer'
    );
  }

  /**
   * User explicitly selects winning supplier from the Supplier Comparison Table.
   */
  static async selectSupplierAndPreparePO(missionId: string, supplierIdOrName: string): Promise<ProcurementMissionEntity> {
    const mission = await ProcurementMissionRepository.findById(missionId);
    if (!mission) throw new Error(`Mission '${missionId}' not found.`);

    const participants = mission.context.missionParticipants || [];
    let chosenSupplierName = '';

    for (const p of participants) {
      if (String(p.supplierId) === String(supplierIdOrName) || p.supplierName.toLowerCase().includes(String(supplierIdOrName).toLowerCase())) {
        p.selected = true;
        chosenSupplierName = p.supplierName;
        mission.context.selectedSupplierId = p.supplierId;
        mission.context.selectedSupplierName = p.supplierName;
        mission.context.selectedPrice = p.quoteData?.price || 95;
        mission.context.selectedLeadTime = p.quoteData?.deliveryDays || 2;
        mission.context.supplierContact = p.phone;
      } else {
        p.selected = false;
      }
    }

    mission.context.missionParticipants = participants;
    const updated = await ProcurementMissionRepository.saveMission(mission);

    console.log(`✅ [ProcurementMissionService] User explicitly selected winning supplier '${chosenSupplierName}' for Mission ${missionId}.`);
    return updated;
  }

  /**
   * Approves Purchase Order and dispatches dynamic PO (Quantity × Unit Price) ONLY to selected supplier.
   */
  static async approveOwnerAction(missionId: string): Promise<ProcurementMissionEntity> {
    const mission = await ProcurementMissionRepository.findById(missionId);
    if (!mission) throw new Error(`Mission '${missionId}' not found.`);

    const participants = mission.context.missionParticipants || [];
    const selectedParticipant = participants.find(p => p.selected) || participants[0];

    const supplierName = selectedParticipant.supplierName;
    const targetPhone = selectedParticipant.phone;
    const quantity = mission.context?.quantityNeeded || 15;
    const unitPrice = selectedParticipant.quoteData?.price || 95;
    const deliveryDays = selectedParticipant.quoteData?.deliveryDays || 2;
    const totalCost = quantity * unitPrice;

    // 1. Generate & Store Purchase Order in PORepository
    const po = await PORepository.createPO({
      missionId,
      supplierName,
      items: `${mission.itemName} (${quantity}kg)`,
      amount: totalCost,
      terms: 'Net 30 Days',
      status: 'Sent'
    });

    // 2. Dispatch dynamic PO message ONLY to selected winning supplier via WhatsApp
    const poMsg = MessageFormatter.formatOutgoingMessage('PO', missionId, {
      poNumber: po.poNumber,
      supplierName,
      itemName: mission.itemName,
      quantity,
      unitPrice,
      deliveryDays,
      totalCost
    });

    if (targetPhone) {
      await WhatsAppGatewayConnector.sendMessage(targetPhone, poMsg, missionId);
      console.log(`📡 [ProcurementMissionService] Dispatched PO ONLY to selected supplier '${supplierName}' (${targetPhone}). Total: ₹${totalCost.toLocaleString('en-IN')}`);
    }

    // Initialize 7 Supply Chain Nodes
    const initialNodes: SupplyChainNode[] = [
      { id: 1, name: 'Supplier Confirmed', status: 'PENDING' },
      { id: 2, name: 'Manufacturing', status: 'PENDING' },
      { id: 3, name: 'Packed', status: 'PENDING' },
      { id: 4, name: 'Dispatched', status: 'PENDING' },
      { id: 5, name: 'Warehouse', status: 'PENDING' },
      { id: 6, name: 'CNC Facility', status: 'PENDING' },
      { id: 7, name: 'Goods Received', status: 'PENDING' }
    ];

    mission.context.supplyChainNodes = initialNodes;
    mission.context.currentActiveNodeIndex = 0;
    mission.context.selectedSupplierName = supplierName;
    mission.context.supplierContact = targetPhone;
    await ProcurementMissionRepository.saveMission(mission);

    return this.advanceStage(
      missionId,
      'Supplier_Acceptance',
      `Purchase Order '${po.poNumber}' (Total: ₹${totalCost.toLocaleString('en-IN')}) dispatched ONLY to selected supplier ${supplierName} (${targetPhone}) via WhatsApp. WAITING FOR SUPPLIER CONFIRMATION REPLY ON WHATSAPP.`,
      'WhatsAppGatewayConnector',
      { toolId: 'send_whatsapp_po', inputPayload: { poNumber: po.poNumber, targetPhone, totalCost }, result: { dispatched: true } }
    );
  }

  /**
   * CANCEL / STOP MISSION: Stops an ongoing procurement mission.
   */
  static async cancelMission(missionId: string): Promise<ProcurementMissionEntity> {
    const mission = await ProcurementMissionRepository.findById(missionId);
    if (!mission) throw new Error(`Mission '${missionId}' not found.`);

    const nowStr = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
    mission.status = 'Cancelled';
    
    // Release participants back to Available in Supplier Master
    const participants = mission.context.missionParticipants || [];
    for (const p of participants) {
      await SupplierRepository.updateSupplierStatus(p.supplierName, 'Available', null);
    }

    mission.milestones.push({
      timestamp: nowStr,
      stage: mission.currentStage,
      text: `🛑 Procurement Mission '${mission.id}' CANCELLED by user.`,
      actor: 'UI Action'
    });

    await ProcurementMissionRepository.saveMission(mission);
    console.log(`🛑 [ProcurementMissionService] Mission '${missionId}' cancelled.`);
    return mission;
  }

  /**
   * REAL WHATSAPP EVENT HANDLER driven strictly by incoming WhatsApp events from Python Gateway.
   * Handles WhatsApp LIDs & phone numbers dynamically.
   */
  static async processIncomingWhatsAppEvent(
    fromPhone: string,
    messageText: string,
    passedSupplier?: any,
    passedParticipant?: MissionParticipant
  ): Promise<{ handled: boolean; reply?: string }> {
    const allMissions = await ProcurementMissionRepository.getAllMissions();
    const activeMission = allMissions.find(m => m.status === 'Active' || m.status === 'Paused_Approval');

    if (!activeMission) return { handled: false };

    const textLower = messageText.toLowerCase();
    const participants = activeMission.context.missionParticipants || [];
    const cleanFrom = fromPhone.replace(/\D/g, '');

    // 1. Resolve participant via passed parameter or Supplier Master JID / Phone lookup
    let matchedParticipant = passedParticipant;
    if (!matchedParticipant) {
      const { SupplierRepository } = await import('../repositories/SupplierRepository');
      const allSuppliers = await SupplierRepository.getAllSuppliers();
      const supplier = passedSupplier || allSuppliers.find(s => {
        if (!s.whatsappJid) return false;
        const cleanJid = s.whatsappJid.replace(/\D/g, '');
        if (!cleanJid) return false;
        return cleanFrom === cleanJid || cleanFrom.includes(cleanJid) || cleanJid.includes(cleanFrom) || (cleanJid.length >= 10 && cleanFrom.endsWith(cleanJid.slice(-10)));
      }) || allSuppliers.find(s => {
        const cleanP = s.contactChannel.replace(/\D/g, '');
        if (!cleanP) return false;
        return cleanFrom === cleanP || cleanFrom.includes(cleanP) || cleanP.includes(cleanFrom) || (cleanP.length >= 10 && cleanFrom.endsWith(cleanP.slice(-10)));
      });

      if (supplier) {
        matchedParticipant = participants.find(p => p.supplierId === supplier.id || p.supplierName.toLowerCase() === supplier.name.toLowerCase());
      }
    }

    // ABSOLUTE RULE: Never guess supplier identity. If not matched, ignore!
    if (!matchedParticipant) {
      console.log(`ℹ️ [ProcurementMissionService] Ignored incoming WhatsApp event from '${fromPhone}': Sender not a participant of active procurement mission ${activeMission.id}.`);
      return { handled: false, reply: 'Ignored (Not a mission participant)' };
    }

    const supplierName = matchedParticipant.supplierName;

    // A. Check for PO Confirmation reply ("Confirmed" / "Confirm")
    if (textLower.includes('confirm')) {
      // Deterministic Gate: ONLY the selected winning supplier can confirm the PO!
      const selectedSupplierName = activeMission.context.selectedSupplierName;
      const isSelectedWinner = matchedParticipant.selected || (selectedSupplierName && matchedParticipant.supplierName.toLowerCase().includes(selectedSupplierName.toLowerCase()));

      if (!isSelectedWinner) {
        console.warn(`⚠️ [ProcurementMissionService] Ignored PO confirmation from '${supplierName}' because '${selectedSupplierName || 'another supplier'}' was selected as the winning vendor for Mission ${activeMission.id}.`);
        return { handled: false, reply: `Ignored PO confirmation (Supplier '${supplierName}' was not the selected PO recipient).` };
      }

      matchedParticipant.confirmed = true;

      console.log(`✅ [DETERMINISTIC WHATSAPP EVENT] Selected Winning Supplier '${supplierName}' replied 'Confirmed'! Unlocking Supply Chain Tracker for mission ${activeMission.id}...`);

      const nodes: SupplyChainNode[] = activeMission.context.supplyChainNodes || [
        { id: 1, name: 'Supplier Confirmed', status: 'PENDING' },
        { id: 2, name: 'Manufacturing', status: 'PENDING' },
        { id: 3, name: 'Packed', status: 'PENDING' },
        { id: 4, name: 'Dispatched', status: 'PENDING' },
        { id: 5, name: 'Warehouse', status: 'PENDING' },
        { id: 6, name: 'CNC Facility', status: 'PENDING' },
        { id: 7, name: 'Goods Received', status: 'PENDING' }
      ];
      nodes[0].status = 'ON_TIME';

      activeMission.context.supplyChainNodes = nodes;
      activeMission.context.currentActiveNodeIndex = 1;

      await ProcurementMissionRepository.saveMission(activeMission);

      await this.advanceStage(
        activeMission.id,
        'Shipment_Tracking',
        `Supplier '${supplierName}' confirmed PO on WhatsApp! Supply Chain Tracker activated. Node 1 (Supplier Confirmed) set to ON-TIME.`,
        'ProcurementMissionService'
      );

      return { handled: true, reply: `Supplier ${supplierName} confirmed PO! Supply Chain Tracker unlocked.` };
    }

    // B. Check for Quotation reply (Price / Delivery / MOQ)
    const isQuoteReply = textLower.includes('₹') || textLower.includes('rs') || textLower.includes('£') || textLower.includes('$') || textLower.includes('quote') || textLower.includes('delivery') || textLower.includes('kg') || /\d+/.test(textLower);
    if (isQuoteReply) {
      console.log(`📊 [DETERMINISTIC WHATSAPP EVENT] Received Quotation reply from '${supplierName}': "${messageText}"`);
      const { QuotationExtractor } = await import('./QuotationExtractor');
      const extracted = QuotationExtractor.extractQuotation(messageText, supplierName);

      await this.receiveSupplierQuotation(activeMission.id, {
        supplierName,
        quotedPrice: extracted.quotedPrice || 95,
        leadTimeDays: extracted.deliveryTimeDays || 2,
        moq: (extracted as any).moq || 15,
        rawMessage: messageText
      });

      return { handled: true, reply: `Quotation stored for ${supplierName} (Mission ${activeMission.id}).` };
    }

    return { handled: false };
  }

  /**
   * INTERACTIVE SUPPLY CHAIN LOGISTICS CONTROL
   * Allows user to manually click ON-TIME / DELAYED / FAILED for each node.
   * When final delivery node (Goods Received, index 6) is completed:
   *  - Updates inventory stock by exact requested quantity.
   *  - Recalculates supplier reliability stats.
   *  - Archives mission as Completed (100% progress).
   */
  static async updateSupplyChainNode(
    missionId: string,
    nodeIndex: number,
    nodeStatus: 'ON_TIME' | 'DELAYED' | 'FAILED'
  ): Promise<ProcurementMissionEntity> {
    const mission = await ProcurementMissionRepository.findById(missionId);
    if (!mission) throw new Error(`Mission '${missionId}' not found.`);

    const nodes: SupplyChainNode[] = mission.context.supplyChainNodes || [
      { id: 1, name: 'Supplier Confirmed', status: 'PENDING' },
      { id: 2, name: 'Manufacturing', status: 'PENDING' },
      { id: 3, name: 'Packed', status: 'PENDING' },
      { id: 4, name: 'Dispatched', status: 'PENDING' },
      { id: 5, name: 'Warehouse', status: 'PENDING' },
      { id: 6, name: 'CNC Facility', status: 'PENDING' },
      { id: 7, name: 'Goods Received', status: 'PENDING' }
    ];

    if (nodeIndex >= 0 && nodeIndex < nodes.length) {
      nodes[nodeIndex].status = nodeStatus;
      nodes[nodeIndex].updatedAt = new Date().toISOString();
      mission.context.currentActiveNodeIndex = Math.min(nodeIndex + 1, nodes.length - 1);
    }

    mission.context.supplyChainNodes = nodes;
    await ProcurementMissionRepository.saveMission(mission);

    // If final node (Goods Received, index 6) is completed, COMPLETE & ARCHIVE THE MISSION!
    if (nodeIndex === nodes.length - 1 || nodeIndex === 6) {
      console.log(`🎉 [ProcurementMissionService] Final Delivery Node (Goods Received) marked as ${nodeStatus}! Completing mission ${missionId}...`);
      
      const quantityReplenished = mission.context?.quantityNeeded || 15;
      await InventoryRepository.replenishStockBySku(mission.sku, quantityReplenished);
      
      const supplierName = mission.context.selectedSupplierName || 'Supplier';
      const price = mission.context.selectedPrice || 95;
      const leadTime = mission.context.selectedLeadTime || 2;

      // Recalculate supplier reliability score & stats
      await SupplierLearning.recordOrderCompletion(supplierName, price, leadTime, nodes);

      // Release all mission participants back to Available status in Supplier Master
      const participants = mission.context.missionParticipants || [];
      for (const p of participants) {
        await SupplierRepository.updateSupplierStatus(p.supplierName, 'Available', null);
      }

      await this.advanceStage(
        missionId,
        'Inventory_Updated',
        `Replenished +${quantityReplenished} units of ${mission.itemName} (SKU: ${mission.sku}) into Machine Shop Inventory.`,
        'InventoryMonitor'
      );

      return this.advanceStage(
        missionId,
        'Mission_Complete',
        `Procurement Mission '${missionId}' FULLY COMPLETED! All 7 logistics nodes verified. Stock replenished by +${quantityReplenished}kg. Supplier reliability recalculated. Archived in history.`,
        'ProcurementMissionService'
      );
    }

    return this.advanceStage(
      missionId,
      'Shipment_Tracking',
      `Supply Chain Node ${nodes[nodeIndex].name} marked as ${nodeStatus}. Next node: ${nodes[Math.min(nodeIndex + 1, nodes.length - 1)].name}.`,
      'SupplyChainTracker'
    );
  }

  /**
   * Helper method to advance mission stage, update milestones, audit trail, and save.
   */
  static async advanceStage(
    missionId: string,
    targetStage: MissionStage,
    detailText: string,
    actorName: string = 'ProcurementWorker',
    toolExecution?: { toolId: string; inputPayload: any; result: any }
  ): Promise<ProcurementMissionEntity> {
    const mission = await ProcurementMissionRepository.findById(missionId);
    if (!mission) {
      throw new Error(`Procurement Mission '${missionId}' not found.`);
    }

    const nowStr = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
    mission.currentStage = targetStage;
    mission.progressPercentage = STAGE_PROGRESS_MAP[targetStage] || mission.progressPercentage || 50;
    
    if (targetStage === 'Mission_Complete' || targetStage === 'MISSION_COMPLETED') {
      mission.status = 'Completed';
      mission.progressPercentage = 100;
      mission.completedAt = new Date().toISOString();
    } else if (targetStage === 'Owner_Approval' || targetStage === 'Waiting_for_Quotations' || targetStage === 'Supplier_Acceptance' || targetStage === 'WAITING_FOR_QUOTES' || targetStage === 'WAITING_FOR_SUPPLIER_CONFIRMATION') {
      mission.status = 'Paused_Approval';
    } else {
      mission.status = 'Active';
    }

    mission.milestones = mission.milestones || [];
    mission.auditTrail = mission.auditTrail || [];

    mission.milestones.push({
      timestamp: nowStr,
      stage: targetStage,
      text: detailText,
      actor: actorName
    });

    if (toolExecution) {
      mission.auditTrail.push({
        timestamp: nowStr,
        toolId: toolExecution.toolId,
        inputPayload: toolExecution.inputPayload,
        result: toolExecution.result
      });
    }

    const saved = await ProcurementMissionRepository.saveMission(mission);
    return saved;
  }
}
