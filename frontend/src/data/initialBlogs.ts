import { BlogPost, BlogSeoSettings } from "../types";

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

export const generateDefaultBlogSeo = (
  title: string,
  slug: string,
  excerpt: string,
  category: string,
  image: string,
  videoUrl?: string
): BlogSeoSettings => ({
  seoTitle: `${title.slice(0, 55)} | Cool Technologies UAE`,
  seoDescription: excerpt.length > 160 ? excerpt.slice(0, 157) + "..." : excerpt,
  keywords: [category, "HVAC Systems", "UAE Commercial Cooling", "Energy Efficiency", "Engineering Specifications"],
  canonicalUrl: `https://cooltechnologies.ae/#/blog/${slug}`,
  noIndex: false,
  noFollow: false,
  hreflang: "en-AE",
  redirect301Url: "",
  ogTitle: title,
  ogDescription: excerpt,
  ogImage: image,
  ogType: "article",
  twitterCard: "summary_large_image",
  twitterTitle: title,
  twitterDescription: excerpt,
  twitterImage: image,
  twitterCreator: "@cooltechuae",
  enableArticleSchema: true,
  enableBreadcrumbSchema: true,
  enableProductSchema: false,
  productSchemaData: {
    productName: "Commercial Industrial Water Chiller",
    brand: "Cool Technologies",
    price: 18500,
    currency: "USD",
    inStock: true
  },
  enableReviewSchema: true,
  reviewSchemaData: {
    ratingValue: 4.9,
    reviewCount: 34,
    authorName: "MEP Consultants UAE"
  },
  enableOfferSchema: false,
  offerSchemaData: {
    price: 18500,
    priceCurrency: "USD",
    validUntil: "2027-12-31"
  },
  enableVideoSchema: !!videoUrl,
  videoSchemaData: {
    title: title,
    description: excerpt,
    thumbnailUrl: image,
    contentUrl: videoUrl || "https://www.youtube.com/watch?v=demo-hvac-system",
    uploadDate: "2026-07-18"
  },
  includeInXmlSitemap: true,
  includeInImageSitemap: true,
  includeInVideoSitemap: !!videoUrl,
  sitemapPriority: "0.9",
  changeFreq: "weekly",
  imageCompressionWebP: true,
  lazyLoadMedia: true,
  mobileOptimized: true
});

export const calculateBlogSeoScore = (blog: BlogPost): number => {
  let score = 0;
  const seo = blog.seoSettings || generateDefaultBlogSeo(blog.title, blog.slug, blog.excerpt, blog.category, blog.image);

  // 1. Meta Title (15 pts)
  if (seo.seoTitle && seo.seoTitle.length >= 20 && seo.seoTitle.length <= 70) {
    score += 15;
  } else if (seo.seoTitle) {
    score += 8;
  }

  // 2. Meta Description (15 pts)
  if (seo.seoDescription && seo.seoDescription.length >= 80 && seo.seoDescription.length <= 165) {
    score += 15;
  } else if (seo.seoDescription) {
    score += 8;
  }

  // 3. Canonical Tag (10 pts)
  if (seo.canonicalUrl && seo.canonicalUrl.startsWith("http")) {
    score += 10;
  }

  // 4. Alt Text & Images (10 pts)
  const hasImages = blog.image || blog.sections?.some(s => s.image?.alt);
  if (hasImages) {
    score += 10;
  }

  // 5. Target Keywords (10 pts)
  if (seo.keywords && seo.keywords.length >= 3) {
    score += 10;
  }

  // 6. Schemas Enabled (15 pts)
  if (seo.enableArticleSchema && seo.enableBreadcrumbSchema) {
    score += 15;
  } else if (seo.enableArticleSchema || seo.enableBreadcrumbSchema) {
    score += 8;
  }

  // 7. Crawlability / Indexability (15 pts)
  if (!seo.noIndex && !seo.noFollow) {
    score += 15;
  }

  // 8. Clean Slug Structure (10 pts)
  if (blog.slug && /^[a-z0-9-]+$/.test(blog.slug)) {
    score += 10;
  }

  return Math.min(100, Math.max(0, score));
};

export const INITIAL_BLOG_POSTS: BlogPost[] = [
  {
    id: "post-1",
    slug: "next-gen-low-gwp-refrigerant-compliance",
    title: "Next-Gen Low-GWP Refrigerant Compliance for GCC Commercial Cooling Systems",
    category: "HVAC",
    author: "Eng. Tareq Al-Mansoori",
    authorRole: "Senior MEP Technical Director",
    date: "July 18, 2026",
    lastUpdated: "July 22, 2026",
    readTime: "6 min read",
    image: chillerImg,
    videoUrl: "https://www.youtube.com/watch?v=low-gwp-chiller-demo",
    excerpt: "An in-depth guide on how commercial facility developers across the UAE and GCC can prepare for upcoming refrigerant regulations and transition to eco-friendly R-32 chillers.",
    intro: "As international environmental accords and GCC regional regulatory bodies accelerate the phase-down of high Global Warming Potential (GWP) hydrofluorocarbons (HFCs), commercial facility operators and industrial plant managers face an urgent strategic imperative: modernizing central cooling architectures to native low-GWP refrigerant platforms.",
    status: "published",
    sections: [
      {
        id: "sec-1",
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
            ["R-454B (Low-GWP Blend)", "466", "A2L (Mildly Flammable)", "98%", "3.75 (+17% Efficiency)"]
          ]
        }
      },
      {
        id: "sec-2",
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
        id: "sec-3",
        h2: "Compressor Reliability & Lubrication Diagnostics",
        paragraphs: [
          "Low-GWP synthetic refrigerants operate under slightly higher discharge temperatures compared to legacy mixtures. Consequently, maintaining proper Polyolester (POE) oil viscosity is essential to prevent bearing friction and premature compressor stator failure."
        ],
        image: {
          url: coilsImg,
          alt: "Industrial condenser microchannel coils with anti-corrosion coating",
          caption: "Figure 1.1: Marine-coated microchannel condenser coils designed for high ambient heat dissipation and low-GWP pressure dynamics."
        },
        h3: "Recommended Commissioning Checklist",
        numberedList: [
          "Execute full nitrogen pressure purging to verify piping hermeticity prior to evacuation.",
          "Achieve a deep vacuum of 250 microns to eliminate moisture contamination in synthetic POE lubricant.",
          "Calibrate electronic expansion valves (EXVs) to maintain optimal superheat settings between 4.5K and 6.0K."
        ]
      }
    ],
    seoSettings: generateDefaultBlogSeo(
      "Next-Gen Low-GWP Refrigerant Compliance for GCC Commercial Cooling Systems",
      "next-gen-low-gwp-refrigerant-compliance",
      "An in-depth guide on how commercial facility developers across the UAE and GCC can prepare for upcoming refrigerant regulations and transition to eco-friendly R-32 chillers.",
      "HVAC",
      chillerImg,
      "https://www.youtube.com/watch?v=low-gwp-chiller-demo"
    ),
    seoScore: 98
  },
  {
    id: "post-2",
    slug: "optimizing-multi-zone-vrf-systems",
    title: "Optimizing Multi-Zone VRF Systems for High-Rise Commercial Towers",
    category: "Cooling Systems",
    author: "Dr. Sarah Jenkins",
    authorRole: "Principal HVAC Systems Engineer",
    date: "July 10, 2026",
    lastUpdated: "July 15, 2026",
    readTime: "5 min read",
    image: airConditionerImg,
    excerpt: "Explore how Variable Refrigerant Flow technology adjusts refrigerant volume dynamically to multi-zone office floors, achieving up to 25% utility cost savings.",
    intro: "Variable Refrigerant Flow (VRF) technology has fundamentally reshaped indoor climate control standards across commercial real estate developments. By modulating refrigerant mass flow in response to micro-zonal heat loads, VRF systems achieve unprecedented seasonal energy performance.",
    status: "published",
    sections: [
      {
        id: "sec-1",
        h2: "Zonal Demand Modulation & Inverter Control",
        paragraphs: [
          "Unlike legacy constant-volume direct expansion (DX) units, modern VRF outdoor condensing units incorporate DC inverter-driven scroll compressors capable of modulating capacity down to 10% of total nominal rating.",
          "In high-rise commercial office buildings where solar radiation loads shift dynamically from eastern glass facades in the morning to western exposures in the afternoon, VRF heat recovery systems redistribute captured heat to zones requiring heating while cooling sunlit exterior offices."
        ]
      },
      {
        id: "sec-2",
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
    ],
    seoSettings: generateDefaultBlogSeo(
      "Optimizing Multi-Zone VRF Systems for High-Rise Commercial Towers",
      "optimizing-multi-zone-vrf-systems",
      "Explore how Variable Refrigerant Flow technology adjusts refrigerant volume dynamically to multi-zone office floors, achieving up to 25% utility cost savings.",
      "Cooling Systems",
      airConditionerImg
    ),
    seoScore: 96
  },
  {
    id: "post-3",
    slug: "industrial-heavy-duty-water-coolers-guide",
    title: "Industrial Heavy-Duty Water Coolers: Selection & Sizing Guide",
    category: "Water Coolers",
    author: "Eng. Rashid Al-Hassan",
    authorRole: "Hydraulic & Refrigeration Lead",
    date: "June 28, 2026",
    lastUpdated: "July 02, 2026",
    readTime: "7 min read",
    image: pipesImg,
    excerpt: "A technical walkthrough on selecting high-capacity stainless steel water chillers for construction sites, labor facilities, and manufacturing plants under extreme ambient loads.",
    intro: "Delivering continuous, chilled drinking water across large-scale industrial worksites, manufacturing plants, and labor accommodations requires specialized mechanical refrigeration engineering optimized for ambient temperatures exceeding 50°C.",
    status: "published",
    sections: [
      {
        id: "sec-1",
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
        id: "sec-2",
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
    ],
    seoSettings: generateDefaultBlogSeo(
      "Industrial Heavy-Duty Water Coolers: Selection & Sizing Guide",
      "industrial-heavy-duty-water-coolers-guide",
      "A technical walkthrough on selecting high-capacity stainless steel water chillers for construction sites, labor facilities, and manufacturing plants under extreme ambient loads.",
      "Water Coolers",
      pipesImg
    ),
    seoScore: 94
  },
  {
    id: "post-4",
    slug: "preventative-maintenance-checklist-chillers",
    title: "Preventative Maintenance Checklist for Centrifugal & Screw Chillers",
    category: "Maintenance",
    author: "Marcus Vance",
    authorRole: "Chief Operations Officer",
    date: "June 15, 2026",
    lastUpdated: "June 20, 2026",
    readTime: "6 min read",
    image: compressorImg,
    excerpt: "Essential quarterly and annual maintenance protocols to prevent condenser scale buildup, refrigerant leakage, and compressor burnout in mission-critical facilities.",
    intro: "Unplanned outages in central chilled water plants can interrupt manufacturing operations and cause severe commercial disruption. A structured preventative maintenance regimen is vital to safeguarding capital investments in heavy centrifugal and screw chillers.",
    status: "published",
    sections: [
      {
        id: "sec-1",
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
        id: "sec-2",
        h2: "Annual Overhaul & Chemical Cleaning Procedures",
        paragraphs: [
          "During annual plant shutdowns, condenser tubes should undergo mechanical rotary brushing and chemical descaling to restore initial heat transfer coefficients."
        ],
        quote: {
          text: "A 1mm layer of scale buildup on condenser tubes increases compressor power consumption by up to 11%, compounding energy costs across central cooling operations.",
          source: "Cool Technologies Maintenance Services Log"
        }
      }
    ],
    seoSettings: generateDefaultBlogSeo(
      "Preventative Maintenance Checklist for Centrifugal & Screw Chillers",
      "preventative-maintenance-checklist-chillers",
      "Essential quarterly and annual maintenance protocols to prevent condenser scale buildup, refrigerant leakage, and compressor burnout in mission-critical facilities.",
      "Maintenance",
      compressorImg
    ),
    seoScore: 97
  },
  {
    id: "post-5",
    slug: "cool-technologies-completes-45m-logistics-hub",
    title: "Cool Technologies Completes $45M Logistics Hub Cooling Installation",
    category: "Industrial Projects",
    author: "Press Relations",
    authorRole: "Corporate Communications",
    date: "May 30, 2026",
    lastUpdated: "June 05, 2026",
    readTime: "4 min read",
    image: hqImage,
    excerpt: "Cool Technologies successfully delivers a custom-engineered 12,000-ton central cooling plant for a major regional logistics park in Jebel Ali Free Zone.",
    intro: "Cool Technologies has officially completed the engineering, supply, and commissioning of a 12,000-ton central district cooling installation servicing a premier logistics hub in JAFZA, Dubai.",
    status: "published",
    sections: [
      {
        id: "sec-1",
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
    ],
    seoSettings: generateDefaultBlogSeo(
      "Cool Technologies Completes $45M Logistics Hub Cooling Installation",
      "cool-technologies-completes-45m-logistics-hub",
      "Cool Technologies successfully delivers a custom-engineered 12,000-ton central cooling plant for a major regional logistics park in Jebel Ali Free Zone.",
      "Industrial Projects",
      hqImage
    ),
    seoScore: 95
  },
  {
    id: "post-6",
    slug: "smart-iot-sensors-floating-setpoints",
    title: "Smart IoT Sensors & Floating Setpoints for Intelligent Air Handlers",
    category: "Product Updates",
    author: "Tech Innovations Team",
    authorRole: "R&D Department",
    date: "May 14, 2026",
    lastUpdated: "May 18, 2026",
    readTime: "5 min read",
    image: thermostatImg,
    excerpt: "Integrating real-time ambient temperature sensors and BMS telemetry with custom air handling units to automatically optimize fan speeds and humidity levels.",
    intro: "Next-generation Air Handling Units (AHUs) equipped with dynamic floating setpoints and IoT micro-sensors are setting new standards for industrial indoor air quality and electrical efficiency.",
    status: "published",
    sections: [
      {
        id: "sec-1",
        h2: "Dynamic Reset Algorithms & Occupancy Telemetry",
        paragraphs: [
          "Traditional AHUs maintain fixed supply air temperature setpoints regardless of fluctuating indoor thermal loads. Smart floating setpoint algorithms continuously calculate actual thermal drift and automatically optimize chilled water valve positions and EC fan speeds."
        ]
      }
    ],
    seoSettings: generateDefaultBlogSeo(
      "Smart IoT Sensors & Floating Setpoints for Intelligent Air Handlers",
      "smart-iot-sensors-floating-setpoints",
      "Integrating real-time ambient temperature sensors and BMS telemetry with custom air handling units to automatically optimize fan speeds and humidity levels.",
      "Product Updates",
      thermostatImg
    ),
    seoScore: 96
  }
];
