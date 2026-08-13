"use client";

import { useState, useEffect } from "react";
import { LuSparkles, LuCheck, LuX, LuMessageSquare, LuChevronDown, LuChevronUp, LuInfo, LuShieldAlert } from "react-icons/lu";

export default function PricingRecommendations() {
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadRecommendations = () => {
    setLoading(true);
    setError(null);
    fetch("/api/pricing")
      .then((res) => {
        if (!res.ok) throw new Error("Unable to load — database connection error");
        return res.json();
      })
      .then((data) => {
        if (data.pricingRecommendations) {
          setRecommendations(data.pricingRecommendations.map((rec: any) => ({ ...rec, expanded: false })));
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load recommendations:", err);
        setError("Unable to load — database connection error");
        setLoading(false);
      });
  };

  useEffect(() => {
    loadRecommendations();
  }, []);

  const toggleExpand = (id: string) => {
    setRecommendations(
      recommendations.map((rec: any) =>
        rec.id === id ? { ...rec, expanded: !rec.expanded } : rec
      )
    );
  };

  const handleAction = async (id: string, type: "accept" | "reject") => {
    try {
      const res = await fetch("/api/pricing", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id, status: type }),
      });
      if (!res.ok) throw new Error("Connection failed");
      setRecommendations(
        recommendations.map((rec: any) =>
          rec.id === id
            ? {
                ...rec,
                accepted: type === "accept",
                rejected: type === "reject",
              }
            : rec
        )
      );
    } catch (err) {
      console.error("Failed to update recommendation status:", err);
      alert("Unable to complete action — database connection error");
    }
  };

  return (
    <div className="space-y-6 text-[var(--text-primary)]">
      <div className="flex items-center justify-between pb-2">
        <h3 className="font-display font-bold text-[var(--text-primary)] text-sm sm:text-base flex items-center gap-2">
          <LuSparkles size={16} className="text-[var(--primary)] animate-pulse" />
          Active Pricing Recommendations
        </h3>
        <span className="text-[10px] font-black uppercase text-[var(--text-muted)]">
          Ranked by Urgency
        </span>
      </div>

      {loading && (
        <div className="text-xs text-[var(--text-muted)] font-bold animate-pulse py-4">Loading active recommendations...</div>
      )}

      {error && (
        <div className="p-5 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs font-semibold space-y-3">
          <div className="flex items-center gap-2 font-bold">
            <LuShieldAlert size={16} />
            <span>{error}</span>
          </div>
          <button
            onClick={loadRecommendations}
            className="px-4 py-1.5 bg-[var(--primary)] hover:bg-[var(--primary-dark)] text-white rounded-full font-bold shadow-xs transition-all cursor-pointer"
          >
            Retry Connection
          </button>
        </div>
      )}

      {!loading && !error && recommendations.length === 0 && (
        <div className="text-xs text-[var(--text-muted)] font-semibold italic py-4">No active recommendations.</div>
      )}

      {!loading && !error && (
        <div className="space-y-4">
          {recommendations.map((rec) => {
            if (rec.rejected) return null;
            return (
              <div
                key={rec.id}
                className={`p-6 rounded-3xl border transition-all duration-300 relative ${
                  rec.accepted
                    ? "bg-emerald-500/10 border-emerald-500/30"
                    : "bg-[var(--bg-card)] border-[var(--border-subtle)] hover:border-[var(--border-hover)] shadow-xs"
                }`}
              >
                <div className="flex justify-between items-start gap-4">
                  <div className="space-y-1">
                    <span className="text-[9px] font-black uppercase text-[var(--primary)] tracking-wider">
                      Trigger: {rec.trigger}
                    </span>
                    <h4 className="font-display font-bold text-[var(--text-primary)] text-sm sm:text-base leading-tight">
                      {rec.action}
                    </h4>
                    {rec.sourceName && rec.sourceUrl && (
                      <div className="text-[9px] text-[var(--text-muted)] font-bold pt-1">
                        Source: <span className="text-[var(--text-primary)]">{rec.sourceName}</span> &bull; {rec.sourceDate || "Recent"} &bull; <a href={rec.sourceUrl} target="_blank" rel="noopener noreferrer" className="text-[var(--primary)] hover:underline">Verify Signal ↗</a>
                      </div>
                    )}
                  </div>
                  <span className={`text-[9px] font-black uppercase px-2.5 py-1 rounded-full border shrink-0 ${
                    rec.confidence === "high"
                      ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30"
                      : "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30"
                  }`}>
                    {rec.confidence} Confidence
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4 my-4 py-3 border-y border-[var(--border-subtle)] text-xs">
                  <div>
                    <span className="text-[10px] text-[var(--text-muted)] block uppercase font-bold">Estimated Impact</span>
                    <span className="font-display font-extrabold text-[var(--primary)] text-sm">{rec.estimatedImpact}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[var(--text-muted)] block uppercase font-bold">Recommended Adjust</span>
                    <span className="font-display font-extrabold text-emerald-600 dark:text-emerald-400 text-sm">{rec.increaseRate}</span>
                  </div>
                </div>

                {rec.expanded && (
                  <div className="space-y-3 mb-4 text-xs bg-[var(--bg-subtle)] p-4 rounded-2xl border border-[var(--border-subtle)]">
                    <p className="text-[var(--text-secondary)] leading-relaxed font-medium">
                      {rec.rationale}
                    </p>
                    {rec.riskAssessment && (
                      <div className="p-2.5 bg-[var(--bg-card)] rounded-xl border border-[var(--border-subtle)] text-[11px]">
                        <span className="font-bold text-[var(--text-primary)]">Risk Assessment: </span>
                        <span className="text-[var(--text-muted)]">{rec.riskAssessment}</span>
                      </div>
                    )}
                  </div>
                )}

                <div className="flex items-center justify-between pt-1">
                  <button
                    onClick={() => toggleExpand(rec.id)}
                    className="text-xs font-bold text-[var(--text-muted)] hover:text-[var(--text-primary)] flex items-center gap-1 cursor-pointer"
                  >
                    {rec.expanded ? <LuChevronUp size={14} /> : <LuChevronDown size={14} />}
                    <span>{rec.expanded ? "Hide Explanation" : "View Explanation"}</span>
                  </button>

                  <div className="flex gap-2">
                    {rec.accepted ? (
                      <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                        <LuCheck size={14} /> Recommendation Applied
                      </span>
                    ) : (
                      <>
                        <button
                          onClick={() => handleAction(rec.id, "reject")}
                          className="px-3 py-1.5 rounded-full text-xs font-bold border border-[var(--border-subtle)] bg-[var(--bg-subtle)] hover:bg-[var(--bg-card-hover)] text-[var(--text-muted)] transition-colors cursor-pointer"
                        >
                          Dismiss
                        </button>
                        <button
                          onClick={() => handleAction(rec.id, "accept")}
                          className="px-4 py-1.5 rounded-full text-xs font-bold bg-[var(--primary)] hover:bg-[var(--primary-dark)] text-white shadow-xs transition-colors cursor-pointer flex items-center gap-1"
                        >
                          <LuCheck size={13} />
                          <span>Accept & Apply</span>
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
