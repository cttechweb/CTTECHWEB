import React, { useState, useEffect, useMemo, useRef } from "react";
import { 
  ArrowRight, 
  Tag,
  ChevronDown,
  ChevronUp,
  SlidersHorizontal,
  Check,
  X,
  Search,
  Layers
} from "lucide-react";
import { Category, Product } from "../types";
import { getCategories, getLocalCategories } from "../services/categoryService";
import { PRODUCTS } from "../data";
import { getCategoryColorTheme } from "../utils/categoryColors";
import { ScrollingTagBadge } from "./ScrollingTagBadge";

interface CategoriesPageProps {
  products?: Product[];
  onSelectCategory?: (categoryName: string) => void;
  onOpenQuote?: () => void;
}

export default function CategoriesPage({
  products,
  onSelectCategory
}: CategoriesPageProps) {
  const activeProducts = products || PRODUCTS;
  const [categories, setCategories] = useState<Category[]>(getLocalCategories);
  const [selectedTag, setSelectedTag] = useState<string>("All");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filterSearch, setFilterSearch] = useState("");
  const [expandedCards, setExpandedCards] = useState<Record<string, boolean>>({});

  const filterDropdownRef = useRef<HTMLDivElement | null>(null);

  const toggleCardExpand = (e: React.MouseEvent, cardId: string) => {
    e.stopPropagation();
    setExpandedCards((prev) => ({
      ...prev,
      [cardId]: !prev[cardId],
    }));
  };

  // Close dropdown on outside click or Escape key
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (filterDropdownRef.current && !filterDropdownRef.current.contains(e.target as Node)) {
        setIsFilterOpen(false);
      }
    };
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsFilterOpen(false);
      }
    };

    if (isFilterOpen) {
      document.addEventListener("mousedown", handleOutsideClick);
      document.addEventListener("keydown", handleEscape);
    }
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isFilterOpen]);

  const loadData = async () => {
    const list = await getCategories();
    setCategories(list);
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

  // Technical SEO & Structured Data
  useEffect(() => {
    document.title = "Shop by Category | HVAC Product Sourcing Directory - Cool Technologies";
    
    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement("meta");
      metaDesc.setAttribute("name", "description");
      document.head.appendChild(metaDesc);
    }
    metaDesc.setAttribute(
      "content",
      "Browse our professional-grade wholesale HVAC inventories. Explore certified chillers, air conditioners, air coolers, compressors, heat exchangers, and plumbing fittings."
    );

    let schemaScript = document.getElementById("seo-jsonld-categories");
    if (!schemaScript) {
      schemaScript = document.createElement("script");
      schemaScript.id = "seo-jsonld-categories";
      schemaScript.setAttribute("type", "application/ld+json");
      document.head.appendChild(schemaScript);
    }

    const jsonLdData = {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      "name": "HVAC Sourcing Categories Directory",
      "description": "Comprehensive B2B directory of certified HVAC equipment categories available for wholesale procurement in Dubai, Abu Dhabi, and the GCC.",
      "url": "https://cooltechnologies.ae/#/categories",
      "mainEntity": {
        "@type": "ItemList",
        "itemListElement": categories.map((cat, idx) => ({
          "@type": "ListItem",
          "position": idx + 1,
          "name": cat.name,
          "description": cat.description || cat.subtitle,
          "url": `https://cooltechnologies.ae/#/products?category=${encodeURIComponent(cat.name)}`
        }))
      }
    };

    schemaScript.textContent = JSON.stringify(jsonLdData);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [categories]);

  // Active categories in clean sequential order
  const activeCategories = useMemo(() => {
    return categories
      .filter((c) => c.status !== "inactive")
      .sort((a, b) => (a.sortOrder ?? 999) - (b.sortOrder ?? 999));
  }, [categories]);

  // Extract unique category tags with their category count
  const categoryTagOptions = useMemo(() => {
    const tagMap = new Map<string, number>();
    activeCategories.forEach((cat) => {
      const tagValue = cat.tag || cat.name;
      if (tagValue) {
        tagMap.set(tagValue, (tagMap.get(tagValue) || 0) + 1);
      }
    });
    return Array.from(tagMap.entries())
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => a.tag.localeCompare(b.tag));
  }, [activeCategories]);

  // Filtered tags for the dropdown search
  const visibleTagOptions = useMemo(() => {
    if (!filterSearch.trim()) return categoryTagOptions;
    const query = filterSearch.toLowerCase().trim();
    return categoryTagOptions.filter((opt) => opt.tag.toLowerCase().includes(query));
  }, [categoryTagOptions, filterSearch]);

  const getProductCountForCat = (cat: Category) => {
    return activeProducts.filter(
      (p) =>
        p.category.toLowerCase() === cat.name.toLowerCase() ||
        (cat.name === "Room Air Conditioners" && p.category.toLowerCase() === "air conditioners") ||
        (cat.tag && (p as any).tags?.some((t: string) => t.toLowerCase() === cat.tag?.toLowerCase()))
    ).length;
  };

  // Filtered categories based on selected tag
  const filteredCategories = useMemo(() => {
    let list = [...activeCategories];

    if (selectedTag !== "All") {
      list = list.filter((cat) => {
        const catTag = (cat.tag || cat.name).toLowerCase();
        return (
          catTag === selectedTag.toLowerCase() ||
          cat.name.toLowerCase() === selectedTag.toLowerCase()
        );
      });
    }

    // Sequential order by sortOrder
    list.sort((a, b) => (a.sortOrder ?? 999) - (b.sortOrder ?? 999));
    return list;
  }, [activeCategories, selectedTag]);

  const handleCategoryClick = (categoryName: string) => {
    if (onSelectCategory) {
      onSelectCategory(categoryName);
    } else {
      window.location.hash = `#/products?category=${encodeURIComponent(categoryName)}`;
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const isFilterActive = selectedTag !== "All";

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans antialiased pb-20">
      
      {/* ─────────────────────────────────────────────────────────────
          1. CLEAN CORPORATE HEADER
      ───────────────────────────────────────────────────────────── */}
      <section className="bg-white border-b border-slate-200 py-8 sm:py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <nav className="flex items-center gap-2 text-xs font-semibold text-slate-500 mb-3" aria-label="Breadcrumb">
            <a href="#/" className="hover:text-[#0f4c81] transition-colors">Home</a>
            <span className="text-slate-300">/</span>
            <span className="text-[#031b4e] font-bold uppercase tracking-wider">Product Categories</span>
          </nav>

          <div>
            <h1 className="text-3xl sm:text-4xl font-black text-[#031b4e] tracking-tight uppercase font-sans">
              Shop by Category
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 font-medium mt-2 max-w-2xl leading-relaxed">
              Browse our comprehensive commercial and residential HVAC categories. Explore certified room air conditioners, heavy-duty air coolers, chillers, compressors, heat exchangers, and precision controls engineered for Middle Eastern climatic conditions.
            </p>
          </div>

        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          2. MAIN CONTENT AREA (TWO BUTTONS CONTROLS + CATEGORIES GRID)
      ───────────────────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        
        {/* Controls Bar: Button 1 [All Categories] and Button 2 [Filter] */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-8 pb-4 border-b border-slate-200">
          <div className="flex flex-wrap items-center gap-2.5">
            
            {/* Button 1: ALL */}
            <button
              type="button"
              onClick={() => {
                setSelectedTag("All");
                setIsFilterOpen(false);
              }}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer flex items-center gap-2 shadow-2xs ${
                selectedTag === "All"
                  ? "bg-[#031b4e] text-white ring-2 ring-[#031b4e]/20"
                  : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-100 hover:text-slate-900"
              }`}
            >
              <Layers size={14} />
              <span>All Categories</span>
              <span
                className={`px-1.5 py-0.5 rounded-md text-[10px] font-extrabold ${
                  selectedTag === "All"
                    ? "bg-white/20 text-white"
                    : "bg-slate-100 text-slate-600"
                }`}
              >
                {activeCategories.length}
              </span>
            </button>

            {/* Button 2: FILTER OPTION */}
            <div className="relative" ref={filterDropdownRef}>
              <button
                type="button"
                onClick={() => setIsFilterOpen((prev) => !prev)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer flex items-center gap-2 shadow-2xs border ${
                  isFilterActive
                    ? "bg-[#0f4c81] text-white border-[#0f4c81] ring-2 ring-[#0f4c81]/25"
                    : "bg-white text-slate-700 border-slate-200 hover:bg-slate-100 hover:text-slate-900"
                }`}
                aria-expanded={isFilterOpen}
                aria-haspopup="true"
              >
                <SlidersHorizontal size={14} />
                <span>Filter</span>
                {isFilterActive && (
                  <span className="w-2 h-2 rounded-full bg-cyan-300 animate-pulse" />
                )}
                <ChevronDown
                  size={14}
                  className={`transition-transform duration-200 ${isFilterOpen ? "rotate-180" : ""}`}
                />
              </button>

              {/* Mobile Backdrop Overlay */}
              {isFilterOpen && (
                <div
                  className="fixed inset-0 bg-slate-950/40 backdrop-blur-2xs z-40 sm:hidden animate-in fade-in duration-150"
                  onClick={() => setIsFilterOpen(false)}
                />
              )}

              {/* Dropdown Popover (Centered modal on mobile, anchored popover on desktop) */}
              {isFilterOpen && (
                <div className="fixed inset-x-3.5 top-1/2 -translate-y-1/2 max-h-[85vh] sm:translate-y-0 sm:inset-auto sm:absolute sm:left-0 sm:top-full sm:mt-2 sm:w-84 sm:max-w-sm w-auto bg-white rounded-2xl border border-slate-200 shadow-2xl p-4 z-50 animate-in fade-in zoom-in-95 duration-150 flex flex-col">
                  
                  {/* Dropdown Header */}
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3 shrink-0">
                    <div className="flex items-center gap-1.5 text-xs font-black text-slate-900 uppercase tracking-wide">
                      <SlidersHorizontal size={13} className="text-[#0f4c81]" />
                      <span>Filter Categories</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {isFilterActive && (
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedTag("All");
                            setFilterSearch("");
                          }}
                          className="text-[11px] font-bold text-red-600 hover:text-red-700 cursor-pointer flex items-center gap-1"
                        >
                          <X size={11} />
                          <span>Reset</span>
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => setIsFilterOpen(false)}
                        className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer transition-colors"
                        aria-label="Close filter"
                      >
                        <X size={15} />
                      </button>
                    </div>
                  </div>

                  {/* Category Tag Selection Section */}
                  <div className="flex-1 flex flex-col min-h-0">
                    <div className="flex items-center justify-between mb-2 shrink-0">
                      <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                        <Tag size={12} className="text-slate-400" />
                        <span>Filter by Category</span>
                      </label>
                      {selectedTag !== "All" && (
                        <span className="text-[10px] font-bold text-sky-700 bg-sky-50 px-1.5 py-0.5 rounded">
                          1 active
                        </span>
                      )}
                    </div>

                    {/* Search inside category tags */}
                    <div className="relative mb-2 shrink-0">
                      <input
                        type="text"
                        placeholder="Search category tag..."
                        value={filterSearch}
                        onChange={(e) => setFilterSearch(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-7 pr-7 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#0f4c81] focus:bg-white transition-colors"
                      />
                      <Search size={12} className="absolute left-2.5 top-3 text-slate-400" />
                      {filterSearch && (
                        <button
                          type="button"
                          onClick={() => setFilterSearch("")}
                          className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
                        >
                          <X size={12} />
                        </button>
                      )}
                    </div>

                    {/* Scrollable list of categories */}
                    <div className="flex-1 max-h-64 sm:max-h-56 overflow-y-auto space-y-1 pr-1 scrollbar-thin">
                      {/* All option inside dropdown */}
                      <button
                        type="button"
                        onClick={() => setSelectedTag("All")}
                        className={`w-full px-3 py-2.5 rounded-lg text-xs font-bold text-left transition-all cursor-pointer flex items-center justify-between ${
                          selectedTag === "All"
                            ? "bg-blue-50 text-[#0f4c81] border border-blue-200"
                            : "hover:bg-slate-50 text-slate-700"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-slate-400" />
                          <span>All Categories</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] text-slate-400 font-bold">{activeCategories.length}</span>
                          {selectedTag === "All" && <Check size={13} className="text-[#0f4c81]" />}
                        </div>
                      </button>

                      {/* Tag items */}
                      {visibleTagOptions.map(({ tag, count }) => {
                        const isSelected = selectedTag.toLowerCase() === tag.toLowerCase();
                        const tagTheme = getCategoryColorTheme(tag);

                        return (
                          <button
                            key={tag}
                            type="button"
                            onClick={() => setSelectedTag(tag)}
                            className={`w-full px-3 py-2.5 rounded-lg text-xs font-bold text-left transition-all cursor-pointer flex items-center justify-between ${
                              isSelected
                                ? "bg-blue-50 text-[#0f4c81] border border-blue-200"
                                : "hover:bg-slate-50 text-slate-700"
                            }`}
                          >
                            <div className="flex items-center gap-2 min-w-0 pr-2">
                              <span className={`w-2 h-2 rounded-full shrink-0 ${tagTheme.dot}`} />
                              <span className="truncate">{tag}</span>
                            </div>
                            <div className="flex items-center gap-1.5 shrink-0">
                              <span className="text-[10px] text-slate-400 font-bold">{count}</span>
                              {isSelected && <Check size={13} className="text-[#0f4c81]" />}
                            </div>
                          </button>
                        );
                      })}

                      {visibleTagOptions.length === 0 && (
                        <div className="text-center py-6 text-xs text-slate-400">
                          No category tags found
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Dropdown Footer */}
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between shrink-0">
                    <span className="text-[11px] text-slate-500 font-medium">
                      {filteredCategories.length} categories shown
                    </span>
                    <button
                      type="button"
                      onClick={() => setIsFilterOpen(false)}
                      className="px-3.5 py-1.5 bg-[#031b4e] hover:bg-[#0f4c81] text-white text-xs font-bold rounded-lg transition-colors cursor-pointer"
                    >
                      Apply & Close
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Active Category Filter Tag Chip */}
            {selectedTag !== "All" && (
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-sky-50 border border-sky-200 text-sky-900">
                <span className="text-slate-500 font-medium">Category:</span>
                <span className="truncate max-w-[140px] sm:max-w-[200px]">{selectedTag}</span>
                <button
                  type="button"
                  onClick={() => setSelectedTag("All")}
                  className="text-sky-700 hover:text-sky-950 p-0.5 rounded-full hover:bg-sky-100 ml-0.5 cursor-pointer"
                  title="Clear category filter"
                >
                  <X size={12} />
                </button>
              </div>
            )}
          </div>

          {/* Right: Showing Counter */}
          <div className="text-xs text-slate-500 font-medium">
            Showing <span className="font-bold text-slate-800">{filteredCategories.length}</span> of{" "}
            <span className="font-bold text-slate-800">{activeCategories.length}</span> categories
          </div>
        </div>

        {/* Categories Grid */}
        {filteredCategories.length === 0 ? (
          <div className="bg-white border border-dashed border-slate-300 rounded-2xl p-12 text-center max-w-lg mx-auto">
            <h3 className="text-base font-bold text-slate-800">No categories match your selection</h3>
            <p className="text-xs text-slate-500 mt-1">
              Click below to view all available equipment categories.
            </p>
            <button
              onClick={() => setSelectedTag("All")}
              className="mt-4 px-4 py-2 bg-[#0f4c81] text-white rounded-lg text-xs font-bold hover:bg-[#031b4e] transition-colors cursor-pointer"
            >
              Show All Categories
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCategories.map((cat) => {
              const assignedCount = activeProducts.filter(
                (p) =>
                  p.category.toLowerCase() === cat.name.toLowerCase() ||
                  (cat.name === "Room Air Conditioners" && p.category.toLowerCase() === "air conditioners") ||
                  (cat.tag && (p as any).tags?.some((t: string) => t.toLowerCase() === cat.tag?.toLowerCase()))
              ).length;

              const categoryTag = cat.tag || cat.name;
              const colorTheme = getCategoryColorTheme(categoryTag);
              const isExpanded = !!expandedCards[cat.id];
              const hasExtraDetails = Boolean(cat.description && cat.subtitle && cat.description !== cat.subtitle);

              return (
                <div
                  key={cat.id}
                  onClick={() => handleCategoryClick(cat.name)}
                  className="flex items-stretch bg-white border border-slate-200 hover:border-[#2596be] rounded-2xl overflow-hidden cursor-pointer shadow-xs hover:shadow-lg transition-all duration-300 group relative"
                  id={`category-card-${cat.id}`}
                >
                  {/* Left Content Column */}
                  <div className="flex-1 p-5 sm:p-6 flex flex-col justify-between">
                    <div>
                      {/* Clean Dedicated Category Tag Pill with Dynamic Color and Horizontal Scroll on Overflow */}
                      <div className="flex items-center gap-2 mb-2.5 flex-wrap">
                        <ScrollingTagBadge
                          tag={categoryTag}
                          theme={colorTheme}
                          icon={<Tag size={10} className={`shrink-0 ${colorTheme.icon}`} />}
                          maxWidthClass="max-w-[190px] sm:max-w-[220px]"
                        />

                        {assignedCount > 0 && (
                          <span className="text-[10px] font-bold text-slate-400">
                            • {assignedCount} {assignedCount === 1 ? "Product" : "Products"}
                          </span>
                        )}
                      </div>

                      {/* Category Name */}
                      <h3 className="font-display font-extrabold text-base sm:text-lg text-slate-900 group-hover:text-[#0f4c81] transition-colors leading-tight">
                        {cat.name}
                      </h3>

                      {/* Subtitle / Key Sub-items with expansion */}
                      <p className={`text-xs font-medium text-slate-500 mt-1.5 leading-relaxed transition-all duration-300 ${
                        isExpanded ? "line-clamp-none" : "line-clamp-2"
                      }`}>
                        {cat.subtitle || cat.description}
                      </p>

                      {/* Description snippet if available */}
                      {hasExtraDetails && isExpanded && (
                        <p className="text-[11px] text-slate-500 mt-2 leading-relaxed bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                          {cat.description}
                        </p>
                      )}

                      {/* Read more / Read less toggle option */}
                      <button
                        type="button"
                        onClick={(e) => toggleCardExpand(e, cat.id)}
                        className="mt-2.5 inline-flex items-center gap-1 text-[11px] font-bold text-[#0f4c81] hover:text-[#2596be] transition-colors cursor-pointer group/expand"
                        aria-expanded={isExpanded}
                      >
                        <span>{isExpanded ? "Read less" : "Read more"}</span>
                        {isExpanded ? (
                          <ChevronUp size={12} className="transition-transform group-hover/expand:-translate-y-0.5" />
                        ) : (
                          <ChevronDown size={12} className="transition-transform group-hover/expand:translate-y-0.5" />
                        )}
                      </button>
                    </div>

                    {/* Bottom Action Button */}
                    <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-xs font-extrabold text-[#0f4c81] group-hover:text-cyan-600 transition-colors flex items-center gap-1">
                        <span>Explore Equipment</span>
                      </span>
                      
                      <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-slate-50 border border-gray-200 text-[#0f4c81] group-hover:bg-[#0f4c81] group-hover:text-white group-hover:border-transparent transition-all duration-300">
                        <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
                      </div>
                    </div>
                  </div>

                  {/* Right Content Thumbnail Image */}
                  <div className="w-32 sm:w-36 bg-slate-50/60 p-3 flex items-center justify-center shrink-0 border-l border-slate-100 relative overflow-hidden">
                    <div className="absolute inset-0 bg-white/10 group-hover:bg-transparent transition-colors z-10"></div>
                    <img
                      src={cat.image || "/src/assets/images/hvac_air_conditioner_1784350824930.jpg"}
                      alt={cat.name}
                      className="w-full h-auto object-contain max-h-[110px] group-hover:scale-110 transition-transform duration-500 z-0"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

    </div>
  );
}
