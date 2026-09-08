import React, { useState, useEffect } from "react";
import { 
  MessageSquare, Search, Filter, RefreshCw, CheckCircle2, Clock, 
  AlertCircle, Trash2, Eye, Mail, Phone, Building, ExternalLink, 
  Sparkles, Tag, ShieldCheck, Database, ArrowUpRight, X, User, FileText,
  ChevronLeft, ChevronRight
} from "lucide-react";
import { GeneralEnquiry, EnquiryStatus, EnquirySource } from "../../types";
import { 
  getEnquiries, 
  updateEnquiryStatus, 
  deleteEnquiry, 
  subscribeToEnquiries 
} from "../../services/enquiryService";

interface AdminEnquiriesManagerProps {
  onShowToast?: (message: string) => void;
}

const SOURCE_LABELS: Record<string, { label: string; bg: string; text: string }> = {
  homepage: { label: "Homepage Lead", bg: "bg-blue-50 border-blue-200", text: "text-blue-700" },
  contact_page: { label: "Contact Page", bg: "bg-purple-50 border-purple-200", text: "text-purple-700" },
  product_page: { label: "Product Sourcing", bg: "bg-emerald-50 border-emerald-200", text: "text-emerald-700" },
  support: { label: "Product Support", bg: "bg-amber-50 border-amber-200", text: "text-amber-700" },
  services: { label: "Service Query", bg: "bg-cyan-50 border-cyan-200", text: "text-cyan-700" },
  other: { label: "General", bg: "bg-slate-50 border-slate-200", text: "text-slate-700" },
};

const STATUS_BADGES: Record<EnquiryStatus, { label: string; bg: string; text: string }> = {
  NEW: { label: "New Lead", bg: "bg-blue-100 border-blue-300", text: "text-blue-800" },
  IN_REVIEW: { label: "In Review", bg: "bg-amber-100 border-amber-300", text: "text-amber-800" },
  CONTACTED: { label: "Contacted", bg: "bg-purple-100 border-purple-300", text: "text-purple-800" },
  RESOLVED: { label: "Resolved", bg: "bg-emerald-100 border-emerald-300", text: "text-emerald-800" },
  SPAM: { label: "Spam", bg: "bg-rose-100 border-rose-300", text: "text-rose-800" },
};

export default function AdminEnquiriesManager({ onShowToast }: AdminEnquiriesManagerProps) {
  const [enquiries, setEnquiries] = useState<GeneralEnquiry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterSource, setFilterSource] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [selectedEnquiry, setSelectedEnquiry] = useState<GeneralEnquiry | null>(null);

  const fetchEnquiries = async () => {
    setIsLoading(true);
    try {
      const data = await getEnquiries();
      setEnquiries(data);
    } catch (err) {
      console.error("Failed to load enquiries:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const unsub = subscribeToEnquiries((items) => {
      setEnquiries(items);
    });
    return () => unsub();
  }, []);

  const handleStatusChange = async (enquiryId: string, newStatus: EnquiryStatus) => {
    try {
      await updateEnquiryStatus(enquiryId, newStatus);
      if (selectedEnquiry && selectedEnquiry.id === enquiryId) {
        setSelectedEnquiry((prev) => prev ? { ...prev, status: newStatus } : null);
      }
      if (onShowToast) onShowToast(`Enquiry status updated to ${newStatus}.`);
    } catch (err: any) {
      alert(`Failed to update status: ${err?.message || "Network / server error"}`);
    }
  };

  const handleDelete = async (enquiry: GeneralEnquiry) => {
    if (window.confirm(`Are you sure you want to permanently delete enquiry "${enquiry.id}" from ${enquiry.name}?`)) {
      try {
        await deleteEnquiry(enquiry.id);
        if (selectedEnquiry?.id === enquiry.id) {
          setSelectedEnquiry(null);
        }
        if (onShowToast) onShowToast(`Enquiry ${enquiry.id} deleted.`);
      } catch (err: any) {
        alert(`Failed to delete enquiry: ${err?.message || "Server error"}`);
      }
    }
  };

  // Filter and Search logic
  const filteredEnquiries = enquiries.filter((item) => {
    const matchesSearch =
      searchTerm.trim() === "" ||
      item.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.phone && item.phone.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (item.companyName && item.companyName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (item.subject && item.subject.toLowerCase().includes(searchTerm.toLowerCase())) ||
      item.message.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesSource = filterSource === "all" || item.source === filterSource;
    const matchesStatus = filterStatus === "all" || item.status === filterStatus;

    return matchesSearch && matchesSource && matchesStatus;
  });

  // Pagination State
  const [enquiryPage, setEnquiryPage] = useState(1);
  const ENQUIRY_PAGE_SIZE = 10;

  useEffect(() => {
    setEnquiryPage(1);
  }, [searchTerm, filterSource, filterStatus]);

  const totalEnquiryPages = Math.ceil(filteredEnquiries.length / ENQUIRY_PAGE_SIZE) || 1;
  const validEnquiryPage = Math.min(enquiryPage, totalEnquiryPages);
  const startEnqIdx = (validEnquiryPage - 1) * ENQUIRY_PAGE_SIZE;
  const endEnqIdx = Math.min(startEnqIdx + ENQUIRY_PAGE_SIZE, filteredEnquiries.length);
  const paginatedEnquiries = filteredEnquiries.slice(startEnqIdx, endEnqIdx);

  // Aggregate Metrics
  const totalCount = enquiries.length;
  const newCount = enquiries.filter((e) => e.status === "NEW").length;
  const inReviewCount = enquiries.filter((e) => e.status === "IN_REVIEW" || e.status === "CONTACTED").length;
  const resolvedCount = enquiries.filter((e) => e.status === "RESOLVED").length;
  const crmSyncedCount = enquiries.filter((e) => e.crmSyncStatus === "synced").length;

  return (
    <div className="space-y-6">
      
      {/* Header Info & Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Total Enquiries</span>
            <MessageSquare size={16} className="text-slate-400" />
          </div>
          <p className="text-2xl font-black text-slate-900 mt-2">{totalCount}</p>
          <span className="text-[11px] text-slate-400 font-medium">All website channels</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-blue-200 shadow-xs bg-blue-50/30">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-blue-700 uppercase tracking-wider">New Inquiries</span>
            <div className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-pulse" />
          </div>
          <p className="text-2xl font-black text-blue-900 mt-2">{newCount}</p>
          <span className="text-[11px] text-blue-600 font-medium">Action required</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-amber-200 shadow-xs bg-amber-50/30">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-amber-700 uppercase tracking-wider">In Progress</span>
            <Clock size={16} className="text-amber-500" />
          </div>
          <p className="text-2xl font-black text-amber-900 mt-2">{inReviewCount}</p>
          <span className="text-[11px] text-amber-600 font-medium">Under review / contacted</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-emerald-200 shadow-xs bg-emerald-50/30">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider">Resolved</span>
            <CheckCircle2 size={16} className="text-emerald-500" />
          </div>
          <p className="text-2xl font-black text-emerald-900 mt-2">{resolvedCount}</p>
          <span className="text-[11px] text-emerald-600 font-medium">Completed inquiries</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-purple-200 shadow-xs bg-purple-50/30 col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-purple-700 uppercase tracking-wider">CRM Sync Status</span>
            <Database size={16} className="text-purple-500" />
          </div>
          <p className="text-2xl font-black text-purple-900 mt-2">{crmSyncedCount}</p>
          <span className="text-[11px] text-purple-600 font-medium">Ready for CRM integration</span>
        </div>
      </div>

      {/* Control Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-1">
          <div className="relative flex-1 max-w-md">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by client name, email, company, subject, ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={filterSource}
              onChange={(e) => setFilterSource(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 focus:outline-hidden cursor-pointer"
            >
              <option value="all">All Sources</option>
              <option value="contact_page">Contact Page</option>
              <option value="homepage">Homepage Lead</option>
              <option value="product_page">Product Sourcing</option>
              <option value="support">Product Support</option>
              <option value="services">Service Query</option>
              <option value="other">Other</option>
            </select>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 focus:outline-hidden cursor-pointer"
            >
              <option value="all">All Statuses</option>
              <option value="NEW">New</option>
              <option value="IN_REVIEW">In Review</option>
              <option value="CONTACTED">Contacted</option>
              <option value="RESOLVED">Resolved</option>
              <option value="SPAM">Spam</option>
            </select>
          </div>
        </div>

        <button
          onClick={fetchEnquiries}
          disabled={isLoading}
          className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 shrink-0 self-end md:self-auto"
        >
          <RefreshCw size={14} className={isLoading ? "animate-spin text-blue-600" : ""} />
          <span>Refresh Database</span>
        </button>
      </div>

      {/* Enquiries Data Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        {filteredEnquiries.length === 0 ? (
          <div className="py-16 text-center">
            <MessageSquare size={36} className="mx-auto text-slate-300 mb-3" />
            <h3 className="text-sm font-bold text-slate-700">No Enquiries Found</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              {searchTerm || filterSource !== "all" || filterStatus !== "all"
                ? "No customer inquiries matched your current filter criteria."
                : "Incoming customer inquiries submitted through website contact forms, product pages, or support forms will appear here."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4">Enquiry ID & Date</th>
                  <th className="py-3 px-4">Channel / Source</th>
                  <th className="py-3 px-4">Client Contact</th>
                  <th className="py-3 px-4">Subject & Message</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">CRM Integration</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginatedEnquiries.map((item) => {
                  const srcMeta = SOURCE_LABELS[item.source] || SOURCE_LABELS.other;
                  const statusMeta = STATUS_BADGES[item.status] || STATUS_BADGES.NEW;

                  return (
                    <tr key={item.id} className="hover:bg-slate-50/60 transition-colors">
                      {/* ID & Date */}
                      <td className="py-3.5 px-4">
                        <button
                          onClick={() => setSelectedEnquiry(item)}
                          className="font-mono font-bold text-blue-600 hover:text-blue-800 hover:underline cursor-pointer block text-left"
                        >
                          {item.id}
                        </button>
                        <span className="text-[10px] text-slate-400 block mt-0.5">
                          {new Date(item.createdAt).toLocaleString(undefined, {
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit"
                          })}
                        </span>
                      </td>

                      {/* Source */}
                      <td className="py-3.5 px-4">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${srcMeta.bg} ${srcMeta.text}`}>
                          {srcMeta.label}
                        </span>
                        {item.type && item.type !== "general" && (
                          <span className="block text-[10px] text-slate-500 font-medium mt-1 capitalize">
                            Type: {item.type.replace(/_/g, " ")}
                          </span>
                        )}
                      </td>

                      {/* Client */}
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900">{item.name}</div>
                        <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                          <Mail size={11} className="text-slate-400" />
                          <span>{item.email}</span>
                        </div>
                        {item.phone && (
                          <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                            <Phone size={11} className="text-slate-400" />
                            <span>{item.phone}</span>
                          </div>
                        )}
                        {item.companyName && (
                          <div className="text-[10px] text-blue-600 font-semibold flex items-center gap-1 mt-0.5">
                            <Building size={10} />
                            <span>{item.companyName}</span>
                          </div>
                        )}
                      </td>

                      {/* Subject & Message Preview */}
                      <td className="py-3.5 px-4 max-w-xs">
                        <div className="font-bold text-slate-900 truncate">{item.subject}</div>
                        <p className="text-[11px] text-slate-500 truncate mt-0.5">{item.message}</p>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        <select
                          value={item.status}
                          onChange={(e) => handleStatusChange(item.id, e.target.value as EnquiryStatus)}
                          className={`text-[11px] font-bold px-2 py-1 rounded-lg border outline-none cursor-pointer ${statusMeta.bg} ${statusMeta.text}`}
                        >
                          <option value="NEW">New</option>
                          <option value="IN_REVIEW">In Review</option>
                          <option value="CONTACTED">Contacted</option>
                          <option value="RESOLVED">Resolved</option>
                          <option value="SPAM">Spam</option>
                        </select>
                      </td>

                      {/* CRM Integration */}
                      <td className="py-3.5 px-4">
                        {item.crmSyncStatus === "synced" ? (
                          <div className="flex flex-col">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 w-fit">
                              <CheckCircle2 size={10} />
                              <span>CRM Synced</span>
                            </span>
                            {item.crmRecordId && (
                              <span className="text-[9px] font-mono text-slate-400 mt-0.5">
                                #{item.crmRecordId}
                              </span>
                            )}
                          </div>
                        ) : item.crmSyncStatus === "failed" ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                            <AlertCircle size={10} />
                            <span>Sync Error</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
                            <Clock size={10} />
                            <span>D1 Stored (Pending CRM)</span>
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setSelectedEnquiry(item)}
                            className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors cursor-pointer"
                            title="View Full Details"
                          >
                            <Eye size={15} />
                          </button>
                          <button
                            onClick={() => handleDelete(item)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors cursor-pointer"
                            title="Delete Enquiry"
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

            {/* Enquiries Pagination Footer */}
            {filteredEnquiries.length > ENQUIRY_PAGE_SIZE && (
              <div className="p-4 border-t border-slate-200 bg-white flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                <div className="text-slate-500 font-medium">
                  Showing <span className="font-bold text-slate-800">{startEnqIdx + 1}</span> to{" "}
                  <span className="font-bold text-slate-800">{endEnqIdx}</span> of{" "}
                  <span className="font-bold text-slate-800">{filteredEnquiries.length}</span> enquiries
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setEnquiryPage((p) => Math.max(1, p - 1))}
                    disabled={validEnquiryPage <= 1}
                    className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900 disabled:opacity-30 disabled:hover:bg-transparent disabled:cursor-not-allowed font-bold flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <ChevronLeft size={14} />
                    <span>Prev</span>
                  </button>

                  {Array.from({ length: totalEnquiryPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      type="button"
                      onClick={() => setEnquiryPage(page)}
                      className={`w-8 h-8 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                        validEnquiryPage === page
                          ? "bg-[#0f4c81] text-white shadow-xs"
                          : "border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                      }`}
                    >
                      {page}
                    </button>
                  ))}

                  <button
                    type="button"
                    onClick={() => setEnquiryPage((p) => Math.min(totalEnquiryPages, p + 1))}
                    disabled={validEnquiryPage >= totalEnquiryPages}
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

      {/* Details Modal */}
      {selectedEnquiry && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-2xl w-full border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            
            {/* Modal Header */}
            <div className="px-6 py-4 bg-[#031b4e] text-white flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-500/20 text-cyan-300 flex items-center justify-center border border-cyan-400/30">
                  <MessageSquare size={18} />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm uppercase tracking-wider text-white">
                    Enquiry Details: {selectedEnquiry.id}
                  </h3>
                  <p className="text-[11px] text-blue-200">
                    Submitted on {new Date(selectedEnquiry.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSelectedEnquiry(null)}
                className="p-1.5 rounded-lg text-blue-200 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-5 overflow-y-auto">
              {/* Client Info Card */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Client Name</span>
                  <p className="font-bold text-slate-900 text-sm mt-0.5">{selectedEnquiry.name}</p>
                </div>

                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Company / Business</span>
                  <p className="font-bold text-slate-900 mt-0.5">{selectedEnquiry.companyName || "Individual Customer"}</p>
                </div>

                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Email Address</span>
                  <a href={`mailto:${selectedEnquiry.email}`} className="font-medium text-blue-600 hover:underline mt-0.5 block">
                    {selectedEnquiry.email}
                  </a>
                </div>

                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Phone Number</span>
                  <p className="font-medium text-slate-800 mt-0.5">{selectedEnquiry.phone || "Not Provided"}</p>
                </div>
              </div>

              {/* Subject & Message */}
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Subject & Full Message
                </span>
                {selectedEnquiry.subject && (
                  <h4 className="font-bold text-slate-900 text-sm mb-2">{selectedEnquiry.subject}</h4>
                )}
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-800 whitespace-pre-wrap leading-relaxed">
                  {selectedEnquiry.message}
                </div>
              </div>

              {/* CRM Synchronization Meta Box */}
              <div className="p-4 rounded-xl border border-purple-200 bg-purple-50/40 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Database size={15} className="text-purple-600" />
                    <span className="text-xs font-extrabold text-purple-900 uppercase tracking-wider">
                      Future CRM Integration Interface
                    </span>
                  </div>
                  <span className="text-[10px] font-bold text-purple-700 bg-purple-100 px-2 py-0.5 rounded-full border border-purple-300">
                    Status: {selectedEnquiry.crmSyncStatus?.toUpperCase() || "PENDING"}
                  </span>
                </div>
                <p className="text-[11px] text-purple-800">
                  This enquiry is stored authoritatively in Cloudflare D1 and is formatted for automated REST dispatch to your enterprise CRM upon deployment.
                </p>
                {selectedEnquiry.crmRecordId && (
                  <p className="text-[11px] font-mono text-purple-900 font-semibold">
                    CRM Entity ID: {selectedEnquiry.crmRecordId}
                  </p>
                )}
              </div>

              {/* Status Update Actions */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-200">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-700">Update Status:</span>
                  <select
                    value={selectedEnquiry.status}
                    onChange={(e) => handleStatusChange(selectedEnquiry.id, e.target.value as EnquiryStatus)}
                    className="text-xs font-bold px-3 py-1.5 rounded-lg border border-slate-300 bg-white cursor-pointer"
                  >
                    <option value="NEW">NEW</option>
                    <option value="IN_REVIEW">IN REVIEW</option>
                    <option value="CONTACTED">CONTACTED</option>
                    <option value="RESOLVED">RESOLVED</option>
                    <option value="SPAM">SPAM</option>
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <a
                    href={`mailto:${selectedEnquiry.email}?subject=Re: ${encodeURIComponent(selectedEnquiry.subject || `Inquiry ${selectedEnquiry.id}`)}`}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5"
                  >
                    <Mail size={14} />
                    <span>Reply via Email</span>
                  </a>
                </div>
              </div>

            </div>

          </div>
        </div>
      )}

    </div>
  );
}
