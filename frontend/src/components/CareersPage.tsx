import React, { useState, useRef, useEffect } from "react";
import {
  Briefcase,
  MapPin,
  Clock,
  ChevronRight,
  Upload,
  CheckCircle2,
  Mail,
  Phone,
  Building2,
  Calendar,
  Send,
  Search,
  Filter,
  ShieldCheck,
  Award,
  TrendingUp,
  GraduationCap,
  Users,
  X,
  FileText,
  AlertCircle,
  ArrowDown,
  ArrowRight,
  Flame,
  DollarSign,
  Sparkles,
  Check
} from "lucide-react";

// Asset imports
// @ts-ignore
import heroBanner from "../assets/images/hvac_hero_banner_1784350809012.jpg";

import {
  JobPosting,
  CareersConfig,
  getJobPostings,
  getCareersConfig,
  getLocalJobPostings,
  getLocalCareersConfig,
  submitJobApplication,
  DEFAULT_CAREERS_CONFIG
} from "../services/careersService";
import { uploadDocumentFile } from "../services/storageService";

interface CareersPageProps {
  onOpenQuote?: (productName?: string) => void;
}

function getBenefitIcon(iconName?: string) {
  switch (iconName) {
    case "ShieldCheck":
      return <ShieldCheck size={24} className="text-[#2596be]" />;
    case "TrendingUp":
      return <TrendingUp size={24} className="text-[#2596be]" />;
    case "GraduationCap":
      return <GraduationCap size={24} className="text-[#2596be]" />;
    case "Users":
      return <Users size={24} className="text-[#2596be]" />;
    case "Award":
      return <Award size={24} className="text-[#2596be]" />;
    default:
      return <ShieldCheck size={24} className="text-[#2596be]" />;
  }
}

export default function CareersPage({ onOpenQuote }: CareersPageProps) {
  // Dynamic Data States (Instantly available in 0ms from local cache)
  const [jobs, setJobs] = useState<JobPosting[]>(getLocalJobPostings);
  const [config, setConfig] = useState<CareersConfig>(getLocalCareersConfig);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Filter & Search State
  const [selectedDepartment, setSelectedDepartment] = useState<string>("All");
  const [searchKeyword, setSearchKeyword] = useState<string>("");
  const [expandedJobId, setExpandedJobId] = useState<string | null>(null);

  // Application Form State
  const [formPosition, setFormPosition] = useState<string>("General Application");
  const [formJobId, setFormJobId] = useState<string>("general");
  const [fullName, setFullName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [phone, setPhone] = useState<string>("");
  const [coverMessage, setCoverMessage] = useState<string>("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitSuccess, setSubmitSuccess] = useState<boolean>(false);
  const [submittedRef, setSubmittedRef] = useState<string>("");

  const positionsSectionRef = useRef<HTMLDivElement>(null);
  const applicationFormRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Non-blocking background sync
    getJobPostings().then((loadedJobs) => {
      if (loadedJobs && loadedJobs.length > 0) setJobs(loadedJobs);
    }).catch(() => {});

    getCareersConfig().then((loadedConfig) => {
      if (loadedConfig) setConfig(loadedConfig);
    }).catch(() => {});

    const handleUpdate = () => {
      setJobs(getLocalJobPostings());
      setConfig(getLocalCareersConfig());
    };

    window.addEventListener("cooltech_careers_updated", handleUpdate);
    return () => window.removeEventListener("cooltech_careers_updated", handleUpdate);
  }, []);

  // Filter active jobs only
  const activeJobs = jobs.filter((job) => job.isActive !== false);

  // Dynamically derived departments list
  const departments = ["All", ...Array.from(new Set(activeJobs.map((job) => job.department).filter(Boolean)))];

  // Filter jobs based on active department tab and search keyword
  const filteredJobs = activeJobs.filter((job) => {
    const matchesDept = selectedDepartment === "All" || job.department === selectedDepartment;
    const matchesKeyword =
      job.title.toLowerCase().includes(searchKeyword.toLowerCase()) ||
      job.department.toLowerCase().includes(searchKeyword.toLowerCase()) ||
      job.location.toLowerCase().includes(searchKeyword.toLowerCase()) ||
      job.summary.toLowerCase().includes(searchKeyword.toLowerCase());
    return matchesDept && matchesKeyword;
  });

  const handleScrollToPositions = () => {
    positionsSectionRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleApplyClick = (job: JobPosting | { title: string; id: string }) => {
    setFormPosition(job.title);
    setFormJobId(job.id);
    applicationFormRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      // File size validation (limit 15MB)
      if (file.size > 15 * 1024 * 1024) {
        alert("File size exceeds 15MB. Please upload a smaller PDF or DOC file.");
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !email.trim() || !phone.trim()) {
      alert("Please fill in all required fields (Full Name, Email, and Phone Number).");
      return;
    }

    setIsSubmitting(true);
    setUploadProgress(20);

    try {
      let resumeUrl = "";
      let resumeFileName = "";

      if (selectedFile) {
        setUploadProgress(40);
        const uploaded = await uploadDocumentFile(selectedFile, "careers_resumes", (p) => {
          setUploadProgress(Math.max(40, Math.min(95, p)));
        });
        resumeUrl = uploaded.url;
        resumeFileName = uploaded.fileName || selectedFile.name;
      }

      setUploadProgress(100);

      const submitted = await submitJobApplication({
        jobId: formJobId,
        jobTitle: formPosition,
        fullName: fullName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        coverMessage: coverMessage.trim(),
        resumeUrl,
        resumeFileName
      });

      setSubmittedRef(submitted.id);
      setSubmitSuccess(true);
      setFullName("");
      setEmail("");
      setPhone("");
      setCoverMessage("");
      setSelectedFile(null);
      setUploadProgress(0);
    } catch (err) {
      console.error("[Careers] Application submission failed:", err);
      alert("An error occurred while submitting your application. Please try again or contact HR directly.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white text-slate-800 min-h-screen flex flex-col font-sans">
      
      {/* ----------------- 1. HERO SECTION ----------------- */}
      <section className="relative bg-[#031b4e] text-white overflow-hidden py-16 lg:py-24 border-b border-slate-800">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 z-0">
          <img
            src={heroBanner}
            alt="Cool Technologies Industrial Facility"
            className="w-full h-full object-cover object-center opacity-25"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#031b4e] via-[#031b4e]/95 to-[#031b4e]/80" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-xs text-slate-300 font-semibold mb-6">
            <a href="#/" className="hover:text-cyan-400 transition-colors">
              Home
            </a>
            <ChevronRight size={12} className="text-slate-500" />
            <span className="text-cyan-400 font-bold">Careers</span>
          </nav>

          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-cyan-500/10 border border-cyan-400/20 text-cyan-300 text-xs font-bold uppercase tracking-widest mb-4">
              <Building2 size={14} className="text-cyan-400" />
              <span>{config.heroBadge || "Join Our Team"}</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight font-display mb-6">
              {config.heroTitle || "Careers at Cool Technologies"}
            </h1>

            <p className="text-base sm:text-lg text-slate-300 leading-relaxed font-medium mb-8">
              {config.heroSubtitle || "Join a team dedicated to innovation, quality, and customer satisfaction. Build your career with one of the UAE's trusted industrial cooling solution providers."}
            </p>

            <div className="flex flex-wrap gap-4 items-center">
              <button
                onClick={handleScrollToPositions}
                className="bg-[#2596be] hover:bg-[#1f7d9f] text-white font-bold px-7 py-3.5 rounded-xl shadow-lg hover:shadow-cyan-500/20 transition-all flex items-center gap-2 text-sm cursor-pointer"
              >
                <span>View Open Positions ({activeJobs.length})</span>
                <ArrowDown size={16} />
              </button>

              {config.allowGeneralApplications !== false && (
                <button
                  onClick={() => handleApplyClick({ title: "General Application", id: "general" })}
                  className="bg-white/10 hover:bg-white/20 text-white border border-white/20 font-bold px-6 py-3.5 rounded-xl transition-all text-sm cursor-pointer"
                >
                  Submit General Resume
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ----------------- 2. WHY WORK WITH US ----------------- */}
      <section className="py-16 lg:py-20 bg-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-black uppercase tracking-widest text-[#2596be]">
              Career Advantages
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#031b4e] mt-2 font-display">
              Why Work With Us
            </h2>
            <p className="text-sm text-slate-600 mt-2 font-medium">
              We foster a supportive environment where technical talent thrives and long-term professional ambitions are fulfilled.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {(config.benefits || []).map((b, idx) => (
              <div key={b.id || idx} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                <div className="w-12 h-12 rounded-xl bg-blue-50 text-[#031b4e] flex items-center justify-center mb-5">
                  {getBenefitIcon(b.iconName)}
                </div>
                <h3 className="text-base font-extrabold text-[#031b4e] mb-2 font-display">
                  {b.title}
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed font-medium">
                  {b.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ----------------- 3. OPEN POSITIONS & RECRUITMENT ----------------- */}
      <section ref={positionsSectionRef} className="py-16 lg:py-24 bg-white border-b border-slate-200" id="open-positions">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
            <div>
              <span className="text-xs font-black uppercase tracking-widest text-[#2596be]">
                Current Opportunities
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#031b4e] mt-2 font-display">
                Open Career Positions
              </h2>
              <p className="text-sm text-slate-600 mt-1 font-medium">
                Explore rewarding engineering, sales, maintenance, and supply chain roles across the UAE.
              </p>
            </div>

            {/* Keyword Search Input */}
            <div className="relative w-full md:w-72">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search position or skill..."
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#2596be] focus:bg-white text-slate-800 font-medium"
              />
            </div>
          </div>

          {/* Department Filter Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-8 custom-scrollbar">
            <Filter size={14} className="text-slate-400 shrink-0 mr-1" />
            {departments.map((dept) => (
              <button
                key={dept}
                onClick={() => setSelectedDepartment(dept)}
                className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  selectedDepartment === dept
                    ? "bg-[#031b4e] text-white shadow-sm"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {dept}
              </button>
            ))}
          </div>

          {/* Job Listings Accordion/Cards */}
          <div className="space-y-4">
            {filteredJobs.length === 0 ? (
              <div className="bg-slate-50 rounded-2xl p-12 text-center border border-slate-200">
                <Briefcase size={36} className="mx-auto text-slate-400 mb-3" />
                <h3 className="text-base font-bold text-slate-700">No matching positions found</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Try searching for a different term or submit a general application below.
                </p>
                <button
                  onClick={() => handleApplyClick({ title: "General Application", id: "general" })}
                  className="mt-4 px-5 py-2.5 bg-[#2596be] hover:bg-[#1f7d9f] text-white font-bold text-xs rounded-xl shadow-md cursor-pointer inline-flex items-center gap-2"
                >
                  <span>Submit General Application</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            ) : (
              filteredJobs.map((job) => {
                const isExpanded = expandedJobId === job.id;
                return (
                  <div
                    key={job.id}
                    className={`bg-white rounded-2xl border transition-all duration-200 overflow-hidden ${
                      isExpanded
                        ? "border-[#2596be] shadow-md ring-1 ring-[#2596be]/20"
                        : "border-slate-200 hover:border-slate-300 shadow-xs"
                    }`}
                  >
                    {/* Header Summary */}
                    <div
                      onClick={() => setExpandedJobId(isExpanded ? null : job.id)}
                      className="p-6 cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-4 select-none"
                    >
                      <div className="space-y-2 flex-1">
                        <div className="flex flex-wrap items-center gap-2.5">
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-blue-50 text-[#031b4e] border border-blue-100">
                            {job.department}
                          </span>
                          {job.isUrgent && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-rose-50 text-rose-600 border border-rose-200">
                              <Flame size={10} />
                              <span>Urgent</span>
                            </span>
                          )}
                          <span className="text-xs text-slate-400">•</span>
                          <span className="text-xs font-semibold text-slate-500 flex items-center gap-1">
                            <Clock size={13} className="text-slate-400" />
                            <span>{job.type}</span>
                          </span>
                          <span className="text-xs text-slate-400">•</span>
                          <span className="text-xs font-semibold text-slate-500 flex items-center gap-1">
                            <MapPin size={13} className="text-slate-400" />
                            <span>{job.location}</span>
                          </span>
                        </div>

                        <h3 className="text-lg font-extrabold text-[#031b4e] font-display">
                          {job.title}
                        </h3>

                        <p className="text-xs text-slate-600 leading-relaxed font-medium line-clamp-2">
                          {job.summary}
                        </p>
                      </div>

                      {/* Right Action & Expand Trigger */}
                      <div className="flex items-center gap-3 shrink-0 self-end md:self-center">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleApplyClick(job);
                          }}
                          className="px-5 py-2.5 bg-[#031b4e] hover:bg-blue-900 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                        >
                          <span>Apply Now</span>
                          <ArrowRight size={13} />
                        </button>
                        
                        <div className={`p-2 rounded-xl bg-slate-100 text-slate-500 transition-transform ${isExpanded ? "rotate-90" : ""}`}>
                          <ChevronRight size={16} />
                        </div>
                      </div>
                    </div>

                    {/* Expanded Details Body */}
                    {isExpanded && (
                      <div className="px-6 pb-6 pt-2 border-t border-slate-100 bg-slate-50/50 space-y-6">
                        {job.salaryRange && (
                          <div className="flex items-center gap-2 text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200 inline-flex">
                            <DollarSign size={14} />
                            <span>Compensation: {job.salaryRange}</span>
                          </div>
                        )}

                        {/* Responsibilities */}
                        <div>
                          <h4 className="text-xs font-black uppercase tracking-wider text-[#031b4e] mb-3 flex items-center gap-1.5">
                            <CheckCircle2 size={14} className="text-[#2596be]" />
                            <span>Key Responsibilities</span>
                          </h4>
                          <ul className="space-y-2">
                            {job.responsibilities.map((resp, idx) => (
                              <li key={idx} className="text-xs text-slate-600 font-medium flex items-start gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-[#2596be] mt-1.5 shrink-0" />
                                <span>{resp}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* Requirements */}
                        <div>
                          <h4 className="text-xs font-black uppercase tracking-wider text-[#031b4e] mb-3 flex items-center gap-1.5">
                            <ShieldCheck size={14} className="text-[#2596be]" />
                            <span>Qualifications & Requirements</span>
                          </h4>
                          <ul className="space-y-2">
                            {job.requirements.map((req, idx) => (
                              <li key={idx} className="text-xs text-slate-600 font-medium flex items-start gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-slate-400 mt-1.5 shrink-0" />
                                <span>{req}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* Apply Trigger Inside Box */}
                        <div className="pt-4 border-t border-slate-200/60 flex items-center justify-between">
                          <span className="text-xs text-slate-500 font-medium">
                            Experience required: <strong>{job.experience}</strong>
                          </span>
                          <button
                            onClick={() => handleApplyClick(job)}
                            className="px-6 py-2.5 bg-[#2596be] hover:bg-[#1f7d9f] text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer"
                          >
                            <span>Apply for this Role</span>
                            <ArrowRight size={14} />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>

        </div>
      </section>

      {/* ----------------- 4. APPLICATION FORM & HR SIDEBAR ----------------- */}
      <section ref={applicationFormRef} className="py-16 lg:py-24 bg-slate-50" id="apply-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            
            {/* 5. APPLICATION FORM (Left Column) */}
            <div className="lg:col-span-8 bg-white p-6 sm:p-10 rounded-2xl border border-slate-200 shadow-md">
              <div className="mb-8">
                <span className="text-xs font-black uppercase tracking-widest text-[#2596be]">
                  Candidate Submission
                </span>
                <h3 className="text-2xl font-extrabold text-[#031b4e] mt-1 font-display">
                  Submit Your Application
                </h3>
                <p className="text-xs text-slate-500 font-medium mt-1">
                  Applying for: <strong className="text-[#031b4e] bg-blue-50 px-2.5 py-0.5 rounded-md border border-blue-100">{formPosition}</strong>
                </p>
              </div>

              {submitSuccess ? (
                <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-8 text-center space-y-4 animate-in fade-in">
                  <div className="w-14 h-14 bg-emerald-500 text-white rounded-full flex items-center justify-center mx-auto shadow-md">
                    <Check size={28} />
                  </div>
                  <h4 className="text-lg font-extrabold text-emerald-900 font-display">
                    Application Received Successfully!
                  </h4>
                  <p className="text-xs text-emerald-700 max-w-md mx-auto leading-relaxed font-medium">
                    Thank you for applying to Cool Technologies. Our Human Resources and Technical Recruitment team will review your qualifications and reach out within 3–5 business days.
                  </p>
                  {submittedRef && (
                    <div className="inline-block bg-white px-3 py-1 rounded-lg border border-emerald-200 text-[11px] font-mono text-emerald-800">
                      Ref: {submittedRef}
                    </div>
                  )}
                  <div className="pt-2">
                    <button
                      onClick={() => setSubmitSuccess(false)}
                      className="px-6 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
                    >
                      Submit Another Application
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleFormSubmit} className="space-y-6">
                  
                  {/* Position selector */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                      Selected Position *
                    </label>
                    <select
                      value={formPosition}
                      onChange={(e) => {
                        setFormPosition(e.target.value);
                        const match = activeJobs.find((j) => j.title === e.target.value);
                        setFormJobId(match ? match.id : "general");
                      }}
                      className="w-full px-4 py-3 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2596be] focus:bg-white text-slate-800 font-bold"
                    >
                      {activeJobs.map((j) => (
                        <option key={j.id} value={j.title}>{j.title}</option>
                      ))}
                      <option value="General Application">General Application (All Disciplines)</option>
                    </select>
                  </div>

                  {/* Name & Email */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Tariq Mansoor"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="w-full px-4 py-3 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2596be] focus:bg-white text-slate-800 font-medium"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        required
                        placeholder="e.g. candidate@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-4 py-3 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2596be] focus:bg-white text-slate-800 font-medium"
                      />
                    </div>
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                      Phone Number (with country code) *
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="e.g. +971 50 123 4567"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full px-4 py-3 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2596be] focus:bg-white text-slate-800 font-medium"
                    />
                  </div>

                  {/* Resume Upload Dropzone */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                      Attach Resume / Curriculum Vitae (PDF, DOC, DOCX)
                    </label>
                    <div className="border-2 border-dashed border-slate-200 hover:border-[#2596be] rounded-2xl p-6 text-center bg-slate-50/50 hover:bg-blue-50/20 transition-all">
                      <input
                        type="file"
                        id="resume-upload"
                        accept=".pdf,.doc,.docx"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                      <label htmlFor="resume-upload" className="cursor-pointer flex flex-col items-center gap-1.5">
                        <Upload size={22} className="text-[#2596be]" />
                        <span className="text-xs font-bold text-slate-700">
                          {selectedFile ? selectedFile.name : "Click to select or drag PDF / DOC resume file"}
                        </span>
                        <span className="text-[10px] text-slate-400 font-medium">
                          Maximum file size: 15MB
                        </span>
                      </label>
                    </div>
                  </div>

                  {/* Cover Message */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                      Cover Message (Optional)
                    </label>
                    <textarea
                      rows={4}
                      placeholder="Briefly introduce yourself, your relevant HVAC experience, or current UAE visa status..."
                      value={coverMessage}
                      onChange={(e) => setCoverMessage(e.target.value)}
                      className="w-full px-4 py-3 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2596be] focus:bg-white text-slate-800 font-medium"
                    />
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full sm:w-auto px-8 py-3.5 bg-[#031b4e] hover:bg-blue-900 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <span>Submitting Application {uploadProgress > 0 ? `(${uploadProgress}%)` : "..."}</span>
                    ) : (
                      <>
                        <Send size={14} />
                        <span>Submit Application</span>
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>

            {/* 6. CONTACT HR Sidebar Card */}
            <div className="lg:col-span-4 space-y-6">
              <div className="bg-[#031b4e] text-white p-6 sm:p-8 rounded-2xl shadow-md border border-slate-800">
                <span className="text-xs font-black uppercase tracking-widest text-cyan-400">
                  Human Resources
                </span>
                <h3 className="text-xl font-extrabold font-display mt-1 mb-4">
                  Contact HR Department
                </h3>
                <p className="text-xs text-slate-300 font-medium leading-relaxed mb-6">
                  For inquiries regarding recruitment status, partnership opportunities, or job specifications, reach out directly to our HR team.
                </p>

                <div className="space-y-4 text-xs font-medium">
                  {/* HR Email */}
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center shrink-0 mt-0.5 text-cyan-400">
                      <Mail size={16} />
                    </div>
                    <div>
                      <p className="text-[10px] uppercase font-black text-slate-400">HR Direct Email</p>
                      <a href={`mailto:${config.hrEmail || "careers@cooltech.ae"}`} className="text-white hover:text-cyan-300 font-bold">
                        {config.hrEmail || "careers@cooltech.ae"}
                      </a>
                    </div>
                  </div>

                  {/* HR Phone */}
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center shrink-0 mt-0.5 text-cyan-400">
                      <Phone size={16} />
                    </div>
                    <div>
                      <p className="text-[10px] uppercase font-black text-slate-400">HR Telephone</p>
                      <p className="text-white font-bold">{config.hrPhone || "+971 4 388 9900 / 800 COOL"}</p>
                    </div>
                  </div>

                  {/* Office Address */}
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center shrink-0 mt-0.5 text-cyan-400">
                      <Building2 size={16} />
                    </div>
                    <div>
                      <p className="text-[10px] uppercase font-black text-slate-400">Headquarters Address</p>
                      <p className="text-slate-300">
                        {config.hrAddress || "Cool Technologies HQ, Al Quoz Industrial Area 3, P.O. Box 48821, Dubai, United Arab Emirates"}
                      </p>
                    </div>
                  </div>

                  {/* Working Hours */}
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center shrink-0 mt-0.5 text-cyan-400">
                      <Calendar size={16} />
                    </div>
                    <div>
                      <p className="text-[10px] uppercase font-black text-slate-400">Working Hours</p>
                      <p className="text-slate-300">{config.hrWorkingHours || "Monday - Friday: 8:00 AM - 6:00 PM (GST)"}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

    </div>
  );
}
