/**
 * ============================================================================
 * MODULE PURPOSE: Sales Domain Order Database Repository
 * RESPONSIBILITIES:
 *  - Encapsulates Prisma SQL database queries for `SalesOrder` table.
 *  - Persists confirmed sales orders when customer accepts quotation.
 * OWNS: Direct Prisma DB queries for `SalesOrder` table.
 * SHOULD NOT OWN: Workflow stage logic or communication sending.
 * ============================================================================
 */

export interface SalesOrderEntity {
  id: string;
  orderNumber: string; // e.g. "SO-2026-1001"
  missionId: string;
  customerName: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalValue: number;
  deliveryDate: string;
  location: string;
  status: string; // "Confirmed" | "In_Production" | "Fulfilled" | "Cancelled"
  createdAt?: string;
}

export class SalesOrderRepository {
  /**
   * Retrieves all confirmed sales orders from PostgreSQL.
   */
  static async getAllOrders(): Promise<SalesOrderEntity[]> {
    const { prisma } = await import('@/lib/prisma-client');
    try {
      const dbOrders = await prisma.salesOrder.findMany({ orderBy: { createdAt: 'desc' } });
      return dbOrders.map(o => ({
        id: o.id,
        orderNumber: o.orderNumber,
        missionId: o.missionId,
        customerName: o.customerName,
        productName: o.productName,
        quantity: o.quantity,
        unitPrice: o.unitPrice,
        totalValue: o.totalValue,
        deliveryDate: o.deliveryDate,
        location: o.location,
        status: o.status,
        createdAt: o.createdAt.toISOString()
      }));
    } catch (e) {
      console.warn('[SalesOrderRepository] getAllOrders error:', e);
      return [];
    }
  }

  /**
   * Creates a confirmed sales order in PostgreSQL.
   */
  static async createOrder(order: Omit<SalesOrderEntity, 'createdAt'>): Promise<SalesOrderEntity> {
    const { prisma } = await import('@/lib/prisma-client');
    const created = await prisma.salesOrder.create({
      data: {
        id: order.id,
        orderNumber: order.orderNumber,
        missionId: order.missionId,
        customerName: order.customerName,
        productName: order.productName,
        quantity: order.quantity,
        unitPrice: order.unitPrice,
        totalValue: order.totalValue,
        deliveryDate: order.deliveryDate,
        location: order.location,
        status: order.status || 'Confirmed'
      }
    });

    return {
      id: created.id,
      orderNumber: created.orderNumber,
      missionId: created.missionId,
      customerName: created.customerName,
      productName: created.productName,
      quantity: created.quantity,
      unitPrice: created.unitPrice,
      totalValue: created.totalValue,
      deliveryDate: created.deliveryDate,
      location: created.location,
      status: created.status,
      createdAt: created.createdAt.toISOString()
    };
  }
}
