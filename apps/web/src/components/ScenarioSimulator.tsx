import React, { useState } from 'react';
import { 
  Sliders, 
  Play, 
  RefreshCw, 
  ShieldAlert, 
  Info,
  Loader2
} from 'lucide-react';
import type { DashboardData } from '../api-client/api';
import { runSimulation } from '../api-client/api';

interface ScenarioSimulatorProps {
  data: DashboardData;
  onSimulationResult: (simulatedData: DashboardData) => void;
  onReset: () => void;
}

export const ScenarioSimulator: React.FC<ScenarioSimulatorProps> = ({ 
  data, 
  onSimulationResult,
  onReset
}) => {
  const [ordersMultiplier, setOrdersMultiplier] = useState(1.0);
  const [steelPriceMultiplier, setSteelPriceMultiplier] = useState(1.0);
  const [paymentDelayModifier, setPaymentDelayModifier] = useState(0);
  const [utilizationMultiplier, setUtilizationMultiplier] = useState(1.0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRunSimulation = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await runSimulation({
        ordersMultiplier,
        steelPriceMultiplier,
        paymentDelayModifier,
        utilizationMultiplier,
        filePath: data.summary.last_upload_filename
      });
      onSimulationResult(result);
    } catch (e: any) {
      setError(e.message || "Failed to simulate parameters.");
    } finally {
      setLoading(false);
    }
  };

  const handleLocalReset = () => {
    setOrdersMultiplier(1.0);
    setSteelPriceMultiplier(1.0);
    setPaymentDelayModifier(0);
    setUtilizationMultiplier(1.0);
    onReset();
  };

  return (
    <div className="bg-[var(--bg-card)] border border-[var(--border-subtle)] text-[var(--text-primary)] rounded-3xl p-6 shadow-xs relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--primary)]/5 rounded-full translate-x-8 -translate-y-8 pointer-events-none" />
      
      <div className="flex justify-between items-center border-b border-[var(--border-subtle)] pb-4 mb-6">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-[var(--primary-subtle)] text-[var(--primary)] rounded-xl">
            <Sliders size={18} />
          </div>
          <div>
            <h3 className="font-black text-sm tracking-tight text-[var(--text-primary)] font-display">Scenario Simulator</h3>
            <p className="text-[10px] text-[var(--text-muted)] mt-0.5 font-bold font-sans">Override operational constraints to recalculate forecasts and risk scores</p>
          </div>
        </div>
        <button 
          onClick={handleLocalReset}
          className="p-1.5 hover:bg-[var(--bg-subtle)] rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
          title="Reset Sliders"
        >
          <RefreshCw size={14} />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Sliders Block 1: Volume */}
        <div className="space-y-4">
          <div className="flex justify-between items-center text-xs">
            <span className="text-[var(--text-muted)] font-bold font-display">Orders Volume</span>
            <span className="text-[var(--primary)] font-black">{ordersMultiplier.toFixed(2)}x</span>
          </div>
          <input 
            type="range" 
            min="0.7" 
            max="1.3" 
            step="0.05"
            value={ordersMultiplier}
            onChange={(e) => setOrdersMultiplier(parseFloat(e.target.value))}
            className="w-full h-1.5 bg-[var(--bg-subtle)] rounded-lg appearance-none cursor-pointer accent-[var(--primary)]"
          />
          <div className="flex justify-between text-[9px] text-[var(--text-muted)] font-bold font-sans">
            <span>0.7x (Slowdown)</span>
            <span>1.3x (Surge)</span>
          </div>
        </div>

        {/* Sliders Block 2: Steel Price */}
        <div className="space-y-4">
          <div className="flex justify-between items-center text-xs">
            <span className="text-[var(--text-muted)] font-bold font-display">Steel Prices Index</span>
            <span className="text-[var(--primary)] font-black">{steelPriceMultiplier.toFixed(2)}x</span>
          </div>
          <input 
            type="range" 
            min="0.8" 
            max="1.5" 
            step="0.05"
            value={steelPriceMultiplier}
            onChange={(e) => setSteelPriceMultiplier(parseFloat(e.target.value))}
            className="w-full h-1.5 bg-[var(--bg-subtle)] rounded-lg appearance-none cursor-pointer accent-[var(--primary)]"
          />
          <div className="flex justify-between text-[9px] text-[var(--text-muted)] font-bold font-sans">
            <span>0.8x (Margin Relief)</span>
            <span>1.5x (Severe Spike)</span>
          </div>
        </div>

        {/* Sliders Block 3: Payment Delay */}
        <div className="space-y-4">
          <div className="flex justify-between items-center text-xs">
            <span className="text-[var(--text-muted)] font-bold font-display">Payment delays</span>
            <span className="text-[var(--primary)] font-black">
              {paymentDelayModifier > 0 ? `+${paymentDelayModifier}` : paymentDelayModifier} Days
            </span>
          </div>
          <input 
            type="range" 
            min="-5" 
            max="15" 
            step="1"
            value={paymentDelayModifier}
            onChange={(e) => setPaymentDelayModifier(parseInt(e.target.value))}
            className="w-full h-1.5 bg-[var(--bg-subtle)] rounded-lg appearance-none cursor-pointer accent-[var(--primary)]"
          />
          <div className="flex justify-between text-[9px] text-[var(--text-muted)] font-bold font-sans">
            <span>-5 Days (Acceleration)</span>
            <span>+15 Days (Severe Delay)</span>
          </div>
        </div>

        {/* Sliders Block 4: Machine Util */}
        <div className="space-y-4">
          <div className="flex justify-between items-center text-xs">
            <span className="text-[var(--text-muted)] font-bold font-display">Machine Utilization</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-black">{utilizationMultiplier.toFixed(2)}x</span>
          </div>
          <input 
            type="range" 
            min="0.8" 
            max="1.2" 
            step="0.05"
            value={utilizationMultiplier}
            onChange={(e) => setUtilizationMultiplier(parseFloat(e.target.value))}
            className="w-full h-1.5 bg-[var(--bg-subtle)] rounded-lg appearance-none cursor-pointer accent-emerald-500"
          />
          <div className="flex justify-between text-[9px] text-[var(--text-muted)] font-bold font-sans">
            <span>0.8x (Downtime)</span>
            <span>1.2x (Optimized capacity)</span>
          </div>
        </div>
      </div>

      <div className="mt-6 flex flex-col sm:flex-row justify-between items-center gap-4 pt-4 border-t border-[var(--border-subtle)]">
        <div className="flex items-center gap-2 text-[10px] text-[var(--text-muted)] text-left font-bold font-sans">
          <Info size={12} className="text-[var(--primary)] flex-shrink-0" />
          <span>Click run to feed the new overridden parameters directly into the XGBoost and Gemma reasoning layer.</span>
        </div>
        
        <button
          onClick={handleRunSimulation}
          disabled={loading}
          className="w-full sm:w-auto px-5 py-2.5 bg-[var(--primary)] hover:bg-[var(--primary-dark)] disabled:opacity-50 text-white rounded-full text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer"
        >
          {loading ? (
            <>
              <Loader2 size={12} className="animate-spin" />
              <span>Simulating Scenario...</span>
            </>
          ) : (
            <>
              <Play size={12} fill="currentColor" />
              <span>Run Scenario Simulation</span>
            </>
          )}
        </button>
      </div>

      {error && (
        <div className="mt-4 p-3 bg-[var(--primary-subtle)] border border-[var(--primary)]/20 text-[var(--primary)] text-xs rounded-2xl flex items-center gap-2 font-bold">
          <ShieldAlert size={14} />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};

export default ScenarioSimulator;
