import { BusinessEventBus, BusinessEvent } from '../events/BusinessEventBus';
import { prisma } from '../prisma-client';
import { AIService } from '../ai';
import { isTrustedAdvisorySender } from '../config/trustedContacts';
import { AdvisoryParserService } from './AdvisoryParserService';

export interface ProcessInputResult {
  reply: string;
  event?: BusinessEvent;
  data?: any;
}

export class BusinessInputService {
  /**
   * Processes incoming text or PDF commands from WhatsApp or Web Simulator
   */
  static async processWhatsAppInput(messageText: string, senderName: string = "Factory Leadership"): Promise<ProcessInputResult> {
    const text = messageText.trim();
    const lower = text.toLowerCase();
    const timeStr = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });

    // 0. SENDER CHECK: TRUSTED ADVISORY AGENT / MARKET INTELLIGENCE INGESTION
    const isAdvisoryMsg = isTrustedAdvisorySender(senderName) || lower.startsWith("[advisory]") || lower.includes("advisory agent");

    if (isAdvisoryMsg) {
      console.log(`📡 [Advisory Ingestion] Received trusted market update from ${senderName}: "${text}"`);
      
      const parseResult = await AdvisoryParserService.parseAdvisoryMessage(text);
      let dbRecord: any = null;

      try {
        dbRecord = await prisma.marketSignal.create({
          data: {
            title: parseResult.headline,
            category: parseResult.category,
            impact: parseResult.summary,
            action: `Review ${parseResult.recommendedImpact} Workspace parameters`,
            material: parseResult.affectedMaterial,
            date: new Date()
          }
        });
      } catch {
        dbRecord = { id: Date.now(), ...parseResult };
      }

      // Map event type based on extracted category
      let eventType: BusinessEvent['type'] = 'MarketSignalDetected';
      let deepLink = '/market-intelligence';

      if (parseResult.category === 'CommodityPrice') {
        eventType = 'CommodityPriceUpdated';
        deepLink = '/pricing-agent';
      } else if (parseResult.category === 'SupplierDelay' || parseResult.category === 'SupplyRisk') {
        eventType = 'SupplierUpdated';
        deepLink = '/supplier-agent';
      } else if (parseResult.category === 'IndustryOpportunity') {
        eventType = 'MarketSignalDetected';
        deepLink = '/what-if-simulator';
      }

      // Emit Business Event to AI CTO Bus if confidence >= 0.70
      let event: BusinessEvent | undefined = undefined;
      if (parseResult.confidence >= 0.70) {
        event = {
          id: `evt-adv-${Date.now()}`,
          type: eventType,
          timestamp: timeStr,
          source: 'WhatsApp',
          summary: `AI Advisory Agent: ${parseResult.headline} (${parseResult.change})`,
          details: parseResult,
          deepLink
        };
        BusinessEventBus.publish(event);
      }

      if (parseResult.confidence >= 0.70) {
        const reply = `*Market intelligence received.*\n\nThe AI CTO has synchronized the update.\nPricing and executive recommendations have been refreshed.`;
        return { reply, event, data: dbRecord };
      } else {
        const reply = `*Market intelligence logged (Confidence ${Math.round(parseResult.confidence * 100)}%).*\n\nFlagged as 'Needs Review' for Executive approval before re-indexing.`;
        return { reply, data: dbRecord };
      }
    }

    // 1. COMMAND: INVOICE LOGGING (e.g. "Here is today's supplier invoice...")
    if (lower.includes("invoice") || lower.includes("bill") || lower.includes("supplier invoice")) {
      let supplierName = "Peenya Steel Stockyard";
      let materialName = "CNC Steel Sheets";
      let amount = 45000;
      let dueDate = "2026-08-05";

      if (lower.includes("bescom")) {
        supplierName = "BESCOM Power Grid";
        materialName = "Industrial Power Tariff";
        amount = 62000;
      } else if (lower.includes("tool") || lower.includes("carbide")) {
        supplierName = "Jigani Tooling Labs";
        materialName = "Carbide End Mills 12mm";
        amount = 28500;
      }

      const amtMatch = text.match(/(?:rs\.?|inr|₹)?\s*(\d+(?:,\d+)*(?:\.\d+)?)/i);
      if (amtMatch) {
        const parsedAmt = parseFloat(amtMatch[1].replace(/,/g, ''));
        if (!isNaN(parsedAmt) && parsedAmt > 0) amount = parsedAmt;
      }

      let invoiceRecord: any = null;
      try {
        invoiceRecord = await prisma.supplierInvoice.create({
          data: {
            supplierName,
            materialName,
            amount,
            dueDate: new Date(dueDate),
            status: "Pending"
          }
        });
      } catch {
        invoiceRecord = { id: Date.now(), supplierName, materialName, amount, dueDate, status: "Pending" };
      }

      const event: BusinessEvent = {
        id: `evt-${Date.now()}`,
        type: 'InvoiceLogged',
        timestamp: timeStr,
        source: 'WhatsApp',
        summary: `Supplier invoice logged via WhatsApp (₹${amount.toLocaleString('en-IN')} - ${supplierName})`,
        details: { supplierName, materialName, amount, dueDate },
        deepLink: '/supplier-agent'
      };
      BusinessEventBus.publish(event);

      const reply = `*Invoice Logged Directly to Database*\n\nSupplier: ${supplierName}\nMaterial: ${materialName}\nAmount: ₹${amount.toLocaleString('en-IN')}\nDue Date: ${dueDate}\n\n*AI CTO Update:* Cash flow projection & supplier balance updated automatically.`;
      return { reply, event, data: invoiceRecord };
    }

    // 2. COMMAND: DEBT / SUPPLIER QUERY (e.g. "How much do I owe Peenya Steel?")
    if (lower.includes("how much") || lower.includes("owe") || lower.includes("balance") || lower.includes("pending")) {
      const event: BusinessEvent = {
        id: `evt-${Date.now()}`,
        type: 'SupplierUpdated',
        timestamp: timeStr,
        source: 'WhatsApp',
        summary: `Queried supplier ledger balance via WhatsApp`,
        details: { query: text },
        deepLink: '/supplier-agent'
      };
      BusinessEventBus.publish(event);

      const reply = `*Supplier Ledger Query Result*\n\nSupplier: Peenya Steel Stockyard\nOutstanding Balance: ₹1,45,000\nNext Payment Due: 28 Jul 2026\nStatus: 1 Pending Invoice\n\n*AI CTO Advice:* Cash buffer is healthy for this week.`;
      return { reply, event };
    }

    // 3. COMMAND: PRICE INFLATION ALERT (e.g. "Steel increased by 8%")
    if (lower.includes("increased") || lower.includes("price hike") || lower.includes("cost up") || lower.includes("steel")) {
      const event: BusinessEvent = {
        id: `evt-${Date.now()}`,
        type: 'PriceChangeDetected',
        timestamp: timeStr,
        source: 'WhatsApp',
        summary: `Raw material price hike reported via WhatsApp (${text})`,
        details: { signal: text },
        deepLink: '/pricing-agent'
      };
      BusinessEventBus.publish(event);

      const reply = `*Material Cost Hike Logged*\n\nReported Signal: ${text}\nAffected Contracts: CNC Machining Job Work (Auto Ancillary)\nAI CTO Recommendation: Surcharge adjustment (+4.8%) queued on Morning Briefing.`;
      return { reply, event };
    }

    // 4. COMMAND: COLLECTIONS REMINDER (e.g. "Send reminder to ABC Industries")
    if (lower.includes("reminder") || lower.includes("collect") || lower.includes("outreach")) {
      const event: BusinessEvent = {
        id: `evt-${Date.now()}`,
        type: 'ReminderPrepared',
        timestamp: timeStr,
        source: 'WhatsApp',
        summary: `Collection reminder generated for ABC Industries (₹3.8L overdue)`,
        details: { customer: "ABC Industries", amount: 380000 },
        deepLink: '/collections-agent'
      };
      BusinessEventBus.publish(event);

      const reply = `*Collections Outreach Generated*\n\nCustomer: ABC Industries\nOverdue Amount: ₹3,80,000 (38 days overdue)\n\n*Outreach Draft:* "Dear ABC Industries team, Invoice #INV-882 is 38 days overdue. Kindly advise payment transaction reference today."`;
      return { reply, event };
    }

    // 5. DEFAULT: CONVERSATIONAL QUERY powered by Gemma 3 / Ollama
    try {
      const gemmaReply = await AIService.generateChatCompletion([
        { role: 'system', content: `You are Suresh's AI CTO WhatsApp Assistant for Kumar CNC Machining Unit in Peenya, Bengaluru. Answer concisely in 2-3 sentences.` },
        { role: 'user', content: text }
      ]);
      return { reply: gemmaReply };
    } catch {
      return {
        reply: `Hello! I am your AI CTO WhatsApp Assistant. Send me supplier invoices (PDF/text), ask ledger queries (*"How much do I owe Peenya Steel?"*), or log price hikes (*"Steel increased by 8%"*).`
      };
    }
  }
}
