import React, { useState, useEffect } from "react";
import { 
  X, 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Building2, 
  Save, 
  CheckCircle2, 
  Shield, 
  Loader2, 
  AlertCircle,
  Briefcase,
  Truck,
  FileText,
  BadgeCheck,
  Clock,
  Send,
  Edit3,
  Check,
  ChevronRight,
  ShieldAlert
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { apiClient } from "../../services/apiClient";

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenRetailerModal?: () => void;
  onUpdateProfile?: (updatedData: {
    name: string;
    phone: string;
    companyName: string;
    address: string;
    designation?: string;
    defaultShippingAddress?: string;
    billingAddress?: string;
  }) => void;
}

export default function UserProfileModal({
  isOpen,
  onClose,
  onOpenRetailerModal,
  onUpdateProfile,
}: UserProfileModalProps) {
  const { 
    user: authUser, 
    profile, 
    updateCurrentProfile, 
    sendVerificationEmail,
    refreshProfile,
    isLoading: isAuthLoading 
  } = useAuth();

  // Mode: 'view' vs 'edit'
  const [isEditing, setIsEditing] = useState(false);

  // Form Fields
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [designation, setDesignation] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [address, setAddress] = useState("");
  const [defaultShippingAddress, setDefaultShippingAddress] = useState("");
  const [billingAddress, setBillingAddress] = useState("");
  
  // Statuses
  const [retailerApp, setRetailerApp] = useState<any>(null);
  const [loadingApp, setLoadingApp] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  
  // Email verification resend states
  const [resendingEmail, setResendingEmail] = useState(false);
  const [emailSentNotice, setEmailSentNotice] = useState(false);
  const [emailCooldown, setEmailCooldown] = useState(0);

  // Populate local form fields when modal opens or profile changes
  useEffect(() => {
    if (isOpen && profile) {
      setName(profile.name || authUser?.displayName || "");
      setPhone(profile.phone || "");
      setDesignation(profile.designation || "");
      setCompanyName(profile.companyName || "");
      setAddress(profile.address || "");
      setDefaultShippingAddress(profile.defaultShippingAddress || "");
      setBillingAddress(profile.billingAddress || "");
      setErrorMessage("");
      setSaveSuccess(false);
      setIsEditing(false);

      // Fetch retailer application status if logged in
      setLoadingApp(true);
      apiClient.getMyRetailerApplication()
        .then((res) => {
          if (res?.application) {
            setRetailerApp(res.application);
          } else {
            setRetailerApp(null);
          }
        })
        .catch(() => {
          setRetailerApp(null);
        })
        .finally(() => {
          setLoadingApp(false);
        });
    }
  }, [isOpen, profile, authUser]);

  // Email verification resend cooldown timer
  useEffect(() => {
    if (emailCooldown > 0) {
      const timer = setTimeout(() => setEmailCooldown((prev) => prev - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [emailCooldown]);

  if (!isOpen) return null;

  const handleResendVerification = async () => {
    if (emailCooldown > 0 || resendingEmail) return;
    setResendingEmail(true);
    setEmailSentNotice(false);
    try {
      await sendVerificationEmail();
      setEmailSentNotice(true);
      setEmailCooldown(60);
    } catch (err: any) {
      setErrorMessage(err?.message || "Failed to dispatch verification email. Please try again later.");
    } finally {
      setResendingEmail(false);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (!name.trim()) {
      setErrorMessage("Full Name is required.");
      return;
    }

    setIsSaving(true);

    try {
      const updates = {
        name: name.trim(),
        phone: phone.trim(),
        designation: designation.trim(),
        companyName: companyName.trim(),
        address: address.trim(),
        defaultShippingAddress: defaultShippingAddress.trim(),
        billingAddress: billingAddress.trim(),
      };

      await updateCurrentProfile(updates);
      await refreshProfile();

      if (onUpdateProfile) {
        onUpdateProfile(updates);
      }

      setIsSaving(false);
      setSaveSuccess(true);
      setIsEditing(false);

      setTimeout(() => {
        setSaveSuccess(false);
      }, 2500);
    } catch (err: any) {
      console.error("[Profile] Error saving profile:", err);
      setIsSaving(false);
      const msg = err?.message && !err.message.toLowerCase().includes("database") && !err.message.toLowerCase().includes("sql")
        ? err.message
        : "Failed to update profile details. Please verify your connection and try again.";
      setErrorMessage(msg);
    }
  };

  const userRole = profile?.role || "customer";
  const isB2BVerified = profile?.isVerifiedRetailer === true || userRole === "retailer";
  const isEmailVerified = authUser?.emailVerified === true || profile?.emailVerified === true;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="user-account-title"
    >
      <div className="bg-white text-slate-900 w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200/90 overflow-hidden relative flex flex-col max-h-[92vh]">
        
        {/* Modal Top Header */}
        <div className="bg-[#031b4e] text-white p-5 sm:p-6 flex items-start justify-between relative shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-cyan-500/20 text-cyan-300 text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full border border-cyan-400/30">
                User Account Overview
              </span>
              {isB2BVerified ? (
                <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full border border-emerald-400/30 flex items-center gap-1">
                  <Shield size={11} />
                  Approved B2B Partner
                </span>
              ) : (
                <span className="bg-slate-700/60 text-slate-300 text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border border-slate-600">
                  Standard Account
                </span>
              )}
            </div>
            
            <h2 id="user-account-title" className="font-display font-extrabold text-xl sm:text-2xl mt-2 flex items-center gap-2">
              <User size={24} className="text-cyan-400 shrink-0" />
              <span>My Account</span>
            </h2>
            <p className="text-xs text-blue-200 mt-1 max-w-md">
              Manage your commercial contact info, delivery addresses & trade credentials.
            </p>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all cursor-pointer shrink-0 mt-0.5"
            aria-label="Close Account Modal"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6">
          
          {isAuthLoading ? (
            <div className="py-16 flex flex-col items-center justify-center space-y-3">
              <Loader2 className="w-8 h-8 text-[#031b4e] animate-spin" />
              <p className="text-xs font-bold text-slate-500">Retrieving account records from database...</p>
            </div>
          ) : (
            <>
              {/* Save Success Banner */}
              {saveSuccess && (
                <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2.5 animate-in fade-in duration-200">
                  <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                  <span>Profile details saved and updated in Cloudflare D1.</span>
                </div>
              )}

              {/* Error Banner */}
              {errorMessage && (
                <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium flex items-start gap-2.5 animate-in fade-in duration-150">
                  <AlertCircle size={16} className="text-red-500 shrink-0 mt-0.5" />
                  <span className="leading-snug">{errorMessage}</span>
                </div>
              )}

              {/* 1. Account Overview Card */}
              <div className="bg-slate-50/80 border border-slate-200/80 rounded-xl p-4 sm:p-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/80">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-[#031b4e] text-white flex items-center justify-center font-black text-lg shadow-sm">
                      {name ? name[0].toUpperCase() : authUser?.email?.[0].toUpperCase() || "U"}
                    </div>
                    <div>
                      <h3 className="font-extrabold text-slate-900 text-base leading-tight">
                        {name || "Valued Customer"}
                      </h3>
                      <p className="text-xs text-slate-500 font-medium">{authUser?.email || profile?.email}</p>
                    </div>
                  </div>

                  {/* Edit Toggle Button */}
                  <div>
                    {!isEditing ? (
                      <button
                        type="button"
                        onClick={() => setIsEditing(true)}
                        className="px-4 py-2 bg-white hover:bg-slate-100 border border-slate-300 text-slate-800 text-xs font-bold rounded-lg shadow-2xs transition-all flex items-center gap-1.5 cursor-pointer"
                      >
                        <Edit3 size={14} className="text-[#031b4e]" />
                        <span>Edit Profile</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          setIsEditing(false);
                          setErrorMessage("");
                        }}
                        className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold rounded-lg transition-all cursor-pointer"
                      >
                        Cancel Editing
                      </button>
                    )}
                  </div>
                </div>

                {/* Status Badges Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4">
                  {/* Account Status */}
                  <div className="bg-white p-3 rounded-lg border border-slate-200/70">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Account Status</span>
                    <div className="flex items-center gap-1.5 mt-1">
                      <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                      <span className="text-xs font-bold text-slate-800 capitalize">{profile?.status || "Active"}</span>
                    </div>
                  </div>

                  {/* Email Verification Status */}
                  <div className="bg-white p-3 rounded-lg border border-slate-200/70">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Email Verification</span>
                    <div className="flex items-center gap-1.5 mt-1">
                      {isEmailVerified ? (
                        <>
                          <BadgeCheck size={14} className="text-emerald-600" />
                          <span className="text-xs font-bold text-emerald-700">Verified Email</span>
                        </>
                      ) : (
                        <>
                          <ShieldAlert size={14} className="text-amber-500" />
                          <span className="text-xs font-bold text-amber-700">Unverified</span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Retailer / B2B Status */}
                  <div className="bg-white p-3 rounded-lg border border-slate-200/70">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">B2B Trade Status</span>
                    <div className="flex items-center gap-1.5 mt-1">
                      {isB2BVerified ? (
                        <>
                          <Shield size={14} className="text-emerald-600" />
                          <span className="text-xs font-bold text-emerald-700">Approved Partner</span>
                        </>
                      ) : retailerApp ? (
                        <>
                          <Clock size={14} className="text-blue-600" />
                          <span className="text-xs font-bold text-blue-700 capitalize">
                            Application {retailerApp.status || "Pending"}
                          </span>
                        </>
                      ) : (
                        <span className="text-xs font-semibold text-slate-600">Standard Buyer</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Email Verification Notice & Resend Button */}
                {!isEmailVerified && (
                  <div className="mt-4 p-3 bg-amber-50/90 border border-amber-200 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <AlertCircle size={15} className="text-amber-600 shrink-0" />
                      <span className="text-xs text-amber-800 font-medium">
                        Your email address is unverified.
                      </span>
                    </div>
                    
                    <button
                      type="button"
                      onClick={handleResendVerification}
                      disabled={resendingEmail || emailCooldown > 0}
                      className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-[11px] font-bold rounded-md shadow-2xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                      {resendingEmail ? (
                        <>
                          <Loader2 size={12} className="animate-spin" />
                          <span>Sending...</span>
                        </>
                      ) : emailCooldown > 0 ? (
                        <span>Resend in {emailCooldown}s</span>
                      ) : (
                        <>
                          <Send size={12} />
                          <span>Send Verification Email</span>
                        </>
                      )}
                    </button>
                  </div>
                )}

                {emailSentNotice && (
                  <div className="mt-2 text-xs text-emerald-700 font-semibold flex items-center gap-1.5">
                    <Check size={14} />
                    <span>Verification link sent to {authUser?.email}. Please check your inbox.</span>
                  </div>
                )}
              </div>

              {/* B2B Retailer / Trade Partner Application Status Card */}
              {isB2BVerified ? (
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 sm:p-5 flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                      <Shield size={18} />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-xs sm:text-sm text-emerald-950">
                        Authorized B2B Trade Partner
                      </h4>
                      <p className="text-xs text-emerald-700 mt-0.5 leading-relaxed">
                        Your enterprise credentials and trade license have been verified. You have authorized access to wholesale partner pricing and commercial procurement terms.
                      </p>
                    </div>
                  </div>
                </div>
              ) : retailerApp ? (
                <div className={`border rounded-xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                  retailerApp.status === "rejected" 
                    ? "bg-amber-50/80 border-amber-200" 
                    : "bg-blue-50/80 border-blue-200"
                }`}>
                  <div className="flex items-start gap-3">
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 shadow-xs text-white ${
                      retailerApp.status === "rejected" ? "bg-amber-600" : "bg-[#0f4c81]"
                    }`}>
                      {retailerApp.status === "rejected" ? <AlertCircle size={18} /> : <Clock size={18} />}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-extrabold text-xs sm:text-sm text-slate-900">
                          B2B Retailer Application: <span className="capitalize">{retailerApp.status?.replace('_', ' ')}</span>
                        </h4>
                      </div>
                      <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                        {retailerApp.status === "rejected" 
                          ? (retailerApp.review_notes || "Your application requires documentation updates. Please review and re-apply.")
                          : `Submitted for "${retailerApp.company_name}". Commercial verification is currently in progress with Cool Tech Ops.`}
                      </p>
                    </div>
                  </div>

                  {onOpenRetailerModal && (
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onOpenRetailerModal();
                      }}
                      className="px-4 py-2 bg-white hover:bg-slate-50 border border-slate-300 text-slate-800 text-xs font-bold rounded-xl shadow-2xs transition-all flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
                    >
                      <span>{retailerApp.status === "rejected" ? "Update Application" : "View Application"}</span>
                      <ChevronRight size={14} />
                    </button>
                  )}
                </div>
              ) : (
                <div className="bg-gradient-to-r from-[#031b4e]/5 via-blue-50 to-cyan-50 border border-blue-200/80 rounded-xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-lg bg-[#031b4e] text-white flex items-center justify-center shrink-0 shadow-xs">
                      <Briefcase size={18} />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-xs sm:text-sm text-slate-900">
                        Become an Authorized B2B Retailer / Reseller
                      </h4>
                      <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                        Are you an HVAC contractor, MEP enterprise, or equipment distributor? Submit your trade license to unlock wholesale pricing and credit facilities.
                      </p>
                    </div>
                  </div>

                  {onOpenRetailerModal && (
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onOpenRetailerModal();
                      }}
                      className="px-4 py-2.5 bg-[#031b4e] hover:bg-blue-900 text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
                    >
                      <span>Apply for B2B Retailer</span>
                      <ChevronRight size={14} />
                    </button>
                  )}
                </div>
              )}

              {/* Form / View Content */}
              <form onSubmit={handleSaveProfile} className="space-y-6">
                
                {/* 2. Personal Information */}
                <div className="bg-white border border-slate-200/90 rounded-xl p-4 sm:p-5 space-y-4">
                  <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                    <User size={16} className="text-[#031b4e]" />
                    <h3 className="font-extrabold text-slate-900 text-sm">Personal Information</h3>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Full Name */}
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                        Full Name {isEditing && <span className="text-red-500">*</span>}
                      </label>
                      {isEditing ? (
                        <input
                          type="text"
                          required
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#031b4e]/15 focus:border-[#031b4e]"
                          placeholder="e.g. David Steve"
                        />
                      ) : (
                        <p className="text-xs font-semibold text-slate-800 py-1">{name || "—"}</p>
                      )}
                    </div>

                    {/* Designation */}
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                        Job Title / Designation
                      </label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={designation}
                          onChange={(e) => setDesignation(e.target.value)}
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#031b4e]/15 focus:border-[#031b4e]"
                          placeholder="e.g. Procurement Lead, MEP Engineer"
                        />
                      ) : (
                        <p className="text-xs font-semibold text-slate-800 py-1">{designation || "—"}</p>
                      )}
                    </div>

                    {/* Phone Number */}
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                        Contact Phone / WhatsApp
                      </label>
                      {isEditing ? (
                        <input
                          type="tel"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#031b4e]/15 focus:border-[#031b4e]"
                          placeholder="+971 50 123 4567"
                        />
                      ) : (
                        <p className="text-xs font-semibold text-slate-800 py-1">{phone || "—"}</p>
                      )}
                    </div>

                    {/* Registered Email (Non-editable) */}
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                        Registered Email
                      </label>
                      <p className="text-xs font-semibold text-slate-500 py-1">{authUser?.email || profile?.email}</p>
                    </div>
                  </div>
                </div>

                {/* 3. Company & Entity Information */}
                <div className="bg-white border border-slate-200/90 rounded-xl p-4 sm:p-5 space-y-4">
                  <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                    <Building2 size={16} className="text-[#031b4e]" />
                    <h3 className="font-extrabold text-slate-900 text-sm">Company & Commercial Information</h3>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Company Name */}
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                        Company / Commercial Entity
                      </label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={companyName}
                          onChange={(e) => setCompanyName(e.target.value)}
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#031b4e]/15 focus:border-[#031b4e]"
                          placeholder="e.g. Al Wasl MEP Contracting LLC"
                        />
                      ) : (
                        <p className="text-xs font-semibold text-slate-800 py-1">{companyName || "—"}</p>
                      )}
                    </div>

                    {/* Tax Registration Number (TRN) */}
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                        Tax Registration Number (TRN)
                      </label>
                      <p className="text-xs font-semibold text-slate-800 py-1">
                        {profile?.taxId || retailerApp?.taxRegistrationNumber || "—"}
                      </p>
                    </div>

                    {/* Business Address */}
                    <div className="sm:col-span-2">
                      <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                        Business / Office Address
                      </label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={address}
                          onChange={(e) => setAddress(e.target.value)}
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#031b4e]/15 focus:border-[#031b4e]"
                          placeholder="Office 402, Business Bay, Dubai, UAE"
                        />
                      ) : (
                        <p className="text-xs font-semibold text-slate-800 py-1">{address || "—"}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* 4. Delivery & Billing Addresses */}
                <div className="bg-white border border-slate-200/90 rounded-xl p-4 sm:p-5 space-y-4">
                  <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                    <Truck size={16} className="text-[#031b4e]" />
                    <h3 className="font-extrabold text-slate-900 text-sm">Procurement & Billing Addresses</h3>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Default Shipping Address */}
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                        Default Shipping / Project Site Address
                      </label>
                      {isEditing ? (
                        <textarea
                          rows={2}
                          value={defaultShippingAddress}
                          onChange={(e) => setDefaultShippingAddress(e.target.value)}
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#031b4e]/15 focus:border-[#031b4e]"
                          placeholder="Warehouse 12, Industrial Area 1, Abu Dhabi"
                        />
                      ) : (
                        <p className="text-xs font-semibold text-slate-800 py-1 whitespace-pre-wrap">
                          {defaultShippingAddress || "—"}
                        </p>
                      )}
                    </div>

                    {/* Billing Address */}
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                        Billing / Invoicing Address
                      </label>
                      {isEditing ? (
                        <textarea
                          rows={2}
                          value={billingAddress}
                          onChange={(e) => setBillingAddress(e.target.value)}
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#031b4e]/15 focus:border-[#031b4e]"
                          placeholder="Accounts Payable Dept, P.O. Box 4500, Dubai"
                        />
                      ) : (
                        <p className="text-xs font-semibold text-slate-800 py-1 whitespace-pre-wrap">
                          {billingAddress || "—"}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Edit Form Submit Bar */}
                {isEditing && (
                  <div className="flex items-center justify-end gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setIsEditing(false);
                        setErrorMessage("");
                      }}
                      disabled={isSaving}
                      className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors cursor-pointer disabled:opacity-50"
                    >
                      Cancel
                    </button>
                    
                    <button
                      type="submit"
                      disabled={isSaving}
                      className="px-6 py-2.5 bg-[#031b4e] hover:bg-blue-900 text-white text-xs font-bold rounded-xl shadow-sm hover:shadow-md transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSaving ? (
                        <>
                          <Loader2 size={14} className="animate-spin" />
                          <span>Saving to Cloud...</span>
                        </>
                      ) : (
                        <>
                          <Save size={14} />
                          <span>Save Changes</span>
                        </>
                      )}
                    </button>
                  </div>
                )}

              </form>
            </>
          )}

        </div>

        {/* Modal Footer */}
        <div className="bg-slate-50 border-t border-slate-200/80 px-6 py-3.5 flex items-center justify-between text-[11px] text-slate-500 font-medium shrink-0">
          <span>Cool Technologies Commercial Sourcing Engine</span>
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
