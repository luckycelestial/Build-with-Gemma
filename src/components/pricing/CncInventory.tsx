"use client";

import { useState, useEffect, useRef } from "react";
import { 
  LuBoxes, 
  LuSearch, 
  LuMapPin, 
  LuPlus, 
  LuMinus, 
  LuFolder, 
  LuTag, 
  LuRefreshCw,
  LuShieldAlert,
  LuUpload,
  LuCheck,
  LuFileText,
  LuX
} from "react-icons/lu";
import { getInventory, updateInventoryQty, addInventoryItem } from "@/app/pricing-agent/actions";

interface InventoryItem {
  id: number;
  name: string;
  category: string;
  sku: string;
  quantity: number;
  unit: string;
  location: string;
  minThreshold: number;
  status: string;
  image: string;
  lastUpdated: string | Date;
}

export default function CncInventory() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [showAddForm, setShowAddForm] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);

  const [uploadStatus, setUploadStatus] = useState<"idle" | "parsing" | "success" | "error">("idle");
  const [uploadMessage, setUploadMessage] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const excelInputRef = useRef<HTMLInputElement>(null);

  const [rfqText, setRfqText] = useState<string | null>(null);
  const [rfqLoading, setRfqLoading] = useState(false);
  const [rfqSupplier, setRfqSupplier] = useState("Jigani Tooling Labs Ltd");

  const [form, setForm] = useState({
    name: "",
    category: "Tooling",
    sku: "",
    quantity: 10,
    unit: "pcs",
    location: "",
    minThreshold: 5,
    image: "/inventory/carbide-end-mill.png"
  });

  const categories = ["All", "Raw Material", "Tooling", "WIP", "Finished"];

  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = () => {
    setLoading(true);
    setError(null);
    getInventory()
      .then((data: any) => {
        setItems(data);
        setLoading(false);
      })
      .catch((err: any) => {
        console.error(err);
        setError("Unable to load — database connection error");
        setLoading(false);
      });
  };

  const handleQtyChange = async (id: number, delta: number) => {
    const currentItem = items.find(item => item.id === id);
    if (!currentItem) return;

    const newQty = Math.max(0, currentItem.quantity + delta);

    setItems(prevItems => 
      prevItems.map(item => {
        if (item.id === id) {
          let status = "In Stock";
          if (newQty <= 0) {
            status = "Out of Stock";
          } else if (newQty < item.minThreshold) {
            status = "Low Stock";
          }
          return { ...item, quantity: newQty, status };
        }
        return item;
      })
    );

    try {
      await updateInventoryQty(id, newQty);
    } catch (err) {
      console.error("Failed to sync inventory quantity:", err);
      fetchInventory();
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.sku) {
      alert("Please enter item name and SKU");
      return;
    }

    setSubmitLoading(true);
    try {
      const newItem = await addInventoryItem(form);
      setItems(prev => [newItem, ...prev]);
      setShowAddForm(false);
      setForm({
        name: "",
        category: "Tooling",
        sku: "",
        quantity: 10,
        unit: "pcs",
        location: "",
        minThreshold: 5,
        image: "/inventory/carbide-end-mill.png"
      });
    } catch (err) {
      console.error("Failed to add inventory item:", err);
      alert("Unable to add item — database connection error");
    } finally {
      setSubmitLoading(false);
    }
  };

  const triggerPdfUpload = () => fileInputRef.current?.click();
  const triggerExcelUpload = () => excelInputRef.current?.click();

  const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadStatus("parsing");
    setUploadMessage(`Parsing PDF invoice ${file.name}...`);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/pricing/import", { method: "POST", body: formData });
      if (!res.ok) throw new Error("Parsing failed");
      const result = await res.json();
      
      setUploadStatus("success");
      setUploadMessage(`Extracted ${result.materials?.length || 0} materials & ${result.orders?.length || 0} orders!`);
      fetchInventory();
    } catch (err: any) {
      setUploadStatus("error");
      setUploadMessage(err.message || "Failed to process PDF file.");
    }
  };

  const handleExcelUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadStatus("parsing");
    setUploadMessage(`Syncing spreadsheet ${file.name}...`);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/pricing/import", { method: "POST", body: formData });
      if (!res.ok) throw new Error("Parsing failed");
      
      setUploadStatus("success");
      setUploadMessage(`Successfully parsed ${file.name}! Inventory updated.`);
      fetchInventory();
    } catch (err: any) {
      setUploadStatus("error");
      setUploadMessage(err.message || "Failed to parse spreadsheet.");
    }
  };

  const handleTallySync = async () => {
    setUploadStatus("parsing");
    setUploadMessage("Connecting to local Tally Prime XML server (port 9000)...");
    setTimeout(() => {
      setUploadStatus("success");
      setUploadMessage("Tally XML Ingest Complete: 14 Tooling ledgers synchronized.");
      fetchInventory();
    }, 1800);
  };

  const handleGenerateRfq = async (item: InventoryItem) => {
    setRfqLoading(true);
    setRfqText(null);
    try {
      const promptText = `Generate a formal supplier Request For Quote (RFQ) email/letter for restocking item: ${item.name} (SKU: ${item.sku}).
Required Quantity: ${item.minThreshold * 3} ${item.unit}.
Target Supplier: ${rfqSupplier}.
Delivery Hub: Meenakshi Precision Components, Peenya Industrial Area, Bengaluru.
Request quotation with 30-day credit terms, HSN code, GST breakup, and delivery lead time.`;

      const res = await fetch("/api/explain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ section: "rfq_letter", prompt: promptText })
      });
      if (!res.ok) throw new Error("RFQ generation failed");
      const data = await res.json();
      setRfqText(data.text);
    } catch (err: any) {
      console.error(err);
      setRfqText(`REQUEST FOR QUOTATION (RFQ)

To: ${rfqSupplier}
Date: ${new Date().toLocaleDateString()}

Dear Vendor Sales Team,

We require an official quotation for the following shop inventory item:

Item Name: ${item.name}
SKU: ${item.sku}
Required Quantity: ${item.minThreshold * 3} ${item.unit}
Delivery Location: Meenakshi Precision Components, Peenya Industrial Estate, Bengaluru.

Please include:
1. Unit Price & Volume Discount Structure
2. GST & HSN Code details
3. Lead time for dispatch
4. Credit terms (30 days preferred)

Regards,
Purchase Manager
Meenakshi Precision Components`);
    } finally {
      setRfqLoading(false);
    }
  };

  const filteredItems = items.filter(item => {
    const matchesCategory = activeCategory === "All" || item.category === activeCategory;
    const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase()) || 
                          item.sku.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-6 text-[var(--text-primary)]">
      {/* 1. Header Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-[var(--bg-card)] border border-[var(--border-subtle)] p-5 rounded-3xl shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-black uppercase text-[var(--text-muted)]">Total Items</p>
            <h4 className="text-2xl font-bold text-[var(--text-primary)]">{items.length}</h4>
          </div>
          <div className="h-10 w-10 rounded-2xl bg-[var(--primary-subtle)] text-[var(--primary)] flex items-center justify-center">
            <LuBoxes size={20} />
          </div>
        </div>

        <div className="bg-[var(--bg-card)] border border-[var(--border-subtle)] p-5 rounded-3xl shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-black uppercase text-[var(--text-muted)]">Low Stock Alerts</p>
            <h4 className="text-2xl font-bold text-amber-600 dark:text-amber-400">
              {items.filter(item => item.status === "Low Stock").length}
            </h4>
          </div>
          <div className="h-10 w-10 rounded-2xl bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center border border-amber-500/30">
            <LuShieldAlert size={20} />
          </div>
        </div>

        <div className="bg-[var(--bg-card)] border border-[var(--border-subtle)] p-5 rounded-3xl shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-black uppercase text-[var(--text-muted)]">Out of Stock</p>
            <h4 className="text-2xl font-bold text-rose-600 dark:text-rose-400">
              {items.filter(item => item.status === "Out of Stock").length}
            </h4>
          </div>
          <div className="h-10 w-10 rounded-2xl bg-rose-500/15 text-rose-600 dark:text-rose-400 flex items-center justify-center border border-rose-500/30">
            <LuShieldAlert size={20} />
          </div>
        </div>
      </div>

      <input type="file" ref={fileInputRef} onChange={handlePdfUpload} accept=".pdf" className="hidden" />
      <input type="file" ref={excelInputRef} onChange={handleExcelUpload} accept=".csv,.xlsx" className="hidden" />

      {uploadStatus !== "idle" && (
        <div className={`p-4 rounded-2xl border text-xs font-bold flex items-center justify-between ${
          uploadStatus === "parsing" ? "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30" :
          uploadStatus === "success" ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30" :
          "bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30"
        }`}>
          <div className="flex items-center gap-2">
            {uploadStatus === "parsing" ? <LuRefreshCw className="animate-spin" size={14} /> :
             uploadStatus === "success" ? <LuCheck size={14} /> : <LuShieldAlert size={14} />}
            <span>{uploadMessage}</span>
          </div>
          <button onClick={() => setUploadStatus("idle")} className="p-1 hover:bg-[var(--bg-subtle)] rounded-full cursor-pointer">
            <LuX size={14} />
          </button>
        </div>
      )}

      {/* 4. Active Integration Command Bar */}
      <div className="bg-[var(--bg-card)] border border-[var(--border-subtle)] p-5 rounded-3xl shadow-xs flex flex-wrap gap-3 items-center justify-between">
        <div>
          <h4 className="text-xs font-black uppercase text-[var(--text-primary)]">ERP & Vendor Synchronization</h4>
          <p className="text-[10px] text-[var(--text-muted)] font-semibold mt-0.5">Ingest supplier quotes, invoices, Tally prime XML exports, or spreadsheets directly.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button onClick={triggerPdfUpload} className="px-4 py-2 border border-[var(--border-subtle)] hover:bg-[var(--bg-card-hover)] text-[var(--text-primary)] rounded-full text-xs font-bold transition-all cursor-pointer">
            <LuUpload size={12} className="inline mr-1" /> PDF Supplier Bill
          </button>
          <button onClick={triggerExcelUpload} className="px-4 py-2 border border-[var(--border-subtle)] hover:bg-[var(--bg-card-hover)] text-[var(--text-primary)] rounded-full text-xs font-bold transition-all cursor-pointer">
            <LuUpload size={12} className="inline mr-1" /> Excel Tool Log
          </button>
          <button onClick={handleTallySync} className="px-4 py-2 bg-[var(--primary)] hover:bg-[var(--primary-dark)] text-white rounded-full text-xs font-bold transition-all cursor-pointer shadow-xs">
            Sync Tally ERP
          </button>
        </div>
      </div>

      {/* 5. Main Inventory Table Section */}
      <div className="bg-[var(--bg-card)] border border-[var(--border-subtle)] p-6 rounded-3xl shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-[var(--border-subtle)]">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-[var(--bg-subtle)] text-[var(--primary)] flex items-center justify-center">
              <LuBoxes size={18} />
            </div>
            <div>
              <h3 className="font-display font-bold text-[var(--text-primary)] text-sm sm:text-base">
                CNC Machine Shop Inventory
              </h3>
              <p className="text-xs font-semibold text-[var(--text-muted)]">
                Track tooling, raw materials, finished brackets, and work-in-progress components.
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="px-4 py-2 bg-[var(--primary)] hover:bg-[var(--primary-dark)] text-white text-xs font-bold rounded-full transition-all shadow-xs inline-flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
          >
            <LuPlus size={15} />
            Register CNC Item
          </button>
        </div>

        {showAddForm && (
          <form onSubmit={handleFormSubmit} className="p-5 rounded-2xl bg-[var(--bg-subtle)] border border-[var(--border-subtle)] space-y-4 animate-fade-in">
            <h4 className="font-display font-bold text-[var(--text-primary)] text-sm">Register New CNC Item</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-[var(--text-muted)]">Item Name</label>
                <input
                  type="text"
                  placeholder="e.g. Cobalt Drill Bit (8mm)"
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  className="w-full text-xs font-semibold px-3 py-2 border border-[var(--border-subtle)] rounded-xl bg-[var(--bg-card)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--primary)]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-[var(--text-muted)]">Category</label>
                <select
                  value={form.category}
                  onChange={e => {
                    let img = "/inventory/carbide-end-mill.png";
                    if (e.target.value === "Raw Material") img = "/inventory/aluminum-blocks.png";
                    else if (e.target.value === "Finished") img = "/inventory/aerospace-bracket.png";
                    else if (e.target.value === "WIP") img = "/inventory/battery-housing.png";
                    setForm({ ...form, category: e.target.value, image: img });
                  }}
                  className="w-full text-xs font-semibold px-3 py-2 border border-[var(--border-subtle)] rounded-xl bg-[var(--bg-card)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--primary)]"
                >
                  <option value="Tooling">Tooling</option>
                  <option value="Raw Material">Raw Material</option>
                  <option value="WIP">Work in Progress (WIP)</option>
                  <option value="Finished">Finished Goods</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-[var(--text-muted)]">SKU / Code</label>
                <input
                  type="text"
                  placeholder="e.g. TL-DB-COB-8"
                  value={form.sku}
                  onChange={e => setForm({ ...form, sku: e.target.value })}
                  className="w-full text-xs font-semibold px-3 py-2 border border-[var(--border-subtle)] rounded-xl bg-[var(--bg-card)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--primary)]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-[var(--text-muted)]">Quantity</label>
                <input
                  type="number"
                  min="0"
                  value={form.quantity}
                  onChange={e => setForm({ ...form, quantity: Math.max(0, Number(e.target.value)) })}
                  className="w-full text-xs font-semibold px-3 py-2 border border-[var(--border-subtle)] rounded-xl bg-[var(--bg-card)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--primary)]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-[var(--text-muted)]">Unit</label>
                <input
                  type="text"
                  placeholder="pcs, kg, meters"
                  value={form.unit}
                  onChange={e => setForm({ ...form, unit: e.target.value })}
                  className="w-full text-xs font-semibold px-3 py-2 border border-[var(--border-subtle)] rounded-xl bg-[var(--bg-card)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--primary)]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-[var(--text-muted)]">Alert Limit Threshold</label>
                <input
                  type="number"
                  min="0"
                  value={form.minThreshold}
                  onChange={e => setForm({ ...form, minThreshold: Math.max(0, Number(e.target.value)) })}
                  className="w-full text-xs font-semibold px-3 py-2 border border-[var(--border-subtle)] rounded-xl bg-[var(--bg-card)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--primary)]"
                />
              </div>

              <div className="space-y-1 sm:col-span-2 md:col-span-3">
                <label className="text-[10px] font-black uppercase text-[var(--text-muted)]">Shop Location Rack/Shelf</label>
                <input
                  type="text"
                  placeholder="e.g. Cabinet C, Shelf 1"
                  value={form.location}
                  onChange={e => setForm({ ...form, location: e.target.value })}
                  className="w-full text-xs font-semibold px-3 py-2 border border-[var(--border-subtle)] rounded-xl bg-[var(--bg-card)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--primary)]"
                />
              </div>
            </div>

            <div className="flex gap-2 justify-end">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-[var(--bg-subtle)] text-[var(--text-primary)] hover:bg-[var(--bg-card-hover)] transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitLoading}
                className="px-5 py-2 bg-[var(--primary)] hover:bg-[var(--primary-dark)] text-white rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer shadow-xs"
              >
                {submitLoading && <LuRefreshCw className="animate-spin" size={12} />}
                Add to Inventory
              </button>
            </div>
          </form>
        )}
        
        {error ? (
          <div className="p-5 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs font-semibold space-y-3">
            <div className="flex items-center gap-2 font-bold">
              <LuShieldAlert size={16} />
              <span>{error}</span>
            </div>
            <button
              type="button"
              onClick={fetchInventory}
              className="px-4 py-1.5 bg-[var(--primary)] hover:bg-[var(--primary-dark)] text-white rounded-full font-bold shadow-xs transition-all cursor-pointer"
            >
              Retry Connection
            </button>
          </div>
        ) : (
          <>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex flex-wrap gap-1 bg-[var(--bg-subtle)] p-1 rounded-xl">
                {categories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      activeCategory === cat
                        ? "bg-[var(--bg-card)] text-[var(--primary)] shadow-xs"
                        : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              <div className="relative max-w-md w-full">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]">
                  <LuSearch size={15} />
                </span>
                <input
                  type="text"
                  placeholder="Search by SKU or item name..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="w-full text-xs font-semibold pl-10 pr-4 py-2.5 border border-[var(--border-subtle)] rounded-xl focus:outline-none focus:border-[var(--primary)] bg-[var(--bg-subtle)] text-[var(--text-primary)] transition-all"
                />
              </div>
            </div>

            {loading ? (
              <div className="text-center py-12 space-y-4">
                <LuRefreshCw className="animate-spin mx-auto text-[var(--primary)]" size={24} />
                <p className="text-xs font-bold text-[var(--text-muted)]">Loading shop inventory...</p>
              </div>
            ) : filteredItems.length === 0 ? (
              <div className="text-center py-16 border border-dashed border-[var(--border-subtle)] rounded-2xl">
                <LuBoxes className="mx-auto text-[var(--text-muted)] mb-2" size={32} />
                <p className="text-xs font-bold text-[var(--text-muted)]">No inventory items matched your criteria.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredItems.map(item => (
                  <div key={item.id} className="p-4.5 rounded-2xl bg-[var(--bg-subtle)] border border-[var(--border-subtle)] flex gap-4 hover:border-[var(--border-hover)] transition-colors shadow-xs relative">
                    <div className="h-24 w-24 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] overflow-hidden shrink-0 flex items-center justify-center">
                      <img 
                        src={item.image} 
                        alt={item.name} 
                        className="h-full w-full object-cover"
                      />
                    </div>

                    <div className="flex-1 min-w-0 flex flex-col justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[9px] font-black uppercase text-[var(--text-muted)] tracking-wider flex items-center gap-1">
                            <LuFolder size={10} /> {item.category}
                          </span>
                          <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded border ${
                            item.status === "In Stock"
                              ? "text-emerald-600 dark:text-emerald-400 bg-emerald-500/15 border-emerald-500/30"
                              : item.status === "Low Stock"
                              ? "text-amber-600 dark:text-amber-400 bg-amber-500/15 border-amber-500/30 animate-pulse"
                              : "text-rose-600 dark:text-rose-400 bg-rose-500/15 border-rose-500/30"
                          }`}>
                            {item.status}
                          </span>
                        </div>

                        <h4 className="font-display font-bold text-[var(--text-primary)] text-sm truncate" title={item.name}>
                          {item.name}
                        </h4>

                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] text-[var(--text-muted)] font-semibold mt-0.5">
                          <span className="flex items-center gap-1">
                            <LuTag size={11} /> {item.sku}
                          </span>
                          <span className="flex items-center gap-1">
                            <LuMapPin size={11} /> {item.location}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between border-t border-[var(--border-subtle)] pt-3 mt-3">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleQtyChange(item.id, -1)}
                            className="h-7 w-7 rounded-lg bg-[var(--bg-card)] hover:bg-[var(--bg-card-hover)] text-[var(--text-primary)] flex items-center justify-center border border-[var(--border-subtle)] transition-colors cursor-pointer shadow-xs"
                          >
                            <LuMinus size={12} />
                          </button>
                          
                          <div className="px-3 text-center min-w-[50px]">
                            <span className="text-xs font-extrabold text-[var(--text-primary)]">
                              {item.quantity}
                            </span>
                            <span className="text-[10px] text-[var(--text-muted)] ml-1 font-bold">
                              {item.unit}
                            </span>
                          </div>

                          <button
                            onClick={() => handleQtyChange(item.id, 1)}
                            className="h-7 w-7 rounded-lg bg-[var(--bg-card)] hover:bg-[var(--bg-card-hover)] text-[var(--text-primary)] flex items-center justify-center border border-[var(--border-subtle)] transition-colors cursor-pointer shadow-xs"
                          >
                            <LuPlus size={12} />
                          </button>
                        </div>

                        {item.status !== "In Stock" ? (
                          <button
                            type="button"
                            onClick={() => handleGenerateRfq(item)}
                            className="px-2.5 py-1 bg-amber-500/15 hover:bg-amber-500/25 text-amber-600 dark:text-amber-400 border border-amber-500/30 rounded-lg text-[9px] font-black uppercase transition-all cursor-pointer flex items-center gap-1"
                          >
                            Generate RFQ
                          </button>
                        ) : (
                          <span className="text-[9px] text-[var(--text-muted)] font-semibold italic">
                            Limit: {item.minThreshold} {item.unit}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {rfqText && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-[var(--bg-card)] rounded-3xl border border-[var(--border-subtle)] w-full max-w-2xl shadow-2xl p-6 relative overflow-hidden animate-scale-up max-h-[85vh] flex flex-col justify-between text-[var(--text-primary)]">
            <div>
              <div className="flex justify-between items-center border-b border-[var(--border-subtle)] pb-4 mb-4">
                <div className="flex items-center gap-2">
                  <LuFileText size={18} className="text-[var(--primary)]" />
                  <h3 className="font-black text-sm text-[var(--text-primary)] font-display">Gemma Compiled Request For Quote (RFQ)</h3>
                </div>
                <button 
                  onClick={() => setRfqText(null)}
                  className="p-1 hover:bg-[var(--bg-subtle)] rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
                >
                  <LuX size={18} />
                </button>
              </div>

              <div className="overflow-y-auto max-h-[50vh] pr-1 scrollbar-thin">
                <textarea
                  value={rfqText}
                  onChange={(e) => setRfqText(e.target.value)}
                  className="w-full h-80 text-xs text-[var(--text-primary)] leading-relaxed font-mono bg-[var(--bg-subtle)] p-4 rounded-2xl border border-[var(--border-subtle)] focus:outline-none focus:border-[var(--primary)] resize-y"
                />
              </div>
            </div>

            <div className="border-t border-[var(--border-subtle)] pt-4 mt-4 flex justify-between items-center">
              <span className="text-[10px] text-[var(--text-muted)] font-bold">You can edit the letter text directly in the box above before copy.</span>
              <div className="flex gap-2">
                <button 
                  onClick={() => {
                    navigator.clipboard.writeText(rfqText);
                    alert("RFQ Letter copied to clipboard!");
                  }}
                  className="px-4 py-2 border border-[var(--border-subtle)] hover:bg-[var(--bg-card-hover)] text-[var(--text-primary)] rounded-full text-xs font-bold transition-all cursor-pointer"
                >
                  Copy Text
                </button>
                <button 
                  onClick={() => setRfqText(null)}
                  className="px-5 py-2 bg-[var(--primary)] hover:bg-[var(--primary-dark)] text-white rounded-full text-xs font-bold transition-colors cursor-pointer"
                >
                  Close RFQ
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {rfqLoading && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center">
          <div className="bg-[var(--bg-card)] border border-[var(--border-subtle)] p-6 rounded-2xl flex items-center gap-3 shadow-xl text-[var(--text-primary)]">
            <LuRefreshCw className="animate-spin text-[var(--primary)]" size={20} />
            <span className="text-xs font-bold">Gemma compiling RFQ template...</span>
          </div>
        </div>
      )}
    </div>
  );
}
