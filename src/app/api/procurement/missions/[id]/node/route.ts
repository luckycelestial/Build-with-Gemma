import { NextResponse } from 'next/server';
import { ProcurementMissionService } from '@/features/procurement/services/ProcurementMissionService';

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { nodeIndex, status } = body; // status: 'ON_TIME' | 'DELAYED'

    const updatedMission = await ProcurementMissionService.updateSupplyChainNode(
      id,
      typeof nodeIndex === 'number' ? nodeIndex : parseInt(nodeIndex, 10),
      status === 'DELAYED' ? 'DELAYED' : 'ON_TIME'
    );

    return NextResponse.json({ success: true, mission: updatedMission });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
