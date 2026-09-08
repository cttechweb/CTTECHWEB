import React, { useState, useEffect } from "react";
import { 
  Linkedin, Twitter, Facebook, Sparkles, 
  Phone, Mail, MapPin, ArrowUpRight, Instagram, Youtube, MessageSquare, Globe 
} from "lucide-react";
import { getGeneralSettings, DEFAULT_SOCIAL_LINKS } from "../services/generalSettingsService";
import { DynamicSocialLink } from "../types";
// @ts-ignore
import logo from "../assets/images/Cool Technologies Logo.png";

interface FooterProps {
  onCategorySelect: (category: string | null) => void;
  onOpenQuote: () => void;
  onOpenBlog?: () => void;
  onOpenCareer?: () => void;
  onOpenManagement?: () => void;
  onOpenAbout?: () => void;
  onOpenMedia?: () => void;
  onOpenTerms?: () => void;
  onOpenPrivacy?: () => void;
}

export default function Footer({ 
  onCategorySelect, 
  onOpenQuote,
  onOpenBlog,
  onOpenCareer,
  onOpenManagement,
  onOpenAbout,
  onOpenMedia,
  onOpenTerms,
  onOpenPrivacy
}: FooterProps) {
  const currentYear = new Date().getFullYear();

  const [contactSettings, setContactSettings] = useState(() => {
    const s = getGeneralSettings();
    return {
      phone: s.phone || "+971 2 565 0123",
      email: s.email || "info@cooltechuae.com",
      address: s.address || "Plot-99, Sector M-42 / M-14, Mussafah Industrial Area, Abu Dhabi, UAE",
      socialLinks: (s.socialLinks && s.socialLinks.length > 0 ? s.socialLinks : DEFAULT_SOCIAL_LINKS)
    };
  });

  useEffect(() => {
    const update = () => {
      const s = getGeneralSettings();
      setContactSettings({
        phone: s.phone || "+971 2 565 0123",
        email: s.email || "info@cooltechuae.com",
        address: s.address || "Plot-99, Sector M-42 / M-14, Mussafah Industrial Area, Abu Dhabi, UAE",
        socialLinks: (s.socialLinks && s.socialLinks.length > 0 ? s.socialLinks : DEFAULT_SOCIAL_LINKS)
      });
    };
    window.addEventListener("cooltech_contact_settings_updated", update);
    window.addEventListener("cooltech_settings_updated", update);
    window.addEventListener("storage", update);
    return () => {
      window.removeEventListener("cooltech_contact_settings_updated", update);
      window.removeEventListener("cooltech_settings_updated", update);
      window.removeEventListener("storage", update);
    };
  }, []);

  const handleCategoryClick = (cat: string | null) => {
    onCategorySelect(cat);
    // If not in products list view, redirect to products or scroll
    if (window.location.hash !== "#/products") {
      window.location.hash = "#/products";
    }
    setTimeout(() => {
      const catalogElement = document.getElementById("product-catalog");
      if (catalogElement) {
        catalogElement.scrollIntoView({ behavior: "smooth" });
      } else {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    }, 100);
  };

  const handlePageClick = (page: string) => {
    if (page === "home") {
      window.location.hash = "#/";
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else if (page === "products") {
      window.location.hash = "#/products";
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleScrollToId = (elementId: string) => {
    const el = document.getElementById(elementId);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    } else {
      window.location.hash = "#/";
      setTimeout(() => {
        const targetEl = document.getElementById(elementId);
        if (targetEl) {
          targetEl.scrollIntoView({ behavior: "smooth" });
        }
      }, 150);
    }
  };

  return (
    <footer className="w-full bg-[#031124] text-slate-300 font-sans pt-16 pb-8 border-t border-slate-900" id="footer-section">
      <div className="max-w-[1280px] mx-auto px-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-12 w-full">
        
        {/* Column 1: Company Profile (4 cols) */}
        <div className="lg:col-span-4 text-left flex flex-col justify-between">
          <div>
            <div className="mb-5">
              <img 
                src={logo} 
                alt="Cool Technologies Logo" 
                className="h-10 w-auto object-contain select-none filter brightness-105"
                referrerPolicy="no-referrer"
              />
            </div>
            <p className="text-xs text-slate-400 leading-relaxed max-w-sm mb-6">
              Cool Technologies is a premier authorized distributor of commercial HVAC systems, premium industrial parts, and climate control solutions. We empower engineering contractors and industrial developers with certified equipment and rapid logistics.
            </p>
          </div>
        </div>

        {/* Column 2: Product Categories (3 cols) */}
        <div className="lg:col-span-3 text-left">
          <h4 className="text-white text-xs font-bold uppercase tracking-wider border-b border-slate-800/80 pb-2 mb-4">
            Industrial Categories
          </h4>
          <ul className="flex flex-col gap-2.5 text-[13px] text-slate-400 font-medium">
            <li>
              <button 
                onClick={() => handleCategoryClick(null)} 
                className="hover:text-white hover:underline transition-colors cursor-pointer text-left"
              >
                All Procurements
              </button>
            </li>
            <li>
              <button 
                onClick={() => handleCategoryClick("Air Conditioners")} 
                className="hover:text-white hover:underline transition-colors cursor-pointer text-left"
              >
                Air Conditioners
              </button>
            </li>
            <li>
              <button 
                onClick={() => handleCategoryClick("HVAC Systems")} 
                className="hover:text-white hover:underline transition-colors cursor-pointer text-left"
              >
                HVAC Systems & Chillers
              </button>
            </li>
            <li>
              <button 
                onClick={() => handleCategoryClick("Compressors")} 
                className="hover:text-white hover:underline transition-colors cursor-pointer text-left"
              >
                Industrial Compressors
              </button>
            </li>
            <li>
              <button 
                onClick={() => handleCategoryClick("Coils & Heat Exchangers")} 
                className="hover:text-white hover:underline transition-colors cursor-pointer text-left"
              >
                Condenser & Evaporator Coils
              </button>
            </li>
            <li>
              <button 
                onClick={() => handleCategoryClick("Controls & Thermostats")} 
                className="hover:text-white hover:underline transition-colors cursor-pointer text-left"
              >
                Sensors, Thermostats & Valves
              </button>
            </li>
            <li className="pt-1">
              <a 
                href="#/categories" 
                onClick={(e) => {
                  e.preventDefault();
                  window.location.hash = "#/categories";
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                className="text-cyan-400 font-bold hover:text-cyan-300 transition-colors flex items-center gap-1"
              >
                <span>Browse All Categories →</span>
              </a>
            </li>
          </ul>
        </div>

        {/* Column 3: Corporate Pages (2 cols) */}
        <div className="lg:col-span-2 text-left">
          <h4 className="text-white text-xs font-bold uppercase tracking-wider border-b border-slate-800/80 pb-2 mb-4">
            Corporate Hub
          </h4>
          <ul className="flex flex-col gap-2.5 text-[13px] text-slate-400 font-medium">
            <li>
              <a 
                href="#/products" 
                onClick={(e) => {
                  e.preventDefault();
                  handlePageClick("products");
                }}
                className="hover:text-white hover:underline transition-colors cursor-pointer text-left block"
              >
                Product Page
              </a>
            </li>
            <li>
              <a 
                href="#/services" 
                onClick={(e) => {
                  e.preventDefault();
                  window.location.hash = "#/services";
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                className="hover:text-white hover:underline transition-colors cursor-pointer text-left block"
              >
                Services Page
              </a>
            </li>
            <li>
              <a 
                href="#/" 
                onClick={(e) => {
                  e.preventDefault();
                  handleScrollToId("product-catalog");
                }}
                className="hover:text-white hover:underline transition-colors cursor-pointer text-left block"
              >
                Category Page
              </a>
            </li>
            <li>
              <a 
                href="#/about" 
                onClick={(e) => {
                  e.preventDefault();
                  if (onOpenAbout) onOpenAbout();
                }}
                className="hover:text-white hover:underline transition-colors cursor-pointer text-left block"
              >
                About Us
              </a>
            </li>
            <li>
              <a 
                href="#/contact" 
                onClick={(e) => {
                  e.preventDefault();
                  window.location.hash = "#/contact";
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                className="hover:text-white hover:underline transition-colors cursor-pointer text-left block"
              >
                Contact Page
              </a>
            </li>
            <li>
              <a 
                href="#/blog" 
                onClick={(e) => {
                  e.preventDefault();
                  if (onOpenBlog) onOpenBlog();
                }}
                className="hover:text-white hover:underline transition-colors cursor-pointer text-left flex items-center gap-1"
              >
                <span>Blog</span>
                <ArrowUpRight size={12} className="opacity-65" />
              </a>
            </li>
            <li>
              <a 
                href="#/careers" 
                onClick={(e) => {
                  e.preventDefault();
                  if (onOpenCareer) onOpenCareer();
                }}
                className="hover:text-white hover:underline transition-colors cursor-pointer text-left block"
              >
                Careers Page
              </a>
            </li>
            <li>
              <a 
                href="#/contact?category=product_support" 
                onClick={(e) => {
                  e.preventDefault();
                  window.location.hash = "#/contact?category=product_support";
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                className="hover:text-white hover:underline transition-colors cursor-pointer text-left block"
              >
                Product Support
              </a>
            </li>
            <li>
              <a 
                href="#/media" 
                onClick={(e) => {
                  e.preventDefault();
                  if (onOpenMedia) onOpenMedia();
                }}
                className="hover:text-white hover:underline transition-colors cursor-pointer text-left flex items-center gap-1"
              >
                <span>Media Page</span>
                <ArrowUpRight size={12} className="opacity-65" />
              </a>
            </li>
            <li>
              <a 
                href="#/management" 
                onClick={(e) => {
                  e.preventDefault();
                  if (onOpenManagement) onOpenManagement();
                }}
                className="hover:text-white hover:underline transition-colors cursor-pointer text-left block"
              >
                Management Page
              </a>
            </li>
          </ul>
        </div>

        {/* Column 4: Contact & Enterprise Support (3 cols) */}
        <div className="lg:col-span-3 text-left">
          <h4 className="text-white text-xs font-bold uppercase tracking-wider border-b border-slate-800/80 pb-2 mb-4">
            Enterprise Support
          </h4>
          
          <div className="flex flex-col gap-3.5 text-[13px] text-slate-400">
            {/* Contact Phone */}
            <div className="flex items-start gap-2.5">
              <Phone size={15} className="text-blue-500 shrink-0 mt-0.5" />
              <div className="flex flex-col">
                <span className="text-[11px] text-slate-500 uppercase font-semibold">Procurement Hotline</span>
                <a href={`tel:${contactSettings.phone.replace(/[^0-9+]/g, '')}`} className="text-white font-bold hover:text-blue-400 transition-colors">
                  {contactSettings.phone}
                </a>
              </div>
            </div>

            {/* Contact Email */}
            <div className="flex items-start gap-2.5">
              <Mail size={15} className="text-blue-500 shrink-0 mt-0.5" />
              <div className="flex flex-col">
                <span className="text-[11px] text-slate-500 uppercase font-semibold">Inquiries &amp; Quotations</span>
                <a href={`mailto:${contactSettings.email}`} className="text-slate-200 hover:text-white hover:underline transition-colors font-medium">
                  {contactSettings.email}
                </a>
              </div>
            </div>

            {/* HQ Address */}
            <div className="flex items-start gap-2.5">
              <MapPin size={15} className="text-blue-500 shrink-0 mt-0.5" />
              <div className="flex flex-col">
                <span className="text-[11px] text-slate-500 uppercase font-semibold">Global Headquarters</span>
                <span className="text-slate-300 leading-tight">
                  {contactSettings.address}
                </span>
              </div>
            </div>
          </div>

          {/* Dynamic Social Icons */}
          <div className="mt-5 pt-4 border-t border-slate-800/40 flex items-center justify-between">
            <div className="flex items-center gap-3">
              {contactSettings.socialLinks
                .filter((l) => l.isActive)
                .map((link) => {
                  const name = (link.iconPresetName || link.platform || "").toLowerCase();
                  let IconComponent = Globe;
                  if (name.includes("face")) IconComponent = Facebook;
                  else if (name.includes("insta")) IconComponent = Instagram;
                  else if (name.includes("link")) IconComponent = Linkedin;
                  else if (name.includes("twit") || name.includes("x")) IconComponent = Twitter;
                  else if (name.includes("you") || name.includes("tube")) IconComponent = Youtube;
                  else if (name.includes("what")) IconComponent = MessageSquare;

                  return (
                    <a
                      key={link.id}
                      href={link.url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-slate-400 hover:text-white transition-colors flex items-center justify-center"
                      aria-label={`${link.platform} link`}
                      title={link.platform}
                    >
                      {link.iconType === "custom_upload" && link.customIconUrl ? (
                        <img
                          src={link.customIconUrl}
                          alt={link.platform}
                          className="w-4 h-4 object-cover rounded-xs"
                        />
                      ) : (
                        <IconComponent size={16} />
                      )}
                    </a>
                  );
                })}
            </div>
          </div>
        </div>

      </div>

      {/* Footer Bottom Fine Print */}
      <div className="max-w-[1280px] mx-auto px-8 mt-12 pt-6 border-t border-slate-900 text-[11px] text-slate-500 flex flex-col md:flex-row justify-between items-center gap-4 w-full">
        <div className="text-center md:text-left">
          <p>© {currentYear} Cool Technologies. All Rights Reserved. ISO 9001:2015 Registered Supplier.</p>
          <p className="mt-1 text-[10px] text-slate-600 leading-normal max-w-4xl">
            All manufacturer logos, brand trademarks (Daikin, Midea, Mitsubishi, LG, Carrier, Honeywell) are the properties of their respective registered owners and used solely for identification purposes.
          </p>
        </div>
        <div className="flex flex-wrap gap-5 font-semibold text-slate-400 justify-center md:justify-end text-xs">
          <button
            type="button"
            onClick={() => onOpenTerms ? onOpenTerms() : (window.location.hash = "#/terms")}
            className="hover:text-white transition-colors cursor-pointer"
          >
            Terms & Conditions
          </button>
          <span className="text-slate-700 hidden sm:inline">·</span>
          <button
            type="button"
            onClick={() => onOpenPrivacy ? onOpenPrivacy() : (window.location.hash = "#/privacy")}
            className="hover:text-white transition-colors cursor-pointer"
          >
            Privacy Policy
          </button>
        </div>
      </div>
    </footer>
  );
}
