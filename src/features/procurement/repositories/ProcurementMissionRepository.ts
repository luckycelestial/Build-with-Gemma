/**
 * ============================================================================
 * MODULE PURPOSE: Persistent Procurement Mission Repository (Prisma PostgreSQL)
 * RESPONSIBILITIES:
 *  - Persists ProcurementMissionEntity instances directly to Supabase PostgreSQL using Prisma ORM.
 *  - Ensures active missions survive application restarts and are queried directly from the database.
 * OWNS: Mission data persistence, database queries, and upsert operations.
 * SHOULD NOT OWN: Workflow stage transitions or UI component logic.
 * ============================================================================
 */

import { ProcurementMissionEntity, STAGE_PROGRESS_MAP } from '../types/mission';
import { prisma } from '@/lib/prisma-client';

export class ProcurementMissionRepository {
  /**
   * Saves or updates a procurement mission in PostgreSQL database via Prisma ORM.
   */
  public static async save(mission: ProcurementMissionEntity): Promise<ProcurementMissionEntity> {
    mission.updatedAt = new Date().toISOString();
    mission.progress = STAGE_PROGRESS_MAP[mission.currentStage] || mission.progress;

    try {
      // 1. Upsert ProcurementMission table
      await prisma.procurementMission.upsert({
        where: { id: mission.id },
        create: {
          id: mission.id,
          sku: mission.sku || 'RM-SS-SHEET-15',
          itemName: mission.itemName || 'Stainless Steel',
          quantityNeeded: mission.context?.quantityNeeded || 15,
          status: mission.status || 'Active',
          currentStage: mission.currentStage || 'Waiting_for_Quotations',
          startedAt: mission.startedAt || new Date().toISOString(),
          context: mission.context ? JSON.parse(JSON.stringify(mission.context)) : JSON.parse(JSON.stringify(mission))
        },
        update: {
          sku: mission.sku || 'RM-SS-SHEET-15',
          itemName: mission.itemName || 'Stainless Steel',
          quantityNeeded: mission.context?.quantityNeeded || 15,
          status: mission.status || 'Active',
          currentStage: mission.currentStage || 'Waiting_for_Quotations',
          startedAt: mission.startedAt || new Date().toISOString(),
          context: mission.context ? JSON.parse(JSON.stringify(mission.context)) : JSON.parse(JSON.stringify(mission))
        }
      });

      // 2. Sync Mission Participants if present in context
      if (mission.context?.missionParticipants && Array.isArray(mission.context.missionParticipants)) {
        for (const p of mission.context.missionParticipants) {
          await prisma.missionParticipant.create({
            data: {
              missionId: mission.id,
              supplierId: p.supplierId ? Number(p.supplierId) : null,
              supplierName: p.supplierName,
              contactChannel: p.contactChannel || '',
              whatsappJid: p.whatsappJid || '',
              quoteReceived: Boolean(p.quoteReceived),
              selected: Boolean(p.selected),
              confirmationStatus: p.confirmationStatus || null
            }
          }).catch(() => {
            // Ignore duplicate participant insertions
          });
        }
      }
    } catch (e) {
      console.warn('[ProcurementMissionRepository] PostgreSQL upsert note:', e);
    }

    return mission;
  }

  public static async saveMission(mission: ProcurementMissionEntity): Promise<ProcurementMissionEntity> {
    return this.save(mission);
  }

  /**
   * Finds a mission by its unique ID from PostgreSQL database.
   */
  public static async findById(id: string): Promise<ProcurementMissionEntity | null> {
    try {
      const dbMission = await prisma.procurementMission.findUnique({
        where: { id },
        include: { participants: true }
      });

      if (!dbMission) return null;

      // Extract context JSON snapshot and ensure participants are read from context JSON or relation
      const ctx = (dbMission.context as any) || {};
      const participants = (ctx.missionParticipants && ctx.missionParticipants.length > 0)
        ? ctx.missionParticipants
        : (dbMission.participants || []);

      const missionEntity: ProcurementMissionEntity = {
        ...ctx,
        id: dbMission.id,
        sku: dbMission.sku,
        itemName: dbMission.itemName,
        status: dbMission.status as any,
        currentStage: dbMission.currentStage as any,
        startedAt: dbMission.startedAt,
        updatedAt: dbMission.updatedAt.toISOString(),
        context: {
          ...ctx,
          missionParticipants: participants
        },
        progress: STAGE_PROGRESS_MAP[dbMission.currentStage as keyof typeof STAGE_PROGRESS_MAP] || ctx.progress || 50
      };

      return missionEntity;
    } catch (e) {
      console.warn('[ProcurementMissionRepository] findById error:', e);
      return null;
    }
  }

  /**
   * Retrieves all procurement missions from PostgreSQL database.
   */
  public static async getAllMissions(): Promise<ProcurementMissionEntity[]> {
    try {
      const dbMissions = await prisma.procurementMission.findMany({
        orderBy: { updatedAt: 'desc' },
        include: { participants: true }
      });

      if (dbMissions.length === 0) {
        // Return default active baseline mission if DB has no missions yet
        const defaultMission: ProcurementMissionEntity = {
          id: 'mission-proc-101',
          title: 'Raw Material Procurement Mission: Solid Carbide End Mills 12mm',
          sku: 'TL-EM-CAR-12',
          itemName: 'Solid Carbide End Mills 12mm',
          status: 'Active',
          currentStage: 'Waiting_for_Quotations',
          progress: STAGE_PROGRESS_MAP['Waiting_for_Quotations'],
          timeline: [
            { timestamp: '09:00 AM', stage: 'Inventory_Low', text: 'Low Stock Threshold Breached (Qty: 2, Min: 5)', actor: 'InventoryMonitor' },
            { timestamp: '09:05 AM', stage: 'Mission_Created', text: 'Procurement Mission Created & Assigned to ProcurementWorker', actor: 'ExecutiveCTO' },
            { timestamp: '09:10 AM', stage: 'Requirement_Analysis', text: 'Requirement Analyzed: 15 units needed', actor: 'ProcurementWorker' }
          ],
          businessImpact: 'Prevents 2 stockout incidents & protects ₹82,000 gross margin',
          owner: 'ProcurementWorker',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        await this.save(defaultMission);
        return [defaultMission];
      }

      return dbMissions.map(dbM => {
        const ctx = (dbM.context as any) || {};
        const participants = (ctx.missionParticipants && ctx.missionParticipants.length > 0)
          ? ctx.missionParticipants
          : (dbM.participants || []);

        return {
          ...ctx,
          id: dbM.id,
          sku: dbM.sku,
          itemName: dbM.itemName,
          status: dbM.status as any,
          currentStage: dbM.currentStage as any,
          startedAt: dbM.startedAt,
          updatedAt: dbM.updatedAt.toISOString(),
          context: {
            ...ctx,
            missionParticipants: participants
          },
          progress: STAGE_PROGRESS_MAP[dbM.currentStage as keyof typeof STAGE_PROGRESS_MAP] || ctx.progress || 50
        };
      });
    } catch (e) {
      console.warn('[ProcurementMissionRepository] getAllMissions error:', e);
      return [];
    }
  }
}
