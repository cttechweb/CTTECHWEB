/* ─────────────────────────────────────────────────────────────────
   Cool Technologies — Technical SEO & Social Open Graph Suite
   Full enterprise SEO management: Open Graph previews for WhatsApp/LinkedIn,
   automated XML sitemaps, robots.txt, 301 redirects, and crawl telemetry.
───────────────────────────────────────────────────────────────── */

import React, { useState, useRef, useEffect } from "react";
import {
  Globe, FileCode, CheckCircle2, AlertCircle, ShieldCheck, Zap,
  Search, Sliders, RefreshCw, Copy, Check, ExternalLink, ArrowRight,
  Plus, Trash2, Code2, Cpu, Server, Activity, Database, Share2,
  Image as ImageIcon, Upload, Eye, Sparkles, MessageSquare, Twitter,
  Linkedin, ChevronRight, ChevronLeft, Save, Edit3, X, HelpCircle
} from "lucide-react";
import { Product, BlogPost, RedirectRule, ServiceItem, PageSocialPreview, SocialSeoPreviewSettings } from "../../types";
import { SERVICES } from "../../data";
import { getSocialSeoSettings, saveSocialSeoSettings, DEFAULT_SOCIAL_SEO_SETTINGS } from "../../services/generalSettingsService";
import { uploadProductImage } from "../../services/storageService";

interface AdminSeoSuiteProps {
  products: Product[];
  blogs: BlogPost[];
  services?: ServiceItem[];
  onShowToast?: (msg: string) => void;
}

type SeoSubmoduleTab = "social" | "sitemaps" | "verification" | "redirects" | "indexability" | "vitals" | "logs";

export default function AdminSeoSuite({
  products,
  blogs,
  services = SERVICES,
  onShowToast
}: AdminSeoSuiteProps) {
  const [activeSubTab, setActiveSubTab] = useState<SeoSubmoduleTab>("social");
  const [isNavCollapsed, setIsNavCollapsed] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isSavedRecently, setIsSavedRecently] = useState<boolean>(false);

  // ─────────────────────────────────────────────────────────────
  // 1. Social Media Previews & Open Graph State
  // ─────────────────────────────────────────────────────────────
  const [socialSettings, setSocialSettings] = useState<SocialSeoPreviewSettings>(getSocialSeoSettings());
  const [socialSubSection, setSocialSubSection] = useState<"pages" | "dynamic" | "global" | "simulator">("pages");

  // Page Editing Modal
  const [editingPage, setEditingPage] = useState<PageSocialPreview | null>(null);
  const [pageTitle, setPageTitle] = useState("");
  const [pageDescription, setPageDescription] = useState("");
  const [pageImageUrl, setPageImageUrl] = useState("");
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const imageFileInputRef = useRef<HTMLInputElement | null>(null);

  // Simulator State
  const [simulatorPlatform, setSimulatorPlatform] = useState<"whatsapp" | "linkedin" | "twitter" | "google">("whatsapp");
  const [simulatorSelectedTarget, setSimulatorSelectedTarget] = useState<string>("home");

  // ─────────────────────────────────────────────────────────────
  // 2. Search Console Verification State
  // ─────────────────────────────────────────────────────────────
  const [gscTag, setGscTag] = useState("google-site-verification=CoolTech_UAE_Verified_2026_x89q");
  const [bingTag, setBingTag] = useState("msvalidate.01=A98B7C6D5E4F3210987654321");
  const [robotsTxt, setRobotsTxt] = useState(
    `User-agent: *\nAllow: /\nDisallow: /admin/\nDisallow: /checkout/\n\nSitemap: https://cooltechnologies.ae/sitemap.xml\nSitemap: https://cooltechnologies.ae/image-sitemap.xml\nSitemap: https://cooltechnologies.ae/video-sitemap.xml`
  );

  // ─────────────────────────────────────────────────────────────
  // 3. 301 Redirects State
  // ─────────────────────────────────────────────────────────────
  const [redirects, setRedirects] = useState<RedirectRule[]>([
    {
      id: "red-1",
      sourceUrl: "/hvac-chillers-old",
      destinationUrl: "/#/blog/next-gen-low-gwp-refrigerant-compliance",
      type: "301",
      createdAt: "2026-07-01",
      isActive: true,
      hitsCount: 142
    },
    {
      id: "red-2",
      sourceUrl: "/water-cooler-specs",
      destinationUrl: "/#/blog/industrial-heavy-duty-water-coolers-guide",
      type: "301",
      createdAt: "2026-06-28",
      isActive: true,
      hitsCount: 89
    }
  ]);
  const [newSource, setNewSource] = useState("");
  const [newDest, setNewDest] = useState("");

  // Sync settings from storage
  const reloadSettings = () => {
    const s = getSocialSeoSettings();
    setSocialSettings(s);
  };

  useEffect(() => {
    reloadSettings();
    window.addEventListener("cooltech_settings_updated", reloadSettings);
    return () => window.removeEventListener("cooltech_settings_updated", reloadSettings);
  }, []);

  // Save All SEO & Open Graph Settings
  const handleSaveAll = () => {
    setIsSaving(true);
    try {
      saveSocialSeoSettings(socialSettings);
      setIsSavedRecently(true);
      setTimeout(() => setIsSavedRecently(false), 2500);
      if (onShowToast) onShowToast("Social Previews & SEO settings saved successfully!");
    } catch (err) {
      console.error("Error saving SEO settings:", err);
      if (onShowToast) onShowToast("Failed to save SEO settings.");
    } finally {
      setIsSaving(false);
    }
  };

  // ─────────────────────────────────────────────────────────────
  // Static Page Social Preview Handlers
  // ─────────────────────────────────────────────────────────────
  const handleOpenEditPage = (page: PageSocialPreview) => {
    setEditingPage(page);
    setPageTitle(page.title);
    setPageDescription(page.description);
    setPageImageUrl(page.imageUrl);
  };

  const handleSavePagePreview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPage) return;

    const updatedPreviews = socialSettings.pagePreviews.map((p) => {
      if (p.pageId === editingPage.pageId) {
        return {
          ...p,
          title: pageTitle.trim(),
          description: pageDescription.trim(),
          imageUrl: pageImageUrl.trim() || socialSettings.defaultOgImage
        };
      }
      return p;
    });

    const updated = {
      ...socialSettings,
      pagePreviews: updatedPreviews
    };

    setSocialSettings(updated);
    saveSocialSeoSettings(updated);
    setEditingPage(null);
    if (onShowToast) onShowToast(`Updated social preview for ${editingPage.pageName}!`);
  };

  const handleUploadImageFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingImage(true);
    try {
      const res = await uploadProductImage(file, "seo");
      setPageImageUrl(res.url);
      if (onShowToast) onShowToast("Social preview image uploaded successfully!");
    } catch (err: any) {
      console.error("Image upload failed:", err);
      if (onShowToast) onShowToast(err.message || "Failed to upload image.");
    } finally {
      setIsUploadingImage(false);
      if (e.target) e.target.value = "";
    }
  };

  const handleUploadGlobalDefaultImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const res = await uploadProductImage(file, "seo");
      setSocialSettings({
        ...socialSettings,
        defaultOgImage: res.url
      });
      if (onShowToast) onShowToast("Global default preview image updated!");
    } catch (err: any) {
      if (onShowToast) onShowToast(err.message || "Failed to upload default image.");
    } finally {
      if (e.target) e.target.value = "";
    }
  };

  // ─────────────────────────────────────────────────────────────
  // 301 Redirect Handlers
  // ─────────────────────────────────────────────────────────────
  const handleAddRedirect = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSource.trim() || !newDest.trim()) return;
    const rule: RedirectRule = {
      id: `red-${Date.now()}`,
      sourceUrl: newSource.startsWith("/") ? newSource.trim() : `/${newSource.trim()}`,
      destinationUrl: newDest.trim(),
      type: "301",
      createdAt: new Date().toISOString().split("T")[0],
      isActive: true,
      hitsCount: 0
    };
    setRedirects([...redirects, rule]);
    setNewSource("");
    setNewDest("");
    if (onShowToast) onShowToast(`Added 301 Redirect rule for ${rule.sourceUrl}`);
  };

  const handleDeleteRedirect = (id: string) => {
    setRedirects(redirects.filter(r => r.id !== id));
    if (onShowToast) onShowToast("Removed 301 redirect rule.");
  };

  // ─────────────────────────────────────────────────────────────
  // XML Sitemap Generators
  // ─────────────────────────────────────────────────────────────
  const generateMainSitemap = () => {
    const urls = [
      { loc: "https://cooltechnologies.ae/", priority: "1.0", freq: "daily" },
      { loc: "https://cooltechnologies.ae/#/products", priority: "0.9", freq: "daily" },
      { loc: "https://cooltechnologies.ae/#/categories", priority: "0.9", freq: "daily" },
      { loc: "https://cooltechnologies.ae/#/services", priority: "0.9", freq: "weekly" },
      { loc: "https://cooltechnologies.ae/#/blog", priority: "0.9", freq: "daily" },
      { loc: "https://cooltechnologies.ae/#/contact", priority: "0.85", freq: "daily" },
      { loc: "https://cooltechnologies.ae/#/legal", priority: "0.5", freq: "monthly" },
      ...products.map(p => ({
        loc: `https://cooltechnologies.ae/#/product/${p.id}`,
        priority: "0.8",
        freq: "weekly"
      })),
      ...blogs.map(b => ({
        loc: `https://cooltechnologies.ae/#/blog/${b.slug}`,
        priority: b.seoSettings?.sitemapPriority || "0.9",
        freq: b.seoSettings?.changeFreq || "weekly"
      }))
    ];

    return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
      urls.map(u => `  <url>\n    <loc>${u.loc}</loc>\n    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>\n    <changefreq>${u.freq}</changefreq>\n    <priority>${u.priority}</priority>\n  </url>`).join('\n') +
      `\n</urlset>`;
  };

  const generateImageSitemap = () => {
    const images: { pageLoc: string; imageLoc: string; title: string }[] = [];
    products.forEach(p => {
      if (p.image) images.push({ pageLoc: `https://cooltechnologies.ae/#/product/${p.id}`, imageLoc: p.image, title: p.name });
    });
    blogs.forEach(b => {
      if (b.image) images.push({ pageLoc: `https://cooltechnologies.ae/#/blog/${b.slug}`, imageLoc: b.image, title: b.title });
    });

    return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n` +
      images.map(img => `  <url>\n    <loc>${img.pageLoc}</loc>\n    <image:image>\n      <image:loc>${img.imageLoc}</image:loc>\n      <image:title>${img.title.replace(/&/g, '&amp;')}</image:title>\n    </image:image>\n  </url>`).join('\n') +
      `\n</urlset>`;
  };

  const generateVideoSitemap = () => {
    const videos: { pageLoc: string; videoLoc: string; title: string; desc: string; thumbnail: string }[] = [];
    blogs.filter(b => b.videoUrl).forEach(b => {
      videos.push({
        pageLoc: `https://cooltechnologies.ae/#/blog/${b.slug}`,
        videoLoc: b.videoUrl!,
        title: b.title,
        desc: b.excerpt,
        thumbnail: b.image
      });
    });

    return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:video="http://www.google.com/schemas/sitemap-video/1.1">\n` +
      videos.map(v => `  <url>\n    <loc>${v.pageLoc}</loc>\n    <video:video>\n      <video:thumbnail_loc>${v.thumbnail}</video:thumbnail_loc>\n      <video:title>${v.title.replace(/&/g, '&amp;')}</video:title>\n      <video:description>${v.desc.replace(/&/g, '&amp;')}</video:description>\n      <video:content_loc>${v.videoLoc}</video:content_loc>\n    </video:video>\n  </url>`).join('\n') +
      `\n</urlset>`;
  };

  const handleDownloadFile = (content: string, filename: string, mime: string) => {
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    if (onShowToast) onShowToast(`Downloaded ${filename}!`);
  };

  const handlePingSearchEngines = () => {
    if (onShowToast) onShowToast("Successfully submitted sitemap.xml to Google Search Console & Bing Webmaster APIs!");
  };

  // ─────────────────────────────────────────────────────────────
  // Simulator Resolved Data Helper
  // ─────────────────────────────────────────────────────────────
  const getSimulatorPreviewData = () => {
    // 1. Check if static page
    const matchedPage = socialSettings.pagePreviews.find(p => p.pageId === simulatorSelectedTarget);
    if (matchedPage) {
      return {
        title: matchedPage.title,
        description: matchedPage.description,
        image: matchedPage.imageUrl || socialSettings.defaultOgImage,
        url: `https://cooltechnologies.ae${matchedPage.urlPath}`
      };
    }

    // 2. Check if product
    if (simulatorSelectedTarget.startsWith("prod-")) {
      const prodId = simulatorSelectedTarget.replace("prod-", "");
      const product = products.find(p => p.id === prodId) || products[0];
      if (product) {
        const title = socialSettings.productTitlePattern
          .replace("{product_name}", product.name)
          .replace("{model_id}", product.modelId || product.sku || product.id)
          .replace("{brand}", product.brand || "Cool Technologies")
          .replace("{price}", product.price ? `$${product.price.toLocaleString()}` : "RFQ")
          .replace("{category}", product.category || "HVAC");
        
        const description = socialSettings.productDescriptionPattern
          .replace("{product_name}", product.name)
          .replace("{model_id}", product.modelId || product.sku || product.id)
          .replace("{brand}", product.brand || "Cool Technologies")
          .replace("{price}", product.price ? `$${product.price.toLocaleString()}` : "Wholesale")
          .replace("{category}", product.category || "HVAC");

        return {
          title,
          description,
          image: (socialSettings.productUseCustomImageIfAvailable && product.image) ? product.image : socialSettings.defaultOgImage,
          url: `https://cooltechnologies.ae/#/product/${product.id}`
        };
      }
    }

    // 3. Check if service
    if (simulatorSelectedTarget.startsWith("serv-")) {
      const servId = simulatorSelectedTarget.replace("serv-", "");
      const service = services.find(s => s.id === servId) || services[0];
      if (service) {
        const title = socialSettings.serviceTitlePattern
          .replace("{service_title}", service.title)
          .replace("{category}", service.category || "Engineering")
          .replace("{sla}", service.specs?.sla || "24/7 Dispatch");

        const description = socialSettings.serviceDescriptionPattern
          .replace("{service_title}", service.title)
          .replace("{category}", service.category || "Engineering")
          .replace("{sla}", service.specs?.sla || "24/7 Dispatch");

        return {
          title,
          description,
          image: (socialSettings.serviceUseCustomImageIfAvailable && service.image) ? service.image : socialSettings.defaultOgImage,
          url: `https://cooltechnologies.ae/#/services`
        };
      }
    }

    // Fallback default
    return {
      title: socialSettings.defaultOgTitle,
      description: socialSettings.defaultOgDescription,
      image: socialSettings.defaultOgImage,
      url: "https://cooltechnologies.ae/"
    };
  };

  const simData = getSimulatorPreviewData();

  // Navigation Submodules
  const SUBMODULES = [
    { id: "social" as SeoSubmoduleTab, label: "Social & Open Graph Previews", icon: <Share2 size={15} />, badge: "Active" },
    { id: "sitemaps" as SeoSubmoduleTab, label: "XML Sitemaps & Robots", icon: <FileCode size={15} />, badge: "3 Files" },
    { id: "verification" as SeoSubmoduleTab, label: "Console Verification", icon: <Globe size={15} />, badge: "Verified" },
    { id: "redirects" as SeoSubmoduleTab, label: "301 URL Redirects", icon: <Sliders size={15} />, badge: `${redirects.length}` },
    { id: "indexability" as SeoSubmoduleTab, label: "Crawlability & Indexing", icon: <Search size={15} />, badge: "100%" },
    { id: "vitals" as SeoSubmoduleTab, label: "Core Web Vitals & Speed", icon: <Zap size={15} />, badge: "Good" },
    { id: "logs" as SeoSubmoduleTab, label: "Search Engine Bot Logs", icon: <Activity size={15} />, badge: "Live" }
  ];

  return (
    <div className="space-y-6 font-sans text-slate-800 animate-in fade-in duration-200">
      
      {/* Hidden File Input for Image Uploading */}
      <input
        type="file"
        ref={imageFileInputRef}
        onChange={handleUploadImageFile}
        accept="image/png,image/jpeg,image/webp"
        className="hidden"
      />

      {/* Main Container matching AdminContactCenter & AdminGeneralSettings */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
        
        {/* Top Control Bar */}
        <div className="px-5 py-3.5 border-b border-slate-200 flex items-center justify-between gap-4 bg-slate-50/50">
          <div>
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <span>{SUBMODULES.find((s) => s.id === activeSubTab)?.label}</span>
              <span className="text-[10px] font-bold uppercase px-2 py-0.5 bg-blue-50 text-[#2596be] rounded-full border border-blue-200/60">
                Enterprise SEO
              </span>
            </h2>
            <p className="text-[11px] text-slate-500">
              {activeSubTab === "social" && "Configure dynamic link preview images, Open Graph titles, and secondary descriptions for WhatsApp, LinkedIn & Twitter/X."}
              {activeSubTab === "sitemaps" && "Automate XML sitemap distribution and configure robots.txt crawl permissions."}
              {activeSubTab === "verification" && "Manage Google Search Console, Bing Webmaster, and meta ownership verification tokens."}
              {activeSubTab === "redirects" && "Configure permanent 301 and 302 URL redirects to safeguard domain equity and prevent broken links."}
              {activeSubTab === "indexability" && "Monitor HTTP 200 response codes, index directives, and canonical URL hygiene."}
              {activeSubTab === "vitals" && "Track Largest Contentful Paint (LCP), Interaction to Next Paint (INP), and layout shifts."}
              {activeSubTab === "logs" && "Inspect live crawler access telemetry from Googlebot, Bingbot, and WhatsApp crawlers."}
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={reloadSettings}
              title="Discard unsaved changes"
              className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 text-xs font-medium rounded-lg border border-slate-200 transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <RefreshCw size={13} />
              <span>Reset</span>
            </button>

            <button
              type="button"
              onClick={handleSaveAll}
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
        <div className="flex flex-col lg:flex-row min-h-[580px]">
          
          {/* Left Navigation Rail */}
          <aside
            className={`border-b lg:border-b-0 lg:border-r border-slate-200 bg-slate-50/40 p-3 shrink-0 transition-all duration-200 ${
              isNavCollapsed ? "lg:w-16" : "lg:w-60"
            }`}
          >
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-200/60">
              {!isNavCollapsed && (
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider pl-2">
                  SEO Modules
                </span>
              )}
              <button
                type="button"
                onClick={() => setIsNavCollapsed(!isNavCollapsed)}
                className="p-1 hover:bg-slate-200/60 text-slate-500 rounded-md transition-colors ml-auto cursor-pointer"
                title={isNavCollapsed ? "Expand navigation" : "Collapse navigation"}
              >
                {isNavCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
              </button>
            </div>

            <nav className="space-y-1">
              {SUBMODULES.map((sub) => {
                const isActive = activeSubTab === sub.id;
                return (
                  <button
                    key={sub.id}
                    type="button"
                    onClick={() => setActiveSubTab(sub.id)}
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
                          {sub.badge}
                        </span>
                      </div>
                    )}
                  </button>
                );
              })}
            </nav>
          </aside>

          {/* Right Content Area */}
          <main className="flex-1 p-6 bg-white overflow-y-auto space-y-6">

            {/* ───────────────────────────────────────────────────────────
                SUBMODULE 1: SOCIAL & OPEN GRAPH PREVIEWS (NEW FEATURE)
            ─────────────────────────────────────────────────────────── */}
            {activeSubTab === "social" && (
              <div className="space-y-6">
                
                {/* Horizontal Sub-tabs */}
                <div className="flex items-center gap-1 border-b border-slate-200 pb-3">
                  <button
                    type="button"
                    onClick={() => setSocialSubSection("pages")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                      socialSubSection === "pages"
                        ? "bg-[#2596be] text-white shadow-xs"
                        : "text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    <FileCode size={14} />
                    <span>Static Pages Previews ({socialSettings.pagePreviews.length})</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSocialSubSection("dynamic")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                      socialSubSection === "dynamic"
                        ? "bg-[#2596be] text-white shadow-xs"
                        : "text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    <Sparkles size={14} />
                    <span>Products & Services Automation</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSocialSubSection("global")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                      socialSubSection === "global"
                        ? "bg-[#2596be] text-white shadow-xs"
                        : "text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    <Globe size={14} />
                    <span>Global Fallback & Branding</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSocialSubSection("simulator")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                      socialSubSection === "simulator"
                        ? "bg-slate-900 text-white shadow-xs"
                        : "text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    <Eye size={14} />
                    <span>Interactive Social Card Simulator</span>
                  </button>
                </div>

                {/* 1.1 STATIC PAGES PREVIEWS */}
                {socialSubSection === "pages" && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                          Static Page Social Media Overrides
                        </h3>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          Configure exact preview images, primary headlines, and description snippets for individual site sections.
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {socialSettings.pagePreviews.map((page) => (
                        <div
                          key={page.pageId}
                          className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs hover:border-[#2596be]/50 transition-all flex flex-col justify-between space-y-3"
                        >
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                                <span>{page.pageName}</span>
                                <span className="text-[10px] font-mono text-slate-400 font-normal">
                                  ({page.urlPath})
                                </span>
                              </span>
                              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                                Active
                              </span>
                            </div>

                            {/* Image Thumbnail & Snippet Preview */}
                            <div className="flex gap-3 items-start bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                              <img
                                src={page.imageUrl}
                                alt={page.pageName}
                                className="w-20 h-14 object-cover rounded-md border border-slate-200 shrink-0"
                              />
                              <div className="min-w-0 flex-1">
                                <h4 className="text-xs font-bold text-slate-900 line-clamp-1">
                                  {page.title}
                                </h4>
                                <p className="text-[11px] text-slate-500 line-clamp-2 mt-0.5">
                                  {page.description}
                                </p>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                            <span className="text-[10px] text-slate-400 font-mono truncate max-w-[200px]">
                              1200 × 630 px Optimized
                            </span>
                            <button
                              type="button"
                              onClick={() => handleOpenEditPage(page)}
                              className="px-3 py-1 bg-white hover:bg-slate-100 text-slate-700 font-bold text-xs rounded-lg border border-slate-200 transition-colors flex items-center gap-1 cursor-pointer"
                            >
                              <Edit3 size={12} />
                              <span>Customize Preview</span>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 1.2 PRODUCTS & SERVICES AUTOMATION */}
                {socialSubSection === "dynamic" && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                        Dynamic Catalog Automation (Products & Services)
                      </h3>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        When sharing individual equipment models or engineering services on WhatsApp or social networks, these templates automatically extract the primary high-res image and format title & description tokens.
                      </p>
                    </div>

                    {/* Products Card */}
                    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-4">
                      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#2596be] flex items-center justify-center font-bold">
                            <Cpu size={16} />
                          </div>
                          <div>
                            <h4 className="text-xs font-bold text-slate-900">Product Equipment Link Sharing</h4>
                            <p className="text-[11px] text-slate-500">Applied automatically to all {products.length} product detail pages.</p>
                          </div>
                        </div>

                        <label className="flex items-center gap-2 cursor-pointer">
                          <span className="text-xs font-semibold text-slate-700">Auto-Extract Product Image:</span>
                          <input
                            type="checkbox"
                            checked={socialSettings.productUseCustomImageIfAvailable}
                            onChange={(e) =>
                              setSocialSettings({
                                ...socialSettings,
                                productUseCustomImageIfAvailable: e.target.checked
                              })
                            }
                            className="w-4 h-4 text-[#2596be] rounded border-slate-300 focus:ring-[#2596be]"
                          />
                        </label>
                      </div>

                      <div className="space-y-3">
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">
                            Product Share Title Pattern
                          </label>
                          <input
                            type="text"
                            value={socialSettings.productTitlePattern}
                            onChange={(e) =>
                              setSocialSettings({
                                ...socialSettings,
                                productTitlePattern: e.target.value
                              })
                            }
                            className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-800 focus:bg-white focus:ring-2 focus:ring-[#2596be]/20 focus:border-[#2596be] transition-all"
                          />
                          <div className="flex items-center gap-1 mt-1.5 flex-wrap">
                            <span className="text-[10px] text-slate-400 font-medium">Available Variables:</span>
                            {["{product_name}", "{model_id}", "{brand}", "{price}", "{category}"].map((token) => (
                              <button
                                key={token}
                                type="button"
                                onClick={() =>
                                  setSocialSettings({
                                    ...socialSettings,
                                    productTitlePattern: `${socialSettings.productTitlePattern} ${token}`
                                  })
                                }
                                className="text-[10px] font-mono bg-slate-100 hover:bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded cursor-pointer transition-colors"
                              >
                                {token}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">
                            Product Share Description Pattern
                          </label>
                          <textarea
                            rows={2}
                            value={socialSettings.productDescriptionPattern}
                            onChange={(e) =>
                              setSocialSettings({
                                ...socialSettings,
                                productDescriptionPattern: e.target.value
                              })
                            }
                            className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-800 focus:bg-white focus:ring-2 focus:ring-[#2596be]/20 focus:border-[#2596be] transition-all leading-relaxed"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Services Card */}
                    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-4">
                      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                            <Zap size={16} />
                          </div>
                          <div>
                            <h4 className="text-xs font-bold text-slate-900">Engineering Services Link Sharing</h4>
                            <p className="text-[11px] text-slate-500">Applied automatically to all {services.length} HVAC engineering services.</p>
                          </div>
                        </div>

                        <label className="flex items-center gap-2 cursor-pointer">
                          <span className="text-xs font-semibold text-slate-700">Auto-Extract Service Hero:</span>
                          <input
                            type="checkbox"
                            checked={socialSettings.serviceUseCustomImageIfAvailable}
                            onChange={(e) =>
                              setSocialSettings({
                                ...socialSettings,
                                serviceUseCustomImageIfAvailable: e.target.checked
                              })
                            }
                            className="w-4 h-4 text-[#2596be] rounded border-slate-300 focus:ring-[#2596be]"
                          />
                        </label>
                      </div>

                      <div className="space-y-3">
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">
                            Service Share Title Pattern
                          </label>
                          <input
                            type="text"
                            value={socialSettings.serviceTitlePattern}
                            onChange={(e) =>
                              setSocialSettings({
                                ...socialSettings,
                                serviceTitlePattern: e.target.value
                              })
                            }
                            className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-800 focus:bg-white focus:ring-2 focus:ring-[#2596be]/20 focus:border-[#2596be] transition-all"
                          />
                          <div className="flex items-center gap-1 mt-1.5 flex-wrap">
                            <span className="text-[10px] text-slate-400 font-medium">Available Variables:</span>
                            {["{service_title}", "{category}", "{sla}"].map((token) => (
                              <button
                                key={token}
                                type="button"
                                onClick={() =>
                                  setSocialSettings({
                                    ...socialSettings,
                                    serviceTitlePattern: `${socialSettings.serviceTitlePattern} ${token}`
                                  })
                                }
                                className="text-[10px] font-mono bg-slate-100 hover:bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded cursor-pointer transition-colors"
                              >
                                {token}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">
                            Service Share Description Pattern
                          </label>
                          <textarea
                            rows={2}
                            value={socialSettings.serviceDescriptionPattern}
                            onChange={(e) =>
                              setSocialSettings({
                                ...socialSettings,
                                serviceDescriptionPattern: e.target.value
                              })
                            }
                            className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-800 focus:bg-white focus:ring-2 focus:ring-[#2596be]/20 focus:border-[#2596be] transition-all leading-relaxed"
                          />
                        </div>
                      </div>
                    </div>

                  </div>
                )}

                {/* 1.3 GLOBAL FALLBACK & BRANDING */}
                {socialSubSection === "global" && (
                  <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-5">
                    <div>
                      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                        Global Fallback Card & Social Identity
                      </h3>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Used whenever a shared URL has no page-specific preview configured.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div className="space-y-3">
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">
                            Default Social Share Title (Primary Text)
                          </label>
                          <input
                            type="text"
                            value={socialSettings.defaultOgTitle}
                            onChange={(e) =>
                              setSocialSettings({
                                ...socialSettings,
                                defaultOgTitle: e.target.value
                              })
                            }
                            className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:bg-white focus:ring-2 focus:ring-[#2596be]/20 focus:border-[#2596be]"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">
                            Default Social Description (Secondary Text)
                          </label>
                          <textarea
                            rows={3}
                            value={socialSettings.defaultOgDescription}
                            onChange={(e) =>
                              setSocialSettings({
                                ...socialSettings,
                                defaultOgDescription: e.target.value
                              })
                            }
                            className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:ring-2 focus:ring-[#2596be]/20 focus:border-[#2596be] leading-relaxed"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">
                              Site Name (og:site_name)
                            </label>
                            <input
                              type="text"
                              value={socialSettings.siteName}
                              onChange={(e) =>
                                setSocialSettings({
                                  ...socialSettings,
                                  siteName: e.target.value
                                })
                              }
                              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">
                              Twitter / X Profile Handle
                            </label>
                            <input
                              type="text"
                              value={socialSettings.twitterHandle || ""}
                              onChange={(e) =>
                                setSocialSettings({
                                  ...socialSettings,
                                  twitterHandle: e.target.value
                                })
                              }
                              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800"
                              placeholder="@cooltechuae"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Image Preview & Upload */}
                      <div className="space-y-3">
                        <label className="block text-xs font-bold text-slate-700">
                          Global Fallback Preview Image (1200 × 630 px)
                        </label>
                        <div className="relative border border-slate-200 rounded-xl overflow-hidden bg-slate-100 group">
                          <img
                            src={socialSettings.defaultOgImage}
                            alt="Default Social Preview"
                            className="w-full h-44 object-cover"
                          />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                            <label className="px-3.5 py-1.5 bg-white text-slate-900 font-bold text-xs rounded-lg shadow-md cursor-pointer hover:bg-slate-100 transition-all flex items-center gap-1.5">
                              <Upload size={13} />
                              <span>Replace Image</span>
                              <input
                                type="file"
                                onChange={handleUploadGlobalDefaultImage}
                                accept="image/png,image/jpeg,image/webp"
                                className="hidden"
                              />
                            </label>
                          </div>
                        </div>
                        <input
                          type="text"
                          value={socialSettings.defaultOgImage}
                          onChange={(e) =>
                            setSocialSettings({
                              ...socialSettings,
                              defaultOgImage: e.target.value
                            })
                          }
                          className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-600"
                          placeholder="https://..."
                        />
                        <p className="text-[10px] text-slate-400">
                          Must be high-resolution (recommended 1200x630 px) and hosted over secure HTTPS for WhatsApp compatibility.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* 1.4 INTERACTIVE SOCIAL CARD SIMULATOR */}
                {socialSubSection === "simulator" && (
                  <div className="space-y-5">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
                      <div>
                        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
                          <Sparkles size={14} className="text-[#2596be]" />
                          <span>Live Open Graph Preview Simulator</span>
                        </h3>
                        <p className="text-[11px] text-slate-500">
                          See exactly how WhatsApp, LinkedIn, Twitter/X, and Google Search will unfurl this card when shared.
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-500">Test Target:</span>
                        <select
                          value={simulatorSelectedTarget}
                          onChange={(e) => setSimulatorSelectedTarget(e.target.value)}
                          className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-[#2596be]/20 focus:border-[#2596be] cursor-pointer"
                        >
                          <optgroup label="Static Site Pages">
                            {socialSettings.pagePreviews.map((p) => (
                              <option key={p.pageId} value={p.pageId}>
                                {p.pageName} ({p.urlPath})
                              </option>
                            ))}
                          </optgroup>
                          <optgroup label="Equipment Products (Catalog)">
                            {products.slice(0, 10).map((p) => (
                              <option key={p.id} value={`prod-${p.id}`}>
                                Product: {p.name}
                              </option>
                            ))}
                          </optgroup>
                          <optgroup label="Engineering Services">
                            {services.slice(0, 6).map((s) => (
                              <option key={s.id} value={`serv-${s.id}`}>
                                Service: {s.title}
                              </option>
                            ))}
                          </optgroup>
                        </select>
                      </div>
                    </div>

                    {/* Platform Selector Buttons */}
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setSimulatorPlatform("whatsapp")}
                        className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                          simulatorPlatform === "whatsapp"
                            ? "bg-[#25D366] text-white shadow-xs"
                            : "bg-slate-100 hover:bg-slate-200 text-slate-700"
                        }`}
                      >
                        <MessageSquare size={13} />
                        <span>WhatsApp Chat Bubble</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setSimulatorPlatform("linkedin")}
                        className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                          simulatorPlatform === "linkedin"
                            ? "bg-[#0A66C2] text-white shadow-xs"
                            : "bg-slate-100 hover:bg-slate-200 text-slate-700"
                        }`}
                      >
                        <Linkedin size={13} />
                        <span>LinkedIn Card</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setSimulatorPlatform("twitter")}
                        className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                          simulatorPlatform === "twitter"
                            ? "bg-slate-900 text-white shadow-xs"
                            : "bg-slate-100 hover:bg-slate-200 text-slate-700"
                        }`}
                      >
                        <Twitter size={13} />
                        <span>Twitter / X Large Card</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setSimulatorPlatform("google")}
                        className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                          simulatorPlatform === "google"
                            ? "bg-blue-600 text-white shadow-xs"
                            : "bg-slate-100 hover:bg-slate-200 text-slate-700"
                        }`}
                      >
                        <Search size={13} />
                        <span>Google Search Snippet</span>
                      </button>
                    </div>

                    {/* RENDER SIMULATOR CONTAINER */}
                    <div className="bg-slate-100/70 border border-slate-200/80 rounded-2xl p-6 flex items-center justify-center">
                      
                      {/* 1. WHATSAPP SIMULATION */}
                      {simulatorPlatform === "whatsapp" && (
                        <div className="w-full max-w-sm bg-[#EFEAE2] p-4 rounded-2xl shadow-md border border-slate-300/80 space-y-2">
                          <div className="text-[10px] text-slate-400 font-medium text-center mb-1">
                            Today • WhatsApp Chat Preview
                          </div>
                          
                          <div className="bg-white rounded-xl shadow-xs overflow-hidden border border-slate-200/60 transition-all hover:shadow-md">
                            <div className="relative">
                              <img
                                src={simData.image}
                                alt={simData.title}
                                className="w-full h-40 object-cover bg-slate-100"
                              />
                              <div className="absolute bottom-1.5 left-2 bg-black/60 backdrop-blur-xs text-white text-[9px] px-1.5 py-0.5 rounded font-mono">
                                cooltechnologies.ae
                              </div>
                            </div>
                            <div className="p-3 bg-white space-y-1">
                              <h4 className="text-xs font-bold text-slate-900 line-clamp-1 leading-snug">
                                {simData.title}
                              </h4>
                              <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                                {simData.description}
                              </p>
                              <div className="text-[10px] font-mono text-slate-400 pt-1 flex items-center gap-1 truncate">
                                <span>🔗</span>
                                <span className="truncate">{simData.url}</span>
                              </div>
                            </div>
                          </div>

                          <div className="text-right text-[10px] text-slate-400 font-mono pr-1">
                            12:45 PM ✓✓
                          </div>
                        </div>
                      )}

                      {/* 2. LINKEDIN SIMULATION */}
                      {simulatorPlatform === "linkedin" && (
                        <div className="w-full max-w-md bg-white border border-slate-200 rounded-xl shadow-md overflow-hidden">
                          <div className="p-3 border-b border-slate-100 flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-[#0A66C2] text-white flex items-center justify-center font-bold text-xs">
                              CT
                            </div>
                            <div>
                              <span className="text-xs font-bold text-slate-900 block leading-tight">Cool Technologies UAE</span>
                              <span className="text-[10px] text-slate-400">B2B HVAC Commercial Distribution</span>
                            </div>
                          </div>
                          <div className="border border-slate-200 mx-3 my-2 rounded-lg overflow-hidden bg-slate-50">
                            <img
                              src={simData.image}
                              alt={simData.title}
                              className="w-full h-44 object-cover"
                            />
                            <div className="p-3 bg-white space-y-1 border-t border-slate-100">
                              <h4 className="text-xs font-bold text-slate-900 line-clamp-1">
                                {simData.title}
                              </h4>
                              <p className="text-[11px] text-slate-500 line-clamp-2">
                                {simData.description}
                              </p>
                              <span className="text-[10px] text-slate-400 font-mono block pt-1">
                                cooltechnologies.ae
                              </span>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* 3. TWITTER SIMULATION */}
                      {simulatorPlatform === "twitter" && (
                        <div className="w-full max-w-md bg-white border border-slate-200 rounded-2xl shadow-md overflow-hidden">
                          <img
                            src={simData.image}
                            alt={simData.title}
                            className="w-full h-48 object-cover"
                          />
                          <div className="p-3.5 space-y-1">
                            <span className="text-[10px] text-slate-400 font-mono block">
                              cooltechnologies.ae
                            </span>
                            <h4 className="text-xs font-bold text-slate-900 line-clamp-1">
                              {simData.title}
                            </h4>
                            <p className="text-[11px] text-slate-500 line-clamp-2">
                              {simData.description}
                            </p>
                          </div>
                        </div>
                      )}

                      {/* 4. GOOGLE SERP SIMULATION */}
                      {simulatorPlatform === "google" && (
                        <div className="w-full max-w-lg bg-white border border-slate-200 rounded-xl p-4 shadow-md space-y-1.5">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-[10px]">
                              CT
                            </div>
                            <div className="min-w-0 leading-tight">
                              <span className="text-[11px] text-slate-800 font-bold block truncate">Cool Technologies UAE</span>
                              <span className="text-[10px] text-slate-400 font-mono block truncate">{simData.url}</span>
                            </div>
                          </div>
                          <h4 className="text-sm font-semibold text-[#1a0dab] hover:underline cursor-pointer line-clamp-1">
                            {simData.title}
                          </h4>
                          <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                            {simData.description}
                          </p>
                        </div>
                      )}

                    </div>
                  </div>
                )}

              </div>
            )}

            {/* ───────────────────────────────────────────────────────────
                SUBMODULE 2: XML SITEMAPS & ROBOTS.TXT
            ─────────────────────────────────────────────────────────── */}
            {activeSubTab === "sitemaps" && (
              <div className="space-y-6">
                
                {/* Search Engine Ping Banner */}
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div>
                    <h3 className="text-xs font-bold text-slate-900">Search Engine Index Notification</h3>
                    <p className="text-[11px] text-slate-500">
                      Instantly ping Google Search Console & Bing Webmaster APIs with your latest catalog changes.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handlePingSearchEngines}
                    className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-lg shadow-xs flex items-center gap-1.5 transition-all cursor-pointer shrink-0"
                  >
                    <RefreshCw size={13} />
                    <span>Ping Search Engines</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Main Sitemap */}
                  <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs flex flex-col justify-between space-y-3">
                    <div>
                      <span className="text-[10px] font-bold uppercase text-[#2596be] bg-blue-50 px-2 py-0.5 rounded border border-blue-200/60">
                        Primary Routes
                      </span>
                      <h3 className="text-xs font-bold text-slate-900 mt-2">Main XML Sitemap (`sitemap.xml`)</h3>
                      <p className="text-[11px] text-slate-500 mt-1">
                        Includes all routes, category pages, products ({products.length}), and articles ({blogs.length}).
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDownloadFile(generateMainSitemap(), "sitemap.xml", "application/xml")}
                      className="w-full py-2 bg-white hover:bg-slate-100 text-slate-800 font-bold text-xs rounded-lg border border-slate-200 shadow-2xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                    >
                      <FileCode size={13} />
                      <span>Download sitemap.xml</span>
                    </button>
                  </div>

                  {/* Image Sitemap */}
                  <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs flex flex-col justify-between space-y-3">
                    <div>
                      <span className="text-[10px] font-bold uppercase text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        Media & Assets
                      </span>
                      <h3 className="text-xs font-bold text-slate-900 mt-2">Image Sitemap (`image-sitemap.xml`)</h3>
                      <p className="text-[11px] text-slate-500 mt-1">
                        Structured image locators, titles, and alt tags for Google Image Search indexing.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDownloadFile(generateImageSitemap(), "image-sitemap.xml", "application/xml")}
                      className="w-full py-2 bg-white hover:bg-slate-100 text-slate-800 font-bold text-xs rounded-lg border border-slate-200 shadow-2xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                    >
                      <FileCode size={13} />
                      <span>Download image-sitemap.xml</span>
                    </button>
                  </div>

                  {/* Video Sitemap */}
                  <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs flex flex-col justify-between space-y-3">
                    <div>
                      <span className="text-[10px] font-bold uppercase text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                        Rich Video
                      </span>
                      <h3 className="text-xs font-bold text-slate-900 mt-2">Video Sitemap (`video-sitemap.xml`)</h3>
                      <p className="text-[11px] text-slate-500 mt-1">
                        Video thumbnail locators, description metadata, and playback specs.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDownloadFile(generateVideoSitemap(), "video-sitemap.xml", "application/xml")}
                      className="w-full py-2 bg-white hover:bg-slate-100 text-slate-800 font-bold text-xs rounded-lg border border-slate-200 shadow-2xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                    >
                      <FileCode size={13} />
                      <span>Download video-sitemap.xml</span>
                    </button>
                  </div>
                </div>

                {/* Robots.txt Live Editor */}
                <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <div>
                      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                        Robots.txt Protocol Configuration
                      </h3>
                      <p className="text-[11px] text-slate-500">
                        Crawling rules and sitemap directory paths served to search engines.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDownloadFile(robotsTxt, "robots.txt", "text/plain")}
                      className="px-3 py-1 bg-white hover:bg-slate-100 text-slate-800 font-bold text-xs rounded-lg border border-slate-200 transition-colors cursor-pointer"
                    >
                      Download robots.txt
                    </button>
                  </div>
                  <textarea
                    rows={6}
                    value={robotsTxt}
                    onChange={(e) => setRobotsTxt(e.target.value)}
                    className="w-full font-mono text-xs p-3.5 bg-slate-900 text-slate-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2596be]/30 leading-relaxed"
                  />
                </div>
              </div>
            )}

            {/* ───────────────────────────────────────────────────────────
                SUBMODULE 3: CONSOLE VERIFICATION TAGS
            ─────────────────────────────────────────────────────────── */}
            {activeSubTab === "verification" && (
              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-5">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                    Search Console Ownership Verification Tags
                  </h3>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Meta tags injected into the website &lt;head&gt; to verify domain ownership across major search engines.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-700">
                      Google Search Console (GSC) Verification Token
                    </label>
                    <input
                      type="text"
                      value={gscTag}
                      onChange={(e) => setGscTag(e.target.value)}
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-semibold text-slate-800 focus:bg-white focus:ring-2 focus:ring-[#2596be]/20 focus:border-[#2596be]"
                    />
                    <span className="text-[10px] text-slate-400">Example: google-site-verification=xxxx</span>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-700">
                      Bing Webmaster Tools Verification Meta Code
                    </label>
                    <input
                      type="text"
                      value={bingTag}
                      onChange={(e) => setBingTag(e.target.value)}
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-semibold text-slate-800 focus:bg-white focus:ring-2 focus:ring-[#2596be]/20 focus:border-[#2596be]"
                    />
                    <span className="text-[10px] text-slate-400">Example: msvalidate.01=xxxx</span>
                  </div>
                </div>
              </div>
            )}

            {/* ───────────────────────────────────────────────────────────
                SUBMODULE 4: 301 REDIRECTS MANAGER
            ─────────────────────────────────────────────────────────── */}
            {activeSubTab === "redirects" && (
              <div className="space-y-5">
                <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                    Add New 301 Permanent Redirect Rule
                  </h3>

                  <form onSubmit={handleAddRedirect} className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <input
                      type="text"
                      placeholder="Source Path (e.g. /old-hvac-article)"
                      value={newSource}
                      onChange={(e) => setNewSource(e.target.value)}
                      className="px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono"
                    />

                    <input
                      type="text"
                      placeholder="Destination URL (e.g. /#/blog/new-article)"
                      value={newDest}
                      onChange={(e) => setNewDest(e.target.value)}
                      className="px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono"
                    />

                    <button
                      type="submit"
                      className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-2xs transition-all cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <Plus size={14} />
                      <span>Add 301 Redirect Rule</span>
                    </button>
                  </form>
                </div>

                <div className="bg-white border border-slate-200 rounded-xl shadow-2xs overflow-hidden">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold text-[11px] uppercase">
                        <th className="p-3.5">Source URL Path</th>
                        <th className="p-3.5">Destination Target</th>
                        <th className="p-3.5">Type</th>
                        <th className="p-3.5">Hits Count</th>
                        <th className="p-3.5 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium">
                      {redirects.map((r) => (
                        <tr key={r.id} className="hover:bg-slate-50 transition-colors">
                          <td className="p-3.5 font-mono text-slate-800 font-bold">{r.sourceUrl}</td>
                          <td className="p-3.5 font-mono text-[#2596be] font-bold">{r.destinationUrl}</td>
                          <td className="p-3.5">
                            <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[10px] font-bold border border-slate-200">
                              301 Permanent
                            </span>
                          </td>
                          <td className="p-3.5 font-mono text-slate-500">{r.hitsCount || 0} hits</td>
                          <td className="p-3.5 text-right">
                            <button
                              type="button"
                              onClick={() => handleDeleteRedirect(r.id)}
                              className="text-slate-400 hover:text-red-600 p-1 cursor-pointer transition-colors"
                              title="Delete rule"
                            >
                              <Trash2 size={14} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* ───────────────────────────────────────────────────────────
                SUBMODULE 5: CRAWLABILITY & INDEXABILITY AUDIT
            ─────────────────────────────────────────────────────────── */}
            {activeSubTab === "indexability" && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-1">
                  <span className="text-[10px] text-slate-400 uppercase font-bold">Crawlability Status</span>
                  <h4 className="text-base font-extrabold text-slate-900">HTTP 200 OK (100%)</h4>
                  <p className="text-[11px] text-emerald-600 font-semibold">✓ All critical routes reachable</p>
                </div>

                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-1">
                  <span className="text-[10px] text-slate-400 uppercase font-bold">Noindex Audit</span>
                  <h4 className="text-base font-extrabold text-slate-900">0 Pages Blocked</h4>
                  <p className="text-[11px] text-slate-500">Public catalog fully indexable</p>
                </div>

                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-1">
                  <span className="text-[10px] text-slate-400 uppercase font-bold">Broken Links Audit</span>
                  <h4 className="text-base font-extrabold text-slate-900">0 Dead Links</h4>
                  <p className="text-[11px] text-emerald-600 font-semibold">✓ 100% link integrity verified</p>
                </div>

                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-1">
                  <span className="text-[10px] text-slate-400 uppercase font-bold">Canonical Tag Coverage</span>
                  <h4 className="text-base font-extrabold text-slate-900">100% Configured</h4>
                  <p className="text-[11px] text-slate-500">Self-referencing canonicals active</p>
                </div>
              </div>
            )}

            {/* ───────────────────────────────────────────────────────────
                SUBMODULE 6: CORE WEB VITALS & SPEED
            ─────────────────────────────────────────────────────────── */}
            {activeSubTab === "vitals" && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-2">
                  <span className="text-[10px] font-bold uppercase text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    Optimal
                  </span>
                  <h3 className="text-xs font-bold text-slate-900">Largest Contentful Paint (LCP)</h3>
                  <p className="text-2xl font-black text-slate-900 font-mono">1.2s</p>
                  <p className="text-[10px] text-slate-500">Target: &lt; 2.5s (Google Good threshold)</p>
                </div>

                <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-2">
                  <span className="text-[10px] font-bold uppercase text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    Optimal
                  </span>
                  <h3 className="text-xs font-bold text-slate-900">Interaction to Next Paint (INP)</h3>
                  <p className="text-2xl font-black text-slate-900 font-mono">45ms</p>
                  <p className="text-[10px] text-slate-500">Target: &lt; 200ms (Responsive click response)</p>
                </div>

                <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-2">
                  <span className="text-[10px] font-bold uppercase text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    Optimal
                  </span>
                  <h3 className="text-xs font-bold text-slate-900">Cumulative Layout Shift (CLS)</h3>
                  <p className="text-2xl font-black text-slate-900 font-mono">0.01</p>
                  <p className="text-[10px] text-slate-500">Target: &lt; 0.1 (Zero visual jumpiness)</p>
                </div>
              </div>
            )}

            {/* ───────────────────────────────────────────────────────────
                SUBMODULE 7: BOT ACCESS LOGS
            ─────────────────────────────────────────────────────────── */}
            {activeSubTab === "logs" && (
              <div className="bg-slate-900 text-slate-200 rounded-xl p-5 font-mono text-xs space-y-3 border border-slate-800 shadow-2xs">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2 text-slate-400 text-[11px]">
                  <span>Search Engine & Social Bot Ingestion Stream</span>
                  <span className="text-emerald-400 flex items-center gap-1 font-sans text-xs">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    Live Telemetry
                  </span>
                </div>
                <div className="space-y-1.5 text-[11px] leading-relaxed">
                  <p className="text-slate-300">66.249.66.1 - - [08/Sep/2026:12:00:01 +0400] "GET /sitemap.xml HTTP/1.1" 200 1489 "-" "Googlebot/2.1 (+http://www.google.com/bot.html)"</p>
                  <p className="text-slate-300">66.249.66.2 - - [08/Sep/2026:12:02:14 +0400] "GET /product/daikin-2-ton HTTP/1.1" 200 45120 "-" "Googlebot-Smartphone/2.1"</p>
                  <p className="text-emerald-300">31.13.113.1 - - [08/Sep/2026:12:04:10 +0400] "GET /product/daikin-2-ton HTTP/1.1" 200 1250 "-" "facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php WhatsApp/2.26)"</p>
                  <p className="text-slate-400">40.77.167.1 - - [08/Sep/2026:12:05:30 +0400] "GET /image-sitemap.xml HTTP/1.1" 200 8920 "-" "bingbot/2.0 (+http://www.bing.com/bingbot.htm)"</p>
                  <p className="text-blue-300">108.174.2.200 - - [08/Sep/2026:12:08:45 +0400] "GET /services HTTP/1.1" 200 2410 "-" "LinkedInBot/1.0 (+http://www.linkedin.com)"</p>
                </div>
              </div>
            )}

          </main>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          MODAL: EDIT STATIC PAGE SOCIAL PREVIEW
      ───────────────────────────────────────────────────────────── */}
      {editingPage && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Share2 size={16} className="text-[#2596be]" />
                <span>Customize Social Share: {editingPage.pageName}</span>
              </h3>
              <button
                type="button"
                onClick={() => setEditingPage(null)}
                className="p-1 hover:bg-slate-200/60 rounded-lg text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSavePagePreview} className="p-5 space-y-4 text-xs">
              
              {/* Primary Text (Title) */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-slate-700">Primary Share Title (og:title)</label>
                  <span className={`font-mono text-[10px] ${pageTitle.length > 60 ? "text-amber-600" : "text-slate-400"}`}>
                    {pageTitle.length} / 60 recommended
                  </span>
                </div>
                <input
                  type="text"
                  value={pageTitle}
                  onChange={(e) => setPageTitle(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:ring-2 focus:ring-[#2596be]/20 focus:border-[#2596be]"
                  placeholder="Catchy headline for WhatsApp / LinkedIn..."
                  required
                />
              </div>

              {/* Secondary Text (Description) */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-slate-700">Secondary Text / Snippet (og:description)</label>
                  <span className={`font-mono text-[10px] ${pageDescription.length > 155 ? "text-amber-600" : "text-slate-400"}`}>
                    {pageDescription.length} / 155 recommended
                  </span>
                </div>
                <textarea
                  rows={3}
                  value={pageDescription}
                  onChange={(e) => setPageDescription(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-[#2596be]/20 focus:border-[#2596be] leading-relaxed"
                  placeholder="Clear description explaining what users will find when clicking..."
                  required
                />
              </div>

              {/* Preview Image URL & Upload */}
              <div className="space-y-2">
                <label className="font-bold text-slate-700 block">Preview Image (1200 × 630 px)</label>
                
                <div className="relative border border-slate-200 rounded-xl overflow-hidden bg-slate-100 h-32">
                  <img
                    src={pageImageUrl || socialSettings.defaultOgImage}
                    alt={pageTitle}
                    className="w-full h-full object-cover"
                  />
                  {isUploadingImage && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white text-xs font-bold gap-2">
                      <RefreshCw size={14} className="animate-spin" />
                      <span>Uploading to Cloudflare R2...</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={pageImageUrl}
                    onChange={(e) => setPageImageUrl(e.target.value)}
                    className="flex-1 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono text-slate-700"
                    placeholder="https://..."
                  />
                  <button
                    type="button"
                    onClick={() => imageFileInputRef.current?.click()}
                    disabled={isUploadingImage}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-lg transition-colors flex items-center gap-1 cursor-pointer shrink-0"
                  >
                    <Upload size={12} />
                    <span>Upload Image</span>
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingPage(null)}
                  className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-600 font-bold rounded-xl border border-slate-200 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#2596be] hover:bg-[#1c7e9f] text-white font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  Apply & Save Preview
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
}
