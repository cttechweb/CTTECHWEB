import React, { useState } from "react";
import { Lock, Mail, ShieldCheck, ArrowLeft, AlertCircle, Loader2 } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { apiClient } from "../../services/apiClient";

interface AdminLoginScreenProps {
  onLoginSuccess: () => void;
  onBackToWebsite: () => void;
}

export default function AdminLoginScreen({ onLoginSuccess, onBackToWebsite }: AdminLoginScreenProps) {
  const { loginWithEmail, user, profile, isAdmin, isSales, logout } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsSubmitting(true);

    try {
      // 1. Authenticate with Firebase credentials
      const res = await loginWithEmail(email.trim(), password);

      // 2. Fetch authenticated profile from Cloudflare D1 to strictly verify administrator role
      const meRes = await apiClient.getMe().catch(() => null);
      const userRole = meRes?.user?.role || meRes?.profile?.role || profile?.role || "customer";

      if (userRole !== "admin" && userRole !== "superAdmin") {
        setErrorMsg("Access Denied: This account does not have administrative privileges. The Admin Portal is restricted to authorized company administrators.");
        setIsSubmitting(false);
        return;
      }

      onLoginSuccess();
    } catch (err: any) {
      console.warn("Admin sign-in notice:", err);
      const rawMsg = (err?.message || "").toLowerCase();
      if (rawMsg.includes("wrong-password") || rawMsg.includes("invalid-credential") || rawMsg.includes("user-not-found")) {
        setErrorMsg("Incorrect administrative email or password. Please verify your credentials.");
      } else if (rawMsg.includes("network") || rawMsg.includes("fetch")) {
        setErrorMsg("Network connection error. Please verify your internet connection and try again.");
      } else {
        setErrorMsg("Invalid administrative credentials. Please verify your email and password.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-slate-100 flex items-center justify-center p-4 font-sans text-slate-800 antialiased select-none">
      
      <div className="w-full max-w-md bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden">
        
        {/* Header */}
        <div className="p-8 bg-slate-50 border-b border-slate-200 text-center relative">
          <button
            onClick={onBackToWebsite}
            className="absolute left-4 top-4 text-xs text-slate-500 hover:text-slate-900 flex items-center gap-1 font-semibold transition-colors cursor-pointer"
          >
            <ArrowLeft size={14} />
            <span>Website</span>
          </button>

          <div className="w-12 h-12 rounded-xl bg-blue-50 text-[#0f4c81] border border-blue-200 flex items-center justify-center mx-auto mb-3">
            <ShieldCheck size={24} />
          </div>

          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
            Cool Technologies Admin
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Enterprise Management & Sourcing Portal
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="p-8 space-y-5">
          
          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 flex items-start gap-2">
              <AlertCircle size={16} className="shrink-0 mt-0.5" />
              <span className="leading-snug">{errorMsg}</span>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Corporate Email / User
            </label>
            <div className="relative">
              <Mail size={15} className="absolute left-3.5 top-3 text-slate-400" />
              <input
                type="email"
                required
                placeholder="admin@cooltech.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#0f4c81] focus:bg-white transition-colors"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Password
            </label>
            <div className="relative">
              <Lock size={15} className="absolute left-3.5 top-3 text-slate-400" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#0f4c81] focus:bg-white transition-colors"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-2.5 bg-[#0f4c81] hover:bg-[#1c7e9f] text-white font-bold text-xs uppercase tracking-wider rounded-lg transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer mt-2 disabled:opacity-60"
          >
            {isSubmitting ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                <span>Authenticating Admin...</span>
              </>
            ) : (
              <span>Sign In to Admin Portal</span>
            )}
          </button>

          <div className="pt-4 border-t border-slate-100 text-center">
            <p className="text-[11px] text-slate-400">
              Authorized access only. Unauthorized administrative access attempts are strictly monitored.
            </p>
          </div>

        </form>

      </div>

    </div>
  );
}
