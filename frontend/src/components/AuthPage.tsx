import React, { useState, useEffect } from "react";
import { 
  Lock, 
  Mail, 
  User, 
  CheckCircle2, 
  ArrowRight, 
  KeyRound, 
  ArrowLeft, 
  Eye, 
  EyeOff, 
  Loader2, 
  AlertCircle,
  ShieldCheck,
  Building2,
  Phone,
  Sparkles,
  Check,
  Award,
  Thermometer,
  Droplet,
  Snowflake,
  Wind,
  PhoneCall
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { auth } from "../lib/firebase";

interface AuthPageProps {
  initialMode?: "login" | "signup" | "forgot";
  onLoginSuccess?: () => void;
  onNavigateHome?: () => void;
  onShowToast?: (message: string) => void;
}

function mapFirebaseAuthError(err: any): string {
  const rawCode = err?.code || "";
  const rawMsg = err?.message || "";
  const match = rawMsg.match(/auth\/([a-z0-9-]+)/i);
  const code = (rawCode || (match ? `auth/${match[1]}` : "")).toLowerCase();

  switch (code) {
    case "auth/invalid-credential":
    case "auth/invalid-login-credentials":
    case "auth/wrong-password":
    case "auth/user-not-found":
      return "The email or password is incorrect. (If you registered using Google, please click 'Continue with Google')";
    case "auth/email-already-in-use":
      return "An account already exists with this email address. Please sign in instead.";
    case "auth/weak-password":
      return "Password is too weak. Please use at least 6 characters.";
    case "auth/invalid-email":
      return "Please enter a valid business email address.";
    case "auth/missing-password":
      return "Please enter your account password.";
    case "auth/missing-email":
      return "Please enter your business email address.";
    case "auth/user-disabled":
      return "This account has been disabled. Please contact customer support.";
    case "auth/network-request-failed":
      return "Unable to connect to authentication servers. Please check your internet connection.";
    case "auth/popup-blocked":
      return "The Google sign-in window was blocked by your browser. Please allow pop-ups and try again.";
    case "auth/unauthorized-domain":
      return "This domain is not authorized for Google Sign-In in Firebase Console.";
    case "auth/operation-not-allowed":
      return "This sign-in method is currently disabled.";
    case "auth/too-many-requests":
      return "Access temporarily suspended due to multiple failed attempts. Please try again later.";
    case "auth/popup-closed-by-user":
    case "auth/cancelled-popup-request":
      return "";
  }

  const lowerMsg = rawMsg.toLowerCase();
  if (
    lowerMsg.includes("database is closing") ||
    lowerMsg.includes("database is hidden") ||
    lowerMsg.includes("closing/hidden") ||
    lowerMsg.includes("indexeddb") ||
    lowerMsg.includes("internal-error") ||
    lowerMsg.includes("quotaexceeded") ||
    lowerMsg.includes("storage") ||
    lowerMsg.includes("unknown error")
  ) {
    return "Something went wrong while connecting to your account. Please try again.";
  }

  return "Unable to authenticate. Please verify your credentials and try again.";
}

export default function AuthPage({
  initialMode = "login",
  onLoginSuccess,
  onNavigateHome,
  onShowToast,
}: AuthPageProps) {
  const { user, loginWithEmail, signUpWithEmail, loginWithGoogle, sendPasswordReset } = useAuth();

  const [activeTab, setActiveTab] = useState<"login" | "signup" | "forgot">(initialMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [authError, setAuthError] = useState("");
  const [resetSent, setResetSent] = useState(false);

  // Sync tab with URL hash or initialMode
  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash;
      if (hash.startsWith("#/signup")) {
        setActiveTab("signup");
      } else if (hash.startsWith("#/forgot-password") || hash.startsWith("#/forgot")) {
        setActiveTab("forgot");
      } else if (hash.startsWith("#/login") || hash.startsWith("#/signin")) {
        setActiveTab("login");
      }
      setAuthError("");
    };

    handleHash();
    window.addEventListener("hashchange", handleHash);
    return () => window.removeEventListener("hashchange", handleHash);
  }, []);

  const getRedirectTarget = () => {
    try {
      const hash = (typeof window !== "undefined" ? window.location.hash : "") || "";
      if (hash.includes("redirect=")) {
        const match = hash.match(/redirect=([^&]+)/);
        if (match && match[1]) {
          const decoded = decodeURIComponent(match[1]);
          return decoded.startsWith("#") ? decoded : `#/${decoded.replace(/^\//, '')}`;
        }
      }
      const stored = sessionStorage.getItem("ct_redirect_after_login");
      if (stored) {
        sessionStorage.removeItem("ct_redirect_after_login");
        return stored.startsWith("#") ? stored : `#/${stored.replace(/^\//, '')}`;
      }
    } catch {}
    return "#/account";
  };

  // If user is already authenticated, automatically redirect to target
  useEffect(() => {
    if (user && !isSubmitting) {
      window.location.hash = getRedirectTarget();
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [user, isSubmitting]);

  const handleTabSwitch = (tab: "login" | "signup" | "forgot") => {
    setActiveTab(tab);
    setAuthError("");
    setResetSent(false);
    const hash = window.location.hash || "";
    const redirectQuery = hash.includes("redirect=") ? hash.slice(hash.indexOf("redirect=") - 1) : "";
    if (tab === "signup") {
      window.location.hash = `#/signup${redirectQuery}`;
    } else if (tab === "forgot") {
      window.location.hash = `#/forgot-password${redirectQuery}`;
    } else {
      window.location.hash = `#/login${redirectQuery}`;
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setIsSubmitting(true);
      setAuthError("");
      await loginWithGoogle();
      setSuccessMessage("Authenticated with Google successfully!");
      setShowSuccess(true);
      if (onShowToast) onShowToast("Signed in with Google successfully.");

      setTimeout(() => {
        if (onLoginSuccess) onLoginSuccess();
        window.location.hash = getRedirectTarget();
        window.scrollTo({ top: 0, behavior: "smooth" });
      }, 500);
    } catch (err: any) {
      if (auth.currentUser) {
        setSuccessMessage("Authenticated with Google successfully!");
        setShowSuccess(true);
        if (onShowToast) onShowToast("Signed in with Google successfully.");
        setTimeout(() => {
          if (onLoginSuccess) onLoginSuccess();
          window.location.hash = getRedirectTarget();
          window.scrollTo({ top: 0, behavior: "smooth" });
        }, 500);
        return;
      }

      console.warn("[Auth Debug]", {
        operation: "google-signin",
        code: err?.code || "unknown",
        message: err?.message || String(err),
      });
      setIsSubmitting(false);
      if (err?.code !== "auth/popup-closed-by-user" && err?.code !== "auth/cancelled-popup-request") {
        setAuthError(mapFirebaseAuthError(err));
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");

    if (activeTab === "forgot") {
      if (!email.trim()) {
        setAuthError("Please enter your registered email address.");
        return;
      }
      setIsSubmitting(true);
      try {
        await sendPasswordReset(email.trim());
        setResetSent(true);
        setIsSubmitting(false);
        if (onShowToast) onShowToast("Password reset link sent to your email.");
      } catch (err: any) {
        setIsSubmitting(false);
        setAuthError(mapFirebaseAuthError(err));
      }
      return;
    }

    if (!email.trim() || !password) {
      setAuthError("Please provide both email and password.");
      return;
    }

    if (activeTab === "signup" && !fullName.trim()) {
      setAuthError("Please enter your full name or company representative name.");
      return;
    }

    setIsSubmitting(true);

    try {
      if (activeTab === "login") {
        await loginWithEmail(email.trim(), password);
        setSuccessMessage("Signed in successfully!");
        setShowSuccess(true);
        if (onShowToast) onShowToast("Welcome back! Signed in successfully.");
      } else {
        await signUpWithEmail(email.trim(), password, fullName.trim());
        setSuccessMessage("Account created successfully!");
        setShowSuccess(true);
        if (onShowToast) onShowToast("Account created successfully!");
      }

      setTimeout(() => {
        if (onLoginSuccess) onLoginSuccess();
        window.location.hash = getRedirectTarget();
        window.scrollTo({ top: 0, behavior: "smooth" });
      }, 500);
    } catch (err: any) {
      setIsSubmitting(false);
      setAuthError(mapFirebaseAuthError(err));
    }
  };

  return (
    <div className="min-h-screen bg-[#071739] text-white flex flex-col justify-between relative overflow-hidden">
      {/* Background Subtle Gradient & Grid Accent */}
      <div className="absolute top-0 right-0 w-[550px] h-[550px] bg-cyan-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[450px] h-[450px] bg-blue-700/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Navbar */}
      <header className="relative z-10 border-b border-slate-800/80 bg-[#071739]/90 backdrop-blur-md px-4 sm:px-6 py-3 sm:py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={() => {
              if (onNavigateHome) onNavigateHome();
              else {
                window.location.hash = "#/";
                window.scrollTo({ top: 0, behavior: "smooth" });
              }
            }}
            className="flex items-center gap-2 sm:gap-3 text-white group cursor-pointer focus:outline-none"
          >
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-cyan-400 flex items-center justify-center font-black text-base sm:text-xl text-white shadow-lg shadow-blue-500/25 group-hover:scale-105 transition-transform">
              CT
            </div>
            <div className="text-left">
              <div className="font-black text-sm sm:text-lg tracking-tight leading-none text-white">
                COOL TECHNOLOGIES
              </div>
              <div className="text-[9px] sm:text-[10px] font-bold tracking-widest text-cyan-400 uppercase mt-0.5">
                The Science of Cooling • UAE
              </div>
            </div>
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
            className="flex items-center gap-1.5 text-xs font-bold text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-800 px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-lg border border-slate-700/60 transition-all cursor-pointer shrink-0"
          >
            <ArrowLeft size={13} />
            <span>Back</span>
          </button>
        </div>
      </header>

      {/* Main Authentication Grid */}
      <main className="relative z-10 max-w-7xl mx-auto w-full px-4 py-8 lg:py-12 flex-1 flex items-center justify-center">
        <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Left Side: Authentic Cool Technologies UAE Company Profile */}
          <div className="hidden lg:flex lg:col-span-6 flex-col justify-center space-y-6 pr-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-bold uppercase tracking-wider mb-3">
                <Snowflake size={13} className="text-cyan-400" />
                <span>Premier Industrial Cooling • United Arab Emirates</span>
              </div>
              
              <h1 className="text-3xl xl:text-4xl font-black text-white tracking-tight leading-snug">
                Supplying & Engineering Complete Cooling Solutions Across the UAE
              </h1>
              
              <p className="text-slate-300 text-xs mt-3 leading-relaxed">
                Cool Technologies UAE delivers comprehensive air conditioning, centralized water cooling systems, industrial water chillers, drinking water stations, and Cool Care MEP maintenance services for industrial complexes, commercial towers, government facilities, and labour camps.
              </p>
            </div>

            {/* Core Capability Cards derived directly from Company Profile PDF */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/60">
                <div className="flex items-center gap-2.5 mb-1.5">
                  <div className="w-7 h-7 rounded-lg bg-blue-500/20 text-cyan-400 flex items-center justify-center">
                    <Wind size={15} />
                  </div>
                  <h2 className="text-xs font-bold text-white">Commercial & VRF HVAC</h2>
                </div>
                <p className="text-[11px] text-slate-400 leading-normal">
                  Ducted Split, Package Units, VRF, FCU, AHU, CCU, Cassette & Floor Standing units.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/60">
                <div className="flex items-center gap-2.5 mb-1.5">
                  <div className="w-7 h-7 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
                    <Droplet size={15} />
                  </div>
                  <h2 className="text-xs font-bold text-white">Water Chillers & Coolers</h2>
                </div>
                <p className="text-[11px] text-slate-400 leading-normal">
                  Centralized drinking cooling, industrial & bulk chillers, tank chillers & pool heat pumps.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/60">
                <div className="flex items-center gap-2.5 mb-1.5">
                  <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                    <Thermometer size={15} />
                  </div>
                  <h2 className="text-xs font-bold text-white">Commercial Refrigeration</h2>
                </div>
                <p className="text-[11px] text-slate-400 leading-normal">
                  Ice cube machines, chest freezers, upright display chillers & ventilation equipment.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/60">
                <div className="flex items-center gap-2.5 mb-1.5">
                  <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center">
                    <Award size={15} />
                  </div>
                  <h2 className="text-xs font-bold text-white">Authorized Partner Awards</h2>
                </div>
                <p className="text-[11px] text-slate-400 leading-normal">
                  Blue Star Platinum Award, Super General Excellence, Clivet Top Sales Achiever.
                </p>
              </div>
            </div>

            {/* Direct Official Contact Support Bar */}
            <div className="p-3.5 rounded-xl bg-slate-800/40 border border-slate-700/40 flex items-center justify-between text-xs text-slate-300">
              <div className="flex items-center gap-2">
                <PhoneCall size={14} className="text-cyan-400" />
                <span>Sales: <strong>+971 2 815 6111</strong></span>
              </div>
              <div className="text-slate-400">|</div>
              <div>
                <span>Services: <strong>+971 2 815 6161</strong></span>
              </div>
              <div className="text-slate-400">|</div>
              <div className="text-cyan-400 font-bold">www.cooltechuae.com</div>
            </div>
          </div>

          {/* Right Side: Clean Authentication Card */}
          <div className="lg:col-span-6 flex justify-center">
            <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden relative">
              
              {/* Success Notification Overlay */}
              {showSuccess && (
                <div className="absolute inset-0 z-30 bg-white/95 backdrop-blur-xs flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-200">
                  <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mb-4">
                    <CheckCircle2 size={32} />
                  </div>
                  <h3 className="text-lg font-black text-slate-900">{successMessage}</h3>
                  <p className="text-xs text-slate-500 mt-1">Redirecting to your Account Workspace...</p>
                  <div className="mt-4 flex items-center gap-2 text-xs text-blue-600 font-bold">
                    <Loader2 size={14} className="animate-spin" />
                    <span>Loading profile data</span>
                  </div>
                </div>
              )}

              {/* Card Header & Tabs */}
              <div className="p-6 sm:p-8 pb-4 border-b border-slate-100">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 rounded-full bg-blue-600" />
                  <span className="text-[11px] font-black uppercase tracking-wider text-slate-500">
                    Cool Technologies Account
                  </span>
                </div>
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                  {activeTab === "signup" ? "Create Account" : activeTab === "forgot" ? "Reset Password" : "Sign In to Your Account"}
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  {activeTab === "signup"
                    ? "Register to track quotation RFQs, manage orders & commercial details."
                    : activeTab === "forgot"
                    ? "Enter your registered email address to receive password reset instructions."
                    : "Access your quotation requests, commercial orders & account profile."}
                </p>

                {/* Tab Switcher */}
                {activeTab !== "forgot" && (
                  <div className="grid grid-cols-2 p-1 bg-slate-100 rounded-xl mt-5">
                    <button
                      type="button"
                      onClick={() => handleTabSwitch("login")}
                      className={`py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                        activeTab === "login"
                          ? "bg-white text-slate-900 shadow-xs"
                          : "text-slate-500 hover:text-slate-800"
                      }`}
                      id="auth-tab-signin"
                    >
                      Sign In
                    </button>
                    <button
                      type="button"
                      onClick={() => handleTabSwitch("signup")}
                      className={`py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                        activeTab === "signup"
                          ? "bg-white text-slate-900 shadow-xs"
                          : "text-slate-500 hover:text-slate-800"
                      }`}
                      id="auth-tab-signup"
                    >
                      Create Account
                    </button>
                  </div>
                )}
              </div>

              {/* Card Body */}
              <div className="p-6 sm:p-8 pt-6 space-y-5">
                
                {/* Auth Error Banner */}
                {authError && (
                  <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2.5 text-xs text-red-700 animate-in fade-in duration-150">
                    <AlertCircle size={16} className="shrink-0 text-red-600 mt-0.5" />
                    <div className="flex-1 font-medium">{authError}</div>
                  </div>
                )}

                {/* Password Reset Sent Success Banner */}
                {resetSent && (
                  <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex flex-col gap-2 text-xs text-emerald-800 animate-in fade-in duration-150">
                    <div className="flex items-center gap-2 font-bold text-emerald-900 text-sm">
                      <CheckCircle2 size={16} className="text-emerald-600" />
                      <span>Password Reset Email Dispatched</span>
                    </div>
                    <p>
                      We have sent password reset instructions to <strong>{email}</strong>. Please check your inbox.
                    </p>
                    <button
                      type="button"
                      onClick={() => handleTabSwitch("login")}
                      className="mt-2 text-xs font-bold text-blue-700 hover:underline text-left cursor-pointer"
                    >
                      Return to Sign In &rarr;
                    </button>
                  </div>
                )}

                {/* 1. Google OAuth Button */}
                {activeTab !== "forgot" && (
                  <div>
                    <button
                      type="button"
                      onClick={handleGoogleSignIn}
                      disabled={isSubmitting}
                      className="w-full flex items-center justify-center gap-3 py-2.5 px-4 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 font-bold text-xs rounded-xl shadow-2xs hover:shadow-xs transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                      id="auth-google-btn"
                    >
                      <svg className="w-4 h-4" viewBox="0 0 24 24">
                        <path
                          fill="#4285F4"
                          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        />
                        <path
                          fill="#34A853"
                          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        />
                        <path
                          fill="#FBBC05"
                          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                        />
                        <path
                          fill="#EA4335"
                          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                        />
                      </svg>
                      <span>
                        {activeTab === "signup" ? "Sign up with Google" : "Continue with Google"}
                      </span>
                    </button>

                    <div className="relative flex items-center justify-center my-4">
                      <div className="border-t border-slate-200 w-full" />
                      <span className="bg-white px-3 text-[10px] uppercase font-bold tracking-wider text-slate-400 relative">
                        Or continue with email
                      </span>
                    </div>
                  </div>
                )}

                {/* 2. Email / Password Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Full Name field (Sign up only) */}
                  {activeTab === "signup" && (
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Full Name / Contact Person <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                        <input
                          type="text"
                          required
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          placeholder="e.g. John Smith"
                          className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all"
                          id="auth-fullname-input"
                        />
                      </div>
                    </div>
                  )}

                  {/* Email field */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Business / Work Email <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="name@company.com"
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all"
                        id="auth-email-input"
                      />
                    </div>
                  </div>

                  {/* Password field (Login / Signup only) */}
                  {activeTab !== "forgot" && (
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-xs font-bold text-slate-700">
                          Password <span className="text-red-500">*</span>
                        </label>
                        {activeTab === "login" && (
                          <button
                            type="button"
                            onClick={() => handleTabSwitch("forgot")}
                            className="text-[11px] font-bold text-blue-600 hover:text-blue-800 transition-colors cursor-pointer"
                            id="auth-forgot-link"
                          >
                            Forgot password?
                          </button>
                        )}
                      </div>
                      <div className="relative">
                        <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                        <input
                          type={showPassword ? "text" : "password"}
                          required
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="••••••••"
                          className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all"
                          id="auth-password-input"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer p-1"
                        >
                          {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-[#031b4e] hover:bg-[#2596be] text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed mt-2"
                    id="auth-submit-btn"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 size={14} className="animate-spin" />
                        <span>Processing...</span>
                      </>
                    ) : (
                      <>
                        <span>
                          {activeTab === "signup"
                            ? "CREATE ACCOUNT"
                            : activeTab === "forgot"
                            ? "SEND RESET INSTRUCTIONS"
                            : "SIGN IN TO ACCOUNT"}
                        </span>
                        <ArrowRight size={14} />
                      </>
                    )}
                  </button>
                </form>

                {/* Footer Switcher Links */}
                <div className="pt-3 border-t border-slate-100 text-center text-xs text-slate-500">
                  {activeTab === "login" && (
                    <p>
                      Don&apos;t have an account yet?{" "}
                      <button
                        type="button"
                        onClick={() => handleTabSwitch("signup")}
                        className="font-bold text-blue-700 hover:underline cursor-pointer"
                      >
                        Create an account
                      </button>
                    </p>
                  )}
                  {activeTab === "signup" && (
                    <p>
                      Already have an account?{" "}
                      <button
                        type="button"
                        onClick={() => handleTabSwitch("login")}
                        className="font-bold text-blue-700 hover:underline cursor-pointer"
                      >
                        Sign in
                      </button>
                    </p>
                  )}
                  {activeTab === "forgot" && (
                    <p>
                      Remember your password?{" "}
                      <button
                        type="button"
                        onClick={() => handleTabSwitch("login")}
                        className="font-bold text-blue-700 hover:underline cursor-pointer"
                      >
                        Back to sign in
                      </button>
                    </p>
                  )}
                </div>

                <div className="pt-2 flex items-center justify-center gap-1.5 text-[10px] font-semibold text-slate-400 select-none">
                  <ShieldCheck size={12} className="text-emerald-500" />
                  <span>Secure SSL Encrypted Client Portal</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </main>

      {/* Page Footer */}
      <footer className="relative z-10 border-t border-slate-800/80 bg-[#071739]/95 py-4 px-6 text-center text-xs text-slate-400">
        <p>© {new Date().getFullYear()} Cool Technologies LLC. All rights reserved. Dubai & Abu Dhabi, United Arab Emirates.</p>
      </footer>
    </div>
  );
}
