import React, { useState, useEffect, useRef } from "react";
import { 
  FolderPlus, 
  Search, 
  Edit3, 
  Trash2, 
  ArrowUp, 
  ArrowDown, 
  Check, 
  X, 
  Eye, 
  EyeOff, 
  Layers, 
  RotateCcw,
  Image as ImageIcon,
  Package,
  Upload,
  Link2,
  Loader2,
  RefreshCw,
  Tag,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { Category, Product } from "../../types";
import { getCategoryColorTheme, CATEGORY_COLOR_PALETTES } from "../../utils/categoryColors";
import { 
  getLocalCategories, 
  getCategories, 
  saveCategory, 
  deleteCategory, 
  reorderCategories,
  resetCategoriesToDefault 
} from "../../services/categoryService";
import { uploadProductImage } from "../../services/storageService";

interface AdminCategoryManagerProps {
  products: Product[];
  onShowToast: (message: string) => void;
}

export default function AdminCategoryManager({ products, onShowToast }: AdminCategoryManagerProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  // Form Fields
  const [formName, setFormName] = useState("");
  const [formSlug, setFormSlug] = useState("");
  const [formTag, setFormTag] = useState("");
  const [formColor, setFormColor] = useState("");
  const [formSubtitle, setFormSubtitle] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formImage, setFormImage] = useState("");
  const [formStatus, setFormStatus] = useState<"active" | "inactive">("active");

  // Image Upload State
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);
  const [imageInputMode, setImageInputMode] = useState<"upload" | "url">("upload");

  const loadData = async () => {
    setIsLoading(true);
    const list = await getCategories();
    setCategories(list);
    setIsLoading(false);
  };

  useEffect(() => {
    loadData();
    const handleUpdate = (e: any) => {
      if (e.detail) {
        setCategories(e.detail);
      } else {
        setCategories(getLocalCategories());
      }
    };
    window.addEventListener("cooltech_categories_updated", handleUpdate);
    return () => window.removeEventListener("cooltech_categories_updated", handleUpdate);
  }, []);

  const handleOpenAddModal = () => {
    setEditingCategory(null);
    setFormName("");
    setFormSlug("");
    setFormTag("");
    setFormColor("");
    setFormSubtitle("");
    setFormDescription("");
    setFormImage("");
    setFormStatus("active");
    setImageInputMode("upload");
    setUploadStatus(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (cat: Category) => {
    setEditingCategory(cat);
    setFormName(cat.name);
    setFormSlug(cat.slug);
    setFormTag(cat.tag || "");
    setFormColor(cat.color || "");
    setFormSubtitle(cat.subtitle || "");
    setFormDescription(cat.description || "");
    setFormImage(cat.image || "");
    setFormStatus(cat.status || "active");
    setImageInputMode("upload");
    setUploadStatus(null);
    setIsModalOpen(true);
  };

  const generateSlugFromName = (name: string) => {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  };

  const handleNameChange = (val: string) => {
    setFormName(val);
    if (!editingCategory) {
      setFormSlug(generateSlugFromName(val));
    }
  };

  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploadingImage(true);
      setUploadProgress(15);
      setUploadStatus("Uploading image to storage...");

      const result = await uploadProductImage(file, "categories", (progress) => {
        setUploadProgress(progress);
        setUploadStatus(`Uploading image (${progress}%)...`);
      });

      setFormImage(result.url);
      setUploadStatus(result.isCloud ? "Uploaded to Cloud Storage!" : "Image uploaded successfully!");
      setTimeout(() => setUploadStatus(null), 3000);
    } catch (err: any) {
      alert(err?.message || "Failed to process image file.");
      setUploadStatus(null);
    } finally {
      setIsUploadingImage(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleRemoveImage = () => {
    setFormImage("");
    setUploadStatus(null);
  };

  const handleSaveForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      onShowToast("Please enter a category name");
      return;
    }

    const categoryId = editingCategory ? editingCategory.id : (formSlug.trim() || generateSlugFromName(formName));

    const categoryData: Category = {
      id: categoryId,
      name: formName.trim(),
      slug: formSlug.trim() || generateSlugFromName(formName),
      tag: formTag.trim() || formName.trim(),
      color: formColor.trim() || undefined,
      subtitle: formSubtitle.trim(),
      description: formDescription.trim(),
      image: formImage.trim() || "/src/assets/images/hvac_air_conditioner_1784350824930.jpg",
      status: formStatus,
      sortOrder: editingCategory?.sortOrder !== undefined ? editingCategory.sortOrder : categories.length,
      createdAt: editingCategory?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    await saveCategory(categoryData);
    setIsModalOpen(false);
    onShowToast(editingCategory ? `Category "${categoryData.name}" updated successfully` : `Category "${categoryData.name}" created successfully`);
    loadData();
  };

  const handleDelete = async (cat: Category) => {
    const assignedCount = products.filter((p) => p.category.toLowerCase() === cat.name.toLowerCase()).length;
    let confirmMsg = `Are you sure you want to delete category "${cat.name}"?`;
    if (assignedCount > 0) {
      confirmMsg += `\nWarning: There are currently ${assignedCount} products assigned to this category.`;
    }

    if (!window.confirm(confirmMsg)) return;

    await deleteCategory(cat.id);
    onShowToast(`Category "${cat.name}" removed.`);
    loadData();
  };

  const handleToggleStatus = async (cat: Category) => {
    const newStatus = cat.status === "inactive" ? "active" : "inactive";
    await saveCategory({
      ...cat,
      status: newStatus
    });
    onShowToast(`Category "${cat.name}" is now ${newStatus === "active" ? "visible" : "hidden"}.`);
    loadData();
  };

  const handleMove = async (index: number, direction: "up" | "down") => {
    const targetIdx = direction === "up" ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= categories.length) return;

    const newOrder = [...categories];
    const temp = newOrder[index];
    newOrder[index] = newOrder[targetIdx];
    newOrder[targetIdx] = temp;

    const orderedIds = newOrder.map((c) => c.id);
    await reorderCategories(orderedIds);
    setCategories(newOrder);
    onShowToast("Categories reordered successfully.");
  };

  const handleResetDefaults = async () => {
    if (!window.confirm("Are you sure you want to restore default HVAC categories? Any custom categories will be reset.")) {
      return;
    }
    const res = await resetCategoriesToDefault();
    setCategories(res);
    onShowToast("Default categories restored.");
  };

  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 10;

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const filteredCategories = categories.filter((c) => {
    const term = searchTerm.toLowerCase();
    return (
      c.name.toLowerCase().includes(term) ||
      (c.subtitle && c.subtitle.toLowerCase().includes(term)) ||
      (c.description && c.description.toLowerCase().includes(term)) ||
      c.slug.toLowerCase().includes(term)
    );
  });

  const totalItems = filteredCategories.length;
  const totalPages = Math.ceil(totalItems / PAGE_SIZE) || 1;
  const validCurrentPage = Math.min(currentPage, totalPages);
  const startIndex = (validCurrentPage - 1) * PAGE_SIZE;
  const endIndex = Math.min(startIndex + PAGE_SIZE, totalItems);
  const paginatedCategories = filteredCategories.slice(startIndex, endIndex);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Action Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-2xs p-5 flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search size={15} className="absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search categories, equipment, keywords..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#0f4c81] focus:bg-white"
          />
        </div>

        {/* Buttons */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          <button
            type="button"
            onClick={handleResetDefaults}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors cursor-pointer flex items-center gap-1.5"
            title="Reset to default seed categories"
          >
            <RotateCcw size={13} />
            <span>Reset Defaults</span>
          </button>

          <button
            type="button"
            onClick={handleOpenAddModal}
            className="px-4 py-2 bg-[#0f4c81] hover:bg-[#031b4e] text-white text-xs font-extrabold rounded-xl shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <FolderPlus size={14} />
            <span>Add Category</span>
          </button>
        </div>

      </div>

      {/* Categories Table / List */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-2xs">
        
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2">
            <Layers size={16} className="text-[#0f4c81]" />
            <span className="text-xs font-black text-slate-800 uppercase tracking-wider">
              Active Sourcing Categories ({categories.length})
            </span>
          </div>
          <span className="text-[11px] text-slate-500 font-semibold">
            Use arrows to reorder how categories display on the homepage & categories page.
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-[10px] uppercase tracking-wider font-extrabold text-slate-500 border-b border-slate-200">
              <tr>
                <th className="px-4 py-3.5 w-16 text-center">Order</th>
                <th className="px-5 py-3.5">Category Name & Subtitle</th>
                <th className="px-4 py-3.5">Slug / URL</th>
                <th className="px-4 py-3.5 text-center">Assigned Products</th>
                <th className="px-4 py-3.5 text-center">Status</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredCategories.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <p className="font-bold text-sm">No categories found</p>
                    <p className="text-xs mt-1">Try modifying your search or add a new category.</p>
                  </td>
                </tr>
              ) : (
                paginatedCategories.map((cat) => {
                  const assignedCount = products.filter(
                    (p) => p.category.toLowerCase() === cat.name.toLowerCase()
                  ).length;
                  const actualIdx = categories.findIndex((c) => c.id === cat.id);
                  const isFirst = actualIdx <= 0;
                  const isLast = actualIdx >= categories.length - 1;
                  const isActive = cat.status !== "inactive";

                  return (
                    <tr key={cat.id} className="hover:bg-slate-50/80 transition-colors group">
                      
                      {/* Order Controls */}
                      <td className="px-3 py-4 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            type="button"
                            disabled={isFirst}
                            onClick={() => handleMove(actualIdx, "up")}
                            className="p-1 rounded text-slate-400 hover:text-slate-800 disabled:opacity-20 disabled:hover:text-slate-400 cursor-pointer disabled:cursor-not-allowed"
                            title="Move Up"
                          >
                            <ArrowUp size={13} />
                          </button>
                          <button
                            type="button"
                            disabled={isLast}
                            onClick={() => handleMove(actualIdx, "down")}
                            className="p-1 rounded text-slate-400 hover:text-slate-800 disabled:opacity-20 disabled:hover:text-slate-400 cursor-pointer disabled:cursor-not-allowed"
                            title="Move Down"
                          >
                            <ArrowDown size={13} />
                          </button>
                        </div>
                      </td>

                      {/* Image & Title */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden shrink-0 flex items-center justify-center p-1">
                            {cat.image ? (
                              <img src={cat.image} alt={cat.name} className="w-full h-full object-contain" />
                            ) : (
                              <ImageIcon size={18} className="text-slate-400" />
                            )}
                          </div>
                          <div>
                            <div className="font-extrabold text-slate-900 text-xs flex items-center gap-2 flex-wrap">
                              <span>{cat.name}</span>
                              {cat.tag && (() => {
                                const catTheme = getCategoryColorTheme(cat.tag || cat.name);
                                return (
                                  <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md border flex items-center gap-1 ${catTheme.badge}`}>
                                    <Tag size={9} className={catTheme.icon} />
                                    <span>{cat.tag}</span>
                                  </span>
                                );
                              })()}
                            </div>
                            <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5 font-normal">
                              {cat.subtitle || "No subtitle provided"}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Slug */}
                      <td className="px-4 py-4">
                        <span className="font-mono text-[11px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md border border-slate-200">
                          {cat.slug || cat.id}
                        </span>
                      </td>

                      {/* Assigned Products Count */}
                      <td className="px-4 py-4 text-center">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-50 text-[#0f4c81] text-xs font-bold">
                          <Package size={11} />
                          <span>{assignedCount} items</span>
                        </span>
                      </td>

                      {/* Status */}
                      <td className="px-4 py-4 text-center">
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(cat)}
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold border transition-colors cursor-pointer ${
                            isActive
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                              : "bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-200"
                          }`}
                          title="Click to toggle visibility"
                        >
                          {isActive ? <Eye size={11} /> : <EyeOff size={11} />}
                          <span>{isActive ? "Active" : "Hidden"}</span>
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => handleOpenEditModal(cat)}
                            className="p-1.5 text-slate-500 hover:text-[#0f4c81] hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                            title="Edit Category"
                          >
                            <Edit3 size={14} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(cat)}
                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                            title="Delete Category"
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

        {/* Pagination Bar */}
        {totalItems > 0 && (
          <div className="p-4 border-t border-slate-200 bg-white flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <div className="text-slate-500 font-medium">
              Showing <span className="font-bold text-slate-800">{startIndex + 1}</span> to{" "}
              <span className="font-bold text-slate-800">{endIndex}</span> of{" "}
              <span className="font-bold text-slate-800">{totalItems}</span> categories
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={validCurrentPage <= 1}
                className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900 disabled:opacity-30 disabled:hover:bg-transparent disabled:cursor-not-allowed font-bold flex items-center gap-1 cursor-pointer transition-colors"
              >
                <ChevronLeft size={14} />
                <span>Prev</span>
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter((p) => p === 1 || p === totalPages || Math.abs(p - validCurrentPage) <= 1)
                .map((page, i, arr) => {
                  const prev = arr[i - 1];
                  const hasGap = prev && page - prev > 1;
                  return (
                    <React.Fragment key={page}>
                      {hasGap && <span className="px-1 text-slate-400 font-bold">...</span>}
                      <button
                        type="button"
                        onClick={() => setCurrentPage(page)}
                        className={`w-8 h-8 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                          validCurrentPage === page
                            ? "bg-[#0f4c81] text-white shadow-xs"
                            : "border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                        }`}
                      >
                        {page}
                      </button>
                    </React.Fragment>
                  );
                })}

              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={validCurrentPage >= totalPages}
                className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900 disabled:opacity-30 disabled:hover:bg-transparent disabled:cursor-not-allowed font-bold flex items-center gap-1 cursor-pointer transition-colors"
              >
                <span>Next</span>
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}

      </div>

      {/* ─────────────────────────────────────────────────────────────
          ADD / EDIT CATEGORY MODAL
      ───────────────────────────────────────────────────────────── */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white w-full max-w-xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
            
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#0f4c81] text-white flex items-center justify-center">
                  <FolderPlus size={16} />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight">
                    {editingCategory ? "Edit Category" : "Create New Product Category"}
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Configure public display details, image, and product association.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {/* Modal Body / Form */}
            <form onSubmit={handleSaveForm} className="p-6 space-y-4 overflow-y-auto flex-1">
              
              {/* Category Name & Slug */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1.5">
                    Category Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Air Conditioners, Chillers"
                    value={formName}
                    onChange={(e) => handleNameChange(e.target.value)}
                    className="w-full px-3 py-2 text-xs font-semibold border border-slate-300 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:border-[#0f4c81] transition-all text-slate-900"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1.5">
                    Slug / URL Key <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. air-conditioners"
                    value={formSlug}
                    onChange={(e) => setFormSlug(e.target.value)}
                    className="w-full px-3 py-2 text-xs font-mono border border-slate-300 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:border-[#0f4c81] transition-all text-slate-900"
                  />
                </div>
              </div>

              {/* Category Tag / Filter Badge */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">
                  Category Tag / Filter Badge <span className="text-slate-400 font-normal">(Used for card tag & top filter bar)</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Room Air Conditioner, Air Cooler, Commercial HVAC"
                  value={formTag}
                  onChange={(e) => setFormTag(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-semibold border border-slate-300 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:border-[#0f4c81] transition-all text-slate-900"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">
                  This tag appears directly on top of the category card and powers the top filter bar on the Categories Page.
                </span>

                {/* Live Dynamic Color Tag Preview & Optional Selector */}
                {(() => {
                  const previewCat = {
                    name: formName,
                    tag: formTag,
                    slug: formSlug,
                    color: formColor || undefined
                  };
                  const previewTheme = getCategoryColorTheme(previewCat);

                  return (
                    <div className="mt-2.5 p-3 rounded-xl border border-slate-200 bg-slate-50/90 space-y-2.5">
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] font-bold text-slate-500">Live Tag Preview:</span>
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-extrabold uppercase tracking-wider border transition-colors ${previewTheme.badge}`}>
                            <Tag size={10} className={previewTheme.icon} />
                            <span>{formTag || formName || "Category Tag"}</span>
                          </span>
                        </div>
                        <div className="text-[11px] font-semibold text-slate-500 flex items-center gap-1.5">
                          <span className={`w-2 h-2 rounded-full ${previewTheme.dot}`} />
                          <span>Dynamic Color: <strong className="text-slate-700 font-bold">{previewTheme.name}</strong></span>
                        </div>
                      </div>

                      {/* Optional Manual Palette Override */}
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                            Color Palette (Automatic Dynamic or Pick Custom):
                          </span>
                          {formColor && (
                            <button
                              type="button"
                              onClick={() => setFormColor("")}
                              className="text-[10px] text-blue-600 hover:underline font-bold cursor-pointer"
                            >
                              Reset to Auto-Dynamic
                            </button>
                          )}
                        </div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <button
                            type="button"
                            onClick={() => setFormColor("")}
                            className={`px-2 py-1 rounded-lg text-[10px] font-extrabold border transition-all cursor-pointer ${
                              !formColor 
                                ? "bg-slate-900 text-white border-slate-900 shadow-xs" 
                                : "bg-white text-slate-600 border-slate-200 hover:bg-slate-100"
                            }`}
                          >
                            Auto Dynamic
                          </button>
                          {CATEGORY_COLOR_PALETTES.map((p) => {
                            const isSelected = formColor === p.id;
                            const isAutoPicked = !formColor && previewTheme.id === p.id;
                            return (
                              <button
                                key={p.id}
                                type="button"
                                title={p.name}
                                onClick={() => setFormColor(p.id)}
                                className={`w-6 h-6 rounded-full flex items-center justify-center border transition-all cursor-pointer ${
                                  isSelected 
                                    ? "ring-2 ring-[#0f4c81] ring-offset-1 scale-110" 
                                    : isAutoPicked 
                                      ? "ring-1 ring-slate-400 opacity-90" 
                                      : "opacity-70 hover:opacity-100 hover:scale-105"
                                } ${p.dot} border-white shadow-xs`}
                              >
                                {isSelected && <Check size={11} className="text-white drop-shadow-xs" />}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>

              {/* Subtitle / Key Sub-items */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">
                  Subtitle / Key Equipment Types
                </label>
                <input
                  type="text"
                  placeholder="e.g. Split, Multi Split, VRF, Package Units"
                  value={formSubtitle}
                  onChange={(e) => setFormSubtitle(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-medium border border-slate-300 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:border-[#0f4c81] transition-all text-slate-900"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">
                  Displayed directly below the title on category cards and product listings.
                </span>
              </div>

              {/* Description */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">
                  Category Description
                </label>
                <textarea
                  rows={3}
                  placeholder="Comprehensive description of equipment included under this category..."
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-medium border border-slate-300 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:border-[#0f4c81] transition-all text-slate-900 resize-none"
                />
              </div>

              {/* ─────────────────────────────────────────────────────────────
                  IMAGE UPLOAD SECTION (Upload Image File & Direct URL)
              ───────────────────────────────────────────────────────────── */}
              <div className="space-y-2 bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-xs font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                      <ImageIcon size={14} className="text-[#0f4c81]" />
                      <span>Category Thumbnail Image</span>
                    </label>
                    <p className="text-[11px] text-slate-500">
                      Upload category product equipment photography or provide a direct image URL.
                    </p>
                  </div>

                  {/* Mode Toggle (Upload vs Direct URL) */}
                  <div className="flex items-center gap-1 bg-white p-0.5 rounded-lg border border-slate-200 text-[11px] font-bold">
                    <button
                      type="button"
                      onClick={() => setImageInputMode("upload")}
                      className={`px-2.5 py-1 rounded-md transition-all flex items-center gap-1 cursor-pointer ${
                        imageInputMode === "upload" ? "bg-[#0f4c81] text-white shadow-2xs" : "text-slate-600 hover:bg-slate-100"
                      }`}
                    >
                      <Upload size={12} />
                      <span>Upload File</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setImageInputMode("url")}
                      className={`px-2.5 py-1 rounded-md transition-all flex items-center gap-1 cursor-pointer ${
                        imageInputMode === "url" ? "bg-[#0f4c81] text-white shadow-2xs" : "text-slate-600 hover:bg-slate-100"
                      }`}
                    >
                      <Link2 size={12} />
                      <span>Direct URL</span>
                    </button>
                  </div>
                </div>

                {/* Hidden File Input */}
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageFileChange}
                  accept="image/*"
                  className="hidden"
                />

                {/* Upload Dropzone / Mode */}
                {imageInputMode === "upload" ? (
                  <div className="space-y-3 pt-1">
                    {!formImage ? (
                      <div
                        onClick={() => fileInputRef.current?.click()}
                        className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
                          isUploadingImage
                            ? "border-blue-400 bg-blue-50/50 cursor-wait"
                            : "border-slate-300 hover:border-[#0f4c81] bg-white hover:bg-blue-50/20"
                        }`}
                      >
                        <div className="flex flex-col items-center justify-center gap-2">
                          <div className="w-11 h-11 rounded-full bg-blue-50 text-[#0f4c81] flex items-center justify-center shadow-2xs">
                            {isUploadingImage ? (
                              <Loader2 size={20} className="animate-spin text-[#0f4c81]" />
                            ) : (
                              <Upload size={20} />
                            )}
                          </div>
                          <div>
                            <p className="text-xs font-bold text-slate-800">
                              {isUploadingImage ? "Uploading category image..." : "Click or Drag to Upload Category Image"}
                            </p>
                            <p className="text-[10px] text-slate-400 mt-0.5">
                              Supports JPG, PNG, WebP, SVG high-resolution images
                            </p>
                          </div>
                        </div>

                        {uploadStatus && (
                          <div className="mt-3 text-xs font-bold text-[#0f4c81] flex items-center justify-center gap-1.5">
                            <RefreshCw size={12} className="animate-spin" />
                            <span>{uploadStatus}</span>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="bg-white border border-slate-200 rounded-xl p-3 flex items-center justify-between gap-3 shadow-2xs">
                        <div className="flex items-center gap-3 min-w-0">
                          <img
                            src={formImage}
                            alt="Category Preview"
                            className="w-14 h-14 object-contain rounded-lg bg-slate-50 p-1 border border-slate-200 shrink-0"
                          />
                          <div className="min-w-0">
                            <span className="text-xs font-bold text-slate-900 block truncate">
                              Image attached
                            </span>
                            <span className="text-[10px] font-mono text-slate-400 block truncate max-w-xs">
                              {formImage}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg transition-colors cursor-pointer flex items-center gap-1"
                          >
                            <Upload size={12} />
                            <span>Change</span>
                          </button>
                          <button
                            type="button"
                            onClick={handleRemoveImage}
                            className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 text-xs font-bold rounded-lg transition-colors cursor-pointer flex items-center gap-1"
                          >
                            <Trash2 size={12} />
                            <span>Remove</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-2 pt-1">
                    <input
                      type="text"
                      placeholder="https://example.com/category-image.jpg or /src/assets/..."
                      value={formImage}
                      onChange={(e) => setFormImage(e.target.value)}
                      className="w-full px-3 py-2 text-xs font-mono border border-slate-300 rounded-xl bg-white focus:outline-none focus:border-[#0f4c81] transition-all text-slate-900"
                    />

                    {formImage && (
                      <div className="p-2 bg-white border border-slate-200 rounded-xl flex items-center gap-3 shadow-2xs">
                        <img
                          src={formImage}
                          alt="Preview"
                          className="w-12 h-12 object-contain bg-slate-50 rounded-lg p-1 border border-slate-200 shrink-0"
                        />
                        <div className="min-w-0 flex-1">
                          <span className="text-[11px] font-bold text-slate-700 block">Image Preview</span>
                          <span className="text-[10px] text-slate-400 font-mono truncate block">{formImage}</span>
                        </div>
                        <button
                          type="button"
                          onClick={handleRemoveImage}
                          className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg cursor-pointer"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Publish Status */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">
                  Publish Status
                </label>
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
                    <input
                      type="radio"
                      name="catStatus"
                      value="active"
                      checked={formStatus === "active"}
                      onChange={() => setFormStatus("active")}
                      className="text-[#0f4c81] focus:ring-[#0f4c81]"
                    />
                    <span>Active & Visible</span>
                  </label>

                  <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
                    <input
                      type="radio"
                      name="catStatus"
                      value="inactive"
                      checked={formStatus === "inactive"}
                      onChange={() => setFormStatus("inactive")}
                      className="text-[#0f4c81] focus:ring-[#0f4c81]"
                    />
                    <span>Hidden / Draft</span>
                  </label>
                </div>
              </div>

              {/* Actions */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 text-xs font-extrabold text-white bg-[#0f4c81] hover:bg-[#031b4e] rounded-xl shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <Check size={14} />
                  <span>{editingCategory ? "Save Changes" : "Create Category"}</span>
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
}
