import React, { useState } from "react";
import { Workflow, Product, ServiceItem } from "../../types";
import SmartSelectionBuilder from "./SmartSelectionBuilder";
import { GitBranch, Copy, Check, Shield, ArrowLeft, Globe, Lock, Key } from "lucide-react";
import { copyTextToClipboard } from "../../utils/clipboard";

interface SalesBuilderPageProps {
  workflows: Workflow[];
  products: Product[];
  services: ServiceItem[];
  onAddWorkflow: (workflow: Workflow) => void;
  onUpdateWorkflow: (workflow: Workflow) => void;
  onDeleteWorkflow: (workflowId: string) => void;
  onResetDefaultWorkflows?: () => void;
  onBackToWebsite: () => void;
  onShowToast?: (msg: string) => void;
}

const CLIENT_PIN = "uae2026"; // Default passcode for UAE client access

export default function SalesBuilderPage({
  workflows,
  products,
  services,
  onAddWorkflow,
  onUpdateWorkflow,
  onDeleteWorkflow,
  onResetDefaultWorkflows,
  onBackToWebsite,
  onShowToast
}: SalesBuilderPageProps) {
  const [copied, setCopied] = useState(false);
  const [inputPin, setInputPin] = useState("");
  const [showPinError, setShowPinError] = useState(false);
  const [isUnlocked, setIsUnlocked] = useState(() => {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get("key") === CLIENT_PIN) return true;
      return sessionStorage.getItem("cooltech_client_portal_unlocked") === "true";
    } catch {
      return false;
    }
  });

  const shareableUrl = `${window.location.origin}${window.location.pathname}#/builder?key=${CLIENT_PIN}`;

  const handleCopyLink = async () => {
    const success = await copyTextToClipboard(shareableUrl);
    if (success) {
      setCopied(true);
      if (onShowToast) onShowToast("Secured client link copied! 📋");
      setTimeout(() => setCopied(false), 3000);
    }
  };

  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputPin.trim().toLowerCase() === CLIENT_PIN) {
      setIsUnlocked(true);
      setShowPinError(false);
      try {
        sessionStorage.setItem("cooltech_client_portal_unlocked", "true");
      } catch {}
      if (onShowToast) onShowToast("Access Granted — Welcome to the Client Portal.");
    } else {
      setShowPinError(true);
    }
  };

  /* Lock Screen for Client Security */
  if (!isUnlocked) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-900 flex items-center justify-center p-6 font-sans">
        <div className="bg-white border border-slate-200 rounded-3xl p-8 max-w-md w-full shadow-xl space-y-6 text-center relative overflow-hidden">
          
          <div className="w-14 h-14 rounded-2xl bg-blue-50 border border-blue-200 text-blue-700 flex items-center justify-center mx-auto shadow-sm">
            <Lock size={26} />
          </div>

          <div>
            <span className="text-[10px] font-black uppercase tracking-widest bg-blue-50 text-blue-700 px-3 py-1 rounded-full border border-blue-200">
              Cool Technologies • Client Portal
            </span>
            <h2 className="text-xl font-extrabold text-slate-900 mt-3">Workflow Builder Authentication</h2>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed">
              Enter your project access passcode to build and manage flowchart decision trees.
            </p>
          </div>

          <form onSubmit={handlePinSubmit} className="space-y-4 text-left">
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                Passcode / Security Key
              </label>
              <div className="relative">
                <Key size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="password"
                  placeholder="Enter passcode (e.g. uae2026)"
                  value={inputPin}
                  onChange={(e) => {
                    setInputPin(e.target.value);
                    setShowPinError(false);
                  }}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-xs font-semibold focus:border-blue-600 focus:bg-white focus:outline-none transition-colors"
                  autoFocus
                />
              </div>
              {showPinError && (
                <p className="text-rose-600 text-[11px] font-semibold mt-1.5">
                  Incorrect passcode. Please check with your project administrator.
                </p>
              )}
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-md transition-colors cursor-pointer"
            >
              Unlock Portal
            </button>
          </form>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 font-semibold">
            <button onClick={onBackToWebsite} className="hover:text-slate-900 flex items-center gap-1">
              <ArrowLeft size={12} /> Return to Storefront
            </button>
            <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded border border-slate-200">PIN: uae2026</span>
          </div>

        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans antialiased text-slate-900">
      
      {/* ── Corporate Clean White Header ── */}
      <header className="bg-white px-6 py-3.5 border-b border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 sticky top-0 z-40 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold shadow-xs">
            <GitBranch size={18} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-extrabold text-base tracking-tight text-slate-900">Cool Technologies</h1>
              <span className="text-slate-300">|</span>
              <span className="text-xs font-semibold text-slate-600">Sales & Client Workflow Portal</span>
              <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold uppercase px-2 py-0.5 rounded-full flex items-center gap-1">
                <Shield size={10} /> Authenticated
              </span>
            </div>
          </div>
        </div>

        {/* Shareable Link Box & Exit */}
        <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
          <div className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 flex items-center gap-2 text-xs">
            <Globe size={13} className="text-slate-500 shrink-0" />
            <span className="text-slate-500 font-medium hidden md:inline">Share URL:</span>
            <code className="text-slate-800 font-mono text-[11px] truncate max-w-[180px] sm:max-w-[240px]">
              {shareableUrl}
            </code>
            <button
              onClick={handleCopyLink}
              className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-white font-bold text-[10px] rounded-lg flex items-center gap-1 transition-colors cursor-pointer shrink-0"
            >
              {copied ? <><Check size={11} /> Copied</> : <><Copy size={11} /> Copy Link</>}
            </button>
          </div>

          <button
            onClick={onBackToWebsite}
            className="px-3.5 py-1.5 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors border border-slate-200 cursor-pointer shrink-0 shadow-2xs"
          >
            <ArrowLeft size={13} /> Storefront
          </button>
        </div>
      </header>

      {/* ── Main Content Area ── */}
      <main className="flex-1 p-4 sm:p-6 max-w-[1800px] w-full mx-auto space-y-4">
        
        {/* Banner Info */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 flex items-center justify-between gap-4 text-xs shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-800 border border-slate-200 flex items-center justify-center shrink-0">
              <GitBranch size={16} />
            </div>
            <div>
              <p className="font-bold text-slate-900">Interactive Mind Map & Selection Decision Tree Editor</p>
              <p className="text-slate-500 text-[11px] mt-0.5">
                Drag nodes onto the white canvas below, connect answers with arrows, and click <strong>"Save & Publish"</strong>. All changes are stored directly in Cloudflare D1.
              </p>
            </div>
          </div>
          <div className="hidden lg:flex items-center gap-2 text-[11px] font-bold text-slate-600 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200 shrink-0">
            <span>Passcode Secured (uae2026)</span>
            <Lock size={12} />
          </div>
        </div>

        {/* Builder View */}
        <SmartSelectionBuilder
          workflows={workflows}
          products={products}
          services={services}
          onAddWorkflow={onAddWorkflow}
          onUpdateWorkflow={onUpdateWorkflow}
          onDeleteWorkflow={onDeleteWorkflow}
          onResetDefaultWorkflows={onResetDefaultWorkflows}
          onShowToast={onShowToast}
        />

      </main>

    </div>
  );
}
