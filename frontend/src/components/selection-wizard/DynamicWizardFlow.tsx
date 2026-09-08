import React, { useState, useRef, useEffect } from "react";
import {
  ChevronRight, ChevronLeft, ArrowLeft, RotateCcw,
  ExternalLink, Package, Info, AlertTriangle, CheckCircle2,
  Lightbulb, ArrowUpRight, Flag, X, Wrench, ShieldCheck, Check,
  Filter, Sparkles, ChevronDown, ChevronUp, ClipboardList, Eye
} from "lucide-react";
import { Workflow, Product, ServiceItem, WorkflowOption, WorkflowStep } from "../../types";

interface DynamicWizardFlowProps {
  workflow: Workflow;
  products: Product[];
  services?: ServiceItem[];
  onSelectProduct: (productId: string) => void;
  onRequestQuote: (productTitle: string) => void;
  onResetCategory: () => void;
}

export default function DynamicWizardFlow({
  workflow, products, services = [], onSelectProduct, onRequestQuote, onResetCategory
}: DynamicWizardFlowProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [userSelections, setUserSelections] = useState<Record<string, WorkflowOption>>({});
  const [multiSelections, setMultiSelections] = useState<Record<string, string[]>>({});
  const [completed, setCompleted] = useState(false);
  const [selectedBrandFilter, setSelectedBrandFilter] = useState<string>("all");
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>("all");
  const [selectedPriceTier, setSelectedPriceTier] = useState<string>("all");
  const [inStockOnlyFilter, setInStockOnlyFilter] = useState<boolean>(false);
  const [isFilterExpanded, setIsFilterExpanded] = useState<boolean>(false);
  const [isHovered, setIsHovered] = useState<boolean>(false);

  const carouselRef = useRef<HTMLDivElement>(null);

  const steps = workflow.steps;
  const currentStep: WorkflowStep | undefined = steps[currentStepIndex];

  const isProductStep = currentStep?.inputType === "products" || currentStep?.inputType === "filter";

  // Auto-sliding for 3-in-a-row carousel
  useEffect(() => {
    if (!isProductStep || isHovered) return;
    const interval = setInterval(() => {
      if (carouselRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = carouselRef.current;
        if (scrollLeft + clientWidth >= scrollWidth - 10) {
          carouselRef.current.scrollTo({ left: 0, behavior: "smooth" });
        } else {
          carouselRef.current.scrollBy({ left: clientWidth * 0.68, behavior: "smooth" });
        }
      }
    }, 3500);
    return () => clearInterval(interval);
  }, [isProductStep, isHovered, currentStepIndex]);

  const scrollCarousel = (direction: "left" | "right") => {
    if (carouselRef.current) {
      const scrollAmount = carouselRef.current.clientWidth * 0.75;
      carouselRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth"
      });
    }
  };

  /* ── Helper: navigate to next step ── */
  const goToNextStep = (option?: WorkflowOption) => {
    if (option?.nextStepId) {
      const targetIdx = steps.findIndex(s => s.id === option.nextStepId);
      if (targetIdx !== -1) { 
        setCurrentStepIndex(targetIdx); 
        return; 
      }
    }
    if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex(prev => prev + 1);
    }
  };

  const handleSelectOption = (option: WorkflowOption) => {
    setUserSelections(prev => ({ ...prev, [currentStep!.id]: option }));
    goToNextStep(option);
  };

  const handleToggleCheckbox = (optId: string) => {
    if (!currentStep) return;
    const cur = multiSelections[currentStep.id] || [];
    const next = cur.includes(optId) ? cur.filter(x => x !== optId) : [...cur, optId];
    setMultiSelections(prev => ({ ...prev, [currentStep.id]: next }));
  };

  const handleBack = () => {
    if (currentStepIndex > 0) setCurrentStepIndex(prev => prev - 1);
    else onResetCategory();
  };

  const handleRestart = () => { 
    setCurrentStepIndex(0); 
    setUserSelections({}); 
    setMultiSelections({});
    setSelectedBrandFilter("all");
    setSelectedCategoryFilter("all");
    setSelectedPriceTier("all");
    setInStockOnlyFilter(false);
    setIsFilterExpanded(false);
    setCompleted(false); 
  };

  /* Computed products for product & filter nodes */
  const getCuratedProducts = (step: WorkflowStep): Product[] => {
    // 1. Direct products on this step
    const direct = (step.selectedProductIds || []).map(id => products.find(p => p.id === id)).filter(Boolean) as Product[];
    if (direct.length > 0) return direct;

    // 2. If this is a filter node connected from a previous product node, inherit products from parent product step
    const parentProductStep = steps.find(s => 
      s.inputType === "products" && 
      s.options.some(o => o.nextStepId === step.id)
    );
    if (parentProductStep?.selectedProductIds && parentProductStep.selectedProductIds.length > 0) {
      const parentDirect = parentProductStep.selectedProductIds.map(id => products.find(p => p.id === id)).filter(Boolean) as Product[];
      if (parentDirect.length > 0) return parentDirect;
    }

    // 3. Fallback to category matches
    const catMatches = products.filter(p => p.category.toLowerCase().includes(workflow.targetCategory.toLowerCase()));
    if (catMatches.length > 0) return catMatches;
    return products;
  };

  /* Computed services for service nodes */
  const getCuratedServices = (step: WorkflowStep): ServiceItem[] => {
    const direct = (step.selectedServiceIds || []).map(id => (services || []).find(s => s.id === id)).filter(Boolean) as ServiceItem[];
    if (direct.length > 0) return direct;
    return (services || []).slice(0, 3);
  };

  if (!currentStep) {
    return (
      <div className="text-center py-12 text-slate-500 text-sm">
        <p className="font-bold text-slate-900 mb-1">No steps configured</p>
        <p>This workflow has no steps yet. Add nodes in the admin panel.</p>
        <button onClick={onResetCategory} className="mt-4 px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl text-xs font-bold text-slate-800 cursor-pointer">
          ← Back to Categories
        </button>
      </div>
    );
  }

  const isServiceStep = currentStep.inputType === "services";
  const isInfoStep = currentStep.inputType === "info";
  const isRedirectStep = currentStep.inputType === "redirect";
  const isEndStep = currentStep.inputType === "end";
  const isCheckboxStep = currentStep.inputType === "checkboxes";

  // Check if this step has any options with images
  const hasOptionImages = currentStep.options.some(opt => Boolean(opt.image)) || currentStep.displayMode === "image";

  return (
    <div className="space-y-3">

      {/* ── Top Bar ── */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-2.5 gap-2">
        <button 
          onClick={handleBack}
          className="text-[11px] sm:text-xs text-slate-600 hover:text-slate-900 font-bold flex items-center gap-1 sm:gap-1.5 transition-colors cursor-pointer shrink-0"
        >
          <ArrowLeft size={13} className="sm:w-3.5 sm:h-3.5" />
          <span>{currentStepIndex === 0 ? "Categories" : "Back"}</span>
        </button>
        <span className="text-[10px] sm:text-xs font-black text-[#0f4c81] uppercase tracking-wider truncate text-center flex-1 px-1">
          {workflow.name}
        </span>
        <button 
          onClick={handleRestart}
          className="text-[11px] sm:text-xs text-slate-500 hover:text-slate-800 font-bold flex items-center gap-1 cursor-pointer shrink-0"
        >
          <RotateCcw size={12} className="sm:w-3.5 sm:h-3.5" /> <span>Restart</span>
        </button>
      </div>

      {/* ─────────────────────────────────────────
          PRODUCT / FILTER RESULT STEP (3-IN-A-ROW AUTO-SLIDING CAROUSEL)
      ───────────────────────────────────────── */}
      {isProductStep && (
        <div className="space-y-2.5 pt-0.5 animate-in fade-in zoom-in-95 duration-200">
          {(() => {
            // Find connected filter node if current step is a product node connected to a filter terminal node
            const connectedFilterStep = currentStep.inputType === "filter" 
              ? currentStep 
              : steps.find(s => s.inputType === "filter" && (
                  currentStep.options.some(o => o.nextStepId === s.id) ||
                  steps.some(other => other.id === currentStep.id && other.options.some(o => o.nextStepId === s.id))
                ));

            // Effective step containing filter configurations
            const effectiveFilterStep = connectedFilterStep || currentStep;

            const allProductsInStep = getCuratedProducts(currentStep);
            
            // Available brands from this product pool
            const availableBrands = [
              "all",
              ...(effectiveFilterStep.selectedBrands && effectiveFilterStep.selectedBrands.length > 0
                ? effectiveFilterStep.selectedBrands
                : Array.from(new Set(allProductsInStep.map(p => p.brand).filter(Boolean))))
            ];

            // Available categories from this product pool
            const availableCategories = [
              "all",
              ...(effectiveFilterStep.selectedCategories && effectiveFilterStep.selectedCategories.length > 0
                ? effectiveFilterStep.selectedCategories
                : Array.from(new Set(allProductsInStep.map(p => p.category).filter(Boolean))))
            ];

            // Filter logic
            let filteredProducts = [...allProductsInStep];

            if (selectedBrandFilter !== "all") {
              filteredProducts = filteredProducts.filter(p => p.brand.toLowerCase() === selectedBrandFilter.toLowerCase());
            }
            if (selectedCategoryFilter !== "all") {
              filteredProducts = filteredProducts.filter(p => p.category.toLowerCase().includes(selectedCategoryFilter.toLowerCase()));
            }
            if (selectedPriceTier === "under1k") {
              filteredProducts = filteredProducts.filter(p => p.price < 1000);
            } else if (selectedPriceTier === "1k-5k") {
              filteredProducts = filteredProducts.filter(p => p.price >= 1000 && p.price <= 5000);
            } else if (selectedPriceTier === "5k-20k") {
              filteredProducts = filteredProducts.filter(p => p.price > 5000 && p.price <= 20000);
            } else if (selectedPriceTier === "20k+") {
              filteredProducts = filteredProducts.filter(p => p.price > 20000);
            }
            if (effectiveFilterStep.minPrice !== undefined) {
              filteredProducts = filteredProducts.filter(p => p.price >= effectiveFilterStep.minPrice!);
            }
            if (effectiveFilterStep.maxPrice !== undefined) {
              filteredProducts = filteredProducts.filter(p => p.price <= effectiveFilterStep.maxPrice!);
            }
            if (inStockOnlyFilter || effectiveFilterStep.inStockOnly) {
              filteredProducts = filteredProducts.filter(p => p.inStock);
            }

            const primaryFilter = effectiveFilterStep.primaryFilter || effectiveFilterStep.filterType || "brand";
            
            // Check if enabledFilters was explicitly provided on this step.
            // If provided, use it strictly. If undefined/empty, it only has the primaryFilter (no secondary filters enabled).
            const enabledFilters = (effectiveFilterStep.enabledFilters && effectiveFilterStep.enabledFilters.length > 0)
              ? effectiveFilterStep.enabledFilters
              : [primaryFilter];

            // Check if any secondary filter options exist that the customer can open in the top drawer
            const hasSecondaryFilters = 
              (enabledFilters.includes("brand") && primaryFilter !== "brand") ||
              enabledFilters.includes("price") ||
              enabledFilters.includes("category") ||
              enabledFilters.includes("stock");

            const isSecondaryActive = 
              (primaryFilter !== "brand" && selectedBrandFilter !== "all") ||
              (primaryFilter !== "price" && selectedPriceTier !== "all") ||
              (primaryFilter !== "category" && selectedCategoryFilter !== "all") ||
              (primaryFilter !== "stock" && inStockOnlyFilter);

            const activeFiltersCount = 
              (selectedBrandFilter !== "all" ? 1 : 0) +
              (selectedPriceTier !== "all" ? 1 : 0) +
              (selectedCategoryFilter !== "all" ? 1 : 0) +
              (inStockOnlyFilter ? 1 : 0);

            return allProductsInStep.length === 0 ? (
              <div className="bg-slate-50 rounded-xl border border-slate-200 p-6 text-center">
                <Package size={26} className="text-slate-400 mx-auto mb-2" />
                <p className="text-xs font-bold text-slate-800">No products configured for this node</p>
              </div>
            ) : (
              <div className="space-y-2.5">
                
                {/* ── Top Header: System Count + Filter Button with Overlay + Navigation Controls ── */}
                <div className="flex items-center justify-between px-1 gap-2">
                  <div className="flex items-center gap-1.5 text-[11px] sm:text-xs text-slate-600 font-bold min-w-0">
                    <Sparkles size={13} className="text-[#0f4c81] shrink-0" />
                    <span className="truncate">
                      Showing <strong className="text-slate-900">{filteredProducts.length}</strong> {filteredProducts.length === 1 ? "system" : "systems"}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-1.5 shrink-0">
                    {/* Clear Filters button */}
                    {activeFiltersCount > 0 && (
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedBrandFilter("all");
                          setSelectedPriceTier("all");
                          setSelectedCategoryFilter("all");
                          setInStockOnlyFilter(false);
                          if (carouselRef.current) carouselRef.current.scrollTo({ left: 0, behavior: "smooth" });
                        }}
                        className="text-[10px] text-blue-600 hover:text-blue-800 font-bold underline cursor-pointer px-1"
                      >
                        Clear
                      </button>
                    )}

                    {/* Filter Button with Relative Floating Popover Overlay (Only shown if secondary filters exist) */}
                    {hasSecondaryFilters && (
                      <div className="relative">
                        <button
                          type="button"
                          onClick={() => setIsFilterExpanded(prev => !prev)}
                          className={`px-2.5 sm:px-3 py-1 rounded-lg text-[11px] sm:text-xs font-bold transition-all cursor-pointer border flex items-center gap-1 shadow-2xs ${
                            isFilterExpanded || isSecondaryActive
                              ? "bg-[#031b4e] text-white border-[#031b4e]"
                              : "bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-300"
                          }`}
                        >
                          <Filter size={11} />
                          <span>Filter</span>
                          {isFilterExpanded ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
                        </button>

                        {/* ── FLOATING OVERLAY DROPDOWN (Zero height changes on main box) ── */}
                        {isFilterExpanded && (
                          <>
                            {/* Dismiss backdrop */}
                            <div 
                              className="fixed inset-0 z-40 bg-transparent"
                              onClick={() => setIsFilterExpanded(false)}
                            />

                            {/* Floating Drawer Overlay */}
                            <div className="absolute right-0 top-full mt-1.5 z-50 w-72 sm:w-80 max-w-[calc(100vw-36px)] bg-white/98 backdrop-blur-md rounded-2xl border border-slate-200 shadow-2xl p-3.5 space-y-3 animate-in fade-in zoom-in-95 duration-150">
                              
                              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                                <span className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                                  <Filter size={12} className="text-[#0f4c81]" /> Filter Options
                                </span>
                                <button
                                  type="button"
                                  onClick={() => setIsFilterExpanded(false)}
                                  className="p-1 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 cursor-pointer"
                                >
                                  <X size={13} />
                                </button>
                              </div>

                              {/* Secondary Brand Filter */}
                              {enabledFilters.includes("brand") && primaryFilter !== "brand" && (
                                <div className="space-y-1">
                                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-600 block">Brand:</span>
                                  <div className="flex flex-wrap gap-1 max-h-28 overflow-y-auto">
                                    {availableBrands.map(brand => {
                                      const isSelected = selectedBrandFilter.toLowerCase() === brand.toLowerCase();
                                      return (
                                        <button
                                          key={brand}
                                          type="button"
                                          onClick={() => {
                                            setSelectedBrandFilter(brand);
                                            if (carouselRef.current) carouselRef.current.scrollTo({ left: 0, behavior: "smooth" });
                                          }}
                                          className={`px-2 py-0.5 rounded-md text-[10px] font-bold border transition-all cursor-pointer ${
                                            isSelected ? "bg-indigo-600 text-white border-indigo-600" : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                                          }`}
                                        >
                                          {brand === "all" ? "All Brands" : brand}
                                        </button>
                                      );
                                    })}
                                  </div>
                                </div>
                              )}

                              {/* Secondary Price Range Filter */}
                              {enabledFilters.includes("price") && (
                                <div className="space-y-1">
                                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-600 block">Price Range:</span>
                                  <div className="flex flex-wrap gap-1">
                                    {[
                                      { id: "all", label: "All Prices" },
                                      { id: "under1k", label: "< 1k" },
                                      { id: "1k-5k", label: "1k – 5k" },
                                      { id: "5k-20k", label: "5k – 20k" },
                                      { id: "20k+", label: "20k+" },
                                    ].map(tier => {
                                      const isSelected = selectedPriceTier === tier.id;
                                      return (
                                        <button
                                          key={tier.id}
                                          type="button"
                                          onClick={() => {
                                            setSelectedPriceTier(tier.id);
                                            if (carouselRef.current) carouselRef.current.scrollTo({ left: 0, behavior: "smooth" });
                                          }}
                                          className={`px-2 py-0.5 rounded-md text-[10px] font-bold border transition-all cursor-pointer ${
                                            isSelected ? "bg-emerald-600 text-white border-emerald-600" : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                                          }`}
                                        >
                                          {tier.label}
                                        </button>
                                      );
                                    })}
                                  </div>
                                </div>
                              )}

                              {/* Secondary Category Filter */}
                              {enabledFilters.includes("category") && (
                                <div className="space-y-1">
                                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-600 block">Category:</span>
                                  <div className="flex flex-wrap gap-1 max-h-28 overflow-y-auto">
                                    {availableCategories.map(cat => {
                                      const isSelected = selectedCategoryFilter.toLowerCase() === cat.toLowerCase();
                                      return (
                                        <button
                                          key={cat}
                                          type="button"
                                          onClick={() => {
                                            setSelectedCategoryFilter(cat);
                                            if (carouselRef.current) carouselRef.current.scrollTo({ left: 0, behavior: "smooth" });
                                          }}
                                          className={`px-2 py-0.5 rounded-md text-[10px] font-bold border transition-all cursor-pointer ${
                                            isSelected ? "bg-sky-600 text-white border-sky-600" : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                                          }`}
                                        >
                                          {cat === "all" ? "All" : cat}
                                        </button>
                                      );
                                    })}
                                  </div>
                                </div>
                              )}

                              {/* Secondary Stock Filter */}
                              {enabledFilters.includes("stock") && (
                                <div className="pt-1 border-t border-slate-100">
                                  <label className="flex items-center gap-2 cursor-pointer select-none">
                                    <input
                                      type="checkbox"
                                      checked={inStockOnlyFilter}
                                      onChange={e => setInStockOnlyFilter(e.target.checked)}
                                      className="w-3.5 h-3.5 accent-amber-600 cursor-pointer"
                                    />
                                    <span className="text-[11px] font-bold text-slate-800">⚡ In-Stock Units Only</span>
                                  </label>
                                </div>
                              )}

                              <div className="pt-2 border-t border-slate-100 flex justify-end">
                                <button
                                  type="button"
                                  onClick={() => setIsFilterExpanded(false)}
                                  className="px-3 py-1 bg-[#031b4e] hover:bg-[#0f4c81] text-white text-[11px] font-extrabold rounded-lg cursor-pointer"
                                >
                                  Apply Filters
                                </button>
                              </div>

                            </div>
                          </>
                        )}
                      </div>
                    )}

                    {/* Left / Right Carousel Controls */}
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => scrollCarousel("left")}
                        title="Previous products"
                        className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-700 flex items-center justify-center transition-all cursor-pointer shadow-2xs hover:scale-105 active:scale-95"
                      >
                        <ChevronLeft size={13} />
                      </button>
                      <button
                        type="button"
                        onClick={() => scrollCarousel("right")}
                        title="Next products"
                        className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-700 flex items-center justify-center transition-all cursor-pointer shadow-2xs hover:scale-105 active:scale-95"
                      >
                        <ChevronRight size={13} />
                      </button>
                    </div>
                  </div>
                </div>

                {/* ── 3-Product Row Auto-sliding Swipeable Container (Exact Catalog Product Cards) ── */}
                <div
                  ref={carouselRef}
                  onMouseEnter={() => setIsHovered(true)}
                  onMouseLeave={() => setIsHovered(false)}
                  onTouchStart={() => setIsHovered(true)}
                  onTouchEnd={() => setIsHovered(false)}
                  className="flex gap-3 sm:gap-4 overflow-x-auto pb-1 pt-1 px-1 scroll-smooth snap-x snap-mandatory focus:outline-none [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
                  style={{
                    scrollbarWidth: "none",
                    msOverflowStyle: "none"
                  }}
                >
                  {filteredProducts.length === 0 ? (
                    <div className="w-full py-8 text-center bg-slate-50 rounded-2xl border border-slate-200 text-slate-500 text-xs">
                      No equipment matches the active filter criteria. Try resetting the filter.
                    </div>
                  ) : (
                    filteredProducts.map(prod => (
                      <div
                        key={prod.id}
                        className="group rounded-2xl bg-white border border-slate-200 hover:border-[#2596be] shadow-xs hover:shadow-md transition-all flex flex-col justify-between overflow-hidden relative snap-center shrink-0 w-[84vw] max-w-[280px] sm:max-w-none sm:w-[calc(50%-8px)] md:w-[calc(33.333%-11px)] text-left"
                      >
                        <div>
                          {/* Image Container with Stock Status */}
                          <div className="relative bg-white h-36 sm:h-44 p-3 flex items-center justify-center border-b border-slate-100 overflow-hidden">
                            <img
                              src={prod.image}
                              alt={prod.name}
                              className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-300"
                              loading="lazy"
                            />

                            {/* Stock Status Badge */}
                            <div className="absolute top-2 left-2 flex flex-col gap-1 z-10">
                              {prod.inStock ? (
                                <span className="px-1.5 sm:px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[9px] sm:text-[10px] font-extrabold rounded-full flex items-center gap-1 border border-emerald-200">
                                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
                                  <span>In Stock</span>
                                </span>
                              ) : (
                                <span className="px-1.5 sm:px-2 py-0.5 bg-amber-100 text-amber-800 text-[9px] sm:text-[10px] font-extrabold rounded-full flex items-center gap-1 border border-amber-200">
                                  <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse"></span>
                                  <span>Lead Time</span>
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Content Area */}
                          <div className="p-3 sm:p-4">
                            {/* Brand & Category */}
                            <div className="flex items-center justify-between text-[9px] sm:text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-1">
                              <span className="truncate max-w-[90px] sm:max-w-none font-bold text-slate-600">{prod.brand}</span>
                              <span className="text-[#2596be] truncate max-w-[90px] sm:max-w-none font-bold">{prod.category}</span>
                            </div>

                            {/* Product Title */}
                            <h3
                              onClick={() => onSelectProduct(prod.id)}
                              className="font-display font-bold text-xs sm:text-sm text-slate-900 hover:text-[#2596be] cursor-pointer line-clamp-2 min-h-[32px] sm:min-h-[38px] leading-tight sm:leading-snug transition-colors"
                              title={prod.name}
                            >
                              {prod.name}
                            </h3>

                            {/* Price Area */}
                            <div className="mt-2 pt-2 border-t border-slate-100 flex items-baseline justify-between">
                              <div>
                                <span className="text-[10px] text-slate-400 font-bold block">Wholesale Rate</span>
                                {prod.hidePrice ? (
                                  <span className="text-[11px] sm:text-xs font-black text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 uppercase tracking-wider block mt-0.5">
                                    Price on Request
                                  </span>
                                ) : (
                                  <span className="text-xs sm:text-base font-black text-[#031b4e]">
                                    AED {prod.price.toLocaleString()}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Actions Row */}
                        <div className="p-3 sm:p-4 pt-0">
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => onRequestQuote(prod.name)}
                              className="flex-1 bg-[#2596be] hover:bg-[#1c7e9f] text-white py-2 px-2 rounded-xl text-[11px] sm:text-xs font-bold transition-all flex items-center justify-center gap-1 shadow-xs active:scale-95 cursor-pointer"
                            >
                              <ClipboardList size={13} className="shrink-0" />
                              <span className="truncate">Add to Quote</span>
                            </button>
                            <button
                              onClick={() => onSelectProduct(prod.id)}
                              className="p-2 border border-slate-200 hover:border-[#2596be] hover:text-[#2596be] text-slate-600 rounded-xl text-xs font-bold transition-colors shrink-0 cursor-pointer"
                              title="View Specs"
                              aria-label="View spec"
                            >
                              <Eye size={14} />
                            </button>
                          </div>
                        </div>

                      </div>
                    ))
                  )}
                </div>

                {/* ── Compact Primary Quick Filter Chips BELOW the Carousel (Mobile Swipeable) ── */}
                <div className="pt-1.5 border-t border-slate-100 flex items-center gap-1.5 overflow-x-auto flex-nowrap py-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
                  {primaryFilter === "brand" && (
                    availableBrands.map(brand => {
                      const isSelected = selectedBrandFilter.toLowerCase() === brand.toLowerCase();
                      const count = brand === "all"
                        ? allProductsInStep.length
                        : allProductsInStep.filter(p => p.brand.toLowerCase() === brand.toLowerCase()).length;
                      return (
                        <button
                          key={brand}
                          type="button"
                          onClick={() => {
                            setSelectedBrandFilter(brand);
                            if (carouselRef.current) carouselRef.current.scrollTo({ left: 0, behavior: "smooth" });
                          }}
                          className={`px-2.5 py-1 rounded-lg text-[10px] sm:text-[11px] font-bold transition-all cursor-pointer border flex items-center gap-1 shrink-0 ${
                            isSelected
                              ? "bg-[#031b4e] text-white border-[#031b4e] shadow-xs"
                              : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50 hover:border-slate-300"
                          }`}
                        >
                          <span>{brand === "all" ? "All Brands" : brand}</span>
                          <span className={`text-[9px] px-1 py-0.1 rounded-full font-black ${
                            isSelected ? "bg-white/20 text-white" : "bg-slate-100 text-slate-600"
                          }`}>
                            {count}
                          </span>
                        </button>
                      );
                    })
                  )}

                  {primaryFilter === "price" && (
                    [
                      { id: "all", label: "All Prices" },
                      { id: "under1k", label: "< 1k" },
                      { id: "1k-5k", label: "1k - 5k" },
                      { id: "5k-20k", label: "5k - 20k" },
                      { id: "20k+", label: "20k+" },
                    ].map(tier => {
                      const isSelected = selectedPriceTier === tier.id;
                      return (
                        <button
                          key={tier.id}
                          type="button"
                          onClick={() => {
                            setSelectedPriceTier(tier.id);
                            if (carouselRef.current) carouselRef.current.scrollTo({ left: 0, behavior: "smooth" });
                          }}
                          className={`px-2.5 py-1 rounded-lg text-[10px] sm:text-[11px] font-bold transition-all cursor-pointer border shrink-0 ${
                            isSelected
                              ? "bg-emerald-600 text-white border-emerald-600 shadow-xs"
                              : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                          }`}
                        >
                          {tier.label}
                        </button>
                      );
                    })
                  )}

                  {primaryFilter === "category" && (
                    availableCategories.map(cat => {
                      const isSelected = selectedCategoryFilter.toLowerCase() === cat.toLowerCase();
                      return (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => {
                            setSelectedCategoryFilter(cat);
                            if (carouselRef.current) carouselRef.current.scrollTo({ left: 0, behavior: "smooth" });
                          }}
                          className={`px-2.5 py-1 rounded-lg text-[10px] sm:text-[11px] font-bold transition-all cursor-pointer border shrink-0 ${
                            isSelected
                              ? "bg-sky-600 text-white border-sky-600 shadow-xs"
                              : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                          }`}
                        >
                          {cat === "all" ? "All" : cat}
                        </button>
                      );
                    })
                  )}

                  {primaryFilter === "stock" && (
                    <button
                      type="button"
                      onClick={() => setInStockOnlyFilter(!inStockOnlyFilter)}
                      className={`px-2.5 py-1 rounded-lg text-[10px] sm:text-[11px] font-bold transition-all cursor-pointer border flex items-center gap-1.5 shrink-0 ${
                        inStockOnlyFilter
                          ? "bg-amber-600 text-white border-amber-600 shadow-xs"
                          : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                      }`}
                    >
                      <span>⚡ In-Stock Only</span>
                    </button>
                  )}
                </div>

              </div>
            );
          })()}
        </div>
      )}

      {/* ─────────────────────────────────────────
          SERVICE RESULT STEP
      ───────────────────────────────────────── */}
      {isServiceStep && (
        <div className="space-y-5 pt-1 animate-in fade-in zoom-in-95 duration-200">
          <div className="text-center space-y-1">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-800 border border-amber-200 flex items-center justify-center mx-auto">
              <Wrench size={20} />
            </div>
            <h3 className="text-lg font-extrabold text-slate-900">{currentStep.title}</h3>
            {currentStep.subtitle && <p className="text-xs text-slate-500 font-medium">{currentStep.subtitle}</p>}
          </div>

          {(() => {
            const display = getCuratedServices(currentStep);
            return display.length === 0 ? (
              <div className="bg-slate-50 rounded-xl border border-slate-200 p-8 text-center">
                <Wrench size={28} className="text-slate-400 mx-auto mb-2" />
                <p className="text-xs font-bold text-slate-800">No services configured</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                {display.map(serv => (
                  <div key={serv.id} className="bg-white rounded-2xl text-slate-900 overflow-hidden flex flex-col border border-slate-200 shadow-2xs">
                    <img src={serv.image} className="w-full h-32 object-cover bg-slate-100" alt={serv.title} />
                    <div className="p-3.5 flex-1 space-y-1 border-t border-slate-100">
                      <span className="text-[9px] font-black uppercase bg-amber-50 text-amber-800 px-2 py-0.5 rounded border border-amber-200">{serv.category}</span>
                      <h5 className="font-extrabold text-xs text-slate-900 line-clamp-2">{serv.title}</h5>
                    </div>
                    <div className="p-3.5 pt-0">
                      <button onClick={() => onRequestQuote(`Service: ${serv.title}`)}
                        className="w-full py-2 bg-[#0f4c81] hover:bg-[#1c7e9f] text-white font-extrabold text-xs rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-1 shadow-xs">
                        <ShieldCheck size={14} /> Request Service Quote
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            );
          })()}
        </div>
      )}

      {/* ─────────────────────────────────────────
          INFO / CALLOUT STEP
      ───────────────────────────────────────── */}
      {isInfoStep && (
        <div className="space-y-4 pt-1 animate-in fade-in duration-200">
          <h3 className="text-lg font-extrabold text-slate-900 text-center">{currentStep.title}</h3>

          {(() => {
            const styleMap = {
              info:    { bg: "bg-blue-50",    border: "border-blue-200",   text: "text-blue-900",   icon: <Info size={18} className="text-blue-600" /> },
              warning: { bg: "bg-amber-50",   border: "border-amber-200",  text: "text-amber-900",  icon: <AlertTriangle size={18} className="text-amber-600" /> },
              success: { bg: "bg-emerald-50", border: "border-emerald-200",text: "text-emerald-900",icon: <CheckCircle2 size={18} className="text-emerald-600" /> },
              tip:     { bg: "bg-purple-50",  border: "border-purple-200", text: "text-purple-900", icon: <Lightbulb size={18} className="text-purple-600" /> },
            };
            const s = styleMap[currentStep.infoStyle || "info"];
            return (
              <div className={`p-4 rounded-2xl border ${s.bg} ${s.border} flex gap-3 items-start`}>
                <div className="mt-0.5 shrink-0">{s.icon}</div>
                <p className={`text-xs leading-relaxed font-medium ${s.text}`}>
                  {currentStep.infoContent || "Information will appear here."}
                </p>
              </div>
            );
          })()}

          <div className="flex justify-center pt-2">
            <button
              onClick={() => handleSelectOption(currentStep.options[0] || { id: "c", label: "Continue" })}
              className="px-6 py-2.5 bg-[#0f4c81] hover:bg-[#1c7e9f] text-white font-extrabold text-xs rounded-xl flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
            >
              Continue <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────
          REDIRECT STEP
      ───────────────────────────────────────── */}
      {isRedirectStep && (
        <div className="space-y-4 pt-1 animate-in fade-in duration-200 text-center">
          <div className="w-10 h-10 rounded-xl bg-violet-50 text-violet-800 border border-violet-200 flex items-center justify-center mx-auto">
            <ArrowUpRight size={20} />
          </div>
          <h3 className="text-lg font-extrabold text-slate-900">{currentStep.title}</h3>
          {currentStep.subtitle && <p className="text-xs text-slate-500 font-medium">{currentStep.subtitle}</p>}

          {currentStep.redirectUrl ? (
            <a
              href={currentStep.redirectUrl}
              target={currentStep.redirectNewTab !== false ? "_blank" : "_self"}
              rel="noopener noreferrer"
              onClick={() => {
                const opt = currentStep.options[0];
                if (opt?.nextStepId) setTimeout(() => handleSelectOption(opt), 400);
              }}
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-violet-600 hover:bg-violet-700 text-white font-extrabold text-xs rounded-xl transition-all cursor-pointer shadow-xs"
            >
              {currentStep.redirectLabel || "Open Link"} <ExternalLink size={14} />
            </a>
          ) : (
            <p className="text-slate-400 text-xs italic">No URL configured</p>
          )}

          {currentStep.options[0]?.nextStepId && (
            <button onClick={() => handleSelectOption(currentStep.options[0])}
              className="text-xs text-slate-500 hover:text-slate-800 font-semibold flex items-center gap-1 mx-auto cursor-pointer">
              Continue without visiting link <ChevronRight size={12} />
            </button>
          )}
        </div>
      )}

      {/* ─────────────────────────────────────────
          END / COMPLETION STEP
      ───────────────────────────────────────── */}
      {isEndStep && (
        <div className="space-y-4 pt-1 animate-in fade-in zoom-in-95 duration-200 text-center">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center justify-center mx-auto">
            <Flag size={22} />
          </div>
          <h3 className="text-xl font-extrabold text-slate-900">{currentStep.title}</h3>
          <p className="text-xs text-slate-600 leading-relaxed max-w-sm mx-auto font-medium">
            {currentStep.endMessage || "Thank you for completing the selection wizard! Our engineering team will review your specifications."}
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 pt-2 w-full">
            <button onClick={handleRestart}
              className="w-full sm:w-auto px-4 py-2.5 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 font-bold text-xs rounded-xl cursor-pointer">
              <RotateCcw size={12} className="inline mr-1.5" />Start Over
            </button>
            <button onClick={onResetCategory}
              className="w-full sm:w-auto px-4 py-2.5 bg-[#0f4c81] hover:bg-[#1c7e9f] text-white font-extrabold text-xs rounded-xl cursor-pointer shadow-sm">
              Browse More Categories
            </button>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────
          QUESTION / CHOICE STEP (VISUAL IMAGE OR TEXT)
      ───────────────────────────────────────── */}
      {!isProductStep && !isServiceStep && !isInfoStep && !isRedirectStep && !isEndStep && (
        <div className="space-y-4 pt-1">
          
          {/* Question Header (Always clean text) */}
          <div className="text-center space-y-1.5 max-w-xl mx-auto">
            <h3 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">{currentStep.title}</h3>
            {currentStep.subtitle && <p className="text-xs text-slate-500 font-medium leading-relaxed">{currentStep.subtitle}</p>}
          </div>

          {/* 1. If options have images -> Render Visual Image Card Grid */}
          {hasOptionImages ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 max-w-3xl mx-auto pt-1">
              {currentStep.options.map(opt => {
                const isSelected = userSelections[currentStep.id]?.id === opt.id || (multiSelections[currentStep.id] || []).includes(opt.id);

                return (
                  <button
                    key={opt.id}
                    onClick={() => isCheckboxStep ? handleToggleCheckbox(opt.id) : handleSelectOption(opt)}
                    className={`group rounded-2xl border text-left transition-all cursor-pointer overflow-hidden shadow-2xs hover:shadow-md h-48 relative flex flex-col justify-between ${
                      isSelected
                        ? "bg-blue-50/50 border-[#0f4c81] ring-2 ring-[#0f4c81]"
                        : "bg-white border-slate-200 hover:border-[#0f4c81] hover:bg-slate-50/50"
                    }`}
                  >
                    {opt.image ? (
                      /* Image-Only Option Card */
                      <div className="w-full h-full relative overflow-hidden bg-slate-100">
                        <img
                          src={opt.image}
                          alt={opt.label}
                          style={{ objectPosition: opt.imagePosition || "center" }}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        {isSelected && (
                          <div className="absolute top-2.5 right-2.5 w-7 h-7 rounded-full bg-[#0f4c81] text-white flex items-center justify-center shadow-md">
                            <Check size={15} />
                          </div>
                        )}
                      </div>
                    ) : (
                      /* Text-Only Option Card */
                      <div className="p-4 flex flex-col justify-between h-full w-full">
                        <div>
                          {opt.badge && (
                            <span className="px-2 py-0.5 rounded-md bg-blue-50 text-[#0f4c81] text-[9px] font-black uppercase tracking-wider border border-blue-200">
                              {opt.badge}
                            </span>
                          )}
                          <h4 className="font-extrabold text-xs text-slate-900 group-hover:text-[#0f4c81] transition-colors leading-snug mt-1.5">
                            {opt.label}
                          </h4>
                          {opt.description && (
                            <p className="text-[11px] text-slate-500 mt-1 leading-relaxed line-clamp-2 font-medium">
                              {opt.description}
                            </p>
                          )}
                        </div>

                        <div className="pt-2 flex items-center justify-between text-[10px] font-bold text-[#0f4c81]">
                          <span>Select</span>
                          <ChevronRight size={12} className="group-hover:translate-x-1 transition-transform" />
                        </div>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          ) : (
            /* 2. Text-Only Choice Cards */
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-xl mx-auto pt-1">
              {currentStep.options.map(opt => {
                const isSelected = userSelections[currentStep.id]?.id === opt.id || (multiSelections[currentStep.id] || []).includes(opt.id);

                return (
                  <button 
                    key={opt.id} 
                    onClick={() => isCheckboxStep ? handleToggleCheckbox(opt.id) : handleSelectOption(opt)}
                    className={`p-4 rounded-2xl border text-left transition-all cursor-pointer group flex flex-col justify-between shadow-2xs hover:shadow-xs ${
                      isSelected
                        ? "bg-blue-50/70 border-[#0f4c81] text-slate-900 ring-2 ring-[#0f4c81]/20"
                        : "bg-white border-slate-200 text-slate-900 hover:bg-slate-50 hover:border-[#0f4c81]"
                    }`}
                  >
                    <div>
                      {opt.badge && (
                        <div className="flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-wider text-[#0f4c81] mb-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#0f4c81]"></span>
                          <span>{opt.badge}</span>
                        </div>
                      )}
                      <div>
                        <h4 className="font-extrabold text-xs text-slate-900 group-hover:text-[#0f4c81] transition-colors">{opt.label}</h4>
                        {opt.description && (
                          <p className="text-[11px] text-slate-500 mt-1 leading-relaxed font-medium">
                            {opt.description}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="mt-3 flex items-center justify-end text-[10px] font-bold text-[#0f4c81] pt-2 border-t border-slate-100">
                      <span className="group-hover:translate-x-1 transition-transform flex items-center gap-1">
                        Select <ChevronRight size={12} />
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {/* If Multi-Select Checkboxes -> Show Continue button */}
          {isCheckboxStep && (
            <div className="flex justify-center pt-3">
              <button
                onClick={() => goToNextStep()}
                className="px-6 py-2.5 bg-[#0f4c81] hover:bg-[#1c7e9f] text-white font-extrabold text-xs rounded-xl flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
              >
                Continue With Selected ({(multiSelections[currentStep.id] || []).length}) <ChevronRight size={14} />
              </button>
            </div>
          )}

        </div>
      )}
    </div>
  );
}
