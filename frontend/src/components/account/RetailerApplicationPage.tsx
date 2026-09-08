import React, { useState, useEffect } from "react";
import { 
  Building2, 
  MapPin, 
  CheckCircle2, 
  ArrowLeft,
  User, 
  Mail, 
  Phone, 
  Briefcase, 
  FileText, 
  Check, 
  Loader2, 
  AlertCircle, 
  UploadCloud, 
  Clock, 
  Sparkles,
  Layers,
  CreditCard,
  FileCheck,
  ShieldCheck,
  Headphones,
  CheckCircle
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { apiClient } from "../../services/apiClient";
import { uploadDocumentFile } from "../../services/storageService";

const EMIRATES = [
  "Abu Dhabi",
  "Dubai",
  "Sharjah",
  "Ajman",
  "Umm Al Quwain",
  "Ras Al Khaimah",
  "Fujairah"
];

const PRODUCTS_SERVICES_OPTIONS = [
  "Air Conditioning & Cooling Systems",
  "Water Coolers & Dispensers",
  "Centralized Water Cooling & Chillers",
  "Tank Chillers & Heat Pumps",
  "Ice Machines, Freezers & Refrigerators",
  "Industrial Ventilation & Fans",
  "Water Purification & Tanks",
  "HVAC Spare Parts & Compressors",
  "Installation & Maintenance Services"
];

const VOLUME_OPTIONS = [
  "Below AED 10,000",
  "AED 10,000–50,000",
  "AED 50,000–100,000",
  "Above AED 100,000"
];

interface RetailerApplicationPageProps {
  onNavigateHome?: () => void;
  onNavigateAccount?: () => void;
  onShowToast?: (message: string) => void;
}

export default function RetailerApplicationPage({
  onNavigateHome,
  onNavigateAccount,
  onShowToast,
}: RetailerApplicationPageProps) {
  const { user: authUser, profile, refreshProfile, isLoading: isAuthLoading } = useAuth();

  // 1. Company / Business Information
  const [companyName, setCompanyName] = useState("");
  const [tradeLicenseNumber, setTradeLicenseNumber] = useState("");
  const [businessType, setBusinessType] = useState<"LLC" | "Sole Establishment" | "Other">("LLC");
  const [businessTypeOther, setBusinessTypeOther] = useState("");
  const [emirate, setEmirate] = useState("Dubai");
  const [city, setCity] = useState("Dubai");
  const [address, setAddress] = useState("");

  // 2. Primary Contact
  const [contactPerson, setContactPerson] = useState("");
  const [designation, setDesignation] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");

  // 3. Commercial Information
  const [selectedProducts, setSelectedProducts] = useState<string[]>([
    "Air Conditioning & Cooling Systems",
    "Water Coolers & Dispensers"
  ]);
  const [monthlyVolume, setMonthlyVolume] = useState("AED 10,000–50,000");
  const [paymentTerms, setPaymentTerms] = useState<"Advance Payment" | "Credit Card – Subject to Approval" | "Other">("Advance Payment");
  const [paymentTermsOther, setPaymentTermsOther] = useState("");

  // 4. Documents
  const [tradeLicenseFileName, setTradeLicenseFileName] = useState("");
  const [vatCertificateFileName, setVatCertificateFileName] = useState("");
  const [tradeLicenseFileUrl, setTradeLicenseFileUrl] = useState("");
  const [vatCertificateFileUrl, setVatCertificateFileUrl] = useState("");

  // State Management
  const [existingApp, setExistingApp] = useState<any>(null);
  const [checkingExisting, setCheckingExisting] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Auto-populate from profile
  useEffect(() => {
    if (profile || authUser) {
      if (profile?.companyName) setCompanyName(profile.companyName);
      if (profile?.name || authUser?.displayName) setContactPerson(profile?.name || authUser?.displayName || "");
      if (authUser?.email) setEmail(authUser.email);
      if (profile?.phone) setPhone(profile.phone);
      if (profile?.address) setAddress(profile.address);
      if (profile?.designation) setDesignation(profile.designation);

      setCheckingExisting(true);
      apiClient.getMyRetailerApplication()
        .then((res) => {
          if (res?.application) {
            setExistingApp(res.application);
          }
        })
        .catch(() => {})
        .finally(() => setCheckingExisting(false));
    }
  }, [profile, authUser]);

  const toggleProduct = (prod: string) => {
    setSelectedProducts((prev) =>
      prev.includes(prod) ? prev.filter((p) => p !== prod) : [...prev, prod]
    );
  };

  const [uploadingDocType, setUploadingDocType] = useState<"license" | "vat" | null>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: "license" | "vat") => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      setErrorMessage("File size exceeds 10MB limit. Please upload a smaller document.");
      return;
    }

    setUploadingDocType(type);
    setErrorMessage("");
    try {
      const folder = type === "license" ? "trade-documents/licenses" : "trade-documents/vat";
      const result = await uploadDocumentFile(file, folder);
      if (type === "license") {
        setTradeLicenseFileName(file.name);
        setTradeLicenseFileUrl(result.url);
      } else {
        setVatCertificateFileName(file.name);
        setVatCertificateFileUrl(result.url);
      }
    } catch (err: any) {
      console.error("Document upload error:", err);
      setErrorMessage("Failed to upload document to cloud storage. Please try again.");
    } finally {
      setUploadingDocType(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    // Validations
    if (!companyName.trim()) {
      setErrorMessage("Company / Business Name is required.");
      return;
    }
    if (!tradeLicenseNumber.trim()) {
      setErrorMessage("Trade License / Registration Number is required.");
      return;
    }
    if (businessType === "Other" && !businessTypeOther.trim()) {
      setErrorMessage("Please specify your Business Type.");
      return;
    }
    if (!city.trim() || !address.trim()) {
      setErrorMessage("Please complete your Business City and Address.");
      return;
    }
    if (!contactPerson.trim()) {
      setErrorMessage("Contact Person Name is required.");
      return;
    }
    if (!designation.trim()) {
      setErrorMessage("Designation is required.");
      return;
    }
    if (!phone.trim()) {
      setErrorMessage("Mobile / WhatsApp Number is required.");
      return;
    }
    if (!email.trim() || !email.includes("@")) {
      setErrorMessage("A valid business email address is required.");
      return;
    }
    if (selectedProducts.length === 0) {
      setErrorMessage("Please select at least one product or service category.");
      return;
    }
    if (paymentTerms === "Other" && !paymentTermsOther.trim()) {
      setErrorMessage("Please specify your Preferred Payment Terms.");
      return;
    }
    if (!tradeLicenseFileName && !tradeLicenseFileUrl) {
      setErrorMessage("Trade License Copy upload is required.");
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        companyName: companyName.trim(),
        legalName: companyName.trim(),
        tradeLicenseNumber: tradeLicenseNumber.trim(),
        businessType: businessType === "Other" ? businessTypeOther.trim() : businessType,
        emirate,
        city: city.trim(),
        address: address.trim(),
        contactPerson: contactPerson.trim(),
        designation: designation.trim(),
        phone: phone.trim(),
        whatsappNumber: phone.trim(),
        email: email.trim(),
        interestedCategories: selectedProducts,
        annualVolumeEstimate: monthlyVolume,
        paymentTermsRequested: paymentTerms === "Other" ? paymentTermsOther.trim() : paymentTerms,
        tradeLicenseFileUrl: tradeLicenseFileUrl || `license_${tradeLicenseFileName || "uploaded"}`,
        taxCertificateFileUrl: vatCertificateFileUrl || (vatCertificateFileName ? `vat_${vatCertificateFileName}` : ""),
      };

      const res = await apiClient.applyRetailer(payload);

      if (res?.application) {
        setExistingApp(res.application);
      }
      setSubmitSuccess(true);
      if (refreshProfile) await refreshProfile();
      if (onShowToast) onShowToast("Reseller Registration Form submitted successfully!");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err: any) {
      setErrorMessage(err?.message || "Failed to submit registration form. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const navigateBackToWorkspace = () => {
    if (onNavigateAccount) {
      onNavigateAccount();
    } else {
      window.location.hash = "#/account";
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  if (!authUser && !isAuthLoading) {
    return (
      <div className="min-h-screen bg-[#031b4e] flex flex-col items-center justify-center p-6 text-center text-white">
        <div className="w-16 h-16 rounded-2xl bg-white/10 text-cyan-400 flex items-center justify-center mb-4 border border-white/10">
          <Building2 size={32} />
        </div>
        <h1 className="text-2xl font-black text-white">Sign In Required</h1>
        <p className="text-xs text-slate-300 mt-2 max-w-sm">
          Please sign in or create an account before submitting the Reseller Registration Form.
        </p>
        <button
          type="button"
          onClick={() => {
            window.location.hash = "#/login?redirect=retailer-application";
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
          className="mt-6 px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-lg transition-all cursor-pointer"
        >
          Sign In / Register
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col antialiased">
      
      {/* Top Header */}
      <header className="sticky top-0 z-40 bg-[#031b4e] text-white border-b border-blue-900 shadow-sm">
        <div className="w-full px-4 sm:px-8 h-15 flex items-center justify-between">
          <button
            type="button"
            onClick={navigateBackToWorkspace}
            className="flex items-center gap-2 text-xs font-bold text-slate-300 hover:text-white bg-blue-950/60 hover:bg-blue-900 px-3.5 py-2 rounded-lg border border-blue-800 transition-all cursor-pointer"
          >
            <ArrowLeft size={14} />
            <span>Back to My Account</span>
          </button>

          <span className="text-xs font-black tracking-wider uppercase text-cyan-200">
            COOL TECHNOLOGIES • RESELLER REGISTRATION
          </span>
        </div>
      </header>

      {/* Main Container - Balanced Enterprise 2-Column Architecture */}
      <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 flex-1">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* =========================================================================
              LEFT COLUMN: REGISTRATION BRIEFING & CORPORATE SUMMARY (4 COLS)
             ========================================================================= */}
          <aside className="lg:col-span-4 space-y-6 lg:sticky lg:top-20">
            
            {/* Main Information Card */}
            <div className="bg-[#031b4e] text-white rounded-2xl p-6 sm:p-7 shadow-sm">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-400/20 text-cyan-300 text-[10px] font-black uppercase tracking-wider mb-3">
                <Sparkles size={12} />
                <span>Trade Partnership Program</span>
              </div>

              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white uppercase leading-tight">
                COOL TECHNOLOGIES
              </h1>
              <p className="text-xs font-bold text-cyan-300 mt-1 uppercase tracking-wider">
                Reseller Registration Form
              </p>

              <p className="text-xs text-blue-100 mt-3 leading-relaxed">
                Register your business with Cool Technologies to access commercial trade pricing, dedicated technical support, and direct UAE-wide dispatch facilities.
              </p>

              <div className="mt-6 pt-5 border-t border-blue-900/80 space-y-3">
                <div className="text-[11px] font-black tracking-wider uppercase text-slate-300">
                  Application Sections:
                </div>
                <div className="space-y-2 text-xs text-slate-200">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-300 flex items-center justify-center font-bold text-[10px]">1</span>
                    <span>Company / Business Info</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-300 flex items-center justify-center font-bold text-[10px]">2</span>
                    <span>Primary Contact</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-300 flex items-center justify-center font-bold text-[10px]">3</span>
                    <span>Commercial Information</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-300 flex items-center justify-center font-bold text-[10px]">4</span>
                    <span>Document Uploads</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Existing Application Card */}
            {existingApp && (
              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs space-y-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">Existing Registration</span>
                <h3 className="text-xs font-black text-slate-900">
                  {existingApp.status === "approved" ? "Approved B2B Partner" : "Under Commercial Review"}
                </h3>
                <p className="text-[11px] text-slate-500 leading-snug">
                  Submitted for: <strong>{existingApp.companyName}</strong>
                </p>
                <div className="pt-1">
                  <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md inline-block ${
                    existingApp.status === "approved" ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
                  }`}>
                    Status: {existingApp.status}
                  </span>
                </div>
              </div>
            )}

            {/* Direct Commercial Support Card */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs space-y-3">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-xs">
                <Headphones size={15} className="text-blue-600 shrink-0" />
                <span>Commercial Support</span>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Have questions regarding trade verification or require assistance?
              </p>
              <div className="text-xs font-semibold text-slate-700 space-y-1 pt-1 border-t border-slate-100">
                <div>Email: <a href="mailto:info@cooltechuae.com" className="text-blue-600 hover:underline">info@cooltechuae.com</a></div>
                <div>Phone: <a href="tel:+97125650123" className="text-blue-600 hover:underline">+971 2 565 0123</a></div>
              </div>
            </div>

          </aside>

          {/* =========================================================================
              RIGHT COLUMN: FULL-WIDTH COMPREHENSIVE REGISTRATION FORM (8 COLS)
             ========================================================================= */}
          <div className="lg:col-span-8">
            
            {/* Success Confirmation */}
            {submitSuccess ? (
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 sm:p-12 text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                  <CheckCircle2 size={36} />
                </div>
                <h2 className="text-2xl font-black text-slate-900">Registration Form Submitted!</h2>
                <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
                  Thank you for submitting the Reseller Registration Form. Our commercial team will verify your trade documents and contact you within 24 hours.
                </p>
                <button
                  type="button"
                  onClick={navigateBackToWorkspace}
                  className="mt-4 px-6 py-2.5 bg-[#031b4e] hover:bg-[#2596be] text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer"
                >
                  Return to My Account
                </button>
              </div>
            ) : (
              /* Exact Form matching User Specification */
              <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden divide-y divide-slate-100">
                
                {/* Error Message */}
                {errorMessage && (
                  <div className="p-4 bg-red-50 border-b border-red-100 flex items-center gap-2 text-xs font-bold text-red-800">
                    <AlertCircle size={16} className="text-red-600 shrink-0" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                {/* =========================================================================
                    SECTION 1: COMPANY / BUSINESS INFORMATION
                   ========================================================================= */}
                <div className="p-6 sm:p-8 space-y-5">
                  <div className="pb-3 border-b border-slate-100">
                    <h2 className="text-sm font-black text-slate-900 uppercase tracking-wide flex items-center gap-2">
                      <Building2 size={16} className="text-[#031b4e]" />
                      <span>Company / Business Information</span>
                    </h2>
                  </div>

                  <div className="space-y-4">
                    {/* 1. Company / Business Name* */}
                    <div>
                      <label className="block text-xs font-bold text-slate-800 mb-1.5">
                        1. Company / Business Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        placeholder="Enter registered company name"
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                      />
                    </div>

                    {/* 2. Trade License / Registration Number* */}
                    <div>
                      <label className="block text-xs font-bold text-slate-800 mb-1.5">
                        2. Trade License / Registration Number <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={tradeLicenseNumber}
                        onChange={(e) => setTradeLicenseNumber(e.target.value)}
                        placeholder="e.g. CN-1234567 or TL-987654"
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                      />
                    </div>

                    {/* 3. Business Type* */}
                    <div>
                      <label className="block text-xs font-bold text-slate-800 mb-2">
                        3. Business Type <span className="text-red-500">*</span>
                      </label>
                      <div className="space-y-2">
                        <label className="flex items-center gap-2.5 text-xs text-slate-700 cursor-pointer">
                          <input
                            type="radio"
                            name="businessType"
                            value="LLC"
                            checked={businessType === "LLC"}
                            onChange={() => setBusinessType("LLC")}
                            className="w-4 h-4 text-blue-600"
                          />
                          <span className="font-semibold">LLC</span>
                        </label>

                        <label className="flex items-center gap-2.5 text-xs text-slate-700 cursor-pointer">
                          <input
                            type="radio"
                            name="businessType"
                            value="Sole Establishment"
                            checked={businessType === "Sole Establishment"}
                            onChange={() => setBusinessType("Sole Establishment")}
                            className="w-4 h-4 text-blue-600"
                          />
                          <span className="font-semibold">Sole Establishment</span>
                        </label>

                        <div className="flex items-center gap-2 text-xs text-slate-700">
                          <label className="flex items-center gap-2 cursor-pointer shrink-0">
                            <input
                              type="radio"
                              name="businessType"
                              value="Other"
                              checked={businessType === "Other"}
                              onChange={() => setBusinessType("Other")}
                              className="w-4 h-4 text-blue-600"
                            />
                            <span className="font-semibold">Other:</span>
                          </label>
                          <input
                            type="text"
                            disabled={businessType !== "Other"}
                            value={businessTypeOther}
                            onChange={(e) => setBusinessTypeOther(e.target.value)}
                            placeholder="Please specify"
                            className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-blue-600 disabled:opacity-50"
                          />
                        </div>
                      </div>
                    </div>

                    {/* 4. Business Address* */}
                    <div className="pt-2">
                      <label className="block text-xs font-bold text-slate-800 mb-2">
                        4. Business Address <span className="text-red-500">*</span>
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-500 mb-1">Emirate *</label>
                          <select
                            value={emirate}
                            onChange={(e) => {
                              setEmirate(e.target.value);
                              if (city === emirate) setCity(e.target.value);
                            }}
                            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-blue-600 cursor-pointer font-semibold"
                          >
                            {EMIRATES.map((em) => (
                              <option key={em} value={em}>{em}</option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-[11px] font-semibold text-slate-500 mb-1">City *</label>
                          <input
                            type="text"
                            required
                            value={city}
                            onChange={(e) => setCity(e.target.value)}
                            placeholder="e.g. Dubai / Mussafah / Al Ain"
                            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-blue-600"
                          />
                        </div>

                        <div className="sm:col-span-2">
                          <label className="block text-[11px] font-semibold text-slate-500 mb-1">Address *</label>
                          <input
                            type="text"
                            required
                            value={address}
                            onChange={(e) => setAddress(e.target.value)}
                            placeholder="Building / Warehouse / Street / Area"
                            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-blue-600"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* =========================================================================
                    SECTION 2: PRIMARY CONTACT
                   ========================================================================= */}
                <div className="p-6 sm:p-8 space-y-5">
                  <div className="pb-3 border-b border-slate-100">
                    <h2 className="text-sm font-black text-slate-900 uppercase tracking-wide flex items-center gap-2">
                      <User size={16} className="text-[#031b4e]" />
                      <span>Primary Contact</span>
                    </h2>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* 5. Contact Person Name* */}
                    <div>
                      <label className="block text-xs font-bold text-slate-800 mb-1.5">
                        5. Contact Person Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={contactPerson}
                        onChange={(e) => setContactPerson(e.target.value)}
                        placeholder="Full name of representative"
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                      />
                    </div>

                    {/* 6. Designation* */}
                    <div>
                      <label className="block text-xs font-bold text-slate-800 mb-1.5">
                        6. Designation <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={designation}
                        onChange={(e) => setDesignation(e.target.value)}
                        placeholder="e.g. Managing Director, Procurement Head"
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                      />
                    </div>

                    {/* 7. Mobile / WhatsApp Number* */}
                    <div>
                      <label className="block text-xs font-bold text-slate-800 mb-1.5">
                        7. Mobile / WhatsApp Number <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="tel"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="e.g. +971 50 123 4567"
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                      />
                    </div>

                    {/* 8. Email Address* */}
                    <div>
                      <label className="block text-xs font-bold text-slate-800 mb-1.5">
                        8. Email Address <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="official@company.com"
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                      />
                    </div>
                  </div>
                </div>

                {/* =========================================================================
                    SECTION 3: COMMERCIAL INFORMATION
                   ========================================================================= */}
                <div className="p-6 sm:p-8 space-y-5">
                  <div className="pb-3 border-b border-slate-100">
                    <h2 className="text-sm font-black text-slate-900 uppercase tracking-wide flex items-center gap-2">
                      <CreditCard size={16} className="text-[#031b4e]" />
                      <span>Commercial Information</span>
                    </h2>
                  </div>

                  <div className="space-y-5">
                    {/* 9. Products / Services Interested In* */}
                    <div>
                      <label className="block text-xs font-bold text-slate-800 mb-2">
                        9. Products / Services Interested In <span className="text-red-500">*</span>
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                        {PRODUCTS_SERVICES_OPTIONS.map((item) => {
                          const isChecked = selectedProducts.includes(item);
                          return (
                            <label
                              key={item}
                              onClick={() => toggleProduct(item)}
                              className={`flex items-start gap-2.5 p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                                isChecked
                                  ? "bg-blue-50 border-blue-300 text-blue-950 font-bold shadow-2xs"
                                  : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => {}}
                                className="mt-0.5 w-4 h-4 text-blue-600 rounded cursor-pointer"
                              />
                              <span className="leading-snug">{item}</span>
                            </label>
                          );
                        })}
                      </div>
                    </div>

                    {/* 10. Expected Monthly Purchase / Business Volume* */}
                    <div>
                      <label className="block text-xs font-bold text-slate-800 mb-2">
                        10. Expected Monthly Purchase / Business Volume <span className="text-red-500">*</span>
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                        {VOLUME_OPTIONS.map((vol) => (
                          <label
                            key={vol}
                            className={`flex items-center gap-2.5 p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                              monthlyVolume === vol
                                ? "bg-blue-50 border-blue-300 text-blue-950 font-bold shadow-2xs"
                                : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
                            }`}
                          >
                            <input
                              type="radio"
                              name="monthlyVolume"
                              value={vol}
                              checked={monthlyVolume === vol}
                              onChange={() => setMonthlyVolume(vol)}
                              className="w-4 h-4 text-blue-600"
                            />
                            <span>{vol}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* 11. Preferred Payment Terms* */}
                    <div>
                      <label className="block text-xs font-bold text-slate-800 mb-2">
                        11. Preferred Payment Terms <span className="text-red-500">*</span>
                      </label>
                      <div className="space-y-2.5">
                        <label className={`flex items-center gap-2.5 p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                          paymentTerms === "Advance Payment" ? "bg-blue-50 border-blue-300 text-blue-950 font-bold shadow-2xs" : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
                        }`}>
                          <input
                            type="radio"
                            name="paymentTerms"
                            value="Advance Payment"
                            checked={paymentTerms === "Advance Payment"}
                            onChange={() => setPaymentTerms("Advance Payment")}
                            className="w-4 h-4 text-blue-600"
                          />
                          <span>Advance Payment</span>
                        </label>

                        <label className={`flex items-center gap-2.5 p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                          paymentTerms === "Credit Card – Subject to Approval" ? "bg-blue-50 border-blue-300 text-blue-950 font-bold shadow-2xs" : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
                        }`}>
                          <input
                            type="radio"
                            name="paymentTerms"
                            value="Credit Card – Subject to Approval"
                            checked={paymentTerms === "Credit Card – Subject to Approval"}
                            onChange={() => setPaymentTerms("Credit Card – Subject to Approval")}
                            className="w-4 h-4 text-blue-600"
                          />
                          <span>Credit Card – Subject to Approval</span>
                        </label>

                        <div className="flex items-center gap-2 p-3 rounded-xl border border-slate-200 bg-slate-50 text-xs">
                          <label className="flex items-center gap-2 cursor-pointer shrink-0 text-slate-700 font-semibold">
                            <input
                              type="radio"
                              name="paymentTerms"
                              value="Other"
                              checked={paymentTerms === "Other"}
                              onChange={() => setPaymentTerms("Other")}
                              className="w-4 h-4 text-blue-600"
                            />
                            <span>Other:</span>
                          </label>
                          <input
                            type="text"
                            disabled={paymentTerms !== "Other"}
                            value={paymentTermsOther}
                            onChange={(e) => setPaymentTermsOther(e.target.value)}
                            placeholder="Please specify terms"
                            className="flex-1 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-blue-600 disabled:opacity-50"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* =========================================================================
                    SECTION 4: DOCUMENTS
                   ========================================================================= */}
                <div className="p-6 sm:p-8 space-y-5">
                  <div className="pb-3 border-b border-slate-100">
                    <h2 className="text-sm font-black text-slate-900 uppercase tracking-wide flex items-center gap-2">
                      <FileCheck size={16} className="text-[#031b4e]" />
                      <span>Documents</span>
                    </h2>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* 12. Trade License Copy* — Upload */}
                    <div>
                      <label className="block text-xs font-bold text-slate-800 mb-1.5">
                        12. Trade License Copy <span className="text-red-500">* — Upload</span>
                      </label>
                      <label className="border-2 border-dashed border-slate-200 hover:border-blue-400 bg-slate-50 hover:bg-blue-50/30 rounded-xl p-5 flex flex-col items-center justify-center text-center cursor-pointer transition-all min-h-[120px]">
                        {uploadingDocType === "license" ? (
                          <div className="flex flex-col items-center">
                            <Loader2 size={24} className="text-blue-600 animate-spin mb-1.5" />
                            <span className="text-xs font-bold text-blue-600">Uploading to Cloudflare R2...</span>
                          </div>
                        ) : (
                          <>
                            <UploadCloud size={24} className="text-blue-600 mb-1.5" />
                            <span className="text-xs font-bold text-slate-800 line-clamp-1">
                              {tradeLicenseFileName ? tradeLicenseFileName : "Select Trade License (PDF / JPG / PNG)"}
                            </span>
                            <span className="text-[10px] text-slate-400 mt-0.5">Maximum size 10MB</span>
                          </>
                        )}
                        <input
                          type="file"
                          accept=".pdf,.jpg,.jpeg,.png"
                          onChange={(e) => handleFileUpload(e, "license")}
                          disabled={uploadingDocType !== null}
                          className="hidden"
                        />
                      </label>
                      {tradeLicenseFileName && (
                        <div className="mt-2 flex items-center gap-1.5 text-xs text-emerald-700 font-bold">
                          <CheckCircle2 size={13} className="shrink-0" />
                          <span className="truncate">{tradeLicenseFileName}</span>
                          <span className="text-[10px] text-emerald-600 font-semibold bg-emerald-50 px-1.5 py-0.5 rounded ml-auto">Saved</span>
                        </div>
                      )}
                    </div>

                    {/* 13. VAT Certificate — Upload (if VAT registered) */}
                    <div>
                      <label className="block text-xs font-bold text-slate-800 mb-1.5">
                        13. VAT Certificate — Upload <span className="text-slate-400 font-normal">(if registered)</span>
                      </label>
                      <label className="border-2 border-dashed border-slate-200 hover:border-blue-400 bg-slate-50 hover:bg-blue-50/30 rounded-xl p-5 flex flex-col items-center justify-center text-center cursor-pointer transition-all min-h-[120px]">
                        {uploadingDocType === "vat" ? (
                          <div className="flex flex-col items-center">
                            <Loader2 size={24} className="text-blue-600 animate-spin mb-1.5" />
                            <span className="text-xs font-bold text-blue-600">Uploading to Cloudflare R2...</span>
                          </div>
                        ) : (
                          <>
                            <UploadCloud size={24} className="text-slate-500 mb-1.5" />
                            <span className="text-xs font-bold text-slate-800 line-clamp-1">
                              {vatCertificateFileName ? vatCertificateFileName : "Select VAT Certificate (Optional)"}
                            </span>
                            <span className="text-[10px] text-slate-400 mt-0.5">Maximum size 10MB</span>
                          </>
                        )}
                        <input
                          type="file"
                          accept=".pdf,.jpg,.jpeg,.png"
                          onChange={(e) => handleFileUpload(e, "vat")}
                          disabled={uploadingDocType !== null}
                          className="hidden"
                        />
                      </label>
                      {vatCertificateFileName && (
                        <div className="mt-2 flex items-center gap-1.5 text-xs text-emerald-700 font-bold">
                          <CheckCircle2 size={13} className="shrink-0" />
                          <span className="truncate">{vatCertificateFileName}</span>
                          <span className="text-[10px] text-emerald-600 font-semibold bg-emerald-50 px-1.5 py-0.5 rounded ml-auto">Saved</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Form Footer & Submit Button */}
                <div className="p-6 sm:p-8 bg-slate-50 flex items-center justify-between gap-4">
                  <button
                    type="button"
                    onClick={navigateBackToWorkspace}
                    className="px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-8 py-3 bg-[#031b4e] hover:bg-[#2596be] text-white font-black text-xs rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50 uppercase tracking-wider"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 size={14} className="animate-spin" />
                        <span>Submitting Registration...</span>
                      </>
                    ) : (
                      <>
                        <Check size={14} className="stroke-[3]" />
                        <span>Submit Registration Form</span>
                      </>
                    )}
                  </button>
                </div>

              </form>
            )}

          </div>

        </div>

      </main>

      {/* Footer */}
      <footer className="py-4 text-center text-[11px] text-slate-400 border-t border-slate-200 bg-white">
        © 2026 Cool Technologies LLC. All rights reserved. Dubai & Abu Dhabi, United Arab Emirates.
      </footer>

    </div>
  );
}
