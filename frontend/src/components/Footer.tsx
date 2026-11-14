import React, { useState, useEffect } from "react";
import {
  Linkedin, Twitter, Facebook, Sparkles,
  Phone, Mail, MapPin, ArrowUpRight, Instagram, Youtube, MessageSquare, Globe
} from "lucide-react";
import {
  getGeneralSettings,
  DEFAULT_SOCIAL_LINKS,
  DEFAULT_PHONE_CONTACTS,
  DEFAULT_EMAIL_CONTACTS
} from "../services/generalSettingsService";
import { getCategories, getLocalCategories } from "../services/categoryService";
import { getLocalServicesCache, subscribeToServices } from "../services/serviceService";
import { DynamicSocialLink, DynamicContactNumber, DynamicContactEmail, Category, ServiceItem } from "../types";
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
      whatsapp: s.whatsapp || "+971 2 565 0123",
      phoneContacts: (s.phoneContacts && s.phoneContacts.length > 0 ? s.phoneContacts : DEFAULT_PHONE_CONTACTS),
      emailContacts: (s.emailContacts && s.emailContacts.length > 0 ? s.emailContacts : DEFAULT_EMAIL_CONTACTS),
      departmentHotlines: s.departmentHotlines,
      whatsappSettings: s.whatsappSettings,
      address: s.address || "Mussafah M-14, Abu Dhabi, United Arab Emirates",
      socialLinks: (s.socialLinks && s.socialLinks.length > 0 ? s.socialLinks : DEFAULT_SOCIAL_LINKS)
    };
  });

  useEffect(() => {
    const update = () => {
      const s = getGeneralSettings();
      setContactSettings({
        phone: s.phone || "+971 2 565 0123",
        email: s.email || "info@cooltechuae.com",
        whatsapp: s.whatsapp || "+971 2 565 0123",
        phoneContacts: (s.phoneContacts && s.phoneContacts.length > 0 ? s.phoneContacts : DEFAULT_PHONE_CONTACTS),
        emailContacts: (s.emailContacts && s.emailContacts.length > 0 ? s.emailContacts : DEFAULT_EMAIL_CONTACTS),
        departmentHotlines: s.departmentHotlines,
        whatsappSettings: s.whatsappSettings,
        address: s.address || "Mussafah M-14, Abu Dhabi, United Arab Emirates",
        socialLinks: (s.socialLinks && s.socialLinks.length > 0 ? s.socialLinks : DEFAULT_SOCIAL_LINKS)
      });
    };
    window.addEventListener("cooltech_contact_settings_updated", update);
    window.addEventListener("cooltech_settings_updated", update);
    window.addEventListener("cooltech_general_settings_updated", update);
    window.addEventListener("storage", update);
    return () => {
      window.removeEventListener("cooltech_contact_settings_updated", update);
      window.removeEventListener("cooltech_settings_updated", update);
      window.removeEventListener("cooltech_general_settings_updated", update);
      window.removeEventListener("storage", update);
    };
  }, []);

  const [categories, setCategories] = useState<Category[]>(() => {
    return getLocalCategories().filter((c) => c.status !== "inactive");
  });

  useEffect(() => {
    let isMounted = true;
    getCategories().then((cats) => {
      if (isMounted && cats && cats.length > 0) {
        setCategories(cats.filter((c) => c.status !== "inactive"));
      }
    });

    const onCategoriesUpdated = (e: any) => {
      const updated = e.detail || getLocalCategories();
      if (Array.isArray(updated)) {
        setCategories(updated.filter((c: Category) => c.status !== "inactive"));
      }
    };

    window.addEventListener("cooltech_categories_updated", onCategoriesUpdated);
    window.addEventListener("storage", onCategoriesUpdated);
    return () => {
      isMounted = false;
      window.removeEventListener("cooltech_categories_updated", onCategoriesUpdated);
      window.removeEventListener("storage", onCategoriesUpdated);
    };
  }, []);

  const [services, setServices] = useState<ServiceItem[]>(() => {
    return getLocalServicesCache().filter((s) => s.isActive !== false);
  });

  useEffect(() => {
    const unsubscribe = subscribeToServices((updated) => {
      if (Array.isArray(updated) && updated.length > 0) {
        setServices(updated.filter((s) => s.isActive !== false));
      }
    });
    return () => unsubscribe();
  }, []);

  const handleCategoryClick = (cat: string | null) => {
    onCategorySelect(cat);
    const targetHash = cat ? `#/products?category=${encodeURIComponent(cat)}` : "#/products";
    window.location.hash = targetHash;
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

  // Department & channel resolution matching Contact Page
  const salesPhone = contactSettings.departmentHotlines?.salesPhone ||
    contactSettings.phoneContacts?.find((p) => p.title?.toLowerCase().includes("sale"))?.number ||
    "+971 2 815 6111";
  const salesEmail = contactSettings.departmentHotlines?.salesEmail ||
    contactSettings.emailContacts?.find((e) => e.title?.toLowerCase().includes("sale"))?.email ||
    "sales@cooltechuae.com";

  const servicesPhone = contactSettings.departmentHotlines?.servicesEmergencyPhone ||
    contactSettings.phoneContacts?.find((p) => p.title?.toLowerCase().includes("service"))?.number ||
    "+971 2 815 6161";
  const servicesEmail = contactSettings.departmentHotlines?.servicesEmail ||
    contactSettings.emailContacts?.find((e) => e.title?.toLowerCase().includes("service") || e.email?.toLowerCase().includes("care"))?.email ||
    "care@cooltechuae.com";

  const whatsappNumber = contactSettings.whatsappSettings?.contactPageWhatsappNumber ||
    contactSettings.whatsapp ||
    "+971 2 565 0123";

  return (
    <footer className="w-full bg-[#031124] text-slate-300 font-sans pt-16 pb-8 border-t border-slate-900" id="footer-section">
      <div className="max-w-[1280px] mx-auto px-6 sm:px-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-6 xl:gap-8 w-full">

        {/* Column 1: Company Profile (3 cols) */}
        <div className="lg:col-span-3 text-left flex flex-col justify-between">
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

        {/* Column 2: Product Categories (2 cols) */}
        <div className="lg:col-span-2 text-left">
          <h4 className="text-white text-xs font-bold uppercase tracking-wider border-b border-slate-800/80 pb-2 mb-4">
            Categories
          </h4>
          <ul className="flex flex-col gap-2.5 text-[13px] text-slate-400 font-medium">
            {categories.map((cat) => (
              <li key={cat.id || cat.slug || cat.name}>
                <a
                  href={`#/products?category=${encodeURIComponent(cat.name)}`}
                  onClick={(e) => {
                    e.preventDefault();
                    handleCategoryClick(cat.name);
                  }}
                  className="hover:text-white hover:underline transition-colors cursor-pointer text-left block truncate"
                  title={cat.name}
                >
                  {cat.name}
                </a>
              </li>
            ))}
            <li className="pt-1 border-t border-slate-800/40 mt-1">
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

        {/* Column 3: Services (2 cols) */}
        <div className="lg:col-span-2 text-left">
          <h4 className="text-white text-xs font-bold uppercase tracking-wider border-b border-slate-800/80 pb-2 mb-4">
            Services
          </h4>
          <ul className="flex flex-col gap-2.5 text-[13px] text-slate-400 font-medium">
            {services.map((svc) => (
              <li key={svc.id}>
                <a
                  href="#/services"
                  onClick={(e) => {
                    e.preventDefault();
                    window.location.hash = "#/services";
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  className="hover:text-white hover:underline transition-colors cursor-pointer text-left block truncate"
                  title={svc.title}
                >
                  {svc.title}
                </a>
              </li>
            ))}
            <li className="pt-1 border-t border-slate-800/40 mt-1">
              <a
                href="#/services"
                onClick={(e) => {
                  e.preventDefault();
                  window.location.hash = "#/services";
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                className="text-cyan-400 font-bold hover:text-cyan-300 transition-colors flex items-center gap-1"
              >
                <span>Explore All Services →</span>
              </a>
            </li>
          </ul>
        </div>

        {/* Column 4: Corporate Pages (2 cols) */}
        <div className="lg:col-span-2 text-left">
          <h4 className="text-white text-xs font-bold uppercase tracking-wider border-b border-slate-800/80 pb-2 mb-4">
            Discover
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
                href="#/spare-parts"
                onClick={(e) => {
                  e.preventDefault();
                  window.location.hash = "#/spare-parts";
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                className="hover:text-white hover:underline transition-colors cursor-pointer text-left block"
              >
                Spare Parts Catalog
              </a>
            </li>
            <li>
              <a
                href="#/brands"
                onClick={(e) => {
                  e.preventDefault();
                  window.location.hash = "#/brands";
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                className="hover:text-white hover:underline transition-colors cursor-pointer text-left block"
              >
                Brand Directory
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
            {/* Media link temporarily hidden
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
            */}
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
            Contact Details
          </h4>

          <div className="flex flex-col gap-3.5 text-[12px] text-slate-400">

            {/* 1. Telephone Number + Email ID (info@) */}
            <div className="space-y-1.5 pb-2.5 border-b border-slate-800/50">
              <span className="text-[10px] text-cyan-400 font-extrabold uppercase tracking-wider block">
                General Inquiries
              </span>
              <div className="flex items-center gap-2">
                <Phone size={13} className="text-blue-400 shrink-0" />
                <a
                  href={`tel:${contactSettings.phone.replace(/[^0-9+]/g, '')}`}
                  className="text-white font-bold hover:text-blue-400 transition-colors font-mono text-xs"
                >
                  {contactSettings.phone}
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Mail size={13} className="text-blue-400 shrink-0" />
                <a
                  href={`mailto:${contactSettings.email}`}
                  className="text-slate-300 hover:text-white hover:underline transition-colors text-xs truncate"
                >
                  {contactSettings.email}
                </a>
              </div>
            </div>

            {/* 2. Sales Mobile Number + Sales Email ID */}
            <div className="space-y-1.5 pb-2.5 border-b border-slate-800/50">
              <span className="text-[10px] text-cyan-400 font-extrabold uppercase tracking-wider block">
                Sales
              </span>
              <div className="flex items-center gap-2">
                <Phone size={13} className="text-blue-400 shrink-0" />
                <a
                  href={`tel:${salesPhone.replace(/[^0-9+]/g, '')}`}
                  className="text-white font-bold hover:text-blue-400 transition-colors font-mono text-xs"
                >
                  {salesPhone}
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Mail size={13} className="text-blue-400 shrink-0" />
                <a
                  href={`mailto:${salesEmail}`}
                  className="text-slate-300 hover:text-white hover:underline transition-colors text-xs truncate"
                >
                  {salesEmail}
                </a>
              </div>
            </div>

            {/* 3. Service Mobile Number + Service Email ID */}
            <div className="space-y-1.5 pb-2.5 border-b border-slate-800/50">
              <span className="text-[10px] text-cyan-400 font-extrabold uppercase tracking-wider block">
                Services
              </span>
              <div className="flex items-center gap-2">
                <Phone size={13} className="text-blue-400 shrink-0" />
                <a
                  href={`tel:${servicesPhone.replace(/[^0-9+]/g, '')}`}
                  className="text-white font-bold hover:text-blue-400 transition-colors font-mono text-xs"
                >
                  {servicesPhone}
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Mail size={13} className="text-blue-400 shrink-0" />
                <a
                  href={`mailto:${servicesEmail}`}
                  className="text-slate-300 hover:text-white hover:underline transition-colors text-xs truncate"
                >
                  {servicesEmail}
                </a>
              </div>
            </div>

            {/* 4. WhatsApp Number (Separately) */}
            <div className="space-y-1.5 pb-2.5 border-b border-slate-800/50">
              <span className="text-[10px] text-emerald-400 font-extrabold uppercase tracking-wider block">
                WhatsApp
              </span>
              <div className="flex items-center gap-2">
                <MessageSquare size={13} className="text-emerald-400 shrink-0" />
                <a
                  href={`https://wa.me/${whatsappNumber.replace(/[^0-9]/g, '')}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-white font-bold hover:text-emerald-300 transition-colors font-mono text-xs"
                >
                  {whatsappNumber}
                </a>
              </div>
            </div>

            {/* 5. Location */}
            <div className="space-y-1 pt-0.5">
              <span className="text-[10px] text-slate-500 font-extrabold uppercase tracking-wider block">
                Location
              </span>
              <div className="flex items-start gap-2 text-xs">
                <MapPin size={13} className="text-blue-400 shrink-0 mt-0.5" />
                <span className="text-slate-300 leading-tight text-[11px]">
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
          <p>© {currentYear} Cool Technologies. All Rights Reserved. ICV Certified Supplier.</p>
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
