/**
 * ============================================================================
 * MODULE PURPOSE: Single Responsibility Inventory Monitor Service
 * RESPONSIBILITIES:
 *  - Supervises SKU stock quantities against safety thresholds (`minThreshold`).
 *  - Evaluates low stock conditions and determines stock status ('In Stock' | 'Low Stock' | 'Out of Stock').
 * OWNS: Stock threshold evaluation algorithms and low stock alert criteria.
 * SHOULD NOT OWN: Database queries (delegates to InventoryRepository) or RFQ generation.
 * ============================================================================
 */

import { InventoryItemData, StockStatus } from '../types/inventory';

export class InventoryMonitor {
  /**
   * Evaluates stock status for an inventory item based on quantity vs threshold.
   */
  static evaluateStockStatus(quantity: number, minThreshold: number): StockStatus {
    if (quantity <= 0) return 'Out of Stock';
    if (quantity <= minThreshold) return 'Low Stock';
    return 'In Stock';
  }

  /**
   * Identifies all items in an inventory dataset that require replenishment.
   */
  static filterLowStockItems(items: InventoryItemData[]): InventoryItemData[] {
    return items.filter(item => item.quantity <= item.minThreshold);
  }
}
