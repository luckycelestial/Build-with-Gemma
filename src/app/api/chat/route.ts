import { NextResponse } from 'next/server';
import { ConversationService } from '@/lib/domain/ConversationService';

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
    const question = body.question || body.message || body.text || "";
    const sender = body.sender || "Factory Leadership";
    const context = body.context || null;

    if (!question) {
      return NextResponse.json({ error: "Question / message is required" }, { status: 400 });
    }

    const result = await ConversationService.handleIncomingMessage('Website', sender, question, context);

    return NextResponse.json({ 
      response: result.reply,
      reply: result.reply,
      session: result.session 
    });
  } catch (error: any) {
    console.error("Website Chat API Error:", error);
    return NextResponse.json({ error: "Failed to process chat: " + error.message }, { status: 500 });
  }
}
