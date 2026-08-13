/**
 * ============================================================================
 * MODULE PURPOSE: Sales Domain Mission Database Repository
 * RESPONSIBILITIES:
 *  - Encapsulates Prisma SQL database queries for `SalesMission` table.
 *  - Persists sales mission lifecycle, customer inquiry metadata, stage, and context snapshots.
 * OWNS: Direct Prisma DB queries for `SalesMission` table.
 * SHOULD NOT OWN: Communication routing or event publishing.
 * ============================================================================
 */

export interface SalesMissionEntity {
  id: string; // e.g. "mission-sales-1001" or "SALES-0001"
  customerId?: number | null;
  customerName: string;
  contactChannel: string;
  whatsappJid: string;
  productName: string; // Default: "CNC Mounting Bracket"
  quantity: number;
  deliveryDate?: string;
  location?: string;
  specialRequirements?: string;
  estimatedValue: number; // Unit price (e.g. ₹450) * Quantity
  estimatedCost: number; // Unit cost (e.g. ₹280) * Quantity
  estimatedMargin: number; // Value - Cost
  marginConfidence?: string; // "High"
  businessReason?: string; // "Standard margin benchmark for CNC machining"
  currentStage: 'Inquiry_Received' | 'Gathering_Details' | 'Margin_Estimated' | 'Quotation_Approved' | 'Quotation_Sent' | 'Order_Confirmed' | 'Mission_Completed' | 'Cancelled';
  status: 'Active' | 'Completed' | 'Cancelled';
  context?: any;
  milestones?: Array<{ timestamp: string; stage: string; text: string; actor: string }>;
  createdAt?: string;
  updatedAt?: string;
}

export class SalesMissionRepository {
  /**
   * Retrieves all sales missions from PostgreSQL, ordered by updatedAt DESC.
   */
  static async getAllMissions(): Promise<SalesMissionEntity[]> {
    const { prisma } = await import('@/lib/prisma-client');
    try {
      const dbMissions = await prisma.salesMission.findMany({
        orderBy: { updatedAt: 'desc' },
        include: { salesOrders: true }
      });

      return dbMissions.map(m => {
        const ctx = (m.context as any) || {};
        return {
          ...ctx,
          id: m.id,
          customerId: m.customerId,
          customerName: m.customerName,
          contactChannel: m.contactChannel,
          whatsappJid: m.whatsappJid,
          productName: m.productName,
          quantity: m.quantity,
          deliveryDate: m.deliveryDate || ctx.deliveryDate || '',
          location: m.location || ctx.location || '',
          specialRequirements: m.specialRequirements || ctx.specialRequirements || '',
          estimatedValue: m.estimatedValue,
          estimatedCost: m.estimatedCost,
          estimatedMargin: m.estimatedMargin,
          marginConfidence: m.marginConfidence || 'High',
          businessReason: m.businessReason || 'Standard margin benchmark for CNC machining',
          currentStage: m.currentStage as any,
          status: m.status as any,
          context: ctx,
          milestones: (ctx.milestones && Array.isArray(ctx.milestones)) ? ctx.milestones : [],
          createdAt: m.createdAt.toISOString(),
          updatedAt: m.updatedAt.toISOString()
        };
      });
    } catch (e) {
      console.warn('[SalesMissionRepository] getAllMissions error:', e);
      return [];
    }
  }

  /**
   * Finds a mission by ID.
   */
  static async findById(id: string): Promise<SalesMissionEntity | null> {
    const { prisma } = await import('@/lib/prisma-client');
    try {
      const m = await prisma.salesMission.findUnique({
        where: { id },
        include: { salesOrders: true }
      });

      if (!m) return null;
      const ctx = (m.context as any) || {};
      return {
        ...ctx,
        id: m.id,
        customerId: m.customerId,
        customerName: m.customerName,
        contactChannel: m.contactChannel,
        whatsappJid: m.whatsappJid,
        productName: m.productName,
        quantity: m.quantity,
        deliveryDate: m.deliveryDate || ctx.deliveryDate || '',
        location: m.location || ctx.location || '',
        specialRequirements: m.specialRequirements || ctx.specialRequirements || '',
        estimatedValue: m.estimatedValue,
        estimatedCost: m.estimatedCost,
        estimatedMargin: m.estimatedMargin,
        marginConfidence: m.marginConfidence || 'High',
        businessReason: m.businessReason || 'Standard margin benchmark for CNC machining',
        currentStage: m.currentStage as any,
        status: m.status as any,
        context: ctx,
        milestones: (ctx.milestones && Array.isArray(ctx.milestones)) ? ctx.milestones : [],
        createdAt: m.createdAt.toISOString(),
        updatedAt: m.updatedAt.toISOString()
      };
    } catch (e) {
      console.warn(`[SalesMissionRepository] findById error for ${id}:`, e);
      return null;
    }
  }

  /**
   * Saves or updates a SalesMission entity in PostgreSQL.
   */
  static async saveMission(mission: SalesMissionEntity): Promise<SalesMissionEntity> {
    const { prisma } = await import('@/lib/prisma-client');
    mission.updatedAt = new Date().toISOString();
    const ctxData = JSON.parse(JSON.stringify(mission));

    try {
      await prisma.salesMission.upsert({
        where: { id: mission.id },
        create: {
          id: mission.id,
          customerId: mission.customerId || null,
          customerName: mission.customerName,
          contactChannel: mission.contactChannel,
          whatsappJid: mission.whatsappJid,
          productName: mission.productName || 'CNC Mounting Bracket',
          quantity: mission.quantity || 0,
          deliveryDate: mission.deliveryDate || '',
          location: mission.location || '',
          specialRequirements: mission.specialRequirements || '',
          estimatedValue: mission.estimatedValue || 0,
          estimatedCost: mission.estimatedCost || 0,
          estimatedMargin: mission.estimatedMargin || 0,
          marginConfidence: mission.marginConfidence || 'High',
          businessReason: mission.businessReason || 'Standard margin benchmark for CNC machining',
          currentStage: mission.currentStage || 'Inquiry_Received',
          status: mission.status || 'Active',
          context: ctxData
        },
        update: {
          customerId: mission.customerId || null,
          customerName: mission.customerName,
          contactChannel: mission.contactChannel,
          whatsappJid: mission.whatsappJid,
          productName: mission.productName || 'CNC Mounting Bracket',
          quantity: mission.quantity || 0,
          deliveryDate: mission.deliveryDate || '',
          location: mission.location || '',
          specialRequirements: mission.specialRequirements || '',
          estimatedValue: mission.estimatedValue || 0,
          estimatedCost: mission.estimatedCost || 0,
          estimatedMargin: mission.estimatedMargin || 0,
          marginConfidence: mission.marginConfidence || 'High',
          businessReason: mission.businessReason || 'Standard margin benchmark for CNC machining',
          currentStage: mission.currentStage || 'Inquiry_Received',
          status: mission.status || 'Active',
          context: ctxData
        }
      });
    } catch (e) {
      console.warn('[SalesMissionRepository] PostgreSQL upsert note:', e);
    }

    return mission;
  }
}
