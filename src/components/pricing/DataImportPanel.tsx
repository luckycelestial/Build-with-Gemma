"use client";

import { useState, useRef } from "react";
import { LuUpload, LuFileSpreadsheet, LuFileText, LuX, LuLoader, LuCheck } from "react-icons/lu";

interface DataImportPanelProps {
  onDataImported: () => void;
}

export default function DataImportPanel({ onDataImported }: DataImportPanelProps) {
  const [isOpen, setIsOpen] = useState(true);
  const [importStatus, setImportStatus] = useState<"idle" | "parsing" | "preview" | "success" | "error">("idle");
  const [fileName, setFileName] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [previewData, setPreviewData] = useState<{ materials: any[]; orders: any[] }>({ materials: [], orders: [] });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleZoneClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setImportStatus("parsing");
    setErrorMessage("");

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/pricing/import", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const errText = await res.json();
        throw new Error(errText.error || "Failed to parse document");
      }

      const result = await res.json();
      setPreviewData({
        materials: result.materials || [],
        orders: result.orders || []
      });
      setImportStatus("preview");
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || "An error occurred during parsing.");
      setImportStatus("error");
    }
  };

  const confirmImport = () => {
    setImportStatus("success");
    setTimeout(() => {
      onDataImported();
      setIsOpen(false);
      setImportStatus("idle");
    }, 1500);
  };

  return (
    <div className="bg-[var(--bg-card)] border border-[var(--border-subtle)] p-6 rounded-3xl shadow-xs text-[var(--text-primary)]">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-[var(--primary-subtle)] text-[var(--primary)] flex items-center justify-center">
            <LuFileSpreadsheet size={18} />
          </div>
          <div>
            <h3 className="font-display font-bold text-[var(--text-primary)] text-sm sm:text-base">
              Import Billing & Quote Data
            </h3>
            <p className="text-xs font-medium text-[var(--text-muted)]">
              Upload supplier PDF invoices, Excel spreadsheets, or past prices to ground calculations
            </p>
          </div>
        </div>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="text-xs font-bold text-[var(--primary)] hover:underline cursor-pointer uppercase tracking-wider font-display"
        >
          {isOpen ? "Hide Panel" : "Expand"}
        </button>
      </div>

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept=".pdf,.csv,.xlsx,.xls"
        className="hidden"
      />

      {isOpen && (
        <div className="mt-6 pt-6 border-t border-[var(--border-subtle)] transition-all duration-300">
          {importStatus === "idle" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div 
                onClick={handleZoneClick}
                className="border-2 border-dashed border-[var(--border-subtle)] hover:border-[var(--primary)]/50 bg-[var(--bg-subtle)] hover:bg-[var(--bg-card-hover)] rounded-2xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-200 group"
              >
                <LuUpload size={32} className="text-[var(--text-muted)] group-hover:text-[var(--primary)] transition-colors mb-3" />
                <span className="text-xs font-bold text-[var(--text-primary)] mb-1">Upload PDF Supplier Invoice / Quote</span>
                <span className="text-[10px] text-[var(--text-muted)]">Extract pricing arrays and item terms automatically</span>
              </div>

              <div 
                onClick={handleZoneClick}
                className="border-2 border-dashed border-[var(--border-subtle)] hover:border-[var(--primary)]/50 bg-[var(--bg-subtle)] hover:bg-[var(--bg-card-hover)] rounded-2xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-200 group"
              >
                <LuFileSpreadsheet size={32} className="text-[var(--text-muted)] group-hover:text-[var(--primary)] transition-colors mb-3" />
                <span className="text-xs font-bold text-[var(--text-primary)] mb-1">Upload Excel Tooling/Material Log</span>
                <span className="text-[10px] text-[var(--text-muted)]">Directly sync bulk stock item lists</span>
              </div>
            </div>
          )}

          {importStatus === "parsing" && (
            <div className="flex flex-col items-center justify-center py-10 space-y-4">
              <LuLoader size={36} className="text-[var(--primary)] animate-spin" />
              <div className="text-center">
                <p className="text-sm font-bold text-[var(--text-primary)]">Processing {fileName}...</p>
                <p className="text-xs text-[var(--text-muted)]">Gemma is running extraction logic and updating database schemas...</p>
              </div>
            </div>
          )}

          {importStatus === "preview" && (
            <div className="space-y-6 animate-fade-in">
              <div className="bg-amber-500/15 border border-amber-500/30 rounded-2xl p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <LuFileText className="text-amber-500 animate-pulse" size={24} />
                  <div>
                    <h4 className="text-xs font-black uppercase text-amber-600 dark:text-amber-400 tracking-wider">Review Extracted Records</h4>
                    <p className="text-[10px] text-[var(--text-muted)] font-semibold">{fileName} parsed successfully.</p>
                  </div>
                </div>
                <button
                  onClick={() => setImportStatus("idle")}
                  className="text-[var(--text-muted)] hover:text-[var(--text-primary)] cursor-pointer"
                >
                  <LuX size={16} />
                </button>
              </div>

              <div className="overflow-x-auto border border-[var(--border-subtle)] rounded-2xl">
                <table className="min-w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-[var(--bg-subtle)] border-b border-[var(--border-subtle)] text-[10px] font-black uppercase tracking-wider text-[var(--text-muted)]">
                      <th className="p-4">Extracted Item</th>
                      <th className="p-4">Base Cost</th>
                      <th className="p-4">Quoted / Sell Price</th>
                      <th className="p-4">Supplier / Client</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border-subtle)] text-[var(--text-muted)] font-semibold">
                    {previewData.materials.map((mat, idx) => (
                      <tr key={`mat-${idx}`}>
                        <td className="p-4 font-bold text-[var(--text-primary)]">{mat.name}</td>
                        <td className="p-4">₹{mat.currentCost}/unit</td>
                        <td className="p-4">₹{mat.marketCost}/unit</td>
                        <td className="p-4">{mat.supplier}</td>
                      </tr>
                    ))}
                    {previewData.orders.map((ord, idx) => (
                      <tr key={`ord-${idx}`}>
                        <td className="p-4 font-bold text-[var(--text-primary)]">Order ID: {ord.id}</td>
                        <td className="p-4">Margin Check</td>
                        <td className="p-4 text-emerald-600 dark:text-emerald-400">{ord.margin}</td>
                        <td className="p-4">{ord.client}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setImportStatus("idle")}
                  className="px-4 py-2 bg-[var(--bg-subtle)] hover:bg-[var(--bg-card-hover)] text-[var(--text-primary)] text-xs font-bold rounded-full transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmImport}
                  className="px-5 py-2 bg-[var(--primary)] hover:bg-[var(--primary-dark)] text-white text-xs font-bold rounded-full transition-colors shadow-xs cursor-pointer"
                >
                  Ground Database Records
                </button>
              </div>
            </div>
          )}

          {importStatus === "error" && (
            <div className="space-y-4 py-6 text-center">
              <div className="text-rose-500 font-bold text-xs p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl">
                {errorMessage}
              </div>
              <button
                onClick={() => setImportStatus("idle")}
                className="px-5 py-2 bg-[var(--bg-subtle)] text-[var(--text-primary)] text-xs font-bold rounded-full cursor-pointer"
              >
                Try Again
              </button>
            </div>
          )}

          {importStatus === "success" && (
            <div className="flex flex-col items-center justify-center py-8 space-y-3">
              <div className="h-10 w-10 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shadow-xs">
                <LuCheck size={20} />
              </div>
              <div className="text-center">
                <p className="text-sm font-bold text-[var(--text-primary)]">Data Grounded Successfully!</p>
                <p className="text-xs text-[var(--text-muted)]">PostgreSQL models updated. Dashboard metrics reloading...</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
