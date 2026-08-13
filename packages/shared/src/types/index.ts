/**
 * Shared ERP Domain Types
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
  | 'MISSION_COMPLETED';

export interface SupplyChainNode {
  id: number;
  name: string;
  status: 'COMPLETED' | 'ON_TIME' | 'DELAYED' | 'FAILED' | 'PENDING';
  updatedAt?: string;
  note?: string;
}

export interface MissionParticipant {
  id: string;
  missionId: string;
  supplierId: number;
  supplierName: string;
  whatsappJid: string;
  rfqStatus: 'PENDING' | 'SENT' | 'FAILED';
  rfqSentAt?: string;
  rfqMessageId?: string;
  quoteStatus: 'PENDING' | 'RECEIVED' | 'DECLINED';
  quoteReceivedAt?: string;
  quotedPrice?: number;
  leadTimeDays?: number;
  paymentTerms?: string;
  notes?: string;
}

export interface AgentContext {
  id: string;
  agentName: string;
  status: 'active' | 'idle' | 'paused' | 'error';
  lastRunTimestamp: string;
  metadata?: Record<string, unknown>;
}
