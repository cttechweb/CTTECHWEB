import React, { useState, useMemo } from "react";
import { 
  Plus, Search, Filter, Edit3, Trash2, CheckCircle2, 
  AlertCircle, Upload, Download, RefreshCw, Layers, ShieldCheck,
  Copy, Check, FileSpreadsheet, X, Sparkles, ExternalLink, Zap
} from "lucide-react";
import { SparePart } from "../../types";
import { 
  getSpareParts, saveSpareParts, addSparePart, 
  updateSparePart, deleteSparePart, bulkImportSpareParts, 
  resetDefaultSpareParts 
} from "../../services/sparePartsService";

interface AdminSparePartsManagerProps {
  onShowToast?: (msg: string) => void;
}

export default function AdminSparePartsManager({ onShowToast }: AdminSparePartsManagerProps) {
  const [parts, setParts] = useState<SparePart[]>(() => getSpareParts());
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBrand, setSelectedBrand] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [copiedPartNo, setCopiedPartNo] = useState<string | null>(null);

  // Modal states
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingPart, setEditingPart] = useState<SparePart | null>(null);
  const [isBulkImportOpen, setIsBulkImportOpen] = useState(false);

  // Form State for Manual Add / Edit
  const [formData, setFormData] = useState<Partial<SparePart>>({
    partNumber: "",
    title: "",
    brand: "Samsung",
    category: "PCBs & Control Boards",
    subCategory: "",
    description: "",
    compatibility: "",
    image: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=700&q=80",
    inStock: true,
    price: 0,
    badge: "OEM Genuine"
  });

  // Bulk Import Text State
  const [importPasteText, setImportPasteText] = useState("");
  const [replaceExisting, setReplaceExisting] = useState(false);

  // Reload data
  const refreshParts = () => {
    setParts(getSpareParts());
  };

  // Unique Brands & Categories for filters
  const { brandsList, categoriesList } = useMemo(() => {
    const bSet = new Set<string>();
    const cSet = new Set<string>();
    parts.forEach(p => {
      if (p.brand) bSet.add(p.brand);
      if (p.category) cSet.add(p.category);
    });
    return {
      brandsList: Array.from(bSet).sort(),
      categoriesList: Array.from(cSet).sort()
    };
  }, [parts]);

  // Filtered Parts
  const filteredParts = useMemo(() => {
    return parts.filter(p => {
      if (selectedBrand !== "all" && p.brand !== selectedBrand) return false;
      if (selectedCategory !== "all" && p.category !== selectedCategory) return false;

      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase().trim();
        return (
          p.title.toLowerCase().includes(q) ||
          p.partNumber.toLowerCase().includes(q) ||
          p.brand.toLowerCase().includes(q) ||
          p.compatibility.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [parts, selectedBrand, selectedCategory, searchTerm]);

  // Handle open add modal
  const handleOpenAdd = () => {
    setEditingPart(null);
    setFormData({
      partNumber: "",
      title: "",
      brand: "Samsung",
      category: "PCBs & Control Boards",
      subCategory: "",
      description: "",
      compatibility: "",
      image: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=700&q=80",
      inStock: true,
      price: 0,
      badge: "OEM Genuine"
    });
    setIsEditModalOpen(true);
  };

  // Handle open edit modal
  const handleOpenEdit = (part: SparePart) => {
    setEditingPart(part);
    setFormData({
      partNumber: part.partNumber,
      title: part.title,
      brand: part.brand,
      category: part.category,
      subCategory: part.subCategory || "",
      description: part.description,
      compatibility: part.compatibility,
      image: part.image,
      inStock: part.inStock,
      price: part.price || 0,
      badge: part.badge || ""
    });
    setIsEditModalOpen(true);
  };

  // Save Add/Edit
  const handleSavePart = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.partNumber || !formData.title || !formData.brand) {
      alert("Part Number, Title, and Brand are mandatory fields.");
      return;
    }

    if (editingPart) {
      updateSparePart(editingPart.id, formData);
      if (onShowToast) onShowToast(`Updated spare part "${formData.title}"`);
    } else {
      addSparePart(formData as any);
      if (onShowToast) onShowToast(`Added new spare part "${formData.title}"`);
    }

    setIsEditModalOpen(false);
    refreshParts();
  };

  // Toggle inStock
  const handleToggleStock = (part: SparePart) => {
    const nextStock = !part.inStock;
    updateSparePart(part.id, { inStock: nextStock });
    refreshParts();
    if (onShowToast) {
      onShowToast(`Marked ${part.partNumber} as ${nextStock ? "IN STOCK" : "OUT OF STOCK"}`);
    }
  };

  // Delete part
  const handleDeletePart = (part: SparePart) => {
    if (window.confirm(`Are you sure you want to delete "${part.title}" (Part #${part.partNumber})?`)) {
      deleteSparePart(part.id);
      refreshParts();
      if (onShowToast) onShowToast(`Deleted part ${part.partNumber}`);
    }
  };

  // Reset to default seed
  const handleResetDefaults = () => {
    if (window.confirm("Reset catalog back to factory default spare parts? Any un-exported edits will be overwritten.")) {
      resetDefaultSpareParts();
      refreshParts();
      if (onShowToast) onShowToast("Reset catalog to default genuine OEM spare parts!");
    }
  };

  // Bulk Import Parser (Supports TSV copied from Excel/Google Sheets or CSV)
  const handleExecuteBulkImport = () => {
    if (!importPasteText.trim()) {
      alert("Please paste data or upload a file first.");
      return;
    }

    const lines = importPasteText.trim().split(/\r?\n/).filter(l => l.trim().length > 0);
    if (lines.length === 0) return;

    // Detect delimiter: tab or comma
    const firstLine = lines[0];
    const isTab = firstLine.includes("\t");
    const delimiter = isTab ? "\t" : ",";

    // Check if first line is a header
    const lowerFirst = firstLine.toLowerCase();
    const hasHeader = lowerFirst.includes("part") || lowerFirst.includes("title") || lowerFirst.includes("name") || lowerFirst.includes("brand");

    const dataRows = hasHeader ? lines.slice(1) : lines;

    const importedParts: Partial<SparePart>[] = [];

    dataRows.forEach((rowStr) => {
      const cols = isTab 
        ? rowStr.split("\t").map(c => c.trim().replace(/^["']|["']$/g, ""))
        : rowStr.split(",").map(c => c.trim().replace(/^["']|["']$/g, ""));

      if (cols.length >= 2) {
        // Expected column order in standard spreadsheet:
        // Col 0: PartNumber
        // Col 1: Title
        // Col 2: Brand
        // Col 3: Category
        // Col 4: Compatibility
        // Col 5: Price
        // Col 6: Description
        // Col 7: Image
        const partNumber = cols[0] || `PN-${Math.floor(100000 + Math.random() * 900000)}`;
        const title = cols[1] || `HVAC Spare Part (${partNumber})`;
        const brand = cols[2] || "Universal OEM";
        const category = cols[3] || "General Spare Parts";
        const compatibility = cols[4] || "Universal Inverter / Split";
        const price = cols[5] ? parseFloat(cols[5].replace(/[^0-9.]/g, "")) || 0 : 0;
        const description = cols[6] || `High-reliability genuine replacement component for ${brand} air conditioning equipment.`;
        const image = cols[7] || "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=700&q=80";

        importedParts.push({
          partNumber,
          title,
          brand,
          category,
          compatibility,
          price,
          description,
          image,
          inStock: true
        });
      }
    });

    if (importedParts.length === 0) {
      alert("No valid rows could be parsed. Please check your data format.");
      return;
    }

    const count = bulkImportSpareParts(importedParts, replaceExisting);
    refreshParts();
    setIsBulkImportOpen(false);
    setImportPasteText("");
    if (onShowToast) onShowToast(`Successfully imported ${count} spare parts into catalog!`);
  };

  // Export Catalog as CSV
  const handleExportCSV = () => {
    const headers = ["PartNumber", "Title", "Brand", "Category", "Compatibility", "Price", "InStock", "Description", "Image"];
    const rows = parts.map(p => [
      `"${p.partNumber.replace(/"/g, '""')}"`,
      `"${p.title.replace(/"/g, '""')}"`,
      `"${p.brand.replace(/"/g, '""')}"`,
      `"${p.category.replace(/"/g, '""')}"`,
      `"${p.compatibility.replace(/"/g, '""')}"`,
      p.price || 0,
      p.inStock ? "YES" : "NO",
      `"${p.description.replace(/"/g, '""')}"`,
      `"${p.image.replace(/"/g, '""')}"`
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `CoolTech_SpareParts_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    if (onShowToast) onShowToast("Exported spare parts catalog to CSV!");
  };

  return (
    <div className="space-y-6">
      
      {/* Top Header Card */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
              <Zap size={20} />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
                AC Spare Parts & Accessories Manager
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Dynamic catalog with live public search, Excel bulk import, and direct WhatsApp RFQ links.
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center flex-wrap gap-2">
          <button
            onClick={handleExportCSV}
            className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors flex items-center gap-1.5"
          >
            <Download size={14} />
            <span>Export CSV</span>
          </button>

          <button
            onClick={() => setIsBulkImportOpen(true)}
            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition-colors flex items-center gap-1.5 shadow-sm"
          >
            <FileSpreadsheet size={14} />
            <span>Bulk Excel Import</span>
          </button>

          <button
            onClick={handleOpenAdd}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs rounded-xl transition-colors flex items-center gap-1.5 shadow-sm"
          >
            <Plus size={15} />
            <span>Add Spare Part</span>
          </button>

          <button
            onClick={handleResetDefaults}
            title="Reset catalog back to factory OEM dataset"
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
          >
            <RefreshCw size={15} />
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Total Catalog SKUs</span>
          <p className="text-2xl font-black text-slate-900 mt-1">{parts.length}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">In Stock Ready</span>
          <p className="text-2xl font-black text-emerald-600 mt-1">{parts.filter(p => p.inStock).length}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">OEM Brands Covered</span>
          <p className="text-2xl font-black text-blue-600 mt-1">{brandsList.length}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Part Categories</span>
          <p className="text-2xl font-black text-purple-600 mt-1">{categoriesList.length}</p>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center gap-3">
        <div className="flex items-center gap-2 flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl w-full">
          <Search size={16} className="text-slate-400 shrink-0" />
          <input 
            type="text"
            placeholder="Search by part number, title, brand, or model compatibility..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full text-xs font-medium text-slate-800 bg-transparent outline-none placeholder-slate-400"
          />
          {searchTerm && (
            <button onClick={() => setSearchTerm("")} className="text-xs text-slate-400 hover:text-slate-600 font-bold">
              ✕
            </button>
          )}
        </div>

        {/* Brand Dropdown */}
        <select
          value={selectedBrand}
          onChange={(e) => setSelectedBrand(e.target.value)}
          aria-label="Filter by brand"
          className="text-xs font-bold text-slate-700 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 outline-none cursor-pointer w-full md:w-auto"
        >
          <option value="all">All Brands ({brandsList.length})</option>
          {brandsList.map(b => (
            <option key={b} value={b}>{b}</option>
          ))}
        </select>

        {/* Category Dropdown */}
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          aria-label="Filter by category"
          className="text-xs font-bold text-slate-700 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 outline-none cursor-pointer w-full md:w-auto"
        >
          <option value="all">All Categories ({categoriesList.length})</option>
          {categoriesList.map(c => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      {/* Table of Spare Parts */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-400 text-[10px] font-extrabold uppercase tracking-wider">
                <th className="py-3 px-4">Part / Image</th>
                <th className="py-3 px-4">OEM Part Number</th>
                <th className="py-3 px-4">Brand</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Compatibility</th>
                <th className="py-3 px-4">Wholesale Price</th>
                <th className="py-3 px-4">Stock Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredParts.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400 text-xs">
                    No spare parts found matching the selected filters.
                  </td>
                </tr>
              ) : (
                filteredParts.map((part) => {
                  const isCopied = copiedPartNo === part.partNumber;

                  return (
                    <tr key={part.id} className="hover:bg-slate-50 transition-colors">
                      {/* Image & Title */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <img 
                            src={part.image} 
                            alt={part.title} 
                            className="w-10 h-10 rounded-lg object-cover border border-slate-200 shrink-0"
                          />
                          <div className="max-w-[200px]">
                            <p className="font-extrabold text-slate-900 truncate">{part.title}</p>
                            {part.badge && (
                              <span className="text-[9px] bg-blue-50 text-blue-700 px-1.5 py-0.2 rounded font-bold">
                                {part.badge}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* OEM Part Number */}
                      <td className="py-3 px-4">
                        <div className="inline-flex items-center gap-1.5 bg-slate-100 px-2 py-1 rounded-md font-mono font-bold text-blue-900">
                          <span>{part.partNumber}</span>
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(part.partNumber);
                              setCopiedPartNo(part.partNumber);
                              setTimeout(() => setCopiedPartNo(null), 1500);
                            }}
                            className="text-slate-400 hover:text-slate-600"
                          >
                            {isCopied ? <Check size={11} className="text-emerald-600" /> : <Copy size={11} />}
                          </button>
                        </div>
                      </td>

                      {/* Brand */}
                      <td className="py-3 px-4 font-bold text-slate-800">
                        <span className="px-2 py-0.5 bg-slate-100 rounded-md text-[11px]">
                          {part.brand}
                        </span>
                      </td>

                      {/* Category */}
                      <td className="py-3 px-4 text-slate-600">
                        {part.category}
                      </td>

                      {/* Compatibility */}
                      <td className="py-3 px-4 max-w-[180px] text-slate-500 truncate" title={part.compatibility}>
                        {part.compatibility}
                      </td>

                      {/* Price */}
                      <td className="py-3 px-4 font-extrabold text-slate-900">
                        {part.price && part.price > 0 ? (
                          <span>AED {part.price.toLocaleString()}</span>
                        ) : (
                          <span className="text-slate-400 italic">RFQ / Custom</span>
                        )}
                      </td>

                      {/* Stock Toggle */}
                      <td className="py-3 px-4">
                        <button
                          onClick={() => handleToggleStock(part)}
                          className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold transition-colors cursor-pointer ${
                            part.inStock
                              ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-200"
                              : "bg-rose-100 text-rose-800 hover:bg-rose-200"
                          }`}
                        >
                          {part.inStock ? "● In Stock" : "○ Out of Stock"}
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleOpenEdit(part)}
                            title="Edit Spare Part"
                            className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          >
                            <Edit3 size={14} />
                          </button>
                          <button
                            onClick={() => handleDeletePart(part)}
                            title="Delete Spare Part"
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL: MANUAL ADD / EDIT SPARE PART */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 my-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
              <h3 className="text-base font-extrabold text-slate-900">
                {editingPart ? "Edit AC Spare Part" : "Add New Genuine Spare Part"}
              </h3>
              <button onClick={() => setIsEditModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSavePart} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">OEM Part Number *</label>
                  <input 
                    type="text"
                    required
                    placeholder="e.g. DB93-14197A"
                    value={formData.partNumber}
                    onChange={(e) => setFormData({ ...formData, partNumber: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono font-bold text-slate-800 outline-none focus:border-blue-600"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">OEM Brand *</label>
                  <input 
                    type="text"
                    required
                    placeholder="e.g. Samsung, Daikin, LG, Carrier"
                    value={formData.brand}
                    onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 outline-none focus:border-blue-600"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">Part Title / Name *</label>
                <input 
                  type="text"
                  required
                  placeholder="e.g. Samsung Inverter Main PCB Assembly"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 outline-none focus:border-blue-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">Category</label>
                  <input 
                    type="text"
                    placeholder="e.g. PCBs & Control Boards"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 outline-none focus:border-blue-600"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">Wholesale Price (AED)</label>
                  <input 
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0 for RFQ / Custom Quote"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 outline-none focus:border-blue-600"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">Unit Model Compatibility</label>
                <input 
                  type="text"
                  placeholder="e.g. Samsung Multi-V, DVM S, AR24 Inverter Series"
                  value={formData.compatibility}
                  onChange={(e) => setFormData({ ...formData, compatibility: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 outline-none focus:border-blue-600"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">Image URL</label>
                <input 
                  type="url"
                  placeholder="https://..."
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 outline-none focus:border-blue-600"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">Description</label>
                <textarea 
                  rows={2}
                  placeholder="Technical specifications, voltage, warranty, etc."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 outline-none focus:border-blue-600 resize-none"
                />
              </div>

              <div className="flex items-center gap-6 pt-2">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input 
                    type="checkbox"
                    checked={formData.inStock}
                    onChange={(e) => setFormData({ ...formData, inStock: e.target.checked })}
                    className="w-4 h-4 rounded text-blue-600 border-slate-300"
                  />
                  <span className="text-xs font-bold text-slate-700">Currently in Stock</span>
                </label>

                <div className="flex items-center gap-2">
                  <label className="text-[11px] font-bold text-slate-600">Badge:</label>
                  <input 
                    type="text"
                    placeholder="e.g. OEM Genuine"
                    value={formData.badge}
                    onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
                    className="bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-xs text-slate-800 outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs rounded-xl shadow-sm"
                >
                  {editingPart ? "Save Changes" : "Create Spare Part"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: BULK EXCEL / CSV IMPORTER */}
      {isBulkImportOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 my-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
              <div className="flex items-center gap-2">
                <FileSpreadsheet size={20} className="text-emerald-600" />
                <h3 className="text-base font-extrabold text-slate-900">
                  Bulk Import Spare Parts (Excel / Google Sheets / CSV)
                </h3>
              </div>
              <button onClick={() => setIsBulkImportOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X size={18} />
              </button>
            </div>

            <p className="text-xs text-slate-600 mb-3">
              Copy and paste rows directly from your Excel or Google Sheet. You can import hundreds or thousands of spare parts simultaneously.
            </p>

            {/* Expected Column Format Guide */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 mb-4 text-[11px] text-slate-600 font-mono">
              <span className="font-bold text-slate-800 block mb-1">Expected Column Sequence (Tab or Comma separated):</span>
              <code>PartNumber | Title | Brand | Category | Compatibility | Price | Description | ImageURL</code>
            </div>

            <textarea 
              rows={8}
              placeholder={`DB93-14197A\tSamsung Inverter PCB\tSamsung\tPCBs & Control Boards\tSamsung WindFree AR24\t480\tOEM genuine board\thttps://...\nKFD-280-45-8A\tDaikin Condenser Fan Motor\tDaikin\tFan Motors\tDaikin VRV IV\t360\tDC Brushless\thttps://...`}
              value={importPasteText}
              onChange={(e) => setImportPasteText(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-mono text-slate-800 outline-none focus:border-emerald-600 resize-none mb-3"
            />

            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input 
                  type="checkbox"
                  checked={replaceExisting}
                  onChange={(e) => setReplaceExisting(e.target.checked)}
                  className="w-4 h-4 rounded text-rose-600 border-slate-300"
                />
                <span className="text-xs font-bold text-rose-700">Replace existing catalog (Clear all current parts)</span>
              </label>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsBulkImportOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl"
                >
                  Cancel
                </button>
                <button
                  onClick={handleExecuteBulkImport}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-sm flex items-center gap-1.5"
                >
                  <Upload size={14} />
                  <span>Parse &amp; Import Rows</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
