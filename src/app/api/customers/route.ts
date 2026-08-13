import { NextResponse } from 'next/server';
import { CustomerRepository } from '@/features/sales/repositories/CustomerRepository';

export async function GET() {
  try {
    const customers = await CustomerRepository.getAllCustomers();
    return NextResponse.json({ success: true, customers });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, phone, company, interestedProduct, whatsappJid } = body;
    if (!name || !phone) {
      return NextResponse.json({ success: false, error: 'Name and Phone number are required' }, { status: 400 });
    }

    const created = await CustomerRepository.createCustomer(
      name,
      phone,
      company || '',
      interestedProduct || 'CNC Mounting Bracket',
      whatsappJid || ''
    );

    // CRITICAL REQUIREMENT: Automatically create Sales Mission and send initial intro WhatsApp message to Customer Phone Number
    const { SalesMissionService } = await import('@/features/sales/services/SalesMissionService');
    const mission = await SalesMissionService.createMissionAndSendIntro(created);

    return NextResponse.json({ success: true, customer: created, mission });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { id, whatsappJid } = body;
    if (!id) {
      return NextResponse.json({ success: false, error: 'Customer ID is required' }, { status: 400 });
    }

    const updated = await CustomerRepository.updateCustomerJid(Number(id), whatsappJid || '');
    return NextResponse.json({ success: true, customer: updated });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ success: false, error: 'Customer ID is required' }, { status: 400 });
    }

    await CustomerRepository.deleteCustomer(Number(id));
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
