import React, { useState, useEffect } from "react";
import { 
  ShieldCheck, 
  Search, 
  Filter, 
  Eye, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Building2, 
  User, 
  Phone, 
  Mail, 
  FileText, 
  ExternalLink, 
  AlertCircle, 
  Loader2, 
  RefreshCw,
  MapPin,
  Calendar,
  DollarSign,
  Tag,
  Shield,
  Briefcase,
  X,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { apiClient } from "../../services/apiClient";

interface RetailerAppItem {
  id: string;
  userId: string;
  companyName: string;
  legalName?: string;
  tradeLicenseNumber?: string;
  taxRegistrationNumber?: string;
  contactPerson: string;
  designation?: string;
  email: string;
  phone: string;
  whatsappNumber?: string;
  city?: string;
  emirate?: string;
  address?: string;
  businessType?: string;
  interestedCategories?: string;
  annualVolumeEstimate?: string;
  paymentTermsRequested?: string;
  tradeLicenseDocUrl?: string;
  taxCertificateDocUrl?: string;
  tradeLicenseFileUrl?: string;
  taxCertificateFileUrl?: string;
  applicationPayloadJson?: any;
  status: "pending" | "under_review" | "approved" | "rejected";
  rejectionReason?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  createdAt: string;
  updatedAt?: string;
}

interface AdminRetailerApplicationsManagerProps {
  onShowToast?: (msg: string) => void;
}

export default function AdminRetailerApplicationsManager({ onShowToast }: AdminRetailerApplicationsManagerProps) {
  const [applications, setApplications] = useState<RetailerAppItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  
  // Selected Application for Inspection / Review Modal
  const [selectedApp, setSelectedApp] = useState<RetailerAppItem | null>(null);
  const [isReviewing, setIsReviewing] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [actionError, setActionError] = useState("");

  const loadApplications = async () => {
    setIsLoading(true);
    try {
      const res = await apiClient.listRetailerApplications();
      if (res?.applications) {
        setApplications(res.applications);
      }
    } catch (err: any) {
      console.error("[Admin Retailer Applications] Load error:", err);
      if (onShowToast) onShowToast("Failed to load retailer applications from database.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadApplications();
  }, []);

  const handleReviewAction = async (status: "approved" | "rejected" | "under_review") => {
    if (!selectedApp) return;
    
    if (status === "rejected" && !rejectionReason.trim()) {
      setActionError("Please provide a reason for rejecting this application.");
      return;
    }

    setIsReviewing(true);
    setActionError("");

    try {
      await apiClient.reviewRetailerApplication(selectedApp.id, {
        status,
        rejectionReason: status === "rejected" ? rejectionReason.trim() : undefined,
      });

      if (onShowToast) {
        onShowToast(
          status === "approved"
            ? `Approved application ${selectedApp.id}. User promoted to B2B Retailer.`
            : status === "rejected"
            ? `Rejected application ${selectedApp.id}.`
            : `Marked application ${selectedApp.id} as Under Review.`
        );
      }

      setSelectedApp(null);
      setRejectionReason("");
      await loadApplications();
    } catch (err: any) {
      console.error("[Admin Review Action Error]:", err);
      setActionError(err?.message || "Failed to update application status.");
    } finally {
      setIsReviewing(false);
    }
  };

  // Filtered applications
  const filteredApps = applications.filter((app) => {
    const matchesSearch = 
      (app.companyName || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (app.contactPerson || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (app.email || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (app.id || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (app.tradeLicenseNumber || "").toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === "all" || app.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Pagination State
  const [appPage, setAppPage] = useState(1);
  const APP_PAGE_SIZE = 10;

  useEffect(() => {
    setAppPage(1);
  }, [searchTerm, statusFilter]);

  const totalAppPages = Math.ceil(filteredApps.length / APP_PAGE_SIZE) || 1;
  const validAppPage = Math.min(appPage, totalAppPages);
  const startAppIdx = (validAppPage - 1) * APP_PAGE_SIZE;
  const endAppIdx = Math.min(startAppIdx + APP_PAGE_SIZE, filteredApps.length);
  const paginatedApps = filteredApps.slice(startAppIdx, endAppIdx);

  const pendingCount = applications.filter((a) => a.status === "pending").length;
  const underReviewCount = applications.filter((a) => a.status === "under_review").length;
  const approvedCount = applications.filter((a) => a.status === "approved").length;
  const rejectedCount = applications.filter((a) => a.status === "rejected").length;

  return (
    <div className="space-y-6">
      
      {/* Top Header Card */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-500"></span>
            <span className="text-[11px] font-black uppercase tracking-wider text-[#031b4e]">
              B2B Commercial Compliance
            </span>
          </div>
          <h2 className="text-xl font-black text-slate-900 mt-1 flex items-center gap-2">
            <ShieldCheck size={22} className="text-[#0f4c81]" />
            <span>Retailer & Contractor Applications</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Review submitted trade licenses, verify commercial entities & authorize wholesale B2B retailer accounts.
          </p>
        </div>

        <button
          type="button"
          onClick={loadApplications}
          disabled={isLoading}
          className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl flex items-center gap-2 transition-colors cursor-pointer self-start sm:self-auto disabled:opacity-50"
        >
          <RefreshCw size={14} className={isLoading ? "animate-spin" : ""} />
          <span>Refresh Queue</span>
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div 
          onClick={() => setStatusFilter("pending")}
          className={`p-4 rounded-xl border transition-all cursor-pointer ${
            statusFilter === "pending"
              ? "bg-amber-50/80 border-amber-300 shadow-2xs"
              : "bg-white border-slate-200 hover:bg-slate-50"
          }`}
        >
          <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider block">Pending Review</span>
          <p className="text-2xl font-black text-amber-900 mt-1">{pendingCount}</p>
        </div>

        <div 
          onClick={() => setStatusFilter("under_review")}
          className={`p-4 rounded-xl border transition-all cursor-pointer ${
            statusFilter === "under_review"
              ? "bg-blue-50/80 border-blue-300 shadow-2xs"
              : "bg-white border-slate-200 hover:bg-slate-50"
          }`}
        >
          <span className="text-[10px] font-bold text-blue-700 uppercase tracking-wider block">Under Review</span>
          <p className="text-2xl font-black text-blue-900 mt-1">{underReviewCount}</p>
        </div>

        <div 
          onClick={() => setStatusFilter("approved")}
          className={`p-4 rounded-xl border transition-all cursor-pointer ${
            statusFilter === "approved"
              ? "bg-emerald-50/80 border-emerald-300 shadow-2xs"
              : "bg-white border-slate-200 hover:bg-slate-50"
          }`}
        >
          <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider block">Approved Partners</span>
          <p className="text-2xl font-black text-emerald-900 mt-1">{approvedCount}</p>
        </div>

        <div 
          onClick={() => setStatusFilter("rejected")}
          className={`p-4 rounded-xl border transition-all cursor-pointer ${
            statusFilter === "rejected"
              ? "bg-red-50/80 border-red-300 shadow-2xs"
              : "bg-white border-slate-200 hover:bg-slate-50"
          }`}
        >
          <span className="text-[10px] font-bold text-red-700 uppercase tracking-wider block">Rejected</span>
          <p className="text-2xl font-black text-red-900 mt-1">{rejectedCount}</p>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-3 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by company name, contact person, email, license number, or reference ID..."
            className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#031b4e]/15 focus:border-[#031b4e]"
          />
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Filter size={15} className="text-slate-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#031b4e]/15"
          >
            <option value="all">All Statuses ({applications.length})</option>
            <option value="pending">Pending ({pendingCount})</option>
            <option value="under_review">Under Review ({underReviewCount})</option>
            <option value="approved">Approved ({approvedCount})</option>
            <option value="rejected">Rejected ({rejectedCount})</option>
          </select>
        </div>
      </div>

      {/* Applications Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
        {isLoading ? (
          <div className="py-16 flex flex-col items-center justify-center space-y-3">
            <Loader2 className="w-8 h-8 text-[#031b4e] animate-spin" />
            <p className="text-xs font-bold text-slate-500">Loading retailer applications from D1...</p>
          </div>
        ) : filteredApps.length === 0 ? (
          <div className="py-16 text-center space-y-2">
            <ShieldCheck size={36} className="text-slate-300 mx-auto" />
            <h4 className="font-extrabold text-slate-700 text-sm">No Retailer Applications Found</h4>
            <p className="text-xs text-slate-400 max-w-sm mx-auto font-medium">
              {searchTerm || statusFilter !== "all"
                ? "No applications match your search filters."
                : "No reseller applications have been submitted yet."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50/90 text-slate-500 font-extrabold uppercase text-[10px] tracking-wider border-b border-slate-200">
                  <th className="py-3 px-4">Ref ID / Date</th>
                  <th className="py-3 px-4">Company Details</th>
                  <th className="py-3 px-4">Contact Person</th>
                  <th className="py-3 px-4">Trade License & TRN</th>
                  <th className="py-3 px-4">Location</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginatedApps.map((app) => (
                  <tr key={app.id} className="hover:bg-slate-50/80 transition-colors">
                    
                    {/* ID & Date */}
                    <td className="py-3.5 px-4 font-mono">
                      <span className="font-black text-slate-900 block">{app.id}</span>
                      <span className="text-[10px] text-slate-400 font-sans">
                        {new Date(app.createdAt).toLocaleDateString()}
                      </span>
                    </td>

                    {/* Company */}
                    <td className="py-3.5 px-4">
                      <span className="font-extrabold text-slate-900 block leading-tight">
                        {app.companyName}
                      </span>
                      <span className="text-[10px] text-slate-400 font-semibold block mt-0.5">
                        {app.tradeActivity || "Commercial Reseller"}
                      </span>
                    </td>

                    {/* Contact */}
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900 leading-tight">{app.contactPerson}</div>
                      <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                        <Mail size={11} className="text-slate-400" />
                        <span>{app.email}</span>
                      </div>
                      <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                        <Phone size={11} className="text-slate-400" />
                        <span>{app.phone}</span>
                      </div>
                    </td>

                    {/* License & Tax */}
                    <td className="py-3.5 px-4 font-mono text-[11px]">
                      <div className="text-slate-800 font-bold">
                        TL: {app.tradeLicenseNumber || "N/A"}
                      </div>
                      {app.trnNumber && (
                        <div className="text-[10px] text-slate-400 mt-0.5">
                          TRN: {app.trnNumber}
                        </div>
                      )}
                    </td>

                    {/* Location */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1 text-slate-700 font-semibold text-[11px]">
                        <MapPin size={12} className="text-slate-400 shrink-0" />
                        <span>{app.city}, {app.country}</span>
                      </div>
                    </td>

                    {/* Status Badge */}
                    <td className="py-3.5 px-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                        app.status === "approved"
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                          : app.status === "rejected"
                          ? "bg-red-50 text-red-700 border-red-200"
                          : app.status === "under_review"
                          ? "bg-blue-50 text-blue-700 border-blue-200"
                          : "bg-amber-50 text-amber-800 border-amber-300 animate-pulse"
                      }`}>
                        {app.status === "approved" && <CheckCircle2 size={11} />}
                        {app.status === "rejected" && <XCircle size={11} />}
                        {app.status === "pending" && <Clock size={11} />}
                        <span>{app.status.replace("_", " ")}</span>
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedApp(app);
                          setRejectionReason(app.rejectionReason || "");
                          setActionError("");
                        }}
                        className="px-3 py-1.5 bg-slate-900 hover:bg-[#031b4e] text-white rounded-lg text-xs font-bold transition-all shadow-2xs flex items-center gap-1.5 ml-auto cursor-pointer"
                      >
                        <Eye size={12} />
                        <span>Inspect & Review</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Retailer Applications Pagination Footer */}
            {filteredApps.length > APP_PAGE_SIZE && (
              <div className="p-4 border-t border-slate-200 bg-white flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                <div className="text-slate-500 font-medium">
                  Showing <span className="font-bold text-slate-800">{startAppIdx + 1}</span> to{" "}
                  <span className="font-bold text-slate-800">{endAppIdx}</span> of{" "}
                  <span className="font-bold text-slate-800">{filteredApps.length}</span> applications
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setAppPage((p) => Math.max(1, p - 1))}
                    disabled={validAppPage <= 1}
                    className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900 disabled:opacity-30 disabled:hover:bg-transparent disabled:cursor-not-allowed font-bold flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <ChevronLeft size={14} />
                    <span>Prev</span>
                  </button>

                  {Array.from({ length: totalAppPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      type="button"
                      onClick={() => setAppPage(page)}
                      className={`w-8 h-8 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                        validAppPage === page
                          ? "bg-[#0f4c81] text-white shadow-xs"
                          : "border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                      }`}
                    >
                      {page}
                    </button>
                  ))}

                  <button
                    type="button"
                    onClick={() => setAppPage((p) => Math.min(totalAppPages, p + 1))}
                    disabled={validAppPage >= totalAppPages}
                    className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900 disabled:opacity-30 disabled:hover:bg-transparent disabled:cursor-not-allowed font-bold flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <span>Next</span>
                    <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* INSPECTION & REVIEW MODAL */}
      {selectedApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white text-slate-900 w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden relative max-h-[92vh]">
            
            {/* Modal Top Bar */}
            <div className="bg-[#031b4e] text-white p-5 flex items-start justify-between relative shrink-0">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-cyan-400">{selectedApp.id}</span>
                  <span className={`uppercase font-black text-[9px] px-2 py-0.5 rounded-full ${
                    selectedApp.status === "approved"
                      ? "bg-emerald-500/20 text-emerald-300 border border-emerald-400/40"
                      : selectedApp.status === "rejected"
                      ? "bg-red-500/20 text-red-300 border border-red-400/40"
                      : "bg-amber-500/20 text-amber-300 border border-amber-400/40"
                  }`}>
                    {selectedApp.status.replace("_", " ")}
                  </span>
                </div>
                <h3 className="font-extrabold text-lg sm:text-xl mt-1 leading-tight">
                  {selectedApp.companyName}
                </h3>
                <p className="text-xs text-blue-200 mt-0.5">
                  Submitted on {new Date(selectedApp.createdAt).toLocaleDateString()} by {selectedApp.contactPerson}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSelectedApp(null)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all cursor-pointer shrink-0"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 sm:p-6 overflow-y-auto space-y-5 text-xs">
              
              {actionError && (
                <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 font-medium flex items-start gap-2">
                  <AlertCircle size={15} className="text-red-500 shrink-0 mt-0.5" />
                  <span>{actionError}</span>
                </div>
              )}

              {/* 1. Company & Entity */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                <h4 className="font-extrabold text-slate-900 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                  <Building2 size={14} className="text-[#031b4e]" />
                  <span>Company & Legal Entity</span>
                </h4>
                
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-slate-400 font-bold block text-[10px] uppercase">Trade Name</span>
                    <span className="font-bold text-slate-800">{selectedApp.companyName}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-bold block text-[10px] uppercase">Legal Entity Name</span>
                    <span className="font-bold text-slate-800">{selectedApp.legalName || selectedApp.companyName}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-bold block text-[10px] uppercase">Trade License Number</span>
                    <span className="font-mono font-bold text-slate-900">{selectedApp.tradeLicenseNumber || "—"}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-bold block text-[10px] uppercase">Tax Registration (TRN)</span>
                    <span className="font-mono font-bold text-slate-900">{selectedApp.taxRegistrationNumber || "—"}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-bold block text-[10px] uppercase">Business Type</span>
                    <span className="font-bold text-slate-800 capitalize">{(selectedApp.businessType || "contractor").replace("_", " ")}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-bold block text-[10px] uppercase">Emirate / City</span>
                    <span className="font-bold text-slate-800">{selectedApp.emirate || selectedApp.city || "Abu Dhabi"}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-slate-400 font-bold block text-[10px] uppercase">Business Address</span>
                    <span className="font-medium text-slate-800">{selectedApp.address || "—"}</span>
                  </div>
                </div>
              </div>

              {/* 2. Contact Details */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                <h4 className="font-extrabold text-slate-900 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                  <User size={14} className="text-[#031b4e]" />
                  <span>Primary Trade Contact</span>
                </h4>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-slate-400 font-bold block text-[10px] uppercase">Contact Person</span>
                    <span className="font-bold text-slate-800">{selectedApp.contactPerson}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-bold block text-[10px] uppercase">Designation</span>
                    <span className="font-bold text-slate-800">{selectedApp.designation || "—"}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-bold block text-[10px] uppercase">Phone Number</span>
                    <span className="font-bold text-slate-800">{selectedApp.phone}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-bold block text-[10px] uppercase">Official Email</span>
                    <span className="font-bold text-slate-800">{selectedApp.email}</span>
                  </div>
                </div>
              </div>

              {/* 3. Commercial Details & Sourcing */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                <h4 className="font-extrabold text-slate-900 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                  <Briefcase size={14} className="text-[#031b4e]" />
                  <span>Commercial & Sourcing Scope</span>
                </h4>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-slate-400 font-bold block text-[10px] uppercase">Annual Volume Estimate</span>
                    <span className="font-bold text-slate-800">{selectedApp.annualVolumeEstimate || "—"}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-bold block text-[10px] uppercase">Requested Payment Terms</span>
                    <span className="font-bold text-slate-800">{selectedApp.paymentTermsRequested || "—"}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-slate-400 font-bold block text-[10px] uppercase">Interested Equipment Categories</span>
                    <span className="font-semibold text-slate-800">{selectedApp.interestedCategories || "All HVAC Equipment"}</span>
                  </div>
                </div>
              </div>

              {/* 4. Documents */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                <h4 className="font-extrabold text-slate-900 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                  <FileText size={14} className="text-[#031b4e]" />
                  <span>Submitted Trade Documents</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3 bg-white border border-slate-200 rounded-lg">
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">Trade License</span>
                    {selectedApp.tradeLicenseDocUrl || selectedApp.tradeLicenseFileUrl ? (
                      <a
                        href={selectedApp.tradeLicenseDocUrl || selectedApp.tradeLicenseFileUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="font-bold text-[#0f4c81] hover:underline inline-flex items-center gap-1 mt-1"
                      >
                        <span>View Document Reference</span>
                        <ExternalLink size={12} />
                      </a>
                    ) : (
                      <span className="text-slate-400 italic">No document file provided</span>
                    )}
                  </div>

                  <div className="p-3 bg-white border border-slate-200 rounded-lg">
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">VAT / Tax Certificate</span>
                    {selectedApp.taxCertificateDocUrl || selectedApp.taxCertificateFileUrl ? (
                      <a
                        href={selectedApp.taxCertificateDocUrl || selectedApp.taxCertificateFileUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="font-bold text-[#0f4c81] hover:underline inline-flex items-center gap-1 mt-1"
                      >
                        <span>View Tax Certificate</span>
                        <ExternalLink size={12} />
                      </a>
                    ) : (
                      <span className="text-slate-400 italic">No document file provided</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Rejection Note Field if status is rejected or rejecting */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Internal / Rejection Review Notes
                </label>
                <textarea
                  rows={2}
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Enter reason for rejection or internal compliance notes..."
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#031b4e]/15"
                />
              </div>

            </div>

            {/* Modal Bottom Action Bar */}
            <div className="bg-slate-100 p-4 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 shrink-0">
              <button
                type="button"
                onClick={() => setSelectedApp(null)}
                disabled={isReviewing}
                className="px-4 py-2 bg-white hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl border border-slate-300 transition-colors cursor-pointer"
              >
                Close
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleReviewAction("under_review")}
                  disabled={isReviewing}
                  className="px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-900 border border-blue-200 font-bold text-xs rounded-xl transition-colors cursor-pointer disabled:opacity-50"
                >
                  Mark Under Review
                </button>

                <button
                  type="button"
                  onClick={() => handleReviewAction("rejected")}
                  disabled={isReviewing}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                >
                  <XCircle size={14} />
                  <span>Reject</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleReviewAction("approved")}
                  disabled={isReviewing}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                >
                  {isReviewing ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <CheckCircle2 size={14} />
                  )}
                  <span>Approve & Authorize Retailer</span>
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
