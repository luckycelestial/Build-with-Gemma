/**
 * ============================================================================
 * MODULE PURPOSE: Procurement Domain Shipment Database Repository
 * RESPONSIBILITIES:
 *  - Encapsulates Prisma SQL database queries for `Shipment` and `ShipmentStep` tables.
 * OWNS: Direct Prisma DB queries for shipment logistics tracking.
 * SHOULD NOT OWN: Stock quantity adjusters.
 * ============================================================================
 */

export class ShipmentRepository {
  static async getAllShipments() {
    const { prisma } = await import('@/lib/prisma-client');
    return prisma.shipment.findMany({
      include: { steps: { orderBy: { sequence: 'asc' } } },
      orderBy: { id: 'asc' }
    });
  }

  static async updateStepStatus(stepId: number, status: string) {
    const { prisma } = await import('@/lib/prisma-client');
    return prisma.shipmentStep.update({
      where: { id: stepId },
      data: { status }
    });
  }
}
