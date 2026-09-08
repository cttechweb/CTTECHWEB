import React, { useState, useEffect } from "react";
import {
  ChevronRight,
  ArrowRight,
  ArrowLeft,
  Calendar,
  Clock,
  FileText
} from "lucide-react";

// Asset imports
// @ts-ignore
import hqImage from "../assets/images/cool_tech_hq_1784538496855.jpg";
// @ts-ignore
import airConditionerImg from "../assets/images/hvac_air_conditioner_1784350824930.jpg";
// @ts-ignore
import chillerImg from "../assets/images/hvac_chiller_1784350873395.jpg";
// @ts-ignore
import coilsImg from "../assets/images/hvac_coils_1784350888537.jpg";
// @ts-ignore
import compressorImg from "../assets/images/hvac_compressor_1784350840924.jpg";
// @ts-ignore
import pipesImg from "../assets/images/hvac_pipes_1784350907486.jpg";
// @ts-ignore
import thermostatImg from "../assets/images/hvac_thermostat_1784350856402.jpg";

import SEOHead from "./common/SEOHead";
import { INITIAL_BLOG_POSTS } from "../data/initialBlogs";
import { BlogPost, ArticleSection } from "../types";

interface BlogPageProps {
  blogs?: BlogPost[];
  onOpenQuote?: (productName?: string) => void;
  onOpenProducts?: () => void;
}

const CATEGORIES = [

  "All",
  "HVAC",
  "Cooling Systems",
  "Water Coolers",
  "Maintenance",
  "Company News",
  "Product Updates",
  "Industrial Projects"
];

export const BLOG_ARTICLES: BlogPost[] = [
  {
    id: "post-1",
    slug: "next-gen-low-gwp-refrigerant-compliance",
    title: "Next-Gen Low-GWP Refrigerant Compliance for GCC Commercial Cooling Systems",
    category: "HVAC",
    date: "July 18, 2026",
    lastUpdated: "July 22, 2026",
    readTime: "6 min read",
    image: chillerImg,
    excerpt: "An in-depth guide on how commercial facility developers across the UAE and GCC can prepare for upcoming refrigerant regulations and transition to eco-friendly R-32 chillers.",
    intro: "As international environmental accords and GCC regional regulatory bodies accelerate the phase-down of high Global Warming Potential (GWP) hydrofluorocarbons (HFCs), commercial facility operators and industrial plant managers face an urgent strategic imperative: modernizing central cooling architectures to native low-GWP refrigerant platforms.",
    sections: [
      {
        h2: "Regulatory Landscape & High-Ambient Operating Dynamics",
        paragraphs: [
          "In extreme desert climatic zones where ambient outdoor temperatures routinely exceed 48°C during peak summer months, space cooling accounts for up to 70% of a commercial high-rise building's total electrical footprint. Historically, regional district cooling and central chiller plants relied heavily on R-134a and R-410A refrigerants.",
          "Under the Kigali Amendment and expanding GCC green building mandates, equipment procurement RFPs must now evaluate environmental footprint alongside COP thermodynamic efficiency. Transitioning to native R-32 or R-454B platforms provides higher heat transfer efficiency while slashing direct GWP ratings by over 67%."
        ],
        table: {
          caption: "Table 1.1: Thermodynamic & Environmental Comparison of Commercial Refrigerants",
          headers: ["Refrigerant", "GWP (AR5)", "Safety Class", "Cooling Capacity (vs R-410A)", "COP Efficiency @ 48°C Ambient"],
          rows: [
            ["R-410A (Legacy)", "2,088", "A1 (Non-flammable)", "100% Baseline", "3.20 (Standard Baseline)"],
            ["R-134a (Legacy Chiller)", "1,430", "A1 (Non-flammable)", "85%", "3.45"],
            ["R-32 (Next-Gen)", "675", "A2L (Mildly Flammable)", "106% (+6% Gain)", "3.82 (+19% Efficiency)"],
            ["R-513A (Eco-Retrofit)", "573", "A1 (Non-flammable)", "92%", "3.58 (+4% Efficiency)"],
            ["R-454B (Low-GWP Blend)", "466", "A2L (Mildly Flammable font)", "98%", "3.75 (+17% Efficiency)"]
          ]
        }
      },
      {
        h2: "Engineering Directives for Facilities Procurement & MEP Design",
        paragraphs: [
          "Facility managers and engineering consultants evaluating mechanical replacements should structure their technical specifications around three core engineering pillars:"
        ],
        bulletList: [
          "High-Ambient Compressor Rating: Confirm that inverter screw and scroll compressors are dynamically balanced to prevent thermal tripping at condensing temperatures up to 55°C.",
          "Microchannel Condenser Coils: Specify all-aluminum microchannel heat exchangers with marine-grade hydrophobic protective coatings to prevent galvanic corrosion in coastal humidity.",
          "Integrated A2L Safety Diagnostics: For indoor machine rooms, specify dual-stage refrigerant leak detection sensors linked directly to mechanical exhaust purge systems."
        ],
        quote: {
          text: "Transitioning to low-GWP refrigerant architectures is no longer merely a regulatory compliance check item—it is a fundamental financial strategy to preserve equipment resale value and reduce lifelong operational energy expenditure.",
          source: "Cool Technologies Technical Engineering Directorate"
        }
      },
      {
        h2: "Compressor Reliability & Lubrication Diagnostics",
        paragraphs: [
          "Low-GWP synthetic refrigerants operate under slightly higher discharge temperatures compared to legacy mixtures. Consequently, maintaining proper Polyolester (POE) oil viscosity is essential to prevent bearing friction and premature compressor stator failure."
        ],
        image: {
          url: coilsImg,
          alt: "Industrial condenser microchannel coils",
          caption: "Figure 1.1: Marine-coated microchannel condenser coils designed for high ambient heat dissipation and low-GWP pressure dynamics."
        },
        h3: "Recommended Commissioning Checklist",
        numberedList: [
          "Execute full nitrogen pressure purging to verify piping hermeticity prior to evacuation.",
          "Achieve a deep vacuum of 250 microns to eliminate moisture contamination in synthetic POE lubricant.",
          "Calibrate electronic expansion valves (EXVs) to maintain optimal superheat settings between 4.5K and 6.0K."
        ]
      }
    ]
  },
  {
    id: "post-2",
    slug: "optimizing-multi-zone-vrf-systems",
    title: "Optimizing Multi-Zone VRF Systems for High-Rise Commercial Towers",
    category: "Cooling Systems",
    date: "July 10, 2026",
    lastUpdated: "July 15, 2026",
    readTime: "5 min read",
    image: airConditionerImg,
    excerpt: "Explore how Variable Refrigerant Flow technology adjusts refrigerant volume dynamically to multi-zone office floors, achieving up to 25% utility cost savings.",
    intro: "Variable Refrigerant Flow (VRF) technology has fundamentally reshaped indoor climate control standards across commercial real estate developments. By modulating refrigerant mass flow in response to micro-zonal heat loads, VRF systems achieve unprecedented seasonal energy performance.",
    sections: [
      {
        h2: "Zonal Demand Modulation & Inverter Control",
        paragraphs: [
          "Unlike legacy constant-volume direct expansion (DX) units, modern VRF outdoor condensing units incorporate DC inverter-driven scroll compressors capable of modulating capacity down to 10% of total nominal rating.",
          "In high-rise commercial office buildings where solar radiation loads shift dynamically from eastern glass facades in the morning to western exposures in the afternoon, VRF heat recovery systems redistribute captured heat to zones requiring heating while cooling sunlit exterior offices."
        ]
      },
      {
        h2: "Refrigerant Piping & Oil Management Standards",
        paragraphs: [
          "Long vertical piping runs represent one of the primary engineering challenges in high-rise VRF installations. Elevation differences between outdoor roof units and lower floor indoor fan coils can exceed 110 meters."
        ],
        bulletList: [
          "Automated Oil Return Cycles: Microprocessor-controlled oil recovery routines prevent lubricant trapping in low-velocity vertical risers.",
          "Sub-Cooling Heat Exchangers: Secondary sub-cooling circuits eliminate refrigerant flashing before electronic expansion valves.",
          "Branch Selector Units: Dedicated heat recovery branch boxes enable simultaneous heating and cooling with minimal pressure drops."
        ],
        quote: {
          text: "Intelligent zonal refrigerant modulation allows commercial facility managers to eliminate over-cooling in unoccupied spaces, reducing annual HVAC energy demand by 22% to 28%.",
          source: "Middle East Commercial Building Energy Study 2026"
        }
      }
    ]
  },
  {
    id: "post-3",
    slug: "industrial-heavy-duty-water-coolers-guide",
    title: "Industrial Heavy-Duty Water Coolers: Selection & Sizing Guide",
    category: "Water Coolers",
    date: "June 28, 2026",
    lastUpdated: "July 02, 2026",
    readTime: "7 min read",
    image: pipesImg,
    excerpt: "A technical walkthrough on selecting high-capacity stainless steel water chillers for construction sites, labor facilities, and manufacturing plants under extreme ambient loads.",
    intro: "Delivering continuous, chilled drinking water across large-scale industrial worksites, manufacturing plants, and labor accommodations requires specialized mechanical refrigeration engineering optimized for ambient temperatures exceeding 50°C.",
    sections: [
      {
        h2: "Peak Consumption Load Calculation Methodology",
        paragraphs: [
          "Selecting an industrial water chiller based solely on total personnel headcount frequently results in insufficient cooling capacity during shift transitions. Engineering calculations must account for peak hourly draw rates, incoming municipal water temperature, and storage tank thermal insulation."
        ],
        table: {
          caption: "Table 3.1: Heavy-Duty Industrial Water Chiller Sizing Matrix",
          headers: ["Facility Type", "Occupancy Basis", "Peak Hourly Draw (L/hr)", "Recommended Storage Capacity", "Chiller Rating"],
          rows: [
            ["Construction Site (Tier 1)", "250 Workers", "450 Liters", "1,000 Liters", "5.0 HP Heavy-Duty"],
            ["Manufacturing Facility", "500 Workers", "850 Liters", "2,000 Liters", "10.0 HP Twin-Compressor"],
            ["Staff Accommodation", "1,000 Workers", "1,600 Liters", "5,000 Liters", "20.0 HP Multi-Circuit"]
          ]
        }
      },
      {
        h2: "Corrosion Prevention & Hygienic Materials",
        paragraphs: [
          "Industrial environments expose cooling equipment to harsh airborne particulates, saline humidity, and aggressive washdown chemicals."
        ],
        bulletList: [
          "SS316L Food-Grade Evaporator Tanks: Preventing internal corrosion and bio-film accumulation.",
          "Heavy-Gauge Stainless Casing: Structural integrity against physical impacts and coastal salt fog.",
          "Multi-Stage UV & Micro-Filtration: Ensuring drinking water purity to WHO standards."
        ]
      }
    ]
  },
  {
    id: "post-4",
    slug: "preventative-maintenance-checklist-chillers",
    title: "Preventative Maintenance Checklist for Centrifugal & Screw Chillers",
    category: "Maintenance",
    date: "June 15, 2026",
    lastUpdated: "June 20, 2026",
    readTime: "6 min read",
    image: compressorImg,
    excerpt: "Essential quarterly and annual maintenance protocols to prevent condenser scale buildup, refrigerant leakage, and compressor burnout in mission-critical facilities.",
    intro: "Unplanned outages in central chilled water plants can interrupt manufacturing operations and cause severe commercial disruption. A structured preventative maintenance regimen is vital to safeguarding capital investments in heavy centrifugal and screw chillers.",
    sections: [
      {
        h2: "Quarterly Operational Audit Protocols",
        paragraphs: [
          "Routine physical and thermodynamic logging enables facility technicians to identify thermal inefficiency trends long before system alarms trip."
        ],
        numberedList: [
          "Log Condenser & Evaporator Approach Temperatures: An approach temperature exceeding 2.0°K indicates tube fouling or scale accumulation.",
          "Oil Spectrographic Analysis: Test compressor oil samples for acidity, moisture content, and wear metals.",
          "Vibration Spectrum Monitoring: Detect early bearing degradation in high-speed centrifugal impellers."
        ]
      },
      {
        h2: "Annual Overhaul & Chemical Cleaning Procedures",
        paragraphs: [
          "During annual plant shutdowns, condenser tubes should undergo mechanical rotary brushing and chemical descaling to restore initial heat transfer coefficients."
        ],
        quote: {
          text: "A 1mm layer of scale buildup on condenser tubes increases compressor power consumption by up to 11%, compounding energy costs across central cooling operations.",
          source: "Cool Technologies Maintenance Services Log"
        }
      }
    ]
  },
  {
    id: "post-5",
    slug: "cool-technologies-completes-45m-logistics-hub",
    title: "Cool Technologies Completes $45M Logistics Hub Cooling Installation",
    category: "Industrial Projects",
    date: "May 30, 2026",
    lastUpdated: "June 05, 2026",
    readTime: "4 min read",
    image: hqImage,
    excerpt: "Cool Technologies successfully delivers a custom-engineered 12,000-ton central cooling plant for a major regional logistics park in Jebel Ali Free Zone.",
    intro: "Cool Technologies has officially completed the engineering, supply, and commissioning of a 12,000-ton central district cooling installation servicing a premier logistics hub in JAFZA, Dubai.",
    sections: [
      {
        h2: "Project Scope & Infrastructure Highlights",
        paragraphs: [
          "The facility features four 3,000-ton high-efficiency water-cooled centrifugal chillers operating in parallel with variable speed primary pumps, ultra-low noise cooling towers, and full Building Automation System (BAS) telemetry integration."
        ],
        bulletList: [
          "Total Installed Cooling Capacity: 12,000 Refrigeration Tons (RT).",
          "Annual Carbon Footprint Reduction: Estimated 4,200 metric tons CO2 equivalent saved annually.",
          "Integrated BMS Control: 1,500+ real-time IoT monitoring points."
        ]
      }
    ]
  },
  {
    id: "post-6",
    slug: "smart-iot-sensors-floating-setpoints",
    title: "Smart IoT Sensors & Floating Setpoints for Intelligent Air Handlers",
    category: "Product Updates",
    date: "May 14, 2026",
    lastUpdated: "May 18, 2026",
    readTime: "5 min read",
    image: thermostatImg,
    excerpt: "Integrating real-time ambient temperature sensors and BMS telemetry with custom air handling units to automatically optimize fan speeds and humidity levels.",
    intro: "Next-generation Air Handling Units (AHUs) equipped with dynamic floating setpoints and IoT micro-sensors are setting new standards for industrial indoor air quality and electrical efficiency.",
    sections: [
      {
        h2: "Dynamic Reset Algorithms & Occupancy Telemetry",
        paragraphs: [
          "Traditional AHUs maintain fixed supply air temperature setpoints regardless of fluctuating indoor thermal loads. Smart floating setpoint algorithms continuously calculate actual thermal drift and automatically optimize chilled water valve positions and EC fan speeds."
        ]
      }
    ]
  },
  {
    id: "post-7",
    slug: "cool-technologies-expands-regional-distribution",
    title: "Cool Technologies Expands Regional Distribution Facilities in Abu Dhabi",
    category: "Company News",
    date: "April 22, 2026",
    lastUpdated: "April 25, 2026",
    readTime: "3 min read",
    image: coilsImg,
    excerpt: "To support growing commercial HVAC procurement demands across the UAE, Cool Technologies opens a modern 80,000 sq ft logistics hub in ICAD.",
    intro: "Cool Technologies has expanded its distribution network with the opening of an 80,000 sq ft state-of-the-art logistics and spare parts warehousing center in ICAD, Abu Dhabi.",
    sections: [
      {
        h2: "Strengthening B2B Supply Chain Responsiveness",
        paragraphs: [
          "The new facility houses extensive inventories of commercial scroll and screw compressors, copper piping, chillers, and digital control thermostats, ensuring rapid fulfillment for contractor clients across the Emirate."
        ]
      }
    ]
  }
];

export default function BlogPage({ blogs = INITIAL_BLOG_POSTS, onOpenQuote }: BlogPageProps) {
  const articlesList = blogs && blogs.length > 0 ? blogs : INITIAL_BLOG_POSTS;
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [selectedArticle, setSelectedArticle] = useState<BlogPost | null>(null);

  // Sync state with URL hash (e.g. #/blog/post-1 or #/blog/next-gen-low-gwp-refrigerant-compliance)
  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash || "";
      if (hash.startsWith("#/blog/")) {
        const postIdOrSlug = hash.replace("#/blog/", "");
        const found = articlesList.find((a) => a.id === postIdOrSlug || a.slug === postIdOrSlug);
        if (found) {
          setSelectedArticle(found);
          window.scrollTo({ top: 0, behavior: "smooth" });
          return;
        }
      }
      if (hash === "#/blog") {
        setSelectedArticle(null);
      }
    };

    handleHash();
    window.addEventListener("hashchange", handleHash);
    return () => window.removeEventListener("hashchange", handleHash);
  }, [articlesList]);

  // Filter articles based on active category chip and published status
  const filteredArticles = articlesList
    .filter(a => (a.status || "published") === "published")
    .filter((article) => {
      if (selectedCategory === "All") return true;
      return article.category.toLowerCase() === selectedCategory.toLowerCase();
    });

  // Dynamic Pagination Logic
  const POSTS_PER_PAGE = 6;
  const totalPages = Math.max(1, Math.ceil(filteredArticles.length / POSTS_PER_PAGE));
  const paginatedArticles = filteredArticles.slice(
    (currentPage - 1) * POSTS_PER_PAGE,
    currentPage * POSTS_PER_PAGE
  );

  const handleCategoryClick = (category: string) => {
    setSelectedCategory(category);
    setCurrentPage(1);
  };


  const handleReadMore = (article: BlogPost) => {
    setSelectedArticle(article);
    window.location.hash = `#/blog/${article.slug || article.id}`;
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleBackToBlog = () => {
    setSelectedArticle(null);
    window.location.hash = "#/blog";
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Find previous and next articles relative to current selected article
  const currentIndex = selectedArticle
    ? articlesList.findIndex((a) => a.id === selectedArticle.id)
    : -1;
  const prevArticle = currentIndex > 0 ? articlesList[currentIndex - 1] : null;
  const nextArticle =
    currentIndex >= 0 && currentIndex < articlesList.length - 1
      ? articlesList[currentIndex + 1]
      : null;

  // Filter 3 related articles (same category or adjacent articles)
  const relatedArticles = selectedArticle
    ? articlesList.filter((a) => a.id !== selectedArticle.id && (a.status || "published") === "published")
        .sort((a, b) => (a.category === selectedArticle.category ? -1 : 1))
        .slice(0, 3)
    : [];

  return (
    <div className="bg-white text-slate-800 min-h-screen flex flex-col font-sans antialiased">
      {/* Inject Per-Blog Dedicated SEO Head Tags */}
      {selectedArticle ? (
        <SEOHead
          title={selectedArticle.seoSettings?.seoTitle || `${selectedArticle.title} | Cool Technologies`}
          description={selectedArticle.seoSettings?.seoDescription || selectedArticle.excerpt}
          canonicalUrl={selectedArticle.seoSettings?.canonicalUrl || `https://cooltechnologies.ae/#/blog/${selectedArticle.slug}`}
          ogImage={selectedArticle.seoSettings?.ogImage || selectedArticle.image}
          type="article"
        />
      ) : (
        <SEOHead
          title="Blog & Technical Engineering Insights | Cool Technologies UAE"
          description="Explore commercial HVAC engineering briefings, district cooling guidelines, refrigerant compliance, and equipment maintenance insights from Cool Technologies UAE."
          canonicalUrl="https://cooltechnologies.ae/#/blog"
          type="website"
        />
      )}

      <main className="py-8 sm:py-12 bg-white flex-1">

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {selectedArticle ? (
            /* ========================================================================= */
            /* BLOG DETAILS PAGE VIEW (CORPORATE B2B DESIGN SYSTEM)                     */
            /* ========================================================================= */
            <div className="space-y-8">
              
              {/* Breadcrumb Navigation */}
              <nav className="flex items-center gap-2 text-xs text-slate-500 font-semibold flex-wrap" aria-label="Breadcrumb">
                <a
                  href="#/"
                  className="hover:text-[#2596be] transition-colors cursor-pointer"
                >
                  Home
                </a>
                <ChevronRight size={12} className="text-slate-400 shrink-0" />
                <button
                  onClick={handleBackToBlog}
                  className="hover:text-[#2596be] transition-colors cursor-pointer"
                >
                  Blog
                </button>
                <ChevronRight size={12} className="text-slate-400 shrink-0" />
                <span className="text-[#031b4e] font-bold truncate max-w-[280px] sm:max-w-md" title={selectedArticle.title}>
                  {selectedArticle.title}
                </span>
              </nav>

              {/* Back to Blog Button */}
              <div>
                <button
                  onClick={handleBackToBlog}
                  className="inline-flex items-center gap-2 text-xs font-bold text-[#031b4e] hover:text-[#2596be] bg-slate-100 hover:bg-slate-200/80 px-4 py-2.5 rounded-xl transition-all border border-slate-200/80 cursor-pointer"
                >
                  <ArrowLeft size={16} />
                  <span>Back to Blog</span>
                </button>
              </div>

              {/* Reading Content Layout Container (max-w-[880px] centered) */}
              <div className="max-w-[880px] mx-auto">
                
                {/* Article Header */}
                <header className="space-y-4 mb-8">
                  <div className="flex flex-wrap items-center gap-3 text-xs font-bold">
                    <span className="bg-[#031b4e] text-white text-[11px] font-extrabold uppercase px-3 py-1 rounded-md tracking-wider shadow-sm">
                      {selectedArticle.category}
                    </span>
                    <span className="text-slate-500 flex items-center gap-1.5 font-medium">
                      <Calendar size={14} className="text-[#2596be]" />
                      {selectedArticle.date}
                    </span>
                    <span className="text-slate-300">•</span>
                    <span className="text-slate-500 flex items-center gap-1.5 font-medium">
                      <Clock size={14} className="text-[#2596be]" />
                      {selectedArticle.readTime}
                    </span>
                  </div>

                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#031b4e] font-display leading-[1.25] tracking-tight">
                    {selectedArticle.title}
                  </h1>

                  <p className="text-base sm:text-lg text-slate-600 font-medium leading-relaxed pt-1">
                    {selectedArticle.intro || selectedArticle.excerpt}
                  </p>
                </header>

                {/* Featured Banner Image (16:9 aspect ratio, rounded corners) */}
                <div className="my-8 rounded-2xl overflow-hidden aspect-video bg-slate-100 border border-slate-200/60 shadow-sm">
                  <img
                    src={selectedArticle.image}
                    alt={selectedArticle.title}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Article Body Content (Direct HTML support or Sections Fallback) */}
                <article className="space-y-6 text-slate-700 text-base leading-relaxed font-normal">
                  {selectedArticle.contentHtml ? (
                    <div
                      className="prose max-w-none space-y-4 text-slate-700 leading-relaxed"
                      dangerouslySetInnerHTML={{ __html: selectedArticle.contentHtml }}
                    />
                  ) : selectedArticle.sections && selectedArticle.sections.length > 0 ? (
                    selectedArticle.sections.map((section, idx) => (
                      <section key={idx} className="space-y-4">
                        {section.h2 && (
                          <h2 className="text-xl sm:text-2xl font-extrabold text-[#031b4e] font-display mt-8 mb-3 pb-2 border-b border-slate-100">
                            {section.h2}
                          </h2>
                        )}

                        {section.h3 && (
                          <h3 className="text-lg font-bold text-[#031b4e] font-display mt-6 mb-2">
                            {section.h3}
                          </h3>
                        )}

                        {section.paragraphs &&
                          section.paragraphs.map((p, pIdx) => (
                            <p key={pIdx} className="text-slate-700 text-sm sm:text-base leading-relaxed mb-4">
                              {p}
                            </p>
                          ))}

                        {/* Technical Specifications Table */}
                        {section.table && (
                          <div className="my-8 overflow-x-auto rounded-xl border border-slate-200 shadow-sm">
                            <table className="w-full text-left text-xs sm:text-sm">
                              {section.table.caption && (
                                <caption className="p-3 text-xs font-bold text-slate-600 bg-slate-50 border-b border-slate-200 text-left">
                                  {section.table.caption}
                                </caption>
                              )}
                              <thead className="bg-[#031b4e] text-white uppercase text-[11px] tracking-wider font-extrabold">
                                <tr>
                                  {section.table.headers.map((h, hIdx) => (
                                    <th key={hIdx} className="px-4 py-3 font-semibold">
                                      {h}
                                    </th>
                                  ))}
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-200 bg-white">
                                {section.table.rows.map((row, rIdx) => (
                                  <tr
                                    key={rIdx}
                                    className={rIdx % 2 === 0 ? "bg-white" : "bg-slate-50/60 hover:bg-slate-50"}
                                  >
                                    {row.map((cell, cIdx) => (
                                      <td
                                        key={cIdx}
                                        className={`px-4 py-3 ${
                                          cIdx === 0 ? "font-bold text-[#031b4e]" : "text-slate-600"
                                        }`}
                                      >
                                        {cell}
                                      </td>
                                    ))}
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}

                        {/* Bullet List */}
                        {section.bulletList && (
                          <ul className="space-y-2.5 mb-6 text-sm sm:text-base text-slate-700 pl-5 list-disc marker:text-[#2596be]">
                            {section.bulletList.map((item, bIdx) => (
                              <li key={bIdx} className="leading-relaxed">
                                {item}
                              </li>
                            ))}
                          </ul>
                        )}

                        {/* Numbered List */}
                        {section.numberedList && (
                          <ol className="space-y-2.5 mb-6 text-sm sm:text-base text-slate-700 pl-5 list-decimal marker:text-[#031b4e] font-semibold">
                            {section.numberedList.map((item, nIdx) => (
                              <li key={nIdx} className="leading-relaxed">
                                {item}
                              </li>
                            ))}
                          </ol>
                        )}

                        {/* Corporate Directive Quote Block */}
                        {section.quote && (
                          <blockquote className="border-l-4 border-[#2596be] bg-blue-50/40 p-5 sm:p-6 rounded-r-xl text-slate-800 my-8 space-y-2">
                            <p className="italic text-base sm:text-lg font-medium text-[#031b4e]">
                              "{section.quote.text}"
                            </p>
                            {section.quote.source && (
                              <cite className="text-xs text-slate-500 font-semibold uppercase tracking-wider block not-italic">
                                — {section.quote.source}
                              </cite>
                            )}
                          </blockquote>
                        )}

                        {/* Inline Image Figure Callout */}
                        {section.image && (
                          <figure className="my-8 rounded-xl overflow-hidden border border-slate-200 bg-slate-50">
                            <img
                              src={section.image.url}
                              alt={section.image.alt}
                              className="w-full aspect-[21/9] object-cover"
                            />
                            {section.image.caption && (
                              <figcaption className="p-3 text-xs text-center text-slate-500 font-medium bg-slate-50 border-t border-slate-100">
                                {section.image.caption}
                              </figcaption>
                            )}
                          </figure>
                        )}
                      </section>
                    ))
                  ) : (
                    <p className="text-slate-700 text-base leading-relaxed">
                      {selectedArticle.excerpt}
                    </p>
                  )}
                </article>


                {/* Article Footer & Metadata */}
                <footer className="border-t border-slate-200 pt-6 mt-12 flex flex-wrap items-center justify-between gap-4 text-xs font-semibold text-slate-500">
                  <div className="flex items-center gap-3">
                    <span className="bg-[#031b4e] text-white text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-md">
                      {selectedArticle.category}
                    </span>
                    <span>Published: {selectedArticle.date}</span>
                  </div>
                  <div className="flex items-center gap-3 text-slate-400">
                    <span>Last Updated: {selectedArticle.lastUpdated}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <FileText size={12} className="text-[#2596be]" />
                      <span>Ref: {selectedArticle.id.toUpperCase()}</span>
                    </span>
                  </div>
                </footer>

                {/* Previous / Next Navigation */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-10 pt-8 border-t border-slate-200">
                  {prevArticle ? (
                    <button
                      onClick={() => handleReadMore(prevArticle)}
                      className="group text-left p-4 rounded-xl border border-slate-200 hover:border-[#2596be] hover:shadow-md transition-all bg-white cursor-pointer flex flex-col justify-between"
                    >
                      <div className="text-[11px] font-extrabold uppercase text-slate-400 group-hover:text-[#2596be] transition-colors flex items-center gap-1 mb-2">
                        <ArrowLeft size={12} />
                        <span>Previous Article</span>
                      </div>
                      <span className="text-sm font-bold text-[#031b4e] group-hover:text-[#2596be] transition-colors line-clamp-2 leading-snug">
                        {prevArticle.title}
                      </span>
                      <span className="text-[11px] text-slate-400 font-medium mt-2">
                        {prevArticle.category} • {prevArticle.date}
                      </span>
                    </button>
                  ) : <div />}

                  {nextArticle ? (
                    <button
                      onClick={() => handleReadMore(nextArticle)}
                      className="group text-right p-4 rounded-xl border border-slate-200 hover:border-[#2596be] hover:shadow-md transition-all bg-white cursor-pointer flex flex-col justify-between"
                    >
                      <div className="text-[11px] font-extrabold uppercase text-slate-400 group-hover:text-[#2596be] transition-colors flex items-center justify-end gap-1 mb-2">
                        <span>Next Article</span>
                        <ArrowRight size={12} />
                      </div>
                      <span className="text-sm font-bold text-[#031b4e] group-hover:text-[#2596be] transition-colors line-clamp-2 leading-snug">
                        {nextArticle.title}
                      </span>
                      <span className="text-[11px] text-slate-400 font-medium mt-2">
                        {nextArticle.category} • {nextArticle.date}
                      </span>
                    </button>
                  ) : <div />}
                </div>

                {/* Related Articles Section */}
                {relatedArticles.length > 0 && (
                  <section className="mt-16 pt-10 border-t border-slate-200 space-y-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-xl font-extrabold text-[#031b4e] font-display">
                          Related Articles
                        </h3>
                        <p className="text-xs text-slate-500 font-medium mt-1">
                          Explore further industrial insights and technical engineering documentation.
                        </p>
                      </div>
                      <button
                        onClick={handleBackToBlog}
                        className="text-xs font-bold text-[#2596be] hover:text-[#031b4e] transition-colors cursor-pointer hidden sm:flex items-center gap-1"
                      >
                        <span>View All Articles</span>
                        <ArrowRight size={14} />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {relatedArticles.map((relPost) => (
                        <div
                          key={relPost.id}
                          className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md hover:border-slate-300 transition-all flex flex-col h-full group cursor-pointer"
                          onClick={() => handleReadMore(relPost)}
                        >
                          {/* Image */}
                          <div className="relative aspect-video bg-slate-100 overflow-hidden">
                            <img
                              src={relPost.image}
                              alt={relPost.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                            <div className="absolute top-3 left-3">
                              <span className="bg-[#031b4e] text-white text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-md shadow-sm">
                                {relPost.category}
                              </span>
                            </div>
                          </div>

                          {/* Card Body */}
                          <div className="p-5 flex flex-col flex-1 justify-between bg-white">
                            <div className="space-y-2.5">
                              <div className="text-[11px] text-slate-400 font-bold flex items-center gap-1.5">
                                <Calendar size={13} className="text-[#2596be]" />
                                <span>{relPost.date}</span>
                              </div>
                              <h4 className="text-sm font-bold text-[#031b4e] group-hover:text-[#2596be] transition-colors line-clamp-2 leading-snug">
                                {relPost.title}
                              </h4>
                              <p className="text-xs text-slate-600 font-normal line-clamp-2 leading-relaxed">
                                {relPost.excerpt}
                              </p>
                            </div>

                            <div className="pt-3 mt-4 border-t border-slate-100">
                              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#031b4e] group-hover:text-[#2596be] transition-colors">
                                <span>Read More</span>
                                <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
                )}

              </div>
            </div>
          ) : (
            /* ========================================================================= */
            /* MAIN BLOG LISTING VIEW                                                    */
            /* ========================================================================= */
            <div className="space-y-8">
              {/* Header & Description */}
              <div className="space-y-3 border-b border-slate-100 pb-6">
                <nav className="flex items-center gap-2 text-xs text-slate-500 font-semibold" aria-label="Breadcrumb">
                  <a href="#/" className="hover:text-[#2596be] transition-colors">
                    Home
                  </a>
                  <ChevronRight size={12} className="text-slate-400" />
                  <span className="text-[#031b4e] font-bold">Blog</span>
                </nav>

                <h1 className="text-2xl sm:text-3xl font-extrabold text-[#031b4e] font-display tracking-tight">
                  Blog & Technical Insights
                </h1>

                <p className="text-sm text-slate-600 font-medium">
                  Explore our latest engineering briefings, commercial HVAC guidelines, and company updates.
                </p>
              </div>

              {/* Category Filter Chips */}
              <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => handleCategoryClick(cat)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                      selectedCategory === cat
                        ? "bg-[#031b4e] text-white shadow-sm"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Blog Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {paginatedArticles.map((article) => (
                  <div
                    key={article.id}
                    className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col h-full group cursor-pointer"
                    onClick={() => handleReadMore(article)}
                  >
                    {/* Featured Image */}
                    <div className="relative bg-slate-100 aspect-video overflow-hidden">
                      <img
                        src={article.image}
                        alt={article.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute top-3 left-3">
                        <span className="bg-[#031b4e] text-white text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-md shadow-sm">
                          {article.category}
                        </span>
                      </div>
                    </div>

                    {/* Card Body */}
                    <div className="p-5 flex flex-col flex-1 justify-between bg-white">
                      <div className="space-y-3">
                        <div className="text-[11px] text-slate-400 font-bold flex items-center gap-1.5">
                          <Calendar size={13} className="text-[#2596be]" />
                          <span>{article.date}</span>
                        </div>

                        <h3 className="text-base font-extrabold text-[#031b4e] font-display leading-snug group-hover:text-[#2596be] transition-colors line-clamp-2">
                          {article.title}
                        </h3>

                        <p className="text-xs text-slate-600 font-medium leading-relaxed line-clamp-3">
                          {article.excerpt}
                        </p>
                      </div>

                      <div className="pt-4 mt-5 border-t border-slate-100">
                        <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#031b4e] group-hover:text-[#2596be] transition-colors">
                          <span>Read More</span>
                          <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Dynamic Pagination Bar (Renders ONLY if totalPages > 1) */}
              {totalPages > 1 && (
                <div className="pt-6 border-t border-slate-100 flex items-center justify-center">
                  <nav className="inline-flex items-center gap-2" aria-label="Pagination">
                    <button
                      onClick={() => {
                        setCurrentPage((prev) => Math.max(prev - 1, 1));
                        window.scrollTo({ top: 300, behavior: "smooth" });
                      }}
                      disabled={currentPage === 1}
                      className="px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center gap-1"
                    >
                      <ArrowLeft size={14} />
                      <span>Previous</span>
                    </button>

                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                      <button
                        key={pageNum}
                        onClick={() => {
                          setCurrentPage(pageNum);
                          window.scrollTo({ top: 300, behavior: "smooth" });
                        }}
                        className={`w-9 h-9 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          currentPage === pageNum
                            ? "bg-[#031b4e] text-white shadow-sm"
                            : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50"
                        }`}
                      >
                        {pageNum}
                      </button>
                    ))}

                    <button
                      onClick={() => {
                        setCurrentPage((prev) => Math.min(prev + 1, totalPages));
                        window.scrollTo({ top: 300, behavior: "smooth" });
                      }}
                      disabled={currentPage === totalPages}
                      className="px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center gap-1"
                    >
                      <span>Next</span>
                      <ArrowRight size={14} />
                    </button>
                  </nav>
                </div>
              )}
            </div>
          )}

        </div>
      </main>
    </div>
  );
}
