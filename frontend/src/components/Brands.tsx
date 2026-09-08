import React, { useState, useEffect } from "react";
import { BrandPartner } from "../types";
import { getGeneralSettings } from "../services/generalSettingsService";
import { getBrands, getLocalBrands } from "../services/brandService";

export default function Brands() {
  const [partners, setPartners] = useState<BrandPartner[]>(() => {
    const s = getGeneralSettings();
    if (s.brandPartners && s.brandPartners.length > 0) {
      return s.brandPartners.filter((p) => p.isActive !== false);
    }
    return getLocalBrands().filter((p) => p.isActive !== false);
  });
  const [tickerSpeed, setTickerSpeed] = useState<number>(25);

  const loadSettings = async () => {
    const s = getGeneralSettings();
    setTickerSpeed(s.brandTickerSpeed || 25);
    const d1Brands = await getBrands();
    if (d1Brands && d1Brands.length > 0) {
      setPartners(d1Brands.filter((p) => p.isActive !== false));
    } else if (s.brandPartners && s.brandPartners.length > 0) {
      setPartners(s.brandPartners.filter((p) => p.isActive !== false));
    }
  };

  useEffect(() => {
    loadSettings();

    const handleUpdate = (e: any) => {
      if (e?.detail && Array.isArray(e.detail)) {
        setPartners(e.detail.filter((p: BrandPartner) => p.isActive !== false));
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

  const renderBrandContent = (partner: BrandPartner) => {
    const isImage = partner.displayType === "image" || Boolean(partner.logo);

    if (isImage && partner.logo) {
      const scaleVal = partner.scale !== undefined ? partner.scale : 1;
      return (
        <div 
          className="flex items-center justify-center opacity-80 group-hover:opacity-100 transition-all shrink-0 px-2 overflow-hidden"
          title={partner.name}
        >
          <img 
            src={partner.logo} 
            alt={partner.name} 
            style={{
              transform: `scale(${scaleVal})`,
              objectPosition: partner.imagePosition || "50% 50%",
              objectFit: partner.objectFit || "contain",
              padding: partner.padding !== undefined ? `${partner.padding}px` : "2px"
            }}
            className="max-h-7 max-w-[130px] filter brightness-100 transition-transform"
          />
        </div>
      );
    }

    // Special brand badge stylings for recognizable names
    const upper = partner.name.toUpperCase();
    if (upper === "DAIKIN") {
      return (
        <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity shrink-0">
          <span className="font-display font-black text-lg tracking-wider text-white">DAIKIN</span>
          <span className="w-2.5 h-2.5 rounded-full bg-cyan-400"></span>
        </div>
      );
    }

    if (upper === "MIDEA") {
      return (
        <div className="flex items-center gap-1.5 opacity-80 group-hover:opacity-100 transition-opacity shrink-0">
          <div className="w-5 h-5 rounded-full border border-white flex items-center justify-center text-[10px] font-bold text-[#0a3154] bg-white">M</div>
          <span className="font-sans font-bold text-base tracking-tight text-white">Midea</span>
        </div>
      );
    }

    if (upper === "PANASONIC") {
      return (
        <div className="opacity-80 group-hover:opacity-100 transition-opacity shrink-0">
          <span className="font-sans font-extrabold text-base tracking-widest text-white">Panasonic</span>
        </div>
      );
    }

    if (upper.includes("MITSUBISHI")) {
      return (
        <div className="flex items-center gap-2 opacity-80 group-hover:opacity-100 transition-opacity shrink-0">
          <div className="flex flex-col items-center justify-center w-5 h-5 scale-90 relative">
            <div className="w-2 h-2 bg-red-500 rotate-45 transform origin-center absolute top-0"></div>
            <div className="w-2 h-2 bg-red-500 rotate-45 transform origin-center absolute bottom-1 left-0"></div>
            <div className="w-2 h-2 bg-red-500 rotate-45 transform origin-center absolute bottom-1 right-0"></div>
          </div>
          <div className="flex flex-col leading-none">
            <span className="font-sans font-black text-[10px] tracking-wide text-white uppercase">MITSUBISHI</span>
            <span className="font-sans text-[8px] tracking-widest text-gray-300">HEAVY INDUSTRIES</span>
          </div>
        </div>
      );
    }

    if (upper === "LG") {
      return (
        <div className="flex items-center gap-1.5 opacity-80 group-hover:opacity-100 transition-opacity shrink-0">
          <div className="w-5 h-5 rounded-full border-2 border-white flex items-center justify-center text-[8px] font-black leading-none text-white font-sans relative">
            <span className="absolute left-[3px] top-[1.5px]">L</span>
            <span className="absolute right-[3px] bottom-[1.5px]">G</span>
            <span className="w-1 h-1 rounded-full bg-white absolute top-1.5 right-1.5"></span>
          </div>
          <span className="font-sans font-extrabold text-base text-white">LG</span>
        </div>
      );
    }

    if (upper === "SAMSUNG") {
      return (
        <div className="opacity-80 group-hover:opacity-100 transition-opacity border border-white/20 px-2.5 py-1 rounded-full shrink-0">
          <span className="font-sans font-black text-sm tracking-wider text-white">SAMSUNG</span>
        </div>
      );
    }

    if (upper === "YORK") {
      return (
        <div className="opacity-80 group-hover:opacity-100 transition-opacity shrink-0">
          <span className="font-display font-extrabold text-base tracking-tight text-white">YORK</span>
        </div>
      );
    }

    if (upper === "CARRIER") {
      return (
        <div className="flex items-center justify-center opacity-80 group-hover:opacity-100 transition-opacity relative px-3 py-1 bg-white/5 rounded-md border border-white/10 shrink-0">
          <span className="font-serif italic font-black text-sm tracking-wide text-white">Carrier</span>
        </div>
      );
    }

    // Default dynamic text badge
    return (
      <div className="opacity-80 group-hover:opacity-100 transition-opacity px-3 py-1 bg-white/10 rounded-lg border border-white/15 shrink-0 flex flex-col items-center justify-center">
        <span className="font-sans font-black text-sm tracking-wider text-white uppercase">{partner.name}</span>
        {partner.tagline && (
          <span className="text-[8px] text-blue-200 tracking-wider font-semibold">{partner.tagline}</span>
        )}
      </div>
    );
  };

  const renderBrandItem = (partner: BrandPartner) => {
    const inner = renderBrandContent(partner);

    if (partner.websiteUrl) {
      return (
        <a
          key={partner.id}
          href={partner.websiteUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="group shrink-0 cursor-pointer transition-transform hover:scale-105"
          title={`Visit ${partner.name} Official Website`}
        >
          {inner}
        </a>
      );
    }

    return (
      <div key={partner.id} className="group shrink-0">
        {inner}
      </div>
    );
  };

  if (partners.length === 0) {
    return null;
  }

  return (
    <section className="w-full bg-[#0a3154] text-white py-6 md:py-8 border-b border-gray-900" id="brands-section">
      <div className="max-w-7xl mx-auto px-4 flex flex-col xl:flex-row items-center justify-between gap-6 overflow-hidden">
        
        {/* Left Heading */}
        <div className="shrink-0 text-center xl:text-left">
          <p className="text-xs md:text-sm font-black tracking-widest text-blue-200/80 uppercase">
            TRUSTED BY BUSINESSES WORLDWIDE
          </p>
        </div>

        {/* Dynamic Brands Logo List with speed control & pause on hover */}
        <div className="relative overflow-hidden w-full py-2 flex select-none group/ticker">
          <div 
            className="flex flex-row items-center gap-x-12 shrink-0 animate-marquee min-w-full justify-around pr-12 group-hover/ticker:[animation-play-state:paused]"
            style={{ animationDuration: `${tickerSpeed}s` }}
          >
            {partners.map(renderBrandItem)}
          </div>
          <div 
            className="flex flex-row items-center gap-x-12 shrink-0 animate-marquee min-w-full justify-around pr-12 group-hover/ticker:[animation-play-state:paused]"
            style={{ animationDuration: `${tickerSpeed}s` }}
            aria-hidden="true"
          >
            {partners.map(renderBrandItem)}
          </div>
        </div>

      </div>
    </section>
  );
}


