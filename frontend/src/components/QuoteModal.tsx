import React, { useState, useEffect } from "react";
import { X, Send, CheckCircle2, ClipboardSignature, Calendar, Layers, MapPin, AlertCircle } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { createRfqRequest } from "../services/rfqService";
import { getOrCreateCompany } from "../services/companyService";
import { sendEmailNotification, EmailOrderItem } from "../services/emailService";
import { getLocalProductsCache } from "../services/productService";

interface QuoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  prefilledProduct?: string;
}

export default function QuoteModal({ isOpen, onClose, prefilledProduct }: QuoteModalProps) {
  const { user, profile } = useAuth();
  const [name, setName] = useState(profile?.name || "");
  const [email, setEmail] = useState(profile?.email || user?.email || "");
  const [company, setCompany] = useState(profile?.companyName || "");
  const [phone, setPhone] = useState(profile?.phone || "+971 50 ");
  const [projectLocation, setProjectLocation] = useState("Abu Dhabi, UAE");
  const [timeline, setTimeline] = useState("immediate");
  const [loadRequirements, setLoadRequirements] = useState("");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [quoteReference, setQuoteReference] = useState("");

  // Sync profile data if loaded
  useEffect(() => {
    if (profile) {
      if (!name && profile.name) setName(profile.name);
      if (!email && profile.email) setEmail(profile.email);
      if (!company && profile.companyName) setCompany(profile.companyName);
      if (!phone && profile.phone) setPhone(profile.phone);
    }
  }, [profile]);

  // Update notes if a product is prefilled
  useEffect(() => {
    if (prefilledProduct && isOpen) {
      setNotes(`Interested in acquiring wholesale pricing, lead times, and logistics terms for: ${prefilledProduct}`);
    } else if (isOpen && !notes) {
      setNotes("");
    }
  }, [prefilledProduct, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    setSubmitError(null);

    if (!name.trim() || !email.trim() || !company.trim() || !phone.trim() || !projectLocation.trim()) {
      setSubmitError("Please fill out all required fields marked with *.");
      return;
    }

    setIsSubmitting(true);

    try {
      // Build email product card if quote is for a specific product
      let matchedItems: EmailOrderItem[] | undefined;
      if (prefilledProduct) {
        const products = getLocalProductsCache();
        const found = products.find(
          (p) =>
            p.name.toLowerCase() === prefilledProduct.toLowerCase() ||
            p.id === prefilledProduct ||
            prefilledProduct.toLowerCase().includes(p.name.toLowerCase())
        );
        if (found) {
          matchedItems = [
            {
              productId: found.id,
              name: found.name,
              brand: found.brand,
              image: found.images?.[0] || found.image || "",
              quantity: 1,
              unitPrice: found.price || 0,
            },
          ];
        }
      }

      // Fire EmailJS notification IMMEDIATELY — does NOT depend on API/DB success
      sendEmailNotification({
        type: "rfq",
        title: `Quotation Request from ${name.trim()} - ${company.trim()}`,
        senderName: name.trim(),
        senderEmail: email.trim(),
        senderPhone: phone.trim(),
        companyName: company.trim(),
        subject: `[Cool Technologies] Quotation Request - ${company.trim() || name.trim()}`,
        message: notes.trim() || `Customer requested a formal B2B quotation for ${prefilledProduct || "HVAC Equipment"}.`,
        detailsText: `Client Name: ${name.trim()}\nCompany Name: ${company.trim()}\nEmail: ${email.trim()}\nPhone: ${phone.trim()}\nProject Location: ${projectLocation.trim()}\nDelivery Timeline: ${timeline}\nLoad Requirements: ${loadRequirements.trim() || "Standard"}\nRequested Item: ${prefilledProduct || "Custom Equipment Inquiries"}\nNotes: ${notes.trim() || "None"}`,
        orderItems: matchedItems,
        customParams: {
          product_name: prefilledProduct || "General RFQ",
          timeline: timeline,
          location: projectLocation.trim()
        }
      }).catch((emailErr) => {
        console.warn("[QuoteModal] Email notification dispatch error:", emailErr);
      });

      // Now persist to DB (best-effort — email was already sent above)
      let rfqNumber = `RFQ-${Date.now()}`;
      try {
        const comp = await getOrCreateCompany({
          name: company.trim(),
          email: email.trim(),
          phone: phone.trim(),
          address: projectLocation.trim(),
        });

        const createdRfq = await createRfqRequest({
          name: name.trim(),
          email: email.trim(),
          company: company.trim(),
          phone: phone.trim(),
          projectLocation: projectLocation.trim(),
          timeline,
          loadRequirements: loadRequirements.trim(),
          projectDescription: notes.trim(),
          products: prefilledProduct ? [{ productName: prefilledProduct, quantity: 1 }] : [],
          companyId: comp.id,
          userId: user?.uid || "",
        });
        rfqNumber = createdRfq.rfqNumber;
      } catch (apiErr) {
        console.warn("[QuoteModal] API persistence error (email was already sent):", apiErr);
      }

      setQuoteReference(rfqNumber);
      setIsSubmitting(false);
      setIsSuccess(true);
    } catch (err: any) {
      console.error("Error in QuoteModal submit:", err);
      setSubmitError("Failed to submit quotation request. Please verify your connection and try again.");
      setIsSubmitting(false);
    }
  };

  const handleCloseAndReset = () => {
    setLoadRequirements("");
    setNotes("");
    setSubmitError(null);
    setIsSuccess(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" 
        onClick={handleCloseAndReset}
        id="quote-modal-backdrop"
      ></div>

      {/* Positioner */}
      <div className="flex min-h-full items-center justify-center p-4 text-center">
        <div className="relative transform overflow-hidden rounded-2xl bg-white text-left shadow-2xl transition-all w-full max-w-2xl border border-gray-150">
          
          {/* Close button */}
          <button
            onClick={handleCloseAndReset}
            className="absolute top-4 right-4 text-gray-400 hover:text-slate-800 z-30 p-1.5 rounded-full hover:bg-gray-100 transition-colors cursor-pointer"
            id="close-quote-modal"
          >
            <X size={20} />
          </button>

          {/* Header area */}
          <div className="bg-[#2596be] text-white p-6 sm:p-7">
            <div className="flex items-center gap-3">
              <ClipboardSignature size={28} className="text-cyan-200 animate-pulse" />
              <div>
                <span className="bg-white/20 text-white text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded">
                  B2B Project RFQ
                </span>
                <h2 className="font-display font-extrabold text-lg sm:text-xl tracking-tight uppercase mt-1">
                  Request Commercial Quotation
                </h2>
                <p className="text-xs text-blue-50 mt-0.5">
                  Direct inquiry to regional HVAC mechanical estimators for customized project pricing.
                </p>
              </div>
            </div>
          </div>

          {/* Form Content / Success Panel */}
          <div className="p-6 sm:p-7">
            {!isSuccess ? (
              <form onSubmit={handleSubmit} className="flex flex-col gap-4 text-xs text-gray-700">
                
                {submitError && (
                  <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-xs text-red-700 flex items-start gap-2">
                    <AlertCircle size={15} className="shrink-0 mt-0.5" />
                    <span>{submitError}</span>
                  </div>
                )}

                {/* 2-Column Contact Info */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-extrabold text-gray-600 uppercase tracking-wider">
                      Contact Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Tariq Mansoori"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="border border-gray-300 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-[#2596be]"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-extrabold text-gray-600 uppercase tracking-wider">
                      Corporate Work Email *
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="procurement@company.ae"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="border border-gray-300 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-[#2596be]"
                    />
                  </div>
                </div>

                {/* Company & Phone */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-extrabold text-gray-600 uppercase tracking-wider">
                      Company / Contracting Entity *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Al Futtaim Engineering"
                      value={company}
                      onChange={(e) => setCompany(e.target.value)}
                      className="border border-gray-300 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-[#2596be]"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-extrabold text-gray-600 uppercase tracking-wider">
                      Telephone / WhatsApp *
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="+971 50 123 4567"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="border border-gray-300 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-[#2596be]"
                    />
                  </div>
                </div>

                {/* Project Location & Timelines */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-extrabold text-gray-600 uppercase tracking-wider flex items-center gap-1">
                      <MapPin size={12} className="text-gray-400" />
                      <span>Project Site / City Location *</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Saadiyat Island, Abu Dhabi"
                      value={projectLocation}
                      onChange={(e) => setProjectLocation(e.target.value)}
                      className="border border-gray-300 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-[#2596be]"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-extrabold text-gray-600 uppercase tracking-wider flex items-center gap-1">
                      <Calendar size={12} className="text-gray-400" />
                      <span>Required Fulfillment Timeline</span>
                    </label>
                    <select
                      value={timeline}
                      onChange={(e) => setTimeline(e.target.value)}
                      className="border border-gray-300 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-[#2596be] bg-white"
                    >
                      <option value="immediate">Immediate (Under 2 weeks)</option>
                      <option value="month">Within 30 Days</option>
                      <option value="quarter">Next Quarter (30-90 Days)</option>
                      <option value="tender">Budgetary Estimating / Tender Bid</option>
                    </select>
                  </div>
                </div>

                {/* Load Requirements / Specifications */}
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-extrabold text-gray-600 uppercase tracking-wider flex items-center gap-1">
                    <Layers size={12} className="text-gray-400" />
                    <span>Estimated Tonnage (TR) or Equipment Scope</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., 2x 150-Ton air-cooled chillers or VRF multi-zone package"
                    value={loadRequirements}
                    onChange={(e) => setLoadRequirements(e.target.value)}
                    className="border border-gray-300 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-[#2596be]"
                  />
                </div>

                {/* Prefilled or Custom Notes */}
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-extrabold text-gray-600 uppercase tracking-wider">
                    Detailed Notes & Specification Constraints
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Provide specific OEM model part numbers, electrical voltages, piping runs, or delivery dock requirements."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="border border-gray-300 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-[#2596be] resize-none"
                  />
                </div>

                {/* Submitting Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="mt-2 w-full py-3 bg-[#2596be] hover:bg-[#1c7e9f] text-white rounded-xl font-extrabold text-xs flex items-center justify-center gap-2 transition-colors disabled:bg-gray-400 shadow-md cursor-pointer uppercase tracking-wider"
                  id="submit-rfq-btn"
                >
                  <Send size={14} />
                  <span>{isSubmitting ? "Registering RFQ In Database..." : "Submit Formal Project RFQ"}</span>
                </button>

              </form>
            ) : (
              /* Success Panel */
              <div className="text-center py-4 flex flex-col items-center">
                <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mb-4 border-2 border-emerald-200 shadow-sm">
                  <CheckCircle2 size={34} />
                </div>
                
                <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full border border-emerald-300">
                  RFQ Logged in Database
                </span>

                <h3 className="font-display font-extrabold text-xl text-slate-900 mt-2">
                  Quotation Request Registered
                </h3>
                <p className="text-xs text-gray-500 mt-1 max-w-md leading-relaxed">
                  Thank you, <span className="font-bold text-slate-800">{name}</span>. Your engineering requirement has been permanently assigned to our estimating pool.
                </p>

                {/* Reference ID card */}
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 my-5 text-left w-full max-w-sm text-xs flex flex-col gap-2">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500 font-semibold text-[10px] uppercase tracking-wider">RFQ Identifier:</span>
                    <span className="font-mono font-black text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200">
                      {quoteReference}
                    </span>
                  </div>
                  <div className="flex justify-between border-t border-gray-200 pt-2 mt-1">
                    <span className="text-gray-500 font-semibold">Registered Company:</span>
                    <span className="font-bold text-slate-800">{company}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500 font-semibold">Location:</span>
                    <span className="font-bold text-slate-800">{projectLocation}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500 font-semibold">Contact Email:</span>
                    <span className="font-bold text-slate-800">{email}</span>
                  </div>
                </div>

                <p className="text-xs text-gray-500 leading-relaxed max-w-sm">
                  A certified HVAC mechanical estimator will contact you within **4 business hours** to verify electrical schedules and prepare your formal B2B bid sheet.
                </p>

                <button
                  onClick={handleCloseAndReset}
                  className="mt-6 px-6 py-2.5 bg-[#2596be] hover:bg-[#1c7e9f] text-white text-xs font-bold rounded-xl transition-colors shadow-md cursor-pointer"
                >
                  Done & Return to Site
                </button>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
