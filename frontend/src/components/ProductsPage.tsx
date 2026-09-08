import React, { useState, useEffect, useMemo } from "react";
import { 
  Search, ChevronRight, Filter, Eye, ClipboardList, X, Check, SlidersHorizontal, ArrowUpDown, Heart, ArrowLeft, Layers
} from "lucide-react";
import { Product, Category } from "../types";
import { PRODUCTS } from "../data";
import { getLocalCategories, getCategories } from "../services/categoryService";
import { useWishlist } from "../context/WishlistContext";
import { ProductCard } from "./ProductCard";

interface ProductsPageProps {
  products?: Product[];
  onAddToCart: (product: Product, quantity: number) => void;
  onOpenProductDetail: (product: Product) => void;
  onOpenQuoteWithProduct: (productName: string) => void;
  b2bDiscountRate: number;
}

export default function ProductsPage({
  products,
  onAddToCart,
  onOpenProductDetail,
  onOpenQuoteWithProduct,
  b2bDiscountRate
}: ProductsPageProps) {
  const { isInWishlist, toggleWishlist } = useWishlist();
  const activeProducts = products || PRODUCTS;

  const getInitialCategoryFromHash = () => {
    try {
      const hash = window.location.hash || "";
      if (hash.includes("category=")) {
        const match = hash.match(/category=([^&]+)/);
        if (match && match[1]) {
          return decodeURIComponent(match[1]);
        }
      }
    } catch {}
    return "All";
  };

  // Dynamic Categories State
  const [categories, setCategories] = useState<Category[]>(getLocalCategories);

  // Page search & filters state
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>(getInitialCategoryFromHash);
  const [activeMainGroup, setActiveMainGroup] = useState<string | null>(null);
  const [selectedBrand, setSelectedBrand] = useState<string>("All");
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState<boolean>(false);

  useEffect(() => {
    const loadCats = async () => {
      const list = await getCategories();
      setCategories(list);
    };
    loadCats();
    const handleCatUpdate = (e: any) => {
      if (e.detail) {
        setCategories(e.detail);
      } else {
        setCategories(getLocalCategories());
      }
    };
    window.addEventListener("cooltech_categories_updated", handleCatUpdate);
    return () => window.removeEventListener("cooltech_categories_updated", handleCatUpdate);
  }, []);

  useEffect(() => {
    const handleHash = () => {
      const cat = getInitialCategoryFromHash();
      if (cat !== "All") {
        setSelectedCategory(cat);
      }
    };
    handleHash();
    window.addEventListener("hashchange", handleHash);
    return () => window.removeEventListener("hashchange", handleHash);
  }, []);

  const activeCategories = categories.filter((c) => c.status !== "inactive");

  // Group active categories by their main category tag
  const categoryGroups = useMemo(() => {
    const groupsMap = new Map<string, Category[]>();
    activeCategories.forEach((cat) => {
      const mainTag = (cat.tag && cat.tag.trim()) ? cat.tag.trim() : cat.name.trim();
      if (!groupsMap.has(mainTag)) {
        groupsMap.set(mainTag, []);
      }
      groupsMap.get(mainTag)!.push(cat);
    });
    return Array.from(groupsMap.entries()).map(([mainTag, subCategories]) => ({
      mainTag,
      subCategories: subCategories.sort((a, b) => (a.sortOrder ?? 999) - (b.sortOrder ?? 999)),
    }));
  }, [activeCategories]);

  // Auto-sync activeMainGroup when selectedCategory changes
  useEffect(() => {
    if (selectedCategory === "All") {
      setActiveMainGroup(null);
    } else {
      const group = categoryGroups.find(
        (g) =>
          g.mainTag.toLowerCase() === selectedCategory.toLowerCase() ||
          g.subCategories.some((s) => s.name.toLowerCase() === selectedCategory.toLowerCase())
      );
      if (group) {
        setActiveMainGroup(group.mainTag);
      }
    }
  }, [selectedCategory, categoryGroups]);

  // Subcategories of currently active main group
  const currentGroupSubCategories = useMemo(() => {
    if (!activeMainGroup) return [];
    const group = categoryGroups.find((g) => g.mainTag.toLowerCase() === activeMainGroup.toLowerCase());
    return group ? group.subCategories : [];
  }, [activeMainGroup, categoryGroups]);

  // Matching logic supporting both Main Category Groups and Specific Subcategories
  const doesProductMatchCategory = (product: Product, categoryOrTag: string) => {
    if (categoryOrTag === "All") return true;

    const target = categoryOrTag.toLowerCase().trim();
    const prodCat = (product.category || "").toLowerCase().trim();

    // 1. Direct match with product.category
    if (prodCat === target) return true;

    // 2. Cross-compatibility for room air conditioners
    if (
      (target === "room air conditioners" || target === "room a/c") &&
      (prodCat === "air conditioners" || prodCat === "room air conditioners")
    ) {
      return true;
    }

    // 3. Match against category groups (if target is a Main Group)
    const group = categoryGroups.find(
      (g) => g.mainTag.toLowerCase().trim() === target
    );
    if (group) {
      const inSub = group.subCategories.some(
        (sub) => sub.name.toLowerCase().trim() === prodCat
      );
      if (inSub) return true;

      if (
        (product as any).tags?.some((t: string) => t.toLowerCase().trim() === target)
      ) {
        return true;
      }
    }

    // 4. Product tags match
    if (
      (product as any).tags?.some((t: string) => t.toLowerCase().trim() === target)
    ) {
      return true;
    }

    return false;
  };

  // Retrieve unique brands from product catalog
  const availableBrands = ["All", ...Array.from(new Set(activeProducts.map(p => p.brand)))];

  // Active Filter Count for Mobile Badge
  const activeFilterCount = (selectedCategory !== "All" ? 1 : 0) + (selectedBrand !== "All" ? 1 : 0) + (searchTerm.trim() ? 1 : 0);

  // Technical SEO & GEO/AEO UAE head injection on mount/update
  useEffect(() => {
    document.title = "HVAC Sourcing Catalog Dubai | Industrial Chillers & VRF UAE - Cool Technologies";
    
    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement("meta");
      metaDesc.setAttribute("name", "description");
      document.head.appendChild(metaDesc);
    }
    metaDesc.setAttribute(
      "content", 
      "Direct B2B HVAC sourcing in the UAE. Explore our certified commercial cooling towers, VRF systems, scroll compressors, and copper fittings. Direct factory wholesale prices with fast LTL freight delivery in Dubai and Abu Dhabi."
    );

    let schemaScript = document.getElementById("seo-jsonld-products");
    if (!schemaScript) {
      schemaScript = document.createElement("script");
      schemaScript.id = "seo-jsonld-products";
      schemaScript.setAttribute("type", "application/ld+json");
      document.head.appendChild(schemaScript);
    }

    const jsonLdData = {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "CollectionPage",
          "@id": `${window.location.origin}/#/products`,
          "url": `${window.location.origin}/#/products`,
          "name": "Industrial HVAC Sourcing Directory Dubai - Cool Technologies",
          "description": "Authorized wholesale distributor directory of premium HVAC systems, chilled water units, condenser coils, and digital BMS controls in the United Arab Emirates."
        }
      ]
    };

    schemaScript.innerHTML = JSON.stringify(jsonLdData, null, 2);
    window.scrollTo({ top: 0 });

    return () => {
      document.title = "Cool Technologies | Direct Wholesale HVAC & Commercial Cooling UAE";
      if (schemaScript) schemaScript.remove();
    };
  }, []);

  // Filter products based on state
  const filteredProducts = activeProducts.filter((product) => {
    const matchesSearch = 
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory = doesProductMatchCategory(product, selectedCategory);

    const matchesBrand = selectedBrand === "All" || product.brand === selectedBrand;

    return matchesSearch && matchesCategory && matchesBrand;
  });

  const clearAllFilters = () => {
    setSearchTerm("");
    setSelectedCategory("All");
    setSelectedBrand("All");
    setActiveMainGroup(null);
  };

  return (
    <div className="w-full bg-slate-50 py-4 sm:py-8 lg:py-12" id="products-page-container">
      <div className="max-w-7xl mx-auto px-3 sm:px-4">
        
        {/* Dynamic Breadcrumbs */}
        <nav className="flex items-center gap-1.5 text-xs text-slate-400 font-semibold mb-4 sm:mb-6">
          <a href="#/" className="hover:text-blue-700 transition-colors">Home</a>
          <ChevronRight size={12} />
          <span className="text-slate-800 font-extrabold truncate">HVAC Sourcing Catalog</span>
        </nav>

        {/* Clean Title */}
        <div className="text-left mb-4 sm:mb-8 border-b border-slate-200 pb-3 sm:pb-5">
          <h1 className="font-sans font-black text-xl sm:text-3xl text-[#031b4e] uppercase tracking-tight">
            HVAC & Sourcing Catalog
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
            Browse our commercial inventory. Add systems to your procurement list to receive custom project quotes.
          </p>
        </div>

        {/* MOBILE TOP CONTROLS BAR (< lg) */}
        <div className="block lg:hidden mb-4 space-y-3">
          
          {/* Mobile Search & Filter Button Row */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Search models, specs, brands..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-white border border-slate-200 focus:border-blue-700 rounded-xl pl-9 pr-3 py-2.5 text-xs text-slate-800 font-bold focus:outline-none shadow-xs"
              />
              <Search size={15} className="absolute left-3 top-3 text-slate-400" />
              {searchTerm && (
                <button 
                  onClick={() => setSearchTerm("")}
                  className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            <button
              onClick={() => setIsMobileFilterOpen(true)}
              className={`px-3.5 py-2.5 rounded-xl text-xs font-black flex items-center gap-2 border shadow-xs transition-all cursor-pointer shrink-0 ${
                activeFilterCount > 0
                  ? "bg-[#031b4e] text-white border-[#031b4e]"
                  : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
              }`}
            >
              <Filter size={15} />
              <span>Filters</span>
              {activeFilterCount > 0 && (
                <span className="w-5 h-5 rounded-full bg-cyan-400 text-slate-950 font-black text-[10px] flex items-center justify-center">
                  {activeFilterCount}
                </span>
              )}
            </button>
          </div>

          {/* Horizontal Scrollable Category Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {activeMainGroup ? (
              <>
                <button
                  type="button"
                  onClick={() => {
                    setActiveMainGroup(null);
                    setSelectedCategory("All");
                  }}
                  className="px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all shrink-0 cursor-pointer bg-slate-100 text-slate-700 hover:bg-slate-200 flex items-center gap-1"
                >
                  <ArrowLeft size={12} />
                  <span>All Categories</span>
                </button>
                {currentGroupSubCategories.map((sub) => {
                  const isSelected = selectedCategory.toLowerCase() === sub.name.toLowerCase();
                  return (
                    <button
                      key={sub.id}
                      type="button"
                      onClick={() => setSelectedCategory(sub.name)}
                      className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all shrink-0 cursor-pointer ${
                        isSelected
                          ? "bg-[#2596be] text-white shadow-xs"
                          : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-100"
                      }`}
                    >
                      {sub.name}
                    </button>
                  );
                })}
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedCategory("All");
                    setActiveMainGroup(null);
                  }}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all shrink-0 cursor-pointer ${
                    selectedCategory === "All"
                      ? "bg-[#2596be] text-white shadow-xs"
                      : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-100"
                  }`}
                >
                  All
                </button>
                {categoryGroups.map(({ mainTag }) => {
                  const isSelected = selectedCategory === mainTag;
                  return (
                    <button
                      key={mainTag}
                      type="button"
                      onClick={() => {
                        setActiveMainGroup(mainTag);
                        setSelectedCategory(mainTag);
                      }}
                      className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all shrink-0 cursor-pointer ${
                        isSelected
                          ? "bg-[#031b4e] text-white shadow-xs"
                          : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-100"
                      }`}
                    >
                      {mainTag}
                    </button>
                  );
                })}
              </>
            )}
          </div>

        </div>

        {/* Main Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
          
          {/* Side Column: Desktop Advanced Filters (Hidden on Mobile) */}
          <aside className="hidden lg:block lg:col-span-3 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm sticky top-36 z-20 self-start max-h-[calc(100vh-160px)] overflow-y-auto scrollbar-thin">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-5">
              <div className="flex items-center gap-2">
                <Filter size={16} className="text-blue-700" />
                <h3 className="font-display font-extrabold text-xs text-slate-800 uppercase tracking-wider">
                  Sourcing Filters
                </h3>
              </div>
              <button 
                onClick={clearAllFilters}
                className="text-[10px] text-blue-700 font-extrabold hover:underline uppercase cursor-pointer"
              >
                Clear All
              </button>
            </div>

            <div className="space-y-6">
              {/* Search input field (Clean, no redundant label) */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search model, spec, brand..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 focus:border-blue-700 focus:bg-white rounded-lg pl-3 pr-9 py-2.5 text-xs text-slate-800 font-bold focus:outline-none focus:ring-1 focus:ring-blue-700 transition-all placeholder:text-slate-400"
                />
                <Search size={14} className="absolute right-3 top-3 text-slate-400" />
              </div>

              {/* Categories Selector: Clean Path & Subcategory List */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-[11px] uppercase tracking-wider text-slate-400 font-extrabold">
                    Category
                  </label>
                  {selectedCategory !== "All" && (
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedCategory("All");
                        setActiveMainGroup(null);
                      }}
                      className="text-[10px] text-blue-700 font-bold hover:underline cursor-pointer"
                    >
                      Reset
                    </button>
                  )}
                </div>

                {/* Level 2: Subcategories (Only Path & Back, Clean List) */}
                {activeMainGroup ? (
                  <div className="space-y-2 animate-in fade-in duration-150">
                    {/* Path & Back Option */}
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 mb-1">
                      <button
                        type="button"
                        onClick={() => {
                          setActiveMainGroup(null);
                          setSelectedCategory("All");
                        }}
                        className="inline-flex items-center gap-1 text-[#0f4c81] hover:text-[#031b4e] font-bold cursor-pointer transition-colors"
                      >
                        <ArrowLeft size={13} />
                        <span>All Categories</span>
                      </button>
                      <span className="text-slate-300">/</span>
                      <span className="font-extrabold text-slate-900 truncate">{activeMainGroup}</span>
                    </div>

                    {/* Fixed Height Scrollable Subcategories List */}
                    <div className="flex flex-col gap-1 max-h-72 overflow-y-auto pr-1 scrollbar-thin">
                      {currentGroupSubCategories.map((sub) => {
                        const isSelected = selectedCategory.toLowerCase() === sub.name.toLowerCase();
                        return (
                          <button
                            key={sub.id}
                            type="button"
                            onClick={() => setSelectedCategory(sub.name)}
                            className={`w-full text-left px-3 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-between cursor-pointer ${
                              isSelected
                                ? "bg-blue-50 text-blue-900 border-l-4 border-[#2596be]"
                                : "text-slate-600 hover:bg-slate-50"
                            }`}
                          >
                            <span className="truncate">{sub.name}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  /* Level 1: Main Categories List with Fixed Height & Scroll */
                  <div className="flex flex-col gap-1 max-h-72 overflow-y-auto pr-1 scrollbar-thin">
                    {/* Show All Equipment */}
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedCategory("All");
                        setActiveMainGroup(null);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-between cursor-pointer ${
                        selectedCategory === "All"
                          ? "bg-blue-50 text-blue-850 border-l-4 border-[#2596be]"
                          : "text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Layers size={13} className={selectedCategory === "All" ? "text-[#0f4c81]" : "text-slate-400"} />
                        <span>Show All Equipment</span>
                      </div>
                    </button>

                    {/* Main Categories (No dots, no counts, clean list) */}
                    {categoryGroups.map(({ mainTag, subCategories }) => {
                      const isSelected =
                        selectedCategory === mainTag ||
                        subCategories.some((s) => s.name.toLowerCase() === selectedCategory.toLowerCase());

                      return (
                        <button
                          key={mainTag}
                          type="button"
                          onClick={() => {
                            setActiveMainGroup(mainTag);
                            setSelectedCategory(mainTag);
                          }}
                          className={`w-full text-left px-3 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-between cursor-pointer group ${
                            isSelected
                              ? "bg-blue-50 text-blue-850 border-l-4 border-[#2596be]"
                              : "text-slate-700 hover:bg-slate-50"
                          }`}
                        >
                          <span className="truncate pr-2">{mainTag}</span>
                          <ChevronRight
                            size={13}
                            className="text-slate-400 group-hover:translate-x-0.5 transition-transform shrink-0"
                          />
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Brand Filter */}
              <div>
                <label className="block text-[11px] uppercase tracking-wider text-slate-400 font-extrabold mb-2">
                  Select your brand
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {availableBrands.map((brand) => (
                    <button
                      key={brand}
                      onClick={() => setSelectedBrand(brand)}
                      className={`px-2.5 py-1.5 rounded-lg text-xs font-extrabold border transition-all cursor-pointer ${
                        selectedBrand === brand
                          ? "bg-[#031b4e] text-white border-[#031b4e]"
                          : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                      }`}
                    >
                      {brand === "All" ? "All Brands" : brand}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </aside>

          {/* Grid Column: Products Results Grid (9 cols on desktop, 12 cols on mobile) */}
          <div className="lg:col-span-9 space-y-4 sm:space-y-6">
            
            {/* Sourcing count bar */}
            <div className="bg-white border border-slate-200 rounded-xl p-3 sm:p-4 flex flex-wrap items-center justify-between gap-3 shadow-xs">
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-xs text-slate-500 font-bold">
                  Showing <span className="text-slate-800 font-black">{filteredProducts.length}</span> of <span className="text-slate-800 font-black">{activeProducts.length}</span> items
                </p>
                {selectedCategory !== "All" && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-blue-50 text-blue-900 border border-blue-200">
                    <span className="text-slate-400 font-medium">Category:</span>
                    <span>{selectedCategory}</span>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedCategory("All");
                        setActiveMainGroup(null);
                      }}
                      className="text-blue-700 hover:text-blue-950 p-0.5 rounded-full hover:bg-blue-100 cursor-pointer"
                    >
                      <X size={12} />
                    </button>
                  </span>
                )}
                {selectedBrand !== "All" && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-50 text-amber-900 border border-amber-200">
                    <span className="text-slate-400 font-medium">Brand:</span>
                    <span>{selectedBrand}</span>
                    <button
                      type="button"
                      onClick={() => setSelectedBrand("All")}
                      className="text-amber-700 hover:text-amber-950 p-0.5 rounded-full hover:bg-amber-100 cursor-pointer"
                    >
                      <X size={12} />
                    </button>
                  </span>
                )}
              </div>
              {activeFilterCount > 0 && (
                <button
                  onClick={clearAllFilters}
                  className="text-[11px] text-blue-600 font-bold hover:underline cursor-pointer"
                >
                  Clear All
                </button>
              )}
            </div>

            {/* Zero state matches */}
            {filteredProducts.length === 0 && (
              <div className="bg-white border border-slate-200 rounded-2xl p-8 sm:p-12 text-center max-w-lg mx-auto">
                <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mx-auto mb-4">
                  <Search size={28} />
                </div>
                <h4 className="text-sm font-black text-slate-800 mb-1">No Mechanical Equipment Matched</h4>
                <p className="text-xs text-slate-500 leading-relaxed mb-6 font-semibold">
                  We could not find any products conforming to your exact keywords or selected filters.
                </p>
                <button
                  onClick={clearAllFilters}
                  className="bg-[#2596be] hover:bg-[#1c7e9f] text-white font-extrabold text-xs px-5 py-2.5 rounded-lg transition-all cursor-pointer"
                >
                  Reset Filters
                </button>
              </div>
            )}

            {/* FLIPKART/AMAZON STYLE 2-COLUMN MOBILE GRID */}
            <div className="grid grid-cols-2 sm:grid-cols-2 xl:grid-cols-3 gap-2.5 sm:gap-4 lg:gap-6">
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onOpenProductDetail={onOpenProductDetail}
                  onOpenQuoteWithProduct={onOpenQuoteWithProduct}
                  onAddToCart={onAddToCart}
                />
              ))}
            </div>

          </div>

        </div>

      </div>

      {/* MOBILE SLIDE-UP FILTER DRAWER MODAL (< lg) */}
      {isMobileFilterOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white text-slate-900 w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col animate-in slide-in-from-bottom duration-200">
            
            {/* Header */}
            <div className="px-5 py-4 bg-[#031b4e] text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Filter size={18} className="text-cyan-400" />
                <h3 className="font-extrabold text-sm uppercase tracking-wider">Refine Inventory</h3>
              </div>
              <button
                onClick={() => setIsMobileFilterOpen(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center"
              >
                <X size={16} />
              </button>
            </div>

            {/* Scrollable Filter Body */}
            <div className="p-5 space-y-6 overflow-y-auto">
              
              {/* Category: 2-Level Hierarchical Filter with Fixed Height */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-extrabold uppercase text-slate-400 tracking-wider">
                    Category
                  </label>
                  {selectedCategory !== "All" && (
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedCategory("All");
                        setActiveMainGroup(null);
                      }}
                      className="text-[11px] text-blue-700 font-bold hover:underline"
                    >
                      Reset
                    </button>
                  )}
                </div>

                {activeMainGroup ? (
                  <div className="space-y-2 animate-in fade-in duration-150">
                    {/* Path & Back Option */}
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 mb-1">
                      <button
                        type="button"
                        onClick={() => {
                          setActiveMainGroup(null);
                          setSelectedCategory("All");
                        }}
                        className="inline-flex items-center gap-1 text-[#0f4c81] hover:text-[#031b4e] font-bold cursor-pointer transition-colors"
                      >
                        <ArrowLeft size={13} />
                        <span>All Categories</span>
                      </button>
                      <span className="text-slate-300">/</span>
                      <span className="font-extrabold text-slate-900 truncate">{activeMainGroup}</span>
                    </div>

                    {/* Fixed Height Scrollable Subcategories List */}
                    <div className="flex flex-col gap-1.5 max-h-60 overflow-y-auto pr-1 scrollbar-thin">
                      {currentGroupSubCategories.map((sub) => {
                        const isSelected = selectedCategory.toLowerCase() === sub.name.toLowerCase();
                        return (
                          <button
                            key={sub.id}
                            onClick={() => setSelectedCategory(sub.name)}
                            className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-between cursor-pointer ${
                              isSelected
                                ? "bg-blue-50 text-blue-900 border-2 border-[#2596be]"
                                : "bg-slate-50 text-slate-700 hover:bg-slate-100"
                            }`}
                          >
                            <span className="truncate">{sub.name}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  /* Main Categories List with Fixed Height & Scroll */
                  <div className="flex flex-col gap-1.5 max-h-64 overflow-y-auto pr-1 scrollbar-thin">
                    <button
                      onClick={() => {
                        setSelectedCategory("All");
                        setActiveMainGroup(null);
                      }}
                      className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-between cursor-pointer ${
                        selectedCategory === "All"
                          ? "bg-blue-50 text-blue-900 border-2 border-[#2596be]"
                          : "bg-slate-50 text-slate-700 hover:bg-slate-100"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Layers size={13} className={selectedCategory === "All" ? "text-[#0f4c81]" : "text-slate-400"} />
                        <span>Show All Equipment</span>
                      </div>
                    </button>
                    {categoryGroups.map(({ mainTag, subCategories }) => {
                      const isSelected = selectedCategory === mainTag || subCategories.some(s => s.name.toLowerCase() === selectedCategory.toLowerCase());
                      return (
                        <button
                          key={mainTag}
                          onClick={() => {
                            setActiveMainGroup(mainTag);
                            setSelectedCategory(mainTag);
                          }}
                          className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-between cursor-pointer ${
                            isSelected
                              ? "bg-blue-50 text-blue-900 border-2 border-[#2596be]"
                              : "bg-slate-50 text-slate-700 hover:bg-slate-100"
                          }`}
                        >
                          <span className="truncate pr-2">{mainTag}</span>
                          <ChevronRight size={14} className="text-slate-400 shrink-0" />
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Brand Selection */}
              <div>
                <label className="block text-xs font-extrabold uppercase text-slate-400 tracking-wider mb-2">
                  Select your brand
                </label>
                <div className="flex flex-wrap gap-2">
                  {availableBrands.map((brand) => (
                    <button
                      key={brand}
                      onClick={() => setSelectedBrand(brand)}
                      className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                        selectedBrand === brand
                          ? "bg-[#031b4e] text-white border-[#031b4e]"
                          : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                      }`}
                    >
                      {brand === "All" ? "All Brands" : brand}
                    </button>
                  ))}
                </div>
              </div>

            </div>

            {/* Footer Buttons */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center gap-3">
              <button
                onClick={() => {
                  clearAllFilters();
                  setIsMobileFilterOpen(false);
                }}
                className="flex-1 py-3 bg-white border border-slate-200 text-slate-700 text-xs font-bold rounded-xl"
              >
                Reset All
              </button>
              <button
                onClick={() => setIsMobileFilterOpen(false)}
                className="flex-1 py-3 bg-[#031b4e] text-white text-xs font-extrabold rounded-xl shadow-md"
              >
                Apply Filters ({filteredProducts.length})
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
