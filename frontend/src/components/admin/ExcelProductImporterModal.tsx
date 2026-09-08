import React, { useState } from "react";
import { X, FileSpreadsheet, Upload, Check, AlertCircle, Sparkles } from "lucide-react";
import { Product } from "../../types";

interface ExcelProductImporterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportProducts: (products: Product[]) => void;
}

export default function ExcelProductImporterModal({
  isOpen,
  onClose,
  onImportProducts
}: ExcelProductImporterModalProps) {
  const [pasteText, setPasteText] = useState("");
  const [parsedPreview, setParsedPreview] = useState<Product[]>([]);
  const [errorMsg, setErrorMsg] = useState("");

  if (!isOpen) return null;

  const parseTsvOrCsv = (text: string) => {
    try {
      const lines = text.trim().split("\n").filter(Boolean);
      const items: Product[] = [];

      lines.forEach((line, idx) => {
        // Support tab separated or comma separated
        const parts = line.includes("\t") 
          ? line.split("\t").map((p) => p.trim())
          : line.split(",").map((p) => p.trim());

        if (parts.length >= 2) {
          // If first item is header like "Sl No" or "Product", skip
          if (parts[0].toLowerCase().includes("sl no") || parts[0].toLowerCase().includes("product")) return;

          const slNo = parts[0] || String(idx + 1);
          const name = parts[1] || parts[0];
          const partNo = parts[2] || `SKU-${Math.floor(1000 + Math.random() * 9000)}`;
          const brand = parts[3] || "Generic OEM";
          const categoryRaw = parts[4] || "Air Conditioners";
          const priceRaw = parts[5] || "500";
          const qtyRaw = parts[6] || "1";

          const price = parseFloat(priceRaw.replace(/[^0-9.]/g, "")) || 500;
          const qty = parseInt(qtyRaw.replace(/[^0-9]/g, ""), 10) || 1;

          items.push({
            id: `prod-excel-${Date.now()}-${idx}`,
            name,
            category: categoryRaw.includes("Water") ? "Water Coolers & Dispensers" : categoryRaw.includes("Service") ? "Services & Spare Parts" : "Air Conditioners",
            brand,
            price,
            rating: 4.8,
            image: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?q=80&w=800&auto=format&fit=crop",
            description: `${name} (${partNo}) imported from Excel inventory ledger.`,
            inStock: qty > 0,
            minOrderQty: 1,
            modelId: partNo,
            series: `${brand} Series`,
            sourcingChannel: "DIRECT OEM WHOLESALE",
            certification: "CE / AHRI CERTIFIED",
            primaryRegion: "GCC & UAE MARKET",
            specifications: {
              "Part Number / SKU": partNo,
              "Stock Qty": String(qty),
              "Import Source": "Excel File Import"
            },
            features: [
              `Official Part No: ${partNo}`,
              `Direct Wholesale Rate`,
              `Imported Excel Record`
            ]
          });
        }
      });

      setParsedPreview(items);
      setErrorMsg("");
    } catch (err) {
      setErrorMsg("Failed to parse data format. Please check your Excel paste columns.");
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setPasteText(content);
      parseTsvOrCsv(content);
    };
    reader.readAsText(file);
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    setPasteText(text);
    parseTsvOrCsv(text);
  };

  const handleConfirmImport = () => {
    if (parsedPreview.length === 0) {
      alert("No valid product rows parsed yet. Please paste or upload your file.");
      return;
    }
    onImportProducts(parsedPreview);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[92vh] flex flex-col border border-slate-200 shadow-2xl overflow-hidden relative">
        
        {/* Modal Header */}
        <div className="px-6 py-4 bg-[#031b4e] text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-300 flex items-center justify-center border border-emerald-400/30">
              <FileSpreadsheet size={18} />
            </div>
            <div>
              <h2 className="font-extrabold text-sm uppercase tracking-wider text-white">Import Products from Excel / CSV</h2>
              <p className="text-[11px] text-blue-200">Upload `.xlsx`/`.csv` file or paste table rows directly from Excel</p>
            </div>
          </div>

          <button onClick={onClose} className="p-1 rounded-lg text-blue-200 hover:text-white hover:bg-white/10">
            <X size={18} />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          
          {/* File Upload Box */}
          <div className="border-2 border-dashed border-slate-300 rounded-xl p-4 bg-slate-50 text-center hover:bg-blue-50/50 hover:border-blue-400 transition-colors">
            <input
              type="file"
              accept=".csv,.tsv,.txt"
              onChange={handleFileUpload}
              className="hidden"
              id="excel-file-input"
            />
            <label htmlFor="excel-file-input" className="cursor-pointer flex flex-col items-center justify-center gap-1.5">
              <Upload size={22} className="text-blue-700" />
              <span className="text-xs font-extrabold text-slate-800">Click to Select Excel / CSV File</span>
              <span className="text-[10px] text-slate-400 font-semibold">Supports .csv, .tsv, and copied Excel tables</span>
            </label>
          </div>

          {/* Direct Paste Area */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              OR Paste Excel Spreadsheet Rows (Tab-Separated):
            </label>
            <textarea
              rows={5}
              placeholder="Paste Excel table rows here (e.g. Sl No, Product Name, Part No, Brand, Category, Cost, Qty)..."
              value={pasteText}
              onChange={handleTextChange}
              className="w-full p-3 border border-slate-300 rounded-xl text-xs font-mono bg-slate-50 focus:outline-none focus:border-blue-600"
            />
          </div>

          {errorMsg && (
            <div className="p-3 bg-red-50 text-red-700 border border-red-200 rounded-xl text-xs font-bold flex items-center gap-2">
              <AlertCircle size={15} />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Parsed Preview Counter */}
          {parsedPreview.length > 0 && (
            <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Check size={16} className="text-emerald-700" />
                <span className="text-xs font-extrabold text-emerald-900">
                  Successfully Parsed {parsedPreview.length} Product Records!
                </span>
              </div>
              <span className="text-[10px] bg-emerald-600 text-white font-mono font-bold px-2 py-0.5 rounded">
                Ready to Import
              </span>
            </div>
          )}

          {/* Preview Table */}
          {parsedPreview.length > 0 && (
            <div className="border border-slate-200 rounded-xl overflow-hidden max-h-48 overflow-y-auto">
              <table className="w-full text-left text-[11px] text-slate-700">
                <thead className="bg-slate-100 font-black uppercase text-[10px] text-slate-500">
                  <tr>
                    <th className="p-2">#</th>
                    <th className="p-2">Product Name</th>
                    <th className="p-2">Part No</th>
                    <th className="p-2">Brand</th>
                    <th className="p-2">Cost ($)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {parsedPreview.slice(0, 10).map((item, i) => (
                    <tr key={i}>
                      <td className="p-2 text-slate-400">{i + 1}</td>
                      <td className="p-2 font-extrabold text-slate-900">{item.name}</td>
                      <td className="p-2 font-mono text-slate-500">{item.modelId}</td>
                      <td className="p-2">{item.brand}</td>
                      <td className="p-2 font-bold text-blue-800">${item.price}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {parsedPreview.length > 10 && (
                <div className="p-2 bg-slate-50 text-center text-[10px] font-bold text-slate-400">
                  + {parsedPreview.length - 10} more products parsed...
                </div>
              )}
            </div>
          )}

        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-slate-200 flex items-center justify-between bg-slate-50">
          <button onClick={onClose} className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold rounded-xl">
            Cancel
          </button>
          <button
            onClick={handleConfirmImport}
            disabled={parsedPreview.length === 0}
            className={`px-5 py-2 rounded-xl text-xs font-black text-white shadow-md flex items-center gap-1.5 transition-all ${
              parsedPreview.length > 0 ? "bg-emerald-600 hover:bg-emerald-700 cursor-pointer" : "bg-slate-300 cursor-not-allowed"
            }`}
          >
            <Sparkles size={14} />
            <span>Import {parsedPreview.length} Products into Catalog</span>
          </button>
        </div>

      </div>
    </div>
  );
}
