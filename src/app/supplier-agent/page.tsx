"use client";

import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { 
  CheckCircle2, 
  Circle, 
  Wifi, 
  WifiOff, 
  QrCode, 
  UserPlus, 
  Boxes, 
  Send, 
  Sparkles, 
  RefreshCw,
  MessageSquare,
  Award,
  Trash2,
  OctagonX,
  Truck,
  Building2,
  Check,
  RotateCcw
} from 'lucide-react';

export const dynamic = "force-dynamic";

interface SupplierMasterItem {
  id: number;
  name: string;
  contactChannel: string;
  whatsappJid?: string;
  materials: string;
  materialCategory: string;
  reliabilityScore: number;
  reliabilityRating: string;
  avgLeadTime: string;
  completedOrders: number;
  delayedOrders: number;
  currentMissionId?: string | null;
  status: 'Available' | 'In Mission';
}

interface ConversationMessage {
  id: string;
  sender: string;
  direction: 'OUTGOING' | 'INCOMING';
  content: string;
  timestamp: string;
}

export default function RealWhatsAppSupplierAgentPage() {
  // 1. WhatsApp Connection State
  const [waConnected, setWaConnected] = useState<boolean>(false);
  const [waPhone, setWaPhone] = useState<string | null>(null);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string | null>(null);
  const [showQrModal, setShowQrModal] = useState<boolean>(false);
  const [connecting, setConnecting] = useState<boolean>(false);
  const [isCancelling, setIsCancelling] = useState<boolean>(false);

  // 2. Suppliers Master State (Phase 1)
  const [suppliers, setSuppliers] = useState<SupplierMasterItem[]>([]);
  const [newSupplierName, setNewSupplierName] = useState('');
  const [newSupplierPhone, setNewSupplierPhone] = useState('');
  const [newSupplierJid, setNewSupplierJid] = useState('');
  const [newSupplierMaterial, setNewSupplierMaterial] = useState('Stainless Steel');
  const [savingSupplier, setSavingSupplier] = useState(false);
  const [jidInputs, setJidInputs] = useState<Record<number, string>>({});

  // 3. Phase 1 & 2 — Inventory State & Dynamic Required Quantities
  const [inventory, setInventory] = useState({
    stainlessSteel: 5,
    mildSteel: 8,
    copper: 3
  });

  const [ssQty, setSsQty] = useState<number>(15);
  const [msQty, setMsQty] = useState<number>(20);
  const [cuQty, setCuQty] = useState<number>(12);

  // 4. Mission State
  const [activeMission, setActiveMission] = useState<any>(null);
  const [missionStatusText, setMissionStatusText] = useState<string>('No Active Mission');
  const [selectedNodeIndex, setSelectedNodeIndex] = useState<number | null>(null);

  // 5. Live Conversation Stream
  const [messages, setMessages] = useState<ConversationMessage[]>([]);

  // 6. Demo Mode Checklist State
  const [checklist, setChecklist] = useState({
    waConnected: false,
    suppliersConfigured: false,
    rfqSent: false,
    quotesReceived: false,
    aiRecommendationReady: false,
    supplierApproved: false,
    poConfirmationSent: false,
    missionCompleted: false
  });

  // Poll WhatsApp Gateway Status
  const pollWhatsAppStatus = async () => {
    try {
      const res = await fetch('/api/whatsapp/status');
      const data = await res.json();
      if (data.success && data.status) {
        setWaConnected(data.status.connected);
        setWaPhone(data.status.phone);
        
        if (data.status.connected) {
          setChecklist(prev => ({ ...prev, waConnected: true }));
          setShowQrModal(false);
          setQrCodeDataUrl(null);
        } else if (data.status.qr) {
          if (data.status.qr.startsWith('http') || data.status.qr.startsWith('data:')) {
            setQrCodeDataUrl(data.status.qr);
          } else {
            const qrRes = await fetch('/api/whatsapp/qr', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ text: data.status.qr })
            });
            const qrData = await qrRes.json();
            if (qrData.success) {
              setQrCodeDataUrl(qrData.dataUrl);
            }
          }
        }
      }
    } catch (e) {
      console.warn('[Status Poll error]:', e);
    }
  };

  // Poll Saved Supplier Master Table (Phase 1 & 13)
  const fetchSuppliers = async () => {
    try {
      const res = await fetch('/api/suppliers');
      const data = await res.json();
      if (data.success) {
        setSuppliers(data.suppliers);
        if (data.suppliers.length > 0) {
          setChecklist(prev => ({ ...prev, suppliersConfigured: true }));
        }
      }
    } catch (e) {
      console.warn('[Fetch suppliers error]:', e);
    }
  };

  // Poll Active Procurement Mission
  const fetchMissions = async () => {
    try {
      const res = await fetch('/api/procurement/missions');
      const data = await res.json();
      if (data.success && data.missions.length > 0) {
        // Most recent mission is always data.missions[0]
        const current = data.missions[0];

        if (current.status === 'Cancelled' || current.status === 'Completed') {
          setActiveMission(null);
          setMissionStatusText('🟢 No Active Mission — Click Restock to Start One');
          setChecklist(prev => ({
            ...prev,
            rfqSent: false,
            quotesReceived: false,
            aiRecommendationReady: false,
            supplierApproved: false,
            poConfirmationSent: false,
            missionCompleted: false
          }));
          return;
        }

        setActiveMission(current);

        // Update Checklist & Status Text based on mission stage
        if (current.currentStage === 'Waiting_for_Quotations' || current.currentStage === 'WAITING_FOR_QUOTES' || current.currentStage === 'COLLECTING_QUOTES') {
          setMissionStatusText(`🟡 Waiting For ${current.itemName} Supplier Replies on WhatsApp`);
          setChecklist(prev => ({ ...prev, rfqSent: true }));
        } else if (current.currentStage === 'Quotation_Comparison' || current.currentStage === 'Supplier_Recommendation' || current.currentStage === 'AI_EVALUATION') {
          setMissionStatusText('🟢 AI Comparison Table Generated');
          setChecklist(prev => ({ ...prev, quotesReceived: true, aiRecommendationReady: true }));
        } else if (current.currentStage === 'Owner_Approval') {
          setMissionStatusText('🟢 AI Comparison Ready & Awaiting Supplier Selection');
          setChecklist(prev => ({ ...prev, quotesReceived: true, aiRecommendationReady: true }));
        } else if (current.currentStage === 'Purchase_Order' || current.currentStage === 'Supplier_Acceptance' || current.currentStage === 'WAITING_FOR_SUPPLIER_CONFIRMATION') {
          setMissionStatusText('🟢 Waiting For Selected Supplier Confirmation on WhatsApp');
          setChecklist(prev => ({ ...prev, supplierApproved: true, poConfirmationSent: true }));
        } else if (current.currentStage === 'Mission_Complete' || current.currentStage === 'MISSION_COMPLETED' || current.status === 'Completed') {
          setMissionStatusText('✅ Mission Completed & Archived');
          
          // Phase 14: Dynamic Inventory Update based on mission SKU
          if (current.sku === 'RM-SS-SHEET-15') {
            setInventory(prev => ({ ...prev, stainlessSteel: 5 + (current.context?.quantityNeeded || 15) }));
          } else if (current.sku === 'RM-MS-BAR-20') {
            setInventory(prev => ({ ...prev, mildSteel: 8 + (current.context?.quantityNeeded || 20) }));
          } else if (current.sku === 'RM-CU-ROD-08') {
            setInventory(prev => ({ ...prev, copper: 3 + (current.context?.quantityNeeded || 12) }));
          }

          setChecklist(prev => ({
            ...prev,
            rfqSent: true,
            quotesReceived: true,
            aiRecommendationReady: true,
            supplierApproved: true,
            poConfirmationSent: true,
            missionCompleted: true
          }));
        }
      }
    } catch (e) {
      console.warn('[Fetch missions error]:', e);
    }
  };

  // Poll Conversation Panel Stream (Phase 5)
  const fetchConversations = async () => {
    try {
      const res = await fetch('/api/procurement/conversations');
      const data = await res.json();
      if (data.success) {
        setMessages(data.messages);
      }
    } catch (e) {
      console.warn('[Fetch conversations error]:', e);
    }
  };

  useEffect(() => {
    pollWhatsAppStatus();
    fetchSuppliers();
    fetchMissions();
    fetchConversations();

    const interval = setInterval(() => {
      if (typeof document !== 'undefined' && document.hidden) return;
      pollWhatsAppStatus();
      fetchSuppliers();
      fetchMissions();
      fetchConversations();
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  // Connect WhatsApp Button Click
  const handleConnectWhatsApp = async () => {
    setConnecting(true);
    setShowQrModal(true);
    try {
      await fetch('/api/whatsapp/status', { method: 'POST' });
    } catch (e) {
      console.error('[Connect WA error]:', e);
    } finally {
      setConnecting(false);
    }
  };

  // Reset WhatsApp Session & Request Fresh QR Code
  const handleResetSession = async () => {
    setConnecting(true);
    setQrCodeDataUrl(null);
    setShowQrModal(true);
    try {
      await fetch('/api/whatsapp/status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'reset' })
      });
    } catch (e) {
      console.error('[Reset WA error]:', e);
    } finally {
      setConnecting(false);
    }
  };

  // Delete Supplier
  const handleDeleteSupplier = async (supplierId: number) => {
    try {
      const res = await fetch(`/api/suppliers?id=${supplierId}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        fetchSuppliers();
      }
    } catch (e) {
      console.error('[Delete supplier error]:', e);
    }
  };

  // Update Supplier WhatsApp JID (Phase 1 & JID Mapping)
  const handleUpdateJid = async (supplierId: number, jidValue: string) => {
    try {
      const res = await fetch('/api/suppliers', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: supplierId, whatsappJid: jidValue })
      });
      const data = await res.json();
      if (data.success) {
        fetchSuppliers();
      }
    } catch (e) {
      console.error('[Update JID error]:', e);
    }
  };

  // Add Supplier Click (Phase 1)
  const handleSaveSupplier = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSupplierName || !newSupplierPhone) return;

    setSavingSupplier(true);
    try {
      const res = await fetch('/api/suppliers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newSupplierName,
          phone: newSupplierPhone,
          whatsappJid: newSupplierJid,
          material: newSupplierMaterial
        })
      });
      const data = await res.json();
      if (data.success) {
        setNewSupplierName('');
        setNewSupplierPhone('');
        setNewSupplierJid('');
        fetchSuppliers();
      }
    } catch (e) {
      console.error('[Save supplier error]:', e);
    } finally {
      setSavingSupplier(false);
    }
  };

  // Trigger Restock for ANY Material (Phase 1 & 2: Dynamic SKU, Name & Editable Quantity)
  const handleTriggerRestock = async (sku: string, itemName: string, quantity: number) => {
    try {
      const res = await fetch('/api/procurement/trigger', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sku,
          itemName,
          quantity,
          triggerType: 'Manual',
          reason: `Restock ${itemName}`
        })
      });
      const data = await res.json();
      if (data.success) {
        setChecklist(prev => ({
          ...prev,
          rfqSent: true,
          quotesReceived: false,
          aiRecommendationReady: false,
          supplierApproved: false,
          poConfirmationSent: false,
          missionCompleted: false
        }));
        setMissionStatusText(`🟡 Waiting For ${itemName} Supplier Replies on WhatsApp`);
        fetchSuppliers();
        fetchMissions();
        fetchConversations();
      }
    } catch (e) {
      console.error('[Restock error]:', e);
    }
  };

  // Explicit Supplier Selection Click (Phase 9)
  const handleSelectSupplier = async (supplierId: string | number) => {
    if (!activeMission) return;
    try {
      const res = await fetch(`/api/procurement/missions/${activeMission.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'select_supplier', supplierId })
      });
      const data = await res.json();
      if (data.success) {
        fetchMissions();
      }
    } catch (e) {
      console.error('[Select supplier error]:', e);
    }
  };

  // Approve Purchase Order Click (Phase 10 & 11)
  const handleApproveSupplier = async () => {
    if (!activeMission) return;

    try {
      const res = await fetch(`/api/procurement/missions/${activeMission.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'approve' })
      });
      const data = await res.json();
      if (data.success) {
        setChecklist(prev => ({ ...prev, supplierApproved: true, poConfirmationSent: true }));
        fetchMissions();
        fetchConversations();
      }
    } catch (e) {
      console.error('[Approve error]:', e);
    }
  };

  // Node Status Update (Phase 12, 13, 14)
  const handleUpdateNode = async (nodeIndex: number, status: 'ON_TIME' | 'DELAYED' | 'FAILED') => {
    if (!activeMission) return;
    try {
      const res = await fetch(`/api/procurement/missions/${activeMission.id}/node`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nodeIndex, status })
      });
      const data = await res.json();
      if (data.success) {
        setSelectedNodeIndex(null);
        fetchSuppliers();
        fetchMissions();
      }
    } catch (e) {
      console.error('[Update node error]:', e);
    }
  };

  // Stop / Cancel Mission Click
  const handleCancelMission = async () => {
    if (!activeMission || isCancelling) return;
    setIsCancelling(true);
    try {
      const res = await fetch(`/api/procurement/missions/${activeMission.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'cancel' })
      });
      const data = await res.json();
      if (data.success) {
        setActiveMission(null);
        setMissionStatusText('🟢 No Active Mission — Click Restock to Start One');
        setChecklist(prev => ({
          ...prev,
          rfqSent: false,
          quotesReceived: false,
          aiRecommendationReady: false,
          supplierApproved: false,
          poConfirmationSent: false,
          missionCompleted: false
        }));
        await fetchSuppliers();
        await fetchConversations();
      }
    } catch (e) {
      console.error('[Cancel mission error]:', e);
    } finally {
      setIsCancelling(false);
    }
  };

  // Reset Mission Click (clears cancelled/completed mission state to ready)
  const handleResetMission = () => {
    setActiveMission(null);
    setMissionStatusText('🟢 No Active Mission — Click Restock to Start One');
    setChecklist(prev => ({
      ...prev,
      rfqSent: false,
      quotesReceived: false,
      aiRecommendationReady: false,
      supplierApproved: false,
      poConfirmationSent: false,
      missionCompleted: false
    }));
    fetchSuppliers();
    fetchConversations();
  };

  const participants = activeMission?.context?.missionParticipants || [];
  const selectedParticipant = participants.find((p: any) => p.selected);

  return (
    <DashboardLayout activeRoute="/supplier-agent">
      <div className="space-y-6 text-[var(--text-primary)]">
        
        {/* =================================================================== */}
        {/* 1. DEMO MODE CHECKLIST WIDGET                                      */}
        {/* =================================================================== */}
        <div className="bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-3xl p-5 shadow-xs">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles size={16} className="text-amber-500" />
            <h2 className="text-xs font-black uppercase tracking-wider text-[var(--text-primary)] font-display">
              Mission-Driven ERP Procurement Workflow V4 &mdash; Real-Time Checklist
            </h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
            {[
              { label: 'WhatsApp Connected', done: checklist.waConnected },
              { label: 'Suppliers Configured', done: checklist.suppliersConfigured },
              { label: 'RFQ Sent', done: checklist.rfqSent },
              { label: 'Quotes Received', done: checklist.quotesReceived },
              { label: 'AI Comparison Ready', done: checklist.aiRecommendationReady },
              { label: 'Supplier Approved', done: checklist.supplierApproved },
              { label: 'PO Confirmation Sent', done: checklist.poConfirmationSent },
              { label: 'Mission Completed', done: checklist.missionCompleted }
            ].map((item, idx) => (
              <div 
                key={idx} 
                className={`p-2 rounded-xl border text-[10px] font-bold flex items-center gap-1.5 transition-all ${
                  item.done ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' : 'bg-[var(--bg-subtle)] border-[var(--border-subtle)] text-[var(--text-muted)] opacity-60'
                }`}
              >
                {item.done ? <CheckCircle2 size={12} className="text-emerald-500 flex-shrink-0" /> : <Circle size={12} className="flex-shrink-0" />}
                <span className="truncate">{item.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* =================================================================== */}
        {/* 2. WHATSAPP CONNECTION STATUS PANEL                                */}
        {/* =================================================================== */}
        <div className="bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-3xl p-5 shadow-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${
              waConnected ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'
            }`}>
              {waConnected ? <Wifi size={20} /> : <WifiOff size={20} />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black uppercase tracking-wider font-display">
                  WhatsApp Gateway Status:
                </span>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                  waConnected ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-red-500/10 text-red-500 border-red-500/20'
                }`}>
                  {waConnected ? `🟢 Connected (+${waPhone || 'Active'})` : '🔴 Not Connected'}
                </span>
              </div>
              <p className="text-xs text-[var(--text-muted)] mt-0.5">
                {waConnected ? 'Real WhatsApp transport active. Session persisted in whatsapp_session.db' : 'Scan QR code with WhatsApp on your phone to activate real communication daemon.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {waConnected && (
              <button
                onClick={handleResetSession}
                disabled={connecting}
                className="px-3.5 py-2 bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 text-red-400 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center gap-1.5"
                title="Disconnect old session and generate a fresh QR code"
              >
                <QrCode size={14} />
                <span>Scan New QR Code</span>
              </button>
            )}
            <button
              onClick={waConnected ? handleResetSession : handleConnectWhatsApp}
              disabled={connecting}
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center gap-2"
            >
              <QrCode size={14} />
              <span>{connecting ? 'Starting Daemon...' : waConnected ? 'Reconnect / New QR' : 'Connect WhatsApp'}</span>
            </button>
          </div>
        </div>

        {/* QR CODE SCAN MODAL */}
        {showQrModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
            <div className="bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-3xl p-6 max-w-sm w-full shadow-2xl text-center space-y-4">
              <div className="flex justify-between items-center border-b border-[var(--border-subtle)] pb-3">
                <h3 className="text-sm font-bold font-display">Scan QR Code with WhatsApp</h3>
                <button onClick={() => setShowQrModal(false)} className="text-xs text-[var(--text-muted)] hover:text-white">✕</button>
              </div>

              <div className="bg-white p-4 rounded-2xl inline-block shadow-inner">
                {qrCodeDataUrl ? (
                  <img src={qrCodeDataUrl} alt="WhatsApp QR Code" className="w-64 h-64 mx-auto" />
                ) : (
                  <div className="w-64 h-64 flex flex-col items-center justify-center text-gray-500 space-y-2">
                    <RefreshCw size={24} className="animate-spin text-emerald-600" />
                    <span className="text-xs font-bold">Generating Fresh QR Code...</span>
                  </div>
                )}
              </div>

              <div className="text-left text-xs text-[var(--text-muted)] space-y-1 bg-[var(--bg-subtle)] p-3 rounded-xl">
                <p className="font-bold text-[var(--text-primary)]">Instructions:</p>
                <p>1. Open WhatsApp on your phone</p>
                <p>2. Tap Settings &gt; Linked Devices &gt; Link a Device</p>
                <p>3. Point your camera at this QR code</p>
              </div>
            </div>
          </div>
        )}

        {/* =================================================================== */}
        {/* PHASE 1 — SUPPLIER MASTER TABLE                                    */}
        {/* =================================================================== */}
        <div className="bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-3xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-3">
            <div className="flex items-center gap-2">
              <Building2 size={18} className="text-purple-500" />
              <h3 className="text-sm font-bold font-display">Supplier Master Table</h3>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20">
              ERP Master Registry ({suppliers.length} Vendors)
            </span>
          </div>

          {/* Supplier Master Table */}
          <div className="overflow-x-auto rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-subtle)]">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-[var(--border-subtle)] bg-[var(--bg-card)] text-[var(--text-muted)] uppercase tracking-wider text-[10px] font-bold">
                  <th className="py-3 px-4">Supplier</th>
                  <th className="py-3 px-4">Phone Number</th>
                  <th className="py-3 px-4">Material Category</th>
                  <th className="py-3 px-4">WhatsApp JID</th>
                  <th className="py-3 px-4">Reliability</th>
                  <th className="py-3 px-4">Avg Delivery</th>
                  <th className="py-3 px-4">Completed</th>
                  <th className="py-3 px-4">Delayed</th>
                  <th className="py-3 px-4">Active Mission</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-subtle)] font-sans">
                {suppliers.length === 0 ? (
                  <tr>
                    <td colSpan={11} className="py-6 text-center text-[var(--text-muted)]">
                      No suppliers registered. Add a new supplier below.
                    </td>
                  </tr>
                ) : (
                  suppliers.map(s => (
                    <tr key={s.id} className="hover:bg-[var(--bg-card)]/50 transition-all">
                      <td className="py-3 px-4 font-bold text-[var(--text-primary)]">{s.name}</td>
                      <td className="py-3 px-4 font-mono text-emerald-400 font-bold">{s.contactChannel}</td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-400 font-bold text-[10px] border border-blue-500/20">
                          {s.materialCategory || s.materials}
                        </span>
                      </td>
                      {/* WhatsApp JID Editable Cell */}
                      <td className="py-3 px-4 font-mono">
                        <div className="flex items-center gap-1.5">
                          <input
                            type="text"
                            placeholder="e.g. 202516935528474"
                            value={jidInputs[s.id] !== undefined ? jidInputs[s.id] : (s.whatsappJid || '')}
                            onChange={e => setJidInputs({ ...jidInputs, [s.id]: e.target.value })}
                            className="w-36 px-2 py-1 bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-lg text-xs font-mono text-[var(--text-primary)] focus:outline-none focus:border-purple-500"
                          />
                          <button
                            onClick={() => handleUpdateJid(s.id, jidInputs[s.id] !== undefined ? jidInputs[s.id] : (s.whatsappJid || ''))}
                            className="px-2.5 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-[10px] font-bold transition-all cursor-pointer shadow-xs"
                            title="Save WhatsApp JID"
                          >
                            Save
                          </button>
                        </div>
                      </td>
                      <td className="py-3 px-4 font-bold">
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-mono ${
                          s.reliabilityScore >= 90 ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        }`}>
                          {s.reliabilityScore}%
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono text-[var(--text-muted)]">{s.avgLeadTime}</td>
                      <td className="py-3 px-4 font-bold text-emerald-400 font-mono">{s.completedOrders}</td>
                      <td className="py-3 px-4 font-bold text-rose-400 font-mono">{s.delayedOrders}</td>
                      <td className="py-3 px-4 font-mono text-[10px] text-[var(--text-muted)]">
                        {s.currentMissionId || 'None'}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                          s.status === 'In Mission' 
                            ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' 
                            : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                        }`}>
                          {s.status === 'In Mission' ? '🔵 In Mission' : '🟢 Available'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => handleDeleteSupplier(s.id)}
                          className="p-1 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-all cursor-pointer"
                          title="Remove Supplier"
                        >
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Add Supplier Form */}
          <form onSubmit={handleSaveSupplier} className="pt-2 border-t border-[var(--border-subtle)] grid grid-cols-1 sm:grid-cols-5 gap-2">
            <input
              type="text"
              placeholder="Supplier Name (e.g. Srinidhi)"
              value={newSupplierName}
              onChange={e => setNewSupplierName(e.target.value)}
              className="px-3 py-2 bg-[var(--bg-subtle)] border border-[var(--border-subtle)] rounded-xl text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--primary)]"
              required
            />
            <input
              type="text"
              placeholder="Phone (e.g. +919880011223)"
              value={newSupplierPhone}
              onChange={e => setNewSupplierPhone(e.target.value)}
              className="px-3 py-2 bg-[var(--bg-subtle)] border border-[var(--border-subtle)] rounded-xl text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--primary)]"
              required
            />
            <input
              type="text"
              placeholder="WhatsApp JID (e.g. 202516935528474)"
              value={newSupplierJid}
              onChange={e => setNewSupplierJid(e.target.value)}
              className="px-3 py-2 bg-[var(--bg-subtle)] border border-[var(--border-subtle)] rounded-xl text-xs text-[var(--text-primary)] font-mono focus:outline-none focus:border-[var(--primary)]"
            />
            <select
              value={newSupplierMaterial}
              onChange={e => setNewSupplierMaterial(e.target.value)}
              className="px-3 py-2 bg-[var(--bg-subtle)] border border-[var(--border-subtle)] rounded-xl text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--primary)]"
            >
              <option value="Stainless Steel">Stainless Steel</option>
              <option value="Mild Steel">Mild Steel</option>
              <option value="Copper">Copper</option>
              <option value="Tool Steel">Tool Steel</option>
            </select>
            <button
              type="submit"
              disabled={savingSupplier}
              className="py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center justify-center gap-1.5"
            >
              <UserPlus size={14} />
              <span>{savingSupplier ? 'Saving...' : 'Add Master Supplier'}</span>
            </button>
          </form>
        </div>

        {/* =================================================================== */}
        {/* PHASE 1 & 2 — FULLY FUNCTIONAL INVENTORY CARDS & EDITABLE QUANTITIES */}
        {/* =================================================================== */}
        <div className="bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-3xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-3">
            <div className="flex items-center gap-2">
              <Boxes size={18} className="text-[var(--primary)]" />
              <h3 className="text-sm font-bold font-display">Inventory Stock & Restock Controls</h3>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
              3 Independent Materials &amp; Dynamic Quantities
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Card 1: Stainless Steel */}
            <div className="p-4 rounded-2xl bg-[var(--bg-subtle)] border border-[var(--border-subtle)] space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="text-sm font-black font-display text-[var(--text-primary)]">Stainless Steel</h4>
                  <p className="text-[10px] text-[var(--text-muted)] font-mono">SKU: RM-SS-SHEET-15</p>
                </div>
                <span className="px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[10px] font-bold">
                  Low Stock
                </span>
              </div>

              <div className="text-xs text-[var(--text-muted)] space-y-1">
                <p>Current Stock: <strong className="text-[var(--text-primary)] font-mono">{inventory.stainlessSteel} kg</strong></p>
                <p>Minimum Threshold: <strong className="text-[var(--text-primary)] font-mono">10 kg</strong></p>
              </div>

              {/* Editable Required Quantity */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider block">
                  Required Quantity (kg)
                </label>
                <input
                  type="number"
                  min="1"
                  value={ssQty}
                  onChange={e => setSsQty(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full px-3 py-1.5 bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-xl text-xs font-mono font-bold text-[var(--text-primary)] focus:outline-none focus:border-[var(--primary)]"
                />
              </div>

              <button
                onClick={() => handleTriggerRestock('RM-SS-SHEET-15', 'Stainless Steel', ssQty)}
                className="w-full py-2 bg-[var(--primary)] hover:bg-[var(--primary-dark)] text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Send size={13} />
                <span>Restock Stainless Steel ({ssQty}kg)</span>
              </button>
            </div>

            {/* Card 2: Mild Steel */}
            <div className="p-4 rounded-2xl bg-[var(--bg-subtle)] border border-[var(--border-subtle)] space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="text-sm font-black font-display text-[var(--text-primary)]">Mild Steel</h4>
                  <p className="text-[10px] text-[var(--text-muted)] font-mono">SKU: RM-MS-BAR-20</p>
                </div>
                <span className="px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[10px] font-bold">
                  Low Stock
                </span>
              </div>

              <div className="text-xs text-[var(--text-muted)] space-y-1">
                <p>Current Stock: <strong className="text-[var(--text-primary)] font-mono">{inventory.mildSteel} kg</strong></p>
                <p>Minimum Threshold: <strong className="text-[var(--text-primary)] font-mono">15 kg</strong></p>
              </div>

              {/* Editable Required Quantity */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider block">
                  Required Quantity (kg)
                </label>
                <input
                  type="number"
                  min="1"
                  value={msQty}
                  onChange={e => setMsQty(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full px-3 py-1.5 bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-xl text-xs font-mono font-bold text-[var(--text-primary)] focus:outline-none focus:border-[var(--primary)]"
                />
              </div>

              <button
                onClick={() => handleTriggerRestock('RM-MS-BAR-20', 'Mild Steel', msQty)}
                className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Send size={13} />
                <span>Restock Mild Steel ({msQty}kg)</span>
              </button>
            </div>

            {/* Card 3: Copper */}
            <div className="p-4 rounded-2xl bg-[var(--bg-subtle)] border border-[var(--border-subtle)] space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="text-sm font-black font-display text-[var(--text-primary)]">Copper</h4>
                  <p className="text-[10px] text-[var(--text-muted)] font-mono">SKU: RM-CU-ROD-08</p>
                </div>
                <span className="px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[10px] font-bold">
                  Low Stock
                </span>
              </div>

              <div className="text-xs text-[var(--text-muted)] space-y-1">
                <p>Current Stock: <strong className="text-[var(--text-primary)] font-mono">{inventory.copper} kg</strong></p>
                <p>Minimum Threshold: <strong className="text-[var(--text-primary)] font-mono">8 kg</strong></p>
              </div>

              {/* Editable Required Quantity */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider block">
                  Required Quantity (kg)
                </label>
                <input
                  type="number"
                  min="1"
                  value={cuQty}
                  onChange={e => setCuQty(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full px-3 py-1.5 bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-xl text-xs font-mono font-bold text-[var(--text-primary)] focus:outline-none focus:border-[var(--primary)]"
                />
              </div>

              <button
                onClick={() => handleTriggerRestock('RM-CU-ROD-08', 'Copper', cuQty)}
                className="w-full py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Send size={13} />
                <span>Restock Copper ({cuQty}kg)</span>
              </button>
            </div>
          </div>
        </div>

        {/* =================================================================== */}
        {/* 4. CURRENT MISSION STATUS BANNER                                  */}
        {/* =================================================================== */}
        <div className="bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-3xl p-5 shadow-xs">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-[var(--primary-subtle)] text-[var(--primary)] text-[10px] font-bold font-mono">
                  {activeMission?.id || 'No Mission Active'}
                </span>
                <span className="text-xs font-bold text-[var(--text-muted)]">Current Mission Status:</span>
              </div>
              <h3 className="text-base font-black font-display text-[var(--text-primary)] mt-1">
                {missionStatusText}
              </h3>
            </div>
            {activeMission && (
              <div className="flex items-center gap-4">
                <div className="text-right hidden sm:block">
                  <span className="text-xs text-[var(--text-muted)]">Target Material: </span>
                  <strong className="text-xs text-[var(--primary)] font-bold">{activeMission.itemName} ({activeMission.context?.quantityNeeded || 15}kg)</strong>
                </div>
                {activeMission.status !== 'Completed' && activeMission.status !== 'Cancelled' ? (
                  <button
                    onClick={handleCancelMission}
                    disabled={isCancelling}
                    className="px-3 py-1.5 bg-red-500/10 border border-red-500/30 hover:bg-red-500/20 text-red-400 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Stop / Cancel Ongoing Mission"
                  >
                    {isCancelling ? (
                      <RefreshCw size={14} className="animate-spin text-red-400" />
                    ) : (
                      <OctagonX size={14} />
                    )}
                    <span>{isCancelling ? 'Stopping...' : 'Stop Mission'}</span>
                  </button>
                ) : (
                  <button
                    onClick={handleResetMission}
                    className="px-3 py-1.5 bg-[var(--bg-subtle)] border border-[var(--border-subtle)] hover:bg-[var(--bg-card-hover)] text-[var(--text-muted)] rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center gap-1.5"
                    title="Mission is completed or cancelled. Click to reset."
                  >
                    <RotateCcw size={14} />
                    <span>Reset Mission</span>
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* =================================================================== */}
        {/* PHASE 5 — LIVE WHATSAPP STYLE CONVERSATION PANEL                  */}
        {/* =================================================================== */}
        <div className="bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-3xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-3">
            <div className="flex items-center gap-2">
              <MessageSquare size={18} className="text-emerald-500" />
              <h3 className="text-sm font-bold font-display">Procurement WhatsApp Conversation Stream</h3>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
              Filtered Procurement Chats Only
            </span>
          </div>

          <div className="bg-[var(--bg-subtle)] border border-[var(--border-subtle)] rounded-2xl p-4 min-h-56 max-h-80 overflow-y-auto space-y-3 font-sans">
            {messages.length === 0 ? (
              <div className="text-center py-10 text-[var(--text-muted)] text-xs">
                No active procurement messages. Click &quot;Restock&quot; on any material above to initiate RFQ dispatch.
              </div>
            ) : (
              messages.map(msg => (
                <div 
                  key={msg.id} 
                  className={`flex flex-col ${msg.direction === 'OUTGOING' ? 'items-end' : 'items-start'}`}
                >
                  <div className={`max-w-md p-3.5 rounded-2xl shadow-xs text-xs ${
                    msg.direction === 'OUTGOING' 
                      ? 'bg-emerald-700 text-white rounded-tr-none' 
                      : 'bg-blue-600 text-white rounded-tl-none'
                  }`}>
                    <div className="flex items-center justify-between gap-4 border-b border-white/20 pb-1 mb-1 text-[10px] font-bold">
                      <span>{msg.direction === 'OUTGOING' ? '🟢 Procurement AI' : `🔵 ${msg.sender}`}</span>
                      <span>{msg.timestamp}</span>
                    </div>
                    <p className="whitespace-pre-line leading-relaxed font-sans">{msg.content}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* =================================================================== */}
        {/* PHASE 8 & 9 — AI SUPPLIER COMPARISON TABLE & EXPLICIT USER SELECTION */}
        {/* =================================================================== */}
        {activeMission && (
          <div className="bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-3xl p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-3">
              <div className="flex items-center gap-2">
                <Award size={18} className="text-amber-500" />
                <h3 className="text-sm font-bold font-display">Supplier Quotation Comparison Table</h3>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/20">
                Explicit User Selection Required
              </span>
            </div>

            {participants.length === 0 || !participants.some((p: any) => p.quoteReceived) ? (
              <div className="p-6 rounded-2xl bg-[var(--bg-subtle)] border border-[var(--border-subtle)] text-center space-y-2">
                <RefreshCw size={24} className="animate-spin mx-auto text-amber-500" />
                <h4 className="text-sm font-bold text-[var(--text-primary)]">Waiting for Supplier Quotation Replies on WhatsApp...</h4>
                <p className="text-xs text-[var(--text-muted)] max-w-md mx-auto">
                  RFQs dispatched to eligible {activeMission.itemName} suppliers ({participants.map((p: any) => p.supplierName).join(', ')}). Quotes received: {participants.filter((p: any) => p.quoteReceived).length} / {participants.length || 1}. Comparison table activates as soon as the first supplier replies.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="overflow-x-auto rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-subtle)]">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-[var(--border-subtle)] bg-[var(--bg-card)] text-[var(--text-muted)] uppercase tracking-wider text-[10px] font-bold">
                        <th className="py-3 px-4">Supplier</th>
                        <th className="py-3 px-4">Price / kg</th>
                        <th className="py-3 px-4">Delivery Lead Time</th>
                        <th className="py-3 px-4">MOQ</th>
                        <th className="py-3 px-4">Reliability</th>
                        <th className="py-3 px-4">AI Score</th>
                        <th className="py-3 px-4 text-center">Select Winner</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--border-subtle)] font-sans">
                      {participants.map((p: any, pIdx: number) => {
                        const hasQuote = p.quoteReceived;
                        const isSelected = p.selected;
                        const quote = p.quoteData || {};

                        return (
                          <tr 
                            key={pIdx} 
                            className={`transition-all ${
                              isSelected ? 'bg-amber-500/10 border-l-4 border-l-amber-500 font-bold' : hasQuote ? 'hover:bg-[var(--bg-card)]/50' : 'opacity-60 bg-[var(--bg-subtle)]/40'
                            }`}
                          >
                            <td className="py-3.5 px-4 font-bold text-[var(--text-primary)]">
                              <div className="flex items-center gap-2">
                                <span>{p.supplierName}</span>
                                {pIdx === 0 && hasQuote && (
                                  <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-500/20 text-amber-400">
                                    AI Rank #1
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="py-3.5 px-4 font-mono font-bold text-emerald-400">
                              {hasQuote ? `₹${quote.price}/kg` : <span className="text-[var(--text-muted)] italic font-normal text-[11px]">Awaiting reply...</span>}
                            </td>
                            <td className="py-3.5 px-4 font-mono">
                              {hasQuote ? `${quote.deliveryDays} Days` : <span className="text-[var(--text-muted)] italic font-normal">&mdash;</span>}
                            </td>
                            <td className="py-3.5 px-4 font-mono text-[var(--text-muted)]">
                              {hasQuote ? `${quote.moq} kg` : <span className="text-[var(--text-muted)] italic font-normal">&mdash;</span>}
                            </td>
                            <td className="py-3.5 px-4 font-mono text-purple-400 font-bold">
                              {hasQuote ? `${quote.reliability || 92}%` : <span className="text-[var(--text-muted)] italic font-normal">&mdash;</span>}
                            </td>
                            <td className="py-3.5 px-4">
                              {hasQuote ? (
                                <span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 font-mono font-bold text-[11px]">
                                  {quote.aiScore || 94}/100
                                </span>
                              ) : (
                                <span className="text-[var(--text-muted)] italic font-normal text-[10px]">Pending</span>
                              )}
                            </td>
                            <td className="py-3.5 px-4 text-center">
                              <button
                                disabled={!hasQuote}
                                onClick={() => handleSelectSupplier(p.supplierId || p.supplierName)}
                                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 mx-auto ${
                                  !hasQuote
                                    ? 'bg-[var(--bg-card)] border border-[var(--border-subtle)] text-[var(--text-muted)] cursor-not-allowed opacity-50'
                                    : isSelected 
                                    ? 'bg-amber-500 text-black shadow-md cursor-pointer' 
                                    : 'bg-[var(--bg-card)] border border-[var(--border-subtle)] text-[var(--text-muted)] hover:text-white cursor-pointer'
                                }`}
                              >
                                {isSelected ? <Check size={14} /> : <Circle size={14} />}
                                <span>{isSelected ? 'Selected' : 'Select'}</span>
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Approve PO Button - Enabled ONLY when supplier is explicitly selected */}
                {activeMission.currentStage !== 'Mission_Complete' && activeMission.status !== 'Completed' && (
                  <div className="pt-2">
                    <button
                      onClick={handleApproveSupplier}
                      disabled={!selectedParticipant}
                      className={`w-full py-3.5 rounded-2xl text-xs font-black uppercase tracking-wider transition-all shadow-md flex items-center justify-center gap-2 ${
                        selectedParticipant 
                          ? 'bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer animate-pulse' 
                          : 'bg-[var(--bg-subtle)] text-[var(--text-muted)] border border-[var(--border-subtle)] cursor-not-allowed opacity-60'
                      }`}
                    >
                      <CheckCircle2 size={16} />
                      <span>
                        {selectedParticipant 
                          ? `Approve Purchase Order for ${selectedParticipant.supplierName} (Total: ₹${((activeMission.context?.quantityNeeded || 15) * (selectedParticipant.quoteData?.price || 95)).toLocaleString('en-IN')})` 
                          : 'Select a Supplier Above to Enable PO Approval'}
                      </span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* =================================================================== */}
        {/* PHASE 12, 13, 14 — 7 LOGISTICS TRACKING NODES CONTROL               */}
        {/* =================================================================== */}
        {activeMission && (
          <div className="bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-3xl p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-3">
              <div className="flex items-center gap-2">
                <Truck size={18} className="text-blue-500" />
                <h3 className="text-sm font-bold font-display">Supply Chain Logistics Tracker</h3>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                7 Interactive Logistics Nodes
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-[var(--bg-subtle)] border border-[var(--border-subtle)] space-y-4">
              <div className="flex justify-between items-center text-xs">
                <div>
                  <span className="font-bold text-[var(--text-primary)]">{activeMission.itemName}</span>
                  <span className="text-[var(--text-muted)] ml-2">
                    Qty: {activeMission.context?.quantityNeeded || 15}kg • Selected Supplier: <strong>{activeMission.context?.selectedSupplierName || 'Pending Selection'}</strong>
                  </span>
                </div>
                <span className="font-mono text-emerald-400 font-bold">ETA: 2 Days</span>
              </div>

              {/* 7 Tracking Nodes */}
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 text-center pt-2 pb-2">
                {[
                  { id: 1, name: 'Supplier Confirmed' },
                  { id: 2, name: 'Manufacturing' },
                  { id: 3, name: 'Packed' },
                  { id: 4, name: 'Dispatched' },
                  { id: 5, name: 'Warehouse' },
                  { id: 6, name: 'CNC Facility' },
                  { id: 7, name: 'Goods Received' }
                ].map((nodeDef, nIdx) => {
                  const actualNode = activeMission.context?.supplyChainNodes?.[nIdx];
                  const status = actualNode?.status || (nIdx === 0 && (activeMission.currentStage === 'Shipment_Tracking' || activeMission.currentStage === 'SUPPLIER_CONFIRMED') ? 'ON_TIME' : 'PENDING');
                  const isSelected = selectedNodeIndex === nIdx;

                  let badgeColor = 'bg-[var(--bg-card)] text-[var(--text-muted)] border-[var(--border-subtle)]';
                  if (status === 'ON_TIME' || status === 'COMPLETED') {
                    badgeColor = 'bg-emerald-500 text-white border-emerald-500';
                  } else if (status === 'DELAYED') {
                    badgeColor = 'bg-amber-500 text-white border-amber-500';
                  } else if (status === 'FAILED') {
                    badgeColor = 'bg-rose-500 text-white border-rose-500';
                  }

                  return (
                    <div
                      key={nIdx}
                      onClick={() => setSelectedNodeIndex(isSelected ? null : nIdx)}
                      className={`p-2.5 rounded-xl border flex flex-col items-center justify-between gap-1 cursor-pointer transition-all ${badgeColor} ${
                        isSelected ? 'ring-2 ring-blue-500 scale-105 shadow-md' : 'hover:opacity-90'
                      }`}
                    >
                      <span className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center font-bold text-xs">{nIdx + 1}</span>
                      <span className="text-[10px] font-bold block truncate w-full">{nodeDef.name}</span>
                      <span className="text-[9px] font-black uppercase opacity-90">{status}</span>
                    </div>
                  );
                })}
              </div>

              {/* Node Override Control Panel */}
              {selectedNodeIndex !== null && activeMission.status !== 'Completed' && (
                <div className="p-3.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] space-y-2.5 animate-fadeIn">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-[var(--text-primary)]">
                      Update Node #{selectedNodeIndex + 1}: {[ 'Supplier Confirmed', 'Manufacturing', 'Packed', 'Dispatched', 'Warehouse', 'CNC Facility', 'Goods Received' ][selectedNodeIndex]}
                    </span>
                    <span className="text-[10px] text-[var(--text-muted)]">Select delivery status to recalculate supplier reliability rating</span>
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={() => handleUpdateNode(selectedNodeIndex, 'ON_TIME')}
                      className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <CheckCircle2 size={14} />
                      <span>Mark ON-TIME 🟢</span>
                    </button>
                    <button
                      onClick={() => handleUpdateNode(selectedNodeIndex, 'DELAYED')}
                      className="flex-1 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <Sparkles size={14} />
                      <span>Mark DELAYED 🟡</span>
                    </button>
                    <button
                      onClick={() => handleUpdateNode(selectedNodeIndex, 'FAILED')}
                      className="flex-1 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <OctagonX size={14} />
                      <span>Mark FAILED 🔴</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

      </div>
    </DashboardLayout>
  );
}
