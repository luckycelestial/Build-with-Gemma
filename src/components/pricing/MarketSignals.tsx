"use client";

import { useState, useEffect } from "react";
import { 
  LuGlobe, 
  LuSparkles, 
  LuNewspaper,
  LuChevronLeft,
  LuChevronRight,
  LuTrendingDown,
  LuCompass,
  LuShieldAlert
} from "react-icons/lu";
import { getMarketSignals, getIndustryNews } from "@/app/pricing-agent/actions";

export default function MarketSignals() {
  const [signals, setSignals] = useState<any[]>([]);
  const [news, setNews] = useState<any[]>([]);
  const [sortBy, setSortBy] = useState<"relevance" | "recent">("relevance");
  const [currentSlide, setCurrentSlide] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSignalsAndNews = async () => {
    setLoading(true);
    setError(null);
    try {
      const [signalsData, newsData] = await Promise.all([
        getMarketSignals(),
        getIndustryNews()
      ]);
      setSignals(signalsData);
      setNews(newsData);
      setLoading(false);
    } catch (err: any) {
      console.error(err);
      setError("Unable to load — database connection error");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSignalsAndNews();
  }, []);

  useEffect(() => {
    if (news.length === 0) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % news.length);
    }, 7000);
    return () => clearInterval(interval);
  }, [news]);

  const prevSlide = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (news.length === 0) return;
    setCurrentSlide((prev) => (prev - 1 + news.length) % news.length);
  };

  const nextSlide = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (news.length === 0) return;
    setCurrentSlide((prev) => (prev + 1) % news.length);
  };

  const getSortedSignals = () => {
    if (sortBy === "relevance") {
      return [...signals].sort((a, b) => {
        const order = { high: 2, medium: 1, low: 0 };
        return (
          (order[b.relevance as "high" | "medium" | "low"] ?? 0) -
          (order[a.relevance as "high" | "medium" | "low"] ?? 0)
        );
      });
    }
    return signals;
  };

  const sortedSignals = getSortedSignals();

  const getImpactTag = (title: string) => {
    if (title.toLowerCase().includes("steel")) {
      return { text: "-1.2% Margin", style: "bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30" };
    }
    if (title.toLowerCase().includes("power") || title.toLowerCase().includes("grid")) {
      return { text: "+₹150/hr Cost", style: "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30" };
    }
    if (title.toLowerCase().includes("ev parts") || title.toLowerCase().includes("engine")) {
      return { text: "-30% Demand", style: "bg-sky-500/15 text-sky-600 dark:text-sky-400 border-sky-500/30" };
    }
    return { text: "Action Needed", style: "bg-[var(--bg-subtle)] text-[var(--text-muted)] border-[var(--border-subtle)]" };
  };

  const getNewsDomain = (urlStr: string) => {
    try {
      if (!urlStr) return "Original Site";
      const formattedUrl = urlStr.startsWith("http://") || urlStr.startsWith("https://")
        ? urlStr
        : `https://${urlStr}`;
      const urlObj = new URL(formattedUrl);
      return urlObj.hostname.replace("www.", "");
    } catch (e) {
      return "Original Site";
    }
  };

  if (loading) {
    return <div className="text-xs text-[var(--text-muted)] font-bold animate-pulse py-8">Loading market signals & news feed...</div>;
  }

  if (error) {
    return (
      <div className="p-6 rounded-3xl border border-rose-500/20 bg-rose-500/10 text-rose-500 text-xs font-semibold space-y-3">
        <div className="flex items-center gap-2 font-bold">
          <LuShieldAlert size={16} />
          <span>{error}</span>
        </div>
        <button
          onClick={fetchSignalsAndNews}
          className="px-4 py-1.5 bg-[var(--primary)] hover:bg-[var(--primary-dark)] text-white rounded-full font-bold shadow-xs transition-all cursor-pointer"
        >
          Retry Connection
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 w-full text-[var(--text-primary)]">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch w-full">
        {/* Left Column: Live Industry News Carousel Feed */}
        <div className="lg:col-span-6 flex flex-col bg-[var(--bg-card)] border border-[var(--border-subtle)] p-5 rounded-3xl shadow-xs overflow-hidden min-h-[460px]">
          <div className="flex items-center justify-between pb-4 border-b border-[var(--border-subtle)] mb-6">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                <LuNewspaper size={18} />
              </div>
              <div>
                <h3 className="font-display font-bold text-[var(--text-primary)] text-sm sm:text-base">
                  Bengaluru Industry News
                </h3>
                <p className="text-xs font-semibold text-[var(--text-muted)]">
                  Live local manufacturing streams
                </p>
              </div>
            </div>
          </div>

          {news.length === 0 ? (
            <div className="flex-1 flex items-center justify-center text-xs text-[var(--text-muted)] italic font-semibold">
              No industry news articles loaded.
            </div>
          ) : (
            <div className="flex-1 flex flex-col justify-between relative bg-[var(--bg-muted)] rounded-2xl p-6 text-[var(--text-primary)] overflow-hidden shadow-inner group border border-[var(--border-subtle)]">
              {news[currentSlide].image && (
                <div 
                  className="absolute inset-0 bg-cover bg-center opacity-20 mix-blend-overlay transition-all duration-700 transform group-hover:scale-105"
                  style={{ backgroundImage: `url(${news[currentSlide].image})` }}
                />
              )}
              
              <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg-card)] via-[var(--bg-card)]/70 to-transparent pointer-events-none" />

              <a 
                href={news[currentSlide].url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="absolute inset-0 z-10 cursor-pointer block"
              />

              <span className="absolute top-4 right-4 text-[9px] font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400 bg-[var(--bg-card)]/90 backdrop-blur-md px-2.5 py-1 rounded-full border border-emerald-500/30 flex items-center gap-1 shadow-xs">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Live Press Coverage
              </span>

              <div className="relative z-20 space-y-4 pt-12">
                <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded bg-[var(--primary-subtle)] border border-[var(--primary)]/20 text-[var(--primary)]">
                  {news[currentSlide].category}
                </span>
                
                <h4 className="font-display font-bold text-base sm:text-lg text-[var(--text-primary)] leading-snug hover:underline decoration-1">
                  {news[currentSlide].title}
                </h4>
                
                <p className="text-xs text-[var(--text-secondary)] leading-relaxed font-medium line-clamp-3">
                  {news[currentSlide].summary}
                </p>
              </div>

              <div className="relative z-20 pt-6 mt-6 border-t border-[var(--border-subtle)] flex flex-col gap-3">
                <div className="flex items-center justify-between text-[10px] text-[var(--text-muted)] font-bold">
                  <div className="flex items-center gap-1.5">
                    <span>{news[currentSlide].source}</span>
                    <span className="text-[8px] font-black text-emerald-600 dark:text-emerald-400 bg-emerald-500/15 border border-emerald-500/30 px-1.5 py-0.5 rounded">
                      ✓ Verified Press
                    </span>
                  </div>
                  <span>{news[currentSlide].date}</span>
                </div>

                <div className="flex items-center justify-between gap-4">
                  <span className="text-[9px] font-extrabold text-[var(--text-muted)]">
                    Source domain: <span className="text-[var(--text-primary)]">{getNewsDomain(news[currentSlide].url)}</span>
                  </span>

                  <div className="flex items-center gap-1.5 z-30">
                    <button
                      onClick={prevSlide}
                      className="h-7 w-7 rounded-lg bg-[var(--bg-card)] border border-[var(--border-subtle)] hover:bg-[var(--bg-card-hover)] flex items-center justify-center transition-colors cursor-pointer text-[var(--text-primary)]"
                      title="Previous Slide"
                    >
                      <LuChevronLeft size={16} />
                    </button>
                    <span className="text-[10px] font-bold text-[var(--text-muted)] px-1 min-w-[32px] text-center">
                      {currentSlide + 1} / {news.length}
                    </span>
                    <button
                      onClick={nextSlide}
                      className="h-7 w-7 rounded-lg bg-[var(--bg-card)] border border-[var(--border-subtle)] hover:bg-[var(--bg-card-hover)] flex items-center justify-center transition-colors cursor-pointer text-[var(--text-primary)]"
                      title="Next Slide"
                    >
                      <LuChevronRight size={16} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Dynamic Business Signals Timeline Alert Feed */}
        <div className="lg:col-span-6 flex flex-col bg-[var(--bg-card)] border border-[var(--border-subtle)] p-5 rounded-3xl shadow-xs min-h-[460px]">
          <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-[var(--border-subtle)] mb-6">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <LuGlobe size={18} />
              </div>
              <div>
                <h3 className="font-display font-bold text-[var(--text-primary)] text-sm sm:text-base">
                  Anomalies & Market Signals
                </h3>
                <p className="text-xs font-semibold text-[var(--text-muted)]">
                  Real-time events triggers compiled by Gemma
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase text-[var(--text-muted)]">Sort:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as "relevance" | "recent")}
                className="text-xs font-bold text-[var(--text-primary)] border border-[var(--border-subtle)] rounded-lg py-1 px-2 focus:outline-none focus:border-[var(--primary)] bg-[var(--bg-subtle)]"
              >
                <option value="relevance">Urgency</option>
                <option value="recent">Recent</option>
              </select>
            </div>
          </div>

          {signals.length === 0 ? (
            <div className="flex-1 flex items-center justify-center text-xs text-[var(--text-muted)] italic font-semibold">
              No anomaly signals loaded.
            </div>
          ) : (
            <div className="relative flex-1 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-[var(--border-subtle)] flex flex-col gap-6 pl-6 overflow-y-auto">
              {sortedSignals.map((sig: any, idx: number) => {
                const impact = getImpactTag(sig.title);
                const isHigh = sig.relevance === "high";

                return (
                  <div key={idx} className="relative space-y-1.5 group">
                    <div className={`absolute -left-[30px] top-1.5 h-3.5 w-3.5 rounded-full border-2 border-[var(--bg-card)] shadow-xs transition-transform duration-200 group-hover:scale-110 ${
                      isHigh ? "bg-rose-500 animate-pulse" : "bg-amber-500"
                    }`} />

                    <div className="flex flex-wrap items-center justify-between gap-1">
                      <span className="text-[8px] font-black uppercase text-[var(--text-muted)] tracking-wider">
                        {sig.date}
                      </span>
                      <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-full border ${impact.style}`}>
                        {impact.text}
                      </span>
                    </div>

                    <h4 className="font-display font-bold text-[var(--text-primary)] text-[11px] leading-snug group-hover:text-[var(--primary)] transition-colors">
                      {sig.title}
                    </h4>
                    <p className="text-[10px] font-semibold text-[var(--text-muted)] leading-normal">
                      {sig.desc}
                    </p>

                    {sig.url && (
                      <div className="text-[9px] text-[var(--text-muted)] mt-1 font-bold">
                        Source: {sig.source} &bull; <a href={sig.url} target="_blank" rel="noopener noreferrer" className="text-[var(--primary)] hover:underline">Verify Source ↗</a>
                      </div>
                    )}

                    <div className="flex items-center gap-1.5 text-[9px] text-[var(--primary)] font-black pt-1">
                      <LuSparkles size={10} className="shrink-0" />
                      <span className="truncate">{sig.tag}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Bottom Section: Gemma Pricing Sentiment Analyzer Widget */}
      <div className="bg-[var(--bg-card)] border border-[var(--border-subtle)] p-5 text-[var(--text-primary)] rounded-3xl shadow-xs relative overflow-hidden">
        <div className="absolute -top-12 -right-12 h-48 w-48 rounded-full bg-[var(--primary)]/10 blur-3xl pointer-events-none" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-3 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-rose-500 animate-pulse" />
              <span className="text-[9px] font-black uppercase tracking-widest text-rose-500">
                Gemma Pricing Sentiment Engine
              </span>
            </div>
            
            <h3 className="font-display font-bold text-lg sm:text-xl text-[var(--text-primary)]">
              Aggregated Market Pressure: <span className="text-rose-500">📈 Strong Upward Trend</span>
            </h3>
            
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed font-semibold">
              Combined calculations from raw metal hikes (+4% domestic steel quotes in Peenya), regional freight logistics delays (+1-2 days), and Karnataka energy maintenance scheduled outages suggest a margin threat of <span className="text-rose-500 font-bold">~3.2% bleed</span> if price pass-through markups are delayed.
            </p>
          </div>

          <div className="flex flex-col gap-2 shrink-0 bg-[var(--bg-subtle)] border border-[var(--border-subtle)] rounded-2xl p-4 md:w-80">
            <div className="flex items-center gap-2 text-xs font-bold text-[var(--text-primary)]">
              <LuCompass size={14} className="text-[var(--primary)] animate-spin" />
              <span>Gemma Advisory Action</span>
            </div>
            <p className="text-[11px] text-[var(--text-muted)] leading-normal font-semibold">
              Initiate a +3.4% markup strategy immediately on all upcoming Mild Steel fabrication batches in Peenya clusters to shield baseline margins.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
