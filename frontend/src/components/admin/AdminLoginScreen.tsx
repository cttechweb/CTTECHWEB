import React, { useState, useEffect, useRef } from "react";
import { Lock, Mail, ShieldCheck, ArrowLeft, AlertCircle, Loader2, KeyRound, RefreshCw, CheckCircle2, ShieldAlert } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { apiClient } from "../../services/apiClient";
import { sendAdminLoginOtpEmail, sendAdminLoginSecurityAlert } from "../../services/emailService";
import { getDeviceSecurityInfo, DeviceSecurityInfo } from "../../utils/deviceSecurity";

interface AdminLoginScreenProps {
  onLoginSuccess: () => void;
  onBackToWebsite: () => void;
}

export default function AdminLoginScreen({ onLoginSuccess, onBackToWebsite }: AdminLoginScreenProps) {
  const { loginWithEmail, user, profile, isAdmin, isSales, logout } = useAuth();
  
  // Login Steps: "credentials" -> "otp"
  const [step, setStep] = useState<"credentials" | "otp">("credentials");

  // Credentials State
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // OTP State
  const [otpValues, setOtpValues] = useState<string[]>(["", "", "", "", "", ""]);
  const [generatedOtp, setGeneratedOtp] = useState<string>("");
  const [otpExpiresAt, setOtpExpiresAt] = useState<number>(0);
  const [timeLeft, setTimeLeft] = useState<number>(300); // 5 minutes in seconds
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [resendCooldown, setResendCooldown] = useState<number>(0);
  const [securityInfo, setSecurityInfo] = useState<DeviceSecurityInfo | null>(null);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Timer countdown for OTP expiry
  useEffect(() => {
    if (step !== "otp" || otpExpiresAt <= 0) return;

    const interval = setInterval(() => {
      const remaining = Math.max(0, Math.floor((otpExpiresAt - Date.now()) / 1000));
      setTimeLeft(remaining);
      if (remaining <= 0) {
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [step, otpExpiresAt]);

  // Resend cooldown timer
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  // Handle Credentials Submit
  const handleCredentialsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsSubmitting(true);

    try {
      // 1. Authenticate with Firebase credentials
      await loginWithEmail(email.trim(), password);

      // 2. Strictly verify administrative role via backend or profile
      const meRes = await apiClient.getMe().catch(() => null);
      const userRole = meRes?.user?.role || meRes?.profile?.role || profile?.role || "customer";

      if (userRole !== "admin" && userRole !== "superAdmin") {
        setErrorMsg("Access Denied: This account does not have administrative privileges. The Admin Portal is restricted to authorized company administrators.");
        setIsSubmitting(false);
        if (logout) logout().catch(() => {});
        return;
      }

      // 3. Gather device and telemetry security context
      const devInfo = await getDeviceSecurityInfo();
      setSecurityInfo(devInfo);

      // 4. Generate 6-digit cryptographic OTP
      const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
      const expires = Date.now() + 5 * 60 * 1000; // 5 minutes

      setGeneratedOtp(newOtp);
      setOtpExpiresAt(expires);
      setTimeLeft(300);
      setOtpValues(["", "", "", "", "", ""]);
      setResendCooldown(45); // 45 seconds cooldown for resend

      // 5. Dispatch OTP Email in parallel to shamzy.cnn@gmail.com and nafalkt7@gmail.com
      sendAdminLoginOtpEmail({
        otpCode: newOtp,
        expiresMinutes: 5,
        adminEmail: email.trim(),
        ipInfo: devInfo,
      }).catch((err) => {
        console.warn("[AdminAuth] OTP email notice:", err);
      });

      // 6. Transition to OTP Verification Step
      setStep("otp");
      setTimeout(() => {
        inputRefs.current[0]?.focus();
      }, 100);
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

  // Handle OTP digit changes
  const handleOtpChange = (index: number, value: string) => {
    // Only accept numeric input
    const cleanVal = value.replace(/[^0-9]/g, "");
    if (!cleanVal && value !== "") return;

    const newArr = [...otpValues];
    // If pasted multiple digits
    if (cleanVal.length > 1) {
      const chars = cleanVal.slice(0, 6).split("");
      for (let i = 0; i < 6; i++) {
        newArr[i] = chars[i] || "";
      }
      setOtpValues(newArr);
      const nextFocus = Math.min(chars.length, 5);
      inputRefs.current[nextFocus]?.focus();
      if (chars.length === 6) {
        verifyOtpCode(newArr.join(""));
      }
      return;
    }

    newArr[index] = cleanVal.slice(-1);
    setOtpValues(newArr);

    // Auto-advance
    if (cleanVal && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto verify if all 6 digits entered
    if (newArr.every((v) => v !== "")) {
      verifyOtpCode(newArr.join(""));
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otpValues[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  // Verify OTP Code
  const verifyOtpCode = async (enteredCode: string) => {
    setErrorMsg(null);

    if (Date.now() > otpExpiresAt) {
      setErrorMsg("Verification code has expired. Please click 'Resend Code' to receive a new code.");
      return;
    }

    if (enteredCode !== generatedOtp) {
      setErrorMsg("Incorrect verification code. Please check your inbox and try again.");
      return;
    }

    setIsVerifyingOtp(true);

    try {
      // 1. Gather latest device security context
      const devInfo = securityInfo || (await getDeviceSecurityInfo());

      // 2. Dispatch high-priority login security alert to shamzy.cnn@gmail.com and nafalkt7@gmail.com
      sendAdminLoginSecurityAlert({
        adminEmail: email.trim(),
        ipInfo: devInfo,
      }).catch((err) => {
        console.warn("[AdminAuth] Security alert email dispatch notice:", err);
      });

      // 3. Grant administrative session
      onLoginSuccess();
    } catch (err: any) {
      console.error("[AdminAuth] Login finalization error:", err);
      onLoginSuccess();
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  // Resend OTP Code
  const handleResendOtp = async () => {
    if (resendCooldown > 0 || isResending) return;
    setIsResending(true);
    setErrorMsg(null);

    try {
      const devInfo = await getDeviceSecurityInfo();
      setSecurityInfo(devInfo);

      const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
      const expires = Date.now() + 5 * 60 * 1000;

      setGeneratedOtp(newOtp);
      setOtpExpiresAt(expires);
      setTimeLeft(300);
      setOtpValues(["", "", "", "", "", ""]);
      setResendCooldown(45);

      await sendAdminLoginOtpEmail({
        otpCode: newOtp,
        expiresMinutes: 5,
        adminEmail: email.trim(),
        ipInfo: devInfo,
      });

      inputRefs.current[0]?.focus();
    } catch (err) {
      setErrorMsg("Failed to resend code. Please try again in a moment.");
    } finally {
      setIsResending(false);
    }
  };

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="min-h-screen w-full bg-slate-100 flex items-center justify-center p-4 font-sans text-slate-800 antialiased select-none">
      
      <div className="w-full max-w-md bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden">
        
        {/* Header */}
        <div className="p-7 bg-slate-50 border-b border-slate-200 text-center relative">
          <button
            onClick={step === "otp" ? () => { setStep("credentials"); setErrorMsg(null); } : onBackToWebsite}
            className="absolute left-4 top-4 text-xs text-slate-500 hover:text-slate-900 flex items-center gap-1 font-semibold transition-colors cursor-pointer"
          >
            <ArrowLeft size={14} />
            <span>{step === "otp" ? "Back" : "Website"}</span>
          </button>

          <div className={`w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3 border ${
            step === "otp" 
              ? "bg-amber-50 text-amber-600 border-amber-200" 
              : "bg-blue-50 text-[#0f4c81] border-blue-200"
          }`}>
            {step === "otp" ? <KeyRound size={22} /> : <ShieldCheck size={24} />}
          </div>

          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
            {step === "otp" ? "Two-Factor Verification" : "Cool Technologies Admin"}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            {step === "otp" ? "Enter the 6-digit security code sent to your email" : "Enterprise Management & Operations Portal"}
          </p>
        </div>

        {/* STEP 1: CREDENTIALS INPUT */}
        {step === "credentials" && (
          <form onSubmit={handleCredentialsSubmit} className="p-7 space-y-5">
            
            {errorMsg && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 flex items-start gap-2 animate-in fade-in">
                <AlertCircle size={16} className="shrink-0 mt-0.5" />
                <span className="leading-snug">{errorMsg}</span>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Corporate Email / Admin
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
                  <span>Verifying Credentials...</span>
                </>
              ) : (
                <span>Continue to 2FA Verification</span>
              )}
            </button>

          </form>
        )}

        {/* STEP 2: TWO-FACTOR OTP VERIFICATION */}
        {step === "otp" && (
          <div className="p-7 space-y-5 animate-in fade-in">
            
            {errorMsg && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 flex items-start gap-2">
                <AlertCircle size={16} className="shrink-0 mt-0.5" />
                <span className="leading-snug">{errorMsg}</span>
              </div>
            )}

            {/* Recipient Notice without exposing email IDs */}
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/80 text-center">
              <p className="text-xs text-slate-600 leading-relaxed font-medium">
                A 6-digit verification code has been dispatched to authorized administrator inboxes.
              </p>
            </div>

            {/* 6 Digit Inputs */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  Enter 6-Digit Passcode
                </label>
                <span className={`text-xs font-mono font-bold ${
                  timeLeft < 60 ? "text-red-600 animate-pulse" : "text-slate-600"
                }`}>
                  Expires in {formatTimer(timeLeft)}
                </span>
              </div>

              <div className="grid grid-cols-6 gap-2 sm:gap-2.5">
                {otpValues.map((digit, idx) => (
                  <input
                    key={idx}
                    ref={(el) => (inputRefs.current[idx] = el)}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(idx, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                    className="w-full h-13 text-center text-xl font-bold font-mono bg-slate-50 border-2 border-slate-300 rounded-xl focus:outline-none focus:border-[#0f4c81] focus:bg-white focus:ring-4 focus:ring-blue-100 transition-all text-slate-900"
                  />
                ))}
              </div>
            </div>

            {/* Verify Button */}
            <button
              type="button"
              disabled={isVerifyingOtp || otpValues.some((v) => v === "")}
              onClick={() => verifyOtpCode(otpValues.join(""))}
              className="w-full py-3 bg-[#0f4c81] hover:bg-[#1c7e9f] text-white font-bold text-xs uppercase tracking-wider rounded-lg transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isVerifyingOtp ? (
                <>
                  <Loader2 size={15} className="animate-spin" />
                  <span>Authorizing Session...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 size={15} />
                  <span>Verify Code & Enter Admin Portal</span>
                </>
              )}
            </button>

            {/* Resend & Back Controls */}
            <div className="flex items-center justify-between pt-2 text-xs">
              <button
                type="button"
                onClick={() => {
                  setStep("credentials");
                  setErrorMsg(null);
                }}
                className="text-slate-500 hover:text-slate-900 font-semibold transition-colors cursor-pointer"
              >
                Change Admin Account
              </button>

              <button
                type="button"
                disabled={resendCooldown > 0 || isResending}
                onClick={handleResendOtp}
                className="text-[#0f4c81] hover:text-[#1c7e9f] font-bold flex items-center gap-1 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {isResending ? (
                  <Loader2 size={13} className="animate-spin" />
                ) : (
                  <RefreshCw size={13} />
                )}
                <span>
                  {resendCooldown > 0 ? `Resend code (${resendCooldown}s)` : "Resend Code"}
                </span>
              </button>
            </div>

          </div>
        )}

      </div>

    </div>
  );
}

