import React, { useState } from "react";
import { 
  Star, Check, X, Trash2, Plus, Copy, CheckCircle2, 
  Filter, Search, MessageSquare, ExternalLink, ShieldCheck, 
  Upload, Camera, User, ChevronLeft, ChevronRight, Save
} from "lucide-react";
import { ReviewItem, ReviewStatus, ReviewTarget } from "../../types/review";
import { 
  updateReviewStatusInDatabase, 
  deleteReviewFromDatabase, 
  saveReviewToDatabase,
  saveLocalReviews
} from "../../lib/reviewService";
import { copyTextToClipboard } from "../../utils/clipboard";

interface AdminReviewManagerProps {
  reviews: ReviewItem[];
  onShowToast: (msg: string) => void;
}

export default function AdminReviewManager({ reviews, onShowToast }: AdminReviewManagerProps) {
  const [activeTab, setActiveTab] = useState<"all" | ReviewStatus>("pending");
  const [targetFilter, setTargetFilter] = useState<"all" | ReviewTarget>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [copiedLink, setCopiedLink] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isSavedRecently, setIsSavedRecently] = useState(false);

  // Manual Review Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [manualName, setManualName] = useState("");
  const [manualRole, setManualRole] = useState("");
  const [manualLocation, setManualLocation] = useState("UAE");
  const [manualRating, setManualRating] = useState(5);
  const [manualTarget, setManualTarget] = useState<ReviewTarget>("homepage");
  const [manualServiceTitle, setManualServiceTitle] = useState("AC Deep Chemical Cleaning & Sanitization");
  const [manualComment, setManualComment] = useState("");
  const [manualAvatar, setManualAvatar] = useState("");

  const handleSaveAll = async () => {
    setIsSaving(true);
    try {
      saveLocalReviews(reviews);
      setIsSavedRecently(true);
      onShowToast("Customer reviews and moderation settings saved successfully!");
      setTimeout(() => setIsSavedRecently(false), 2500);
    } catch (err) {
      console.error("Error saving reviews:", err);
      onShowToast("Failed to save reviews. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const getReviewUrl = (type: ReviewTarget) => {
    const origin = window.location.origin;
    const path = window.location.pathname.replace(/\/+$/, "");
    return `${origin}${path}/#/submit-review?target=${type}`;
  };

  const copyToClipboard = async (type: ReviewTarget) => {
    const url = getReviewUrl(type);
    const success = await copyTextToClipboard(url);
    if (success) {
      setCopiedLink(type);
      onShowToast(`Copied ${type === "homepage" ? "Homepage" : "Service"} review submission link to clipboard!`);
      setTimeout(() => setCopiedLink(null), 2500);
    } else {
      onShowToast(`Link ready: ${url}`);
    }
  };

  const handleStatusChange = async (id: string, status: ReviewStatus) => {
    await updateReviewStatusInDatabase(id, status);
    onShowToast(`Review ${status === "approved" ? "accepted & published" : "marked as " + status}!`);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this review?")) {
      await deleteReviewFromDatabase(id);
      onShowToast("Review deleted.");
    }
  };

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualName.trim() || !manualComment.trim()) return;

    const newRev: ReviewItem = {
      id: `rev-manual-${Date.now()}`,
      authorName: manualName.trim(),
      authorRole: manualRole.trim() || "Verified Client",
      location: manualLocation.trim() || "UAE",
      rating: manualRating,
      comment: manualComment.trim(),
      target: manualTarget,
      serviceTitle: manualTarget === "service" ? manualServiceTitle : undefined,
      authorAvatar: manualAvatar || undefined,
      status: "approved", // Direct approve from admin
      createdAt: new Date().toISOString(),
      verifiedBooking: true
    };

    await saveReviewToDatabase(newRev);
    onShowToast("New review created and published live!");
    setIsAddModalOpen(false);

    // Reset form
    setManualName("");
    setManualRole("");
    setManualComment("");
    setManualAvatar("");
  };

  // Filter calculations
  const pendingCount = reviews.filter(r => r.status === "pending").length;
  const approvedCount = reviews.filter(r => r.status === "approved").length;
  const rejectedCount = reviews.filter(r => r.status === "rejected").length;

  const filteredReviews = reviews.filter(rev => {
    if (activeTab !== "all" && rev.status !== activeTab) return false;
    if (targetFilter !== "all" && rev.target !== targetFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        rev.authorName.toLowerCase().includes(q) ||
        rev.comment.toLowerCase().includes(q) ||
        rev.authorRole.toLowerCase().includes(q) ||
        (rev.userEmail && rev.userEmail.toLowerCase().includes(q)) ||
        (rev.serviceTitle && rev.serviceTitle.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const [reviewPage, setReviewPage] = useState(1);
  const REVIEW_PAGE_SIZE = 6;

  React.useEffect(() => {
    setReviewPage(1);
  }, [activeTab, targetFilter, searchQuery]);

  const totalReviewPages = Math.ceil(filteredReviews.length / REVIEW_PAGE_SIZE) || 1;
  const validReviewPage = Math.min(reviewPage, totalReviewPages);
  const startRevIdx = (validReviewPage - 1) * REVIEW_PAGE_SIZE;
  const endRevIdx = Math.min(startRevIdx + REVIEW_PAGE_SIZE, filteredReviews.length);
  const paginatedReviews = filteredReviews.slice(startRevIdx, endRevIdx);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* 1. Header Banner & Shareable Links Card */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-2xs space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-blue-50 text-blue-700 text-xs font-bold mb-1">
              <MessageSquare size={13} />
              <span>Customer Moderation System</span>
            </div>
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
              Customer Reviews Management
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Share client submission links, moderate incoming reviews, and approve feedback for the Homepage & Service Directory.
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={handleSaveAll}
              disabled={isSaving}
              className={`px-4 py-2.5 text-xs font-bold rounded-xl shadow-xs flex items-center gap-1.5 transition-all cursor-pointer ${
                isSavedRecently
                  ? "bg-emerald-600 text-white"
                  : "bg-[#0f4c81] hover:bg-[#1a649f] text-white"
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

            <button
              onClick={() => setIsAddModalOpen(true)}
              className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs rounded-xl transition-all shadow-sm flex items-center gap-2 cursor-pointer shrink-0"
            >
              <Plus size={15} />
              <span>Create Manual Review</span>
            </button>
          </div>
        </div>

        {/* Shareable Links Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* Link 1: Homepage Review Link */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-col justify-between gap-3">
            <div>
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                  <span>Homepage Client Review Link</span>
                </p>
                <button
                  type="button"
                  onClick={() => copyToClipboard("homepage")}
                  className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-800 text-xs font-bold rounded-lg border border-slate-300 transition-colors flex items-center gap-1.5 cursor-pointer shrink-0 shadow-2xs active:scale-95"
                  title="Copy link to clipboard"
                >
                  {copiedLink === "homepage" ? (
                    <>
                      <CheckCircle2 size={13} className="text-emerald-600" />
                      <span className="text-emerald-700">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy size={13} />
                      <span>Copy Link</span>
                    </>
                  )}
                </button>
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">Share with clients for General / Homepage testimonials</p>
            </div>

            {/* Direct selectable URL input for easy viewing & manual copy across any network */}
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={getReviewUrl("homepage")}
                onClick={(e) => (e.target as HTMLInputElement).select()}
                className="w-full bg-white text-[11px] font-mono text-slate-600 px-3 py-1.5 rounded-lg border border-slate-200 focus:outline-none focus:border-blue-400 select-all cursor-pointer shadow-2xs"
                title="Click to select full URL"
              />
            </div>
          </div>

          {/* Link 2: Service Feedback Review Link */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-col justify-between gap-3">
            <div>
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  <span>Service Directory Review Link</span>
                </p>
                <button
                  type="button"
                  onClick={() => copyToClipboard("service")}
                  className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-800 text-xs font-bold rounded-lg border border-slate-300 transition-colors flex items-center gap-1.5 cursor-pointer shrink-0 shadow-2xs active:scale-95"
                  title="Copy link to clipboard"
                >
                  {copiedLink === "service" ? (
                    <>
                      <CheckCircle2 size={13} className="text-emerald-600" />
                      <span className="text-emerald-700">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy size={13} />
                      <span>Copy Link</span>
                    </>
                  )}
                </button>
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">Share with clients for specific HVAC job feedback</p>
            </div>

            {/* Direct selectable URL input for easy viewing & manual copy across any network */}
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={getReviewUrl("service")}
                onClick={(e) => (e.target as HTMLInputElement).select()}
                className="w-full bg-white text-[11px] font-mono text-slate-600 px-3 py-1.5 rounded-lg border border-slate-200 focus:outline-none focus:border-blue-400 select-all cursor-pointer shadow-2xs"
                title="Click to select full URL"
              />
            </div>
          </div>

        </div>
      </div>

      {/* 2. Filters & Status Tabs Toolbar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        
        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl overflow-x-auto">
          <button
            onClick={() => setActiveTab("pending")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-extrabold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === "pending"
                ? "bg-amber-500 text-white shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <span>Pending Approval</span>
            {pendingCount > 0 && (
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${activeTab === "pending" ? "bg-amber-600 text-white" : "bg-amber-100 text-amber-800"}`}>
                {pendingCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab("approved")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-extrabold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === "approved"
                ? "bg-slate-900 text-white shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <span>Approved & Live</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-200 text-slate-800">
              {approvedCount}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("rejected")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-extrabold transition-all cursor-pointer ${
              activeTab === "rejected"
                ? "bg-red-600 text-white shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <span>Rejected ({rejectedCount})</span>
          </button>

          <button
            onClick={() => setActiveTab("all")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-extrabold transition-all cursor-pointer ${
              activeTab === "all"
                ? "bg-slate-900 text-white shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <span>All ({reviews.length})</span>
          </button>
        </div>

        {/* Target & Search Filters */}
        <div className="flex items-center gap-3">
          <select
            value={targetFilter}
            onChange={(e) => setTargetFilter(e.target.value as any)}
            className="px-3 py-1.5 text-xs font-semibold border border-slate-200 rounded-xl bg-slate-50 text-slate-700 focus:bg-white focus:outline-none cursor-pointer"
          >
            <option value="all">All Locations</option>
            <option value="homepage">Homepage Only</option>
            <option value="service">Services Page Only</option>
          </select>

          <div className="relative">
            <Search className="absolute left-3 top-2.5 text-slate-400" size={14} />
            <input
              type="text"
              placeholder="Search reviews..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1.5 text-xs border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:border-slate-400 w-44 sm:w-56"
            />
          </div>
        </div>

      </div>

      {/* 3. Review Cards Grid */}
      {filteredReviews.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 border border-slate-200 text-center space-y-3">
          <MessageSquare size={36} className="text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">No Reviews Found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {activeTab === "pending" 
              ? "There are currently no pending reviews waiting for approval." 
              : "No reviews match your selected filter criteria."}
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {paginatedReviews.map((rev) => (
            <div
              key={rev.id}
              className={`bg-white rounded-2xl p-5 border transition-all flex flex-col justify-between space-y-4 ${
                rev.status === "pending"
                  ? "border-amber-300 bg-amber-50/20 shadow-xs"
                  : rev.status === "approved"
                  ? "border-slate-200 hover:border-slate-300"
                  : "border-red-200 bg-red-50/10 opacity-75"
              }`}
            >
              <div className="space-y-3">
                
                {/* Header Row: Target Badge & Status */}
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wide ${
                      rev.target === "homepage" 
                        ? "bg-blue-100 text-blue-800 border border-blue-200" 
                        : "bg-purple-100 text-purple-800 border border-purple-200"
                    }`}>
                      {rev.target === "homepage" ? "Homepage Review" : "Service Review"}
                    </span>

                    {rev.serviceTitle && (
                      <span className="text-[10px] text-slate-500 font-semibold truncate max-w-[160px]">
                        {rev.serviceTitle}
                      </span>
                    )}
                  </div>

                  {/* Status Indicator Badge */}
                  <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${
                    rev.status === "approved"
                      ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                      : rev.status === "pending"
                      ? "bg-amber-100 text-amber-900 border border-amber-300 animate-pulse"
                      : "bg-red-100 text-red-800 border border-red-200"
                  }`}>
                    {rev.status}
                  </span>
                </div>

                {/* Rating & Author Info */}
                <div className="flex items-center gap-3">
                  {/* Avatar */}
                  <div className="w-10 h-10 rounded-full bg-slate-200 overflow-hidden shrink-0 border border-slate-300 flex items-center justify-center text-slate-600 font-bold text-sm">
                    {rev.authorAvatar ? (
                      <img src={rev.authorAvatar} alt={rev.authorName} className="w-full h-full object-cover" />
                    ) : (
                      rev.authorName.charAt(0).toUpperCase()
                    )}
                  </div>

                  <div>
                    <h4 className="font-bold text-slate-900 text-sm leading-tight flex items-center gap-1.5 flex-wrap">
                      <span>{rev.authorName}</span>
                      {rev.userEmail && (
                        <span className="text-[10px] font-medium text-blue-700 bg-blue-50 border border-blue-200 px-1.5 py-0.2 rounded">
                          {rev.userEmail}
                        </span>
                      )}
                    </h4>
                    <p className="text-[11px] text-slate-500 font-medium">
                      {rev.authorRole} • {rev.location}
                    </p>
                  </div>
                </div>

                {/* Star Rating */}
                <div className="flex items-center gap-1 text-amber-400">
                  {[...Array(rev.rating)].map((_, i) => (
                    <Star key={i} size={14} className="fill-amber-400" />
                  ))}
                  <span className="text-[11px] text-slate-400 font-semibold ml-1">
                    ({rev.rating}/5)
                  </span>
                </div>

                {/* Comment */}
                <p className="text-xs text-slate-700 leading-relaxed font-medium bg-slate-50 p-3 rounded-xl border border-slate-100 italic">
                  "{rev.comment}"
                </p>

              </div>

              {/* Action Buttons Row */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-[10px] text-slate-400 font-medium">
                  Submitted: {new Date(rev.createdAt).toLocaleDateString()}
                </span>

                <div className="flex items-center gap-2">
                  {rev.status !== "approved" && (
                    <button
                      onClick={() => handleStatusChange(rev.id, "approved")}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-[11px] rounded-lg transition-all shadow-xs flex items-center gap-1 cursor-pointer"
                    >
                      <Check size={13} />
                      <span>Accept & Publish</span>
                    </button>
                  )}

                  {rev.status !== "rejected" && (
                    <button
                      onClick={() => handleStatusChange(rev.id, "rejected")}
                      className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[11px] rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <X size={13} />
                      <span>Reject</span>
                    </button>
                  )}

                  <button
                    onClick={() => handleDelete(rev.id)}
                    className="p-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition-colors cursor-pointer"
                    title="Delete Review"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>

              </div>

            </div>
          ))}
        </div>

        {/* Review Pagination Bar */}
        {filteredReviews.length > REVIEW_PAGE_SIZE && (
          <div className="p-4 rounded-2xl bg-white border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <div className="text-slate-500 font-medium">
              Showing <span className="font-bold text-slate-800">{startRevIdx + 1}</span> to{" "}
              <span className="font-bold text-slate-800">{endRevIdx}</span> of{" "}
              <span className="font-bold text-slate-800">{filteredReviews.length}</span> reviews
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setReviewPage((p) => Math.max(1, p - 1))}
                disabled={validReviewPage <= 1}
                className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900 disabled:opacity-30 disabled:hover:bg-transparent disabled:cursor-not-allowed font-bold flex items-center gap-1 cursor-pointer transition-colors"
              >
                <ChevronLeft size={14} />
                <span>Prev</span>
              </button>

              {Array.from({ length: totalReviewPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  type="button"
                  onClick={() => setReviewPage(page)}
                  className={`w-8 h-8 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                    validReviewPage === page
                      ? "bg-[#0f4c81] text-white shadow-xs"
                      : "border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                >
                  {page}
                </button>
              ))}

              <button
                type="button"
                onClick={() => setReviewPage((p) => Math.min(totalReviewPages, p + 1))}
                disabled={validReviewPage >= totalReviewPages}
                className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900 disabled:opacity-30 disabled:hover:bg-transparent disabled:cursor-not-allowed font-bold flex items-center gap-1 cursor-pointer transition-colors"
              >
                <span>Next</span>
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </>
    )}

      {/* 4. Manual Create Review Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full border border-slate-200 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150">
            
            <div className="bg-slate-900 text-white p-5 flex justify-between items-center">
              <div>
                <h3 className="font-extrabold text-base">Create Manual Testimonial</h3>
                <p className="text-xs text-slate-300 mt-0.5">Post a verified review directly to live website sections</p>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-white/70 hover:text-white text-sm font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleManualSubmit} className="p-6 space-y-4">
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Target Section</label>
                  <select
                    value={manualTarget}
                    onChange={(e) => setManualTarget(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs font-semibold border border-slate-300 rounded-lg"
                  >
                    <option value="homepage">Homepage ("Happy Customers")</option>
                    <option value="service">Services Directory</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Rating</label>
                  <select
                    value={manualRating}
                    onChange={(e) => setManualRating(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs font-semibold border border-slate-300 rounded-lg"
                  >
                    <option value={5}>⭐⭐⭐⭐⭐ (5 Stars)</option>
                    <option value={4}>⭐⭐⭐⭐ (4 Stars)</option>
                    <option value={3}>⭐⭐⭐ (3 Stars)</option>
                  </select>
                </div>
              </div>

              {manualTarget === "service" && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Service Title</label>
                  <input
                    type="text"
                    value={manualServiceTitle}
                    onChange={(e) => setManualServiceTitle(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Author Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Mohamed Moled"
                    value={manualName}
                    onChange={(e) => setManualName(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Role & Location</label>
                  <input
                    type="text"
                    placeholder="e.g. Procurement Manager - UAE"
                    value={manualRole}
                    onChange={(e) => setManualRole(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Testimonial Comment *</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Enter the customer's review quote..."
                  value={manualComment}
                  onChange={(e) => setManualComment(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs rounded-lg cursor-pointer shadow-xs"
                >
                  Publish Immediately
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
}
