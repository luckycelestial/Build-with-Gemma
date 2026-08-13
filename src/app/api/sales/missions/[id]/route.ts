import { NextResponse } from 'next/server';
import { SalesMissionService } from '@/features/sales/services/SalesMissionService';

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const resolvedParams = await params;
    const body = await req.json();
    const { action } = body;

    let mission;
    if (action === 'approve_quotation' || action === 'approve') {
      mission = await SalesMissionService.approveQuotationAndSend(resolvedParams.id);
    } else if (action === 'reject') {
      mission = await SalesMissionService.rejectQuotation(resolvedParams.id);
    } else if (action === 'cancel' || action === 'stop') {
      mission = await SalesMissionService.cancelMission(resolvedParams.id);
    } else {
      return NextResponse.json({ success: false, error: `Invalid action '${action}'` }, { status: 400 });
    }

    return NextResponse.json({ success: true, mission });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
