/**
 * ============================================================================
 * MODULE PURPOSE: Sales Mission Domain State Machine & Orchestrator
 * RESPONSIBILITIES:
 *  - Manages automatic Sales Mission onboarding upon customer registration.
 *  - Sends outgoing WhatsApp messages strictly using Customer Phone Number.
 *  - Resolves incoming WhatsApp messages strictly using Customer WhatsApp JID.
 *  - Performs Margin Estimation calculations (Selling Price, Estimated Cost, Gross Margin, Confidence).
 *  - Manages AI natural conversation flow to collect Quantity, Material, and Delivery Date.
 *  - Handles Owner Quotation Approval and dispatches official quotes to Customer Phone Number.
 *  - Creates `SalesOrder` records upon customer confirmation.
 *  - Publishes `CustomerOrderCreated` event to `BusinessEventBus`.
 * OWNS: Sales Mission workflow state machine and event publishing for sales orders.
 * SHOULD NOT OWN: Low-level database queries or socket transport logic.
 * ============================================================================
 */

import { SalesMissionRepository, SalesMissionEntity } from '../repositories/SalesMissionRepository';
import { CustomerRepository, CustomerMasterItem } from '../repositories/CustomerRepository';
import { SalesOrderRepository } from '../repositories/SalesOrderRepository';
import { CommunicationService } from '@/lib/domain/CommunicationService';
import { BusinessEventBus } from '@/lib/events/BusinessEventBus';

export class SalesMissionService {
  /**
   * Automatically initializes a Sales Mission and sends the initial intro WhatsApp message
   * to the Customer's Phone Number immediately upon customer registration.
   */
  static async createMissionAndSendIntro(customer: CustomerMasterItem): Promise<SalesMissionEntity> {
    // 1. Close any previous active sales missions for this customer
    const existing = await SalesMissionRepository.getAllMissions();
    for (const m of existing) {
      if (
        (customer.whatsappJid && m.whatsappJid === customer.whatsappJid) ||
        (customer.contactChannel && m.contactChannel === customer.contactChannel)
      ) {
        if (m.status === 'Active') {
          m.status = 'Completed';
          m.currentStage = 'Mission_Completed';
          await SalesMissionRepository.saveMission(m);
        }
      }
    }

    const randomId = `SALES-${Math.floor(Math.random() * 9000 + 1000)}`;
    const nowStr = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });

    const newMission: SalesMissionEntity = {
      id: randomId,
      customerId: customer.id,
      customerName: customer.name,
      contactChannel: customer.contactChannel,
      whatsappJid: customer.whatsappJid || '',
      productName: 'CNC Mounting Bracket', // Product SKU: FG-CNC-BRACKET-01
      quantity: 0,
      deliveryDate: '',
      location: 'Factory Delivery',
      specialRequirements: 'Stainless Steel',
      estimatedValue: 0,
      estimatedCost: 0,
      estimatedMargin: 0,
      marginConfidence: 'High (96%)',
      businessReason: 'Standard MSME precision machining margin benchmark for CNC Mounting Brackets.',
      currentStage: 'Inquiry_Received',
      status: 'Active',
      context: {
        productSku: 'FG-CNC-BRACKET-01',
        productName: 'CNC Mounting Bracket',
        customerName: customer.name,
        contactChannel: customer.contactChannel,
        whatsappJid: customer.whatsappJid,
        quantity: 0,
        material: '',
        deliveryDate: ''
      },
      milestones: [
        {
          timestamp: nowStr,
          stage: 'Customer_Registered',
          text: `Customer ${customer.name} registered. Sales Mission '${randomId}' created automatically.`,
          actor: 'System'
        }
      ]
    };

    const saved = await SalesMissionRepository.saveMission(newMission);
    console.log(`🚀 [SalesMissionService] Sales Mission '${saved.id}' created automatically for ${customer.name}.`);

    // 2. Immediately send initial intro WhatsApp message to Customer PHONE NUMBER
    const introMsg = `Hello ${customer.name},

Thank you for connecting with us.

We specialize in manufacturing CNC Mounting Brackets and have several years of experience producing precision components.

To prepare the most suitable quotation, could you please share:

• Quantity required
• Preferred material
• Expected delivery date

Looking forward to your response.`;

    // Dispatch message via CommunicationService to PHONE NUMBER (not JID)
    await CommunicationService.send('whatsapp', saved.id, customer.contactChannel, introMsg, 'Sales Agent');

    saved.milestones = saved.milestones || [];
    saved.milestones.push({
      timestamp: nowStr,
      stage: 'Introduction_Sent',
      text: `Initial introduction & requirements inquiry sent to ${customer.contactChannel} over WhatsApp.`,
      actor: 'Sales Agent'
    });

    await SalesMissionRepository.saveMission(saved);

    // Publish Business Event
    BusinessEventBus.publish({
      id: `evt-sales-${saved.id}`,
      type: 'SalesMissionCreated',
      timestamp: nowStr,
      source: 'Sales Department',
      summary: `Sales Mission '${saved.id}' initialized for ${customer.name}`,
      details: { missionId: saved.id, customerName: customer.name, contactChannel: customer.contactChannel },
      deepLink: '/sales-agent'
    });

    return saved;
  }

  /**
   * Processes incoming customer WhatsApp messages resolved strictly by Customer WhatsApp JID.
   */
  static async processIncomingCustomerWhatsAppEvent(
    fromJid: string,
    messageText: string,
    customer: CustomerMasterItem
  ): Promise<{ handled: boolean; reply?: string }> {
    const allMissions = await SalesMissionRepository.getAllMissions();
    let activeMission = allMissions.find(m =>
      m.status === 'Active' &&
      (
        (customer.whatsappJid && m.whatsappJid === customer.whatsappJid) ||
        (customer.contactChannel && m.contactChannel === customer.contactChannel) ||
        (m.customerName.toLowerCase() === customer.name.toLowerCase())
      )
    );

    // Auto-create sales mission if none active for registered customer
    if (!activeMission) {
      activeMission = await this.createMissionAndSendIntro(customer);
    }

    const nowStr = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
    const textLower = messageText.toLowerCase();

    // STAGE A: CUSTOMER ORDER CONFIRMATION CHECK
    if (
      activeMission.currentStage === 'Quotation_Sent' ||
      activeMission.currentStage === 'Quotation_Approved' ||
      textLower.includes('confirm') ||
      textLower.includes('accept') ||
      textLower.includes('proceed') ||
      textLower.includes('yes') ||
      textLower.includes('approved')
    ) {
      if (
        textLower.includes('confirm') ||
        textLower.includes('accept') ||
        textLower.includes('proceed') ||
        textLower.includes('yes') ||
        textLower.includes('approved') ||
        activeMission.currentStage === 'Quotation_Sent'
      ) {
        return this.confirmCustomerOrder(activeMission, customer, messageText);
      }
    }

    // STAGE B: PARSE QUANTITY, MATERIAL, AND DELIVERY DATE
    const ctx = activeMission.context || {};

    // 1. Parse Quantity (e.g. "500", "need 500", "1000 pcs")
    const qtyMatch = messageText.match(/(\d+)\s*(pcs|units|pieces|brackets)?/i);
    if (qtyMatch && qtyMatch[1]) {
      const parsedQty = parseInt(qtyMatch[1], 10);
      if (parsedQty > 0) {
        activeMission.quantity = parsedQty;
        ctx.quantity = parsedQty;
      }
    }

    // 2. Parse Material (e.g. "stainless steel", "mild steel", "aluminum", "brass")
    if (textLower.includes('stainless steel') || textLower.includes('ss')) {
      activeMission.specialRequirements = 'Stainless Steel';
      ctx.material = 'Stainless Steel';
    } else if (textLower.includes('mild steel') || textLower.includes('ms')) {
      activeMission.specialRequirements = 'Mild Steel';
      ctx.material = 'Mild Steel';
    } else if (textLower.includes('aluminum') || textLower.includes('aluminium')) {
      activeMission.specialRequirements = 'Aluminum';
      ctx.material = 'Aluminum';
    } else if (textLower.includes('brass') || textLower.includes('copper')) {
      activeMission.specialRequirements = 'Brass';
      ctx.material = 'Brass';
    }

    // 3. Parse Delivery Date (e.g. "15 days", "2 weeks", "next monday", "aug 15")
    if (
      textLower.includes('day') ||
      textLower.includes('week') ||
      textLower.includes('monday') ||
      textLower.includes('urgent') ||
      textLower.includes('asap') ||
      textLower.includes('date')
    ) {
      activeMission.deliveryDate = messageText;
      ctx.deliveryDate = messageText;
    }

    activeMission.context = ctx;

    const quantity = activeMission.quantity || ctx.quantity || 0;
    const material = activeMission.specialRequirements || ctx.material || '';
    const deliveryDate = activeMission.deliveryDate || ctx.deliveryDate || '';

    let aiReply = '';

    // Check if required fields (Quantity, Material, Delivery Date) are all collected
    if (quantity > 0 && material && deliveryDate) {
      // Calculate Margin & Selling Price
      const unitCost = material.includes('Stainless') ? 140 : 120;
      const unitPrice = material.includes('Stainless') ? 210 : 180;
      const estimatedCost = quantity * unitCost;
      const estimatedValue = quantity * unitPrice;
      const estimatedMargin = estimatedValue - estimatedCost;

      activeMission.estimatedCost = estimatedCost;
      activeMission.estimatedValue = estimatedValue;
      activeMission.estimatedMargin = estimatedMargin;
      activeMission.marginConfidence = 'High (96%)';
      activeMission.businessReason = `Calculated for ${quantity} pcs of ${material} CNC Brackets with ${((estimatedMargin / estimatedValue) * 100).toFixed(1)}% gross margin benchmark.`;
      activeMission.currentStage = 'Margin_Estimated';

      aiReply = `Thank you ${customer.name}. I have recorded your requirements:\n• Quantity: ${quantity} pcs\n• Material: ${material}\n• Target Delivery: ${deliveryDate}\n\nOur executive team is reviewing the pricing and will issue your official quotation shortly.`;

      activeMission.milestones = activeMission.milestones || [];
      activeMission.milestones.push({
        timestamp: nowStr,
        stage: 'Requirements_Completed',
        text: `Customer requirements gathered (Qty: ${quantity}, Material: ${material}, Delivery: ${deliveryDate}). Margin Estimated: ₹${estimatedMargin.toLocaleString('en-IN')}. Awaiting Owner Approval.`,
        actor: 'Sales Agent'
      });
    } else {
      // Prompt naturally for missing fields
      activeMission.currentStage = 'Gathering_Details';
      if (quantity === 0) {
        aiReply = `Thank you ${customer.name}. Could you please specify the required quantity of CNC Mounting Brackets?`;
      } else if (!material) {
        aiReply = `Got it (${quantity} pcs). What is your preferred material (e.g. Stainless Steel or Mild Steel)?`;
      } else {
        aiReply = `Noted (${quantity} pcs of ${material}). What is your target delivery date or timeframe?`;
      }

      activeMission.milestones = activeMission.milestones || [];
      activeMission.milestones.push({
        timestamp: nowStr,
        stage: 'Gathering_Details',
        text: `Customer: "${messageText}" | AI Reply: "${aiReply}"`,
        actor: 'Sales Agent'
      });
    }

    await SalesMissionRepository.saveMission(activeMission);

    // Send AI reply over WhatsApp to Customer PHONE NUMBER
    await CommunicationService.send('whatsapp', activeMission.id, customer.contactChannel, aiReply, 'Sales Agent');

    return { handled: true, reply: aiReply };
  }

  /**
   * Approves quotation draft and dispatches official quote to Customer PHONE NUMBER over WhatsApp.
   */
  static async approveQuotationAndSend(missionId: string): Promise<SalesMissionEntity> {
    const mission = await SalesMissionRepository.findById(missionId);
    if (!mission) throw new Error(`Sales Mission '${missionId}' not found.`);

    const nowStr = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
    mission.currentStage = 'Quotation_Sent';

    const quoteMsg = `Quotation

Product: CNC Mounting Bracket
Material: ${mission.specialRequirements || 'Stainless Steel'}
Quantity: ${mission.quantity}
Price: ₹${mission.estimatedValue.toLocaleString('en-IN')}
Delivery: ${mission.deliveryDate || '15 Days'}

Please reply CONFIRMED to proceed.`;

    mission.milestones = mission.milestones || [];
    mission.milestones.push({
      timestamp: nowStr,
      stage: 'Quotation_Sent',
      text: `Owner approved quotation (Value: ₹${mission.estimatedValue.toLocaleString('en-IN')}). Quote sent to ${mission.contactChannel} over WhatsApp.`,
      actor: 'Business Owner'
    });

    await SalesMissionRepository.saveMission(mission);

    // Dispatch quote via CommunicationService to Customer PHONE NUMBER (contactChannel)
    await CommunicationService.send('whatsapp', mission.id, mission.contactChannel, quoteMsg, 'Sales Agent');

    return mission;
  }

  /**
   * Rejects a Quotation draft.
   */
  static async rejectQuotation(missionId: string): Promise<SalesMissionEntity> {
    const mission = await SalesMissionRepository.findById(missionId);
    if (!mission) throw new Error(`Sales Mission '${missionId}' not found.`);

    const nowStr = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
    mission.status = 'Cancelled';
    mission.currentStage = 'Cancelled';

    mission.milestones = mission.milestones || [];
    mission.milestones.push({
      timestamp: nowStr,
      stage: 'Cancelled',
      text: `🛑 Quotation draft rejected by business owner. Sales Mission cancelled.`,
      actor: 'Business Owner'
    });

    await SalesMissionRepository.saveMission(mission);
    return mission;
  }

  /**
   * Confirms a Customer Order, creates a SalesOrder in PostgreSQL, sends receipt to Customer Phone Number,
   * and publishes the CustomerOrderCreated Business Event.
   */
  private static async confirmCustomerOrder(
    activeMission: SalesMissionEntity,
    customer: CustomerMasterItem,
    messageText: string
  ): Promise<{ handled: boolean; reply?: string }> {
    const nowStr = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
    activeMission.currentStage = 'Order_Confirmed';
    activeMission.status = 'Completed';

    activeMission.milestones = activeMission.milestones || [];
    activeMission.milestones.push({
      timestamp: nowStr,
      stage: 'Order_Confirmed',
      text: `Customer ${customer.name} confirmed quotation ("${messageText}"). Customer Order created.`,
      actor: 'Customer'
    });

    const orderNum = `SO-2026-${Math.floor(Math.random() * 9000 + 1000)}`;
    const quantity = activeMission.quantity || 500;
    const totalValue = activeMission.estimatedValue || (quantity * 210);

    const salesOrder = await SalesOrderRepository.createOrder({
      id: `so-${Date.now()}`,
      orderNumber: orderNum,
      missionId: activeMission.id,
      customerName: customer.name,
      productName: activeMission.productName,
      quantity,
      unitPrice: 210,
      totalValue,
      deliveryDate: activeMission.deliveryDate || '15 Days',
      location: activeMission.location || 'Factory Delivery',
      status: 'Confirmed'
    });

    await SalesMissionRepository.saveMission(activeMission);

    // Send confirmation receipt over WhatsApp to Customer PHONE NUMBER
    const receiptText = `✅ ORDER CONFIRMED!

Thank you ${customer.name}. Your order ${orderNum} for ${quantity} units of ${activeMission.productName} (${activeMission.specialRequirements || 'Stainless Steel'}) has been logged in MissionOS ERP.

Total Order Value: ₹${totalValue.toLocaleString('en-IN')}
Expected Delivery: ${activeMission.deliveryDate || '15 Days'}

Production scheduling will begin immediately.`;

    await CommunicationService.send('whatsapp', activeMission.id, customer.contactChannel, receiptText, 'Sales Agent');

    // CRITICAL REQUIREMENT: Publish CustomerOrderCreated Business Event
    BusinessEventBus.publish({
      id: `evt-co-${salesOrder.id}`,
      type: 'CustomerOrderCreated',
      timestamp: nowStr,
      source: 'Sales Department',
      summary: `Customer Order ${orderNum} confirmed for ${customer.name} (Value: ₹${totalValue.toLocaleString('en-IN')})`,
      details: {
        orderId: salesOrder.id,
        orderNumber: salesOrder.orderNumber,
        missionId: activeMission.id,
        customerName: customer.name,
        productName: activeMission.productName,
        material: activeMission.specialRequirements || 'Stainless Steel',
        quantity,
        totalValue,
        deliveryDate: salesOrder.deliveryDate,
        location: salesOrder.location
      },
      deepLink: '/sales-agent'
    });

    return { handled: true, reply: receiptText };
  }
}
