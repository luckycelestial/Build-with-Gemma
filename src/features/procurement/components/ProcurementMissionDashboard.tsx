/**
 * ============================================================================
 * MODULE PURPOSE: Procurement Mission Command Center Dashboard Component
 * RESPONSIBILITIES:
 *  - Orchestrates active procurement missions, timeline feeds, and stage progress.
 *  - Handles API requests to `/api/procurement/missions`.
 * OWNS: Mission state fetching, active mission selection, and action dispatch.
 * SHOULD NOT OWN: Low-level SVG charts or individual stock table rendering.
 * ============================================================================
 */

"use client";

import React, { useState, useEffect } from 'react';
import { Target, RefreshCw, Plus, ShieldCheck, Sparkles } from 'lucide-react';
import { ProcurementMissionEntity } from '../types/mission';
import { ProcurementMissionDetail } from './ProcurementMissionDetail';
import { ProcurementMissionTimeline } from './ProcurementMissionTimeline';

export const ProcurementMissionDashboard: React.FC = () => {
  const [missions, setMissions] = useState<ProcurementMissionEntity[]>([]);
  const [activeMission, setActiveMission] = useState<ProcurementMissionEntity | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchMissions = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/procurement/missions');
      const data = await res.json();
      if (data.success && data.missions.length > 0) {
        setMissions(data.missions);
        setActiveMission(data.missions[0]);
      }
    } catch (e) {
      console.error('[ProcurementMissionDashboard] Fetch error:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMissions();
  }, []);

  const handleSimulateReply = async (missionId: string) => {
    try {
      const res = await fetch(`/api/procurement/missions/${missionId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'receive_quote',
          quoteData: { supplierName: 'Jigani Tooling Labs Ltd', quotedPrice: 4200, leadTimeDays: 2 }
        })
      });
      const data = await res.json();
      if (data.success) {
        fetchMissions();
      }
    } catch (e) {
      console.error('[ProcurementMissionDashboard] Quote reply error:', e);
    }
  };

  const handleApproveAction = async (missionId: string) => {
    try {
      const res = await fetch(`/api/procurement/missions/${missionId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'approve' })
      });
      const data = await res.json();
      if (data.success) {
        fetchMissions();
      }
    } catch (e) {
      console.error('[ProcurementMissionDashboard] Approve error:', e);
    }
  };

  const handleCreateNewMission = async () => {
    try {
      const res = await fetch('/api/procurement/missions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sku: 'TL-DRILL-12',
          itemName: 'Carbide Precision Drill Bits 12mm',
          quantity: 20
        })
      });
      const data = await res.json();
      if (data.success) {
        fetchMissions();
      }
    } catch (e) {
      console.error('[ProcurementMissionDashboard] Create error:', e);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-3xl p-5 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[var(--primary-subtle)] text-[var(--primary)] flex items-center justify-center shadow-xs">
            <Target size={20} />
          </div>
          <div>
            <h2 className="text-base font-black text-[var(--text-primary)] font-display tracking-tight">
              Persistent Procurement Mission Command
            </h2>
            <p className="text-xs text-[var(--text-muted)]">
              End-to-end 17-stage procurement lifecycle (Survives application restarts)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchMissions}
            className="p-2.5 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border-subtle)] text-[var(--text-primary)] hover:bg-[var(--bg-card-hover)] transition-all cursor-pointer"
            title="Refresh Missions"
          >
            <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
          </button>

          <button
            onClick={handleCreateNewMission}
            className="px-4 py-2 bg-[var(--primary)] hover:bg-[var(--primary-dark)] text-white text-xs font-bold rounded-xl transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
          >
            <Plus size={14} />
            <span>Launch New Mission</span>
          </button>
        </div>
      </div>

      {/* Active Mission Selection Pills */}
      {missions.length > 1 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {missions.map(m => (
            <button
              key={m.id}
              onClick={() => setActiveMission(m)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                activeMission?.id === m.id
                  ? 'bg-[var(--primary)] text-white shadow-xs'
                  : 'bg-[var(--bg-card)] text-[var(--text-muted)] border border-[var(--border-subtle)] hover:text-[var(--text-primary)]'
              }`}
            >
              {m.itemName} ({m.progress}%)
            </button>
          ))}
        </div>
      )}

      {/* Active Mission Detail & Stepper */}
      {activeMission && (
        <ProcurementMissionDetail
          mission={activeMission}
          onSimulateReply={handleSimulateReply}
          onApproveAction={handleApproveAction}
        />
      )}

      {/* Timeline Feed */}
      {activeMission && (
        <ProcurementMissionTimeline timeline={activeMission.timeline} />
      )}
    </div>
  );
};
