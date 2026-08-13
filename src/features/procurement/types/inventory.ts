/**
 * ============================================================================
 * MODULE PURPOSE: Procurement Domain Inventory Types
 * RESPONSIBILITIES:
 *  - Defines SKU item data models, stock status enums, and threshold alerts.
 * OWNS: InventoryItem, StockStatus, and InventoryThresholdEvent interfaces.
 * SHOULD NOT OWN: Database SQL queries or UI component props.
 * ============================================================================
 */

export type StockStatus = 'In Stock' | 'Low Stock' | 'Out of Stock';

export interface InventoryItemData {
  id: number;
  name: string;
  category: string;
  sku: string;
  quantity: number;
  unit: string;
  location: string;
  minThreshold: number;
  status: StockStatus;
  image: string;
  lastUpdated: string | Date;
}

export interface StockAdjustmentInput {
  id: number;
  newQty: number;
  reason?: string;
}
