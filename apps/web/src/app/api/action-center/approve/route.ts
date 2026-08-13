import { NextResponse } from 'next/server';
import { ActionCenterService } from '@/lib/domain/ActionCenterService';

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const { workflowId } = await req.json();
    if (!workflowId) {
      return NextResponse.json({ error: "Missing workflowId parameter" }, { status: 400 });
    }

    const success = await ActionCenterService.approveAction(workflowId);
    return NextResponse.json({ success });
  } catch (error: any) {
    return NextResponse.json({ error: "Failed to approve action: " + error.message }, { status: 500 });
  }
}
