"use client";

import { useState, useEffect } from "react";
import { LuTruck, LuSparkles, LuCheck, LuShieldAlert } from "react-icons/lu";
import { getShipments, updateShipmentStepStatus } from "@/app/pricing-agent/actions";

export default function SupplyChainTracker() {
  const [shipments, setShipments] = useState<any[]>([]);
  const [selectedStep, setSelectedStep] = useState<{ shipmentId: number; sequence: number } | null>(null);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchShipments();
  }, []);

  const fetchShipments = () => {
    setLoading(true);
    setError(null);
    getShipments()
      .then((data) => {
        setShipments(data);
        setLoading(false);
      })
      .catch((err: any) => {
        console.error(err);
        setError("Unable to load — database connection error");
        setLoading(false);
      });
  };

  const handleStepClick = (shipmentId: number, sequence: number) => {
    if (selectedStep?.shipmentId === shipmentId && selectedStep?.sequence === sequence) {
      setSelectedStep(null);
    } else {
      setSelectedStep({ shipmentId, sequence });
    }
  };

  const handleStatusUpdate = async (status: "on-time" | "delayed") => {
    if (!selectedStep) return;
    setUpdateLoading(true);
    try {
      await updateShipmentStepStatus(selectedStep.shipmentId, selectedStep.sequence, status);
      setSelectedStep(null);
      fetchShipments();
    } catch (err) {
      console.error(err);
    } finally {
      setUpdateLoading(false);
    }
  };

  return (
    <div id="supply-chain" className="bg-[var(--bg-card)] border border-[var(--border-subtle)] p-6 rounded-3xl shadow-xs space-y-6 text-[var(--text-primary)]">
      <div className="flex items-center justify-between pb-4 border-b border-[var(--border-subtle)]">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-[var(--primary-subtle)] text-[var(--primary)] flex items-center justify-center">
            <LuTruck size={18} />
          </div>
          <div>
            <h3 className="font-display font-bold text-[var(--text-primary)] text-sm sm:text-base">
              Supply Chain Node Tracker
            </h3>
            <p className="text-xs font-semibold text-[var(--text-muted)]">
              Select nodes to adjust shipment tracking status manually.
            </p>
          </div>
        </div>
        <span className="text-[10px] font-black uppercase text-[var(--text-muted)]">
          {!error && `${shipments.length} Active Shipments`}
        </span>
      </div>

      <div className="space-y-8">
        {loading && (
          <div className="text-xs text-[var(--text-muted)] font-bold animate-pulse py-4">Loading active shipments...</div>
        )}
        
        {error && (
          <div className="p-5 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs font-semibold space-y-3">
            <div className="flex items-center gap-2 font-bold">
              <LuShieldAlert size={16} />
              <span>{error}</span>
            </div>
            <button
              onClick={fetchShipments}
              className="px-4 py-1.5 bg-[var(--primary)] hover:bg-[var(--primary-dark)] text-white rounded-full font-bold shadow-xs transition-all cursor-pointer"
            >
              Retry Connection
            </button>
          </div>
        )}

        {!loading && !error && shipments.map((ship: any, idx: number) => (
          <div key={idx} className="p-5 rounded-2xl bg-[var(--bg-subtle)] border border-[var(--border-subtle)] space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h4 className="font-display font-bold text-sm text-[var(--text-primary)]">{ship.material}</h4>
                <p className="text-[10px] font-semibold text-[var(--text-muted)]">
                  Qty: {ship.qty} • Supplier: {ship.supplier}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase bg-[var(--bg-card)] border border-[var(--border-subtle)] px-2.5 py-1 rounded-full">
                  ETA: {ship.eta}
                </span>
                <span className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-full border ${
                  ship.status === "delayed" 
                    ? "bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30" 
                    : "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30"
                }`}>
                  {ship.status}
                </span>
              </div>
            </div>

            <div className="relative pt-2 pb-4">
              <div className="absolute top-[28px] left-4 right-4 h-0.5 bg-[var(--border-subtle)] -z-0" />
              
              <div className="grid grid-cols-5 text-center relative z-10">
                {ship.steps.map((step: any, sIdx: number) => {
                  let stepColor = "bg-[var(--bg-card)] text-[var(--text-muted)] border-[var(--border-subtle)] hover:border-[var(--border-hover)]";
                  if (step.status === "completed") {
                    stepColor = "bg-[var(--primary)] text-white border-[var(--primary)] hover:bg-[var(--primary-dark)]";
                  } else if (step.status === "delayed") {
                    stepColor = "bg-rose-500 text-white border-rose-500 animate-pulse";
                  } else if (step.status === "on-time") {
                    stepColor = "bg-emerald-500 text-white border-emerald-500";
                  }

                  const isSelected = selectedStep?.shipmentId === ship.id && selectedStep?.sequence === step.sequence;
                  
                  return (
                    <div key={sIdx} className="flex flex-col items-center space-y-2 relative">
                      <button
                        onClick={() => handleStepClick(ship.id, step.sequence)}
                        className={`h-8 w-8 rounded-full border flex items-center justify-center font-display font-bold text-xs shadow-xs transition-all cursor-pointer ${stepColor} ${
                          isSelected ? "ring-4 ring-[var(--primary)]/20 scale-105" : ""
                        }`}
                      >
                        {step.sequence}
                      </button>
                      <span className="text-[10px] font-black text-[var(--text-primary)] block truncate w-full px-1">
                        {step.name}
                      </span>
                      <span className={`text-[8px] font-black uppercase ${
                        step.status === "completed" ? "text-[var(--primary)]" :
                        step.status === "delayed" ? "text-rose-500" :
                        step.status === "on-time" ? "text-emerald-500" : "text-[var(--text-muted)]"
                      }`}>
                        {step.status}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {selectedStep && selectedStep.shipmentId === ship.id && (
              <div className="p-4.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] space-y-3.5 animate-slide-in">
                <div className="flex justify-between items-center">
                  <h5 className="text-[10px] font-black uppercase tracking-wider text-[var(--text-muted)] flex items-center gap-1.5">
                    <LuShieldAlert size={12} className="text-[var(--primary)]" />
                    Manually Override Node #{selectedStep.sequence}
                  </h5>
                  <span className="text-[9px] text-[var(--text-muted)] font-bold">Requires active CNC manager role verification</span>
                </div>
                
                <div className="flex gap-2">
                  <button
                    onClick={() => handleStatusUpdate("on-time")}
                    disabled={updateLoading}
                    className="flex-1 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
                  >
                    Mark Node On-Time
                  </button>
                  <button
                    onClick={() => handleStatusUpdate("delayed")}
                    disabled={updateLoading}
                    className="flex-1 py-2 rounded-lg bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
                  >
                    Mark Node Delayed
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
