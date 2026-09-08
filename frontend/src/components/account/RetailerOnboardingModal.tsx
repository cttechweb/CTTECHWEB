import React, { useState, useEffect } from "react";
import { 
  X, 
  ShieldCheck, 
  Building2, 
  FileCheck, 
  MapPin, 
  CheckCircle2, 
  ArrowRight, 
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
  BadgeAlert,
  Shield
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { apiClient } from "../../services/apiClient";

interface RetailerOnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitSuccess?: (data: any) => void;
}

const PRODUCT_CATEGORIES = [
  "Ducted Split Systems",
  "Commercial VRF Systems",
  "Air-Cooled & Water Chillers",
  "Rooftop Package Units",
  "HVAC Compressors & Spares",
  "Copper Pipes & Fittings",
  "Air Distribution & Grilles",
  "Smart Controls & Thermostats",
  "Refrigerants & Consumables"
];

const EMIRATES = [
  "Abu Dhabi",
  "Dubai",
  "Sharjah",
  "Ajman",
  "Ras Al Khaimah",
  "Fujairah",
  "Umm Al Quwain"
];

const BUSINESS_TYPES = [
  { id: "mep_contractor", label: "MEP Contractor" },
  { id: "hvac_specialist", label: "HVAC Installation & Maintenance" },
  { id: "equipment_trader", label: "Equipment Distributor / Trader" },
  { id: "facilities_management", label: "Facilities Management (FM)" },
  { id: "engineering_consultant", label: "Engineering / Consulting Firm" },
  { id: "other", label: "Other Commercial Entity" }
];

const VOLUME_OPTIONS = [
  "Under AED 100,000 / year",
  "AED 100,000 – AED 500,000 / year",
  "AED 500,000 – AED 1,000,000 / year",
  "Above AED 1,000,000 / year"
];

const PAYMENT_TERMS_OPTIONS = [
  "Standard Commercial (Advance / COD)",
  "30-Day Commercial Trade Credit",
  "60-Day Commercial Trade Credit",
  "Letter of Credit (LC) / Bank Guarantee"
];

export default function RetailerOnboardingModal({
  isOpen,
  onClose,
  onSubmitSuccess,
}: RetailerOnboardingModalProps) {
  const { user: authUser, profile, refreshProfile } = useAuth();

  // Wizard Step: 1 = Business, 2 = Contact, 3 = Commercial, 4 = Documents & Declaration
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  // Form Fields - Step 1: Business Info
  const [companyName, setCompanyName] = useState("");
  const [legalName, setLegalName] = useState("");
  const [tradeLicenseNumber, setTradeLicenseNumber] = useState("");
  const [taxRegistrationNumber, setTaxRegistrationNumber] = useState("");
  const [businessType, setBusinessType] = useState("mep_contractor");
  const [emirate, setEmirate] = useState("Abu Dhabi");
  const [city, setCity] = useState("Abu Dhabi");
  const [address, setAddress] = useState("");

  // Form Fields - Step 2: Primary Contact
  const [contactPerson, setContactPerson] = useState("");
  const [designation, setDesignation] = useState("");
  const [phone, setPhone] = useState("");
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [email, setEmail] = useState("");

  // Form Fields - Step 3: Commercial Info
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [annualVolumeEstimate, setAnnualVolumeEstimate] = useState(VOLUME_OPTIONS[1]);
  const [paymentTermsRequested, setPaymentTermsRequested] = useState(PAYMENT_TERMS_OPTIONS[0]);

  // Form Fields - Step 4: Documents & Declaration
  const [tradeLicenseFileUrl, setTradeLicenseFileUrl] = useState("");
  const [taxCertificateFileUrl, setTaxCertificateFileUrl] = useState("");
  const [authorizedSignatory, setAuthorizedSignatory] = useState("");
  const [declarationAccepted, setDeclarationAccepted] = useState(false);
  const [additionalNotes, setAdditionalNotes] = useState("");

  // State Management
  const [existingApp, setExistingApp] = useState<any>(null);
  const [checkingExisting, setCheckingExisting] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedApp, setSubmittedApp] = useState<any>(null);
  const [error, setError] = useState("");

  // Initialize and check existing application
  useEffect(() => {
    if (isOpen) {
      setError("");
      setStep(1);
      setSubmittedApp(null);

      // Pre-fill from profile
      if (profile) {
        setCompanyName(profile.companyName || "");
        setLegalName(profile.companyName || "");
        setContactPerson(profile.name || authUser?.displayName || "");
        setDesignation(profile.designation || "Procurement Manager");
        setPhone(profile.phone || "");
        setWhatsappNumber(profile.phone || "");
        setEmail(authUser?.email || profile.email || "");
        setAddress(profile.address || "");
        setAuthorizedSignatory(profile.name || authUser?.displayName || "");
      }

      // Check if user already submitted
      setCheckingExisting(true);
      apiClient.getMyRetailerApplication()
        .then((res) => {
          if (res?.application) {
            setExistingApp(res.application);
          } else {
            setExistingApp(null);
          }
        })
        .catch(() => {
          setExistingApp(null);
        })
        .finally(() => {
          setCheckingExisting(false);
        });
    }
  }, [isOpen, profile, authUser]);

  if (!isOpen) return null;

  const toggleCategory = (cat: string) => {
    setSelectedCategories((prev) => 
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  };

  const handleNextStep = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (step === 1) {
      if (!companyName.trim()) {
        setError("Company / Business Name is required.");
        return;
      }
      if (!tradeLicenseNumber.trim()) {
        setError("Trade License / Registration Number is required.");
        return;
      }
      if (!address.trim()) {
        setError("Business address is required.");
        return;
      }
      setStep(2);
    } else if (step === 2) {
      if (!contactPerson.trim()) {
        setError("Primary contact person name is required.");
        return;
      }
      if (!phone.trim()) {
        setError("Contact mobile/telephone number is required.");
        return;
      }
      if (!email.trim()) {
        setError("Business email address is required.");
        return;
      }
      setStep(3);
    } else if (step === 3) {
      if (selectedCategories.length === 0) {
        setError("Please select at least one product category of interest.");
        return;
      }
      setStep(4);
    }
  };

  const handleSubmitApplication = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!declarationAccepted) {
      setError("Please confirm the authorization declaration before submitting.");
      return;
    }

    if (!authorizedSignatory.trim()) {
      setError("Authorized representative name is required.");
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        companyName: companyName.trim(),
        legalName: (legalName.trim() || companyName.trim()),
        tradeLicenseNumber: tradeLicenseNumber.trim(),
        taxRegistrationNumber: taxRegistrationNumber.trim(),
        businessType,
        emirate,
        city: (city.trim() || emirate),
        address: address.trim(),
        contactPerson: contactPerson.trim(),
        designation: designation.trim(),
        phone: phone.trim(),
        whatsappNumber: (whatsappNumber.trim() || phone.trim()),
        email: email.trim(),
        interestedCategories: selectedCategories,
        annualVolumeEstimate,
        paymentTermsRequested,
        tradeLicenseFileUrl: tradeLicenseFileUrl.trim(),
        taxCertificateFileUrl: taxCertificateFileUrl.trim(),
        applicationPayloadJson: {
          authorizedSignatory: authorizedSignatory.trim(),
          submittedDate: new Date().toISOString(),
          additionalNotes: additionalNotes.trim(),
        }
      };

      const res = await apiClient.applyRetailer(payload);
      await refreshProfile();

      setIsSubmitting(false);
      setSubmittedApp(res.application || { id: "APP-2026", status: "pending" });

      if (onSubmitSuccess) {
        onSubmitSuccess(res.application);
      }
    } catch (err: any) {
      console.error("[Retailer Application Error]:", err);
      setIsSubmitting(false);
      setError(err?.message || "Failed to submit application. Please check all fields and try again.");
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="retailer-modal-title"
    >
      <div className="bg-white text-slate-900 w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200/90 flex flex-col overflow-hidden relative max-h-[92vh]">
        
        {/* Modal Header */}
        <div className="bg-[#031b4e] text-white p-5 sm:p-6 flex items-start justify-between relative shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-cyan-500/20 text-cyan-300 text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full border border-cyan-400/30">
                Commercial Trade Partnership
              </span>
              <span className="bg-slate-700/60 text-slate-300 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full">
                Verification Required
              </span>
            </div>
            
            <h2 id="retailer-modal-title" className="font-display font-extrabold text-xl sm:text-2xl mt-2 flex items-center gap-2">
              <ShieldCheck size={24} className="text-cyan-400 shrink-0" />
              <span>Reseller & Contractor Registration</span>
            </h2>
            <p className="text-xs text-blue-200 mt-1 max-w-lg">
              Apply for wholesale contractor pricing, dedicated trade credit & direct commercial procurement.
            </p>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all cursor-pointer shrink-0 mt-0.5"
            aria-label="Close Registration Modal"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto">
          
          {checkingExisting ? (
            <div className="py-16 flex flex-col items-center justify-center space-y-3">
              <Loader2 className="w-8 h-8 text-[#031b4e] animate-spin" />
              <p className="text-xs font-bold text-slate-500">Checking application records in database...</p>
            </div>
          ) : submittedApp ? (
            /* Success State */
            <div className="text-center py-8 space-y-4 animate-in zoom-in-95 duration-200">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto border-2 border-emerald-200 shadow-xs">
                <CheckCircle2 size={36} />
              </div>
              <h3 className="text-2xl font-black text-slate-900">Application Submitted!</h3>
              <div className="inline-block bg-slate-100 border border-slate-200 text-slate-800 text-xs font-mono font-bold px-3 py-1 rounded-lg">
                Reference: {submittedApp.id || "APP-2026-XXXX"}
              </div>
              <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed font-medium">
                Thank you, <span className="font-bold text-slate-900">{contactPerson}</span>. Your registration for <span className="font-bold text-slate-900">{companyName}</span> has been logged into our verification queue.
              </p>
              
              <div className="bg-blue-50/80 border border-blue-200 rounded-xl p-4 max-w-md mx-auto text-left text-xs text-blue-900 space-y-1.5">
                <div className="flex items-center gap-2 font-bold text-[#031b4e]">
                  <Clock size={15} />
                  <span>Next Steps: Verification & Compliance</span>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  Our commercial team reviews trade licenses within 1–2 business days. Once approved, your account will be granted B2B partner access. You can track this live in your <span className="font-bold text-slate-800">My Account</span> profile.
                </p>
              </div>

              <button
                onClick={onClose}
                className="mt-4 px-6 py-2.5 bg-[#031b4e] hover:bg-blue-900 text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer"
              >
                Return to My Account
              </button>
            </div>
          ) : existingApp && (existingApp.status === "pending" || existingApp.status === "under_review" || existingApp.status === "approved") ? (
            /* Existing Active Application Card */
            <div className="py-6 space-y-5 animate-in fade-in duration-200">
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Active Application</span>
                  <span className="text-xs font-mono font-bold text-slate-500">{existingApp.id}</span>
                </div>

                <div className="flex items-center gap-3">
                  {existingApp.status === "approved" ? (
                    <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                      <Shield size={24} />
                    </div>
                  ) : (
                    <div className="w-12 h-12 rounded-xl bg-blue-100 text-[#031b4e] flex items-center justify-center">
                      <Clock size={24} />
                    </div>
                  )}
                  <div>
                    <h3 className="font-extrabold text-slate-900 text-base">
                      {existingApp.companyName}
                    </h3>
                    <p className="text-xs text-slate-500 font-medium">
                      Submitted on {new Date(existingApp.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="p-3.5 bg-white border border-slate-200 rounded-xl space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500 font-medium">Current Status:</span>
                    <span className={`font-black uppercase px-2.5 py-0.5 rounded-full text-[10px] ${
                      existingApp.status === "approved"
                        ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                        : "bg-blue-100 text-blue-800 border border-blue-300"
                    }`}>
                      {existingApp.status.replace("_", " ")}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed font-medium pt-1">
                    {existingApp.status === "approved"
                      ? "Your B2B trade account is fully verified. Commercial procurement and wholesale terms are active."
                      : "Your application is currently being reviewed by our commercial compliance team. You will be notified once verification completes."}
                  </p>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={onClose}
                  className="px-6 py-2.5 bg-[#031b4e] text-white text-xs font-bold rounded-xl hover:bg-blue-900 transition-colors cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          ) : (
            /* Multi-Step Application Form */
            <div className="space-y-5">
              
              {/* Step Progress Bar */}
              <div className="grid grid-cols-4 gap-2 pb-2">
                {[
                  { stepNum: 1, title: "1. Business" },
                  { stepNum: 2, title: "2. Contact" },
                  { stepNum: 3, title: "3. Sourcing" },
                  { stepNum: 4, title: "4. Submit" }
                ].map((s) => (
                  <div key={s.stepNum} className="space-y-1">
                    <div className={`h-1.5 rounded-full transition-all ${
                      step >= s.stepNum ? "bg-[#031b4e]" : "bg-slate-200"
                    }`} />
                    <span className={`text-[10px] font-bold block ${
                      step === s.stepNum ? "text-[#031b4e]" : "text-slate-400"
                    }`}>
                      {s.title}
                    </span>
                  </div>
                ))}
              </div>

              {/* Error Message */}
              {error && (
                <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium flex items-start gap-2.5 animate-in fade-in duration-150">
                  <AlertCircle size={16} className="text-red-500 shrink-0 mt-0.5" />
                  <span className="leading-snug">{error}</span>
                </div>
              )}

              {/* STEP 1: Business Information */}
              {step === 1 && (
                <form onSubmit={handleNextStep} className="space-y-4 animate-in fade-in duration-150">
                  <div className="flex items-center gap-2 pb-1 border-b border-slate-100">
                    <Building2 size={16} className="text-[#031b4e]" />
                    <h3 className="font-extrabold text-slate-900 text-sm">Company & Business Information</h3>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div className="sm:col-span-2">
                      <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                        Company / Trade Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#031b4e]/15 focus:border-[#031b4e]"
                        placeholder="e.g. Al Wasl MEP Contracting LLC"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                        Trade License / Reg. Number <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={tradeLicenseNumber}
                        onChange={(e) => setTradeLicenseNumber(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#031b4e]/15 focus:border-[#031b4e]"
                        placeholder="e.g. CN-1234567"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                        TRN / Tax Registration Number
                      </label>
                      <input
                        type="text"
                        value={taxRegistrationNumber}
                        onChange={(e) => setTaxRegistrationNumber(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#031b4e]/15 focus:border-[#031b4e]"
                        placeholder="100XXXXXXXXXXXX (15 digits)"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                        Business Entity Type <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={businessType}
                        onChange={(e) => setBusinessType(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#031b4e]/15 focus:border-[#031b4e]"
                      >
                        {BUSINESS_TYPES.map((b) => (
                          <option key={b.id} value={b.id}>{b.label}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                        Emirate <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={emirate}
                        onChange={(e) => {
                          setEmirate(e.target.value);
                          setCity(e.target.value);
                        }}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#031b4e]/15 focus:border-[#031b4e]"
                      >
                        {EMIRATES.map((em) => (
                          <option key={em} value={em}>{em}</option>
                        ))}
                      </select>
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                        Head Office / Warehouse Address <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#031b4e]/15 focus:border-[#031b4e]"
                        placeholder="Industrial Area 1, P.O. Box 9000, Abu Dhabi, UAE"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end pt-3">
                    <button
                      type="submit"
                      className="px-6 py-2.5 bg-[#031b4e] hover:bg-blue-900 text-white font-bold text-xs rounded-xl shadow-sm transition-all flex items-center gap-2 cursor-pointer"
                    >
                      <span>Continue to Contact Info</span>
                      <ArrowRight size={14} />
                    </button>
                  </div>
                </form>
              )}

              {/* STEP 2: Primary Contact */}
              {step === 2 && (
                <form onSubmit={handleNextStep} className="space-y-4 animate-in fade-in duration-150">
                  <div className="flex items-center gap-2 pb-1 border-b border-slate-100">
                    <User size={16} className="text-[#031b4e]" />
                    <h3 className="font-extrabold text-slate-900 text-sm">Primary Trade Contact</h3>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                        Contact Person Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={contactPerson}
                        onChange={(e) => setContactPerson(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#031b4e]/15 focus:border-[#031b4e]"
                        placeholder="e.g. David Steve"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                        Job Title / Designation <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={designation}
                        onChange={(e) => setDesignation(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#031b4e]/15 focus:border-[#031b4e]"
                        placeholder="e.g. Procurement Lead / General Manager"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                        Mobile / WhatsApp Number <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="tel"
                        required
                        value={phone}
                        onChange={(e) => {
                          setPhone(e.target.value);
                          if (!whatsappNumber) setWhatsappNumber(e.target.value);
                        }}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#031b4e]/15 focus:border-[#031b4e]"
                        placeholder="+971 50 123 4567"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                        Official Business Email <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#031b4e]/15 focus:border-[#031b4e]"
                        placeholder="procurement@company.com"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-3">
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors cursor-pointer flex items-center gap-1.5"
                    >
                      <ArrowLeft size={14} />
                      <span>Back</span>
                    </button>
                    
                    <button
                      type="submit"
                      className="px-6 py-2.5 bg-[#031b4e] hover:bg-blue-900 text-white font-bold text-xs rounded-xl shadow-sm transition-all flex items-center gap-2 cursor-pointer"
                    >
                      <span>Continue to Sourcing Info</span>
                      <ArrowRight size={14} />
                    </button>
                  </div>
                </form>
              )}

              {/* STEP 3: Commercial & Equipment Sourcing */}
              {step === 3 && (
                <form onSubmit={handleNextStep} className="space-y-4 animate-in fade-in duration-150">
                  <div className="flex items-center gap-2 pb-1 border-b border-slate-100">
                    <Briefcase size={16} className="text-[#031b4e]" />
                    <h3 className="font-extrabold text-slate-900 text-sm">Commercial Sourcing Profile</h3>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-2">
                      Equipment Categories of Interest <span className="text-red-500">*</span>
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {PRODUCT_CATEGORIES.map((cat) => {
                        const isSelected = selectedCategories.includes(cat);
                        return (
                          <button
                            type="button"
                            key={cat}
                            onClick={() => toggleCategory(cat)}
                            className={`p-2.5 text-left text-xs font-semibold rounded-lg border transition-all flex items-center justify-between cursor-pointer ${
                              isSelected
                                ? "bg-blue-50/80 border-[#031b4e] text-[#031b4e] font-bold shadow-2xs"
                                : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
                            }`}
                          >
                            <span>{cat}</span>
                            {isSelected && <Check size={14} className="text-[#031b4e]" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                        Estimated Purchase Volume <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={annualVolumeEstimate}
                        onChange={(e) => setAnnualVolumeEstimate(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#031b4e]/15 focus:border-[#031b4e]"
                      >
                        {VOLUME_OPTIONS.map((vol) => (
                          <option key={vol} value={vol}>{vol}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                        Requested Commercial Terms
                      </label>
                      <select
                        value={paymentTermsRequested}
                        onChange={(e) => setPaymentTermsRequested(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#031b4e]/15 focus:border-[#031b4e]"
                      >
                        {PAYMENT_TERMS_OPTIONS.map((term) => (
                          <option key={term} value={term}>{term}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-3">
                    <button
                      type="button"
                      onClick={() => setStep(2)}
                      className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors cursor-pointer flex items-center gap-1.5"
                    >
                      <ArrowLeft size={14} />
                      <span>Back</span>
                    </button>
                    
                    <button
                      type="submit"
                      className="px-6 py-2.5 bg-[#031b4e] hover:bg-blue-900 text-white font-bold text-xs rounded-xl shadow-sm transition-all flex items-center gap-2 cursor-pointer"
                    >
                      <span>Continue to Documents</span>
                      <ArrowRight size={14} />
                    </button>
                  </div>
                </form>
              )}

              {/* STEP 4: Documents & Declaration */}
              {step === 4 && (
                <form onSubmit={handleSubmitApplication} className="space-y-4 animate-in fade-in duration-150">
                  <div className="flex items-center gap-2 pb-1 border-b border-slate-100">
                    <FileText size={16} className="text-[#031b4e]" />
                    <h3 className="font-extrabold text-slate-900 text-sm">Documents & Authorized Declaration</h3>
                  </div>

                  {/* Document Fields */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                        Trade License Copy (Document Link / Reference)
                      </label>
                      <input
                        type="text"
                        value={tradeLicenseFileUrl}
                        onChange={(e) => setTradeLicenseFileUrl(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#031b4e]/15 focus:border-[#031b4e]"
                        placeholder="e.g. https://drive.google.com/... or License No."
                      />
                      <span className="text-[10px] text-slate-400 mt-0.5 block">
                        Direct document upload securely verified by compliance team.
                      </span>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                        VAT / Tax Certificate (Document Link / Reference)
                      </label>
                      <input
                        type="text"
                        value={taxCertificateFileUrl}
                        onChange={(e) => setTaxCertificateFileUrl(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#031b4e]/15 focus:border-[#031b4e]"
                        placeholder="e.g. VAT Certificate Reference / URL"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                        Additional Company Background or Project Notes
                      </label>
                      <textarea
                        rows={2}
                        value={additionalNotes}
                        onChange={(e) => setAdditionalNotes(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#031b4e]/15 focus:border-[#031b4e]"
                        placeholder="e.g. Major active projects, brand preferences, existing dealership relationships..."
                      />
                    </div>
                  </div>

                  {/* Declaration Box */}
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                    <label className="flex items-start gap-2.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={declarationAccepted}
                        onChange={(e) => setDeclarationAccepted(e.target.checked)}
                        className="mt-0.5 w-4 h-4 rounded text-[#031b4e] focus:ring-[#031b4e]/20"
                      />
                      <span className="text-xs text-slate-700 leading-relaxed font-medium">
                        I hereby declare and confirm that I am an authorized representative of <span className="font-bold text-slate-900">{companyName || "the company"}</span>, and that all information provided in this reseller application is authentic, accurate, and subject to commercial compliance review.
                      </span>
                    </label>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                        Authorized Representative Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={authorizedSignatory}
                        onChange={(e) => setAuthorizedSignatory(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#031b4e]/15 focus:border-[#031b4e]"
                        placeholder="Signatory Full Name"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-3">
                    <button
                      type="button"
                      onClick={() => setStep(3)}
                      disabled={isSubmitting}
                      className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                    >
                      <ArrowLeft size={14} />
                      <span>Back</span>
                    </button>
                    
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="px-7 py-2.5 bg-[#031b4e] hover:bg-blue-900 text-white font-black text-xs rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-wider"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 size={14} className="animate-spin" />
                          <span>Submitting Application...</span>
                        </>
                      ) : (
                        <>
                          <span>Submit Trade Application</span>
                          <CheckCircle2 size={14} />
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}

            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="bg-slate-50 border-t border-slate-200/80 px-6 py-3 flex items-center justify-between text-[11px] text-slate-500 font-medium shrink-0">
          <span>Cool Technologies B2B Verification Engine</span>
          <button
            onClick={onClose}
            className="text-slate-600 hover:text-slate-900 font-bold cursor-pointer"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
}
