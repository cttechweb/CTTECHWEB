/* ─────────────────────────────────────────────────────────────────
   Cool Technologies — Centralized Contact & Communications Center
   Consolidated enterprise administration for corporate coordinates,
   department channels (Sales, Services, WhatsApp), regional branches,
   Contact FAQs, Brevo email routing, and social media links.
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
  ExternalLink,
  Clock,
  Globe,
  Building,
  RotateCcw,
  Edit3,
  ArrowUp,
  ArrowDown,
  HelpCircle,
  X,
  Facebook,
  Instagram,
  Linkedin,
  Twitter,
  Youtube,
  SendHorizontal,
  Headphones,
  CheckCircle2
} from "lucide-react";
import {
  GeneralSiteSettings,
  EmailIntegrationSettings,
  DynamicSocialLink,
  WhatsAppRoutingSettings,
  DynamicContactNumber,
  DynamicContactEmail,
  CompanyBranch,
  ContactFaqItem
} from "../../types";
import {
  getGeneralSettings,
  saveContactCenterSettings,
  DEFAULT_EMAIL_SETTINGS,
  DEFAULT_SOCIAL_LINKS,
  DEFAULT_WHATSAPP_SETTINGS,
  DEFAULT_DEPARTMENT_HOTLINES,
  DEFAULT_PHONE_CONTACTS,
  DEFAULT_EMAIL_CONTACTS,
  getBranches,
  saveBranches,
  addBranch,
  updateBranch,
  deleteBranch,
  moveBranch,
  resetDefaultBranches,
  getContactFaqs,
  saveContactFaqs,
  addContactFaq,
  updateContactFaq,
  deleteContactFaq,
  moveContactFaq,
  resetDefaultContactFaqs
} from "../../services/generalSettingsService";
import { sendTestEmail } from "../../services/emailService";

interface AdminContactCenterProps {
  onShowToast?: (message: string) => void;
}

type SubmoduleTab = "channels" | "branches" | "faqs" | "whatsapp" | "mail" | "social";

export default function AdminContactCenter({ onShowToast }: AdminContactCenterProps) {
  const [activeSubmodule, setActiveSubmodule] = useState<SubmoduleTab>("channels");
  const [isNavCollapsed, setIsNavCollapsed] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isSavedRecently, setIsSavedRecently] = useState<boolean>(false);

  // Settings state
  const [settings, setSettings] = useState<GeneralSiteSettings>(getGeneralSettings());

  // 1. Primary Corporate Coordinates
  const [companyName, setCompanyName] = useState(settings.companyName || "Cool Technologies LLC");
  const [tagline, setTagline] = useState(settings.tagline || "");
  const [phone, setPhone] = useState(settings.phone || "+971 2 565 0123");
  const [email, setEmail] = useState(settings.email || "info@cooltechuae.com");
  const [address, setAddress] = useState(settings.address || "Mussafah M-14, Abu Dhabi, United Arab Emirates");
  const [workingHours, setWorkingHours] = useState(settings.workingHours || "Monday - Saturday: 8:00 AM - 7:00 PM (GST)");
  const [locationMapUrl, setLocationMapUrl] = useState(settings.locationMapUrl || "");

  // 2. Department Direct Channels (Directly reflected on /contact)
  const [whatsappNumber, setWhatsappNumber] = useState(
    settings.whatsappSettings?.contactPageWhatsappNumber || settings.whatsapp || "+971 50 123 4567"
  );
  const [salesPhone, setSalesPhone] = useState(
    settings.departmentHotlines?.salesPhone || 
    settings.phoneContacts?.find(p => p.title?.toLowerCase().includes("sale"))?.number || 
    settings.phone || 
    "+971 2 565 0123"
  );
  const [salesEmail, setSalesEmail] = useState(
    settings.emailContacts?.find(e => e.title?.toLowerCase().includes("sale") || e.email?.toLowerCase().includes("sale"))?.email || 
    settings.emailIntegration?.defaultReceivingEmail || 
    "sales@cooltechuae.com"
  );
  const [servicesPhone, setServicesPhone] = useState(
    settings.departmentHotlines?.servicesEmergencyPhone || 
    settings.phoneContacts?.find(p => p.title?.toLowerCase().includes("service"))?.number || 
    "+971 2 815 6161"
  );
  const [servicesEmail, setServicesEmail] = useState(
    settings.emailContacts?.find(e => e.title?.toLowerCase().includes("service") || e.title?.toLowerCase().includes("care") || e.email?.toLowerCase().includes("care"))?.email || 
    "care@cooltechuae.com"
  );

  // Additional custom lines
  const [phoneContacts, setPhoneContacts] = useState<DynamicContactNumber[]>(
    settings.phoneContacts && settings.phoneContacts.length > 0
      ? settings.phoneContacts
      : DEFAULT_PHONE_CONTACTS
  );
  const [emailContacts, setEmailContacts] = useState<DynamicContactEmail[]>(
    settings.emailContacts && settings.emailContacts.length > 0
      ? settings.emailContacts
      : DEFAULT_EMAIL_CONTACTS
  );

  // 3. Regional Branches
  const [branches, setBranches] = useState<CompanyBranch[]>([]);
  const [isBranchModalOpen, setIsBranchModalOpen] = useState(false);
  const [editingBranch, setEditingBranch] = useState<CompanyBranch | null>(null);
  const [branchName, setBranchName] = useState("");
  const [branchCity, setBranchCity] = useState("Abu Dhabi");
  const [branchAddress, setBranchAddress] = useState("");
  const [branchPhone, setBranchPhone] = useState("");
  const [branchMobile, setBranchMobile] = useState("");
  const [branchEmail, setBranchEmail] = useState("");
  const [branchWorkingHours, setBranchWorkingHours] = useState("Monday - Saturday: 8:00 AM - 7:00 PM (GST)");
  const [branchMapUrl, setBranchMapUrl] = useState("");
  const [branchMapEmbedUrl, setBranchMapEmbedUrl] = useState("");
  const [branchIsHQ, setBranchIsHQ] = useState(false);
  const [branchIsActive, setBranchIsActive] = useState(true);

  // 4. Contact FAQs
  const [faqs, setFaqs] = useState<ContactFaqItem[]>([]);
  const [isFaqModalOpen, setIsFaqModalOpen] = useState(false);
  const [editingFaq, setEditingFaq] = useState<ContactFaqItem | null>(null);
  const [faqQuestion, setFaqQuestion] = useState("");
  const [faqAnswer, setFaqAnswer] = useState("");
  const [faqCategory, setFaqCategory] = useState("General");
  const [faqIsActive, setFaqIsActive] = useState(true);

  // 5. WhatsApp Hub
  const [whatsappSettings, setWhatsappSettings] = useState<WhatsAppRoutingSettings>(
    settings.whatsappSettings || DEFAULT_WHATSAPP_SETTINGS
  );

  // 6. Email Routing
  const [emailIntegration, setEmailIntegration] = useState<EmailIntegrationSettings>(
    settings.emailIntegration || DEFAULT_EMAIL_SETTINGS
  );
  const [isSendingTestEmail, setIsSendingTestEmail] = useState(false);

  // 7. Social Links
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
    setEmail(s.email || "info@cooltechuae.com");
    setAddress(s.address || "Mussafah M-14, Abu Dhabi, United Arab Emirates");
    setWorkingHours(s.workingHours || "Monday - Saturday: 8:00 AM - 7:00 PM (GST)");
    setLocationMapUrl(s.locationMapUrl || "");

    setWhatsappNumber(s.whatsappSettings?.contactPageWhatsappNumber || s.whatsapp || "+971 50 123 4567");
    setSalesPhone(
      s.departmentHotlines?.salesPhone || 
      s.phoneContacts?.find(p => p.title?.toLowerCase().includes("sale"))?.number || 
      s.phone || 
      "+971 2 565 0123"
    );
    setSalesEmail(
      s.emailContacts?.find(e => e.title?.toLowerCase().includes("sale") || e.email?.toLowerCase().includes("sale"))?.email || 
      s.emailIntegration?.defaultReceivingEmail || 
      "sales@cooltechuae.com"
    );
    setServicesPhone(
      s.departmentHotlines?.servicesEmergencyPhone || 
      s.phoneContacts?.find(p => p.title?.toLowerCase().includes("service"))?.number || 
      "+971 2 815 6161"
    );
    setServicesEmail(
      s.emailContacts?.find(e => e.title?.toLowerCase().includes("service") || e.title?.toLowerCase().includes("care") || e.email?.toLowerCase().includes("care"))?.email || 
      "care@cooltechuae.com"
    );

    setPhoneContacts(s.phoneContacts && s.phoneContacts.length > 0 ? s.phoneContacts : DEFAULT_PHONE_CONTACTS);
    setEmailContacts(s.emailContacts && s.emailContacts.length > 0 ? s.emailContacts : DEFAULT_EMAIL_CONTACTS);
    setWhatsappSettings(s.whatsappSettings || DEFAULT_WHATSAPP_SETTINGS);
    setEmailIntegration(s.emailIntegration || DEFAULT_EMAIL_SETTINGS);
    setSocialLinks(s.socialLinks && s.socialLinks.length > 0 ? s.socialLinks : DEFAULT_SOCIAL_LINKS);

    setBranches(getBranches());
    setFaqs(getContactFaqs());
  };

  useEffect(() => {
    reloadData();
    window.addEventListener("cooltech_settings_updated", reloadData);
    window.addEventListener("cooltech_contact_settings_updated", reloadData);
    return () => {
      window.removeEventListener("cooltech_settings_updated", reloadData);
      window.removeEventListener("cooltech_contact_settings_updated", reloadData);
    };
  }, []);

  // Save All Changes Master Handler
  const handleSaveAll = (customMsg?: string) => {
    setIsSaving(true);

    const finalPhone = phone.trim() || salesPhone.trim();
    const finalEmail = email.trim();
    const finalWhatsapp = whatsappNumber.trim();
    const finalSalesPhone = salesPhone.trim() || finalPhone;
    const finalSalesEmail = salesEmail.trim();
    const finalServicesPhone = servicesPhone.trim();
    const finalServicesEmail = servicesEmail.trim();

    // Construct unified phoneContacts (preserving any custom extra lines)
    const extraPhones = phoneContacts.filter(
      (p) => p.id !== "phone-sales" && p.id !== "phone-services" && p.id !== "phone-default-migrated"
    );
    const updatedPhoneContacts: DynamicContactNumber[] = [
      {
        id: "phone-sales",
        title: "Sales",
        number: finalSalesPhone,
        isActive: true
      },
      {
        id: "phone-services",
        title: "Services",
        number: finalServicesPhone,
        isActive: true
      },
      ...extraPhones
    ];

    // Construct unified emailContacts (preserving any custom extra lines)
    const extraEmails = emailContacts.filter(
      (e) => e.id !== "email-general" && e.id !== "email-sales" && e.id !== "email-services" && e.id !== "email-default-migrated"
    );
    const updatedEmailContacts: DynamicContactEmail[] = [
      {
        id: "email-general",
        title: "General Enquiry",
        email: finalEmail,
        isActive: true
      },
      {
        id: "email-sales",
        title: "Sales",
        email: finalSalesEmail,
        isActive: true
      },
      {
        id: "email-services",
        title: "Services",
        email: finalServicesEmail,
        isActive: true
      },
      ...extraEmails
    ];

    const payload: Partial<GeneralSiteSettings> = {
      companyName: companyName.trim(),
      tagline: tagline.trim(),
      phone: finalPhone,
      email: finalEmail,
      whatsapp: finalWhatsapp,
      address: address.trim(),
      workingHours: workingHours.trim(),
      locationMapUrl: locationMapUrl.trim(),
      phoneContacts: updatedPhoneContacts,
      emailContacts: updatedEmailContacts,
      departmentHotlines: {
        ...(settings.departmentHotlines || DEFAULT_DEPARTMENT_HOTLINES),
        salesPhone: finalSalesPhone,
        servicesEmergencyPhone: finalServicesPhone
      },
      whatsappSettings: {
        ...whatsappSettings,
        floatingPhoneNumber: whatsappSettings.floatingPhoneNumber.trim() || finalWhatsapp,
        contactPageWhatsappNumber: finalWhatsapp,
        emailAutoReplyWhatsappNumber: whatsappSettings.emailAutoReplyWhatsappNumber.trim() || finalWhatsapp
      },
      emailIntegration: {
        ...emailIntegration,
        defaultReceivingEmail: emailIntegration.defaultReceivingEmail?.trim() || finalSalesEmail
      },
      socialLinks: socialLinks,
      branches: branches,
      contactFaqs: faqs
    };

    saveContactCenterSettings(payload);
    saveBranches(branches);
    saveContactFaqs(faqs);

    setIsSaving(false);
    setIsSavedRecently(true);
    setTimeout(() => setIsSavedRecently(false), 2500);

    const msg = customMsg || "All contact channels and coordinates saved successfully!";
    if (onShowToast) onShowToast(msg);
  };

  // Branch CRUD handlers
  const handleOpenAddBranch = () => {
    setEditingBranch(null);
    setBranchName("");
    setBranchCity("Abu Dhabi");
    setBranchAddress("");
    setBranchPhone(salesPhone);
    setBranchMobile(whatsappNumber);
    setBranchEmail(email);
    setBranchWorkingHours(workingHours);
    setBranchMapUrl("");
    setBranchMapEmbedUrl("");
    setBranchIsHQ(false);
    setBranchIsActive(true);
    setIsBranchModalOpen(true);
  };

  const handleOpenEditBranch = (branch: CompanyBranch) => {
    setEditingBranch(branch);
    setBranchName(branch.name);
    setBranchCity(branch.city);
    setBranchAddress(branch.address);
    setBranchPhone(branch.phone || "");
    setBranchMobile(branch.mobile || "");
    setBranchEmail(branch.email || "");
    setBranchWorkingHours(branch.workingHours || "");
    setBranchMapUrl(branch.mapUrl || "");
    setBranchMapEmbedUrl(branch.mapEmbedUrl || "");
    setBranchIsHQ(!!branch.isHeadquarters);
    setBranchIsActive(branch.isActive !== false);
    setIsBranchModalOpen(true);
  };

  const handleSaveBranch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!branchName.trim()) {
      alert("Please provide a branch name.");
      return;
    }

    if (editingBranch) {
      const updated = updateBranch({
        ...editingBranch,
        name: branchName.trim(),
        city: branchCity.trim(),
        address: branchAddress.trim(),
        phone: branchPhone.trim(),
        mobile: branchMobile.trim(),
        email: branchEmail.trim(),
        workingHours: branchWorkingHours.trim(),
        mapUrl: branchMapUrl.trim(),
        mapEmbedUrl: branchMapEmbedUrl.trim(),
        isHeadquarters: branchIsHQ,
        isActive: branchIsActive
      });
      setBranches(getBranches());
      if (onShowToast) onShowToast(`Updated branch "${updated.name}"`);
    } else {
      const newB = addBranch({
        name: branchName.trim(),
        city: branchCity.trim(),
        address: branchAddress.trim(),
        phone: branchPhone.trim(),
        mobile: branchMobile.trim(),
        email: branchEmail.trim(),
        workingHours: branchWorkingHours.trim(),
        mapUrl: branchMapUrl.trim(),
        mapEmbedUrl: branchMapEmbedUrl.trim(),
        isHeadquarters: branchIsHQ,
        isActive: branchIsActive
      });
      setBranches(getBranches());
      if (onShowToast) onShowToast(`Added branch "${newB.name}"`);
    }
    setIsBranchModalOpen(false);
  };

  const handleDeleteBranch = (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete branch "${name}"?`)) {
      deleteBranch(id);
      setBranches(getBranches());
      if (onShowToast) onShowToast(`Deleted branch "${name}"`);
    }
  };

  const handleMoveBranch = (id: string, direction: "up" | "down") => {
    moveBranch(id, direction);
    setBranches(getBranches());
  };

  const handleResetDefaultBranches = () => {
    if (window.confirm("Reset branches back to 4 standard UAE locations?")) {
      const reset = resetDefaultBranches();
      setBranches(reset);
      if (onShowToast) onShowToast("Reset branches to default 4 UAE locations");
    }
  };

  // FAQ CRUD handlers
  const handleOpenAddFaq = () => {
    setEditingFaq(null);
    setFaqQuestion("");
    setFaqAnswer("");
    setFaqCategory("General");
    setFaqIsActive(true);
    setIsFaqModalOpen(true);
  };

  const handleOpenEditFaq = (faq: ContactFaqItem) => {
    setEditingFaq(faq);
    setFaqQuestion(faq.question);
    setFaqAnswer(faq.answer);
    setFaqCategory(faq.category || "General");
    setFaqIsActive(faq.isActive !== false);
    setIsFaqModalOpen(true);
  };

  const handleSaveFaq = (e: React.FormEvent) => {
    e.preventDefault();
    if (!faqQuestion.trim() || !faqAnswer.trim()) {
      alert("Please provide both question and answer.");
      return;
    }

    if (editingFaq) {
      updateContactFaq({
        ...editingFaq,
        question: faqQuestion.trim(),
        answer: faqAnswer.trim(),
        category: faqCategory.trim(),
        isActive: faqIsActive
      });
      setFaqs(getContactFaqs());
      if (onShowToast) onShowToast("Updated FAQ item");
    } else {
      addContactFaq({
        question: faqQuestion.trim(),
        answer: faqAnswer.trim(),
        category: faqCategory.trim(),
        isActive: faqIsActive
      });
      setFaqs(getContactFaqs());
      if (onShowToast) onShowToast("Added new FAQ item");
    }
    setIsFaqModalOpen(false);
  };

  const handleDeleteFaq = (id: string) => {
    if (window.confirm("Delete this FAQ item?")) {
      deleteContactFaq(id);
      setFaqs(getContactFaqs());
      if (onShowToast) onShowToast("Deleted FAQ item");
    }
  };

  const handleMoveFaq = (id: string, direction: "up" | "down") => {
    moveContactFaq(id, direction);
    setFaqs(getContactFaqs());
  };

  const handleResetDefaultContactFaqs = () => {
    if (window.confirm("Reset FAQs to default corporate questions?")) {
      const reset = resetDefaultContactFaqs();
      setFaqs(reset);
      if (onShowToast) onShowToast("Reset Contact FAQs to defaults");
    }
  };

  // Additional Contact Lines Handlers
  const handleAddPhoneContact = () => {
    const newPhone: DynamicContactNumber = {
      id: `phone-${Date.now()}`,
      title: "Direct Desk",
      number: "+971 2 815 6111",
      isActive: true
    };
    setPhoneContacts([...phoneContacts, newPhone]);
  };

  const handleUpdatePhoneContact = (id: string, updates: Partial<DynamicContactNumber>) => {
    setPhoneContacts(phoneContacts.map((p) => (p.id === id ? { ...p, ...updates } : p)));
  };

  const handleDeletePhoneContact = (id: string) => {
    setPhoneContacts(phoneContacts.filter((p) => p.id !== id));
  };

  const handleAddEmailContact = () => {
    const newEmail: DynamicContactEmail = {
      id: `email-${Date.now()}`,
      title: "Support Desk",
      email: "support@cooltechuae.com",
      isActive: true
    };
    setEmailContacts([...emailContacts, newEmail]);
  };

  const handleUpdateEmailContact = (id: string, updates: Partial<DynamicContactEmail>) => {
    setEmailContacts(emailContacts.map((e) => (e.id === id ? { ...e, ...updates } : e)));
  };

  const handleDeleteEmailContact = (id: string) => {
    setEmailContacts(emailContacts.filter((e) => e.id !== id));
  };

  // Test Email Dispatch
  const handleTestDispatch = async () => {
    const targetEmail = emailIntegration.defaultReceivingEmail || email || "sales@cooltechuae.com";
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
    { id: "channels" as SubmoduleTab, label: "Direct Channels & Coordinates", icon: <Phone size={15} /> },
    { id: "branches" as SubmoduleTab, label: "Regional Branches", icon: <MapPin size={15} /> },
    { id: "faqs" as SubmoduleTab, label: "Contact FAQs", icon: <HelpCircle size={15} /> },
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
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Headphones size={16} className="text-[#0f4c81]" />
              <span>{SUBMODULES.find((s) => s.id === activeSubmodule)?.label}</span>
            </h2>
            <p className="text-[11px] text-slate-500">
              Centralized corporate coordinates, departmental channels, branches, WhatsApp routing, Brevo mail, and social profiles.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleSaveAll()}
              disabled={isSaving}
              className={`px-4 py-2 text-xs font-bold rounded-lg shadow-xs flex items-center gap-1.5 transition-all cursor-pointer ${
                isSavedRecently
                  ? "bg-emerald-600 text-white"
                  : "bg-[#0f4c81] hover:bg-[#1c7e9f] text-white"
              }`}
            >
              {isSavedRecently ? (
                <>
                  <Check size={14} className="animate-bounce" />
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
        <div className="flex flex-col lg:flex-row min-h-[560px]">
          {/* Left Navigation Rail */}
          <aside
            className={`border-b lg:border-b-0 lg:border-r border-slate-200 bg-slate-50/40 p-3 shrink-0 transition-all duration-200 ${
              isNavCollapsed ? "lg:w-16" : "lg:w-60"
            }`}
          >
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-200/60">
              {!isNavCollapsed && (
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider pl-2">
                  Contact Hub
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
                        ? "bg-[#0f4c81] text-white shadow-xs font-bold"
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
                SUBMODULE 1: CONTACT INFORMATION & CHANNELS
            ─────────────────────────────────────────────────────────── */}
            {activeSubmodule === "channels" && (
              <div className="max-w-4xl space-y-7">
                
                {/* Section A: Primary Corporate Coordinates */}
                <div className="space-y-4">
                  <div className="pb-2 border-b border-slate-200/80">
                    <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 flex items-center gap-2">
                      <Building size={14} className="text-[#0f4c81]" />
                      <span>Primary Corporate Coordinates</span>
                    </h3>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Coordinates displayed in the Website Header Top Bar, Footer, and RFQ Documents.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">Company Legal Trade Name</label>
                      <input
                        type="text"
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        placeholder="Cool Technologies LLC"
                        className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-[#0f4c81] bg-slate-50/50 focus:bg-white"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">Corporate Tagline / Motto</label>
                      <input
                        type="text"
                        value={tagline}
                        onChange={(e) => setTagline(e.target.value)}
                        placeholder="The Experts in Commercial & Industrial Cooling"
                        className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-[#0f4c81] bg-slate-50/50 focus:bg-white"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">
                        Central Procurement Hotline <span className="text-slate-400 font-normal">(Header & Primary Phone)</span>
                      </label>
                      <div className="relative">
                        <Phone size={13} className="absolute left-3 top-2.5 text-slate-400" />
                        <input
                          type="text"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="+971 2 565 0123"
                          className="w-full pl-8 font-mono border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 font-bold focus:outline-none focus:border-[#0f4c81] bg-slate-50/50 focus:bg-white"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">
                        Central Inquiries Email <span className="text-slate-400 font-normal">(Header & General Email)</span>
                      </label>
                      <div className="relative">
                        <Mail size={13} className="absolute left-3 top-2.5 text-slate-400" />
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="info@cooltechuae.com"
                          className="w-full pl-8 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 font-bold focus:outline-none focus:border-[#0f4c81] bg-slate-50/50 focus:bg-white"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">Working / Operations Schedule</label>
                      <div className="relative">
                        <Clock size={13} className="absolute left-3 top-2.5 text-slate-400" />
                        <input
                          type="text"
                          value={workingHours}
                          onChange={(e) => setWorkingHours(e.target.value)}
                          placeholder="Monday - Saturday: 8:00 AM - 7:00 PM (GST)"
                          className="w-full pl-8 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-[#0f4c81] bg-slate-50/50 focus:bg-white"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">Google Maps Facility Embed / URL</label>
                      <div className="relative">
                        <ExternalLink size={13} className="absolute left-3 top-2.5 text-slate-400" />
                        <input
                          type="url"
                          value={locationMapUrl}
                          onChange={(e) => setLocationMapUrl(e.target.value)}
                          placeholder="https://maps.google.com/..."
                          className="w-full pl-8 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-[#0f4c81] bg-slate-50/50 focus:bg-white"
                        />
                      </div>
                    </div>

                    <div className="md:col-span-2">
                      <label className="text-xs font-bold text-slate-700 block mb-1">Headquarters Facility Address</label>
                      <div className="relative">
                        <MapPin size={13} className="absolute left-3 top-2.5 text-slate-400" />
                        <input
                          type="text"
                          value={address}
                          onChange={(e) => setAddress(e.target.value)}
                          placeholder="Plot-99, Sector M-42 / M-14, Mussafah Industrial Area, Abu Dhabi, UAE"
                          className="w-full pl-8 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 font-medium focus:outline-none focus:border-[#0f4c81] bg-slate-50/50 focus:bg-white"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Section B: Department Direct Channels (Directly on /contact) */}
                <div className="space-y-4 pt-4 border-t border-slate-200/80">
                  <div className="pb-2 border-b border-slate-200/80">
                    <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 flex items-center gap-2">
                      <Phone size={14} className="text-[#0f4c81]" />
                      <span>Department Direct Channels (Public /contact Page)</span>
                    </h3>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Configure the exact contact numbers and email addresses displayed in the 4 Direct Channel blocks on the Contact page.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* 1. Direct Hotline & WhatsApp */}
                    <div className="md:col-span-2 p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-2">
                          <MessageSquare size={14} className="text-emerald-600" />
                          <span>Direct Telephone & WhatsApp Number</span>
                        </span>
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                          Direct Line
                        </span>
                      </div>
                      <div className="relative pt-1">
                        <input
                          type="text"
                          value={whatsappNumber}
                          onChange={(e) => setWhatsappNumber(e.target.value)}
                          placeholder="+971 50 123 4567"
                          className="w-full border border-slate-300 rounded-lg px-3 py-2 text-xs font-mono font-black text-slate-900 focus:outline-none focus:border-emerald-600 bg-white"
                        />
                      </div>
                      <p className="text-[11px] text-slate-500">
                        This number powers both the Direct Telephone link and the 1-click WhatsApp Chat button on `/contact`.
                      </p>
                    </div>

                    {/* 2. Sales Department */}
                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-3">
                      <span className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-2">
                        <Phone size={13} className="text-[#0f4c81]" />
                        <span>Sales Department</span>
                      </span>
                      <div>
                        <label className="text-[10px] font-bold uppercase text-slate-500 block mb-1">Sales Phone Number</label>
                        <input
                          type="text"
                          value={salesPhone}
                          onChange={(e) => setSalesPhone(e.target.value)}
                          placeholder="+971 2 565 0123"
                          className="w-full border border-slate-300 rounded-lg px-3 py-1.5 text-xs font-mono font-bold text-slate-900 focus:outline-none focus:border-[#0f4c81] bg-white"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold uppercase text-slate-500 block mb-1">Sales Email ID</label>
                        <input
                          type="email"
                          value={salesEmail}
                          onChange={(e) => setSalesEmail(e.target.value)}
                          placeholder="sales@cooltechuae.com"
                          className="w-full border border-slate-300 rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-900 focus:outline-none focus:border-[#0f4c81] bg-white"
                        />
                      </div>
                    </div>

                    {/* 3. Services Department */}
                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-3">
                      <span className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-2">
                        <Phone size={13} className="text-cyan-800" />
                        <span>Service & Technical Support</span>
                      </span>
                      <div>
                        <label className="text-[10px] font-bold uppercase text-slate-500 block mb-1">24/7 Emergency Support Phone</label>
                        <input
                          type="text"
                          value={servicesPhone}
                          onChange={(e) => setServicesPhone(e.target.value)}
                          placeholder="+971 2 815 6161"
                          className="w-full border border-slate-300 rounded-lg px-3 py-1.5 text-xs font-mono font-bold text-slate-900 focus:outline-none focus:border-cyan-800 bg-white"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold uppercase text-slate-500 block mb-1">Maintenance & Care Email ID</label>
                        <input
                          type="email"
                          value={servicesEmail}
                          onChange={(e) => setServicesEmail(e.target.value)}
                          placeholder="care@cooltechuae.com"
                          className="w-full border border-slate-300 rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-900 focus:outline-none focus:border-cyan-800 bg-white"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Section C: Additional Custom Contact Desks */}
                <div className="space-y-4 pt-4 border-t border-slate-200/80">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200/80">
                    <div>
                      <h3 className="text-xs font-black uppercase tracking-wider text-slate-900">
                        Additional Custom Contact Desks (Optional)
                      </h3>
                      <p className="text-[11px] text-slate-500">
                        Add any additional specialized phone numbers or departmental emails to display across the website.
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={handleAddPhoneContact}
                        className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-bold rounded-lg border border-slate-200 transition-colors flex items-center gap-1"
                      >
                        <Plus size={12} />
                        <span>Add Phone</span>
                      </button>
                      <button
                        type="button"
                        onClick={handleAddEmailContact}
                        className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-bold rounded-lg border border-slate-200 transition-colors flex items-center gap-1"
                      >
                        <Plus size={12} />
                        <span>Add Email</span>
                      </button>
                    </div>
                  </div>

                  {phoneContacts.filter(p => p.id !== "phone-sales" && p.id !== "phone-services").length > 0 && (
                    <div className="space-y-2">
                      <span className="text-[10px] font-extrabold uppercase text-slate-400">Extra Phone Lines</span>
                      {phoneContacts.filter(p => p.id !== "phone-sales" && p.id !== "phone-services").map((contact) => (
                        <div key={contact.id} className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg border border-slate-200">
                          <input
                            type="text"
                            value={contact.title}
                            onChange={(e) => handleUpdatePhoneContact(contact.id, { title: e.target.value })}
                            placeholder="Desk Title"
                            className="w-1/3 border border-slate-200 rounded-md px-2 py-1 text-xs bg-white"
                          />
                          <input
                            type="text"
                            value={contact.number}
                            onChange={(e) => handleUpdatePhoneContact(contact.id, { number: e.target.value })}
                            placeholder="Phone Number"
                            className="flex-1 font-mono border border-slate-200 rounded-md px-2 py-1 text-xs bg-white font-bold"
                          />
                          <button
                            type="button"
                            onClick={() => handleDeletePhoneContact(contact.id)}
                            className="p-1.5 text-slate-400 hover:text-red-600 rounded-md"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {emailContacts.filter(e => e.id !== "email-general" && e.id !== "email-sales" && e.id !== "email-services").length > 0 && (
                    <div className="space-y-2">
                      <span className="text-[10px] font-extrabold uppercase text-slate-400">Extra Email Addresses</span>
                      {emailContacts.filter(e => e.id !== "email-general" && e.id !== "email-sales" && e.id !== "email-services").map((contact) => (
                        <div key={contact.id} className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg border border-slate-200">
                          <input
                            type="text"
                            value={contact.title}
                            onChange={(e) => handleUpdateEmailContact(contact.id, { title: e.target.value })}
                            placeholder="Desk Title"
                            className="w-1/3 border border-slate-200 rounded-md px-2 py-1 text-xs bg-white"
                          />
                          <input
                            type="email"
                            value={contact.email}
                            onChange={(e) => handleUpdateEmailContact(contact.id, { email: e.target.value })}
                            placeholder="Email Address"
                            className="flex-1 border border-slate-200 rounded-md px-2 py-1 text-xs bg-white font-semibold"
                          />
                          <button
                            type="button"
                            onClick={() => handleDeleteEmailContact(contact.id)}
                            className="p-1.5 text-slate-400 hover:text-red-600 rounded-md"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </div>
            )}

            {/* ───────────────────────────────────────────────────────────
                SUBMODULE 2: REGIONAL BRANCHES DIRECTORY
            ─────────────────────────────────────────────────────────── */}
            {activeSubmodule === "branches" && (
              <div className="max-w-4xl space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-200">
                  <div>
                    <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 flex items-center gap-2">
                      <MapPin size={14} className="text-[#0f4c81]" />
                      <span>Regional Branch Directory</span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200 font-bold">
                        {branches.length}
                      </span>
                    </h3>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Manage physical UAE branches, contact numbers, emails, addresses, and live interactive map locations.
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleResetDefaultBranches}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-lg transition-colors cursor-pointer flex items-center gap-1.5"
                    >
                      <RotateCcw size={12} />
                      <span>Reset Defaults</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleOpenAddBranch}
                      className="px-3.5 py-1.5 bg-[#0f4c81] hover:bg-[#1c7e9f] text-white font-extrabold text-xs rounded-lg shadow-2xs transition-all cursor-pointer flex items-center gap-1.5"
                    >
                      <Plus size={14} />
                      <span>Add Branch</span>
                    </button>
                  </div>
                </div>

                <div className="space-y-3">
                  {branches.length === 0 ? (
                    <div className="p-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-300">
                      <p className="text-xs font-bold text-slate-600">No regional branches configured.</p>
                      <button
                        type="button"
                        onClick={handleResetDefaultBranches}
                        className="mt-3 px-3 py-1.5 bg-[#0f4c81] text-white font-bold text-xs rounded-lg inline-flex items-center gap-1.5"
                      >
                        <RotateCcw size={12} />
                        <span>Load Default UAE Branches</span>
                      </button>
                    </div>
                  ) : (
                    branches.map((branch, idx) => (
                      <div
                        key={branch.id}
                        className={`border rounded-xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition-all ${
                          branch.isActive !== false ? "bg-white border-slate-200 shadow-2xs" : "bg-slate-50 border-slate-200/60 opacity-60"
                        }`}
                      >
                        <div className="flex items-start gap-3 flex-1 min-w-0">
                          <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#0f4c81] font-bold text-xs flex items-center justify-center shrink-0 border border-blue-100 mt-0.5">
                            #{idx + 1}
                          </div>
                          <div className="space-y-1 min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="font-sans font-black text-xs text-slate-900 uppercase tracking-tight">
                                {branch.name}
                              </span>
                              <span className="text-[10px] font-bold px-2 py-0.2 bg-slate-100 text-slate-700 rounded border border-slate-200">
                                {branch.city}
                              </span>
                              {branch.isHeadquarters && (
                                <span className="text-[9px] font-bold px-2 py-0.2 bg-[#0f4c81] text-white rounded">
                                  ★ Primary HQ
                                </span>
                              )}
                              {!branch.isActive && (
                                <span className="text-[9px] font-bold px-1.5 py-0.2 bg-amber-100 text-amber-800 rounded">
                                  Hidden
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-slate-600 truncate">
                              <MapPin size={11} className="inline mr-1 text-slate-400" />
                              {branch.address}
                            </p>
                            <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500 font-mono pt-0.5">
                              <span className="flex items-center gap-1">
                                <Phone size={11} className="text-[#0f4c81]" />
                                {branch.phone}
                              </span>
                              {branch.mobile && (
                                <span className="flex items-center gap-1">
                                  <span className="text-emerald-600 font-bold">Mob:</span>
                                  {branch.mobile}
                                </span>
                              )}
                              <span className="flex items-center gap-1">
                                <Mail size={11} className="text-[#0f4c81]" />
                                {branch.email}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 self-end md:self-center shrink-0">
                          <button
                            type="button"
                            onClick={() => handleMoveBranch(branch.id, "up")}
                            disabled={idx === 0}
                            className="p-1.5 hover:bg-slate-100 disabled:opacity-30 border border-slate-200 rounded-lg text-slate-600 transition-colors"
                            title="Move Up"
                          >
                            <ArrowUp size={13} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleMoveBranch(branch.id, "down")}
                            disabled={idx === branches.length - 1}
                            className="p-1.5 hover:bg-slate-100 disabled:opacity-30 border border-slate-200 rounded-lg text-slate-600 transition-colors"
                            title="Move Down"
                          >
                            <ArrowDown size={13} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleOpenEditBranch(branch)}
                            className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-lg transition-colors flex items-center gap-1"
                          >
                            <Edit3 size={12} />
                            <span>Edit</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteBranch(branch.id, branch.name)}
                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* ───────────────────────────────────────────────────────────
                SUBMODULE 3: CONTACT FAQS & SEO SCHEMA
            ─────────────────────────────────────────────────────────── */}
            {activeSubmodule === "faqs" && (
              <div className="max-w-4xl space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-200">
                  <div>
                    <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 flex items-center gap-2">
                      <HelpCircle size={14} className="text-[#0f4c81]" />
                      <span>Contact Page FAQs & Structured SEO Schema</span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200 font-bold">
                        {faqs.length}
                      </span>
                    </h3>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Manage questions and answers rendered on the Contact page and indexed in Google FAQ Schema.
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleResetDefaultContactFaqs}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-lg transition-colors cursor-pointer flex items-center gap-1.5"
                    >
                      <RotateCcw size={12} />
                      <span>Reset Defaults</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleOpenAddFaq}
                      className="px-3.5 py-1.5 bg-[#0f4c81] hover:bg-[#1c7e9f] text-white font-extrabold text-xs rounded-lg shadow-2xs transition-all cursor-pointer flex items-center gap-1.5"
                    >
                      <Plus size={14} />
                      <span>Add FAQ</span>
                    </button>
                  </div>
                </div>

                <div className="space-y-3">
                  {faqs.length === 0 ? (
                    <div className="p-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-300">
                      <p className="text-xs font-bold text-slate-600">No FAQs configured.</p>
                      <button
                        type="button"
                        onClick={handleResetDefaultContactFaqs}
                        className="mt-3 px-3 py-1.5 bg-[#0f4c81] text-white font-bold text-xs rounded-lg inline-flex items-center gap-1.5"
                      >
                        <RotateCcw size={12} />
                        <span>Load Default FAQs</span>
                      </button>
                    </div>
                  ) : (
                    faqs.map((faq, idx) => (
                      <div
                        key={faq.id}
                        className={`border rounded-xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition-all ${
                          faq.isActive !== false ? "bg-white border-slate-200 shadow-2xs" : "bg-slate-50 border-slate-200/60 opacity-60"
                        }`}
                      >
                        <div className="flex items-start gap-3 flex-1 min-w-0">
                          <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#0f4c81] font-bold text-xs flex items-center justify-center shrink-0 border border-blue-100 mt-0.5">
                            Q{idx + 1}
                          </div>
                          <div className="space-y-1 min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="font-bold text-xs text-slate-900">
                                {faq.question}
                              </span>
                              {faq.category && (
                                <span className="text-[10px] font-bold px-2 py-0.2 bg-blue-50 text-[#0f4c81] rounded border border-blue-100">
                                  {faq.category}
                                </span>
                              )}
                              {!faq.isActive && (
                                <span className="text-[9px] font-bold px-1.5 py-0.2 bg-amber-100 text-amber-800 rounded">
                                  Hidden
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-slate-600 leading-relaxed line-clamp-2">
                              {faq.answer}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 self-end md:self-center shrink-0">
                          <button
                            type="button"
                            onClick={() => handleMoveFaq(faq.id, "up")}
                            disabled={idx === 0}
                            className="p-1.5 hover:bg-slate-100 disabled:opacity-30 border border-slate-200 rounded-lg text-slate-600 transition-colors"
                            title="Move Up"
                          >
                            <ArrowUp size={13} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleMoveFaq(faq.id, "down")}
                            disabled={idx === faqs.length - 1}
                            className="p-1.5 hover:bg-slate-100 disabled:opacity-30 border border-slate-200 rounded-lg text-slate-600 transition-colors"
                            title="Move Down"
                          >
                            <ArrowDown size={13} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleOpenEditFaq(faq)}
                            className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-lg transition-colors flex items-center gap-1"
                          >
                            <Edit3 size={12} />
                            <span>Edit</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteFaq(faq.id)}
                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* ───────────────────────────────────────────────────────────
                SUBMODULE 4: WHATSAPP ROUTING
            ─────────────────────────────────────────────────────────── */}
            {activeSubmodule === "whatsapp" && (
              <div className="max-w-2xl space-y-6">
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
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ───────────────────────────────────────────────────────────
                SUBMODULE 5: EMAIL ROUTING (BREVO)
            ─────────────────────────────────────────────────────────── */}
            {activeSubmodule === "mail" && (
              <div className="max-w-2xl space-y-6">
                <div className="space-y-4">
                  <div className="pb-3 border-b border-slate-100 flex items-center justify-between">
                    <div>
                      <h3 className="text-xs font-bold text-slate-900">Brevo Transactional Email Integration</h3>
                      <p className="text-[11px] text-slate-500">Official mail routing and instant notifications for inquiries and RFQs.</p>
                    </div>
                    <button
                      type="button"
                      onClick={handleTestDispatch}
                      disabled={isSendingTestEmail}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-medium rounded-lg flex items-center gap-1.5 transition-colors"
                    >
                      <SendHorizontal size={13} />
                      <span>{isSendingTestEmail ? "Sending..." : "Send Test Email"}</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-medium text-slate-700 block mb-1">Sender Email Address</label>
                      <input
                        type="email"
                        value={emailIntegration.brevoSenderEmail}
                        onChange={(e) =>
                          setEmailIntegration({ ...emailIntegration, brevoSenderEmail: e.target.value })
                        }
                        placeholder="ctauhweb@gmail.com"
                        className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-slate-900 bg-white"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-medium text-slate-700 block mb-1">Sender Display Name</label>
                      <input
                        type="text"
                        value={emailIntegration.brevoSenderName}
                        onChange={(e) =>
                          setEmailIntegration({ ...emailIntegration, brevoSenderName: e.target.value })
                        }
                        placeholder="Cool Technologies"
                        className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-slate-900 bg-white"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="text-xs font-medium text-slate-700 block mb-1">Default Inquiries Destination Email</label>
                      <input
                        type="email"
                        value={emailIntegration.defaultReceivingEmail}
                        onChange={(e) =>
                          setEmailIntegration({ ...emailIntegration, defaultReceivingEmail: e.target.value })
                        }
                        placeholder="sales@cooltechuae.com"
                        className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-slate-900 bg-white"
                      />
                      <p className="text-[11px] text-slate-400 mt-1">All contact messages and quote requests are delivered here.</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ───────────────────────────────────────────────────────────
                SUBMODULE 6: SOCIAL MEDIA LINKS
            ─────────────────────────────────────────────────────────── */}
            {activeSubmodule === "social" && (
              <div className="max-w-3xl space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                  <div>
                    <h3 className="text-xs font-bold text-slate-900">Official Social Media Profiles</h3>
                    <p className="text-[11px] text-slate-500">Manage links to LinkedIn, Facebook, Instagram, X/Twitter, and YouTube.</p>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddSocialLink}
                    className="px-3 py-1.5 bg-[#0f4c81] hover:bg-[#1c7e9f] text-white text-xs font-bold rounded-lg shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Plus size={13} />
                    <span>Add Profile</span>
                  </button>
                </div>

                <div className="space-y-2.5">
                  {socialLinks.map((link) => (
                    <div
                      key={link.id}
                      className="p-3 bg-slate-50/70 border border-slate-200 rounded-xl flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-700 shrink-0 shadow-2xs">
                          {renderSocialIcon(link, 16)}
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 flex-1 min-w-0">
                          <input
                            type="text"
                            value={link.platform}
                            onChange={(e) => handleUpdateSocialLink(link.id, { platform: e.target.value })}
                            placeholder="Platform (e.g. LinkedIn)"
                            className="border border-slate-200 rounded-md px-2.5 py-1.5 text-xs text-slate-900 bg-white"
                          />
                          <input
                            type="url"
                            value={link.url}
                            onChange={(e) => handleUpdateSocialLink(link.id, { url: e.target.value })}
                            placeholder="https://..."
                            className="border border-slate-200 rounded-md px-2.5 py-1.5 text-xs text-slate-900 bg-white"
                          />
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-end sm:self-center">
                        <label className="flex items-center gap-1.5 text-xs text-slate-600 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={link.isActive !== false}
                            onChange={(e) => handleUpdateSocialLink(link.id, { isActive: e.target.checked })}
                            className="rounded-xs border-slate-300"
                          />
                          <span>Active</span>
                        </label>
                        <button
                          type="button"
                          onClick={() => handleTriggerCustomIconUpload(link.id)}
                          className="p-1.5 hover:bg-slate-200 rounded-md text-slate-500 hover:text-slate-800 transition-colors"
                          title="Upload custom icon"
                        >
                          <Globe size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteSocialLink(link.id)}
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                        >
                          <Trash2 size={14} />
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

      {/* ─────────────────────────────────────────────────────────────
          BRANCH EDIT / ADD MODAL
      ───────────────────────────────────────────────────────────── */}
      {isBranchModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto shadow-2xl p-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight flex items-center gap-2">
                <MapPin size={16} className="text-[#0f4c81]" />
                <span>{editingBranch ? `Edit Branch: ${editingBranch.name}` : "Add Regional Facility / Branch"}</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsBranchModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSaveBranch} className="space-y-4 pt-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="sm:col-span-2">
                  <label className="text-xs font-bold text-slate-700 block mb-1">Branch / Facility Name *</label>
                  <input
                    type="text"
                    required
                    value={branchName}
                    onChange={(e) => setBranchName(e.target.value)}
                    placeholder="e.g. Dubai Commercial & Logistics Hub"
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs font-semibold text-slate-900"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Emirate / City *</label>
                  <input
                    type="text"
                    required
                    value={branchCity}
                    onChange={(e) => setBranchCity(e.target.value)}
                    placeholder="e.g. Dubai"
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs font-semibold text-slate-900"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Landline Phone</label>
                  <input
                    type="text"
                    value={branchPhone}
                    onChange={(e) => setBranchPhone(e.target.value)}
                    placeholder="+971 4 345 6789"
                    className="w-full font-mono border border-slate-200 rounded-lg px-3 py-2 text-xs font-bold text-slate-900"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Mobile / WhatsApp</label>
                  <input
                    type="text"
                    value={branchMobile}
                    onChange={(e) => setBranchMobile(e.target.value)}
                    placeholder="+971 50 123 4567"
                    className="w-full font-mono border border-slate-200 rounded-lg px-3 py-2 text-xs font-bold text-slate-900"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Branch Email ID</label>
                  <input
                    type="email"
                    value={branchEmail}
                    onChange={(e) => setBranchEmail(e.target.value)}
                    placeholder="dubai@cooltechuae.com"
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs font-semibold text-slate-900"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="text-xs font-bold text-slate-700 block mb-1">Physical Address</label>
                  <input
                    type="text"
                    value={branchAddress}
                    onChange={(e) => setBranchAddress(e.target.value)}
                    placeholder="Street 18B, Warehouse #4, Al Quoz Industrial Area 3, Dubai, UAE"
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="text-xs font-bold text-slate-700 block mb-1">Interactive Google Map Embed URL</label>
                  <input
                    type="text"
                    value={branchMapEmbedUrl}
                    onChange={(e) => setBranchMapEmbedUrl(e.target.value)}
                    placeholder="https://maps.google.com/maps?q=...&output=embed"
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs font-mono text-slate-700"
                  />
                </div>

                <div className="sm:col-span-2 flex items-center justify-between pt-2">
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-700">
                    <input
                      type="checkbox"
                      checked={branchIsHQ}
                      onChange={(e) => setBranchIsHQ(e.target.checked)}
                      className="rounded-xs text-[#0f4c81]"
                    />
                    <span>Designate as Main Corporate HQ</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-700">
                    <input
                      type="checkbox"
                      checked={branchIsActive}
                      onChange={(e) => setBranchIsActive(e.target.checked)}
                      className="rounded-xs text-emerald-600"
                    />
                    <span>Active & Visible</span>
                  </label>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsBranchModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 font-bold text-xs rounded-xl hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#0f4c81] hover:bg-[#1c7e9f] text-white font-black text-xs rounded-xl shadow-xs"
                >
                  Save Branch
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          FAQ EDIT / ADD MODAL
      ───────────────────────────────────────────────────────────── */}
      {isFaqModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full shadow-2xl p-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight flex items-center gap-2">
                <HelpCircle size={16} className="text-[#0f4c81]" />
                <span>{editingFaq ? "Edit FAQ Item" : "Add Contact FAQ Item"}</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsFaqModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSaveFaq} className="space-y-4 pt-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Question *</label>
                <input
                  type="text"
                  required
                  value={faqQuestion}
                  onChange={(e) => setFaqQuestion(e.target.value)}
                  placeholder="e.g. What are your official working hours?"
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs font-semibold text-slate-900"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Answer *</label>
                <textarea
                  required
                  rows={4}
                  value={faqAnswer}
                  onChange={(e) => setFaqAnswer(e.target.value)}
                  placeholder="Provide a clear, helpful response..."
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Category</label>
                  <input
                    type="text"
                    value={faqCategory}
                    onChange={(e) => setFaqCategory(e.target.value)}
                    placeholder="General, Quotations, Logistics"
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900"
                  />
                </div>

                <div className="flex items-center pt-6">
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-700">
                    <input
                      type="checkbox"
                      checked={faqIsActive}
                      onChange={(e) => setFaqIsActive(e.target.checked)}
                      className="rounded-xs text-emerald-600"
                    />
                    <span>Active & Indexed</span>
                  </label>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsFaqModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 font-bold text-xs rounded-xl hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#0f4c81] hover:bg-[#1c7e9f] text-white font-black text-xs rounded-xl shadow-xs"
                >
                  Save FAQ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
