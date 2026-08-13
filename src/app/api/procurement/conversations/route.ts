import { NextResponse } from 'next/server';
import { CommunicationService } from '@/lib/domain/CommunicationService';

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const workflowId = searchParams.get('workflowId') || undefined;

    const messages = CommunicationService.getConversationStream(workflowId);
    return NextResponse.json({ success: true, messages });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
