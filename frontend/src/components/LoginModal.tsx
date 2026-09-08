import React, { useState, useEffect } from "react";
import { 
  X, 
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
  Check
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { auth } from "../lib/firebase";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: "login" | "signup" | "retailer";
  onLoginSuccess?: (user: {
    email: string;
    companyName: string;
    taxId: string;
  }) => void;
}

/**
 * Translate Firebase error codes into clean, professional B2B user messages
 * Never leaks internal technical database, IndexedDB, or server details to the user.
 */
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
      return "The email or password is incorrect. (If you registered using Google, please use 'Continue with Google')";
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
      return "Unable to connect to authentication servers. Please check your internet connection and try again.";
    case "auth/popup-blocked":
      return "The Google sign-in window was blocked by your browser. Please allow pop-ups and try again.";
    case "auth/unauthorized-domain":
      return "This domain is not authorized for Google Sign-In in Firebase Console. Please sign in with email and password.";
    case "auth/operation-not-allowed":
      return "This sign-in method is currently disabled. Please contact support or use email sign-in.";
    case "auth/too-many-requests":
      return "Access temporarily suspended due to multiple failed attempts. Please try again later or reset your password.";
    case "auth/popup-closed-by-user":
    case "auth/cancelled-popup-request":
      return "";
  }

  // Filter out internal database, IndexedDB, or closing/hidden browser errors
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

  return "The email or password is incorrect. Please verify your credentials and try again.";
}

export default function LoginModal({ 
  isOpen, 
  onClose, 
  initialMode = "login", 
  onLoginSuccess 
}: LoginModalProps) {
  const { user, loginWithEmail, signUpWithEmail, loginWithGoogle, sendPasswordReset } = useAuth();
  
  const [activeTab, setActiveTab] = useState<"login" | "signup" | "forgot">(
    initialMode === "signup" ? "signup" : "login"
  );
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [authError, setAuthError] = useState("");
  const [resetSent, setResetSent] = useState(false);

  // Auto-close and trigger success if user authenticated
  useEffect(() => {
    if (user && isOpen && isSubmitting) {
      setShowSuccess(true);
      setSuccessMessage("Authenticated successfully!");
      const timer = setTimeout(() => {
        if (onLoginSuccess) {
          onLoginSuccess({
            email: user.email || email,
            companyName: user.displayName || "Google Account",
            taxId: "",
          });
        }
        setShowSuccess(false);
        setIsSubmitting(false);
        onClose();
      }, 600);
      return () => clearTimeout(timer);
    }
  }, [user, isOpen, isSubmitting, email, onLoginSuccess, onClose]);

  // Reset form states when modal opens or initialMode changes
  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialMode === "signup" ? "signup" : "login");
      setAuthError("");
      setEmail("");
      setPassword("");
      setFullName("");
      setShowPassword(false);
      setResetSent(false);
      setShowSuccess(false);
      setIsSubmitting(false);
    }
  }, [isOpen, initialMode]);

  // Close modal on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen && !isSubmitting) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isSubmitting, onClose]);

  if (!isOpen) return null;

  const handleGoogleSignIn = async () => {
    try {
      setIsSubmitting(true);
      setAuthError("");
      await loginWithGoogle();
      setSuccessMessage("Authenticated with Google successfully!");
      setShowSuccess(true);
      setTimeout(() => {
        if (onLoginSuccess) {
          onLoginSuccess({
            email: auth.currentUser?.email || email,
            companyName: auth.currentUser?.displayName || "Google Account",
            taxId: "",
          });
        }
        setShowSuccess(false);
        setIsSubmitting(false);
        onClose();
      }, 600);
    } catch (err: any) {
      // If Firebase Auth actually succeeded on the backend or in currentUser
      if (auth.currentUser) {
        setSuccessMessage("Authenticated with Google successfully!");
        setShowSuccess(true);
        setTimeout(() => {
          if (onLoginSuccess) {
            onLoginSuccess({
              email: auth.currentUser?.email || email,
              companyName: auth.currentUser?.displayName || "Google Account",
              taxId: "",
            });
          }
          setShowSuccess(false);
          setIsSubmitting(false);
          onClose();
        }, 600);
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

    // Forgot Password Flow
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
      } catch (err: any) {
        console.warn("[Auth Debug]", {
          operation: "password-reset",
          code: err?.code || "unknown",
          message: err?.message || String(err),
        });
        setIsSubmitting(false);
        setAuthError(mapFirebaseAuthError(err));
      }
      return;
    }

    // Validation
    if (!email.trim() || !password) {
      setAuthError("Please enter both your email address and password.");
      return;
    }

    if (activeTab === "signup" && !fullName.trim()) {
      setAuthError("Please enter your full name.");
      return;
    }

    if (activeTab === "signup" && password.length < 6) {
      setAuthError("Password must be at least 6 characters long.");
      return;
    }

    setIsSubmitting(true);

    try {
      if (activeTab === "signup") {
        await signUpWithEmail(email.trim(), password, fullName.trim() || "Valued User");
        setSuccessMessage("Account created successfully!");
      } else {
        await loginWithEmail(email.trim(), password);
        setSuccessMessage("Signed in successfully!");
      }

      setShowSuccess(true);
      setTimeout(() => {
        if (onLoginSuccess) {
          onLoginSuccess({
            email: email.trim(),
            companyName: fullName.trim() ? `${fullName.trim()}'s Account` : "Commercial Account",
            taxId: "",
          });
        }
        setShowSuccess(false);
        setIsSubmitting(false);
        onClose();
      }, 700);
    } catch (err: any) {
      console.warn("[Auth Debug]", {
        operation: activeTab === "signup" ? "email-signup" : "email-login",
        code: err?.code || "unknown",
        message: err?.message || String(err),
      });
      setIsSubmitting(false);
      setAuthError(mapFirebaseAuthError(err));
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-modal-title"
    >
      <div className="w-full max-w-[440px] bg-white rounded-2xl shadow-2xl border border-slate-200/90 overflow-hidden flex flex-col relative max-h-[92vh]">
        
        {/* Top Header Bar */}
        <div className="pt-6 px-6 pb-4 border-b border-slate-100 bg-white relative">
          
          {/* Brand Tag & Close Button */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-cyan-500"></span>
              <span className="text-[10px] font-black uppercase tracking-wider text-[#031b4e]">
                Cool Technologies Portal
              </span>
            </div>
            
            <button 
              onClick={onClose}
              disabled={isSubmitting}
              className="w-8 h-8 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center transition-colors cursor-pointer disabled:opacity-40"
              aria-label="Close authentication modal"
            >
              <X size={18} />
            </button>
          </div>

          {/* Dynamic Header Titles */}
          <h2 id="auth-modal-title" className="text-xl sm:text-2xl font-black text-[#031b4e] tracking-tight">
            {activeTab === "login" && "Welcome Back"}
            {activeTab === "signup" && "Create Your Account"}
            {activeTab === "forgot" && "Reset Your Password"}
          </h2>
          <p className="text-xs text-slate-500 mt-1 font-medium leading-relaxed">
            {activeTab === "login" && "Sign in to manage HVAC equipment orders, quotation RFQs & catalog access."}
            {activeTab === "signup" && "Join Cool Technologies for direct equipment sourcing, project RFQs & B2B procurement."}
            {activeTab === "forgot" && "Enter your registered email and we'll send a secure password reset link."}
          </p>

          {/* Segmented Mode Switcher (Login / Sign Up) */}
          {activeTab !== "forgot" ? (
            <div className="grid grid-cols-2 gap-1 mt-5 bg-slate-100/90 p-1 rounded-xl border border-slate-200/70">
              <button
                type="button"
                onClick={() => { setActiveTab("login"); setAuthError(""); }}
                className={`py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  activeTab === "login"
                    ? "bg-white text-[#031b4e] shadow-xs border border-slate-200/50"
                    : "text-slate-500 hover:text-slate-900"
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => { setActiveTab("signup"); setAuthError(""); }}
                className={`py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  activeTab === "signup"
                    ? "bg-white text-[#031b4e] shadow-xs border border-slate-200/50"
                    : "text-slate-500 hover:text-slate-900"
                }`}
              >
                Create Account
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => { setActiveTab("login"); setAuthError(""); setResetSent(false); }}
              className="mt-4 text-xs font-bold text-[#0f4c81] hover:text-blue-900 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <ArrowLeft size={14} />
              <span>Back to Sign In</span>
            </button>
          )}
        </div>

        {/* Modal Form Body */}
        <div className="p-6 overflow-y-auto">
          {showSuccess ? (
            <div className="py-8 text-center flex flex-col items-center justify-center space-y-3 animate-in zoom-in-95 duration-200">
              <div className="w-14 h-14 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-200 shadow-xs">
                <CheckCircle2 size={30} />
              </div>
              <h4 className="font-extrabold text-slate-900 text-lg">
                {successMessage || "Authenticated Successfully"}
              </h4>
              <p className="text-xs text-slate-500 font-medium max-w-xs leading-relaxed">
                Loading your commercial workspace and catalog profile...
              </p>
            </div>
          ) : resetSent ? (
            <div className="py-6 text-center flex flex-col items-center justify-center space-y-3 animate-in zoom-in-95 duration-200">
              <div className="w-14 h-14 rounded-full bg-blue-50 text-[#031b4e] flex items-center justify-center border border-blue-200 shadow-xs">
                <KeyRound size={28} />
              </div>
              <h4 className="font-extrabold text-slate-900 text-lg">
                Reset Link Dispatched
              </h4>
              <p className="text-xs text-slate-600 font-medium max-w-xs leading-relaxed">
                We've sent a secure password reset link to <span className="font-bold text-slate-900">{email}</span>. Please check your inbox and spam folder.
              </p>
              <button
                type="button"
                onClick={() => { setActiveTab("login"); setResetSent(false); }}
                className="mt-4 px-6 py-2.5 bg-[#031b4e] hover:bg-blue-900 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                Return to Sign In
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              
              {/* Alert Feedback Banner */}
              {authError && (
                <div className="p-3.5 rounded-xl bg-red-50/90 border border-red-200 text-red-700 text-xs font-medium flex items-start gap-2.5 animate-in fade-in duration-150" role="alert">
                  <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                  <div className="flex-1 leading-snug">{authError}</div>
                </div>
              )}

              {/* 1. Continue with Google Button */}
              {activeTab !== "forgot" && (
                <>
                  <button
                    type="button"
                    onClick={handleGoogleSignIn}
                    disabled={isSubmitting}
                    className="w-full py-2.5 px-4 bg-white hover:bg-slate-50 active:bg-slate-100 border border-slate-200 text-slate-700 font-bold text-xs rounded-xl flex items-center justify-center gap-2.5 shadow-2xs hover:border-slate-300 hover:shadow-xs transition-all cursor-pointer disabled:opacity-50"
                  >
                    <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                    </svg>
                    <span>
                      {activeTab === "signup" ? "Sign up with Google" : "Continue with Google"}
                    </span>
                  </button>

                  {/* Clean Form Divider */}
                  <div className="relative flex items-center justify-center my-3">
                    <div className="border-t border-slate-200/90 w-full" />
                    <span className="bg-white px-3 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider shrink-0">
                      Or continue with email
                    </span>
                    <div className="border-t border-slate-200/90 w-full" />
                  </div>
                </>
              )}

              {/* Form Fields */}
              <form onSubmit={handleSubmit} className="space-y-3.5">
                
                {/* Full Name (Sign Up only) */}
                {activeTab === "signup" && (
                  <div>
                    <label htmlFor="auth-fullname" className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <User size={15} className="absolute left-3.5 top-3 text-slate-400 pointer-events-none" />
                      <input 
                        id="auth-fullname"
                        type="text"
                        required
                        autoComplete="name"
                        value={fullName}
                        onChange={(e) => { setFullName(e.target.value); setAuthError(""); }}
                        className="w-full pl-10 pr-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#031b4e]/15 focus:border-[#031b4e] transition-all"
                        placeholder="e.g. David Steve"
                      />
                    </div>
                  </div>
                )}

                {/* Email Address */}
                <div>
                  <label htmlFor="auth-email" className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Work / Business Email <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Mail size={15} className="absolute left-3.5 top-3 text-slate-400 pointer-events-none" />
                    <input 
                      id="auth-email"
                      type="email"
                      required
                      autoComplete="email"
                      value={email}
                      onChange={(e) => { setEmail(e.target.value); setAuthError(""); }}
                      className="w-full pl-10 pr-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#031b4e]/15 focus:border-[#031b4e] transition-all"
                      placeholder="name@company.com"
                    />
                  </div>
                </div>

                {/* Password Field (Login & Sign Up) */}
                {activeTab !== "forgot" && (
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label htmlFor="auth-password" className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                        Password <span className="text-red-500">*</span>
                      </label>
                      {activeTab === "login" && (
                        <button
                          type="button"
                          onClick={() => { setActiveTab("forgot"); setAuthError(""); }}
                          className="text-[11px] font-bold text-[#0f4c81] hover:text-blue-900 transition-colors cursor-pointer"
                        >
                          Forgot password?
                        </button>
                      )}
                    </div>
                    
                    <div className="relative">
                      <Lock size={15} className="absolute left-3.5 top-3 text-slate-400 pointer-events-none" />
                      <input 
                        id="auth-password"
                        type={showPassword ? "text" : "password"}
                        required
                        autoComplete={activeTab === "signup" ? "new-password" : "current-password"}
                        value={password}
                        onChange={(e) => { setPassword(e.target.value); setAuthError(""); }}
                        className="w-full pl-10 pr-10 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#031b4e]/15 focus:border-[#031b4e] transition-all"
                        placeholder="••••••••"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-2.5 p-0.5 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                        aria-label={showPassword ? "Hide password" : "Show password"}
                      >
                        {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                    </div>

                    {/* Password Requirement Hint on Signup */}
                    {activeTab === "signup" && (
                      <div className="mt-1.5 flex items-center gap-1.5 text-[11px]">
                        <span className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[9px] ${
                          password.length >= 6 ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-400"
                        }`}>
                          <Check size={10} />
                        </span>
                        <span className={password.length >= 6 ? "text-emerald-700 font-semibold" : "text-slate-400 font-medium"}>
                          Minimum 6 characters
                        </span>
                      </div>
                    )}
                  </div>
                )}

                {/* Primary Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full mt-2 py-3 px-4 bg-[#031b4e] hover:bg-[#072a74] active:bg-[#021338] text-white font-extrabold text-xs rounded-xl shadow-xs hover:shadow-md transition-all cursor-pointer flex items-center justify-center gap-2 tracking-wider uppercase disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Processing...</span>
                    </>
                  ) : (
                    <>
                      <span>
                        {activeTab === "signup"
                          ? "Create B2B Account"
                          : activeTab === "forgot"
                          ? "Send Password Reset Link"
                          : "Sign In to Account"}
                      </span>
                      <ArrowRight size={14} />
                    </>
                  )}
                </button>

                {/* Footnote / Switch Prompt */}
                <div className="pt-2 text-center">
                  {activeTab === "login" ? (
                    <p className="text-xs text-slate-500 font-medium">
                      Don't have an account yet?{" "}
                      <button
                        type="button"
                        onClick={() => { setActiveTab("signup"); setAuthError(""); }}
                        className="text-[#031b4e] hover:text-blue-700 font-extrabold cursor-pointer hover:underline"
                      >
                        Create an account
                      </button>
                    </p>
                  ) : activeTab === "signup" ? (
                    <p className="text-xs text-slate-500 font-medium">
                      Already have an account?{" "}
                      <button
                        type="button"
                        onClick={() => { setActiveTab("login"); setAuthError(""); }}
                        className="text-[#031b4e] hover:text-blue-700 font-extrabold cursor-pointer hover:underline"
                      >
                        Sign In here
                      </button>
                    </p>
                  ) : null}
                </div>

              </form>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
