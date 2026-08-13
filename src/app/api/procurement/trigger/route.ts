import { NextResponse } from 'next/server';
import { ProcurementMissionService } from '@/features/procurement/services/ProcurementMissionService';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { sku, itemName, quantity, triggerType, reason } = body;

    const mission = await ProcurementMissionService.createMission(
      sku || 'TL-EM-CAR-12',
      itemName || 'Solid Carbide End Mills 12mm',
      quantity || 15,
      triggerType || 'Manual',
      reason || 'User manual procurement request'
    );

    return NextResponse.json({
      success: true,
      message: `Procurement Mission '${mission.id}' initialized successfully. Completed Requirement Analysis state.`,
      mission
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
