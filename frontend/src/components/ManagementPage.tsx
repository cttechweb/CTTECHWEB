import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
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
import hqImage from "../assets/images/cool_tech_hq_1784538496855.jpg";
// @ts-ignore
import heroBanner from "../assets/images/hvac_hero_banner_1784350809012.jpg";
// @ts-ignore
import chillerImage from "../assets/images/hvac_chiller_1784350873395.jpg";

interface ManagementPageProps {
  onOpenQuote?: (prefilledProduct?: string) => void;
  onOpenCareer?: () => void;
}

export interface TeamMember {
  id: string;
  name: string;
  designation: string;
  department: string;
  experienceYears: number;
  bio: string;
  expertise: string[];
  initials: string;
  avatarBg: string;
  linkedin?: string;
  email?: string;
}

// Extensible array of team members allowing unlimited additions in the future
const LEADERSHIP_TEAM: TeamMember[] = [
  {
    id: "m-1",
    name: "Dr. Arthur Sterling",
    designation: "Chief Executive Officer & Co-Founder",
    department: "Executive Directorate",
    experienceYears: 25,
    bio: "Over 25 years of thermodynamic engineering and corporate HVAC distribution leadership across Europe and the GCC. Arthur guides our strategic expansion into smart energy grids, green refrigerants, and high-efficiency central VRF systems.",
    expertise: ["Thermodynamics", "Corporate Strategy", "Green Refrigerants", "GCC Market Expansion"],
    initials: "AS",
    avatarBg: "bg-[#031b4e]",
    linkedin: "https://linkedin.com",
    email: "a.sterling@cooltechuae.com"
  },
  {
    id: "m-2",
    name: "Eng. Sarah Jenkins",
    designation: "Executive Director of Global Sourcing",
    department: "OEM Partnerships & Supply Chain",
    experienceYears: 20,
    bio: "Sarah manages our direct manufacturer relationships with tier-1 global brands including Daikin, Carrier, MHI, Midea, and Panasonic. She oversees B2B pricing parity, quality assurance standards, and volume OEM contracts.",
    expertise: ["Global OEM Sourcing", "Vendor Relations", "B2B Pricing Parity", "Contract Negotiations"],
    initials: "SJ",
    avatarBg: "bg-[#2596be]",
    linkedin: "https://linkedin.com",
    email: "s.jenkins@cooltechuae.com"
  },
  {
    id: "m-3",
    name: "Eng. David Vance",
    designation: "Vice President of Operations & Logistics",
    department: "Logistics & Warehouse Operations",
    experienceYears: 18,
    bio: "David streamlines our Mussafah industrial warehousing facility and express LTL contractor deliveries across all 7 Emirates. Under his tenure, average dispatch fulfillment times have dropped to under 18 hours.",
    expertise: ["Warehouse Management", "LTL Freight Logistics", "Supply Chain SLAs", "Inventory Control"],
    initials: "DV",
    avatarBg: "bg-slate-800",
    linkedin: "https://linkedin.com",
    email: "d.vance@cooltechuae.com"
  },
  {
    id: "m-4",
    name: "Eng. Tariq Al-Mansoori",
    designation: "Technical Director & Chief HVAC Engineer",
    department: "Engineering & Technical Services",
    experienceYears: 22,
    bio: "A veteran mechanical engineer specializing in heavy water chillers, air handling units, and high-ambient VRF cooling design. Tariq leads our in-house engineering team in providing certified system estimates and ASHRAE compliance.",
    expertise: ["Central Chiller Plants", "High-Ambient VRF", "ASHRAE Compliance", "BIM System Design"],
    initials: "TM",
    avatarBg: "bg-[#031b4e]",
    linkedin: "https://linkedin.com",
    email: "t.almansoori@cooltechuae.com"
  },
  {
    id: "m-5",
    name: "Fatima Al-Hassan",
    designation: "Commercial Director & B2B Client Relations",
    department: "Commercial & Government Procurement",
    experienceYears: 15,
    bio: "Fatima oversees government civil procurement, commercial developer accounts, and Net-30 contractor credit accounts. She ensures transparent quoting, customized billing solutions, and executive SLA compliance.",
    expertise: ["Gov & Civil Sourcing", "B2B Credit Accounts", "Contractor Relations", "Commercial SLAs"],
    initials: "FH",
    avatarBg: "bg-[#2596be]",
    linkedin: "https://linkedin.com",
    email: "f.alhassan@cooltechuae.com"
  },
  {
    id: "m-6",
    name: "Eng. Marcus Thorne",
    designation: "Head of After-Sales & Maintenance Operations",
    department: "Field Services & Overhauling",
    experienceYears: 16,
    bio: "Marcus leads our 24/7 mechanical field desk, emergency dispatch teams, and annual preventative maintenance (PPM) divisions. He specializes in compressor overhauling and rapid warranty replacement turnaround.",
    expertise: ["24/7 Field Support", "Compressor Overhaul", "PPM Contracting", "OEM Spare Parts"],
    initials: "MT",
    avatarBg: "bg-slate-700",
    linkedin: "https://linkedin.com",
    email: "m.thorne@cooltechuae.com"
  }
];

// Leadership Values
const LEADERSHIP_VALUES = [
  {
    title: "Innovation",
    description: "Pioneering eco-refrigerants (R32/low-GWP), variable-speed inverter chillers, and smart IoT thermostatic management for Gulf ambient conditions.",
    icon: <Lightbulb className="text-[#2596be]" size={22} />,
    tag: "Future Ready"
  },
  {
    title: "Integrity",
    description: "Uncompromising price transparency, authentic OEM equipment guarantees, and straightforward B2B commercial terms with zero hidden fees.",
    icon: <ShieldCheck className="text-[#2596be]" size={22} />,
    tag: "100% Transparent"
  },
  {
    title: "Professionalism",
    description: "In-house factory-certified engineers and certified technicians delivering field execution to strict ASHRAE and ISO standards.",
    icon: <Award className="text-[#2596be]" size={22} />,
    tag: "Factory Certified"
  },
  {
    title: "Quality",
    description: "ISO 9001:2015 registered quality control. Every chiller and cooling platform undergoes rigorous multi-stage testing before dispatch.",
    icon: <Award className="text-[#2596be]" size={22} />,
    tag: "ISO 9001:2015"
  },
  {
    title: "Customer Focus",
    description: "Direct executive accountability, customized engineering estimates, and dedicated account managers for every mechanical contractor.",
    icon: <HeartHandshake className="text-[#2596be]" size={22} />,
    tag: "Dedicated Account SLAs"
  },
  {
    title: "Technical Excellence",
    description: "Deep thermodynamic engineering expertise across heavy water chillers, multi-zone VRF systems, and ductwork air distribution.",
    icon: <Cpu className="text-[#2596be]" size={22} />,
    tag: "Thermodynamic Mastery"
  },
  {
    title: "Continuous Improvement",
    description: "Ongoing technical training programs, digital process automation, and upgrading field testing equipment to lower energy consumption.",
    icon: <Rocket className="text-[#2596be]" size={22} />,
    tag: "Kaizen Culture"
  }
];

// Management Responsibilities
const MANAGEMENT_RESPONSIBILITIES = [
  {
    title: "Strategic Planning",
    description: "Long-term regional expansion, market demand forecasting, sustainable low-GWP refrigerant migration, and brand agency partnerships.",
    icon: <Target className="text-blue-600" size={20} />
  },
  {
    title: "Operations",
    description: "Managing our Mussafah Industrial logistics facility, fleet dispatch across all 7 Emirates, and inventory optimization.",
    icon: <Warehouse className="text-blue-600" size={20} />
  },
  {
    title: "Sales & Wholesale Sourcing",
    description: "Direct B2B wholesale channels, contractor credit management, Net-30 terms, and bulk volume equipment pricing.",
    icon: <BarChart3 className="text-blue-600" size={20} />
  },
  {
    title: "Projects & Contracting",
    description: "Overseeing turnkey HVAC installation engineering, duct fabrication supervision, site commissioning, and safety compliance.",
    icon: <HardHat className="text-blue-600" size={20} />
  },
  {
    title: "Engineering & R&D",
    description: "System capacity sizing calculations, static pressure loss analysis, VRF multi-pipe layout design, and BIM coordination.",
    icon: <Wrench className="text-blue-600" size={20} />
  },
  {
    title: "Customer Relations",
    description: "Operating our 24/7 support desk, managing client accounts, processing rapid proposals, and resolving technical queries.",
    icon: <UserCheck className="text-blue-600" size={20} />
  },
  {
    title: "Quality Control",
    description: "Pre-dispatch testing protocols, factory authorization validation, freight insurance management, and defect prevention.",
    icon: <ShieldCheck className="text-blue-600" size={20} />
  },
  {
    title: "After-Sales & Servicing",
    description: "Preventative Maintenance Contracts (PPM), emergency field response, compressor overhauling, and genuine spare parts supply.",
    icon: <Clock className="text-blue-600" size={20} />
  }
];

// Company Culture Pillars
const CULTURE_PILLARS = [
  {
    title: "Teamwork & Collaboration",
    description: "Cross-functional synergy between mechanical engineers, logistics coordinators, and client managers to ensure seamless project delivery.",
    icon: <Users className="text-[#2596be]" size={20} />
  },
  {
    title: "Professional Development",
    description: "Continuous OEM factory training, certified skill upgrades, and leadership mentorship programs for all technical personnel.",
    icon: <GraduationCap className="text-[#2596be]" size={20} />
  },
  {
    title: "Safety First (HSE)",
    description: "Uncompromising health, safety, and environmental protocols on every site, compliant with ISO 45001 and UAE civil defense standards.",
    icon: <ShieldAlert className="text-[#2596be]" size={20} />
  },
  {
    title: "Customer Commitment",
    description: "Empowering team members at all levels to solve client challenges swiftly with direct executive backing and clear SLAs.",
    icon: <ThumbsUp className="text-[#2596be]" size={20} />
  },
  {
    title: "Continuous Learning",
    description: "Regular technical workshops on Gulf energy codes, ESTIDAMA sustainability standards, and advanced inverter HVAC technologies.",
    icon: <Sparkles className="text-[#2596be]" size={20} />
  },
  {
    title: "Pioneering Innovation",
    description: "Encouragement of field-driven innovation, feedback loops, and refining our proprietary COOLTECH industrial product line.",
    icon: <Zap className="text-[#2596be]" size={20} />
  }
];

export default function ManagementPage({ onOpenQuote, onOpenCareer }: ManagementPageProps) {
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
          1. HERO BANNER
      ------------------------------------------------- */}
      <section className="relative bg-[#031b4e] text-white overflow-hidden py-16 lg:py-24 border-b border-slate-800">
        {/* Background Image with Dark Blue Overlay */}
        <div className="absolute inset-0 z-0 opacity-20">
          <img 
            src={heroBanner} 
            alt="Cool Technologies Corporate Management" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#031b4e] via-[#031b4e]/95 to-[#0a3154]/90"></div>
        </div>

        {/* Decorative Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-20 pointer-events-none z-0" />

        <div className="max-w-7xl mx-auto px-4 relative z-10">
          
          {/* Breadcrumb Navigation */}
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
            <span className="text-white font-black">Management</span>
          </nav>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            
            {/* Left Hero Text Content */}
            <div className="lg:col-span-8 space-y-6">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-blue-500/10 border border-blue-400/30 text-blue-300 text-xs font-black uppercase tracking-widest backdrop-blur-md">
                <Building size={13} className="text-[#2596be]" />
                <span>Executive Governance & Leadership</span>
              </div>

              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white uppercase tracking-tight leading-none">
                Management
              </h1>

              <p className="text-slate-300 text-base sm:text-xl font-bold leading-relaxed max-w-3xl">
                Leadership that drives innovation, quality and customer satisfaction.
              </p>

              <p className="text-slate-400 text-xs sm:text-sm font-normal leading-relaxed max-w-2xl">
                Our executive team combines decades of thermodynamic engineering expertise, global OEM supply chain governance, and dedicated client commitment across the United Arab Emirates and Middle East regions.
              </p>
            </div>

            {/* Right Stat Box */}
            <div className="lg:col-span-4 hidden lg:block">
              <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-6 text-white space-y-5">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-[#2596be] flex items-center justify-center text-white shrink-0 shadow-md">
                    <Trophy size={28} />
                  </div>
                  <div>
                    <p className="text-3xl font-black text-white leading-none">25+ Yrs</p>
                    <p className="text-xs text-blue-200 font-bold uppercase tracking-wider mt-1">Average Engineering Expertise</p>
                  </div>
                </div>

                <div className="h-px bg-white/10 w-full"></div>

                <div className="space-y-2.5 text-xs text-slate-300">
                  <div className="flex items-center gap-2 font-medium">
                    <CheckCircle2 size={14} className="text-[#2596be] shrink-0" />
                    <span>Direct C-Suite Account Oversight</span>
                  </div>
                  <div className="flex items-center gap-2 font-medium">
                    <CheckCircle2 size={14} className="text-[#2596be] shrink-0" />
                    <span>30+ Authorized OEM Brand Agencies</span>
                  </div>
                  <div className="flex items-center gap-2 font-medium">
                    <CheckCircle2 size={14} className="text-[#2596be] shrink-0" />
                    <span>ISO 9001:2015 Registered Governance</span>
                  </div>
                  <div className="flex items-center gap-2 font-medium">
                    <CheckCircle2 size={14} className="text-[#2596be] shrink-0" />
                    <span>Clivet & Blue Star Award Winner</span>
                  </div>
                </div>
              </div>
            </div>

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
                  alt="Cool Technologies Corporate Headquarters Abu Dhabi" 
                  className="w-full h-[400px] object-cover group-hover:scale-105 transition-transform duration-700"
                />
                
                <div className="absolute inset-0 bg-gradient-to-t from-[#031b4e]/90 via-transparent to-transparent"></div>

                <div className="absolute bottom-6 left-6 right-6 text-white space-y-2">
                  <span className="text-[10px] bg-[#2596be] text-white font-black uppercase tracking-widest px-3 py-1 rounded-full">
                    Abu Dhabi Headquarters
                  </span>
                  <h3 className="text-lg font-black uppercase tracking-tight text-white">
                    Executive Operational Command
                  </h3>
                  <p className="text-xs text-slate-200 font-medium leading-normal">
                    Guiding B2B climate control distribution, engineering estimates, and 24/7 field execution across the GCC.
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
                At Cool Technologies, our management structure is built around a single unifying mandate: delivering world-class industrial climate control systems engineered specifically for the extreme ambient temperature conditions (+52°C) of the Arabian Gulf.
              </p>

              {/* 5 Core Intro Pillars */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:border-blue-200 transition-colors">
                  <div className="flex items-center gap-2.5 mb-1.5">
                    <div className="w-8 h-8 rounded-lg bg-blue-100 text-[#031b4e] flex items-center justify-center shrink-0">
                      <Target size={16} />
                    </div>
                    <h3 className="font-extrabold text-xs text-[#031b4e] uppercase tracking-wider">Leadership Philosophy</h3>
                  </div>
                  <p className="text-xs text-slate-500 font-medium leading-relaxed">
                    Engineering-led governance, direct executive accountability, and long-term B2B partner trust.
                  </p>
                </div>

                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:border-blue-200 transition-colors">
                  <div className="flex items-center gap-2.5 mb-1.5">
                    <div className="w-8 h-8 rounded-lg bg-blue-100 text-[#031b4e] flex items-center justify-center shrink-0">
                      <HeartHandshake size={16} />
                    </div>
                    <h3 className="font-extrabold text-xs text-[#031b4e] uppercase tracking-wider">Customer-First Approach</h3>
                  </div>
                  <p className="text-xs text-slate-500 font-medium leading-relaxed">
                    Dedicated account engineers, customized estimates, Net-30 credit lines, and guaranteed SLAs.
                  </p>
                </div>

                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:border-blue-200 transition-colors">
                  <div className="flex items-center gap-2.5 mb-1.5">
                    <div className="w-8 h-8 rounded-lg bg-blue-100 text-[#031b4e] flex items-center justify-center shrink-0">
                      <Zap size={16} />
                    </div>
                    <h3 className="font-extrabold text-xs text-[#031b4e] uppercase tracking-wider">Pioneering Innovation</h3>
                  </div>
                  <p className="text-xs text-slate-500 font-medium leading-relaxed">
                    Deploying low-GWP refrigerants, high-SEER inverter VRF platforms, and smart IoT thermostatic controls.
                  </p>
                </div>

                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:border-blue-200 transition-colors">
                  <div className="flex items-center gap-2.5 mb-1.5">
                    <div className="w-8 h-8 rounded-lg bg-blue-100 text-[#031b4e] flex items-center justify-center shrink-0">
                      <Award size={16} />
                    </div>
                    <h3 className="font-extrabold text-xs text-[#031b4e] uppercase tracking-wider">Professional Excellence</h3>
                  </div>
                  <p className="text-xs text-slate-500 font-medium leading-relaxed">
                    ISO 9001:2015 quality standards, factory-certified technicians, and strict ASHRAE guidelines.
                  </p>
                </div>

              </div>

            </div>

          </div>

        </div>
      </section>

      {/* -------------------------------------------------
          3. LEADERSHIP TEAM (Extensible Professional Cards)
      ------------------------------------------------- */}
      <section className="py-16 bg-slate-50 border-b border-slate-200" id="team-section">
        <div className="max-w-7xl mx-auto px-4">
          
          <div className="text-center max-w-3xl mx-auto mb-12">
            <span className="text-[10px] bg-blue-50 text-[#2596be] font-black uppercase tracking-widest px-3 py-1 rounded-full border border-blue-100">
              Executive Board & Directorate
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-[#031b4e] uppercase tracking-tight mt-3">
              Leadership Team
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 font-semibold mt-2">
              Meet the executive leaders and senior mechanical engineers driving Cool Technologies' regional growth.
            </p>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {LEADERSHIP_TEAM.map((member) => (
              <div 
                key={member.id}
                className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-xl hover:border-blue-300 transition-all duration-300 flex flex-col justify-between group"
              >
                <div>
                  {/* Top Header / Avatar Banner */}
                  <div className="p-6 bg-gradient-to-br from-[#031b4e] to-[#0a3154] text-white relative">
                    <div className="flex items-center justify-between">
                      <div className={`w-14 h-14 rounded-2xl ${member.avatarBg} text-white font-black text-lg border-2 border-white/20 shadow-md flex items-center justify-center shrink-0`}>
                        {member.initials}
                      </div>
                      <span className="text-[10px] bg-blue-500/20 text-blue-200 border border-blue-400/30 px-3 py-1 rounded-full font-bold uppercase tracking-wider">
                        {member.experienceYears}+ Yrs Exp
                      </span>
                    </div>

                    <div className="mt-4">
                      <h3 className="text-lg font-black text-white uppercase tracking-tight group-hover:text-[#2596be] transition-colors">
                        {member.name}
                      </h3>
                      <p className="text-xs text-blue-300 font-bold uppercase tracking-wider mt-0.5">
                        {member.designation}
                      </p>
                      <p className="text-[10px] text-slate-300 font-medium mt-1">
                        {member.department}
                      </p>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-6 space-y-4">
                    <p className="text-xs text-slate-600 font-medium leading-relaxed">
                      {member.bio}
                    </p>

                    {/* Key Expertise Tags */}
                    <div className="space-y-1.5">
                      <p className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest">
                        Core Expertise
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {member.expertise.map((exp, i) => (
                          <span 
                            key={i}
                            className="text-[10px] bg-slate-100 text-slate-700 px-2.5 py-1 rounded-md font-semibold border border-slate-200"
                          >
                            {exp}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card Footer Links */}
                <div className="p-6 pt-0 border-t border-slate-100 mt-2 flex items-center justify-between text-xs font-semibold">
                  {member.email ? (
                    <a 
                      href={`mailto:${member.email}`}
                      className="text-slate-500 hover:text-[#2596be] transition-colors flex items-center gap-1.5 text-xs"
                    >
                      <Mail size={13} className="text-[#2596be]" />
                      <span className="truncate max-w-[150px]">{member.email}</span>
                    </a>
                  ) : (
                    <span className="text-slate-400 text-[11px]">Cool Technologies UAE</span>
                  )}

                  {member.linkedin && (
                    <a 
                      href={member.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-lg bg-slate-100 text-slate-600 hover:bg-[#031b4e] hover:text-white transition-colors"
                      title="LinkedIn Profile"
                    >
                      <Linkedin size={14} />
                    </a>
                  )}
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
              The 7 operational principles governing every executive decision, vendor contract, and client interaction.
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
                  <span>Corporate Benchmark</span>
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
              Structured operational oversight across 8 primary business functions to ensure operational zero-defect delivery.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {MANAGEMENT_RESPONSIBILITIES.map((resp, idx) => (
              <div 
                key={idx}
                className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-3 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
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
              Fostering a collaborative, safety-focused environment where engineering craftsmanship thrives.
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
          7. JOIN OUR TEAM / CTA
      ------------------------------------------------- */}
      <section className="py-16 bg-[#031b4e] text-white relative overflow-hidden">
        {/* Background Overlay */}
        <div className="absolute inset-0 z-0 opacity-15">
          <img 
            src={chillerImage} 
            alt="Cool Technologies Industrial Systems" 
            className="w-full h-full object-cover"
          />
        </div>

        <div className="max-w-5xl mx-auto px-4 relative z-10 text-center space-y-6">
          <span className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-black uppercase tracking-widest">
            <Sparkles size={13} className="text-[#2596be]" />
            <span>Join Our Executive & Technical Teams</span>
          </span>

          <h2 className="text-3xl sm:text-5xl font-black text-white uppercase tracking-tight leading-tight">
            Drive the Future of Industrial Climate Control
          </h2>

          <p className="text-slate-300 text-sm sm:text-base font-normal max-w-2xl mx-auto leading-relaxed">
            Whether you are an experienced mechanical engineer seeking career opportunities, or a commercial developer looking to consult with our executive board, Cool Technologies welcomes your engagement.
          </p>
        </div>
      </section>

    </div>
  );
}
