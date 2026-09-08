import React, { useState, useEffect, useRef } from "react";
import { 
  Plus, 
  Trash2, 
  Edit3, 
  ArrowUp, 
  ArrowDown, 
  RotateCcw, 
  Upload, 
  Link as LinkIcon, 
  Globe, 
  Phone, 
  Mail, 
  MapPin, 
  Clock, 
  Check, 
  X, 
  Image as ImageIcon, 
  Type, 
  Eye, 
  EyeOff,
  Building,
  Save,
  Share2,
  Sliders,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Move,
  Zap,
  Gauge,
  Trophy,
  Award,
  Star,
  Compass,
  Settings as SettingsIcon,
  HeartHandshake,
  CheckCircle2,
  ShieldCheck,
  Tag,
  Sparkles,
  Layers,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  MessageSquare,
  Send,
  Key,
  AtSign,
  HelpCircle,
  Info,
  ExternalLink,
  ShieldAlert,
  Headphones
} from "lucide-react";
import { BrandPartner, GeneralSiteSettings, AchievementMilestone, CompanyBranch, ContactFaqItem } from "../../types";
import { uploadProductImage } from "../../services/storageService";
import { 
  getGeneralSettings, 
  saveGeneralSettings,
  getBrandPartners, 
  addBrandPartner, 
  updateBrandPartner, 
  deleteBrandPartner, 
  moveBrandPartner, 
  resetDefaultBrandPartners,
  getAchievements, 
  addAchievement, 
  updateAchievement, 
  deleteAchievement, 
  moveAchievement, 
  resetDefaultAchievements,
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

interface AdminGeneralSettingsProps {
  onShowToast?: (message: string) => void;
  onNavigateToContactCenter?: () => void;
}

const COLOR_PRESETS = [
  { name: "Magenta Pink", color: "rgb(193, 36, 91)" },
  { name: "Sky Blue", color: "rgb(2, 132, 199)" },
  { name: "Ocean Teal", color: "rgb(0, 130, 166)" },
  { name: "Royal Blue", color: "rgb(30, 58, 138)" },
  { name: "Deep Navy", color: "rgb(5, 79, 142)" },
  { name: "Emerald Teal", color: "rgb(15, 130, 120)" },
  { name: "Lime Green", color: "rgb(111, 136, 23)" },
  { name: "Amber Orange", color: "rgb(211, 114, 19)" },
  { name: "Crimson Red", color: "rgb(163, 63, 57)" },
  { name: "Deep Purple", color: "rgb(90, 51, 112)" },
  { name: "Golden Bronze", color: "rgb(180, 130, 20)" }
];

const ICON_OPTIONS = [
  { name: "Trophy", label: "Trophy Award", icon: Trophy },
  { name: "Award", label: "Award Medal", icon: Award },
  { name: "Building", label: "Establishment / Facility", icon: Building },
  { name: "Zap", label: "Contracting / Execution", icon: Zap },
  { name: "Star", label: "Sourcing Hub / Star", icon: Star },
  { name: "HeartHandshake", label: "Partnership / Dealership", icon: HeartHandshake },
  { name: "Compass", label: "Scale-up / Compass", icon: Compass },
  { name: "Settings", label: "Service Desk / Mechanics", icon: SettingsIcon },
  { name: "CheckCircle2", label: "Milestone Verified", icon: CheckCircle2 },
  { name: "ShieldCheck", label: "Quality & Assurance", icon: ShieldCheck }
];

export default function AdminGeneralSettings({ onShowToast, onNavigateToContactCenter }: AdminGeneralSettingsProps) {
  const [activeTab, setActiveTab] = useState<"brands" | "achievements" | "contacts">("brands");
  const [isNavCollapsed, setIsNavCollapsed] = useState<boolean>(false);
  const [isSavedRecently, setIsSavedRecently] = useState(false);
  const [savedSuccessMsg, setSavedSuccessMsg] = useState<string | null>(null);

  // General Settings State
  const [settings, setSettings] = useState<GeneralSiteSettings>(getGeneralSettings());
  const [partners, setPartners] = useState<BrandPartner[]>([]);
  const [achievements, setAchievements] = useState<AchievementMilestone[]>([]);
  const [tickerSpeed, setTickerSpeed] = useState<number>(25);
  const [globalAchievementBgOpacity, setGlobalAchievementBgOpacity] = useState<number>(0.3);

  const [isSaving, setIsSaving] = useState(false);

  // Brand Modal State
  const [isBrandModalOpen, setIsBrandModalOpen] = useState(false);
  const [editingPartner, setEditingPartner] = useState<BrandPartner | null>(null);

  // Brand Form Fields
  const [brandName, setBrandName] = useState("");
  const [brandDisplayType, setBrandDisplayType] = useState<"image" | "text">("image");
  const [brandLogo, setBrandLogo] = useState("");
  const [brandTagline, setBrandTagline] = useState("");
  const [brandWebsiteUrl, setBrandWebsiteUrl] = useState("");
  const [brandIsActive, setBrandIsActive] = useState(true);

  // Brand Image Adjuster Fields
  const [brandScale, setBrandScale] = useState<number>(1);
  const [brandPosition, setBrandPosition] = useState<string>("50% 50%");
  const [brandObjectFit, setBrandObjectFit] = useState<"contain" | "cover" | "scale-down">("contain");
  const [brandPadding, setBrandPadding] = useState<number>(4);

  // Achievement Modal State
  const [isAchievementModalOpen, setIsAchievementModalOpen] = useState(false);
  const [editingAchievement, setEditingAchievement] = useState<AchievementMilestone | null>(null);

  // Achievement Form Fields
  const [achYear, setAchYear] = useState("");
  const [achTitle, setAchTitle] = useState("");
  const [achSubtitle, setAchSubtitle] = useState("");
  const [achDescription, setAchDescription] = useState("");
  const [achDealershipsText, setAchDealershipsText] = useState("");
  const [achColor, setAchColor] = useState("rgb(2, 132, 199)");
  const [achIconName, setAchIconName] = useState("Award");
  const [achPosition, setAchPosition] = useState<"up" | "down">("up");
  const [achIsActive, setAchIsActive] = useState(true);
  const [achImage, setAchImage] = useState("");
  const [achImageOpacity, setAchImageOpacity] = useState<number>(0.3);

  // Contact Form Fields
  const [companyName, setCompanyName] = useState("");
  const [tagline, setTagline] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [address, setAddress] = useState("");
  const [workingHours, setWorkingHours] = useState("");

  // Branch Management State
  const [branches, setBranches] = useState<CompanyBranch[]>([]);
  const [isBranchModalOpen, setIsBranchModalOpen] = useState(false);
  const [editingBranch, setEditingBranch] = useState<CompanyBranch | null>(null);

  // Branch Form Fields
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

  // Collapsible Sections State (for Company & Branches Tab)
  const [isHQExpanded, setIsHQExpanded] = useState(true);
  const [isBranchesExpanded, setIsBranchesExpanded] = useState(true);
  const [isFaqsExpanded, setIsFaqsExpanded] = useState(true);

  // FAQ Management State
  const [faqs, setFaqs] = useState<ContactFaqItem[]>([]);
  const [isFaqModalOpen, setIsFaqModalOpen] = useState(false);
  const [editingFaq, setEditingFaq] = useState<ContactFaqItem | null>(null);

  // FAQ Form Fields
  const [faqQuestion, setFaqQuestion] = useState("");
  const [faqAnswer, setFaqAnswer] = useState("");
  const [faqCategory, setFaqCategory] = useState("General");
  const [faqIsActive, setFaqIsActive] = useState(true);

  const brandFileInputRef = useRef<HTMLInputElement | null>(null);
  const achievementFileInputRef = useRef<HTMLInputElement | null>(null);

  // Load initial settings
  const refreshData = () => {
    const s = getGeneralSettings();
    setSettings(s);
    setPartners(getBrandPartners());
    setAchievements(getAchievements());
    setBranches(getBranches());
    setFaqs(getContactFaqs());
    setTickerSpeed(s.brandTickerSpeed || 25);
    setGlobalAchievementBgOpacity(s.achievementBgOpacity !== undefined ? s.achievementBgOpacity : 0.3);

    setCompanyName(s.companyName || "");
    setTagline(s.tagline || "");
    setEmail(s.email || "");
    setPhone(s.phone || "");
    setWhatsapp(s.whatsapp || "");
    setAddress(s.address || "");
    setWorkingHours(s.workingHours || "");

  };

  useEffect(() => {
    refreshData();
  }, []);

  // Save All Settings
  const handleSaveAll = (customMsg?: any) => {
    const msg = typeof customMsg === "string" ? customMsg : "Settings saved successfully!";
    setIsSaving(true);
    try {
      saveGeneralSettings({
        companyName: companyName.trim(),
        tagline: tagline.trim(),
        email: email.trim(),
        phone: phone.trim(),
        whatsapp: whatsapp.trim(),
        address: address.trim(),
        workingHours: workingHours.trim(),
        brandPartners: partners,
        achievements: achievements,
        branches: branches,
        contactFaqs: faqs,
        brandTickerSpeed: tickerSpeed,
        achievementBgOpacity: globalAchievementBgOpacity,
      });

      setIsSavedRecently(true);
      setSavedSuccessMsg(msg);
      setTimeout(() => {
        setIsSavedRecently(false);
        setSavedSuccessMsg(null);
      }, 3000);

      if (onShowToast) {
        onShowToast(msg);
      }
    } catch (err) {
      console.error("Failed to save settings:", err);
      if (onShowToast) {
        onShowToast("Failed to save settings. Please try again.");
      }
    } finally {
      setIsSaving(false);
    }
  };

  /* ───────────────────────────────────────────────────────────
      FAQ MANAGEMENT HANDLERS
  ─────────────────────────────────────────────────────────── */

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
      alert("Please provide both a Question and an Answer.");
      return;
    }

    if (editingFaq) {
      updateContactFaq(editingFaq.id, {
        question: faqQuestion.trim(),
        answer: faqAnswer.trim(),
        category: faqCategory.trim(),
        isActive: faqIsActive
      });
      if (onShowToast) onShowToast("FAQ updated successfully!");
    } else {
      addContactFaq({
        question: faqQuestion.trim(),
        answer: faqAnswer.trim(),
        category: faqCategory.trim(),
        isActive: faqIsActive
      });
      if (onShowToast) onShowToast("New FAQ added successfully!");
    }

    setIsFaqModalOpen(false);
    setEditingFaq(null);
    refreshData();
  };

  const handleDeleteFaq = (id: string, question: string) => {
    if (window.confirm(`Delete FAQ: "${question}"?`)) {
      deleteContactFaq(id);
      if (onShowToast) onShowToast("FAQ deleted.");
      refreshData();
    }
  };

  const handleMoveFaq = (id: string, direction: "up" | "down") => {
    moveContactFaq(id, direction);
    refreshData();
  };

  const handleToggleActiveFaq = (faq: ContactFaqItem) => {
    updateContactFaq(faq.id, { isActive: !faq.isActive });
    refreshData();
  };

  const handleResetDefaultContactFaqs = () => {
    if (window.confirm("Reset FAQs to default entries? This will replace any custom FAQs.")) {
      resetDefaultContactFaqs();
      if (onShowToast) onShowToast("FAQs reset to default successfully!");
      refreshData();
    }
  };

  /* ───────────────────────────────────────────────────────────
      BRANCH MANAGEMENT HANDLERS
  ─────────────────────────────────────────────────────────── */

  const handleOpenAddBranch = () => {
    setEditingBranch(null);
    setBranchName("");
    setBranchCity("Abu Dhabi");
    setBranchAddress("");
    setBranchPhone("+971 ");
    setBranchMobile("");
    setBranchEmail("info@cooltechuae.com");
    setBranchWorkingHours("Monday - Saturday: 8:00 AM - 7:00 PM (GST)");
    setBranchMapUrl("");
    setBranchMapEmbedUrl("");
    setBranchIsHQ(branches.length === 0);
    setBranchIsActive(true);
    setIsBranchModalOpen(true);
  };

  const handleOpenEditBranch = (branch: CompanyBranch) => {
    setEditingBranch(branch);
    setBranchName(branch.name);
    setBranchCity(branch.city || "Abu Dhabi");
    setBranchAddress(branch.address);
    setBranchPhone(branch.phone);
    setBranchMobile(branch.mobile || "");
    setBranchEmail(branch.email);
    setBranchWorkingHours(branch.workingHours || "Monday - Saturday: 8:00 AM - 7:00 PM (GST)");
    setBranchMapUrl(branch.mapUrl || "");
    setBranchMapEmbedUrl(branch.mapEmbedUrl || "");
    setBranchIsHQ(!!branch.isHeadquarters);
    setBranchIsActive(branch.isActive !== false);
    setIsBranchModalOpen(true);
  };

  const handleSaveBranch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!branchName.trim() || !branchAddress.trim() || !branchPhone.trim() || !branchEmail.trim()) {
      if (onShowToast) onShowToast("Please fill in all required branch fields.");
      return;
    }

    const payload = {
      name: branchName.trim(),
      city: branchCity.trim(),
      address: branchAddress.trim(),
      phone: branchPhone.trim(),
      mobile: branchMobile.trim() || undefined,
      email: branchEmail.trim(),
      workingHours: branchWorkingHours.trim() || undefined,
      mapUrl: branchMapUrl.trim() || undefined,
      mapEmbedUrl: branchMapEmbedUrl.trim() || undefined,
      isHeadquarters: branchIsHQ,
      isActive: branchIsActive
    };

    if (editingBranch) {
      updateBranch(editingBranch.id, payload);
      if (onShowToast) onShowToast(`Updated branch "${branchName}"`);
    } else {
      addBranch(payload);
      if (onShowToast) onShowToast(`Added new branch "${branchName}"`);
    }

    setIsBranchModalOpen(false);
    refreshData();
  };

  const handleDeleteBranch = (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete branch "${name}"?`)) {
      deleteBranch(id);
      if (onShowToast) onShowToast(`Deleted branch "${name}"`);
      refreshData();
    }
  };

  const handleMoveBranch = (id: string, direction: "up" | "down") => {
    const updated = moveBranch(id, direction);
    setBranches(updated);
  };

  const handleToggleActiveBranch = (branch: CompanyBranch) => {
    const updated = { ...branch, isActive: !branch.isActive };
    updateBranch(branch.id, updated);
    refreshData();
    if (onShowToast) onShowToast(`${branch.name} is now ${updated.isActive ? "active" : "hidden"}`);
  };

  const handleResetDefaultBranches = () => {
    if (window.confirm("Reset branches back to default 4 UAE regional locations?")) {
      const reset = resetDefaultBranches();
      setBranches(reset);
      if (onShowToast) onShowToast("Reset branch network to defaults.");
    }
  };

  /* ───────────────────────────────────────────────────────────
      BRAND PARTNER HANDLERS
  ─────────────────────────────────────────────────────────── */

  const handleOpenAddBrand = () => {
    setEditingPartner(null);
    setBrandName("");
    setBrandDisplayType("image");
    setBrandLogo("");
    setBrandTagline("");
    setBrandWebsiteUrl("");
    setBrandIsActive(true);
    setBrandScale(1);
    setBrandPosition("50% 50%");
    setBrandObjectFit("contain");
    setBrandPadding(4);
    setIsBrandModalOpen(true);
  };

  const handleOpenEditBrand = (partner: BrandPartner) => {
    setEditingPartner(partner);
    setBrandName(partner.name);
    setBrandDisplayType(partner.displayType || (partner.logo ? "image" : "text"));
    setBrandLogo(partner.logo || "");
    setBrandTagline(partner.tagline || "");
    setBrandWebsiteUrl(partner.websiteUrl || "");
    setBrandIsActive(partner.isActive !== false);
    setBrandScale(partner.scale !== undefined ? partner.scale : 1);
    setBrandPosition(partner.imagePosition || "50% 50%");
    setBrandObjectFit(partner.objectFit || "contain");
    setBrandPadding(partner.padding !== undefined ? partner.padding : 4);
    setIsBrandModalOpen(true);
  };

  const handleBrandImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please upload a valid image file (PNG, JPG, SVG, WebP)");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      setBrandLogo(result);
      setBrandDisplayType("image");
    };
    reader.readAsDataURL(file);

    // Upload directly to Cloudflare R2
    uploadProductImage(file, "brands").then((res) => {
      if (res && res.url) {
        setBrandLogo(res.url);
        setBrandDisplayType("image");
      }
    }).catch((err) => {
      console.warn("Brand logo upload fallback to preview:", err);
    });
  };

  const handleSaveBrand = (e: React.FormEvent) => {
    e.preventDefault();
    if (!brandName.trim()) {
      alert("Please enter a Brand / Partner Name.");
      return;
    }

    if (editingPartner) {
      const updated: BrandPartner = {
        ...editingPartner,
        name: brandName.trim(),
        displayType: brandDisplayType,
        logo: brandDisplayType === "image" ? brandLogo : undefined,
        tagline: brandTagline.trim() || undefined,
        websiteUrl: brandWebsiteUrl.trim() || undefined,
        isActive: brandIsActive,
        scale: brandDisplayType === "image" ? brandScale : undefined,
        imagePosition: brandDisplayType === "image" ? brandPosition : undefined,
        objectFit: brandDisplayType === "image" ? brandObjectFit : undefined,
        padding: brandDisplayType === "image" ? brandPadding : undefined
      };
      updateBrandPartner(updated);
      if (onShowToast) onShowToast(`Updated partner "${brandName}"`);
    } else {
      addBrandPartner({
        name: brandName.trim(),
        displayType: brandDisplayType,
        logo: brandDisplayType === "image" ? brandLogo : undefined,
        tagline: brandTagline.trim() || undefined,
        websiteUrl: brandWebsiteUrl.trim() || undefined,
        order: partners.length + 1,
        isActive: brandIsActive,
        scale: brandDisplayType === "image" ? brandScale : undefined,
        imagePosition: brandDisplayType === "image" ? brandPosition : undefined,
        objectFit: brandDisplayType === "image" ? brandObjectFit : undefined,
        padding: brandDisplayType === "image" ? brandPadding : undefined
      });
      if (onShowToast) onShowToast(`Added new brand partner "${brandName}"`);
    }

    setIsBrandModalOpen(false);
    refreshData();
  };

  const handleDeleteBrand = (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to remove "${name}" from Trusted Partners?`)) {
      deleteBrandPartner(id);
      if (onShowToast) onShowToast(`Deleted partner "${name}"`);
      refreshData();
    }
  };

  const handleMoveBrand = (id: string, direction: "up" | "down") => {
    const updated = moveBrandPartner(id, direction);
    setPartners(updated);
  };

  const handleToggleActiveBrand = (partner: BrandPartner) => {
    const updated = { ...partner, isActive: !partner.isActive };
    updateBrandPartner(updated);
    refreshData();
    if (onShowToast) onShowToast(`${partner.name} is now ${updated.isActive ? "active" : "hidden"}`);
  };

  const handleResetDefaultBrands = () => {
    if (window.confirm("Reset brand partners back to default 8 HVAC brands?")) {
      const reset = resetDefaultBrandPartners();
      setPartners(reset);
      if (onShowToast) onShowToast("Reset brand partners to default list.");
    }
  };

  /* ───────────────────────────────────────────────────────────
      ACHIEVEMENTS TIMELINE HANDLERS
  ─────────────────────────────────────────────────────────── */

  const handleOpenAddAchievement = () => {
    setEditingAchievement(null);
    setAchYear(new Date().getFullYear().toString());
    setAchTitle("");
    setAchSubtitle("");
    setAchDescription("");
    setAchDealershipsText("");
    setAchColor("rgb(2, 132, 199)");
    setAchIconName("Trophy");
    setAchPosition(achievements.length % 2 === 0 ? "up" : "down");
    setAchIsActive(true);
    setAchImage("");
    setAchImageOpacity(globalAchievementBgOpacity || 0.3);
    setIsAchievementModalOpen(true);
  };

  const handleOpenEditAchievement = (milestone: AchievementMilestone) => {
    setEditingAchievement(milestone);
    setAchYear(milestone.year);
    setAchTitle(milestone.title);
    setAchSubtitle(milestone.subtitle || "");
    setAchDescription(milestone.description);
    setAchDealershipsText((milestone.dealerships || []).join(", "));
    setAchColor(milestone.color || "rgb(2, 132, 199)");
    setAchIconName(milestone.iconName || "Award");
    setAchPosition(milestone.position || "up");
    setAchIsActive(milestone.isActive !== false);
    setAchImage(milestone.image || "");
    setAchImageOpacity(milestone.imageOpacity !== undefined ? milestone.imageOpacity : (globalAchievementBgOpacity || 0.3));
    setIsAchievementModalOpen(true);
  };

  const handleAchievementImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please upload a valid image file (PNG, JPG, WebP)");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      setAchImage(result);
    };
    reader.readAsDataURL(file);

    // Upload directly to Cloudflare R2
    uploadProductImage(file, "achievements").then((res) => {
      if (res && res.url) {
        setAchImage(res.url);
      }
    }).catch((err) => {
      console.warn("Milestone image upload fallback to preview:", err);
    });
  };

  const handleSaveAchievement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!achYear.trim() || !achTitle.trim()) {
      alert("Please provide Milestone Year and Title.");
      return;
    }

    const dealerships = achDealershipsText
      .split(",")
      .map((d) => d.trim())
      .filter(Boolean);

    if (editingAchievement) {
      const updated: AchievementMilestone = {
        ...editingAchievement,
        year: achYear.trim(),
        title: achTitle.trim(),
        subtitle: achSubtitle.trim() || undefined,
        description: achDescription.trim(),
        dealerships: dealerships.length > 0 ? dealerships : undefined,
        color: achColor,
        borderColor: `${achColor}66`,
        lightBg: `${achColor}0D`,
        iconName: achIconName,
        position: achPosition,
        isActive: achIsActive,
        image: achImage.trim() || undefined,
        imageOpacity: achImage.trim() ? achImageOpacity : undefined
      };
      updateAchievement(updated);
      if (onShowToast) onShowToast(`Updated milestone "${achYear} - ${achTitle}"`);
    } else {
      addAchievement({
        year: achYear.trim(),
        title: achTitle.trim(),
        subtitle: achSubtitle.trim() || undefined,
        description: achDescription.trim(),
        dealerships: dealerships.length > 0 ? dealerships : undefined,
        color: achColor,
        borderColor: `${achColor}66`,
        lightBg: `${achColor}0D`,
        iconName: achIconName,
        position: achPosition,
        order: achievements.length + 1,
        isActive: achIsActive,
        image: achImage.trim() || undefined,
        imageOpacity: achImage.trim() ? achImageOpacity : undefined
      });
      if (onShowToast) onShowToast(`Added milestone "${achYear} - ${achTitle}"`);
    }

    setIsAchievementModalOpen(false);
    refreshData();
  };

  const handleDeleteAchievement = (id: string, year: string, title: string) => {
    if (window.confirm(`Are you sure you want to delete milestone "${year} - ${title}"?`)) {
      deleteAchievement(id);
      if (onShowToast) onShowToast(`Deleted milestone "${year}"`);
      refreshData();
    }
  };

  const handleMoveAchievement = (id: string, direction: "up" | "down") => {
    const updated = moveAchievement(id, direction);
    setAchievements(updated);
  };

  const handleToggleActiveAchievement = (milestone: AchievementMilestone) => {
    const updated = { ...milestone, isActive: !milestone.isActive };
    updateAchievement(updated);
    refreshData();
    if (onShowToast) onShowToast(`${milestone.year} milestone is now ${updated.isActive ? "active" : "hidden"}`);
  };

  const handleResetDefaultAchievements = () => {
    if (window.confirm("Reset achievements back to default 10 company milestones (2012-2025)?")) {
      const reset = resetDefaultAchievements();
      setAchievements(reset);
      if (onShowToast) onShowToast("Reset achievements timeline to defaults.");
    }
  };

  const activeBrandsCount = partners.filter((p) => p.isActive !== false).length;
  const activeAchievementsCount = achievements.filter((a) => a.isActive !== false).length;

  const SUBMODULES = [
    { id: "brands" as const, label: "Trusted Partners", icon: <Building size={15} />, count: partners.length },
    { id: "achievements" as const, label: "Achievements", icon: <Trophy size={15} />, count: achievements.length },
    { id: "contacts" as const, label: "Company & Branches", icon: <Phone size={15} />, count: branches.length },
  ];

  return (
    <div className="w-full flex flex-col space-y-4">
      {/* Visual Save Confirmation Alert */}
      {savedSuccessMsg && (
        <div className="bg-emerald-50 border border-emerald-300 text-emerald-800 px-4 py-3 rounded-xl flex items-center justify-between shadow-xs animate-in slide-in-from-top-2 duration-200">
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0">
              <Check size={14} />
            </div>
            <span className="text-xs font-bold">{savedSuccessMsg}</span>
          </div>
          <button
            type="button"
            onClick={() => setSavedSuccessMsg(null)}
            className="p-1 hover:bg-emerald-100 rounded-lg text-emerald-600 transition-colors"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* Main Container */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
        {/* Top Control Bar */}
        <div className="px-5 py-3.5 border-b border-slate-200 flex items-center justify-between gap-4 bg-slate-50/50">
          <div>
            <h2 className="text-sm font-bold text-slate-900">
              {SUBMODULES.find((s) => s.id === activeTab)?.label}
            </h2>
            <p className="text-[11px] text-slate-500">
              {activeTab === "brands" && "Configure trusted brand partner ticker, order, logos, and display formatting."}
              {activeTab === "achievements" && "Manage company milestones, timeline years, dealership badges, and achievements."}
              {activeTab === "contacts" && "Manage corporate headquarters details, regional branch locations, and contact FAQs."}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {onNavigateToContactCenter && (
              <button
                type="button"
                onClick={onNavigateToContactCenter}
                className="px-3 py-1.5 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 font-medium text-xs rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
                title="Go to Contact & Communications Center"
              >
                <Headphones size={13} />
                <span className="hidden sm:inline">Contact &amp; Comms Center</span>
              </button>
            )}

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
        <div className="flex flex-col lg:flex-row min-h-[560px]">
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
                const isActive = activeTab === sub.id;
                return (
                  <button
                    key={sub.id}
                    type="button"
                    onClick={() => setActiveTab(sub.id)}
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
                    {!isNavCollapsed && (
                      <div className="flex items-center justify-between w-full min-w-0">
                        <span className="truncate">{sub.label}</span>
                        <span
                          className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold ${
                            isActive
                              ? "bg-white/20 text-white"
                              : "bg-slate-200/70 text-slate-600"
                          }`}
                        >
                          {sub.count}
                        </span>
                      </div>
                    )}
                  </button>
                );
              })}
            </nav>
          </aside>

          {/* Right Content Area */}
          <main className="flex-1 p-5 bg-white overflow-y-auto space-y-5">

      {/* ───────────────────────────────────────────────────────────
          TAB 1: TRUSTED BY PARTNERS
      ─────────────────────────────────────────────────────────── */}
      {activeTab === "brands" && (
        <div className="bg-white border border-slate-200 rounded-xl shadow-2xs overflow-hidden">
          
          {/* Section Action Bar */}
          <div className="px-5 py-3 border-b border-slate-200 bg-slate-50/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-bold text-sm text-slate-900">Partner Brands Order & Display</h3>
              <p className="text-[11px] text-slate-500">
                {activeBrandsCount} of {partners.length} brands active on the homepage ticker. Use arrows to adjust order.
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={handleResetDefaultBrands}
                className="px-3 py-1.5 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 font-semibold text-xs rounded-lg transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
                title="Restore default 8 HVAC brands"
              >
                <RotateCcw size={12} />
                <span>Reset Defaults</span>
              </button>

              <button
                type="button"
                onClick={handleOpenAddBrand}
                className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs rounded-lg shadow-2xs flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <Plus size={13} />
                <span>Add Partner</span>
              </button>

              <button
                type="button"
                onClick={() => handleSaveAll("Brand partner order & settings saved!")}
                className={`px-4 py-1.5 font-black text-xs rounded-lg shadow-sm flex items-center gap-1.5 transition-all cursor-pointer ${
                  isSavedRecently
                    ? "bg-emerald-600 text-white"
                    : "bg-[#2596be] hover:bg-[#1c7e9f] text-white"
                }`}
              >
                {isSavedRecently ? <Check size={13} className="stroke-[3]" /> : <Save size={13} />}
                <span>{isSavedRecently ? "Saved!" : "Save Changes"}</span>
              </button>
            </div>
          </div>

          {/* Ticker Scroll Speed Control Bar */}
          <div className="px-5 py-2.5 bg-blue-50/40 border-b border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <Zap size={14} className="text-[#0f4c81]" />
              <span className="font-bold text-slate-800">Ticker Speed:</span>
              <span className="font-mono font-extrabold text-[#0f4c81] bg-white px-2 py-0.5 rounded border border-blue-200 shadow-2xs">
                {tickerSpeed}s / loop {tickerSpeed <= 15 ? "(Fast)" : tickerSpeed <= 30 ? "(Standard)" : "(Slow & Smooth)"}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 bg-white p-0.5 rounded-lg border border-slate-200 text-[11px] font-bold">
                <button
                  type="button"
                  onClick={() => setTickerSpeed(15)}
                  className={`px-2 py-1 rounded transition-all cursor-pointer ${
                    tickerSpeed === 15 ? "bg-[#0f4c81] text-white" : "text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  Fast (15s)
                </button>
                <button
                  type="button"
                  onClick={() => setTickerSpeed(25)}
                  className={`px-2 py-1 rounded transition-all cursor-pointer ${
                    tickerSpeed === 25 ? "bg-[#0f4c81] text-white" : "text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  Standard (25s)
                </button>
                <button
                  type="button"
                  onClick={() => setTickerSpeed(40)}
                  className={`px-2 py-1 rounded transition-all cursor-pointer ${
                    tickerSpeed === 40 ? "bg-[#0f4c81] text-white" : "text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  Slow (40s)
                </button>
              </div>

              <input
                type="range"
                min="10"
                max="60"
                step="5"
                value={tickerSpeed}
                onChange={(e) => setTickerSpeed(parseInt(e.target.value, 10))}
                className="w-24 sm:w-32 accent-[#0f4c81] cursor-pointer"
                title="Adjust custom duration in seconds (10s - 60s)"
              />
            </div>
          </div>

          {/* Compact arranged list */}
          <div className="divide-y divide-slate-100">
            {partners.map((partner, index) => {
              const isImage = partner.displayType === "image" || Boolean(partner.logo);
              const isFirst = index === 0;
              const isLast = index === partners.length - 1;
              const scaleVal = partner.scale !== undefined ? partner.scale : 1;

              return (
                <div 
                  key={partner.id}
                  className={`px-4 py-2.5 flex items-center justify-between gap-3 transition-colors ${
                    partner.isActive !== false ? "hover:bg-slate-50/70" : "bg-slate-50/50 opacity-55"
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="flex items-center gap-0.5">
                      <button
                        type="button"
                        disabled={isFirst}
                        onClick={() => handleMoveBrand(partner.id, "up")}
                        className="p-1 hover:bg-slate-200 disabled:opacity-20 disabled:hover:bg-transparent rounded text-slate-500 transition-colors cursor-pointer"
                        title="Move Up"
                      >
                        <ArrowUp size={12} />
                      </button>
                      <button
                        type="button"
                        disabled={isLast}
                        onClick={() => handleMoveBrand(partner.id, "down")}
                        className="p-1 hover:bg-slate-200 disabled:opacity-20 disabled:hover:bg-transparent rounded text-slate-500 transition-colors cursor-pointer"
                        title="Move Down"
                      >
                        <ArrowDown size={12} />
                      </button>
                    </div>

                    <span className="w-5 text-center font-mono text-[11px] font-bold text-slate-400">
                      #{index + 1}
                    </span>

                    <div className="w-16 h-8 rounded-lg bg-[#0a3154] border border-slate-700 flex items-center justify-center p-1 shrink-0 overflow-hidden shadow-2xs">
                      {isImage && partner.logo ? (
                        <img 
                          src={partner.logo} 
                          alt={partner.name} 
                          style={{
                            transform: `scale(${scaleVal})`,
                            objectPosition: partner.imagePosition || "50% 50%",
                            objectFit: partner.objectFit || "contain",
                            padding: partner.padding !== undefined ? `${partner.padding}px` : "2px"
                          }}
                          className="max-h-full max-w-full filter brightness-100"
                        />
                      ) : (
                        <span className="text-[9px] font-black tracking-wider text-white truncate text-center">
                          {partner.name}
                        </span>
                      )}
                    </div>

                    <div className="min-w-0 truncate">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-xs text-slate-900 truncate">{partner.name}</span>
                        <span className={`text-[9px] font-semibold px-1.5 py-0.2 rounded border ${
                          isImage 
                            ? "bg-blue-50 text-[#0f4c81] border-blue-200" 
                            : "bg-slate-100 text-slate-600 border-slate-200"
                        }`}>
                          {isImage ? `Image (${Math.round(scaleVal * 100)}%)` : "Text"}
                        </span>
                      </div>
                      {partner.tagline && (
                        <span className="text-[10px] text-slate-400 font-medium block truncate">{partner.tagline}</span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleToggleActiveBrand(partner)}
                      className={`px-2 py-1 rounded-lg text-[11px] font-bold border transition-all flex items-center gap-1 cursor-pointer ${
                        partner.isActive !== false
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                          : "bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-200"
                      }`}
                      title={partner.isActive !== false ? "Visible on ticker" : "Hidden from ticker"}
                    >
                      {partner.isActive !== false ? <Eye size={11} /> : <EyeOff size={11} />}
                      <span>{partner.isActive !== false ? "Active" : "Hidden"}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleOpenEditBrand(partner)}
                      className="p-1.5 hover:bg-slate-100 border border-slate-200 rounded-lg text-slate-600 transition-colors cursor-pointer"
                      title="Edit Partner & Logo Adjustments"
                    >
                      <Edit3 size={13} />
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDeleteBrand(partner.id, partner.name)}
                      className="p-1.5 hover:bg-red-50 border border-slate-200 hover:border-red-200 rounded-lg text-red-600 transition-colors cursor-pointer"
                      title="Delete Partner"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      )}

      {/* ───────────────────────────────────────────────────────────
          TAB 2: ACHIEVEMENTS TIMELINE (WITH BACKGROUND IMAGE & OPACITY)
      ─────────────────────────────────────────────────────────── */}
      {activeTab === "achievements" && (
        <div className="bg-white border border-slate-200 rounded-xl shadow-2xs overflow-hidden">
          
          {/* Section Action Bar */}
          <div className="px-5 py-3 border-b border-slate-200 bg-slate-50/70 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
            <div>
              <h3 className="font-bold text-sm text-slate-900">Achievements & Growth Timeline</h3>
              <p className="text-[11px] text-slate-500">
                {activeAchievementsCount} of {achievements.length} milestones active on the flowing growth curve.
              </p>
            </div>

            {/* Controls Right Side: Opacity Slider + Add Button + Save Button */}
            <div className="flex flex-wrap items-center gap-2 shrink-0">
              
              {/* Global Image Opacity Adjustment Bar */}
              <div className="flex items-center gap-2 bg-white px-2.5 py-1 rounded-lg border border-slate-200 shadow-2xs text-xs">
                <Layers size={13} className="text-[#0f4c81]" />
                <span className="font-bold text-slate-700 text-[11px]">Bg Opacity:</span>
                <input
                  type="range"
                  min="0.05"
                  max="1.0"
                  step="0.05"
                  value={globalAchievementBgOpacity}
                  onChange={(e) => setGlobalAchievementBgOpacity(parseFloat(e.target.value))}
                  className="w-16 sm:w-20 accent-[#0f4c81] cursor-pointer"
                  title="Adjust default background image opacity (5% to 100%)"
                />
                <span className="font-mono font-extrabold text-[#0f4c81] text-[11px] w-7">
                  {Math.round(globalAchievementBgOpacity * 100)}%
                </span>
              </div>

              <button
                type="button"
                onClick={handleResetDefaultAchievements}
                className="px-3 py-1.5 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 font-semibold text-xs rounded-lg transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
                title="Restore default 10 company milestones"
              >
                <RotateCcw size={12} />
                <span>Reset</span>
              </button>

              <button
                type="button"
                onClick={handleOpenAddAchievement}
                className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs rounded-lg shadow-2xs flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <Plus size={13} />
                <span>Add Milestone</span>
              </button>

              <button
                type="button"
                onClick={() => handleSaveAll("Achievements timeline and opacity saved successfully!")}
                className={`px-4 py-1.5 font-black text-xs rounded-lg shadow-sm flex items-center gap-1.5 transition-all cursor-pointer ${
                  isSavedRecently
                    ? "bg-emerald-600 text-white"
                    : "bg-[#2596be] hover:bg-[#1c7e9f] text-white"
                }`}
              >
                {isSavedRecently ? <Check size={13} className="stroke-[3]" /> : <Save size={13} />}
                <span>{isSavedRecently ? "Saved!" : "Save Changes"}</span>
              </button>
            </div>
          </div>

          {/* Compact arranged list of Milestones */}
          <div className="divide-y divide-slate-100">
            {achievements.map((milestone, index) => {
              const isFirst = index === 0;
              const isLast = index === achievements.length - 1;
              const opacity = milestone.imageOpacity !== undefined ? milestone.imageOpacity : globalAchievementBgOpacity;

              return (
                <div 
                  key={milestone.id}
                  className={`px-4 py-3 flex items-center justify-between gap-3 transition-colors ${
                    milestone.isActive !== false ? "hover:bg-slate-50/70" : "bg-slate-50/50 opacity-55"
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex items-center gap-0.5">
                      <button
                        type="button"
                        disabled={isFirst}
                        onClick={() => handleMoveAchievement(milestone.id, "up")}
                        className="p-1 hover:bg-slate-200 disabled:opacity-20 disabled:hover:bg-transparent rounded text-slate-500 transition-colors cursor-pointer"
                        title="Move Earlier in Timeline"
                      >
                        <ArrowUp size={12} />
                      </button>
                      <button
                        type="button"
                        disabled={isLast}
                        onClick={() => handleMoveAchievement(milestone.id, "down")}
                        className="p-1 hover:bg-slate-200 disabled:opacity-20 disabled:hover:bg-transparent rounded text-slate-500 transition-colors cursor-pointer"
                        title="Move Later in Timeline"
                      >
                        <ArrowDown size={12} />
                      </button>
                    </div>

                    <span className="w-5 text-center font-mono text-[11px] font-bold text-slate-400">
                      #{index + 1}
                    </span>

                    {/* Year badge with color indicator */}
                    <div 
                      className="px-2.5 py-1 rounded-lg font-mono font-black text-xs text-white shadow-2xs shrink-0 flex items-center gap-1.5"
                      style={{ backgroundColor: milestone.color }}
                    >
                      <Trophy size={11} />
                      <span>{milestone.year}</span>
                    </div>

                    {/* Optional Image thumbnail indicator */}
                    {milestone.image && (
                      <div className="w-10 h-8 rounded-md bg-slate-100 border border-slate-200 overflow-hidden shrink-0 relative group">
                        <img 
                          src={milestone.image} 
                          alt="Thumbnail" 
                          className="w-full h-full object-cover" 
                          style={{ opacity: Math.max(0.4, opacity) }}
                        />
                        <span className="absolute bottom-0 right-0 bg-slate-900/80 text-[8px] font-mono text-white px-0.5 rounded-tl">
                          {Math.round(opacity * 100)}%
                        </span>
                      </div>
                    )}

                    {/* Milestone details */}
                    <div className="min-w-0 truncate">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-xs text-slate-900 truncate">{milestone.title}</span>
                        {milestone.subtitle && (
                          <span className="text-[10px] text-blue-700 font-semibold truncate bg-blue-50 px-1.5 py-0.2 rounded border border-blue-200">
                            {milestone.subtitle}
                          </span>
                        )}
                        <span className="text-[9px] font-mono font-bold text-slate-400 bg-slate-100 px-1 rounded">
                          {milestone.position === "up" ? "↑ Top" : "↓ Bottom"}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 truncate mt-0.5">
                        {milestone.description}
                      </p>
                      {milestone.dealerships && milestone.dealerships.length > 0 && (
                        <div className="flex items-center gap-1 mt-1">
                          <Tag size={10} className="text-slate-400 shrink-0" />
                          <span className="text-[10px] text-slate-500 font-medium truncate">
                            {milestone.dealerships.join(" · ")}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleToggleActiveAchievement(milestone)}
                      className={`px-2 py-1 rounded-lg text-[11px] font-bold border transition-all flex items-center gap-1 cursor-pointer ${
                        milestone.isActive !== false
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                          : "bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-200"
                      }`}
                      title={milestone.isActive !== false ? "Visible on timeline" : "Hidden from timeline"}
                    >
                      {milestone.isActive !== false ? <Eye size={11} /> : <EyeOff size={11} />}
                      <span>{milestone.isActive !== false ? "Active" : "Hidden"}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleOpenEditAchievement(milestone)}
                      className="p-1.5 hover:bg-slate-100 border border-slate-200 rounded-lg text-slate-600 transition-colors cursor-pointer"
                      title="Edit Milestone & Background Image"
                    >
                      <Edit3 size={13} />
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDeleteAchievement(milestone.id, milestone.year, milestone.title)}
                      className="p-1.5 hover:bg-red-50 border border-slate-200 hover:border-red-200 rounded-lg text-red-600 transition-colors cursor-pointer"
                      title="Delete Milestone"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      )}

      {/* ───────────────────────────────────────────────────────────
          TAB 3: COMPANY & CONTACT DETAILS + DYNAMIC REGIONAL BRANCHES + FAQS
      ─────────────────────────────────────────────────────────── */}
      {activeTab === "contacts" && (
        <div className="space-y-5 max-w-5xl">
          
          {/* Card 1: Main Organization Coordinates (Collapsible) */}
          <div className="bg-white border border-slate-200 rounded-xl shadow-2xs overflow-hidden transition-all">
            <div 
              onClick={() => setIsHQExpanded(!isHQExpanded)}
              className="p-5 md:p-6 pb-4 flex flex-wrap items-center justify-between gap-3 cursor-pointer hover:bg-slate-50/70 transition-colors select-none"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-[#0f4c81] flex items-center justify-center shrink-0 border border-blue-100">
                  <Building size={17} />
                </div>
                <div>
                  <h3 className="font-black text-sm text-slate-900 flex items-center gap-2">
                    <span>Headquarters & Central Coordinates</span>
                  </h3>
                  <p className="text-[11px] text-slate-500">Primary corporate contact channels displayed in Website Header, Footer, and RFQs.</p>
                </div>
              </div>

              <div className="flex items-center gap-2.5" onClick={(e) => e.stopPropagation()}>
                <button
                  type="button"
                  onClick={() => handleSaveAll("Central contact details saved successfully!")}
                  className={`px-4 py-2 text-white font-bold text-xs rounded-lg shadow-2xs flex items-center gap-1.5 transition-all cursor-pointer ${
                    isSavedRecently
                      ? "bg-emerald-600 hover:bg-emerald-700 ring-2 ring-emerald-400"
                      : "bg-[#0f4c81] hover:bg-[#1c7e9f]"
                  }`}
                >
                  {isSavedRecently ? (
                    <>
                      <Check size={14} className="animate-bounce" />
                      <span>Saved Successfully!</span>
                    </>
                  ) : (
                    <>
                      <Save size={13} />
                      <span>Save Coordinates</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setIsHQExpanded(!isHQExpanded)}
                  className="p-2 hover:bg-slate-200 rounded-lg text-slate-500 hover:text-slate-900 transition-all cursor-pointer"
                  title={isHQExpanded ? "Collapse Section" : "Expand Section"}
                >
                  <ChevronDown size={17} className={`transition-transform duration-200 ${isHQExpanded ? "rotate-180" : ""}`} />
                </button>
              </div>
            </div>

            {isHQExpanded && (
              <div className="p-5 md:p-6 pt-0 space-y-4 border-t border-slate-100 animate-in fade-in duration-150">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-4">
                  <div>
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">Company Trade Name</label>
                    <input
                      type="text"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 focus:border-[#0f4c81] focus:bg-white rounded-lg px-3 py-2 text-xs text-slate-900 font-medium outline-none transition-all"
                      placeholder="Cool Technologies LLC"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">Tagline / Motto</label>
                    <input
                      type="text"
                      value={tagline}
                      onChange={(e) => setTagline(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 focus:border-[#0f4c81] focus:bg-white rounded-lg px-3 py-2 text-xs text-slate-900 font-medium outline-none transition-all"
                      placeholder="The Experts in Commercial Cooling"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">Central Inquiries Email</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 focus:border-[#0f4c81] focus:bg-white rounded-lg px-3 py-2 text-xs text-slate-900 font-medium outline-none transition-all"
                      placeholder="info@cooltechuae.com"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">Central Procurement Hotline</label>
                    <input
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 focus:border-[#0f4c81] focus:bg-white rounded-lg px-3 py-2 text-xs text-slate-900 font-medium outline-none transition-all"
                      placeholder="+971 2 565 0123"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">WhatsApp Business</label>
                    <input
                      type="text"
                      value={whatsapp}
                      onChange={(e) => setWhatsapp(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 focus:border-[#0f4c81] focus:bg-white rounded-lg px-3 py-2 text-xs text-slate-900 font-medium outline-none transition-all"
                      placeholder="+971 50 123 4567"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">Working / Operations Schedule</label>
                    <input
                      type="text"
                      value={workingHours}
                      onChange={(e) => setWorkingHours(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 focus:border-[#0f4c81] focus:bg-white rounded-lg px-3 py-2 text-xs text-slate-900 font-medium outline-none transition-all"
                      placeholder="Monday - Saturday: 8:00 AM - 7:00 PM (GST)"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">Headquarters Facility Address</label>
                  <textarea
                    rows={2}
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-[#0f4c81] focus:bg-white rounded-lg px-3 py-2 text-xs text-slate-900 font-medium outline-none transition-all resize-none"
                    placeholder="Plot-99, Sector M-42 / M-14, Mussafah Industrial Area, Abu Dhabi, UAE"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Card 2: Dynamic Regional Branches Management (Collapsible) */}
          <div className="bg-white border border-slate-200 rounded-xl shadow-2xs overflow-hidden transition-all">
            <div 
              onClick={() => setIsBranchesExpanded(!isBranchesExpanded)}
              className="p-5 md:p-6 pb-4 flex flex-wrap items-center justify-between gap-3 cursor-pointer hover:bg-slate-50/70 transition-colors select-none"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-[#0f4c81] flex items-center justify-center shrink-0 border border-blue-100">
                  <MapPin size={17} />
                </div>
                <div>
                  <h3 className="font-black text-sm text-slate-900 flex items-center gap-2">
                    <span>Regional Branch Directory</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200 font-bold">
                      {branches.length}
                    </span>
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Manage physical UAE branches, contact numbers, emails, addresses, and live interactive map locations.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                <button
                  type="button"
                  onClick={handleResetDefaultBranches}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-lg transition-colors cursor-pointer flex items-center gap-1.5"
                  title="Reset to 4 UAE standard branch locations"
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

                <button
                  type="button"
                  onClick={() => setIsBranchesExpanded(!isBranchesExpanded)}
                  className="p-2 hover:bg-slate-200 rounded-lg text-slate-500 hover:text-slate-900 transition-all cursor-pointer"
                  title={isBranchesExpanded ? "Collapse Section" : "Expand Section"}
                >
                  <ChevronDown size={17} className={`transition-transform duration-200 ${isBranchesExpanded ? "rotate-180" : ""}`} />
                </button>
              </div>
            </div>

            {isBranchesExpanded && (
              <div className="p-5 md:p-6 pt-0 border-t border-slate-100 animate-in fade-in duration-150">
                <div className="space-y-3 pt-4">
                  {branches.length === 0 ? (
                    <div className="p-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-300">
                      <p className="text-xs font-bold text-slate-600">No regional branches configured.</p>
                      <p className="text-[11px] text-slate-400 mt-1">The public Contact page will automatically display the full Main Facility live map.</p>
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
                        {/* Left info */}
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

                        {/* Actions right */}
                        <div className="flex items-center gap-1.5 self-end md:self-center shrink-0">
                          <button
                            type="button"
                            onClick={() => handleMoveBranch(branch.id, "up")}
                            disabled={idx === 0}
                            className="p-1.5 hover:bg-slate-100 disabled:opacity-30 border border-slate-200 rounded-lg text-slate-600 transition-colors cursor-pointer"
                            title="Move Up"
                          >
                            <ArrowUp size={13} />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleMoveBranch(branch.id, "down")}
                            disabled={idx === branches.length - 1}
                            className="p-1.5 hover:bg-slate-100 disabled:opacity-30 border border-slate-200 rounded-lg text-slate-600 transition-colors cursor-pointer"
                            title="Move Down"
                          >
                            <ArrowDown size={13} />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleToggleActiveBranch(branch)}
                            className={`p-1.5 border rounded-lg transition-colors cursor-pointer ${
                              branch.isActive !== false
                                ? "bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100"
                                : "bg-slate-100 border-slate-200 text-slate-400 hover:bg-slate-200"
                            }`}
                            title={branch.isActive !== false ? "Active (Click to hide)" : "Hidden (Click to activate)"}
                          >
                            {branch.isActive !== false ? <Eye size={13} /> : <EyeOff size={13} />}
                          </button>

                          <button
                            type="button"
                            onClick={() => handleOpenEditBranch(branch)}
                            className="p-1.5 hover:bg-slate-100 border border-slate-200 rounded-lg text-slate-600 transition-colors cursor-pointer"
                            title="Edit Branch"
                          >
                            <Edit3 size={13} />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDeleteBranch(branch.id, branch.name)}
                            className="p-1.5 hover:bg-red-50 border border-slate-200 hover:border-red-200 rounded-lg text-red-600 transition-colors cursor-pointer"
                            title="Delete Branch"
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
          </div>

          {/* Card 3: Dynamic Contact Page FAQs & SEO Schema (Collapsible) */}
          <div className="bg-white border border-slate-200 rounded-xl shadow-2xs overflow-hidden transition-all">
            <div 
              onClick={() => setIsFaqsExpanded(!isFaqsExpanded)}
              className="p-5 md:p-6 pb-4 flex flex-wrap items-center justify-between gap-3 cursor-pointer hover:bg-slate-50/70 transition-colors select-none"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-[#0f4c81] flex items-center justify-center shrink-0 border border-blue-100">
                  <MessageSquare size={17} />
                </div>
                <div>
                  <h3 className="font-black text-sm text-slate-900 flex items-center gap-2">
                    <span>Contact Page FAQs & Structured SEO Schema</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200 font-bold">
                      {faqs.length}
                    </span>
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Manage questions and answers rendered on the Contact page and indexed in Google FAQ Schema.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                <button
                  type="button"
                  onClick={handleResetDefaultContactFaqs}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-lg transition-colors cursor-pointer flex items-center gap-1.5"
                  title="Reset to standard corporate FAQs"
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

                <button
                  type="button"
                  onClick={() => setIsFaqsExpanded(!isFaqsExpanded)}
                  className="p-2 hover:bg-slate-200 rounded-lg text-slate-500 hover:text-slate-900 transition-all cursor-pointer"
                  title={isFaqsExpanded ? "Collapse Section" : "Expand Section"}
                >
                  <ChevronDown size={17} className={`transition-transform duration-200 ${isFaqsExpanded ? "rotate-180" : ""}`} />
                </button>
              </div>
            </div>

            {isFaqsExpanded && (
              <div className="p-5 md:p-6 pt-0 border-t border-slate-100 animate-in fade-in duration-150">
                <div className="space-y-3 pt-4">
                  {faqs.length === 0 ? (
                    <div className="p-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-300">
                      <p className="text-xs font-bold text-slate-600">No FAQs configured for the Contact page.</p>
                      <button
                        type="button"
                        onClick={handleResetDefaultContactFaqs}
                        className="mt-3 px-3 py-1.5 bg-[#0f4c81] text-white font-bold text-xs rounded-lg inline-flex items-center gap-1.5"
                      >
                        <RotateCcw size={12} />
                        <span>Load Default Corporate FAQs</span>
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

                        {/* Actions */}
                        <div className="flex items-center gap-1.5 self-end md:self-center shrink-0">
                          <button
                            type="button"
                            onClick={() => handleMoveFaq(faq.id, "up")}
                            disabled={idx === 0}
                            className="p-1.5 hover:bg-slate-100 disabled:opacity-30 border border-slate-200 rounded-lg text-slate-600 transition-colors cursor-pointer"
                            title="Move Up"
                          >
                            <ArrowUp size={13} />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleMoveFaq(faq.id, "down")}
                            disabled={idx === faqs.length - 1}
                            className="p-1.5 hover:bg-slate-100 disabled:opacity-30 border border-slate-200 rounded-lg text-slate-600 transition-colors cursor-pointer"
                            title="Move Down"
                          >
                            <ArrowDown size={13} />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleToggleActiveFaq(faq)}
                            className={`p-1.5 border rounded-lg transition-colors cursor-pointer ${
                              faq.isActive !== false
                                ? "bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100"
                                : "bg-slate-100 border-slate-200 text-slate-400 hover:bg-slate-200"
                            }`}
                            title={faq.isActive !== false ? "Active (Click to hide)" : "Hidden (Click to activate)"}
                          >
                            {faq.isActive !== false ? <Eye size={13} /> : <EyeOff size={13} />}
                          </button>

                          <button
                            type="button"
                            onClick={() => handleOpenEditFaq(faq)}
                            className="p-1.5 hover:bg-slate-100 border border-slate-200 rounded-lg text-slate-600 transition-colors cursor-pointer"
                            title="Edit FAQ"
                          >
                            <Edit3 size={13} />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDeleteFaq(faq.id, faq.question)}
                            className="p-1.5 hover:bg-red-50 border border-slate-200 hover:border-red-200 rounded-lg text-red-600 transition-colors cursor-pointer"
                            title="Delete FAQ"
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
          </div>

        </div>
      )}





          </main>
        </div>
      </div>

      {/* ───────────────────────────────────────────────────────────
          MODAL: ADD / EDIT BRAND PARTNER
      ─────────────────────────────────────────────────────────── */}
      {isBrandModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-150 max-h-[90vh] flex flex-col">
            
            <div className="px-5 py-3.5 border-b border-slate-200 flex items-center justify-between bg-slate-50/80 shrink-0">
              <div className="flex items-center gap-2">
                <Building size={16} className="text-[#0f4c81]" />
                <h3 className="font-black text-sm text-slate-900">
                  {editingPartner ? "Edit Partner Brand" : "Add Partner Brand"}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsBrandModalOpen(false)}
                className="p-1 hover:bg-slate-200 rounded-md text-slate-400 hover:text-slate-700 transition-colors"
              >
                <X size={15} />
              </button>
            </div>

            <form onSubmit={handleSaveBrand} className="p-5 space-y-4 overflow-y-auto">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Brand Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={brandName}
                  onChange={(e) => setBrandName(e.target.value)}
                  placeholder="e.g. Daikin, Trane, Panasonic, Gree..."
                  className="w-full bg-slate-50 border border-slate-200 focus:border-[#2596be] focus:bg-white rounded-lg px-3 py-2 text-xs text-slate-900 font-semibold outline-none transition-all"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Format</label>
                <div className="grid grid-cols-2 gap-1 bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs font-bold">
                  <button
                    type="button"
                    onClick={() => setBrandDisplayType("image")}
                    className={`py-1.5 px-2 rounded-md transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                      brandDisplayType === "image" ? "bg-white text-[#0f4c81] shadow-2xs" : "text-slate-600"
                    }`}
                  >
                    <ImageIcon size={13} />
                    <span>Image Logo</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setBrandDisplayType("text")}
                    className={`py-1.5 px-2 rounded-md transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                      brandDisplayType === "text" ? "bg-white text-[#0f4c81] shadow-2xs" : "text-slate-600"
                    }`}
                  >
                    <Type size={13} />
                    <span>Stylized Text</span>
                  </button>
                </div>
              </div>

              {brandDisplayType === "image" && (
                <div className="space-y-3 p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[11px] font-bold text-slate-700">Live Ticker Preview</span>
                      <span className="text-[10px] text-slate-400 font-mono">Zoom: {Math.round(brandScale * 100)}%</span>
                    </div>
                    <div className="h-20 bg-[#0a3154] rounded-xl border border-slate-700 flex items-center justify-center p-2 relative overflow-hidden shadow-inner">
                      {brandLogo ? (
                        <img 
                          src={brandLogo} 
                          alt="Logo Preview" 
                          style={{
                            transform: `scale(${brandScale})`,
                            objectPosition: brandPosition,
                            objectFit: brandObjectFit,
                            padding: `${brandPadding}px`
                          }}
                          className="max-h-full max-w-full transition-all duration-150"
                        />
                      ) : (
                        <div className="text-center text-slate-400 text-xs">
                          <ImageIcon size={18} className="mx-auto mb-1 opacity-50" />
                          <span>No logo image selected</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <input
                      type="file"
                      ref={brandFileInputRef}
                      onChange={handleBrandImageUpload}
                      accept="image/*"
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => brandFileInputRef.current?.click()}
                      className="flex-1 py-1.5 px-3 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg text-xs font-bold text-slate-700 flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                    >
                      <Upload size={12} />
                      <span>Upload Local File</span>
                    </button>
                  </div>

                  <div className="relative">
                    <LinkIcon size={12} className="absolute left-2.5 top-2.5 text-slate-400" />
                    <input
                      type="url"
                      value={brandLogo}
                      onChange={(e) => setBrandLogo(e.target.value)}
                      placeholder="Or paste direct image URL"
                      className="w-full bg-white border border-slate-200 focus:border-[#2596be] rounded-lg pl-7 pr-2.5 py-1.5 text-xs text-slate-900 outline-none"
                    />
                  </div>

                  <div className="pt-2 border-t border-slate-200 space-y-3">
                    <div>
                      <div className="flex items-center justify-between text-[11px] font-bold text-slate-700 mb-1">
                        <span className="flex items-center gap-1">
                          <ZoomIn size={12} />
                          <span>Zoom / Scale</span>
                        </span>
                        <span className="font-mono text-slate-500">{Math.round(brandScale * 100)}%</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setBrandScale((prev) => Math.max(0.4, Number((prev - 0.1).toFixed(2))))}
                          className="p-1 hover:bg-slate-200 rounded text-slate-600 text-xs font-bold"
                          title="Zoom Out"
                        >
                          <ZoomOut size={13} />
                        </button>
                        <input
                          type="range"
                          min="0.4"
                          max="2.2"
                          step="0.05"
                          value={brandScale}
                          onChange={(e) => setBrandScale(parseFloat(e.target.value))}
                          className="flex-1 accent-[#0f4c81] cursor-pointer"
                        />
                        <button
                          type="button"
                          onClick={() => setBrandScale((prev) => Math.min(2.2, Number((prev + 0.1).toFixed(2))))}
                          className="p-1 hover:bg-slate-200 rounded text-slate-600 text-xs font-bold"
                          title="Zoom In"
                        >
                          <ZoomIn size={13} />
                        </button>
                        <button
                          type="button"
                          onClick={() => setBrandScale(1)}
                          className="text-[10px] font-bold text-slate-500 hover:text-slate-800 underline px-1"
                          title="Reset to 100%"
                        >
                          100%
                        </button>
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between text-[11px] font-bold text-slate-700 mb-1">
                        <span className="flex items-center gap-1">
                          <Move size={12} />
                          <span>Position Alignment</span>
                        </span>
                        <span className="font-mono text-slate-500 text-[10px]">{brandPosition}</span>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-1 bg-white p-1.5 rounded-lg border border-slate-200 max-w-[200px] mx-auto">
                        {[
                          { label: "Top Left", pos: "left top" },
                          { label: "Top Center", pos: "center top" },
                          { label: "Top Right", pos: "right top" },
                          { label: "Center Left", pos: "left center" },
                          { label: "Center", pos: "50% 50%" },
                          { label: "Center Right", pos: "right center" },
                          { label: "Bottom Left", pos: "left bottom" },
                          { label: "Bottom Center", pos: "center bottom" },
                          { label: "Bottom Right", pos: "right bottom" }
                        ].map((btn) => (
                          <button
                            key={btn.pos}
                            type="button"
                            onClick={() => setBrandPosition(btn.pos)}
                            className={`py-1 text-[10px] font-bold rounded transition-all cursor-pointer ${
                              brandPosition === btn.pos
                                ? "bg-[#0f4c81] text-white shadow-2xs"
                                : "bg-slate-100 hover:bg-slate-200 text-slate-700"
                            }`}
                            title={btn.label}
                          >
                            {btn.label.split(" ").map(w => w[0]).join("")}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <div>
                        <label className="text-[11px] font-bold text-slate-700 block mb-1">Fit Mode</label>
                        <select
                          value={brandObjectFit}
                          onChange={(e) => setBrandObjectFit(e.target.value as any)}
                          className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1.5 text-xs text-slate-800 font-semibold outline-none"
                        >
                          <option value="contain">Contain (Best)</option>
                          <option value="cover">Cover (Fill)</option>
                          <option value="scale-down">Scale Down</option>
                        </select>
                      </div>

                      <div>
                        <div className="flex items-center justify-between text-[11px] font-bold text-slate-700 mb-1">
                          <span>Padding</span>
                          <span className="font-mono text-slate-500">{brandPadding}px</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="16"
                          step="1"
                          value={brandPadding}
                          onChange={(e) => setBrandPadding(parseInt(e.target.value, 10))}
                          className="w-full accent-[#0f4c81] cursor-pointer mt-1"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {brandDisplayType === "text" && (
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Tagline / Subtext (Optional)</label>
                  <input
                    type="text"
                    value={brandTagline}
                    onChange={(e) => setBrandTagline(e.target.value)}
                    placeholder="e.g. Heavy Industries, Climate Solutions"
                    className="w-full bg-slate-50 border border-slate-200 focus:border-[#2596be] focus:bg-white rounded-lg px-3 py-2 text-xs text-slate-900 outline-none"
                  />
                </div>
              )}

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Brand Website URL (Optional)</label>
                <div className="relative">
                  <Globe size={13} className="absolute left-2.5 top-2.5 text-slate-400" />
                  <input
                    type="url"
                    value={brandWebsiteUrl}
                    onChange={(e) => setBrandWebsiteUrl(e.target.value)}
                    placeholder="https://www.brand.com"
                    className="w-full bg-slate-50 border border-slate-200 focus:border-[#2596be] focus:bg-white rounded-lg pl-7 pr-3 py-2 text-xs text-slate-900 font-medium outline-none transition-all"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between py-1 border-t border-slate-100">
                <span className="text-xs font-bold text-slate-800">Show on homepage ticker</span>
                <input
                  type="checkbox"
                  checked={brandIsActive}
                  onChange={(e) => setBrandIsActive(e.target.checked)}
                  className="rounded text-[#2596be] w-4 h-4 cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsBrandModalOpen(false)}
                  className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-lg transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#0f4c81] hover:bg-[#1c7e9f] text-white font-extrabold text-xs rounded-lg shadow-2xs transition-all cursor-pointer"
                >
                  {editingPartner ? "Save Changes" : "Add Partner"}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────
          MODAL: ADD / EDIT ACHIEVEMENT MILESTONE (WITH IMAGE & OPACITY)
      ─────────────────────────────────────────────────────────── */}
      {isAchievementModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-150 max-h-[92vh] flex flex-col">
            
            {/* Modal Header */}
            <div className="px-5 py-3.5 border-b border-slate-200 flex items-center justify-between bg-slate-50/80 shrink-0">
              <div className="flex items-center gap-2">
                <Trophy size={16} className="text-[#0f4c81]" />
                <h3 className="font-black text-sm text-slate-900">
                  {editingAchievement ? `Edit Milestone (${achYear})` : "Add Timeline Milestone"}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsAchievementModalOpen(false)}
                className="p-1 hover:bg-slate-200 rounded-md text-slate-400 hover:text-slate-700 transition-colors"
              >
                <X size={15} />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSaveAchievement} className="p-5 space-y-3.5 overflow-y-auto">
              
              <div className="grid grid-cols-3 gap-3">
                {/* Year */}
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Year <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={achYear}
                    onChange={(e) => setAchYear(e.target.value)}
                    placeholder="e.g. 2026"
                    className="w-full bg-slate-50 border border-slate-200 focus:border-[#2596be] focus:bg-white rounded-lg px-3 py-2 text-xs text-slate-900 font-mono font-bold outline-none"
                    required
                  />
                </div>

                {/* Node Position */}
                <div className="col-span-2">
                  <label className="text-xs font-bold text-slate-700 block mb-1">Graph Node Position</label>
                  <div className="grid grid-cols-2 gap-1 bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs font-bold">
                    <button
                      type="button"
                      onClick={() => setAchPosition("up")}
                      className={`py-1.5 px-2 rounded-md transition-all flex items-center justify-center gap-1 cursor-pointer ${
                        achPosition === "up" ? "bg-white text-[#0f4c81] shadow-2xs" : "text-slate-600"
                      }`}
                    >
                      <span>↑ Top Curve</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setAchPosition("down")}
                      className={`py-1.5 px-2 rounded-md transition-all flex items-center justify-center gap-1 cursor-pointer ${
                        achPosition === "down" ? "bg-white text-[#0f4c81] shadow-2xs" : "text-slate-600"
                      }`}
                    >
                      <span>↓ Bottom Curve</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Title */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Milestone Headline / Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={achTitle}
                  onChange={(e) => setAchTitle(e.target.value)}
                  placeholder="e.g. Regional Logistics & Automation Hub"
                  className="w-full bg-slate-50 border border-slate-200 focus:border-[#2596be] focus:bg-white rounded-lg px-3 py-2 text-xs text-slate-900 font-bold outline-none"
                  required
                />
              </div>

              {/* Subtitle */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Subtitle / Category</label>
                <input
                  type="text"
                  value={achSubtitle}
                  onChange={(e) => setAchSubtitle(e.target.value)}
                  placeholder="e.g. Net-30 Sourcing & Expansion Hub"
                  className="w-full bg-slate-50 border border-slate-200 focus:border-[#2596be] focus:bg-white rounded-lg px-3 py-2 text-xs text-slate-900 outline-none"
                />
              </div>

              {/* Description */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Detailed Achievement Description</label>
                <textarea
                  rows={2}
                  value={achDescription}
                  onChange={(e) => setAchDescription(e.target.value)}
                  placeholder="Summarize the growth milestone, infrastructure additions, or certifications gained..."
                  className="w-full bg-slate-50 border border-slate-200 focus:border-[#2596be] focus:bg-white rounded-lg p-2.5 text-xs text-slate-900 font-medium outline-none resize-none leading-relaxed"
                />
              </div>

              {/* ───────────────────────────────────────────────────────────
                  BACKGROUND SHOWCASE IMAGE & OPACITY CONTROLS
              ─────────────────────────────────────────────────────────── */}
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <ImageIcon size={14} className="text-[#0f4c81]" />
                    <span className="text-xs font-bold text-slate-800">Showcase Background Image</span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-500">
                    Opacity: {Math.round(achImageOpacity * 100)}%
                  </span>
                </div>

                {/* Live Card Preview with Opacity */}
                <div className="relative h-24 rounded-lg border border-slate-300 overflow-hidden bg-slate-100 flex items-center justify-center">
                  {achImage ? (
                    <>
                      <img 
                        src={achImage} 
                        alt="Milestone Background Preview" 
                        style={{ opacity: achImageOpacity }}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-linear-to-r from-white via-white/80 to-transparent p-3 flex flex-col justify-center">
                        <span className="text-[11px] font-black text-slate-900">{achTitle || "Milestone Title Preview"}</span>
                        <span className="text-[9px] font-bold text-[#0f4c81]">{achYear} · {achSubtitle || "Category Preview"}</span>
                      </div>
                    </>
                  ) : (
                    <div className="text-center text-slate-400 text-xs">
                      <ImageIcon size={18} className="mx-auto mb-1 opacity-50" />
                      <span>No background image uploaded</span>
                    </div>
                  )}
                </div>

                {/* Upload or URL */}
                <div className="flex gap-2">
                  <input
                    type="file"
                    ref={achievementFileInputRef}
                    onChange={handleAchievementImageUpload}
                    accept="image/*"
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => achievementFileInputRef.current?.click()}
                    className="flex-1 py-1.5 px-3 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg text-xs font-bold text-slate-700 flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                  >
                    <Upload size={12} />
                    <span>Upload Image File</span>
                  </button>
                  {achImage && (
                    <button
                      type="button"
                      onClick={() => setAchImage("")}
                      className="px-2.5 py-1.5 bg-red-50 hover:bg-red-100 border border-red-200 text-red-600 rounded-lg text-xs font-bold cursor-pointer"
                      title="Remove image"
                    >
                      <Trash2 size={12} />
                    </button>
                  )}
                </div>

                <div className="relative">
                  <LinkIcon size={12} className="absolute left-2.5 top-2.5 text-slate-400" />
                  <input
                    type="url"
                    value={achImage}
                    onChange={(e) => setAchImage(e.target.value)}
                    placeholder="Or paste direct image URL (e.g. facility photo, award certificate)"
                    className="w-full bg-white border border-slate-200 focus:border-[#2596be] rounded-lg pl-7 pr-2.5 py-1.5 text-xs text-slate-900 outline-none"
                  />
                </div>

                {/* Opacity Slider */}
                <div>
                  <div className="flex items-center justify-between text-[11px] font-bold text-slate-700 mb-1">
                    <span className="flex items-center gap-1">
                      <Layers size={12} />
                      <span>Background Image Opacity</span>
                    </span>
                    <span className="font-mono text-slate-500">{Math.round(achImageOpacity * 100)}%</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="range"
                      min="0.05"
                      max="1.0"
                      step="0.05"
                      value={achImageOpacity}
                      onChange={(e) => setAchImageOpacity(parseFloat(e.target.value))}
                      className="flex-1 accent-[#0f4c81] cursor-pointer"
                    />
                    <button
                      type="button"
                      onClick={() => setAchImageOpacity(0.3)}
                      className="text-[10px] font-bold text-slate-500 hover:text-slate-800 underline"
                      title="Reset to 30%"
                    >
                      30% (Default)
                    </button>
                  </div>
                </div>
              </div>

              {/* Authorized Dealerships */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Authorized OEM Dealerships / Brands (Comma-separated)
                </label>
                <input
                  type="text"
                  value={achDealershipsText}
                  onChange={(e) => setAchDealershipsText(e.target.value)}
                  placeholder="e.g. Daikin, Midea, York, Carrier"
                  className="w-full bg-slate-50 border border-slate-200 focus:border-[#2596be] focus:bg-white rounded-lg px-3 py-2 text-xs text-slate-900 outline-none"
                />
              </div>

              {/* Color Theme Selector */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">Color Accent Theme</label>
                <div className="flex flex-wrap gap-1.5">
                  {COLOR_PRESETS.map((preset) => (
                    <button
                      key={preset.color}
                      type="button"
                      onClick={() => setAchColor(preset.color)}
                      className={`w-6 h-6 rounded-full border-2 transition-all cursor-pointer ${
                        achColor === preset.color ? "scale-125 border-slate-900 shadow-sm" : "border-white hover:scale-110"
                      }`}
                      style={{ backgroundColor: preset.color }}
                      title={preset.name}
                    />
                  ))}
                </div>
              </div>

              {/* Icon Selector */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">Milestone Icon</label>
                <div className="grid grid-cols-5 gap-1.5">
                  {ICON_OPTIONS.map((opt) => {
                    const IconCmp = opt.icon;
                    const isSelected = achIconName === opt.name;
                    return (
                      <button
                        key={opt.name}
                        type="button"
                        onClick={() => setAchIconName(opt.name)}
                        className={`p-2 rounded-lg border text-xs font-bold flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                          isSelected 
                            ? "bg-slate-800 text-white border-slate-800 shadow-2xs" 
                            : "bg-slate-50 hover:bg-slate-100 text-slate-600 border-slate-200"
                        }`}
                        title={opt.label}
                      >
                        <IconCmp size={15} />
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Active Toggle */}
              <div className="flex items-center justify-between py-1 border-t border-slate-100">
                <span className="text-xs font-bold text-slate-800">Show on homepage interactive timeline</span>
                <input
                  type="checkbox"
                  checked={achIsActive}
                  onChange={(e) => setAchIsActive(e.target.checked)}
                  className="rounded text-[#2596be] w-4 h-4 cursor-pointer"
                />
              </div>

              {/* Modal Buttons */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsAchievementModalOpen(false)}
                  className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-lg transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#0f4c81] hover:bg-[#1c7e9f] text-white font-extrabold text-xs rounded-lg shadow-2xs transition-all cursor-pointer"
                >
                  {editingAchievement ? "Save Changes" : "Add Milestone"}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────
          MODAL: ADD / EDIT REGIONAL BRANCH
      ─────────────────────────────────────────────────────────── */}
      {isBranchModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-150 max-h-[92vh] flex flex-col">
            
            {/* Modal Header */}
            <div className="px-5 py-3.5 border-b border-slate-200 flex items-center justify-between bg-slate-50/80 shrink-0">
              <div className="flex items-center gap-2">
                <Building size={16} className="text-[#0f4c81]" />
                <h3 className="font-black text-sm text-slate-900">
                  {editingBranch ? `Edit Branch (${branchName})` : "Add New Regional Branch"}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsBranchModalOpen(false)}
                className="p-1 hover:bg-slate-200 rounded-md text-slate-400 hover:text-slate-700 transition-colors"
              >
                <X size={15} />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSaveBranch} className="p-5 space-y-3.5 overflow-y-auto">
              
              {/* Branch Name & City */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Branch Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={branchName}
                    onChange={(e) => setBranchName(e.target.value)}
                    placeholder="e.g. Dubai Commercial & Logistics Hub"
                    className="w-full bg-slate-50 border border-slate-200 focus:border-[#0f4c81] focus:bg-white rounded-lg px-3 py-2 text-xs text-slate-900 font-semibold outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    City / Emirate <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={branchCity}
                    onChange={(e) => setBranchCity(e.target.value)}
                    placeholder="e.g. Dubai, Abu Dhabi"
                    className="w-full bg-slate-50 border border-slate-200 focus:border-[#0f4c81] focus:bg-white rounded-lg px-3 py-2 text-xs text-slate-900 font-semibold outline-none"
                    required
                  />
                </div>
              </div>

              {/* Full Address */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Physical Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={branchAddress}
                  onChange={(e) => setBranchAddress(e.target.value)}
                  placeholder="e.g. Street 18B, Warehouse #4, Al Quoz Industrial Area 3, Dubai, UAE"
                  className="w-full bg-slate-50 border border-slate-200 focus:border-[#0f4c81] focus:bg-white rounded-lg px-3 py-2 text-xs text-slate-900 outline-none"
                  required
                />
              </div>

              {/* Telephone & Mobile */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Telephone (Direct Line) <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Phone size={13} className="absolute left-2.5 top-2.5 text-slate-400" />
                    <input
                      type="text"
                      value={branchPhone}
                      onChange={(e) => setBranchPhone(e.target.value)}
                      placeholder="+971 4 345 6789"
                      className="w-full bg-slate-50 border border-slate-200 focus:border-[#0f4c81] focus:bg-white rounded-lg pl-7 pr-3 py-2 text-xs font-mono font-bold text-slate-900 outline-none"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Mobile / WhatsApp (Optional)
                  </label>
                  <input
                    type="text"
                    value={branchMobile}
                    onChange={(e) => setBranchMobile(e.target.value)}
                    placeholder="+971 55 987 6543"
                    className="w-full bg-slate-50 border border-slate-200 focus:border-[#0f4c81] focus:bg-white rounded-lg px-3 py-2 text-xs font-mono text-slate-900 outline-none"
                  />
                </div>
              </div>

              {/* Email & Working Hours */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Mail size={13} className="absolute left-2.5 top-2.5 text-slate-400" />
                    <input
                      type="email"
                      value={branchEmail}
                      onChange={(e) => setBranchEmail(e.target.value)}
                      placeholder="dubai@cooltechuae.com"
                      className="w-full bg-slate-50 border border-slate-200 focus:border-[#0f4c81] focus:bg-white rounded-lg pl-7 pr-3 py-2 text-xs text-slate-900 outline-none"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Working Hours
                  </label>
                  <input
                    type="text"
                    value={branchWorkingHours}
                    onChange={(e) => setBranchWorkingHours(e.target.value)}
                    placeholder="Mon - Sat: 8:30 AM - 6:30 PM (GST)"
                    className="w-full bg-slate-50 border border-slate-200 focus:border-[#0f4c81] focus:bg-white rounded-lg px-3 py-2 text-xs text-slate-900 outline-none"
                  />
                </div>
              </div>

              {/* Google Maps URL & Embed Map */}
              <div className="space-y-2">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Google Maps Link (for "Get Directions" button)
                  </label>
                  <div className="relative">
                    <Globe size={13} className="absolute left-2.5 top-2.5 text-slate-400" />
                    <input
                      type="url"
                      value={branchMapUrl}
                      onChange={(e) => setBranchMapUrl(e.target.value)}
                      placeholder="https://maps.google.com/?q=Al+Quoz+Industrial+Area+3"
                      className="w-full bg-slate-50 border border-slate-200 focus:border-[#0f4c81] focus:bg-white rounded-lg pl-7 pr-3 py-2 text-xs text-slate-900 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Live Embed Map URL (Optional iframe src)
                  </label>
                  <input
                    type="url"
                    value={branchMapEmbedUrl}
                    onChange={(e) => setBranchMapEmbedUrl(e.target.value)}
                    placeholder="https://maps.google.com/maps?q=...&output=embed (or leaves blank to auto-generate)"
                    className="w-full bg-slate-50 border border-slate-200 focus:border-[#0f4c81] focus:bg-white rounded-lg px-3 py-2 text-xs text-slate-900 outline-none"
                  />
                  <span className="text-[10px] text-slate-400 block mt-0.5">
                    If left blank, the live map automatically embeds from the branch's address.
                  </span>
                </div>
              </div>

              {/* Toggles */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-slate-800 block">Is Primary Headquarters</span>
                    <span className="text-[10px] text-slate-500">Highlights this branch as the primary corporate facility</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={branchIsHQ}
                    onChange={(e) => setBranchIsHQ(e.target.checked)}
                    className="rounded text-[#0f4c81] w-4 h-4 cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-slate-800 block">Show on Contact Page Directory</span>
                    <span className="text-[10px] text-slate-500">Display this branch in the public branches grid and contact form</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={branchIsActive}
                    onChange={(e) => setBranchIsActive(e.target.checked)}
                    className="rounded text-[#0f4c81] w-4 h-4 cursor-pointer"
                  />
                </div>
              </div>

              {/* Modal Buttons */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsBranchModalOpen(false)}
                  className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-lg transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#0f4c81] hover:bg-[#1c7e9f] text-white font-extrabold text-xs rounded-lg shadow-2xs transition-all cursor-pointer"
                >
                  {editingBranch ? "Save Changes" : "Add Branch"}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────
          MODAL: ADD / EDIT CONTACT FAQ
      ─────────────────────────────────────────────────────────── */}
      {isFaqModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-150 max-h-[90vh] flex flex-col">
            
            <div className="px-5 py-3.5 border-b border-slate-200 flex items-center justify-between bg-slate-50/80 shrink-0">
              <div className="flex items-center gap-2">
                <MessageSquare size={16} className="text-[#0f4c81]" />
                <h3 className="font-black text-sm text-slate-900">
                  {editingFaq ? "Edit Contact FAQ" : "Add Contact FAQ"}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsFaqModalOpen(false)}
                className="p-1 hover:bg-slate-200 rounded-md text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
              >
                <X size={15} />
              </button>
            </div>

            <form onSubmit={handleSaveFaq} className="p-5 space-y-4 overflow-y-auto">
              
              {/* Question */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Question <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={faqQuestion}
                  onChange={(e) => setFaqQuestion(e.target.value)}
                  placeholder="e.g. What are your official working hours?"
                  className="w-full bg-slate-50 border border-slate-200 focus:border-[#0f4c81] focus:bg-white rounded-lg px-3 py-2 text-xs text-slate-900 font-semibold outline-none"
                  required
                />
              </div>

              {/* Category */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Category Tag (Optional)
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={faqCategory}
                    onChange={(e) => setFaqCategory(e.target.value)}
                    placeholder="e.g. General, Quotations, Logistics, Facility, Warranty"
                    className="flex-1 bg-slate-50 border border-slate-200 focus:border-[#0f4c81] focus:bg-white rounded-lg px-3 py-2 text-xs text-slate-900 outline-none"
                  />
                  <div className="flex items-center gap-1">
                    {["General", "Quotations", "Logistics", "Warranty"].map((cat) => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setFaqCategory(cat)}
                        className={`text-[10px] font-bold px-2 py-1.5 rounded-lg border transition-colors cursor-pointer ${
                          faqCategory === cat 
                            ? "bg-[#0f4c81] text-white border-[#0f4c81]" 
                            : "bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200"
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Answer */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Detailed Answer <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={4}
                  value={faqAnswer}
                  onChange={(e) => setFaqAnswer(e.target.value)}
                  placeholder="Provide a clear, accurate, and professional response that directly answers the customer's inquiry..."
                  className="w-full bg-slate-50 border border-slate-200 focus:border-[#0f4c81] focus:bg-white rounded-lg px-3 py-2 text-xs text-slate-900 leading-relaxed outline-none"
                  required
                />
              </div>

              {/* Active Toggle */}
              <div className="flex items-center justify-between py-2 border-t border-slate-100">
                <div>
                  <span className="text-xs font-bold text-slate-800 block">Show on Contact Page FAQ section</span>
                  <span className="text-[10px] text-slate-500">Also included in Google Search FAQ structured data</span>
                </div>
                <input
                  type="checkbox"
                  checked={faqIsActive}
                  onChange={(e) => setFaqIsActive(e.target.checked)}
                  className="rounded text-[#0f4c81] w-4 h-4 cursor-pointer"
                />
              </div>

              {/* Modal Buttons */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsFaqModalOpen(false)}
                  className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-lg transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#0f4c81] hover:bg-[#1c7e9f] text-white font-extrabold text-xs rounded-lg shadow-2xs transition-all cursor-pointer"
                >
                  {editingFaq ? "Save Changes" : "Add FAQ"}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
}
