import React, { useState, useEffect } from "react";
import { 
  User, 
  Mail, 
  Phone, 
  Save, 
  CheckCircle2, 
  Loader2, 
  AlertCircle,
  Clock,
  Edit3,
  ArrowLeft,
  LogOut,
  ShoppingCart,
  Layers,
  FileSpreadsheet,
  Shield,
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  Briefcase,
  Building2,
  MapPin,
  ChevronRight,
  PanelLeftClose,
  PanelLeftOpen,
  Heart,
  Calendar,
  Eye,
  FileCheck,
  UploadCloud,
  Check,
  Sparkles,
  CreditCard,
  Headphones,
  FileText,
  Download,
  Zap,
  CheckCircle
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useWishlist } from "../../context/WishlistContext";
import { uploadDocumentFile } from "../../services/storageService";
import { CartItem, Product } from "../../types";
import { apiClient } from "../../services/apiClient";
import { sendEmailNotification } from "../../services/emailService";

interface AccountWorkspacePageProps {
  cart?: CartItem[];
  onUpdateQuantity?: (productId: string, quantity: number) => void;
  onRemoveItem?: (productId: string) => void;
  onClearCart?: () => void;
  onNavigateHome?: () => void;
  onNavigateCatalog?: () => void;
  onOpenCart?: () => void;
  onOpenQuote?: () => void;
  onAddToCart?: (product: Product, quantity: number) => void;
  onRequestQuoteWithService?: (serviceName: string) => void;
  onShowToast?: (message: string) => void;
}

type TabType = "profile" | "cart" | "wishlist" | "partner" | "security";
type MobileViewType = "main" | "cart" | "wishlist" | "partner" | "security";

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

export default function AccountWorkspacePage({
  cart = [],
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  onNavigateHome,
  onNavigateCatalog,
  onOpenCart,
  onOpenQuote,
  onAddToCart,
  onRequestQuoteWithService,
  onShowToast,
}: AccountWorkspacePageProps) {
  const { 
    user: authUser, 
    profile, 
    updateCurrentProfile, 
    sendVerificationEmail,
    sendPasswordReset,
    logout,
    refreshProfile,
    isLoading: isAuthLoading 
  } = useAuth();

  const { wishlist, removeFromWishlist, clearWishlist } = useWishlist();

  const getInitialTabFromHash = (): TabType => {
    const hash = (typeof window !== "undefined" ? window.location.hash : "").toLowerCase();
    if (hash.includes("partner") || hash.includes("retailer") || hash.includes("b2b")) return "partner";
    if (hash.includes("wishlist")) return "wishlist";
    if (hash.includes("cart")) return "cart";
    if (hash.includes("security")) return "security";
    return "profile";
  };

  const getInitialMobileViewFromHash = (): MobileViewType => {
    const hash = (typeof window !== "undefined" ? window.location.hash : "").toLowerCase();
    if (hash.includes("partner") || hash.includes("retailer") || hash.includes("b2b")) return "partner";
    if (hash.includes("wishlist")) return "wishlist";
    if (hash.includes("cart")) return "cart";
    if (hash.includes("security")) return "security";
    return "main";
  };

  // Desktop Collapsible Sidebar State
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>(getInitialTabFromHash);

  // Mobile Sub-Page Navigation State
  const [mobileView, setMobileView] = useState<MobileViewType>(getInitialMobileViewFromHash);

  // Mode: View vs Edit Profile
  const [isEditing, setIsEditing] = useState(false);

  // Form Fields (Profile details)
  const [name, setName] = useState("");
  const [designation, setDesignation] = useState("");
  const [phone, setPhone] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [address, setAddress] = useState("");

  // Saving states
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Email verification & password reset states
  const [resendingEmail, setResendingEmail] = useState(false);
  const [emailSentNotice, setEmailSentNotice] = useState(false);
  const [emailCooldown, setEmailCooldown] = useState(0);
  const [resetSentNotice, setResetSentNotice] = useState(false);

  // B2B Partner / Reseller Registration Module States
  const [partnerStep, setPartnerStep] = useState<1 | 2 | 3 | 4>(1);
  const [existingApp, setExistingApp] = useState<any>(null);
  const [checkingExistingApp, setCheckingExistingApp] = useState(false);
  const [partnerSubmitting, setPartnerSubmitting] = useState(false);
  const [partnerSuccess, setPartnerSuccess] = useState(false);
  const [partnerError, setPartnerError] = useState("");

  // Step 1: Company Info
  const [partnerCompanyName, setPartnerCompanyName] = useState("");
  const [partnerTradeLicense, setPartnerTradeLicense] = useState("");
  const [partnerBusinessType, setPartnerBusinessType] = useState<"LLC" | "Sole Establishment" | "Other">("LLC");
  const [partnerBusinessTypeOther, setPartnerBusinessTypeOther] = useState("");
  const [partnerEmirate, setPartnerEmirate] = useState("Dubai");
  const [partnerCity, setPartnerCity] = useState("Dubai");
  const [partnerAddress, setPartnerAddress] = useState("");

  // Step 2: Primary Contact
  const [partnerContactPerson, setPartnerContactPerson] = useState("");
  const [partnerDesignation, setPartnerDesignation] = useState("");
  const [partnerPhone, setPartnerPhone] = useState("");
  const [partnerEmail, setPartnerEmail] = useState("");

  // Step 3: Commercial Info
  const [partnerProducts, setPartnerProducts] = useState<string[]>([
    "Air Conditioning & Cooling Systems",
    "Water Coolers & Dispensers"
  ]);
  const [partnerVolume, setPartnerVolume] = useState("AED 10,000–50,000");
  const [partnerPaymentTerms, setPartnerPaymentTerms] = useState<"Advance Payment" | "Credit Card – Subject to Approval" | "Other">("Advance Payment");
  const [partnerPaymentTermsOther, setPartnerPaymentTermsOther] = useState("");

  // Step 4: Documents
  const [partnerTradeLicenseFile, setPartnerTradeLicenseFile] = useState("");
  const [partnerTradeLicenseUrl, setPartnerTradeLicenseUrl] = useState("");
  const [partnerVatCertFile, setPartnerVatCertFile] = useState("");
  const [partnerVatCertUrl, setPartnerVatCertUrl] = useState("");
  const [partnerUploadingDoc, setPartnerUploadingDoc] = useState<"license" | "vat" | null>(null);

  // Sync tab if URL hash changes while already on the page
  useEffect(() => {
    const handleHashChange = () => {
      const hash = (typeof window !== "undefined" ? window.location.hash : "").toLowerCase();
      if (hash.includes("partner") || hash.includes("retailer") || hash.includes("b2b")) {
        setActiveTab("partner");
        setMobileView("partner");
      } else if (hash.includes("wishlist")) {
        setActiveTab("wishlist");
        setMobileView("wishlist");
      } else if (hash.includes("cart")) {
        setActiveTab("cart");
        setMobileView("cart");
      } else if (hash.includes("security")) {
        setActiveTab("security");
        setMobileView("security");
      } else if (hash.includes("profile") || hash === "#/account") {
        setActiveTab("profile");
        setMobileView("main");
      }
    };

    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  // Populate local form fields when profile is loaded
  useEffect(() => {
    if (profile || authUser) {
      setName(profile?.name || authUser?.displayName || "");
      setDesignation(profile?.designation || "");
      setPhone(profile?.phone || "");
      setCompanyName(profile?.companyName || "");
      setAddress(profile?.address || "");

      // Pre-fill partner fields from profile
      setPartnerCompanyName(profile?.companyName || "");
      setPartnerContactPerson(profile?.name || authUser?.displayName || "");
      setPartnerDesignation(profile?.designation || "");
      setPartnerPhone(profile?.phone || "");
      setPartnerEmail(authUser?.email || "");
      setPartnerAddress(profile?.address || "");

      // Check existing retailer application
      setCheckingExistingApp(true);
      apiClient.getMyRetailerApplication()
        .then((res) => {
          if (res?.application) {
            setExistingApp(res.application);
          }
        })
        .catch(() => {})
        .finally(() => setCheckingExistingApp(false));
    }
  }, [profile, authUser]);

  // Handle email verification resend cooldown
  useEffect(() => {
    if (emailCooldown > 0) {
      const timer = setTimeout(() => setEmailCooldown((prev) => prev - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [emailCooldown]);

  const togglePartnerProduct = (item: string) => {
    setPartnerProducts((prev) =>
      prev.includes(item) ? prev.filter((p) => p !== item) : [...prev, item]
    );
  };

  const handlePartnerFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: "license" | "vat") => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      setPartnerError("File size exceeds 10MB limit. Please upload a smaller document.");
      return;
    }

    setPartnerUploadingDoc(type);
    setPartnerError("");
    try {
      const folder = type === "license" ? "trade-documents/licenses" : "trade-documents/vat";
      const result = await uploadDocumentFile(file, folder);
      if (type === "license") {
        setPartnerTradeLicenseFile(file.name);
        setPartnerTradeLicenseUrl(result.url);
      } else {
        setPartnerVatCertFile(file.name);
        setPartnerVatCertUrl(result.url);
      }
    } catch (err: any) {
      console.error("Partner document upload failed:", err);
      setPartnerError("Failed to upload document to Cloudflare storage. Please try again.");
    } finally {
      setPartnerUploadingDoc(null);
    }
  };

  const handlePartnerNextStep = () => {
    setPartnerError("");
    if (partnerStep === 1) {
      if (!partnerCompanyName.trim()) {
        setPartnerError("Please enter your Company / Business Name.");
        return;
      }
      if (!partnerTradeLicense.trim()) {
        setPartnerError("Please enter your Trade License / Registration Number.");
        return;
      }
      if (partnerBusinessType === "Other" && !partnerBusinessTypeOther.trim()) {
        setPartnerError("Please specify your Business Type.");
        return;
      }
      if (!partnerCity.trim() || !partnerAddress.trim()) {
        setPartnerError("Please provide your City and Business Address.");
        return;
      }
      setPartnerStep(2);
    } else if (partnerStep === 2) {
      if (!partnerContactPerson.trim()) {
        setPartnerError("Contact Person Name is required.");
        return;
      }
      if (!partnerDesignation.trim()) {
        setPartnerError("Designation is required.");
        return;
      }
      if (!partnerPhone.trim()) {
        setPartnerError("Mobile / WhatsApp Number is required.");
        return;
      }
      if (!partnerEmail.trim() || !partnerEmail.includes("@")) {
        setPartnerError("A valid business email address is required.");
        return;
      }
      setPartnerStep(3);
    } else if (partnerStep === 3) {
      if (partnerProducts.length === 0) {
        setPartnerError("Please select at least one product or service category.");
        return;
      }
      if (partnerPaymentTerms === "Other" && !partnerPaymentTermsOther.trim()) {
        setPartnerError("Please specify your Preferred Payment Terms.");
        return;
      }
      setPartnerStep(4);
    }
  };

  const handlePartnerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPartnerError("");

    if (!partnerTradeLicenseFile) {
      setPartnerError("Trade License Copy upload is required.");
      return;
    }

    setPartnerSubmitting(true);

    try {
      const payload = {
        companyName: partnerCompanyName.trim(),
        legalName: partnerCompanyName.trim(),
        tradeLicenseNumber: partnerTradeLicense.trim(),
        businessType: partnerBusinessType === "Other" ? partnerBusinessTypeOther.trim() : partnerBusinessType,
        emirate: partnerEmirate,
        city: partnerCity.trim(),
        address: partnerAddress.trim(),
        contactPerson: partnerContactPerson.trim(),
        designation: partnerDesignation.trim(),
        phone: partnerPhone.trim(),
        whatsappNumber: partnerPhone.trim(),
        email: partnerEmail.trim(),
        interestedCategories: partnerProducts,
        annualVolumeEstimate: partnerVolume,
        paymentTermsRequested: partnerPaymentTerms === "Other" ? partnerPaymentTermsOther.trim() : partnerPaymentTerms,
        tradeLicenseFileUrl: partnerTradeLicenseUrl || `license_${partnerTradeLicenseFile}`,
        taxCertificateFileUrl: partnerVatCertUrl || (partnerVatCertFile ? `vat_${partnerVatCertFile}` : ""),
      };

      const res = await apiClient.applyRetailer(payload);
      if (res?.application) {
        setExistingApp(res.application);
      }
      setPartnerSuccess(true);
      if (refreshProfile) await refreshProfile();
      if (onShowToast) onShowToast("Partner registration submitted successfully.");

      // Trigger real-time EmailJS notification to B2B Partners Department
      sendEmailNotification({
        type: "partner",
        title: `B2B Partner Application: ${partnerCompanyName.trim()}`,
        senderName: partnerContactPerson.trim(),
        senderEmail: partnerEmail.trim(),
        senderPhone: partnerPhone.trim(),
        companyName: partnerCompanyName.trim(),
        subject: `🤝 New B2B Wholesale Partner Application: ${partnerCompanyName.trim()}`,
        message: `New B2B trade partner application submitted with annual volume estimate: ${partnerVolume}.`,
        detailsText: `Company: ${partnerCompanyName.trim()}\nTrade License: ${partnerTradeLicense.trim()}\nBusiness Type: ${partnerBusinessType}\nContact Person: ${partnerContactPerson.trim()} (${partnerDesignation.trim()})\nPhone: ${partnerPhone.trim()}\nEmail: ${partnerEmail.trim()}\nLocation: ${partnerAddress.trim()}, ${partnerCity.trim()}, ${partnerEmirate}\nInterested Products: ${partnerProducts.join(", ") || "General Wholesale"}\nEstimated Volume: ${partnerVolume}\nPayment Terms Requested: ${partnerPaymentTerms}`,
        customParams: {
          license_number: partnerTradeLicense.trim(),
          volume_estimate: partnerVolume,
          emirate: partnerEmirate
        }
      }).catch((emailErr) => {
        console.warn("[AccountWorkspacePage] Email dispatch error:", emailErr);
      });
    } catch (err: any) {
      setPartnerError(err?.message || "Failed to submit registration. Please try again.");
    } finally {
      setPartnerSubmitting(false);
    }
  };

  const handleResendEmail = async () => {
    if (emailCooldown > 0 || resendingEmail) return;
    setResendingEmail(true);
    try {
      await sendVerificationEmail();
      setEmailSentNotice(true);
      setEmailCooldown(60);
      if (onShowToast) onShowToast("Verification link sent! Please check your inbox.");
      setTimeout(() => setEmailSentNotice(false), 5000);
    } catch (err: any) {
      setErrorMessage(err?.message || "Failed to send verification email. Please try again.");
    } finally {
      setResendingEmail(false);
    }
  };

  const handlePasswordReset = async () => {
    if (!authUser?.email) return;
    try {
      await sendPasswordReset(authUser.email);
      setResetSentNotice(true);
      if (onShowToast) onShowToast("Password reset email sent to your registered email.");
      setTimeout(() => setResetSentNotice(false), 6000);
    } catch (err: any) {
      setErrorMessage(err?.message || "Failed to trigger password reset. Please try again.");
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMessage("Full Name is required.");
      return;
    }

    setIsSaving(true);
    setErrorMessage("");
    setSaveSuccess(false);

    try {
      await updateCurrentProfile({
        name: name.trim(),
        designation: designation.trim(),
        phone: phone.trim(),
        companyName: companyName.trim(),
        address: address.trim(),
      });

      setSaveSuccess(true);
      setIsEditing(false);
      if (onShowToast) onShowToast("Profile details updated successfully.");
      setTimeout(() => setSaveSuccess(false), 4000);
    } catch (err: any) {
      setErrorMessage(err?.message || "Failed to save profile. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSignOut = async () => {
    await logout();
    if (onShowToast) onShowToast("Signed out of your account.");
    window.location.hash = "#/";
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // 1. Loading State while Firebase Auth is resolving session
  if (isAuthLoading) {
    return (
      <div className="min-h-screen bg-[#031b4e] flex flex-col items-center justify-center p-6 text-center text-white">
        <Loader2 className="w-8 h-8 text-cyan-400 animate-spin mb-3" />
        <p className="text-xs text-slate-300 font-bold uppercase tracking-wider">Loading Account...</p>
      </div>
    );
  }

  // 2. Unauthenticated State
  if (!authUser) {
    return (
      <div className="min-h-screen bg-[#031b4e] flex flex-col items-center justify-center p-6 text-center text-white">
        <div className="w-16 h-16 rounded-2xl bg-blue-500/10 text-cyan-400 flex items-center justify-center mb-4">
          <User size={32} />
        </div>
        <h1 className="text-2xl font-black text-white">Sign In Required</h1>
        <p className="text-xs text-slate-300 mt-2 max-w-sm">
          Please sign in to access your Cool Technologies profile, saved quote cart, and wishlist.
        </p>
        <button
          type="button"
          onClick={() => {
            const current = (window.location.hash || "").replace(/^#\/?/, "");
            window.location.hash = current ? `#/login?redirect=${encodeURIComponent(current)}` : "#/login";
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
          className="mt-6 px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-lg transition-all cursor-pointer"
        >
          Go to Sign In
        </button>
      </div>
    );
  }

  const isEmailVerified = authUser?.emailVerified === true;
  const userInitials = (profile?.name || authUser?.displayName || authUser?.email || "CT")
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const totalCartItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  const isPartnerApproved = existingApp?.status === "approved" || profile?.isVerifiedRetailer;
  const isPartnerPending = existingApp?.status === "pending" || existingApp?.status === "under_review";

  const navItems = [
    { id: "profile", label: "My Profile", icon: User, description: "Personal & contact info" },
    { id: "cart", label: "My Quote Cart", icon: ShoppingCart, count: totalCartItems, description: "Saved equipment quote list" },
    { id: "wishlist", label: "My Wishlist", icon: Heart, count: wishlist.length, description: "Saved products & services" },
    { 
      id: "partner", 
      label: "Trade Partner Program", 
      icon: Building2, 
      badge: isPartnerApproved ? "Approved" : isPartnerPending ? "Pending" : undefined,
      description: "B2B reseller registration & terms" 
    },
    { id: "security", label: "Security & Login", icon: Shield, description: "Password & verification" },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col antialiased">
      
      {/* =========================================================================
          DESKTOP VERSION (VISIBLE ON MD AND ABOVE) - COLLAPSIBLE SIDEBAR + FULL VIEW
         ========================================================================= */}
      <div className="hidden md:flex flex-col min-h-screen">
        
        {/* Desktop Top Header Bar */}
        <header className="sticky top-0 z-40 bg-[#031b4e] text-white border-b border-blue-900 shadow-sm">
          <div className="w-full px-6 h-15 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setIsCollapsed(!isCollapsed)}
                title={isCollapsed ? "Expand Sidebar" : "Minimize Sidebar"}
                className="p-2 text-slate-300 hover:text-white hover:bg-blue-900/60 rounded-lg transition-colors cursor-pointer"
              >
                {isCollapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
              </button>

              <button
                type="button"
                onClick={() => {
                  if (onNavigateHome) onNavigateHome();
                  else {
                    window.location.hash = "#/";
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }
                }}
                className="flex items-center gap-2 text-xs font-bold text-slate-300 hover:text-white bg-blue-950/60 hover:bg-blue-900 px-3 py-1.5 rounded-lg border border-blue-800 transition-all cursor-pointer"
              >
                <ArrowLeft size={14} />
                <span>Back to Store</span>
              </button>

              <div className="h-4 w-px bg-blue-800/80" />

              <span className="text-xs font-black tracking-wider uppercase text-cyan-200">
                Cool Technologies • My Account
              </span>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  if (onNavigateCatalog) onNavigateCatalog();
                  else {
                    window.location.hash = "#/products";
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }
                }}
                className="text-xs font-bold text-slate-200 hover:text-white px-3 py-1.5 rounded-lg hover:bg-blue-900/50 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Layers size={14} className="text-cyan-400" />
                <span>Catalog</span>
              </button>

              <div className="h-4 w-px bg-blue-800/80" />

              <button
                type="button"
                onClick={() => {
                  setActiveTab("partner");
                  setErrorMessage("");
                }}
                className="text-xs font-bold text-cyan-300 hover:text-white px-3 py-1.5 rounded-lg bg-blue-900/40 hover:bg-blue-900/80 border border-blue-800 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Building2 size={14} />
                <span>Trade Partner</span>
              </button>
            </div>
          </div>
        </header>

        {/* Desktop Body: Collapsible Sidebar + Content View */}
        <div className="flex-1 flex w-full">
          <aside
            className={`bg-white border-r border-slate-200 transition-all duration-300 flex flex-col justify-between shrink-0 ${
              isCollapsed ? "w-16" : "w-64 lg:w-72"
            }`}
          >
            <div className="p-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#031b4e] text-white flex items-center justify-center font-black text-sm shrink-0 shadow-xs">
                  {userInitials}
                </div>
                {!isCollapsed && (
                  <div className="overflow-hidden">
                    <h2 className="text-xs font-black text-slate-900 truncate">
                      {name || profile?.name || authUser?.displayName || "My Profile"}
                    </h2>
                    <p className="text-[11px] text-slate-500 truncate">{authUser?.email}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Sidebar Navigation */}
            <nav className="p-2 space-y-1 flex-1 overflow-y-auto">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      setActiveTab(item.id as TabType);
                      setErrorMessage("");
                    }}
                    title={isCollapsed ? item.label : undefined}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left text-xs font-bold transition-all cursor-pointer ${
                      isActive
                        ? "bg-[#031b4e] text-white shadow-xs"
                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                    } ${isCollapsed ? "justify-center px-0" : ""}`}
                  >
                    <Icon size={17} className={`shrink-0 ${isActive ? (item.id === "wishlist" ? "text-rose-400" : "text-cyan-300") : "text-slate-400"}`} />
                    {!isCollapsed && (
                      <div className="overflow-hidden flex-1 flex items-center justify-between">
                        <div>
                          <div className="truncate">{item.label}</div>
                          <div className={`text-[10px] font-normal truncate ${isActive ? "text-blue-200" : "text-slate-400"}`}>
                            {item.description}
                          </div>
                        </div>
                        {item.count !== undefined && item.count > 0 && (
                          <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${isActive ? "bg-cyan-400 text-slate-900" : "bg-slate-100 text-slate-700"}`}>
                            {item.count}
                          </span>
                        )}
                        {item.badge && (
                          <span className={`text-[9px] font-black px-1.5 py-0.5 rounded ${
                            item.badge === "Approved" ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
                          }`}>
                            {item.badge}
                          </span>
                        )}
                      </div>
                    )}
                  </button>
                );
              })}
            </nav>

            <div className="p-3 border-t border-slate-100 bg-slate-50/50">
              <button
                type="button"
                onClick={handleSignOut}
                title={isCollapsed ? "Sign Out" : undefined}
                className={`w-full flex items-center gap-2 py-2 px-3 text-xs font-bold text-slate-600 hover:text-red-700 hover:bg-red-50 rounded-xl transition-all cursor-pointer ${
                  isCollapsed ? "justify-center px-0" : ""
                }`}
              >
                <LogOut size={15} />
                {!isCollapsed && <span>Sign Out</span>}
              </button>
            </div>
          </aside>

          <main className="flex-1 w-full p-8 lg:px-10 lg:py-8 overflow-y-auto">
            <div className="flex items-center justify-between pb-6 border-b border-slate-200 mb-6">
              <div>
                <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                  {activeTab === "profile" && "My Profile Details"}
                  {activeTab === "cart" && `My Saved Cart (${totalCartItems} items)`}
                  {activeTab === "wishlist" && `My Wishlist (${wishlist.length} saved)`}
                  {activeTab === "partner" && "B2B Trade Partner Program"}
                  {activeTab === "security" && "Account Security & Credentials"}
                </h1>
                <p className="text-xs text-slate-500 mt-1">
                  {activeTab === "profile" && "View and update your personal and business contact details."}
                  {activeTab === "cart" && "Review your active equipment quote list and request a customized quotation."}
                  {activeTab === "wishlist" && "Products and services you've liked and saved for future reference."}
                  {activeTab === "partner" && "Official reseller verification, trade credit facilities, and direct factory terms."}
                  {activeTab === "security" && "Manage your login password and email verification status."}
                </p>
              </div>

              {activeTab === "profile" && (
                <button
                  type="button"
                  onClick={() => setIsEditing(!isEditing)}
                  className={`px-4 py-2 text-xs font-bold rounded-xl border transition-all flex items-center gap-1.5 cursor-pointer ${
                    isEditing
                      ? "bg-slate-200 text-slate-800 border-slate-300"
                      : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50 shadow-2xs"
                  }`}
                >
                  <Edit3 size={14} />
                  <span>{isEditing ? "Cancel Editing" : "Edit Profile"}</span>
                </button>
              )}
            </div>

            {saveSuccess && (
              <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2 text-xs font-bold text-emerald-800">
                <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                <span>Profile details updated successfully.</span>
              </div>
            )}

            {errorMessage && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-xs font-bold text-red-800">
                <AlertCircle size={16} className="text-red-600 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Desktop Tab 1: Profile */}
            {activeTab === "profile" && (
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-6">
                <div className="flex items-center gap-4 pb-6 border-b border-slate-100">
                  <div className="w-14 h-14 rounded-2xl bg-[#031b4e] text-white flex items-center justify-center text-xl font-black shrink-0">
                    {userInitials}
                  </div>
                  <div>
                    <h3 className="text-base font-black text-slate-900">{name || profile?.name || authUser?.displayName || "My Profile"}</h3>
                    <p className="text-xs text-slate-500 font-medium">{authUser?.email}</p>
                    {companyName && <p className="text-xs font-bold text-[#031b4e] mt-0.5">{companyName}</p>}
                  </div>
                </div>

                <form onSubmit={handleSaveProfile} className="space-y-5">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Full Name *</label>
                      {isEditing ? (
                        <input
                          type="text"
                          required
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                        />
                      ) : (
                        <div className="px-3.5 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-xs font-semibold text-slate-900">
                          {name || "—"}
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Designation / Role</label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={designation}
                          onChange={(e) => setDesignation(e.target.value)}
                          placeholder="e.g. Procurement Manager, Engineer"
                          className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                        />
                      ) : (
                        <div className="px-3.5 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-xs font-semibold text-slate-900">
                          {designation || "—"}
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Registered Email</label>
                      <div className="px-3.5 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-xs font-semibold text-slate-500">
                        {authUser?.email}
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Mobile / WhatsApp</label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="e.g. +971 50 123 4567"
                          className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                        />
                      ) : (
                        <div className="px-3.5 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-xs font-semibold text-slate-900">
                          {phone || "—"}
                        </div>
                      )}
                    </div>

                    <div className="col-span-2">
                      <label className="block text-xs font-bold text-slate-700 mb-1">Company Name</label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={companyName}
                          onChange={(e) => setCompanyName(e.target.value)}
                          placeholder="e.g. Al Wasl MEP Contracting LLC"
                          className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                        />
                      ) : (
                        <div className="px-3.5 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-xs font-semibold text-slate-900">
                          {companyName || "—"}
                        </div>
                      )}
                    </div>

                    <div className="col-span-2">
                      <label className="block text-xs font-bold text-slate-700 mb-1">Delivery / Business Address</label>
                      {isEditing ? (
                        <textarea
                          rows={2}
                          value={address}
                          onChange={(e) => setAddress(e.target.value)}
                          placeholder="Office or site delivery address in UAE"
                          className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                        />
                      ) : (
                        <div className="px-3.5 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-xs font-semibold text-slate-900 min-h-[48px]">
                          {address || "—"}
                        </div>
                      )}
                    </div>
                  </div>

                  {isEditing && (
                    <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
                      <button
                        type="button"
                        onClick={() => setIsEditing(false)}
                        className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={isSaving}
                        className="px-6 py-2 bg-[#031b4e] hover:bg-[#2596be] text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                      >
                        {isSaving ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />}
                        <span>Save Changes</span>
                      </button>
                    </div>
                  )}
                </form>
              </div>
            )}

            {/* Desktop Tab 2: Cart */}
            {activeTab === "cart" && (
              <div className="space-y-6">
                {cart.length === 0 ? (
                  <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-2xs space-y-4">
                    <div className="w-16 h-16 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
                      <ShoppingCart size={28} />
                    </div>
                    <h3 className="text-base font-black text-slate-900">Your Quote Cart is Empty</h3>
                    <p className="text-xs text-slate-500 max-w-sm mx-auto">
                      Browse our commercial HVAC catalog and add equipment to your quote list.
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        if (onNavigateCatalog) onNavigateCatalog();
                        else {
                          window.location.hash = "#/products";
                          window.scrollTo({ top: 0, behavior: "smooth" });
                        }
                      }}
                      className="mt-2 px-6 py-2.5 bg-[#031b4e] hover:bg-[#2596be] text-white font-bold text-xs rounded-xl transition-all cursor-pointer inline-flex items-center gap-2"
                    >
                      <span>Explore Equipment Catalog</span>
                      <ArrowRight size={14} />
                    </button>
                  </div>
                ) : (
                  <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
                    <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                      <span className="text-xs font-bold text-slate-700">{cart.length} distinct item{cart.length > 1 ? "s" : ""}</span>
                      {onClearCart && (
                        <button
                          type="button"
                          onClick={onClearCart}
                          className="text-xs font-bold text-red-600 hover:text-red-700 flex items-center gap-1 cursor-pointer"
                        >
                          <Trash2 size={13} />
                          <span>Clear All</span>
                        </button>
                      )}
                    </div>

                    <div className="divide-y divide-slate-100">
                      {cart.map((item) => (
                        <div key={item.product.id} className="p-4 sm:p-5 flex items-center gap-4 hover:bg-slate-50/60 transition-colors">
                          <img
                            src={item.product.image}
                            alt={item.product.name}
                            className="w-16 h-16 rounded-xl object-cover border border-slate-100 shrink-0 bg-slate-50"
                          />
                          <div className="flex-1 min-w-0">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 block">{item.product.category}</span>
                            <h4 className="text-xs font-black text-slate-900 truncate mt-0.5">{item.product.name}</h4>
                            <p className="text-[11px] text-slate-500 truncate mt-0.5">{item.product.capacity || item.product.specifications?.Capacity || "Commercial Specification"}</p>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            {onUpdateQuantity && (
                              <div className="flex items-center border border-slate-200 rounded-lg bg-slate-50">
                                <button
                                  type="button"
                                  onClick={() => onUpdateQuantity(item.product.id, Math.max(1, item.quantity - 1))}
                                  className="p-1 text-slate-600 hover:bg-slate-200 rounded-l-lg transition-colors cursor-pointer"
                                >
                                  <Minus size={12} />
                                </button>
                                <span className="px-2 text-xs font-bold text-slate-800">{item.quantity}</span>
                                <button
                                  type="button"
                                  onClick={() => onUpdateQuantity(item.product.id, item.quantity + 1)}
                                  className="p-1 text-slate-600 hover:bg-slate-200 rounded-r-lg transition-colors cursor-pointer"
                                >
                                  <Plus size={12} />
                                </button>
                              </div>
                            )}

                            {onRemoveItem && (
                              <button
                                type="button"
                                onClick={() => onRemoveItem(item.product.id)}
                                className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                                title="Remove item"
                              >
                                <Trash2 size={15} />
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="p-5 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                      <div>
                        <div className="text-xs font-bold text-slate-700">Total Products: {totalCartItems} units</div>
                        <div className="text-[11px] text-slate-500">Official wholesale proposal will include project freight & warranty terms.</div>
                      </div>
                      {onOpenQuote && (
                        <button
                          type="button"
                          onClick={onOpenQuote}
                          className="px-6 py-2.5 bg-[#031b4e] hover:bg-[#2596be] text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center gap-2 cursor-pointer"
                        >
                          <FileSpreadsheet size={15} />
                          <span>Request Official Quote</span>
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Desktop Tab 3: Wishlist */}
            {activeTab === "wishlist" && (
              <div className="space-y-6">
                {wishlist.length === 0 ? (
                  <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-2xs space-y-4">
                    <div className="w-16 h-16 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center mx-auto">
                      <Heart size={28} />
                    </div>
                    <h3 className="text-base font-black text-slate-900">Your Wishlist is Empty</h3>
                    <p className="text-xs text-slate-500 max-w-sm mx-auto">
                      Click the heart icon on any equipment or engineering service to bookmark it for quick access.
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        if (onNavigateCatalog) onNavigateCatalog();
                        else {
                          window.location.hash = "#/products";
                          window.scrollTo({ top: 0, behavior: "smooth" });
                        }
                      }}
                      className="mt-2 px-6 py-2.5 bg-[#031b4e] hover:bg-[#2596be] text-white font-bold text-xs rounded-xl transition-all cursor-pointer inline-flex items-center gap-2"
                    >
                      <span>Browse Products & Services</span>
                      <ArrowRight size={14} />
                    </button>
                  </div>
                ) : (
                  <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
                    <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                      <span className="text-xs font-bold text-slate-700">{wishlist.length} saved item{wishlist.length > 1 ? "s" : ""}</span>
                      <button
                        type="button"
                        onClick={clearWishlist}
                        className="text-xs font-bold text-slate-500 hover:text-red-600 flex items-center gap-1 cursor-pointer"
                      >
                        <Trash2 size={13} />
                        <span>Clear Wishlist</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4">
                      {wishlist.map((item) => (
                        <div key={item.id} className="p-4 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition-all flex flex-col justify-between">
                          <div className="flex items-start gap-3">
                            <img
                              src={item.image}
                              alt={item.name}
                              className="w-16 h-16 rounded-lg object-cover border border-slate-100 shrink-0 bg-slate-50"
                            />
                            <div className="min-w-0 flex-1">
                              <span className="text-[10px] font-bold uppercase tracking-wider text-rose-600 block">{item.category}</span>
                              <h4 className="text-xs font-black text-slate-900 truncate mt-0.5">{item.name}</h4>
                              <p className="text-[11px] text-slate-500 line-clamp-2 mt-0.5">{item.description}</p>
                            </div>
                          </div>

                          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                            <button
                              type="button"
                              onClick={() => removeFromWishlist(item.id)}
                              className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg transition-colors cursor-pointer"
                              title="Remove"
                            >
                              <Trash2 size={14} />
                            </button>

                            {item.type === "product" && onAddToCart && (
                              <button
                                type="button"
                                onClick={() => {
                                  onAddToCart({
                                    id: item.id,
                                    name: item.name,
                                    category: item.category,
                                    brand: item.brand || "Cool Tech",
                                    model: item.model || "",
                                    capacity: item.capacity || "",
                                    price: item.price || 0,
                                    rating: 5,
                                    reviewsCount: 1,
                                    inStock: true,
                                    features: [],
                                    image: item.image,
                                    description: item.description,
                                    specifications: {}
                                  }, 1);
                                  if (onShowToast) onShowToast(`Added "${item.name}" to your quote cart.`);
                                }}
                                className="px-3 py-1.5 bg-[#031b4e] hover:bg-[#2596be] text-white text-[11px] font-bold rounded-lg transition-all flex items-center gap-1 cursor-pointer"
                              >
                                <ShoppingCart size={13} />
                                <span>Add to Cart</span>
                              </button>
                            )}

                            {item.type === "service" && onRequestQuoteWithService && (
                              <button
                                type="button"
                                onClick={() => onRequestQuoteWithService(item.name)}
                                className="px-3 py-1.5 bg-[#031b4e] hover:bg-[#2596be] text-white text-[11px] font-bold rounded-lg transition-all flex items-center gap-1 cursor-pointer"
                              >
                                <Briefcase size={13} />
                                <span>Book Service</span>
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Desktop Tab 4: B2B Trade Partner Module */}
            {activeTab === "partner" && (
              <div className="space-y-6">

                {/* Trade Partner Value & Advantage Showcase Banner */}
                <div className="bg-[#031b4e] text-white rounded-2xl p-6 sm:p-7 shadow-xs relative overflow-hidden">
                  <div className="relative z-10 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-400/20 text-cyan-300 text-[10px] font-black uppercase tracking-wider mb-2">
                          <Sparkles size={12} />
                          <span>Built For MEP Contractors, Traders & Project Resellers</span>
                        </div>
                        <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                          Create & Download Custom Quotations in Seconds
                        </h2>
                      </div>
                    </div>

                    <p className="text-xs text-blue-100 max-w-3xl leading-relaxed">
                      Register your trade account to unlock our superfast quotation engine. Build tailored HVAC & cooling equipment quotes, export ready-to-present technical submittals, and access exclusive wholesale pricing directly.
                    </p>

                    {/* 4 Feature Highlights Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
                      
                      {/* Feature 1 */}
                      <div className="p-3.5 rounded-xl bg-white/10 border border-white/10 flex flex-col justify-between">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-7 h-7 rounded-lg bg-cyan-400/20 text-cyan-300 flex items-center justify-center shrink-0 font-bold">
                            <FileSpreadsheet size={15} />
                          </div>
                          <span className="text-xs font-black text-white leading-tight">Instant Custom Quotes</span>
                        </div>
                        <p className="text-[11px] text-blue-100 leading-snug">
                          Configure custom quantities, models, and technical specs for projects in clicks.
                        </p>
                      </div>

                      {/* Feature 2 */}
                      <div className="p-3.5 rounded-xl bg-white/10 border border-white/10 flex flex-col justify-between">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-7 h-7 rounded-lg bg-emerald-400/20 text-emerald-300 flex items-center justify-center shrink-0 font-bold">
                            <Download size={15} />
                          </div>
                          <span className="text-xs font-black text-white leading-tight">1-Click PDF Download</span>
                        </div>
                        <p className="text-[11px] text-blue-100 leading-snug">
                          Download official, branded PDF quotations for client & tender presentations.
                        </p>
                      </div>

                      {/* Feature 3 */}
                      <div className="p-3.5 rounded-xl bg-white/10 border border-white/10 flex flex-col justify-between">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-7 h-7 rounded-lg bg-amber-400/20 text-amber-300 flex items-center justify-center shrink-0 font-bold">
                            <Zap size={15} />
                          </div>
                          <span className="text-xs font-black text-white leading-tight">Superfast Turnaround</span>
                        </div>
                        <p className="text-[11px] text-blue-100 leading-snug">
                          Bypass quote delays with direct priority warehouse allocation across UAE.
                        </p>
                      </div>

                      {/* Feature 4 */}
                      <div className="p-3.5 rounded-xl bg-white/10 border border-white/10 flex flex-col justify-between">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-7 h-7 rounded-lg bg-blue-400/20 text-cyan-200 flex items-center justify-center shrink-0 font-bold">
                            <Building2 size={15} />
                          </div>
                          <span className="text-xs font-black text-white leading-tight">Direct Wholesale Rates</span>
                        </div>
                        <p className="text-[11px] text-blue-100 leading-snug">
                          Unlock verified reseller pricing, credit terms, and dedicated engineer support.
                        </p>
                      </div>

                    </div>
                  </div>
                </div>
                
                {/* Status Summary if Application is Approved */}
                {isPartnerApproved && (
                  <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 shadow-2xs space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center">
                        <CheckCircle2 size={22} />
                      </div>
                      <div>
                        <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800">Verified B2B Account</span>
                        <h3 className="text-base font-black text-slate-900">
                          {existingApp?.companyName || profile?.companyName || "Approved Trade Partner"}
                        </h3>
                      </div>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Your business account is verified with Cool Technologies. You have direct access to commercial rates, prioritized project dispatch, and dedicated account manager support.
                    </p>
                    <div className="grid grid-cols-3 gap-3 pt-2 border-t border-emerald-200/60 text-xs">
                      <div>
                        <span className="text-[10px] text-slate-500 font-bold block">Trade License</span>
                        <span className="font-bold text-slate-800">{existingApp?.tradeLicenseNumber || "Verified"}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 font-bold block">Account Type</span>
                        <span className="font-bold text-slate-800">{existingApp?.businessType || "MEP / Reseller"}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 font-bold block">Payment Terms</span>
                        <span className="font-bold text-slate-800">{existingApp?.paymentTermsRequested || "Standard Trade"}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Status Summary if Application is Under Review */}
                {isPartnerPending && (
                  <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 shadow-2xs space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center">
                        <Clock size={22} />
                      </div>
                      <div>
                        <span className="text-[10px] font-black uppercase tracking-wider text-amber-800">Application Under Review</span>
                        <h3 className="text-base font-black text-slate-900">
                          {existingApp?.companyName || "Registration Submitted"}
                        </h3>
                      </div>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Your Reseller Registration Form has been received by Cool Technologies commercial management. Document verification is underway and your trade terms will be confirmed within 24 hours.
                    </p>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-amber-200/60 text-xs">
                      <div>
                        <span className="text-[10px] text-slate-500 font-bold block">License Number</span>
                        <span className="font-bold text-slate-800">{existingApp?.tradeLicenseNumber || "—"}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 font-bold block">Contact Person</span>
                        <span className="font-bold text-slate-800">{existingApp?.contactPerson || "—"}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 font-bold block">Emirate</span>
                        <span className="font-bold text-slate-800">{existingApp?.emirate || "Dubai"}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 font-bold block">Status</span>
                        <span className="font-bold text-amber-700 uppercase">Pending Review</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Step-by-Step Registration Form (If Not Applied Yet) */}
                {!isPartnerApproved && !isPartnerPending && (
                  <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
                    
                    {/* Step Tabs Header */}
                    <div className="grid grid-cols-4 border-b border-slate-100 bg-slate-50 text-xs font-bold text-center">
                      <div className={`py-3.5 px-2 flex items-center justify-center gap-1.5 border-r border-slate-100 ${partnerStep === 1 ? "bg-white text-[#031b4e] border-b-2 border-b-blue-600" : partnerStep > 1 ? "text-emerald-700" : "text-slate-400"}`}>
                        <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${partnerStep === 1 ? "bg-[#031b4e] text-white" : partnerStep > 1 ? "bg-emerald-600 text-white" : "bg-slate-200 text-slate-600"}`}>1</span>
                        <span className="hidden sm:inline">Company Info</span>
                      </div>
                      <div className={`py-3.5 px-2 flex items-center justify-center gap-1.5 border-r border-slate-100 ${partnerStep === 2 ? "bg-white text-[#031b4e] border-b-2 border-b-blue-600" : partnerStep > 2 ? "text-emerald-700" : "text-slate-400"}`}>
                        <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${partnerStep === 2 ? "bg-[#031b4e] text-white" : partnerStep > 2 ? "bg-emerald-600 text-white" : "bg-slate-200 text-slate-600"}`}>2</span>
                        <span className="hidden sm:inline">Primary Contact</span>
                      </div>
                      <div className={`py-3.5 px-2 flex items-center justify-center gap-1.5 border-r border-slate-100 ${partnerStep === 3 ? "bg-white text-[#031b4e] border-b-2 border-b-blue-600" : partnerStep > 3 ? "text-emerald-700" : "text-slate-400"}`}>
                        <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${partnerStep === 3 ? "bg-[#031b4e] text-white" : partnerStep > 3 ? "bg-emerald-600 text-white" : "bg-slate-200 text-slate-600"}`}>3</span>
                        <span className="hidden sm:inline">Commercial Info</span>
                      </div>
                      <div className={`py-3.5 px-2 flex items-center justify-center gap-1.5 ${partnerStep === 4 ? "bg-white text-[#031b4e] border-b-2 border-b-blue-600" : "text-slate-400"}`}>
                        <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${partnerStep === 4 ? "bg-[#031b4e] text-white" : "bg-slate-200 text-slate-600"}`}>4</span>
                        <span className="hidden sm:inline">Documents</span>
                      </div>
                    </div>

                    {partnerError && (
                      <div className="p-4 bg-red-50 border-b border-red-100 flex items-center gap-2 text-xs font-bold text-red-800">
                        <AlertCircle size={16} className="text-red-600 shrink-0" />
                        <span>{partnerError}</span>
                      </div>
                    )}

                    <form onSubmit={handlePartnerSubmit} className="p-6 sm:p-7 space-y-6">
                      
                      {/* Step 1: Company / Business Information */}
                      {partnerStep === 1 && (
                        <div className="space-y-4">
                          <div>
                            <label className="block text-xs font-bold text-slate-800 mb-1">
                              1. Company / Business Name <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="text"
                              value={partnerCompanyName}
                              onChange={(e) => setPartnerCompanyName(e.target.value)}
                              placeholder="Enter registered company name"
                              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-blue-600"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-bold text-slate-800 mb-1">
                              2. Trade License / Registration Number <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="text"
                              value={partnerTradeLicense}
                              onChange={(e) => setPartnerTradeLicense(e.target.value)}
                              placeholder="e.g. CN-1234567 or TL-987654"
                              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-blue-600"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-bold text-slate-800 mb-2">
                              3. Business Type <span className="text-red-500">*</span>
                            </label>
                            <div className="space-y-2">
                              <label className="flex items-center gap-2.5 text-xs text-slate-700 cursor-pointer">
                                <input
                                  type="radio"
                                  name="partnerBusinessType"
                                  value="LLC"
                                  checked={partnerBusinessType === "LLC"}
                                  onChange={() => setPartnerBusinessType("LLC")}
                                  className="w-4 h-4 text-blue-600"
                                />
                                <span>LLC</span>
                              </label>
                              <label className="flex items-center gap-2.5 text-xs text-slate-700 cursor-pointer">
                                <input
                                  type="radio"
                                  name="partnerBusinessType"
                                  value="Sole Establishment"
                                  checked={partnerBusinessType === "Sole Establishment"}
                                  onChange={() => setPartnerBusinessType("Sole Establishment")}
                                  className="w-4 h-4 text-blue-600"
                                />
                                <span>Sole Establishment</span>
                              </label>
                              <div className="flex items-center gap-2 text-xs text-slate-700">
                                <label className="flex items-center gap-2 cursor-pointer shrink-0">
                                  <input
                                    type="radio"
                                    name="partnerBusinessType"
                                    value="Other"
                                    checked={partnerBusinessType === "Other"}
                                    onChange={() => setPartnerBusinessType("Other")}
                                    className="w-4 h-4 text-blue-600"
                                  />
                                  <span>Other:</span>
                                </label>
                                <input
                                  type="text"
                                  disabled={partnerBusinessType !== "Other"}
                                  value={partnerBusinessTypeOther}
                                  onChange={(e) => setPartnerBusinessTypeOther(e.target.value)}
                                  placeholder="Please specify"
                                  className="flex-1 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-blue-600 disabled:opacity-50"
                                />
                              </div>
                            </div>
                          </div>

                          <div className="pt-2">
                            <label className="block text-xs font-bold text-slate-800 mb-2">
                              4. Business Address <span className="text-red-500">*</span>
                            </label>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              <div>
                                <label className="block text-[11px] text-slate-500 font-semibold mb-1">Emirate *</label>
                                <select
                                  value={partnerEmirate}
                                  onChange={(e) => setPartnerEmirate(e.target.value)}
                                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-blue-600 cursor-pointer"
                                >
                                  {EMIRATES.map((em) => (
                                    <option key={em} value={em}>{em}</option>
                                  ))}
                                </select>
                              </div>
                              <div>
                                <label className="block text-[11px] text-slate-500 font-semibold mb-1">City *</label>
                                <input
                                  type="text"
                                  value={partnerCity}
                                  onChange={(e) => setPartnerCity(e.target.value)}
                                  placeholder="e.g. Dubai / Mussafah"
                                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-blue-600"
                                />
                              </div>
                              <div className="sm:col-span-2">
                                <label className="block text-[11px] text-slate-500 font-semibold mb-1">Address *</label>
                                <input
                                  type="text"
                                  value={partnerAddress}
                                  onChange={(e) => setPartnerAddress(e.target.value)}
                                  placeholder="Building / Warehouse / Street / Area"
                                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-blue-600"
                                />
                              </div>
                            </div>
                          </div>

                          <div className="pt-4 border-t border-slate-100 flex justify-end">
                            <button
                              type="button"
                              onClick={handlePartnerNextStep}
                              className="px-6 py-2.5 bg-[#031b4e] hover:bg-[#2596be] text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
                            >
                              <span>Continue to Contact Info</span>
                              <ArrowRight size={14} />
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Step 2: Primary Contact */}
                      {partnerStep === 2 && (
                        <div className="space-y-4">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-xs font-bold text-slate-800 mb-1">
                                5. Contact Person Name <span className="text-red-500">*</span>
                              </label>
                              <input
                                type="text"
                                value={partnerContactPerson}
                                onChange={(e) => setPartnerContactPerson(e.target.value)}
                                placeholder="Full name"
                                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-blue-600"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-bold text-slate-800 mb-1">
                                6. Designation <span className="text-red-500">*</span>
                              </label>
                              <input
                                type="text"
                                value={partnerDesignation}
                                onChange={(e) => setPartnerDesignation(e.target.value)}
                                placeholder="e.g. Managing Director"
                                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-blue-600"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-bold text-slate-800 mb-1">
                                7. Mobile / WhatsApp Number <span className="text-red-500">*</span>
                              </label>
                              <input
                                type="tel"
                                value={partnerPhone}
                                onChange={(e) => setPartnerPhone(e.target.value)}
                                placeholder="e.g. +971 50 123 4567"
                                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-blue-600"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-bold text-slate-800 mb-1">
                                8. Email Address <span className="text-red-500">*</span>
                              </label>
                              <input
                                type="email"
                                value={partnerEmail}
                                onChange={(e) => setPartnerEmail(e.target.value)}
                                placeholder="official@company.com"
                                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:border-blue-600"
                              />
                            </div>
                          </div>

                          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                            <button
                              type="button"
                              onClick={() => setPartnerStep(1)}
                              className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                            >
                              ← Previous Step
                            </button>
                            <button
                              type="button"
                              onClick={handlePartnerNextStep}
                              className="px-6 py-2.5 bg-[#031b4e] hover:bg-[#2596be] text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
                            >
                              <span>Continue to Commercial Info</span>
                              <ArrowRight size={14} />
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Step 3: Commercial Information */}
                      {partnerStep === 3 && (
                        <div className="space-y-5">
                          <div>
                            <label className="block text-xs font-bold text-slate-800 mb-2">
                              9. Products / Services Interested In <span className="text-red-500">*</span>
                            </label>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              {PRODUCTS_SERVICES_OPTIONS.map((item) => {
                                const isChecked = partnerProducts.includes(item);
                                return (
                                  <label
                                    key={item}
                                    onClick={() => togglePartnerProduct(item)}
                                    className={`flex items-start gap-2.5 p-2.5 rounded-xl border text-xs cursor-pointer transition-all ${
                                      isChecked
                                        ? "bg-blue-50 border-blue-300 text-blue-950 font-bold"
                                        : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
                                    }`}
                                  >
                                    <input
                                      type="checkbox"
                                      checked={isChecked}
                                      onChange={() => {}}
                                      className="mt-0.5 w-3.5 h-3.5 text-blue-600 rounded"
                                    />
                                    <span>{item}</span>
                                  </label>
                                );
                              })}
                            </div>
                          </div>

                          <div>
                            <label className="block text-xs font-bold text-slate-800 mb-2">
                              10. Expected Monthly Purchase / Business Volume <span className="text-red-500">*</span>
                            </label>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              {VOLUME_OPTIONS.map((vol) => (
                                <label
                                  key={vol}
                                  className={`flex items-center gap-2.5 p-2.5 rounded-xl border text-xs cursor-pointer transition-all ${
                                    partnerVolume === vol
                                      ? "bg-blue-50 border-blue-300 text-blue-950 font-bold"
                                      : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
                                  }`}
                                >
                                  <input
                                    type="radio"
                                    name="partnerVolume"
                                    value={vol}
                                    checked={partnerVolume === vol}
                                    onChange={() => setPartnerVolume(vol)}
                                    className="w-3.5 h-3.5 text-blue-600"
                                  />
                                  <span>{vol}</span>
                                </label>
                              ))}
                            </div>
                          </div>

                          <div>
                            <label className="block text-xs font-bold text-slate-800 mb-2">
                              11. Preferred Payment Terms <span className="text-red-500">*</span>
                            </label>
                            <div className="space-y-2">
                              <label className={`flex items-center gap-2.5 p-2.5 rounded-xl border text-xs cursor-pointer transition-all ${
                                partnerPaymentTerms === "Advance Payment" ? "bg-blue-50 border-blue-300 text-blue-950 font-bold" : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
                              }`}>
                                <input
                                  type="radio"
                                  name="partnerPaymentTerms"
                                  value="Advance Payment"
                                  checked={partnerPaymentTerms === "Advance Payment"}
                                  onChange={() => setPartnerPaymentTerms("Advance Payment")}
                                  className="w-3.5 h-3.5 text-blue-600"
                                />
                                <span>Advance Payment</span>
                              </label>

                              <label className={`flex items-center gap-2.5 p-2.5 rounded-xl border text-xs cursor-pointer transition-all ${
                                partnerPaymentTerms === "Credit Card – Subject to Approval" ? "bg-blue-50 border-blue-300 text-blue-950 font-bold" : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
                              }`}>
                                <input
                                  type="radio"
                                  name="partnerPaymentTerms"
                                  value="Credit Card – Subject to Approval"
                                  checked={partnerPaymentTerms === "Credit Card – Subject to Approval"}
                                  onChange={() => setPartnerPaymentTerms("Credit Card – Subject to Approval")}
                                  className="w-3.5 h-3.5 text-blue-600"
                                />
                                <span>Credit Card – Subject to Approval</span>
                              </label>

                              <div className="flex items-center gap-2 p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs">
                                <label className="flex items-center gap-2 cursor-pointer shrink-0 text-slate-700 font-semibold">
                                  <input
                                    type="radio"
                                    name="partnerPaymentTerms"
                                    value="Other"
                                    checked={partnerPaymentTerms === "Other"}
                                    onChange={() => setPartnerPaymentTerms("Other")}
                                    className="w-3.5 h-3.5 text-blue-600"
                                  />
                                  <span>Other:</span>
                                </label>
                                <input
                                  type="text"
                                  disabled={partnerPaymentTerms !== "Other"}
                                  value={partnerPaymentTermsOther}
                                  onChange={(e) => setPartnerPaymentTermsOther(e.target.value)}
                                  placeholder="Please specify"
                                  className="flex-1 px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-blue-600 disabled:opacity-50"
                                />
                              </div>
                            </div>
                          </div>

                          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                            <button
                              type="button"
                              onClick={() => setPartnerStep(2)}
                              className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                            >
                              ← Previous Step
                            </button>
                            <button
                              type="button"
                              onClick={handlePartnerNextStep}
                              className="px-6 py-2.5 bg-[#031b4e] hover:bg-[#2596be] text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
                            >
                              <span>Continue to Documents</span>
                              <ArrowRight size={14} />
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Step 4: Documents Upload */}
                      {partnerStep === 4 && (
                        <div className="space-y-4">
                          <div>
                            <label className="block text-xs font-bold text-slate-800 mb-1.5">
                              12. Trade License Copy <span className="text-red-500">* — Upload</span>
                            </label>
                            <label className="border-2 border-dashed border-slate-200 hover:border-blue-400 bg-slate-50 hover:bg-blue-50/30 rounded-xl p-4 flex flex-col items-center justify-center text-center cursor-pointer transition-all">
                              <UploadCloud size={22} className="text-blue-600 mb-1" />
                              <span className="text-xs font-bold text-slate-800">
                                {partnerTradeLicenseFile ? partnerTradeLicenseFile : "Select Trade License (PDF / JPG / PNG)"}
                              </span>
                              <span className="text-[10px] text-slate-400 mt-0.5">Maximum size 10MB</span>
                              <input
                                type="file"
                                accept=".pdf,.jpg,.jpeg,.png"
                                onChange={(e) => handlePartnerFileUpload(e, "license")}
                                className="hidden"
                              />
                            </label>
                          </div>

                          <div>
                            <label className="block text-xs font-bold text-slate-800 mb-1.5">
                              13. VAT Certificate — Upload <span className="text-slate-400 font-normal">(if VAT registered)</span>
                            </label>
                            <label className="border-2 border-dashed border-slate-200 hover:border-blue-400 bg-slate-50 hover:bg-blue-50/30 rounded-xl p-4 flex flex-col items-center justify-center text-center cursor-pointer transition-all">
                              <UploadCloud size={22} className="text-slate-500 mb-1" />
                              <span className="text-xs font-bold text-slate-800">
                                {partnerVatCertFile ? partnerVatCertFile : "Select VAT Certificate (Optional)"}
                              </span>
                              <span className="text-[10px] text-slate-400 mt-0.5">Maximum size 10MB</span>
                              <input
                                type="file"
                                accept=".pdf,.jpg,.jpeg,.png"
                                onChange={(e) => handlePartnerFileUpload(e, "vat")}
                                className="hidden"
                              />
                            </label>
                          </div>

                          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                            <button
                              type="button"
                              onClick={() => setPartnerStep(3)}
                              className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                            >
                              ← Previous Step
                            </button>
                            <button
                              type="submit"
                              disabled={partnerSubmitting}
                              className="px-8 py-2.5 bg-[#031b4e] hover:bg-[#2596be] text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                            >
                              {partnerSubmitting ? (
                                <>
                                  <Loader2 size={13} className="animate-spin" />
                                  <span>Submitting...</span>
                                </>
                              ) : (
                                <>
                                  <Check size={14} className="stroke-[3]" />
                                  <span>Submit Registration</span>
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      )}

                    </form>
                  </div>
                )}

              </div>
            )}

            {/* Desktop Tab 5: Security */}
            {activeTab === "security" && (
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-6">
                <div className="space-y-4">
                  <h3 className="text-sm font-black text-slate-900">Email Verification Status</h3>
                  <div className="flex items-center justify-between p-4 rounded-xl border border-slate-100 bg-slate-50">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isEmailVerified ? "bg-emerald-100 text-emerald-600" : "bg-amber-100 text-amber-600"}`}>
                        {isEmailVerified ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-900">
                          {isEmailVerified ? "Email Address Verified" : "Email Address Pending Verification"}
                        </div>
                        <div className="text-[11px] text-slate-500">{authUser?.email}</div>
                      </div>
                    </div>

                    {!isEmailVerified && (
                      <button
                        type="button"
                        onClick={handleResendEmail}
                        disabled={emailCooldown > 0 || resendingEmail}
                        className="px-3 py-1.5 text-xs font-bold bg-[#031b4e] text-white rounded-lg hover:bg-blue-800 disabled:opacity-50 cursor-pointer"
                      >
                        {resendingEmail ? "Sending..." : emailCooldown > 0 ? `Wait ${emailCooldown}s` : "Resend Link"}
                      </button>
                    )}
                  </div>
                </div>

                <div className="pt-6 border-t border-slate-100 space-y-4">
                  <h3 className="text-sm font-black text-slate-900">Password & Credentials</h3>
                  <p className="text-xs text-slate-500">
                    Request a secure password reset link to change your login credentials.
                  </p>
                  <button
                    type="button"
                    onClick={handlePasswordReset}
                    className="px-4 py-2 text-xs font-bold bg-white border border-slate-200 text-slate-800 hover:bg-slate-50 rounded-xl transition-all shadow-2xs cursor-pointer"
                  >
                    Send Password Reset Email
                  </button>
                  {resetSentNotice && (
                    <p className="text-xs text-emerald-600 font-bold">Password reset email dispatched to {authUser?.email}.</p>
                  )}
                </div>
              </div>
            )}

          </main>
        </div>
      </div>

      {/* =========================================================================
          MOBILE VERSION (VISIBLE BELOW MD) - CLEAN DRILL-DOWN SUB-PAGES
         ========================================================================= */}
      <div className="md:hidden flex flex-col min-h-screen bg-slate-50">
        
        {/* Mobile Top Header Bar */}
        <header className="sticky top-0 z-40 bg-[#031b4e] text-white border-b border-blue-900 px-4 h-14 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                if (mobileView !== "main") {
                  setMobileView("main");
                } else if (onNavigateHome) {
                  onNavigateHome();
                } else {
                  window.location.hash = "#/";
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }
              }}
              className="flex items-center gap-1.5 text-xs font-bold text-slate-300 hover:text-white bg-blue-950/60 px-2.5 py-1.5 rounded-lg border border-blue-800 cursor-pointer"
            >
              <ArrowLeft size={14} />
              <span>{mobileView !== "main" ? "Back" : "Store"}</span>
            </button>
            <span className="text-xs font-black uppercase tracking-wider text-cyan-200">
              {mobileView === "main" && "My Account"}
              {mobileView === "cart" && "My Quote Cart"}
              {mobileView === "wishlist" && "My Wishlist"}
              {mobileView === "partner" && "Trade Partner"}
              {mobileView === "security" && "Security & Login"}
            </span>
          </div>

          <button
            type="button"
            onClick={handleSignOut}
            className="text-xs font-bold text-slate-300 hover:text-red-400 p-1.5 cursor-pointer"
            title="Sign Out"
          >
            <LogOut size={16} />
          </button>
        </header>

        {/* Mobile Main View (Menu & Profile) */}
        {mobileView === "main" && (
          <div className="p-4 space-y-4">
            
            {/* User Profile Card */}
            <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs space-y-4">
              <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
                <div className="w-12 h-12 rounded-xl bg-[#031b4e] text-white flex items-center justify-center text-base font-black shrink-0">
                  {userInitials}
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-sm font-black text-slate-900 truncate">{name || profile?.name || authUser?.displayName || "My Profile"}</h3>
                  <p className="text-[11px] text-slate-500 truncate">{authUser?.email}</p>
                  {companyName && <p className="text-[11px] font-bold text-[#031b4e] truncate mt-0.5">{companyName}</p>}
                </div>
                <button
                  type="button"
                  onClick={() => setIsEditing(!isEditing)}
                  className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg border border-slate-200 cursor-pointer"
                >
                  <Edit3 size={14} />
                </button>
              </div>

              <form onSubmit={handleSaveProfile} className="space-y-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Full Name</label>
                  {isEditing ? (
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white"
                    />
                  ) : (
                    <div className="px-3 py-2 bg-slate-50 rounded-xl text-xs font-semibold text-slate-800">{name || "—"}</div>
                  )}
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Designation</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={designation}
                      onChange={(e) => setDesignation(e.target.value)}
                      placeholder="e.g. Procurement Manager"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white"
                    />
                  ) : (
                    <div className="px-3 py-2 bg-slate-50 rounded-xl text-xs font-semibold text-slate-800">{designation || "—"}</div>
                  )}
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Mobile / WhatsApp</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+971 50 123 4567"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white"
                    />
                  ) : (
                    <div className="px-3 py-2 bg-slate-50 rounded-xl text-xs font-semibold text-slate-800">{phone || "—"}</div>
                  )}
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Company Name</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white"
                    />
                  ) : (
                    <div className="px-3 py-2 bg-slate-50 rounded-xl text-xs font-semibold text-slate-800">{companyName || "—"}</div>
                  )}
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">Address</label>
                  {isEditing ? (
                    <textarea
                      rows={2}
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white"
                    />
                  ) : (
                    <div className="px-3 py-2 bg-slate-50 rounded-xl text-xs font-semibold text-slate-800 min-h-[36px]">{address || "—"}</div>
                  )}
                </div>

                {isEditing && (
                  <div className="pt-2 flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setIsEditing(false)}
                      className="px-3 py-1.5 text-xs font-bold text-slate-600 bg-slate-100 rounded-lg"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSaving}
                      className="px-4 py-1.5 text-xs font-bold text-white bg-[#031b4e] rounded-lg"
                    >
                      {isSaving ? "Saving..." : "Save"}
                    </button>
                  </div>
                )}
              </form>
            </div>

            {/* Mobile Navigation Links */}
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs divide-y divide-slate-100">
              
              <button
                type="button"
                onClick={() => setMobileView("cart")}
                className="w-full p-4 flex items-center justify-between text-left hover:bg-slate-50 cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                    <ShoppingCart size={18} />
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-slate-900">My Quote Cart</h4>
                    <p className="text-[10px] text-slate-500">{totalCartItems} items saved</p>
                  </div>
                </div>
                <ChevronRight size={16} className="text-slate-400" />
              </button>

              <button
                type="button"
                onClick={() => setMobileView("wishlist")}
                className="w-full p-4 flex items-center justify-between text-left hover:bg-slate-50 cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-500 flex items-center justify-center">
                    <Heart size={18} />
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-slate-900">My Wishlist</h4>
                    <p className="text-[10px] text-slate-500">{wishlist.length} saved products & services</p>
                  </div>
                </div>
                <ChevronRight size={16} className="text-slate-400" />
              </button>

              <button
                type="button"
                onClick={() => setMobileView("partner")}
                className="w-full p-4 flex items-center justify-between text-left hover:bg-slate-50 cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-cyan-50 text-cyan-700 flex items-center justify-center">
                    <Building2 size={18} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-black text-slate-900">Trade Partner Program</h4>
                      {isPartnerApproved ? (
                        <span className="text-[9px] font-black bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded">Approved</span>
                      ) : isPartnerPending ? (
                        <span className="text-[9px] font-black bg-amber-100 text-amber-800 px-1.5 py-0.2 rounded">Pending</span>
                      ) : null}
                    </div>
                    <p className="text-[10px] text-slate-500">Reseller registration & trade terms</p>
                  </div>
                </div>
                <ChevronRight size={16} className="text-slate-400" />
              </button>

              <button
                type="button"
                onClick={() => setMobileView("security")}
                className="w-full p-4 flex items-center justify-between text-left hover:bg-slate-50 cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
                    <Shield size={18} />
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-slate-900">Security & Credentials</h4>
                    <p className="text-[10px] text-slate-500">Password and email verification</p>
                  </div>
                </div>
                <ChevronRight size={16} className="text-slate-400" />
              </button>

            </div>

          </div>
        )}

        {/* Mobile View: Cart */}
        {mobileView === "cart" && (
          <div className="p-4 space-y-4">
            {cart.length === 0 ? (
              <div className="bg-white rounded-2xl p-8 text-center border border-slate-200 space-y-3">
                <ShoppingCart size={32} className="text-slate-300 mx-auto" />
                <h4 className="text-xs font-black text-slate-800">Your Quote Cart is Empty</h4>
                <p className="text-[11px] text-slate-500">Add equipment from the catalog to request a quote.</p>
                <button
                  type="button"
                  onClick={() => {
                    if (onNavigateCatalog) onNavigateCatalog();
                    else window.location.hash = "#/products";
                  }}
                  className="px-4 py-2 bg-[#031b4e] text-white text-xs font-bold rounded-xl"
                >
                  Browse Catalog
                </button>
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden divide-y divide-slate-100">
                {cart.map((item) => (
                  <div key={item.product.id} className="p-3.5 flex items-center gap-3">
                    <img src={item.product.image} alt={item.product.name} className="w-14 h-14 rounded-lg object-cover bg-slate-50" />
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-black text-slate-900 truncate">{item.product.name}</h4>
                      <p className="text-[10px] text-slate-500 truncate">{item.product.category}</p>
                    </div>
                    {onRemoveItem && (
                      <button
                        type="button"
                        onClick={() => onRemoveItem(item.product.id)}
                        className="p-1.5 text-slate-400 hover:text-red-600"
                      >
                        <Trash2 size={15} />
                      </button>
                    )}
                  </div>
                ))}
                <div className="p-4 bg-slate-50">
                  {onOpenQuote && (
                    <button
                      type="button"
                      onClick={onOpenQuote}
                      className="w-full py-2.5 bg-[#031b4e] text-white font-bold text-xs rounded-xl shadow-xs"
                    >
                      Request Quote ({totalCartItems} items)
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Mobile View: Wishlist */}
        {mobileView === "wishlist" && (
          <div className="p-4 space-y-4">
            {wishlist.length === 0 ? (
              <div className="bg-white rounded-2xl p-8 text-center border border-slate-200 space-y-3">
                <Heart size={32} className="text-slate-300 mx-auto" />
                <h4 className="text-xs font-black text-slate-800">Your Wishlist is Empty</h4>
                <p className="text-[11px] text-slate-500">Save products & services to review anytime.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {wishlist.map((item) => (
                  <div key={item.id} className="bg-white rounded-2xl p-3.5 border border-slate-200 flex items-center gap-3">
                    <img src={item.image} alt={item.name} className="w-14 h-14 rounded-lg object-cover bg-slate-50" />
                    <div className="flex-1 min-w-0">
                      <span className="text-[9px] font-bold text-rose-600 uppercase block">{item.category}</span>
                      <h4 className="text-xs font-black text-slate-900 truncate">{item.name}</h4>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeFromWishlist(item.id)}
                      className="p-1.5 text-slate-400 hover:text-red-600"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Mobile View: Trade Partner */}
        {mobileView === "partner" && (
          <div className="p-4 space-y-4">
            
            {/* Mobile Trade Partner Advantage Card */}
            <div className="bg-[#031b4e] text-white rounded-2xl p-4 space-y-3 shadow-xs">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-cyan-400/20 text-cyan-300 text-[9px] font-black uppercase tracking-wider">
                <Sparkles size={11} />
                <span>Trade Partner Advantage</span>
              </div>
              <div>
                <h3 className="text-sm font-black text-white">Create & Download Custom Quotes</h3>
                <p className="text-[11px] text-blue-100 mt-1 leading-relaxed">
                  Generate project equipment quotes with exact specifications and download official branded PDFs instantly.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1">
                <div className="p-2 bg-white/10 rounded-xl text-[10px]">
                  <div className="flex items-center gap-1 font-bold text-cyan-300 mb-0.5">
                    <FileSpreadsheet size={12} />
                    <span>Custom Quotes</span>
                  </div>
                  <p className="text-blue-100 text-[9px] leading-tight">Tailored quotes in seconds</p>
                </div>
                <div className="p-2 bg-white/10 rounded-xl text-[10px]">
                  <div className="flex items-center gap-1 font-bold text-emerald-300 mb-0.5">
                    <Download size={12} />
                    <span>PDF Download</span>
                  </div>
                  <p className="text-blue-100 text-[9px] leading-tight">Ready for clients & tenders</p>
                </div>
                <div className="p-2 bg-white/10 rounded-xl text-[10px]">
                  <div className="flex items-center gap-1 font-bold text-amber-300 mb-0.5">
                    <Zap size={12} />
                    <span>Superfast Speed</span>
                  </div>
                  <p className="text-blue-100 text-[9px] leading-tight">Skip procurement delays</p>
                </div>
                <div className="p-2 bg-white/10 rounded-xl text-[10px]">
                  <div className="flex items-center gap-1 font-bold text-cyan-200 mb-0.5">
                    <Building2 size={12} />
                    <span>Wholesale Rates</span>
                  </div>
                  <p className="text-blue-100 text-[9px] leading-tight">Direct contractor trade terms</p>
                </div>
              </div>
            </div>
            {isPartnerApproved ? (
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 space-y-2 text-xs">
                <div className="flex items-center gap-2 font-bold text-emerald-800">
                  <CheckCircle2 size={16} />
                  <span>Approved Trade Partner</span>
                </div>
                <p className="text-slate-600">{existingApp?.companyName || profile?.companyName}</p>
                <div className="text-[11px] text-slate-500">License: {existingApp?.tradeLicenseNumber || "Verified"}</div>
              </div>
            ) : isPartnerPending ? (
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 space-y-2 text-xs">
                <div className="flex items-center gap-2 font-bold text-amber-800">
                  <Clock size={16} />
                  <span>Application Under Review</span>
                </div>
                <p className="text-slate-600">Submitted for: {existingApp?.companyName}</p>
                <p className="text-[11px] text-slate-500">Our team will verify your credentials within 24 business hours.</p>
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-slate-200 p-4 space-y-4">
                <div className="text-xs font-black text-slate-900 pb-2 border-b border-slate-100 flex items-center justify-between">
                  <span>Reseller Registration (Step {partnerStep}/4)</span>
                  <span className="text-[10px] text-blue-600 font-bold">
                    {partnerStep === 1 && "Business"}
                    {partnerStep === 2 && "Contact"}
                    {partnerStep === 3 && "Commercial"}
                    {partnerStep === 4 && "Documents"}
                  </span>
                </div>

                {partnerError && (
                  <div className="p-2.5 bg-red-50 text-red-700 text-xs rounded-lg font-bold">
                    {partnerError}
                  </div>
                )}

                <form onSubmit={handlePartnerSubmit} className="space-y-3">
                  {partnerStep === 1 && (
                    <>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">Company Name *</label>
                        <input
                          type="text"
                          value={partnerCompanyName}
                          onChange={(e) => setPartnerCompanyName(e.target.value)}
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">Trade License Number *</label>
                        <input
                          type="text"
                          value={partnerTradeLicense}
                          onChange={(e) => setPartnerTradeLicense(e.target.value)}
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">Emirate *</label>
                        <select
                          value={partnerEmirate}
                          onChange={(e) => setPartnerEmirate(e.target.value)}
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                        >
                          {EMIRATES.map((em) => <option key={em} value={em}>{em}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">City & Address *</label>
                        <input
                          type="text"
                          value={partnerAddress}
                          onChange={(e) => setPartnerAddress(e.target.value)}
                          placeholder="Address"
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={handlePartnerNextStep}
                        className="w-full py-2.5 bg-[#031b4e] text-white font-bold text-xs rounded-xl"
                      >
                        Next: Contact Info →
                      </button>
                    </>
                  )}

                  {partnerStep === 2 && (
                    <>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">Contact Person Name *</label>
                        <input
                          type="text"
                          value={partnerContactPerson}
                          onChange={(e) => setPartnerContactPerson(e.target.value)}
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">Designation *</label>
                        <input
                          type="text"
                          value={partnerDesignation}
                          onChange={(e) => setPartnerDesignation(e.target.value)}
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">Mobile / WhatsApp *</label>
                        <input
                          type="tel"
                          value={partnerPhone}
                          onChange={(e) => setPartnerPhone(e.target.value)}
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">Email Address *</label>
                        <input
                          type="email"
                          value={partnerEmail}
                          onChange={(e) => setPartnerEmail(e.target.value)}
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                        />
                      </div>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => setPartnerStep(1)}
                          className="w-1/3 py-2 bg-slate-100 text-slate-700 text-xs font-bold rounded-xl"
                        >
                          ← Back
                        </button>
                        <button
                          type="button"
                          onClick={handlePartnerNextStep}
                          className="flex-1 py-2 bg-[#031b4e] text-white text-xs font-bold rounded-xl"
                        >
                          Next: Commercial →
                        </button>
                      </div>
                    </>
                  )}

                  {partnerStep === 3 && (
                    <>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1.5">Products Interested In *</label>
                        <div className="space-y-1.5 max-h-40 overflow-y-auto">
                          {PRODUCTS_SERVICES_OPTIONS.map((item) => (
                            <label key={item} className="flex items-center gap-2 text-xs text-slate-700">
                              <input
                                type="checkbox"
                                checked={partnerProducts.includes(item)}
                                onChange={() => togglePartnerProduct(item)}
                                className="w-3.5 h-3.5 text-blue-600 rounded"
                              />
                              <span className="truncate">{item}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                      <div className="pt-2">
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">Monthly Volume *</label>
                        <select
                          value={partnerVolume}
                          onChange={(e) => setPartnerVolume(e.target.value)}
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                        >
                          {VOLUME_OPTIONS.map((vol) => <option key={vol} value={vol}>{vol}</option>)}
                        </select>
                      </div>
                      <div className="flex gap-2 pt-2">
                        <button
                          type="button"
                          onClick={() => setPartnerStep(2)}
                          className="w-1/3 py-2 bg-slate-100 text-slate-700 text-xs font-bold rounded-xl"
                        >
                          ← Back
                        </button>
                        <button
                          type="button"
                          onClick={handlePartnerNextStep}
                          className="flex-1 py-2 bg-[#031b4e] text-white text-xs font-bold rounded-xl"
                        >
                          Next: Documents →
                        </button>
                      </div>
                    </>
                  )}

                  {partnerStep === 4 && (
                    <>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">Trade License Copy *</label>
                        <label className="border-2 border-dashed border-slate-200 p-3 rounded-xl flex flex-col items-center text-center cursor-pointer bg-slate-50">
                          <UploadCloud size={20} className="text-blue-600 mb-1" />
                          <span className="text-[11px] font-bold text-slate-800">
                            {partnerTradeLicenseFile || "Upload Trade License (PDF / JPG)"}
                          </span>
                          <input
                            type="file"
                            accept=".pdf,.jpg,.jpeg,.png"
                            onChange={(e) => handlePartnerFileUpload(e, "license")}
                            className="hidden"
                          />
                        </label>
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">VAT Certificate (Optional)</label>
                        <label className="border-2 border-dashed border-slate-200 p-3 rounded-xl flex flex-col items-center text-center cursor-pointer bg-slate-50">
                          <UploadCloud size={20} className="text-slate-500 mb-1" />
                          <span className="text-[11px] font-bold text-slate-800">
                            {partnerVatCertFile || "Upload VAT Certificate (Optional)"}
                          </span>
                          <input
                            type="file"
                            accept=".pdf,.jpg,.jpeg,.png"
                            onChange={(e) => handlePartnerFileUpload(e, "vat")}
                            className="hidden"
                          />
                        </label>
                      </div>
                      <div className="flex gap-2 pt-2">
                        <button
                          type="button"
                          onClick={() => setPartnerStep(3)}
                          className="w-1/3 py-2 bg-slate-100 text-slate-700 text-xs font-bold rounded-xl"
                        >
                          ← Back
                        </button>
                        <button
                          type="submit"
                          disabled={partnerSubmitting}
                          className="flex-1 py-2 bg-[#031b4e] text-white text-xs font-bold rounded-xl"
                        >
                          {partnerSubmitting ? "Submitting..." : "Submit Registration"}
                        </button>
                      </div>
                    </>
                  )}
                </form>
              </div>
            )}
          </div>
        )}

        {/* Mobile View: Security */}
        {mobileView === "security" && (
          <div className="p-4 space-y-4">
            <div className="bg-white rounded-2xl border border-slate-200 p-4 space-y-4">
              <div>
                <h4 className="text-xs font-black text-slate-900 mb-2">Email Verification</h4>
                <div className="p-3 bg-slate-50 rounded-xl text-xs">
                  <div className="font-bold text-slate-800">{isEmailVerified ? "Verified" : "Pending Verification"}</div>
                  <div className="text-slate-500 text-[11px]">{authUser?.email}</div>
                </div>
              </div>
              <div>
                <h4 className="text-xs font-black text-slate-900 mb-2">Password Reset</h4>
                <button
                  type="button"
                  onClick={handlePasswordReset}
                  className="w-full py-2 bg-[#031b4e] text-white text-xs font-bold rounded-xl shadow-xs"
                >
                  Send Password Reset Email
                </button>
              </div>
            </div>
          </div>
        )}

      </div>

    </div>
  );
}
