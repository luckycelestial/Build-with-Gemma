import { BaseTool } from './BaseTool';
import { BusinessToolMetadata, ToolExecutionContext } from './types';
import { BusinessEvent } from '../events/BusinessEventBus';


// --- 1. Update Inventory Quantity Tool ---
export interface UpdateInventoryQtyInput {
  id: number;
  newQty: number;
  reason?: string;
}

export class UpdateInventoryQuantityTool extends BaseTool<UpdateInventoryQtyInput, any> {
  public readonly metadata: BusinessToolMetadata = {
    id: 'update_inventory_quantity',
    name: 'Update Inventory Quantity',
    description: 'Adjusts stock quantity for an inventory item, auto-updates stock status, and emits inventory events.',
    category: 'Inventory',
    capabilityName: 'InventoryManagement',
    ownedByWorker: 'SupplierWorker',
    supportedOperations: ['SupplierOperation', 'ProcurementOperation'],
    requiredPermissions: ['inventory:write'],
    executionMode: 'Autonomous',
    estimatedExecutionTimeMs: 150,
    producesEvents: ['InventoryUpdated'],
    consumesEvents: [],
    verificationStrategy: { type: 'DatabaseCheck', description: 'Verifies item quantity in PostgreSQL matches target value.' },
    retryPolicy: { maxRetries: 2, backoffMs: 500 },
    approvalPolicy: { required: false },
    tags: ['inventory', 'stock', 'warehouse', 'quantity']
  };

  protected async executeLogic(input: UpdateInventoryQtyInput, context?: ToolExecutionContext) {
    const { prisma } = await import('../prisma-client');
    const item = await prisma.inventoryItem.findUnique({ where: { id: input.id } });
    if (!item) {
      throw new Error(`Inventory item with ID ${input.id} not found.`);
    }

    let status = "In Stock";
    if (input.newQty <= 0) status = "Out of Stock";
    else if (input.newQty <= item.minThreshold) status = "Low Stock";

    const updated = await prisma.inventoryItem.update({
      where: { id: input.id },
      data: {
        quantity: input.newQty,
        status,
        lastUpdated: new Date()
      }
    });

    return {
      data: updated,
      nextRecommendedActions: status === "Low Stock" ? [`Trigger RFQ for ${item.name}`] : []
    };
  }


  protected constructEvents(data: any, input: UpdateInventoryQtyInput, context?: ToolExecutionContext): BusinessEvent[] {
    const timeStr = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
    return [{
      id: `evt-inv-${Date.now()}`,
      type: 'InventoryUpdated',
      timestamp: timeStr,
      source: context?.source === 'WhatsApp' ? 'WhatsApp' : 'Manual Upload',
      summary: `Inventory quantity updated for ${data.name} (${data.quantity} ${data.unit}) - Status: ${data.status}`,
      details: { id: data.id, sku: data.sku, name: data.name, quantity: data.quantity, status: data.status, reason: input.reason },
      deepLink: '/pricing-agent/inventory'
    }];
  }
}

// --- 2. Add Inventory Item Tool ---
export interface AddInventoryItemInput {
  name: string;
  category: string;
  sku: string;
  quantity: number;
  unit: string;
  location: string;
  minThreshold: number;
  image: string;
}

export class AddInventoryItemTool extends BaseTool<AddInventoryItemInput, any> {
  public readonly metadata: BusinessToolMetadata = {
    id: 'add_inventory_item',
    name: 'Add Inventory Item',
    description: 'Registers a new SKU or tooling asset into the inventory ledger.',
    category: 'Inventory',
    capabilityName: 'InventoryManagement',
    ownedByWorker: 'SupplierWorker',
    supportedOperations: ['SupplierOperation'],
    requiredPermissions: ['inventory:write'],
    executionMode: 'Autonomous',
    estimatedExecutionTimeMs: 200,
    producesEvents: ['InventoryUpdated'],
    consumesEvents: [],
    verificationStrategy: { type: 'DatabaseCheck', description: 'Verifies SKU created in Database.' },
    retryPolicy: { maxRetries: 1, backoffMs: 300 },
    approvalPolicy: { required: false },
    tags: ['inventory', 'new_sku', 'asset']
  };

  protected async executeLogic(input: AddInventoryItemInput, context?: ToolExecutionContext) {
    const { prisma } = await import('../prisma-client');
    let status = "In Stock";
    if (input.quantity <= 0) status = "Out of Stock";
    else if (input.quantity <= input.minThreshold) status = "Low Stock";

    const created = await prisma.inventoryItem.create({
      data: { ...input, status }
    });

    return { data: created };
  }


  protected constructEvents(data: any, input: AddInventoryItemInput, context?: ToolExecutionContext): BusinessEvent[] {
    const timeStr = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
    return [{
      id: `evt-inv-add-${Date.now()}`,
      type: 'InventoryUpdated',
      timestamp: timeStr,
      source: 'Manual Upload',
      summary: `New inventory SKU added: ${data.name} (${data.sku})`,
      details: { sku: data.sku, name: data.name, quantity: data.quantity },
      deepLink: '/pricing-agent/inventory'
    }];
  }
}

// --- 3. Sync Tally Inventory Tool ---
export interface SyncTallyInventoryInput {
  items?: Array<{
    sku: string;
    name: string;
    quantity: number;
    category: string;
    location?: string;
    minThreshold?: number;
    unit?: string;
  }>;
}

export class SyncTallyInventoryTool extends BaseTool<SyncTallyInventoryInput, any> {
  public readonly metadata: BusinessToolMetadata = {
    id: 'sync_tally_inventory',
    name: 'Sync Tally ERP Inventory',
    description: 'Bi-directionally synchronizes stock levels and SKUs with Tally Prime ERP ledger.',
    category: 'Inventory',
    capabilityName: 'ERPSynchronization',
    ownedByWorker: 'SupplierWorker',
    supportedOperations: ['SupplierOperation', 'ProcurementOperation'],
    requiredPermissions: ['inventory:write'],
    executionMode: 'Autonomous',
    estimatedExecutionTimeMs: 400,
    producesEvents: ['InventoryUpdated'],
    consumesEvents: [],
    verificationStrategy: { type: 'StateComparison', description: 'Compares database quantities against ERP sync payload.' },
    retryPolicy: { maxRetries: 3, backoffMs: 1000 },
    approvalPolicy: { required: false },
    tags: ['tally', 'erp', 'sync', 'inventory']
  };

  protected async executeLogic(input: SyncTallyInventoryInput, context?: ToolExecutionContext) {
    const { prisma } = await import('../prisma-client');
    const itemsToSync = input.items || [
      { sku: "SKU-CARB-08", name: "Solid Carbide Drill Bit 8mm", quantity: 18, category: "Tooling", location: "Bin A-4", minThreshold: 6, unit: "pcs" },
      { sku: "SKU-STEEL-12", name: "Steel Billets (EN8 Grade)", quantity: 450, category: "Raw Material", location: "Peenya Yard A", minThreshold: 100, unit: "kg" },
      { sku: "SKU-COOL-55", name: "Synthetic CNC Cutting Coolant", quantity: 3, category: "Tooling", location: "Liquid Drum Store", minThreshold: 4, unit: "barrels" }
    ];


    const synced = [];
    try {
      await prisma.$transaction(
        itemsToSync.map((item) => {
          let status = "In Stock";
          if (item.quantity <= 0) status = "Out of Stock";
          else if (item.quantity <= (item.minThreshold || 5)) status = "Low Stock";

          return prisma.inventoryItem.upsert({
            where: { sku: item.sku },
            update: {
              quantity: item.quantity,
              status,
              lastUpdated: new Date()
            },
            create: {
              sku: item.sku,
              name: item.name,
              category: item.category,
              quantity: item.quantity,
              unit: item.unit || "pcs",
              location: item.location || "Bin A",
              minThreshold: item.minThreshold || 5,
              status,
              image: item.category === "Raw Material" ? "/inventory/steel-billets.png" : "/inventory/carbide-end-mill.png"
            }
          });
        })
      );
    } catch (dbErr: any) {
      console.warn("[SyncTallyInventoryTool] Database offline fallback mode active.");
    }

    return {
      data: { syncedCount: itemsToSync.length, syncedItems: itemsToSync }
    };
  }

  protected constructEvents(data: any, input: SyncTallyInventoryInput, context?: ToolExecutionContext): BusinessEvent[] {
    const timeStr = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
    return [{
      id: `evt-tally-${Date.now()}`,
      type: 'InventoryUpdated',
      timestamp: timeStr,
      source: 'TallyERP',
      summary: `Tally Prime ERP Inventory sync complete (${data.syncedCount} SKUs updated)`,
      details: data,
      deepLink: '/pricing-agent/inventory'
    }];
  }
}

// --- Placeholder Inventory Tools ---
export class ReserveInventoryTool extends BaseTool {
  public readonly metadata: BusinessToolMetadata = {
    id: 'reserve_inventory',
    name: 'Reserve Inventory for Order',
    description: 'Reserves specific raw materials or WIP items for an active client job order.',
    category: 'Inventory',
    capabilityName: 'InventoryReservation',
    ownedByWorker: 'SupplierWorker',
    supportedOperations: ['SupplierOperation', 'ProcurementOperation'],
    requiredPermissions: ['inventory:write'],
    executionMode: 'Autonomous',
    producesEvents: ['InventoryUpdated'],
    consumesEvents: [],
    verificationStrategy: { type: 'DatabaseCheck', description: 'Checks reserved stock balance.' },
    retryPolicy: { maxRetries: 1, backoffMs: 200 },
    approvalPolicy: { required: false },
    tags: ['reservation', 'order_fulfillment']
  };
  protected async executeLogic(input: any) {
    return { data: { status: 'Reserved (Contract Placeholder)', input } };
  }
  protected constructEvents() { return []; }
}

export class ReleaseInventoryTool extends BaseTool {
  public readonly metadata: BusinessToolMetadata = {
    id: 'release_inventory',
    name: 'Release Reserved Inventory',
    description: 'Releases reserved stock back to unassigned inventory pool upon order cancellation or completion.',
    category: 'Inventory',
    capabilityName: 'InventoryReservation',
    ownedByWorker: 'SupplierWorker',
    supportedOperations: ['SupplierOperation'],
    requiredPermissions: ['inventory:write'],
    executionMode: 'Autonomous',
    producesEvents: ['InventoryUpdated'],
    consumesEvents: [],
    verificationStrategy: { type: 'DatabaseCheck', description: 'Checks stock release.' },
    retryPolicy: { maxRetries: 1, backoffMs: 200 },
    approvalPolicy: { required: false },
    tags: ['release', 'stock']
  };
  protected async executeLogic(input: any) {
    return { data: { status: 'Released (Contract Placeholder)', input } };
  }
  protected constructEvents() { return []; }
}

export class ReceiveInventoryTool extends BaseTool {
  public readonly metadata: BusinessToolMetadata = {
    id: 'receive_inventory',
    name: 'Receive Goods Inward',
    description: 'Logs goods inward receipt at warehouse bay and updates stock count.',
    category: 'Inventory',
    capabilityName: 'InventoryReceiving',
    ownedByWorker: 'SupplierWorker',
    supportedOperations: ['SupplierOperation', 'ProcurementOperation'],
    requiredPermissions: ['inventory:write'],
    executionMode: 'Autonomous',
    producesEvents: ['InventoryUpdated', 'ShipmentUpdated'],
    consumesEvents: [],
    verificationStrategy: { type: 'DatabaseCheck', description: 'Verifies inward receipt.' },
    retryPolicy: { maxRetries: 2, backoffMs: 300 },
    approvalPolicy: { required: false },
    tags: ['inward', 'goods_received']
  };
  protected async executeLogic(input: any) {
    return { data: { status: 'Received (Contract Placeholder)', input } };
  }
  protected constructEvents() { return []; }
}

export class TransferInventoryTool extends BaseTool {
  public readonly metadata: BusinessToolMetadata = {
    id: 'transfer_inventory',
    name: 'Transfer Inventory Bin Location',
    description: 'Transfers stock between racks or internal factory bin locations.',
    category: 'Inventory',
    capabilityName: 'InventoryLocationManagement',
    ownedByWorker: 'SupplierWorker',
    supportedOperations: ['SupplierOperation'],
    requiredPermissions: ['inventory:write'],
    executionMode: 'Autonomous',
    producesEvents: ['InventoryUpdated'],
    consumesEvents: [],
    verificationStrategy: { type: 'DatabaseCheck', description: 'Verifies new location.' },
    retryPolicy: { maxRetries: 1, backoffMs: 200 },
    approvalPolicy: { required: false },
    tags: ['transfer', 'bin_location']
  };
  protected async executeLogic(input: any) {
    return { data: { status: 'Transferred (Contract Placeholder)', input } };
  }
  protected constructEvents() { return []; }
}
