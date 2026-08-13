import { NextResponse } from 'next/server';
import { SalesOrderRepository } from '@/features/sales/repositories/SalesOrderRepository';

export async function GET() {
  try {
    const orders = await SalesOrderRepository.getAllOrders();
    return NextResponse.json({ success: true, orders });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
