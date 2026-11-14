import React, { useState, useEffect } from "react";
import {
  Building, ShieldCheck, Award, Zap, HeartHandshake,
  Settings, Star, Compass, ArrowRight, CheckCircle2, ChevronRight, ChevronDown, Trophy,
  Target, Eye, Phone, Mail, MessageSquare, MapPin, Users, Package, Layers,
  Activity, ExternalLink, Sparkles, Clock, Globe, Wrench, Droplet, Wind,
  Thermometer, Briefcase, GraduationCap, Hospital, Home, HardHat, Warehouse,
  Building2, Factory, Utensils, Hotel, Check, Shield, ThumbsUp, Truck, Landmark
} from "lucide-react";

// @ts-ignore
import hqImage from "../assets/images/cool_tech_hq_1784538496855.jpg?v=2";
// @ts-ignore
import heroBanner from "../assets/images/hvac_hero_banner_1784350809012.jpg";
// @ts-ignore
import chillerImage from "../assets/images/hvac_chiller_1784350873395.jpg";
// @ts-ignore
import acImage from "../assets/images/hvac_air_conditioner_1784350824930.jpg";
// @ts-ignore
import compressorImage from "../assets/images/hvac_compressor_1784350840924.jpg";
// @ts-ignore
import coilsImage from "../assets/images/hvac_coils_1784350888537.jpg";
// @ts-ignore
import pipesImage from "../assets/images/hvac_pipes_1784350907486.jpg";
// @ts-ignore
import thermostatImage from "../assets/images/hvac_thermostat_1784350856402.jpg";
// @ts-ignore
import main1Image from "../assets/images/main1.jpg";

import { getAchievements, getGeneralSettings } from "../services/generalSettingsService";
import { AchievementMilestone } from "../types";

interface AboutPageProps {
  onOpenQuote?: (prefilledProduct?: string) => void;
  onCategorySelect?: (categoryId: string | null) => void;
  onOpenLogin?: (mode?: "login" | "signup" | "retailer") => void;
}

// Brand partner data verified from official documents
const BRAND_PARTNERS = [
  { name: "Daikin", category: "VRF & Commercial AC", tag: "Authorized Partner" },
  { name: "Midea", category: "HVAC & Appliances", tag: "OEM Partner" },
  { name: "Panasonic", category: "Inverter Cooling", tag: "Certified Dealer" },
  { name: "Mitsubishi Heavy Industries", category: "Commercial VRF & Chillers", tag: "Master Distributor" },
  { name: "LG", category: "Commercial HVAC & Multi V", tag: "Authorized Partner" },
  { name: "Samsung", category: "DVM S VRF & Cassettes", tag: "Authorized Partner" },
  { name: "York", category: "Chillers & AHU", tag: "Certified Distributor" },
  { name: "Carrier", category: "Rooftop Packages & Chillers", tag: "Commercial Partner" },
  { name: "Blue Star", category: "Water Coolers & Chillers", tag: "Best Performance Award 2025" },
  { name: "Clivet", category: "Chillers & Heat Pumps", tag: "Best Performer Award 2024" },
  { name: "Hisense", category: "HVAC & Commercial Split", tag: "Official Dealership" },
  { name: "TCL HVAC", category: "Air Conditioning Systems", tag: "Official Dealership" },
  { name: "Kelon", category: "Cooling Platforms", tag: "Official Dealership" },
  { name: "Gree", category: "Commercial & Residential AC", tag: "Authorized Dealer" },
  { name: "Whirlpool", category: "Cooling Appliances", tag: "OEM Partner" },
  { name: "Frigidaire", category: "Refrigeration Systems", tag: "OEM Partner" },
  { name: "Super General", category: "Split & Window AC", tag: "Authorized Dealer" },
  { name: "Aftron", category: "Water Dispensers & Coolers", tag: "Authorized Partner" },
  { name: "Nikai", category: "Cooling Appliances", tag: "Authorized Dealer" },
  { name: "Aux", category: "Commercial Cooling", tag: "Authorized Partner" },
  { name: "Westpoint", category: "Air Conditioners", tag: "Dealer Partner" },
  { name: "O General", category: "Tropical Air Conditioners", tag: "Premium Partner" },
  { name: "Daewoo", category: "Cooling Equipment", tag: "Authorized Partner" },
  { name: "Brema", category: "Commercial Ice Makers", tag: "Exclusive Channel" }
];

// Major landmark projects where Cool Technologies supplied, installed, and maintained cooling solutions
const MAJOR_PROJECTS = [
  {
    name: "Dubai Expo 2020",
    client: "Global Mega Event & Pavilion Infrastructure",
    description: "Full supply, specialized water cooling equipment, air conditioning units, and critical cooling appliances for pavilions and visitor facilities.",
    tag: "Landmark Project",
    category: "International Infrastructure"
  },
  {
    name: "The Legoland – Dubai Parks & Resorts",
    client: "Dubai Parks and Resorts Entertainment Destination",
    description: "Turnkey climate systems, high-capacity commercial water chillers, water drinking stations, and continuous cooling appliance maintenance.",
    tag: "Entertainment & Leisure",
    category: "Theme Park & Resort"
  },
  {
    name: "Abu Dhabi International Airport",
    client: "Aviation Infrastructure & Terminal Complex",
    description: "High-reliability commercial air conditioning equipment, terminal utility cooling, and mission-critical water chilling plant components.",
    tag: "Aviation Infrastructure",
    category: "Transport & Civil"
  },
  {
    name: "Etihad Railway (Etihad Rail)",
    client: "UAE National Railway Network",
    description: "Durable field cooling installations, facility temperature control equipment, heavy-duty water coolers, and station utility appliances.",
    tag: "National Rail Network",
    category: "Strategic Infrastructure"
  },
  {
    name: "Various ADNOC Oil Field Projects",
    client: "Abu Dhabi National Oil Company (ADNOC)",
    description: "Extreme ambient (+54°C) desert cooling solutions, oil field worker camp water chillers, industrial HVAC systems, and heavy-duty appliances.",
    tag: "Oil & Gas Industrial",
    category: "Energy & Petrochemical"
  }
];

function getTimelineIcon(iconName?: string, color?: string) {
  const c = color || "#2596be";
  const iconProps = { size: 18, style: { color: c } };

  switch (iconName) {
    case "Building":
      return <Building {...iconProps} />;
    case "Droplet":
      return <Droplet {...iconProps} />;
    case "Compass":
      return <Compass {...iconProps} />;
    case "Wrench":
      return <Wrench {...iconProps} />;
    case "CheckCircle2":
      return <CheckCircle2 {...iconProps} />;
    case "Settings":
      return <Settings {...iconProps} />;
    case "Star":
      return <Star {...iconProps} />;
    case "HeartHandshake":
      return <HeartHandshake {...iconProps} />;
    case "Trophy":
      return <Trophy {...iconProps} />;
    case "Zap":
      return <Zap {...iconProps} />;
    case "Award":
    default:
      return <Award {...iconProps} />;
  }
}

export default function AboutPage({ onOpenQuote, onCategorySelect, onOpenLogin }: AboutPageProps) {
  // Dynamic Years in Business (Established 2012 -> 2026 = 14, 2027 = 15, etc.)
  const currentYear = new Date().getFullYear();
  const yearsInBusiness = Math.max(1, currentYear - 2012);

  // Dynamic Achievements Timeline State
  const [milestones, setMilestones] = useState<AchievementMilestone[]>(() => {
    return getAchievements().filter((m) => m.isActive !== false);
  });
  const [activeTimelineIdx, setActiveTimelineIdx] = useState<number>(0);

  const [siteSettings, setSiteSettings] = useState(() => getGeneralSettings());

  useEffect(() => {
    const loadMilestones = () => {
      const active = getAchievements().filter((m) => m.isActive !== false);
      setMilestones(active);
      if (active.length > 0) {
        setActiveTimelineIdx(active.length - 1);
      }
    };
    const loadSettings = () => {
      setSiteSettings(getGeneralSettings());
    };
    loadMilestones();
    window.addEventListener("cooltech_settings_updated", loadMilestones);
    window.addEventListener("cooltech_contact_settings_updated", loadSettings);
    window.addEventListener("cooltech_settings_updated", loadSettings);
    window.addEventListener("storage", loadSettings);
    return () => {
      window.removeEventListener("cooltech_settings_updated", loadMilestones);
      window.removeEventListener("cooltech_contact_settings_updated", loadSettings);
      window.removeEventListener("cooltech_settings_updated", loadSettings);
      window.removeEventListener("storage", loadSettings);
    };
  }, []);

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const handleNavigateCategory = (slug: string) => {
    if (onCategorySelect) {
      onCategorySelect(slug);
    }
    window.location.hash = "#/products";
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleOpenGeneralQuote = () => {
    if (onOpenQuote) {
      onOpenQuote("General Inquiry - About Us Page");
    }
  };

  return (
    <div className="w-full bg-[#f8fafc] text-slate-800 animate-fade-in font-sans">

      {/* -------------------------------------------------
          1. MINIMAL HERO SECTION (Clean White Background)
      ------------------------------------------------- */}
      <section className="bg-white border-b border-slate-200 py-10 sm:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Clean Breadcrumb */}
          <nav className="flex items-center gap-2 text-xs font-semibold text-slate-500 mb-3" aria-label="Breadcrumb">
            <button
              onClick={() => {
                window.location.hash = "#/";
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              className="hover:text-[#2596be] transition-colors cursor-pointer"
            >
              Home
            </button>
            <ChevronRight size={12} className="text-slate-400" />
            <span className="text-[#031b4e] font-bold uppercase tracking-wider">About Us</span>
          </nav>

          <div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#031b4e] tracking-tight uppercase font-sans">
              About <span className="text-[#2596be]">Cool Technologies LLC</span>
            </h1>
            <p className="text-slate-600 text-xs sm:text-sm md:text-base font-normal mt-3 max-w-3xl leading-relaxed">
              The United Arab Emirates’ premier wholesale distributor of cooling equipment representing more than 30 leading global brands, and the proud manufacturer of our signature <strong className="text-slate-900 font-semibold">COOLTECH</strong> water coolers and water tank chillers.
            </p>
          </div>

        </div>
      </section>

      {/* -------------------------------------------------
          2. COMPANY OVERVIEW ("Who We Are & What We Do")
      ------------------------------------------------- */}
      <section className="py-16 bg-white border-b border-slate-100" id="overview-section">
        <div className="max-w-7xl mx-auto px-4">

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">

            {/* Left Corporate Image & Nationwide Network Badge */}
            <div className="lg:col-span-5 relative">
              <div className="relative rounded-3xl overflow-hidden shadow-xl border border-slate-200 bg-slate-100 group">
                <img
                  src={hqImage}
                  alt="Cool Technologies Corporate Office UAE"
                  className="w-full h-[450px] object-cover group-hover:scale-105 transition-transform duration-700"
                />

                {/* Floating Nationwide Logistics Badge */}
                <div className="absolute bottom-6 left-6 right-6 bg-[#031b4e]/95 backdrop-blur-md text-white p-5 rounded-2xl border border-white/10 shadow-xl">
                  <div className="flex items-center gap-2">
                    <Truck size={14} className="text-cyan-400" />
                    <p className="text-[10px] text-blue-400 font-black uppercase tracking-widest">
                      Nationwide Distribution & Engineering Network
                    </p>
                  </div>
                  <p className="text-sm font-bold text-white mt-1">
                    Serving Abu Dhabi, Al Ain, Dubai & Northern Emirates
                  </p>
                  <div className="flex items-center gap-4 mt-3 text-[11px] text-slate-300 font-medium pt-2 border-t border-white/10">
                    <a href={`tel:${(siteSettings.phone || "+971 2 565 0123").replace(/[^0-9+]/g, '')}`} className="flex items-center gap-1 hover:text-white transition-colors">
                      <Phone size={12} className="text-[#2596be]" /> {siteSettings.phone || "+971 2 565 0123"}
                    </a>
                    <a href={`mailto:${siteSettings.email || "info@cooltechuae.com"}`} className="flex items-center gap-1 hover:text-white transition-colors">
                      <Mail size={12} className="text-[#2596be]" /> {siteSettings.email || "info@cooltechuae.com"}
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Textual Overview Breakdown */}
            <div className="lg:col-span-7 space-y-6">
              <div>
                <span className="text-[10px] bg-blue-50 text-[#2596be] font-black uppercase tracking-widest px-3 py-1 rounded-full border border-blue-100">
                  Company Overview
                </span>
                <h2 className="text-2xl sm:text-4xl font-black text-[#031b4e] uppercase tracking-tight mt-3">
                  Who We Are & What We Do
                </h2>
              </div>

              <div className="space-y-4 text-slate-600 text-sm sm:text-base leading-relaxed">
                <p className="font-semibold text-slate-800">
                  Established in Abu Dhabi in 2012, <strong>Cool Technologies LLC</strong> has established itself as one of the UAE’s premier wholesale distributors of industrial cooling equipment, commercial temperature control appliances, and HVAC systems.
                </p>
                <p>
                  Representing more than <strong>30 leading global manufacturers</strong>, our extensive portfolio covers air conditioners, commercial water coolers, water tank chillers, and related appliances. We provide complete <strong>supply, installation, and maintenance services</strong>, giving our clients a single, dependable partner for all their cooling needs.
                </p>
                <p className="p-4 bg-blue-50/60 rounded-2xl border border-blue-100 text-[#031b4e] font-medium text-sm">
                  Alongside our distribution business, we manufacture and market our own signature brand, <strong className="font-black text-[#2596be]">COOLTECH</strong>, offering water coolers and water tank chillers engineered specifically for high performance, rugged durability, and long-term value under demanding Middle East climates.
                </p>
              </div>

              {/* 4 Strategic Overview Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                
                {/* Expertise */}
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 hover:border-blue-300 transition-colors">
                  <div className="flex items-center gap-2.5 mb-1.5">
                    <div className="w-8 h-8 rounded-lg bg-blue-100 text-[#031b4e] flex items-center justify-center shrink-0">
                      <Wrench size={16} />
                    </div>
                    <h3 className="font-extrabold text-xs text-[#031b4e] uppercase tracking-wider">Our Expertise</h3>
                  </div>
                  <p className="text-xs text-slate-600 font-medium leading-relaxed">
                    Technically and professionally qualified, dedicated staff with deep industry experience. Well-organized and systematic industry experts providing customized technical assistance.
                  </p>
                </div>

                {/* Experience */}
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 hover:border-blue-300 transition-colors">
                  <div className="flex items-center gap-2.5 mb-1.5">
                    <div className="w-8 h-8 rounded-lg bg-blue-100 text-[#031b4e] flex items-center justify-center shrink-0">
                      <Clock size={16} />
                    </div>
                    <h3 className="font-extrabold text-xs text-[#031b4e] uppercase tracking-wider">Our Experience</h3>
                  </div>
                  <p className="text-xs text-slate-600 font-medium leading-relaxed">
                    14+ years in the region catering to major landmark projects including Dubai Expo 2020, The Legoland, Abu Dhabi International Airport, Etihad Railway, and ADNOC oil field operations.
                  </p>
                </div>

                {/* Industries */}
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 hover:border-blue-300 transition-colors">
                  <div className="flex items-center gap-2.5 mb-1.5">
                    <div className="w-8 h-8 rounded-lg bg-blue-100 text-[#031b4e] flex items-center justify-center shrink-0">
                      <Building2 size={16} />
                    </div>
                    <h3 className="font-extrabold text-xs text-[#031b4e] uppercase tracking-wider">Our Industries</h3>
                  </div>
                  <p className="text-xs text-slate-600 font-medium leading-relaxed">
                    Building, infrastructure, industrial and oil field constructions, labour accommodation camps, schools, hospitals, government institutions, and Rulers' private departments.
                  </p>
                </div>

                {/* Market Presence */}
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 hover:border-blue-300 transition-colors">
                  <div className="flex items-center gap-2.5 mb-1.5">
                    <div className="w-8 h-8 rounded-lg bg-blue-100 text-[#031b4e] flex items-center justify-center shrink-0">
                      <Globe size={16} />
                    </div>
                    <h3 className="font-extrabold text-xs text-[#031b4e] uppercase tracking-wider">Market Presence</h3>
                  </div>
                  <p className="text-xs text-slate-600 font-medium leading-relaxed">
                    Comprehensive coverage across all Emirates of the U.A.E.: Abu Dhabi, Al Ain, Dubai, and Northern Emirates (Sharjah, Ajman, RAK, Fujairah & UAQ).
                  </p>
                </div>

              </div>

            </div>

          </div>

        </div>
      </section>

      {/* -------------------------------------------------
          3. PROPRIETARY BRAND SPOTLIGHT: COOLTECH
      ------------------------------------------------- */}
      <section className="py-16 bg-gradient-to-b from-slate-50 to-white border-b border-slate-200" id="cooltech-brand-section">
        <div className="max-w-7xl mx-auto px-4">

          <div className="bg-[#031b4e] text-white rounded-3xl p-8 sm:p-12 relative overflow-hidden shadow-xl border border-blue-900">
            {/* Background Graphic Accents */}
            <div className="absolute -right-20 -bottom-20 w-96 h-96 bg-[#2596be]/20 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -left-20 -top-20 w-80 h-80 bg-blue-600/10 rounded-full blur-2xl pointer-events-none" />

            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              
              <div className="lg:col-span-8 space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-400/10 border border-cyan-400/30 text-cyan-300 text-xs font-black uppercase tracking-widest">
                  <Droplet size={14} className="text-cyan-400" />
                  <span>Our In-House Manufactured Brand</span>
                </div>

                <h2 className="text-2xl sm:text-4xl font-black uppercase tracking-tight text-white">
                  COOLTECH <span className="text-[#2596be]">Water Coolers & Tank Chillers</span>
                </h2>

                <p className="text-slate-300 text-sm sm:text-base leading-relaxed font-normal">
                  In addition to our wholesale distribution of global brands, we manufacture and market our own specialized line of <strong className="text-white font-bold">COOLTECH</strong> products. Designed from the ground up to excel in the UAE's high-ambient climate, COOLTECH delivers industrial-grade cooling, hygiene, and outstanding reliability.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-4 backdrop-blur-xs">
                    <p className="text-xs font-black text-cyan-300 uppercase tracking-wider">Engineered for UAE</p>
                    <p className="text-xs text-slate-300 mt-1">Built specifically for peak Middle East summer temperatures up to +52°C.</p>
                  </div>
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-4 backdrop-blur-xs">
                    <p className="text-xs font-black text-cyan-300 uppercase tracking-wider">Durability & Value</p>
                    <p className="text-xs text-slate-300 mt-1">Food-grade stainless steel tanks, anti-corrosive coils, and robust compressors.</p>
                  </div>
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-4 backdrop-blur-xs">
                    <p className="text-xs font-black text-cyan-300 uppercase tracking-wider">Factory Backed</p>
                    <p className="text-xs text-slate-300 mt-1">Complete supply, certified installation, preventative maintenance, and genuine spare parts.</p>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-4 flex flex-col items-center justify-center text-center p-6 bg-white/5 rounded-2xl border border-white/10">
                <div className="w-16 h-16 rounded-2xl bg-[#2596be] flex items-center justify-center text-white mb-3 shadow-lg">
                  <Droplet size={32} />
                </div>
                <h3 className="text-xl font-black text-white uppercase tracking-tight">COOLTECH</h3>
                <p className="text-xs text-blue-200 mt-1 font-semibold uppercase tracking-wider">
                  The Science of Cooling
                </p>
                <div className="h-px bg-white/10 w-full my-4"></div>
                <p className="text-xs text-slate-300 leading-relaxed mb-4">
                  Explore our range of heavy-duty water coolers, multi-tap drinking stations, and rooftop water tank chillers.
                </p>
                <button
                  onClick={() => handleNavigateCategory("water-coolers")}
                  className="w-full bg-[#2596be] hover:bg-[#1d7fa3] text-white font-bold text-xs uppercase tracking-wider py-3 rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <span>Explore COOLTECH Units</span>
                  <ArrowRight size={14} />
                </button>
              </div>

            </div>
          </div>

        </div>
      </section>

      {/* -------------------------------------------------
          4. MAJOR LANDMARK PROJECTS & TRACK RECORD
      ------------------------------------------------- */}
      <section className="py-16 bg-white border-b border-slate-100" id="projects-section">
        <div className="max-w-7xl mx-auto px-4">

          <div className="text-center max-w-3xl mx-auto mb-12">
            <span className="text-[10px] bg-blue-50 text-[#2596be] font-black uppercase tracking-widest px-3 py-1 rounded-full border border-blue-100">
              Proven Track Record
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-[#031b4e] uppercase tracking-tight mt-3">
              Major Projects & Regional Experience
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 font-semibold mt-2">
              Over 14+ years in the region, Cool Technologies has proudly catered to prestigious mega-projects across the UAE.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {MAJOR_PROJECTS.map((proj, idx) => (
              <div
                key={idx}
                className="bg-slate-50 rounded-3xl p-7 border border-slate-200/80 hover:border-blue-300 hover:shadow-lg transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full bg-blue-100 text-[#031b4e]">
                      {proj.tag}
                    </span>
                    <span className="text-[11px] font-mono text-slate-400 font-bold">
                      0{idx + 1}
                    </span>
                  </div>

                  <h3 className="text-lg font-black text-[#031b4e] uppercase tracking-tight group-hover:text-[#2596be] transition-colors">
                    {proj.name}
                  </h3>
                  <p className="text-xs font-bold text-[#2596be] mt-1 mb-3">
                    {proj.client}
                  </p>
                  <p className="text-xs text-slate-600 font-medium leading-relaxed">
                    {proj.description}
                  </p>
                </div>

                <div className="pt-4 mt-6 border-t border-slate-200/80 flex items-center justify-between text-xs text-slate-500 font-semibold">
                  <span>Scope: Supply, Installation & Maintenance</span>
                  <CheckCircle2 size={15} className="text-[#2596be]" />
                </div>
              </div>
            ))}

            {/* View Our Solutions Card */}
            <div className="bg-[#031b4e] text-white rounded-3xl p-7 flex flex-col justify-between border border-blue-900 shadow-md">
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full bg-blue-500/20 text-cyan-300 border border-cyan-400/30">
                  Solutions
                </span>
                <h3 className="text-xl font-black text-white uppercase tracking-tight mt-4">
                  View Our Solutions
                </h3>
              </div>

              <div className="space-y-3 mt-6">
                <button
                  onClick={() => {
                    window.location.hash = "#/products";
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  className="w-full bg-[#2596be] hover:bg-[#1d7fa3] text-white text-xs font-bold uppercase tracking-wider py-3 px-4 rounded-xl transition-colors cursor-pointer text-center"
                >
                  Products
                </button>
                <button
                  onClick={() => {
                    window.location.hash = "#/services";
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  className="w-full bg-white/10 hover:bg-[#2596be] text-white text-xs font-bold uppercase tracking-wider py-3 px-4 rounded-xl transition-colors cursor-pointer text-center border border-white/15"
                >
                  Services
                </button>
                <button
                  onClick={() => {
                    window.location.hash = "#/spare-parts";
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  className="w-full bg-white/10 hover:bg-[#2596be] text-white text-xs font-bold uppercase tracking-wider py-3 px-4 rounded-xl transition-colors cursor-pointer text-center border border-white/15"
                >
                  Spare Parts
                </button>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* -------------------------------------------------
          5. VISION & MISSION
      ------------------------------------------------- */}
      <section className="py-16 bg-slate-50 border-b border-slate-200" id="vision-mission-section">
        <div className="max-w-7xl mx-auto px-4">

          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-[11px] font-bold text-[#2596be] uppercase tracking-widest px-3 py-1 bg-blue-50/80 rounded-full border border-blue-100/80">
              Strategic Foundation
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#031b4e] uppercase tracking-tight mt-3">
              Vision & Mission
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* Vision Card */}
            <div className="bg-white rounded-3xl p-8 border border-slate-200/90 hover:border-blue-300 transition-all shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 text-[#031b4e] flex items-center justify-center shrink-0">
                  <Eye size={24} className="text-[#2596be]" />
                </div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider px-3 py-1 rounded-full bg-blue-100 text-[#031b4e]">
                  Our Vision
                </span>
              </div>

              <div>
                <h3 className="text-lg sm:text-xl font-bold text-[#031b4e] uppercase tracking-tight">
                  The UAE's Most Trusted Name in Cooling
                </h3>
                <p className="text-slate-600 text-sm leading-relaxed font-normal mt-3">
                  &ldquo;To be the UAE’s most trusted name and leading distributor in cooling solutions, and a respected regional brand in water cooling technology, recognized for exceptional quality products, operational reliability, and lasting customer relationships.&rdquo;
                </p>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center gap-2 text-xs text-slate-500 font-medium">
                <CheckCircle2 size={15} className="text-[#2596be] shrink-0" />
                <span>Known for quality, reliability, and service excellence across the UAE</span>
              </div>
            </div>

            {/* Mission Card */}
            <div className="bg-white rounded-3xl p-8 border border-slate-200/90 hover:border-blue-300 transition-all shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 text-[#031b4e] flex items-center justify-center shrink-0">
                  <Target size={24} className="text-[#2596be]" />
                </div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider px-3 py-1 rounded-full bg-blue-100 text-[#031b4e]">
                  Our Mission
                </span>
              </div>

              <div>
                <h3 className="text-lg sm:text-xl font-bold text-[#031b4e] uppercase tracking-tight">
                  Reliable Performance & Year-Round Comfort
                </h3>
                <p className="text-slate-600 text-sm leading-relaxed font-normal mt-3">
                  &ldquo;To deliver reliable, energy-efficient cooling solutions through our wide range of 30+ leading brands and our own COOLTECH water coolers and water tank chillers, backed by professional supply, installation, and dependable maintenance services that keep our customers comfortable year-round.&rdquo;
                </p>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center gap-2 text-xs text-slate-500 font-medium">
                <CheckCircle2 size={15} className="text-[#2596be] shrink-0" />
                <span>Dependable after-sales support meeting the UAE’s demanding climate</span>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* -------------------------------------------------
          6. CORE VALUES: QUALITY, SATISFACTION, RELIABILITY
      ------------------------------------------------- */}
      <section className="py-16 bg-white border-b border-slate-100" id="commitment-section">
        <div className="max-w-7xl mx-auto px-4">

          <div className="text-center max-w-3xl mx-auto mb-12">
            <span className="text-[10px] bg-blue-50 text-[#2596be] font-black uppercase tracking-widest px-3 py-1 rounded-full border border-blue-100">
              Core Principles
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-[#031b4e] uppercase tracking-tight mt-3">
              Quality, Satisfaction & Reliability
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 font-semibold mt-2">
              Our business is anchored on uncompromising standards, complete transparency, and steadfast execution.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

            {/* Quality */}
            <div className="bg-slate-50 p-6 rounded-3xl border border-slate-200/90 shadow-2xs space-y-3 hover:border-blue-300 transition-colors">
              <div className="w-11 h-11 rounded-2xl bg-blue-100 text-[#031b4e] flex items-center justify-center">
                <ShieldCheck size={22} className="text-[#2596be]" />
              </div>
              <h3 className="font-black text-sm text-[#031b4e] uppercase tracking-wide">Quality</h3>
              <p className="text-xs text-slate-600 font-medium leading-relaxed">
                We supply only products that meet high standards of performance and durability. Every unit is factory-inspected and supplied with genuine manufacturer protection.
              </p>
            </div>

            {/* Customer Satisfaction */}
            <div className="bg-slate-50 p-6 rounded-3xl border border-slate-200/90 shadow-2xs space-y-3 hover:border-blue-300 transition-colors">
              <div className="w-11 h-11 rounded-2xl bg-blue-100 text-[#031b4e] flex items-center justify-center">
                <ThumbsUp size={22} className="text-[#2596be]" />
              </div>
              <h3 className="font-black text-sm text-[#031b4e] uppercase tracking-wide">Customer Satisfaction</h3>
              <p className="text-xs text-slate-600 font-medium leading-relaxed">
                Transparency in dealings, clarity in communications, and prompt professional & technical assistance. We tailor solutions to meet and exceed each customer’s unique expectations.
              </p>
            </div>

            {/* Reliability */}
            <div className="bg-slate-50 p-6 rounded-3xl border border-slate-200/90 shadow-2xs space-y-3 hover:border-blue-300 transition-colors">
              <div className="w-11 h-11 rounded-2xl bg-blue-100 text-[#031b4e] flex items-center justify-center">
                <Clock size={22} className="text-[#2596be]" />
              </div>
              <h3 className="font-black text-sm text-[#031b4e] uppercase tracking-wide">Reliability</h3>
              <p className="text-xs text-slate-600 font-medium leading-relaxed">
                We deliver on time and stand behind our work. Our clients rely on our dependable project timelines, robust supply chains, and dedicated after-sales coverage.
              </p>
            </div>

            {/* Professional Expertise */}
            <div className="bg-slate-50 p-6 rounded-3xl border border-slate-200/90 shadow-2xs space-y-3 hover:border-blue-300 transition-colors">
              <div className="w-11 h-11 rounded-2xl bg-blue-100 text-[#031b4e] flex items-center justify-center">
                <Wrench size={22} className="text-[#2596be]" />
              </div>
              <h3 className="font-black text-sm text-[#031b4e] uppercase tracking-wide">Industry Expertise</h3>
              <p className="text-xs text-slate-600 font-medium leading-relaxed">
                Technically and professionally qualified staff with extensive sector experience. Well-organized and systematic engineers dedicated to precision HVAC execution.
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* -------------------------------------------------
          7. INDUSTRIES WE SERVE
      ------------------------------------------------- */}
      <section className="py-16 bg-slate-50 border-b border-slate-200" id="industries-section">
        <div className="max-w-7xl mx-auto px-4">

          <div className="text-center max-w-3xl mx-auto mb-12">
            <span className="text-[10px] bg-blue-50 text-[#2596be] font-black uppercase tracking-widest px-3 py-1 rounded-full border border-blue-100">
              Sector Specialization
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-[#031b4e] uppercase tracking-tight mt-3">
              Industries We Serve
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 font-semibold mt-2">
              Delivering specialized climate control systems, water chillers, and appliances tailored to strict sector specifications.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">

            <div className="p-6 rounded-3xl bg-white border border-slate-200/90 space-y-3 hover:border-blue-300 hover:shadow-md transition-all">
              <div className="w-11 h-11 rounded-2xl bg-blue-50 text-[#031b4e] flex items-center justify-center">
                <Building2 size={22} className="text-[#2596be]" />
              </div>
              <h3 className="font-black text-sm text-[#031b4e] uppercase tracking-wider">Building & Commercial</h3>
              <p className="text-xs text-slate-600 font-medium leading-relaxed">
                Commercial towers, corporate offices, shopping malls, retail centers, and residential developments across the UAE.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-white border border-slate-200/90 space-y-3 hover:border-blue-300 hover:shadow-md transition-all">
              <div className="w-11 h-11 rounded-2xl bg-blue-50 text-[#031b4e] flex items-center justify-center">
                <Landmark size={22} className="text-[#2596be]" />
              </div>
              <h3 className="font-black text-sm text-[#031b4e] uppercase tracking-wider">Infrastructure & Rail</h3>
              <p className="text-xs text-slate-600 font-medium leading-relaxed">
                National rail networks (Etihad Rail), transport terminals, airports, and major civic utility projects.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-white border border-slate-200/90 space-y-3 hover:border-blue-300 hover:shadow-md transition-all">
              <div className="w-11 h-11 rounded-2xl bg-blue-50 text-[#031b4e] flex items-center justify-center">
                <Factory size={22} className="text-[#2596be]" />
              </div>
              <h3 className="font-black text-sm text-[#031b4e] uppercase tracking-wider">Industrial & Oil Fields</h3>
              <p className="text-xs text-slate-600 font-medium leading-relaxed">
                Industrial plants, process water chilling, and ADNOC oil field construction sites with high ambient heat protection.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-white border border-slate-200/90 space-y-3 hover:border-blue-300 hover:shadow-md transition-all">
              <div className="w-11 h-11 rounded-2xl bg-blue-50 text-[#031b4e] flex items-center justify-center">
                <Warehouse size={22} className="text-[#2596be]" />
              </div>
              <h3 className="font-black text-sm text-[#031b4e] uppercase tracking-wider">Labour Camps & Staff Housing</h3>
              <p className="text-xs text-slate-600 font-medium leading-relaxed">
                High-volume drinking water stations, centralized water coolers, and heavy-duty AC units for worker accommodation facilities.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-white border border-slate-200/90 space-y-3 hover:border-blue-300 hover:shadow-md transition-all">
              <div className="w-11 h-11 rounded-2xl bg-blue-50 text-[#031b4e] flex items-center justify-center">
                <GraduationCap size={22} className="text-[#2596be]" />
              </div>
              <h3 className="font-black text-sm text-[#031b4e] uppercase tracking-wider">Schools & Universities</h3>
              <p className="text-xs text-slate-600 font-medium leading-relaxed">
                Safe drinking water coolers, institutional HVAC systems, and hygienic water treatment for educational campuses.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-white border border-slate-200/90 space-y-3 hover:border-blue-300 hover:shadow-md transition-all">
              <div className="w-11 h-11 rounded-2xl bg-blue-50 text-[#031b4e] flex items-center justify-center">
                <Hospital size={22} className="text-[#2596be]" />
              </div>
              <h3 className="font-black text-sm text-[#031b4e] uppercase tracking-wider">Hospitals & Healthcare</h3>
              <p className="text-xs text-slate-600 font-medium leading-relaxed">
                Sanitary drinking systems, climate control for healthcare clinics, medical facilities, and specialized cooling.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-white border border-slate-200/90 space-y-3 hover:border-blue-300 hover:shadow-md transition-all">
              <div className="w-11 h-11 rounded-2xl bg-blue-50 text-[#031b4e] flex items-center justify-center">
                <Building size={22} className="text-[#2596be]" />
              </div>
              <h3 className="font-black text-sm text-[#031b4e] uppercase tracking-wider">Government Institutions</h3>
              <p className="text-xs text-slate-600 font-medium leading-relaxed">
                Municipal headquarters, public infrastructure departments, civil service buildings, and defense installations.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-white border border-slate-200/90 space-y-3 hover:border-blue-300 hover:shadow-md transition-all">
              <div className="w-11 h-11 rounded-2xl bg-blue-50 text-[#031b4e] flex items-center justify-center">
                <CrownIcon />
              </div>
              <h3 className="font-black text-sm text-[#031b4e] uppercase tracking-wider">Rulers' Private Departments</h3>
              <p className="text-xs text-slate-600 font-medium leading-relaxed">
                Prestigious private estates, royal palaces, VIP hospitality projects, and private government sectors.
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* -------------------------------------------------
          8. COMPANY STORY (Growth Journey Timeline)
      ------------------------------------------------- */}
      <section className="py-16 bg-white border-b border-slate-100" id="story-section">
        <div className="max-w-7xl mx-auto px-4">

          <div className="text-center max-w-3xl mx-auto mb-12">
            <span className="text-[10px] bg-blue-50 text-[#2596be] font-black uppercase tracking-widest px-3 py-1 rounded-full border border-blue-100">
              Corporate Journey
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-[#031b4e] uppercase tracking-tight mt-3">
              Company Story & Growth Journey
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 font-semibold mt-2">
              Explore key historical milestones from our founding in 2012 to becoming an award-winning UAE climate control distributor.
            </p>
          </div>

          {/* Interactive Timeline Tabs / Cards */}
          {milestones.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <p className="font-bold text-sm">No timeline milestones available.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

              {/* Timeline Selection List */}
              <div className="lg:col-span-5 space-y-2 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                {milestones.map((m, idx) => {
                  const isActive = activeTimelineIdx === idx;
                  return (
                    <button
                      key={m.id || `${m.year}-${idx}`}
                      onClick={() => setActiveTimelineIdx(idx)}
                      className={`w-full text-left p-4 rounded-2xl border transition-all cursor-pointer flex items-center gap-4 ${isActive
                          ? "bg-[#031b4e] text-white border-[#031b4e] shadow-md translate-x-1"
                          : "bg-white text-slate-700 border-slate-200 hover:border-blue-300 hover:bg-blue-50/50"
                        }`}
                    >
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-mono font-black text-xs shrink-0 ${isActive ? "bg-[#2596be] text-white" : "bg-slate-100 text-slate-800"
                        }`}>
                        {m.year}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`font-black text-xs uppercase tracking-tight truncate ${isActive ? "text-white" : "text-[#031b4e]"}`}>
                          {m.title}
                        </p>
                        <p className={`text-[11px] truncate ${isActive ? "text-blue-200" : "text-slate-400"}`}>
                          {m.subtitle || m.description}
                        </p>
                      </div>
                      <ChevronRight size={16} className={isActive ? "text-blue-300" : "text-slate-300"} />
                    </button>
                  );
                })}
              </div>

              {/* Timeline Milestone Display Box */}
              <div className="lg:col-span-7">
                {milestones[activeTimelineIdx] && (
                  <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-md h-full flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between pb-6 border-b border-slate-100 mb-6">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center">
                            {getTimelineIcon(milestones[activeTimelineIdx].iconName, milestones[activeTimelineIdx].color)}
                          </div>
                          <div>
                            <span className="font-mono text-2xl font-black text-[#2596be]">
                              {milestones[activeTimelineIdx].year}
                            </span>
                            <h3 className="font-black text-lg text-[#031b4e] uppercase tracking-tight">
                              {milestones[activeTimelineIdx].title}
                            </h3>
                          </div>
                        </div>
                        <span className="text-[10px] bg-slate-100 text-slate-600 font-extrabold uppercase tracking-widest px-3 py-1 rounded-full">
                          Milestone {activeTimelineIdx + 1} of {milestones.length}
                        </span>
                      </div>

                      <p className="text-slate-600 font-semibold text-sm sm:text-base leading-relaxed mb-6">
                        {milestones[activeTimelineIdx].description}
                      </p>

                      <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 space-y-2">
                        <p className="text-[10px] text-blue-700 font-extrabold uppercase tracking-widest">
                          Key Highlights & Impact
                        </p>
                        <ul className="text-xs text-slate-600 font-medium space-y-1.5">
                          {milestones[activeTimelineIdx].dealerships && milestones[activeTimelineIdx].dealerships!.length > 0 ? (
                            milestones[activeTimelineIdx].dealerships!.map((d, dIdx) => (
                              <li key={dIdx} className="flex items-center gap-2">
                                <CheckCircle2 size={13} className="text-[#2596be] shrink-0" />
                                <span>{d}</span>
                              </li>
                            ))
                          ) : (
                            <>
                              <li className="flex items-center gap-2">
                                <CheckCircle2 size={13} className="text-[#2596be] shrink-0" />
                                <span>Direct OEM backing and compliance with Gulf ambient temperatures (+52°C)</span>
                              </li>
                              <li className="flex items-center gap-2">
                                <CheckCircle2 size={13} className="text-[#2596be] shrink-0" />
                                <span>Guaranteed manufacturer warranty and rapid spare parts availability</span>
                              </li>
                            </>
                          )}
                        </ul>
                      </div>
                    </div>

                    <div className="pt-6 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400 font-medium">
                      <span>Cool Technologies UAE Corporate Archive</span>
                      <button
                        onClick={() => setActiveTimelineIdx((prev) => (prev + 1) % milestones.length)}
                        className="text-[#2596be] font-bold hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <span>Next Milestone</span>
                        <ArrowRight size={13} />
                      </button>
                    </div>

                  </div>
                )}
              </div>

            </div>
          )}

        </div>
      </section>

      {/* -------------------------------------------------
          9. AWARDS & RECOGNITION (OEM Excellence)
      ------------------------------------------------- */}
      <section className="py-16 bg-slate-50 border-b border-slate-200" id="awards-section">
        <div className="max-w-7xl mx-auto px-4">

          <div className="text-center max-w-3xl mx-auto mb-12">
            <span className="text-[10px] bg-blue-50 text-[#2596be] font-black uppercase tracking-widest px-3 py-1 rounded-full border border-blue-100">
              Industry Honors
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-[#031b4e] uppercase tracking-tight mt-3">
              Awards & OEM Recognition
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 font-semibold mt-2">
              Recognized by premier global manufacturers for distribution volume, technical excellence, and after-sales support in the UAE.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">

            {/* 1. Blue Star Award */}
            <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden space-y-4 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 rounded-2xl bg-blue-950 text-white flex items-center justify-center">
                <Award size={24} />
              </div>
              <div>
                <span className="font-mono text-[#2596be] text-xs font-black">2025 RECOGNITION</span>
                <h3 className="font-black text-lg text-[#031b4e] uppercase tracking-tight mt-1">
                  Blue Star Best Performance Award
                </h3>
              </div>
              <p className="text-xs text-slate-600 font-medium leading-relaxed">
                Awarded the Blue Star Best Performance Award 2025 for outstanding distribution volume and expanding authorized dealerships with HISENSE, TCL HVAC, and KELON cooling platforms.
              </p>
            </div>

            {/* 2. Clivet Award */}
            <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden space-y-4 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 rounded-2xl bg-sky-600 text-white flex items-center justify-center">
                <Trophy size={24} />
              </div>
              <div>
                <span className="font-mono text-[#2596be] text-xs font-black">2024 RECOGNITION</span>
                <h3 className="font-black text-lg text-[#031b4e] uppercase tracking-tight mt-1">
                  Clivet Best Performer Award
                </h3>
              </div>
              <p className="text-xs text-slate-600 font-medium leading-relaxed">
                Honored with the Clivet Best Performer Award 2024 in recognition of exceptional commercial HVAC equipment supply, project delivery, and high-efficiency chiller engineering across the UAE.
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* -------------------------------------------------
          10. BRAND PARTNERS
      ------------------------------------------------- */}
      <section className="py-16 bg-white border-b border-slate-100" id="partners-section">
        <div className="max-w-7xl mx-auto px-4">

          <div className="text-center max-w-3xl mx-auto mb-12">
            <span className="text-[10px] bg-blue-50 text-[#2596be] font-black uppercase tracking-widest px-3 py-1 rounded-full border border-blue-100">
              OEM Network
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-[#031b4e] uppercase tracking-tight mt-3">
              Our 30+ Global Brand Partners
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 font-semibold mt-2">
              Direct master distributor and authorized dealership network across leading global manufacturers.
            </p>
          </div>

          <div className="w-full flex justify-center">
            <div className="rounded-2xl overflow-hidden border border-slate-200/80 shadow-md bg-white p-2 sm:p-4 max-w-6xl w-full">
              <img
                src={main1Image}
                alt="Cool Technologies Global Brand Partners Network"
                className="w-full h-auto object-contain rounded-xl"
              />
            </div>
          </div>

        </div>
      </section>

      {/* -------------------------------------------------
          11. STATISTICS SECTION (Minimal Clean Grid)
      ------------------------------------------------- */}
      <section className="py-12 bg-slate-50/80 border-y border-slate-200/80" id="metrics-section">
        <div className="max-w-7xl mx-auto px-4">

          <div className="grid grid-cols-2 md:grid-cols-5 gap-6 text-center divide-y md:divide-y-0 md:divide-x divide-slate-200">

            <div className="pt-4 md:pt-0">
              <span className="font-mono text-3xl sm:text-4xl font-extrabold text-[#031b4e]">{yearsInBusiness}+</span>
              <p className="text-xs font-bold text-slate-800 uppercase tracking-wider mt-1">Years Experience</p>
              <p className="text-[11px] text-slate-500 font-medium mt-0.5">Established in 2012</p>
            </div>

            <div className="pt-4 md:pt-0">
              <span className="font-mono text-3xl sm:text-4xl font-extrabold text-[#031b4e]">30+</span>
              <p className="text-xs font-bold text-slate-800 uppercase tracking-wider mt-1">Brand Partners</p>
              <p className="text-[11px] text-slate-500 font-medium mt-0.5">Authorized Global OEMs</p>
            </div>

            <div className="pt-4 md:pt-0">
              <span className="font-mono text-3xl sm:text-4xl font-extrabold text-[#031b4e]">COOLTECH</span>
              <p className="text-xs font-bold text-slate-800 uppercase tracking-wider mt-1">In-House Brand</p>
              <p className="text-[11px] text-slate-500 font-medium mt-0.5">Water Coolers & Chillers</p>
            </div>

            <div className="pt-4 md:pt-0">
              <span className="font-mono text-3xl sm:text-4xl font-extrabold text-[#031b4e]">7 Emirates</span>
              <p className="text-xs font-bold text-slate-800 uppercase tracking-wider mt-1">Market Presence</p>
              <p className="text-[11px] text-slate-500 font-medium mt-0.5">Nationwide UAE Coverage</p>
            </div>

            <div className="pt-4 md:pt-0 col-span-2 md:col-span-1">
              <span className="font-mono text-3xl sm:text-4xl font-extrabold text-[#2596be]">100%</span>
              <p className="text-xs font-bold text-slate-800 uppercase tracking-wider mt-1">Dedicated Service</p>
              <p className="text-[11px] text-slate-500 font-medium mt-0.5">Dependable Support</p>
            </div>

          </div>

        </div>
      </section>

      {/* -------------------------------------------------
          12. CALL TO ACTION
      ------------------------------------------------- */}
      <section className="py-16 bg-white" id="cta-section">
        <div className="max-w-7xl mx-auto px-4">

          <div className="bg-slate-50 rounded-2xl p-8 sm:p-12 border border-slate-200/90 shadow-2xs">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">

              <div className="lg:col-span-8 space-y-3">
                <span className="text-[11px] font-bold text-[#2596be] uppercase tracking-wider px-3 py-1 bg-blue-50/80 rounded-full border border-blue-100/80">
                  Engineering Desk Support
                </span>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-[#031b4e] uppercase tracking-tight pt-1">
                  Need Commercial Cooling Solutions? <br />
                  <span className="text-[#2596be]">Contact Our Engineering Experts Today.</span>
                </h2>
                <p className="text-slate-600 text-xs sm:text-sm leading-relaxed max-w-2xl font-normal">
                  Whether you require wholesale commercial air conditioning pricing, specialized COOLTECH water coolers and tank chillers, or turnkey supply, installation, and maintenance across any Emirate, our qualified team is ready to assist.
                </p>

                {/* Direct Contact Handles */}
                <div className="flex flex-wrap items-center gap-6 pt-2 text-xs sm:text-sm font-semibold text-slate-700">
                  <a href={`tel:${siteSettings.phone.replace(/[^0-9+]/g, '')}`} className="flex items-center gap-2 hover:text-[#2596be] transition-colors">
                    <Phone size={15} className="text-[#2596be]" />
                    <span>{siteSettings.phone}</span>
                  </a>
                  <a href={`mailto:${siteSettings.email}`} className="flex items-center gap-2 hover:text-[#2596be] transition-colors">
                    <Mail size={15} className="text-[#2596be]" />
                    <span>{siteSettings.email}</span>
                  </a>
                  <a
                    href={`https://wa.me/${siteSettings.whatsapp.replace(/[^0-9]/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 hover:text-[#2596be] transition-colors"
                  >
                    <MessageSquare size={15} className="text-[#2596be]" />
                    <span>WhatsApp: {siteSettings.whatsapp}</span>
                  </a>
                </div>
              </div>

              <div className="lg:col-span-4 flex flex-col sm:flex-row lg:flex-col gap-3">
                <button
                  onClick={() => {
                    if (onCategorySelect) onCategorySelect(null);
                    window.location.hash = "#/products";
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  className="w-full bg-[#031b4e] hover:bg-[#2596be] text-white font-bold text-xs uppercase tracking-wider py-3.5 px-6 rounded-xl shadow-xs transition-colors cursor-pointer flex items-center justify-center gap-2"
                >
                  <Package size={15} />
                  <span>Visit Our Products</span>
                </button>

                <a
                  href={`https://wa.me/${siteSettings.whatsapp.replace(/[^0-9]/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full bg-white hover:bg-slate-100 text-[#031b4e] border border-slate-300 font-bold text-xs uppercase tracking-wider py-3.5 px-6 rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-2"
                >
                  <MessageSquare size={15} className="text-[#2596be]" />
                  <span>Chat on WhatsApp</span>
                </a>

                <button
                  onClick={() => {
                    if (onOpenLogin) {
                      onOpenLogin("signup");
                    } else {
                      window.location.hash = "#/retailer-application";
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }
                  }}
                  className="text-xs text-slate-500 hover:text-[#2596be] font-bold text-center pt-1 transition-colors cursor-pointer"
                >
                  Looking for trade terms? <span className="underline">Sign Up for an Account</span> &rarr;
                </button>
              </div>

            </div>
          </div>

        </div>
      </section>

    </div>
  );
}

// Small icon helper for royal / private departments
function CrownIcon() {
  return (
    <svg className="w-5 h-5 text-[#2596be]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m2 4 3 12h14l3-12-6 7-4-7-4 7-6-7zm3 16h14" />
    </svg>
  );
}
