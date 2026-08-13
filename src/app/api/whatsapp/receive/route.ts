import { NextResponse } from 'next/server';
import { CommunicationService } from '@/lib/domain/CommunicationService';

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { from, message, timestamp } = body;

    if (!from || !message) {
      return NextResponse.json({ success: false, error: "Missing 'from' or 'message'" }, { status: 400 });
    }

    const result = await CommunicationService.receive(from, message, timestamp);
    return NextResponse.json({ success: true, result });
  } catch (error: any) {
    console.error('[API /api/whatsapp/receive Error]:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
