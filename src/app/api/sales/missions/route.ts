import { NextResponse } from 'next/server';
import { SalesMissionRepository } from '@/features/sales/repositories/SalesMissionRepository';
import { SalesMissionService } from '@/features/sales/services/SalesMissionService';

export async function GET() {
  try {
    const missions = await SalesMissionRepository.getAllMissions();
    return NextResponse.json({ success: true, missions });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { customerName, contactChannel, whatsappJid, productName, quantity } = body;
    
    const mission = await SalesMissionService.createMission(
      customerName || 'Apex Engineering (Ramesh)',
      contactChannel || '+919880011223',
      whatsappJid || '202516935528474',
      productName || 'CNC Mounting Bracket',
      quantity || 500
    );

    return NextResponse.json({ success: true, mission });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
