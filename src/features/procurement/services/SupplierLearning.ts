/**
 * ============================================================================
 * MODULE PURPOSE: Single Responsibility Supplier Learning & Rating Service
 * RESPONSIBILITIES:
 *  - Evaluates historical supplier delivery compliance after completed missions.
 *  - Recalculates vendor reliability score based on logistics node outcomes.
 * OWNS: Vendor performance learning, score recalculation, and DB updates.
 * SHOULD NOT OWN: Low-level SQL queries (delegates to SupplierRepository).
 * ============================================================================
 */

import { SupplierRepository } from '../repositories/SupplierRepository';
import { SupplyChainNode } from '../types/mission';

export interface SupplierPerformanceRecord {
  supplierName: string;
  averageCost: number;
  averageDeliveryDays: number;
  lateDeliveries: number;
  ordersCompleted: number;
  reliabilityScore: number;
  successRate: number;
}

export class SupplierLearning {
  /**
   * Evaluates completed order logistics nodes and recalculates vendor performance rating profile.
   */
  static async recordOrderCompletion(
    supplierName: string,
    quotedPrice: number,
    deliveryDays: number,
    nodes: SupplyChainNode[] = []
  ): Promise<SupplierPerformanceRecord> {
    const allSuppliers = await SupplierRepository.getAllSuppliers();
    const existing = allSuppliers.find(s => s.name.toLowerCase().includes(supplierName.toLowerCase()) || supplierName.toLowerCase().includes(s.name.toLowerCase()));

    const currentScore = existing ? existing.reliabilityScore : 90;
    const delayedCount = nodes.filter(n => n.status === 'DELAYED' || n.status === 'FAILED').length;
    const wasDelayed = delayedCount > 0;

    let newReliability = currentScore;
    if (!wasDelayed) {
      newReliability = Math.min(100, currentScore + 2);
    } else {
      newReliability = Math.max(50, currentScore - (delayedCount * 2));
    }

    await SupplierRepository.updatePerformanceMetrics(supplierName, newReliability, wasDelayed);

    console.log(`📊 [SupplierLearning] Recalculated Supplier Rating for '${supplierName}': Previous ${currentScore}%, Delayed Nodes: ${delayedCount}, New Reliability: ${newReliability}%.`);

    return {
      supplierName,
      averageCost: quotedPrice,
      averageDeliveryDays: deliveryDays,
      lateDeliveries: (existing?.delayedOrders || 0) + (wasDelayed ? 1 : 0),
      ordersCompleted: (existing?.completedOrders || 0) + 1,
      reliabilityScore: newReliability,
      successRate: Math.round((((existing?.completedOrders || 0) + 1 - ((existing?.delayedOrders || 0) + (wasDelayed ? 1 : 0))) / ((existing?.completedOrders || 0) + 1)) * 100)
    };
  }
}
