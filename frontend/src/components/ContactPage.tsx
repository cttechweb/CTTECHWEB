import React, { useState, useEffect, useRef } from "react";
import { 
  Phone, 
  Mail, 
  MapPin, 
  CheckCircle2, 
  ChevronDown, 
  Building, 
  Clock, 
  ExternalLink,
  MessageSquare,
  Sparkles,
  ShieldCheck,
  Send,
  ArrowUpRight,
  Headphones,
  FileSpreadsheet,
  Wrench,
  HelpCircle,
  AlertCircle
} from "lucide-react";
import { CompanyBranch, GeneralSiteSettings, ContactFaqItem } from "../types";
import { getBranches, getGeneralSettings, getContactFaqs } from "../services/generalSettingsService";
import { submitGeneralEnquiry } from "../services/enquiryService";

interface ContactPageProps {
  initialCategory?: string;
  onOpenQuote?: (prefilledProduct?: string) => void;
  onOpenProducts?: () => void;
  onShowToast?: (message: string) => void;
}

const INQUIRY_CATEGORIES = [
  { value: "product_support", label: "Product Support" },
  { value: "equipment_quotation", label: "HVAC Equipment Quotation & Sourcing" },
  { value: "service_maintenance", label: "Service & Maintenance Query" },
  { value: "warranty_parts", label: "Warranty & Spare Parts Claim" },
  { value: "general_enquiry", label: "General Business & Partnership Enquiry" }
];

export default function ContactPage({ initialCategory, onShowToast }: ContactPageProps) {
  const [settings, setSettings] = useState<GeneralSiteSettings>(getGeneralSettings());
  const [branches, setBranches] = useState<CompanyBranch[]>([]);
  const [activeBranchId, setActiveBranchId] = useState<string>("");
  const [faqs, setFaqs] = useState<ContactFaqItem[]>([]);

  const nameInputRef = useRef<HTMLInputElement>(null);

  const checkIsProductSupportLanding = () => {
    try {
      const hash = window.location.hash || "";
      return (
        hash.includes("category=product_support") ||
        hash.includes("category=product-support") ||
        hash.startsWith("#/support") ||
        initialCategory === "product_support"
      );
    } catch {
      return false;
    }
  };

  const resolveInitialCategory = () => {
    try {
      const hash = window.location.hash || "";
      if (
        hash.includes("category=product_support") ||
        hash.includes("category=product-support") ||
        hash.includes("category=support") ||
        hash.startsWith("#/support")
      ) {
        return "product_support";
      }
      if (hash.includes("category=equipment_quotation")) return "equipment_quotation";
      if (hash.includes("category=service_maintenance")) return "service_maintenance";
      if (hash.includes("category=warranty_parts")) return "warranty_parts";
      if (hash.includes("category=general_enquiry")) return "general_enquiry";
    } catch {}
    return initialCategory || "product_support";
  };

  // Form State
  const [isFromProductSupport, setIsFromProductSupport] = useState<boolean>(checkIsProductSupportLanding);
  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [inquiryCategory, setInquiryCategory] = useState<string>(resolveInitialCategory);
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Automatic Branch Switching State
  const [isAutoPaused, setIsAutoPaused] = useState(false);

  // FAQ State
  const [openFaqIdx, setOpenFaqIdx] = useState<number | null>(0);

  const loadData = () => {
    const s = getGeneralSettings();
    setSettings(s);
    const bList = getBranches().filter((b) => b.isActive !== false);
    setBranches(bList);
    const fList = getContactFaqs().filter((f) => f.isActive !== false);
    setFaqs(fList);

    if (bList.length > 0) {
      if (!activeBranchId || !bList.some((b) => b.id === activeBranchId)) {
        const hq = bList.find((b) => b.isHeadquarters) || bList[0];
        setActiveBranchId(hq.id);
      }
    }
  };

  useEffect(() => {
    loadData();
    window.addEventListener("cooltech_settings_updated", loadData);
    window.addEventListener("cooltech_contact_settings_updated", loadData);
    return () => {
      window.removeEventListener("cooltech_settings_updated", loadData);
      window.removeEventListener("cooltech_contact_settings_updated", loadData);
    };
  }, []);

  // Sync category on initialCategory or hash change & focus input
  useEffect(() => {
    const handleHashSync = () => {
      const isPS = checkIsProductSupportLanding();
      setIsFromProductSupport(isPS);
      const cat = resolveInitialCategory();
      setInquiryCategory(cat);
      if (isPS) {
        const formEl = document.getElementById("contact-form");
        if (formEl) {
          formEl.scrollIntoView({ behavior: "smooth", block: "start" });
        }
        setTimeout(() => {
          nameInputRef.current?.focus();
        }, 400);
      }
    };

    handleHashSync();
    window.addEventListener("hashchange", handleHashSync);
    return () => window.removeEventListener("hashchange", handleHashSync);
  }, [initialCategory]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  // Automatic branch rotation every 5 seconds when multiple branches exist
  useEffect(() => {
    if (branches.length <= 1 || isAutoPaused) return;

    const interval = setInterval(() => {
      setActiveBranchId((prevId) => {
        const currentIndex = branches.findIndex((b) => b.id === prevId);
        const nextIndex = currentIndex >= 0 ? (currentIndex + 1) % branches.length : 0;
        return branches[nextIndex].id;
      });
    }, 5000);

    return () => clearInterval(interval);
  }, [branches, isAutoPaused]);

  const activeBranch = branches.find((b) => b.id === activeBranchId) || branches[0];

  const getEmbedMapUrl = (b?: CompanyBranch) => {
    if (!b) return "https://maps.google.com/maps?q=Mussafah+Industrial+Area+Abu+Dhabi+UAE&t=&z=14&ie=UTF8&iwloc=&output=embed";
    if (b.mapEmbedUrl && b.mapEmbedUrl.trim()) return b.mapEmbedUrl.trim();
    const query = encodeURIComponent(`${b.address || b.name + ", " + b.city + ", UAE"}`);
    return `https://maps.google.com/maps?q=${query}&t=&z=14&ie=UTF8&iwloc=&output=embed`;
  };

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    if (!name || !email || !message) return;

    try {
      setIsSubmitting(true);
      await submitGeneralEnquiry({
        source: "contact_page",
        type: inquiryCategory,
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim() || undefined,
        companyName: company.trim() || undefined,
        subject: `Contact Inquiry: ${INQUIRY_CATEGORIES.find((c) => c.value === inquiryCategory)?.label || inquiryCategory}`,
        message: message.trim(),
        metadata: {
          inquiryCategory,
          sourceUrl: window.location.href,
        },
      });

      setIsSubmitted(true);
      if (onShowToast) {
        onShowToast("Thank you! Your inquiry has been logged and sent to our engineering desk.");
      }
    } catch (err: any) {
      alert(`Failed to submit inquiry: ${err?.message || "Please check your internet connection."}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetForm = () => {
    setIsSubmitted(false);
    setName("");
    setCompany("");
    setEmail("");
    setPhone("");
    setMessage("");
  };

  return (
    <div className="w-full bg-slate-50 font-sans text-slate-800 antialiased" id="contact-section">
      
      {/* ─────────────────────────────────────────────────────────────
          1. CLEAN CORPORATE HEADER (Open Breadcrumb + Title)
      ───────────────────────────────────────────────────────────── */}
      <section className="bg-white border-b border-slate-200 py-10 sm:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <nav className="flex items-center gap-2 text-xs font-semibold text-slate-500 mb-3" aria-label="Breadcrumb">
            <a href="#/" className="hover:text-[#0f4c81] transition-colors">Home</a>
            <span className="text-slate-300">/</span>
            <span className="text-[#031b4e] font-bold uppercase tracking-wider">Contact & Support</span>
          </nav>

          <div>
            <h1 className="text-3xl sm:text-4xl font-black text-[#031b4e] tracking-tight uppercase font-sans">
              Contact Cool Technologies
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 font-medium mt-2 max-w-2xl leading-relaxed">
              Connect with our technical engineering, product support, and wholesale sales desks for commercial HVAC inquiries and project quotations.
            </p>
          </div>

        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          2. MAIN SECTION: OPEN 2-COLUMN CONTACT FORM & DIRECT CHANNELS
      ───────────────────────────────────────────────────────────── */}
      <section className="py-12 sm:py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start">
          
          {/* Left Column: Clean Contact Form (7 Cols) */}
          <div className="lg:col-span-7 bg-white p-7 sm:p-10 rounded-2xl border border-slate-200/90 shadow-xs">
            
            <div className="mb-6" id="contact-form">
              <h2 className="text-2xl font-black text-[#031b4e] uppercase tracking-tight font-sans">
                {isFromProductSupport ? "Product Support & Technical Inquiry" : "Send Us a Message"}
              </h2>
              <p className="text-xs text-slate-500 font-semibold mt-1">
                {isFromProductSupport 
                  ? "Fill your details and submit your request here. Our engineering and support team will contact you promptly."
                  : "Fill out the form below. Our engineering and sales team will contact you promptly."}
              </p>
            </div>

            {!isSubmitted ? (
              <form onSubmit={handleSubmitForm} className="space-y-4">
                
                {/* Full Name & Company Name */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-bold text-slate-700 block">
                        Your Full Name <span className="text-red-500">*</span>
                      </label>
                      {isFromProductSupport && (
                        <span className="text-red-500 font-semibold text-[11px]">
                          Please fill your details
                        </span>
                      )}
                    </div>
                    <input
                      ref={nameInputRef}
                      type="text"
                      required
                      placeholder="e.g. Mohammed Al Mansoori"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className={`w-full px-3.5 py-2.5 text-xs font-semibold border rounded-xl bg-slate-50/50 focus:bg-white focus:outline-none transition-all text-slate-900 placeholder:text-slate-400 ${
                        isFromProductSupport
                          ? "border-[#0f4c81] ring-2 ring-[#0f4c81]/15"
                          : "border-slate-300 focus:border-[#0f4c81] focus:ring-2 focus:ring-[#0f4c81]/15"
                      }`}
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1.5">
                      Company / Organization Name
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Al Futtaim Contracting, Emrill LLC"
                      value={company}
                      onChange={(e) => setCompany(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-xs font-semibold border border-slate-300 rounded-xl bg-slate-50/50 focus:bg-white focus:outline-none focus:border-[#0f4c81] focus:ring-2 focus:ring-[#0f4c81]/15 transition-all text-slate-900 placeholder:text-slate-400"
                    />
                  </div>
                </div>

                {/* Email & Phone */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1.5">
                      Email Address (Gmail / Corporate ID) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="e.g. engineer@company.ae"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-xs font-semibold border border-slate-300 rounded-xl bg-slate-50/50 focus:bg-white focus:outline-none focus:border-[#0f4c81] focus:ring-2 focus:ring-[#0f4c81]/15 transition-all text-slate-900 placeholder:text-slate-400"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1.5">
                      Phone Number (+971) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="e.g. +971 50 123 4567"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-xs font-semibold border border-slate-300 rounded-xl bg-slate-50/50 focus:bg-white focus:outline-none focus:border-[#0f4c81] focus:ring-2 focus:ring-[#0f4c81]/15 transition-all text-slate-900 placeholder:text-slate-400"
                    />
                  </div>
                </div>

                {/* Inquiry Category / Problem Dropdown */}
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1.5">
                    Inquiry Type / Problem Category <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={inquiryCategory}
                    onChange={(e) => {
                      setInquiryCategory(e.target.value);
                      if (e.target.value !== "product_support") {
                        setIsFromProductSupport(false);
                      }
                    }}
                    className="w-full px-3.5 py-2.5 text-xs font-semibold border border-slate-300 rounded-xl bg-slate-50/50 focus:bg-white focus:outline-none focus:border-[#0f4c81] focus:ring-2 focus:ring-[#0f4c81]/15 transition-all text-slate-900"
                  >
                    {INQUIRY_CATEGORIES.map((cat) => (
                      <option key={cat.value} value={cat.value}>
                        {cat.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Message Textarea */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-bold text-slate-700 block">
                      {isFromProductSupport ? "Your Complaint / Technical Issue Details" : "Your Message / Requirements"} <span className="text-red-500">*</span>
                    </label>
                    {isFromProductSupport && (
                      <span className="text-red-500 font-semibold text-[11px]">
                        Please fill your complaint
                      </span>
                    )}
                  </div>
                  <textarea
                    rows={4}
                    required
                    placeholder={
                      isFromProductSupport
                        ? "Please fill your complaint here: Specify the HVAC product, model code, serial number, technical issue, or required spare parts..."
                        : "Provide details about your project, model codes, unit tonnage, or technical support requirements..."
                    }
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className={`w-full px-3.5 py-2.5 text-xs font-medium border rounded-xl bg-slate-50/50 focus:bg-white focus:outline-none transition-all text-slate-900 placeholder:text-slate-400 resize-y ${
                      isFromProductSupport
                        ? "border-[#0f4c81]/70 focus:border-[#0f4c81] focus:ring-2 focus:ring-[#0f4c81]/15"
                        : "border-slate-300 focus:border-[#0f4c81] focus:ring-2 focus:ring-[#0f4c81]/15"
                    }`}
                  />
                </div>

                {/* Send Message Button */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full sm:w-auto px-8 py-3 bg-[#0f4c81] hover:bg-[#031b4e] text-white font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-xs transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <span>Sending Message...</span>
                    ) : (
                      <>
                        <Send size={14} />
                        <span>Send Message</span>
                      </>
                    )}
                  </button>
                </div>

              </form>
            ) : (
              <div className="py-10 text-center space-y-4 animate-in fade-in duration-300">
                <div className="w-16 h-16 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto shadow-2xs">
                  <CheckCircle2 size={36} />
                </div>
                <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight font-sans">
                  Message Sent Successfully!
                </h3>
                <p className="text-xs text-slate-600 font-medium max-w-md mx-auto leading-relaxed">
                  Thank you, <strong>{name}</strong>. Your inquiry has been forwarded to our technical team. An engineer will get in touch with you at <strong>{email}</strong> or <strong>{phone}</strong> shortly.
                </p>
                <button
                  type="button"
                  onClick={handleResetForm}
                  className="px-6 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-all cursor-pointer"
                >
                  Send Another Message
                </button>
              </div>
            )}

          </div>

          {/* Right Column: Direct Corporate Channels (5 Cols) */}
          <div className="lg:col-span-5 space-y-5">
            
            {/* Direct Channel Cards */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-5">
              <h3 className="text-sm font-black text-[#031b4e] uppercase tracking-wider border-b border-slate-100 pb-3">
                Direct Contact Channels
              </h3>

              {/* Telephone */}
              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#0f4c81] flex items-center justify-center shrink-0 border border-blue-100">
                  <Phone size={18} />
                </div>
                <div>
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 block">
                    Central Procurement Hotline
                  </span>
                  <a 
                    href={`tel:${settings.phone.replace(/[^0-9+]/g, '')}`} 
                    className="font-mono text-sm font-black text-slate-900 hover:text-[#0f4c81] transition-colors"
                  >
                    {settings.phone}
                  </a>
                  <span className="text-[10px] text-slate-500 block mt-0.5">Mon - Sat: 8:00 AM - 7:00 PM GST</span>
                </div>
              </div>

              {/* Email */}
              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#0f4c81] flex items-center justify-center shrink-0 border border-blue-100">
                  <Mail size={18} />
                </div>
                <div>
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 block">
                    Quotations & Inquiries Email
                  </span>
                  <a 
                    href={`mailto:${settings.email}`} 
                    className="text-xs font-bold text-[#0f4c81] hover:underline"
                  >
                    {settings.email}
                  </a>
                  <span className="text-[10px] text-slate-500 block mt-0.5">Responses within 1-2 business hours</span>
                </div>
              </div>

              {/* WhatsApp Direct */}
              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100">
                  <MessageSquare size={18} />
                </div>
                <div>
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 block">
                    WhatsApp B2B Support
                  </span>
                  {(() => {
                    const contactWhatsapp = settings.whatsappSettings?.contactPageWhatsappNumber || settings.whatsapp || "+971 50 123 4567";
                    return (
                      <a 
                        href={`https://wa.me/${contactWhatsapp.replace(/[^0-9]/g, '')}?text=${encodeURIComponent("Hello Cool Technologies, I would like to inquire regarding HVAC equipment & engineering services.")}`} 
                        target="_blank" 
                        rel="noreferrer"
                        className="font-mono text-xs font-bold text-emerald-700 hover:underline"
                      >
                        {contactWhatsapp}
                      </a>
                    );
                  })()}
                  <span className="text-[10px] text-slate-500 block mt-0.5">Direct chat with sales engineers</span>
                </div>
              </div>

              {/* Headquarters Address */}
              <div className="flex items-start gap-3.5 pt-2 border-t border-slate-100">
                <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center shrink-0 border border-slate-200">
                  <MapPin size={18} />
                </div>
                <div>
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 block">
                    Central Facility & Warehouse
                  </span>
                  <p className="text-xs font-semibold text-slate-700 mt-0.5 leading-relaxed">
                    {settings.address}
                  </p>
                </div>
              </div>

            </div>

            {/* Quality & Assurance Note */}
            <div className="bg-[#031b4e] text-white p-5 rounded-2xl flex items-center gap-3.5 shadow-xs">
              <div className="w-9 h-9 rounded-xl bg-white/10 text-cyan-300 flex items-center justify-center shrink-0 border border-white/10">
                <ShieldCheck size={18} />
              </div>
              <div className="text-xs leading-relaxed">
                <span className="font-extrabold block text-white">ISO 9001:2015 Certified Distributor</span>
                <span className="text-slate-300 text-[11px]">Factory-sealed equipment with genuine OEM warranty protection.</span>
              </div>
            </div>

          </div>

        </div>

      </section>

      {/* ─────────────────────────────────────────────────────────────
          3. REGIONAL BRANCHES DIRECTORY & DYNAMIC LIVE MAP OR FULL MAIN MAP
      ───────────────────────────────────────────────────────────── */}
      {branches.length > 0 ? (
        <section className="py-14 bg-white border-t border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
              <div>
                <span className="text-[11px] font-black uppercase tracking-widest text-[#0f4c81] bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
                  UAE Branch Network & Facilities
                </span>
                <h2 className="text-2xl sm:text-3xl font-black text-[#031b4e] uppercase tracking-tight mt-2.5">
                  Our Regional Branches & Live Maps
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 font-semibold mt-1">
                  Click any branch to view direct contact details and its exact interactive Google Map location.
                </p>
              </div>

              {/* Branch Switcher Tabs */}
              <div 
                className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1"
                onMouseEnter={() => setIsAutoPaused(true)}
                onMouseLeave={() => setIsAutoPaused(false)}
              >
                {branches.map((b) => {
                  const isSelected = b.id === activeBranchId;
                  return (
                    <button
                      key={b.id}
                      type="button"
                      onClick={() => {
                        setActiveBranchId(b.id);
                        setIsAutoPaused(true);
                        setTimeout(() => setIsAutoPaused(false), 7000);
                      }}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap relative overflow-hidden ${
                        isSelected
                          ? "bg-[#0f4c81] text-white shadow-xs ring-2 ring-[#0f4c81]/20"
                          : "bg-slate-100 hover:bg-slate-200 text-slate-700"
                      }`}
                    >
                      <Building size={13} />
                      <span>{b.city}</span>
                      {b.isHeadquarters && (
                        <span className={`text-[9px] px-1.5 py-0.2 rounded font-extrabold ${
                          isSelected ? "bg-white/20 text-white" : "bg-slate-200 text-slate-700"
                        }`}>
                          HQ
                        </span>
                      )}
                      {isSelected && !isAutoPaused && branches.length > 1 && (
                        <span className="w-1.5 h-1.5 rounded-full bg-cyan-300 animate-pulse ml-0.5" title="Auto-switching active" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Dynamic Interactive Split: Selected Branch Card + Live Interactive Google Map */}
            {activeBranch && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
                
                {/* Branch Information Card (5 Cols) */}
                <div className="lg:col-span-5 bg-slate-50 rounded-2xl p-6 sm:p-7 border border-slate-200 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded bg-[#031b4e] text-white">
                        {activeBranch.city} Branch
                      </span>
                      {activeBranch.isHeadquarters && (
                        <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded bg-[#0f4c81] text-white">
                          ★ Main Headquarters
                        </span>
                      )}
                    </div>

                    <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight mb-4">
                      {activeBranch.name}
                    </h3>

                    <div className="space-y-3.5 text-xs text-slate-700">
                      
                      {/* Address */}
                      <div className="flex items-start gap-3">
                        <MapPin size={16} className="text-[#0f4c81] shrink-0 mt-0.5" />
                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Location</span>
                          <p className="font-semibold text-slate-800 leading-relaxed mt-0.5">{activeBranch.address}</p>
                        </div>
                      </div>

                      {/* Telephone */}
                      <div className="flex items-start gap-3">
                        <Phone size={16} className="text-[#0f4c81] shrink-0 mt-0.5" />
                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Direct Telephone</span>
                          <a 
                            href={`tel:${activeBranch.phone.replace(/[^0-9+]/g, '')}`} 
                            className="font-mono text-sm font-bold text-[#0f4c81] hover:underline block mt-0.5"
                          >
                            {activeBranch.phone}
                          </a>
                        </div>
                      </div>

                      {/* Mobile Hotline if available */}
                      {activeBranch.mobile && (
                        <div className="flex items-start gap-3">
                          <MessageSquare size={16} className="text-emerald-600 shrink-0 mt-0.5" />
                          <div>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Mobile / WhatsApp</span>
                            <a 
                              href={`tel:${activeBranch.mobile.replace(/[^0-9+]/g, '')}`} 
                              className="font-mono text-xs font-bold text-slate-800 hover:text-emerald-700 block mt-0.5"
                            >
                              {activeBranch.mobile}
                            </a>
                          </div>
                        </div>
                      )}

                      {/* Email */}
                      <div className="flex items-start gap-3">
                        <Mail size={16} className="text-[#0f4c81] shrink-0 mt-0.5" />
                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Department Email</span>
                          <a 
                            href={`mailto:${activeBranch.email}`} 
                            className="font-bold text-[#0f4c81] hover:underline block mt-0.5 truncate"
                          >
                            {activeBranch.email}
                          </a>
                        </div>
                      </div>

                      {/* Working Hours */}
                      {activeBranch.workingHours && (
                        <div className="flex items-start gap-3">
                          <Clock size={16} className="text-[#0f4c81] shrink-0 mt-0.5" />
                          <div>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Working Hours</span>
                            <span className="font-semibold text-slate-800 block mt-0.5">{activeBranch.workingHours}</span>
                          </div>
                        </div>
                      )}

                    </div>
                  </div>

                  {/* Get Directions External Link */}
                  {activeBranch.mapUrl && (
                    <div className="pt-5 mt-5 border-t border-slate-200">
                      <a
                        href={activeBranch.mapUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 px-4 py-2 bg-white hover:bg-slate-100 text-[#0f4c81] border border-slate-200 rounded-xl text-xs font-extrabold transition-colors shadow-2xs"
                      >
                        <span>Open in Google Maps App</span>
                        <ArrowUpRight size={14} />
                      </a>
                    </div>
                  )}
                </div>

                {/* Live Interactive Google Map Frame (7 Cols) */}
                <div className="lg:col-span-7 bg-slate-100 rounded-2xl overflow-hidden border border-slate-200 shadow-xs relative min-h-[380px]">
                  <iframe
                    key={activeBranch.id}
                    title={`${activeBranch.name} Location Map`}
                    src={getEmbedMapUrl(activeBranch)}
                    width="100%"
                    height="100%"
                    className="w-full h-full min-h-[380px] border-0"
                    allowFullScreen={true}
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  />
                </div>

              </div>
            )}

          </div>
        </section>
      ) : (
        /* Fallback: Full Main Facility & Headquarters Live Map */
        <section className="py-14 bg-white border-t border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
              <div>
                <span className="text-[11px] font-black uppercase tracking-widest text-[#0f4c81] bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
                  Central Headquarters
                </span>
                <h2 className="text-2xl sm:text-3xl font-black text-[#031b4e] uppercase tracking-tight mt-2.5">
                  Main Facility & Live Map
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 font-semibold mt-1">
                  {settings.address}
                </p>
              </div>

              <a
                href={settings.locationMapUrl || `https://maps.google.com/?q=${encodeURIComponent(settings.address || "Mussafah Industrial Area Abu Dhabi")}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-white hover:bg-slate-100 text-[#0f4c81] border border-slate-200 rounded-xl text-xs font-extrabold transition-colors shadow-2xs self-start md:self-auto"
              >
                <span>Open in Google Maps</span>
                <ArrowUpRight size={14} />
              </a>
            </div>

            <div className="w-full bg-slate-100 rounded-2xl overflow-hidden border border-slate-200 shadow-xs relative h-[420px]">
              <iframe
                title="Headquarters Live Map"
                src={`https://maps.google.com/maps?q=${encodeURIComponent(settings.address || "Plot-99, Sector M-42, Mussafah Industrial Area, Abu Dhabi, UAE")}&t=&z=14&ie=UTF8&iwloc=&output=embed`}
                width="100%"
                height="100%"
                className="w-full h-full border-0"
                allowFullScreen={true}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>
        </section>
      )}

      {/* ─────────────────────────────────────────────────────────────
          4. FREQUENTLY ASKED QUESTIONS (FAQ) & TECHNICAL SEO SCHEMA
      ───────────────────────────────────────────────────────────── */}
      {faqs.length > 0 && (
        <section 
          className="py-14 sm:py-16 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8"
          itemScope 
          itemType="https://schema.org/FAQPage"
        >
          {/* JSON-LD Technical SEO Structured Data */}
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "FAQPage",
                "mainEntity": faqs.map((faq) => ({
                  "@type": "Question",
                  "name": faq.question,
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": faq.answer
                  }
                }))
              })
            }}
          />

          <div className="text-center mb-8">
            <h2 className="text-2xl sm:text-3xl font-black text-[#031b4e] uppercase tracking-tight">
              Frequently Asked Questions
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 font-semibold mt-1">
              Common questions regarding commercial HVAC procurement, site delivery, warranties, and quotes.
            </p>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, idx) => {
              const isOpen = openFaqIdx === idx;
              return (
                <div
                  key={faq.id}
                  itemScope 
                  itemProp="mainEntity" 
                  itemType="https://schema.org/Question"
                  className="bg-white border border-slate-200 rounded-2xl overflow-hidden transition-all shadow-2xs"
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaqIdx(isOpen ? null : idx)}
                    className="w-full px-5 py-4 text-left font-bold text-xs sm:text-sm text-slate-900 flex items-center justify-between gap-4 cursor-pointer hover:bg-slate-50/70 transition-colors"
                  >
                    <div className="flex items-center gap-2.5 min-w-0 pr-2">
                      <span className="w-5 h-5 rounded-full bg-blue-50 text-[#0f4c81] text-[10px] font-black flex items-center justify-center shrink-0 border border-blue-100">
                        {idx + 1}
                      </span>
                      <span itemProp="name" className="truncate sm:whitespace-normal font-sans font-bold">
                        {faq.question}
                      </span>
                    </div>

                    <ChevronDown
                      size={16}
                      className={`text-slate-400 transition-transform duration-200 shrink-0 ${
                        isOpen ? "rotate-180 text-[#0f4c81]" : ""
                      }`}
                    />
                  </button>

                  {isOpen && (
                    <div 
                      itemScope 
                      itemProp="acceptedAnswer" 
                      itemType="https://schema.org/Answer"
                      className="px-5 pb-4 pt-1.5 text-xs text-slate-600 font-medium leading-relaxed border-t border-slate-100 animate-in fade-in duration-150"
                    >
                      <p itemProp="text">
                        {faq.answer}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      )}

    </div>
  );
}
