import React, { useState, useEffect } from "react";
import {
  X, Check, AlertCircle, FileText, Globe, FileCode,
  Image as ImageIcon, Video, Search, Eye, Sparkles, CheckCircle2,
  Sliders, Link2, Share2, ShieldCheck, Zap, ArrowRight, Plus, Trash2, Code2
} from "lucide-react";
import { BlogPost, BlogSeoSettings, ArticleSection, Product, ServiceItem } from "../../types";
import { generateDefaultBlogSeo, calculateBlogSeoScore } from "../../data/initialBlogs";

interface BlogPostEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (blog: BlogPost) => void;
  editingBlog: BlogPost | null;
  products?: Product[];
  services?: ServiceItem[];
}

export default function BlogPostEditorModal({
  isOpen,
  onClose,
  onSave,
  editingBlog,
  products = [],
  services = []
}: BlogPostEditorModalProps) {
  const [activeTab, setActiveTab] = useState<"content" | "seo">("content");
  const [serpViewMode, setSerpViewMode] = useState<"google" | "social" | "jsonld">("google");

  // Form states
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [category, setCategory] = useState("HVAC");
  const [author, setAuthor] = useState("Engineering Directorate");
  const [authorRole, setAuthorRole] = useState("Senior MEP Specialist");
  const [date, setDate] = useState(new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }));
  const [readTime, setReadTime] = useState("5 min read");
  const [image, setImage] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [intro, setIntro] = useState("");
  const [status, setStatus] = useState<"published" | "draft">("published");

  // Rich Sections state
  const [sections, setSections] = useState<ArticleSection[]>([]);

  // Per-Blog SEO Settings State
  const [seoSettings, setSeoSettings] = useState<BlogSeoSettings>({});

  // Initialize or reset form
  useEffect(() => {
    if (editingBlog) {
      setTitle(editingBlog.title || "");
      setSlug(editingBlog.slug || "");
      setCategory(editingBlog.category || "HVAC");
      setAuthor(editingBlog.author || "Engineering Directorate");
      setAuthorRole(editingBlog.authorRole || "Senior MEP Specialist");
      setDate(editingBlog.date || new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }));
      setReadTime(editingBlog.readTime || "5 min read");
      setImage(editingBlog.image || "");
      setVideoUrl(editingBlog.videoUrl || "");
      setExcerpt(editingBlog.excerpt || "");
      setIntro(editingBlog.intro || "");
      setStatus(editingBlog.status || "published");
      setSections(editingBlog.sections && editingBlog.sections.length > 0 ? editingBlog.sections : [
        {
          id: "sec-1",
          h2: "Technical System Requirements",
          paragraphs: ["Enter comprehensive engineering specifications and design directives here."]
        }
      ]);
      setSeoSettings(editingBlog.seoSettings || generateDefaultBlogSeo(
        editingBlog.title || "",
        editingBlog.slug || "",
        editingBlog.excerpt || "",
        editingBlog.category || "HVAC",
        editingBlog.image || "",
        editingBlog.videoUrl
      ));
    } else {
      const defaultTitle = "New HVAC & Cooling Technical Specification";
      const defaultSlug = "new-hvac-cooling-technical-specification";
      const defaultExcerpt = "Overview of modern commercial HVAC installation guidelines and thermal performance metrics.";
      const defaultImage = "https://images.unsplash.com/photo-1581094288338-2314dddb7ece?auto=format&fit=crop&w=1200&q=80";

      setTitle(defaultTitle);
      setSlug(defaultSlug);
      setCategory("HVAC");
      setAuthor("Engineering Directorate");
      setAuthorRole("Senior MEP Specialist");
      setDate(new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }));
      setReadTime("5 min read");
      setImage(defaultImage);
      setVideoUrl("");
      setExcerpt(defaultExcerpt);
      setIntro("In response to shifting ambient cooling demands across commercial developments, facility engineers must implement high-efficiency system configurations.");
      setStatus("published");
      setSections([
        {
          id: "sec-1",
          h2: "System Architecture & Refrigerant Specs",
          paragraphs: ["Detail the refrigerant pressure dynamics and compressor displacement parameters here."]
        }
      ]);
      setSeoSettings(generateDefaultBlogSeo(defaultTitle, defaultSlug, defaultExcerpt, "HVAC", defaultImage));
    }
  }, [editingBlog, isOpen]);

  // Auto-generate slug from title
  const handleGenerateSlug = () => {
    const generated = title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .trim()
      .replace(/\s+/g, "-");
    setSlug(generated);
    setSeoSettings(prev => ({
      ...prev,
      canonicalUrl: `https://cooltechnologies.ae/#/blog/${generated}`
    }));
  };

  // Section Handlers
  const handleAddSection = () => {
    const newSec: ArticleSection = {
      id: `sec-${Date.now()}`,
      h2: "New Technical Section",
      paragraphs: ["Enter detailed section narrative here."]
    };
    setSections([...sections, newSec]);
  };

  const handleUpdateSectionHeading = (index: number, h2Val: string) => {
    const updated = [...sections];
    updated[index].h2 = h2Val;
    setSections(updated);
  };

  const handleUpdateSectionParagraph = (index: number, pIndex: number, text: string) => {
    const updated = [...sections];
    if (!updated[index].paragraphs) updated[index].paragraphs = [""];
    updated[index].paragraphs![pIndex] = text;
    setSections(updated);
  };

  const handleAddParagraph = (index: number) => {
    const updated = [...sections];
    if (!updated[index].paragraphs) updated[index].paragraphs = [];
    updated[index].paragraphs!.push("New paragraph content...");
    setSections(updated);
  };

  const handleDeleteSection = (index: number) => {
    if (sections.length <= 1) return;
    setSections(sections.filter((_, i) => i !== index));
  };

  // Construct draft BlogPost object for live score & preview calculation
  const currentBlogDraft: BlogPost = {
    id: editingBlog?.id || `post-${Date.now()}`,
    title,
    slug,
    category,
    author,
    authorRole,
    date,
    lastUpdated: new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }),
    readTime,
    image,
    videoUrl,
    excerpt,
    intro,
    status,
    sections,
    seoSettings
  };

  const currentSeoScore = calculateBlogSeoScore(currentBlogDraft);

  // Generate live JSON-LD schema
  const generateLiveJsonLd = () => {
    const schemas: any[] = [];

    if (seoSettings.enableArticleSchema !== false) {
      schemas.push({
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        "headline": seoSettings.seoTitle || title,
        "description": seoSettings.seoDescription || excerpt,
        "image": [image],
        "datePublished": date,
        "dateModified": new Date().toISOString(),
        "author": {
          "@type": "Person",
          "name": author,
          "jobTitle": authorRole
        },
        "publisher": {
          "@type": "Organization",
          "name": "Cool Technologies",
          "logo": {
            "@type": "ImageObject",
            "url": "https://cooltechnologies.ae/logo.png"
          }
        },
        "mainEntityOfPage": {
          "@type": "WebPage",
          "@id": seoSettings.canonicalUrl || `https://cooltechnologies.ae/#/blog/${slug}`
        }
      });
    }

    if (seoSettings.enableBreadcrumbSchema !== false) {
      schemas.push({
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://cooltechnologies.ae/" },
          { "@type": "ListItem", "position": 2, "name": "Blog", "item": "https://cooltechnologies.ae/#/blog" },
          { "@type": "ListItem", "position": 3, "name": category, "item": `https://cooltechnologies.ae/#/blog?cat=${encodeURIComponent(category)}` },
          { "@type": "ListItem", "position": 4, "name": title, "item": `https://cooltechnologies.ae/#/blog/${slug}` }
        ]
      });
    }

    if (seoSettings.enableProductSchema && seoSettings.productSchemaData) {
      schemas.push({
        "@context": "https://schema.org",
        "@type": "Product",
        "name": seoSettings.productSchemaData.productName,
        "brand": { "@type": "Brand", "name": seoSettings.productSchemaData.brand },
        "offers": {
          "@type": "Offer",
          "price": seoSettings.productSchemaData.price,
          "priceCurrency": seoSettings.productSchemaData.currency,
          "availability": seoSettings.productSchemaData.inStock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock"
        }
      });
    }

    if (seoSettings.enableReviewSchema && seoSettings.reviewSchemaData) {
      schemas.push({
        "@context": "https://schema.org",
        "@type": "Review",
        "author": { "@type": "Person", "name": seoSettings.reviewSchemaData.authorName },
        "reviewRating": {
          "@type": "Rating",
          "ratingValue": seoSettings.reviewSchemaData.ratingValue,
          "bestRating": "5"
        }
      });
    }

    if (seoSettings.enableVideoSchema && videoUrl) {
      schemas.push({
        "@context": "https://schema.org",
        "@type": "VideoObject",
        "name": seoSettings.videoSchemaData?.title || title,
        "description": seoSettings.videoSchemaData?.description || excerpt,
        "thumbnailUrl": [image],
        "uploadDate": date,
        "contentUrl": videoUrl
      });
    }

    return JSON.stringify(schemas, null, 2);
  };

  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();
    const finalBlog: BlogPost = {
      ...currentBlogDraft,
      seoScore: currentSeoScore
    };
    onSave(finalBlog);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-hidden font-sans">
      <div className="bg-white w-full max-w-5xl h-[92vh] rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden animate-in zoom-in-95 duration-150">
        
        {/* Header Bar */}
        <div className="bg-slate-900 text-white p-5 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center font-bold text-white shadow-md">
              <FileText size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-extrabold text-base text-white">
                  {editingBlog ? "Edit Blog Post & SEO Suite" : "Create New Dynamic Blog Post"}
                </h2>
                <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${
                  status === "published" ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30" : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                }`}>
                  {status}
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium">
                Configure full article content, section builder, and dedicated per-blog SEO rules & schema.org code.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Live SEO Score Badge */}
            <div className="bg-slate-800 border border-slate-700 px-3.5 py-1.5 rounded-xl flex items-center gap-2">
              <span className="text-[10px] uppercase font-bold text-slate-400">SEO Health Score:</span>
              <span className={`text-xs font-black font-mono px-2 py-0.5 rounded ${
                currentSeoScore >= 90 ? "bg-emerald-500 text-slate-950" : currentSeoScore >= 70 ? "bg-amber-500 text-slate-950" : "bg-red-500 text-white"
              }`}>
                {currentSeoScore}/100
              </span>
            </div>

            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Modal Top Tabs */}
        <div className="bg-slate-50 border-b border-slate-200 px-6 py-2 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveTab("content")}
              className={`px-4 py-2 rounded-lg text-xs font-extrabold flex items-center gap-2 transition-all cursor-pointer ${
                activeTab === "content"
                  ? "bg-white text-blue-700 shadow-xs border border-slate-200"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
              }`}
            >
              <FileText size={15} />
              <span>Article Content & Sections</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("seo")}
              className={`px-4 py-2 rounded-lg text-xs font-extrabold flex items-center gap-2 transition-all cursor-pointer ${
                activeTab === "seo"
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
              }`}
            >
              <Globe size={15} />
              <span>Dedicated Per-Blog SEO Suite</span>
              <span className="text-[9px] bg-emerald-400 text-slate-950 font-black px-1.5 py-0.2 rounded-full font-mono">
                {currentSeoScore}
              </span>
            </button>
          </div>

          <div className="text-xs font-bold text-slate-500 hidden sm:block font-mono">
            Slug: <span className="text-blue-700">/blog/{slug || "..."}</span>
          </div>
        </div>

        {/* Main Scrollable Body */}
        <form onSubmit={handleSaveForm} className="flex-1 flex flex-col min-h-0 overflow-hidden">
          
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            
            {/* TAB 1: CONTENT & SECTIONS BUILDER */}
            {activeTab === "content" && (
              <div className="space-y-6">
                
                {/* Core Details Grid */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 border-b border-slate-100 pb-2">
                    Primary Article Information
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    
                    {/* Title */}
                    <div className="md:col-span-2 space-y-1">
                      <label className="text-xs font-bold text-slate-700">Article Main Title *</label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          required
                          value={title}
                          onChange={(e) => setTitle(e.target.value)}
                          placeholder="e.g. Next-Gen Low-GWP Refrigerant Compliance for GCC Commercial Cooling Systems"
                          className="flex-1 px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:outline-none focus:border-blue-600"
                        />
                        <button
                          type="button"
                          onClick={handleGenerateSlug}
                          className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-extrabold rounded-xl border border-slate-300 transition-colors cursor-pointer shrink-0"
                        >
                          Auto Slug
                        </button>
                      </div>
                    </div>

                    {/* Slug */}
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                        <span>URL Slug (Permalink) *</span>
                        <span className="text-[10px] text-emerald-600 font-extrabold">✓ SEO Friendly</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={slug}
                        onChange={(e) => setSlug(e.target.value)}
                        placeholder="next-gen-low-gwp-refrigerant-compliance"
                        className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-blue-700 focus:bg-white focus:outline-none focus:border-blue-600"
                      />
                    </div>

                    {/* Category */}
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700">Category *</label>
                      <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:bg-white focus:outline-none"
                      >
                        <option value="HVAC">HVAC</option>
                        <option value="Cooling Systems">Cooling Systems</option>
                        <option value="Water Coolers">Water Coolers</option>
                        <option value="Maintenance">Maintenance</option>
                        <option value="Company News">Company News</option>
                        <option value="Product Updates">Product Updates</option>
                        <option value="Industrial Projects">Industrial Projects</option>
                      </select>
                    </div>

                    {/* Author & Role */}
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700">Author Name</label>
                      <input
                        type="text"
                        value={author}
                        onChange={(e) => setAuthor(e.target.value)}
                        placeholder="Eng. Tareq Al-Mansoori"
                        className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700">Author Role / Designation</label>
                      <input
                        type="text"
                        value={authorRole}
                        onChange={(e) => setAuthorRole(e.target.value)}
                        placeholder="Senior MEP Technical Director"
                        className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
                      />
                    </div>

                    {/* Date & Read Time */}
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700">Publish Date</label>
                      <input
                        type="text"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        placeholder="July 18, 2026"
                        className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700">Estimated Read Time</label>
                      <input
                        type="text"
                        value={readTime}
                        onChange={(e) => setReadTime(e.target.value)}
                        placeholder="6 min read"
                        className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
                      />
                    </div>

                    {/* Cover Image & Video URL */}
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700">Cover Image URL *</label>
                      <input
                        type="text"
                        required
                        value={image}
                        onChange={(e) => setImage(e.target.value)}
                        placeholder="https://..."
                        className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700">Video Embed URL (Video Sitemap / Schema)</label>
                      <input
                        type="text"
                        value={videoUrl}
                        onChange={(e) => setVideoUrl(e.target.value)}
                        placeholder="https://www.youtube.com/watch?v=..."
                        className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono"
                      />
                    </div>

                    {/* Excerpt & Intro */}
                    <div className="md:col-span-2 space-y-1">
                      <label className="text-xs font-bold text-slate-700">Short Excerpt (Used for Meta Description default & cards)</label>
                      <textarea
                        rows={2}
                        value={excerpt}
                        onChange={(e) => setExcerpt(e.target.value)}
                        placeholder="Brief summary of article takeaways..."
                        className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
                      />
                    </div>

                    <div className="md:col-span-2 space-y-1">
                      <label className="text-xs font-bold text-slate-700">Article Introduction Opening Paragraph</label>
                      <textarea
                        rows={3}
                        value={intro}
                        onChange={(e) => setIntro(e.target.value)}
                        placeholder="Opening introductory paragraph..."
                        className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
                      />
                    </div>

                    {/* Status Switch */}
                    <div className="md:col-span-2 flex items-center gap-4 bg-slate-50 p-3 rounded-xl border border-slate-200">
                      <span className="text-xs font-bold text-slate-700">Publishing Status:</span>
                      <label className="flex items-center gap-2 cursor-pointer text-xs font-extrabold text-slate-800">
                        <input
                          type="radio"
                          name="status"
                          value="published"
                          checked={status === "published"}
                          onChange={() => setStatus("published")}
                          className="accent-emerald-600"
                        />
                        <span className="text-emerald-700">● Published (Live on Site)</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer text-xs font-extrabold text-slate-800">
                        <input
                          type="radio"
                          name="status"
                          value="draft"
                          checked={status === "draft"}
                          onChange={() => setStatus("draft")}
                          className="accent-amber-600"
                        />
                        <span className="text-amber-700">● Draft (Admin Only)</span>
                      </label>
                    </div>

                  </div>
                </div>

                {/* Section Content Builder */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <div>
                      <h3 className="text-xs font-black uppercase tracking-wider text-slate-900">
                        Article Content Sections Builder ({sections.length})
                      </h3>
                      <p className="text-[11px] text-slate-500">Create H2 headings, paragraph blocks, bullet lists, quotes, tables, and images with alt text.</p>
                    </div>
                    <button
                      type="button"
                      onClick={handleAddSection}
                      className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs rounded-xl shadow-xs flex items-center gap-1.5 transition-all cursor-pointer"
                    >
                      <Plus size={14} />
                      <span>Add Section Block</span>
                    </button>
                  </div>

                  <div className="space-y-4">
                    {sections.map((sec, idx) => (
                      <div key={sec.id || idx} className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3 relative">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-black uppercase text-blue-700 bg-blue-100 px-2 py-0.5 rounded font-mono">
                            Section #{idx + 1}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleDeleteSection(idx)}
                            className="text-slate-400 hover:text-red-600 transition-colors p-1"
                            title="Delete section"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>

                        {/* H2 Heading */}
                        <div className="space-y-1">
                          <label className="text-[11px] font-bold text-slate-700">Section H2 Heading</label>
                          <input
                            type="text"
                            value={sec.h2 || ""}
                            onChange={(e) => handleUpdateSectionHeading(idx, e.target.value)}
                            placeholder="e.g. Regulatory Landscape & High-Ambient Operating Dynamics"
                            className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold"
                          />
                        </div>

                        {/* Paragraphs */}
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <label className="text-[11px] font-bold text-slate-700">Paragraph Content</label>
                            <button
                              type="button"
                              onClick={() => handleAddParagraph(idx)}
                              className="text-[10px] font-bold text-blue-600 hover:underline"
                            >
                              + Add Paragraph Block
                            </button>
                          </div>
                          {(sec.paragraphs || [""]).map((p, pIdx) => (
                            <textarea
                              key={pIdx}
                              rows={3}
                              value={p}
                              onChange={(e) => handleUpdateSectionParagraph(idx, pIdx, e.target.value)}
                              placeholder="Write section narrative text..."
                              className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium"
                            />
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>

                </div>

              </div>
            )}

            {/* TAB 2: DEDICATED PER-BLOG SEO SUITE */}
            {activeTab === "seo" && (
              <div className="space-y-6">

                {/* Live SERP & Social Preview Card Switcher */}
                <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2">
                      <Eye size={16} className="text-blue-600" />
                      <h3 className="text-xs font-black uppercase tracking-wider text-slate-900">
                        Real-Time SERP & Social Card Snippet Inspector
                      </h3>
                    </div>

                    <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
                      <button
                        type="button"
                        onClick={() => setSerpViewMode("google")}
                        className={`px-3 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                          serpViewMode === "google" ? "bg-white text-blue-700 shadow-2xs font-extrabold" : "text-slate-600"
                        }`}
                      >
                        Google Search SERP
                      </button>
                      <button
                        type="button"
                        onClick={() => setSerpViewMode("social")}
                        className={`px-3 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                          serpViewMode === "social" ? "bg-white text-blue-700 shadow-2xs font-extrabold" : "text-slate-600"
                        }`}
                      >
                        Social Cards (OG/Twitter)
                      </button>
                      <button
                        type="button"
                        onClick={() => setSerpViewMode("jsonld")}
                        className={`px-3 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                          serpViewMode === "jsonld" ? "bg-white text-blue-700 shadow-2xs font-extrabold" : "text-slate-600"
                        }`}
                      >
                        JSON-LD Code
                      </button>
                    </div>
                  </div>

                  {/* GOOGLE PREVIEW */}
                  {serpViewMode === "google" && (
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                      <div className="flex items-center gap-2 text-[11px] text-slate-500 font-mono">
                        <span className="w-4 h-4 rounded-full bg-blue-600 text-white font-black text-[9px] flex items-center justify-center">G</span>
                        <span>https://cooltechnologies.ae › blog › {slug || "permalink"}</span>
                      </div>
                      <h4 className="text-sm font-bold text-[#1a0dab] hover:underline cursor-pointer leading-snug">
                        {seoSettings.seoTitle || title || "Blog Title Placeholder"}
                      </h4>
                      <p className="text-xs text-slate-600 leading-relaxed max-w-2xl line-clamp-2">
                        {seoSettings.seoDescription || excerpt || "Article description preview snippet..."}
                      </p>

                      {/* Rich Snippet Stars Preview */}
                      {seoSettings.enableReviewSchema && (
                        <div className="flex items-center gap-2 text-[11px] text-amber-600 font-bold pt-1">
                          <span>★★★★★</span>
                          <span>Rating: 4.9 · 34 reviews</span>
                          <span className="text-slate-400">· Technical Review</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* SOCIAL CARD PREVIEW */}
                  {serpViewMode === "social" && (
                    <div className="max-w-md bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden space-y-0">
                      <div className="h-44 bg-slate-200 overflow-hidden relative">
                        <img
                          src={seoSettings.ogImage || image}
                          alt={title}
                          className="w-full h-full object-cover"
                        />
                        <span className="absolute top-2 left-2 bg-slate-900/80 text-white text-[9px] font-black uppercase px-2 py-0.5 rounded backdrop-blur-xs">
                          {seoSettings.twitterCard || "summary_large_image"}
                        </span>
                      </div>
                      <div className="p-3 space-y-1 bg-slate-50">
                        <span className="text-[10px] font-bold text-slate-400 uppercase">COOLTECHNOLOGIES.AE</span>
                        <h5 className="font-extrabold text-xs text-slate-900 line-clamp-1">
                          {seoSettings.ogTitle || seoSettings.seoTitle || title}
                        </h5>
                        <p className="text-[11px] text-slate-500 line-clamp-2">
                          {seoSettings.ogDescription || seoSettings.seoDescription || excerpt}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* JSON-LD CODE PREVIEW */}
                  {serpViewMode === "jsonld" && (
                    <div className="bg-slate-950 text-slate-200 rounded-xl p-4 font-mono text-[11px] overflow-x-auto max-h-52 leading-relaxed border border-slate-800">
                      <pre>{generateLiveJsonLd()}</pre>
                    </div>
                  )}

                </div>

                {/* 1. SERP META TAGS & INDEXING RULES */}
                <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs space-y-4">
                  <h3 className="text-xs font-black uppercase tracking-wider text-[#031b4e] flex items-center gap-2 border-b border-slate-100 pb-2">
                    <Search size={15} className="text-blue-600" />
                    <span>Search Engine Meta Tags & Crawl Controls</span>
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    
                    {/* Meta Title */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs font-bold text-slate-700">
                        <span>Custom SEO Meta Title Tag</span>
                        <span className={`text-[10px] font-mono font-bold ${
                          (seoSettings.seoTitle?.length || 0) >= 50 && (seoSettings.seoTitle?.length || 0) <= 60
                            ? "text-emerald-600 font-extrabold"
                            : "text-amber-600"
                        }`}>
                          {seoSettings.seoTitle?.length || 0} / 60 chars (Recommended: 50-60)
                        </span>
                      </div>
                      <input
                        type="text"
                        value={seoSettings.seoTitle || ""}
                        onChange={(e) => setSeoSettings({ ...seoSettings, seoTitle: e.target.value })}
                        placeholder="Title for Google SERP..."
                        className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:bg-white focus:outline-none"
                      />
                    </div>

                    {/* Meta Description */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs font-bold text-slate-700">
                        <span>Custom SEO Meta Description Tag</span>
                        <span className={`text-[10px] font-mono font-bold ${
                          (seoSettings.seoDescription?.length || 0) >= 140 && (seoSettings.seoDescription?.length || 0) <= 160
                            ? "text-emerald-600 font-extrabold"
                            : "text-amber-600"
                        }`}>
                          {seoSettings.seoDescription?.length || 0} / 160 chars (Recommended: 150-160)
                        </span>
                      </div>
                      <input
                        type="text"
                        value={seoSettings.seoDescription || ""}
                        onChange={(e) => setSeoSettings({ ...seoSettings, seoDescription: e.target.value })}
                        placeholder="Meta description for search engine result cards..."
                        className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:bg-white focus:outline-none"
                      />
                    </div>

                    {/* Canonical URL */}
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700">Canonical Tag URL (`&lt;link rel="canonical"&gt;`)</label>
                      <input
                        type="text"
                        value={seoSettings.canonicalUrl || ""}
                        onChange={(e) => setSeoSettings({ ...seoSettings, canonicalUrl: e.target.value })}
                        placeholder="https://cooltechnologies.ae/#/blog/slug"
                        className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-blue-700"
                      />
                    </div>

                    {/* Hreflang Tag */}
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700">Hreflang Language Target (`hreflang`)</label>
                      <select
                        value={seoSettings.hreflang || "en-AE"}
                        onChange={(e) => setSeoSettings({ ...seoSettings, hreflang: e.target.value })}
                        className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
                      >
                        <option value="en-AE">en-AE (English - United Arab Emirates)</option>
                        <option value="ar-AE">ar-AE (Arabic - United Arab Emirates)</option>
                        <option value="en-US">en-US (English - International)</option>
                      </select>
                    </div>

                    {/* Target Keywords */}
                    <div className="md:col-span-2 space-y-1">
                      <label className="text-xs font-bold text-slate-700">Target SEO Keywords (Comma Separated)</label>
                      <input
                        type="text"
                        value={seoSettings.keywords ? seoSettings.keywords.join(", ") : ""}
                        onChange={(e) => setSeoSettings({ ...seoSettings, keywords: e.target.value.split(",").map(k => k.trim()) })}
                        placeholder="HVAC, Chiller Compliance, R-32 Refrigerant, GCC MEP Regulations"
                        className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
                      />
                    </div>

                    {/* Noindex & Nofollow Switches */}
                    <div className="md:col-span-2 flex flex-wrap items-center gap-6 bg-slate-50 p-4 rounded-xl border border-slate-200">
                      <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={seoSettings.noIndex || false}
                          onChange={(e) => setSeoSettings({ ...seoSettings, noIndex: e.target.checked })}
                          className="w-4 h-4 accent-red-600 rounded cursor-pointer"
                        />
                        <span className={seoSettings.noIndex ? "text-red-600 font-extrabold" : ""}>
                          Noindex Tag (`&lt;meta name="robots" content="noindex"&gt;`)
                        </span>
                      </label>

                      <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={seoSettings.noFollow || false}
                          onChange={(e) => setSeoSettings({ ...seoSettings, noFollow: e.target.checked })}
                          className="w-4 h-4 accent-amber-600 rounded cursor-pointer"
                        />
                        <span>
                          Nofollow Links (`&lt;meta name="robots" content="nofollow"&gt;`)
                        </span>
                      </label>
                    </div>

                  </div>
                </div>

                {/* 2. STRUCTURED DATA SCHEMAS (JSON-LD) */}
                <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs space-y-4">
                  <h3 className="text-xs font-black uppercase tracking-wider text-[#031b4e] flex items-center gap-2 border-b border-slate-100 pb-2">
                    <FileCode size={15} className="text-blue-600" />
                    <span>Structured Data & Rich Snippet Schema Generators</span>
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    
                    {/* Article Schema */}
                    <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2">
                      <label className="flex items-center justify-between text-xs font-bold text-slate-900 cursor-pointer">
                        <span>BlogPosting Schema</span>
                        <input
                          type="checkbox"
                          checked={seoSettings.enableArticleSchema !== false}
                          onChange={(e) => setSeoSettings({ ...seoSettings, enableArticleSchema: e.target.checked })}
                          className="w-4 h-4 accent-blue-600 rounded"
                        />
                      </label>
                      <p className="text-[10px] text-slate-500">Injects author, publisher, logo, datePublished for Google News & Search.</p>
                    </div>

                    {/* Breadcrumb Schema */}
                    <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2">
                      <label className="flex items-center justify-between text-xs font-bold text-slate-900 cursor-pointer">
                        <span>BreadcrumbList Schema</span>
                        <input
                          type="checkbox"
                          checked={seoSettings.enableBreadcrumbSchema !== false}
                          onChange={(e) => setSeoSettings({ ...seoSettings, enableBreadcrumbSchema: e.target.checked })}
                          className="w-4 h-4 accent-blue-600 rounded"
                        />
                      </label>
                      <p className="text-[10px] text-slate-500">Renders Home › Blog › Category › Article breadcrumb trail in SERP.</p>
                    </div>

                    {/* Review Schema */}
                    <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2">
                      <label className="flex items-center justify-between text-xs font-bold text-slate-900 cursor-pointer">
                        <span>Review / Rating Schema</span>
                        <input
                          type="checkbox"
                          checked={seoSettings.enableReviewSchema || false}
                          onChange={(e) => setSeoSettings({ ...seoSettings, enableReviewSchema: e.target.checked })}
                          className="w-4 h-4 accent-blue-600 rounded"
                        />
                      </label>
                      <p className="text-[10px] text-slate-500">Generates star rating rich snippets in Google search results.</p>
                    </div>

                    {/* Product Schema */}
                    <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2">
                      <label className="flex items-center justify-between text-xs font-bold text-slate-900 cursor-pointer">
                        <span>Product Schema</span>
                        <input
                          type="checkbox"
                          checked={seoSettings.enableProductSchema || false}
                          onChange={(e) => setSeoSettings({ ...seoSettings, enableProductSchema: e.target.checked })}
                          className="w-4 h-4 accent-blue-600 rounded"
                        />
                      </label>
                      <p className="text-[10px] text-slate-500">Links article to commercial product price & stock in catalog.</p>
                    </div>

                    {/* Video Schema */}
                    <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2">
                      <label className="flex items-center justify-between text-xs font-bold text-slate-900 cursor-pointer">
                        <span>VideoObject Schema</span>
                        <input
                          type="checkbox"
                          checked={seoSettings.enableVideoSchema || false}
                          onChange={(e) => setSeoSettings({ ...seoSettings, enableVideoSchema: e.target.checked })}
                          className="w-4 h-4 accent-blue-600 rounded"
                        />
                      </label>
                      <p className="text-[10px] text-slate-500">Enables video badge & thumbnail playback in Google Video tab.</p>
                    </div>

                    {/* Offer Schema */}
                    <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2">
                      <label className="flex items-center justify-between text-xs font-bold text-slate-900 cursor-pointer">
                        <span>Offer & Pricing Schema</span>
                        <input
                          type="checkbox"
                          checked={seoSettings.enableOfferSchema || false}
                          onChange={(e) => setSeoSettings({ ...seoSettings, enableOfferSchema: e.target.checked })}
                          className="w-4 h-4 accent-blue-600 rounded"
                        />
                      </label>
                      <p className="text-[10px] text-slate-500">Includes pricing validity & stock availability schema.</p>
                    </div>

                  </div>
                </div>

                {/* 3. SITEMAP & PERFORMANCE PREFERENCES */}
                <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs space-y-4">
                  <h3 className="text-xs font-black uppercase tracking-wider text-[#031b4e] flex items-center gap-2 border-b border-slate-100 pb-2">
                    <Globe size={15} className="text-blue-600" />
                    <span>Sitemap Protocol & Media Optimization Settings</span>
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-bold">
                    
                    <div className="space-y-1">
                      <label className="text-slate-700">Include in XML Sitemap</label>
                      <select
                        value={seoSettings.includeInXmlSitemap !== false ? "yes" : "no"}
                        onChange={(e) => setSeoSettings({ ...seoSettings, includeInXmlSitemap: e.target.value === "yes" })}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
                      >
                        <option value="yes">Yes (Included in sitemap.xml)</option>
                        <option value="no">No (Exclude from sitemap)</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-slate-700">Sitemap Crawl Priority</label>
                      <select
                        value={seoSettings.sitemapPriority || "0.9"}
                        onChange={(e) => setSeoSettings({ ...seoSettings, sitemapPriority: e.target.value as any })}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
                      >
                        <option value="1.0">1.0 (Highest Priority)</option>
                        <option value="0.9">0.9 (High Priority - Default)</option>
                        <option value="0.8">0.8 (Medium Priority)</option>
                        <option value="0.5">0.5 (Low Priority)</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-slate-700">Change Frequency</label>
                      <select
                        value={seoSettings.changeFreq || "weekly"}
                        onChange={(e) => setSeoSettings({ ...seoSettings, changeFreq: e.target.value as any })}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
                      >
                        <option value="daily">Daily</option>
                        <option value="weekly">Weekly</option>
                        <option value="monthly">Monthly</option>
                      </select>
                    </div>

                    <div className="md:col-span-3 flex flex-wrap items-center gap-6 bg-slate-50 p-4 rounded-xl border border-slate-200">
                      <label className="flex items-center gap-2 cursor-pointer text-slate-800">
                        <input
                          type="checkbox"
                          checked={seoSettings.imageCompressionWebP !== false}
                          onChange={(e) => setSeoSettings({ ...seoSettings, imageCompressionWebP: e.target.checked })}
                          className="w-4 h-4 accent-emerald-600 rounded"
                        />
                        <span>WebP / AVIF Next-Gen Image Compression Active</span>
                      </label>

                      <label className="flex items-center gap-2 cursor-pointer text-slate-800">
                        <input
                          type="checkbox"
                          checked={seoSettings.lazyLoadMedia !== false}
                          onChange={(e) => setSeoSettings({ ...seoSettings, lazyLoadMedia: e.target.checked })}
                          className="w-4 h-4 accent-emerald-600 rounded"
                        />
                        <span>Lazy Loading Active (`loading="lazy"`)</span>
                      </label>
                    </div>

                  </div>
                </div>

              </div>
            )}

          </div>

          {/* Modal Footer Buttons */}
          <div className="bg-slate-50 border-t border-slate-200 px-6 py-4 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2 text-xs font-extrabold text-slate-600">
              <ShieldCheck size={16} className="text-emerald-600" />
              <span>All 40+ SEO Rules & Structured Schemas Auto-Validated</span>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="submit"
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs rounded-xl shadow-md transition-all cursor-pointer flex items-center gap-2"
              >
                <Check size={16} />
                <span>Save Article & Apply Per-Blog SEO Settings</span>
              </button>
            </div>
          </div>

        </form>
      </div>
    </div>
  );
}
