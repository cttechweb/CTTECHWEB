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
  Send,
  ArrowUpRight,
  Headphones,
  FileSpreadsheet,
  Wrench,
  HelpCircle,
  AlertCircle,
  PhoneCall
} from "lucide-react";
import { CompanyBranch, GeneralSiteSettings, ContactFaqItem } from "../types";
import { 
  getBranches, 
  getGeneralSettings, 
  getContactFaqs,
  DEFAULT_PHONE_CONTACTS,
  DEFAULT_EMAIL_CONTACTS
} from "../services/generalSettingsService";
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

  const checkIsEquipmentQuotationLanding = () => {
    try {
      const hash = window.location.hash || "";
      return (
        hash.includes("category=equipment_quotation") ||
        hash.includes("category=quotation") ||
        initialCategory === "equipment_quotation"
      );
    } catch {
      return false;
    }
  };

  const getProductFromHash = () => {
    try {
      const hash = window.location.hash || "";
      const queryIdx = hash.indexOf("?");
      if (queryIdx !== -1) {
        const params = new URLSearchParams(hash.slice(queryIdx));
        const p = params.get("product");
        if (p) return decodeURIComponent(p);
      }
    } catch {}
    return "";
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
  const [isFromEquipmentQuotation, setIsFromEquipmentQuotation] = useState<boolean>(checkIsEquipmentQuotationLanding);
  const [inquiryProduct, setInquiryProduct] = useState<string>(getProductFromHash);
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
    window.addEventListener("cooltech_general_settings_updated", loadData);
    window.addEventListener("storage", loadData);
    return () => {
      window.removeEventListener("cooltech_settings_updated", loadData);
      window.removeEventListener("cooltech_contact_settings_updated", loadData);
      window.removeEventListener("cooltech_general_settings_updated", loadData);
      window.removeEventListener("storage", loadData);
    };
  }, []);

  // Sync category on initialCategory or hash change & focus input
  useEffect(() => {
    const handleHashSync = () => {
      const isPS = checkIsProductSupportLanding();
      setIsFromProductSupport(isPS);
      const isEQ = checkIsEquipmentQuotationLanding();
      setIsFromEquipmentQuotation(isEQ);
      const cat = resolveInitialCategory();
      setInquiryCategory(cat);

      const prod = getProductFromHash();
      if (prod) {
        setInquiryProduct(prod);
        setMessage((prev) => {
          if (!prev) {
            return `I would like to request an official wholesale quotation and availability for:\n• Product: ${prod}\n\nPlease provide unit pricing, stock lead time, and commercial supply terms.`;
          }
          return prev;
        });
      }

      if (isPS || isEQ) {
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
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-stretch">
          
          {/* Left Column: Clean Contact Form (7 Cols) */}
          <div className="lg:col-span-7 bg-white p-6 sm:p-8 lg:p-9 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col justify-between">
            
            <div className="mb-6" id="contact-form">
              <h2 className="text-2xl font-black text-[#031b4e] uppercase tracking-tight font-sans">
                {isFromProductSupport 
                  ? "Product Support & Technical Inquiry" 
                  : isFromEquipmentQuotation 
                  ? "HVAC Equipment Quotation & Sourcing" 
                  : "Send Us a Message"}
              </h2>
              <p className="text-xs text-slate-500 font-semibold mt-1">
                {isFromProductSupport 
                  ? "Fill your details and submit your request here. Our engineering and support team will contact you promptly."
                  : isFromEquipmentQuotation
                  ? (inquiryProduct 
                      ? `Requesting wholesale quotation for: ${inquiryProduct}. Fill your details below to receive an official proposal.`
                      : "Fill your details and submit your quotation request below. Our commercial sales engineering team will contact you promptly.")
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
                      {(isFromProductSupport || isFromEquipmentQuotation) && (
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
                        isFromProductSupport || isFromEquipmentQuotation
                          ? "border-[#0f4c81] ring-2 ring-[#0f4c81]/15"
                          : "border-slate-300 focus:border-[#0f4c81] focus:ring-2 focus:ring-[#0f4c81]/15"
                      }`}
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-bold text-slate-700 block">
                        Company / Organization Name
                      </label>
                      {isFromEquipmentQuotation && (
                        <span className="text-red-500 font-semibold text-[11px]">
                          Please fill your company
                        </span>
                      )}
                    </div>
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
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-bold text-slate-700 block">
                        Email Address (Gmail / Corporate ID) <span className="text-red-500">*</span>
                      </label>
                      {isFromEquipmentQuotation && (
                        <span className="text-red-500 font-semibold text-[11px]">
                          Please fill your email
                        </span>
                      )}
                    </div>
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
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-bold text-slate-700 block">
                        Phone Number (+971) <span className="text-red-500">*</span>
                      </label>
                      {isFromEquipmentQuotation && (
                        <span className="text-red-500 font-semibold text-[11px]">
                          Please fill your phone
                        </span>
                      )}
                    </div>
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
                      if (e.target.value !== "equipment_quotation") {
                        setIsFromEquipmentQuotation(false);
                      }
                    }}
                    className={`w-full px-3.5 py-2.5 text-xs font-semibold border rounded-xl bg-slate-50/50 focus:bg-white focus:outline-none transition-all text-slate-900 ${
                      isFromProductSupport || isFromEquipmentQuotation
                        ? "border-[#0f4c81] ring-2 ring-[#0f4c81]/15"
                        : "border-slate-300 focus:border-[#0f4c81] focus:ring-2 focus:ring-[#0f4c81]/15"
                    }`}
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
                      {isFromProductSupport 
                        ? "Your Complaint / Technical Issue Details" 
                        : isFromEquipmentQuotation 
                        ? "Quotation Scope & Equipment Requirements" 
                        : "Your Message / Requirements"} <span className="text-red-500">*</span>
                    </label>
                    {isFromProductSupport ? (
                      <span className="text-red-500 font-semibold text-[11px]">
                        Please fill your complaint
                      </span>
                    ) : isFromEquipmentQuotation ? (
                      <span className="text-red-500 font-semibold text-[11px]">
                        Please fill your quotation requirements
                      </span>
                    ) : null}
                  </div>
                  <textarea
                    rows={4}
                    required
                    placeholder={
                      isFromProductSupport
                        ? "Please fill your complaint here: Specify the HVAC product, model code, serial number, technical issue, or required spare parts..."
                        : isFromEquipmentQuotation
                        ? "Please specify required unit quantities, capacity tonnage, project location, delivery schedule, and any technical specifications..."
                        : "Provide details about your project, model codes, unit tonnage, or technical support requirements..."
                    }
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className={`w-full px-3.5 py-2.5 text-xs font-medium border rounded-xl bg-slate-50/50 focus:bg-white focus:outline-none transition-all text-slate-900 placeholder:text-slate-400 resize-y ${
                      isFromProductSupport || isFromEquipmentQuotation
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
          <div className="lg:col-span-5">
            
            <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col justify-between h-full">
              
              <div>
                {/* Header */}
                <div className="border-b border-slate-100 pb-3.5 mb-4">
                  <h3 className="text-sm font-black text-[#031b4e] uppercase tracking-wider">
                    Direct Contact Channels
                  </h3>
                  <p className="text-xs text-slate-500 font-semibold mt-1">
                    Connect directly with our sales, engineering, and support teams.
                  </p>
                </div>

                {(() => {
                  const activePhones = (settings.phoneContacts && settings.phoneContacts.length > 0
                    ? settings.phoneContacts
                    : DEFAULT_PHONE_CONTACTS
                  ).filter((c) => c.isActive !== false && c.number?.trim());

                  const activeEmails = (settings.emailContacts && settings.emailContacts.length > 0
                    ? settings.emailContacts
                    : DEFAULT_EMAIL_CONTACTS
                  ).filter((c) => c.isActive !== false && c.email?.trim());

                  // 1. Telephone / Direct Mobile
                  const customTelephonePhone = activePhones.find((p) => p.title?.toLowerCase().includes("tele") || p.title?.toLowerCase().includes("mobile") || p.title?.toLowerCase().includes("general") || p.id === "phone-primary");
                  const telephoneNumber = settings.whatsappSettings?.contactPageWhatsappNumber || settings.whatsapp || customTelephonePhone?.number || settings.phone || "+971 2 565 0123";

                  // 2. Sales Category
                  const salesPhone = {
                    id: "phone-sales",
                    title: "Sales",
                    number: settings.departmentHotlines?.salesPhone || 
                            activePhones.find((p) => p.title?.toLowerCase().includes("sale"))?.number || 
                            "+971 2 815 6111"
                  };
                  const salesEmail = {
                    id: "email-sales",
                    title: "Sales",
                    email: activeEmails.find((e) => e.title?.toLowerCase().includes("sale") || e.email?.toLowerCase().includes("sale"))?.email || 
                           settings.emailIntegration?.defaultReceivingEmail || 
                           "sales@cooltechuae.com"
                  };

                  // 3. Services Category
                  const servicesPhone = {
                    id: "phone-services",
                    title: "Services",
                    number: settings.departmentHotlines?.servicesEmergencyPhone || 
                            activePhones.find((p) => p.title?.toLowerCase().includes("service"))?.number || 
                            "+971 2 815 6161"
                  };
                  const servicesEmail = {
                    id: "email-services",
                    title: "Services",
                    email: activeEmails.find((e) => e.title?.toLowerCase().includes("service") || e.title?.toLowerCase().includes("care") || e.email?.toLowerCase().includes("care"))?.email || 
                           "care@cooltechuae.com"
                  };

                  // 4. General Enquiry
                  const generalEmail = {
                    id: "email-general",
                    title: "General Enquiry",
                    email: settings.email || 
                           activeEmails.find((e) => e.title?.toLowerCase().includes("general"))?.email || 
                           "info@cooltechuae.com"
                  };

                  return (
                    <div className="space-y-3.5">
                      
                      {/* 1. General Enquiry & WhatsApp Direct Line */}
                      <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2.5">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                            <PhoneCall size={14} className="text-[#0f4c81]" />
                            General Enquiry &amp; WhatsApp
                          </span>
                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                            Direct Line
                          </span>
                        </div>
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                          <a 
                            href={`tel:${telephoneNumber.replace(/[^0-9+]/g, '')}`} 
                            className="font-mono text-sm font-black text-slate-900 hover:text-[#0f4c81] transition-colors"
                          >
                            {telephoneNumber}
                          </a>
                          <a 
                            href={`https://wa.me/${telephoneNumber.replace(/[^0-9]/g, '')}?text=${encodeURIComponent("Hello Cool Technologies, I would like to inquire regarding HVAC equipment & engineering services.")}`} 
                            target="_blank" 
                            rel="noreferrer"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-xs shrink-0 self-start sm:self-auto"
                          >
                            <MessageSquare size={13} />
                            <span>WhatsApp Chat</span>
                          </a>
                        </div>
                        {/* Integrated General Email right inside General Enquiry */}
                        <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between gap-2 text-xs">
                          <span className="text-[10px] text-slate-400 font-bold uppercase flex items-center gap-1">
                            <Mail size={12} className="text-[#0f4c81]" />
                            Email
                          </span>
                          <a 
                            href={`mailto:${generalEmail.email}`} 
                            className="font-bold text-[#0f4c81] hover:underline"
                          >
                            {generalEmail.email}
                          </a>
                        </div>
                      </div>

                      {/* 2. Departments: Sales & Service (2-column grid) */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {/* Sales */}
                        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 flex flex-col justify-between">
                          <div className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-1.5">
                            <Phone size={13} className="text-[#0f4c81]" />
                            <span>Sales</span>
                          </div>
                          <div className="space-y-1.5 text-xs">
                            <div>
                              <span className="text-[10px] text-slate-400 font-bold uppercase block">Phone</span>
                              <a 
                                href={`tel:${salesPhone.number.replace(/[^0-9+]/g, '')}`} 
                                className="font-mono font-black text-slate-900 hover:text-[#0f4c81] transition-colors"
                              >
                                {salesPhone.number}
                              </a>
                            </div>
                            <div className="pt-1 border-t border-slate-200/50">
                              <span className="text-[10px] text-slate-400 font-bold uppercase block">Email</span>
                              <a 
                                href={`mailto:${salesEmail.email}`} 
                                className="font-semibold text-[#0f4c81] hover:underline break-all block"
                              >
                                {salesEmail.email}
                              </a>
                            </div>
                          </div>
                        </div>

                        {/* Services */}
                        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 flex flex-col justify-between">
                          <div className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-1.5">
                            <Phone size={13} className="text-[#0f4c81]" />
                            <span>Services</span>
                          </div>
                          <div className="space-y-1.5 text-xs">
                            <div>
                              <span className="text-[10px] text-slate-400 font-bold uppercase block">Phone</span>
                              <a 
                                href={`tel:${servicesPhone.number.replace(/[^0-9+]/g, '')}`} 
                                className="font-mono font-black text-slate-900 hover:text-[#0f4c81] transition-colors"
                              >
                                {servicesPhone.number}
                              </a>
                            </div>
                            <div className="pt-1 border-t border-slate-200/50">
                              <span className="text-[10px] text-slate-400 font-bold uppercase block">Email</span>
                              <a 
                                href={`mailto:${servicesEmail.email}`} 
                                className="font-semibold text-[#0f4c81] hover:underline break-all block"
                              >
                                {servicesEmail.email}
                              </a>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* 3. Headquarters Facility Address */}
                      <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-start gap-2.5 text-xs">
                        <MapPin size={14} className="text-slate-400 shrink-0 mt-0.5" />
                        <div>
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Headquarters Facility</span>
                          <span className="text-slate-700 font-semibold leading-relaxed">
                            {settings.address || "Mussafah M-14, Abu Dhabi, United Arab Emirates"}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>

            </div>

          </div>

        </div>

      </section>

      {/* ─────────────────────────────────────────────────────────────
          3. REGIONAL BRANCHES DIRECTORY & DYNAMIC LIVE MAP OR FULL MAIN MAP
      ───────────────────────────────────────────────────────────── */}
      {branches.length === 1 && activeBranch ? (
        /* SINGLE BRANCH: Full width container completely filled with the live map (no boxy borders or white side margins) */
        <section className="w-full relative h-[480px] sm:h-[540px] md:h-[600px] border-t border-b border-slate-200 bg-slate-100 overflow-hidden">
          <iframe
            key={activeBranch.id}
            title={`${activeBranch.name || "Main Facility"} Location Map`}
            src={getEmbedMapUrl(activeBranch)}
            width="100%"
            height="100%"
            className="w-full h-full border-0 block"
            allowFullScreen={true}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
          {activeBranch.mapUrl && (
            <div className="absolute bottom-5 right-5 sm:right-8 z-10">
              <a
                href={activeBranch.mapUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-white/95 hover:bg-white text-[#0f4c81] font-bold text-xs rounded-xl shadow-lg border border-slate-200 backdrop-blur-xs transition-all hover:scale-105"
              >
                <span>Open in Google Maps App</span>
                <ArrowUpRight size={14} />
              </a>
            </div>
          )}
        </section>
      ) : branches.length > 1 ? (
        <section className="py-14 bg-white border-t border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            
            {/* Header & Tabs: Shown when multiple branches exist */}
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
                      {isSelected && !isAutoPaused && (
                        <span className="w-1.5 h-1.5 rounded-full bg-cyan-300 animate-pulse ml-0.5" title="Auto-switching active" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Layout for MULTIPLE branches: 12-Column Split (5-Col Info Card + 7-Col Map) */}
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
