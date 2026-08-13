"use client";

import { useState, useEffect } from "react";
import { 
  LuTrendingUp, 
  LuTrendingDown, 
  LuBoxes, 
  LuShieldAlert, 
  LuPlus, 
  LuShieldCheck, 
  LuPercent
} from "react-icons/lu";
import { 
  getMaterials, 
  getOrders, 
  getInventory, 
  updateInventoryQty,
  fetchMaterialTrends
} from "@/app/pricing-agent/actions";

export default function PricingDashboardWidgets() {
  return (
    <div className="space-y-6">
      <MaterialCostWatchlist />
      <CncInventoryAlerts />
      <MarginSimulator />
    </div>
  );
}

function MaterialCostWatchlist() {
  const [materials, setMaterials] = useState<any[]>([]);
  const [trends, setTrends] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadMaterialsAndTrends = async () => {
    setLoading(true);
    setError(null);
    try {
      const mats = await getMaterials();
      setMaterials(mats);
      
      const trendsResults = await Promise.all(
        mats.map(async (mat: any) => {
          try {
            const data = await fetchMaterialTrends(mat.name);
            return { name: mat.name, data };
          } catch {
            return { name: mat.name, data: null };
          }
        })
      );

      const trendsMap: Record<string, any> = {};
      trendsResults.forEach(res => {
        if (res.data) trendsMap[res.name] = res.data;
      });
      setTrends(trendsMap);
      setLoading(false);
    } catch (err: any) {
      console.error(err);
      setError("Unable to load — database connection error");
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMaterialsAndTrends();
  }, []);

  if (loading) {
    return <div className="bg-[var(--bg-card)] border border-[var(--border-subtle)] p-6 rounded-3xl shadow-xs text-xs text-[var(--text-muted)] font-bold animate-pulse">Loading material costs & indices...</div>;
  }

  if (error) {
    return (
      <div className="bg-[var(--bg-card)] border border-rose-500/20 bg-rose-500/10 p-6 rounded-3xl shadow-xs space-y-3 text-rose-500 text-xs">
        <div className="flex items-center gap-2 font-bold">
          <LuShieldAlert size={16} />
          <span>Material Cost Watchlist: {error}</span>
        </div>
        <button
          onClick={loadMaterialsAndTrends}
          className="px-4 py-1.5 bg-[var(--primary)] hover:bg-[var(--primary-dark)] text-white rounded-full font-bold shadow-xs transition-all cursor-pointer"
        >
          Retry Connection
        </button>
      </div>
    );
  }

  return (
    <div className="bg-[var(--bg-card)] border border-[var(--border-subtle)] p-6 rounded-3xl shadow-xs space-y-4 text-[var(--text-primary)]">
      <div className="flex items-center justify-between pb-3 border-b border-[var(--border-subtle)]">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-[var(--bg-subtle)] text-[var(--primary)] flex items-center justify-center">
            <LuShieldCheck size={18} />
          </div>
          <div>
            <h3 className="font-display font-bold text-[var(--text-primary)] text-sm sm:text-base">
              Material Cost Watchlist
            </h3>
            <p className="text-xs font-semibold text-[var(--text-muted)]">
              Compare locked-in supplier costs vs. live market index trends.
            </p>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-[var(--border-subtle)] text-[10px] font-black uppercase text-[var(--text-muted)]">
              <th className="py-3 px-1">Material</th>
              <th className="py-3 px-1">Supplier</th>
              <th className="py-3 px-1 text-right">Contract Rate</th>
              <th className="py-3 px-1 text-right">Market Trend Index</th>
              <th className="py-3 px-1 text-center">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border-subtle)]">
            {materials.map((mat) => {
              const trendInfo = trends[mat.name];
              const trendStr = trendInfo?.trend || "Stable";
              const isRising = trendStr.toLowerCase().includes("rising");
              const isSoftening = trendStr.toLowerCase().includes("softening");

              return (
                <tr key={mat.id} className="text-xs font-semibold text-[var(--text-secondary)] hover:bg-[var(--bg-subtle)] transition-colors">
                  <td className="py-3.5 px-1 font-bold text-[var(--text-primary)]">{mat.name}</td>
                  <td className="py-3.5 px-1 text-[var(--text-muted)]">{mat.supplier}</td>
                  <td className="py-3.5 px-1 text-right font-mono font-bold text-[var(--text-primary)]">
                    ₹{mat.currentCost.toLocaleString("en-IN")}
                  </td>
                  <td className="py-3.5 px-1 text-right font-mono text-[var(--text-primary)] max-w-[150px]">
                    <span className="font-extrabold block text-xs">{trendStr}</span>
                    {trendInfo?.latestArticle && (
                      <span className="text-[8px] text-[var(--text-muted)] block mt-0.5 leading-snug">
                        Source: {trendInfo.latestArticle.source} &bull; <a href={trendInfo.latestArticle.url} target="_blank" rel="noopener noreferrer" className="text-[var(--primary)] hover:underline font-bold">Verify Article ↗</a>
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-1 text-center">
                    {isRising ? (
                      <span className="inline-flex items-center gap-1 text-[9px] font-black uppercase text-rose-600 dark:text-rose-400 bg-rose-500/15 border border-rose-500/30 px-2 py-0.5 rounded">
                        <LuTrendingUp size={10} /> Margin Threat
                      </span>
                    ) : isSoftening ? (
                      <span className="inline-flex items-center gap-1 text-[9px] font-black uppercase text-emerald-600 dark:text-emerald-400 bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 rounded">
                        <LuTrendingDown size={10} /> Cost Relief
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[9px] font-black uppercase text-[var(--text-muted)] bg-[var(--bg-subtle)] border border-[var(--border-subtle)] px-2 py-0.5 rounded">
                        Stable Cost
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="flex justify-between items-center text-[9px] text-[var(--text-muted)] border-t border-[var(--border-subtle)] pt-2 font-bold">
        <span>* Market trends scraped dynamically from Google News RSS</span>
        <span className="flex items-center gap-1">
          {materials[0] && trends[materials[0].name]?.isLive ? (
            <>
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-emerald-600 dark:text-emerald-400 font-bold">Live Feed Connected</span>
            </>
          ) : (
            <span className="text-[var(--text-muted)]">Feed Cache: {materials[0] && trends[materials[0].name]?.timestamp || "Offline"}</span>
          )}
        </span>
      </div>
    </div>
  );
}

function CncInventoryAlerts() {
  const [lowItems, setLowItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAlerts = () => {
    setLoading(true);
    setError(null);
    getInventory()
      .then((data: any[]) => {
        setLowItems(data.filter(item => item.status === "Low Stock" || item.status === "Out of Stock"));
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError("Unable to load — database connection error");
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchAlerts();
  }, []);

  const handleRestock = async (id: number, currentQty: number) => {
    const newQty = currentQty + 20;
    setLowItems(prev => prev.map(item => item.id === id ? { ...item, quantity: newQty, status: "In Stock" } : item));
    try {
      await updateInventoryQty(id, newQty);
      fetchAlerts();
    } catch (err) {
      console.error(err);
      alert("Failed to restock — database connection error");
      fetchAlerts();
    }
  };

  if (loading) {
    return <div className="bg-[var(--bg-card)] border border-[var(--border-subtle)] p-6 rounded-3xl shadow-xs text-xs text-[var(--text-muted)] font-bold animate-pulse">Loading inventory restock alerts...</div>;
  }

  if (error) {
    return (
      <div className="bg-[var(--bg-card)] border border-rose-500/20 bg-rose-500/10 p-6 rounded-3xl shadow-xs space-y-3 text-rose-500 text-xs">
        <div className="flex items-center gap-2 font-bold">
          <LuShieldAlert size={16} />
          <span>Inventory Restock Alerts: {error}</span>
        </div>
        <button
          onClick={fetchAlerts}
          className="px-4 py-1.5 bg-[var(--primary)] hover:bg-[var(--primary-dark)] text-white rounded-full font-bold shadow-xs transition-all cursor-pointer"
        >
          Retry Connection
        </button>
      </div>
    );
  }

  return (
    <div className="bg-[var(--bg-card)] border border-[var(--border-subtle)] p-6 rounded-3xl shadow-xs space-y-4 text-[var(--text-primary)]">
      <div className="flex items-center justify-between pb-3 border-b border-[var(--border-subtle)]">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-[var(--bg-subtle)] text-[var(--primary)] flex items-center justify-center">
            <LuBoxes size={18} />
          </div>
          <div>
            <h3 className="font-display font-bold text-[var(--text-primary)] text-sm sm:text-base">
              Inventory Restock Alerts
            </h3>
            <p className="text-xs font-semibold text-[var(--text-muted)]">
              Tooling & material items falling below minimum limits.
            </p>
          </div>
        </div>
      </div>

      {lowItems.length === 0 ? (
        <div className="text-center py-8 text-xs text-[var(--text-muted)] font-semibold italic">
          All shop inventory levels optimized.
        </div>
      ) : (
        <div className="space-y-3.5 max-h-[220px] overflow-y-auto pr-1">
          {lowItems.map((item) => (
            <div key={item.id} className="p-3 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border-subtle)] flex items-center justify-between gap-3 shadow-xs">
              <div className="flex items-center gap-3 min-w-0">
                <div className="h-10 w-10 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-card)] overflow-hidden shrink-0 flex items-center justify-center">
                  <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                </div>
                <div className="min-w-0">
                  <h4 className="font-display font-bold text-[var(--text-primary)] text-xs truncate">
                    {item.name}
                  </h4>
                  <p className="text-[10px] text-[var(--text-muted)] font-semibold">
                    SKU: {item.sku} • Location: {item.location}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <div className="text-right">
                  <span className={`text-[10px] font-black uppercase block ${
                    item.status === "Out of Stock" ? "text-rose-600 dark:text-rose-400" : "text-amber-600 dark:text-amber-400"
                  }`}>
                    {item.quantity} {item.unit} left
                  </span>
                  <span className="text-[9px] text-[var(--text-muted)] font-bold">Limit: {item.minThreshold}</span>
                </div>
                <button
                  onClick={() => handleRestock(item.id, item.quantity)}
                  className="h-7 w-7 rounded-lg bg-[var(--primary)] hover:bg-[var(--primary-dark)] text-white flex items-center justify-center shadow-xs cursor-pointer transition-transform active:scale-95"
                  title="Quick restock +20 units"
                >
                  <LuPlus size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function MarginSimulator() {
  const [orders, setOrders] = useState<any[]>([]);
  const [costIncrease, setCostIncrease] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOrders = () => {
    setLoading(true);
    setError(null);
    getOrders()
      .then(setOrders)
      .then(() => setLoading(false))
      .catch((err) => {
        console.error(err);
        setError("Unable to load — database connection error");
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  if (loading) {
    return <div className="bg-[var(--bg-card)] border border-[var(--border-subtle)] p-6 rounded-3xl shadow-xs text-xs text-[var(--text-muted)] font-bold animate-pulse">Loading active order margins...</div>;
  }

  if (error) {
    return (
      <div className="bg-[var(--bg-card)] border border-rose-500/20 bg-rose-500/10 p-6 rounded-3xl shadow-xs space-y-3 text-rose-500 text-xs">
        <div className="flex items-center gap-2 font-bold">
          <LuShieldAlert size={16} />
          <span>Order Margin Simulator: {error}</span>
        </div>
        <button
          onClick={fetchOrders}
          className="px-4 py-1.5 bg-[var(--primary)] hover:bg-[var(--primary-dark)] text-white rounded-full font-bold shadow-xs transition-all cursor-pointer"
        >
          Retry Connection
        </button>
      </div>
    );
  }

  return (
    <div className="bg-[var(--bg-card)] border border-[var(--border-subtle)] p-6 rounded-3xl shadow-xs space-y-4 text-[var(--text-primary)]">
      <div className="flex items-center justify-between pb-3 border-b border-[var(--border-subtle)]">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-[var(--bg-subtle)] text-[var(--primary)] flex items-center justify-center">
            <LuPercent size={18} />
          </div>
          <div>
            <h3 className="font-display font-bold text-[var(--text-primary)] text-sm sm:text-base">
              Order Margin Simulator
            </h3>
            <p className="text-xs font-semibold text-[var(--text-muted)]">
              Simulate raw material cost rises and trace impacts on active margins.
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-2 p-3 bg-[var(--bg-subtle)] rounded-xl border border-[var(--border-subtle)]">
        <div className="flex items-center justify-between text-xs font-black uppercase text-[var(--text-muted)]">
          <span>Simulated Material Cost Rise</span>
          <span className="text-[var(--primary)]">+{costIncrease}%</span>
        </div>
        <input
          type="range"
          min="0"
          max="30"
          value={costIncrease}
          onChange={(e) => setCostIncrease(Number(e.target.value))}
          className="w-full accent-[var(--primary)] cursor-pointer h-1.5 bg-[var(--bg-muted)] rounded-lg appearance-none"
        />
      </div>

      <div className="space-y-3">
        {orders.map((ord) => {
          const originalMarginVal = parseFloat(ord.margin);
          const simulatedMarginVal = Math.max(0, originalMarginVal - (costIncrease * 0.4));
          const isCritical = simulatedMarginVal < 10;

          return (
            <div key={ord.id} className="flex items-center justify-between p-2.5 rounded-lg border border-[var(--border-subtle)] hover:bg-[var(--bg-subtle)] transition-colors">
              <div>
                <h4 className="font-display font-bold text-[var(--text-primary)] text-xs">
                  {ord.client} ({ord.id})
                </h4>
                <p className="text-[9px] text-[var(--text-muted)] font-semibold uppercase">
                  Material: {ord.material.name}
                </p>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-[var(--text-muted)] line-through font-bold block leading-none">
                  {ord.margin}
                </span>
                <span className={`text-xs font-black block mt-1 ${
                  isCritical ? "text-rose-600 dark:text-rose-400 animate-pulse" : "text-emerald-600 dark:text-emerald-400"
                }`}>
                  {simulatedMarginVal.toFixed(1)}% margin
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {costIncrease > 10 && (
        <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-start gap-2.5 text-[11px] text-rose-600 dark:text-rose-400 leading-normal font-semibold animate-fade-in">
          <LuShieldAlert size={14} className="shrink-0 mt-0.5" />
          <span>
            <strong>Gemma Warning:</strong> Material rise of {costIncrease}% places client margins below sustainable thresholds. Active pricing recommendation surcharge execution is recommended.
          </span>
        </div>
      )}
    </div>
  );
}
