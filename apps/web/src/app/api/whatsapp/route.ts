import { NextResponse } from 'next/server';
import { ConversationService } from '@/lib/domain/ConversationService';
import { ProcurementCommunicationGateway } from '@/departments/procurement/services/ProcurementCommunicationGateway';

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = ConversationService.getSession();
    return NextResponse.json({ success: true, session });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const message = body.message || body.text || body.content || "";
    const sender = body.sender || "WhatsApp Contact";

    if (!message) {
      return NextResponse.json({ error: "Message content is required" }, { status: 400 });
    }

    // 1. Try Procurement Communication Gateway first
    const gatewayResult = await ProcurementCommunicationGateway.handleIncomingMessage(sender, message);
    if (gatewayResult.handled) {
      return NextResponse.json({
        success: true,
        reply: gatewayResult.reply,
        missionId: gatewayResult.missionId,
        actionTaken: gatewayResult.actionTaken
      });
    }

    // 2. Fallback to Omnichannel Conversation Engine (Existing functionality preserved 100%)
    const result = await ConversationService.handleIncomingMessage('WhatsApp', sender, message);

    return NextResponse.json({
      success: true,
      reply: result.reply,
      session: result.session
    });
  } catch (error: any) {
    console.error("Failed to process WhatsApp API request:", error);
    return NextResponse.json({ error: "Failed to process WhatsApp input: " + error.message }, { status: 500 });
  }
}
