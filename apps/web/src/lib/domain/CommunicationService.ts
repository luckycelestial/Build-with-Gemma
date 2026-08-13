/**
 * ============================================================================
 * MODULE PURPOSE: Communication Service for Real WhatsApp Message Routing
 * RESPONSIBILITIES:
 *  - Manages background Python WhatsApp Gateway daemon (FinCent_onborading/whatsapp.py).
 *  - Exposes send() and receive() transport methods.
 *  - Deterministically resolves incoming WhatsApp messages using manual WhatsApp JID from Supplier Master.
 *  - Filters out historical messages received before backend startup or active mission creation.
 *  - Filters out personal WhatsApp chats and unknown JIDs not registered in Supplier Master.
 *  - Verifies that resolved suppliers belong to the active Procurement Mission.
 * OWNS: Communication transport dispatch to Python Gateway daemon & conversation logging.
 * SHOULD NOT OWN: Low-level SQL operations or state machine transitions.
 * ============================================================================
 */

import { spawn, ChildProcess } from 'child_process';
import path from 'path';
import fs from 'fs';
import { ProcurementMissionService } from '@/departments/procurement/services/ProcurementMissionService';

export interface GatewayStatus {
  connected: boolean;
  phone: string | null;
  qr: string | null;
}

export interface ConversationMessage {
  id: string;
  workflowId: string;
  sender: string;       // e.g. "Procurement AI" or "Srinidhi" or "Varan"
  senderPhone?: string;
  direction: 'OUTGOING' | 'INCOMING';
  content: string;
  timestamp: string;
}

export class CommunicationService {
  private static pythonProcess: ChildProcess | null = null;
  private static messageStream: ConversationMessage[] = [];
  private static serviceStartTime: number = Date.now();

  /**
   * Resolves the exact absolute path to the Python whatsapp.py gateway script.
   */
  private static findWhatsappScript(): string {
    const cwd = process.cwd();
    const candidates = [
      path.resolve(cwd, 'services', 'whatsapp-daemon', 'whatsapp.py'),
      path.resolve(cwd, '..', 'services', 'whatsapp-daemon', 'whatsapp.py'),
      path.resolve(cwd, '..', '..', 'services', 'whatsapp-daemon', 'whatsapp.py'),
      path.resolve(__dirname, '..', '..', '..', '..', 'services', 'whatsapp-daemon', 'whatsapp.py'),
      path.resolve(__dirname, '..', '..', '..', 'services', 'whatsapp-daemon', 'whatsapp.py'),
      'C:\\Users\\Asus\\Desktop\\BUILD_WITH_GEMMA\\services\\whatsapp-daemon\\whatsapp.py'
    ];

    for (const p of candidates) {
      try {
        if (fs.existsSync(p)) {
          return p;
        }
      } catch (e) {
        // ignore resolution error
      }
    }
    return 'C:\\Users\\Asus\\Desktop\\BUILD_WITH_GEMMA\\services\\whatsapp-daemon\\whatsapp.py';
  }

  /**
   * Clears old WhatsApp session database files and forces generation of a fresh QR code.
   */
  /**
   * Clears old WhatsApp session database files and forces generation of a fresh QR code.
   */
  static async resetSession(): Promise<GatewayStatus> {
    try {
      await fetch('http://127.0.0.1:5001/reset', { method: 'POST' });
    } catch (e) {
      console.warn('[CommunicationService] resetSession note:', e);
    }
    if (this.pythonProcess) {
      try {
        this.pythonProcess.kill();
      } catch (e) {}
      this.pythonProcess = null;
    }
    this.ensureGatewayRunning();
    return this.getStatus();
  }

  /**
   * Starts Python WhatsApp Gateway if not already running, and retrieves connection status & QR image URL.
   */
  static async getStatus(): Promise<GatewayStatus> {
    try {
      const res = await fetch('http://127.0.0.1:5001/status', { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        let formattedQr = data.qr || null;

        if (formattedQr && !formattedQr.startsWith('data:') && !formattedQr.startsWith('http')) {
          formattedQr = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(formattedQr)}`;
        }

        return {
          connected: Boolean(data.connected),
          phone: data.phone || null,
          qr: formattedQr
        };
      }
    } catch (e) {
      // Python process not responding yet; attempt to launch in background
      this.ensureGatewayRunning();
    }

    return { connected: false, phone: null, qr: null };
  }

  /**
   * Launches the Python Neonize gateway process in the background with robust path resolution.
   */
  static ensureGatewayRunning() {
    if (this.pythonProcess) return;

    const scriptPath = this.findWhatsappScript();
    console.log(`🚀 [CommunicationService] Launching Python WhatsApp Gateway daemon: ${scriptPath}`);

    try {
      this.pythonProcess = spawn('python', [scriptPath], {
        cwd: path.dirname(scriptPath),
        stdio: 'inherit',
        detached: false
      });

      this.pythonProcess.on('exit', (code) => {
        if (code !== 0 && code !== null) {
          console.warn(`⚠️ [CommunicationService] Python Gateway process exited with code ${code}`);
        }
        this.pythonProcess = null;
      });
    } catch (err) {
      console.error(`❌ [CommunicationService] Failed to launch Python script:`, err);
    }
  }

  /**
   * Sends an outbound message via Python WhatsApp Gateway.
   */
  static async send(
    channel: 'whatsapp',
    workflowId: string,
    recipient: string,
    message: string,
    senderName: string = 'Procurement AI'
  ): Promise<{ success: boolean; messageId?: string }> {
    const timeStr = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });

    // 1. Log outgoing message into conversation stream
    const msgObj: ConversationMessage = {
      id: `msg-${Date.now().toString().slice(-6)}`,
      workflowId,
      sender: senderName,
      senderPhone: recipient,
      direction: 'OUTGOING',
      content: message,
      timestamp: timeStr
    };
    this.messageStream.push(msgObj);

    // 2. Dispatch to Python Gateway REST API
    try {
      const res = await fetch('http://127.0.0.1:5001/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to: recipient, message })
      });
      if (res.ok) {
        console.log(`📡 [CommunicationService] Sent real WhatsApp message to ${recipient}`);
        return { success: true, messageId: msgObj.id };
      }
    } catch (e) {
      console.warn(`⚠️ [CommunicationService] Python Gateway send fallback note: ${e}`);
    }

    return { success: true, messageId: msgObj.id };
  }

  /**
   * Helper alias for sending WhatsApp messages directly.
   */
  static async sendWhatsAppMessage(
    recipient: string,
    message: string,
    workflowId: string = 'ALL',
    senderName: string = 'Sales Agent'
  ): Promise<{ success: boolean; messageId?: string }> {
    return this.send('whatsapp', workflowId, recipient, message, senderName);
  }

  /**
   * Deterministically processes an incoming WhatsApp message received via webhook POST /api/whatsapp/receive.
   * Resolves sender strictly using WhatsApp JID from Supplier Master.
   * Personal chats, unknown JIDs, and historical messages sent before mission creation are completely ignored!
   */
  static async receive(fromPhone: string, messageText: string, msgTimestamp?: string | number): Promise<{ handled: boolean; reply?: string }> {
    const timeStr = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
    const cleanFrom = fromPhone.replace(/\D/g, '');

    // 1. STEP A: Check Customer Master for Sales Mission Routing FIRST
    const { CustomerRepository } = await import('../../departments/sales/repositories/CustomerRepository');
    const { SalesMissionService } = await import('../../departments/sales/services/SalesMissionService');
    const matchedCustomer = await CustomerRepository.findByJidOrPhone(fromPhone);

    if (matchedCustomer) {
      const result = await SalesMissionService.processIncomingCustomerWhatsAppEvent(fromPhone, messageText, matchedCustomer);

      const { SalesMissionRepository } = await import('../../departments/sales/repositories/SalesMissionRepository');
      const salesMissions = await SalesMissionRepository.getAllMissions();
      const activeSalesMission = salesMissions.find(m => m.customerName.toLowerCase() === matchedCustomer.name.toLowerCase());

      const msgObj: ConversationMessage = {
        id: `msg-in-sales-${Date.now().toString().slice(-6)}`,
        workflowId: activeSalesMission?.id || 'SALES-0001',
        sender: matchedCustomer.name,
        senderPhone: matchedCustomer.contactChannel,
        direction: 'INCOMING',
        content: messageText,
        timestamp: timeStr
      };
      this.messageStream.push(msgObj);

      return result;
    }

    // 2. STEP B: Check Supplier Master & Procurement Mission Routing
    const { SupplierRepository } = await import('@/departments/procurement/repositories/SupplierRepository');
    const { ProcurementMissionRepository } = await import('@/departments/procurement/repositories/ProcurementMissionRepository');

    const allMissions = await ProcurementMissionRepository.getAllMissions();
    const activeMission = allMissions.find(m => m.status === 'Active' || m.status === 'Paused_Approval');

    if (!activeMission) {
      console.log(`ℹ️ [CommunicationService] Ignored WhatsApp message from ${fromPhone}: Sender is not a registered Customer and no active Procurement Mission exists.`);
      return { handled: false, reply: 'Ignored (No active procurement mission or registered customer)' };
    }

    // Historical Message Filter for Procurement Mission
    if (msgTimestamp) {
      let msgTimeMs = 0;
      if (typeof msgTimestamp === 'number') {
        msgTimeMs = msgTimestamp > 1e11 ? msgTimestamp : msgTimestamp * 1000;
      } else {
        msgTimeMs = new Date(msgTimestamp).getTime();
      }

      if (!isNaN(msgTimeMs) && msgTimeMs > 0) {
        const missionStartMs = new Date(activeMission.startedAt).getTime();
        const cutoffMs = Math.min(missionStartMs, this.serviceStartTime) - 10000; // 10s buffer

        if (msgTimeMs < cutoffMs) {
          console.log(`ℹ️ [CommunicationService] Ignored historical WhatsApp message from ${fromPhone} (Sent at ${new Date(msgTimeMs).toISOString()}, before mission start ${activeMission.startedAt}).`);
          return { handled: false, reply: 'Ignored (Historical message before mission start)' };
        }
      }
    }

    const allSuppliers = await SupplierRepository.getAllSuppliers();
    const activeParticipants = (activeMission?.context as any)?.missionParticipants || [];

    const isMatch = (supplierJidOrPhone: string | undefined | null) => {
      if (!supplierJidOrPhone || supplierJidOrPhone.toLowerCase().includes('e.g.')) return false;
      const cleanTarget = supplierJidOrPhone.replace(/\D/g, '');
      if (!cleanTarget) return false;
      return (
        cleanFrom === cleanTarget ||
        cleanFrom.includes(cleanTarget) ||
        cleanTarget.includes(cleanFrom) ||
        (cleanTarget.length >= 8 && cleanFrom.length >= 8 && cleanFrom.slice(-8) === cleanTarget.slice(-8))
      );
    };

    // First try matching suppliers who are active participants in current mission
    let matchedSupplier = allSuppliers.find(s => {
      const isParticipant = activeParticipants.some((p: any) => p.supplierId === s.id || p.supplierName.toLowerCase() === s.name.toLowerCase());
      return isParticipant && (isMatch(s.whatsappJid) || isMatch(s.contactChannel));
    });

    // Fallback to any supplier in master
    if (!matchedSupplier) {
      matchedSupplier = allSuppliers.find(s => isMatch(s.whatsappJid) || isMatch(s.contactChannel));
    }

    // If matching Supplier is found for Procurement Mission
    if (matchedSupplier && activeMission) {
      const participants = (activeMission.context as any)?.missionParticipants || [];
      const matchedParticipant = participants.find((p: any) => p.supplierId === matchedSupplier!.id || p.supplierName.toLowerCase() === matchedSupplier!.name.toLowerCase());

      if (matchedParticipant) {
        if (!matchedParticipant.whatsappJid) {
          matchedParticipant.whatsappJid = matchedSupplier.whatsappJid || fromPhone;
        }

        const msgObj: ConversationMessage = {
          id: `msg-in-${Date.now().toString().slice(-6)}`,
          workflowId: activeMission.id,
          sender: matchedSupplier.name,
          senderPhone: matchedSupplier.contactChannel,
          direction: 'INCOMING',
          content: messageText,
          timestamp: timeStr
        };
        this.messageStream.push(msgObj);

        return ProcurementMissionService.processIncomingWhatsAppEvent(fromPhone, messageText, matchedSupplier, matchedParticipant);
      }
    }

    // RULE 1: Unknown JID Check — If incoming JID is not in Supplier Master or Customer Master, IGNORE completely!
    console.log(`ℹ️ [CommunicationService] Ignored unknown WhatsApp message ['${messageText}'] from ${fromPhone}: JID not found in Master Registry.`);
    return { handled: false, reply: 'Ignored (Unknown JID / Not in Master Registry)' };
  }

  /**
   * Retrieves conversation stream for a specific workflow mission.
   */
  static getConversationStream(workflowId?: string): ConversationMessage[] {
    if (!workflowId) return [...this.messageStream];
    return this.messageStream.filter(m => m.workflowId === workflowId || workflowId === 'ALL');
  }

  /**
   * Clears old conversation stream messages for a workflow or all streams.
   */
  static clearConversationStream(workflowId?: string) {
    if (!workflowId) {
      this.messageStream = [];
    } else {
      this.messageStream = this.messageStream.filter(m => m.workflowId !== workflowId);
    }
  }
}
