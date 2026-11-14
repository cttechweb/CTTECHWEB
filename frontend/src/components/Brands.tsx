import React, { useState, useEffect } from "react";
import { BrandPartner } from "../types";
import { getBrands, getLocalBrands } from "../services/brandService";
import { renderBrandLogoGraphic } from "../utils/brandLogos";

export default function Brands() {
  const [partners, setPartners] = useState<BrandPartner[]>(() => {
    return getLocalBrands().filter((p) => p.isActive !== false);
  });

  const [showAll, setShowAll] = useState(false);

  const loadSettings = async () => {
    const list = getLocalBrands().filter((p) => p.isActive !== false);
    setPartners(list);

    try {
      const d1Brands = await getBrands();
      if (d1Brands && d1Brands.length > 0) {
        setPartners(d1Brands.filter((p) => p.isActive !== false));
      }
    } catch {}
  };

  useEffect(() => {
    loadSettings();

    const handleUpdate = (e: any) => {
      if (e?.detail && Array.isArray(e.detail)) {
        const list = e.detail.filter((p: BrandPartner) => p.isActive !== false);
        setPartners(list);
      } else {
        loadSettings();
      }
    };

    window.addEventListener("cooltech_settings_updated", loadSettings);
    window.addEventListener("cooltech_brands_updated", handleUpdate);
    return () => {
      window.removeEventListener("cooltech_settings_updated", loadSettings);
      window.removeEventListener("cooltech_brands_updated", handleUpdate);
    };
  }, []);

  const handleBrandClick = (partner: BrandPartner) => {
    window.location.hash = `#/products?brand=${encodeURIComponent(partner.name)}`;
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  /**
   * Render official SVG brand logo or custom uploaded logo (Logos ONLY, seamless un-boxy presentation)
   */
  const renderBrandLogo = (partner: BrandPartner) => {
    return (
      <div className="w-full h-full flex items-center justify-center p-2 overflow-hidden">
        {renderBrandLogoGraphic(partner, { maxH: "max-h-12", maxW: "max-w-[150px]" })}
      </div>
    );
  };

  if (partners.length === 0) {
    return null;
  }

  // Initial visible count: 8 brands (2 rows of 4 on desktop)
  const INITIAL_COUNT = 8;
  const visiblePartners = showAll ? partners : partners.slice(0, INITIAL_COUNT);

  return (
    <section 
      className="w-full bg-white py-10 md:py-14" 
      id="brands-section"
      aria-label="Brands"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Clean Header matching Categories style */}
        <div className="border-b border-gray-100 pb-4 mb-8">
          <h2 className="font-display font-extrabold text-2xl md:text-3xl text-slate-900 tracking-tight">
            Brands
          </h2>
        </div>

        {/* Clean, Non-Boxy Logo Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-6 sm:gap-8 lg:gap-10 items-center justify-items-center">
          {visiblePartners.map((partner) => (
            <div
              key={partner.id}
              role="button"
              tabIndex={0}
              onClick={() => handleBrandClick(partner)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  handleBrandClick(partner);
                }
              }}
              className="w-full h-20 sm:h-24 flex items-center justify-center p-3 rounded-2xl hover:bg-slate-50/90 transition-all duration-300 cursor-pointer group focus:outline-none focus:ring-2 focus:ring-[#2596be]/30"
              title={`View ${partner.name} products`}
            >
              {renderBrandLogo(partner)}
            </div>
          ))}
        </div>

        {/* "View All" navigates to the dedicated Brand Page */}
        <div className="mt-8 text-center">
          <button
            type="button"
            onClick={() => {
              window.location.hash = "#/brands";
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            className="text-sm font-bold text-[#0f4c81] hover:text-[#2596be] transition-colors cursor-pointer inline-flex items-center gap-1.5 group"
          >
            <span>View All</span>
            <span className="text-xs transition-transform group-hover:translate-x-1">&gt;</span>
          </button>
        </div>

      </div>
    </section>
  );
}
