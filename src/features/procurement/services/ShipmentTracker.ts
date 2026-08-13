/**
 * ============================================================================
 * MODULE PURPOSE: Single Responsibility Shipment Tracker & Transit State Machine Service
 * RESPONSIBILITIES:
 *  - Manages the 7 shipment transit nodes:
 *    1. Supplier Confirmed (Supplier_Acceptance)
 *    2. Manufacturing
 *    3. Packed
 *    4. Dispatched (Dispatch)
 *    5. In Transit / Warehouse
 *    6. Goods Received (Goods_Received)
 *    7. Inventory Updated
 * OWNS: Shipment checkpoint state evaluation and transit step progress tracking.
 * SHOULD NOT OWN: Low-level SQL queries (delegates to ShipmentRepository).
 * ============================================================================
 */

import { ShipmentRepository } from '../repositories/ShipmentRepository';

export interface ShipmentTransitNode {
  nodeName: string;
  stageKey: string;
  status: 'Pending' | 'In_Transit' | 'Completed';
  timestamp?: string;
}

export class ShipmentTracker {
  /**
   * Generates initial 7 transit nodes for a newly dispatched purchase order shipment.
   */
  static generateShipmentNodes(poNumber: string): ShipmentTransitNode[] {
    return [
      { nodeName: 'Supplier Confirmed', stageKey: 'Supplier_Acceptance', status: 'Completed', timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) },
      { nodeName: 'Manufacturing', stageKey: 'Manufacturing', status: 'Completed', timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) },
      { nodeName: 'Packed', stageKey: 'Packed', status: 'Completed', timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) },
      { nodeName: 'Dispatched', stageKey: 'Dispatch', status: 'Completed', timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) },
      { nodeName: 'In Transit / Warehouse', stageKey: 'In_Transit', status: 'Completed', timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) },
      { nodeName: 'Goods Received', stageKey: 'Goods_Received', status: 'Completed', timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) },
      { nodeName: 'Inventory Updated', stageKey: 'Inventory_Updated', status: 'Completed', timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) }
    ];
  }
}
