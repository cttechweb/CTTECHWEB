/* ─────────────────────────────────────────────────────────────────
   Cool Technologies — Centralized Contact & Communications Center
   Clean, professional enterprise administration for corporate contact
   details, WhatsApp CTAs, dynamic social media links, and email routing.
───────────────────────────────────────────────────────────────── */

import React, { useState, useEffect, useRef } from "react";
import {
  Mail,
  Phone,
  MessageSquare,
  Share2,
  MapPin,
  Save,
  Check,
  Plus,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Upload,
  ExternalLink,
  Clock,
  Globe,
  RefreshCw,
  Facebook,
  Instagram,
  Linkedin,
  Twitter,
  Youtube,
  SendHorizontal
} from "lucide-react";
import {
  GeneralSiteSettings,
  EmailIntegrationSettings,
  DynamicSocialLink,
  WhatsAppRoutingSettings
} from "../../types";
import {
  getGeneralSettings,
  saveContactCenterSettings,
  DEFAULT_EMAIL_SETTINGS,
  DEFAULT_SOCIAL_LINKS,
  DEFAULT_WHATSAPP_SETTINGS,
  DEFAULT_DEPARTMENT_HOTLINES
} from "../../services/generalSettingsService";
import { sendTestEmail } from "../../services/emailService";

interface AdminContactCenterProps {
  onShowToast?: (message: string) => void;
}

type SubmoduleTab = "channels" | "whatsapp" | "mail" | "social";

export default function AdminContactCenter({ onShowToast }: AdminContactCenterProps) {
  const [activeSubmodule, setActiveSubmodule] = useState<SubmoduleTab>("channels");
  const [isNavCollapsed, setIsNavCollapsed] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isSavedRecently, setIsSavedRecently] = useState<boolean>(false);

  // Settings state
  const [settings, setSettings] = useState<GeneralSiteSettings>(getGeneralSettings());

  // 1. Website Contact Channels
  const [companyName, setCompanyName] = useState(settings.companyName || "Cool Technologies LLC");
  const [tagline, setTagline] = useState(settings.tagline || "");
  const [phone, setPhone] = useState(settings.phone || "+971 2 565 0123");
  const [emergencyPhone, setEmergencyPhone] = useState(
    settings.departmentHotlines?.servicesEmergencyPhone || "+971 2 565 0123"
  );
  const [email, setEmail] = useState(settings.email || "info@cooltechuae.com");
  const [address, setAddress] = useState(settings.address || "");
  const [workingHours, setWorkingHours] = useState(settings.workingHours || "Monday - Saturday: 8:00 AM - 7:00 PM (GST)");
  const [locationMapUrl, setLocationMapUrl] = useState(settings.locationMapUrl || "");

  // 2. WhatsApp Hub
  const [whatsappSettings, setWhatsappSettings] = useState<WhatsAppRoutingSettings>(
    settings.whatsappSettings || DEFAULT_WHATSAPP_SETTINGS
  );

  // 3. Email Routing
  const [emailIntegration, setEmailIntegration] = useState<EmailIntegrationSettings>(
    settings.emailIntegration || DEFAULT_EMAIL_SETTINGS
  );
  const [isSendingTestEmail, setIsSendingTestEmail] = useState(false);

  // 4. Social Links
  const [socialLinks, setSocialLinks] = useState<DynamicSocialLink[]>(
    settings.socialLinks && settings.socialLinks.length > 0 ? settings.socialLinks : DEFAULT_SOCIAL_LINKS
  );
  const socialIconFileInputRef = useRef<HTMLInputElement | null>(null);
  const [uploadingForLinkId, setUploadingForLinkId] = useState<string | null>(null);

  // Reload data from storage
  const reloadData = () => {
    const s = getGeneralSettings();
    setSettings(s);
    setCompanyName(s.companyName || "Cool Technologies LLC");
    setTagline(s.tagline || "");
    setPhone(s.phone || "+971 2 565 0123");
    setEmergencyPhone(s.departmentHotlines?.servicesEmergencyPhone || s.phone || "+971 2 565 0123");
    setEmail(s.email || "info@cooltechuae.com");
    setAddress(s.address || "");
    setWorkingHours(s.workingHours || "Monday - Saturday: 8:00 AM - 7:00 PM (GST)");
    setLocationMapUrl(s.locationMapUrl || "");
    setWhatsappSettings(s.whatsappSettings || DEFAULT_WHATSAPP_SETTINGS);
    setEmailIntegration(s.emailIntegration || DEFAULT_EMAIL_SETTINGS);
    setSocialLinks(s.socialLinks && s.socialLinks.length > 0 ? s.socialLinks : DEFAULT_SOCIAL_LINKS);
  };

  useEffect(() => {
    reloadData();
  }, []);

  // Save All Changes Master Handler
  const handleSaveAll = (customMsg?: string) => {
    setIsSaving(true);

    const payload: Partial<GeneralSiteSettings> = {
      companyName: companyName.trim(),
      tagline: tagline.trim(),
      phone: phone.trim(),
      email: email.trim(),
      address: address.trim(),
      workingHours: workingHours.trim(),
      locationMapUrl: locationMapUrl.trim(),
      whatsapp: whatsappSettings.contactPageWhatsappNumber || whatsappSettings.floatingPhoneNumber || phone.trim(),
      emailIntegration: {
        ...emailIntegration,
        defaultReceivingEmail: (emailIntegration.defaultReceivingEmail || "").trim() || "sales@cooltechuae.com",
        orderReceivingEmail: (emailIntegration.orderReceivingEmail || "").trim(),
        rfqReceivingEmail: (emailIntegration.rfqReceivingEmail || "").trim(),
        contactReceivingEmail: (emailIntegration.contactReceivingEmail || "").trim(),
        partnerReceivingEmail: (emailIntegration.partnerReceivingEmail || "").trim(),
        careerReceivingEmail: (emailIntegration.careerReceivingEmail || "").trim(),
        reviewReceivingEmail: (emailIntegration.reviewReceivingEmail || "").trim(),
        accountReceivingEmail: (emailIntegration.accountReceivingEmail || "").trim(),
        loginReceivingEmail: (emailIntegration.loginReceivingEmail || "").trim(),
      },
      whatsappSettings: {
        ...whatsappSettings,
        floatingPhoneNumber: whatsappSettings.floatingPhoneNumber.trim(),
        floatingPrefilledMessage: whatsappSettings.floatingPrefilledMessage.trim(),
        emailAutoReplyWhatsappNumber: whatsappSettings.emailAutoReplyWhatsappNumber.trim(),
        contactPageWhatsappNumber: whatsappSettings.contactPageWhatsappNumber.trim()
      },
      socialLinks: socialLinks,
      departmentHotlines: {
        ...(settings.departmentHotlines || DEFAULT_DEPARTMENT_HOTLINES),
        servicesEmergencyPhone: emergencyPhone.trim(),
        salesPhone: phone.trim()
      }
    };

    saveContactCenterSettings(payload);
    setIsSaving(false);
    setIsSavedRecently(true);
    setTimeout(() => setIsSavedRecently(false), 2500);

    const msg = customMsg || "Settings saved successfully";
    if (onShowToast) onShowToast(msg);
  };

  // Test Email Dispatch
  const handleTestDispatch = async () => {
    const targetEmail = emailIntegration.defaultReceivingEmail || settings.email || "sales@cooltechuae.com";
    setIsSendingTestEmail(true);
    try {
      const result = await sendTestEmail(targetEmail);
      if (result.success) {
        if (onShowToast) onShowToast(`Test email delivered to ${targetEmail}`);
      } else {
        alert(`Test email could not be delivered: ${result.message || "Please check receiver address."}`);
      }
    } catch (err: any) {
      alert(`Error sending test dispatch: ${err?.message || "Unknown error"}`);
    } finally {
      setIsSendingTestEmail(false);
    }
  };

  // Social Link Handlers
  const handleAddSocialLink = () => {
    const newLink: DynamicSocialLink = {
      id: `social-${Date.now()}`,
      platform: "LinkedIn",
      url: "https://linkedin.com/company/cool-technologies",
      iconType: "preset",
      iconPresetName: "Linkedin",
      isActive: true,
      order: socialLinks.length + 1
    };
    setSocialLinks([...socialLinks, newLink]);
  };

  const handleUpdateSocialLink = (id: string, updates: Partial<DynamicSocialLink>) => {
    setSocialLinks(socialLinks.map((l) => (l.id === id ? { ...l, ...updates } : l)));
  };

  const handleDeleteSocialLink = (id: string) => {
    setSocialLinks(socialLinks.filter((l) => l.id !== id));
  };

  const handleTriggerCustomIconUpload = (linkId: string) => {
    setUploadingForLinkId(linkId);
    if (socialIconFileInputRef.current) {
      socialIconFileInputRef.current.value = "";
      socialIconFileInputRef.current.click();
    }
  };

  const handleCustomIconFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !uploadingForLinkId) return;

    if (file.size > 2 * 1024 * 1024) {
      alert("Icon image must be smaller than 2MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const base64Url = reader.result as string;
      setSocialLinks((prev) =>
        prev.map((item) =>
          item.id === uploadingForLinkId
            ? { ...item, iconType: "custom_upload", customIconUrl: base64Url }
            : item
        )
      );
      if (onShowToast) onShowToast("Custom icon uploaded");
      setUploadingForLinkId(null);
    };
    reader.readAsDataURL(file);
  };

  // Social icon renderer
  const renderSocialIcon = (link: DynamicSocialLink, size = 16) => {
    if (link.iconType === "custom_upload" && link.customIconUrl) {
      return (
        <img
          src={link.customIconUrl}
          alt={link.platform}
          className="object-contain rounded-xs"
          style={{ width: size, height: size }}
        />
      );
    }

    const name = (link.iconPresetName || link.platform || "").toLowerCase();
    if (name.includes("linkedin")) return <Linkedin size={size} />;
    if (name.includes("facebook")) return <Facebook size={size} />;
    if (name.includes("instagram")) return <Instagram size={size} />;
    if (name.includes("twitter") || name.includes("x")) return <Twitter size={size} />;
    if (name.includes("youtube")) return <Youtube size={size} />;
    if (name.includes("whatsapp")) return <MessageSquare size={size} />;
    return <Globe size={size} />;
  };

  const SUBMODULES = [
    { id: "channels" as SubmoduleTab, label: "Contact Information", icon: <Phone size={15} /> },
    { id: "whatsapp" as SubmoduleTab, label: "WhatsApp Routing", icon: <MessageSquare size={15} /> },
    { id: "mail" as SubmoduleTab, label: "Email Routing", icon: <Mail size={15} /> },
    { id: "social" as SubmoduleTab, label: "Social Media", icon: <Share2 size={15} /> },
  ];

  return (
    <div className="w-full flex flex-col space-y-4">
      {/* Hidden File Input for Custom Social Icon Uploads */}
      <input
        type="file"
        ref={socialIconFileInputRef}
        onChange={handleCustomIconFileChange}
        accept="image/png,image/jpeg,image/svg+xml,image/webp"
        className="hidden"
      />

      {/* Main Container */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
        {/* Top Control Bar */}
        <div className="px-5 py-3.5 border-b border-slate-200 flex items-center justify-between gap-4 bg-slate-50/50">
          <div>
            <h2 className="text-sm font-bold text-slate-900">
              {SUBMODULES.find((s) => s.id === activeSubmodule)?.label}
            </h2>
            <p className="text-[11px] text-slate-500">
              {activeSubmodule === "channels" && "Manage primary telephone, emergency dispatch hotline, email, and facility location."}
              {activeSubmodule === "whatsapp" && "Configure the floating website WhatsApp button and emergency customer card."}
              {activeSubmodule === "mail" && "Route orders, RFQs, contact forms, and applications to designated team inboxes."}
              {activeSubmodule === "social" && "Manage company social profiles, URLs, preset icons, or custom uploaded logos."}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={reloadData}
              title="Discard unsaved changes"
              className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 text-xs font-medium rounded-lg border border-slate-200 transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <RefreshCw size={13} />
              <span>Reset</span>
            </button>

            <button
              type="button"
              onClick={() => handleSaveAll()}
              disabled={isSaving}
              className={`px-4 py-1.5 text-xs font-semibold rounded-lg shadow-xs flex items-center gap-1.5 transition-all cursor-pointer ${
                isSavedRecently
                  ? "bg-emerald-600 text-white"
                  : "bg-slate-900 hover:bg-slate-800 text-white"
              }`}
            >
              {isSavedRecently ? (
                <>
                  <Check size={14} />
                  <span>Saved</span>
                </>
              ) : (
                <>
                  <Save size={14} />
                  <span>Save Changes</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Workspace Layout: Left Navigation + Right Content */}
        <div className="flex flex-col lg:flex-row min-h-[520px]">
          {/* Left Navigation Rail */}
          <aside
            className={`border-b lg:border-b-0 lg:border-r border-slate-200 bg-slate-50/40 p-3 shrink-0 transition-all duration-200 ${
              isNavCollapsed ? "lg:w-16" : "lg:w-56"
            }`}
          >
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-200/60">
              {!isNavCollapsed && (
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider pl-2">
                  Navigation
                </span>
              )}
              <button
                type="button"
                onClick={() => setIsNavCollapsed(!isNavCollapsed)}
                className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors ml-auto cursor-pointer"
                title={isNavCollapsed ? "Expand sidebar" : "Collapse sidebar"}
              >
                {isNavCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
              </button>
            </div>

            <nav className="space-y-1">
              {SUBMODULES.map((sub) => {
                const isActive = activeSubmodule === sub.id;
                return (
                  <button
                    key={sub.id}
                    type="button"
                    onClick={() => setActiveSubmodule(sub.id)}
                    title={sub.label}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-all text-left cursor-pointer ${
                      isActive
                        ? "bg-slate-900 text-white shadow-xs"
                        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                    }`}
                  >
                    <span className={`shrink-0 ${isActive ? "text-white" : "text-slate-500"}`}>
                      {sub.icon}
                    </span>
                    {!isNavCollapsed && <span className="truncate">{sub.label}</span>}
                  </button>
                );
              })}
            </nav>
          </aside>

          {/* Right Content Area */}
          <main className="flex-1 p-6 bg-white overflow-y-auto">
            {/* ───────────────────────────────────────────────────────────
                SUBMODULE 1: CONTACT INFORMATION
            ─────────────────────────────────────────────────────────── */}
            {activeSubmodule === "channels" && (
              <div className="max-w-3xl space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-medium text-slate-700 block mb-1">Company Legal Name</label>
                    <input
                      type="text"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      placeholder="Cool Technologies LLC"
                      className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-slate-900 bg-white"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-medium text-slate-700 block mb-1">Corporate Tagline</label>
                    <input
                      type="text"
                      value={tagline}
                      onChange={(e) => setTagline(e.target.value)}
                      placeholder="The Experts in Commercial & Industrial Cooling"
                      className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-slate-900 bg-white"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-medium text-slate-700 block mb-1">Primary Phone Number</label>
                    <div className="relative">
                      <Phone size={13} className="absolute left-3 top-2.5 text-slate-400" />
                      <input
                        type="text"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+971 2 565 0123"
                        className="w-full pl-8 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 font-medium focus:outline-none focus:border-slate-900 bg-white"
                      />
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1">Displayed in website header, footer, and contact page.</p>
                  </div>

                  <div>
                    <label className="text-xs font-medium text-slate-700 block mb-1">Emergency Dispatch Hotline</label>
                    <div className="relative">
                      <Phone size={13} className="absolute left-3 top-2.5 text-slate-400" />
                      <input
                        type="text"
                        value={emergencyPhone}
                        onChange={(e) => setEmergencyPhone(e.target.value)}
                        placeholder="+971 2 565 0123"
                        className="w-full pl-8 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 font-medium focus:outline-none focus:border-slate-900 bg-white"
                      />
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1">Displayed on the Services page 24/7 emergency dispatch card.</p>
                  </div>

                  <div>
                    <label className="text-xs font-medium text-slate-700 block mb-1">General Inquiries Email</label>
                    <div className="relative">
                      <Mail size={13} className="absolute left-3 top-2.5 text-slate-400" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="info@cooltechuae.com"
                        className="w-full pl-8 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 font-medium focus:outline-none focus:border-slate-900 bg-white"
                      />
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1">Displayed in website header and footer.</p>
                  </div>

                  <div>
                    <label className="text-xs font-medium text-slate-700 block mb-1">Operating Hours</label>
                    <div className="relative">
                      <Clock size={13} className="absolute left-3 top-2.5 text-slate-400" />
                      <input
                        type="text"
                        value={workingHours}
                        onChange={(e) => setWorkingHours(e.target.value)}
                        placeholder="Monday - Saturday: 8:00 AM - 7:00 PM (GST)"
                        className="w-full pl-8 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-slate-900 bg-white"
                      />
                    </div>
                  </div>

                  <div className="md:col-span-2">
                    <label className="text-xs font-medium text-slate-700 block mb-1">Headquarters Physical Address</label>
                    <div className="relative">
                      <MapPin size={13} className="absolute left-3 top-2.5 text-slate-400" />
                      <input
                        type="text"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        placeholder="Plot-99, Sector M-42 / M-14, Mussafah Industrial Area, Abu Dhabi, UAE"
                        className="w-full pl-8 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-slate-900 bg-white"
                      />
                    </div>
                  </div>

                  <div className="md:col-span-2">
                    <label className="text-xs font-medium text-slate-700 block mb-1">Google Maps Facility Link</label>
                    <div className="relative">
                      <ExternalLink size={13} className="absolute left-3 top-2.5 text-slate-400" />
                      <input
                        type="url"
                        value={locationMapUrl}
                        onChange={(e) => setLocationMapUrl(e.target.value)}
                        placeholder="https://maps.google.com/..."
                        className="w-full pl-8 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-slate-900 bg-white"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ───────────────────────────────────────────────────────────
                SUBMODULE 2: WHATSAPP ROUTING
            ─────────────────────────────────────────────────────────── */}
            {activeSubmodule === "whatsapp" && (
              <div className="max-w-2xl space-y-6">
                {/* Floating Widget Settings */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <div>
                      <h3 className="text-xs font-bold text-slate-900">Floating WhatsApp Button</h3>
                      <p className="text-[11px] text-slate-500">Allows visitors across all website pages to start a direct WhatsApp chat.</p>
                    </div>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={whatsappSettings.floatingWidgetEnabled !== false}
                        onChange={(e) =>
                          setWhatsappSettings({ ...whatsappSettings, floatingWidgetEnabled: e.target.checked })
                        }
                        className="w-4 h-4 text-emerald-600 rounded-xs border-slate-300 focus:ring-0 cursor-pointer"
                      />
                      <span className="text-xs font-medium text-slate-700">Enabled</span>
                    </label>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-medium text-slate-700 block mb-1">WhatsApp Phone Number</label>
                      <input
                        type="text"
                        value={whatsappSettings.floatingPhoneNumber}
                        onChange={(e) =>
                          setWhatsappSettings({ ...whatsappSettings, floatingPhoneNumber: e.target.value })
                        }
                        placeholder="+971 50 123 4567"
                        className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 font-medium focus:outline-none focus:border-slate-900 bg-white"
                      />
                      <p className="text-[11px] text-slate-400 mt-1">Include country code (+971).</p>
                    </div>

                    <div>
                      <label className="text-xs font-medium text-slate-700 block mb-1">Button Screen Position</label>
                      <select
                        value={whatsappSettings.floatingButtonPosition || "bottom-right"}
                        onChange={(e) =>
                          setWhatsappSettings({
                            ...whatsappSettings,
                            floatingButtonPosition: e.target.value as "bottom-right" | "bottom-left"
                          })
                        }
                        className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-slate-900 bg-white"
                      >
                        <option value="bottom-right">Bottom Right (Standard)</option>
                        <option value="bottom-left">Bottom Left</option>
                      </select>
                    </div>

                    <div className="md:col-span-2">
                      <label className="text-xs font-medium text-slate-700 block mb-1">Pre-filled Chat Message</label>
                      <input
                        type="text"
                        value={whatsappSettings.floatingPrefilledMessage}
                        onChange={(e) =>
                          setWhatsappSettings({ ...whatsappSettings, floatingPrefilledMessage: e.target.value })
                        }
                        placeholder="Hello Cool Technologies, I would like to inquire about commercial cooling equipment."
                        className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-slate-900 bg-white"
                      />
                      <p className="text-[11px] text-slate-400 mt-1">Automatically appears in customer's WhatsApp chat when clicking the button.</p>
                    </div>
                  </div>
                </div>

                {/* Additional WhatsApp Destinations */}
                <div className="pt-4 border-t border-slate-100 space-y-4">
                  <h3 className="text-xs font-bold text-slate-900">Dedicated Page Numbers</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-medium text-slate-700 block mb-1">Contact Page WhatsApp Button</label>
                      <input
                        type="text"
                        value={whatsappSettings.contactPageWhatsappNumber || ""}
                        onChange={(e) =>
                          setWhatsappSettings({ ...whatsappSettings, contactPageWhatsappNumber: e.target.value })
                        }
                        placeholder="+971 50 123 4567"
                        className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 font-medium focus:outline-none focus:border-slate-900 bg-white"
                      />
                      <p className="text-[11px] text-slate-400 mt-1">Used on the Contact Us page direct chat link.</p>
                    </div>

                    <div>
                      <label className="text-xs font-medium text-slate-700 block mb-1">Automated Email Receipt Number</label>
                      <input
                        type="text"
                        value={whatsappSettings.emailAutoReplyWhatsappNumber || ""}
                        onChange={(e) =>
                          setWhatsappSettings({ ...whatsappSettings, emailAutoReplyWhatsappNumber: e.target.value })
                        }
                        placeholder="+971 50 123 4567"
                        className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 font-medium focus:outline-none focus:border-slate-900 bg-white"
                      />
                      <p className="text-[11px] text-slate-400 mt-1">Embedded in automated email receipts for emergency support.</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ───────────────────────────────────────────────────────────
                SUBMODULE 3: EMAIL ROUTING
            ─────────────────────────────────────────────────────────── */}
            {activeSubmodule === "mail" && (
              <div className="max-w-3xl space-y-6">
                {/* Active Switch & Master Inboxes */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div>
                    <h3 className="text-xs font-bold text-slate-900">Email Notifications Dispatch</h3>
                    <p className="text-[11px] text-slate-500">Send transactional alerts when customers submit inquiries or orders.</p>
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={emailIntegration.isEnabled}
                      onChange={(e) => setEmailIntegration({ ...emailIntegration, isEnabled: e.target.checked })}
                      className="w-4 h-4 text-slate-900 rounded-xs border-slate-300 focus:ring-0 cursor-pointer"
                    />
                    <span className="text-xs font-medium text-slate-700">Active</span>
                  </label>
                </div>

                {/* Master Receiving Email */}
                <div>
                  <label className="text-xs font-medium text-slate-700 block mb-1">
                    Master Receiving Email <span className="text-slate-400 font-normal">(Primary Catch-All)</span>
                  </label>
                  <input
                    type="email"
                    value={emailIntegration.defaultReceivingEmail}
                    onChange={(e) => setEmailIntegration({ ...emailIntegration, defaultReceivingEmail: e.target.value })}
                    placeholder="sales@cooltechuae.com"
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs font-medium text-slate-900 focus:outline-none focus:border-slate-900 bg-white"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">
                    Inquiries default to this address if a specific departmental inbox below is left blank.
                  </p>
                </div>

                {/* Department Receiving Inboxes */}
                <div className="space-y-3 pt-2">
                  <h4 className="text-xs font-bold text-slate-900">Department Inboxes</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-medium text-slate-700 block mb-1">
                        Product Orders &amp; Checkout
                      </label>
                      <input
                        type="email"
                        value={emailIntegration.orderReceivingEmail || ""}
                        onChange={(e) => setEmailIntegration({ ...emailIntegration, orderReceivingEmail: e.target.value })}
                        placeholder={`Default (${emailIntegration.defaultReceivingEmail || "sales@..."})`}
                        className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-slate-900 bg-white"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-medium text-slate-700 block mb-1">
                        Quotations &amp; RFQs
                      </label>
                      <input
                        type="email"
                        value={emailIntegration.rfqReceivingEmail || ""}
                        onChange={(e) => setEmailIntegration({ ...emailIntegration, rfqReceivingEmail: e.target.value })}
                        placeholder={`Default (${emailIntegration.defaultReceivingEmail || "sales@..."})`}
                        className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-slate-900 bg-white"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-medium text-slate-700 block mb-1">
                        General Contact Us Submissions
                      </label>
                      <input
                        type="email"
                        value={emailIntegration.contactReceivingEmail || ""}
                        onChange={(e) => setEmailIntegration({ ...emailIntegration, contactReceivingEmail: e.target.value })}
                        placeholder={`Default (${emailIntegration.defaultReceivingEmail || "sales@..."})`}
                        className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-slate-900 bg-white"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-medium text-slate-700 block mb-1">
                        B2B Wholesale Partner Requests
                      </label>
                      <input
                        type="email"
                        value={emailIntegration.partnerReceivingEmail || ""}
                        onChange={(e) => setEmailIntegration({ ...emailIntegration, partnerReceivingEmail: e.target.value })}
                        placeholder={`Default (${emailIntegration.defaultReceivingEmail || "sales@..."})`}
                        className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-slate-900 bg-white"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-medium text-slate-700 block mb-1">
                        Careers &amp; Job Applications
                      </label>
                      <input
                        type="email"
                        value={emailIntegration.careerReceivingEmail || ""}
                        onChange={(e) => setEmailIntegration({ ...emailIntegration, careerReceivingEmail: e.target.value })}
                        placeholder={`Default (${emailIntegration.defaultReceivingEmail || "sales@..."})`}
                        className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-slate-900 bg-white"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-medium text-slate-700 block mb-1">
                        Customer Reviews &amp; Feedback
                      </label>
                      <input
                        type="email"
                        value={emailIntegration.reviewReceivingEmail || ""}
                        onChange={(e) => setEmailIntegration({ ...emailIntegration, reviewReceivingEmail: e.target.value })}
                        placeholder={`Default (${emailIntegration.defaultReceivingEmail || "sales@..."})`}
                        className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-slate-900 bg-white"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-medium text-slate-700 block mb-1">
                        New Account Signups
                      </label>
                      <input
                        type="email"
                        value={emailIntegration.accountReceivingEmail || ""}
                        onChange={(e) => setEmailIntegration({ ...emailIntegration, accountReceivingEmail: e.target.value })}
                        placeholder={`Default (${emailIntegration.defaultReceivingEmail || "sales@..."})`}
                        className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-slate-900 bg-white"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-medium text-slate-700 block mb-1">
                        User Login Security Alerts
                      </label>
                      <input
                        type="email"
                        value={emailIntegration.loginReceivingEmail || ""}
                        onChange={(e) => setEmailIntegration({ ...emailIntegration, loginReceivingEmail: e.target.value })}
                        placeholder={`Default (${emailIntegration.defaultReceivingEmail || "sales@..."})`}
                        className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-slate-900 bg-white"
                      />
                    </div>
                  </div>
                </div>

                {/* Diagnostics Delivery Test */}
                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-semibold text-slate-900 block">Deliverability Check</span>
                    <span className="text-[11px] text-slate-500">Sends a test email to your Master Receiving Email.</span>
                  </div>
                  <button
                    type="button"
                    disabled={isSendingTestEmail}
                    onClick={handleTestDispatch}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    {isSendingTestEmail ? <RefreshCw size={13} className="animate-spin" /> : <SendHorizontal size={13} />}
                    <span>Send Test Email</span>
                  </button>
                </div>
              </div>
            )}

            {/* ───────────────────────────────────────────────────────────
                SUBMODULE 4: SOCIAL MEDIA
            ─────────────────────────────────────────────────────────── */}
            {activeSubmodule === "social" && (
              <div className="max-w-3xl space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div>
                    <h3 className="text-xs font-bold text-slate-900">Social Media Profiles</h3>
                    <p className="text-[11px] text-slate-500">Configured links appear in the footer and floating widget bar.</p>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddSocialLink}
                    className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Plus size={13} />
                    <span>Add Profile</span>
                  </button>
                </div>

                {/* List of Social Profiles */}
                <div className="divide-y divide-slate-100 border border-slate-200 rounded-lg overflow-hidden">
                  {socialLinks.map((link) => (
                    <div key={link.id} className="p-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white hover:bg-slate-50/50 transition-colors">
                      <div className="flex items-center gap-3 w-full sm:w-auto">
                        <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center shrink-0 border border-slate-200">
                          {renderSocialIcon(link, 15)}
                        </div>

                        <div className="space-y-1 flex-1 sm:w-48">
                          <input
                            type="text"
                            value={link.platform}
                            onChange={(e) => handleUpdateSocialLink(link.id, { platform: e.target.value })}
                            placeholder="Platform Name"
                            className="w-full border border-slate-200 rounded-md px-2 py-1 text-xs font-semibold text-slate-800 bg-white"
                          />
                          <div className="flex items-center gap-2">
                            <select
                              value={link.iconType === "custom_upload" ? "custom_upload" : link.iconPresetName || "Globe"}
                              onChange={(e) => {
                                if (e.target.value === "custom_upload") {
                                  handleTriggerCustomIconUpload(link.id);
                                } else {
                                  handleUpdateSocialLink(link.id, {
                                    iconType: "preset",
                                    iconPresetName: e.target.value,
                                    customIconUrl: undefined
                                  });
                                }
                              }}
                              className="text-[11px] text-slate-600 bg-slate-100 rounded-md px-1.5 py-0.5 border border-slate-200"
                            >
                              <option value="Linkedin">LinkedIn</option>
                              <option value="Facebook">Facebook</option>
                              <option value="Instagram">Instagram</option>
                              <option value="Twitter">Twitter / X</option>
                              <option value="Youtube">YouTube</option>
                              <option value="Whatsapp">WhatsApp</option>
                              <option value="Globe">Website / Other</option>
                              <option value="custom_upload">Upload Custom Icon...</option>
                            </select>

                            {link.iconType === "custom_upload" && (
                              <button
                                type="button"
                                onClick={() => handleTriggerCustomIconUpload(link.id)}
                                className="text-[10px] text-blue-600 hover:underline flex items-center gap-1 cursor-pointer"
                              >
                                <Upload size={10} />
                                <span>Change Icon</span>
                              </button>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex-1 w-full sm:w-auto">
                        <input
                          type="url"
                          value={link.url}
                          onChange={(e) => handleUpdateSocialLink(link.id, { url: e.target.value })}
                          placeholder="https://..."
                          className="w-full border border-slate-200 rounded-md px-2.5 py-1 text-xs text-slate-700 bg-white font-mono"
                        />
                      </div>

                      <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
                        <label className="flex items-center gap-1.5 cursor-pointer text-xs text-slate-600">
                          <input
                            type="checkbox"
                            checked={link.isActive}
                            onChange={(e) => handleUpdateSocialLink(link.id, { isActive: e.target.checked })}
                            className="w-3.5 h-3.5 text-slate-900 rounded-xs border-slate-300 focus:ring-0"
                          />
                          <span>Active</span>
                        </label>

                        <button
                          type="button"
                          onClick={() => handleDeleteSocialLink(link.id)}
                          className="p-1 text-slate-400 hover:text-red-600 transition-colors cursor-pointer"
                          title="Remove link"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
