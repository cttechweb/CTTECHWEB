import React, { useState, useEffect, useRef } from "react";
import { 
  Star, Quote, MessageSquare, X, Upload, Camera, Trash2, 
  CheckCircle2, ShieldCheck, Clock, Send, Loader2 
} from "lucide-react";
import { ReviewItem } from "../types/review";
import { useAuth } from "../context/AuthContext";
import { saveReviewToDatabase } from "../lib/reviewService";
import { uploadProductImage } from "../services/storageService";

interface CustomerReviewsProps {
  reviews?: ReviewItem[];
  onOpenLogin?: () => void;
}

export default function CustomerReviews({ reviews, onOpenLogin }: CustomerReviewsProps) {
  const { user, profile, isLoading: isAuthLoading } = useAuth();

  // Review Modal State (In-place modal, no redirection away from Homepage)
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [authorName, setAuthorName] = useState("");
  const [authorRole, setAuthorRole] = useState("");
  const [location, setLocation] = useState("Dubai, UAE");
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [authorAvatar, setAuthorAvatar] = useState("");
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [reviewSubmitted, setReviewSubmitted] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Filter strictly for approved homepage reviews
  const approvedHomepageReviews = reviews 
    ? reviews.filter(r => r.target === "homepage" && r.status === "approved")
    : [];

  const displayReviews = approvedHomepageReviews;

  // Auto-open review modal if user logged in and returned with ?action=review
  useEffect(() => {
    const handleActionCheck = () => {
      const hash = window.location.hash || "";
      if (hash.includes("action=review") && user) {
        setAuthorName(profile?.name || user.displayName || user.email?.split("@")[0] || "");
        setAuthorRole(profile?.companyName || profile?.designation || "Verified Client");
        setLocation(profile?.address || "Dubai, UAE");
        if (user.photoURL) setAuthorAvatar(user.photoURL);
        setIsReviewModalOpen(true);
        // Clean URL parameter without page reload
        const clean = hash.replace(/[?&]action=review(&|$)/, "").replace(/\?$/, "");
        window.history.replaceState(null, "", window.location.pathname + clean);
      }
    };

    if (!isAuthLoading) {
      handleActionCheck();
    }
  }, [isAuthLoading, user, profile]);

  const handleOpenReviewModal = () => {
    if (!user) {
      if (onOpenLogin) {
        sessionStorage.setItem("ct_redirect_after_login", "#/?action=review");
        onOpenLogin();
      } else {
        sessionStorage.setItem("ct_redirect_after_login", "#/?action=review");
        window.location.hash = "#/login?redirect=" + encodeURIComponent("?action=review");
      }
      return;
    }

    setAuthorName(profile?.name || user.displayName || user.email?.split("@")[0] || "");
    setAuthorRole(profile?.companyName || profile?.designation || "Verified Client");
    setLocation(profile?.address || "Dubai, UAE");
    if (user.photoURL && !authorAvatar) setAuthorAvatar(user.photoURL);
    setRating(5);
    setComment("");
    setIsReviewModalOpen(true);
  };

  // Handle Photo Upload
  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert("Image size should be under 5MB.");
      return;
    }

    setIsUploadingPhoto(true);

    // Instant local preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setAuthorAvatar(reader.result as string);
    };
    reader.readAsDataURL(file);

    try {
      const result = await uploadProductImage(file, "reviews");
      if (result?.url) {
        setAuthorAvatar(result.url);
      }
    } catch (err) {
      console.warn("Avatar upload fallback to preview:", err);
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  const handleRemovePhoto = () => {
    setAuthorAvatar("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Submit Homepage Testimonial (marked as pending for Admin Moderation)
  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authorName.trim() || !comment.trim()) return;

    if (!user) {
      setIsReviewModalOpen(false);
      handleOpenReviewModal();
      return;
    }

    setIsSubmittingReview(true);

    const reviewToSave: ReviewItem = {
      id: `rev-hp-${Date.now()}`,
      authorName: authorName.trim(),
      authorRole: authorRole.trim() || (profile?.companyName ? `${profile.companyName}` : "Verified Client"),
      location: location.trim() || "UAE",
      rating,
      comment: comment.trim(),
      target: "homepage",
      authorAvatar: authorAvatar || undefined,
      status: "pending", // ALWAYS set to pending until reviewed and approved by admin
      createdAt: new Date().toISOString(),
      verifiedBooking: true,
      userId: user.uid,
      userEmail: user.email || undefined
    };

    try {
      await saveReviewToDatabase(reviewToSave);
    } catch (err) {
      console.error("Error saving homepage review:", err);
    } finally {
      setIsSubmittingReview(false);
      setReviewSubmitted(true);
    }

    setTimeout(() => {
      setReviewSubmitted(false);
      setIsReviewModalOpen(false);
      setComment("");
    }, 2800);
  };

  return (
    <>
      {displayReviews.length > 0 && (
        <section className="w-full bg-[#fafbfc] py-16 lg:py-24 border-b border-slate-100" id="customer-reviews-section">
      <div className="max-w-6xl mx-auto px-4">
        
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-12 pb-6 border-b border-slate-200/70">
          <div>
            <span className="text-[11px] font-black uppercase tracking-widest text-[#2596be] block mb-1">
              Verified Feedback
            </span>
            <h2 className="font-sans font-black text-2xl sm:text-3xl text-[#031b4e] uppercase tracking-tight">
              Happy Customers
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
              Genuine feedback from residential villa owners, commercial facility directors, and MEP contractors across the UAE.
            </p>
          </div>

          <button
            type="button"
            onClick={handleOpenReviewModal}
            id="leave-homepage-review-btn"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#031b4e] hover:bg-[#2596be] text-white rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer shadow-xs active:scale-95 self-start sm:self-auto"
          >
            <MessageSquare size={14} className="text-cyan-400" />
            <span>Submit Review</span>
          </button>
        </div>

        {/* Professional Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
          {displayReviews.map((review, idx) => (
            <div 
              key={review.id || idx} 
              className="flex flex-col justify-between p-6 rounded-2xl bg-white border border-slate-200/80 shadow-2xs hover:shadow-xs transition-all"
            >
              <div>
                {/* Star Rating */}
                <div className="flex items-center gap-1 mb-4 text-amber-500">
                  {[...Array(review.rating)].map((_, i) => (
                    <Star key={i} size={18} fill="currentColor" stroke="currentColor" />
                  ))}
                </div>

                {/* Testimonial Quote */}
                <div className="relative">
                  <Quote className="absolute -top-3 -left-2 w-7 h-7 text-blue-100/60 -z-0 pointer-events-none stroke-[3]" />
                  <p className="text-slate-600 text-sm sm:text-base leading-relaxed font-medium relative z-10 italic">
                    "{'comment' in review ? review.comment : (review as any).comment || (review as any).text}"
                  </p>
                </div>
              </div>

              {/* Author Info */}
              <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-4">
                <div className="flex items-center gap-3">
                  {'authorAvatar' in review && review.authorAvatar ? (
                    <img 
                      src={review.authorAvatar} 
                      alt={review.authorName} 
                      className="w-10 h-10 rounded-full object-cover border border-slate-200 shadow-2xs" 
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-blue-50 text-[#031b4e] font-black text-sm flex items-center justify-center border border-blue-100">
                      {(review.authorName || (review as any).name || "C").charAt(0).toUpperCase()}
                    </div>
                  )}

                  <div>
                    <h4 className="font-sans font-black text-sm uppercase tracking-wider text-[#031b4e]">
                      {review.authorName || (review as any).name}
                    </h4>
                    <p className="text-xs text-[#0f4c81] font-bold tracking-widest uppercase mt-0.5">
                      {'authorRole' in review && review.authorRole ? `${review.authorRole} • ` : ""}{review.location}
                    </p>
                  </div>
                </div>
                
                <span className="text-blue-100/60 text-3xl font-serif select-none">
                  ””
                </span>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
      )}

      {/* HOMEPAGE IN-PLACE REVIEW MODAL */}
      {isReviewModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full border border-slate-100 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150 max-h-[92vh] flex flex-col">
            
            {/* Modal Header */}
            <div className="bg-[#031b4e] text-white p-5 flex justify-between items-center shrink-0">
              <div>
                <h3 className="font-display font-bold text-base flex items-center gap-2">
                  <MessageSquare size={16} className="text-cyan-400" />
                  <span>Submit Client Testimonial</span>
                </h3>
                <p className="text-xs text-slate-300 mt-0.5">Share your feedback about Cool Technologies products & services</p>
              </div>
              <button 
                type="button"
                onClick={() => setIsReviewModalOpen(false)}
                className="text-white/80 hover:text-white bg-white/10 hover:bg-white/20 w-7 h-7 rounded-full flex items-center justify-center transition-colors focus:outline-none cursor-pointer"
              >
                <X size={15} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto">
              {reviewSubmitted ? (
                <div className="py-8 text-center space-y-3 animate-in zoom-in-95 duration-200">
                  <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center">
                    <CheckCircle2 size={32} />
                  </div>
                  <h4 className="font-display font-bold text-slate-900 text-lg">Thank You for Your Feedback!</h4>
                  <p className="text-xs text-slate-600 font-medium max-w-sm mx-auto leading-relaxed">
                    Your testimonial has been submitted for administrative verification. Once approved by our team, it will appear live on the homepage.
                  </p>
                  <div className="pt-2">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-800 border border-amber-200 rounded-full text-[11px] font-bold">
                      <Clock size={12} />
                      <span>Status: Pending Admin Approval</span>
                    </span>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmitReview} className="space-y-4">
                  
                  {/* Authenticated Identity Banner */}
                  {user && (
                    <div className="p-2.5 bg-blue-50/80 border border-blue-100 rounded-xl flex items-center justify-between text-[11px] text-[#031b4e]">
                      <span className="flex items-center gap-1.5 font-semibold">
                        <ShieldCheck size={14} className="text-blue-600 shrink-0" />
                        <span>Submitting as: <strong className="font-bold">{user.email || profile?.name}</strong></span>
                      </span>
                      <span className="text-[10px] text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded font-bold">
                        Verified Client
                      </span>
                    </div>
                  )}

                  {/* Profile Photo Upload Widget */}
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-4">
                    <div className="relative w-14 h-14 rounded-full bg-slate-200 border-2 border-slate-300 overflow-hidden shrink-0 flex items-center justify-center text-slate-600 font-bold text-base">
                      {authorAvatar ? (
                        <img src={authorAvatar} alt="Reviewer" className="w-full h-full object-cover" />
                      ) : (
                        <span>{authorName ? authorName.charAt(0).toUpperCase() : <Camera size={20} className="text-slate-400" />}</span>
                      )}
                    </div>

                    <div className="flex-1 space-y-1.5">
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoUpload}
                        className="hidden"
                        id="homepage-review-photo-input"
                      />
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          disabled={isUploadingPhoto}
                          className="px-3 py-1.5 bg-white hover:bg-slate-100 border border-slate-300 text-slate-800 text-[11px] font-bold rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs disabled:opacity-50"
                        >
                          <Upload size={12} />
                          <span>{isUploadingPhoto ? "Uploading..." : authorAvatar ? "Change Photo" : "Upload Photo"}</span>
                        </button>

                        {authorAvatar && (
                          <button
                            type="button"
                            onClick={handleRemovePhoto}
                            className="p-1.5 text-slate-400 hover:text-red-600 transition-colors cursor-pointer rounded-lg hover:bg-red-50"
                            title="Remove photo"
                          >
                            <Trash2 size={13} />
                          </button>
                        )}
                      </div>
                      <p className="text-[10px] text-slate-400">Optional: JPG, PNG or WEBP (under 5MB)</p>
                    </div>
                  </div>

                  {/* Rating Selector */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Your Rating <span className="text-red-500">*</span>
                    </label>
                    <div className="flex items-center gap-1.5">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setRating(star)}
                          onMouseEnter={() => setHoverRating(star)}
                          onMouseLeave={() => setHoverRating(0)}
                          className="p-1 hover:scale-110 transition-transform cursor-pointer"
                        >
                          <Star
                            size={22}
                            className={
                              (hoverRating || rating) >= star
                                ? "fill-amber-400 text-amber-400"
                                : "text-slate-300"
                            }
                          />
                        </button>
                      ))}
                      <span className="text-xs font-bold text-slate-600 ml-2">{rating} / 5 Stars</span>
                    </div>
                  </div>

                  {/* Grid Inputs: Name & Role */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Your Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Eng. Khalid Al-Mansoori"
                        value={authorName}
                        onChange={(e) => setAuthorName(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:border-[#031b4e]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Role / Designation
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Facility Director"
                        value={authorRole}
                        onChange={(e) => setAuthorRole(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:border-[#031b4e]"
                      />
                    </div>
                  </div>

                  {/* Location */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Location / Emirate
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Dubai Marina, UAE"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:border-[#031b4e]"
                    />
                  </div>

                  {/* Testimonial Feedback Comment */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Your Feedback / Review <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      required
                      rows={3}
                      placeholder="Share your experience with Cool Technologies cooling products, delivery, or engineer support..."
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs font-semibold text-slate-800 focus:outline-none focus:border-[#031b4e]"
                    />
                  </div>

                  {/* Action Buttons */}
                  <div className="pt-2 flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setIsReviewModalOpen(false)}
                      className="px-4 py-2 rounded-lg text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmittingReview || isUploadingPhoto}
                      className="px-5 py-2 rounded-lg text-xs font-bold text-white bg-[#031b4e] hover:bg-[#2596be] transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                      {isSubmittingReview ? (
                        <>
                          <Loader2 size={13} className="animate-spin" />
                          <span>Submitting...</span>
                        </>
                      ) : (
                        <>
                          <Send size={13} />
                          <span>Submit for Verification</span>
                        </>
                      )}
                    </button>
                  </div>

                </form>
              )}
            </div>

          </div>
        </div>
      )}

    </>
  );
}
