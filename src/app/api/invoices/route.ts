import { NextResponse } from 'next/server';
import { prisma } from '../../../lib/db';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { supplierName, materialName, amount, dueDate } = body;

    if (!supplierName || !materialName || amount === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields: supplierName, materialName, and amount.' },
        { status: 400 }
      );
    }

    const invoice = await prisma.invoice.create({
      data: {
        supplierName,
        materialName,
        amount: parseFloat(amount),
        dueDate: dueDate ? new Date(dueDate) : null,
        status: 'pending',
      },
    });

    return NextResponse.json({ success: true, invoice });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function GET() {
  try {
    const invoices = await prisma.invoice.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json({ invoices });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'Missing invoice id parameter.' }, { status: 400 });
    }
    await prisma.invoice.delete({
      where: { id: parseInt(id) },
    });
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
