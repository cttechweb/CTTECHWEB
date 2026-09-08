import React, { useState, useEffect } from "react";
import {
  ArrowLeft, Check, FileText, Globe, Eye, Code2, Sparkles, AlertCircle, Copy, CheckCircle2, Type
} from "lucide-react";
import { BlogPost, BlogSeoSettings, ArticleSection } from "../../types";
import { generateDefaultBlogSeo, calculateBlogSeoScore } from "../../data/initialBlogs";

interface BlogPostEditorPageProps {
  editingBlog: BlogPost | null;
  onSave: (blog: BlogPost) => void;
  onCancel: () => void;
  products?: any[];
  services?: any[];
}

// Convert legacy sections array to HTML string if contentHtml isn't set
function convertSectionsToHtml(intro: string, sections?: ArticleSection[]): string {
  let html = "";
  if (intro) {
    html += `<p className="lead text-lg text-slate-700 leading-relaxed mb-6">${intro}</p>\n\n`;
  }
  if (sections && sections.length > 0) {
    sections.forEach(sec => {
      if (sec.h2) html += `<h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">${sec.h2}</h2>\n`;
      if (sec.h3) html += `<h3 className="text-xl font-semibold text-slate-900 mt-6 mb-3">${sec.h3}</h3>\n`;
      if (sec.paragraphs) {
        sec.paragraphs.forEach(p => {
          html += `<p className="text-slate-700 leading-relaxed mb-4">${p}</p>\n`;
        });
      }
      if (sec.bulletList) {
        html += `<ul className="list-disc list-inside space-y-2 mb-6 text-slate-700">\n`;
        sec.bulletList.forEach(item => {
          html += `  <li>${item}</li>\n`;
        });
        html += `</ul>\n`;
      }
      if (sec.quote) {
        html += `<blockquote className="border-l-4 border-blue-600 pl-4 py-2 my-6 text-slate-700 italic bg-blue-50/50 rounded-r-lg">\n  <p>${sec.quote.text}</p>\n`;
        if (sec.quote.source) html += `  <cite className="block text-xs font-bold text-slate-500 mt-1">— ${sec.quote.source}</cite>\n`;
        html += `</blockquote>\n`;
      }
    });
  }
  return html;
}

export default function BlogPostEditorPage({
  editingBlog,
  onSave,
  onCancel
}: BlogPostEditorPageProps) {
  const [activeTab, setActiveTab] = useState<"content" | "seo">("content");
  const [editorMode, setEditorMode] = useState<"write" | "html" | "preview">("write");

  // Primary Article Fields
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
  const [status, setStatus] = useState<"published" | "draft">("published");

  // Direct HTML & CSS Content State
  const [contentHtml, setContentHtml] = useState("");

  // Simplified Essential SEO Fields
  const [seoTitle, setSeoTitle] = useState("");
  const [seoDescription, setSeoDescription] = useState("");
  const [focusKeyword, setFocusKeyword] = useState("");
  const [canonicalUrl, setCanonicalUrl] = useState("");
  const [noIndex, setNoIndex] = useState(false);

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
      setStatus(editingBlog.status || "published");

      // Content HTML initialization
      const initialHtml = editingBlog.contentHtml || convertSectionsToHtml(editingBlog.intro || "", editingBlog.sections);
      setContentHtml(initialHtml);

      // SEO initialization
      const seo = editingBlog.seoSettings || generateDefaultBlogSeo(
        editingBlog.title || "",
        editingBlog.slug || "",
        editingBlog.excerpt || "",
        editingBlog.category || "HVAC",
        editingBlog.image || ""
      );

      setSeoTitle(seo.seoTitle || editingBlog.title || "");
      setSeoDescription(seo.seoDescription || editingBlog.excerpt || "");
      setFocusKeyword(seo.keywords && seo.keywords.length > 0 ? seo.keywords[0] : "HVAC UAE");
      setCanonicalUrl(seo.canonicalUrl || `https://cooltechnologies.ae/#/blog/${editingBlog.slug}`);
      setNoIndex(seo.noIndex || false);
    } else {
      const defaultTitle = "Commercial HVAC System Installation & Energy Audit Briefing";
      const defaultSlug = "commercial-hvac-system-installation-energy-audit-briefing";
      const defaultExcerpt = "Comprehensive engineering guidelines for optimizing commercial chillers, VRF systems, and indoor thermal efficiency across GCC developments.";
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
      setStatus("published");

      setContentHtml(
        `<p class="lead text-lg text-slate-700 leading-relaxed mb-6">In response to high ambient cooling demands across UAE commercial infrastructure, plant operators must implement high-efficiency MEP standards.</p>\n\n<h2 class="text-2xl font-bold text-slate-900 mt-8 mb-4">1. Thermal Load Calculation & VRF Integration</h2>\n<p class="text-slate-700 leading-relaxed mb-4">Modern commercial developments require precise heat gain assessment incorporating solar radiation coefficients, occupancy load density, and fresh air intake requirements.</p>\n\n<ul class="list-disc list-inside space-y-2 mb-6 text-slate-700">\n  <li>Variable Refrigerant Flow (VRF) displacement control</li>\n  <li>Low-GWP refrigerant R-32 eco-compatibility</li>\n  <li>BMS Integration via BACnet / Modbus protocol</li>\n</ul>\n\n<h2 class="text-2xl font-bold text-slate-900 mt-8 mb-4">2. Preventive Maintenance Directives</h2>\n<p class="text-slate-700 leading-relaxed mb-4">Routine condenser coil cleaning and compressor vibration analysis prevent sudden thermal efficiency loss during peak summer months.</p>`
      );

      setSeoTitle(`${defaultTitle} | Cool Technologies UAE`);
      setSeoDescription(defaultExcerpt);
      setFocusKeyword("Commercial HVAC UAE");
      setCanonicalUrl(`https://cooltechnologies.ae/#/blog/${defaultSlug}`);
      setNoIndex(false);
    }
  }, [editingBlog]);

  // Auto-generate slug from title
  const handleGenerateSlug = () => {
    const generated = title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .trim()
      .replace(/\s+/g, "-");
    setSlug(generated);
    setCanonicalUrl(`https://cooltechnologies.ae/#/blog/${generated}`);
  };

  // Helper to insert quick HTML tag snippets
  const insertHtmlSnippet = (tagType: string) => {
    let snippet = "";
    switch (tagType) {
      case "h2":
        snippet = `\n<h2 class="text-2xl font-bold text-slate-900 mt-8 mb-4">New Subheading Here</h2>\n`;
        break;
      case "h3":
        snippet = `\n<h3 class="text-xl font-semibold text-slate-900 mt-6 mb-3">Subsection Heading</h3>\n`;
        break;
      case "p":
        snippet = `\n<p class="text-slate-700 leading-relaxed mb-4">Write your paragraph content here...</p>\n`;
        break;
      case "ul":
        snippet = `\n<ul class="list-disc list-inside space-y-2 mb-6 text-slate-700">\n  <li>Feature specification point 1</li>\n  <li>Feature specification point 2</li>\n</ul>\n`;
        break;
      case "quote":
        snippet = `\n<blockquote class="border-l-4 border-blue-600 pl-4 py-2 my-6 text-slate-700 italic bg-blue-50/50 rounded-r-lg">\n  <p>"Technical citation or engineering quote."</p>\n  <cite class="block text-xs font-bold text-slate-500 mt-1">— Engineering Standards 2026</cite>\n</blockquote>\n`;
        break;
      case "img":
        snippet = `\n<figure class="my-6">\n  <img src="https://images.unsplash.com/photo-1581094288338-2314dddb7ece?auto=format&fit=crop&w=1200&q=80" alt="HVAC Equipment" class="w-full h-auto rounded-xl shadow-xs" />\n  <figcaption class="text-center text-xs text-slate-500 mt-2 font-medium">Commercial Chiller Unit Installation</figcaption>\n</figure>\n`;
        break;
      default:
        break;
    }
    setContentHtml((prev) => prev + snippet);
  };

  // Calculate live simplified SEO score
  const currentSeoScore = (() => {
    let score = 70;
    if (seoTitle.length >= 45 && seoTitle.length <= 65) score += 10;
    if (seoDescription.length >= 120 && seoDescription.length <= 165) score += 10;
    if (focusKeyword.trim().length > 0) score += 5;
    if (slug.trim().length > 0) score += 5;
    return Math.min(score, 100);
  })();

  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();

    // Automatically construct complete production SEO settings behind the scenes
    const fullSeoSettings: BlogSeoSettings = {
      seoTitle: seoTitle || title,
      seoDescription: seoDescription || excerpt,
      keywords: focusKeyword ? [focusKeyword, "HVAC", category] : ["HVAC", category],
      canonicalUrl: canonicalUrl || `https://cooltechnologies.ae/#/blog/${slug}`,
      noIndex: noIndex,
      noFollow: false,
      hreflang: "en-AE",
      ogTitle: seoTitle || title,
      ogDescription: seoDescription || excerpt,
      ogImage: image,
      twitterCard: "summary_large_image",
      enableArticleSchema: true,
      enableBreadcrumbSchema: true,
      includeInXmlSitemap: !noIndex,
      sitemapPriority: "0.9",
      changeFreq: "weekly",
      imageCompressionWebP: true,
      lazyLoadMedia: true
    };

    const finalBlog: BlogPost = {
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
      intro: "",
      status,
      contentHtml, // Direct HTML/CSS body content
      sections: [], // Clear legacy sections
      seoSettings: fullSeoSettings,
      seoScore: currentSeoScore
    };

    onSave(finalBlog);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-white font-sans text-slate-800 antialiased overflow-hidden">
      
      {/* Clean Flat Header Bar */}
      <div className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={onCancel}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 rounded-lg transition-colors cursor-pointer flex items-center gap-2 text-xs font-bold"
          >
            <ArrowLeft size={16} />
            <span>Back to Articles</span>
          </button>

          <div className="h-5 w-[1px] bg-slate-200" />

          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-extrabold text-base text-slate-900">
                {editingBlog ? `Edit: ${editingBlog.title}` : "Create New Article"}
              </h1>
              <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${
                status === "published" ? "bg-emerald-100 text-emerald-800 border border-emerald-200" : "bg-amber-100 text-amber-800 border border-amber-200"
              }`}>
                {status}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Live SEO Score */}
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg">
            <span>SEO Score:</span>
            <span className="font-mono text-emerald-600 font-black">{currentSeoScore}/100</span>
          </div>

          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg border border-slate-200 cursor-pointer"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleSaveForm}
            className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-lg shadow-xs cursor-pointer flex items-center gap-2"
          >
            <Check size={16} />
            <span>Save & Publish Article</span>
          </button>
        </div>
      </div>

      {/* Sub Navigation Bar - Clean Tabs */}
      <div className="bg-slate-50 border-b border-slate-200 px-6 py-2 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTab("content")}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === "content"
                ? "bg-white text-blue-700 border border-slate-200 shadow-2xs"
                : "text-slate-600 hover:bg-slate-200/50"
            }`}
          >
            Article Content & Writing
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("seo")}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === "seo"
                ? "bg-white text-blue-700 border border-slate-200 shadow-2xs"
                : "text-slate-600 hover:bg-slate-200/50"
            }`}
          >
            Essential SEO Settings
          </button>
        </div>

        <div className="text-xs text-slate-500 font-mono">
          Permalink: <span className="text-blue-700 font-bold">/blog/{slug || "..."}</span>
        </div>
      </div>

      {/* Main Full-Width Form Workspace */}
      <form onSubmit={handleSaveForm} className="flex-1 flex flex-col min-h-0 overflow-hidden">
        <div className="flex-1 overflow-y-auto p-8">
          
          {/* TAB 1: ARTICLE CONTENT & HTML WRITING */}
          {activeTab === "content" && (
            <div className="w-full space-y-6">
              
              {/* Basic Article Fields - Clean Grid without Boxy Cards */}
              <div className="border-b border-slate-200 pb-6 space-y-4">
                <h3 className="text-xs font-extrabold uppercase text-slate-400 tracking-wider">
                  1. Article Details & Metadata
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  
                  {/* Title */}
                  <div className="md:col-span-2 space-y-1">
                    <label className="text-xs font-bold text-slate-700">Article Title *</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        required
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Enter descriptive article title..."
                        className="flex-1 px-3.5 py-2 bg-white border border-slate-300 rounded-lg text-sm font-bold text-slate-900 focus:outline-none focus:border-blue-600"
                      />
                      <button
                        type="button"
                        onClick={handleGenerateSlug}
                        className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg border border-slate-300 shrink-0 cursor-pointer"
                      >
                        Auto Slug
                      </button>
                    </div>
                  </div>

                  {/* Category */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Category *</label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-lg text-xs font-bold text-slate-800 focus:outline-none"
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

                  {/* Slug */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">URL Slug *</label>
                    <input
                      type="text"
                      required
                      value={slug}
                      onChange={(e) => setSlug(e.target.value)}
                      placeholder="article-url-slug"
                      className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-lg text-xs font-mono font-bold text-blue-700"
                    />
                  </div>

                  {/* Author */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Author Name</label>
                    <input
                      type="text"
                      value={author}
                      onChange={(e) => setAuthor(e.target.value)}
                      placeholder="Eng. Tareq Al-Mansoori"
                      className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-lg text-xs font-medium"
                    />
                  </div>

                  {/* Author Role */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Author Designation</label>
                    <input
                      type="text"
                      value={authorRole}
                      onChange={(e) => setAuthorRole(e.target.value)}
                      placeholder="Senior MEP Specialist"
                      className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-lg text-xs font-medium"
                    />
                  </div>

                  {/* Date */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Publish Date</label>
                    <input
                      type="text"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      placeholder="August 15, 2026"
                      className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-lg text-xs font-medium"
                    />
                  </div>

                  {/* Read Time */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Read Time</label>
                    <input
                      type="text"
                      value={readTime}
                      onChange={(e) => setReadTime(e.target.value)}
                      placeholder="5 min read"
                      className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-lg text-xs font-medium"
                    />
                  </div>

                  {/* Status */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Status</label>
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value as any)}
                      className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-lg text-xs font-bold"
                    >
                      <option value="published">Published (Live on Site)</option>
                      <option value="draft">Draft (Private)</option>
                    </select>
                  </div>

                  {/* Cover Image */}
                  <div className="md:col-span-2 space-y-1">
                    <label className="text-xs font-bold text-slate-700">Cover Image URL *</label>
                    <input
                      type="text"
                      required
                      value={image}
                      onChange={(e) => setImage(e.target.value)}
                      placeholder="https://..."
                      className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-lg text-xs font-mono"
                    />
                  </div>

                  {/* Video URL */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700">Video Embed URL (Optional)</label>
                    <input
                      type="text"
                      value={videoUrl}
                      onChange={(e) => setVideoUrl(e.target.value)}
                      placeholder="https://youtube.com/..."
                      className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-lg text-xs font-mono"
                    />
                  </div>

                  {/* Excerpt */}
                  <div className="md:col-span-3 space-y-1">
                    <label className="text-xs font-bold text-slate-700">Short Excerpt / Summary</label>
                    <textarea
                      rows={2}
                      value={excerpt}
                      onChange={(e) => setExcerpt(e.target.value)}
                      placeholder="Short summary displayed on blog cards and search results..."
                      className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-lg text-xs font-medium"
                    />
                  </div>

                </div>
              </div>

              {/* Direct HTML / CSS Blog Content Area */}
              <div className="space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-3">
                  <div>
                    <h3 className="text-xs font-extrabold uppercase text-slate-400 tracking-wider">
                      2. Blog Body Content (HTML & Direct Writing)
                    </h3>
                    <p className="text-xs text-slate-500">Paste your custom HTML/CSS code or write directly using the format shortcuts below.</p>
                  </div>

                  {/* Mode Toggles */}
                  <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200">
                    <button
                      type="button"
                      onClick={() => setEditorMode("write")}
                      className={`px-3 py-1 rounded text-xs font-bold flex items-center gap-1 transition-all cursor-pointer ${
                        editorMode === "write" ? "bg-white text-blue-700 shadow-2xs font-extrabold" : "text-slate-600"
                      }`}
                    >
                      <Type size={13} />
                      <span>Write / Edit</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditorMode("html")}
                      className={`px-3 py-1 rounded text-xs font-bold flex items-center gap-1 transition-all cursor-pointer ${
                        editorMode === "html" ? "bg-white text-blue-700 shadow-2xs font-extrabold" : "text-slate-600"
                      }`}
                    >
                      <Code2 size={13} />
                      <span>Raw HTML / CSS</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditorMode("preview")}
                      className={`px-3 py-1 rounded text-xs font-bold flex items-center gap-1 transition-all cursor-pointer ${
                        editorMode === "preview" ? "bg-white text-blue-700 shadow-2xs font-extrabold" : "text-slate-600"
                      }`}
                    >
                      <Eye size={13} />
                      <span>Visual Preview</span>
                    </button>
                  </div>
                </div>

                {/* Quick Tag Insert Toolbar */}
                {editorMode !== "preview" && (
                  <div className="flex flex-wrap items-center gap-2 bg-slate-50 p-2 rounded-lg border border-slate-200">
                    <span className="text-[11px] font-bold text-slate-500 uppercase px-1">Quick Tags:</span>
                    <button
                      type="button"
                      onClick={() => insertHtmlSnippet("h2")}
                      className="px-2.5 py-1 bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold rounded border border-slate-300 cursor-pointer"
                    >
                      + H2 Heading
                    </button>
                    <button
                      type="button"
                      onClick={() => insertHtmlSnippet("h3")}
                      className="px-2.5 py-1 bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold rounded border border-slate-300 cursor-pointer"
                    >
                      + H3 Heading
                    </button>
                    <button
                      type="button"
                      onClick={() => insertHtmlSnippet("p")}
                      className="px-2.5 py-1 bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold rounded border border-slate-300 cursor-pointer"
                    >
                      + Paragraph
                    </button>
                    <button
                      type="button"
                      onClick={() => insertHtmlSnippet("ul")}
                      className="px-2.5 py-1 bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold rounded border border-slate-300 cursor-pointer"
                    >
                      + Bullet List
                    </button>
                    <button
                      type="button"
                      onClick={() => insertHtmlSnippet("quote")}
                      className="px-2.5 py-1 bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold rounded border border-slate-300 cursor-pointer"
                    >
                      + Quote Block
                    </button>
                    <button
                      type="button"
                      onClick={() => insertHtmlSnippet("img")}
                      className="px-2.5 py-1 bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold rounded border border-slate-300 cursor-pointer"
                    >
                      + Image Figure
                    </button>
                  </div>
                )}

                {/* Editor Textarea vs Visual Preview */}
                {editorMode !== "preview" ? (
                  <textarea
                    rows={16}
                    value={contentHtml}
                    onChange={(e) => setContentHtml(e.target.value)}
                    placeholder="Write article HTML content here or paste raw HTML code..."
                    className={`w-full p-4 border border-slate-300 rounded-lg text-xs leading-relaxed focus:outline-none focus:border-blue-600 ${
                      editorMode === "html" ? "font-mono bg-slate-950 text-slate-200" : "font-sans bg-white text-slate-900"
                    }`}
                  />
                ) : (
                  <div className="w-full p-6 border border-slate-200 rounded-lg bg-white min-h-[300px] prose max-w-none">
                    <div dangerouslySetInnerHTML={{ __html: contentHtml }} />
                  </div>
                )}

              </div>

            </div>
          )}

          {/* TAB 2: ESSENTIAL SEO SETTINGS ONLY */}
          {activeTab === "seo" && (
            <div className="w-full space-y-6">
              
              {/* Google SERP Live Preview Card */}
              <div className="border-b border-slate-200 pb-6 space-y-3">
                <h3 className="text-xs font-extrabold uppercase text-slate-400 tracking-wider">
                  Google Search Snippet Preview
                </h3>

                <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 space-y-1.5 max-w-3xl">
                  <div className="text-xs text-slate-500 font-mono">
                    https://cooltechnologies.ae › blog › {slug || "url-slug"}
                  </div>
                  <h4 className="text-base font-bold text-[#1a0dab] line-clamp-1">
                    {seoTitle || title || "Article Title Placeholder"}
                  </h4>
                  <p className="text-xs text-slate-600 line-clamp-2">
                    {seoDescription || excerpt || "Article meta description snippet..."}
                  </p>
                </div>
              </div>

              {/* Essential Required Fields */}
              <div className="space-y-4 max-w-3xl">
                <h3 className="text-xs font-extrabold uppercase text-slate-400 tracking-wider">
                  Essential SEO Metadata
                </h3>

                {/* SEO Title */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-bold text-slate-700">
                    <span>SEO Meta Title Tag</span>
                    <span className={`font-mono text-[11px] ${seoTitle.length >= 45 && seoTitle.length <= 65 ? "text-emerald-600 font-bold" : "text-slate-500"}`}>
                      {seoTitle.length} / 60 chars
                    </span>
                  </div>
                  <input
                    type="text"
                    value={seoTitle}
                    onChange={(e) => setSeoTitle(e.target.value)}
                    placeholder="Custom SEO Title Tag..."
                    className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-lg text-xs font-bold text-slate-900"
                  />
                </div>

                {/* Meta Description */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-bold text-slate-700">
                    <span>SEO Meta Description Tag</span>
                    <span className={`font-mono text-[11px] ${seoDescription.length >= 120 && seoDescription.length <= 165 ? "text-emerald-600 font-bold" : "text-slate-500"}`}>
                      {seoDescription.length} / 160 chars
                    </span>
                  </div>
                  <textarea
                    rows={3}
                    value={seoDescription}
                    onChange={(e) => setSeoDescription(e.target.value)}
                    placeholder="Custom SEO Meta Description Tag..."
                    className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-lg text-xs font-medium text-slate-800"
                  />
                </div>

                {/* Focus Keyword */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Focus Target Keyword</label>
                  <input
                    type="text"
                    value={focusKeyword}
                    onChange={(e) => setFocusKeyword(e.target.value)}
                    placeholder="e.g. Commercial HVAC UAE"
                    className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-lg text-xs font-bold"
                  />
                </div>

                {/* Canonical URL */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Canonical Tag URL</label>
                  <input
                    type="text"
                    value={canonicalUrl}
                    onChange={(e) => setCanonicalUrl(e.target.value)}
                    placeholder="https://cooltechnologies.ae/#/blog/slug"
                    className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-lg text-xs font-mono text-blue-700"
                  />
                </div>

                {/* Hide from Google Checkbox */}
                <div className="pt-2">
                  <label className="flex items-center gap-2.5 text-xs font-bold text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={noIndex}
                      onChange={(e) => setNoIndex(e.target.checked)}
                      className="w-4 h-4 accent-red-600 rounded cursor-pointer"
                    />
                    <span className={noIndex ? "text-red-600 font-extrabold" : ""}>
                      Hide this article from search engines (`noindex`)
                    </span>
                  </label>
                </div>

                {/* Automated Info Callout */}
                <div className="bg-slate-50 border border-slate-200 p-4 rounded-lg text-xs text-slate-600 space-y-1 pt-3 mt-4">
                  <p className="font-bold text-slate-800">⚡ Automated Background SEO Features:</p>
                  <p>✓ Schema.org Article & BreadcrumbList JSON-LD are generated automatically.</p>
                  <p>✓ XML Sitemaps, OpenGraph image tags, and Twitter Cards are injected automatically.</p>
                  <p>✓ WebP image compression and lazy loading are enabled automatically on public view.</p>
                </div>

              </div>

            </div>
          )}

        </div>
      </form>
    </div>
  );
}
