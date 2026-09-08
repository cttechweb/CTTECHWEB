import React, { useState, useEffect } from "react";
import { getGeneralSettings } from "../services/generalSettingsService";
import {
  Newspaper,
  Download,
  Share2,
  Calendar,
  MapPin,
  Video,
  Award,
  FileText,
  CheckCircle2,
  ArrowRight,
  ExternalLink,
  Search,
  Filter,
  Clock,
  Building2,
  Play,
  X,
  Mail,
  Phone,
  MessageSquare,
  Linkedin,
  Facebook,
  Instagram,
  Eye,
  Sparkles,
  Layers,
  ChevronRight,
  Image as ImageIcon,
  Tag,
  ShieldCheck,
  Briefcase
} from "lucide-react";

// Asset imports
// @ts-ignore
import logo from "../assets/images/Cool Technologies Logo.png";
// @ts-ignore
import hqImage from "../assets/images/cool_tech_hq_1784538496855.jpg";
// @ts-ignore
import heroImage from "../assets/images/hvac_hero_banner_1784350809012.jpg";
// @ts-ignore
import acImage from "../assets/images/hvac_air_conditioner_1784350824930.jpg";
// @ts-ignore
import chillerImage from "../assets/images/hvac_chiller_1784350873395.jpg";
// @ts-ignore
import compressorImage from "../assets/images/hvac_compressor_1784350840924.jpg";
// @ts-ignore
import thermostatImage from "../assets/images/hvac_thermostat_1784350856402.jpg";
// @ts-ignore
import coilsImage from "../assets/images/hvac_coils_1784350888537.jpg";
// @ts-ignore
import pipesImage from "../assets/images/hvac_pipes_1784350907486.jpg";

interface MediaPageProps {
  onOpenQuote?: (productName: string) => void;
}

// ----------------------------------------------------------------------
// DATA TYPES
// ----------------------------------------------------------------------
interface PressArticle {
  id: string;
  title: string;
  date: string;
  category: "Product Launches" | "New Partnerships" | "Awards" | "Business Milestones" | "Corporate Updates";
  source: string;
  summary: string;
  fullContent: string;
  image: string;
  readTime: string;
  author: string;
}

interface GalleryItem {
  id: string;
  title: string;
  category: "Industrial Projects" | "Commercial Projects" | "Products" | "Installations" | "Warehouses" | "Showrooms" | "Office" | "Events";
  location: string;
  date: string;
  image: string;
  description: string;
}

interface VideoItem {
  id: string;
  title: string;
  category: string;
  duration: string;
  thumbnail: string;
  youtubeId: string;
  description: string;
}

interface AwardItem {
  id: string;
  title: string;
  year: string;
  issuer: string;
  description: string;
  category: string;
}

interface EventItem {
  id: string;
  title: string;
  date: string;
  venue: string;
  location: string;
  summary: string;
  attendees: string;
  image: string;
}

interface ProjectHighlight {
  id: string;
  name: string;
  category: string;
  location: string;
  description: string;
  image: string;
  metrics: string[];
}

interface DownloadResource {
  id: string;
  title: string;
  category: "Catalogues" | "Profiles" | "Brochures" | "Technical" | "Warranty" | "Guides";
  fileType: "PDF" | "ZIP";
  fileSize: string;
  description: string;
  downloadUrl: string;
}

interface SocialPost {
  id: string;
  platform: "LinkedIn" | "Facebook" | "Instagram";
  date: string;
  handle: string;
  content: string;
  image?: string;
  likes: number;
  shares: number;
  link: string;
}

// ----------------------------------------------------------------------
// SAMPLE DATA
// ----------------------------------------------------------------------
const FEATURED_PRESS: PressArticle = {
  id: "feat-1",
  title: "Cool Technologies Commissioning 50,000 Sq Ft Central HVAC Logistics & Assembly Hub in ICAD Industrial Zone, Abu Dhabi",
  date: "July 20, 2026",
  category: "Corporate Updates",
  source: "Official Press Release — Abu Dhabi",
  summary: "To support expanding commercial HVAC and industrial water chiller demand across the GCC, Cool Technologies has officially opened its state-of-the-art logistics and custom coil assembly hub at ICAD III.",
  fullContent: `ABU DHABI, UAE — July 20, 2026 — Cool Technologies, the UAE's premier authorized B2B sourcing partner and distributor for industrial air conditioning systems, water chillers, and HVAC spare parts, today announced the formal opening of its new 50,000 sq. ft. central logistics and custom coil assembly facility located at Plot 99, ICAD III, Abu Dhabi.

The multi-million dirham expansion increases Cool Technologies' immediate inventory holding capacity by over 250%, enabling same-day and next-day emergency dispatch for heavy commercial scroll compressors, VRF multi-splits, and stainless steel drinking water coolers across Abu Dhabi, Dubai, Sharjah, and the wider GCC region.

Key Highlights of the New Facility:
• Climate-Controlled Logistics Hub: Houses over 3,500 active SKUs of OEM components, including Daikin, Midea, Carrier, Copeland, and Danfoss hardware.
• Certified Coil Assembly Line: Dedicated facility for custom condenser and evaporator coil fabrication built for high-ambient Gulf operating conditions.
• Rapid Emergency Van Fleet: 15 dedicated mobile technical response units operating 24/7 for emergency contractor site dispatches.
• Green Logistics Standards: Solar-assisted rooftop power and carbon-optimized freight fleet meeting UAE Net Zero 2050 sustainability goals.

"Our investment in ICAD III reflects our unwavering commitment to B2B contracting partners, facility management firms, and industrial clients," stated the Managing Director of Cool Technologies. "In the Gulf heat, climate control failure is not an option. This new hub guarantees that replacement units, VRF modules, and industrial water chillers are delivered to project sites without supply chain delays."`,
  image: hqImage,
  readTime: "4 min read",
  author: "Corporate Communications Team"
};

const NEWS_ARTICLES: PressArticle[] = [
  {
    id: "news-1",
    title: "Cool Technologies Appointed Master UAE Distributor for Eco-Compliant Inverter VRF Series",
    date: "July 15, 2026",
    category: "Product Launches",
    source: "Gulf Business Review",
    summary: "Securing master distribution rights for next-generation Variable Refrigerant Flow (VRF) systems utilizing low-GWP R-32 refrigerant across Abu Dhabi and Dubai.",
    fullContent: "Cool Technologies has officially secured master distribution rights for next-generation Variable Refrigerant Flow (VRF) systems across the UAE. Designed specifically for extreme Middle Eastern climate loads up to 52°C ambient temperatures, the new VRF series delivers a 22% increase in seasonal energy efficiency ratios (SEER). The systems feature intelligent BMS integration and low-GWP R-32 refrigerant compliance in line with UAE environmental directives.",
    image: acImage,
    readTime: "3 min read",
    author: "HVAC Engineering Desk"
  },
  {
    id: "news-2",
    title: "Strategic Alliance Announced with Global OEM Partners for R-32 Transition",
    date: "July 02, 2026",
    category: "New Partnerships",
    source: "Middle East Industrial News",
    summary: "Partnership with leading brands including Daikin, Midea, and Panasonic to guarantee immediate availability of zero-ozone depletion coolants and compressors.",
    fullContent: "Cool Technologies has expanded its distribution framework with top tier OEMs including Daikin, Midea, and Panasonic. This strategic partnership ensures direct factory pricing, expedited warranty processing, and local stock reserves for eco-friendly R-32 refrigerant units. Technical workshops for MEP contractors will commence next month in Dubai and Abu Dhabi.",
    image: compressorImage,
    readTime: "3 min read",
    author: "B2B Procurement Desk"
  },
  {
    id: "news-3",
    title: "Cool Technologies Wins 'GCC Industrial HVAC Distributor of the Year' at MEP Awards",
    date: "June 18, 2026",
    category: "Awards",
    source: "MEP Middle East Excellence",
    summary: "Recognized for outstanding supply chain efficiency, 99.4% SLA adherence, and extensive B2B catalog coverage spanning over 1,200 cooling products.",
    fullContent: "At the 2026 MEP Middle East Excellence Awards in Dubai, Cool Technologies was named GCC Industrial HVAC Distributor of the Year. The judging panel highlighted Cool Technologies' digital B2B sourcing portal, robust logistics infrastructure, and dedicated engineering consultation desk serving major MEP contractors across the GCC.",
    image: heroImage,
    readTime: "2 min read",
    author: "Press Relations"
  },
  {
    id: "news-4",
    title: "B2B Contractor Network Reaches Milestone of 1,200 Active Procurement Accounts",
    date: "May 28, 2026",
    category: "Business Milestones",
    source: "Industrial Economy UAE",
    summary: "Over 1,200 registered MEP contractors, MEP consultants, and facility managers now utilize Cool Technologies' wholesale portal for fast quote generation.",
    fullContent: "Cool Technologies celebrated reaching 1,200 registered commercial B2B partner accounts. The platform allows contractors to access tiered trade pricing, credit line facilities, technical CAD drawing downloads, and real-time inventory tracking for immediate dispatch.",
    image: pipesImage,
    readTime: "2 min read",
    author: "Commercial Operations"
  },
  {
    id: "news-5",
    title: "ISO 9001:2015 Quality Management & ISO 14001 Environmental Certifications Renewed",
    date: "April 14, 2026",
    category: "Corporate Updates",
    source: "Bureau Veritas Audit Report",
    summary: "Successfully completing comprehensive audit with zero non-conformities, highlighting strict quality control across storage, testing, and handling.",
    fullContent: "Bureau Veritas has recertified Cool Technologies under ISO 9001:2015 for Quality Management Systems and ISO 14001:2014 for Environmental Management. The audit commended Cool Technologies' rigorous pressure testing procedures, hazardous material safety protocols, and zero-defect warehouse dispatch standards.",
    image: thermostatImage,
    readTime: "2 min read",
    author: "Quality & Safety Bureau"
  },
  {
    id: "news-6",
    title: "Unveiling COOLTECH Next-Gen Multi-Tap Stainless Steel Drinking Water Coolers",
    date: "March 22, 2026",
    category: "Product Launches",
    source: "Commercial Utilities Digest",
    summary: "Heavy-duty SS304 grade water dispensers designed for construction sites, labor accommodations, schools, and industrial facilities.",
    fullContent: "Cool Technologies introduced its upgraded line of proprietary COOLTECH stainless steel drinking water coolers. Featuring anti-corrosive SS304 food-grade tanks, high-efficiency copper coils, and multi-bubbler taps, these units are purpose-built to perform continuously in Gulf summer temperatures exceeding 50°C.",
    image: chillerImage,
    readTime: "3 min read",
    author: "Product Design Division"
  }
];

const GALLERY_ITEMS: GalleryItem[] = [
  {
    id: "gal-1",
    title: "Central Chilled Water Plant Installation",
    category: "Industrial Projects",
    location: "KIZAD Logistics Park, Abu Dhabi",
    date: "2026",
    image: chillerImage,
    description: "Installation of 1,800 TR heavy-duty water chillers with redundant scroll compressors and integrated BMS controls."
  },
  {
    id: "gal-2",
    title: "VRF Multi-Split Commercial Tower Deployment",
    category: "Commercial Projects",
    location: "Business Bay, Dubai",
    date: "2026",
    image: acImage,
    description: "Multi-tenant inverter VRF cooling network spanning 32 office floors with smart zone temperature management."
  },
  {
    id: "gal-3",
    title: "Custom Air Handling Unit (AHU) Assembly",
    category: "Products",
    location: "ICAD Assembly Hub, Abu Dhabi",
    date: "2026",
    image: coilsImage,
    description: "Precision assembly of double-skin acoustic AHU with hydrophilic aluminum coils built for pharmaceutical cleanroom standards."
  },
  {
    id: "gal-4",
    title: "Rooftop Tank Water Chiller System",
    category: "Installations",
    location: "Saadiyat Villa Complex, Abu Dhabi",
    date: "2025",
    image: compressorImage,
    description: "Domestic rooftop water cooling loop maintaining water supply temperatures at a comfortable 22°C during summer peak."
  },
  {
    id: "gal-5",
    title: "Central Logistics Warehouse & Component Stock",
    category: "Warehouses",
    location: "Mussafah M42, Abu Dhabi",
    date: "2026",
    image: hqImage,
    description: "50,000 sq ft climate-controlled inventory storage holding over 3,500 active HVAC replacement SKUs."
  },
  {
    id: "gal-6",
    title: "B2B Product Showroom & Engineering Hub",
    category: "Showrooms",
    location: "Deira Commercial District, Dubai",
    date: "2025",
    image: heroImage,
    description: "Interactive B2B trade showroom featuring working VRF display units, thermostat controllers, and compressor cutaways."
  },
  {
    id: "gal-7",
    title: "Corporate Engineering & Technical Desk",
    category: "Office",
    location: "Cool Technologies HQ, Abu Dhabi",
    date: "2026",
    image: thermostatImage,
    description: "Dedicated mechanical engineers performing CAD load calculations and equipment selection for contractor tenders."
  },
  {
    id: "gal-8",
    title: "Big 5 Global HVAC Exhibition Booth",
    category: "Events",
    location: "Dubai World Trade Centre",
    date: "2025",
    image: pipesImage,
    description: "Cool Technologies trade stand showcasing high-efficiency water chillers and OEM compressor lines to 12,000+ visitors."
  }
];

const VIDEO_ITEMS: VideoItem[] = [
  {
    id: "vid-1",
    title: "Cool Technologies Corporate Overview & ICAD Assembly Facility Tour",
    category: "Corporate Video",
    duration: "03:45",
    thumbnail: hqImage,
    youtubeId: "LXb3EKWsInQ",
    description: "Take a virtual walkthrough of our 50,000 sq ft warehouse, custom coil fabrication line, and rapid dispatch fleet in Abu Dhabi."
  },
  {
    id: "vid-2",
    title: "1,500 TR Water Chiller Installation Time-Lapse — Abu Dhabi Port",
    category: "Project Time-Lapse",
    duration: "02:20",
    thumbnail: chillerImage,
    youtubeId: "dQw4w9WgXcQ",
    description: "Time-lapse footage detailing the rigging, positioning, piping, and electrical commissioning of heavy industrial water chillers."
  },
  {
    id: "vid-3",
    title: "VRF Inverter Commissioning & BMS Control Setup Guide",
    category: "Technical Training",
    duration: "05:12",
    thumbnail: acImage,
    youtubeId: "LXb3EKWsInQ",
    description: "Step-by-step technical demonstration of multi-split VRF addressing, pressure testing, and Building Management System integration."
  },
  {
    id: "vid-4",
    title: "Manufacturing Quality Control: SS304 Stainless Steel Water Coolers",
    category: "Product Testing",
    duration: "04:05",
    thumbnail: coilsImage,
    youtubeId: "dQw4w9WgXcQ",
    description: "Observe pressure leak testing, tank sanitization, and thermal performance validation under simulated 50°C ambient heat."
  }
];

const AWARDS_LIST: AwardItem[] = [
  {
    id: "award-1",
    title: "GCC Industrial HVAC Distributor of the Year 2025",
    year: "2025",
    issuer: "MEP Middle East Excellence Awards",
    description: "Honored for supply chain resilience, trade credit accessibility, and unmatched B2B product range across the GCC.",
    category: "Industry Leadership"
  },
  {
    id: "award-2",
    title: "Daikin Master Partner Platinum Status",
    year: "2024 - 2026",
    issuer: "Daikin Middle East & Africa",
    description: "Highest level OEM partner accreditation for sales volume, technical expertise, and certified service standards.",
    category: "OEM Accreditation"
  },
  {
    id: "award-3",
    title: "UAE Energy Efficiency Leadership Award",
    year: "2025",
    issuer: "Ministry of Energy & Infrastructure",
    description: "Recognized for pioneering the distribution of inverter-driven low-GWP climate technology reducing building power consumption.",
    category: "Sustainability"
  },
  {
    id: "award-4",
    title: "ISO 9001:2015 & ISO 14001 Quality Certification",
    year: "2026",
    issuer: "Bureau Veritas International",
    description: "International certification confirming strict quality management in storage, testing, and mechanical equipment dispatch.",
    category: "Quality Compliance"
  },
  {
    id: "award-5",
    title: "Estidama & Dubai Green Building Approved Supplier",
    year: "2026",
    issuer: "Abu Dhabi Urban Planning & Dubai Municipality",
    description: "Verified supplier certification meeting strict Pearl Rating System criteria for energy-efficient commercial developments.",
    category: "Green Building"
  }
];

const EVENTS_LIST: EventItem[] = [
  {
    id: "ev-1",
    title: "Big 5 Global Construction & HVAC Expo 2025",
    date: "November 26-29, 2025",
    venue: "Dubai World Trade Centre",
    location: "Dubai, UAE",
    summary: "Cool Technologies hosted a 120 sqm interactive exhibition booth featuring live demonstration units for commercial VRF, chilled water pumps, and stainless steel drinking water systems.",
    attendees: "14,000+ Trade Visitors",
    image: heroImage
  },
  {
    id: "ev-2",
    title: "GCC Commercial Refrigeration & Cold Chain Summit",
    date: "February 12, 2026",
    venue: "Abu Dhabi National Exhibition Centre (ADNEC)",
    location: "Abu Dhabi, UAE",
    summary: "Keynote presentation by Cool Technologies engineering team on zero-emission cold storage rooms and smart blast freezer monitoring systems.",
    attendees: "850+ Industry Delegates",
    image: hqImage
  },
  {
    id: "ev-3",
    title: "Annual B2B Contractor & Dealer Convention 2026",
    date: "April 18, 2026",
    venue: "St. Regis Saadiyat Island Resort",
    location: "Abu Dhabi, UAE",
    summary: "Gathering of over 200 certified MEP contractors and regional distributors to preview 2026 product lines, credit line expansions, and technical warranty policies.",
    attendees: "220 VIP Partners",
    image: pipesImage
  },
  {
    id: "ev-4",
    title: "R-32 Refrigerant Safety & VRF Certification Seminar",
    date: "June 10, 2026",
    venue: "Cool Technologies Technical Academy",
    location: "Abu Dhabi, UAE",
    summary: "Hands-on technical workshop training 65 site engineers on low-GWP refrigerant recovery, vacuum brazing, and electronic leak detection.",
    attendees: "65 Certified Engineers",
    image: thermostatImage
  }
];

const PROJECT_HIGHLIGHTS: ProjectHighlight[] = [
  {
    id: "proj-1",
    name: "Khalifa Industrial Zone (KIZAD) Logistics Facility",
    category: "Industrial Cooling",
    location: "Abu Dhabi, UAE",
    description: "Turnkey supply of 1,800 TR chilled water plant with dual scroll circuits, plate heat exchangers, and central Building Management System (BMS) integration.",
    image: chillerImage,
    metrics: ["1,800 TR Capacity", "28% Energy Saving", "45-Day Delivery"]
  },
  {
    id: "proj-2",
    name: "Dubai Silicon Oasis Commercial Plaza",
    category: "Commercial HVAC",
    location: "Dubai, UAE",
    description: "Complete Inverter VRF multi-split installation across 36 commercial office floors featuring individual tenant energy metering and central touch controls.",
    image: acImage,
    metrics: ["36 Floors Managed", "R-32 Eco Refrigerant", "Zero Downtime"]
  },
  {
    id: "proj-3",
    name: "Sharjah Food Park Walk-In Cold Chain Facility",
    category: "Cold Storage & Freezers",
    location: "Sharjah, UAE",
    description: "Engineering supply of -25°C blast freezing rooms and walk-in cold rooms with polyurethane insulation panels and standby compressor racks.",
    image: compressorImage,
    metrics: ["-25°C Ultra-Low Temp", "Food Grade SS304", "100% Redundancy"]
  },
  {
    id: "proj-4",
    name: "Mussafah Staff Housing Residential Community",
    category: "Drinking Water Systems",
    location: "Abu Dhabi, UAE",
    description: "Deployment of 120 heavy-duty COOLTECH multi-tap stainless steel drinking water coolers and filtration units serving 4,000 residents continuously.",
    image: coilsImage,
    metrics: ["120 Coolers Placed", "5,000 L/hr Capacity", "Continuous 50°C Test"]
  }
];

const DOWNLOAD_RESOURCES: DownloadResource[] = [
  {
    id: "dl-1",
    title: "Cool Technologies Corporate Profile 2026",
    category: "Profiles",
    fileType: "PDF",
    fileSize: "14.2 MB",
    description: "Comprehensive corporate overview detailing company history, OEM partnerships, warehouse infrastructure, and engineering capabilities.",
    downloadUrl: "#"
  },
  {
    id: "dl-2",
    title: "Full B2B Product Catalog 2026 (Air Conditioning & Chillers)",
    category: "Catalogues",
    fileType: "PDF",
    fileSize: "28.5 MB",
    description: "Complete 180-page wholesale catalog covering split ACs, VRF systems, AHUs, FCUs, water chillers, compressors, and spare parts.",
    downloadUrl: "#"
  },
  {
    id: "dl-3",
    title: "Commercial VRF & Inverter Technical CAD Specification Package",
    category: "Technical",
    fileType: "ZIP",
    fileSize: "42.0 MB",
    description: "High-resolution CAD drawings, electrical wiring schematics, dimension blueprints, and piping diagrams for MEP engineering consultants.",
    downloadUrl: "#"
  },
  {
    id: "dl-4",
    title: "COOLTECH Stainless Steel Water Coolers Brochure",
    category: "Brochures",
    fileType: "PDF",
    fileSize: "8.4 MB",
    description: "Detailed specification sheet for SS304 drinking water coolers, bubblers, multi-tap dispensers, and water purification units.",
    downloadUrl: "#"
  },
  {
    id: "dl-5",
    title: "OEM Warranty Terms & After-Sales Service SLA Guidelines",
    category: "Warranty",
    fileType: "PDF",
    fileSize: "2.1 MB",
    description: "Official warranty terms, compressor coverage policies, spare part replacement protocols, and emergency response SLA contracts.",
    downloadUrl: "#"
  },
  {
    id: "dl-6",
    title: "HVAC Installation & Preventive Maintenance Field Guide",
    category: "Guides",
    fileType: "PDF",
    fileSize: "11.8 MB",
    description: "Practical field guide for technicians covering vacuum evacuation, refrigerant charging, coil descaling, and electrical troubleshooting.",
    downloadUrl: "#"
  }
];

const SOCIAL_POSTS: SocialPost[] = [
  {
    id: "soc-1",
    platform: "LinkedIn",
    date: "2 days ago",
    handle: "Cool Technologies UAE",
    content: "Proud to announce the successful dispatch of 45 commercial package AC units for the new Al Ain Logistics Hub! Our team worked around the clock at our ICAD hub to ensure zero delays for our contractor partners. #HVAC #Dubai #AbuDhabi #B2B #CoolingSolutions",
    image: acImage,
    likes: 184,
    shares: 26,
    link: "https://linkedin.com"
  },
  {
    id: "soc-2",
    platform: "Facebook",
    date: "4 days ago",
    handle: "Cool Technologies Official",
    content: "Live thermal testing at our Abu Dhabi technical facility! Our COOLTECH 500L stainless steel water chiller maintaining a steady 10°C outlet even with ambient temperatures topping 48°C. Built tough for Gulf job sites. #WaterCooler #UAE #Construction",
    image: chillerImage,
    likes: 112,
    shares: 15,
    link: "https://facebook.com"
  },
  {
    id: "soc-3",
    platform: "Instagram",
    date: "1 week ago",
    handle: "@cooltechuae",
    content: "Behind the scenes: Precision copper coil brazing and pressure testing inside our ICAD custom fabrication division. Quality is never an accident—it is always the result of intelligent effort. ❄️⚙️ #Engineering #UAEIndustry #CoolingTech",
    image: coilsImage,
    likes: 340,
    shares: 42,
    link: "https://instagram.com"
  }
];

// ----------------------------------------------------------------------
// MAIN COMPONENT
// ----------------------------------------------------------------------
export default function MediaPage({ onOpenQuote }: MediaPageProps) {
  // Dynamic contact channels from Contact Center
  const [mediaContacts, setMediaContacts] = useState(() => {
    const s = getGeneralSettings();
    return {
      pressEmail: s.departmentHotlines?.mediaPressEmail || s.departmentHotlines?.pressEmail || s.emailIntegration?.defaultReceivingEmail || "media@cooltechuae.com / press@cooltechuae.com",
      pressPhone: s.departmentHotlines?.pressDeskPhone || "+971 2 555 1234 (Ext. 401 - Corporate Desk)",
      pressWhatsapp: s.departmentHotlines?.pressWhatsapp || s.whatsappSettings?.floatingPhoneNumber || "+971 50 123 4567",
      address: s.address || "Plot 99, ICAD III, Industrial City of Abu Dhabi, UAE"
    };
  });

  useEffect(() => {
    const handleUpdate = () => {
      const s = getGeneralSettings();
      setMediaContacts({
        pressEmail: s.departmentHotlines?.mediaPressEmail || s.departmentHotlines?.pressEmail || s.emailIntegration?.defaultReceivingEmail || "media@cooltechuae.com / press@cooltechuae.com",
        pressPhone: s.departmentHotlines?.pressDeskPhone || "+971 2 555 1234 (Ext. 401 - Corporate Desk)",
        pressWhatsapp: s.departmentHotlines?.pressWhatsapp || s.whatsappSettings?.floatingPhoneNumber || "+971 50 123 4567",
        address: s.address || "Plot 99, ICAD III, Industrial City of Abu Dhabi, UAE"
      });
    };
    window.addEventListener("cooltech_contact_settings_updated", handleUpdate);
    window.addEventListener("cooltech_settings_updated", handleUpdate);
    return () => {
      window.removeEventListener("cooltech_contact_settings_updated", handleUpdate);
      window.removeEventListener("cooltech_settings_updated", handleUpdate);
    };
  }, []);

  // Filter states
  const [newsCategory, setNewsCategory] = useState<string>("All");
  const [newsSearch, setNewsSearch] = useState<string>("");
  const [galleryCategory, setGalleryCategory] = useState<string>("All");
  const [downloadCategory, setDownloadCategory] = useState<string>("All");

  // Modal states
  const [activePressModal, setActivePressModal] = useState<PressArticle | null>(null);
  const [activeGalleryModal, setActiveGalleryModal] = useState<GalleryItem | null>(null);
  const [activeVideoModal, setActiveVideoModal] = useState<VideoItem | null>(null);
  const [isInquiryModalOpen, setIsInquiryModalOpen] = useState(false);

  // Inquiry form state
  const [inquiryName, setInquiryName] = useState("");
  const [inquiryOrg, setInquiryOrg] = useState("");
  const [inquiryEmail, setInquiryEmail] = useState("");
  const [inquiryPhone, setInquiryPhone] = useState("");
  const [inquiryType, setInquiryType] = useState("Press & Media Kit");
  const [inquiryMessage, setInquiryMessage] = useState("");
  const [inquirySubmitted, setInquirySubmitted] = useState(false);

  // Filtered news articles
  const filteredNews = NEWS_ARTICLES.filter((item) => {
    const matchesCat = newsCategory === "All" || item.category === newsCategory;
    const matchesSearch =
      item.title.toLowerCase().includes(newsSearch.toLowerCase()) ||
      item.summary.toLowerCase().includes(newsSearch.toLowerCase()) ||
      item.source.toLowerCase().includes(newsSearch.toLowerCase());
    return matchesCat && matchesSearch;
  });

  // Filtered gallery items
  const filteredGallery = GALLERY_ITEMS.filter((item) => {
    return galleryCategory === "All" || item.category === galleryCategory;
  });

  // Filtered downloads
  const filteredDownloads = DOWNLOAD_RESOURCES.filter((item) => {
    return downloadCategory === "All" || item.category === downloadCategory;
  });

  const handleInquirySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setInquirySubmitted(true);
    setTimeout(() => {
      setInquirySubmitted(false);
      setIsInquiryModalOpen(false);
      setInquiryName("");
      setInquiryOrg("");
      setInquiryEmail("");
      setInquiryPhone("");
      setInquiryMessage("");
    }, 2500);
  };

  const handleSimulateDownload = (resourceTitle: string) => {
    const alertMsg = `Downloading "${resourceTitle}"... Thank you for referencing Cool Technologies official media documentation.`;
    alert(alertMsg);
  };

  return (
    <div className="bg-white text-slate-800 min-h-screen font-sans antialiased">
      
      {/* -------------------------------------------------
          1. HERO BANNER
      ------------------------------------------------- */}
      <section className="relative bg-[#031b4e] text-white py-14 lg:py-20 border-b border-slate-800 overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#2596be_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none"></div>
        
        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <div className="max-w-3xl space-y-4 text-center sm:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-cyan-500/15 border border-cyan-400/20 text-cyan-300 rounded-full text-[11px] font-bold uppercase tracking-wider">
              <Newspaper size={13} className="text-[#2596be]" />
              <span>Official B2B Press Room & Corporate Newsroom</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight uppercase">
              Media <span className="text-[#2596be]">Center</span>
            </h1>

            <p className="text-slate-300 text-xs sm:text-base leading-relaxed font-normal max-w-2xl">
              Welcome to the Cool Technologies Corporate Media Center. Access official company press releases, high-resolution project galleries, executive announcements, downloadable B2B technical resources, and corporate press contacts.
            </p>

            {/* Quick Navigation Pills */}
            <div className="flex flex-wrap items-center gap-2 pt-2">
              <a href="#featured-section" className="text-[11px] font-bold bg-white/10 hover:bg-[#2596be] text-white px-3 py-1.5 rounded-lg transition-colors border border-white/10">
                Featured News
              </a>
              <a href="#news-section" className="text-[11px] font-bold bg-white/10 hover:bg-[#2596be] text-white px-3 py-1.5 rounded-lg transition-colors border border-white/10">
                Company News
              </a>
              <a href="#gallery-section" className="text-[11px] font-bold bg-white/10 hover:bg-[#2596be] text-white px-3 py-1.5 rounded-lg transition-colors border border-white/10">
                Project Gallery
              </a>
              <a href="#video-section" className="text-[11px] font-bold bg-white/10 hover:bg-[#2596be] text-white px-3 py-1.5 rounded-lg transition-colors border border-white/10">
                Video Gallery
              </a>
              <a href="#awards-section" className="text-[11px] font-bold bg-white/10 hover:bg-[#2596be] text-white px-3 py-1.5 rounded-lg transition-colors border border-white/10">
                Awards
              </a>
              <a href="#downloads-section" className="text-[11px] font-bold bg-white/10 hover:bg-[#2596be] text-white px-3 py-1.5 rounded-lg transition-colors border border-white/10">
                Download Center
              </a>
              <a href="#contact-section" className="text-[11px] font-bold bg-[#2596be] hover:bg-[#1c7e9f] text-white px-3 py-1.5 rounded-lg transition-colors">
                Media Contact
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* -------------------------------------------------
          2. FEATURED ANNOUNCEMENT
      ------------------------------------------------- */}
      <section className="py-12 bg-slate-50/80 border-b border-slate-200/80" id="featured-section">
        <div className="max-w-7xl mx-auto px-4">
          
          <div className="mb-4 flex items-center justify-between">
            <span className="text-[11px] font-bold text-[#2596be] uppercase tracking-wider px-3 py-1 bg-blue-50/80 rounded-full border border-blue-100/80">
              Featured Corporate Update
            </span>
            <span className="text-xs text-slate-500 font-medium">{FEATURED_PRESS.date}</span>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden grid grid-cols-1 lg:grid-cols-12 gap-0">
            {/* Image Col */}
            <div className="lg:col-span-5 relative h-64 lg:h-auto bg-slate-100 border-b lg:border-b-0 lg:border-r border-slate-200/80 overflow-hidden group">
              <img 
                src={FEATURED_PRESS.image} 
                alt={FEATURED_PRESS.title} 
                className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent lg:hidden"></div>
              <span className="absolute bottom-3 left-3 bg-[#031b4e] text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md shadow-2xs">
                Major Expansion
              </span>
            </div>

            {/* Content Col */}
            <div className="lg:col-span-7 p-6 sm:p-8 flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-xs text-slate-500 font-semibold">
                  <span className="text-[#2596be] font-bold">{FEATURED_PRESS.source}</span>
                  <span>•</span>
                  <span>{FEATURED_PRESS.readTime}</span>
                </div>

                <h2 className="text-xl sm:text-2xl font-extrabold text-[#031b4e] uppercase tracking-tight leading-snug">
                  {FEATURED_PRESS.title}
                </h2>

                <p className="text-slate-600 text-xs sm:text-sm leading-relaxed font-normal">
                  {FEATURED_PRESS.summary}
                </p>

                {/* Key Stat Badges */}
                <div className="grid grid-cols-3 gap-3 pt-2">
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/70 text-center">
                    <p className="text-base sm:text-lg font-extrabold text-[#031b4e]">50,000</p>
                    <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider mt-0.5">Sq Ft Facility</p>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/70 text-center">
                    <p className="text-base sm:text-lg font-extrabold text-[#2596be]">3,500+</p>
                    <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider mt-0.5">Active SKUs</p>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/70 text-center">
                    <p className="text-base sm:text-lg font-extrabold text-[#031b4e]">24/7</p>
                    <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider mt-0.5">Van Dispatch</p>
                  </div>
                </div>
              </div>

              <div className="pt-2 flex flex-wrap items-center justify-between gap-4 border-t border-slate-100">
                <span className="text-xs text-slate-500 font-medium">By {FEATURED_PRESS.author}</span>
                <button
                  onClick={() => setActivePressModal(FEATURED_PRESS)}
                  className="bg-[#031b4e] hover:bg-[#2596be] text-white font-bold text-xs uppercase tracking-wider px-5 py-2.5 rounded-xl transition-colors cursor-pointer flex items-center gap-2"
                >
                  <span>Read Full Press Release</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* -------------------------------------------------
          3. COMPANY NEWS
      ------------------------------------------------- */}
      <section className="py-16 bg-white border-b border-slate-200/80" id="news-section">
        <div className="max-w-7xl mx-auto px-4">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
            <div>
              <span className="text-[11px] font-bold text-[#2596be] uppercase tracking-wider px-3 py-1 bg-blue-50/80 rounded-full border border-blue-100/80">
                Official Newsroom
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#031b4e] uppercase tracking-tight mt-2">
                Company News & Announcements
              </h2>
            </div>

            {/* Search Bar */}
            <div className="relative w-full md:w-72">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={newsSearch}
                onChange={(e) => setNewsSearch(e.target.value)}
                placeholder="Search news releases..."
                className="w-full bg-slate-50 border border-slate-200/80 text-xs rounded-xl pl-9 pr-4 py-2.5 focus:outline-none focus:border-[#2596be] focus:bg-white transition-all text-slate-800 placeholder-slate-400"
              />
              {newsSearch && (
                <button 
                  onClick={() => setNewsSearch("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X size={13} />
                </button>
              )}
            </div>
          </div>

          {/* Category Filter Tabs */}
          <div className="flex flex-wrap items-center gap-2 mb-8 border-b border-slate-100 pb-4">
            {["All", "Product Launches", "New Partnerships", "Awards", "Business Milestones", "Corporate Updates"].map((cat) => (
              <button
                key={cat}
                onClick={() => setNewsCategory(cat)}
                className={`text-xs font-bold px-3.5 py-1.5 rounded-lg transition-colors cursor-pointer ${
                  newsCategory === cat
                    ? "bg-[#031b4e] text-white shadow-2xs"
                    : "bg-slate-100 hover:bg-slate-200/80 text-slate-600"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* News Grid */}
          {filteredNews.length === 0 ? (
            <div className="text-center py-12 bg-slate-50 rounded-2xl border border-slate-200/80">
              <p className="text-sm font-bold text-slate-700">No press releases found matching your filter.</p>
              <button 
                onClick={() => { setNewsCategory("All"); setNewsSearch(""); }}
                className="mt-3 text-xs text-[#2596be] font-bold hover:underline"
              >
                Reset Filter
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredNews.map((article) => (
                <div
                  key={article.id}
                  onClick={() => setActivePressModal(article)}
                  className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-md hover:border-blue-300 transition-all cursor-pointer group flex flex-col justify-between overflow-hidden"
                >
                  <div>
                    <div className="h-44 overflow-hidden relative bg-slate-100">
                      <img 
                        src={article.image} 
                        alt={article.title} 
                        className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-300"
                      />
                      <span className="absolute top-3 left-3 bg-[#031b4e]/90 text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-md backdrop-blur-xs">
                        {article.category}
                      </span>
                    </div>

                    <div className="p-5 space-y-2">
                      <div className="flex items-center gap-2 text-[11px] text-slate-400 font-semibold">
                        <Calendar size={12} />
                        <span>{article.date}</span>
                        <span>•</span>
                        <span className="text-[#2596be] font-bold">{article.source}</span>
                      </div>

                      <h3 className="font-bold text-sm text-[#031b4e] leading-snug group-hover:text-[#2596be] transition-colors line-clamp-2">
                        {article.title}
                      </h3>

                      <p className="text-xs text-slate-600 font-normal leading-relaxed line-clamp-3">
                        {article.summary}
                      </p>
                    </div>
                  </div>

                  <div className="px-5 pb-5 pt-2 flex items-center justify-between border-t border-slate-100 text-xs font-semibold text-[#2596be]">
                    <span>Read Release</span>
                    <ArrowRight size={13} className="group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>
      </section>

      {/* -------------------------------------------------
          4. PROJECT GALLERY
      ------------------------------------------------- */}
      <section className="py-16 bg-slate-50/70 border-b border-slate-200/80" id="gallery-section">
        <div className="max-w-7xl mx-auto px-4">
          
          <div className="text-center max-w-2xl mx-auto mb-8">
            <span className="text-[11px] font-bold text-[#2596be] uppercase tracking-wider px-3 py-1 bg-blue-50/80 rounded-full border border-blue-100/80">
              Visual Archives
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#031b4e] uppercase tracking-tight mt-2">
              Project & Corporate Gallery
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 font-normal mt-1">
              Explore high-resolution photography of our industrial projects, commercial HVAC installations, central warehouses, and trade events.
            </p>
          </div>

          {/* Category Tabs */}
          <div className="flex flex-wrap items-center justify-center gap-2 mb-8">
            {["All", "Industrial Projects", "Commercial Projects", "Products", "Installations", "Warehouses", "Showrooms", "Office", "Events"].map((cat) => (
              <button
                key={cat}
                onClick={() => setGalleryCategory(cat)}
                className={`text-xs font-bold px-3.5 py-1.5 rounded-lg transition-colors cursor-pointer ${
                  galleryCategory === cat
                    ? "bg-[#031b4e] text-white shadow-2xs"
                    : "bg-white hover:bg-slate-200/80 text-slate-600 border border-slate-200/80"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Gallery Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {filteredGallery.map((item) => (
              <div
                key={item.id}
                onClick={() => setActiveGalleryModal(item)}
                className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-md hover:border-blue-300 transition-all cursor-pointer group overflow-hidden flex flex-col justify-between"
              >
                <div className="h-48 overflow-hidden relative bg-slate-100">
                  <img 
                    src={item.image} 
                    alt={item.title} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="bg-white/90 backdrop-blur-xs text-[#031b4e] p-2.5 rounded-full shadow-md">
                      <Eye size={18} />
                    </span>
                  </div>
                  <span className="absolute top-3 left-3 bg-white/95 backdrop-blur-xs text-[#031b4e] border border-slate-200/80 text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-md shadow-2xs">
                    {item.category}
                  </span>
                </div>

                <div className="p-4 space-y-1.5 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-bold text-xs text-[#031b4e] group-hover:text-[#2596be] transition-colors line-clamp-1">
                      {item.title}
                    </h3>
                    <p className="text-[11px] text-slate-500 font-medium flex items-center gap-1 mt-1">
                      <MapPin size={11} className="text-[#2596be] shrink-0" />
                      <span className="truncate">{item.location}</span>
                    </p>
                  </div>
                  <p className="text-[11px] text-slate-600 font-normal line-clamp-2 pt-1 border-t border-slate-100">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* -------------------------------------------------
          5. VIDEO GALLERY
      ------------------------------------------------- */}
      <section className="py-16 bg-white border-b border-slate-200/80" id="video-section">
        <div className="max-w-7xl mx-auto px-4">
          
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="text-[11px] font-bold text-[#2596be] uppercase tracking-wider px-3 py-1 bg-blue-50/80 rounded-full border border-blue-100/80">
              Multimedia
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#031b4e] uppercase tracking-tight mt-2">
              Corporate Video Gallery
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 font-normal mt-1">
              Watch technical project time-lapses, corporate facility walkthroughs, and HVAC equipment commissioning guides.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {VIDEO_ITEMS.map((vid) => (
              <div
                key={vid.id}
                onClick={() => setActiveVideoModal(vid)}
                className="bg-slate-50 rounded-2xl border border-slate-200/90 overflow-hidden shadow-2xs hover:shadow-md hover:border-blue-300 transition-all cursor-pointer group grid grid-cols-1 sm:grid-cols-12 gap-0"
              >
                <div className="sm:col-span-5 h-48 sm:h-auto overflow-hidden relative bg-slate-900">
                  <img 
                    src={vid.thumbnail} 
                    alt={vid.title} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 opacity-90"
                  />
                  <div className="absolute inset-0 bg-slate-900/30 flex items-center justify-center">
                    <div className="w-11 h-11 rounded-full bg-[#2596be] group-hover:bg-[#031b4e] text-white flex items-center justify-center transition-colors shadow-lg">
                      <Play size={18} className="ml-0.5" />
                    </div>
                  </div>
                  <span className="absolute bottom-3 right-3 bg-slate-900/90 text-white text-[10px] font-mono font-bold px-2 py-0.5 rounded">
                    {vid.duration}
                  </span>
                </div>

                <div className="sm:col-span-7 p-5 flex flex-col justify-between space-y-2">
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-bold text-[#2596be] uppercase tracking-wider bg-blue-50 px-2.5 py-0.5 rounded border border-blue-100">
                      {vid.category}
                    </span>
                    <h3 className="font-bold text-sm text-[#031b4e] group-hover:text-[#2596be] transition-colors leading-snug">
                      {vid.title}
                    </h3>
                    <p className="text-xs text-slate-600 font-normal leading-relaxed line-clamp-2">
                      {vid.description}
                    </p>
                  </div>

                  <div className="pt-2 text-xs font-semibold text-[#2596be] flex items-center gap-1.5">
                    <Play size={12} />
                    <span>Watch Video</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* -------------------------------------------------
          6. AWARDS & RECOGNITION
      ------------------------------------------------- */}
      <section className="py-16 bg-slate-50/70 border-b border-slate-200/80" id="awards-section">
        <div className="max-w-7xl mx-auto px-4">
          
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="text-[11px] font-bold text-[#2596be] uppercase tracking-wider px-3 py-1 bg-blue-50/80 rounded-full border border-blue-100/80">
              Excellence & Quality
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#031b4e] uppercase tracking-tight mt-2">
              Awards & Accreditations
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 font-normal mt-1">
              Industry recognitions validating our adherence to ISO standards, OEM partnerships, and sustainable HVAC supply chain practices.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {AWARDS_LIST.map((award) => (
              <div key={award.id} className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-2xs space-y-3 relative overflow-hidden">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-[#031b4e] bg-slate-100 px-2.5 py-1 rounded-md uppercase tracking-wider border border-slate-200/80">
                    {award.year}
                  </span>
                  <Award size={20} className="text-[#2596be]" />
                </div>

                <div className="space-y-1">
                  <h3 className="font-extrabold text-base text-[#031b4e] uppercase tracking-tight">
                    {award.title}
                  </h3>
                  <p className="text-xs font-bold text-[#2596be]">
                    {award.issuer}
                  </p>
                </div>

                <p className="text-xs text-slate-600 font-normal leading-relaxed pt-1">
                  {award.description}
                </p>

                <div className="pt-2 border-t border-slate-100 flex items-center gap-1.5 text-[11px] text-emerald-600 font-semibold">
                  <ShieldCheck size={14} />
                  <span>Verified Corporate Accreditation</span>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* -------------------------------------------------
          7. EVENTS & EXHIBITIONS
      ------------------------------------------------- */}
      <section className="py-16 bg-white border-b border-slate-200/80" id="events-section">
        <div className="max-w-7xl mx-auto px-4">
          
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="text-[11px] font-bold text-[#2596be] uppercase tracking-wider px-3 py-1 bg-blue-50/80 rounded-full border border-blue-100/80">
              Corporate Presence
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#031b4e] uppercase tracking-tight mt-2">
              Events & Trade Exhibitions
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 font-normal mt-1">
              Connecting with MEP contractors, consultants, and trade partners across premier industry expos and technical conventions.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {EVENTS_LIST.map((event) => (
              <div key={event.id} className="bg-slate-50 rounded-2xl border border-slate-200/90 p-6 shadow-2xs space-y-4 grid grid-cols-1 sm:grid-cols-12 gap-5 items-center">
                <div className="sm:col-span-5 h-40 rounded-xl overflow-hidden relative bg-slate-200">
                  <img src={event.image} alt={event.title} className="w-full h-full object-cover" />
                </div>
                <div className="sm:col-span-7 space-y-2">
                  <span className="text-[10px] font-bold text-[#2596be] uppercase tracking-wider bg-blue-50 px-2.5 py-0.5 rounded border border-blue-100">
                    {event.date}
                  </span>
                  <h3 className="font-extrabold text-sm text-[#031b4e] uppercase tracking-tight">
                    {event.title}
                  </h3>
                  <p className="text-xs text-slate-500 font-semibold flex items-center gap-1">
                    <Building2 size={12} className="text-[#2596be]" />
                    <span>{event.venue}, {event.location}</span>
                  </p>
                  <p className="text-xs text-slate-600 font-normal leading-relaxed">
                    {event.summary}
                  </p>
                  <div className="pt-1 text-[11px] font-bold text-[#031b4e]">
                    Audience: <span className="text-slate-600 font-normal">{event.attendees}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* -------------------------------------------------
          8. PROJECT HIGHLIGHTS
      ------------------------------------------------- */}
      <section className="py-16 bg-slate-50/70 border-b border-slate-200/80" id="projects-section">
        <div className="max-w-7xl mx-auto px-4">
          
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="text-[11px] font-bold text-[#2596be] uppercase tracking-wider px-3 py-1 bg-blue-50/80 rounded-full border border-blue-100/80">
              Engineering Showcase
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#031b4e] uppercase tracking-tight mt-2">
              Flagship Project Highlights
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 font-normal mt-1">
              Case studies detailing customized industrial cooling plants, VRF networks, and commercial water chilling projects.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {PROJECT_HIGHLIGHTS.map((proj) => (
              <div key={proj.id} className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden flex flex-col justify-between">
                <div>
                  <div className="h-52 overflow-hidden relative bg-slate-100">
                    <img src={proj.image} alt={proj.name} className="w-full h-full object-cover" />
                    <span className="absolute top-3 left-3 bg-[#031b4e] text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md">
                      {proj.category}
                    </span>
                  </div>

                  <div className="p-6 space-y-3">
                    <div>
                      <h3 className="font-extrabold text-base text-[#031b4e] uppercase tracking-tight">
                        {proj.name}
                      </h3>
                      <p className="text-xs text-slate-500 font-medium flex items-center gap-1 mt-1">
                        <MapPin size={12} className="text-[#2596be]" />
                        <span>{proj.location}</span>
                      </p>
                    </div>

                    <p className="text-xs text-slate-600 font-normal leading-relaxed">
                      {proj.description}
                    </p>

                    {/* Metrics Pills */}
                    <div className="flex flex-wrap gap-2 pt-1">
                      {proj.metrics.map((metric, idx) => (
                        <span key={idx} className="text-[10px] font-bold bg-slate-100 text-slate-700 px-2.5 py-1 rounded border border-slate-200/80">
                          {metric}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="p-6 pt-0">
                  <button
                    onClick={() => onOpenQuote && onOpenQuote(proj.name)}
                    className="w-full bg-[#031b4e] hover:bg-[#2596be] text-white text-xs font-bold uppercase tracking-wider py-2.5 rounded-xl transition-colors cursor-pointer text-center"
                  >
                    Inquire Similar Project Solution
                  </button>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* -------------------------------------------------
          9. DOWNLOAD CENTER
      ------------------------------------------------- */}
      <section className="py-16 bg-white border-b border-slate-200/80" id="downloads-section">
        <div className="max-w-7xl mx-auto px-4">
          
          <div className="text-center max-w-2xl mx-auto mb-8">
            <span className="text-[11px] font-bold text-[#2596be] uppercase tracking-wider px-3 py-1 bg-blue-50/80 rounded-full border border-blue-100/80">
              Documentation Hub
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#031b4e] uppercase tracking-tight mt-2">
              Corporate Download Center
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 font-normal mt-1">
              Download official company profiles, wholesale product catalogues, CAD engineering schematics, and warranty documentation.
            </p>
          </div>

          {/* Download Filter Tabs */}
          <div className="flex flex-wrap items-center justify-center gap-2 mb-8">
            {["All", "Catalogues", "Profiles", "Brochures", "Technical", "Warranty", "Guides"].map((cat) => (
              <button
                key={cat}
                onClick={() => setDownloadCategory(cat)}
                className={`text-xs font-bold px-3.5 py-1.5 rounded-lg transition-colors cursor-pointer ${
                  downloadCategory === cat
                    ? "bg-[#031b4e] text-white shadow-2xs"
                    : "bg-slate-100 hover:bg-slate-200 text-slate-600"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Resource List */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredDownloads.map((res) => (
              <div key={res.id} className="bg-slate-50/80 rounded-2xl border border-slate-200/90 p-5 shadow-2xs hover:border-blue-300 transition-all flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold bg-[#031b4e] text-white px-2.5 py-0.5 rounded">
                      {res.fileType} • {res.fileSize}
                    </span>
                    <span className="text-[10px] font-bold text-[#2596be] uppercase tracking-wider">
                      {res.category}
                    </span>
                  </div>

                  <h3 className="font-bold text-sm text-[#031b4e] leading-snug">
                    {res.title}
                  </h3>

                  <p className="text-xs text-slate-600 font-normal leading-relaxed">
                    {res.description}
                  </p>
                </div>

                <button
                  onClick={() => handleSimulateDownload(res.title)}
                  className="w-full bg-white hover:bg-slate-100 text-[#031b4e] border border-slate-300 font-bold text-xs uppercase tracking-wider py-2.5 rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-2 shadow-2xs"
                >
                  <Download size={14} className="text-[#2596be]" />
                  <span>Download File ({res.fileSize})</span>
                </button>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* -------------------------------------------------
          10. SOCIAL MEDIA UPDATES
      ------------------------------------------------- */}
      <section className="py-16 bg-slate-50/70 border-b border-slate-200/80" id="social-section">
        <div className="max-w-7xl mx-auto px-4">
          
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="text-[11px] font-bold text-[#2596be] uppercase tracking-wider px-3 py-1 bg-blue-50/80 rounded-full border border-blue-100/80">
              Live Channels
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#031b4e] uppercase tracking-tight mt-2">
              Social Media Feeds
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 font-normal mt-1">
              Stay connected with daily warehouse dispatch updates, project site milestones, and engineering insights across official corporate handles.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {SOCIAL_POSTS.map((post) => (
              <div key={post.id} className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs space-y-3 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2">
                      {post.platform === "LinkedIn" && <Linkedin size={18} className="text-[#0a66c2]" />}
                      {post.platform === "Facebook" && <Facebook size={18} className="text-[#1877f2]" />}
                      {post.platform === "Instagram" && <Instagram size={18} className="text-[#e4405f]" />}
                      <div>
                        <p className="text-xs font-bold text-[#031b4e]">{post.handle}</p>
                        <p className="text-[10px] text-slate-400 font-medium">{post.date}</p>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                      {post.platform}
                    </span>
                  </div>

                  <p className="text-xs text-slate-700 font-normal leading-relaxed">
                    {post.content}
                  </p>

                  {post.image && (
                    <div className="h-40 rounded-xl overflow-hidden bg-slate-100 border border-slate-100">
                      <img src={post.image} alt="Social Update" className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-[11px] text-slate-500 font-medium">
                    ❤️ {post.likes} Likes • 🔁 {post.shares} Shares
                  </span>
                  <a
                    href={post.link}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[#2596be] hover:underline font-bold text-xs flex items-center gap-1"
                  >
                    <span>View Post</span>
                    <ExternalLink size={11} />
                  </a>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* -------------------------------------------------
          11. MEDIA CONTACT
      ------------------------------------------------- */}
      <section className="py-16 bg-white" id="contact-section">
        <div className="max-w-7xl mx-auto px-4">
          
          <div className="bg-[#031b4e] text-white rounded-2xl p-8 sm:p-12 shadow-md border border-slate-800">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              
              <div className="lg:col-span-7 space-y-4">
                <span className="text-[11px] font-bold text-cyan-300 uppercase tracking-wider px-3 py-1 bg-cyan-500/20 rounded-full border border-cyan-400/20">
                  Media & Corporate Desk
                </span>

                <h2 className="text-2xl sm:text-3xl font-extrabold text-white uppercase tracking-tight">
                  Press & Media Inquiries
                </h2>

                <p className="text-slate-300 text-xs sm:text-sm leading-relaxed font-normal max-w-xl">
                  Are you an industry journalist, publication editor, or event organizer seeking high-res image packages, executive quotes, or official statistics? Our corporate relations team is at your disposal.
                </p>

                <div className="space-y-2 pt-2 text-xs sm:text-sm font-semibold text-slate-200">
                  <div className="flex items-center gap-3">
                    <Mail size={16} className="text-[#2596be] shrink-0" />
                    <a href={`mailto:${mediaContacts.pressEmail.split("/")[0].trim()}`} className="hover:text-[#2596be] transition-colors">
                      {mediaContacts.pressEmail}
                    </a>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone size={16} className="text-[#2596be] shrink-0" />
                    <a href={`tel:${mediaContacts.pressPhone.replace(/[^0-9+]/g, '')}`} className="hover:text-[#2596be] transition-colors">
                      {mediaContacts.pressPhone}
                    </a>
                  </div>
                  <div className="flex items-center gap-3">
                    <MessageSquare size={16} className="text-[#2596be] shrink-0" />
                    <a 
                      href={`https://wa.me/${mediaContacts.pressWhatsapp.replace(/[^0-9]/g, '')}?text=${encodeURIComponent("Hello Cool Technologies Media Desk, I am inquiring regarding a press kit / media release.")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-[#2596be] transition-colors"
                    >
                      WhatsApp Press Line: {mediaContacts.pressWhatsapp}
                    </a>
                  </div>
                  <div className="flex items-center gap-3">
                    <Building2 size={16} className="text-[#2596be] shrink-0" />
                    <span>{mediaContacts.address}</span>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-5 bg-white/5 border border-white/10 p-6 rounded-xl space-y-3">
                <h3 className="font-bold text-sm text-white uppercase tracking-wider">
                  Request Press Kit or Interview
                </h3>
                <p className="text-xs text-slate-300 font-normal">
                  Submit a direct inquiry to our media relations coordinator for immediate assistance.
                </p>
                
                <button
                  onClick={() => setIsInquiryModalOpen(true)}
                  className="w-full bg-[#2596be] hover:bg-[#1c7e9f] text-white font-bold text-xs uppercase tracking-wider py-3 px-6 rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-2 shadow-sm"
                >
                  <Mail size={15} />
                  <span>Send Media Inquiry</span>
                </button>

                <p className="text-[10px] text-slate-400 text-center font-medium pt-1">
                  Average response time for press inquiries: Under 2 hours.
                </p>
              </div>

            </div>
          </div>

        </div>
      </section>

      {/* -------------------------------------------------
          PRESS RELEASE MODAL VIEW
      ------------------------------------------------- */}
      {activePressModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[85vh]">
            
            <div className="bg-[#031b4e] text-white p-6 flex justify-between items-start relative">
              <div className="space-y-1 pr-6">
                <span className="text-[10px] font-bold text-cyan-300 bg-cyan-500/20 px-2.5 py-0.5 rounded uppercase tracking-wider border border-cyan-400/20">
                  {activePressModal.category}
                </span>
                <h3 className="font-extrabold text-base sm:text-lg text-white leading-snug pt-1">
                  {activePressModal.title}
                </h3>
                <p className="text-xs text-slate-300 font-medium pt-0.5">
                  {activePressModal.source} • {activePressModal.date}
                </p>
              </div>
              <button 
                onClick={() => setActivePressModal(null)}
                className="text-slate-300 hover:text-white bg-white/10 hover:bg-white/20 p-1.5 rounded-full transition-colors shrink-0"
              >
                <X size={16} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4 flex-1 text-xs text-slate-700 leading-relaxed whitespace-pre-line font-normal">
              <img src={activePressModal.image} alt="Press" className="w-full h-48 object-cover rounded-xl border border-slate-200/80 mb-3" />
              <p className="font-medium text-slate-900 text-sm">{activePressModal.summary}</p>
              <div className="border-t border-slate-100 pt-3 space-y-3">
                {activePressModal.fullContent}
              </div>
            </div>

            <div className="bg-slate-50 border-t border-slate-200/80 p-4 flex items-center justify-between text-xs">
              <span className="text-slate-500 text-[11px]">Author: {activePressModal.author}</span>
              <button 
                onClick={() => setActivePressModal(null)}
                className="bg-[#031b4e] hover:bg-[#2596be] text-white px-4 py-2 rounded-xl font-bold transition-colors"
              >
                Close Article
              </button>
            </div>

          </div>
        </div>
      )}

      {/* -------------------------------------------------
          GALLERY LIGHTBOX MODAL
      ------------------------------------------------- */}
      {activeGalleryModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-3xl w-full overflow-hidden shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="relative h-80 sm:h-96 bg-slate-900 flex items-center justify-center">
              <img src={activeGalleryModal.image} alt={activeGalleryModal.title} className="max-h-full max-w-full object-contain" />
              <button 
                onClick={() => setActiveGalleryModal(null)}
                className="absolute top-4 right-4 bg-slate-900/80 text-white hover:bg-black p-2 rounded-full transition-colors"
              >
                <X size={18} />
              </button>
              <span className="absolute bottom-4 left-4 bg-black/70 text-white text-[11px] font-bold px-3 py-1 rounded-md backdrop-blur-xs">
                {activeGalleryModal.category}
              </span>
            </div>

            <div className="p-6 space-y-2 bg-white">
              <h3 className="font-extrabold text-base text-[#031b4e] uppercase tracking-tight">
                {activeGalleryModal.title}
              </h3>
              <p className="text-xs text-[#2596be] font-bold flex items-center gap-1">
                <MapPin size={13} />
                <span>{activeGalleryModal.location} ({activeGalleryModal.date})</span>
              </p>
              <p className="text-xs text-slate-600 font-normal leading-relaxed pt-1">
                {activeGalleryModal.description}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* -------------------------------------------------
          VIDEO PLAYER MODAL
      ------------------------------------------------- */}
      {activeVideoModal && (
        <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-3xl w-full overflow-hidden shadow-2xl animate-in zoom-in-95 duration-150 flex flex-col">
            <div className="bg-[#031b4e] text-white p-4 flex justify-between items-center">
              <h3 className="font-bold text-sm text-white truncate pr-4">
                {activeVideoModal.title}
              </h3>
              <button 
                onClick={() => setActiveVideoModal(null)}
                className="text-slate-300 hover:text-white bg-white/10 p-1.5 rounded-full transition-colors shrink-0"
              >
                <X size={16} />
              </button>
            </div>

            <div className="relative aspect-video bg-black">
              <iframe
                src={`https://www.youtube.com/embed/${activeVideoModal.youtubeId}?autoplay=1`}
                title={activeVideoModal.title}
                className="w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>

            <div className="p-5 space-y-1 bg-white text-xs">
              <p className="font-semibold text-slate-800">{activeVideoModal.description}</p>
              <p className="text-[11px] text-slate-400">Duration: {activeVideoModal.duration} • Category: {activeVideoModal.category}</p>
            </div>
          </div>
        </div>
      )}

      {/* -------------------------------------------------
          MEDIA INQUIRY FORM MODAL
      ------------------------------------------------- */}
      {isInquiryModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full border border-slate-200 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150">
            <div className="bg-[#031b4e] text-white p-5 flex justify-between items-center">
              <div>
                <span className="text-[10px] font-bold text-cyan-300 bg-cyan-500/20 px-2 py-0.5 rounded uppercase tracking-wider">
                  Corporate PR Desk
                </span>
                <h3 className="font-bold text-base text-white mt-1">
                  Send Media Inquiry
                </h3>
              </div>
              <button 
                onClick={() => setIsInquiryModalOpen(false)}
                className="text-slate-300 hover:text-white bg-white/10 p-1.5 rounded-full transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            {inquirySubmitted ? (
              <div className="p-8 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                  <CheckCircle2 size={24} />
                </div>
                <h4 className="font-extrabold text-base text-[#031b4e]">Inquiry Submitted Successfully</h4>
                <p className="text-xs text-slate-600 font-normal">
                  Thank you for contacting Cool Technologies Corporate Media Desk. Our press team will review your request and get back to you within 2 business hours.
                </p>
              </div>
            ) : (
              <form onSubmit={handleInquirySubmit} className="p-6 space-y-4 text-xs">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Your Full Name *</label>
                  <input
                    type="text"
                    required
                    value={inquiryName}
                    onChange={(e) => setInquiryName(e.target.value)}
                    placeholder="e.g. Sarah Jenkins"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#2596be]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Media Publication / Org *</label>
                    <input
                      type="text"
                      required
                      value={inquiryOrg}
                      onChange={(e) => setInquiryOrg(e.target.value)}
                      placeholder="e.g. Gulf Business / MEP Digest"
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#2596be]"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Inquiry Type *</label>
                    <select
                      value={inquiryType}
                      onChange={(e) => setInquiryType(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#2596be]"
                    >
                      <option value="Press & Media Kit">Press & Media Kit</option>
                      <option value="Executive Interview">Executive Interview</option>
                      <option value="High-Res Image Assets">High-Res Image Assets</option>
                      <option value="Editorial Collaboration">Editorial Collaboration</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Email Address *</label>
                    <input
                      type="email"
                      required
                      value={inquiryEmail}
                      onChange={(e) => setInquiryEmail(e.target.value)}
                      placeholder="s.jenkins@publication.com"
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#2596be]"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Phone / WhatsApp</label>
                    <input
                      type="text"
                      value={inquiryPhone}
                      onChange={(e) => setInquiryPhone(e.target.value)}
                      placeholder="+971 50 123 4567"
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#2596be]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">Message / Specific Request *</label>
                  <textarea
                    required
                    rows={3}
                    value={inquiryMessage}
                    onChange={(e) => setInquiryMessage(e.target.value)}
                    placeholder="Describe your article requirements, deadlines, or requested media kit files..."
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#2596be]"
                  ></textarea>
                </div>

                <div className="pt-2 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsInquiryModalOpen(false)}
                    className="bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold px-4 py-2.5 rounded-xl transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-[#031b4e] hover:bg-[#2596be] text-white font-bold px-5 py-2.5 rounded-xl transition-colors"
                  >
                    Submit Media Request
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
