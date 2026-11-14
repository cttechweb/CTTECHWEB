import React, { useState, useEffect, useRef, useMemo } from "react";
import { 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  ArrowUp, 
  ArrowDown, 
  Check, 
  X, 
  Eye, 
  EyeOff, 
  RotateCcw,
  Upload, 
  Loader2, 
  Building2,
  Package,
  Info,
  GripVertical
} from "lucide-react";
import { BrandPartner, Product } from "../../types";
import { 
  getBrands, 
  saveLocalBrands, 
  deleteBrand 
} from "../../services/brandService";
import { 
  getGeneralSettings, 
  saveGeneralSettings, 
  DEFAULT_BRAND_PARTNERS, 
  syncGeneralSettingsToRemote 
} from "../../services/generalSettingsService";
import { uploadProductImage } from "../../services/storageService";
import { renderBrandLogoGraphic } from "../../utils/brandLogos";

interface AdminBrandsManagerProps {
  products?: Product[];
  onShowToast?: (message: string) => void;
  onNavigateToProducts?: (brandName?: string) => void;
}

export default function AdminBrandsManager({
  products = [],
  onShowToast,
  onNavigateToProducts
}: AdminBrandsManagerProps) {
  const [brands, setBrands] = useState<BrandPartner[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "hidden">("all");
  const [isLoading, setIsLoading] = useState(true);
  const [isSavingOrder, setIsSavingOrder] = useState(false);

  // Drag and Drop States
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBrand, setEditingBrand] = useState<BrandPartner | null>(null);

  // Form Fields (Clean & focused: Name, Logo, Visibility)
  const [formName, setFormName] = useState("");
  const [formLogoUrl, setFormLogoUrl] = useState("");
  const [formLogoSvg, setFormLogoSvg] = useState("");
  const [formIsActive, setFormIsActive] = useState<boolean>(true);

  // Logo upload tab & preview state
  const [logoInputMode, setLogoInputMode] = useState<"upload" | "url" | "svg">("upload");
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Initial Load & Event Listener
  const loadBrandsData = async () => {
    setIsLoading(true);
    try {
      const list = await getBrands();
      const sorted = (list && list.length > 0 ? list : DEFAULT_BRAND_PARTNERS).slice().sort(
        (a, b) => (a.order ?? 0) - (b.order ?? 0)
      );
      setBrands(sorted);
    } catch {
      setBrands(DEFAULT_BRAND_PARTNERS);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadBrandsData();

    const handleUpdate = (e: any) => {
      if (e?.detail && Array.isArray(e.detail)) {
        const sorted = e.detail.slice().sort((a: BrandPartner, b: BrandPartner) => (a.order ?? 0) - (b.order ?? 0));
        setBrands(sorted);
      } else {
        loadBrandsData();
      }
    };

    window.addEventListener("cooltech_brands_updated", handleUpdate);
    window.addEventListener("cooltech_settings_updated", handleUpdate);
    return () => {
      window.removeEventListener("cooltech_brands_updated", handleUpdate);
      window.removeEventListener("cooltech_settings_updated", handleUpdate);
    };
  }, []);

  // Compute Product Counts per Brand
  const productCountMap = useMemo(() => {
    const map: Record<string, number> = {};
    if (!products || products.length === 0) return map;
    products.forEach((p) => {
      if (p.brand) {
        const key = p.brand.trim().toLowerCase();
        map[key] = (map[key] || 0) + 1;
      }
    });
    return map;
  }, [products]);

  // Synchronize entire brands list to storage & remote
  const commitBrandsList = async (updatedList: BrandPartner[], successMsg?: string) => {
    // Re-index orders sequentially
    const sequential = updatedList.map((item, idx) => ({
      ...item,
      order: idx + 1,
      updatedAt: new Date().toISOString()
    }));

    setBrands(sequential);
    saveLocalBrands(sequential);

    // Sync to general settings for backward compatibility
    try {
      const currentSettings = getGeneralSettings();
      const updatedSettings = saveGeneralSettings({
        ...currentSettings,
        brandPartners: sequential
      });
      await syncGeneralSettingsToRemote(updatedSettings);
    } catch (err) {
      console.warn("[AdminBrands] Remote sync notice:", err);
    }

    if (successMsg && onShowToast) {
      onShowToast(successMsg);
    }
  };

  /* ───────────────────────────────────────────────────────────
     DRAG & DROP REORDERING HANDLERS
  ─────────────────────────────────────────────────────────── */
  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", `${index}`);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (dragOverIndex !== index) {
      setDragOverIndex(index);
    }
  };

  const handleDragLeave = () => {
    // Left row
  };

  const handleDrop = async (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === targetIndex) {
      setDraggedIndex(null);
      setDragOverIndex(null);
      return;
    }

    setIsSavingOrder(true);
    const newItems = [...brands];
    const [movedBrand] = newItems.splice(draggedIndex, 1);
    newItems.splice(targetIndex, 0, movedBrand);

    setDraggedIndex(null);
    setDragOverIndex(null);

    await commitBrandsList(newItems, `Reordered "${movedBrand.name}" to position #${targetIndex + 1}`);
    setIsSavingOrder(false);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  // Step Move helper (fallback for buttons & accessibility)
  const handleMoveOrder = async (index: number, direction: "up" | "down") => {
    if (
      (direction === "up" && index === 0) ||
      (direction === "down" && index === brands.length - 1)
    ) {
      return;
    }

    setIsSavingOrder(true);
    const newItems = [...brands];
    const targetIdx = direction === "up" ? index - 1 : index + 1;
    const temp = newItems[index];
    newItems[index] = newItems[targetIdx];
    newItems[targetIdx] = temp;

    await commitBrandsList(newItems, `Moved "${temp.name}" ${direction === "up" ? "higher" : "lower"}`);
    setIsSavingOrder(false);
  };

  // Toggle brand active/hidden status
  const handleToggleActive = async (brand: BrandPartner) => {
    const updated = brands.map((b) =>
      b.id === brand.id ? { ...b, isActive: !b.isActive, updatedAt: new Date().toISOString() } : b
    );
    await commitBrandsList(updated, `"${brand.name}" is now ${brand.isActive ? "Hidden" : "Active"}`);
  };

  // Reset to default 14 UAE HVAC Brands
  const handleResetDefaults = async () => {
    if (window.confirm("Reset all brands back to the default UAE partner brands list?")) {
      setIsSavingOrder(true);
      await commitBrandsList(DEFAULT_BRAND_PARTNERS, "Restored default partner brands list");
      setIsSavingOrder(false);
    }
  };

  // Open Add Brand Modal
  const handleOpenAddModal = () => {
    setEditingBrand(null);
    setFormName("");
    setFormLogoUrl("");
    setFormLogoSvg("");
    setFormIsActive(true);
    setLogoInputMode("upload");
    setUploadStatus(null);
    setIsModalOpen(true);
  };

  // Open Edit Brand Modal
  const handleOpenEditModal = (brand: BrandPartner) => {
    setEditingBrand(brand);
    setFormName(brand.name || "");
    const logoVal = (brand.logo || (brand as any).logoUrl || "").trim();
    setFormLogoUrl(logoVal);
    setFormLogoSvg(brand.logoSvg || "");
    setFormIsActive(brand.isActive !== false);
    setLogoInputMode(brand.logoSvg ? "svg" : logoVal ? "url" : "upload");
    setUploadStatus(null);
    setIsModalOpen(true);
  };

  // Handle Logo Upload File Selection
  const handleLogoFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/") && !file.type.includes("svg")) {
      alert("Please upload a valid image file (SVG, PNG, WebP, or JPG).");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      alert("File size exceeds 2 MB. Please upload an optimized logo under 2 MB.");
      return;
    }

    setIsUploadingLogo(true);
    setUploadProgress(15);
    setUploadStatus("Uploading logo to storage...");

    try {
      // Local instant preview
      const reader = new FileReader();
      reader.onload = (event) => {
        const previewUrl = event.target?.result as string;
        setFormLogoUrl(previewUrl);
      };
      reader.readAsDataURL(file);

      // Cloudflare R2 Upload
      const res = await uploadProductImage(file, "brands", (pct) => {
        setUploadProgress(pct);
      });

      if (res?.url) {
        setFormLogoUrl(res.url);
        setUploadStatus("Logo uploaded successfully!");
      }
    } catch (err) {
      console.warn("Logo upload fallback to preview data URL:", err);
      setUploadStatus("Saved as local image preview.");
    } finally {
      setIsUploadingLogo(false);
      setUploadProgress(100);
      setTimeout(() => setUploadStatus(null), 3000);
    }
  };

  // Handle Save Form (Name, Logo, Status only)
  const handleSaveForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      alert("Please enter a Brand Name.");
      return;
    }

    const now = new Date().toISOString();
    const brandId = editingBrand ? editingBrand.id : `brand-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const finalLogo = formLogoUrl.trim() || undefined;
    const finalSvg = formLogoSvg.trim() || undefined;

    const newBrand: BrandPartner = {
      id: brandId,
      name: formName.trim(),
      logo: finalLogo,
      logoUrl: finalLogo,
      logoSvg: finalSvg,
      displayType: finalSvg ? "svg" : finalLogo ? "image" : "text",
      order: editingBrand ? editingBrand.order : brands.length + 1,
      isActive: formIsActive,
      createdAt: editingBrand?.createdAt || now,
      updatedAt: now
    };

    let updatedList: BrandPartner[];
    if (editingBrand) {
      updatedList = brands.map((b) => (b.id === editingBrand.id ? newBrand : b));
    } else {
      updatedList = [...brands, newBrand];
    }

    await commitBrandsList(updatedList, editingBrand ? `Updated brand "${newBrand.name}"` : `Added new brand "${newBrand.name}"`);
    setIsModalOpen(false);
  };

  // Handle Delete Brand
  const handleDeleteBrand = async (brandId: string) => {
    const brand = brands.find((b) => b.id === brandId);
    if (!brand) return;

    const linkedCount = productCountMap[brand.name.trim().toLowerCase()] || 0;
    const confirmPrompt = linkedCount > 0
      ? `"${brand.name}" has ${linkedCount} products associated in your catalog. Are you sure you want to remove this brand?`
      : `Are you sure you want to delete brand "${brand.name}"?`;

    if (window.confirm(confirmPrompt)) {
      const remaining = brands.filter((b) => b.id !== brandId);
      await commitBrandsList(remaining, `Deleted brand "${brand.name}"`);
      await deleteBrand(brandId);
    }
  };

  // Filtered List
  const filteredBrands = useMemo(() => {
    return brands.filter((b) => {
      const matchesSearch = b.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = 
        statusFilter === "all" ||
        (statusFilter === "active" && b.isActive !== false) ||
        (statusFilter === "hidden" && b.isActive === false);

      return matchesSearch && matchesStatus;
    });
  }, [brands, searchTerm, statusFilter]);

  // Overall Statistics
  const activeCount = brands.filter((b) => b.isActive !== false).length;
  const hiddenCount = brands.length - activeCount;
  const totalProductsLinked = Object.values(productCountMap).reduce((acc, c) => acc + c, 0);

  return (
    <div className="w-full flex flex-col space-y-6">

      {/* Top Banner & Quick Stats */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-blue-50 text-[#0f4c81] flex items-center justify-center font-bold">
                <Building2 size={20} />
              </div>
              <div>
                <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
                  Brands Management
                </h1>
                <p className="text-xs text-slate-500">
                  Centralized HVAC brand directory. Drag & drop rows to arrange exact display order across the site.
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
            <button
              type="button"
              onClick={handleResetDefaults}
              className="px-3.5 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
              title="Reset to standard UAE HVAC partner brands"
            >
              <RotateCcw size={13} />
              <span>Reset Defaults</span>
            </button>

            <button
              type="button"
              onClick={handleOpenAddModal}
              className="px-4 py-2 bg-[#0f4c81] hover:bg-[#0c3c66] text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Plus size={14} className="stroke-[2.5]" />
              <span>Add New Brand</span>
            </button>
          </div>
        </div>

        {/* 4 Stat Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 pt-5">
          <div className="bg-slate-50/70 border border-slate-200/80 rounded-xl p-3.5 flex flex-col justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Total Brands</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-black text-slate-900">{brands.length}</span>
              <span className="text-[11px] text-slate-400 font-medium">manufacturers</span>
            </div>
          </div>

          <div className="bg-emerald-50/50 border border-emerald-200/80 rounded-xl p-3.5 flex flex-col justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700">Active On Site</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-black text-emerald-800">{activeCount}</span>
              <span className="text-[11px] text-emerald-600 font-medium">visible</span>
            </div>
          </div>

          <div className="bg-amber-50/50 border border-amber-200/80 rounded-xl p-3.5 flex flex-col justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-700">Hidden / Draft</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-black text-amber-800">{hiddenCount}</span>
              <span className="text-[11px] text-amber-600 font-medium">archived</span>
            </div>
          </div>

          <div className="bg-blue-50/50 border border-blue-200/80 rounded-xl p-3.5 flex flex-col justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#0f4c81]">Catalog Products</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-black text-[#0f4c81]">{totalProductsLinked}</span>
              <span className="text-[11px] text-blue-600 font-medium">assigned items</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search brand by name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3.5 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#2596be]/30 focus:border-[#2596be] transition-all"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs p-1"
            >
              <X size={13} />
            </button>
          )}
        </div>

        <div className="flex items-center gap-1.5 w-full sm:w-auto justify-end">
          <span className="text-xs text-slate-400 font-bold mr-1">Status:</span>
          {(["all", "active", "hidden"] as const).map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-all cursor-pointer ${
                statusFilter === st
                  ? "bg-slate-900 text-white shadow-2xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200/80"
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Brand List Table with Drag and Drop */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
        <div className="px-5 py-3 border-b border-slate-200 bg-slate-50/70 flex items-center justify-between">
          <span className="text-xs font-extrabold uppercase tracking-wider text-slate-600">
            Brand Order & Directory ({filteredBrands.length} of {brands.length})
          </span>
          <div className="flex items-center gap-1.5 text-[11px] text-[#0f4c81] font-semibold">
            <GripVertical size={13} />
            <span>Hold & drag rows to rearrange order (first to last)</span>
          </div>
        </div>

        {isLoading ? (
          <div className="p-12 text-center text-slate-400 flex flex-col items-center justify-center gap-2">
            <Loader2 size={24} className="animate-spin text-[#2596be]" />
            <span className="text-xs font-semibold">Loading brand directory...</span>
          </div>
        ) : filteredBrands.length === 0 ? (
          <div className="p-12 text-center text-slate-400 flex flex-col items-center justify-center gap-2">
            <Building2 size={32} className="text-slate-300" />
            <p className="text-sm font-bold text-slate-600">No brands found</p>
            <p className="text-xs text-slate-400">Try adjusting your search query or status filter.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 overflow-x-auto">
            {filteredBrands.map((brand, idx) => {
              const actualIndex = brands.findIndex((b) => b.id === brand.id);
              const linkedProducts = productCountMap[brand.name.trim().toLowerCase()] || 0;
              const isDragging = draggedIndex === actualIndex;
              const isDragOver = dragOverIndex === actualIndex && draggedIndex !== actualIndex;

              return (
                <div
                  key={brand.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, actualIndex)}
                  onDragOver={(e) => handleDragOver(e, actualIndex)}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, actualIndex)}
                  onDragEnd={handleDragEnd}
                  className={`p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all ${
                    isDragging
                      ? "opacity-30 bg-blue-50/60 scale-[0.99] border-2 border-dashed border-[#2596be]"
                      : isDragOver
                      ? "bg-blue-50/40 border-t-2 border-t-[#0f4c81]"
                      : brand.isActive === false
                      ? "bg-slate-50/40 opacity-70"
                      : "hover:bg-slate-50/70 bg-white"
                  }`}
                >
                  {/* Left: Drag Handle + Order Badge + Logo + Brand Name */}
                  <div className="flex items-center gap-3 min-w-0">
                    
                    {/* Dedicated Drag Handle */}
                    <div 
                      className="cursor-grab active:cursor-grabbing p-1.5 text-slate-300 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors shrink-0"
                      title="Click and drag to reorder"
                    >
                      <GripVertical size={16} />
                    </div>

                    {/* Numeric Order Badge */}
                    <div className="w-8 h-8 rounded-lg bg-slate-100 border border-slate-200/80 flex items-center justify-center text-xs font-black text-slate-700 font-mono shrink-0">
                      #{actualIndex + 1}
                    </div>

                    {/* Quick Move Up/Down Controls (Convenient fallback) */}
                    <div className="flex flex-col gap-0.5 items-center shrink-0">
                      <button
                        type="button"
                        onClick={() => handleMoveOrder(actualIndex, "up")}
                        disabled={actualIndex === 0 || isSavingOrder}
                        className="p-1 rounded text-slate-300 hover:text-slate-800 hover:bg-slate-100 disabled:opacity-20 disabled:hover:bg-transparent cursor-pointer transition-colors"
                        title="Move Up"
                      >
                        <ArrowUp size={11} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleMoveOrder(actualIndex, "down")}
                        disabled={actualIndex === brands.length - 1 || isSavingOrder}
                        className="p-1 rounded text-slate-300 hover:text-slate-800 hover:bg-slate-100 disabled:opacity-20 disabled:hover:bg-transparent cursor-pointer transition-colors"
                        title="Move Down"
                      >
                        <ArrowDown size={11} />
                      </button>
                    </div>

                    {/* Brand Logo Box */}
                    <div className="w-24 h-12 rounded-xl border border-slate-200 bg-white p-1.5 flex items-center justify-center shrink-0 shadow-2xs overflow-hidden">
                      {renderBrandLogoGraphic(brand, { maxH: "max-h-9", maxW: "max-w-[85px]" })}
                    </div>

                    {/* Clean Brand Name Only (No Tagline / No External URL) */}
                    <div className="min-w-0 pl-1">
                      <h4 className="font-extrabold text-sm text-slate-900 tracking-tight truncate">
                        {brand.name}
                      </h4>
                    </div>
                  </div>

                  {/* Right Actions: Product count, Active status, Edit, Delete */}
                  <div className="flex items-center gap-2.5 shrink-0 self-end sm:self-center">
                    
                    {/* Linked Products Count */}
                    <button
                      type="button"
                      onClick={() => {
                        if (onNavigateToProducts) {
                          onNavigateToProducts(brand.name);
                        } else {
                          window.location.hash = `#/products?brand=${encodeURIComponent(brand.name)}`;
                        }
                      }}
                      className="px-2.5 py-1 bg-blue-50/70 hover:bg-blue-100/70 text-[#0f4c81] border border-blue-200/60 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                      title={`View ${linkedProducts} products in catalog`}
                    >
                      <Package size={12} />
                      <span>{linkedProducts} Products</span>
                    </button>

                    {/* Active Status Pill */}
                    <button
                      type="button"
                      onClick={() => handleToggleActive(brand)}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                        brand.isActive !== false
                          ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200"
                          : "bg-slate-100 text-slate-500 hover:bg-slate-200 border border-slate-200"
                      }`}
                      title={brand.isActive !== false ? "Visible on site — Click to hide" : "Hidden — Click to activate"}
                    >
                      {brand.isActive !== false ? (
                        <>
                          <Eye size={12} />
                          <span>Active</span>
                        </>
                      ) : (
                        <>
                          <EyeOff size={12} />
                          <span>Hidden</span>
                        </>
                      )}
                    </button>

                    {/* Edit Button */}
                    <button
                      type="button"
                      onClick={() => handleOpenEditModal(brand)}
                      className="p-1.5 rounded-lg text-slate-600 hover:text-[#0f4c81] hover:bg-blue-50 transition-colors cursor-pointer"
                      title="Edit Brand Name & Logo"
                    >
                      <Edit3 size={15} />
                    </button>

                    {/* Delete Button */}
                    <button
                      type="button"
                      onClick={() => handleDeleteBrand(brand.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                      title="Delete Brand"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>

                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ───────────────────────────────────────────────────────────
          ADD / EDIT BRAND MODAL (CLEAN: NAME, LOGO, VISIBILITY)
      ─────────────────────────────────────────────────────────── */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto border border-slate-100">
            
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white/95 backdrop-blur-xs z-10">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#0f4c81] flex items-center justify-center font-bold">
                  <Building2 size={16} />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-slate-900">
                    {editingBrand ? `Edit Brand: ${editingBrand.name}` : "Add New Brand Partner"}
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Set brand name and verified manufacturer logo.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveForm} className="p-6 space-y-5 text-xs">

              {/* Brand Name Only */}
              <div className="space-y-1">
                <label className="font-bold text-slate-700">
                  Brand Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Daikin, O General, Midea, Gree"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#2596be]/30 focus:border-[#2596be] font-medium"
                />
              </div>

              {/* ───────────────────────────────────────────────────────────
                  LOGO UPLOAD & SPECIFICATIONS SECTION
              ─────────────────────────────────────────────────────────── */}
              <div className="space-y-3 pt-2 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
                    <span>Brand Logo</span>
                    <span className="text-[10px] font-normal text-slate-400">(Required for brand display)</span>
                  </label>

                  {/* Mode Selector */}
                  <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg text-[11px] font-bold">
                    <button
                      type="button"
                      onClick={() => setLogoInputMode("upload")}
                      className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                        logoInputMode === "upload" ? "bg-white text-slate-900 shadow-2xs" : "text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      Upload File
                    </button>
                    <button
                      type="button"
                      onClick={() => setLogoInputMode("url")}
                      className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                        logoInputMode === "url" ? "bg-white text-slate-900 shadow-2xs" : "text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      Image URL
                    </button>
                    <button
                      type="button"
                      onClick={() => setLogoInputMode("svg")}
                      className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                        logoInputMode === "svg" ? "bg-white text-slate-900 shadow-2xs" : "text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      Vector SVG
                    </button>
                  </div>
                </div>

                {/* Explicit Size & Format Requirement Callout */}
                <div className="bg-blue-50/70 border border-blue-200/70 rounded-xl p-3.5 space-y-1.5">
                  <div className="flex items-center gap-2 text-blue-900 font-extrabold text-[11px]">
                    <Info size={14} className="text-[#0f4c81]" />
                    <span>Recommended Logo Dimensions & Guidelines:</span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[10px] text-blue-900/90 font-medium pt-1">
                    <div className="bg-white/80 p-1.5 rounded-md border border-blue-100">
                      <span className="text-slate-500 block">Recommended Size:</span>
                      <strong className="text-slate-900">400 × 160 px</strong>
                    </div>
                    <div className="bg-white/80 p-1.5 rounded-md border border-blue-100">
                      <span className="text-slate-500 block">Aspect Ratio:</span>
                      <strong className="text-slate-900">2.5 : 1 (or 1:1)</strong>
                    </div>
                    <div className="bg-white/80 p-1.5 rounded-md border border-blue-100">
                      <span className="text-slate-500 block">Best Formats:</span>
                      <strong className="text-slate-900">PNG / SVG</strong>
                    </div>
                    <div className="bg-white/80 p-1.5 rounded-md border border-blue-100">
                      <span className="text-slate-500 block">Max File Size:</span>
                      <strong className="text-slate-900">&lt; 2 MB</strong>
                    </div>
                  </div>
                  <p className="text-[10px] text-blue-700/80 leading-normal pt-0.5">
                    * For premium sharpness, use a transparent background PNG or SVG vector so the logo looks clean against cards.
                  </p>
                </div>

                {/* Mode 1: File Upload */}
                {logoInputMode === "upload" && (
                  <div className="space-y-2">
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleLogoFileUpload}
                      accept="image/png, image/svg+xml, image/webp, image/jpeg"
                      className="hidden"
                    />
                    <div 
                      onClick={() => fileInputRef.current?.click()}
                      className="border-2 border-dashed border-slate-200 hover:border-[#2596be] hover:bg-slate-50/50 rounded-xl p-5 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-1.5"
                    >
                      <div className="w-10 h-10 rounded-full bg-blue-50 text-[#0f4c81] flex items-center justify-center mb-1">
                        <Upload size={18} />
                      </div>
                      <span className="font-bold text-slate-800 text-xs">
                        Click to browse or drag & drop brand logo
                      </span>
                      <span className="text-[10px] text-slate-400">
                        PNG (transparent), SVG, WebP, or JPG up to 2 MB
                      </span>
                    </div>

                    {isUploadingLogo && (
                      <div className="flex items-center gap-2 text-xs text-blue-700 font-bold bg-blue-50 p-2.5 rounded-xl border border-blue-200 animate-pulse">
                        <Loader2 size={14} className="animate-spin" />
                        <span>{uploadStatus || "Uploading logo..."} ({uploadProgress}%)</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Mode 2: Direct Image URL */}
                {logoInputMode === "url" && (
                  <div className="space-y-1">
                    <input
                      type="url"
                      placeholder="https://example.com/brand-logo.png"
                      value={formLogoUrl}
                      onChange={(e) => {
                        setFormLogoUrl(e.target.value);
                        setFormLogoSvg("");
                      }}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#2596be]/30 focus:border-[#2596be]"
                    />
                    <p className="text-[10px] text-slate-400">Direct CDN or hosted image URL</p>
                  </div>
                )}

                {/* Mode 3: Inline SVG Code */}
                {logoInputMode === "svg" && (
                  <div className="space-y-1">
                    <textarea
                      rows={4}
                      placeholder='<svg viewBox="0 0 160 40" fill="none">...</svg>'
                      value={formLogoSvg}
                      onChange={(e) => {
                        setFormLogoSvg(e.target.value);
                        setFormLogoUrl("");
                      }}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#2596be]/30 focus:border-[#2596be] font-mono text-[11px]"
                    />
                    <p className="text-[10px] text-slate-400">Paste clean vector SVG code for pixel-perfect scaling.</p>
                  </div>
                )}

                {/* Live Contrast Previews (Light Mode & Dark Mode Preview) */}
                {(formLogoUrl || formLogoSvg) && (
                  <div className="space-y-1.5 pt-2">
                    <span className="font-bold text-slate-700 text-[11px]">
                      Live Visual Contrast Preview:
                    </span>
                    <div className="grid grid-cols-2 gap-3">
                      
                      {/* Against Light Background */}
                      <div className="border border-slate-200 rounded-xl p-3 bg-white flex flex-col items-center justify-center gap-1 min-h-[90px]">
                        <span className="text-[9px] uppercase tracking-wider text-slate-400 font-extrabold mb-1">
                          Light Background (Brand Cards)
                        </span>
                        <div className="w-full h-12 flex items-center justify-center overflow-hidden">
                          {formLogoSvg ? (
                            <div 
                              className="w-full h-full flex items-center justify-center [&>svg]:max-h-full [&>svg]:max-w-full [&>svg]:w-auto"
                              dangerouslySetInnerHTML={{ __html: formLogoSvg }}
                            />
                          ) : (
                            <img
                              src={formLogoUrl}
                              alt="Preview Light"
                              className="max-h-full max-w-full object-contain"
                            />
                          )}
                        </div>
                      </div>

                      {/* Against Dark Background */}
                      <div className="border border-slate-800 rounded-xl p-3 bg-[#0a192f] flex flex-col items-center justify-center gap-1 min-h-[90px]">
                        <span className="text-[9px] uppercase tracking-wider text-slate-400 font-extrabold mb-1">
                          Dark Mode / Hero Contrast
                        </span>
                        <div className="w-full h-12 flex items-center justify-center overflow-hidden">
                          {formLogoSvg ? (
                            <div 
                              className="w-full h-full flex items-center justify-center [&>svg]:max-h-full [&>svg]:max-w-full [&>svg]:w-auto"
                              dangerouslySetInnerHTML={{ __html: formLogoSvg }}
                            />
                          ) : (
                            <img
                              src={formLogoUrl}
                              alt="Preview Dark"
                              className="max-h-full max-w-full object-contain"
                            />
                          )}
                        </div>
                      </div>

                    </div>
                  </div>
                )}
              </div>

              {/* Status Toggle */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-800 block">Brand Visibility</span>
                  <p className="text-[10px] text-slate-400">
                    Enable to display this brand across the public Brand Page, Homepage showcase, and product filters.
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formIsActive}
                    onChange={(e) => setFormIsActive(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                </label>
              </div>

              {/* Modal Actions */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs rounded-xl transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#0f4c81] hover:bg-[#0c3c66] text-white font-extrabold text-xs rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Check size={14} className="stroke-[2.5]" />
                  <span>{editingBrand ? "Save Brand Changes" : "Create Brand"}</span>
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
}
