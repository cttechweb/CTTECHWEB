/* ─────────────────────────────────────────────────────────────────
   Cool Technologies — General Settings & Dynamic Content Service
   Handles dynamic global configurations, brand partners, and achievements.
───────────────────────────────────────────────────────────────── */

import { 
  BrandPartner, 
  GeneralSiteSettings, 
  AchievementMilestone, 
  CompanyBranch, 
  ContactFaqItem, 
  EmailIntegrationSettings,
  DynamicSocialLink,
  WhatsAppRoutingSettings,
  DepartmentHotlines
} from "../types";
import { apiClient } from "./apiClient";

const LOCAL_STORAGE_SETTINGS_KEY = "cooltech_general_settings_v1";

export const DEFAULT_SOCIAL_LINKS: DynamicSocialLink[] = [
  {
    id: "social-facebook",
    platform: "Facebook",
    url: "https://facebook.com",
    iconType: "preset",
    iconPresetName: "Facebook",
    isActive: true,
    order: 1
  },
  {
    id: "social-linkedin",
    platform: "LinkedIn",
    url: "https://linkedin.com",
    iconType: "preset",
    iconPresetName: "Linkedin",
    isActive: true,
    order: 2
  },
  {
    id: "social-instagram",
    platform: "Instagram",
    url: "https://instagram.com",
    iconType: "preset",
    iconPresetName: "Instagram",
    isActive: true,
    order: 3
  },
  {
    id: "social-twitter",
    platform: "Twitter / X",
    url: "https://twitter.com",
    iconType: "preset",
    iconPresetName: "Twitter",
    isActive: true,
    order: 4
  }
];

export const DEFAULT_WHATSAPP_SETTINGS: WhatsAppRoutingSettings = {
  floatingWidgetEnabled: true,
  floatingPhoneNumber: "+971 50 123 4567",
  floatingPrefilledMessage: "Hello Cool Technologies, I would like to inquire about commercial cooling equipment.",
  floatingButtonPosition: "bottom-right",
  emailAutoReplyWhatsappNumber: "+971 50 123 4567",
  contactPageWhatsappNumber: "+971 50 123 4567"
};

export const DEFAULT_DEPARTMENT_HOTLINES: DepartmentHotlines = {
  salesPhone: "+971 2 815 6111",
  servicesEmergencyPhone: "+971 2 565 0123",
  mediaPressEmail: "media@cooltechuae.com",
  pressDeskPhone: "+971 2 555 1234",
  pressWhatsapp: "+971 50 123 4567",
  legalEmail: "legal@cooltechuae.com",
  privacyEmail: "privacy@cooltechuae.com"
};

export const DEFAULT_EMAIL_SETTINGS: EmailIntegrationSettings = {
  isEnabled: true,
  brevoApiKey: (import.meta as any).env?.VITE_BREVO_API_KEY || "",
  brevoSenderEmail: (import.meta as any).env?.VITE_BREVO_SENDER_EMAIL || "ctauhweb@gmail.com",
  brevoSenderName: "Cool Technologies",
  autoReplyEnabled: true,
  serviceId: "service_e15ue4f",
  templateId: "template_zsrk1gr",
  publicKey: "DrbGF7UqaCguvp7MF",
  defaultReceivingEmail: "sales@cooltechuae.com",
  orderReceivingEmail: "",
  rfqReceivingEmail: "",
  contactReceivingEmail: "",
  partnerReceivingEmail: "",
  careerReceivingEmail: "",
  reviewReceivingEmail: "",
  accountReceivingEmail: "",
  loginReceivingEmail: "",
  notifyOnSignup: true,
  notifyOnLogin: true,
  notifyOnB2B: true,
};

export const DEFAULT_CONTACT_FAQS: ContactFaqItem[] = [
  {
    id: "faq-hours",
    question: "What are your official office and warehouse working hours?",
    answer: "Our Abu Dhabi Mussafah facility and regional branches are open Monday to Saturday from 8:00 AM to 7:00 PM GST. Emergency technical dispatch is available 24/7.",
    category: "General",
    order: 1,
    isActive: true
  },
  {
    id: "faq-quote",
    question: "How fast can I receive a wholesale quote for industrial cooling equipment?",
    answer: "For standard inquiries submitted through our online selection engine or contact form, our sales engineering desk provides official proforma quotations within 1 to 2 business hours.",
    category: "Quotations",
    order: 2,
    isActive: true
  },
  {
    id: "faq-delivery",
    question: "Do you supply and deliver across all UAE Emirates?",
    answer: "Yes, we provide direct wholesale distribution and site delivery with dedicated heavy flatbed logistics across Abu Dhabi, Dubai, Sharjah, Ajman, Ras Al Khaimah, Fujairah, and Umm Al Quwain.",
    category: "Logistics",
    order: 3,
    isActive: true
  },
  {
    id: "faq-inspect",
    question: "Can I inspect equipment before delivery at your Mussafah warehouse?",
    answer: "Yes, contractors and corporate buyers are welcome to visit our Mussafah M-42 warehouse depot to inspect chillers, compressors, and DX coils prior to scheduled project site dispatch.",
    category: "Facility",
    order: 4,
    isActive: true
  }
];

export const DEFAULT_BRANCHES: CompanyBranch[] = [
  {
    id: "branch-abudhabi",
    name: "Abu Dhabi Main Headquarters",
    city: "Abu Dhabi",
    address: "Plot-99, Sector M-42 / M-14, Mussafah Industrial Area, Abu Dhabi, UAE",
    phone: "+971 2 565 0123",
    mobile: "+971 50 123 4567",
    email: "info@cooltechuae.com",
    workingHours: "Monday - Saturday: 8:00 AM - 7:00 PM (GST)",
    mapUrl: "https://maps.google.com/?q=Mussafah+Industrial+Area+Abu+Dhabi",
    mapEmbedUrl: "https://maps.google.com/maps?q=Plot-99+Mussafah+Industrial+Area+M-42+Abu+Dhabi+UAE&t=&z=14&ie=UTF8&iwloc=&output=embed",
    isHeadquarters: true,
    isActive: true,
    order: 1
  },
  {
    id: "branch-dubai",
    name: "Dubai Commercial & Logistics Hub",
    city: "Dubai",
    address: "Street 18B, Warehouse #4, Al Quoz Industrial Area 3, Dubai, UAE",
    phone: "+971 4 345 6789",
    mobile: "+971 55 987 6543",
    email: "dubai@cooltechuae.com",
    workingHours: "Monday - Saturday: 8:30 AM - 6:30 PM (GST)",
    mapUrl: "https://maps.google.com/?q=Al+Quoz+Industrial+Area+3+Dubai",
    mapEmbedUrl: "https://maps.google.com/maps?q=Al+Quoz+Industrial+Area+3+Dubai+UAE&t=&z=14&ie=UTF8&iwloc=&output=embed",
    isHeadquarters: false,
    isActive: true,
    order: 2
  },
  {
    id: "branch-sharjah",
    name: "Sharjah & Northern Emirates Regional Depot",
    city: "Sharjah",
    address: "Industrial Area 12, Behind Safeer Mall, Sharjah, UAE",
    phone: "+971 6 534 8822",
    mobile: "+971 52 456 7890",
    email: "sharjah@cooltechuae.com",
    workingHours: "Monday - Saturday: 8:00 AM - 6:00 PM (GST)",
    mapUrl: "https://maps.google.com/?q=Industrial+Area+12+Sharjah",
    mapEmbedUrl: "https://maps.google.com/maps?q=Industrial+Area+12+Sharjah+UAE&t=&z=14&ie=UTF8&iwloc=&output=embed",
    isHeadquarters: false,
    isActive: true,
    order: 3
  },
  {
    id: "branch-alain",
    name: "Al Ain Sourcing Center",
    city: "Al Ain",
    address: "Sanaiya Industrial Area, Block 4, Al Ain, Abu Dhabi, UAE",
    phone: "+971 3 766 5544",
    email: "alain@cooltechuae.com",
    workingHours: "Monday - Saturday: 8:00 AM - 6:00 PM (GST)",
    mapUrl: "https://maps.google.com/?q=Sanaiya+Industrial+Al+Ain",
    mapEmbedUrl: "https://maps.google.com/maps?q=Sanaiya+Industrial+Al+Ain+UAE&t=&z=14&ie=UTF8&iwloc=&output=embed",
    isHeadquarters: false,
    isActive: true,
    order: 4
  }
];

export const DEFAULT_BRAND_PARTNERS: BrandPartner[] = [
  {
    id: "brand-daikin",
    name: "DAIKIN",
    displayType: "text",
    tagline: "Air Conditioning",
    websiteUrl: "https://www.daikin.com",
    order: 1,
    isActive: true
  },
  {
    id: "brand-midea",
    name: "Midea",
    displayType: "text",
    tagline: "Commercial HVAC",
    websiteUrl: "https://www.midea.com",
    order: 2,
    isActive: true
  },
  {
    id: "brand-panasonic",
    name: "Panasonic",
    displayType: "text",
    tagline: "Cooling & Heating",
    websiteUrl: "https://www.panasonic.com",
    order: 3,
    isActive: true
  },
  {
    id: "brand-mitsubishi",
    name: "MITSUBISHI HEAVY INDUSTRIES",
    displayType: "text",
    tagline: "Heavy Industries",
    websiteUrl: "https://www.mhi.com",
    order: 4,
    isActive: true
  },
  {
    id: "brand-lg",
    name: "LG",
    displayType: "text",
    tagline: "Electronics & Air",
    websiteUrl: "https://www.lg.com",
    order: 5,
    isActive: true
  },
  {
    id: "brand-samsung",
    name: "SAMSUNG",
    displayType: "text",
    tagline: "Climate Solutions",
    websiteUrl: "https://www.samsung.com",
    order: 6,
    isActive: true
  },
  {
    id: "brand-york",
    name: "YORK",
    displayType: "text",
    tagline: "Chillers & AHU",
    websiteUrl: "https://www.york.com",
    order: 7,
    isActive: true
  },
  {
    id: "brand-carrier",
    name: "Carrier",
    displayType: "text",
    tagline: "Turn to the Experts",
    websiteUrl: "https://www.carrier.com",
    order: 8,
    isActive: true
  }
];

export const DEFAULT_ACHIEVEMENTS: AchievementMilestone[] = [
  {
    id: "achieve-2012",
    year: "2012",
    title: "Established",
    subtitle: "Inception of Cool Technologies",
    description: "Established Cool Technologies in the UAE, setting out to serve commercial and industrial HVAC and temperature control markets with pristine technical engineering.",
    color: "rgb(193, 36, 91)", // Pink/Magenta
    borderColor: "rgba(193, 36, 91, 0.4)",
    lightBg: "rgba(193, 36, 91, 0.05)",
    iconName: "Building",
    position: "up",
    order: 1,
    isActive: true
  },
  {
    id: "achieve-2014",
    year: "2014",
    title: "Introduced COOLTECH Brand",
    subtitle: "Water Coolers & Tank Chillers",
    description: "Launched our proprietary COOLTECH brand of heavy-duty industrial water coolers, drinking stations, and tank chilling systems built for the high ambient Gulf environment.",
    dealerships: ["Whirlpool", "Frigidaire", "Mabe", "Bekon", "Igma", "Blue Star", "Gree"],
    color: "rgb(0, 130, 166)", // Light Blue
    borderColor: "rgba(0, 130, 166, 0.4)",
    lightBg: "rgba(0, 130, 166, 0.05)",
    iconName: "Award",
    position: "down",
    order: 2,
    isActive: true
  },
  {
    id: "achieve-2015",
    year: "2015",
    title: "Climate Control Scale-up",
    subtitle: "Expanded Compressor & Part Supply",
    description: "Established direct manufacturer channels for hermetic compressors, fan coils, and cooling spare parts to serve local contractors instantly.",
    color: "rgb(90, 51, 112)", // Purple
    borderColor: "rgba(90, 51, 112, 0.4)",
    lightBg: "rgba(90, 51, 112, 0.05)",
    iconName: "Compass",
    position: "up",
    order: 3,
    isActive: true
  },
  {
    id: "achieve-2016",
    year: "2016",
    title: "HVAC Project Contracting",
    subtitle: "Large-Scale Multi-System Execution",
    description: "Began delivering complete HVAC design, installation, and ductwork execution for labor accommodation camps, commercial towers, and complex industrial zones.",
    dealerships: ["Super General", "LG", "Akai", "Aux", "Westpoint"],
    color: "rgb(211, 114, 19)", // Orange
    borderColor: "rgba(211, 114, 19, 0.4)",
    lightBg: "rgba(211, 114, 19, 0.05)",
    iconName: "Zap",
    position: "down",
    order: 4,
    isActive: true
  },
  {
    id: "achieve-2017",
    year: "2017",
    title: "Centralized Drinking Stations",
    subtitle: "Public & Corporate Water Systems",
    description: "Designed and deployed custom heavy-duty centralized stainless steel water drinking stations for corporate, civil, and industrial facilities in UAE.",
    dealerships: ["Nikai", "Aftron", "Kedite"],
    color: "rgb(111, 136, 23)", // Lime Green
    borderColor: "rgba(111, 136, 23, 0.4)",
    lightBg: "rgba(111, 136, 23, 0.05)",
    iconName: "CheckCircle2",
    position: "up",
    order: 5,
    isActive: true
  },
  {
    id: "achieve-2018",
    year: "2018",
    title: "Dedicated Mechanical Service Desk",
    subtitle: "24/7 Servicing, Overhauling & Commissioning",
    description: "Inaugurated our specialized technical maintenance division providing rapid overhauling, performance audits, and warranty support for industrial air conditioners.",
    dealerships: ["Brema", "Hitachi", "Midea"],
    color: "rgb(15, 130, 120)", // Teal
    borderColor: "rgba(15, 130, 120, 0.4)",
    lightBg: "rgba(15, 130, 120, 0.05)",
    iconName: "Settings",
    position: "down",
    order: 6,
    isActive: true
  },
  {
    id: "achieve-2021",
    year: "2021",
    title: "Industrial Sourcing Directory",
    subtitle: "Net-30 Sourcing & Wholesale Hub",
    description: "Structured our direct commercial B2B procurement network. Formally added regional logistics hubs to enable direct factory wholesale routing.",
    dealerships: ["O General", "Daewoo"],
    color: "rgb(163, 63, 57)", // Red/Brown
    borderColor: "rgba(163, 63, 57, 0.4)",
    lightBg: "rgba(163, 63, 57, 0.05)",
    iconName: "Star",
    position: "up",
    order: 7,
    isActive: true
  },
  {
    id: "achieve-2022",
    year: "2022",
    title: "Advanced HVAC Integrations",
    subtitle: "Authorized Premium Multi-Brand Partner",
    description: "Fully consolidated our position as a master B2B mechanical distributor in the UAE, adding leading heavy commercial VRF and chiller agencies.",
    dealerships: ["Mitsubishi", "Samsung", "Bompani", "Chigo", "Nobel", "Olefini", "Haier", "Coolex"],
    color: "rgb(5, 79, 142)", // Dark Blue
    borderColor: "rgba(5, 79, 142, 0.4)",
    lightBg: "rgba(5, 79, 142, 0.05)",
    iconName: "HeartHandshake",
    position: "down",
    order: 8,
    isActive: true
  },
  {
    id: "achieve-2024",
    year: "2024",
    title: "Clivet Best Performer Award",
    subtitle: "Commercial Cooling Excellence",
    description: "Honored with the Clivet Best Performer Award in 2024 for exceptional HVAC equipment distribution, project delivery, and high-efficiency chiller engineering.",
    dealerships: ["Clivet"],
    color: "rgb(2, 132, 199)", // Sky Blue
    borderColor: "rgba(2, 132, 199, 0.4)",
    lightBg: "rgba(2, 132, 199, 0.05)",
    iconName: "Clivet",
    position: "up",
    order: 9,
    isActive: true,
    image: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?q=80&w=1200&auto=format&fit=crop",
    imageOpacity: 0.3
  },
  {
    id: "achieve-2025",
    year: "2025",
    title: "Blue Star Best Performance Award",
    subtitle: "Dealership: HISENSE, TCL HVAC & KELON",
    description: "Awarded the Blue Star Best Performance Award in 2025 and expanded official dealership partnerships with HISENSE, TCL HVAC, and KELON cooling platforms.",
    dealerships: ["Blue Star", "Hisense", "TCL HVAC", "Kelon"],
    color: "rgb(30, 58, 138)", // Navy Blue
    borderColor: "rgba(30, 58, 138, 0.4)",
    lightBg: "rgba(30, 58, 138, 0.05)",
    iconName: "Award",
    position: "down",
    order: 10,
    isActive: true,
    image: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?q=80&w=1200&auto=format&fit=crop",
    imageOpacity: 0.3
  }
];

export const DEFAULT_SETTINGS: GeneralSiteSettings = {
  companyName: "Cool Technologies LLC",
  tagline: "The Experts in Commercial & Industrial Cooling",
  email: "info@cooltechuae.com",
  phone: "+971 2 565 0123",
  whatsapp: "+971 50 123 4567",
  address: "Mussafah M-14, Abu Dhabi, United Arab Emirates",
  locationMapUrl: "https://maps.google.com",
  workingHours: "Monday - Saturday: 8:00 AM - 7:00 PM (GST)",
  brandPartners: DEFAULT_BRAND_PARTNERS,
  achievements: DEFAULT_ACHIEVEMENTS,
  branches: DEFAULT_BRANCHES,
  contactFaqs: DEFAULT_CONTACT_FAQS,
  brandTickerSpeed: 25,
  achievementBgOpacity: 0.3,
  storageProvider: "cloudflare",
  cloudflareUploadEndpoint: "https://cooltech-api-worker.ctauhweb.workers.dev/api/upload",
  cloudflarePublicDomain: "https://pub-0fd8611859e54ef6af47da7f5d49fab4.r2.dev",
  emailIntegration: DEFAULT_EMAIL_SETTINGS,
  socialLinks: DEFAULT_SOCIAL_LINKS,
  whatsappSettings: DEFAULT_WHATSAPP_SETTINGS,
  departmentHotlines: DEFAULT_DEPARTMENT_HOTLINES,
  updatedAt: new Date().toISOString()
};

/**
 * Notify all listening components that settings were updated
 */
function notifySettingsChange() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("cooltech_settings_updated"));
    window.dispatchEvent(new Event("cooltech_contact_settings_updated"));
    window.dispatchEvent(new Event("cooltech_general_settings_updated"));
  }
}

/**
 * Fetch general site settings
 */
export function getGeneralSettings(): GeneralSiteSettings {
  try {
    const saved = localStorage.getItem(LOCAL_STORAGE_SETTINGS_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      return {
        ...DEFAULT_SETTINGS,
        ...parsed,
        storageProvider: parsed.storageProvider || "cloudflare",
        cloudflareUploadEndpoint: parsed.cloudflareUploadEndpoint || "https://cooltech-api-worker.ctauhweb.workers.dev/api/upload",
        cloudflarePublicDomain: parsed.cloudflarePublicDomain || "https://pub-0fd8611859e54ef6af47da7f5d49fab4.r2.dev",
        brandPartners: parsed.brandPartners && Array.isArray(parsed.brandPartners) && parsed.brandPartners.length > 0
          ? parsed.brandPartners
          : DEFAULT_BRAND_PARTNERS,
        achievements: parsed.achievements && Array.isArray(parsed.achievements) && parsed.achievements.length > 0
          ? parsed.achievements
          : DEFAULT_ACHIEVEMENTS,
        branches: parsed.branches !== undefined && Array.isArray(parsed.branches)
          ? parsed.branches
          : DEFAULT_BRANCHES,
        contactFaqs: parsed.contactFaqs !== undefined && Array.isArray(parsed.contactFaqs)
          ? parsed.contactFaqs
          : DEFAULT_CONTACT_FAQS,
        socialLinks: parsed.socialLinks !== undefined && Array.isArray(parsed.socialLinks) && parsed.socialLinks.length > 0
          ? parsed.socialLinks
          : DEFAULT_SOCIAL_LINKS,
        whatsappSettings: parsed.whatsappSettings
          ? { ...DEFAULT_WHATSAPP_SETTINGS, ...parsed.whatsappSettings }
          : DEFAULT_WHATSAPP_SETTINGS,
        departmentHotlines: parsed.departmentHotlines
          ? { ...DEFAULT_DEPARTMENT_HOTLINES, ...parsed.departmentHotlines }
          : DEFAULT_DEPARTMENT_HOTLINES,
        emailIntegration: parsed.emailIntegration
          ? {
              ...DEFAULT_EMAIL_SETTINGS,
              ...parsed.emailIntegration,
              brevoApiKey: (parsed.emailIntegration.brevoApiKey || "").trim() || DEFAULT_EMAIL_SETTINGS.brevoApiKey,
              brevoSenderEmail: (parsed.emailIntegration.brevoSenderEmail || "").trim() || DEFAULT_EMAIL_SETTINGS.brevoSenderEmail,
              brevoSenderName: (parsed.emailIntegration.brevoSenderName || "").trim() || DEFAULT_EMAIL_SETTINGS.brevoSenderName,
              serviceId: (parsed.emailIntegration.serviceId || "").trim() || DEFAULT_EMAIL_SETTINGS.serviceId,
              templateId: (parsed.emailIntegration.templateId || "").trim() || DEFAULT_EMAIL_SETTINGS.templateId,
              publicKey: (parsed.emailIntegration.publicKey || "").trim() || DEFAULT_EMAIL_SETTINGS.publicKey,
            }
          : DEFAULT_EMAIL_SETTINGS,
      };
    }
  } catch (err) {
    console.warn("[GeneralSettingsService] Error reading settings from localStorage:", err);
  }
  return DEFAULT_SETTINGS;
}

/**
 * Get Social Links
 */
export function getSocialLinks(): DynamicSocialLink[] {
  const settings = getGeneralSettings();
  return (settings.socialLinks || DEFAULT_SOCIAL_LINKS).slice().sort((a, b) => a.order - b.order);
}

/**
 * Save Social Links
 */
export function saveSocialLinks(links: DynamicSocialLink[]): DynamicSocialLink[] {
  const current = getGeneralSettings();
  saveGeneralSettings({
    ...current,
    socialLinks: links
  });
  return links;
}

/**
 * Get WhatsApp Routing Settings
 */
export function getWhatsAppSettings(): WhatsAppRoutingSettings {
  const settings = getGeneralSettings();
  return settings.whatsappSettings || DEFAULT_WHATSAPP_SETTINGS;
}

/**
 * Save WhatsApp Routing Settings
 */
export function saveWhatsAppSettings(wa: WhatsAppRoutingSettings): WhatsAppRoutingSettings {
  const current = getGeneralSettings();
  saveGeneralSettings({
    ...current,
    whatsappSettings: wa,
    // Keep top-level whatsapp in sync
    whatsapp: wa.contactPageWhatsappNumber || wa.floatingPhoneNumber || current.whatsapp
  });
  return wa;
}

/**
 * Get Department Hotlines
 */
export function getDepartmentHotlines(): DepartmentHotlines {
  const settings = getGeneralSettings();
  return settings.departmentHotlines || DEFAULT_DEPARTMENT_HOTLINES;
}

/**
 * Save Department Hotlines
 */
export function saveDepartmentHotlines(hotlines: DepartmentHotlines): DepartmentHotlines {
  const current = getGeneralSettings();
  saveGeneralSettings({
    ...current,
    departmentHotlines: hotlines
  });
  return hotlines;
}

/**
 * Save Contact Center Settings (atomic update for all communications)
 */
export function saveContactCenterSettings(updates: Partial<GeneralSiteSettings>): GeneralSiteSettings {
  return saveGeneralSettings(updates);
}

/**
 * Get Email Integration Settings
 */
export function getEmailSettings(): EmailIntegrationSettings {
  const settings = getGeneralSettings();
  return settings.emailIntegration || DEFAULT_EMAIL_SETTINGS;
}

/**
 * Save Email Integration Settings
 */
export function saveEmailSettings(emailSettings: EmailIntegrationSettings): EmailIntegrationSettings {
  const current = getGeneralSettings();
  saveGeneralSettings({
    ...current,
    emailIntegration: emailSettings
  });
  return emailSettings;
}

/**
 * Save general site settings
 */
export function saveGeneralSettings(settings: Partial<GeneralSiteSettings>): GeneralSiteSettings {
  const current = getGeneralSettings();
  const updated: GeneralSiteSettings = {
    ...current,
    ...settings,
    updatedAt: new Date().toISOString()
  };

  try {
    localStorage.setItem(LOCAL_STORAGE_SETTINGS_KEY, JSON.stringify(updated));
    notifySettingsChange();
  } catch (err) {
    console.error("[GeneralSettingsService] Error saving settings:", err);
  }

  return updated;
}

/* ─────────────────────────────────────────────────────────────────
   BRAND PARTNERS CRUD HELPERS
───────────────────────────────────────────────────────────────── */

export function getBrandPartners(): BrandPartner[] {
  const settings = getGeneralSettings();
  return (settings.brandPartners || DEFAULT_BRAND_PARTNERS)
    .slice()
    .sort((a, b) => (a.order || 0) - (b.order || 0));
}

export function saveBrandPartners(partners: BrandPartner[]): BrandPartner[] {
  const current = getGeneralSettings();
  saveGeneralSettings({
    ...current,
    brandPartners: partners
  });
  // Sync to Cloudflare D1
  partners.forEach((p) => {
    apiClient.createBrand(p).catch(() => {});
  });
  return partners;
}

export function addBrandPartner(partner: Omit<BrandPartner, "id" | "createdAt" | "updatedAt">): BrandPartner {
  const partners = getBrandPartners();
  const newPartner: BrandPartner = {
    ...partner,
    id: `brand-${Date.now()}`,
    order: partners.length + 1,
    isActive: partner.isActive !== false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  partners.push(newPartner);
  saveBrandPartners(partners);
  apiClient.createBrand(newPartner).catch(() => {});
  return newPartner;
}

export function updateBrandPartner(partner: BrandPartner): BrandPartner {
  const partners = getBrandPartners();
  const index = partners.findIndex((p) => p.id === partner.id);
  if (index !== -1) {
    partners[index] = {
      ...partner,
      updatedAt: new Date().toISOString()
    };
    saveBrandPartners(partners);
    apiClient.updateBrand(partner.id, partners[index]).catch(() => {});
  }
  return partner;
}

export function deleteBrandPartner(id: string): boolean {
  const partners = getBrandPartners();
  const filtered = partners.filter((p) => p.id !== id);
  if (filtered.length !== partners.length) {
    const reordered = filtered.map((p, idx) => ({ ...p, order: idx + 1 }));
    saveBrandPartners(reordered);
    apiClient.deactivateBrand(id).catch(() => {});
    return true;
  }
  return false;
}

export function moveBrandPartner(id: string, direction: "up" | "down"): BrandPartner[] {
  const partners = getBrandPartners();
  const index = partners.findIndex((p) => p.id === id);
  if (index === -1) return partners;

  if (direction === "up" && index > 0) {
    const temp = partners[index];
    partners[index] = partners[index - 1];
    partners[index - 1] = temp;
  } else if (direction === "down" && index < partners.length - 1) {
    const temp = partners[index];
    partners[index] = partners[index + 1];
    partners[index + 1] = temp;
  }

  const reordered = partners.map((p, idx) => ({ ...p, order: idx + 1 }));
  saveBrandPartners(reordered);
  return reordered;
}

export function resetDefaultBrandPartners(): BrandPartner[] {
  saveBrandPartners(DEFAULT_BRAND_PARTNERS);
  return DEFAULT_BRAND_PARTNERS;
}

/* ─────────────────────────────────────────────────────────────────
   ACHIEVEMENTS TIMELINE CRUD HELPERS
───────────────────────────────────────────────────────────────── */

export function getAchievements(): AchievementMilestone[] {
  const settings = getGeneralSettings();
  return (settings.achievements || DEFAULT_ACHIEVEMENTS)
    .slice()
    .sort((a, b) => (a.order || 0) - (b.order || 0));
}

export function saveAchievements(achievements: AchievementMilestone[]): AchievementMilestone[] {
  const current = getGeneralSettings();
  saveGeneralSettings({
    ...current,
    achievements
  });
  return achievements;
}

export function addAchievement(milestone: Omit<AchievementMilestone, "id" | "createdAt" | "updatedAt">): AchievementMilestone {
  const items = getAchievements();
  const newMilestone: AchievementMilestone = {
    ...milestone,
    id: `achieve-${Date.now()}`,
    order: items.length + 1,
    isActive: milestone.isActive !== false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  items.push(newMilestone);
  saveAchievements(items);
  return newMilestone;
}

export function updateAchievement(milestone: AchievementMilestone): AchievementMilestone {
  const items = getAchievements();
  const index = items.findIndex((a) => a.id === milestone.id);
  if (index !== -1) {
    items[index] = {
      ...milestone,
      updatedAt: new Date().toISOString()
    };
    saveAchievements(items);
  }
  return milestone;
}

export function deleteAchievement(id: string): boolean {
  const items = getAchievements();
  const filtered = items.filter((a) => a.id !== id);
  if (filtered.length !== items.length) {
    const reordered = filtered.map((a, idx) => ({ ...a, order: idx + 1 }));
    saveAchievements(reordered);
    return true;
  }
  return false;
}

export function moveAchievement(id: string, direction: "up" | "down"): AchievementMilestone[] {
  const items = getAchievements();
  const index = items.findIndex((a) => a.id === id);
  if (index === -1) return items;

  if (direction === "up" && index > 0) {
    const temp = items[index];
    items[index] = items[index - 1];
    items[index - 1] = temp;
  } else if (direction === "down" && index < items.length - 1) {
    const temp = items[index];
    items[index] = items[index + 1];
    items[index + 1] = temp;
  }

  const reordered = items.map((a, idx) => ({ ...a, order: idx + 1 }));
  saveAchievements(reordered);
  return reordered;
}

export function resetDefaultAchievements(): AchievementMilestone[] {
  saveAchievements(DEFAULT_ACHIEVEMENTS);
  return DEFAULT_ACHIEVEMENTS;
}

/* ─────────────────────────────────────────────────────────────────
   COMPANY BRANCHES MANAGEMENT
───────────────────────────────────────────────────────────────── */

export function getBranches(): CompanyBranch[] {
  const s = getGeneralSettings();
  if (s.branches !== undefined && Array.isArray(s.branches)) {
    return [...s.branches].sort((a, b) => (a.order || 0) - (b.order || 0));
  }
  return DEFAULT_BRANCHES;
}

export function saveBranches(branches: CompanyBranch[]): void {
  const current = getGeneralSettings();
  const sorted = [...branches].map((b, idx) => ({ ...b, order: idx + 1 }));
  saveGeneralSettings({
    ...current,
    branches: sorted
  });
}

export function addBranch(branch: Omit<CompanyBranch, "id" | "order" | "createdAt">): CompanyBranch {
  const items = getBranches();
  const newBranch: CompanyBranch = {
    ...branch,
    id: `branch-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    order: items.length + 1,
    createdAt: new Date().toISOString()
  };
  saveBranches([...items, newBranch]);
  return newBranch;
}

export function updateBranch(id: string, updates: Partial<CompanyBranch>): CompanyBranch | null {
  const items = getBranches();
  const index = items.findIndex((b) => b.id === id);
  if (index === -1) return null;

  const updated: CompanyBranch = {
    ...items[index],
    ...updates,
    updatedAt: new Date().toISOString()
  };

  items[index] = updated;
  saveBranches(items);
  return updated;
}

export function deleteBranch(id: string): boolean {
  const items = getBranches();
  const filtered = items.filter((b) => b.id !== id);
  if (filtered.length !== items.length) {
    saveBranches(filtered);
    return true;
  }
  return false;
}

export function moveBranch(id: string, direction: "up" | "down"): CompanyBranch[] {
  const items = getBranches();
  const index = items.findIndex((b) => b.id === id);
  if (index === -1) return items;

  if (direction === "up" && index > 0) {
    const temp = items[index];
    items[index] = items[index - 1];
    items[index - 1] = temp;
  } else if (direction === "down" && index < items.length - 1) {
    const temp = items[index];
    items[index] = items[index + 1];
    items[index + 1] = temp;
  }

  saveBranches(items);
  return getBranches();
}

export function resetDefaultBranches(): CompanyBranch[] {
  saveBranches(DEFAULT_BRANCHES);
  return DEFAULT_BRANCHES;
}

/* ─────────────────────────────────────────────────────────────────
   CONTACT FAQS MANAGEMENT
───────────────────────────────────────────────────────────────── */

export function getContactFaqs(): ContactFaqItem[] {
  const s = getGeneralSettings();
  if (s.contactFaqs !== undefined && Array.isArray(s.contactFaqs)) {
    return [...s.contactFaqs].sort((a, b) => (a.order || 0) - (b.order || 0));
  }
  return DEFAULT_CONTACT_FAQS;
}

export function saveContactFaqs(faqs: ContactFaqItem[]): void {
  const current = getGeneralSettings();
  const sorted = [...faqs].map((f, idx) => ({ ...f, order: idx + 1 }));
  saveGeneralSettings({
    ...current,
    contactFaqs: sorted
  });
}

export function addContactFaq(faq: Omit<ContactFaqItem, "id" | "order" | "createdAt">): ContactFaqItem {
  const items = getContactFaqs();
  const newFaq: ContactFaqItem = {
    ...faq,
    id: `faq-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    order: items.length + 1,
    createdAt: new Date().toISOString()
  };
  saveContactFaqs([...items, newFaq]);
  return newFaq;
}

export function updateContactFaq(id: string, updates: Partial<ContactFaqItem>): ContactFaqItem | null {
  const items = getContactFaqs();
  const index = items.findIndex((f) => f.id === id);
  if (index === -1) return null;

  const updated: ContactFaqItem = {
    ...items[index],
    ...updates,
    updatedAt: new Date().toISOString()
  };

  items[index] = updated;
  saveContactFaqs(items);
  return updated;
}

export function deleteContactFaq(id: string): boolean {
  const items = getContactFaqs();
  const filtered = items.filter((f) => f.id !== id);
  if (filtered.length !== items.length) {
    saveContactFaqs(filtered);
    return true;
  }
  return false;
}

export function moveContactFaq(id: string, direction: "up" | "down"): ContactFaqItem[] {
  const items = getContactFaqs();
  const index = items.findIndex((f) => f.id === id);
  if (index === -1) return items;

  if (direction === "up" && index > 0) {
    const temp = items[index];
    items[index] = items[index - 1];
    items[index - 1] = temp;
  } else if (direction === "down" && index < items.length - 1) {
    const temp = items[index];
    items[index] = items[index + 1];
    items[index + 1] = temp;
  }

  saveContactFaqs(items);
  return getContactFaqs();
}

export function resetDefaultContactFaqs(): ContactFaqItem[] {
  saveContactFaqs(DEFAULT_CONTACT_FAQS);
  return DEFAULT_CONTACT_FAQS;
}
