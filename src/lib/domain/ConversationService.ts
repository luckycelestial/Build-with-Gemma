import { AIService } from '../ai';
import { BusinessContextService, SharedBusinessContext } from './BusinessContextService';
import { BusinessEventBus, BusinessEvent } from '../events/BusinessEventBus';
import { BusinessInputService } from './BusinessInputService';

export interface SharedMessage {
  id: string;
  sender: 'user' | 'assistant' | 'system';
  channel: 'Website' | 'WhatsApp' | 'Email' | 'Voice';
  senderName: string;
  content: string;
  timestamp: string;
}

export interface SharedConversationSession {
  id: string;
  businessId: string;
  ownerName: string;
  ownerPhone: string;
  activeChannel: 'Website' | 'WhatsApp';
  messages: SharedMessage[];
  context: SharedBusinessContext;
  currentRecommendation?: string;
  createdAt: string;
  updatedAt: string;
}

class OmnichannelConversationEngine {
  private session: SharedConversationSession = {
    id: "sess-unified-001",
    businessId: "biz-peenya-001",
    ownerName: "Factory Leadership",
    ownerPhone: "+919880001234",
    activeChannel: "Website",
    messages: [
      {
        id: "msg-1",
        sender: "assistant",
        channel: "Website",
        senderName: "AI CTO",
        content: "Good morning! I am your AI CTO. I am continuously monitoring your revenue, material costs, WhatsApp inputs, and supplier balances.",
        timestamp: "09:00 AM"
      }
    ],
    context: BusinessContextService.getContext(),
    currentRecommendation: "Pass through +4.8% steel price surcharge on active job works.",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  public getSession(): SharedConversationSession {
    return { 
      ...this.session, 
      context: BusinessContextService.getContext() 
    };
  }

  public async handleIncomingMessage(
    channel: 'Website' | 'WhatsApp',
    senderName: string,
    messageText: string,
    overrideContext?: any
  ): Promise<{ reply: string; session: SharedConversationSession }> {
    const text = messageText.trim();
    const timeStr = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });

    // 1. Log incoming user message
    const userMsg: SharedMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      channel,
      senderName: senderName || (channel === 'WhatsApp' ? 'WhatsApp Contact' : 'Website User'),
      content: text,
      timestamp: timeStr
    };
    this.session.messages.push(userMsg);
    this.session.activeChannel = channel;

    // Update shared business context if provided
    if (overrideContext) {
      BusinessContextService.updateContext(overrideContext);
    }

    // 2. Check if message is a specialized WhatsApp input/advisory command
    let assistantReply = "";
    try {
      const inputRes = await BusinessInputService.processWhatsAppInput(text, senderName);
      if (inputRes.reply && !inputRes.reply.includes("Hello! I am your AI CTO WhatsApp Assistant")) {
        assistantReply = inputRes.reply;
      }
    } catch {
      // Fallback to conversational engine below
    }

    // 3. Conversational AI CTO Reasoning via Ollama Gemma 3
    if (!assistantReply) {
      try {
        const historyForLLM = this.session.messages.slice(-10).map(m => ({
          role: m.sender === 'user' ? 'user' : 'assistant',
          content: m.content
        }));

        const systemPrompt = `
You are the AI CTO for ${this.session.context.businessName} (${this.session.context.location}).
You maintain a unified conversation across Website Chat and WhatsApp.
Current Business Context:
- Supplier Balance: ₹${this.session.context.currentSupplier?.balance?.toLocaleString('en-IN')} (${this.session.context.currentSupplier?.name})
- Outstanding AR: ₹${this.session.context.currentCollectionStatus?.overdueLakh} Lakhs (${this.session.context.currentCustomer?.name})
- Latest Pricing Recommendation: ${this.session.context.currentPricingRecommendation?.action}

Respond concisely in 2-4 sentences with executive-level clarity and concrete actionable recommendations.
`;

        const llmMessages = [
          { role: 'system', content: systemPrompt },
          ...historyForLLM
        ];

        assistantReply = await AIService.generateChatCompletion(llmMessages);
      } catch (err: any) {
        console.warn("AI CTO reasoning fallback:", err.message);
        assistantReply = `I have logged your update into our unified AI CTO memory. Current pricing recommendation remains: ${this.session.context.currentPricingRecommendation?.action}.`;
      }
    }

    // 4. Log assistant message
    const botMsg: SharedMessage = {
      id: `msg-${Date.now() + 1}`,
      sender: 'assistant',
      channel,
      senderName: 'AI CTO',
      content: assistantReply,
      timestamp: timeStr
    };
    this.session.messages.push(botMsg);
    this.session.updatedAt = new Date().toISOString();

    // 5. Publish event to AI CTO Bus
    const event: BusinessEvent = {
      id: `evt-conv-${Date.now()}`,
      type: 'ConversationUpdated',
      timestamp: timeStr,
      source: channel,
      summary: `AI CTO Conversation updated via ${channel} (${senderName}): "${text.slice(0, 45)}..."`,
      details: { channel, senderName, lastMessage: text, reply: assistantReply },
      deepLink: '/'
    };
    BusinessEventBus.publish(event);

    return {
      reply: assistantReply,
      session: this.getSession()
    };
  }
}

export const ConversationService = new OmnichannelConversationEngine();
