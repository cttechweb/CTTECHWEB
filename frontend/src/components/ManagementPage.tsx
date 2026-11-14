import React, { useState, useEffect } from "react";
import { 
  Building, ShieldCheck, Award, Zap, HeartHandshake, 
  Settings, Star, Compass, ArrowRight, CheckCircle2, ChevronRight, ChevronDown, Trophy,
  Target, Eye, Phone, Mail, MessageSquare, MapPin, Users, Package, Layers,
  Activity, ExternalLink, Sparkles, Clock, Globe, Wrench, Droplet, Wind,
  Thermometer, Briefcase, GraduationCap, HardHat, Warehouse,
  Building2, Factory, Check, Shield, ThumbsUp, Truck, Linkedin,
  Cpu, Network, Lightbulb, ShieldAlert, BarChart3, Rocket, UserCheck
} from "lucide-react";

// @ts-ignore
import hqImage from "../assets/images/cool_tech_hq_1784538496855.jpg?v=2";
// @ts-ignore
import heroBanner from "../assets/images/hvac_hero_banner_1784350809012.jpg";
// @ts-ignore
import chillerImage from "../assets/images/hvac_chiller_1784350873395.jpg";
// @ts-ignore
import ceoImage from "../assets/images/management/muhammed_shamseer_ceo.jpg";
// @ts-ignore
import cooImage from "../assets/images/management/muhammed_shereef_coo.jpg";

import { getGeneralSettings } from "../services/generalSettingsService";

interface ManagementPageProps {
  onOpenQuote?: (prefilledProduct?: string) => void;
  onOpenCareer?: () => void;
}

export interface DirectorProfile {
  id: string;
  name: string;
  designation: string;
  image: string;
}

// Executive Directors (Official Data)
const EXECUTIVE_DIRECTORS: DirectorProfile[] = [
  {
    id: "dir-1",
    name: "MUHAMMED SHAMSEER",
    designation: "Chief Executive Officer (CEO)",
    image: ceoImage
  },
  {
    id: "dir-2",
    name: "MUHAMMED SHEREEF",
    designation: "Chief Operating Officer (COO)",
    image: cooImage
  }
];

// Leadership Values (Clean, no ISO)
const LEADERSHIP_VALUES = [
  {
    title: "Innovation",
    description: "Pioneering eco-refrigerants, energy-efficient inverter platforms, and engineering our proprietary COOLTECH water cooling solutions for extreme UAE summers.",
    icon: <Lightbulb className="text-[#2596be]" size={22} />,
    tag: "Future Ready"
  },
  {
    title: "Integrity",
    description: "Uncompromising price transparency, authentic OEM equipment warranties, and straightforward commercial terms with zero hidden conditions.",
    icon: <ShieldCheck className="text-[#2596be]" size={22} />,
    tag: "100% Transparent"
  },
  {
    title: "Professionalism",
    description: "In-house technically qualified engineers and dedicated specialists delivering systematic execution to strict industry standards.",
    icon: <Award className="text-[#2596be]" size={22} />,
    tag: "Industry Certified"
  },
  {
    title: "Quality",
    description: "Every cooling unit, water cooler, and chiller undergoes rigorous factory inspection and multi-stage testing before client dispatch.",
    icon: <Shield className="text-[#2596be]" size={22} />,
    tag: "High Standards"
  },
  {
    title: "Customer Focus",
    description: "Direct executive accountability, tailored engineering proposals, and dedicated account support for contractors, institutions, and corporate buyers.",
    icon: <HeartHandshake className="text-[#2596be]" size={22} />,
    tag: "Customer First"
  },
  {
    title: "Technical Excellence",
    description: "Deep engineering expertise across central chillers, VRF air conditioning, custom water coolers, and commercial refrigeration.",
    icon: <Cpu className="text-[#2596be]" size={22} />,
    tag: "Engineering Acumen"
  }
];

// Management Responsibilities
const MANAGEMENT_RESPONSIBILITIES = [
  {
    title: "Strategic Planning",
    description: "Long-term regional expansion, market forecasting, sustainable cooling initiatives, and global OEM partnerships.",
    icon: <Target className="text-[#2596be]" size={20} />
  },
  {
    title: "Nationwide Operations",
    description: "Managing our comprehensive logistics and distribution fleet across all 7 Emirates with rapid dispatch fulfillment.",
    icon: <Warehouse className="text-[#2596be]" size={20} />
  },
  {
    title: "Wholesale Distribution",
    description: "Direct B2B wholesale channels, contractor terms, and high-volume commercial equipment procurement.",
    icon: <BarChart3 className="text-[#2596be]" size={20} />
  },
  {
    title: "Project Execution",
    description: "Overseeing turnkey HVAC supply, site installation coordination, commissioning, and safety compliance.",
    icon: <HardHat className="text-[#2596be]" size={20} />
  },
  {
    title: "Engineering & Sizing",
    description: "System capacity sizing calculations, multi-zone VRF layout coordination, and tailored technical consulting.",
    icon: <Wrench className="text-[#2596be]" size={20} />
  },
  {
    title: "Customer Relations",
    description: "Managing corporate client accounts, prompt quotations, and resolving technical queries with high SLA adherence.",
    icon: <UserCheck className="text-[#2596be]" size={20} />
  },
  {
    title: "Quality Assurance",
    description: "Rigorous factory inspection protocols, genuine OEM warranty backing, and continuous defect prevention.",
    icon: <ShieldCheck className="text-[#2596be]" size={20} />
  },
  {
    title: "After-Sales & Maintenance",
    description: "Preventative Maintenance Contracts (PPM), emergency technical response, and genuine spare parts availability.",
    icon: <Clock className="text-[#2596be]" size={20} />
  }
];

// Company Culture Pillars
const CULTURE_PILLARS = [
  {
    title: "Teamwork & Collaboration",
    description: "Cross-functional synergy between technical engineers, logistics coordinators, and client managers to ensure smooth project delivery.",
    icon: <Users className="text-[#2596be]" size={20} />
  },
  {
    title: "Professional Development",
    description: "Continuous OEM factory training, technical skill upgrades, and leadership mentorship programs for all personnel.",
    icon: <GraduationCap className="text-[#2596be]" size={20} />
  },
  {
    title: "Safety & Compliance (HSE)",
    description: "Uncompromising health, safety, and environmental protocols compliant with UAE civil defense and municipal regulations.",
    icon: <ShieldAlert className="text-[#2596be]" size={20} />
  },
  {
    title: "Customer Commitment",
    description: "Empowering teams at all levels to solve client challenges swiftly with direct executive backing and clear accountability.",
    icon: <ThumbsUp className="text-[#2596be]" size={20} />
  },
  {
    title: "Continuous Learning",
    description: "Regular technical workshops on UAE high-ambient energy codes, sustainability standards, and advanced inverter HVAC technologies.",
    icon: <Sparkles className="text-[#2596be]" size={20} />
  },
  {
    title: "Pioneering Innovation",
    description: "Field-driven feedback loops continuously refining our proprietary COOLTECH water cooling and tank chiller product lines.",
    icon: <Zap className="text-[#2596be]" size={20} />
  }
];

export default function ManagementPage({ onOpenQuote, onOpenCareer }: ManagementPageProps) {
  const [siteSettings, setSiteSettings] = useState(() => getGeneralSettings());

  useEffect(() => {
    const loadSettings = () => {
      setSiteSettings(getGeneralSettings());
    };
    window.addEventListener("cooltech_settings_updated", loadSettings);
    window.addEventListener("cooltech_contact_settings_updated", loadSettings);
    window.addEventListener("storage", loadSettings);
    return () => {
      window.removeEventListener("cooltech_settings_updated", loadSettings);
      window.removeEventListener("cooltech_contact_settings_updated", loadSettings);
      window.removeEventListener("storage", loadSettings);
    };
  }, []);

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const handleOpenGeneralQuote = () => {
    if (onOpenQuote) {
      onOpenQuote("General Executive Inquiry - Management Page");
    }
  };

  return (
    <div className="w-full bg-[#f8fafc] text-slate-800 animate-fade-in font-sans">
      
      {/* -------------------------------------------------
          1. MINIMAL HERO SECTION (Clean White Background)
      ------------------------------------------------- */}
      <section className="bg-white border-b border-slate-200 py-10 sm:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Breadcrumb Navigation */}
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
            <span className="text-[#031b4e] font-bold uppercase tracking-wider">Management</span>
          </nav>

          <div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#031b4e] tracking-tight uppercase font-sans">
              Management
            </h1>
            <p className="text-slate-600 text-xs sm:text-sm md:text-base font-normal mt-3 max-w-3xl leading-relaxed">
              Leadership that drives innovation, operational discipline, quality distribution, and lasting customer relationships across the United Arab Emirates.
            </p>
          </div>

        </div>
      </section>

      {/* -------------------------------------------------
          2. MANAGEMENT INTRODUCTION
      ------------------------------------------------- */}
      <section className="py-16 bg-white border-b border-slate-100" id="intro-section">
        <div className="max-w-7xl mx-auto px-4">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Image / Visual Card */}
            <div className="lg:col-span-5 relative">
              <div className="relative rounded-3xl overflow-hidden shadow-xl border border-slate-200 bg-slate-100 group">
                <img 
                  src={hqImage} 
                  alt="Cool Technologies Headquarters Abu Dhabi" 
                  className="w-full h-[420px] object-cover group-hover:scale-105 transition-transform duration-700"
                />
                
                <div className="absolute inset-0 bg-gradient-to-t from-[#031b4e]/90 via-transparent to-transparent"></div>

                <div className="absolute bottom-6 left-6 right-6 text-white space-y-2">
                  <div className="flex items-center gap-2">
                    <Truck size={14} className="text-cyan-400" />
                    <span className="text-[10px] text-blue-300 font-black uppercase tracking-widest">
                      Nationwide Operations
                    </span>
                  </div>
                  <h3 className="text-lg font-black uppercase tracking-tight text-white">
                    Executive Operational Command
                  </h3>
                  <p className="text-xs text-slate-200 font-medium leading-normal">
                    Directing wholesale climate control distribution, specialized COOLTECH manufacturing, and reliable technical execution across the UAE.
                  </p>
                </div>
              </div>
            </div>

            {/* Right Editorial Breakdown */}
            <div className="lg:col-span-7 space-y-6">
              <div>
                <span className="text-[10px] bg-blue-50 text-[#2596be] font-black uppercase tracking-widest px-3 py-1 rounded-full border border-blue-100">
                  Management Introduction
                </span>
                <h2 className="text-2xl sm:text-4xl font-black text-[#031b4e] uppercase tracking-tight mt-3">
                  Leadership Philosophy & Strategic Vision
                </h2>
              </div>

              <p className="text-slate-600 text-sm sm:text-base leading-relaxed font-semibold">
                At Cool Technologies LLC, our management structure is built around a single unifying mandate: delivering dependable, energy-efficient cooling solutions engineered specifically for the extreme ambient temperature conditions (+52°C) of the Arabian Gulf.
              </p>

              {/* 4 Core Intro Pillars */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 hover:border-blue-300 transition-colors">
                  <div className="flex items-center gap-2.5 mb-1.5">
                    <div className="w-8 h-8 rounded-lg bg-blue-100 text-[#031b4e] flex items-center justify-center shrink-0">
                      <Target size={16} />
                    </div>
                    <h3 className="font-extrabold text-xs text-[#031b4e] uppercase tracking-wider">Leadership Philosophy</h3>
                  </div>
                  <p className="text-xs text-slate-600 font-medium leading-relaxed">
                    Engineering-led governance, direct executive accountability, and lasting long-term partnerships with our clients and brand principals.
                  </p>
                </div>

                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 hover:border-blue-300 transition-colors">
                  <div className="flex items-center gap-2.5 mb-1.5">
                    <div className="w-8 h-8 rounded-lg bg-blue-100 text-[#031b4e] flex items-center justify-center shrink-0">
                      <HeartHandshake size={16} />
                    </div>
                    <h3 className="font-extrabold text-xs text-[#031b4e] uppercase tracking-wider">Customer-First Approach</h3>
                  </div>
                  <p className="text-xs text-slate-600 font-medium leading-relaxed">
                    Transparency in dealings, clarity in communications, customized proposals, and tailored solutions exceeding customer expectations.
                  </p>
                </div>

                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 hover:border-blue-300 transition-colors">
                  <div className="flex items-center gap-2.5 mb-1.5">
                    <div className="w-8 h-8 rounded-lg bg-blue-100 text-[#031b4e] flex items-center justify-center shrink-0">
                      <Zap size={16} />
                    </div>
                    <h3 className="font-extrabold text-xs text-[#031b4e] uppercase tracking-wider">Pioneering Innovation</h3>
                  </div>
                  <p className="text-xs text-slate-600 font-medium leading-relaxed">
                    Manufacturing proprietary COOLTECH water coolers and tank chillers built for unmatched durability, performance, and value.
                  </p>
                </div>

                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 hover:border-blue-300 transition-colors">
                  <div className="flex items-center gap-2.5 mb-1.5">
                    <div className="w-8 h-8 rounded-lg bg-blue-100 text-[#031b4e] flex items-center justify-center shrink-0">
                      <Award size={16} />
                    </div>
                    <h3 className="font-extrabold text-xs text-[#031b4e] uppercase tracking-wider">Professional Excellence</h3>
                  </div>
                  <p className="text-xs text-slate-600 font-medium leading-relaxed">
                    Technically qualified and dedicated staff operating with systematic organization, strict quality inspection, and dependable execution.
                  </p>
                </div>

              </div>

            </div>

          </div>

        </div>
      </section>

      {/* -------------------------------------------------
          3. DIRECTORS (Official Leadership)
      ------------------------------------------------- */}
      <section className="py-16 bg-slate-50 border-b border-slate-200" id="team-section">
        <div className="max-w-7xl mx-auto px-4">
          
          <div className="text-center max-w-3xl mx-auto mb-14">
            <span className="text-[10px] bg-blue-50 text-[#2596be] font-black uppercase tracking-widest px-3 py-1 rounded-full border border-blue-100">
              Leadership
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-[#031b4e] uppercase tracking-tight mt-3">
              Board of Directors
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 font-semibold mt-2">
              Leadership steering Cool Technologies LLC towards operational excellence, quality distribution, and lasting customer relationships across the UAE.
            </p>
          </div>

          {/* 2-Column Executive Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto">
            {EXECUTIVE_DIRECTORS.map((director) => (
              <div 
                key={director.id}
                className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col group"
              >
                {/* Full Image */}
                <div className="w-full aspect-[4/4.5] overflow-hidden bg-slate-100">
                  <img 
                    src={director.image} 
                    alt={director.name}
                    className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
                  />
                </div>

                {/* Name & Designation only */}
                <div className="p-6 sm:p-7 text-center bg-white border-t border-slate-100">
                  <h3 className="text-xl sm:text-2xl font-black text-[#031b4e] tracking-tight uppercase">
                    {director.name}
                  </h3>
                  <p className="text-xs sm:text-sm font-bold text-[#2596be] tracking-wide mt-1.5">
                    {director.designation}
                  </p>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* -------------------------------------------------
          4. LEADERSHIP VALUES
      ------------------------------------------------- */}
      <section className="py-16 bg-white border-b border-slate-100" id="values-section">
        <div className="max-w-7xl mx-auto px-4">
          
          <div className="text-center max-w-3xl mx-auto mb-12">
            <span className="text-[10px] bg-blue-50 text-[#2596be] font-black uppercase tracking-widest px-3 py-1 rounded-full border border-blue-100">
              Guided Principles
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-[#031b4e] uppercase tracking-tight mt-3">
              Leadership Values
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 font-semibold mt-2">
              The operational principles governing every executive decision, commercial contract, and customer interaction.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {LEADERSHIP_VALUES.map((val, idx) => (
              <div 
                key={idx}
                className="p-6 rounded-3xl bg-slate-50 border border-slate-200 hover:border-blue-300 hover:bg-white hover:shadow-lg transition-all space-y-3 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0">
                      {val.icon}
                    </div>
                    <span className="text-[9px] font-black uppercase tracking-widest bg-blue-100/80 text-blue-900 px-2.5 py-1 rounded-md">
                      {val.tag}
                    </span>
                  </div>

                  <h3 className="font-black text-base text-[#031b4e] uppercase tracking-tight">
                    {val.title}
                  </h3>

                  <p className="text-xs text-slate-600 font-medium leading-relaxed">
                    {val.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-200/60 flex items-center gap-1.5 text-[11px] text-[#2596be] font-bold">
                  <CheckCircle2 size={12} />
                  <span>Company Standard</span>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* -------------------------------------------------
          5. MANAGEMENT RESPONSIBILITIES
      ------------------------------------------------- */}
      <section className="py-16 bg-slate-50 border-b border-slate-200" id="responsibilities-section">
        <div className="max-w-7xl mx-auto px-4">
          
          <div className="text-center max-w-3xl mx-auto mb-12">
            <span className="text-[10px] bg-blue-50 text-[#2596be] font-black uppercase tracking-widest px-3 py-1 rounded-full border border-blue-100">
              Functional Governance
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-[#031b4e] uppercase tracking-tight mt-3">
              Management Responsibilities
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 font-semibold mt-2">
              Structured operational oversight across 8 primary business functions to ensure dependable, on-time delivery.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {MANAGEMENT_RESPONSIBILITIES.map((resp, idx) => (
              <div 
                key={idx}
                className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-3 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#2596be] flex items-center justify-center shrink-0">
                    {resp.icon}
                  </div>
                  <h3 className="font-black text-sm text-[#031b4e] uppercase tracking-wide">
                    {resp.title}
                  </h3>
                </div>

                <p className="text-xs text-slate-500 font-medium leading-relaxed pt-1">
                  {resp.description}
                </p>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* -------------------------------------------------
          6. COMPANY CULTURE
      ------------------------------------------------- */}
      <section className="py-16 bg-white border-b border-slate-100" id="culture-section">
        <div className="max-w-7xl mx-auto px-4">
          
          <div className="text-center max-w-3xl mx-auto mb-12">
            <span className="text-[10px] bg-blue-50 text-[#2596be] font-black uppercase tracking-widest px-3 py-1 rounded-full border border-blue-100">
              Workplace Ecosystem
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-[#031b4e] uppercase tracking-tight mt-3">
              Company Culture
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 font-semibold mt-2">
              Fostering a collaborative, safety-focused environment where engineering craftsmanship and client satisfaction thrive.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {CULTURE_PILLARS.map((cult, idx) => (
              <div 
                key={idx}
                className="p-6 rounded-3xl bg-slate-50 border border-slate-200 space-y-3 hover:border-blue-300 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-blue-100 text-[#2596be] flex items-center justify-center shrink-0">
                    {cult.icon}
                  </div>
                  <h3 className="font-black text-sm text-[#031b4e] uppercase tracking-wide">
                    {cult.title}
                  </h3>
                </div>

                <p className="text-xs text-slate-600 font-medium leading-relaxed">
                  {cult.description}
                </p>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* -------------------------------------------------
          7. MINIMAL CTA BANNER
      ------------------------------------------------- */}
      <section className="py-16 bg-white" id="cta-section">
        <div className="max-w-7xl mx-auto px-4">
          <div className="bg-slate-50 rounded-2xl p-8 sm:p-12 border border-slate-200/90 shadow-2xs">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              
              <div className="lg:col-span-8 space-y-3">
                <span className="text-[11px] font-bold text-[#2596be] uppercase tracking-wider px-3 py-1 bg-blue-50/80 rounded-full border border-blue-100/80">
                  Executive Consultation
                </span>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-[#031b4e] uppercase tracking-tight pt-1">
                  Connect With Our Leadership Team
                </h2>
                <p className="text-slate-600 text-xs sm:text-sm leading-relaxed max-w-2xl font-normal">
                  Whether you are planning a large-scale commercial development, exploring wholesale equipment distribution, or require custom COOLTECH water cooling solutions, our executive directors are available to assist.
                </p>

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
              </div>

            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
