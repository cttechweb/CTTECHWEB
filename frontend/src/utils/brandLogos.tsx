import React from "react";
import { BrandPartner } from "../types";

interface BrandGraphicOptions {
  maxH?: string;
  maxW?: string;
  darkContrast?: boolean;
}

export function renderBrandLogoGraphic(partner: BrandPartner, options?: BrandGraphicOptions) {
  const customLogo = (partner.logo || (partner as any).logoUrl || "").trim();
  const maxH = options?.maxH || "max-h-10";
  const maxW = options?.maxW || "max-w-[140px]";

  if (customLogo) {
    const scaleVal = partner.scale !== undefined ? partner.scale : 1;
    return (
      <img
        src={customLogo}
        alt={partner.name}
        loading="lazy"
        style={{
          transform: `scale(${scaleVal})`,
          objectPosition: partner.imagePosition || "50% 50%",
          objectFit: partner.objectFit || "contain",
          padding: partner.padding !== undefined ? `${partner.padding}px` : "2px",
        }}
        className={`${maxH} ${maxW} w-auto h-auto object-contain transition-transform duration-300 group-hover:scale-105`}
      />
    );
  }

  if (partner.logoSvg) {
    return (
      <div 
        className={`w-full h-full flex items-center justify-center p-1 [&>svg]:${maxH} [&>svg]:${maxW} [&>svg]:w-auto`}
        dangerouslySetInnerHTML={{ __html: partner.logoSvg }}
      />
    );
  }

  const upper = (partner.name || "").trim().toUpperCase();

  if (upper === "DAIKIN") {
    return (
      <svg className="h-7 max-w-[130px] w-auto transition-transform duration-300 group-hover:scale-105" viewBox="0 0 200 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 6L32 42H12L2 24L12 6Z" fill="#0097E2" />
        <text x="42" y="35" fontFamily="Arial, sans-serif" fontWeight="900" fontSize="30" letterSpacing="2" fill={options?.darkContrast ? "#ffffff" : "#031b4e"}>DAIKIN</text>
      </svg>
    );
  }

  if (upper === "MIDEA") {
    return (
      <svg className="h-7 max-w-[125px] w-auto transition-transform duration-300 group-hover:scale-105" viewBox="0 0 160 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="20" cy="24" r="16" fill="#0083CA" />
        <path d="M12 28C14 20 18 16 23 16C28 16 27 24 23 28" stroke="white" strokeWidth="3" strokeLinecap="round" />
        <circle cx="24" cy="22" r="3" fill="white" />
        <text x="44" y="32" fontFamily="sans-serif" fontWeight="800" fontSize="25" fill="#0083CA" letterSpacing="-0.5">Midea</text>
      </svg>
    );
  }

  if (upper === "PANASONIC") {
    return (
      <svg className="h-6 max-w-[140px] w-auto transition-transform duration-300 group-hover:scale-105" viewBox="0 0 180 36" fill="none" xmlns="http://www.w3.org/2000/svg">
        <text x="0" y="27" fontFamily="Arial, Helvetica, sans-serif" fontWeight="900" fontSize="26" letterSpacing="1.2" fill={options?.darkContrast ? "#38bdf8" : "#004098"}>Panasonic</text>
      </svg>
    );
  }

  if (upper.includes("MITSUBISHI")) {
    return (
      <svg className="h-8 max-w-[160px] w-auto transition-transform duration-300 group-hover:scale-105" viewBox="0 0 195 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <g transform="translate(2, 2)">
          <polygon points="18,0 26,14 18,28 10,14" fill="#E60012" />
          <polygon points="6,20 14,34 6,48 -2,34" fill="#E60012" />
          <polygon points="30,20 38,34 30,48 22,34" fill="#E60012" />
        </g>
        <text x="48" y="22" fontFamily="Arial, sans-serif" fontWeight="900" fontSize="13" letterSpacing="0.8" fill={options?.darkContrast ? "#ffffff" : "#111827"}>MITSUBISHI</text>
        <text x="48" y="36" fontFamily="Arial, sans-serif" fontWeight="700" fontSize="8.5" letterSpacing="1.5" fill={options?.darkContrast ? "#cbd5e1" : "#4B5563"}>HEAVY INDUSTRIES</text>
      </svg>
    );
  }

  if (upper === "LG") {
    return (
      <svg className="h-7 max-w-[115px] w-auto transition-transform duration-300 group-hover:scale-105" viewBox="0 0 120 44" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="22" cy="22" r="18" fill="#A50034" />
        <circle cx="27" cy="17" r="2.5" fill="white" />
        <path d="M22 13V25H29" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M12 22C12 27.5 16.5 32 22 32C27.5 32 32 27.5 32 22C32 17.5 28.5 13.8 24.5 12.5" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
        <text x="48" y="30" fontFamily="Arial, sans-serif" fontWeight="900" fontSize="24" letterSpacing="1" fill={options?.darkContrast ? "#ffffff" : "#1e293b"}>LG</text>
      </svg>
    );
  }

  if (upper === "SAMSUNG") {
    return (
      <svg className="h-6 max-w-[140px] w-auto transition-transform duration-300 group-hover:scale-105" viewBox="0 0 160 36" fill="none" xmlns="http://www.w3.org/2000/svg">
        <ellipse cx="80" cy="18" rx="78" ry="16" fill="#1428A0" />
        <text x="80" y="24" fontFamily="Arial, sans-serif" fontWeight="900" fontSize="16" letterSpacing="2.5" fill="white" textAnchor="middle">SAMSUNG</text>
      </svg>
    );
  }

  if (upper === "YORK") {
    return (
      <svg className="h-7 max-w-[125px] w-auto transition-transform duration-300 group-hover:scale-105" viewBox="0 0 135 40" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="0" y="4" width="32" height="32" rx="6" fill="#004B87" />
        <path d="M8 12L16 22V28H18V22L26 12H21L17 18L13 12H8Z" fill="white" />
        <text x="38" y="28" fontFamily="Arial, sans-serif" fontWeight="900" fontSize="24" letterSpacing="1" fill={options?.darkContrast ? "#38bdf8" : "#004B87"}>YORK</text>
      </svg>
    );
  }

  if (upper === "CARRIER") {
    return (
      <svg className="h-7 max-w-[125px] w-auto transition-transform duration-300 group-hover:scale-105" viewBox="0 0 140 42" fill="none" xmlns="http://www.w3.org/2000/svg">
        <ellipse cx="70" cy="21" rx="68" ry="19" fill="#003882" />
        <text x="70" y="27" fontFamily="Georgia, serif" fontStyle="italic" fontWeight="bold" fontSize="20" letterSpacing="0.5" fill="white" textAnchor="middle">Carrier</text>
      </svg>
    );
  }

  if (upper === "GREE") {
    return (
      <svg className="h-6 max-w-[125px] w-auto transition-transform duration-300 group-hover:scale-105" viewBox="0 0 140 40" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="20" cy="20" r="16" fill="#00965E" />
        <path d="M12 20C12 15.6 15.6 12 20 12C23.5 12 26.5 14.3 27.5 17.5H20V22.5H32C32 26.6 26.6 28 20 28C15.6 28 12 24.4 12 20Z" fill="white" />
        <text x="44" y="27" fontFamily="Arial, sans-serif" fontWeight="900" fontSize="21" letterSpacing="1.5" fill="#00965E">GREE</text>
      </svg>
    );
  }

  if (upper.includes("GENERAL") && !upper.includes("SUPER")) {
    return (
      <svg className="h-6 max-w-[145px] w-auto transition-transform duration-300 group-hover:scale-105" viewBox="0 0 180 38" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="0" y="4" width="30" height="30" rx="4" fill="#E60012" />
        <text x="15" y="26" fontFamily="Arial, sans-serif" fontWeight="900" fontSize="20" fill="white" textAnchor="middle">G</text>
        <text x="38" y="27" fontFamily="Arial, sans-serif" fontWeight="900" fontSize="19" letterSpacing="1" fill={options?.darkContrast ? "#ffffff" : "#1e293b"}>O GENERAL</text>
      </svg>
    );
  }

  if (upper === "SUPER GENERAL") {
    return (
      <svg className="h-7 max-w-[150px] w-auto transition-transform duration-300 group-hover:scale-105" viewBox="0 0 180 40" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="0" y="6" width="180" height="28" rx="4" fill="#003399" />
        <text x="90" y="25" fontFamily="Arial, sans-serif" fontWeight="900" fontSize="16" letterSpacing="1" fill="white" textAnchor="middle">SUPER GENERAL</text>
      </svg>
    );
  }

  if (upper === "AFTRON") {
    return (
      <svg className="h-6 max-w-[130px] w-auto transition-transform duration-300 group-hover:scale-105" viewBox="0 0 160 38" fill="none" xmlns="http://www.w3.org/2000/svg">
        <text x="0" y="26" fontFamily="Arial Black, sans-serif" fontStyle="italic" fontWeight="900" fontSize="24" letterSpacing="1.5" fill="#0072CE">AFTRON</text>
      </svg>
    );
  }

  if (upper === "TRANE") {
    return (
      <svg className="h-7 max-w-[125px] w-auto transition-transform duration-300 group-hover:scale-105" viewBox="0 0 150 40" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="20" cy="20" r="16" fill="#F05A22" />
        <circle cx="20" cy="20" r="9" fill="white" />
        <circle cx="20" cy="20" r="4" fill="#F05A22" />
        <text x="44" y="27" fontFamily="Arial, sans-serif" fontWeight="900" fontSize="22" letterSpacing="2" fill={options?.darkContrast ? "#ffffff" : "#1e293b"}>TRANE</text>
      </svg>
    );
  }

  if (upper.includes("BLUE STAR")) {
    return (
      <svg className="h-7 max-w-[135px] w-auto transition-transform duration-300 group-hover:scale-105" viewBox="0 0 160 40" fill="none" xmlns="http://www.w3.org/2000/svg">
        <polygon points="18,4 22,15 33,15 24,22 27,33 18,26 9,33 12,22 3,15 14,15" fill="#00529B" />
        <text x="38" y="26" fontFamily="Arial, sans-serif" fontWeight="900" fontSize="18" letterSpacing="1" fill={options?.darkContrast ? "#38bdf8" : "#00529B"}>BLUE STAR</text>
      </svg>
    );
  }

  // Fallback badge
  return (
    <div className="flex items-center gap-1.5 px-2 py-1 bg-slate-50 rounded-lg">
      <span className="w-5 h-5 rounded bg-[#031b4e] text-white flex items-center justify-center font-black text-[9px]">
        {partner.name.substring(0, 2).toUpperCase()}
      </span>
      <span className="font-extrabold text-[10px] text-[#031b4e] uppercase tracking-wider truncate max-w-[90px]">
        {partner.name}
      </span>
    </div>
  );
}
