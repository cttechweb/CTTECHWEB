import React, { useState } from "react";
import { 
  ClipboardSignature, Search, Filter, Clock, CheckCircle2, 
  Building2, User, Phone, Mail, MapPin, ChevronRight, 
  X, Layers, Calendar, DollarSign, Send, MessageSquare 
} from "lucide-react";
import { RfqRequest, RfqStatus } from "../../types";
import { updateRfqStatus, updateRfqProposal } from "../../services/rfqService";

interface AdminRfqManagementProps {
  rfqs: RfqRequest[];
  onShowToast: (msg: string) => void;
}

const RFQ_STATUS_COLORS: Record<RfqStatus, { bg: string; text: string; border: string }> = {
  NEW: { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200" },
  UNDER_REVIEW: { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200" },
  PROPOSAL_SENT: { bg: "bg-cyan-50", text: "text-cyan-700", border: "border-cyan-200" },
  ACCEPTED: { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200" },
  DECLINED: { bg: "bg-rose-50", text: "text-rose-700", border: "border-rose-200" },
  CANCELLED: { bg: "bg-slate-100", text: "text-slate-600", border: "border-slate-200" },
};

export default function AdminRfqManagement({ rfqs, onShowToast }: AdminRfqManagementProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | RfqStatus>("all");
  const [selectedRfq, setSelectedRfq] = useState<RfqRequest | null>(null);
  const [isInspectorOpen, setIsInspectorOpen] = useState(false);

  // Inspector state
  const [newStatus, setNewStatus] = useState<RfqStatus>("NEW");
  const [proposalPrice, setProposalPrice] = useState<string>("" );
  const [internalNotes, setInternalNotes] = useState("");
  const [assignedTo, setAssignedTo] = useState("");
  const [statusNote, setStatusNote] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  const filteredRfqs = rfqs.filter((rfq) => {
    if (statusFilter !== "all" && rfq.status !== statusFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchNum = rfq.rfqNumber.toLowerCase().includes(q);
      const matchComp = rfq.company.toLowerCase().includes(q);
      const matchName = rfq.name.toLowerCase().includes(q);
      const matchEmail = rfq.email.toLowerCase().includes(q);
      return matchNum || matchComp || matchName || matchEmail;
    }
    return true;
  });

  const handleOpenInspector = (rfq: RfqRequest) => {
    setSelectedRfq(rfq);
    setNewStatus(rfq.status);
    setProposalPrice(rfq.proposalPrice ? rfq.proposalPrice.toString() : "");
    setInternalNotes(rfq.internalNotes || "");
    setAssignedTo(rfq.assignedTo || "");
    setStatusNote("");
    setIsInspectorOpen(true);
  };

  const handleSaveRfq = async () => {
    if (!selectedRfq) return;
    setIsUpdating(true);

    try {
      if (newStatus !== selectedRfq.status || statusNote.trim()) {
        await updateRfqStatus(selectedRfq.id, newStatus, statusNote.trim(), "HVAC Estimator");
      }
      const priceNum = parseFloat(proposalPrice) || 0;
      await updateRfqProposal(selectedRfq.id, priceNum, internalNotes.trim(), assignedTo.trim());

      onShowToast(`RFQ ${selectedRfq.rfqNumber} updated successfully.`);
      setIsInspectorOpen(false);
    } catch (err) {
      console.error("Error updating RFQ:", err);
      onShowToast("Failed to update RFQ.");
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header controls & stats */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
            <ClipboardSignature size={20} className="text-[#0f4c81]" />
            <span>Commercial Quotation Requests (RFQ Pool)</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Review custom project inquiries, calculate cooling tonnages, and prepare HVAC proposals.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono shrink-0">
          <span className="px-3 py-1 rounded-lg bg-blue-50 border border-blue-200 text-blue-700 font-bold">
            {rfqs.filter(r => r.status === "NEW").length} New
          </span>
          <span className="px-3 py-1 rounded-lg bg-cyan-50 border border-cyan-200 text-cyan-700 font-bold">
            {rfqs.filter(r => r.status === "PROPOSAL_SENT").length} Proposal Sent
          </span>
        </div>
      </div>

      {/* Filter toolbar */}
      <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs flex flex-col md:flex-row gap-3 items-center justify-between">
        
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search size={15} className="absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search by RFQ #, Company, or Contact..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#0f4c81] focus:bg-white transition-colors"
          />
        </div>

        {/* Status Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 scrollbar-none">
          <button
            onClick={() => setStatusFilter("all")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors shrink-0 cursor-pointer ${
              statusFilter === "all" ? "bg-[#0f4c81] text-white font-extrabold shadow-sm" : "bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900"
            }`}
          >
            All ({rfqs.length})
          </button>
          {(["NEW", "UNDER_REVIEW", "PROPOSAL_SENT", "ACCEPTED", "DECLINED", "CANCELLED"] as RfqStatus[]).map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors shrink-0 cursor-pointer ${
                statusFilter === st ? "bg-[#0f4c81] text-white font-extrabold shadow-sm" : "bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900"
              }`}
            >
              {st} ({rfqs.filter(r => r.status === st).length})
            </button>
          ))}
        </div>

      </div>

      {/* RFQ Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        {filteredRfqs.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-[10px] uppercase tracking-wider font-extrabold text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="px-5 py-3.5">RFQ ID / Date</th>
                  <th className="px-4 py-3.5">Company & Contact</th>
                  <th className="px-4 py-3.5">Location & Scope</th>
                  <th className="px-4 py-3.5">Timeline</th>
                  <th className="px-4 py-3.5">Status</th>
                  <th className="px-4 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredRfqs.map((rfq) => {
                  const style = RFQ_STATUS_COLORS[rfq.status] || RFQ_STATUS_COLORS.NEW;
                  return (
                    <tr 
                      key={rfq.id} 
                      className="hover:bg-slate-50/80 transition-colors cursor-pointer"
                      onClick={() => handleOpenInspector(rfq)}
                    >
                      <td className="px-5 py-4">
                        <div className="font-mono font-bold text-slate-900 text-xs">{rfq.rfqNumber}</div>
                        <div className="text-[10px] text-slate-400 mt-0.5">
                          {new Date(rfq.createdAt).toLocaleDateString()}
                        </div>
                      </td>

                      <td className="px-4 py-4">
                        <div className="font-bold text-slate-900 flex items-center gap-1.5">
                          <Building2 size={13} className="text-[#0f4c81] shrink-0" />
                          <span>{rfq.company}</span>
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          {rfq.name} • {rfq.phone}
                        </div>
                      </td>

                      <td className="px-4 py-4">
                        <div className="text-slate-900 font-bold">
                          {rfq.loadRequirements || "General HVAC Equipment Sourcing"}
                        </div>
                        <div className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                          <MapPin size={11} className="text-slate-400" />
                          <span>{rfq.projectLocation || "UAE"}</span>
                        </div>
                      </td>

                      <td className="px-4 py-4">
                        <span className="capitalize text-slate-700 font-semibold text-xs">
                          {rfq.timeline === "immediate" ? "Immediate" : rfq.timeline === "month" ? "< 30 Days" : "Tender / Plan"}
                        </span>
                      </td>

                      <td className="px-4 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${style.bg} ${style.text} ${style.border}`}>
                          {rfq.status}
                        </span>
                      </td>

                      <td className="px-4 py-4 text-right">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenInspector(rfq);
                          }}
                          className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-[#0f4c81] rounded-lg text-xs font-bold border border-blue-200 transition-colors inline-flex items-center gap-1 cursor-pointer"
                        >
                          <span>Review</span>
                          <ChevronRight size={13} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-16 text-center text-slate-500 space-y-2">
            <ClipboardSignature size={32} className="mx-auto text-slate-400 mb-2" />
            <p className="font-bold text-slate-800">No Quotation Requests Found</p>
            <p className="text-xs text-slate-400">Commercial RFQs submitted through the project quote form will appear here.</p>
          </div>
        )}
      </div>

      {/* RFQ Inspector Modal (Light Theme) */}
      {isInspectorOpen && selectedRfq && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white text-slate-900 w-full max-w-3xl rounded-2xl border border-slate-200 shadow-2xl flex flex-col max-h-[90vh] overflow-hidden relative">
            
            {/* Header */}
            <div className="p-5 bg-slate-50 border-b border-slate-200 flex items-center justify-between shrink-0">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-black text-sm text-[#0f4c81] bg-blue-50 px-2.5 py-0.5 rounded border border-blue-200">
                    {selectedRfq.rfqNumber}
                  </span>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${RFQ_STATUS_COLORS[selectedRfq.status].bg} ${RFQ_STATUS_COLORS[selectedRfq.status].text} ${RFQ_STATUS_COLORS[selectedRfq.status].border}`}>
                    {selectedRfq.status}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Submitted on {new Date(selectedRfq.createdAt).toLocaleString()}
                </p>
              </div>

              <button
                onClick={() => setIsInspectorOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-900 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 overflow-y-auto space-y-6 text-xs">
              
              {/* Client and Project Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div className="space-y-2">
                  <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Company & Location</span>
                  <div className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                    <Building2 size={15} className="text-[#0f4c81]" />
                    <span>{selectedRfq.company}</span>
                  </div>
                  <div className="text-slate-700 flex items-center gap-1.5">
                    <MapPin size={13} className="text-slate-400" />
                    <span>{selectedRfq.projectLocation || "UAE"}</span>
                  </div>
                  <div className="text-slate-600">Timeline Target: <span className="text-[#0f4c81] font-bold capitalize">{selectedRfq.timeline || "Immediate"}</span></div>
                </div>

                <div className="space-y-2">
                  <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Contact Information</span>
                  <div className="font-bold text-slate-900">{selectedRfq.name}</div>
                  <div className="text-slate-700 flex items-center gap-1.5">
                    <Mail size={13} className="text-slate-400" />
                    <span>{selectedRfq.email}</span>
                  </div>
                  <div className="text-slate-700 flex items-center gap-1.5">
                    <Phone size={13} className="text-slate-400" />
                    <span>{selectedRfq.phone}</span>
                  </div>
                </div>
              </div>

              {/* Technical Requirements */}
              <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div>
                  <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block mb-1">Cooling Load / Scope</span>
                  <p className="text-slate-900 font-bold text-sm">{selectedRfq.loadRequirements || "Standard Sourcing Ingestion"}</p>
                </div>

                {selectedRfq.projectDescription && (
                  <div>
                    <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block mb-1">Project Constraint Notes</span>
                    <p className="text-slate-700 italic whitespace-pre-wrap">{selectedRfq.projectDescription}</p>
                  </div>
                )}
              </div>

              {/* Proposal Estimating Actions */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-4">
                <span className="text-[10px] font-extrabold text-[#0f4c81] uppercase tracking-wider block">Estimator Proposal Actions</span>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1">RFQ Status</label>
                    <select
                      value={newStatus}
                      onChange={(e) => setNewStatus(e.target.value as RfqStatus)}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-bold text-slate-800 focus:outline-none focus:border-[#0f4c81]"
                    >
                      <option value="NEW">NEW</option>
                      <option value="UNDER_REVIEW">UNDER_REVIEW</option>
                      <option value="PROPOSAL_SENT">PROPOSAL_SENT</option>
                      <option value="ACCEPTED">ACCEPTED</option>
                      <option value="DECLINED">DECLINED</option>
                      <option value="CANCELLED">CANCELLED</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1">Calculated Proposal Price ($)</label>
                    <input
                      type="number"
                      placeholder="e.g. 45000"
                      value={proposalPrice}
                      onChange={(e) => setProposalPrice(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-mono text-slate-900 font-bold focus:outline-none focus:border-[#0f4c81]"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1">Assigned Estimator</label>
                    <input
                      type="text"
                      placeholder="e.g. Eng. Vikram"
                      value={assignedTo}
                      onChange={(e) => setAssignedTo(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-800 focus:outline-none focus:border-[#0f4c81]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1">Audit Status Update Note</label>
                  <input
                    type="text"
                    placeholder="e.g. Completed load sizing calculations; bid sent with 1-year warranty."
                    value={statusNote}
                    onChange={(e) => setStatusNote(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-800 focus:outline-none focus:border-[#0f4c81]"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1">Internal Estimating & Factory Notes</label>
                  <textarea
                    rows={2}
                    placeholder="Internal equipment availability, factory lead times, etc..."
                    value={internalNotes}
                    onChange={(e) => setInternalNotes(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-800 focus:outline-none focus:border-[#0f4c81] resize-none"
                  />
                </div>
              </div>

            </div>

            {/* Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-3 shrink-0">
              <button
                type="button"
                onClick={() => setIsInspectorOpen(false)}
                className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                Close
              </button>
              <button
                type="button"
                onClick={handleSaveRfq}
                disabled={isUpdating}
                className="px-5 py-2 bg-[#0f4c81] hover:bg-[#1c7e9f] text-white font-extrabold rounded-xl text-xs transition-colors shadow-sm cursor-pointer disabled:bg-slate-300"
              >
                {isUpdating ? "Saving..." : "Save Proposal & Status"}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
