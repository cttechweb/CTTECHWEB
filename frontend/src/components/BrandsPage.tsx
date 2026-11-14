import React, { useState, useEffect, useMemo } from "react";
import { Search, ShieldCheck } from "lucide-react";
import { BrandPartner, Product } from "../types";
import { getBrands, getLocalBrands } from "../services/brandService";
import { renderBrandLogoGraphic } from "../utils/brandLogos";
import { PRODUCTS } from "../data";

interface BrandsPageProps {
  products?: Product[];
  onSelectBrand?: (brandName: string) => void;
}

export default function BrandsPage({ products, onSelectBrand }: BrandsPageProps) {
  const activeProducts = products || PRODUCTS;
  const [partners, setPartners] = useState<BrandPartner[]>(() => {
    return getLocalBrands().filter((p) => p.isActive !== false);
  });

  const [searchTerm, setSearchTerm] = useState("");

  const loadBrands = async () => {
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
    loadBrands();

    const handleUpdate = (e: any) => {
      if (e?.detail && Array.isArray(e.detail)) {
        const list = e.detail.filter((p: BrandPartner) => p.isActive !== false);
        setPartners(list);
      } else {
        loadBrands();
      }
    };

    window.addEventListener("cooltech_settings_updated", loadBrands);
    window.addEventListener("cooltech_brands_updated", handleUpdate);
    return () => {
      window.removeEventListener("cooltech_settings_updated", loadBrands);
      window.removeEventListener("cooltech_brands_updated", handleUpdate);
    };
  }, []);

  // SEO Title
  useEffect(() => {
    document.title = "Shop Trusted HVAC & AC Brands UAE | Cool Technologies";
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const handleBrandClick = (brandName: string) => {
    if (onSelectBrand) {
      onSelectBrand(brandName);
    } else {
      window.location.hash = `#/products?brand=${encodeURIComponent(brandName)}`;
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleImageError = (partnerId: string) => {
    setBrokenImages((prev) => ({ ...prev, [partnerId]: true }));
  };

  // Pre-configured rich descriptions matching competitor style
  const getBrandDescription = (partner: BrandPartner): string => {
    if (partner.tagline && partner.tagline.trim().length > 10) {
      return partner.tagline;
    }
    const upper = partner.name.trim().toUpperCase();
    if (upper === "DAIKIN") return "Advanced cooling solutions for every space with industry-leading VRF efficiency.";
    if (upper === "MIDEA") return "Energy-smart cooling systems for homes and commercial spaces.";
    if (upper === "PANASONIC") return "Reliable nanoe™ X air purification and high-performance inverter cooling.";
    if (upper.includes("MITSUBISHI")) return "Heavy-duty commercial chillers and VRF systems engineered for extreme ambient climates.";
    if (upper === "LG") return "Smart inverter ACs with energy saving dual-inverter compressor technology.";
    if (upper === "SAMSUNG") return "Innovative cooling with smart WindFree™ features for modern living.";
    if (upper === "YORK") return "Heavy commercial chillers, air handling units, and industrial refrigeration.";
    if (upper === "CARRIER") return "Turn to the experts: world-renowned packaged chillers and ducted splits.";
    if (upper === "GREE") return "High performance ACs engineered for extreme Middle East climates.";
    if (upper.includes("GENERAL") && !upper.includes("SUPER")) return "Premium tropical cooling built for demanding UAE summers.";
    if (upper.includes("SUPER GENERAL")) return "Reliable cooling appliances with strong value and immediate availability.";
    if (upper === "AFTRON") return "UAE-focused electronics brand with practical, dependable cooling choices.";
    if (upper === "TRANE") return "World-class building chillers, rooftop packages, and commercial HVAC systems.";
    if (upper.includes("BLUE STAR")) return "Commercial air conditioning and industrial refrigeration systems.";
    return partner.tagline || `Certified HVAC and climate control systems from ${partner.name}.`;
  };

  // Official high-definition vector logos
  const renderBrandLogo = (partner: BrandPartner) => {
    return (
      <div className="h-16 w-full flex items-center justify-center p-2 overflow-hidden">
        {renderBrandLogoGraphic(partner, { maxH: "max-h-12", maxW: "max-w-[150px]" })}
      </div>
    );
  };

  const _unusedBrandSvg = (partner: BrandPartner) => {
    const upper = partner.name.trim().toUpperCase();

    if (upper === "DAIKIN") {
      return (
        <div className="h-16 w-full flex items-center justify-center p-2">
          <svg className="h-8 max-w-[140px] w-auto transition-transform duration-300 group-hover:scale-105" viewBox="0 0 200 48" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 6L32 42H12L2 24L12 6Z" fill="#0097E2" />
            <text x="42" y="35" fontFamily="Arial, sans-serif" fontWeight="900" fontSize="30" letterSpacing="2" fill="#031b4e">DAIKIN</text>
          </svg>
        </div>
      );
    }

    if (upper === "MIDEA") {
      return (
        <div className="h-16 w-full flex items-center justify-center p-2">
          <svg className="h-8 max-w-[135px] w-auto transition-transform duration-300 group-hover:scale-105" viewBox="0 0 160 48" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="20" cy="24" r="16" fill="#0083CA" />
            <path d="M12 28C14 20 18 16 23 16C28 16 27 24 23 28" stroke="white" strokeWidth="3" strokeLinecap="round" />
            <circle cx="24" cy="22" r="3" fill="white" />
            <text x="44" y="32" fontFamily="sans-serif" fontWeight="800" fontSize="25" fill="#0083CA" letterSpacing="-0.5">Midea</text>
          </svg>
        </div>
      );
    }

    if (upper === "PANASONIC") {
      return (
        <div className="h-16 w-full flex items-center justify-center p-2">
          <svg className="h-7 max-w-[150px] w-auto transition-transform duration-300 group-hover:scale-105" viewBox="0 0 180 36" fill="none" xmlns="http://www.w3.org/2000/svg">
            <text x="0" y="27" fontFamily="Arial, Helvetica, sans-serif" fontWeight="900" fontSize="26" letterSpacing="1.2" fill="#004098">Panasonic</text>
          </svg>
        </div>
      );
    }

    if (upper.includes("MITSUBISHI")) {
      return (
        <div className="h-16 w-full flex items-center justify-center p-2">
          <svg className="h-9 max-w-[170px] w-auto transition-transform duration-300 group-hover:scale-105" viewBox="0 0 195 48" fill="none" xmlns="http://www.w3.org/2000/svg">
            <g transform="translate(2, 2)">
              <polygon points="18,0 26,14 18,28 10,14" fill="#E60012" />
              <polygon points="6,20 14,34 6,48 -2,34" fill="#E60012" />
              <polygon points="30,20 38,34 30,48 22,34" fill="#E60012" />
            </g>
            <text x="48" y="22" fontFamily="Arial, sans-serif" fontWeight="900" fontSize="13" letterSpacing="0.8" fill="#111827">MITSUBISHI</text>
            <text x="48" y="36" fontFamily="Arial, sans-serif" fontWeight="700" fontSize="8.5" letterSpacing="1.5" fill="#4B5563">HEAVY INDUSTRIES</text>
          </svg>
        </div>
      );
    }

    if (upper === "LG") {
      return (
        <div className="h-16 w-full flex items-center justify-center p-2">
          <svg className="h-8 max-w-[125px] w-auto transition-transform duration-300 group-hover:scale-105" viewBox="0 0 120 44" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="22" cy="22" r="18" fill="#A50034" />
            <circle cx="27" cy="17" r="2.5" fill="white" />
            <path d="M22 13V25H29" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M12 22C12 27.5 16.5 32 22 32C27.5 32 32 27.5 32 22C32 17.5 28.5 13.8 24.5 12.5" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
            <text x="48" y="30" fontFamily="Arial, sans-serif" fontWeight="900" fontSize="24" letterSpacing="1" fill="#1e293b">LG</text>
          </svg>
        </div>
      );
    }

    if (upper === "SAMSUNG") {
      return (
        <div className="h-16 w-full flex items-center justify-center p-2">
          <svg className="h-7 max-w-[150px] w-auto transition-transform duration-300 group-hover:scale-105" viewBox="0 0 160 36" fill="none" xmlns="http://www.w3.org/2000/svg">
            <ellipse cx="80" cy="18" rx="78" ry="16" fill="#1428A0" />
            <text x="80" y="24" fontFamily="Arial, sans-serif" fontWeight="900" fontSize="16" letterSpacing="2.5" fill="white" textAnchor="middle">SAMSUNG</text>
          </svg>
        </div>
      );
    }

    if (upper === "YORK") {
      return (
        <div className="h-16 w-full flex items-center justify-center p-2">
          <svg className="h-8 max-w-[135px] w-auto transition-transform duration-300 group-hover:scale-105" viewBox="0 0 135 40" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="0" y="4" width="32" height="32" rx="6" fill="#004B87" />
            <path d="M8 12L16 22V28H18V22L26 12H21L17 18L13 12H8Z" fill="white" />
            <text x="38" y="28" fontFamily="Arial, sans-serif" fontWeight="900" fontSize="24" letterSpacing="1" fill="#004B87">YORK</text>
          </svg>
        </div>
      );
    }

    if (upper === "CARRIER") {
      return (
        <div className="h-16 w-full flex items-center justify-center p-2">
          <svg className="h-8 max-w-[135px] w-auto transition-transform duration-300 group-hover:scale-105" viewBox="0 0 140 42" fill="none" xmlns="http://www.w3.org/2000/svg">
            <ellipse cx="70" cy="21" rx="68" ry="19" fill="#003882" />
            <text x="70" y="27" fontFamily="Georgia, serif" fontStyle="italic" fontWeight="bold" fontSize="20" letterSpacing="0.5" fill="white" textAnchor="middle">Carrier</text>
          </svg>
        </div>
      );
    }

    if (upper === "GREE") {
      return (
        <div className="h-16 w-full flex items-center justify-center p-2">
          <svg className="h-7 max-w-[135px] w-auto transition-transform duration-300 group-hover:scale-105" viewBox="0 0 140 40" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="20" cy="20" r="16" fill="#00965E" />
            <path d="M12 20C12 15.6 15.6 12 20 12C23.5 12 26.5 14.3 27.5 17.5H20V22.5H32C32 26.6 26.6 28 20 28C15.6 28 12 24.4 12 20Z" fill="white" />
            <text x="44" y="27" fontFamily="Arial, sans-serif" fontWeight="900" fontSize="21" letterSpacing="1.5" fill="#00965E">GREE</text>
          </svg>
        </div>
      );
    }

    if (upper.includes("GENERAL") && !upper.includes("SUPER")) {
      return (
        <div className="h-16 w-full flex items-center justify-center p-2">
          <svg className="h-7 max-w-[155px] w-auto transition-transform duration-300 group-hover:scale-105" viewBox="0 0 180 38" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="0" y="4" width="30" height="30" rx="4" fill="#E60012" />
            <text x="15" y="26" fontFamily="Arial, sans-serif" fontWeight="900" fontSize="20" fill="white" textAnchor="middle">G</text>
            <text x="38" y="27" fontFamily="Arial, sans-serif" fontWeight="900" fontSize="19" letterSpacing="1.2" fill="#1e293b">O GENERAL</text>
          </svg>
        </div>
      );
    }

    if (upper.includes("SUPER GENERAL")) {
      return (
        <div className="h-16 w-full flex items-center justify-center p-2">
          <svg className="h-7 max-w-[155px] w-auto transition-transform duration-300 group-hover:scale-105" viewBox="0 0 170 40" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M4 14C4 8.5 8.5 4 14 4H156C161.5 4 166 8.5 166 14V26C166 31.5 161.5 36 156 36H14C8.5 36 4 31.5 4 26V14Z" stroke="#003580" strokeWidth="2" fill="none" />
            <text x="85" y="22" fontFamily="Arial, sans-serif" fontWeight="900" fontSize="13" letterSpacing="1.2" fill="#003580" textAnchor="middle">SUPER GENERAL</text>
            <text x="85" y="32" fontFamily="Georgia, serif" fontStyle="italic" fontSize="7.5" fill="#003580" textAnchor="middle">The Confident Choice</text>
          </svg>
        </div>
      );
    }

    if (upper === "AFTRON") {
      return (
        <div className="h-16 w-full flex items-center justify-center p-2">
          <svg className="h-7 max-w-[145px] w-auto transition-transform duration-300 group-hover:scale-105" viewBox="0 0 160 40" fill="none" xmlns="http://www.w3.org/2000/svg">
            <text x="10" y="24" fontFamily="Impact, Arial Black, sans-serif" fontWeight="900" fontSize="23" fontStyle="italic" letterSpacing="1" fill="#0066B2">AFTRON</text>
            <text x="12" y="35" fontFamily="sans-serif" fontWeight="600" fontSize="8.5" letterSpacing="0.8" fill="#4B5563">expect more</text>
          </svg>
        </div>
      );
    }

    if (upper === "TRANE") {
      return (
        <div className="h-16 w-full flex items-center justify-center p-2">
          <svg className="h-8 max-w-[135px] w-auto transition-transform duration-300 group-hover:scale-105" viewBox="0 0 150 40" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="20" cy="20" r="16" fill="#F05A22" />
            <circle cx="20" cy="20" r="9" fill="white" />
            <circle cx="20" cy="20" r="4" fill="#F05A22" />
            <text x="44" y="27" fontFamily="Arial, sans-serif" fontWeight="900" fontSize="22" letterSpacing="2" fill="#1e293b">TRANE</text>
          </svg>
        </div>
      );
    }

    if (upper.includes("BLUE STAR")) {
      return (
        <div className="h-16 w-full flex items-center justify-center p-2">
          <svg className="h-8 max-w-[145px] w-auto transition-transform duration-300 group-hover:scale-105" viewBox="0 0 160 40" fill="none" xmlns="http://www.w3.org/2000/svg">
            <polygon points="18,4 22,15 33,15 24,22 27,33 18,26 9,33 12,22 3,15 14,15" fill="#00529B" />
            <text x="38" y="26" fontFamily="Arial, sans-serif" fontWeight="900" fontSize="18" letterSpacing="1" fill="#00529B">BLUE STAR</text>
          </svg>
        </div>
      );
    }

    return (
      <div className="h-16 w-full flex items-center justify-center p-2">
        <div className="flex items-center gap-2 px-3 py-2 bg-slate-100 rounded-xl border border-slate-200">
          <div className="w-7 h-7 rounded-lg bg-[#031b4e] text-white flex items-center justify-center font-black text-xs">
            {partner.name.substring(0, 2).toUpperCase()}
          </div>
          <span className="font-extrabold text-sm text-[#031b4e] uppercase tracking-wider">
            {partner.name}
          </span>
        </div>
      </div>
    );
  };

  // Filtered partners by search term
  const filteredPartners = useMemo(() => {
    if (!searchTerm.trim()) return partners;
    const term = searchTerm.toLowerCase();
    return partners.filter(
      (p) =>
        p.name.toLowerCase().includes(term) ||
        (p.tagline && p.tagline.toLowerCase().includes(term))
    );
  }, [partners, searchTerm]);

  return (
    <div className="w-full bg-[#f8fafc] min-h-screen py-8 md:py-14" id="brands-page-container">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Dynamic Breadcrumbs */}
        <nav className="flex items-center gap-1.5 text-xs text-slate-400 font-semibold mb-6">
          <a href="#/" className="hover:text-slate-700 transition-colors">Home</a>
          <span>&gt;</span>
          <span className="text-[#031b4e] font-bold">Brands</span>
        </nav>

        {/* Page Hero Header — Styled after Competitor Example */}
        <div className="text-center max-w-3xl mx-auto mb-10 md:mb-14">
          <span className="text-[11px] font-extrabold text-[#2596be] uppercase tracking-widest block mb-2">
            TOP HVAC &amp; AC BRANDS IN UAE
          </span>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-[#031b4e] tracking-tight">
            Shop Trusted AC Brands
          </h1>
          <p className="text-slate-600 text-sm sm:text-base mt-3 leading-relaxed font-normal">
            Compare leading air-conditioning manufacturers, explore available products, and get UAE-ready delivery and expert support.
          </p>

          {/* Clean Search Input */}
          <div className="mt-6 max-w-md mx-auto relative">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search partner brand by name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2596be]/30 focus:border-[#2596be] shadow-2xs transition-all"
            />
          </div>
        </div>

        {/* Brands Grid (Logos Only) */}
        {filteredPartners.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 p-8 max-w-md mx-auto">
            <p className="text-slate-500 text-sm font-semibold">No partner brands match your search.</p>
            <button
              onClick={() => setSearchTerm("")}
              className="mt-3 text-xs font-bold text-[#2596be] hover:underline"
            >
              Clear Search
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-4 sm:gap-6">
            {filteredPartners.map((partner) => (
              <div
                key={partner.id}
                role="button"
                tabIndex={0}
                onClick={() => handleBrandClick(partner.name)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    handleBrandClick(partner.name);
                  }
                }}
                className="bg-white rounded-2xl border border-slate-200/90 hover:border-[#2596be]/60 p-6 sm:p-8 shadow-xs hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 flex items-center justify-center group cursor-pointer h-32 sm:h-36"
                title={`Shop ${partner.name} commercial equipment`}
              >
                <div className="h-16 w-full flex items-center justify-center">
                  {renderBrandLogo(partner)}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Bottom Sourcing Help Ribbon */}
        <div className="mt-14 p-6 sm:p-8 bg-white rounded-2xl border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-2xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#2596be] flex items-center justify-center shrink-0">
              <ShieldCheck size={22} />
            </div>
            <div>
              <h3 className="font-bold text-[#031b4e] text-sm sm:text-base">
                Looking for a specific manufacturer not listed?
              </h3>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                We provide custom direct factory sourcing for certified commercial projects across Dubai, Abu Dhabi, and the UAE.
              </p>
            </div>
          </div>
          <a
            href="#/contact?category=equipment_quotation"
            className="shrink-0 px-4 py-2.5 rounded-xl bg-[#031b4e] hover:bg-[#0a3154] text-white text-xs font-bold uppercase tracking-wider transition-all shadow-xs hover:shadow-md cursor-pointer"
          >
            Request OEM Sourcing
          </a>
        </div>

      </div>
    </div>
  );
}
