import React, { useState, useEffect } from "react";
import { 
  FileText, 
  ShieldCheck, 
  ChevronRight, 
  Building, 
  Mail, 
  Phone, 
  MapPin, 
  CheckCircle2,
  Clock,
  ArrowUpRight
} from "lucide-react";
import { getGeneralSettings } from "../services/generalSettingsService";

interface LegalPageProps {
  initialTab?: "terms" | "privacy";
}

const TERMS_SECTIONS = [
  { id: "terms-scope", title: "1. Commercial Scope & Agreement" },
  { id: "terms-pricing", title: "2. Quotations, Pricing & Validity" },
  { id: "terms-payment", title: "3. Payment & Credit Terms" },
  { id: "terms-standards", title: "4. High Ambient T3 Standards" },
  { id: "terms-logistics", title: "5. Logistics & Site Offloading" },
  { id: "terms-warranty", title: "6. Manufacturer Warranty" },
  { id: "terms-jurisdiction", title: "7. Governing Law & Jurisdiction" }
];

const PRIVACY_SECTIONS = [
  { id: "privacy-overview", title: "1. Overview & Commitment" },
  { id: "privacy-collection", title: "2. Information We Collect" },
  { id: "privacy-purpose", title: "3. Purpose of Processing" },
  { id: "privacy-security", title: "4. Security & Data Protection" },
  { id: "privacy-cookies", title: "5. Cookie Policy" },
  { id: "privacy-rights", title: "6. Data Subject Rights & Contact" }
];

export default function LegalPage({ initialTab = "terms" }: LegalPageProps) {
  const [activeTab, setActiveTab] = useState<"terms" | "privacy">(initialTab);
  const [activeSection, setActiveSection] = useState<string>("");

  const [contactData, setContactData] = useState(() => {
    const s = getGeneralSettings();
    return {
      legalEmail: s.departmentHotlines?.legalEmail || s.emailIntegration?.defaultReceivingEmail || "legal@cooltechuae.com",
      privacyEmail: s.departmentHotlines?.privacyEmail || s.emailIntegration?.defaultReceivingEmail || "privacy@cooltechuae.com",
      phone: s.departmentHotlines?.legalPhone || s.phone || "+971 2 565 0123",
      address: s.address || "Plot-99, M42, Mussafah Industrial, Abu Dhabi, UAE"
    };
  });

  useEffect(() => {
    const handleUpdate = () => {
      const s = getGeneralSettings();
      setContactData({
        legalEmail: s.departmentHotlines?.legalEmail || s.emailIntegration?.defaultReceivingEmail || "legal@cooltechuae.com",
        privacyEmail: s.departmentHotlines?.privacyEmail || s.emailIntegration?.defaultReceivingEmail || "privacy@cooltechuae.com",
        phone: s.departmentHotlines?.legalPhone || s.phone || "+971 2 565 0123",
        address: s.address || "Plot-99, M42, Mussafah Industrial, Abu Dhabi, UAE"
      });
    };
    window.addEventListener("cooltech_contact_settings_updated", handleUpdate);
    window.addEventListener("cooltech_settings_updated", handleUpdate);
    return () => {
      window.removeEventListener("cooltech_contact_settings_updated", handleUpdate);
      window.removeEventListener("cooltech_settings_updated", handleUpdate);
    };
  }, []);

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [activeTab]);

  const handleTabChange = (tab: "terms" | "privacy") => {
    setActiveTab(tab);
    window.location.hash = `#/${tab}`;
  };

  const handleScrollToSection = (sectionId: string) => {
    setActiveSection(sectionId);
    const element = document.getElementById(sectionId);
    if (element) {
      const yOffset = -100;
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: "smooth" });
    }
  };

  return (
    <div className="w-full bg-slate-50 min-h-screen">
      
      {/* ─────────────────────────────────────────────────────────────
          1. ENTERPRISE HEADER BANNER
      ───────────────────────────────────────────────────────────── */}
      <div className="w-full bg-[#031b4e] text-white py-12 px-4 sm:px-6 lg:px-8 border-b border-slate-800 relative overflow-hidden">
        <div className="absolute inset-0 bg-radial-at-t from-blue-900/30 via-transparent to-transparent pointer-events-none" />
        
        <div className="max-w-7xl mx-auto relative z-10">
          {/* Breadcrumbs */}
          <nav className="flex items-center gap-2 text-xs text-slate-400 font-semibold mb-4">
            <a 
              href="#/" 
              className="hover:text-white transition-colors"
            >
              Home
            </a>
            <ChevronRight size={13} className="text-slate-600" />
            <span className="text-slate-300">Legal & Governance Hub</span>
            <ChevronRight size={13} className="text-slate-600" />
            <span className="text-cyan-400 uppercase tracking-wider font-bold">
              {activeTab === "terms" ? "Terms & Conditions" : "Privacy Policy"}
            </span>
          </nav>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 text-cyan-300 text-xs font-extrabold rounded-full mb-3 border border-white/10 backdrop-blur-xs">
                {activeTab === "terms" ? <FileText size={13} /> : <ShieldCheck size={13} />}
                <span>
                  {activeTab === "terms" ? "B2B Commercial Distribution Guidelines" : "UAE Personal Data Protection Notice (PDPL)"}
                </span>
              </div>

              <h1 className="font-sans font-black text-3xl sm:text-4xl text-white uppercase tracking-tight">
                {activeTab === "terms" ? "Terms & Conditions" : "Privacy Policy"}
              </h1>
              
              <p className="text-sm text-slate-300 mt-2 max-w-2xl leading-relaxed">
                {activeTab === "terms"
                  ? "Standard wholesale commercial terms, equipment quotation policies, Net-30 trade facilities, and high-ambient GCC HVAC standards."
                  : "How Cool Technologies LLC processes, protects, and safeguards corporate client data in compliance with UAE Federal Decree-Law No. 45/2021."}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          2. TWO-COLUMN SPLIT DOCUMENTATION LAYOUT
      ───────────────────────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-14">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT COLUMN: STICKY NAVIGATION SIDEBAR (4 Cols) */}
          <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-24">
            
            {/* Document Selector Card */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
              <h3 className="text-[11px] font-black uppercase tracking-wider text-slate-400 mb-3">
                Legal Documents
              </h3>
              
              <div className="space-y-1.5">
                <button
                  type="button"
                  onClick={() => handleTabChange("terms")}
                  className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-between cursor-pointer ${
                    activeTab === "terms"
                      ? "bg-blue-50 text-[#0f4c81] border border-blue-200"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 border border-transparent"
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <FileText size={15} />
                    Terms & Conditions
                  </span>
                  <ChevronRight size={14} className={activeTab === "terms" ? "text-[#0f4c81]" : "text-slate-400"} />
                </button>

                <button
                  type="button"
                  onClick={() => handleTabChange("privacy")}
                  className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-between cursor-pointer ${
                    activeTab === "privacy"
                      ? "bg-blue-50 text-[#0f4c81] border border-blue-200"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 border border-transparent"
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <ShieldCheck size={15} />
                    Privacy Policy
                  </span>
                  <ChevronRight size={14} className={activeTab === "privacy" ? "text-[#0f4c81]" : "text-slate-400"} />
                </button>
              </div>
            </div>

            {/* Table of Contents */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
              <h3 className="text-[11px] font-black uppercase tracking-wider text-slate-400 mb-3">
                Table of Contents
              </h3>
              
              <nav className="space-y-1">
                {(activeTab === "terms" ? TERMS_SECTIONS : PRIVACY_SECTIONS).map((sec) => (
                  <button
                    key={sec.id}
                    type="button"
                    onClick={() => handleScrollToSection(sec.id)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold transition-all block truncate cursor-pointer ${
                      activeSection === sec.id
                        ? "bg-slate-100 text-[#0f4c81] font-bold"
                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                    }`}
                  >
                    {sec.title}
                  </button>
                ))}
              </nav>
            </div>

            {/* Corporate Legal Desk Contact Card */}
            <div className="bg-slate-900 text-white rounded-2xl p-5 shadow-sm border border-slate-800 space-y-3">
              <div className="flex items-center gap-2 text-cyan-400 text-xs font-bold uppercase tracking-wider">
                <Building size={14} />
                <span>Legal & Compliance Desk</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                For formal contract inquiries, corporate procurement master agreements, or vendor registration:
              </p>
              <div className="pt-2 space-y-2 border-t border-slate-800 text-xs text-slate-300">
                <div className="flex items-center gap-2">
                  <Mail size={13} className="text-cyan-400 shrink-0" />
                  <a href={`mailto:${contactData.legalEmail}`} className="hover:text-white font-semibold">
                    {contactData.legalEmail}
                  </a>
                </div>
                <div className="flex items-center gap-2">
                  <Phone size={13} className="text-cyan-400 shrink-0" />
                  <a href={`tel:${contactData.phone.replace(/[^0-9+]/g, '')}`} className="hover:text-white font-semibold">
                    {contactData.phone}
                  </a>
                </div>
                <div className="flex items-start gap-2">
                  <MapPin size={13} className="text-cyan-400 shrink-0 mt-0.5" />
                  <span className="text-[11px] text-slate-400">
                    {contactData.address}
                  </span>
                </div>
              </div>
            </div>

          </div>

          {/* RIGHT COLUMN: MAIN DOCUMENT CONTENT (8 Cols) */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* DOCUMENT CARD */}
            <div className="bg-white rounded-3xl border border-slate-200 p-8 sm:p-10 shadow-xs">
              
              {/* Document Sub-header Metadata */}
              <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-slate-200 mb-8">
                <div>
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900 uppercase tracking-tight">
                    {activeTab === "terms" ? "Commercial Distribution & Supply Agreement" : "Corporate Privacy & Data Governance"}
                  </h2>
                  <div className="flex items-center gap-3 mt-1.5 text-xs text-slate-500 font-medium">
                    <span className="flex items-center gap-1">
                      <Clock size={12} className="text-slate-400" />
                      Effective Date: January 1, 2026
                    </span>
                    <span>·</span>
                    <span>Version 2026.1</span>
                  </div>
                </div>

                <span className="px-3 py-1 bg-emerald-50 text-emerald-800 text-xs font-bold rounded-full border border-emerald-200">
                  Active & Legally Binding
                </span>
              </div>

              {/* ───────────────────────────────────────────────────
                  CONTENT: TERMS & CONDITIONS
              ─────────────────────────────────────────────────── */}
              {activeTab === "terms" && (
                <div className="space-y-10 text-slate-700 text-sm leading-relaxed">
                  
                  {/* Summary Highlight Box */}
                  <div className="bg-blue-50/70 border border-blue-200 rounded-2xl p-5">
                    <h4 className="font-bold text-xs uppercase tracking-wider text-[#0f4c81] mb-1.5 flex items-center gap-1.5">
                      <CheckCircle2 size={15} />
                      Key Commercial Highlights
                    </h4>
                    <p className="text-xs text-slate-700 leading-relaxed font-semibold">
                      Quotations are valid for 30 calendar days. All cooling machinery meets GCC High Ambient T3 ratings (52°C+ peak ambient). Deliveries across Abu Dhabi, Dubai, and Northern Emirates are supported by our logistics fleet with standard Ex-Works or Delivered-Site trade terms.
                    </p>
                  </div>

                  {/* Section 1 */}
                  <section id="terms-scope" className="space-y-3 pt-2">
                    <h3 className="text-base font-black text-slate-900 tracking-tight flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-[#0f4c81]"></span>
                      1. Commercial Scope & Agreement
                    </h3>
                    <p>
                      These Terms and Conditions govern all sales quotations, commercial purchase orders (LPO), corporate procurement accounts, and wholesale equipment distribution rendered by <strong>Cool Technologies LLC</strong> (&quot;the Company&quot;), headquartered in Mussafah Industrial Area M-14, Abu Dhabi, United Arab Emirates.
                    </p>
                    <p>
                      By submitting a formal Request for Quotation (RFQ), issuing a Commercial Purchase Order, or creating a registered B2B contractor account on this website, the purchasing contractor, engineering firm, or commercial enterprise (&quot;the Buyer&quot;) unreservedly agrees to these provisions.
                    </p>
                  </section>

                  {/* Section 2 */}
                  <section id="terms-pricing" className="space-y-3 pt-4 border-t border-slate-100">
                    <h3 className="text-base font-black text-slate-900 tracking-tight flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-[#0f4c81]"></span>
                      2. Quotations, Pricing & Validity
                    </h3>
                    <p>
                      All wholesale quotations generated through our selection engine or issued by our sales engineering team are denominated in <strong>United Arab Emirates Dirham (AED)</strong> or <strong>United States Dollar (USD)</strong> as specified on the quotation document.
                    </p>
                    <p>
                      Formal quotations remain valid for a period of <strong>30 calendar days</strong> from the date of issuance. Prices are subject to adjustment prior to order confirmation in the event of documented manufacturer list-price changes, international shipping tariff adjustments, or raw commodity shifts (copper tube, aluminum fin, steel, refrigerant gas).
                    </p>
                    <p>
                      All prices are exclusive of UAE Value Added Tax (5% VAT) unless explicitly designated as VAT-inclusive on the formal proforma invoice.
                    </p>
                  </section>

                  {/* Section 3 */}
                  <section id="terms-payment" className="space-y-3 pt-4 border-t border-slate-100">
                    <h3 className="text-base font-black text-slate-900 tracking-tight flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-[#0f4c81]"></span>
                      3. Payment Terms & Corporate Credit Facilities
                    </h3>
                    <p>
                      Standard initial transactions require Advance Bank Wire Transfer, Corporate Cheque, or Confirmed Letter of Credit (LC).
                    </p>
                    <p>
                      Registered corporate entities, pre-qualified MEP contractors, and government accounts may apply for <strong>Net-30 or Net-60 Corporate Credit Facilities</strong> following standard credit underwriting and verification of a valid UAE Commercial Trade License and TRN certificate.
                    </p>
                  </section>

                  {/* Section 4 */}
                  <section id="terms-standards" className="space-y-3 pt-4 border-t border-slate-100">
                    <h3 className="text-base font-black text-slate-900 tracking-tight flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-[#0f4c81]"></span>
                      4. High Ambient T3 Standards & Compliance
                    </h3>
                    <p>
                      All commercial air conditioning units, modular chillers, VRF equipment, condensing units, and DX cooling coils distributed by Cool Technologies comply with GCC High-Ambient design standards (T3 Climate Rating, tested for continuous 52°C–54°C ambient operations).
                    </p>
                    <p>
                      Products carry manufacturer compliance certifications including <strong>AHRI, EUROVENT, CE, and ISO 9001:2015</strong> quality standards.
                    </p>
                  </section>

                  {/* Section 5 */}
                  <section id="terms-logistics" className="space-y-3 pt-4 border-t border-slate-100">
                    <h3 className="text-base font-black text-slate-900 tracking-tight flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-[#0f4c81]"></span>
                      5. Logistics, Site Delivery & Inspection
                    </h3>
                    <p>
                      Delivery is conducted via Cool Technologies logistics transport to commercial project sites, contractor warehouses, or ports of entry across Abu Dhabi, Dubai, Sharjah, and the Northern Emirates.
                    </p>
                    <p>
                      The Buyer is responsible for site crane offloading and mechanical positioning unless turnkey crane rigging is expressly included in the proforma agreement. The Buyer must inspect all crates and equipment upon delivery and note any transit damage on the formal Delivery Order (DO) within 48 hours of receipt.
                    </p>
                  </section>

                  {/* Section 6 */}
                  <section id="terms-warranty" className="space-y-3 pt-4 border-t border-slate-100">
                    <h3 className="text-base font-black text-slate-900 tracking-tight flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-[#0f4c81]"></span>
                      6. Manufacturer Warranty & Claims
                    </h3>
                    <p>
                      Equipment sold is covered by original OEM factory warranties (typically 1-Year Comprehensive Unit Warranty and 5-Year Compressor Warranty on major systems). Warranty validation requires installation in accordance with factory engineering manuals and commissioning by certified HVAC technicians.
                    </p>
                  </section>

                  {/* Section 7 */}
                  <section id="terms-jurisdiction" className="space-y-3 pt-4 border-t border-slate-100">
                    <h3 className="text-base font-black text-slate-900 tracking-tight flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-[#0f4c81]"></span>
                      7. Governing Law & Jurisdiction
                    </h3>
                    <p>
                      These Terms and Conditions shall be governed by and construed in accordance with the <strong>Federal Laws of the United Arab Emirates</strong> and the commercial regulations of the Emirate of Abu Dhabi. Any legal dispute arising out of or in connection with these terms shall be subject to the exclusive jurisdiction of the Courts of Abu Dhabi.
                    </p>
                  </section>

                </div>
              )}

              {/* ───────────────────────────────────────────────────
                  CONTENT: PRIVACY POLICY
              ─────────────────────────────────────────────────── */}
              {activeTab === "privacy" && (
                <div className="space-y-10 text-slate-700 text-sm leading-relaxed">
                  
                  {/* Summary Highlight Box */}
                  <div className="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-5">
                    <h4 className="font-bold text-xs uppercase tracking-wider text-emerald-900 mb-1.5 flex items-center gap-1.5">
                      <ShieldCheck size={15} className="text-emerald-700" />
                      Data Protection Guarantee
                    </h4>
                    <p className="text-xs text-slate-700 leading-relaxed font-semibold">
                      Cool Technologies strictly enforces UAE Federal Decree-Law No. 45/2021 on Personal Data Protection. We never sell, monetize, or disclose corporate contractor details to third-party marketing companies. Data is used strictly for engineering quotations, delivery dispatch, and tax compliance.
                    </p>
                  </div>

                  {/* Section 1 */}
                  <section id="privacy-overview" className="space-y-3 pt-2">
                    <h3 className="text-base font-black text-slate-900 tracking-tight flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
                      1. Overview & Commitment
                    </h3>
                    <p>
                      <strong>Cool Technologies LLC</strong> (&quot;Cool Technologies&quot;, &quot;we&quot;, &quot;our&quot;, or &quot;us&quot;) respect the privacy and confidential data of our commercial partners, contractors, engineering professionals, and website visitors.
                    </p>
                    <p>
                      This Privacy Policy outlines how we collect, process, store, and protect corporate and personal information in compliance with <strong>UAE Federal Decree-Law No. 45/2021 on Personal Data Protection (PDPL)</strong>.
                    </p>
                  </section>

                  {/* Section 2 */}
                  <section id="privacy-collection" className="space-y-3 pt-4 border-t border-slate-100">
                    <h3 className="text-base font-black text-slate-900 tracking-tight flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
                      2. Information We Collect
                    </h3>
                    <p>
                      We collect information directly when you interact with our B2B procurement portal, submit requests for quotations (RFQs), configure equipment in our selection tools, or contact our engineering desk:
                    </p>
                    <ul className="list-disc pl-5 space-y-1.5 text-slate-600">
                      <li><strong>Corporate & Contact Details:</strong> Company trade name, commercial registration details, contact person name, professional email address, UAE phone number, and physical office or site address.</li>
                      <li><strong>Procurement & Billing Information:</strong> Tax Registration Number (TRN), trade license documentation for wholesale account verification, and authorized purchasing representative information.</li>
                      <li><strong>Technical Project Information:</strong> HVAC engineering project specifications, tonnage requirements, equipment lists, and technical inquiries submitted through our portal.</li>
                      <li><strong>Technical Usage Data:</strong> IP address, browser type, operating system, and interaction analytics collected to optimize website performance.</li>
                    </ul>
                  </section>

                  {/* Section 3 */}
                  <section id="privacy-purpose" className="space-y-3 pt-4 border-t border-slate-100">
                    <h3 className="text-base font-black text-slate-900 tracking-tight flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
                      3. Purpose of Processing
                    </h3>
                    <p>
                      We use the collected information solely for legitimate commercial purposes, including:
                    </p>
                    <ul className="list-disc pl-5 space-y-1.5 text-slate-600">
                      <li>Generating and issuing accurate engineering quotations and technical submittals.</li>
                      <li>Processing, fulfilling, and coordinating equipment logistics and site deliveries across the UAE.</li>
                      <li>Verifying corporate credit facilities and maintaining mandatory accounting records under UAE Federal Tax Authority (FTA) regulations.</li>
                      <li>Facilitating OEM manufacturer warranty registrations (e.g. Daikin, Midea, Copeland).</li>
                      <li>Providing technical product updates, service notices, and maintenance advisories.</li>
                    </ul>
                  </section>

                  {/* Section 4 */}
                  <section id="privacy-security" className="space-y-3 pt-4 border-t border-slate-100">
                    <h3 className="text-base font-black text-slate-900 tracking-tight flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
                      4. Security & Data Protection Controls
                    </h3>
                    <p>
                      We implement industry-standard administrative, physical, and technical safeguards to protect your data against unauthorized access, loss, or alteration. All electronic communication is encrypted using 256-bit Transport Layer Security (TLS 1.3).
                    </p>
                    <p>
                      Cool Technologies <strong>never sells, rents, or leases</strong> corporate or personal data to third-party marketing companies. Data is shared strictly with authorized logistics carriers and OEM manufacturers solely as required to fulfill commercial orders.
                    </p>
                  </section>

                  {/* Section 5 */}
                  <section id="privacy-cookies" className="space-y-3 pt-4 border-t border-slate-100">
                    <h3 className="text-base font-black text-slate-900 tracking-tight flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
                      5. Cookie Policy
                    </h3>
                    <p>
                      Our portal utilizes essential cookies and session storage to maintain shopping cart items, selection wizard parameters, and secure account authentication. You may configure your browser to reject non-essential cookies; however, certain portal functions may be limited.
                    </p>
                  </section>

                  {/* Section 6 */}
                  <section id="privacy-rights" className="space-y-3 pt-4 border-t border-slate-100">
                    <h3 className="text-base font-black text-slate-900 tracking-tight flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
                      6. Data Subject Rights & Contact Information
                    </h3>
                    <p>
                      Under UAE data protection regulations, you have the right to request access to, rectification of, or deletion of your corporate contact records stored with us, subject to statutory tax and commercial retention laws.
                    </p>
                    <p>
                      For privacy inquiries or data requests, please contact our data officer at <a href={`mailto:${contactData.privacyEmail}`} className="text-[#0f4c81] font-semibold underline">{contactData.privacyEmail}</a> or call {contactData.phone}.
                    </p>
                  </section>

                </div>
              )}

            </div>

          </div>

        </div>
      </div>

    </div>
  );
}
