/**
 * ============================================================================
 * MODULE PURPOSE: Procurement Communication Gateway Mission Resolver Service
 * RESPONSIBILITIES:
 *  - Associates incoming/outgoing supplier messages with a specific ProcurementMission.
 *  - Resolves active missions by supplier name, SKU, or explicit missionId tags.
 * OWNS: Mission-to-message mapping logic.
 * SHOULD NOT OWN: WhatsApp API HTTP transports.
 * ============================================================================
 */

import { ProcurementMissionRepository } from '../repositories/ProcurementMissionRepository';
import { ProcurementMissionEntity } from '../types/mission';

export class MissionResolver {
  /**
   * Resolves the active target Procurement Mission for a given message context.
   */
  static async resolveMission(messageText: string, supplierName?: string): Promise<ProcurementMissionEntity | null> {
    const missions = await ProcurementMissionRepository.getAllMissions();
    const activeMissions = missions.filter(m => m.status === 'Active' || m.status === 'Paused_Approval');

    if (activeMissions.length === 0) return null;

    // A. Check for explicit missionId tag (e.g. "[mission-proc-101]")
    const tagMatch = messageText.match(/\[(mission-proc-\w+)\]/i);
    if (tagMatch) {
      const explicit = activeMissions.find(m => m.id.toLowerCase() === tagMatch[1].toLowerCase());
      if (explicit) return explicit;
    }

    // B. Check for SKU match
    const matchedBySku = activeMissions.find(m => 
      messageText.toLowerCase().includes(m.sku.toLowerCase()) ||
      messageText.toLowerCase().includes(m.itemName.toLowerCase())
    );
    if (matchedBySku) return matchedBySku;

    // C. Default to the most recently updated active mission
    return activeMissions[0];
  }
}
