import React, { useState } from "react";
import {
  FileText, Plus, Search, Edit3, Trash2, Globe, Eye, CheckCircle2,
  AlertCircle, Sliders, CheckSquare, Sparkles, Share2, Layers, Filter
} from "lucide-react";
import { BlogPost, Product, ServiceItem } from "../../types";
import BlogPostEditorPage from "./BlogPostEditorPage";

interface AdminBlogManagerProps {
  blogs: BlogPost[];
  products?: Product[];
  services?: ServiceItem[];
  onAddBlog: (blog: BlogPost) => void;
  onUpdateBlog: (blog: BlogPost) => void;
  onDeleteBlog: (blogId: string) => void;
  onBulkDeleteBlogs?: (blogIds: string[]) => void;
  onShowToast?: (msg: string) => void;
  onPreviewBlogOnSite?: (blog: BlogPost) => void;
}

export default function AdminBlogManager({
  blogs,
  products = [],
  services = [],
  onAddBlog,
  onUpdateBlog,
  onDeleteBlog,
  onBulkDeleteBlogs,
  onShowToast,
  onPreviewBlogOnSite
}: AdminBlogManagerProps) {
  const [viewMode, setViewMode] = useState<"list" | "editor">("list");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedBlogIds, setSelectedBlogIds] = useState<string[]>([]);
  const [editingBlog, setEditingBlog] = useState<BlogPost | null>(null);


  // Filtered List
  const filteredBlogs = blogs.filter((b) => {
    const matchesSearch =
      b.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.slug.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (b.category && b.category.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (b.author && b.author.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesCategory = filterCategory === "all" || b.category === filterCategory;
    const matchesStatus = filterStatus === "all" || (b.status || "published") === filterStatus;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  const toggleSelectBlog = (id: string) => {
    setSelectedBlogIds(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedBlogIds.length === filteredBlogs.length && filteredBlogs.length > 0) {
      setSelectedBlogIds([]);
    } else {
      setSelectedBlogIds(filteredBlogs.map(b => b.id));
    }
  };

  const handleBulkDelete = () => {
    if (selectedBlogIds.length === 0) return;
    if (window.confirm(`Are you sure you want to delete ${selectedBlogIds.length} selected blog posts?`)) {
      if (onBulkDeleteBlogs) {
        onBulkDeleteBlogs(selectedBlogIds);
      } else {
        selectedBlogIds.forEach(id => onDeleteBlog(id));
      }
      if (onShowToast) onShowToast(`Deleted ${selectedBlogIds.length} blog posts.`);
      setSelectedBlogIds([]);
    }
  };

  const [deletingBlogTarget, setDeletingBlogTarget] = useState<BlogPost | null>(null);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);

  const handleOpenAddEditor = () => {
    setEditingBlog(null);
    setViewMode("editor");
  };

  const handleOpenEditEditor = (blog: BlogPost) => {
    setEditingBlog(blog);
    setViewMode("editor");
  };

  const handleSaveBlog = (blog: BlogPost) => {
    if (editingBlog) {
      onUpdateBlog(blog);
      if (onShowToast) onShowToast(`Updated article "${blog.title}".`);
    } else {
      onAddBlog(blog);
      if (onShowToast) onShowToast(`Published article "${blog.title}".`);
    }
    setViewMode("list");
  };

  // Reliable In-App Deletion Executions
  const handleExecuteSingleDelete = () => {
    if (deletingBlogTarget) {
      onDeleteBlog(deletingBlogTarget.id);
      if (onShowToast) onShowToast(`Successfully deleted "${deletingBlogTarget.title}".`);
      setDeletingBlogTarget(null);
    }
  };

  const handleExecuteBulkDelete = () => {
    if (selectedBlogIds.length > 0 && onBulkDeleteBlogs) {
      onBulkDeleteBlogs(selectedBlogIds);
      if (onShowToast) onShowToast(`Bulk deleted ${selectedBlogIds.length} articles.`);
      setSelectedBlogIds([]);
      setIsBulkDeleting(false);
    }
  };


  if (viewMode === "editor") {
    return (
      <BlogPostEditorPage
        editingBlog={editingBlog}
        onSave={handleSaveBlog}
        onCancel={() => setViewMode("list")}
        products={products}
        services={services}
      />
    );
  }


  // Metrics
  const totalPosts = blogs.length;
  const publishedPosts = blogs.filter(b => (b.status || "published") === "published").length;
  const avgSeoScore = Math.round(
    blogs.reduce((acc, b) => acc + (b.seoScore || 95), 0) / (blogs.length || 1)
  );

  return (
    <div className="space-y-6 font-sans text-slate-800 animate-in fade-in duration-200">
      
      {/* Top Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-extrabold uppercase text-slate-400">Total Blog Posts</span>
            <h3 className="text-2xl font-black text-slate-900 mt-1">{totalPosts}</h3>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-black">
            <FileText size={22} />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-extrabold uppercase text-slate-400">Published & Indexed</span>
            <h3 className="text-2xl font-black text-emerald-600 mt-1">{publishedPosts}</h3>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-black">
            <CheckCircle2 size={22} />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-extrabold uppercase text-slate-400">Avg SEO Score</span>
            <h3 className="text-2xl font-black text-blue-600 mt-1 font-mono">{avgSeoScore}/100</h3>
          </div>
          <div className="w-12 h-12 rounded-xl bg-cyan-50 text-cyan-600 flex items-center justify-center font-black">
            <Globe size={22} />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-extrabold uppercase text-slate-400">XML Sitemaps</span>
            <h3 className="text-2xl font-black text-slate-900 mt-1">100% Active</h3>
          </div>
          <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-black">
            <Sliders size={22} />
          </div>
        </div>

      </div>

      {/* Main Controls & Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-4">
        
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-80">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by title, author, or slug..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-blue-600"
            />
          </div>

          {selectedBlogIds.length > 0 && (
            <button
              onClick={() => setIsBulkDeleting(true)}
              className="px-3.5 py-2 bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs rounded-xl shadow-xs flex items-center gap-1.5 transition-all cursor-pointer shrink-0"
            >
              <Trash2 size={14} />
              <span>Delete Selected ({selectedBlogIds.length})</span>
            </button>
          )}
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
          
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none"
          >
            <option value="all">All Categories</option>
            <option value="HVAC">HVAC</option>
            <option value="Cooling Systems">Cooling Systems</option>
            <option value="Water Coolers">Water Coolers</option>
            <option value="Maintenance">Maintenance</option>
            <option value="Company News">Company News</option>
            <option value="Product Updates">Product Updates</option>
            <option value="Industrial Projects">Industrial Projects</option>
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none"
          >
            <option value="all">All Statuses</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
          </select>

          <button
            onClick={handleOpenAddEditor}
            className="px-4 py-2 bg-[#031b4e] hover:bg-blue-800 text-white font-extrabold text-xs rounded-xl shadow-md flex items-center gap-1.5 transition-all cursor-pointer shrink-0"
          >
            <Plus size={15} />
            <span>Create Article & SEO Suite</span>
          </button>
        </div>

      </div>

      {/* Blog Table */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-2xs overflow-hidden">
        <table className="w-full text-left text-xs text-slate-700 border-collapse">
          <thead>
            <tr className="bg-slate-900 text-white font-extrabold text-[11px] uppercase tracking-wider">
              <th className="p-4 w-10 text-center">
                <input
                  type="checkbox"
                  checked={selectedBlogIds.length === filteredBlogs.length && filteredBlogs.length > 0}
                  onChange={toggleSelectAll}
                  className="w-4 h-4 accent-blue-600 rounded cursor-pointer"
                />
              </th>
              <th className="p-4">Article Details</th>
              <th className="p-4">Category & Author</th>
              <th className="p-4">Status</th>
              <th className="p-4 text-center">Sitemap & Indexing</th>
              <th className="p-4 text-center">SEO Score</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-medium">
            {filteredBlogs.map((blog) => {
              const isSelected = selectedBlogIds.includes(blog.id);
              const score = blog.seoScore || 95;
              const isDraft = blog.status === "draft";
              const isNoIndex = blog.seoSettings?.noIndex;

              return (
                <tr key={blog.id} className={`transition-colors ${isSelected ? "bg-blue-50/60" : "hover:bg-slate-50/80"}`}>
                  <td className="p-4 text-center">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleSelectBlog(blog.id)}
                      className="w-4 h-4 accent-blue-600 rounded cursor-pointer"
                    />
                  </td>

                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={blog.image}
                        alt={blog.title}
                        className="w-14 h-12 rounded-lg object-cover border border-slate-200 shrink-0 bg-slate-50"
                      />
                      <div>
                        <h4 className="font-extrabold text-slate-900 text-xs sm:text-sm line-clamp-1">{blog.title}</h4>
                        <p className="text-[10px] text-blue-700 font-mono mt-0.5">
                          /blog/{blog.slug}
                        </p>
                      </div>
                    </div>
                  </td>

                  <td className="p-4">
                    <span className="font-bold text-slate-900 block">{blog.category}</span>
                    <span className="text-[10px] text-slate-500 block">{blog.author || "Engineering Team"} • {blog.readTime}</span>
                  </td>

                  <td className="p-4">
                    <span className={`inline-block px-2.5 py-0.5 rounded text-[10px] font-black uppercase ${
                      isDraft ? "bg-amber-100 text-amber-800 border border-amber-300" : "bg-emerald-100 text-emerald-800 border border-emerald-300"
                    }`}>
                      {isDraft ? "Draft" : "Published"}
                    </span>
                  </td>

                  <td className="p-4 text-center">
                    {isNoIndex ? (
                      <span className="inline-block px-2 py-0.5 rounded text-[10px] font-black text-red-700 bg-red-50 border border-red-200 uppercase">
                        Noindex
                      </span>
                    ) : (
                      <span className="inline-block px-2 py-0.5 rounded text-[10px] font-black text-blue-700 bg-blue-50 border border-blue-200 uppercase">
                        XML Sitemap
                      </span>
                    )}
                  </td>

                  <td className="p-4 text-center">
                    <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-black font-mono ${
                      score >= 90 ? "bg-emerald-100 text-emerald-800 border border-emerald-300" : score >= 70 ? "bg-amber-100 text-amber-800 border border-amber-300" : "bg-red-100 text-red-800 border border-red-300"
                    }`}>
                      {score}/100
                    </span>
                  </td>

                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      
                      <button
                        onClick={() => handleOpenEditEditor(blog)}
                        className="px-2.5 py-1 rounded-lg text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 transition-colors cursor-pointer flex items-center gap-1"
                        title="Edit Article & Per-Blog SEO Settings"
                      >
                        <Edit3 size={13} />
                        <span>SEO & Edit</span>
                      </button>

                      {onPreviewBlogOnSite && (
                        <button
                          onClick={() => onPreviewBlogOnSite(blog)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
                          title="Preview on site"
                        >
                          <Eye size={15} />
                        </button>
                      )}

                      <button
                        onClick={() => setDeletingBlogTarget(blog)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                        title="Delete blog post"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>

                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Reliable In-App Single Delete Confirmation Modal */}
      {deletingBlogTarget && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center gap-3 text-red-600">
              <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center shrink-0">
                <Trash2 size={20} />
              </div>
              <div>
                <h3 className="font-extrabold text-base text-slate-900">Confirm Article Deletion</h3>
                <p className="text-xs text-slate-500">This action cannot be undone.</p>
              </div>
            </div>

            <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-200">
              Are you sure you want to delete <span className="font-bold text-slate-900">"{deletingBlogTarget.title}"</span>? It will be removed permanently from the database.
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeletingBlogTarget(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleExecuteSingleDelete}
                className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                Delete Permanently
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reliable In-App Bulk Delete Confirmation Modal */}
      {isBulkDeleting && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center gap-3 text-red-600">
              <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center shrink-0">
                <Trash2 size={20} />
              </div>
              <div>
                <h3 className="font-extrabold text-base text-slate-900">Bulk Delete Articles</h3>
                <p className="text-xs text-slate-500">Delete selected articles from database.</p>
              </div>
            </div>

            <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-200">
              Are you sure you want to delete <span className="font-bold text-red-600">{selectedBlogIds.length} articles</span>? They will be removed from Firestore and Local Storage.
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsBulkDeleting(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleExecuteBulkDelete}
                className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                Delete {selectedBlogIds.length} Articles
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}


