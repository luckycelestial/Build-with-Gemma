import { NextResponse } from 'next/server';
import { ProcurementMissionRepository } from '@/features/procurement/repositories/ProcurementMissionRepository';
import { ProcurementMissionService } from '@/features/procurement/services/ProcurementMissionService';
import { QuotationRepository } from '@/features/procurement/repositories/QuotationRepository';
import { QuotationAnalyzer } from '@/features/procurement/services/QuotationAnalyzer';

export async function GET() {
  try {
    const rawMissions = await ProcurementMissionRepository.getAllMissions();
    const missions = await Promise.all(rawMissions.map(async m => {
      const rawQuotes = await QuotationRepository.findByMissionId(m.id);
      const rankedQuotes = QuotationAnalyzer.analyzeAndRankQuotes(rawQuotes);
      return {
        ...m,
        quotations: rawQuotes,
        rankedQuotes
      };
    }));

    return NextResponse.json({ success: true, missions });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { sku, itemName, quantity } = body;
    const mission = await ProcurementMissionService.createMission(
      sku || 'TL-EM-CAR-12',
      itemName || 'Solid Carbide End Mills 12mm',
      quantity || 15
    );
    return NextResponse.json({ success: true, mission });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
