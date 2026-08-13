import { NextResponse } from 'next/server';
import { SupplierRepository } from '@/features/procurement/repositories/SupplierRepository';

export async function GET() {
  try {
    const suppliers = await SupplierRepository.getAllSuppliers();
    return NextResponse.json({ success: true, suppliers });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, phone, material, whatsappJid } = body;

    if (!name || !phone) {
      return NextResponse.json({ success: false, error: "Missing required fields 'name' or 'phone'" }, { status: 400 });
    }

    const supplier = await SupplierRepository.createSupplier(name, phone, material || 'Stainless Steel', whatsappJid || '');
    return NextResponse.json({ success: true, supplier });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { id, whatsappJid } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: "Missing supplier 'id'" }, { status: 400 });
    }

    const updated = await SupplierRepository.updateSupplierJid(id, whatsappJid || '');
    return NextResponse.json({ success: true, supplier: updated });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const idStr = searchParams.get('id');
    const body = await req.json().catch(() => ({}));
    const id = parseInt(idStr || body.id, 10);

    if (!id) {
      return NextResponse.json({ success: false, error: "Missing supplier 'id'" }, { status: 400 });
    }

    await SupplierRepository.deleteSupplier(id);
    return NextResponse.json({ success: true, deletedId: id });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
