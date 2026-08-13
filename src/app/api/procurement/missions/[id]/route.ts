import { NextResponse } from 'next/server';
import { ProcurementMissionRepository } from '@/features/procurement/repositories/ProcurementMissionRepository';
import { ProcurementMissionService } from '@/features/procurement/services/ProcurementMissionService';

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const resolvedParams = await params;
    const mission = await ProcurementMissionRepository.findById(resolvedParams.id);
    if (!mission) {
      return NextResponse.json({ success: false, error: 'Mission not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, mission });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const resolvedParams = await params;
    const body = await req.json();
    const { action, quoteData, supplierId } = body;

    let updatedMission;
    if (action === 'receive_quote') {
      updatedMission = await ProcurementMissionService.receiveSupplierQuotation(resolvedParams.id, quoteData || {});
    } else if (action === 'select_supplier') {
      updatedMission = await ProcurementMissionService.selectSupplierAndPreparePO(resolvedParams.id, supplierId);
    } else if (action === 'approve') {
      updatedMission = await ProcurementMissionService.approveOwnerAction(resolvedParams.id);
    } else if (action === 'cancel' || action === 'stop') {
      updatedMission = await ProcurementMissionService.cancelMission(resolvedParams.id);
    } else {
      return NextResponse.json({ success: false, error: `Unknown action '${action}'` }, { status: 400 });
    }

    return NextResponse.json({ success: true, mission: updatedMission });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const resolvedParams = await params;
    const mission = await ProcurementMissionService.cancelMission(resolvedParams.id);
    return NextResponse.json({ success: true, mission });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
