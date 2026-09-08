import React, { useState, useEffect } from "react";
import { Bot, Sparkles, ChevronRight, X } from "lucide-react";
import { isAdminRoute } from "../../utils/adminRoute";

interface FloatingSelectorTriggerProps {
  onOpenWizard: () => void;
  currentHash: string;
}

export default function FloatingSelectorTrigger({ onOpenWizard, currentHash }: FloatingSelectorTriggerProps) {
  const [isBoxOpen, setIsBoxOpen] = useState(false);
  const [isDismissedOnPage, setIsDismissedOnPage] = useState(false);

  // Reset manual dismissal state whenever user navigates to a new page/hash route
  useEffect(() => {
    setIsDismissedOnPage(false);
  }, [currentHash]);

  // Monitor scroll and route: Show boxy card ONLY while inside product/service/category sections & NOT dismissed/completed
  useEffect(() => {
    const checkProductSectionScroll = () => {
      // If user completed wizard or manually clicked X on this page, DO NOT auto-open
      const isCompleted = sessionStorage.getItem("cooltech_wizard_completed") === "true";
      if (isDismissedOnPage || isCompleted) {
        setIsBoxOpen(false);
        return;
      }

      // Explicitly disable popup on contact, legal, support, and other non-catalog routes
      const isNonCatalogRoute = 
        currentHash.startsWith("#/contact") ||
        currentHash.startsWith("#/support") ||
        currentHash.startsWith("#/legal") ||
        currentHash.startsWith("#/terms") ||
        currentHash.startsWith("#/privacy") ||
        currentHash.startsWith("#/about") ||
        currentHash.startsWith("#/management") ||
        currentHash.startsWith("#/media") ||
        currentHash.startsWith("#/careers") ||
        currentHash.startsWith("#/blog");

      if (isNonCatalogRoute) {
        setIsBoxOpen(false);
        return;
      }

      const isProductRoute = 
        currentHash.startsWith("#/categories") ||
        currentHash.startsWith("#/products") || 
        currentHash.startsWith("#/product/") || 
        currentHash.startsWith("#/services");
      
      const catalogEl = document.getElementById("product-catalog") || 
                        document.getElementById("products-line-list") ||
                        document.getElementById("services-page") ||
                        document.getElementById("categories");

      let isInsideSection = isProductRoute;

      if (catalogEl) {
        const rect = catalogEl.getBoundingClientRect();
        // Inside section when rect is in or near viewport
        if (rect.top <= window.innerHeight * 0.8 && rect.bottom >= window.innerHeight * 0.1) {
          isInsideSection = true;
        }
      }

      setIsBoxOpen(isInsideSection);
    };

    const timer = setTimeout(() => {
      checkProductSectionScroll();
    }, 300);

    window.addEventListener("scroll", checkProductSectionScroll, { passive: true });
    checkProductSectionScroll();

    return () => {
      clearTimeout(timer);
      window.removeEventListener("scroll", checkProductSectionScroll);
    };
  }, [currentHash, isDismissedOnPage]);

  // Manual dismissal handler (Clicking X)
  const handleDismiss = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDismissedOnPage(true);
    setIsBoxOpen(false);
  };

  // Hide ONLY on admin or builder routes
  if (isAdminRoute(currentHash) || currentHash.startsWith("#/admin") || currentHash.startsWith("#/builder")) {
    return null;
  }

  return (
    <div className="fixed bottom-6 left-6 z-50 pointer-events-auto">
      
      {/* ── CONTINUOUS FLOATING CONTAINER (Always bobbing everywhere) ── */}
      <div className="animate-[bounce_3.5s_infinite_ease-in-out] flex flex-col items-start relative">
        
        {/* ── BOXY MESSAGE CARD ON TOP (Respects manual close X & completion) ── */}
        {isBoxOpen && !isDismissedOnPage && (
          <div className="absolute bottom-full mb-3 left-0 w-72 sm:w-80 bg-white text-slate-900 border border-slate-200 shadow-2xl rounded-2xl p-4 animate-in fade-in zoom-in-95 duration-200 z-50">
            {/* Pointer arrow pointing down at the button */}
            <div className="absolute -bottom-2 left-5 w-4 h-4 bg-white border-b border-r border-slate-200 rotate-45" />

            {/* Box Header with AI Badge */}
            <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-2 mb-2">
              <div className="flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wider text-blue-800">
                <div className="w-5 h-5 rounded-md bg-blue-50 text-blue-700 flex items-center justify-center">
                  <Sparkles size={12} className="fill-blue-600 text-blue-600" />
                </div>
                <span>AI Selector Assistant</span>
              </div>

              <button
                onClick={handleDismiss}
                className="w-5 h-5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-400 hover:text-slate-700 flex items-center justify-center transition-colors cursor-pointer"
                title="Dismiss message"
              >
                <X size={12} />
              </button>
            </div>

            {/* Box Body Copy */}
            <div className="space-y-1 text-left">
              <h4 className="font-extrabold text-xs sm:text-sm text-slate-900 leading-snug">
                Find Exact Match for Your Project Need
              </h4>
              <p className="text-[11px] text-slate-500 font-medium leading-relaxed">
                Filter capacity, AC technologies & get instant matching product models with specs.
              </p>
            </div>

            {/* Box Action Button */}
            <button
              onClick={() => {
                onOpenWizard();
              }}
              className="mt-3 w-full py-2.5 bg-[#031b4e] hover:bg-blue-800 text-white font-extrabold text-xs rounded-xl shadow-sm flex items-center justify-center gap-1.5 transition-all cursor-pointer group/btn"
            >
              <span>Click for Smart Selection</span>
              <ChevronRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
            </button>
          </div>
        )}

        {/* ── PRIMARY AI FLOATING ICON BUTTON ── */}
        <button
          onClick={() => {
            if (!isBoxOpen && !isDismissedOnPage) {
              setIsBoxOpen(true);
            } else {
              onOpenWizard();
            }
          }}
          className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gradient-to-br from-[#031b4e] to-[#0a3285] hover:from-[#05266e] hover:to-[#2596be] text-white border-2 border-white shadow-xl hover:shadow-2xl flex items-center justify-center transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer relative shrink-0 group/icon"
          title="Open AI Smart Equipment Selector"
          id="floating-selector-btn"
        >
          {/* AI Robot / Smart Bot Icon */}
          <Bot size={24} className="text-white group-hover/icon:scale-110 transition-transform duration-300 sm:w-7 sm:h-7" />

          {/* AI Sparkle Badge */}
          <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-amber-400 border-2 border-white flex items-center justify-center text-slate-950 shadow-xs">
            <Sparkles size={11} className="fill-slate-950 text-slate-950" />
          </span>

          {/* Active Pulse Ring */}
          <span className="absolute inset-0 rounded-full border-2 border-blue-400/40 animate-ping pointer-events-none" />
        </button>

      </div>
    </div>
  );
}
