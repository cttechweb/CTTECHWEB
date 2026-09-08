import React, { useState, useEffect } from "react";
import {
  Briefcase,
  Plus,
  Search,
  Filter,
  Edit2,
  Trash2,
  Copy,
  Eye,
  ArrowUp,
  ArrowDown,
  CheckCircle2,
  AlertCircle,
  FileText,
  Mail,
  Phone,
  Building2,
  Calendar,
  Sparkles,
  RefreshCw,
  Save,
  Clock,
  MapPin,
  DollarSign,
  Award,
  ShieldCheck,
  TrendingUp,
  GraduationCap,
  Users,
  Zap,
  ExternalLink,
  ChevronRight,
  X,
  Download,
  Check,
  Flame,
  ChevronDown
} from "lucide-react";
import {
  JobPosting,
  CareersConfig,
  JobApplication,
  CareerBenefit,
  getJobPostings,
  saveJobPosting,
  deleteJobPosting,
  reorderJobPostings,
  resetDefaultJobs,
  getCareersConfig,
  saveCareersConfig,
  getJobApplications,
  updateJobApplication,
  deleteJobApplication,
  getLocalJobPostings,
  getLocalJobApplications,
  getLocalCareersConfig,
  DEFAULT_CAREERS_CONFIG
} from "../../services/careersService";

interface AdminCareersManagerProps {
  onShowToast?: (message: string) => void;
}

export default function AdminCareersManager({ onShowToast }: AdminCareersManagerProps) {
  const [activeSubTab, setActiveSubTab] = useState<"jobs" | "applications" | "settings">("jobs");

  // Job Postings State (Instant local load in 0ms)
  const [jobs, setJobs] = useState<JobPosting[]>(getLocalJobPostings);
  const [searchJobKeyword, setSearchJobKeyword] = useState<string>("");
  const [selectedDeptFilter, setSelectedDeptFilter] = useState<string>("All");
  const [isJobModalOpen, setIsJobModalOpen] = useState<boolean>(false);
  const [editingJob, setEditingJob] = useState<JobPosting | null>(null);

  // Job Applications State (Instant local load in 0ms)
  const [applications, setApplications] = useState<JobApplication[]>(getLocalJobApplications);
  const [appSearch, setAppSearch] = useState<string>("");
  const [appStatusFilter, setAppStatusFilter] = useState<string>("all");
  const [selectedApp, setSelectedApp] = useState<JobApplication | null>(null);

  // Careers Config State (Instant local load in 0ms)
  const [config, setConfig] = useState<CareersConfig>(getLocalCareersConfig);
  const [isSavingConfig, setIsSavingConfig] = useState<boolean>(false);

  // Section Minimize/Maximize States (Default all minimized)
  const [minimizedSections, setMinimizedSections] = useState<{ [key: string]: boolean }>({
    hero: true,
    hr: true,
    benefits: true
  });

  const toggleSection = (sectionKey: string) => {
    setMinimizedSections((prev) => ({
      ...prev,
      [sectionKey]: !prev[sectionKey]
    }));
  };

  useEffect(() => {
    // Non-blocking background sync
    getJobPostings().then((loaded) => { if (loaded && loaded.length > 0) setJobs(loaded); }).catch(() => {});
    getCareersConfig().then((loaded) => { if (loaded) setConfig(loaded); }).catch(() => {});
    getJobApplications().then((loaded) => { if (loaded) setApplications(loaded); }).catch(() => {});

    const handleCareersUpdate = () => {
      setJobs(getLocalJobPostings());
      setConfig(getLocalCareersConfig());
    };

    const handleAppsUpdate = () => {
      setApplications(getLocalJobApplications());
    };

    window.addEventListener("cooltech_careers_updated", handleCareersUpdate);
    window.addEventListener("cooltech_career_applications_updated", handleAppsUpdate);
    return () => {
      window.removeEventListener("cooltech_careers_updated", handleCareersUpdate);
      window.removeEventListener("cooltech_career_applications_updated", handleAppsUpdate);
    };
  }, []);

  // Filtered Job Postings
  const departmentsList = ["All", ...Array.from(new Set(jobs.map((j) => j.department).filter(Boolean)))];

  const filteredJobs = jobs.filter((job) => {
    const matchesDept = selectedDeptFilter === "All" || job.department === selectedDeptFilter;
    const matchesSearch =
      job.title.toLowerCase().includes(searchJobKeyword.toLowerCase()) ||
      job.department.toLowerCase().includes(searchJobKeyword.toLowerCase()) ||
      job.location.toLowerCase().includes(searchJobKeyword.toLowerCase()) ||
      job.summary.toLowerCase().includes(searchJobKeyword.toLowerCase());
    return matchesDept && matchesSearch;
  });

  // Filtered Applications
  const filteredApps = applications.filter((app) => {
    const matchesStatus = appStatusFilter === "all" || app.status === appStatusFilter;
    const matchesSearch =
      app.fullName.toLowerCase().includes(appSearch.toLowerCase()) ||
      app.email.toLowerCase().includes(appSearch.toLowerCase()) ||
      app.phone.toLowerCase().includes(appSearch.toLowerCase()) ||
      app.jobTitle.toLowerCase().includes(appSearch.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  /* ─────────────────────────────────────────────────────────────
     JOB POSTING HANDLERS
  ───────────────────────────────────────────────────────────── */

  const handleOpenCreateJob = () => {
    const newJob: JobPosting = {
      id: `job_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      title: "",
      department: "Sales & Account Management",
      location: "Dubai & Abu Dhabi, UAE",
      type: "Full-Time",
      experience: "3-5 Years",
      summary: "",
      responsibilities: [""],
      requirements: [""],
      salaryRange: "",
      isUrgent: false,
      isActive: true,
      order: jobs.length + 1
    };
    setEditingJob(newJob);
    setIsJobModalOpen(true);
  };

  const handleOpenEditJob = (job: JobPosting) => {
    setEditingJob({
      ...job,
      responsibilities: job.responsibilities?.length ? [...job.responsibilities] : [""],
      requirements: job.requirements?.length ? [...job.requirements] : [""]
    });
    setIsJobModalOpen(true);
  };

  const handleDuplicateJob = async (job: JobPosting) => {
    const duplicated: JobPosting = {
      ...job,
      id: `job_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      title: `${job.title} (Copy)`,
      order: jobs.length + 1,
      createdAt: new Date().toISOString()
    };
    await saveJobPosting(duplicated);
    const updated = await getJobPostings();
    setJobs(updated);
    if (onShowToast) onShowToast(`Duplicated "${job.title}" successfully!`);
  };

  const handleDeleteJob = async (jobId: string, title: string) => {
    if (window.confirm(`Are you sure you want to delete hiring post "${title}"?`)) {
      await deleteJobPosting(jobId);
      const updated = await getJobPostings();
      setJobs(updated);
      if (onShowToast) onShowToast(`Hiring post deleted.`);
    }
  };

  const handleToggleJobActive = async (job: JobPosting) => {
    const updated = { ...job, isActive: !job.isActive };
    await saveJobPosting(updated);
    setJobs(jobs.map((j) => (j.id === job.id ? updated : j)));
    if (onShowToast) onShowToast(`Hiring post "${job.title}" is now ${updated.isActive ? "Active" : "Hidden"}.`);
  };

  const handleMoveJobOrder = (index: number, direction: "up" | "down") => {
    const targetIdx = direction === "up" ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= jobs.length) return;

    const list = [...jobs];
    const temp = list[index];
    list[index] = list[targetIdx];
    list[targetIdx] = temp;

    const reindexed = reorderJobPostings(list);
    setJobs(reindexed);
    if (onShowToast) onShowToast("Updated job order.");
  };

  const handleSaveJobModal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingJob) return;

    if (!editingJob.title.trim()) {
      alert("Job Title is required.");
      return;
    }

    const cleanedResponsibilities = (editingJob.responsibilities || []).map((r) => r.trim()).filter(Boolean);
    const cleanedRequirements = (editingJob.requirements || []).map((r) => r.trim()).filter(Boolean);

    const toSave: JobPosting = {
      ...editingJob,
      title: editingJob.title.trim(),
      responsibilities: cleanedResponsibilities.length > 0 ? cleanedResponsibilities : ["Responsible for key operations."],
      requirements: cleanedRequirements.length > 0 ? cleanedRequirements : ["Relevant HVAC / engineering qualification."]
    };

    await saveJobPosting(toSave);
    const updated = await getJobPostings();
    setJobs(updated);
    setIsJobModalOpen(false);
    setEditingJob(null);
    if (onShowToast) onShowToast(`Hiring post "${toSave.title}" saved successfully!`);
  };

  const handleResetDefaultPostings = () => {
    if (window.confirm("Reset all job postings back to default 5 official roles?")) {
      const reset = resetDefaultJobs();
      setJobs(reset);
      if (onShowToast) onShowToast("Reset job postings to defaults.");
    }
  };

  /* ─────────────────────────────────────────────────────────────
     APPLICATION MANAGEMENT HANDLERS
  ───────────────────────────────────────────────────────────── */

  const handleUpdateAppStatus = (app: JobApplication, newStatus: JobApplication["status"]) => {
    const updated = { ...app, status: newStatus };
    // 1. Instant local UI update (0ms lag)
    setApplications((prev) => prev.map((a) => (a.id === app.id ? updated : a)));
    if (selectedApp && selectedApp.id === app.id) {
      setSelectedApp(updated);
    }
    if (onShowToast) onShowToast(`Updated candidate status to "${newStatus.toUpperCase()}".`);
    // 2. Async background sync to LocalStorage & Firestore
    updateJobApplication(updated).catch(() => {});
  };

  const handleDeleteApplication = (id: string, name: string) => {
    if (window.confirm(`Delete job application from "${name}"?`)) {
      setApplications((prev) => prev.filter((a) => a.id !== id));
      if (selectedApp && selectedApp.id === id) {
        setSelectedApp(null);
      }
      if (onShowToast) onShowToast("Application removed.");
      deleteJobApplication(id).catch(() => {});
    }
  };

  /* ─────────────────────────────────────────────────────────────
     CONFIG / HR SETTINGS HANDLERS
  ───────────────────────────────────────────────────────────── */

  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingConfig(true);
    await saveCareersConfig(config);
    setIsSavingConfig(false);
    if (onShowToast) onShowToast("Careers page and HR contact details updated successfully!");
  };

  const handleAddBenefit = () => {
    const newBenefit: CareerBenefit = {
      id: `benefit_${Date.now()}`,
      title: "New Career Benefit",
      description: "Describe this advantage or growth perk for candidates.",
      iconName: "ShieldCheck",
      order: (config.benefits?.length || 0) + 1,
      isActive: true
    };
    setConfig({
      ...config,
      benefits: [...(config.benefits || []), newBenefit]
    });
  };

  const handleUpdateBenefit = (index: number, updatedBenefit: Partial<CareerBenefit>) => {
    const current = [...(config.benefits || [])];
    current[index] = { ...current[index], ...updatedBenefit };
    setConfig({ ...config, benefits: current });
  };

  const handleDeleteBenefit = (index: number) => {
    const current = (config.benefits || []).filter((_, i) => i !== index);
    setConfig({ ...config, benefits: current });
  };

  return (
    <div className="space-y-6">
      
      {/* ─────────────────────────────────────────────────────────
          HEADER BAR
      ───────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-[#031b4e] text-white flex items-center justify-center shadow-md">
            <Briefcase size={22} className="text-[#2596be]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-black text-[#031b4e] uppercase tracking-tight">
                Careers & Hiring Manager
              </h2>
              <span className="bg-blue-50 text-[#2596be] text-[10px] font-black px-2.5 py-0.5 rounded-full border border-blue-100 uppercase tracking-widest">
                Dynamic Hub
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Manage open job postings, review applicant resumes, and customize HR contact details.
            </p>
          </div>
        </div>

        {/* Quick Stats Pill */}
        <div className="flex items-center gap-3 self-stretch sm:self-auto">
          <div className="flex items-center gap-2 bg-slate-50 px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-700">
            <Briefcase size={14} className="text-[#2596be]" />
            <span>{jobs.filter((j) => j.isActive).length} Active Roles</span>
          </div>
          <div className="flex items-center gap-2 bg-slate-50 px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-700">
            <FileText size={14} className="text-amber-500" />
            <span>{applications.length} Applications</span>
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────
          SUB-TAB NAVIGATION
      ───────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveSubTab("jobs")}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
            activeSubTab === "jobs"
              ? "bg-[#031b4e] text-white shadow-sm"
              : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
          }`}
        >
          <Briefcase size={14} />
          <span>Open Hiring Posts</span>
          <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-mono ${
            activeSubTab === "jobs" ? "bg-white/20 text-white" : "bg-slate-100 text-slate-700"
          }`}>
            {jobs.length}
          </span>
        </button>

        <button
          onClick={() => setActiveSubTab("applications")}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
            activeSubTab === "applications"
              ? "bg-[#031b4e] text-white shadow-sm"
              : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
          }`}
        >
          <FileText size={14} />
          <span>Received Applications</span>
          <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-mono ${
            activeSubTab === "applications" ? "bg-white/20 text-white" : "bg-amber-50 text-amber-700 border border-amber-200"
          }`}>
            {applications.length}
          </span>
        </button>

        <button
          onClick={() => setActiveSubTab("settings")}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
            activeSubTab === "settings"
              ? "bg-[#031b4e] text-white shadow-sm"
              : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
          }`}
        >
          <Building2 size={14} />
          <span>Page & HR Contacts</span>
        </button>
      </div>

      {/* ─────────────────────────────────────────────────────────
          TAB 1: OPEN HIRING POSTS
      ───────────────────────────────────────────────────────── */}
      {activeSubTab === "jobs" && (
        <div className="space-y-4">
          
          {/* Controls Bar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex flex-1 items-center gap-3 w-full md:w-auto">
              <div className="relative flex-1 max-w-md">
                <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search job title, skills, department..."
                  value={searchJobKeyword}
                  onChange={(e) => setSearchJobKeyword(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#2596be] font-medium"
                />
              </div>

              {/* Department Filter */}
              <select
                value={selectedDeptFilter}
                onChange={(e) => setSelectedDeptFilter(e.target.value)}
                className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#2596be] font-bold text-slate-700"
              >
                {departmentsList.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2.5 w-full md:w-auto justify-end">
              <button
                onClick={handleResetDefaultPostings}
                className="px-3.5 py-2 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl border border-slate-200 flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Reset back to default 5 official roles"
              >
                <RefreshCw size={13} />
                <span>Reset Defaults</span>
              </button>

              <button
                onClick={handleOpenCreateJob}
                className="px-4 py-2 text-xs font-bold text-white bg-[#031b4e] hover:bg-[#0f4c81] rounded-xl shadow-md flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <Plus size={14} />
                <span>Create Hiring Post</span>
              </button>
            </div>
          </div>

          {/* Job Postings List */}
          {filteredJobs.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 shadow-sm">
              <Briefcase size={36} className="mx-auto text-slate-300 mb-3" />
              <h3 className="text-sm font-black text-slate-700 uppercase">No Hiring Posts Found</h3>
              <p className="text-xs text-slate-400 font-medium mt-1">
                Try adjusting your search query or click "Create Hiring Post" above.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredJobs.map((job, idx) => {
                return (
                  <div
                    key={job.id}
                    className={`bg-white rounded-2xl p-5 border transition-all shadow-xs ${
                      job.isActive ? "border-slate-200 hover:border-blue-300" : "border-slate-200 bg-slate-50/70 opacity-75"
                    }`}
                  >
                    <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                      
                      {/* Left: Info & Badges */}
                      <div className="flex items-start gap-3.5 flex-1 min-w-0">
                        <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#031b4e] flex items-center justify-center font-mono font-black text-xs shrink-0 border border-blue-100 mt-0.5">
                          #{job.order || idx + 1}
                        </div>

                        <div className="space-y-1.5 flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="text-sm font-black text-[#031b4e] uppercase tracking-tight">
                              {job.title}
                            </h3>

                            {job.isUrgent && (
                              <span className="inline-flex items-center gap-1 text-[10px] font-black px-2 py-0.5 rounded-full bg-rose-50 text-rose-600 border border-rose-200">
                                <Flame size={10} />
                                <span>Urgent Hiring</span>
                              </span>
                            )}

                            <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border ${
                              job.isActive
                                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                : "bg-slate-100 text-slate-600 border-slate-200"
                            }`}>
                              {job.isActive ? "Active on Website" : "Hidden / Draft"}
                            </span>
                          </div>

                          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 font-medium">
                            <span className="flex items-center gap-1 text-[#2596be] font-bold">
                              <Building2 size={12} />
                              <span>{job.department}</span>
                            </span>
                            <span className="flex items-center gap-1">
                              <MapPin size={12} />
                              <span>{job.location}</span>
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock size={12} />
                              <span>{job.type} • {job.experience}</span>
                            </span>
                            {job.salaryRange && (
                              <span className="flex items-center gap-1 text-emerald-700 font-bold">
                                <DollarSign size={12} />
                                <span>{job.salaryRange}</span>
                              </span>
                            )}
                          </div>

                          <p className="text-xs text-slate-600 font-normal line-clamp-2 pt-0.5">
                            {job.summary}
                          </p>
                        </div>
                      </div>

                      {/* Right: Actions */}
                      <div className="flex items-center gap-1.5 self-end lg:self-center shrink-0">
                        {/* Move Up/Down */}
                        <div className="flex items-center border border-slate-200 rounded-xl overflow-hidden mr-1">
                          <button
                            onClick={() => handleMoveJobOrder(idx, "up")}
                            disabled={idx === 0}
                            className="p-1.5 text-slate-500 hover:bg-slate-100 disabled:opacity-30 cursor-pointer"
                            title="Move Up"
                          >
                            <ArrowUp size={13} />
                          </button>
                          <button
                            onClick={() => handleMoveJobOrder(idx, "down")}
                            disabled={idx === filteredJobs.length - 1}
                            className="p-1.5 text-slate-500 hover:bg-slate-100 disabled:opacity-30 cursor-pointer"
                            title="Move Down"
                          >
                            <ArrowDown size={13} />
                          </button>
                        </div>

                        {/* Toggle Active */}
                        <button
                          onClick={() => handleToggleJobActive(job)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer border ${
                            job.isActive
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                              : "bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200"
                          }`}
                        >
                          {job.isActive ? "Hide" : "Publish"}
                        </button>

                        {/* Edit */}
                        <button
                          onClick={() => handleOpenEditJob(job)}
                          className="p-2 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-xl border border-blue-200 transition-colors cursor-pointer"
                          title="Edit Job Details"
                        >
                          <Edit2 size={13} />
                        </button>

                        {/* Duplicate */}
                        <button
                          onClick={() => handleDuplicateJob(job)}
                          className="p-2 text-slate-600 bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-200 transition-colors cursor-pointer"
                          title="Duplicate Job"
                        >
                          <Copy size={13} />
                        </button>

                        {/* Delete */}
                        <button
                          onClick={() => handleDeleteJob(job.id, job.title)}
                          className="p-2 text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-xl border border-rose-200 transition-colors cursor-pointer"
                          title="Delete Job"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>

                    </div>
                  </div>
                );
              })}
            </div>
          )}

        </div>
      )}

      {/* ─────────────────────────────────────────────────────────
          TAB 2: RECEIVED JOB APPLICATIONS
      ───────────────────────────────────────────────────────── */}
      {activeSubTab === "applications" && (
        <div className="space-y-4">
          
          {/* Controls Bar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex flex-1 items-center gap-3 w-full md:w-auto">
              <div className="relative flex-1 max-w-md">
                <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search candidate name, email, phone, position..."
                  value={appSearch}
                  onChange={(e) => setAppSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#2596be] font-medium"
                />
              </div>

              {/* Status Filter */}
              <select
                value={appStatusFilter}
                onChange={(e) => setAppStatusFilter(e.target.value)}
                className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#2596be] font-bold text-slate-700"
              >
                <option value="all">All Statuses ({applications.length})</option>
                <option value="new">New ({applications.filter((a) => a.status === "new").length})</option>
                <option value="reviewed">Reviewed ({applications.filter((a) => a.status === "reviewed").length})</option>
                <option value="shortlisted">Shortlisted ({applications.filter((a) => a.status === "shortlisted").length})</option>
                <option value="rejected">Rejected ({applications.filter((a) => a.status === "rejected").length})</option>
              </select>
            </div>
          </div>

          {/* Applications Table / Cards */}
          {filteredApps.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 shadow-sm">
              <FileText size={36} className="mx-auto text-slate-300 mb-3" />
              <h3 className="text-sm font-black text-slate-700 uppercase">No Applications Found</h3>
              <p className="text-xs text-slate-400 font-medium mt-1">
                When candidates apply through the Careers page, their profiles and resumes will appear here.
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase font-black tracking-wider text-[10px]">
                    <tr>
                      <th className="py-3 px-4">Candidate</th>
                      <th className="py-3 px-4">Position</th>
                      <th className="py-3 px-4">Applied Date</th>
                      <th className="py-3 px-4">Resume</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredApps.map((app) => {
                      return (
                        <tr key={app.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-3.5 px-4 font-bold text-slate-800">
                            <div>
                              <p className="font-extrabold text-[#031b4e]">{app.fullName}</p>
                              <div className="flex items-center gap-2 text-[11px] text-slate-500 font-normal mt-0.5">
                                <span>{app.email}</span>
                                <span>•</span>
                                <span>{app.phone}</span>
                              </div>
                            </div>
                          </td>
                          <td className="py-3.5 px-4 font-bold text-slate-700">
                            <span className="bg-blue-50 text-[#031b4e] px-2.5 py-1 rounded-lg border border-blue-100 font-black text-[11px]">
                              {app.jobTitle}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-slate-500 font-medium">
                            {new Date(app.submittedAt).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric"
                            })}
                          </td>
                          <td className="py-3.5 px-4">
                            {app.resumeUrl ? (
                              <a
                                href={app.resumeUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1 px-2.5 py-1 bg-cyan-50 hover:bg-cyan-100 text-cyan-800 rounded-lg border border-cyan-200 text-[11px] font-bold transition-colors cursor-pointer"
                              >
                                <Download size={11} />
                                <span>{app.resumeFileName || "View Resume"}</span>
                              </a>
                            ) : (
                              <span className="text-slate-400 text-[11px] font-medium">No file</span>
                            )}
                          </td>
                          <td className="py-3.5 px-4">
                            <select
                              value={app.status}
                              onChange={(e) => handleUpdateAppStatus(app, e.target.value as any)}
                              className={`text-[11px] font-bold px-2.5 py-1 rounded-lg border cursor-pointer ${
                                app.status === "new"
                                  ? "bg-amber-50 text-amber-700 border-amber-200"
                                  : app.status === "shortlisted"
                                  ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                  : app.status === "reviewed"
                                  ? "bg-blue-50 text-blue-700 border-blue-200"
                                  : "bg-rose-50 text-rose-700 border-rose-200"
                              }`}
                            >
                              <option value="new">New</option>
                              <option value="reviewed">Reviewed</option>
                              <option value="shortlisted">Shortlisted</option>
                              <option value="rejected">Rejected</option>
                            </select>
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => setSelectedApp(app)}
                                className="p-1.5 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg border border-blue-200 transition-colors cursor-pointer"
                                title="View Details"
                              >
                                <Eye size={13} />
                              </button>
                              <button
                                onClick={() => handleDeleteApplication(app.id, app.fullName)}
                                className="p-1.5 text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-lg border border-rose-200 transition-colors cursor-pointer"
                                title="Delete Application"
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>
      )}

      {/* ─────────────────────────────────────────────────────────
          TAB 3: CAREERS PAGE & HR CONTACT SETTINGS
      ───────────────────────────────────────────────────────── */}
      {activeSubTab === "settings" && (
        <form onSubmit={handleSaveConfig} className="space-y-4">
          
          {/* 1. Hero Header Customization */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden transition-all">
            <div
              onClick={() => toggleSection("hero")}
              className="p-5 flex items-center justify-between cursor-pointer hover:bg-slate-50/80 transition-colors select-none"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#031b4e] flex items-center justify-center border border-blue-100 shrink-0">
                  <Sparkles size={18} className="text-[#2596be]" />
                </div>
                <div>
                  <h3 className="font-black text-sm text-[#031b4e] uppercase tracking-tight">
                    Careers Page Hero Banner
                  </h3>
                  {minimizedSections.hero ? (
                    <p className="text-[11px] text-slate-500 font-medium truncate max-w-md sm:max-w-xl mt-0.5">
                      Heading: <span className="font-bold text-slate-700">{config.heroTitle}</span> • Badge: <span className="font-bold text-slate-700">{config.heroBadge}</span>
                    </p>
                  ) : (
                    <p className="text-[11px] text-slate-400 font-medium mt-0.5">
                      Configure public hero badge, main heading, and introduction text.
                    </p>
                  )}
                </div>
              </div>

              <div className={`p-2 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 transition-transform shrink-0 ml-3 ${!minimizedSections.hero ? "rotate-180" : ""}`}>
                <ChevronDown size={18} />
              </div>
            </div>

            {!minimizedSections.hero && (
              <div className="p-6 pt-2 border-t border-slate-100 space-y-4 animate-in fade-in duration-150">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Hero Top Badge
                    </label>
                    <input
                      type="text"
                      value={config.heroBadge}
                      onChange={(e) => setConfig({ ...config, heroBadge: e.target.value })}
                      className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#2596be] font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Hero Main Heading
                    </label>
                    <input
                      type="text"
                      value={config.heroTitle}
                      onChange={(e) => setConfig({ ...config, heroTitle: e.target.value })}
                      className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#2596be] font-bold text-[#031b4e]"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Hero Subtitle Description
                    </label>
                    <textarea
                      rows={2}
                      value={config.heroSubtitle}
                      onChange={(e) => setConfig({ ...config, heroSubtitle: e.target.value })}
                      className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#2596be] font-medium leading-relaxed"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 2. HR Department Contact Details */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden transition-all">
            <div
              onClick={() => toggleSection("hr")}
              className="p-5 flex items-center justify-between cursor-pointer hover:bg-slate-50/80 transition-colors select-none"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#031b4e] flex items-center justify-center border border-blue-100 shrink-0">
                  <Mail size={18} className="text-[#2596be]" />
                </div>
                <div>
                  <h3 className="font-black text-sm text-[#031b4e] uppercase tracking-tight">
                    HR Department Contact Card Customization
                  </h3>
                  {minimizedSections.hr ? (
                    <p className="text-[11px] text-slate-500 font-medium truncate max-w-md sm:max-w-xl mt-0.5">
                      Email: <span className="font-bold text-slate-700">{config.hrEmail}</span> • Tel: <span className="font-bold text-slate-700">{config.hrPhone}</span>
                    </p>
                  ) : (
                    <p className="text-[11px] text-slate-400 font-medium mt-0.5">
                      Customize direct recruiter email, telephone, headquarters address, and operating hours.
                    </p>
                  )}
                </div>
              </div>

              <div className={`p-2 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 transition-transform shrink-0 ml-3 ${!minimizedSections.hr ? "rotate-180" : ""}`}>
                <ChevronDown size={18} />
              </div>
            </div>

            {!minimizedSections.hr && (
              <div className="p-6 pt-2 border-t border-slate-100 space-y-4 animate-in fade-in duration-150">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      HR Direct Email
                    </label>
                    <input
                      type="email"
                      value={config.hrEmail}
                      onChange={(e) => setConfig({ ...config, hrEmail: e.target.value })}
                      className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#2596be] font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      HR Telephone / Toll-Free
                    </label>
                    <input
                      type="text"
                      value={config.hrPhone}
                      onChange={(e) => setConfig({ ...config, hrPhone: e.target.value })}
                      className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#2596be] font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Headquarters & Interview Location
                    </label>
                    <input
                      type="text"
                      value={config.hrAddress}
                      onChange={(e) => setConfig({ ...config, hrAddress: e.target.value })}
                      className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#2596be] font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      HR Working Hours
                    </label>
                    <input
                      type="text"
                      value={config.hrWorkingHours}
                      onChange={(e) => setConfig({ ...config, hrWorkingHours: e.target.value })}
                      className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#2596be] font-medium"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Equal Opportunity Statement
                    </label>
                    <textarea
                      rows={2}
                      value={config.equalOpportunityText}
                      onChange={(e) => setConfig({ ...config, equalOpportunityText: e.target.value })}
                      className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#2596be] font-medium leading-relaxed"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 3. Why Work With Us Benefits */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden transition-all">
            <div
              onClick={() => toggleSection("benefits")}
              className="p-5 flex items-center justify-between cursor-pointer hover:bg-slate-50/80 transition-colors select-none"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#031b4e] flex items-center justify-center border border-blue-100 shrink-0">
                  <Award size={18} className="text-[#2596be]" />
                </div>
                <div>
                  <h3 className="font-black text-sm text-[#031b4e] uppercase tracking-tight">
                    "Why Work With Us" Advantages
                  </h3>
                  {minimizedSections.benefits ? (
                    <p className="text-[11px] text-slate-500 font-medium truncate max-w-md sm:max-w-xl mt-0.5">
                      {config.benefits?.length || 0} active employment advantage cards configured.
                    </p>
                  ) : (
                    <p className="text-[11px] text-slate-400 font-medium mt-0.5">
                      Manage value pillars and perks highlighted on the public careers landing page.
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0 ml-3">
                {!minimizedSections.benefits && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAddBenefit();
                    }}
                    className="px-3 py-1.5 text-xs font-bold text-[#031b4e] bg-blue-50 hover:bg-blue-100 rounded-xl border border-blue-200 flex items-center gap-1 cursor-pointer"
                  >
                    <Plus size={13} />
                    <span>Add Advantage</span>
                  </button>
                )}

                <div className={`p-2 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 transition-transform ${!minimizedSections.benefits ? "rotate-180" : ""}`}>
                  <ChevronDown size={18} />
                </div>
              </div>
            </div>

            {!minimizedSections.benefits && (
              <div className="p-6 pt-2 border-t border-slate-100 space-y-4 animate-in fade-in duration-150">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {(config.benefits || []).map((benefit, bIdx) => (
                    <div key={benefit.id || bIdx} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black uppercase text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                          Pillar #{bIdx + 1}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleDeleteBenefit(bIdx)}
                          className="text-rose-500 hover:text-rose-700 p-1 cursor-pointer"
                          title="Remove Benefit"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                          Title
                        </label>
                        <input
                          type="text"
                          value={benefit.title}
                          onChange={(e) => handleUpdateBenefit(bIdx, { title: e.target.value })}
                          className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-xl font-bold text-slate-800"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                          Description
                        </label>
                        <textarea
                          rows={2}
                          value={benefit.description}
                          onChange={(e) => handleUpdateBenefit(bIdx, { description: e.target.value })}
                          className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-xl font-medium text-slate-600"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Submit Button */}
          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={isSavingConfig}
              className="px-8 py-3.5 bg-[#031b4e] hover:bg-[#0f4c81] text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-lg transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Save size={15} />
              <span>{isSavingConfig ? "Saving Changes..." : "Save Careers Settings"}</span>
            </button>
          </div>

        </form>
      )}

      {/* ─────────────────────────────────────────────────────────
          MODAL: CREATE / EDIT JOB POSTING
      ───────────────────────────────────────────────────────── */}
      {isJobModalOpen && editingJob && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#031b4e] flex items-center justify-center font-bold">
                  <Briefcase size={18} className="text-[#2596be]" />
                </div>
                <div>
                  <h3 className="font-black text-base text-[#031b4e] uppercase tracking-tight">
                    {editingJob.title ? `Edit: ${editingJob.title}` : "Create New Hiring Post"}
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    Configure role specifications, department, requirements, and responsibilities.
                  </p>
                </div>
              </div>

              <button
                onClick={() => {
                  setIsJobModalOpen(false);
                  setEditingJob(null);
                }}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveJobModal} className="p-6 overflow-y-auto space-y-4 flex-1">
              
              {/* Job Title & Department */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Job Position Title *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Commercial HVAC Sales Engineer"
                    value={editingJob.title}
                    onChange={(e) => setEditingJob({ ...editingJob, title: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#2596be] font-bold text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Department *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Sales & Account Management, Engineering..."
                    value={editingJob.department}
                    onChange={(e) => setEditingJob({ ...editingJob, department: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#2596be] font-medium"
                  />
                </div>
              </div>

              {/* Location, Type, Experience, Salary */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Location
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Dubai & Abu Dhabi, UAE"
                    value={editingJob.location}
                    onChange={(e) => setEditingJob({ ...editingJob, location: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#2596be] font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Job Type
                  </label>
                  <select
                    value={editingJob.type}
                    onChange={(e) => setEditingJob({ ...editingJob, type: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#2596be] font-bold text-slate-700"
                  >
                    <option value="Full-Time">Full-Time</option>
                    <option value="Part-Time">Part-Time</option>
                    <option value="Contract">Contract</option>
                    <option value="Internship">Internship</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Experience
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 3-5 Years"
                    value={editingJob.experience}
                    onChange={(e) => setEditingJob({ ...editingJob, experience: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#2596be] font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Salary Range (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. AED 12,000 - 15,000"
                    value={editingJob.salaryRange || ""}
                    onChange={(e) => setEditingJob({ ...editingJob, salaryRange: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#2596be] font-medium"
                  />
                </div>
              </div>

              {/* Badges Toggles */}
              <div className="flex flex-wrap items-center gap-6 p-3 bg-slate-50 rounded-xl border border-slate-200">
                <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingJob.isActive}
                    onChange={(e) => setEditingJob({ ...editingJob, isActive: e.target.checked })}
                    className="w-4 h-4 text-[#031b4e] rounded focus:ring-blue-500"
                  />
                  <span>Active & Visible on Careers Page</span>
                </label>

                <label className="flex items-center gap-2 text-xs font-bold text-rose-600 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingJob.isUrgent || false}
                    onChange={(e) => setEditingJob({ ...editingJob, isUrgent: e.target.checked })}
                    className="w-4 h-4 text-rose-600 rounded focus:ring-rose-500"
                  />
                  <span>Mark as Urgent Hiring</span>
                </label>
              </div>

              {/* Summary */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Job Summary & Overview *
                </label>
                <textarea
                  rows={2}
                  required
                  placeholder="Provide a concise 1-2 sentence overview of the role and its key deliverables..."
                  value={editingJob.summary}
                  onChange={(e) => setEditingJob({ ...editingJob, summary: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#2596be] font-medium"
                />
              </div>

              {/* Responsibilities List */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Key Responsibilities
                  </label>
                  <button
                    type="button"
                    onClick={() => setEditingJob({
                      ...editingJob,
                      responsibilities: [...(editingJob.responsibilities || []), ""]
                    })}
                    className="text-[11px] font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer"
                  >
                    <Plus size={12} />
                    <span>Add Responsibility</span>
                  </button>
                </div>

                {(editingJob.responsibilities || []).map((resp, rIdx) => (
                  <div key={rIdx} className="flex items-center gap-2">
                    <span className="text-slate-400 text-xs font-mono">{rIdx + 1}.</span>
                    <input
                      type="text"
                      placeholder="e.g. Conduct heat load calculations and propose optimal chiller configurations."
                      value={resp}
                      onChange={(e) => {
                        const updated = [...(editingJob.responsibilities || [])];
                        updated[rIdx] = e.target.value;
                        setEditingJob({ ...editingJob, responsibilities: updated });
                      }}
                      className="flex-1 px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-medium focus:bg-white"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const updated = (editingJob.responsibilities || []).filter((_, i) => i !== rIdx);
                        setEditingJob({ ...editingJob, responsibilities: updated.length > 0 ? updated : [""] });
                      }}
                      className="p-2 text-rose-500 hover:text-rose-700 cursor-pointer"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                ))}
              </div>

              {/* Requirements List */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Qualifications & Requirements
                  </label>
                  <button
                    type="button"
                    onClick={() => setEditingJob({
                      ...editingJob,
                      requirements: [...(editingJob.requirements || []), ""]
                    })}
                    className="text-[11px] font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer"
                  >
                    <Plus size={12} />
                    <span>Add Requirement</span>
                  </button>
                </div>

                {(editingJob.requirements || []).map((req, reqIdx) => (
                  <div key={reqIdx} className="flex items-center gap-2">
                    <span className="text-slate-400 text-xs font-mono">{reqIdx + 1}.</span>
                    <input
                      type="text"
                      placeholder="e.g. Bachelor's Degree in Mechanical Engineering."
                      value={req}
                      onChange={(e) => {
                        const updated = [...(editingJob.requirements || [])];
                        updated[reqIdx] = e.target.value;
                        setEditingJob({ ...editingJob, requirements: updated });
                      }}
                      className="flex-1 px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-medium focus:bg-white"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const updated = (editingJob.requirements || []).filter((_, i) => i !== reqIdx);
                        setEditingJob({ ...editingJob, requirements: updated.length > 0 ? updated : [""] });
                      }}
                      className="p-2 text-rose-500 hover:text-rose-700 cursor-pointer"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                ))}
              </div>

              {/* Modal Footer */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsJobModalOpen(false);
                    setEditingJob(null);
                  }}
                  className="px-5 py-2.5 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 text-xs font-bold text-white bg-[#031b4e] hover:bg-[#0f4c81] rounded-xl shadow-md transition-all cursor-pointer"
                >
                  Save Hiring Post
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────
          MODAL: VIEW APPLICATION DETAILS
      ───────────────────────────────────────────────────────── */}
      {selectedApp && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-black uppercase text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-100">
                  Applicant Profile
                </span>
                <h3 className="text-lg font-black text-[#031b4e] mt-1">
                  {selectedApp.fullName}
                </h3>
              </div>
              <button
                onClick={() => setSelectedApp(null)}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4 text-xs">
              
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-bold uppercase text-[10px]">Applied Position</span>
                  <span className="font-extrabold text-[#031b4e] bg-white px-2.5 py-1 rounded-lg border border-slate-200">
                    {selectedApp.jobTitle}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-bold uppercase text-[10px]">Email Address</span>
                  <a href={`mailto:${selectedApp.email}`} className="font-bold text-[#2596be] hover:underline">
                    {selectedApp.email}
                  </a>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-bold uppercase text-[10px]">Contact Phone</span>
                  <a href={`tel:${selectedApp.phone}`} className="font-bold text-slate-700">
                    {selectedApp.phone}
                  </a>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-bold uppercase text-[10px]">Submission Time</span>
                  <span className="text-slate-600 font-medium">
                    {new Date(selectedApp.submittedAt).toLocaleString()}
                  </span>
                </div>
              </div>

              {selectedApp.coverMessage && (
                <div>
                  <h4 className="font-black text-slate-700 uppercase tracking-wider text-[11px] mb-1.5">
                    Cover Letter / Candidate Message
                  </h4>
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-slate-600 leading-relaxed font-medium">
                    {selectedApp.coverMessage}
                  </div>
                </div>
              )}

              {selectedApp.resumeUrl && (
                <div>
                  <h4 className="font-black text-slate-700 uppercase tracking-wider text-[11px] mb-1.5">
                    Attached Resume / CV
                  </h4>
                  <a
                    href={selectedApp.resumeUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-between p-3.5 bg-blue-50 hover:bg-blue-100 rounded-2xl border border-blue-200 text-blue-900 font-bold transition-all cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5">
                      <FileText size={16} className="text-[#2596be]" />
                      <span>{selectedApp.resumeFileName || "Candidate_Resume.pdf"}</span>
                    </div>
                    <ExternalLink size={14} className="text-blue-500" />
                  </a>
                </div>
              )}

              {/* Status Update In Modal */}
              <div>
                <h4 className="font-black text-slate-700 uppercase tracking-wider text-[11px] mb-1.5">
                  Recruiter Status
                </h4>
                <div className="flex flex-wrap gap-2">
                  {(["new", "reviewed", "shortlisted", "rejected"] as const).map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => handleUpdateAppStatus(selectedApp, st)}
                      className={`px-3 py-1.5 rounded-xl font-bold uppercase text-[10px] tracking-wider transition-all cursor-pointer border ${
                        selectedApp.status === st
                          ? "bg-[#031b4e] text-white border-[#031b4e] shadow-xs"
                          : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

            </div>

            <div className="p-4 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setSelectedApp(null)}
                className="px-5 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl cursor-pointer"
              >
                Close Profile
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
