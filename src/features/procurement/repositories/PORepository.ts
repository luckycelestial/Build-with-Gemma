/**
 * ============================================================================
 * MODULE PURPOSE: Persistent Purchase Order Repository (Prisma PostgreSQL)
 * RESPONSIBILITIES:
 *  - Persists POEntity instances to Supabase PostgreSQL database using Prisma ORM.
 *  - Retrieves purchase orders by missionId or poNumber.
 * OWNS: Purchase Order storage, database queries, and status updates.
 * SHOULD NOT OWN: State machine execution logic.
 * ============================================================================
 */

import { prisma } from '@/lib/prisma-client';

export interface POEntity {
  poNumber: string;         // e.g. "PO-88201"
  missionId: string;        // e.g. "mission-proc-101"
  supplierName: string;     // e.g. "Jigani Tooling Labs Ltd"
  items: string;            // e.g. "Solid Carbide End Mills 12mm (15 units)"
  amount: number;           // e.g. 63000
  terms: string;            // e.g. "Net 30 Days"
  status: 'Draft' | 'Pending_Approval' | 'Approved' | 'Sent';
  createdAt: string;
}

export class PORepository {
  public static async createPO(input: Omit<POEntity, 'poNumber' | 'createdAt'>): Promise<POEntity> {
    const poNumber = `PO-${Date.now().toString().slice(-6)}`;
    const createdAt = new Date().toISOString();

    const entity: POEntity = {
      ...input,
      poNumber,
      createdAt
    };

    try {
      // Ensure associated mission exists or create placeholder
      const missionExists = await prisma.procurementMission.findUnique({
        where: { id: input.missionId }
      });

      if (!missionExists) {
        await prisma.procurementMission.create({
          data: {
            id: input.missionId,
            sku: 'RM-SS-SHEET-15',
            itemName: input.items || 'Material',
            quantityNeeded: 15,
            status: 'Active',
            currentStage: 'Purchase_Order',
            startedAt: new Date().toISOString(),
            context: JSON.parse(JSON.stringify({ id: input.missionId, poNumber }))
          }
        }).catch(() => {});
      }

      await prisma.purchaseOrderRecord.create({
        data: {
          poNumber,
          missionId: input.missionId,
          supplierName: input.supplierName,
          status: input.status,
          totalAmount: input.amount,
          items: JSON.parse(JSON.stringify({ items: input.items, terms: input.terms })),
          createdDate: createdAt
        }
      });
    } catch (e) {
      console.warn('[PORepository] PostgreSQL createPO note:', e);
    }

    return entity;
  }

  public static async findByMissionId(missionId: string): Promise<POEntity[]> {
    try {
      const records = await prisma.purchaseOrderRecord.findMany({
        where: { missionId },
        orderBy: { createdAt: 'desc' }
      });

      return records.map(r => {
        const itemObj = (r.items as any) || {};
        return {
          poNumber: r.poNumber,
          missionId: r.missionId,
          supplierName: r.supplierName,
          items: typeof itemObj === 'string' ? itemObj : (itemObj.items || 'Procurement Items'),
          amount: r.totalAmount,
          terms: itemObj.terms || 'Net 30 Days',
          status: r.status as POEntity['status'],
          createdAt: r.createdDate || r.createdAt.toISOString()
        };
      });
    } catch (e) {
      console.warn('[PORepository] findByMissionId error:', e);
      return [];
    }
  }

  public static async updateStatus(poNumber: string, status: POEntity['status']): Promise<POEntity | null> {
    try {
      const record = await prisma.purchaseOrderRecord.update({
        where: { poNumber },
        data: { status }
      });

      const itemObj = (record.items as any) || {};
      return {
        poNumber: record.poNumber,
        missionId: record.missionId,
        supplierName: record.supplierName,
        items: typeof itemObj === 'string' ? itemObj : (itemObj.items || 'Procurement Items'),
        amount: record.totalAmount,
        terms: itemObj.terms || 'Net 30 Days',
        status: record.status as POEntity['status'],
        createdAt: record.createdDate || record.createdAt.toISOString()
      };
    } catch (e) {
      console.warn('[PORepository] updateStatus note:', e);
      return null;
    }
  }
}
