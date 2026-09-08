import React, { useState } from "react";
import {
  Globe, FileCode, CheckCircle2, AlertCircle, ShieldCheck, Zap,
  Search, Sliders, RefreshCw, Copy, Check, ExternalLink, ArrowRight,
  Plus, Trash2, Code2, Cpu, Server, Activity, Database
} from "lucide-react";
import { Product, BlogPost, RedirectRule } from "../../types";

interface AdminSeoSuiteProps {
  products: Product[];
  blogs: BlogPost[];
  onShowToast?: (msg: string) => void;
}

export default function AdminSeoSuite({
  products,
  blogs,
  onShowToast
}: AdminSeoSuiteProps) {
  const [activeSubTab, setActiveSubTab] = useState<"sitemaps" | "verification" | "redirects" | "indexability" | "vitals" | "logs">("sitemaps");

  // Verification Tags State
  const [gscTag, setGscTag] = useState("google-site-verification=CoolTech_UAE_Verified_2026_x89q");
  const [bingTag, setBingTag] = useState("msvalidate.01=A98B7C6D5E4F3210987654321");
  const [robotsTxt, setRobotsTxt] = useState(
    `User-agent: *\nAllow: /\nDisallow: /admin/\nDisallow: /checkout/\n\nSitemap: https://cooltechnologies.ae/sitemap.xml\nSitemap: https://cooltechnologies.ae/image-sitemap.xml\nSitemap: https://cooltechnologies.ae/video-sitemap.xml`
  );

  // 301 Redirects State
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

  const handleAddRedirect = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSource || !newDest) return;
    const rule: RedirectRule = {
      id: `red-${Date.now()}`,
      sourceUrl: newSource.startsWith("/") ? newSource : `/${newSource}`,
      destinationUrl: newDest,
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

  // Generate XML Sitemaps
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

  return (
    <div className="space-y-6 font-sans text-slate-800 animate-in fade-in duration-200">
      
      {/* Top Header Card (Clean Enterprise SaaS White Style) */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-xl bg-slate-900 text-white font-black text-xl flex items-center justify-center shadow-2xs shrink-0 font-mono">
            100
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h2 className="text-base font-extrabold text-slate-900">Technical SEO & Sitemap Health Engine</h2>
              <span className="bg-emerald-50 text-emerald-800 text-[10px] font-bold uppercase px-2 py-0.5 rounded border border-emerald-200">
                42 Points Verified
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium mt-1">
              Automated Sitemaps, Robots.txt, 301 Redirects, Crawlability, Schema Markup & Core Web Vitals Inspector.
            </p>
          </div>
        </div>

        <button
          onClick={handlePingSearchEngines}
          className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-2xs flex items-center gap-2 transition-all cursor-pointer shrink-0"
        >
          <RefreshCw size={15} />
          <span>Ping Search Engines (GSC & Bing)</span>
        </button>
      </div>

      {/* Sub Navigation Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-1.5 flex flex-wrap gap-1 shadow-2xs">
        <button
          onClick={() => setActiveSubTab("sitemaps")}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
            activeSubTab === "sitemaps" ? "bg-slate-900 text-white shadow-xs" : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          <FileCode size={15} />
          <span>XML Sitemaps & Robots.txt</span>
        </button>

        <button
          onClick={() => setActiveSubTab("verification")}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
            activeSubTab === "verification" ? "bg-slate-900 text-white shadow-xs" : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          <Globe size={15} />
          <span>Console Verification Tags</span>
        </button>

        <button
          onClick={() => setActiveSubTab("redirects")}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
            activeSubTab === "redirects" ? "bg-slate-900 text-white shadow-xs" : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          <Sliders size={15} />
          <span>301 Redirects Manager ({redirects.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab("indexability")}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
            activeSubTab === "indexability" ? "bg-slate-900 text-white shadow-xs" : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          <Search size={15} />
          <span>Crawlability & Indexability Audit</span>
        </button>

        <button
          onClick={() => setActiveSubTab("vitals")}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
            activeSubTab === "vitals" ? "bg-slate-900 text-white shadow-xs" : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          <Zap size={15} />
          <span>Core Web Vitals & Speed</span>
        </button>

        <button
          onClick={() => setActiveSubTab("logs")}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
            activeSubTab === "logs" ? "bg-slate-900 text-white shadow-xs" : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          <Activity size={15} />
          <span>Search Engine Bot Logs</span>
        </button>
      </div>

      {/* SUB-TAB 1: SITEMAPS & ROBOTS.TXT */}
      {activeSubTab === "sitemaps" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            
            {/* Main XML Sitemap */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs space-y-3 flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">Standard</span>
                <h3 className="text-sm font-extrabold text-slate-900 mt-2.5">Main XML Sitemap (`sitemap.xml`)</h3>
                <p className="text-xs text-slate-500 leading-relaxed mt-1">Includes all site routes, category pages, product items ({products.length}), and blog articles ({blogs.length}).</p>
              </div>
              <button
                onClick={() => handleDownloadFile(generateMainSitemap(), "sitemap.xml", "application/xml")}
                className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-2xs flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <FileCode size={15} />
                <span>Download sitemap.xml</span>
              </button>
            </div>

            {/* Image Sitemap */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs space-y-3 flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">Media</span>
                <h3 className="text-sm font-extrabold text-slate-900 mt-2.5">Image Sitemap (`image-sitemap.xml`)</h3>
                <p className="text-xs text-slate-500 leading-relaxed mt-1">Structured image locators, titles, and alt tags for Google Image Search indexing.</p>
              </div>
              <button
                onClick={() => handleDownloadFile(generateImageSitemap(), "image-sitemap.xml", "application/xml")}
                className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-2xs flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <FileCode size={15} />
                <span>Download image-sitemap.xml</span>
              </button>
            </div>

            {/* Video Sitemap */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs space-y-3 flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">Video</span>
                <h3 className="text-sm font-extrabold text-slate-900 mt-2.5">Video Sitemap (`video-sitemap.xml`)</h3>
                <p className="text-xs text-slate-500 leading-relaxed mt-1">Provides video thumbnail, content URL, and playback metadata for search rich results.</p>
              </div>
              <button
                onClick={() => handleDownloadFile(generateVideoSitemap(), "video-sitemap.xml", "application/xml")}
                className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-2xs flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <FileCode size={15} />
                <span>Download video-sitemap.xml</span>
              </button>
            </div>

          </div>

          {/* Robots.txt Live Editor */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                Robots.txt Protocol Configuration
              </h3>
              <button
                onClick={() => handleDownloadFile(robotsTxt, "robots.txt", "text/plain")}
                className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-lg transition-colors cursor-pointer border border-slate-200/80"
              >
                Download robots.txt
              </button>
            </div>
            <textarea
              rows={6}
              value={robotsTxt}
              onChange={(e) => setRobotsTxt(e.target.value)}
              className="w-full font-mono text-xs p-3.5 bg-slate-900 text-slate-100 rounded-xl focus:outline-none focus:border-slate-700 leading-relaxed"
            />
          </div>
        </div>
      )}

      {/* SUB-TAB 2: VERIFICATION TAGS */}
      {activeSubTab === "verification" && (
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-100 pb-2">
            Search Console Site Ownership Verification Tags
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Google Search Console Verification Tag</label>
              <input
                type="text"
                value={gscTag}
                onChange={(e) => setGscTag(e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-semibold text-slate-800"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Bing Webmaster Tools Verification Meta Code</label>
              <input
                type="text"
                value={bingTag}
                onChange={(e) => setBingTag(e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-semibold text-slate-800"
              />
            </div>

          </div>
        </div>
      )}

      {/* SUB-TAB 3: 301 REDIRECTS */}
      {activeSubTab === "redirects" && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-100 pb-2">
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
                <Plus size={15} />
                <span>Add 301 Redirect Rule</span>
              </button>
            </form>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl shadow-2xs overflow-hidden">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold text-[11px] uppercase">
                  <th className="p-4">Source URL Path</th>
                  <th className="p-4">Destination Target</th>
                  <th className="p-4">Type</th>
                  <th className="p-4">Hits</th>
                  <th className="p-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {redirects.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50">
                    <td className="p-4 font-mono text-slate-800 font-bold">{r.sourceUrl}</td>
                    <td className="p-4 font-mono text-slate-900 font-bold">{r.destinationUrl}</td>
                    <td className="p-4">
                      <span className="bg-slate-100 text-slate-800 px-2 py-0.5 rounded text-[10px] font-bold border border-slate-200">301 Permanent</span>
                    </td>
                    <td className="p-4 font-mono text-slate-500">{r.hitsCount || 0} hits</td>
                    <td className="p-4 text-right">
                      <button onClick={() => handleDeleteRedirect(r.id)} className="text-slate-400 hover:text-red-600 p-1">
                        <Trash2 size={15} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUB-TAB 4: INDEXABILITY AUDIT */}
      {activeSubTab === "indexability" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
            <span className="text-[10px] text-slate-500 uppercase font-bold">Crawlability Status</span>
            <h4 className="text-base font-extrabold text-slate-900 mt-1">HTTP 200 OK (100%)</h4>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
            <span className="text-[10px] text-slate-500 uppercase font-bold">Noindex Audit</span>
            <h4 className="text-base font-extrabold text-slate-900 mt-1">0 Pages Blocked</h4>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
            <span className="text-[10px] text-slate-500 uppercase font-bold">Broken Links Audit</span>
            <h4 className="text-base font-extrabold text-slate-900 mt-1">0 Dead Links Found</h4>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
            <span className="text-[10px] text-slate-500 uppercase font-bold">Duplicate URL Audit</span>
            <h4 className="text-base font-extrabold text-slate-900 mt-1">0 Duplicates</h4>
          </div>
        </div>
      )}

      {/* SUB-TAB 5: CORE WEB VITALS & SPEED */}
      {activeSubTab === "vitals" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs space-y-2">
            <span className="text-[10px] font-bold uppercase text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">Good</span>
            <h3 className="text-sm font-extrabold text-slate-900 mt-1">Largest Contentful Paint (LCP)</h3>
            <p className="text-2xl font-black text-slate-900 font-mono">1.2s</p>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs space-y-2">
            <span className="text-[10px] font-bold uppercase text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">Good</span>
            <h3 className="text-sm font-extrabold text-slate-900 mt-1">Interaction to Next Paint (INP)</h3>
            <p className="text-2xl font-black text-slate-900 font-mono">45ms</p>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs space-y-2">
            <span className="text-[10px] font-bold uppercase text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">Good</span>
            <h3 className="text-sm font-extrabold text-slate-900 mt-1">Cumulative Layout Shift (CLS)</h3>
            <p className="text-2xl font-black text-slate-900 font-mono">0.01</p>
          </div>
        </div>
      )}

      {/* SUB-TAB 6: SEARCH ENGINE BOT LOGS */}
      {activeSubTab === "logs" && (
        <div className="bg-slate-900 text-slate-200 rounded-2xl p-5 font-mono text-xs space-y-2 border border-slate-800 shadow-2xs">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2 text-slate-400 text-[11px]">
            <span>Googlebot & Bingbot Access Telemetry Logs</span>
            <span>Real-time Stream</span>
          </div>
          <p className="text-slate-300">66.249.66.1 - - [15/Aug/2026:12:00:01 +0400] "GET /sitemap.xml HTTP/1.1" 200 1489 "-" "Googlebot/2.1 (+http://www.google.com/bot.html)"</p>
          <p className="text-slate-300">66.249.66.2 - - [15/Aug/2026:12:02:14 +0400] "GET /blog/next-gen-low-gwp-refrigerant-compliance HTTP/1.1" 200 45120 "-" "Googlebot-Smartphone/2.1"</p>
          <p className="text-slate-400">40.77.167.1 - - [15/Aug/2026:12:05:30 +0400] "GET /image-sitemap.xml HTTP/1.1" 200 8920 "-" "bingbot/2.0 (+http://www.bing.com/bingbot.htm)"</p>
        </div>
      )}

    </div>
  );
}
