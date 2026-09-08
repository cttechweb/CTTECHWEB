import React, { useState } from "react";
import { CheckCircle2, ArrowRight, Check, Sparkles } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { createRfqRequest } from "../services/rfqService";
import { submitGeneralEnquiry } from "../services/enquiryService";
import { sendEmailNotification } from "../services/emailService";
import heroBgImage from "../assets/images/hero_background.jpg";

interface HeroProps {
  onShopProductsClick: () => void;
  onRequestQuoteClick?: () => void;
  onBecomePartnerClick?: () => void;
  onFormSubmitSuccess?: (message: string) => void;
}

export default function Hero({ onShopProductsClick, onRequestQuoteClick, onBecomePartnerClick, onFormSubmitSuccess }: HeroProps) {
  const { user } = useAuth();

  const handleBecomePartner = () => {
    if (onBecomePartnerClick) {
      onBecomePartnerClick();
    } else {
      if (user) {
        window.location.hash = "#/account?tab=partner";
      } else {
        try {
          sessionStorage.setItem("ct_redirect_after_login", "#/account?tab=partner");
        } catch {}
        window.location.hash = "#/login?redirect=account?tab=partner";
      }
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };
  // Lead form field states
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [services, setServices] = useState({
    purchase: false,
    installation: false,
    service: false,
  });
  const [enquiry, setEnquiry] = useState("");
  
  // Interactive UX states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [ticketId, setTicketId] = useState("");
  const [validationError, setValidationError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    setValidationError("");

    // Validate requirements
    if (!name.trim()) {
      setValidationError("Please enter your contact name.");
      return;
    }
    if (!email.trim() || !email.includes("@")) {
      setValidationError("Please provide a valid company/personal email.");
      return;
    }
    if (!phone.trim() || phone.trim().length < 7) {
      setValidationError("Please provide an active mobile/office phone number.");
      return;
    }

    try {
      setIsSubmitting(true);

      const selectedServicesList = [
        services.purchase ? "HVAC Equipment Sourcing / Purchase" : null,
        services.installation ? "System Installation & Commissioning" : null,
        services.service ? "Technical Maintenance & Service" : null,
      ].filter(Boolean).join(", ");

      // Fire EmailJS notification IMMEDIATELY — does NOT wait for or depend on any API call
      sendEmailNotification({
        type: "hero_quote",
        title: `Homepage Fast Quote from ${name.trim()}`,
        senderName: name.trim(),
        senderEmail: email.trim(),
        senderPhone: phone.trim(),
        companyName: "Direct Web Lead",
        subject: `[Cool Technologies] Fast Quote Request - ${name.trim()}`,
        message: enquiry.trim() || "Lead submitted via Homepage Hero form.",
        detailsText: `Name: ${name.trim()}\nEmail: ${email.trim()}\nPhone: ${phone.trim()}\nSelected Services: ${selectedServicesList || "Commercial HVAC Sourcing"}\nMessage / Scope: ${enquiry.trim() || "N/A"}`,
        customParams: {
          selected_services: selectedServicesList
        }
      }).catch((emailErr) => {
        console.warn("[Hero] Email dispatch error:", emailErr);
      });

      // Also persist to DB and submit general enquiry (best-effort, non-blocking)
      let rfqNumber = `RFQ-${Date.now()}`;
      try {
        const createdRfq = await createRfqRequest({
          name: name.trim(),
          email: email.trim(),
          company: "Direct Web Lead",
          phone: phone.trim(),
          projectLocation: "UAE",
          timeline: "immediate",
          loadRequirements: selectedServicesList || "Commercial HVAC Sourcing",
          projectDescription: enquiry.trim() || "Lead submitted via Homepage Hero form.",
          products: [],
        });
        rfqNumber = createdRfq.rfqNumber;

        submitGeneralEnquiry({
          source: "homepage",
          type: "quotation",
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim(),
          companyName: "Direct Web Lead",
          subject: `Homepage Lead: ${selectedServicesList || "Commercial HVAC Sourcing"}`,
          message: enquiry.trim() || "Lead submitted via Homepage Hero form.",
          metadata: { services, rfqNumber: createdRfq.rfqNumber },
        }).catch(() => {});
      } catch (apiErr) {
        console.warn("[Hero] API persistence error (email was already sent):", apiErr);
      }

      setTicketId(rfqNumber);
      setIsSuccess(true);
      setIsSubmitting(false);

      if (onFormSubmitSuccess) {
        onFormSubmitSuccess(`Success! Inquiry registered for ${name}. Our team will contact you shortly.`);
      }
    } catch (err) {
      console.warn("Hero lead submission error:", err);
      setIsSubmitting(false);
    }
  };

  return (
    <section 
      className="w-full bg-[#f4f8fc] bg-cover bg-center bg-no-repeat py-8 sm:py-16 md:py-20 lg:py-24 xl:py-28 overflow-hidden relative" 
      id="hero-section"
      style={{ backgroundImage: `url("${heroBgImage}")` }}
    >
      {/* Backdrop overlay for enhanced copy readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-white/95 via-white/85 to-white/70 lg:bg-gradient-to-r lg:from-white/95 lg:via-white/75 lg:to-white/10 z-10 pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 relative z-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-12 items-center">
          
          {/* Left Column: Sourcing Copy Details (7 cols) */}
          <div className="lg:col-span-7 text-left flex flex-col justify-center">
            <p className="text-blue-700 font-extrabold text-xs sm:text-sm tracking-widest uppercase mb-1.5 sm:mb-2 animate-in fade-in slide-in-from-bottom-2 duration-300">
              Welcome to Cool Technologies
            </p>
            <h1 className="font-sans font-black text-3xl sm:text-5xl lg:text-5xl xl:text-6xl text-[#031b4e] tracking-tight leading-[1.1] uppercase mb-3 sm:mb-4 animate-in fade-in slide-in-from-bottom-3 duration-300">
              The Experts in Cooling
            </h1>
            <p className="text-slate-600 text-xs sm:text-base mb-5 sm:mb-6 max-w-xl leading-relaxed font-semibold animate-in fade-in slide-in-from-bottom-4 duration-300">
              We supply all kinds of air & water-cooling equipment: Air conditioning & air-cooling systems, water coolers & water dispensers, tank chillers, ice cube machines, freezers, refrigerators, upright chillers, industrial ventilation products & water purification systems.
            </p>

            {/* Call to Actions */}
            <div className="flex flex-col sm:flex-row gap-2.5 sm:gap-3">
              <button
                onClick={onShopProductsClick}
                className="px-6 py-3.5 bg-[#2596be] hover:bg-[#1c7e9f] text-white font-bold rounded-md flex items-center justify-center gap-2 shadow-sm transition-all text-sm group cursor-pointer"
                id="shop-now-hero"
              >
                <span>Shop Products</span>
                <ArrowRight size={15} className="group-hover:translate-x-1 transition-transform stroke-[2.5]" />
              </button>
              <button
                onClick={handleBecomePartner}
                className="px-6 py-3.5 border border-[#2596be] text-[#2596be] bg-white/85 hover:bg-white font-bold rounded-md flex items-center justify-center gap-2 transition-all text-sm group cursor-pointer"
                id="become-partner-hero"
              >
                <span>Become a Partner</span>
                <ArrowRight size={15} className="group-hover:translate-x-1 transition-transform stroke-[2.5]" />
              </button>
            </div>
          </div>

          {/* Right Column: Transparent Blue Glassmorphism Lead Form (5 cols) */}
          <div className="lg:col-span-5 flex justify-center lg:justify-end mt-4 lg:mt-0">
            {isSuccess ? (
              /* Success confirmation state */
              <div 
                className="bg-[#1e3458] text-white border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl w-full max-w-full sm:max-w-md mx-auto lg:mx-0 flex flex-col items-center text-center animate-in zoom-in-95 duration-300"
                id="hero-lead-success-card"
              >
                <div className="w-14 h-14 bg-white/10 text-cyan-400 rounded-2xl border border-cyan-400/30 flex items-center justify-center mb-4">
                  <Check size={28} className="stroke-[3]" />
                </div>
                <h3 className="text-xl sm:text-2xl font-black tracking-tight text-white mb-1">Quote Requested!</h3>
                <p className="text-xs text-cyan-300 font-extrabold uppercase tracking-wider mb-3">Ticket ID: {ticketId}</p>
                <p className="text-xs text-slate-200 leading-relaxed font-medium mb-6">
                  Thank you, <span className="text-white font-bold">{name}</span>. Your enquiry has been logged. An HVAC specialist will contact you shortly.
                </p>
                <button
                  onClick={() => {
                    setIsSuccess(false);
                    setName("");
                    setEmail("");
                    setPhone("");
                    setEnquiry("");
                    setServices({ purchase: false, installation: false, service: false });
                  }}
                  className="bg-[#2596be] hover:bg-[#1c7e9f] text-white font-bold px-6 py-2.5 rounded-xl transition-all text-xs uppercase tracking-wider shadow-md cursor-pointer"
                  id="hero-lead-reset-btn"
                >
                  Submit Another Request
                </button>
              </div>
            ) : (
              /* Get a Quote Card matching exact classic dark navy aesthetic */
              <div 
                className="bg-[#1e3458] text-white border border-white/10 rounded-3xl p-6 sm:p-7 shadow-2xl w-full max-w-full sm:max-w-md mx-auto lg:mx-0 flex flex-col animate-in fade-in duration-300"
                id="hero-lead-form-card"
              >
                <h3 className="font-sans font-bold text-2xl text-white tracking-tight mb-4">
                  Get a Quote
                </h3>

                {validationError && (
                  <div className="mb-3.5 bg-red-500/20 border border-red-400/30 text-white text-xs font-semibold px-3 py-2 rounded-xl leading-relaxed">
                    {validationError}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-3.5">
                  {/* Name field */}
                  <div>
                    <input
                      type="text"
                      placeholder="Name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-[#2b446f]/70 hover:bg-[#2b446f]/90 focus:bg-[#2b446f] border border-white/10 focus:border-[#2596be] focus:ring-1 focus:ring-[#2596be] rounded-xl px-4 py-3 text-xs text-white placeholder:text-slate-300/60 font-medium transition-all outline-none"
                      id="hero-lead-name"
                    />
                  </div>

                  {/* Email field */}
                  <div>
                    <input
                      type="email"
                      placeholder="Email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-[#2b446f]/70 hover:bg-[#2b446f]/90 focus:bg-[#2b446f] border border-white/10 focus:border-[#2596be] focus:ring-1 focus:ring-[#2596be] rounded-xl px-4 py-3 text-xs text-white placeholder:text-slate-300/60 font-medium transition-all outline-none"
                      id="hero-lead-email"
                    />
                  </div>

                  {/* Phone field */}
                  <div>
                    <input
                      type="text"
                      placeholder="Phone ( with country code)"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full bg-[#2b446f]/70 hover:bg-[#2b446f]/90 focus:bg-[#2b446f] border border-white/10 focus:border-[#2596be] focus:ring-1 focus:ring-[#2596be] rounded-xl px-4 py-3 text-xs text-white placeholder:text-slate-300/60 font-medium transition-all outline-none"
                      id="hero-lead-phone"
                    />
                  </div>

                  {/* Service Selection Pills */}
                  <div>
                    <label className="text-[10px] font-bold text-slate-300 uppercase tracking-wider block mb-1.5">
                      Service Requirements (Select all that apply)
                    </label>
                    <div className="grid grid-cols-3 gap-1.5">
                      {[
                        { key: "purchase", label: "Purchase", id: "hero-lead-cb-purchase" },
                        { key: "installation", label: "Installation", id: "hero-lead-cb-installation" },
                        { key: "service", label: "Service", id: "hero-lead-cb-service" }
                      ].map((item) => {
                        const isChecked = services[item.key as keyof typeof services];
                        return (
                          <button
                            key={item.key}
                            type="button"
                            id={item.id}
                            onClick={() => setServices({ ...services, [item.key]: !isChecked })}
                            className={`py-2 px-2 rounded-xl text-xs font-bold transition-all border text-center cursor-pointer select-none flex items-center justify-center gap-1.5 ${
                              isChecked
                                ? "bg-[#2596be] text-white border-[#2596be] shadow-sm"
                                : "bg-[#2b446f]/60 text-slate-200 border-white/10 hover:bg-[#2b446f]/90 hover:border-white/20"
                            }`}
                          >
                            {isChecked && <Check size={12} className="stroke-[3]" />}
                            <span>{item.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Enquiry Textarea */}
                  <div>
                    <textarea
                      placeholder="Enquiry"
                      rows={3}
                      value={enquiry}
                      onChange={(e) => setEnquiry(e.target.value)}
                      className="w-full bg-[#2b446f]/70 hover:bg-[#2b446f]/90 focus:bg-[#2b446f] border border-white/10 focus:border-[#2596be] focus:ring-1 focus:ring-[#2596be] rounded-xl px-4 py-3 text-xs text-white placeholder:text-slate-300/60 font-medium transition-all outline-none resize-none"
                      id="hero-lead-enquiry"
                    />
                  </div>

                  {/* Modern Full-Width Submit Button */}
                  <div className="pt-1.5">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full bg-[#2596be] hover:bg-[#1c7e9f] active:scale-[0.99] disabled:bg-slate-500 text-white font-extrabold py-3.5 px-6 rounded-xl transition-all text-xs tracking-wider uppercase shadow-md shadow-[#2596be]/30 flex items-center justify-center gap-2 cursor-pointer"
                      id="hero-lead-submit-btn"
                    >
                      {isSubmitting ? "Sending..." : "SUBMIT QUOTE REQUEST"}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>

        </div>
      </div>
    </section>
  );
}
