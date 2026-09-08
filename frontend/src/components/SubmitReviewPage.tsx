import React, { useState, useEffect, useRef } from "react";
import { Star, Upload, CheckCircle2, MessageSquare, Camera, Trash2, ArrowLeft, ShieldCheck, UserCheck, Sparkles, Loader2 } from "lucide-react";
import { ReviewItem, ReviewTarget } from "../types/review";
import { saveReviewToDatabase } from "../lib/reviewService";
import { uploadProductImage } from "../services/storageService";
import { useAuth } from "../context/AuthContext";

interface SubmitReviewPageProps {
  onShowToast?: (message: string) => void;
}

export default function SubmitReviewPage({ onShowToast }: SubmitReviewPageProps) {
  const { user, profile, isLoading } = useAuth();

  // Target automatically sent via URL parameter e.g. #/submit-review?target=service
  const [target, setTarget] = useState<ReviewTarget>("homepage");
  const [serviceTitleParam, setServiceTitleParam] = useState<string>("");

  const [authorName, setAuthorName] = useState("");
  const [authorRole, setAuthorRole] = useState("");
  const [location, setLocation] = useState("");
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [authorAvatar, setAuthorAvatar] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });

    // Parse URL parameters dynamically
    const hash = window.location.hash;
    if (hash.includes("target=service")) {
      setTarget("service");
    } else {
      setTarget("homepage");
    }

    // Optional service title passed in URL query e.g. &title=AC+Deep+Chemical...
    if (hash.includes("title=")) {
      const match = hash.match(/title=([^&]+)/);
      if (match && match[1]) {
        setServiceTitleParam(decodeURIComponent(match[1]));
      }
    }
  }, [isLoading, user]);

  // Pre-fill reviewer identity from active profile
  useEffect(() => {
    if (user) {
      if (!authorName) {
        setAuthorName(profile?.name || user.displayName || user.email?.split("@")[0] || "");
      }
      if (!authorRole) {
        setAuthorRole(profile?.companyName || profile?.designation || "");
      }
      if (!location) {
        setLocation(profile?.address || "UAE");
      }
      if (!authorAvatar && user.photoURL) {
        setAuthorAvatar(user.photoURL);
      }
    }
  }, [user, profile]);

  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

  // Handle Profile Photo Upload to Cloudflare R2
  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert("Image size should be under 5MB.");
      return;
    }

    setIsUploadingAvatar(true);

    // Instant local preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setAuthorAvatar(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Upload directly to Cloudflare R2
    try {
      const result = await uploadProductImage(file, "reviews");
      if (result && result.url) {
        setAuthorAvatar(result.url);
      }
    } catch (err) {
      console.warn("Avatar upload fallback to preview:", err);
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handleRemovePhoto = () => {
    setAuthorAvatar("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authorName.trim() || !comment.trim()) return;

    setIsSubmitting(true);

    const newReview: ReviewItem = {
      id: `rev-user-${Date.now()}`,
      authorName: authorName.trim(),
      authorRole: authorRole.trim() || (target === "service" ? "Verified Service Client" : "Verified Client"),
      location: location.trim() || "UAE",
      rating,
      comment: comment.trim(),
      target,
      serviceTitle: target === "service" ? (serviceTitleParam || "Commercial HVAC & Technical Service") : undefined,
      authorAvatar: authorAvatar || undefined,
      status: "pending",
      createdAt: new Date().toISOString(),
      verifiedBooking: true,
      userId: user?.uid,
      userEmail: user?.email || undefined
    };

    await saveReviewToDatabase(newReview);

    setIsSubmitting(false);
    setIsSubmitted(true);

    if (onShowToast) {
      onShowToast("Your review has been submitted for admin approval.");
    }
  };

  return (
    <div className="w-full bg-slate-50 min-h-screen py-10 lg:py-14 font-sans text-slate-800 antialiased">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Navigation back */}
        <div className="mb-6">
          <a
            href="#/"
            className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-[#2596be] transition-colors"
          >
            <ArrowLeft size={15} />
            <span>Return to Cool Technologies Homepage</span>
          </a>
        </div>

        {/* Main Desktop Container (Wide 2-Column Grid Layout) */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden grid grid-cols-1 lg:grid-cols-12">
          
          {/* Left Column: Branding & Profile Photo Upload Sidebar (5 cols) */}
          <div className="lg:col-span-5 bg-[#031b4e] text-white p-8 sm:p-10 flex flex-col justify-between relative overflow-hidden">
            
            {/* Background ambient accents */}
            <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-[250px] h-[250px] bg-blue-600/15 rounded-full blur-3xl pointer-events-none"></div>

            <div className="relative z-10 space-y-6">
              
              {/* Category Badge automatically derived from URL */}
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-cyan-500/20 text-cyan-300 border border-cyan-400/30 rounded-full text-xs font-black uppercase tracking-wider">
                <ShieldCheck size={14} />
                <span>{target === "service" ? "Service Directory Feedback" : "Verified Client Review"}</span>
              </div>

              <div>
                <h1 className="text-3xl sm:text-4xl font-black tracking-tight font-display text-white leading-tight">
                  Share Your <span className="text-cyan-400">Experience</span>
                </h1>
                <p className="text-xs sm:text-sm text-blue-100/90 leading-relaxed mt-2 font-normal">
                  Your feedback helps us continuously improve our commercial HVAC engineering, equipment supply, and technical field services across the UAE.
                </p>
              </div>

              {/* Profile Photo Upload Widget (Prominent in Left Column) */}
              <div className="p-6 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-cyan-300">
                    Profile Photo <span className="text-blue-200 font-normal">(Optional)</span>
                  </span>
                  {authorAvatar && (
                    <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 px-2 py-0.5 rounded font-bold">
                      Photo Added
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-5">
                  {/* Photo Preview Circle */}
                  <div className="relative w-20 h-20 rounded-full bg-white/15 border-2 border-cyan-400/40 shadow-inner overflow-hidden shrink-0 flex items-center justify-center text-white">
                    {authorAvatar ? (
                      <img src={authorAvatar} alt="Profile Preview" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-2xl font-black text-cyan-300">
                        {authorName ? authorName.charAt(0).toUpperCase() : <Camera size={28} className="text-cyan-300" />}
                      </span>
                    )}
                  </div>

                  {/* Upload Controls */}
                  <div className="space-y-2">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      className="hidden"
                      id="profile-photo-upload"
                    />

                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="px-4 py-2 bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
                      >
                        <Upload size={14} />
                        <span>{authorAvatar ? "Change Image" : "Upload Photo"}</span>
                      </button>

                      {authorAvatar && (
                        <button
                          type="button"
                          onClick={handleRemovePhoto}
                          className="p-2 bg-white/10 hover:bg-red-500/30 text-white rounded-xl border border-white/20 transition-colors cursor-pointer"
                          title="Remove Photo"
                        >
                          <Trash2 size={15} />
                        </button>
                      )}
                    </div>
                    <p className="text-[11px] text-blue-200/80">Supports JPG, PNG or WEBP (Max 5MB).</p>
                  </div>
                </div>
              </div>

            </div>

            {/* Bottom Trust Badge */}
            <div className="relative z-10 pt-6 border-t border-white/10 mt-6 flex items-center justify-between text-xs text-blue-200">
              <span className="flex items-center gap-1.5">
                <Sparkles size={14} className="text-cyan-300" />
                <span>Cool Technologies UAE</span>
              </span>
              <span className="font-bold text-white">13+ Years of Quality</span>
            </div>

          </div>

          {/* Right Column: Review Submission Form (7 cols) */}
          <div className="lg:col-span-7 p-8 sm:p-10 flex flex-col justify-between">
            
            {!isSubmitted ? (
              <form onSubmit={handleSubmit} className="space-y-6">
                
                <div>
                  <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight font-display">
                    {target === "service" ? "Submit Service Directory Feedback" : "Submit Client Testimonial"}
                  </h2>
                  <p className="text-xs text-slate-500 font-medium mt-1">
                    Please fill out the form below. Once verified by our team, your review will be published live.
                  </p>
                </div>

                {/* Authenticated Account Identity Banner */}
                {user && (
                  <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-xl flex items-center justify-between text-xs text-[#031b4e]">
                    <span className="flex items-center gap-2 font-medium">
                      <ShieldCheck size={16} className="text-blue-600 shrink-0" />
                      <span>Authenticated as: <strong className="font-bold">{user.email || profile?.name}</strong></span>
                    </span>
                    <span className="text-[10px] text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded font-bold">
                      Verified Client
                    </span>
                  </div>
                )}

                {/* Grid Inputs (Desktop Responsive 2-column) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  
                  {/* Your Name */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Your Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Eng. Khalid Al-Mansoori"
                      value={authorName}
                      onChange={(e) => setAuthorName(e.target.value)}
                      className="w-full px-4 py-3 text-xs font-medium border border-slate-300 rounded-xl bg-white focus:outline-none focus:border-[#2563eb] focus:ring-2 focus:ring-blue-100 transition-all text-slate-800 placeholder:text-slate-400"
                    />
                  </div>

                  {/* Role / Title & Company */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Role / Title & Company
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Facility Director - Al Quoz"
                      value={authorRole}
                      onChange={(e) => setAuthorRole(e.target.value)}
                      className="w-full px-4 py-3 text-xs font-medium border border-slate-300 rounded-xl bg-white focus:outline-none focus:border-[#2563eb] focus:ring-2 focus:ring-blue-100 transition-all text-slate-800 placeholder:text-slate-400"
                    />
                  </div>

                </div>

                {/* Location / City */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Location / City
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Dubai Marina, UAE or Abu Dhabi"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full px-4 py-3 text-xs font-medium border border-slate-300 rounded-xl bg-white focus:outline-none focus:border-[#2563eb] focus:ring-2 focus:ring-blue-100 transition-all text-slate-800 placeholder:text-slate-400"
                  />
                </div>

                {/* Star Rating Interactive Selector */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Rating <span className="text-red-500">*</span>
                  </label>
                  <div className="flex items-center gap-2 bg-slate-50 p-3.5 rounded-xl border border-slate-200/80 w-fit">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        className="p-1 transition-transform hover:scale-110 cursor-pointer"
                      >
                        <Star
                          size={26}
                          className={`${
                            (hoverRating || rating) >= star
                              ? "fill-amber-400 text-amber-400"
                              : "text-slate-300"
                          }`}
                        />
                      </button>
                    ))}
                    <span className="ml-3 text-xs font-black text-slate-800">
                      {rating} out of 5 Stars
                    </span>
                  </div>
                </div>

                {/* Review Comment Textarea */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Your Review / Feedback <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    rows={5}
                    required
                    placeholder="Write your experience with Cool Technologies cooling products, delivery, or technical service..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    className="w-full px-4 py-3 text-xs font-medium border border-slate-300 rounded-xl bg-white focus:outline-none focus:border-[#2563eb] focus:ring-2 focus:ring-blue-100 transition-all text-slate-800 placeholder:text-slate-400 resize-y"
                  />
                </div>

                {/* Submit Button */}
                <div>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-8 py-3.5 bg-[#1d4ed8] hover:bg-[#1e40af] text-white font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <span>Submitting Review...</span>
                    ) : (
                      <span>Submit Review</span>
                    )}
                  </button>
                </div>

              </form>
            ) : (
              <div className="py-12 text-center space-y-4 animate-in fade-in duration-300 my-auto">
                <div className="w-16 h-16 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto shadow-inner">
                  <CheckCircle2 size={36} />
                </div>
                <h2 className="text-2xl font-black text-[#031b4e]">Review Submitted Successfully!</h2>
                <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
                  Thank you, <span className="font-bold text-slate-900">{authorName}</span>! Your review has been received and submitted for administrative verification. Once approved by our team, it will appear live on the website.
                </p>

                <div className="pt-4">
                  <a
                    href="#/"
                    className="inline-block px-6 py-3 bg-[#1d4ed8] text-white font-bold text-xs rounded-xl hover:bg-[#1e40af] transition-colors shadow-sm"
                  >
                    Return to Homepage
                  </a>
                </div>
              </div>
            )}

          </div>

        </div>

      </div>
    </div>
  );
}
