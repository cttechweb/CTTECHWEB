import React, { useState, useEffect, useMemo } from "react";
import { 
  Search, Filter, ChevronRight, ChevronDown, ChevronLeft, X, 
  Copy, Check, Heart, Share2, ClipboardList, 
  LayoutGrid, List, Loader2
} from "lucide-react";
import { SparePart, Product } from "../types";
import { getSpareParts, loadAllSpareParts } from "../services/sparePartsService";
import { getGeneralSettings } from "../services/generalSettingsService";
import { useWishlist } from "../context/WishlistContext";
import DirhamSymbol from "./common/DirhamSymbol";

interface SparePartsPageProps {
  onAddToCart?: (product: Product, quantity?: number) => void;
  onRequestQuote?: (product?: Product) => void;
  onShowToast?: (msg: string) => void;
}

// Master categories matching the real scraped catalog of 10,046 parts
const SOURCING_CATEGORIES = [
  { name: "All Spare Parts", count: 10046 },
  { name: "Copper, Brass & Piping", count: 2349 },
  { name: "V Belts", count: 1752 },
  { name: "Controls, Sensors & Thermostats", count: 1692 },
  { name: "AC Fan Motors", count: 1599 },
  { name: "AC Compressors", count: 1319 },
  { name: "HVAC Tools", count: 400 },
  { name: "Ducting", count: 351 },
  { name: "Refrigeration Circuit Components", count: 220 },
  { name: "Refrigerants, Oils & Chemicals", count: 158 },
  { name: "AC Grills & Blowers", count: 88 },
  { name: "Expansion Valves & Driers", count: 61 },
  { name: "AC Capacitors", count: 57 }
];

const MASTER_BRANDS = [
  { name: "LG", count: 1402 },
  { name: "Danfoss", count: 457 },
  { name: "Copeland", count: 186 },
  { name: "Tecumseh", count: 167 },
  { name: "Yellow Jacket", count: 145 },
  { name: "General", count: 125 },
  { name: "Sanyo", count: 118 },
  { name: "Panasonic", count: 102 },
  { name: "Honeywell", count: 85 },
  { name: "Value", count: 76 },
  { name: "Castel", count: 70 },
  { name: "Carrier", count: 69 },
  { name: "Mueller", count: 65 },
  { name: "O General", count: 58 },
  { name: "Hitachi", count: 54 },
  { name: "Blue Star", count: 53 },
  { name: "Daikin", count: 51 },
  { name: "Mitsubishi", count: 50 },
  { name: "Samsung", count: 39 },
  { name: "Gree", count: 22 }
];

export default function SparePartsPage({
  onAddToCart,
  onRequestQuote,
  onShowToast
}: SparePartsPageProps) {
  const { isInWishlist, toggleWishlist } = useWishlist();
  const [parts, setParts] = useState<SparePart[]>(() => getSpareParts());
  const [isLoadingCatalog, setIsLoadingCatalog] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [sortBy, setSortBy] = useState<"recommended" | "newest" | "price-asc" | "price-desc" | "name">("recommended");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(24);
  const [copiedPartNumber, setCopiedPartNumber] = useState<string | null>(null);
  const [copiedShareId, setCopiedShareId] = useState<string | null>(null);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  // Load all 10,046 scraped spare parts on mount
  useEffect(() => {
    let isMounted = true;
    loadAllSpareParts()
      .then((loaded) => {
        if (isMounted) {
          setParts(loaded);
          setIsLoadingCatalog(false);
        }
      })
      .catch((err) => {
        console.error("Failed loading spare parts catalog:", err);
        if (isMounted) setIsLoadingCatalog(false);
      });
    return () => {
      isMounted = false;
    };
  }, []);

  // Sync parts live if updated via Admin panel
  useEffect(() => {
    const handleUpdate = () => {
      setParts(getSpareParts());
    };
    window.addEventListener("cooltech_spare_parts_updated", handleUpdate);
    window.addEventListener("storage", handleUpdate);
    return () => {
      window.removeEventListener("cooltech_spare_parts_updated", handleUpdate);
      window.removeEventListener("storage", handleUpdate);
    };
  }, []);

  // Reset to first page whenever filter or search query changes
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory, selectedBrands, searchQuery, sortBy]);

  // WhatsApp number from general settings
  const whatsappNumber = useMemo(() => {
    const s = getGeneralSettings();
    return s.whatsappNumber || "971501234567";
  }, []);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (selectedCategory !== "All") count++;
    if (selectedBrands.length > 0) count += selectedBrands.length;
    if (searchQuery.trim()) count++;
    return count;
  }, [selectedCategory, selectedBrands, searchQuery]);

  const clearAllFilters = () => {
    setSelectedCategory("All");
    setSelectedBrands([]);
    setSearchQuery("");
    setIsSearchOpen(false);
    setSortBy("recommended");
    setCurrentPage(1);
  };

  const handleToggleBrand = (brand: string) => {
    setSelectedBrands(prev => 
      prev.includes(brand) ? prev.filter(b => b !== brand) : [...prev, brand]
    );
  };

  const handleSelectCategory = (catName: string) => {
    if (catName === "All Spare Parts" || catName === "All") {
      setSelectedCategory("All");
    } else {
      setSelectedCategory(catName);
    }
  };

  // Filtered and sorted products
  const filteredParts = useMemo(() => {
    const cleanSearch = searchQuery.toLowerCase().trim();

    let result = parts.filter(p => {
      // Category filter matching
      if (selectedCategory !== "All") {
        const catLower = (p.category || "").toLowerCase();
        const selLower = selectedCategory.toLowerCase();
        const matchesCategory = 
          catLower === selLower || 
          catLower.includes(selLower) || 
          selLower.includes(catLower) ||
          (selLower.includes("valve") && (catLower.includes("valve") || catLower.includes("refrigeration"))) ||
          (selLower.includes("refrigeration") && (catLower.includes("valve") || catLower.includes("refrigeration"))) ||
          (selLower.includes("fan") && catLower.includes("fan")) ||
          (selLower.includes("compressor") && catLower.includes("compressor")) ||
          (selLower.includes("capacitor") && catLower.includes("capacitor")) ||
          (selLower.includes("pcb") && catLower.includes("pcb")) ||
          (selLower.includes("sensor") && (catLower.includes("sensor") || catLower.includes("thermostat")));

        if (!matchesCategory) return false;
      }

      // Brand filter matching
      if (selectedBrands.length > 0) {
        const partBrandLower = (p.brand || "").toLowerCase();
        const matchesBrand = selectedBrands.some(b => 
          partBrandLower === b.toLowerCase() || partBrandLower.includes(b.toLowerCase())
        );
        if (!matchesBrand) return false;
      }

      // Text search matching
      if (cleanSearch) {
        const terms = cleanSearch.split(/\s+/).filter(Boolean);
        const searchableText = `${p.title || ""} ${p.partNumber || ""} ${p.brand || ""} ${p.category || ""} ${p.compatibility || ""} ${p.description || ""}`.toLowerCase();
        const matchesAll = terms.every(term => searchableText.includes(term));
        if (!matchesAll) return false;
      }

      return true;
    });

    result.sort((a, b) => {
      if (sortBy === "newest") return (b.order || 0) - (a.order || 0);
      if (sortBy === "name") return (a.title || "").localeCompare(b.title || "");
      if (sortBy === "price-asc") return (a.price || 0) - (b.price || 0);
      if (sortBy === "price-desc") return (b.price || 0) - (a.price || 0);
      return (a.order || 0) - (b.order || 0);
    });

    return result;
  }, [parts, selectedCategory, selectedBrands, searchQuery, sortBy]);

  // Pagination computations
  const totalItems = filteredParts.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);

  const paginatedParts = useMemo(() => {
    return filteredParts.slice(startIndex, endIndex);
  }, [filteredParts, startIndex, endIndex]);

  const paginationPages = useMemo(() => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    const pages: (number | string)[] = [];
    pages.push(1);

    if (currentPage > 3) {
      pages.push("...");
    }

    const start = Math.max(2, currentPage - 1);
    const end = Math.min(totalPages - 1, currentPage + 1);

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    if (currentPage < totalPages - 2) {
      pages.push("...");
    }

    pages.push(totalPages);
    return pages;
  }, [totalPages, currentPage]);

  const handleCopyPartNumber = (partNumber: string) => {
    navigator.clipboard.writeText(partNumber);
    setCopiedPartNumber(partNumber);
    if (onShowToast) onShowToast(`Part Number ${partNumber} copied`);
    setTimeout(() => setCopiedPartNumber(null), 1800);
  };

  const toProduct = (part: SparePart): Product => ({
    id: part.id,
    name: `${part.title} (Part #${part.partNumber})`,
    category: part.category,
    description: `${part.description}\nOEM Part #: ${part.partNumber}\nCompatibility: ${part.compatibility}`,
    image: part.image,
    price: part.price || 0,
    rating: 5,
    brand: part.brand,
    inStock: part.inStock,
    specifications: {
      "Part Number": part.partNumber,
      "Brand": part.brand,
      "Category": part.category,
      "Compatibility": part.compatibility,
    },
    features: [
      `OEM Part #: ${part.partNumber}`,
      `Brand: ${part.brand}`,
      `Compatibility: ${part.compatibility}`
    ],
    isFeatured: true,
    tags: [part.brand, part.category, "Spare Part", part.partNumber]
  });

  const handleWhatsAppInquiry = (part: SparePart) => {
    const cleanPhone = whatsappNumber.replace(/[^0-9]/g, "");
    const productUrl = `${window.location.origin}${window.location.pathname}#/spare-parts?search=${encodeURIComponent(part.partNumber)}`;
    const text = encodeURIComponent(
      `Hello Cool Technologies, I would like to enquire about this AC spare part:\n\n` +
      `Product: ${part.title}\n` +
      `SKU: ${part.partNumber}\n` +
      `Category: ${part.category}\n` +
      `Product link: ${productUrl}\n\n` +
      `Please share its availability, compatibility, and quotation.`
    );
    window.open(`https://wa.me/${cleanPhone}?text=${text}`, "_blank");
  };

  const handleAddToQuoteCart = (part: SparePart) => {
    const pseudoProduct = toProduct(part);
    if (onRequestQuote) {
      onRequestQuote(pseudoProduct);
    } else if (onAddToCart) {
      onAddToCart(pseudoProduct, 1);
    }
  };

  const handleSharePart = async (part: SparePart) => {
    const shareUrl = `${window.location.origin}${window.location.pathname}#/spare-parts?search=${encodeURIComponent(part.partNumber)}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${part.title} | Cool Technologies`,
          text: `Check out ${part.title} (OEM Part #${part.partNumber}) on Cool Technologies UAE: ${shareUrl}`,
          url: shareUrl,
        });
        return;
      } catch (err: any) {
        if (err.name === "AbortError") return;
      }
    }
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopiedShareId(part.id);
      if (onShowToast) onShowToast(`Link for Part #${part.partNumber} copied`);
      setTimeout(() => setCopiedShareId(null), 2000);
    } catch {}
  };

  return (
    <div className="w-full bg-[#f8fafc] min-h-screen py-4 sm:py-6 lg:py-8 font-sans" id="spare-parts-page-container">
      <div className="max-w-[1360px] mx-auto px-3 sm:px-5">

        {/* MOBILE CONTROLS BAR (< lg) */}
        <div className="block lg:hidden mb-4 space-y-2.5">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsMobileFilterOpen(true)}
              className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold flex items-center justify-between border shadow-xs transition-all cursor-pointer ${
                activeFilterCount > 0
                  ? "bg-[#031b4e] text-white border-[#031b4e]"
                  : "bg-white text-slate-700 border-[#c4c6d3]"
              }`}
            >
              <div className="flex items-center gap-2">
                <Filter size={15} className={activeFilterCount > 0 ? "text-cyan-400" : "text-slate-500"} />
                <span>Filters</span>
              </div>
              {activeFilterCount > 0 && (
                <span className="w-5 h-5 rounded-full bg-cyan-400 text-slate-950 font-black text-[10px] flex items-center justify-center">
                  {activeFilterCount}
                </span>
              )}
            </button>

            {/* Mobile Search Icon Toggle */}
            <button
              type="button"
              onClick={() => setIsSearchOpen(prev => !prev)}
              className={`p-2.5 rounded-xl border border-[#c4c6d3] transition-colors cursor-pointer ${
                isSearchOpen || searchQuery ? "bg-[#031b4e] text-white" : "bg-white text-slate-700"
              }`}
              title="Search spare parts"
              aria-label="Search"
            >
              <Search size={16} />
            </button>

            {/* Grid / List Switcher Mobile */}
            <div className="flex items-center rounded-xl border border-[#c4c6d3] overflow-hidden bg-white shrink-0">
              <button
                type="button"
                onClick={() => setViewMode("grid")}
                className={`p-2.5 transition-colors cursor-pointer ${
                  viewMode === "grid" ? "bg-[#031b4e] text-white" : "text-slate-600 hover:bg-slate-50"
                }`}
                aria-label="Grid View"
              >
                <LayoutGrid size={16} />
              </button>
              <button
                type="button"
                onClick={() => setViewMode("list")}
                className={`p-2.5 transition-colors cursor-pointer ${
                  viewMode === "list" ? "bg-[#031b4e] text-white" : "text-slate-600 hover:bg-slate-50"
                }`}
                aria-label="List View"
              >
                <List size={16} />
              </button>
            </div>
          </div>

          {/* Expandable search bar on mobile when toggled */}
          {isSearchOpen && (
            <div className="relative animate-in fade-in duration-150">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                autoFocus
                placeholder="Search spare parts, SKU, brand..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white border border-[#031b4e] rounded-xl pl-9 pr-8 py-2.5 text-xs text-slate-800 font-medium focus:outline-none shadow-xs"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                >
                  <X size={14} />
                </button>
              )}
            </div>
          )}
        </div>

        {/* MAIN 2-COLUMN STRUCTURE - COMPETITOR REPLICATION */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
          
          {/* LEFT SIDEBAR: FILTERS */}
          <aside className="hidden lg:block lg:col-span-3 bg-transparent self-start sticky top-24 z-10 space-y-5">
            <div className="bg-white border border-[#c4c6d3] rounded-[14px] p-5 shadow-xs space-y-5">
              
              {/* Header: Filters + Clear All */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h2 className="font-bold text-[18px] text-[#1a1b21]">
                  Filters
                </h2>
                {activeFilterCount > 0 && (
                  <button 
                    onClick={clearAllFilters}
                    className="text-xs text-[#2596be] hover:text-[#031b4e] font-semibold hover:underline cursor-pointer transition-colors"
                  >
                    Clear All
                  </button>
                )}
              </div>

              {/* Sidebar Search Input */}
              <div className="relative">
                <Search size={15} className="absolute left-3 top-3 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search spare parts..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white border border-[#c4c6d3] focus:border-[#031b4e] rounded-[8px] pl-9 pr-8 py-2 text-xs text-slate-800 placeholder:text-slate-400 font-medium focus:outline-none transition-all"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>

              {/* Part Category Tree */}
              <div>
                <h3 className="text-xs font-bold text-[#1a1b21] mb-2.5">
                  Part Category
                </h3>

                <div className="space-y-0.5 max-h-[380px] overflow-y-auto pr-1 scrollbar-thin">
                  {/* All Spare Parts Root Item */}
                  <button
                    type="button"
                    onClick={() => handleSelectCategory("All")}
                    className={`w-full text-left px-2 py-1.5 rounded-[6px] text-xs transition-colors flex items-center justify-between cursor-pointer ${
                      selectedCategory === "All"
                        ? "bg-[#eef5fc] text-[#031b4e] font-bold"
                        : "text-[#434652] hover:bg-[#f4f7fb] hover:text-[#031b4e] font-medium"
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate pr-2">
                      <span className={`grid size-3.5 place-items-center rounded-[3px] border ${
                        selectedCategory === "All"
                          ? "border-[#031b4e] bg-[#031b4e] text-white"
                          : "border-[#c4c6d3] bg-white"
                      }`}>
                        {selectedCategory === "All" && <Check size={10} className="stroke-[3]" />}
                      </span>
                      <span className="truncate">All Spare Parts</span>
                    </div>
                    <span className="text-xs text-slate-400 shrink-0">(10046)</span>
                  </button>

                  {/* Subcategories list */}
                  {SOURCING_CATEGORIES.filter(c => c.name !== "All Spare Parts").map((cat) => {
                    const isSelected = selectedCategory.toLowerCase() === cat.name.toLowerCase();
                    return (
                      <button
                        key={cat.name}
                        type="button"
                        onClick={() => handleSelectCategory(cat.name)}
                        className={`w-full text-left px-2 py-1.5 rounded-[6px] text-xs transition-colors flex items-center justify-between cursor-pointer group ${
                          isSelected
                            ? "bg-[#eef5fc] text-[#031b4e] font-bold"
                            : "text-[#434652] hover:bg-[#f4f7fb] hover:text-[#031b4e] font-medium"
                        }`}
                      >
                        <div className="flex items-center gap-1.5 truncate pr-2">
                          <ChevronRight size={12} className="text-slate-400 group-hover:text-slate-600 transition-transform shrink-0" />
                          <span className={`grid size-3.5 place-items-center rounded-[3px] border shrink-0 ${
                            isSelected
                              ? "border-[#031b4e] bg-[#031b4e] text-white"
                              : "border-[#c4c6d3] bg-white"
                          }`}>
                            {isSelected && <Check size={10} className="stroke-[3]" />}
                          </span>
                          <span className="truncate">{cat.name}</span>
                        </div>
                        <span className="text-xs text-slate-400 shrink-0">({cat.count})</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Brands Filter */}
              <div className="pt-3 border-t border-slate-100">
                <div className="flex items-center justify-between mb-2.5">
                  <h3 className="text-xs font-bold text-[#1a1b21]">
                    Brands
                  </h3>
                  {selectedBrands.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setSelectedBrands([])}
                      className="text-[11px] text-[#2596be] hover:underline cursor-pointer"
                    >
                      Reset
                    </button>
                  )}
                </div>

                <div className="space-y-1 max-h-[220px] overflow-y-auto pr-1">
                  {MASTER_BRANDS.map((brand) => {
                    const isChecked = selectedBrands.includes(brand.name);
                    return (
                      <label
                        key={brand.name}
                        className={`flex items-center justify-between px-2 py-1.5 rounded-[6px] text-xs cursor-pointer select-none transition-colors ${
                          isChecked
                            ? "bg-[#eef5fc] text-[#031b4e] font-bold"
                            : "text-[#434652] hover:bg-[#f4f7fb] hover:text-[#031b4e] font-medium"
                        }`}
                      >
                        <div className="flex items-center gap-2 truncate pr-2">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => handleToggleBrand(brand.name)}
                            className="sr-only"
                          />
                          <span className={`grid size-3.5 place-items-center rounded-[3px] border ${
                            isChecked
                              ? "border-[#031b4e] bg-[#031b4e] text-white"
                              : "border-[#c4c6d3] bg-white"
                          }`}>
                            {isChecked && <Check size={10} className="stroke-[3]" />}
                          </span>
                          <span className="truncate">{brand.name}</span>
                        </div>
                        <span className="text-xs text-slate-400 shrink-0">({brand.count})</span>
                      </label>
                    );
                  })}
                </div>
              </div>

            </div>
          </aside>

          {/* RIGHT MAIN COLUMN: PRODUCTS */}
          <main className="lg:col-span-9">
            
            {/* TOP BAR - RESULTS COUNT, SEARCH ICON TRIGGER, SORT, VIEW SWITCHER */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-[12px] border border-[#c4c6d3] bg-white p-3.5 sm:px-5 sm:py-3.5 mb-6 shadow-xs">
              <div className="flex items-center gap-2">
                <p className="text-[13px] text-[#434652] sm:text-sm font-medium">
                  Showing <span className="font-bold text-[#1a1b21]">{totalItems === 0 ? 0 : startIndex + 1}–{endIndex}</span> of{" "}
                  <span className="font-bold text-[#1a1b21]">{totalItems.toLocaleString()}</span> Spare Parts
                </p>
                {isLoadingCatalog && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#2596be] bg-[#eef5fc] px-2 py-0.5 rounded-full">
                    <Loader2 size={11} className="animate-spin" />
                    <span>Syncing...</span>
                  </span>
                )}
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-2.5 sm:gap-3 flex-wrap">
                
                {/* Search Icon Trigger / Expandable Input */}
                {isSearchOpen ? (
                  <div className="relative flex items-center animate-in fade-in duration-200">
                    <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      autoFocus
                      placeholder="Search parts, SKU, brand..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="h-[34px] w-48 sm:w-60 pl-8 pr-7 text-xs font-medium rounded-[8px] border border-[#031b4e] focus:outline-none bg-white text-slate-800 shadow-xs"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setSearchQuery("");
                        setIsSearchOpen(false);
                      }}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
                      title="Close search"
                    >
                      <X size={13} />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setIsSearchOpen(true)}
                    className={`grid size-[34px] place-items-center rounded-[8px] border transition-colors cursor-pointer ${
                      searchQuery
                        ? "bg-[#031b4e] text-white border-[#031b4e]"
                        : "bg-white border-[#c4c6d3] text-slate-600 hover:text-[#031b4e] hover:border-[#031b4e]"
                    }`}
                    title="Click to search spare parts"
                    aria-label="Search spare parts"
                  >
                    <Search size={15} />
                  </button>
                )}

                {/* Sort By Dropdown */}
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <span className="hidden sm:inline text-xs text-[#434652] font-medium">Sort by:</span>
                  <div className="relative">
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as any)}
                      aria-label="Sort parts"
                      className="appearance-none bg-white border border-[#c4c6d3] text-[#1a1b21] text-xs sm:text-sm font-medium rounded-[8px] pl-3 pr-8 py-1.5 focus:outline-none focus:border-[#031b4e] cursor-pointer"
                    >
                      <option value="recommended">Recommended</option>
                      <option value="newest">Newest</option>
                      <option value="price-asc">Price: Low to High</option>
                      <option value="price-desc">Price: High to Low</option>
                      <option value="name">Name (A-Z)</option>
                    </select>
                    <ChevronDown size={14} className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500" />
                  </div>
                </div>

                {/* Grid / List View Switcher Buttons */}
                <div className="hidden sm:flex overflow-hidden rounded-[8px] border border-[#c4c6d3]">
                  <button
                    type="button"
                    onClick={() => setViewMode("grid")}
                    className={`grid size-[32px] place-items-center transition-colors cursor-pointer ${
                      viewMode === "grid"
                        ? "bg-[#031b4e] text-white"
                        : "bg-white text-slate-500 hover:bg-slate-50"
                    }`}
                    aria-label="Grid view"
                    title="Grid view"
                  >
                    <LayoutGrid size={15} />
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode("list")}
                    className={`grid size-[32px] place-items-center transition-colors cursor-pointer border-l border-[#c4c6d3] ${
                      viewMode === "list"
                        ? "bg-[#031b4e] text-white"
                        : "bg-white text-slate-500 hover:bg-slate-50"
                    }`}
                    aria-label="List view"
                    title="List view"
                  >
                    <List size={16} />
                  </button>
                </div>
              </div>
            </div>

            {/* Zero State Matches */}
            {filteredParts.length === 0 && (
              <div className="bg-white border border-[#c4c6d3] rounded-[14px] p-8 sm:p-12 text-center max-w-lg mx-auto shadow-xs">
                <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mx-auto mb-4">
                  <Search size={24} />
                </div>
                <h4 className="text-base font-bold text-[#1a1b21] mb-1">No Spare Parts Matched</h4>
                <p className="text-xs text-slate-500 leading-relaxed mb-6">
                  We could not find any OEM spare parts conforming to your keywords or selected category.
                </p>
                <button
                  onClick={clearAllFilters}
                  className="bg-[#031b4e] hover:bg-[#021338] text-white font-bold text-xs px-5 py-2.5 rounded-[8px] transition-all cursor-pointer shadow-xs"
                >
                  Reset Filters
                </button>
              </div>
            )}

            {/* GRID VIEW MODE - COMPETITOR EXACT REPLICATION */}
            {viewMode === "grid" && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
                {paginatedParts.map((part) => {
                  const isPartCopied = copiedShareId === part.id;
                  const isPartNoCopied = copiedPartNumber === part.partNumber;

                  return (
                    <article
                      key={part.id}
                      className="overflow-hidden rounded-[12px] border border-[#c4c6d3] bg-white hover:border-[#2596be] hover:shadow-md transition duration-200 flex flex-col justify-between group"
                    >
                      {/* Top Product Image Container on Pure White */}
                      <div>
                        <div className="relative h-[210px] w-full flex items-center justify-center border-b border-[#f4f7fb] bg-white p-4 overflow-hidden">
                          <img
                            src={part.image}
                            alt={part.title}
                            className="max-h-[170px] max-w-[85%] w-auto h-auto object-contain group-hover:scale-105 transition-transform duration-300"
                            loading="lazy"
                            onError={(e) => {
                              e.currentTarget.onerror = null;
                              e.currentTarget.src = "/images/spare-parts/akv-10p0-valve.jpg";
                            }}
                          />

                          {/* Top-Right Quick Action Icons (Wishlist & Share) */}
                          <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5 z-10">
                            <button
                              type="button"
                              onClick={() => toggleWishlist({ type: "product", product: toProduct(part) })}
                              className={`p-1.5 rounded-full transition-all cursor-pointer ${
                                isInWishlist(part.id)
                                  ? "bg-rose-50 text-rose-600 shadow-xs"
                                  : "text-slate-400 hover:text-rose-600 hover:bg-slate-100"
                              }`}
                              title={isInWishlist(part.id) ? "Remove from Wishlist" : "Save to Wishlist"}
                              aria-label="Save to Wishlist"
                            >
                              <Heart
                                size={14}
                                className={isInWishlist(part.id) ? "fill-rose-500 text-rose-500" : ""}
                              />
                            </button>

                            <button
                              type="button"
                              onClick={() => handleSharePart(part)}
                              className="p-1.5 text-slate-400 hover:text-[#031b4e] hover:bg-slate-100 rounded-full transition-colors cursor-pointer"
                              title="Share part"
                              aria-label="Share part"
                            >
                              {isPartCopied ? <Check size={14} className="text-emerald-600 stroke-[3]" /> : <Share2 size={14} />}
                            </button>
                          </div>
                        </div>

                        {/* Card Content Details */}
                        <div className="space-y-2 p-4">
                          {/* Uppercase Category Breadcrumb Tag */}
                          <p className="line-clamp-1 text-[11px] font-semibold uppercase tracking-[1.5px] text-[#2596be]">
                            {part.category}
                          </p>

                          {/* Product Title in quotes */}
                          <h3 className="text-[14px] font-bold leading-[19px] text-[#1a1b21] min-h-[38px] line-clamp-2">
                            {part.title.startsWith("“") ? part.title : `“${part.title}”`}
                          </h3>

                          {/* Prompt / Description */}
                          <p className="text-[12px] leading-[17px] text-[#434652] line-clamp-2 min-h-[34px]">
                            {part.description.startsWith("Request") 
                              ? part.description 
                              : `Request availability and compatibility for ${part.title.startsWith("“") ? part.title : `“${part.title}”`}.`}
                          </p>

                          {/* Brand & Part Number Strip */}
                          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                            <span className="font-semibold text-slate-500">{part.brand}</span>
                            <div className="flex items-center gap-1 font-mono text-[#031b4e] font-bold">
                              <span>#{part.partNumber}</span>
                              <button
                                type="button"
                                onClick={() => handleCopyPartNumber(part.partNumber)}
                                className="text-slate-400 hover:text-slate-700 p-0.5 cursor-pointer"
                                title="Copy part number"
                              >
                                {isPartNoCopied ? <Check size={11} className="text-emerald-600" /> : <Copy size={11} />}
                              </button>
                            </div>
                          </div>

                          {/* Rate display (Cool Tech Style) */}
                          <div className="flex items-center justify-between text-[12px] pt-1">
                            <span className="text-slate-400 font-medium">Wholesale Rate:</span>
                            {part.price && part.price > 0 ? (
                              <span className="font-bold text-[#031b4e] flex items-center gap-1">
                                <DirhamSymbol className="h-3 w-auto" />
                                <span>AED {part.price.toLocaleString()}</span>
                              </span>
                            ) : (
                              <span className="font-bold text-[#2596be]">Price on Inquiry</span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Card Action Buttons (Direct WhatsApp & Add to Quote, No Eye / No Modal) */}
                      <div className="p-4 pt-0 space-y-2">
                        {/* Enquire on WhatsApp - EXACT COMPETITOR BUTTON */}
                        <button
                          type="button"
                          onClick={() => handleWhatsAppInquiry(part)}
                          className="w-full flex h-[40px] items-center justify-center gap-2 rounded-[8px] border border-[#031b4e] hover:border-[#25D366] hover:bg-emerald-50 text-[13px] font-bold text-[#031b4e] hover:text-[#128C7E] transition shadow-xs cursor-pointer active:scale-98"
                        >
                          <img 
                            src="/whatsapp-official.png" 
                            alt="WhatsApp" 
                            className="w-4 h-4 object-contain shrink-0" 
                          />
                          <span>Enquire on WhatsApp</span>
                        </button>

                        {/* Add to Quote Button */}
                        <button
                          type="button"
                          onClick={() => handleAddToQuoteCart(part)}
                          className="w-full flex h-[36px] items-center justify-center gap-1.5 rounded-[8px] bg-slate-100 hover:bg-[#2596be] text-slate-700 hover:text-white text-xs font-semibold transition-all cursor-pointer"
                        >
                          <ClipboardList size={14} />
                          <span>Add to Quote</span>
                        </button>
                      </div>

                    </article>
                  );
                })}
              </div>
            )}

            {/* LIST VIEW MODE */}
            {viewMode === "list" && (
              <div className="space-y-4">
                {paginatedParts.map((part) => {
                  const isPartNoCopied = copiedPartNumber === part.partNumber;

                  return (
                    <article
                      key={part.id}
                      className="rounded-[12px] border border-[#c4c6d3] bg-white overflow-hidden hover:border-[#2596be] hover:shadow-md transition duration-200 flex flex-col sm:flex-row items-stretch"
                    >
                      {/* Image Frame */}
                      <div className="w-full sm:w-52 h-44 sm:h-auto bg-white border-b sm:border-b-0 sm:border-r border-[#f4f7fb] p-4 flex items-center justify-center shrink-0">
                        <img
                          src={part.image}
                          alt={part.title}
                          className="max-h-36 max-w-full object-contain hover:scale-105 transition-transform"
                          loading="lazy"
                          onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src = "/images/spare-parts/akv-10p0-valve.jpg";
                          }}
                        />
                      </div>

                      {/* Content Area */}
                      <div className="flex-1 p-4 sm:p-5 flex flex-col justify-between">
                        <div>
                          <p className="text-[11px] font-semibold uppercase tracking-[1.5px] text-[#2596be] mb-1">
                            {part.category} &bull; {part.brand}
                          </p>
                          <h3 className="text-base font-bold text-[#1a1b21] mb-2">
                            {part.title.startsWith("“") ? part.title : `“${part.title}”`}
                          </h3>
                          <p className="text-xs text-[#434652] leading-relaxed mb-3">
                            {part.description}
                          </p>
                        </div>

                        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 pt-2 border-t border-slate-100">
                          <span className="font-mono text-[#031b4e] font-bold flex items-center gap-1">
                            Part #: {part.partNumber}
                            <button
                              type="button"
                              onClick={() => handleCopyPartNumber(part.partNumber)}
                              className="text-slate-400 hover:text-slate-700 cursor-pointer"
                            >
                              {isPartNoCopied ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />}
                            </button>
                          </span>
                          <span>&bull;</span>
                          <span>Fits: <strong className="text-slate-700">{part.compatibility}</strong></span>
                        </div>
                      </div>

                      {/* Actions & Pricing Area */}
                      <div className="w-full sm:w-64 p-4 sm:p-5 bg-slate-50/60 border-t sm:border-t-0 sm:border-l border-slate-100 flex flex-col justify-between shrink-0">
                        <div>
                          <span className="text-xs text-slate-400 font-medium block">Wholesale Rate</span>
                          {part.price && part.price > 0 ? (
                            <div className="text-lg font-black text-[#031b4e] flex items-center gap-1 mt-0.5">
                              <DirhamSymbol className="h-3.5 w-auto" />
                              <span>AED {part.price.toLocaleString()}</span>
                            </div>
                          ) : (
                            <span className="text-sm font-bold text-[#2596be] block mt-0.5">Price on Inquiry</span>
                          )}
                          <span className="text-[11px] text-emerald-700 font-semibold block mt-1">
                            &bull; Immediate UAE Dispatch
                          </span>
                        </div>

                        <div className="space-y-2 mt-4">
                          <button
                            type="button"
                            onClick={() => handleWhatsAppInquiry(part)}
                            className="w-full flex h-[38px] items-center justify-center gap-2 rounded-[8px] border border-[#031b4e] hover:border-[#25D366] hover:bg-emerald-50 text-xs font-bold text-[#031b4e] hover:text-[#128C7E] transition cursor-pointer"
                          >
                            <img src="/whatsapp-official.png" alt="WhatsApp" className="w-4 h-4 object-contain" />
                            <span>Enquire on WhatsApp</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleAddToQuoteCart(part)}
                            className="w-full py-2 bg-slate-100 hover:bg-[#2596be] text-slate-700 hover:text-white rounded-[8px] text-xs font-semibold transition flex items-center justify-center gap-1.5 cursor-pointer"
                          >
                            <ClipboardList size={13} />
                            <span>Add to Quote</span>
                          </button>
                        </div>
                      </div>

                    </article>
                  );
                })}
              </div>
            )}

            {/* PAGINATION CONTROLS */}
            {totalPages > 1 && (
              <div className="mt-8 pt-6 border-t border-[#c4c6d3] flex flex-col sm:flex-row items-center justify-between gap-4">
                {/* Left: count & per page */}
                <div className="flex items-center gap-3 text-xs text-[#434652] font-medium">
                  <span>
                    Showing <strong className="text-[#1a1b21]">{totalItems === 0 ? 0 : startIndex + 1}–{endIndex}</strong> of <strong className="text-[#1a1b21]">{totalItems.toLocaleString()}</strong> parts
                  </span>
                  <span className="text-slate-300">|</span>
                  <div className="flex items-center gap-1.5">
                    <span>Per page:</span>
                    <select
                      value={itemsPerPage}
                      onChange={(e) => {
                        setItemsPerPage(Number(e.target.value));
                        setCurrentPage(1);
                      }}
                      className="bg-white border border-[#c4c6d3] rounded-[6px] px-2 py-1 text-xs text-[#1a1b21] font-semibold focus:outline-none focus:border-[#031b4e] cursor-pointer"
                    >
                      <option value={24}>24</option>
                      <option value={48}>48</option>
                      <option value={96}>96</option>
                    </select>
                  </div>
                </div>

                {/* Right: Page Buttons */}
                <div className="flex items-center gap-1 flex-wrap justify-center">
                  {/* Prev Button */}
                  <button
                    type="button"
                    onClick={() => {
                      setCurrentPage(prev => Math.max(1, prev - 1));
                      window.scrollTo({ top: 160, behavior: "smooth" });
                    }}
                    disabled={currentPage === 1}
                    className="px-2.5 sm:px-3 py-1.5 rounded-[8px] border border-[#c4c6d3] text-xs font-semibold text-[#1a1b21] hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition flex items-center gap-1 cursor-pointer"
                  >
                    <ChevronLeft size={14} />
                    <span className="hidden sm:inline">Prev</span>
                  </button>

                  {/* Page numbers */}
                  {paginationPages.map((p, idx) => {
                    if (p === "...") {
                      return (
                        <span key={`ellipsis-${idx}`} className="px-2 py-1 text-slate-400 text-xs font-bold">
                          ...
                        </span>
                      );
                    }
                    const pageNum = Number(p);
                    const isActive = pageNum === currentPage;
                    return (
                      <button
                        type="button"
                        key={pageNum}
                        onClick={() => {
                          setCurrentPage(pageNum);
                          window.scrollTo({ top: 160, behavior: "smooth" });
                        }}
                        className={`min-w-[32px] h-[32px] px-2 rounded-[8px] text-xs font-bold transition cursor-pointer ${
                          isActive
                            ? "bg-[#031b4e] text-white shadow-xs"
                            : "border border-[#c4c6d3] text-[#1a1b21] hover:bg-slate-100"
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}

                  {/* Next Button */}
                  <button
                    type="button"
                    onClick={() => {
                      setCurrentPage(prev => Math.min(totalPages, prev + 1));
                      window.scrollTo({ top: 160, behavior: "smooth" });
                    }}
                    disabled={currentPage === totalPages}
                    className="px-2.5 sm:px-3 py-1.5 rounded-[8px] border border-[#c4c6d3] text-xs font-semibold text-[#1a1b21] hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition flex items-center gap-1 cursor-pointer"
                  >
                    <span className="hidden sm:inline">Next</span>
                    <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            )}

          </main>
        </div>

      </div>

      {/* MOBILE SLIDE-UP FILTER DRAWER */}
      {isMobileFilterOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center p-0 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white text-slate-900 w-full rounded-t-3xl shadow-2xl overflow-hidden max-h-[85vh] flex flex-col animate-in slide-in-from-bottom duration-200">
            
            {/* Header */}
            <div className="px-5 py-4 bg-[#031b4e] text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Filter size={18} className="text-cyan-400" />
                <h3 className="font-bold text-sm uppercase tracking-wider">Refine Spare Parts</h3>
              </div>
              <button
                onClick={() => setIsMobileFilterOpen(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {/* Scrollable Body */}
            <div className="p-5 space-y-5 overflow-y-auto">
              {/* Part Category */}
              <div>
                <h4 className="text-xs font-bold text-slate-900 mb-2">Part Category</h4>
                <div className="space-y-1 max-h-56 overflow-y-auto pr-1">
                  <button
                    onClick={() => {
                      handleSelectCategory("All");
                      setIsMobileFilterOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold flex items-center justify-between ${
                      selectedCategory === "All" ? "bg-[#eef5fc] text-[#031b4e] font-bold" : "text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    <span>All Spare Parts</span>
                    <span className="text-slate-400">(10046)</span>
                  </button>

                  {SOURCING_CATEGORIES.filter(c => c.name !== "All Spare Parts").map((cat) => (
                    <button
                      key={cat.name}
                      onClick={() => {
                        handleSelectCategory(cat.name);
                        setIsMobileFilterOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold flex items-center justify-between ${
                        selectedCategory.toLowerCase() === cat.name.toLowerCase()
                          ? "bg-[#eef5fc] text-[#031b4e] font-bold"
                          : "text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      <span>{cat.name}</span>
                      <span className="text-slate-400">({cat.count})</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Brands */}
              <div className="pt-3 border-t border-slate-100">
                <h4 className="text-xs font-bold text-slate-900 mb-2">Brands</h4>
                <div className="space-y-1 max-h-44 overflow-y-auto pr-1">
                  {MASTER_BRANDS.map((brand) => {
                    const isChecked = selectedBrands.includes(brand.name);
                    return (
                      <label
                        key={brand.name}
                        className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs cursor-pointer ${
                          isChecked ? "bg-[#eef5fc] text-[#031b4e] font-bold" : "text-slate-700 hover:bg-slate-50"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => handleToggleBrand(brand.name)}
                            className="w-4 h-4 rounded border-slate-300 text-[#031b4e] focus:ring-[#031b4e]"
                          />
                          <span>{brand.name}</span>
                        </div>
                        <span className="text-slate-400">({brand.count})</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center gap-3">
              <button
                type="button"
                onClick={clearAllFilters}
                className="flex-1 py-2.5 border border-slate-200 text-slate-700 font-bold text-xs rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                Reset All
              </button>
              <button
                type="button"
                onClick={() => setIsMobileFilterOpen(false)}
                className="flex-1 py-2.5 bg-[#031b4e] text-white font-bold text-xs uppercase tracking-wider rounded-lg cursor-pointer"
              >
                Apply Filters
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
