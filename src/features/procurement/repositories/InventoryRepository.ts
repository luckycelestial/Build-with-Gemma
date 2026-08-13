/**
 * ============================================================================
 * MODULE PURPOSE: Procurement Domain Inventory Database Repository
 * RESPONSIBILITIES:
 *  - Encapsulates all Prisma SQL database queries for `InventoryItem` table.
 * OWNS: Direct Prisma DB queries for inventory items.
 * SHOULD NOT OWN: Business logic or UI components.
 * ============================================================================
 */

export class InventoryRepository {
  static async getAllItems() {
    const { prisma } = await import('@/lib/prisma-client');
    return prisma.inventoryItem.findMany({ orderBy: { id: 'asc' } });
  }

  static async findById(id: number) {
    const { prisma } = await import('@/lib/prisma-client');
    return prisma.inventoryItem.findUnique({ where: { id } });
  }

  static async updateQuantity(id: number, quantity: number, status: string) {
    const { prisma } = await import('@/lib/prisma-client');
    return prisma.inventoryItem.update({
      where: { id },
      data: { quantity, status, lastUpdated: new Date() }
    });
  }

  static async replenishStockBySku(sku: string, addedQuantity: number) {
    try {
      const { prisma } = await import('@/lib/prisma-client');
      const item = await prisma.inventoryItem.findFirst({ where: { sku } });
      if (item) {
        const newQty = item.quantity + addedQuantity;
        const newStatus = newQty >= item.minThreshold ? 'HEALTHY' : 'LOW';
        return await prisma.inventoryItem.update({
          where: { id: item.id },
          data: { quantity: newQty, status: newStatus, lastUpdated: new Date() }
        });
      }
    } catch (e) {
      console.warn('[InventoryRepository] replenishStockBySku note:', e);
    }
    return null;
  }
}
