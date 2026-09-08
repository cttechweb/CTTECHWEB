import React, { useState, useEffect } from "react";
import { 
  Wrench, Sparkles, Phone, ArrowLeft,
  ChevronRight, ChevronLeft, FileText, Thermometer, Wind, Droplet, Snowflake, Zap,
  RefreshCw, Calendar, CheckCircle2, Clock, Star, Quote, ThumbsUp, ShieldCheck, Filter,
  MessageSquare, User, Send, X, Download, Building, Award, ClipboardList, CheckCircle, Heart, Eye, Check, Loader2,
  Upload, Camera, Trash2, Share2, Copy, Linkedin, Twitter
} from "lucide-react";
import { SERVICES } from "../data";
import { ServiceItem, Product } from "../types";
import { ReviewItem } from "../types/review";
import { useWishlist } from "../context/WishlistContext";
import { useAuth } from "../context/AuthContext";
import { saveReviewToDatabase } from "../lib/reviewService";
import { uploadProductImage } from "../services/storageService";
import { getGeneralSettings } from "../services/generalSettingsService";
import { openServiceWhatsAppOrder } from "../utils/whatsappOrder";

interface ServicesPageProps {
  onRequestQuoteWithService: (serviceName: string) => void;
  onAddToCart?: (product: Product, quantity: number) => void;
  onOpenAbout?: () => void;
  onOpenLogin?: () => void;
  reviews?: ReviewItem[];
  services?: ServiceItem[];
}

export function serviceToProduct(service: ServiceItem): Product {
  return {
    id: `service-${service.id}`,
    name: service.title,
    brand: "Cool Technologies Service",
    category: "Services & Engineering",
    price: 0,
    hidePrice: true,
    rating: 5.0,
    image: service.image || "/src/assets/images/hvac_air_conditioner_1784350824930.jpg",
    description: service.tagline || service.description,
    inStock: true,
    minOrderQty: 1,
    status: "active",
    specifications: {
      "Service Category": service.category,
      "SLA Response": service.specs?.sla || "Scheduled Dispatch",
      "Warranty": service.specs?.warranty || "100% Quality Guaranteed",
      "Service Scope": service.specs?.targetAudience || "Commercial & Residential",
      "Certified By": service.specs?.certifiedFor || "ISO & UAE Municipal Compliant",
    },
    features: service.features || [],
    tags: ["Service", service.category, "Field Engineering"]
  };
}


interface ServiceReview {
  id: string;
  serviceTitle: string;
  authorName: string;
  authorRole: string;
  location: string;
  rating: number;
  date: string;
  comment: string;
  verifiedBooking: boolean;
}

export default function ServicesPage({ 
  onRequestQuoteWithService, 
  onAddToCart,
  onOpenAbout,
  onOpenLogin,
  reviews, 
  services: servicesProp 
}: ServicesPageProps) {
  const { isInWishlist, toggleWishlist } = useWishlist();
  const [activeTab, setActiveTab] = useState<string>("all");
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [detailImageIdx, setDetailImageIdx] = useState<number>(0);
  const [copied, setCopied] = useState<boolean>(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState<boolean>(false);
  const [isCopiedLink, setIsCopiedLink] = useState<boolean>(false);
  const itemsPerPage = 10;

  // Dynamic emergency dispatch hotline
  const [emergencyPhone, setEmergencyPhone] = useState<string>(() => {
    const settings = getGeneralSettings();
    return settings.departmentHotlines?.servicesEmergencyPhone || settings.phone || "+971 2 565 0123";
  });

  useEffect(() => {
    const handleSettingsUpdated = () => {
      const settings = getGeneralSettings();
      setEmergencyPhone(settings.departmentHotlines?.servicesEmergencyPhone || settings.phone || "+971 2 565 0123");
    };
    window.addEventListener("cooltech_contact_settings_updated", handleSettingsUpdated);
    window.addEventListener("cooltech_settings_updated", handleSettingsUpdated);
    return () => {
      window.removeEventListener("cooltech_contact_settings_updated", handleSettingsUpdated);
      window.removeEventListener("cooltech_settings_updated", handleSettingsUpdated);
    };
  }, []);

  // Authentication Context
  const { user, profile, isLoading: isAuthLoading } = useAuth();

  // Review Modal State
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [newReview, setNewReview] = useState({
    name: "",
    service: "AC Deep Chemical Cleaning & Sanitization",
    rating: 5,
    location: "Dubai, UAE",
    comment: "",
    avatar: ""
  });
  const [reviewSubmitted, setReviewSubmitted] = useState(false);
  const reviewFileInputRef = React.useRef<HTMLInputElement>(null);

  // Auto-open review modal if redirected back after login (#/services?action=review)
  useEffect(() => {
    const handleReviewRedirectCheck = () => {
      const hash = window.location.hash || "";
      if (hash.includes("action=review")) {
        if (user) {
          setNewReview(prev => ({
            ...prev,
            name: profile?.name || user.displayName || user.email?.split("@")[0] || "",
            location: profile?.address || "Dubai, UAE",
            rating: 5,
            comment: "",
            avatar: user.photoURL || prev.avatar || ""
          }));
          setIsReviewModalOpen(true);
          // Cleanly remove action=review without reloading page
          const clean = hash.replace(/[?&]action=review(&|$)/, "").replace(/\?$/, "");
          window.history.replaceState(null, "", window.location.pathname + clean);
        }
      }
    };

    if (!isAuthLoading) {
      handleReviewRedirectCheck();
    }
  }, [isAuthLoading, user, profile]);

  const handleOpenReviewModal = () => {
    if (!user) {
      sessionStorage.setItem("ct_redirect_after_login", "#/services?action=review");
      if (onOpenLogin) {
        onOpenLogin();
      } else {
        window.location.hash = "#/login?redirect=" + encodeURIComponent("services?action=review");
      }
      return;
    }
    setNewReview(prev => ({
      ...prev,
      name: profile?.name || user.displayName || user.email?.split("@")[0] || "",
      location: profile?.address || "Dubai, UAE",
      service: services[0]?.title || "AC Deep Chemical Cleaning & Sanitization",
      rating: 5,
      comment: "",
      avatar: user.photoURL || ""
    }));
    setIsReviewModalOpen(true);
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert("Image size should be under 5MB.");
      return;
    }

    setIsUploadingPhoto(true);
    const reader = new FileReader();
    reader.onloadend = () => {
      setNewReview(prev => ({ ...prev, avatar: reader.result as string }));
    };
    reader.readAsDataURL(file);

    try {
      const result = await uploadProductImage(file, "reviews");
      if (result?.url) {
        setNewReview(prev => ({ ...prev, avatar: result.url }));
      }
    } catch (err) {
      console.warn("Photo upload fallback to preview:", err);
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  const handleRemovePhoto = () => {
    setNewReview(prev => ({ ...prev, avatar: "" }));
    if (reviewFileInputRef.current) {
      reviewFileInputRef.current.value = "";
    }
  };

  // Synchronize hash state for deep linking
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (hash.includes("?id=")) {
        const id = hash.split("?id=")[1];
        if (id) setSelectedServiceId(id);
      }
    };
    handleHashChange();
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  // Services dataset (dynamic from D1 with fallback to src/data.ts)
  const services = (servicesProp && servicesProp.length > 0) ? servicesProp : SERVICES;

  // Dynamically filter approved service reviews
  const approvedServiceReviews = reviews
    ? reviews.filter(r => r.target === "service" && r.status === "approved")
    : [];

  // Verified Customer Reviews Dataset
  const serviceReviews: ServiceReview[] = [
    {
      id: "rev-1",
      serviceTitle: "AC Deep Chemical Cleaning & Sanitization",
      authorName: "Tariq Al Mansoori",
      authorRole: "Facility Director",
      location: "Dubai Marina Heights, UAE",
      rating: 5,
      date: "July 18, 2026",
      comment: "We contracted Cool Technologies for deep chemical foam cleaning across 45 residential units. The cooling output improved immediately and air odor completely vanished. Extremely punctual and clean work with floor protection mats used throughout.",
      verifiedBooking: true
    },
    {
      id: "rev-2",
      serviceTitle: "Water Tank Chiller Installation & Servicing",
      authorName: "Sarah Jenkins",
      authorRole: "Villa Resident",
      location: "Saadiyat Island, Abu Dhabi",
      rating: 5,
      date: "July 12, 2026",
      comment: "During peak July heat, our water tank was reaching unlivable temperatures. Cool Technologies installed a 3 Ton tank chiller within 24 hours of my call. The water temperature is now a refreshing 22°C continuously. Outstanding service!",
      verifiedBooking: true
    },
    {
      id: "rev-3",
      serviceTitle: "GI / Pre-Insulated Duct Fabrication & Air Balancing",
      authorName: "Vikram Patel",
      authorRole: "Senior Operations Lead",
      location: "JAFZA Logistics Hub, Dubai",
      rating: 5,
      date: "June 29, 2026",
      comment: "Their sheet metal engineering team fabricated custom PI ducts for our 12,000 sq ft logistics office with precision. Anemometer balancing reports were provided upon completion showing uniform airflow in every zone.",
      verifiedBooking: true
    },
    {
      id: "rev-4",
      serviceTitle: "24/7 Emergency AC Repair & Diagnostics",
      authorName: "Ahmed Hassan",
      authorRole: "Hotel Maintenance Manager",
      location: "Business Bay, Dubai",
      rating: 5,
      date: "June 21, 2026",
      comment: "Our rooftop chiller package unit tripped at 2:00 AM on a Friday night. Their mobile emergency van arrived in under 45 minutes, replaced a faulty contactor & capacitor, and restored full cooling before guest disruption occurred.",
      verifiedBooking: true
    },
    {
      id: "rev-5",
      serviceTitle: "Cold Room & Ice Machine Maintenance",
      authorName: "Elena Rostova",
      authorRole: "General Manager",
      location: "Downtown Dubai",
      rating: 5,
      date: "June 14, 2026",
      comment: "Regular descaling and seal maintenance by Cool Technologies has kept our restaurant walk-in freezer running at -18°C reliably without ice buildup. Highly trustworthy team for commercial food safety compliance.",
      verifiedBooking: true
    },
    {
      id: "rev-6",
      serviceTitle: "Annual Maintenance Contracts (AMC & PPM)",
      authorName: "Marcus Vance",
      authorRole: "MEP Project Manager",
      location: "Yas Island, Abu Dhabi",
      rating: 5,
      date: "May 30, 2026",
      comment: "We renewed our annual PPM contract for the 3rd year with Cool Technologies. Their digital inspection logs and quarterly preventive checks have reduced breakdown calls by over 80%. Top tier HVAC partner in the region.",
      verifiedBooking: true
    }
  ];

  // Filtering & Pagination Logic
  const filteredServices = activeTab === "all" 
    ? services 
    : services.filter(s => s.category === activeTab);

  const totalPages = Math.ceil(filteredServices.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedServices = filteredServices.slice(startIndex, endIndex);

  // Reset page when switching tabs
  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    setCurrentPage(1);
    const container = document.getElementById("services-list-container");
    if (container) {
      container.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  // Smooth scroll to top of service list on page switch
  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      const container = document.getElementById("services-list-container");
      if (container) {
        container.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
  };

  const handleReviewFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReview.name.trim() || !newReview.comment.trim()) return;

    if (!user) {
      sessionStorage.setItem("ct_redirect_after_login", "#/services?action=review");
      window.location.hash = "#/login?redirect=" + encodeURIComponent("services?action=review");
      return;
    }

    setIsSubmittingReview(true);

    const reviewToSave: ReviewItem = {
      id: `rev-svc-${Date.now()}`,
      authorName: newReview.name.trim(),
      authorRole: (profile?.companyName ? `${profile.companyName}` : profile?.designation) || "Verified Client",
      location: newReview.location.trim() || "UAE",
      rating: newReview.rating,
      comment: newReview.comment.trim(),
      target: "service",
      serviceTitle: newReview.service,
      authorAvatar: newReview.avatar || user?.photoURL || undefined,
      status: "pending", // ALWAYS set to pending so it requires admin moderation
      createdAt: new Date().toISOString(),
      verifiedBooking: true,
      userId: user.uid,
      userEmail: user.email || undefined
    };

    try {
      await saveReviewToDatabase(reviewToSave);
    } catch (err) {
      console.error("Error saving review:", err);
    } finally {
      setIsSubmittingReview(false);
      setReviewSubmitted(true);
    }

    setTimeout(() => {
      setReviewSubmitted(false);
      setIsReviewModalOpen(false);
      setNewReview({
        name: "",
        service: services[0]?.title || "AC Deep Chemical Cleaning & Sanitization",
        rating: 5,
        location: "Dubai, UAE",
        comment: "",
        avatar: ""
      });
    }, 2800);
  };

  const selectedService = services.find(s => s.id === selectedServiceId);

  // Generate 4 image gallery thumbnails for the service
  const serviceImages = selectedService ? [
    selectedService.image,
    "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1581094288338-2314dddb7ece?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1621905252507-b35492cc74b4?auto=format&fit=crop&w=800&q=80"
  ] : [];

  const handlePrevDetailImage = () => {
    setDetailImageIdx((prev) => (prev === 0 ? serviceImages.length - 1 : prev - 1));
  };

  const handleNextDetailImage = () => {
    setDetailImageIdx((prev) => (prev === serviceImages.length - 1 ? 0 : prev + 1));
  };

  // ==========================================
  // SPECIFIC SERVICE DETAIL VIEW (MATCHING PRODUCT DETAIL PAGE)
  // ==========================================
  if (selectedService) {
    return (
      <div className="w-full bg-white min-h-screen py-6 md:py-10 text-slate-800 font-sans" id="service-detail-view">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          
          {/* Breadcrumbs Navigation Bar matching Product Detail Page */}
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6 text-xs text-slate-400 font-semibold" id="service-breadcrumbs">
            <div className="flex items-center gap-1.5">
              <button 
                onClick={() => {
                  setSelectedServiceId(null);
                  setDetailImageIdx(0);
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                className="hover:text-[#2596be] transition-colors flex items-center gap-1 cursor-pointer"
              >
                Home
              </button>
              <span>&gt;</span>
              <button 
                onClick={() => {
                  setSelectedServiceId(null);
                  setDetailImageIdx(0);
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                className="hover:text-[#2596be] transition-colors cursor-pointer"
              >
                Services
              </button>
              <span>&gt;</span>
              <span className="text-[#2596be] uppercase">{selectedService.category}</span>
              <span>&gt;</span>
              <span className="text-slate-600 truncate max-w-[200px] sm:max-w-xs">{selectedService.title}</span>
            </div>
            
            <button 
              onClick={() => {
                setSelectedServiceId(null);
                setDetailImageIdx(0);
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              className="flex items-center gap-1.5 text-slate-500 hover:text-[#2596be] transition-colors cursor-pointer"
              id="return-to-services-btn"
            >
              <ArrowLeft size={14} />
              <span>Return to Services Directory</span>
            </button>
          </div>

          {/* TOP SECTION: Gallery & Service Specification Details */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 md:gap-12 py-4 mb-10 text-slate-800" id="service-overview-card">
            
            {/* Left Column: Image Gallery Module (col-span 5) */}
            <div className="lg:col-span-5 flex flex-col gap-4">
              {/* Active Main Image Container with arrows */}
              <div className="relative aspect-video sm:aspect-square bg-[#f8fafc] border border-slate-100 rounded-xl overflow-hidden flex items-center justify-center group shadow-xs">
                <img 
                  src={serviceImages[detailImageIdx]} 
                  alt={selectedService.title} 
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  referrerPolicy="no-referrer"
                />
                
                {/* Previous Arrow */}
                <button 
                  onClick={handlePrevDetailImage}
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/90 border border-slate-200 text-slate-600 flex items-center justify-center hover:bg-[#2596be] hover:text-white transition-colors shadow-sm cursor-pointer"
                  title="Previous Image"
                >
                  <ChevronLeft size={16} className="stroke-[2.5]" />
                </button>

                {/* Next Arrow */}
                <button 
                  onClick={handleNextDetailImage}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/90 border border-slate-200 text-slate-600 flex items-center justify-center hover:bg-[#2596be] hover:text-white transition-colors shadow-sm cursor-pointer"
                  title="Next Image"
                >
                  <ChevronRight size={16} className="stroke-[2.5]" />
                </button>
              </div>

              {/* Thumbnail Navigation Strip */}
              <div className="grid grid-cols-4 gap-3">
                {serviceImages.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setDetailImageIdx(idx)}
                    className={`aspect-square bg-[#f8fafc] border rounded-lg overflow-hidden flex items-center justify-center transition-all cursor-pointer ${
                      detailImageIdx === idx 
                        ? "border-[#2596be] ring-2 ring-blue-100" 
                        : "border-slate-200 hover:border-slate-300 opacity-70 hover:opacity-100"
                    }`}
                  >
                    <img 
                      src={img} 
                      alt={`Thumbnail ${idx + 1}`} 
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Right Column: Commercial Summary & Key Specifications (col-span 7) */}
            <div className="lg:col-span-7 flex flex-col justify-between" id="service-commercial-specs">
              <div>
                {/* Category tag */}
                <span className="text-xs font-bold text-[#2596be] uppercase tracking-widest block mb-2" id="detail-category-badge">
                  {selectedService.category}
                </span>

                {/* Service Title */}
                <h1 className="font-sans font-black text-2xl sm:text-3xl text-[#031b4e] uppercase leading-tight tracking-tight mb-1" id="detail-service-title">
                  {selectedService.title}
                </h1>

                {/* Service Model ID */}
                <div className="text-xs font-mono font-extrabold text-slate-400 mb-4 tracking-wider uppercase">
                  Service ID: <span className="text-slate-600">SRV-{selectedService.id.toUpperCase()}</span>
                </div>

                {/* SLA / Dispatch Status Badge */}
                <div className="flex flex-wrap items-center gap-3 mb-6">
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                    ● DISPATCH READY WITHIN 2 HOURS
                  </span>
                  <span className="text-[11px] text-slate-400 font-semibold">Min. SLA: {selectedService.specs.sla}</span>
                </div>

                {/* Sourcing & Technical Certifications Row */}
                <div className="border-t border-b border-slate-100 py-3 mb-6 flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block">SERVICE CHANNEL</span>
                    <span className="text-xs font-black text-slate-700 uppercase">DIRECT OEM / FIELD TECHS</span>
                  </div>
                  <div className="h-4 w-px bg-slate-200 hidden sm:block"></div>
                  <div>
                    <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block">CERTIFICATION</span>
                    <span className="text-xs font-black text-slate-700 uppercase">ISO / MUNICIPAL APPROVED</span>
                  </div>
                  <div className="h-4 w-px bg-slate-200 hidden sm:block"></div>
                  <div>
                    <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block">PRIMARY REGION</span>
                    <span className="text-xs font-black text-[#2596be] uppercase font-sans">GCC & UAE MARKET</span>
                  </div>
                </div>

                {/* Description */}
                <p className="text-sm text-slate-500 leading-relaxed font-medium mb-6">
                  {selectedService.description}
                </p>

                {/* 4-Column Key Metrics Spec Cards (Matching Product Detail Page) */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 mb-8" id="key-spec-cards-grid">
                  
                  {/* Spec Box 1: Response Time */}
                  <div className="bg-slate-50/80 border border-slate-100 rounded-xl p-3 flex flex-col items-center text-center justify-center">
                    <div className="w-8 h-8 rounded-full bg-blue-50 text-[#2596be] flex items-center justify-center mb-2">
                      <Clock size={16} className="stroke-[2.5]" />
                    </div>
                    <span className="text-[10px] text-slate-400 font-black uppercase tracking-wider block">Response Time</span>
                    <span className="text-xs font-extrabold text-[#031b4e] mt-1 leading-tight">{selectedService.specs.sla}</span>
                  </div>

                  {/* Spec Box 2: Warranty */}
                  <div className="bg-slate-50/80 border border-slate-100 rounded-xl p-3 flex flex-col items-center text-center justify-center">
                    <div className="w-8 h-8 rounded-full bg-blue-50 text-[#2596be] flex items-center justify-center mb-2">
                      <ShieldCheck size={16} className="stroke-[2.5]" />
                    </div>
                    <span className="text-[10px] text-slate-400 font-black uppercase tracking-wider block">Warranty</span>
                    <span className="text-xs font-extrabold text-[#031b4e] mt-1 leading-tight">{selectedService.specs.warranty}</span>
                  </div>

                  {/* Spec Box 3: Target Units */}
                  <div className="bg-slate-50/80 border border-slate-100 rounded-xl p-3 flex flex-col items-center text-center justify-center">
                    <div className="w-8 h-8 rounded-full bg-blue-50 text-[#2596be] flex items-center justify-center mb-2">
                      <Building size={16} className="stroke-[2.5]" />
                    </div>
                    <span className="text-[10px] text-slate-400 font-black uppercase tracking-wider block">Target Units</span>
                    <span className="text-xs font-extrabold text-[#031b4e] mt-1 leading-tight line-clamp-1">{selectedService.specs.targetAudience}</span>
                  </div>

                  {/* Spec Box 4: Certified For */}
                  <div className="bg-slate-50/80 border border-slate-100 rounded-xl p-3 flex flex-col items-center text-center justify-center">
                    <div className="w-8 h-8 rounded-full bg-blue-50 text-[#2596be] flex items-center justify-center mb-2">
                      <Award size={16} className="stroke-[2.5]" />
                    </div>
                    <span className="text-[10px] text-slate-400 font-black uppercase tracking-wider block">Certified For</span>
                    <span className="text-xs font-extrabold text-[#031b4e] mt-1 leading-tight line-clamp-1">{selectedService.specs.certifiedFor}</span>
                  </div>

                </div>
              </div>

              {/* Action Buttons Bar matching Product Detail Page */}
              <div className="space-y-3">
                <div className="flex flex-col sm:flex-row items-stretch gap-3 border-t border-slate-100 pt-6">
                  
                  {/* Add to Quote Button */}
                  <button
                    onClick={() => {
                      if (onAddToCart) {
                        onAddToCart(serviceToProduct(selectedService), 1);
                      } else {
                        onRequestQuoteWithService(selectedService.title);
                      }
                    }}
                    className="flex-1 h-12 bg-[#2596be] hover:bg-[#1c7e9f] text-white rounded-lg text-xs font-black tracking-wider uppercase shadow-md hover:shadow-lg active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer"
                    id="detail-add-quote-service-btn"
                  >
                    <ClipboardList size={15} />
                    <span>Add Service to Quote</span>
                  </button>

                  {/* Download Brochure / Scope Button */}
                  <button
                    onClick={() => {
                      setCopied(true);
                      setTimeout(() => setCopied(false), 2000);
                    }}
                    className="px-5 h-12 border border-slate-200 hover:border-[#2596be] hover:text-[#2596be] text-slate-600 rounded-lg text-xs font-black tracking-wider uppercase transition-all flex items-center justify-center gap-2 bg-white cursor-pointer"
                    id="detail-download-brochure-btn"
                  >
                    <Download size={15} />
                    <span>{copied ? "Scope PDF Saved" : "Download Brochure"}</span>
                  </button>

                  {/* Direct WhatsApp Order / Inquiry */}
                  <button
                    type="button"
                    onClick={() => openServiceWhatsAppOrder(selectedService)}
                    className="px-5 h-12 bg-[#25D366] hover:bg-[#20bd5a] text-white rounded-lg text-xs font-black tracking-wider uppercase transition-all shadow-md hover:shadow-lg active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
                    id="service-whatsapp-order-btn"
                    title="Book service or inquire directly via WhatsApp"
                  >
                    <img src="/whatsapp-official.png" alt="WhatsApp" className="w-4 h-4 object-contain shrink-0" />
                    <span>Order via WhatsApp</span>
                  </button>

                  {/* Share Service */}
                  <button
                    type="button"
                    onClick={() => setIsShareModalOpen(true)}
                    className="px-4 h-12 border border-slate-200 hover:border-[#2596be] hover:text-[#2596be] text-slate-600 rounded-lg text-xs font-black tracking-wider uppercase transition-all flex items-center justify-center gap-2 bg-white cursor-pointer active:scale-95"
                    id="service-share-btn"
                    title="Share this service link & preview"
                  >
                    <Share2 size={15} />
                    <span>Share</span>
                  </button>

                </div>

                {/* Emergency Hotline Direct Line */}
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-2">
                  <span className="text-xs text-slate-500 font-medium text-center sm:text-left">Need immediate emergency service dispatch?</span>
                  <a 
                    href={`tel:${emergencyPhone.replace(/[^0-9+]/g, "")}`} 
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-[#031b4e] hover:text-[#2596be] transition-colors"
                  >
                    <Phone size={13} />
                    <span>{emergencyPhone}</span>
                  </a>
                </div>
              </div>

            </div>

          </div>

          {/* LOWER SECTION: Technical Scope of Work & Verified Reviews */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pt-6 border-t border-slate-200">
            
            {/* Left: Scope of Work */}
            <div className="lg:col-span-7 bg-white rounded-xl p-6 border border-slate-200 shadow-2xs space-y-4">
              <h2 className="font-display font-extrabold text-base text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
                <FileText size={18} className="text-[#2596be]" />
                <span>Scope of Work & Technical Standards</span>
              </h2>
              
              <div className="space-y-2.5">
                {selectedService.features.map((item, idx) => (
                  <div key={idx} className="flex items-start gap-3 bg-slate-50 p-3.5 rounded-lg border border-slate-200/60">
                    <CheckCircle2 size={16} className="text-emerald-600 shrink-0 mt-0.5" />
                    <span className="text-xs font-semibold text-slate-800 leading-relaxed">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Service Verified Reviews */}
            <div className="lg:col-span-5 bg-white rounded-xl p-6 border border-slate-200 shadow-2xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h2 className="font-display font-extrabold text-base text-slate-900 flex items-center gap-2">
                  <Star size={18} className="text-amber-500 fill-amber-500" />
                  <span>Customer Verification</span>
                </h2>
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                  5.0 ★ (Verified)
                </span>
              </div>

              <div className="space-y-3">
                {serviceReviews.slice(0, 2).map((rev) => (
                  <div key={rev.id} className="p-3.5 bg-slate-50 rounded-lg border border-slate-100 space-y-1.5 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900">{rev.authorName}</span>
                      <span className="text-[10px] text-slate-400 font-medium">{rev.date}</span>
                    </div>
                    <div className="text-[11px] text-slate-500 font-medium">{rev.authorRole} • {rev.location}</div>
                    <p className="text-slate-600 italic line-clamp-3">"{rev.comment}"</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

        {/* ================= SOCIAL SHARE SERVICE MODAL ================= */}
        {isShareModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div 
              className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden relative"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-[#2596be]/10 text-[#2596be] flex items-center justify-center font-bold">
                    <Share2 size={16} />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-slate-900">Share Service</h3>
                    <p className="text-[11px] text-slate-500 font-medium">Send engineering scope, standards and booking link</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsShareModalOpen(false)}
                  className="w-8 h-8 rounded-full hover:bg-slate-200/70 text-slate-400 hover:text-slate-700 flex items-center justify-center transition-colors cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 space-y-5">
                {/* Social Card Preview */}
                <div className="space-y-1.5">
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Card Preview (As Seen on Social Media & WhatsApp)</span>
                  <div className="border border-slate-200 rounded-xl overflow-hidden shadow-xs bg-slate-50">
                    <div className="h-40 w-full bg-slate-100 relative overflow-hidden flex items-center justify-center border-b border-slate-100">
                      <img 
                        src={selectedService.image || "/src/assets/images/hvac_air_conditioner_1784350824930.jpg"} 
                        alt={selectedService.title} 
                        className="w-full h-full object-cover" 
                      />
                      <span className="absolute top-2 right-2 px-2 py-0.5 bg-slate-900/80 text-white rounded text-[10px] font-bold uppercase tracking-wider">
                        {selectedService.category}
                      </span>
                    </div>
                    <div className="p-3 bg-white space-y-1">
                      <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">cooltechnologies.ae</div>
                      <div className="text-xs font-bold text-slate-800 line-clamp-1">{selectedService.title} | Cool Technologies UAE</div>
                      <div className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                        {selectedService.description || selectedService.tagline || `Certified HVAC engineering and services by Cool Technologies UAE.`}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Direct Link Box */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Direct Share Link</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      readOnly
                      value={typeof window !== 'undefined' ? `${window.location.origin}${window.location.pathname}#/services?id=${selectedService.id}` : `https://cooltechnologies.ae/#/services?id=${selectedService.id}`}
                      className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-700 font-mono select-all focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const url = `${window.location.origin}${window.location.pathname}#/services?id=${selectedService.id}`;
                        navigator.clipboard.writeText(url);
                        setIsCopiedLink(true);
                        setTimeout(() => setIsCopiedLink(false), 2000);
                      }}
                      className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
                        isCopiedLink 
                          ? "bg-emerald-600 text-white" 
                          : "bg-slate-900 hover:bg-slate-800 text-white active:scale-95"
                      }`}
                    >
                      {isCopiedLink ? (
                        <>
                          <Check size={13} />
                          <span>Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy size={13} />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Channel Sharing Buttons */}
                <div className="space-y-1.5 pt-1">
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Share Instantly To</label>
                  <div className="grid grid-cols-3 gap-2.5">
                    {/* WhatsApp */}
                    <a
                      href={`https://wa.me/?text=${encodeURIComponent(
                        `*Check out ${selectedService.title} by Cool Technologies UAE*\n\nCategory: ${selectedService.category}\n\nView service scope & booking:\n${typeof window !== 'undefined' ? `${window.location.origin}${window.location.pathname}#/services?id=${selectedService.id}` : `https://cooltechnologies.ae/#/services?id=${selectedService.id}`}`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex flex-col items-center justify-center gap-1.5 p-3 rounded-xl border border-emerald-100 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-xs transition-colors cursor-pointer group"
                    >
                      <img src="/whatsapp-official.png" alt="WhatsApp" className="w-5 h-5 object-contain group-hover:scale-110 transition-transform" />
                      <span>WhatsApp</span>
                    </a>

                    {/* LinkedIn */}
                    <a
                      href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
                        typeof window !== 'undefined' ? `${window.location.origin}${window.location.pathname}#/services?id=${selectedService.id}` : `https://cooltechnologies.ae/#/services?id=${selectedService.id}`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex flex-col items-center justify-center gap-1.5 p-3 rounded-xl border border-blue-100 bg-blue-50 hover:bg-blue-100 text-blue-800 font-bold text-xs transition-colors cursor-pointer group"
                    >
                      <Linkedin size={20} className="text-[#0A66C2] group-hover:scale-110 transition-transform" />
                      <span>LinkedIn</span>
                    </a>

                    {/* Twitter / X */}
                    <a
                      href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(
                        `Check out ${selectedService.title} by Cool Technologies UAE`
                      )}&url=${encodeURIComponent(
                        typeof window !== 'undefined' ? `${window.location.origin}${window.location.pathname}#/services?id=${selectedService.id}` : `https://cooltechnologies.ae/#/services?id=${selectedService.id}`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex flex-col items-center justify-center gap-1.5 p-3 rounded-xl border border-slate-200 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition-colors cursor-pointer group"
                    >
                      <Twitter size={20} className="text-slate-800 group-hover:scale-110 transition-transform" />
                      <span>X / Twitter</span>
                    </a>
                  </div>

                  {/* Native Mobile / System Share if available */}
                  {typeof navigator !== "undefined" && typeof navigator.share === "function" && (
                    <button
                      type="button"
                      onClick={() => {
                        navigator.share({
                          title: `${selectedService.title} | Cool Technologies UAE`,
                          text: `Certified HVAC Engineering: ${selectedService.title}`,
                          url: `${window.location.origin}${window.location.pathname}#/services?id=${selectedService.id}`,
                        }).catch(() => {});
                      }}
                      className="w-full mt-2 py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-colors"
                    >
                      <Share2 size={14} />
                      <span>Share with Device Apps...</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

      </div>

    </div>
  );
}

  // ==========================================
  // MAIN SERVICES DIRECTORY (PAGINATED WITH 10 ITEMS PER PAGE)
  // ==========================================
  return (
    <div className="w-full bg-slate-50 min-h-screen font-sans pb-20 text-slate-800 scroll-pt-32" id="services-page">
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8" id="services-list-container">
        
        {/* Header & Filter Controls */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-6 mb-6 shadow-xs">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
            <div>
              {/* Breadcrumb Path */}
              <nav className="flex items-center gap-1.5 text-xs text-slate-400 font-semibold mb-2" aria-label="Breadcrumb">
                <a 
                  href="#home" 
                  onClick={(e) => {
                    e.preventDefault();
                    window.location.hash = "";
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  className="hover:text-[#031b4e] transition-colors"
                >
                  Home
                </a>
                <ChevronRight size={12} className="text-slate-400" />
                <span className="font-extrabold text-[#031b4e]">
                  Services Directory
                </span>
              </nav>

              <h1 className="font-sans font-black text-xl sm:text-3xl text-slate-900 tracking-tight">
                Services Directory
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
                Select any HVAC service to view full scope, specifications, or book direct dispatch.
              </p>
            </div>
          </div>

          {/* Swipeable Category Filter Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none border-t border-slate-100 pt-4">
            {[
              { id: "all", label: "All Services" },
              { id: "cleaning", label: "Cleaning" },
              { id: "installation", label: "Installation" },
              { id: "maintenance", label: "Maintenance" },
              { id: "chillers", label: "Chillers" },
              { id: "ducting", label: "Ducting" }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-extrabold transition-all whitespace-nowrap cursor-pointer shrink-0 ${
                  activeTab === tab.id
                    ? "bg-[#031b4e] text-white shadow-xs"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* RESPONSIVE SERVICE CARDS GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6" id="services-line-list">
          {paginatedServices.map((service) => (
            <div 
              key={service.id}
              onClick={() => setSelectedServiceId(service.id)}
              className="bg-white rounded-2xl border border-slate-200 hover:border-[#2596be]/60 overflow-hidden shadow-2xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between group cursor-pointer text-left h-full"
            >
              <div>
                {/* Image Container with clean overlay */}
                <div className="relative w-full h-44 sm:h-48 bg-slate-100 overflow-hidden">
                  <img 
                    src={service.image} 
                    alt={service.title} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    referrerPolicy="no-referrer"
                  />
                  {/* Subtle gradient vignette at bottom for contrast */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent opacity-70"></div>

                  {/* Clean Modern Category Pill Badge */}
                  <span className="absolute top-3 left-3 bg-white/95 backdrop-blur-md text-[#031b4e] text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg border border-slate-200/80 shadow-2xs">
                    {service.category}
                  </span>

                  {/* Wishlist Like Button */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleWishlist({ type: "service", service });
                    }}
                    className={`absolute top-3 right-3 p-2 rounded-full z-10 transition-all cursor-pointer shadow-xs ${
                      isInWishlist(service.id)
                        ? "bg-rose-50 text-rose-600 hover:bg-rose-100 scale-105"
                        : "bg-white/90 hover:bg-white text-slate-400 hover:text-rose-600 backdrop-blur-md border border-slate-200/50"
                    }`}
                    title={isInWishlist(service.id) ? "Remove from Wishlist" : "Save to Wishlist"}
                    aria-label="Save to Wishlist"
                  >
                    <Heart
                      size={14}
                      className={isInWishlist(service.id) ? "fill-rose-500 text-rose-500" : ""}
                    />
                  </button>

                  {/* SLA Badge in bottom-left over image */}
                  <div className="absolute bottom-3 left-3 flex items-center gap-1.5 text-[11px] font-bold text-white bg-black/40 backdrop-blur-md px-2.5 py-1 rounded-md border border-white/20 shadow-xs">
                    <Clock size={12} className="text-cyan-400 shrink-0" />
                    <span className="truncate">SLA: {service.specs.sla}</span>
                  </div>
                </div>

                {/* Content Area */}
                <div className="p-5 space-y-3">
                  {/* Metadata Row */}
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-extrabold uppercase tracking-wider text-[#2596be]">
                      Engineering Service
                    </span>
                    <span className="font-semibold text-slate-400">
                      {service.specs.warranty}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="font-display font-black text-base sm:text-lg text-slate-900 group-hover:text-[#2596be] transition-colors leading-snug line-clamp-2 min-h-[44px]">
                    {service.title}
                  </h3>

                  {/* Tagline */}
                  <p className="text-xs text-slate-500 font-medium line-clamp-2 leading-relaxed min-h-[34px]">
                    {service.tagline}
                  </p>

                  {/* Key Feature Highlight Chips */}
                  {Array.isArray(service.features) && service.features.length > 0 && (
                    <div className="pt-1 flex flex-wrap gap-1.5">
                      {service.features.slice(0, 2).map((feat, fIdx) => (
                        <span 
                          key={fIdx} 
                          className="inline-flex items-center gap-1 text-[10px] font-semibold text-slate-600 bg-slate-50 px-2 py-1 rounded-md border border-slate-100 truncate max-w-full"
                        >
                          <CheckCircle size={10} className="text-emerald-500 shrink-0" />
                          <span className="truncate">{feat}</span>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Action Footer matching ProductCard */}
              <div className="p-5 pt-0">
                <div className="flex items-center gap-2 pt-3.5 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (onAddToCart) {
                        onAddToCart(serviceToProduct(service), 1);
                      } else {
                        onRequestQuoteWithService(service.title);
                      }
                    }}
                    className="flex-1 bg-[#2596be] hover:bg-[#1c7e9f] text-white py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-xs cursor-pointer active:scale-95"
                    id={`add-quote-service-${service.id}`}
                    title="Add service to procurement quote cart"
                  >
                    <ClipboardList size={14} className="shrink-0" />
                    <span>Add to Quote</span>
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      openServiceWhatsAppOrder(service);
                    }}
                    className="p-2.5 bg-emerald-50 text-[#25D366] hover:bg-[#25D366] hover:text-white border border-emerald-200/80 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer flex items-center justify-center group/wa"
                    title="Quick WhatsApp Booking & Inquiry"
                    aria-label="Order on WhatsApp"
                  >
                    <img src="/whatsapp-official.png" alt="WhatsApp" className="w-3.5 h-3.5 object-contain" />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedServiceId(service.id);
                    }}
                    className="p-2.5 border border-slate-200 hover:border-[#2596be] hover:text-[#2596be] text-slate-600 rounded-xl text-xs font-bold transition-colors shrink-0 cursor-pointer flex items-center justify-center"
                    title="View Full Scope & Specifications"
                    aria-label="View Scope"
                  >
                    <Eye size={15} />
                  </button>
                </div>
              </div>

            </div>
          ))}
        </div>

          {/* ELEGANT NUMERIC PAGINATION CONTROLS (PAGE 1, PAGE 2, PAGE 3...) */}
          {totalPages > 1 && (
            <div className="bg-slate-50 border-t border-slate-200 px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-xs text-slate-500 font-medium">
                Showing <span className="font-bold text-slate-900">{startIndex + 1}</span> to{" "}
                <span className="font-bold text-slate-900">{Math.min(endIndex, filteredServices.length)}</span> of{" "}
                <span className="font-bold text-slate-900">{filteredServices.length}</span> services
              </div>

              <div className="flex items-center gap-1.5">
                {/* Previous Page Button */}
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-bold text-slate-700 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 transition-all"
                  id="pagination-prev-btn"
                >
                  <ChevronLeft size={14} />
                  <span>Previous</span>
                </button>

                {/* Numeric Page Buttons (Page 1, Page 2, Page 3...) */}
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                  <button
                    key={pageNum}
                    onClick={() => handlePageChange(pageNum)}
                    className={`w-8 h-8 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      currentPage === pageNum
                        ? "bg-[#031b4e] text-white shadow-2xs"
                        : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-100"
                    }`}
                    id={`pagination-page-${pageNum}`}
                  >
                    {pageNum}
                  </button>
                ))}

                {/* Next Page Button */}
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-bold text-slate-700 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 transition-all"
                  id="pagination-next-btn"
                >
                  <span>Next</span>
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          )}

        {/* ==================================================== */}
        {/* REVIEWS ABOUT THE SERVICES SECTION (Directly Below Services List) */}
        {/* ==================================================== */}
        {/* CUSTOMER REVIEWS SECTION (Hidden if no approved reviews) */}
        {/* ==================================================== */}
        {approvedServiceReviews.length > 0 && (
        <section className="mt-16 pt-12 border-t border-slate-200" id="service-reviews-section">
          
          {/* Reviews Header with Submit Button */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
            <div>
              <span className="text-[11px] font-black uppercase tracking-widest text-[#2596be] block mb-1">
                Verified Feedback
              </span>
              <h2 className="font-display font-black text-2xl sm:text-3xl text-slate-900 tracking-tight">
                Customer Reviews & Service Feedback
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1 max-w-2xl">
                Read authentic feedback from residential villa owners, commercial facility directors, and MEP contractors across the UAE.
              </p>
            </div>

            <button
              type="button"
              onClick={handleOpenReviewModal}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer shadow-xs active:scale-95 self-start sm:self-auto"
              id="leave-service-review-btn"
            >
              <MessageSquare size={14} className="text-cyan-400" />
              <span>Submit Review</span>
            </button>
          </div>

          {/* Verified Customer Reviews Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
            {approvedServiceReviews.map((review) => {
              const name = 'authorName' in review ? review.authorName : (review as any).authorName;
              const role = 'authorRole' in review ? review.authorRole : (review as any).authorRole;
              const avatar = 'authorAvatar' in review ? review.authorAvatar : undefined;
              const dateStr = 'createdAt' in review ? new Date((review as any).createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : (review as any).date;

              return (
                <div 
                  key={review.id}
                  className="bg-white rounded-2xl p-6 border border-slate-200 hover:border-blue-200 shadow-2xs hover:shadow-md transition-all duration-200 flex flex-col justify-between h-full"
                >
                  <div className="space-y-3.5">
                    {/* Rating Stars & Service Badge Row */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1 text-amber-400 shrink-0">
                        {[...Array(review.rating || 5)].map((_, i) => (
                          <Star key={i} size={14} className="fill-amber-400 text-amber-400" />
                        ))}
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {review.verifiedBooking && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                            <ShieldCheck size={11} />
                            <span>Verified Service</span>
                          </span>
                        )}
                        <span className="text-[11px] text-slate-400 font-semibold whitespace-nowrap">
                          {dateStr}
                        </span>
                      </div>
                    </div>

                    {/* Review Text */}
                    <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed italic">
                      "{review.comment}"
                    </p>
                  </div>

                  {/* Reviewer Details Footer (Permanently Pinned to Bottom with min-w-0 and whitespace-nowrap) */}
                  <div className="border-t border-slate-100 pt-4 mt-5 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      {avatar ? (
                        <img 
                          src={avatar} 
                          alt={name} 
                          className="w-10 h-10 rounded-full object-cover border border-slate-200 shadow-2xs shrink-0" 
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-blue-50 text-[#031b4e] font-black text-xs flex items-center justify-center border border-blue-100 shrink-0">
                          {name ? name.charAt(0).toUpperCase() : "C"}
                        </div>
                      )}

                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-black text-slate-900 truncate tracking-tight">
                          {name}
                        </p>
                        <p className="text-[11px] text-[#0f4c81] font-bold truncate mt-0.5">
                          {role} • {review.location}
                        </p>
                        {review.serviceTitle && (
                          <p className="text-[10px] text-slate-400 font-medium truncate mt-0.5" title={review.serviceTitle}>
                            Service: <span className="text-slate-700 font-bold">{review.serviceTitle}</span>
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                </div>
              );
            })}
          </div>

        </section>
        )}

      </div>

      {/* WRITE A SERVICE REVIEW MODAL */}
      {isReviewModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full border border-slate-100 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150">
            
            {/* Modal Header */}
            <div className="bg-[#031b4e] text-white p-5 flex justify-between items-center">
              <div>
                <h3 className="font-display font-bold text-base flex items-center gap-2">
                  <MessageSquare size={16} className="text-cyan-400" />
                  <span>Submit Service Feedback</span>
                </h3>
                <p className="text-xs text-slate-300 mt-0.5">Share your experience with Cool Technologies HVAC engineers</p>
              </div>
              <button 
                onClick={() => setIsReviewModalOpen(false)}
                className="text-white/80 hover:text-white bg-white/10 hover:bg-white/20 w-7 h-7 rounded-full flex items-center justify-center transition-colors focus:outline-none"
              >
                <X size={15} />
              </button>
            </div>

            {/* Modal Body */}
            {reviewSubmitted ? (
              <div className="p-8 text-center space-y-3">
                <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center">
                  <CheckCircle2 size={32} />
                </div>
                <h4 className="font-display font-bold text-slate-900 text-lg">Thank You for Your Feedback!</h4>
                <p className="text-xs text-slate-600 font-medium max-w-sm mx-auto leading-relaxed">
                  Your review has been submitted for administrative verification. Once approved by our team, it will appear live in the Service Directory.
                </p>
                <div className="pt-2">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-800 border border-amber-200 rounded-full text-[11px] font-bold">
                    <Clock size={12} />
                    <span>Status: Pending Admin Approval</span>
                  </span>
                </div>
              </div>
            ) : (
              <form onSubmit={handleReviewFormSubmit} className="p-6 space-y-4">
                
                {/* Authenticated User Banner */}
                {user && (
                  <div className="p-2.5 bg-blue-50/70 border border-blue-100 rounded-xl flex items-center justify-between text-[11px] text-[#031b4e]">
                    <span className="flex items-center gap-1.5 font-semibold">
                      <ShieldCheck size={14} className="text-blue-600 shrink-0" />
                      <span>Submitting as: <strong className="font-bold">{user.email || profile?.name}</strong></span>
                    </span>
                    <span className="text-[10px] text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded font-bold">
                      Verified Client
                    </span>
                  </div>
                )}

                {/* Profile Photo Upload Widget */}
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-3.5">
                  <div className="relative w-12 h-12 rounded-full bg-slate-200 border-2 border-slate-300 overflow-hidden shrink-0 flex items-center justify-center text-slate-600 font-bold text-sm">
                    {newReview.avatar ? (
                      <img src={newReview.avatar} alt="Reviewer" className="w-full h-full object-cover" />
                    ) : (
                      <span>{newReview.name ? newReview.name.charAt(0).toUpperCase() : <Camera size={18} className="text-slate-400" />}</span>
                    )}
                  </div>

                  <div className="flex-1 space-y-1">
                    <input
                      ref={reviewFileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      className="hidden"
                      id="services-review-photo-input"
                    />
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => reviewFileInputRef.current?.click()}
                        disabled={isUploadingPhoto}
                        className="px-3 py-1.5 bg-white hover:bg-slate-100 border border-slate-300 text-slate-800 text-[11px] font-bold rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs disabled:opacity-50"
                      >
                        <Upload size={12} />
                        <span>{isUploadingPhoto ? "Uploading..." : newReview.avatar ? "Change Photo" : "Upload Photo"}</span>
                      </button>

                      {newReview.avatar && (
                        <button
                          type="button"
                          onClick={handleRemovePhoto}
                          className="p-1.5 text-slate-400 hover:text-red-600 transition-colors cursor-pointer rounded-lg hover:bg-red-50"
                          title="Remove photo"
                        >
                          <Trash2 size={13} />
                        </button>
                      )}
                    </div>
                    <p className="text-[10px] text-slate-400">Optional: Attach your photo (under 5MB)</p>
                  </div>
                </div>

                {/* Full Name */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Your Name / Title</label>
                  <input 
                    type="text" 
                    required
                    placeholder="e.g. Mohamed Al Nuaimi"
                    value={newReview.name}
                    onChange={(e) => setNewReview({ ...newReview, name: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:border-[#031b4e]"
                  />
                </div>

                {/* Service Category Selection */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Service Used</label>
                  <select
                    value={newReview.service}
                    onChange={(e) => setNewReview({ ...newReview, service: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:border-[#031b4e]"
                  >
                    {services.map((s) => (
                      <option key={s.id} value={s.title}>{s.title}</option>
                    ))}
                  </select>
                </div>

                {/* Location */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Location / Area</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Al Reem Island, Abu Dhabi"
                    value={newReview.location}
                    onChange={(e) => setNewReview({ ...newReview, location: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:border-[#031b4e]"
                  />
                </div>

                {/* Rating selection */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Service Rating</label>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        type="button"
                        key={star}
                        onClick={() => setNewReview({ ...newReview, rating: star })}
                        className="p-1 hover:scale-110 transition-transform cursor-pointer"
                      >
                        <Star 
                          size={22} 
                          className={star <= newReview.rating ? "fill-amber-400 text-amber-400" : "text-slate-300"} 
                        />
                      </button>
                    ))}
                    <span className="text-xs font-bold text-slate-600 ml-2">{newReview.rating} / 5 Stars</span>
                  </div>
                </div>

                {/* Review comment */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Your Feedback / Comments</label>
                  <textarea
                    required
                    rows={3}
                    placeholder="Tell us about the speed, technical quality, and engineer professionalism..."
                    value={newReview.comment}
                    onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs font-semibold text-slate-800 focus:outline-none focus:border-[#031b4e]"
                  />
                </div>

                {/* Submit button */}
                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsReviewModalOpen(false)}
                    className="px-4 py-2 rounded-lg text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingReview}
                    className="px-5 py-2 rounded-lg text-xs font-bold text-white bg-[#031b4e] hover:bg-[#2596be] transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    {isSubmittingReview ? (
                      <>
                        <Loader2 size={13} className="animate-spin" />
                        <span>Submitting...</span>
                      </>
                    ) : (
                      <>
                        <Send size={13} />
                        <span>Submit for Verification</span>
                      </>
                    )}
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

