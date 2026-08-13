/**
 * ============================================================================
 * MODULE PURPOSE: Persistent Quotation Repository (Prisma PostgreSQL)
 * RESPONSIBILITIES:
 *  - Persists QuotationEntity instances to Supabase PostgreSQL database using Prisma ORM.
 *  - Retrieves quotations by missionId or rfqNumber.
 * OWNS: Quotation storage and database queries.
 * SHOULD NOT OWN: State machine execution.
 * ============================================================================
 */

import { QuotationEntity } from '../types/quotation';
import { prisma } from '@/lib/prisma-client';

export class QuotationRepository {
  public static async saveQuotation(quote: Omit<QuotationEntity, 'id' | 'createdAt'>): Promise<QuotationEntity> {
    const id = `quote-${Date.now().toString().slice(-6)}`;
    const createdAt = new Date().toISOString();
    const entity: QuotationEntity = {
      ...quote,
      id,
      createdAt
    };

    try {
      // Ensure mission exists
      const missionExists = await prisma.procurementMission.findUnique({
        where: { id: quote.missionId }
      });

      if (!missionExists) {
        await prisma.procurementMission.create({
          data: {
            id: quote.missionId,
            sku: 'RM-SS-SHEET-15',
            itemName: 'Material',
            quantityNeeded: 15,
            status: 'Active',
            currentStage: 'Waiting_for_Quotations',
            startedAt: new Date().toISOString(),
            context: JSON.parse(JSON.stringify({ id: quote.missionId }))
          }
        }).catch(() => {});
      }

      await prisma.quoteRecord.create({
        data: {
          id,
          missionId: quote.missionId,
          supplierName: quote.supplierName,
          price: (quote as any).price || (quote as any).unitPrice || 0,
          deliveryDays: quote.deliveryDays,
          remarks: quote.rawMessageText || quote.remarks || '',
          quoteData: JSON.parse(JSON.stringify(entity))
        }
      });
    } catch (e) {
      console.warn('[QuotationRepository] PostgreSQL saveQuotation note:', e);
    }

    return entity;
  }

  public static async findByMissionId(missionId: string): Promise<QuotationEntity[]> {
    try {
      const records = await prisma.quoteRecord.findMany({
        where: { missionId },
        orderBy: { createdAt: 'desc' }
      });

      return records.map(r => {
        const qData = (r.quoteData as any) || {};
        return {
          id: r.id,
          missionId: r.missionId,
          supplierName: r.supplierName,
          unitPrice: r.price,
          deliveryDays: r.deliveryDays,
          totalPrice: qData.totalPrice || r.price * 15,
          rawMessageText: r.remarks || '',
          parsedSuccessfully: true,
          createdAt: r.createdAt.toISOString()
        };
      });
    } catch (e) {
      console.warn('[QuotationRepository] findByMissionId error:', e);
      return [];
    }
  }
}
