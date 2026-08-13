import { NextResponse } from 'next/server';
import { CommunicationService } from '@/lib/domain/CommunicationService';

export async function GET() {
  try {
    const status = await CommunicationService.getStatus();
    return NextResponse.json({ success: true, status });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    if (body.action === 'reset') {
      const status = await CommunicationService.resetSession();
      return NextResponse.json({ success: true, status });
    }

    CommunicationService.ensureGatewayRunning();
    const status = await CommunicationService.getStatus();
    return NextResponse.json({ success: true, status });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    const status = await CommunicationService.resetSession();
    return NextResponse.json({ success: true, status });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
