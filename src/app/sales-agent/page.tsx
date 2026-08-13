"use client";

import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { 
  Building2, 
  Send, 
  RefreshCw, 
  CheckCircle2, 
  Clock, 
  Plus, 
  Trash2, 
  Check, 
  Edit2, 
  QrCode, 
  DollarSign, 
  ShieldCheck, 
  TrendingUp, 
  OctagonX, 
  RotateCcw,
  PackageCheck,
  MessageSquare,
  FileText,
  FileCheck2,
  Users,
  XCircle,
  Sparkles
} from 'lucide-react';

interface CustomerItem {
  id: number;
  name: string;
  company: string;
  contactChannel: string;
  whatsappJid: string;
  interestedProduct: string;
  status: string;
}

interface SalesMission {
  id: string;
  customerId?: number;
  customerName: string;
  contactChannel: string;
  whatsappJid: string;
  productName: string;
  quantity: number;
  deliveryDate?: string;
  location?: string;
  specialRequirements?: string;
  estimatedValue: number;
  estimatedCost: number;
  estimatedMargin: number;
  marginConfidence?: string;
  businessReason?: string;
  currentStage: string;
  status: string;
  milestones?: Array<{ timestamp: string; stage: string; text: string; actor: string }>;
}

interface SalesOrder {
  id: string;
  orderNumber: string;
  missionId: string;
  customerName: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalValue: number;
  deliveryDate: string;
  location: string;
  status: string;
  createdAt: string;
}

interface ConversationMsg {
  id: string;
  workflowId: string;
  sender: string;
  senderPhone: string;
  direction: 'INCOMING' | 'OUTGOING';
  content: string;
  timestamp: string;
}

export default function SalesAgentPage() {
  const [customers, setCustomers] = useState<CustomerItem[]>([]);
  const [activeMission, setActiveMission] = useState<SalesMission | null>(null);
  const [salesOrders, setSalesOrders] = useState<SalesOrder[]>([]);
  const [messages, setMessages] = useState<ConversationMsg[]>([]);

  // Registration Form State
  const [newCustomerName, setNewCustomerName] = useState('');
  const [newCustomerPhone, setNewCustomerPhone] = useState('');
  const [newCustomerCompany, setNewCustomerCompany] = useState('');
  const [newCustomerProduct, setNewCustomerProduct] = useState('CNC Mounting Bracket (FG-CNC-BRACKET-01)');
  const [newCustomerJid, setNewCustomerJid] = useState('');
  const [savingCustomer, setSavingCustomer] = useState(false);
  const [editingJidId, setEditingJidId] = useState<number | null>(null);
  const [editingJidValue, setEditingJidValue] = useState('');

  // Action Loading States
  const [isApproving, setIsApproving] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [missionStatusText, setMissionStatusText] = useState('🟢 System Ready for Customer Registration');

  // WhatsApp QR Modal State
  const [waConnected, setWaConnected] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const [showQrModal, setShowQrModal] = useState(false);
  const [connecting, setConnecting] = useState(false);

  // Poll WhatsApp Connection Status
  const pollWhatsAppStatus = async () => {
    try {
      const res = await fetch('/api/whatsapp/status');
      const data = await res.json();
      if (data.success && data.status) {
        setWaConnected(Boolean(data.status.connected));
        if (data.status.qr) {
          setQrCodeUrl(data.status.qr);
        } else if (data.status.connected) {
          setQrCodeUrl(null);
          setShowQrModal(false);
        }
      }
    } catch (e) {
      console.warn('[Fetch WA Status error]:', e);
    }
  };

  // Poll Customers
  const fetchCustomers = async () => {
    try {
      const res = await fetch('/api/customers');
      const data = await res.json();
      if (data.success) {
        setCustomers(data.customers);
      }
    } catch (e) {
      console.warn('[Fetch customers error]:', e);
    }
  };

  // Poll Active Sales Missions
  const fetchSalesMissions = async () => {
    try {
      const res = await fetch('/api/sales/missions');
      const data = await res.json();
      if (data.success && data.missions.length > 0) {
        const current = data.missions[0];

        if (current.status === 'Cancelled' || current.status === 'Completed') {
          setActiveMission(null);
          setMissionStatusText('🟢 No Active Mission — Register a Customer to Start Sales Workflow');
          return;
        }

        setActiveMission(current);

        if (current.currentStage === 'Inquiry_Received' || current.currentStage === 'Gathering_Details') {
          setMissionStatusText(`🟡 Automatic Workflow Active for ${current.customerName} — Gathering Details`);
        } else if (current.currentStage === 'Margin_Estimated') {
          setMissionStatusText(`🟢 Margin Estimated (₹${current.estimatedMargin?.toLocaleString('en-IN')}) — Owner Approval Required`);
        } else if (current.currentStage === 'Quotation_Approved' || current.currentStage === 'Quotation_Sent') {
          setMissionStatusText(`🟢 Official Quotation Sent via WhatsApp to ${current.contactChannel} — Awaiting Customer Acceptance`);
        } else if (current.currentStage === 'Order_Confirmed' || current.status === 'Completed') {
          setMissionStatusText('✅ Customer Order Confirmed & CustomerOrderCreated Event Published');
        }
      }
    } catch (e) {
      console.warn('[Fetch sales missions error]:', e);
    }
  };

  // Poll Sales Orders
  const fetchSalesOrders = async () => {
    try {
      const res = await fetch('/api/sales/orders');
      const data = await res.json();
      if (data.success) {
        setSalesOrders(data.orders);
      }
    } catch (e) {
      console.warn('[Fetch sales orders error]:', e);
    }
  };

  // Poll Conversation Stream
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
    fetchCustomers();
    fetchSalesMissions();
    fetchSalesOrders();
    fetchConversations();

    const interval = setInterval(() => {
      if (typeof document !== 'undefined' && document.hidden) return;
      pollWhatsAppStatus();
      fetchCustomers();
      fetchSalesMissions();
      fetchSalesOrders();
      fetchConversations();
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  // Connect WhatsApp
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

  // Customer Registration Submission (AUTOMATIC WORKFLOW TRIGGER)
  const handleSaveCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustomerName || !newCustomerPhone) return;
    setSavingCustomer(true);
    try {
      const res = await fetch('/api/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newCustomerName,
          phone: newCustomerPhone,
          company: newCustomerCompany,
          interestedProduct: 'CNC Mounting Bracket (FG-CNC-BRACKET-01)',
          whatsappJid: newCustomerJid
        })
      });
      const data = await res.json();
      if (data.success) {
        setNewCustomerName('');
        setNewCustomerPhone('');
        setNewCustomerCompany('');
        setNewCustomerJid('');

        setMissionStatusText(`🚀 Customer Registered! Sales Mission '${data.mission.id}' Auto-Started & Intro Sent to ${newCustomerPhone}`);

        await fetchCustomers();
        await fetchSalesMissions();
        await fetchConversations();
      }
    } catch (e) {
      console.error('[Save customer error]:', e);
    } finally {
      setSavingCustomer(false);
    }
  };

  // Inline Update WhatsApp JID
  const handleUpdateJid = async (id: number) => {
    try {
      const res = await fetch('/api/customers', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, whatsappJid: editingJidValue })
      });
      const data = await res.json();
      if (data.success) {
        setEditingJidId(null);
        fetchCustomers();
      }
    } catch (e) {
      console.error('[Update JID error]:', e);
    }
  };

  // Delete Customer
  const handleDeleteCustomer = async (id: number) => {
    try {
      const res = await fetch(`/api/customers?id=${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        fetchCustomers();
      }
    } catch (e) {
      console.error('[Delete customer error]:', e);
    }
  };

  // Approve Quotation & Send via WhatsApp to Phone Number
  const handleApproveQuotation = async () => {
    if (!activeMission || isApproving) return;
    setIsApproving(true);
    try {
      const res = await fetch(`/api/sales/missions/${activeMission.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'approve_quotation' })
      });
      const data = await res.json();
      if (data.success) {
        setMissionStatusText(`🟢 Official Quotation Sent via WhatsApp to ${activeMission.contactChannel}`);
        await fetchSalesMissions();
        await fetchConversations();
      }
    } catch (e) {
      console.error('[Approve quotation error]:', e);
    } finally {
      setIsApproving(false);
    }
  };

  // Reject Quotation
  const handleRejectQuotation = async () => {
    if (!activeMission || isRejecting) return;
    setIsRejecting(true);
    try {
      const res = await fetch(`/api/sales/missions/${activeMission.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'reject' })
      });
      const data = await res.json();
      if (data.success) {
        setActiveMission(null);
        setMissionStatusText('🟢 Quotation Rejected — System Ready for Next Customer Registration');
        await fetchSalesMissions();
      }
    } catch (e) {
      console.error('[Reject quotation error]:', e);
    } finally {
      setIsRejecting(false);
    }
  };

  // Cancel Sales Mission
  const handleCancelMission = async () => {
    if (!activeMission || isCancelling) return;
    setIsCancelling(true);
    try {
      const res = await fetch(`/api/sales/missions/${activeMission.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'cancel' })
      });
      const data = await res.json();
      if (data.success) {
        setActiveMission(null);
        setMissionStatusText('🟢 No Active Mission — Register a Customer to Start Sales Workflow');
        await fetchCustomers();
        await fetchSalesMissions();
      }
    } catch (e) {
      console.error('[Cancel mission error]:', e);
    } finally {
      setIsCancelling(false);
    }
  };

  // Reset Mission View
  const handleResetMission = () => {
    setActiveMission(null);
    setMissionStatusText('🟢 No Active Mission — Register a Customer to Start Sales Workflow');
  };

  return (
    <DashboardLayout activeRoute="/sales-agent">
      <div className="space-y-6 max-w-7xl mx-auto p-4 md:p-6 text-[var(--text-primary)]">
        
        {/* =================================================================== */}
        {/* 1. WHATSAPP STATUS HEADER                                          */}
        {/* =================================================================== */}
        <div className="bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-3xl p-6 shadow-sm">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 bg-purple-500/10 border border-purple-500/30 text-purple-400 rounded-full text-xs font-bold font-mono uppercase tracking-wider">
                  Department: AI Sales Executive
                </span>
                {waConnected ? (
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold flex items-center gap-1">
                    <CheckCircle2 size={12} /> WhatsApp Gateway Connected
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold flex items-center gap-1">
                    <Clock size={12} /> WhatsApp Gateway Connecting...
                  </span>
                )}
              </div>
              <h1 className="text-2xl md:text-3xl font-black font-display text-[var(--text-primary)] mt-2">
                AI Sales Executive (Customer Acquisition & Order Capture)
              </h1>
              <p className="text-sm text-[var(--text-muted)] mt-1">
                Automatic Customer Registration Onboarding ➔ Outgoing to Phone Number ➔ Incoming via WhatsApp JID ➔ Margin Estimation ➔ Order Creation
              </p>
            </div>

            <button
              onClick={handleConnectWhatsApp}
              disabled={connecting}
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-2 cursor-pointer"
            >
              <QrCode size={16} />
              <span>{connecting ? 'Starting Daemon...' : waConnected ? 'WhatsApp Active (Scan Again)' : 'Scan WhatsApp QR'}</span>
            </button>
          </div>
        </div>

        {/* WHATSAPP QR SCAN MODAL */}
        {showQrModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
            <div className="bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-3xl p-6 max-w-sm w-full shadow-2xl text-center space-y-4 relative">
              <div className="flex justify-between items-center border-b border-[var(--border-subtle)] pb-3">
                <h3 className="text-sm font-bold font-display text-[var(--text-primary)] flex items-center gap-2">
                  <QrCode size={16} className="text-emerald-500" />
                  Scan QR Code with WhatsApp
                </h3>
                <button onClick={() => setShowQrModal(false)} className="text-xs text-[var(--text-muted)] hover:text-white font-bold px-2 py-1 bg-[var(--bg-subtle)] rounded-lg">✕</button>
              </div>

              <div className="bg-white p-4 rounded-2xl inline-block shadow-inner">
                {qrCodeUrl ? (
                  <img src={qrCodeUrl} alt="WhatsApp QR Code" className="w-64 h-64 mx-auto" />
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
        {/* 2. CUSTOMER REGISTRATION FORM (AUTOMATIC WORKFLOW TRIGGER)          */}
        {/* =================================================================== */}
        <div className="bg-[var(--bg-card)] border border-purple-500/30 rounded-3xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-bold font-display flex items-center gap-2">
                <Users size={20} className="text-purple-500" />
                Customer Registration Form
              </h2>
              <p className="text-xs text-[var(--text-muted)]">
                Saving customer automatically creates a Sales Mission & dispatches the initial WhatsApp introduction message to their Phone Number
              </p>
            </div>
            <span className="px-2.5 py-1 bg-purple-500/10 border border-purple-500/30 text-purple-400 rounded-full text-[10px] font-bold font-mono">
              Product: FG-CNC-BRACKET-01
            </span>
          </div>

          <form onSubmit={handleSaveCustomer} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-6 gap-3 p-4 bg-[var(--bg-subtle)] rounded-2xl border border-[var(--border-subtle)]">
            <div>
              <label className="text-[10px] font-mono text-[var(--text-muted)] uppercase block mb-1">Customer Name *</label>
              <input
                type="text"
                placeholder="e.g. Apex Engg (Ramesh)"
                value={newCustomerName}
                onChange={e => setNewCustomerName(e.target.value)}
                className="w-full px-3 py-2 bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-xl text-xs focus:outline-hidden focus:border-purple-500 font-medium"
                required
              />
            </div>

            <div>
              <label className="text-[10px] font-mono text-[var(--text-muted)] uppercase block mb-1">Company Name</label>
              <input
                type="text"
                placeholder="e.g. Apex Engg Pvt Ltd"
                value={newCustomerCompany}
                onChange={e => setNewCustomerCompany(e.target.value)}
                className="w-full px-3 py-2 bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-xl text-xs focus:outline-hidden focus:border-purple-500 font-medium"
              />
            </div>

            <div>
              <label className="text-[10px] font-mono text-[var(--text-muted)] uppercase block mb-1">Phone Number (Sending Target) *</label>
              <input
                type="text"
                placeholder="e.g. +919876543210"
                value={newCustomerPhone}
                onChange={e => setNewCustomerPhone(e.target.value)}
                className="w-full px-3 py-2 bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-xl text-xs focus:outline-hidden focus:border-purple-500 font-mono"
                required
              />
            </div>

            <div>
              <label className="text-[10px] font-mono text-[var(--text-muted)] uppercase block mb-1">WhatsApp JID (Incoming Target)</label>
              <input
                type="text"
                placeholder="e.g. 203518742945731"
                value={newCustomerJid}
                onChange={e => setNewCustomerJid(e.target.value)}
                className="w-full px-3 py-2 bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-xl text-xs focus:outline-hidden focus:border-purple-500 font-mono"
              />
            </div>

            <div>
              <label className="text-[10px] font-mono text-[var(--text-muted)] uppercase block mb-1">Interested Product / SKU</label>
              <input
                type="text"
                value={newCustomerProduct}
                onChange={e => setNewCustomerProduct(e.target.value)}
                className="w-full px-3 py-2 bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-xl text-xs focus:outline-hidden focus:border-purple-500 font-medium"
                placeholder="CNC Mounting Bracket (FG-CNC-BRACKET-01)"
              />
            </div>

            <div className="flex items-end">
              <button
                type="submit"
                disabled={savingCustomer}
                className="w-full py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {savingCustomer ? <RefreshCw size={14} className="animate-spin" /> : <Sparkles size={14} />}
                <span>Save Customer & Start Workflow</span>
              </button>
            </div>
          </form>
        </div>

        {/* =================================================================== */}
        {/* 3. CUSTOMER MASTER TABLE                                            */}
        {/* =================================================================== */}
        <div className="bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-3xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold font-display flex items-center gap-2">
              <Building2 size={18} className="text-purple-500" />
              Customer Master Registry
            </h2>
            <span className="text-xs text-[var(--text-muted)] font-mono font-bold">
              {customers.length} Registered Customers
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[var(--border-subtle)] text-[var(--text-muted)] font-mono uppercase text-[10px]">
                  <th className="py-2.5 px-3">ID</th>
                  <th className="py-2.5 px-3">Customer Name</th>
                  <th className="py-2.5 px-3">Company</th>
                  <th className="py-2.5 px-3">Phone (Sending Target)</th>
                  <th className="py-2.5 px-3">WhatsApp JID (Incoming Resolver)</th>
                  <th className="py-2.5 px-3">Interested Product</th>
                  <th className="py-2.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-subtle)]">
                {customers.map(c => (
                  <tr key={c.id} className="hover:bg-[var(--bg-card-hover)] transition-colors">
                    <td className="py-3 px-3 font-mono font-bold text-[var(--text-muted)]">#{c.id}</td>
                    <td className="py-3 px-3 font-bold text-[var(--text-primary)]">{c.name}</td>
                    <td className="py-3 px-3 text-[var(--text-muted)]">{c.company || '—'}</td>
                    <td className="py-3 px-3 font-mono text-[var(--primary)] font-bold">{c.contactChannel}</td>
                    <td className="py-3 px-3 font-mono">
                      {editingJidId === c.id ? (
                        <div className="flex items-center gap-1.5">
                          <input
                            type="text"
                            value={editingJidValue}
                            onChange={e => setEditingJidValue(e.target.value)}
                            className="px-2 py-1 bg-[var(--bg-subtle)] border border-purple-500 rounded-lg text-xs font-mono w-40"
                          />
                          <button onClick={() => handleUpdateJid(c.id)} className="p-1 bg-emerald-500/10 text-emerald-400 rounded-md hover:bg-emerald-500/20">
                            <Check size={14} />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 group cursor-pointer" onClick={() => { setEditingJidId(c.id); setEditingJidValue(c.whatsappJid); }}>
                          <span className="text-emerald-400 font-bold">{c.whatsappJid || 'Click to set JID'}</span>
                          <Edit2 size={12} className="text-[var(--text-muted)] opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-3 text-[var(--text-primary)] font-medium">CNC Mounting Bracket (FG-CNC-BRACKET-01)</td>
                    <td className="py-3 px-3 text-right">
                      <button onClick={() => handleDeleteCustomer(c.id)} className="p-1.5 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors" title="Delete Customer">
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* =================================================================== */}
        {/* 4. ACTIVE SALES MISSION BANNER                                      */}
        {/* =================================================================== */}
        <div className="bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-3xl p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-purple-500/10 text-purple-400 text-[10px] font-bold font-mono">
                  {activeMission?.id || 'No Active Mission'}
                </span>
                <span className="text-xs font-bold text-[var(--text-muted)]">Sales Mission Workflow Status:</span>
              </div>
              <h3 className="text-base font-black font-display text-[var(--text-primary)] mt-1">
                {missionStatusText}
              </h3>
            </div>
            {activeMission && (
              <div className="flex items-center gap-4">
                <div className="text-right hidden sm:block">
                  <span className="text-xs text-[var(--text-muted)]">Customer Phone Target: </span>
                  <strong className="text-xs text-[var(--primary)] font-mono font-bold">{activeMission.contactChannel}</strong>
                </div>
                {activeMission.status !== 'Completed' && activeMission.status !== 'Cancelled' ? (
                  <button
                    onClick={handleCancelMission}
                    disabled={isCancelling}
                    className="px-3 py-1.5 bg-red-500/10 border border-red-500/30 hover:bg-red-500/20 text-red-400 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                  >
                    {isCancelling ? <RefreshCw size={14} className="animate-spin text-red-400" /> : <OctagonX size={14} />}
                    <span>{isCancelling ? 'Stopping...' : 'Stop Mission'}</span>
                  </button>
                ) : (
                  <button
                    onClick={handleResetMission}
                    className="px-3 py-1.5 bg-[var(--bg-subtle)] border border-[var(--border-subtle)] hover:bg-[var(--bg-card-hover)] text-[var(--text-muted)] rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center gap-1.5"
                  >
                    <RotateCcw size={14} />
                    <span>Reset Mission View</span>
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* =================================================================== */}
        {/* 5. LIVE WHATSAPP CONVERSATION STREAM                                */}
        {/* =================================================================== */}
        <div className="bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-3xl p-6 shadow-sm flex flex-col h-[400px]">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-[var(--border-subtle)]">
            <h3 className="text-base font-bold font-display flex items-center gap-2">
              <MessageSquare size={18} className="text-emerald-500" />
              Live WhatsApp Conversation Stream
            </h3>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono text-[var(--text-muted)]">Outgoing: Phone Number | Incoming: WhatsApp JID</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto space-y-3 pr-2">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-[var(--text-muted)]">
                <MessageSquare size={32} className="opacity-30 mb-2" />
                <p className="text-xs">No active WhatsApp messages in stream.</p>
                <p className="text-[10px] mt-1">Register a customer to auto-send the initial introduction message.</p>
              </div>
            ) : (
              messages.map(m => (
                <div key={m.id} className={`flex flex-col ${m.direction === 'OUTGOING' ? 'items-end' : 'items-start'}`}>
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="text-[10px] font-bold text-[var(--text-muted)]">{m.sender}</span>
                    <span className="text-[9px] font-mono text-[var(--text-muted)]">{m.timestamp}</span>
                  </div>
                  <div className={`p-3 rounded-2xl max-w-[85%] text-xs leading-relaxed whitespace-pre-wrap ${
                    m.direction === 'OUTGOING' 
                      ? 'bg-purple-600 text-white rounded-tr-none' 
                      : 'bg-[var(--bg-subtle)] border border-[var(--border-subtle)] text-[var(--text-primary)] rounded-tl-none'
                  }`}>
                    {m.content}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* =================================================================== */}
        {/* 6. MARGIN ESTIMATION & OWNER APPROVAL CARD                          */}
        {/* =================================================================== */}
        {activeMission && (activeMission.estimatedValue > 0 || activeMission.quantity > 0) && (
          <div className="bg-[var(--bg-card)] border border-purple-500/40 rounded-3xl p-6 shadow-lg relative overflow-hidden">
            <div className="absolute top-0 right-0 w-40 h-40 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
            
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
              <div className="space-y-3 flex-1">
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-400 text-xs font-bold font-mono">
                    Margin Confidence: {activeMission.marginConfidence || 'High (96%)'}
                  </span>
                  <span className="text-xs font-bold text-[var(--text-muted)]">
                    Current Stage: <strong className="text-[var(--text-primary)]">{activeMission.currentStage}</strong>
                  </span>
                </div>

                <h3 className="text-xl font-black font-display text-[var(--text-primary)]">
                  Quotation Draft & Owner Approval Card: {activeMission.productName}
                </h3>

                <p className="text-xs text-[var(--text-muted)]">
                  {activeMission.businessReason || 'Calculated based on standard MSME precision CNC machining margin benchmark.'}
                </p>

                {/* Estimation Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-2">
                  <div className="p-3 bg-[var(--bg-subtle)] rounded-2xl border border-[var(--border-subtle)]">
                    <span className="text-[10px] text-[var(--text-muted)] font-mono uppercase block">Customer</span>
                    <p className="text-xs font-bold text-[var(--text-primary)] truncate mt-0.5">{activeMission.customerName}</p>
                  </div>

                  <div className="p-3 bg-[var(--bg-subtle)] rounded-2xl border border-[var(--border-subtle)]">
                    <span className="text-[10px] text-[var(--text-muted)] font-mono uppercase block">Material / Qty</span>
                    <p className="text-xs font-bold text-[var(--primary)] font-mono mt-0.5">
                      {activeMission.specialRequirements || 'Stainless Steel'} ({activeMission.quantity} pcs)
                    </p>
                  </div>

                  <div className="p-3 bg-[var(--bg-subtle)] rounded-2xl border border-[var(--border-subtle)]">
                    <span className="text-[10px] text-[var(--text-muted)] font-mono uppercase block">Est. Mfg Cost</span>
                    <p className="text-xs font-bold font-mono text-[var(--text-muted)] mt-0.5">
                      ₹{activeMission.estimatedCost?.toLocaleString('en-IN')}
                    </p>
                  </div>

                  <div className="p-3 bg-[var(--bg-subtle)] rounded-2xl border border-[var(--border-subtle)]">
                    <span className="text-[10px] text-[var(--text-muted)] font-mono uppercase block">Selling Price</span>
                    <p className="text-xs font-bold font-mono text-purple-400 mt-0.5">
                      ₹{activeMission.estimatedValue?.toLocaleString('en-IN')}
                    </p>
                  </div>

                  <div className="p-3 bg-emerald-500/10 rounded-2xl border border-emerald-500/30">
                    <span className="text-[10px] text-emerald-400 font-mono uppercase font-bold block">Expected Profit / Margin</span>
                    <p className="text-xs font-black font-mono text-emerald-400 mt-0.5">
                      ₹{activeMission.estimatedMargin?.toLocaleString('en-IN')} (33.3%)
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row lg:flex-col gap-3 min-w-[220px]">
                {activeMission.currentStage !== 'Quotation_Sent' && activeMission.currentStage !== 'Order_Confirmed' ? (
                  <>
                    <button
                      onClick={handleApproveQuotation}
                      disabled={isApproving}
                      className="w-full px-5 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-2xl font-bold text-xs transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      {isApproving ? <RefreshCw size={16} className="animate-spin" /> : <FileCheck2 size={16} />}
                      <span>Approve & Send Quotation</span>
                    </button>

                    <button
                      onClick={handleRejectQuotation}
                      disabled={isRejecting}
                      className="w-full px-5 py-2.5 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 rounded-2xl font-bold text-xs transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      {isRejecting ? <RefreshCw size={14} className="animate-spin" /> : <XCircle size={14} />}
                      <span>Reject Quotation</span>
                    </button>
                  </>
                ) : (
                  <div className="px-4 py-3 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-emerald-400 text-xs font-bold flex items-center gap-2">
                    <CheckCircle2 size={16} />
                    <span>Quotation Sent to {activeMission.contactChannel}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* =================================================================== */}
        {/* 7. SALES MISSION TIMELINE AUDIT STREAM                              */}
        {/* =================================================================== */}
        {activeMission && activeMission.milestones && activeMission.milestones.length > 0 && (
          <div className="bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-3xl p-6 shadow-sm">
            <h3 className="text-base font-bold font-display flex items-center gap-2 mb-4">
              <Clock size={18} className="text-purple-500" />
              Sales Mission Audit Timeline
            </h3>

            <div className="space-y-4 relative pl-6 border-l-2 border-[var(--border-subtle)] ml-2">
              {activeMission.milestones.map((m, idx) => (
                <div key={idx} className="relative group">
                  <div className="absolute -left-[31px] top-1.5 w-4 h-4 rounded-full bg-purple-600 border-4 border-[var(--bg-card)] shadow-xs" />
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono text-[var(--text-muted)]">{m.timestamp}</span>
                    <span className="px-2 py-0.5 rounded-md bg-[var(--bg-subtle)] text-[var(--text-muted)] text-[10px] font-bold font-mono">
                      {m.stage}
                    </span>
                    <span className="text-[10px] text-purple-400 font-bold">Actor: {m.actor}</span>
                  </div>
                  <p className="text-xs text-[var(--text-primary)] font-medium mt-1">
                    {m.text}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* =================================================================== */}
        {/* 8. CONFIRMED CUSTOMER ORDERS TABLE                                  */}
        {/* =================================================================== */}
        <div className="bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-3xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-[var(--border-subtle)]">
            <h3 className="text-base font-bold font-display flex items-center gap-2">
              <PackageCheck size={18} className="text-emerald-500" />
              Confirmed Customer Orders
            </h3>
            <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full font-bold">
              {salesOrders.length} Confirmed Orders
            </span>
          </div>

          <div className="overflow-x-auto">
            {salesOrders.length === 0 ? (
              <div className="py-8 text-center text-[var(--text-muted)]">
                <FileText size={32} className="opacity-30 mx-auto mb-2" />
                <p className="text-xs">No confirmed customer orders logged yet.</p>
                <p className="text-[10px] mt-1">When customers reply CONFIRMED over WhatsApp, orders will be persisted here.</p>
              </div>
            ) : (
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[var(--border-subtle)] text-[var(--text-muted)] font-mono uppercase text-[10px]">
                    <th className="py-2.5 px-3">Order Number</th>
                    <th className="py-2.5 px-3">Customer Name</th>
                    <th className="py-2.5 px-3">Product Name</th>
                    <th className="py-2.5 px-3">Quantity</th>
                    <th className="py-2.5 px-3">Unit Price</th>
                    <th className="py-2.5 px-3">Total Value</th>
                    <th className="py-2.5 px-3">Delivery Timeframe</th>
                    <th className="py-2.5 px-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border-subtle)]">
                  {salesOrders.map(o => (
                    <tr key={o.id} className="hover:bg-[var(--bg-card-hover)] transition-colors">
                      <td className="py-3 px-3 font-mono font-bold text-purple-400">{o.orderNumber}</td>
                      <td className="py-3 px-3 font-bold text-[var(--text-primary)]">{o.customerName}</td>
                      <td className="py-3 px-3 text-[var(--text-muted)]">{o.productName}</td>
                      <td className="py-3 px-3 font-mono">{o.quantity} pcs</td>
                      <td className="py-3 px-3 font-mono">₹{o.unitPrice}</td>
                      <td className="py-3 px-3 font-mono font-bold text-emerald-400">₹{o.totalValue.toLocaleString('en-IN')}</td>
                      <td className="py-3 px-3 text-[var(--text-muted)]">{o.deliveryDate}</td>
                      <td className="py-3 px-3">
                        <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-bold">
                          {o.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

      </div>
    </DashboardLayout>
  );
}
