import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { 
  Building, ShieldCheck, Award, Zap, HeartHandshake, 
  Settings, Star, Compass, ArrowRight, CheckCircle2, ChevronRight, ChevronDown, Trophy,
  Target, Eye, Phone, Mail, MessageSquare, MapPin, Users, Package, Layers,
  Activity, ExternalLink, Sparkles, Clock, Globe, Wrench, Droplet, Wind,
  Thermometer, Briefcase, GraduationCap, Hospital, Home, HardHat, Warehouse,
  Building2, Factory, Utensils, Hotel, Check, Shield, ThumbsUp, Truck
} from "lucide-react";

// @ts-ignore
import hqImage from "../assets/images/cool_tech_hq_1784538496855.jpg";
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

export default function AboutPage({ onOpenQuote, onCategorySelect }: AboutPageProps) {
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
          1. HERO SECTION (Large corporate banner)
      ------------------------------------------------- */}
      <section className="relative bg-[#031b4e] text-white overflow-hidden py-16 lg:py-24 border-b border-slate-800">
        {/* Industrial Background Image with Gradient Overlay */}
        <div className="absolute inset-0 z-0 opacity-25">
          <img 
            src={heroBanner} 
            alt="Industrial Cooling Infrastructure" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#031b4e] via-[#031b4e]/90 to-[#0a3154]/80"></div>
        </div>

        {/* Decorative Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-20 pointer-events-none z-0" />

        <div className="max-w-7xl mx-auto px-4 relative z-10">
          
          {/* Professional Breadcrumb */}
          <nav className="flex items-center gap-2 text-xs font-semibold text-blue-200/80 mb-6 uppercase tracking-wider">
            <button 
              onClick={() => {
                window.location.hash = "#/";
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              className="hover:text-white transition-colors cursor-pointer flex items-center gap-1"
            >
              Home
            </button>
            <ChevronRight size={12} className="text-blue-400" />
            <span className="text-white font-black">About Us</span>
          </nav>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            
            {/* Left Main Hero Text */}
            <div className="lg:col-span-8 space-y-6">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-blue-500/10 border border-blue-400/30 text-blue-300 text-xs font-black uppercase tracking-widest backdrop-blur-md">
                <Sparkles size={13} className="text-blue-400" />
                <span>Established 2012 • Abu Dhabi, UAE</span>
              </div>

              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white uppercase tracking-tight leading-none">
                About <span className="text-[#2596be]">Cool Technologies</span>
              </h1>

              <p className="text-slate-300 text-base sm:text-lg leading-relaxed font-normal max-w-3xl">
                Cool Technologies LLC is the United Arab Emirates' leading authorized distributor and B2B engineering partner for industrial climate control systems, heavy water chillers, commercial VRF air conditioning, and wholesale cooling equipment.
              </p>
            </div>

            {/* Right Trust Stat Card */}
            <div className="lg:col-span-4 hidden lg:block">
              <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-6 text-white space-y-5">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-[#2596be] flex items-center justify-center text-white shrink-0 shadow-md">
                    <Building size={28} />
                  </div>
                  <div>
                    <p className="text-3xl font-black text-white leading-none">{yearsInBusiness}+ Years</p>
                    <p className="text-xs text-blue-200 font-bold uppercase tracking-wider mt-1">UAE Market Leadership</p>
                  </div>
                </div>

                <div className="h-px bg-white/10 w-full"></div>

                <div className="space-y-2.5 text-xs text-slate-300">
                  <div className="flex items-center gap-2 font-medium">
                    <CheckCircle2 size={14} className="text-[#2596be] shrink-0" />
                    <span>30+ Authorized Global OEM Brands</span>
                  </div>
                  <div className="flex items-center gap-2 font-medium">
                    <CheckCircle2 size={14} className="text-[#2596be] shrink-0" />
                    <span>Proprietary <strong>COOLTECH</strong> Water Coolers</span>
                  </div>
                  <div className="flex items-center gap-2 font-medium">
                    <CheckCircle2 size={14} className="text-[#2596be] shrink-0" />
                    <span>ISO 9001:2015 Registered Supplier</span>
                  </div>
                  <div className="flex items-center gap-2 font-medium">
                    <CheckCircle2 size={14} className="text-[#2596be] shrink-0" />
                    <span>Mussafah Industrial Logistics Facility</span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* -------------------------------------------------
          2. COMPANY OVERVIEW
      ------------------------------------------------- */}
      <section className="py-16 bg-white border-b border-slate-100" id="overview-section">
        <div className="max-w-7xl mx-auto px-4">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left HQ Image & Overlaid Badge */}
            <div className="lg:col-span-5 relative">
              <div className="relative rounded-3xl overflow-hidden shadow-xl border border-slate-200 bg-slate-100 group">
                <img 
                  src={hqImage} 
                  alt="Cool Technologies Headquarters Abu Dhabi" 
                  className="w-full h-[420px] object-cover group-hover:scale-105 transition-transform duration-700"
                />
                
                {/* Floating Badge */}
                <div className="absolute bottom-6 left-6 right-6 bg-[#031b4e]/95 backdrop-blur-md text-white p-5 rounded-2xl border border-white/10 shadow-xl">
                  <p className="text-[10px] text-blue-400 font-black uppercase tracking-widest">Headquarters & Logistics</p>
                  <p className="text-sm font-bold text-white mt-1">Plot-99, M42, Mussafah Industrial, Abu Dhabi, UAE</p>
                  <div className="flex items-center gap-4 mt-3 text-[11px] text-slate-300 font-medium">
                    <span className="flex items-center gap-1"><Phone size={12} className="text-[#2596be]" /> +971 2 555 1234</span>
                    <span className="flex items-center gap-1"><Mail size={12} className="text-[#2596be]" /> info@cooltechuae.com</span>
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

              <p className="text-slate-600 text-sm sm:text-base leading-relaxed font-semibold">
                Founded in the Emirate of Abu Dhabi in 2012, Cool Technologies LLC has established itself as one of the premier suppliers of industrial cooling equipment, commercial temperature control appliances, and HVAC systems in the United Arab Emirates. Over {yearsInBusiness} years of dedicated service, we have partnered with over 30 leading global manufacturers to supply high-performance climate systems to individuals, large-scale industrial plants, and government institutions.
              </p>

              {/* 4 Overview Pillar Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:border-blue-200 transition-colors">
                  <div className="flex items-center gap-2.5 mb-1.5">
                    <div className="w-8 h-8 rounded-lg bg-blue-100 text-[#031b4e] flex items-center justify-center shrink-0">
                      <Wrench size={16} />
                    </div>
                    <h3 className="font-extrabold text-xs text-[#031b4e] uppercase tracking-wider">Our Expertise</h3>
                  </div>
                  <p className="text-xs text-slate-500 font-medium leading-relaxed">
                    Direct factory wholesale sourcing, VRF multi-zone ACs, water chillers, and 24/7 overhauling.
                  </p>
                </div>

                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:border-blue-200 transition-colors">
                  <div className="flex items-center gap-2.5 mb-1.5">
                    <div className="w-8 h-8 rounded-lg bg-blue-100 text-[#031b4e] flex items-center justify-center shrink-0">
                      <Clock size={16} />
                    </div>
                    <h3 className="font-extrabold text-xs text-[#031b4e] uppercase tracking-wider">Our Experience</h3>
                  </div>
                  <p className="text-xs text-slate-500 font-medium leading-relaxed">
                    {yearsInBusiness}+ years of industrial climate control leadership across UAE and GCC territories.
                  </p>
                </div>

                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:border-blue-200 transition-colors">
                  <div className="flex items-center gap-2.5 mb-1.5">
                    <div className="w-8 h-8 rounded-lg bg-blue-100 text-[#031b4e] flex items-center justify-center shrink-0">
                      <Building2 size={16} />
                    </div>
                    <h3 className="font-extrabold text-xs text-[#031b4e] uppercase tracking-wider">Our Industries</h3>
                  </div>
                  <p className="text-xs text-slate-500 font-medium leading-relaxed">
                    Government civil infrastructure, labor camps, commercial towers, healthcare, and manufacturing.
                  </p>
                </div>

                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:border-blue-200 transition-colors">
                  <div className="flex items-center gap-2.5 mb-1.5">
                    <div className="w-8 h-8 rounded-lg bg-blue-100 text-[#031b4e] flex items-center justify-center shrink-0">
                      <Globe size={16} />
                    </div>
                    <h3 className="font-extrabold text-xs text-[#031b4e] uppercase tracking-wider">Market Presence</h3>
                  </div>
                  <p className="text-xs text-slate-500 font-medium leading-relaxed">
                    Headquartered in Abu Dhabi with express distribution networks across Dubai, Sharjah & GCC.
                  </p>
                </div>
              </div>

            </div>

          </div>

        </div>
      </section>

      {/* -------------------------------------------------
          3. COMPANY STORY (Dynamic Timeline Style)
      ------------------------------------------------- */}
      <section className="py-16 bg-slate-50 border-b border-slate-200" id="story-section">
        <div className="max-w-7xl mx-auto px-4">
          
          <div className="text-center max-w-3xl mx-auto mb-12">
            <span className="text-[10px] bg-blue-50 text-[#2596be] font-black uppercase tracking-widest px-3 py-1 rounded-full border border-blue-100">
              Corporate Journey
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-[#031b4e] uppercase tracking-tight mt-3">
              Company Story & Growth Journey
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 font-semibold mt-2">
              Explore key historical milestones from our inception in 2012 to becoming an award-winning UAE climate control distributor.
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
                      className={`w-full text-left p-4 rounded-2xl border transition-all cursor-pointer flex items-center gap-4 ${
                        isActive
                          ? "bg-[#031b4e] text-white border-[#031b4e] shadow-md translate-x-1"
                          : "bg-white text-slate-700 border-slate-200 hover:border-blue-300 hover:bg-blue-50/50"
                      }`}
                    >
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-mono font-black text-xs shrink-0 ${
                        isActive ? "bg-[#2596be] text-white" : "bg-slate-100 text-slate-800"
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
                                <span>Guaranteed warranty coverage and rapid spare parts availability</span>
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
          4. VISION & MISSION (Minimal & Clean Light Cards)
      ------------------------------------------------- */}
      <section className="py-16 bg-white border-b border-slate-100" id="vision-mission-section">
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
            <div className="bg-slate-50/70 rounded-2xl p-7 border border-slate-200/80 hover:border-blue-300 transition-all shadow-2xs space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-blue-100/80 text-[#031b4e] flex items-center justify-center shrink-0">
                  <Eye size={20} />
                </div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded bg-blue-100/60 text-blue-800">
                  Our Vision
                </span>
              </div>

              <div>
                <h3 className="text-lg sm:text-xl font-bold text-[#031b4e] uppercase tracking-tight">
                  GCC Leadership in Climate Technology
                </h3>
                <p className="text-slate-600 text-sm leading-relaxed font-normal mt-2">
                  "To be the undisputed leader in B2B climate technology procurement within the GCC, bridging global OEM excellence with local engineering execution, and pioneering sustainable, low-GWP refrigerant initiatives."
                </p>
              </div>

              <div className="pt-3 border-t border-slate-200/60 flex items-center gap-2 text-xs text-slate-500 font-medium">
                <CheckCircle2 size={14} className="text-[#2596be] shrink-0" />
                <span>Pioneering low-GWP & energy efficient HVAC solutions</span>
              </div>
            </div>

            {/* Mission Card */}
            <div className="bg-slate-50/70 rounded-2xl p-7 border border-slate-200/80 hover:border-blue-300 transition-all shadow-2xs space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-slate-200/80 text-[#031b4e] flex items-center justify-center shrink-0">
                  <Target size={20} />
                </div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded bg-slate-200/60 text-slate-800">
                  Our Mission
                </span>
              </div>

              <div>
                <h3 className="text-lg sm:text-xl font-bold text-[#031b4e] uppercase tracking-tight">
                  Reliable High-Ambient Performance
                </h3>
                <p className="text-slate-600 text-sm leading-relaxed font-normal mt-2">
                  "To design, source, and deliver reliable, energy-efficient temperature control systems that withstand the high ambient conditions of the Gulf region, guaranteeing maximum uptime and operational efficiency for every client."
                </p>
              </div>

              <div className="pt-3 border-t border-slate-200/60 flex items-center gap-2 text-xs text-slate-500 font-medium">
                <CheckCircle2 size={14} className="text-[#2596be] shrink-0" />
                <span>Tested & verified for extreme Gulf temperatures (+52°C)</span>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* -------------------------------------------------
          5. OUR COMMITMENT
      ------------------------------------------------- */}
      <section className="py-16 bg-slate-50 border-b border-slate-200" id="commitment-section">
        <div className="max-w-7xl mx-auto px-4">
          
          <div className="text-center max-w-3xl mx-auto mb-12">
            <span className="text-[10px] bg-blue-50 text-[#2596be] font-black uppercase tracking-widest px-3 py-1 rounded-full border border-blue-100">
              Core Corporate Values
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-[#031b4e] uppercase tracking-tight mt-3">
              Our Commitment
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 font-semibold mt-2">
              Built on 7 fundamental pillars of engineering integrity, quality assurance, and customer trust.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3 hover:shadow-md transition-shadow">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#2596be] flex items-center justify-center">
                <ShieldCheck size={20} />
              </div>
              <h3 className="font-black text-sm text-[#031b4e] uppercase tracking-wide">Quality</h3>
              <p className="text-xs text-slate-500 font-medium leading-relaxed">
                ISO 9001:2015 certified quality control. Every unit is factory-inspected and supplied with genuine manufacturer protection.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3 hover:shadow-md transition-shadow">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#2596be] flex items-center justify-center">
                <ThumbsUp size={20} />
              </div>
              <h3 className="font-black text-sm text-[#031b4e] uppercase tracking-wide">Customer Satisfaction</h3>
              <p className="text-xs text-slate-500 font-medium leading-relaxed">
                Dedicated B2B account managers, transparent quotes, and tailored estimates for every mechanical contractor.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3 hover:shadow-md transition-shadow">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#2596be] flex items-center justify-center">
                <Award size={20} />
              </div>
              <h3 className="font-black text-sm text-[#031b4e] uppercase tracking-wide">Professionalism</h3>
              <p className="text-xs text-slate-500 font-medium leading-relaxed">
                In-house mechanical engineers and factory-trained technicians adhering strictly to ASHRAE standards.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3 hover:shadow-md transition-shadow">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#2596be] flex items-center justify-center">
                <Zap size={20} />
              </div>
              <h3 className="font-black text-sm text-[#031b4e] uppercase tracking-wide">Innovation</h3>
              <p className="text-xs text-slate-500 font-medium leading-relaxed">
                Integrating inverter VRF technology, variable speed chillers, and smart digital thermostatic controls.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3 hover:shadow-md transition-shadow">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#2596be] flex items-center justify-center">
                <HeartHandshake size={20} />
              </div>
              <h3 className="font-black text-sm text-[#031b4e] uppercase tracking-wide">Integrity</h3>
              <p className="text-xs text-slate-500 font-medium leading-relaxed">
                Honest wholesale pricing, authentic OEM parts, and straightforward commercial SLAs without hidden terms.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3 hover:shadow-md transition-shadow">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#2596be] flex items-center justify-center">
                <Clock size={20} />
              </div>
              <h3 className="font-black text-sm text-[#031b4e] uppercase tracking-wide">Reliability</h3>
              <p className="text-xs text-slate-500 font-medium leading-relaxed">
                24/7 service desk dispatch, rapid LTL freight delivery, and rapid warranty replacement turnaround.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3 hover:shadow-md transition-shadow md:col-span-2">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <Sparkles size={20} />
              </div>
              <h3 className="font-black text-sm text-[#031b4e] uppercase tracking-wide">Environmental Responsibility</h3>
              <p className="text-xs text-slate-500 font-medium leading-relaxed">
                Promoting low global warming potential (low-GWP) eco-refrigerants, high SEER/COP energy efficiency ratios, and thermal performance audits to lower carbon footprints across the UAE.
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* -------------------------------------------------
          6. WHY CHOOSE COOL TECHNOLOGIES
      ------------------------------------------------- */}
      <section className="py-16 bg-white border-b border-slate-100" id="why-choose-section">
        <div className="max-w-7xl mx-auto px-4">
          
          <div className="text-center max-w-3xl mx-auto mb-12">
            <span className="text-[10px] bg-blue-50 text-[#2596be] font-black uppercase tracking-widest px-3 py-1 rounded-full border border-blue-100">
              Competitive Advantage
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-[#031b4e] uppercase tracking-tight mt-3">
              Why Choose Cool Technologies
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 font-semibold mt-2">
              Verified facts and advantages based directly on our corporate profile.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            
            <div className="p-6 rounded-3xl bg-slate-50 border border-slate-200 hover:border-blue-300 transition-all space-y-3">
              <span className="font-mono text-2xl font-black text-[#2596be]">14+ Years</span>
              <h3 className="font-black text-sm text-[#031b4e] uppercase tracking-wider">Market Experience</h3>
              <p className="text-xs text-slate-500 font-medium leading-relaxed">
                Established in Abu Dhabi in 2012, serving UAE climate control markets for over a decade.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-slate-50 border border-slate-200 hover:border-blue-300 transition-all space-y-3">
              <span className="font-mono text-2xl font-black text-[#2596be]">30+ Brands</span>
              <h3 className="font-black text-sm text-[#031b4e] uppercase tracking-wider">Global OEM Partners</h3>
              <p className="text-xs text-slate-500 font-medium leading-relaxed">
                Official partnerships with Daikin, Midea, Panasonic, Mitsubishi, LG, Samsung, York, Carrier & Blue Star.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-slate-50 border border-slate-200 hover:border-blue-300 transition-all space-y-3">
              <span className="font-mono text-2xl font-black text-[#2596be]">Industrial</span>
              <h3 className="font-black text-sm text-[#031b4e] uppercase tracking-wider">HVAC & Chiller Expertise</h3>
              <p className="text-xs text-slate-500 font-medium leading-relaxed">
                Specialized in heavy industrial water chillers, VRF multi-zone systems, and central water cooling plants.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-slate-50 border border-slate-200 hover:border-blue-300 transition-all space-y-3">
              <span className="font-mono text-2xl font-black text-[#2596be]">Certified</span>
              <h3 className="font-black text-sm text-[#031b4e] uppercase tracking-wider">Mechanical Technicians</h3>
              <p className="text-xs text-slate-500 font-medium leading-relaxed">
                In-house mechanical engineers and factory-trained service teams for installation and maintenance.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-slate-50 border border-slate-200 hover:border-blue-300 transition-all space-y-3">
              <span className="font-mono text-2xl font-black text-[#2596be]">24/7 Desk</span>
              <h3 className="font-black text-sm text-[#031b4e] uppercase tracking-wider">Fast Response SLA</h3>
              <p className="text-xs text-slate-500 font-medium leading-relaxed">
                Dedicated emergency service desk and rapid LTL freight dispatch across all 7 Emirates.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-slate-50 border border-slate-200 hover:border-blue-300 transition-all space-y-3">
              <span className="font-mono text-2xl font-black text-[#2596be]">Bespoke</span>
              <h3 className="font-black text-sm text-[#031b4e] uppercase tracking-wider">Customized Solutions</h3>
              <p className="text-xs text-slate-500 font-medium leading-relaxed">
                Tailored engineering estimates, duct sound attenuator fabrication, and capacity calculations.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-slate-50 border border-slate-200 hover:border-blue-300 transition-all space-y-3">
              <span className="font-mono text-2xl font-black text-[#2596be]">Civil & B2B</span>
              <h3 className="font-black text-sm text-[#031b4e] uppercase tracking-wider">Gov & Industrial Projects</h3>
              <p className="text-xs text-slate-500 font-medium leading-relaxed">
                Trusted contractor for civil developments, military camps, labor housing, and industrial zones.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-slate-50 border border-slate-200 hover:border-blue-300 transition-all space-y-3">
              <span className="font-mono text-2xl font-black text-[#2596be]">Guaranteed</span>
              <h3 className="font-black text-sm text-[#031b4e] uppercase tracking-wider">After-Sales Support</h3>
              <p className="text-xs text-slate-500 font-medium leading-relaxed">
                Annual PPM maintenance contracts, genuine spare parts inventory, and pump overhaul coverage.
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* -------------------------------------------------
          INDUSTRIES WE SERVE
      ------------------------------------------------- */}
      <section className="py-16 bg-white border-b border-slate-100" id="industries-section">
        <div className="max-w-7xl mx-auto px-4">
          
          <div className="text-center max-w-3xl mx-auto mb-12">
            <span className="text-[10px] bg-blue-50 text-[#2596be] font-black uppercase tracking-widest px-3 py-1 rounded-full border border-blue-100">
              Sector Specialization
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-[#031b4e] uppercase tracking-tight mt-3">
              Industries We Serve
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 font-semibold mt-2">
              Delivering specialized climate control systems tailored to strict sector requirements.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 hover:border-blue-300 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-blue-100 text-[#031b4e] flex items-center justify-center">
                <Factory size={20} />
              </div>
              <h3 className="font-black text-sm text-[#031b4e] uppercase tracking-wider">Industrial</h3>
              <p className="text-xs text-slate-500 font-medium leading-relaxed">
                Manufacturing plants, process cooling, chemical facilities, warehouses, and logistics centers.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 hover:border-blue-300 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-blue-100 text-[#031b4e] flex items-center justify-center">
                <Building2 size={20} />
              </div>
              <h3 className="font-black text-sm text-[#031b4e] uppercase tracking-wider">Commercial</h3>
              <p className="text-xs text-slate-500 font-medium leading-relaxed">
                Corporate office towers, shopping malls, trade centers, showrooms, and retail complexes.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 hover:border-blue-300 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-blue-100 text-[#031b4e] flex items-center justify-center">
                <Building size={20} />
              </div>
              <h3 className="font-black text-sm text-[#031b4e] uppercase tracking-wider">Government</h3>
              <p className="text-xs text-slate-500 font-medium leading-relaxed">
                Public civil infrastructure, military bases, municipal buildings, and governmental facilities.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 hover:border-blue-300 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-blue-100 text-[#031b4e] flex items-center justify-center">
                <Hospital size={20} />
              </div>
              <h3 className="font-black text-sm text-[#031b4e] uppercase tracking-wider">Healthcare</h3>
              <p className="text-xs text-slate-500 font-medium leading-relaxed">
                Hospitals, pharmaceutical cold chains, medical research labs, and sterile cleanrooms.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 hover:border-blue-300 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-blue-100 text-[#031b4e] flex items-center justify-center">
                <GraduationCap size={20} />
              </div>
              <h3 className="font-black text-sm text-[#031b4e] uppercase tracking-wider">Education</h3>
              <p className="text-xs text-slate-500 font-medium leading-relaxed">
                Universities, public and private schools, technical institutes, and research campuses.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 hover:border-blue-300 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-blue-100 text-[#031b4e] flex items-center justify-center">
                <Hotel size={20} />
              </div>
              <h3 className="font-black text-sm text-[#031b4e] uppercase tracking-wider">Hospitality</h3>
              <p className="text-xs text-slate-500 font-medium leading-relaxed">
                Luxury hotel resorts, restaurants, catering kitchens, banquet halls, and leisure venues.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 hover:border-blue-300 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-blue-100 text-[#031b4e] flex items-center justify-center">
                <Home size={20} />
              </div>
              <h3 className="font-black text-sm text-[#031b4e] uppercase tracking-wider">Residential</h3>
              <p className="text-xs text-slate-500 font-medium leading-relaxed">
                Luxury residential villas, high-rise residential towers, and housing developments.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 hover:border-blue-300 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-blue-100 text-[#031b4e] flex items-center justify-center">
                <HardHat size={20} />
              </div>
              <h3 className="font-black text-sm text-[#031b4e] uppercase tracking-wider">Construction</h3>
              <p className="text-xs text-slate-500 font-medium leading-relaxed">
                Labor accommodation camps, temporary site offices, and heavy construction developments.
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* -------------------------------------------------
          9. AWARDS & RECOGNITION
      ------------------------------------------------- */}
      <section className="py-16 bg-slate-50 border-b border-slate-200" id="awards-section">
        <div className="max-w-7xl mx-auto px-4">
          
          <div className="text-center max-w-3xl mx-auto mb-12">
            <span className="text-[10px] bg-blue-50 text-[#2596be] font-black uppercase tracking-widest px-3 py-1 rounded-full border border-blue-100">
              Honors & Certifications
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-[#031b4e] uppercase tracking-tight mt-3">
              Awards & Recognition
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 font-semibold mt-2">
              Recognized by premier global OEMs for distribution excellence and technical performance in the UAE.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
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
                Honored with the Clivet Best Performer Award 2024 in recognition of exceptional commercial HVAC equipment supply, project delivery, and high-efficiency chiller engineering.
              </p>
            </div>

            {/* 3. ISO Certification */}
            <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden space-y-4 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 rounded-2xl bg-[#2596be] text-white flex items-center justify-center">
                <ShieldCheck size={24} />
              </div>
              <div>
                <span className="font-mono text-[#2596be] text-xs font-black">QUALITY CERTIFICATION</span>
                <h3 className="font-black text-lg text-[#031b4e] uppercase tracking-tight mt-1">
                  ISO 9001:2015 Quality Management
                </h3>
              </div>
              <p className="text-xs text-slate-600 font-medium leading-relaxed">
                Formally registered and certified under ISO 9001:2015 guidelines for quality management in HVAC equipment procurement, warehousing, and technical engineering services.
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
              <span className="font-mono text-3xl sm:text-4xl font-extrabold text-[#031b4e]">14+</span>
              <p className="text-xs font-bold text-slate-800 uppercase tracking-wider mt-1">Years Experience</p>
              <p className="text-[11px] text-slate-500 font-medium mt-0.5">Established in 2012</p>
            </div>

            <div className="pt-4 md:pt-0">
              <span className="font-mono text-3xl sm:text-4xl font-extrabold text-[#031b4e]">30+</span>
              <p className="text-xs font-bold text-slate-800 uppercase tracking-wider mt-1">Brand Partners</p>
              <p className="text-[11px] text-slate-500 font-medium mt-0.5">Authorized OEMs</p>
            </div>

            <div className="pt-4 md:pt-0">
              <span className="font-mono text-3xl sm:text-4xl font-extrabold text-[#031b4e]">1,200+</span>
              <p className="text-xs font-bold text-slate-800 uppercase tracking-wider mt-1">Product Catalog</p>
              <p className="text-[11px] text-slate-500 font-medium mt-0.5">ACs, Chillers & Parts</p>
            </div>

            <div className="pt-4 md:pt-0">
              <span className="font-mono text-3xl sm:text-4xl font-extrabold text-[#031b4e]">5,000+</span>
              <p className="text-xs font-bold text-slate-800 uppercase tracking-wider mt-1">Completed Projects</p>
              <p className="text-[11px] text-slate-500 font-medium mt-0.5">Across UAE & GCC</p>
            </div>

            <div className="pt-4 md:pt-0 col-span-2 md:col-span-1">
              <span className="font-mono text-3xl sm:text-4xl font-extrabold text-[#2596be]">99.4%</span>
              <p className="text-xs font-bold text-slate-800 uppercase tracking-wider mt-1">Client Satisfaction</p>
              <p className="text-[11px] text-slate-500 font-medium mt-0.5">Guaranteed Service SLA</p>
            </div>

          </div>

        </div>
      </section>

      {/* -------------------------------------------------
          12. CALL TO ACTION (Minimal Clean Section)
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
                  Need Cooling Solutions? <br />
                  <span className="text-[#2596be]">Contact Our Experts Today.</span>
                </h2>
                <p className="text-slate-600 text-xs sm:text-sm leading-relaxed max-w-2xl font-normal">
                  Whether you require wholesale VRF pricing, a customized industrial water chiller estimate, or 24/7 emergency overhauling dispatch in Abu Dhabi or Dubai, our certified mechanical engineers are ready to assist.
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
                  onClick={handleOpenGeneralQuote}
                  className="w-full bg-[#031b4e] hover:bg-[#2596be] text-white font-bold text-xs uppercase tracking-wider py-3.5 px-6 rounded-xl shadow-xs transition-colors cursor-pointer flex items-center justify-center gap-2"
                >
                  <MessageSquare size={15} />
                  <span>Request Engineering Quote</span>
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
              </div>

            </div>
          </div>

        </div>
      </section>

    </div>
  );
}
