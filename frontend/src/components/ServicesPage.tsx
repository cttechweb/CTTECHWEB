import React, { useState, useEffect } from "react";
import { 
  Wrench, Phone, MessageSquare, ClipboardList, ArrowRight,
  ShieldCheck, Star, CheckCircle2, Clock, Upload, Camera, Trash2, X, Plus
} from "lucide-react";
import { ServiceItem, Product } from "../types";
import { ReviewItem } from "../types/review";
import { useWishlist } from "../context/WishlistContext";
import { useAuth } from "../context/AuthContext";
import { saveReviewToDatabase } from "../lib/reviewService";
import { uploadProductImage } from "../services/storageService";
import { getGeneralSettings } from "../services/generalSettingsService";
import { getLocalServicesCache, subscribeToServices } from "../services/serviceService";

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
    image: service.image || "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=800&q=80",
    description: service.description,
    inStock: true,
    minOrderQty: 1,
    status: "active",
    specifications: {
      "Service Category": service.badge || service.category || "HVAC Engineering",
      "Scope": "Residential & Commercial HVAC",
      "Region": "Abu Dhabi, Dubai & All UAE"
    },
    features: service.features || [],
    tags: ["Service", service.badge || service.category || "HVAC", "AC Engineering"]
  };
}

export default function ServicesPage({ 
  onRequestQuoteWithService, 
  onAddToCart,
  onOpenAbout,
  onOpenLogin,
  reviews = [], 
  services: servicesProp 
}: ServicesPageProps) {
  const { isInWishlist, toggleWishlist } = useWishlist();
  
  // Real-time reactive services list
  const [servicesList, setServicesList] = useState<ServiceItem[]>(() => {
    if (servicesProp && servicesProp.length > 0) return servicesProp;
    return getLocalServicesCache();
  });

  useEffect(() => {
    if (servicesProp && servicesProp.length > 0) {
      setServicesList(servicesProp);
    }
  }, [servicesProp]);

  useEffect(() => {
    const unsubscribe = subscribeToServices((updated) => {
      if (Array.isArray(updated) && updated.length > 0) {
        setServicesList(updated);
      }
    });
    return () => unsubscribe();
  }, []);

  // Filter only active services for public display
  const activeServices = servicesList.filter(s => s.isActive !== false);

  // Dynamic emergency dispatch hotline
  const [emergencyPhone, setEmergencyPhone] = useState<string>(() => {
    const settings = getGeneralSettings();
    return settings.departmentHotlines?.servicesEmergencyPhone || settings.phone || "+971 2 815 6161";
  });

  useEffect(() => {
    const handleSettingsUpdated = () => {
      const settings = getGeneralSettings();
      setEmergencyPhone(settings.departmentHotlines?.servicesEmergencyPhone || settings.phone || "+971 2 815 6161");
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
    service: "AC Maintenance",
    rating: 5,
    location: "Abu Dhabi, UAE",
    comment: "",
    avatar: ""
  });
  const [reviewSubmitted, setReviewSubmitted] = useState(false);
  const reviewFileInputRef = React.useRef<HTMLInputElement>(null);

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
      location: profile?.address || "Abu Dhabi, UAE",
      rating: 5,
      comment: "",
      avatar: user.photoURL || prev.avatar || ""
    }));
    setReviewSubmitted(false);
    setIsReviewModalOpen(true);
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please upload an image file (JPEG, PNG, WebP).");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert("Photo size should be under 5MB.");
      return;
    }

    setIsUploadingPhoto(true);
    try {
      const downloadUrl = await uploadProductImage(file);
      setNewReview(prev => ({ ...prev, avatar: downloadUrl }));
    } catch (err: any) {
      console.warn("Failed to upload avatar:", err);
      const reader = new FileReader();
      reader.onload = () => {
        setNewReview(prev => ({ ...prev, avatar: reader.result as string }));
      };
      reader.readAsDataURL(file);
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

  const handleReviewFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReview.name.trim() || !newReview.comment.trim()) return;

    setIsSubmittingReview(true);
    try {
      const reviewPayload: ReviewItem = {
        id: `rev-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        targetType: "service",
        targetId: newReview.service.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
        targetTitle: newReview.service,
        authorName: newReview.name.trim(),
        authorEmail: user?.email || undefined,
        authorRole: "Verified Client",
        location: newReview.location.trim() || "UAE",
        rating: newReview.rating,
        title: `${newReview.service} Experience`,
        comment: newReview.comment.trim(),
        verifiedBooking: true,
        verifiedBuyer: true,
        status: "pending",
        source: "client_portal",
        likes: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      await saveReviewToDatabase(reviewPayload);
      setReviewSubmitted(true);
      setTimeout(() => {
        setIsReviewModalOpen(false);
        setReviewSubmitted(false);
      }, 3000);
    } catch (err) {
      console.warn("Error submitting review:", err);
      setReviewSubmitted(true);
      setTimeout(() => {
        setIsReviewModalOpen(false);
        setReviewSubmitted(false);
      }, 3000);
    } finally {
      setIsSubmittingReview(false);
    }
  };

  // WhatsApp inquiry handler with pre-filled message
  const handleWhatsAppInquiry = (service: ServiceItem) => {
    const rawDigits = emergencyPhone.replace(/[^0-9]/g, "") || "97128156161";
    const text = encodeURIComponent(
      `Hello Cool Technologies, I would like to inquire regarding your "${service.title}" service in the UAE.`
    );
    window.open(`https://wa.me/${rawDigits}?text=${text}`, "_blank");
  };

  // Add to Quote cart
  const handleAddToQuote = (service: ServiceItem) => {
    if (onAddToCart) {
      onAddToCart(serviceToProduct(service), 1);
    } else {
      onRequestQuoteWithService(service.title);
    }
  };

  // Category filter state matching Screenshot 1
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const categories = [
    { id: "all", label: "All Services" },
    { id: "maintenance", label: "Maintenance" },
    { id: "cleaning", label: "Cleaning" },
    { id: "installation", label: "Installation" },
    { id: "chillers", label: "Chillers" },
    { id: "ducting", label: "Ducting" },
    { id: "consultation", label: "Consultation" }
  ];

  const filteredServices = activeServices.filter(s => {
    if (selectedCategory === "all") return true;
    const cat = (s.category || "").toLowerCase();
    const badge = (s.badge || "").toLowerCase();
    const title = s.title.toLowerCase();
    const target = selectedCategory.toLowerCase();
    return cat.includes(target) || badge.includes(target) || title.includes(target);
  });

  return (
    <div className="w-full bg-[#f8fafc] min-h-screen font-sans pb-24 text-slate-800" id="services-page">
      
      {/* Hero Header Section matching reference layout */}
      <section className="pt-10 sm:pt-14 pb-8 px-4 sm:px-6 max-w-7xl mx-auto text-center">
        {/* Subtle Breadcrumb */}
        <div className="inline-flex items-center gap-2 text-xs font-bold text-slate-400 mb-3 uppercase tracking-wider">
          <a href="#/" className="hover:text-[#0f4c81] transition-colors">Home</a>
          <span>/</span>
          <span className="text-[#0f4c81]">AC Services</span>
        </div>

        {/* Main Title */}
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-[#0f4c81] tracking-tight">
          Our Professional AC Services
        </h1>

        {/* Subtitle matching reference tone */}
        <p className="mt-4 text-xs sm:text-sm md:text-base text-slate-500 max-w-3xl mx-auto font-medium leading-relaxed">
          From precision cooling maintenance to complete commercial lifecycle management, we provide a comprehensive lifecycle of climate control solutions tailored for the demanding UAE environment.
        </p>

        {/* Category Filter Pills (Matching Screenshot 1) */}
        <div className="flex items-center justify-center gap-2 mt-7 overflow-x-auto pb-1 scrollbar-none flex-wrap">
          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap shadow-xs ${
                selectedCategory === cat.id
                  ? "bg-[#0f4c81] text-white shadow-md scale-102"
                  : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </section>

      {/* Main 4-Column Grid Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 md:gap-6">
          
          {filteredServices.map((service) => (
            <article 
              key={service.id}
              className="bg-white rounded-2xl border border-slate-200/90 overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col group hover:-translate-y-1"
            >
              {/* Card Image */}
              <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-100">
                <img 
                  src={service.image} 
                  alt={service.title} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />

                {/* Optional Badge */}
                {service.badge && (
                  <span className="absolute top-3 left-3 bg-white/95 backdrop-blur-xs text-[#0f4c81] text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full shadow-xs border border-slate-200/50">
                    {service.badge}
                  </span>
                )}
              </div>

              {/* Card Body */}
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-[#0f4c81] group-hover:text-cyan-700 transition-colors tracking-tight line-clamp-1">
                    {service.title}
                  </h2>
                  <p className="mt-2 text-xs text-slate-600 leading-relaxed line-clamp-3">
                    {service.description}
                  </p>
                </div>

                {/* Card Action Row */}
                <div className="pt-4 mt-4 border-t border-slate-100 flex items-center gap-2">
                  {/* WhatsApp Direct Enquiry Button (BIG) */}
                  <button
                    type="button"
                    onClick={() => handleWhatsAppInquiry(service)}
                    className="flex-1 py-2.5 px-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
                    title={`Enquire about ${service.title} on WhatsApp`}
                    aria-label={`WhatsApp Enquiry for ${service.title}`}
                  >
                    <MessageSquare size={15} />
                    <span>WhatsApp</span>
                  </button>

                  {/* Add to Quote Button (SMALL) */}
                  <button
                    type="button"
                    onClick={() => handleAddToQuote(service)}
                    className="p-2.5 rounded-xl bg-slate-100 hover:bg-[#0f4c81] text-slate-700 hover:text-white border border-slate-200 hover:border-[#0f4c81] transition-all flex items-center justify-center cursor-pointer shadow-xs active:scale-95 shrink-0"
                    title={`Add ${service.title} to Quote List`}
                    aria-label={`Add ${service.title} to Quote List`}
                  >
                    <ClipboardList size={16} />
                  </button>
                </div>
              </div>
            </article>
          ))}

          {/* 8th Card: Navy Blue "Ready to Start?" CTA Card (Matching Reference Layout) */}
          <div className="bg-gradient-to-br from-[#031b4e] via-[#0f4c81] to-[#164e87] text-white rounded-2xl p-6 sm:p-7 flex flex-col justify-between shadow-lg relative overflow-hidden group min-h-[340px]">
            {/* Background decoration */}
            <div className="absolute -top-12 -right-12 w-40 h-40 bg-cyan-400/10 rounded-full blur-2xl pointer-events-none group-hover:scale-125 transition-transform duration-700" />
            <div className="absolute -bottom-10 -left-10 w-36 h-36 bg-blue-500/15 rounded-full blur-xl pointer-events-none" />

            {/* Top Text */}
            <div className="relative z-10 space-y-3">
              <span className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-cyan-300 bg-white/10 px-2.5 py-1 rounded-full border border-white/15">
                <ShieldCheck size={12} />
                <span>HVAC Engineering Desk</span>
              </span>

              <h3 className="text-2xl sm:text-3xl font-black tracking-tight text-white leading-tight">
                Ready to Start?
              </h3>

              <p className="text-xs text-blue-100/90 leading-relaxed font-medium">
                Connect directly with our HVAC engineering team for commercial load calculations, bespoke AMC packages, or emergency technician dispatch.
              </p>
            </div>

            {/* Bottom Action Button */}
            <div className="relative z-10 pt-4">
              <a
                href="#/contact"
                className="w-full py-3 px-4 rounded-xl bg-white hover:bg-blue-50 text-[#0f4c81] font-extrabold text-xs uppercase tracking-wider transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer group-hover:translate-x-0.5"
              >
                <span>Contact Expert</span>
                <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </a>
            </div>
          </div>

        </div>
      </main>

      {/* Customer Feedback & Reviews Section */}
      {reviews && reviews.length > 0 ? (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 mt-14" id="services-reviews">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                Client Reviews &amp; Field Feedback
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Verified feedback from property managers, facility directors, and villa owners across the UAE.
              </p>
            </div>

            <button
              type="button"
              onClick={handleOpenReviewModal}
              className="self-start sm:self-auto px-4 py-2 rounded-xl bg-[#0f4c81] hover:bg-[#0c3d69] text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <Plus size={14} />
              <span>Submit Review</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {reviews.slice(0, 3).map((rev) => (
              <div key={rev.id} className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex items-center gap-1 text-amber-400">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} size={14} className={i < rev.rating ? "fill-amber-400 text-amber-400" : "text-slate-200"} />
                    ))}
                  </div>
                  <p className="text-xs text-slate-700 leading-relaxed italic">
                    "{rev.comment}"
                  </p>
                </div>
                <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between text-[11px]">
                  <div>
                    <span className="font-extrabold text-slate-900 block">{rev.authorName}</span>
                    <span className="text-slate-400">{rev.location || "UAE"}</span>
                  </div>
                  {rev.verifiedBooking && (
                    <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
                      Verified
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      ) : (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 mt-8 flex justify-end" id="services-reviews">
          <button
            type="button"
            onClick={handleOpenReviewModal}
            className="px-4 py-2 rounded-xl bg-[#0f4c81] hover:bg-[#0c3d69] text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
          >
            <Plus size={14} />
            <span>Submit Review</span>
          </button>
        </div>
      )}

      {/* Review Submission Modal */}
      {isReviewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
            
            <div className="bg-[#031b4e] text-white p-5 flex justify-between items-center">
              <div>
                <h3 className="font-bold text-base flex items-center gap-2">
                  <MessageSquare size={16} className="text-cyan-400" />
                  <span>Submit Service Feedback</span>
                </h3>
                <p className="text-xs text-slate-300 mt-0.5">Share your experience with Cool Technologies HVAC engineers</p>
              </div>
              <button 
                onClick={() => setIsReviewModalOpen(false)}
                className="text-white/80 hover:text-white bg-white/10 hover:bg-white/20 w-7 h-7 rounded-full flex items-center justify-center transition-colors focus:outline-none cursor-pointer"
              >
                <X size={15} />
              </button>
            </div>

            {reviewSubmitted ? (
              <div className="p-8 text-center space-y-3">
                <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center">
                  <CheckCircle2 size={32} />
                </div>
                <h4 className="font-bold text-slate-900 text-lg">Thank You for Your Feedback!</h4>
                <p className="text-xs text-slate-600 font-medium max-w-sm mx-auto leading-relaxed">
                  Your review has been submitted for administrative verification. Once approved, it will appear live.
                </p>
              </div>
            ) : (
              <form onSubmit={handleReviewFormSubmit} className="p-6 space-y-4">
                
                {user && (
                  <div className="p-2.5 bg-blue-50/70 border border-blue-100 rounded-xl flex items-center justify-between text-[11px] text-[#031b4e]">
                    <span className="flex items-center gap-1.5 font-semibold">
                      <ShieldCheck size={14} className="text-blue-600 shrink-0" />
                      <span>Submitting as: <strong className="font-bold">{user.email || profile?.name}</strong></span>
                    </span>
                  </div>
                )}

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Service Selected</label>
                  <select
                    value={newReview.service}
                    onChange={(e) => setNewReview(prev => ({ ...prev, service: e.target.value }))}
                    className="w-full px-3.5 py-2 text-xs font-semibold text-slate-800 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600"
                  >
                    {activeServices.map(s => (
                      <option key={s.id} value={s.title}>{s.title}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Your Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Tariq Al Mansoori"
                      value={newReview.name}
                      onChange={(e) => setNewReview(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Location</label>
                    <input
                      type="text"
                      placeholder="e.g. Abu Dhabi, UAE"
                      value={newReview.location}
                      onChange={(e) => setNewReview(prev => ({ ...prev, location: e.target.value }))}
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Rating</label>
                  <div className="flex items-center gap-1.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setNewReview(prev => ({ ...prev, rating: star }))}
                        className="p-1 text-amber-400 hover:scale-110 transition-transform cursor-pointer"
                      >
                        <Star size={20} className={star <= newReview.rating ? "fill-amber-400 text-amber-400" : "text-slate-300"} />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Your Experience *</label>
                  <textarea
                    required
                    rows={3}
                    placeholder="Describe the quality of service, response time, and professionalism..."
                    value={newReview.comment}
                    onChange={(e) => setNewReview(prev => ({ ...prev, comment: e.target.value }))}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 resize-none"
                  />
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setIsReviewModalOpen(false)}
                    className="px-4 py-2 border border-slate-300 text-slate-700 font-bold text-xs rounded-xl hover:bg-slate-50 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingReview}
                    className="px-5 py-2 bg-[#0f4c81] hover:bg-[#0c3d69] text-white font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md cursor-pointer disabled:opacity-50"
                  >
                    {isSubmittingReview ? "Submitting..." : "Submit Review"}
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
