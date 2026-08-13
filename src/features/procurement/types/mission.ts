/**
 * ============================================================================
 * MODULE PURPOSE: Persistent Procurement Mission Domain Types
 * RESPONSIBILITIES:
 *  - Defines the Procurement Mission lifecycle states.
 *  - Defines MissionParticipant, ProcurementMissionEntity, and SupplyChainNode interfaces.
 * OWNS: MissionStage, ProcurementMissionEntity, MissionParticipant, and MissionMilestone interfaces.
 * SHOULD NOT OWN: State machine execution or database queries.
 * ============================================================================
 */

export type MissionStage =
  | 'MISSION_CREATED'
  | 'RFQ_SENT'
  | 'WAITING_FOR_QUOTES'
  | 'COLLECTING_QUOTES'
  | 'QUOTES_COMPLETE'
  | 'AI_EVALUATION'
  | 'OWNER_APPROVAL'
  | 'WAITING_FOR_SUPPLIER_CONFIRMATION'
  | 'SUPPLIER_CONFIRMED'
  | 'SHIPMENT_TRACKING'
  | 'MISSION_COMPLETED'
  // Legacy alias types for backward compatibility:
  | 'Inventory_Low'
  | 'Mission_Created'
  | 'Mission_Context_Initialized'
  | 'Requirement_Analysis'
  | 'Supplier_Discovery'
  | 'RFQ_Generation'
  | 'RFQ_Dispatch'
  | 'Waiting_for_Quotations'
  | 'Quotation_Comparison'
  | 'Supplier_Recommendation'
  | 'Owner_Approval'
  | 'Purchase_Order'
  | 'Supplier_Acceptance'
  | 'Shipment_Tracking'
  | 'Manufacturing'
  | 'Dispatch'
  | 'Goods_Received'
  | 'Inventory_Updated'
  | 'Supplier_Rating_Updated'
  | 'Mission_Complete';

export interface SupplyChainNode {
  id: number;
  name: string;
  status: 'COMPLETED' | 'ON_TIME' | 'DELAYED' | 'FAILED' | 'PENDING';
  updatedAt?: string;
}

export interface MissionParticipant {
  missionId: string;
  supplierId: string | number;
  supplierName: string;
  phone: string;
  whatsappJid?: string;
  rfqSent: boolean;
  quoteReceived: boolean;
  quoteParsed: boolean;
  selected: boolean;
  confirmed: boolean;
  quoteData?: {
    price: number;
    deliveryDays: number;
    moq: number;
    paymentTerms: string;
    rawMessage: string;
    aiScore?: number;
    reliability?: number;
    weightedScore?: number;
    businessReasoning?: string;
  };
}

export interface MissionContext {
  sku: string;
  itemName: string;
  currentStock: number;
  minThreshold: number;
  quantityNeeded: number;
  targetDeliveryDate: string;
  estimatedSavings: number;
  riskLevel: 'Low' | 'Medium' | 'High' | 'Critical';
  assignedWorker: 'ProcurementWorker';
  selectedSupplierId?: string | number;
  selectedSupplierName?: string;
  selectedPrice?: number;
  selectedLeadTime?: number;
  supplierContact?: string;
  missionParticipants?: MissionParticipant[];
  expectedQuotesCount?: number;
  quotesReceivedCount?: number;
  supplyChainNodes?: SupplyChainNode[];
  currentActiveNodeIndex?: number;
}

export interface MissionMilestone {
  timestamp: string;
  stage: MissionStage;
  text: string;
  actor: string;
}

export interface MissionAuditEntry {
  timestamp: string;
  toolId: string;
  inputPayload: any;
  result: any;
}

export interface ProcurementMissionEntity {
  id: string;
  sku: string;
  itemName: string;
  currentStage: MissionStage;
  status: 'Active' | 'Paused_Approval' | 'Completed' | 'Cancelled';
  progressPercentage: number;
  startedAt: string;
  lastUpdatedAt: string;
  completedAt?: string;
  context: MissionContext;
  milestones: MissionMilestone[];
  auditTrail: MissionAuditEntry[];
}

export const STAGE_PROGRESS_MAP: Record<MissionStage, number> = {
  MISSION_CREATED: 10,
  RFQ_SENT: 30,
  WAITING_FOR_QUOTES: 40,
  COLLECTING_QUOTES: 50,
  QUOTES_COMPLETE: 60,
  AI_EVALUATION: 70,
  OWNER_APPROVAL: 75,
  WAITING_FOR_SUPPLIER_CONFIRMATION: 80,
  SUPPLIER_CONFIRMED: 85,
  SHIPMENT_TRACKING: 90,
  MISSION_COMPLETED: 100,
  // Legacy aliases
  Inventory_Low: 5,
  Mission_Created: 10,
  Mission_Context_Initialized: 15,
  Requirement_Analysis: 20,
  Supplier_Discovery: 30,
  RFQ_Generation: 40,
  RFQ_Dispatch: 50,
  Waiting_for_Quotations: 55,
  Quotation_Comparison: 65,
  Supplier_Recommendation: 70,
  Owner_Approval: 75,
  Purchase_Order: 80,
  Supplier_Acceptance: 85,
  Shipment_Tracking: 90,
  Manufacturing: 92,
  Dispatch: 94,
  Goods_Received: 96,
  Inventory_Updated: 98,
  Supplier_Rating_Updated: 99,
  Mission_Complete: 100
};
