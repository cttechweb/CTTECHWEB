import React, { useState, useEffect } from "react";
import { 
  ShoppingBag, Search, Filter, Clock, CheckCircle2, XCircle, 
  FileText, Building2, User, Phone, Mail, MapPin, ChevronRight, ChevronLeft,
  MessageSquare, UserCheck, ShieldAlert, ArrowUpRight, X, AlertCircle,
  CreditCard, Package
} from "lucide-react";
import { OrderRequest, OrderStatus } from "../../types";
import { updateOrderStatus, updateOrderInternalNotes } from "../../services/orderService";

interface AdminOrderManagementProps {
  orders: OrderRequest[];
  onShowToast: (msg: string) => void;
}

const STATUS_COLORS: Record<OrderStatus, { bg: string; text: string; border: string }> = {
  NEW: { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200" },
  UNDER_REVIEW: { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200" },
  CONTACTED: { bg: "bg-purple-50", text: "text-purple-700", border: "border-purple-200" },
  QUOTED: { bg: "bg-cyan-50", text: "text-cyan-700", border: "border-cyan-200" },
  CONFIRMED: { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200" },
  COMPLETED: { bg: "bg-teal-50", text: "text-teal-700", border: "border-teal-200" },
  CANCELLED: { bg: "bg-rose-50", text: "text-rose-700", border: "border-rose-200" },
};

export default function AdminOrderManagement({ orders, onShowToast }: AdminOrderManagementProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | OrderStatus>("all");
  const [selectedOrder, setSelectedOrder] = useState<OrderRequest | null>(null);
  const [isInspectorOpen, setIsInspectorOpen] = useState(false);

  // Inspector state
  const [newStatus, setNewStatus] = useState<OrderStatus>("NEW");
  const [statusNote, setStatusNote] = useState("");
  const [internalNotes, setInternalNotes] = useState("");
  const [assignedTo, setAssignedTo] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  const filteredOrders = orders.filter((order) => {
    if (statusFilter !== "all" && order.status !== statusFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchNum = order.orderNumber.toLowerCase().includes(q);
      const matchComp = order.customerSnapshot.companyName.toLowerCase().includes(q);
      const matchCust = order.customerSnapshot.name.toLowerCase().includes(q);
      const matchEmail = order.customerSnapshot.email.toLowerCase().includes(q);
      return matchNum || matchComp || matchCust || matchEmail;
    }
    return true;
  });

  // Pagination State
  const [orderPage, setOrderPage] = useState(1);
  const ORDER_PAGE_SIZE = 10;

  useEffect(() => {
    setOrderPage(1);
  }, [searchQuery, statusFilter]);

  const totalOrderPages = Math.ceil(filteredOrders.length / ORDER_PAGE_SIZE) || 1;
  const validOrderPage = Math.min(orderPage, totalOrderPages);
  const startOrderIdx = (validOrderPage - 1) * ORDER_PAGE_SIZE;
  const endOrderIdx = Math.min(startOrderIdx + ORDER_PAGE_SIZE, filteredOrders.length);
  const paginatedOrders = filteredOrders.slice(startOrderIdx, endOrderIdx);

  const handleOpenInspector = (order: OrderRequest) => {
    setSelectedOrder(order);
    setNewStatus(order.status);
    setStatusNote("");
    setInternalNotes(order.internalNotes || "");
    setAssignedTo(order.assignedTo || "");
    setIsInspectorOpen(true);
  };

  const handleSaveStatus = async () => {
    if (!selectedOrder) return;
    setIsUpdating(true);

    try {
      if (newStatus !== selectedOrder.status || statusNote.trim()) {
        await updateOrderStatus(selectedOrder.id, newStatus, statusNote.trim(), "Admin Operator");
      }
      if (internalNotes !== selectedOrder.internalNotes || assignedTo !== selectedOrder.assignedTo) {
        await updateOrderInternalNotes(selectedOrder.id, internalNotes.trim(), assignedTo.trim());
      }
      onShowToast(`Order request ${selectedOrder.orderNumber} successfully updated.`);
      setIsInspectorOpen(false);
    } catch (err) {
      console.error("Error updating order:", err);
      onShowToast("Failed to update order.");
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
            <ShoppingBag size={20} className="text-[#0f4c81]" />
            <span>B2B Order Requests & Procurement Pipeline</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Review incoming wholesale order requests, allocate equipment scope, and log commercial proposals.
          </p>
        </div>

        {/* Quick status counters */}
        <div className="flex items-center gap-2 text-xs font-mono shrink-0">
          <span className="px-3 py-1 rounded-lg bg-blue-50 border border-blue-200 text-blue-700 font-bold">
            {orders.filter(o => o.status === "NEW").length} New
          </span>
          <span className="px-3 py-1 rounded-lg bg-amber-50 border border-amber-200 text-amber-700 font-bold">
            {orders.filter(o => o.status === "UNDER_REVIEW" || o.status === "CONTACTED").length} Active
          </span>
          <span className="px-3 py-1 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 font-bold">
            {orders.filter(o => o.status === "CONFIRMED" || o.status === "COMPLETED").length} Closed
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
            placeholder="Search by Order #, Company, or Contact..."
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
            All ({orders.length})
          </button>
          {(["NEW", "UNDER_REVIEW", "CONTACTED", "QUOTED", "CONFIRMED", "COMPLETED", "CANCELLED"] as OrderStatus[]).map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors shrink-0 cursor-pointer ${
                statusFilter === st ? "bg-[#0f4c81] text-white font-extrabold shadow-sm" : "bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900"
              }`}
            >
              {st} ({orders.filter(o => o.status === st).length})
            </button>
          ))}
        </div>

      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        {filteredOrders.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-[10px] uppercase tracking-wider font-extrabold text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="px-5 py-3.5">Order ID / Date</th>
                  <th className="px-4 py-3.5">Company & Contact</th>
                  <th className="px-4 py-3.5">Scope & Models</th>
                  <th className="px-4 py-3.5">Payment Term</th>
                  <th className="px-4 py-3.5">Status</th>
                  <th className="px-4 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {paginatedOrders.map((order) => {
                  const style = STATUS_COLORS[order.status] || STATUS_COLORS.NEW;
                  return (
                    <tr 
                      key={order.id} 
                      className="hover:bg-slate-50/80 transition-colors cursor-pointer"
                      onClick={() => handleOpenInspector(order)}
                    >
                      <td className="px-5 py-4">
                        <div className="font-mono font-bold text-slate-900 text-xs">{order.orderNumber}</div>
                        <div className="text-[10px] text-slate-400 mt-0.5">
                          {new Date(order.createdAt).toLocaleDateString()} at {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </td>

                      <td className="px-4 py-4">
                        <div className="font-bold text-slate-900 flex items-center gap-1.5">
                          <Building2 size={13} className="text-[#0f4c81] shrink-0" />
                          <span>{order.customerSnapshot.companyName}</span>
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          {order.customerSnapshot.name} • {order.customerSnapshot.phone}
                        </div>
                      </td>

                      <td className="px-4 py-4">
                        <div className="text-slate-900 font-bold">
                          {order.totalUnits} Unit(s) across {order.itemCount} Model(s)
                        </div>
                        <div className="text-[10px] text-slate-400 truncate max-w-xs mt-0.5">
                          {order.items.map(i => i.productSnapshot.name).join(", ")}
                        </div>
                      </td>

                      <td className="px-4 py-4">
                        <span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-[10px] font-mono uppercase text-slate-700">
                          {order.paymentTerm || "Net-30"}
                        </span>
                      </td>

                      <td className="px-4 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${style.bg} ${style.text} ${style.border}`}>
                          {order.status}
                        </span>
                      </td>

                      <td className="px-4 py-4 text-right">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenInspector(order);
                          }}
                          className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-[#0f4c81] rounded-lg text-xs font-bold border border-blue-200 transition-colors inline-flex items-center gap-1 cursor-pointer"
                        >
                          <span>Inspect</span>
                          <ChevronRight size={13} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {/* Orders Pagination Footer */}
            {filteredOrders.length > ORDER_PAGE_SIZE && (
              <div className="p-4 border-t border-slate-200 bg-white flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                <div className="text-slate-500 font-medium">
                  Showing <span className="font-bold text-slate-800">{startOrderIdx + 1}</span> to{" "}
                  <span className="font-bold text-slate-800">{endOrderIdx}</span> of{" "}
                  <span className="font-bold text-slate-800">{filteredOrders.length}</span> order requests
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setOrderPage((p) => Math.max(1, p - 1))}
                    disabled={validOrderPage <= 1}
                    className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900 disabled:opacity-30 disabled:hover:bg-transparent disabled:cursor-not-allowed font-bold flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <ChevronLeft size={14} />
                    <span>Prev</span>
                  </button>

                  {Array.from({ length: totalOrderPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      type="button"
                      onClick={() => setOrderPage(page)}
                      className={`w-8 h-8 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                        validOrderPage === page
                          ? "bg-[#0f4c81] text-white shadow-xs"
                          : "border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                      }`}
                    >
                      {page}
                    </button>
                  ))}

                  <button
                    type="button"
                    onClick={() => setOrderPage((p) => Math.min(totalOrderPages, p + 1))}
                    disabled={validOrderPage >= totalOrderPages}
                    className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900 disabled:opacity-30 disabled:hover:bg-transparent disabled:cursor-not-allowed font-bold flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <span>Next</span>
                    <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="py-16 text-center text-slate-500 space-y-2">
            <ShoppingBag size={32} className="mx-auto text-slate-400 mb-2" />
            <p className="font-bold text-slate-800">No B2B Order Requests Found</p>
            <p className="text-xs text-slate-400">Orders submitted by clients through the corporate cart will appear here automatically.</p>
          </div>
        )}
      </div>

      {/* Full Order Request Inspector Drawer / Modal (Light Theme) */}
      {isInspectorOpen && selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white text-slate-900 w-full max-w-3xl rounded-2xl border border-slate-200 shadow-2xl flex flex-col max-h-[90vh] overflow-hidden relative">
            
            {/* Modal Header */}
            <div className="p-5 bg-slate-50 border-b border-slate-200 flex items-center justify-between shrink-0">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-black text-sm text-[#0f4c81] bg-blue-50 px-2.5 py-0.5 rounded border border-blue-200">
                    {selectedOrder.orderNumber}
                  </span>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${STATUS_COLORS[selectedOrder.status].bg} ${STATUS_COLORS[selectedOrder.status].text} ${STATUS_COLORS[selectedOrder.status].border}`}>
                    {selectedOrder.status}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Submitted on {new Date(selectedOrder.createdAt).toLocaleString()} • Source: {selectedOrder.source}
                </p>
              </div>

              <button
                onClick={() => setIsInspectorOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-900 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {/* Modal Scrollable Body */}
            <div className="p-6 overflow-y-auto space-y-6 text-xs">
              
              {/* Customer & Company Details Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div className="space-y-2">
                  <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Company Info</span>
                  <div className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                    <Building2 size={15} className="text-[#0f4c81]" />
                    <span>{selectedOrder.customerSnapshot.companyName}</span>
                  </div>
                  {selectedOrder.customerSnapshot.taxId && (
                    <div className="text-slate-600">TRN / Tax ID: <span className="font-mono text-slate-900 font-bold">{selectedOrder.customerSnapshot.taxId}</span></div>
                  )}
                  {selectedOrder.poNumber && (
                    <div className="text-slate-600">Client PO Ref: <span className="font-mono text-slate-900 font-bold">{selectedOrder.poNumber}</span></div>
                  )}
                  <div className="text-slate-600">Payment Term: <span className="text-[#0f4c81] font-bold uppercase">{selectedOrder.paymentTerm}</span></div>
                </div>

                <div className="space-y-2">
                  <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Contact & Site Delivery</span>
                  <div className="font-bold text-slate-900">{selectedOrder.customerSnapshot.name}</div>
                  <div className="text-slate-700 flex items-center gap-1.5">
                    <Mail size={13} className="text-slate-400" />
                    <span>{selectedOrder.customerSnapshot.email}</span>
                  </div>
                  <div className="text-slate-700 flex items-center gap-1.5">
                    <Phone size={13} className="text-slate-400" />
                    <span>{selectedOrder.customerSnapshot.phone}</span>
                  </div>
                  <div className="text-slate-700 flex items-start gap-1.5">
                    <MapPin size={13} className="text-slate-400 shrink-0 mt-0.5" />
                    <span>{selectedOrder.customerSnapshot.shippingAddress}</span>
                  </div>
                </div>
              </div>

              {/* Items Line Breakdown */}
              <div>
                <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block mb-2">Requested Equipment Line Items ({selectedOrder.items.length})</span>
                <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-200">
                  {selectedOrder.items.map((item, idx) => (
                    <div key={idx} className="p-3 bg-white flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <img 
                          src={item.productSnapshot.image} 
                          alt="" 
                          className="w-10 h-10 object-contain rounded bg-slate-50 p-1 border border-slate-200 shrink-0" 
                        />
                        <div>
                          <div className="font-bold text-slate-900 text-xs">{item.productSnapshot.name}</div>
                          <div className="text-[10px] text-slate-500 mt-0.5">
                            Brand: <span className="text-slate-700 font-semibold">{item.productSnapshot.brand}</span> • Category: <span className="text-slate-700 font-semibold">{item.productSnapshot.category}</span>
                            {item.productSnapshot.modelId && ` • Model: ${item.productSnapshot.modelId}`}
                          </div>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <div className="font-black text-[#0f4c81] text-xs">{item.quantity} Unit(s)</div>
                        <div className="text-[10px] text-slate-500">
                          {item.unitPrice > 0 ? `$${item.unitPrice.toLocaleString()} / unit` : "Quote required"}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Client Technical Notes */}
              {selectedOrder.notes && (
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block mb-1">Client Special Instructions</span>
                  <p className="text-slate-700 italic">{selectedOrder.notes}</p>
                </div>
              )}

              {/* Operational Action Controls: Status, Assignee & Internal Notes */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-4">
                <span className="text-[10px] font-extrabold text-[#0f4c81] uppercase tracking-wider block">Admin Lifecycle Actions</span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1">Update Status</label>
                    <select
                      value={newStatus}
                      onChange={(e) => setNewStatus(e.target.value as OrderStatus)}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-bold text-slate-800 focus:outline-none focus:border-[#0f4c81]"
                    >
                      <option value="NEW">NEW (Awaiting review)</option>
                      <option value="UNDER_REVIEW">UNDER_REVIEW (Engineering check)</option>
                      <option value="CONTACTED">CONTACTED (Client engaged)</option>
                      <option value="QUOTED">QUOTED (Formal proposal sent)</option>
                      <option value="CONFIRMED">CONFIRMED (PO / terms verified)</option>
                      <option value="COMPLETED">COMPLETED (Delivered / invoiced)</option>
                      <option value="CANCELLED">CANCELLED (Declined / void)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1">Assign Sales Representative</label>
                    <input
                      type="text"
                      placeholder="e.g. Tariq (Senior Estimator)"
                      value={assignedTo}
                      onChange={(e) => setAssignedTo(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-800 focus:outline-none focus:border-[#0f4c81]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1">Status Progression Note (Appended to Audit Trail)</label>
                  <input
                    type="text"
                    placeholder="e.g. Checked factory stock; proposal sent with 3-week lead time."
                    value={statusNote}
                    onChange={(e) => setStatusNote(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-800 focus:outline-none focus:border-[#0f4c81]"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1">Internal Engineering Notes</label>
                  <textarea
                    rows={2}
                    placeholder="Confidential notes visible only to internal sales & MEP engineers..."
                    value={internalNotes}
                    onChange={(e) => setInternalNotes(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-800 focus:outline-none focus:border-[#0f4c81] resize-none"
                  />
                </div>
              </div>

              {/* Status Audit History Trail */}
              {selectedOrder.statusHistory && selectedOrder.statusHistory.length > 0 && (
                <div>
                  <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block mb-2">Audit History & Progression Log</span>
                  <div className="space-y-2 border-l-2 border-slate-200 pl-3 ml-1">
                    {selectedOrder.statusHistory.map((item, idx) => (
                      <div key={idx} className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-[#0f4c81] text-[11px] uppercase">{item.status}</span>
                          <span className="text-[10px] text-slate-400">• {new Date(item.timestamp).toLocaleString()}</span>
                          <span className="text-[10px] text-slate-500 font-semibold">by {item.updatedBy}</span>
                        </div>
                        {item.notes && <p className="text-[11px] text-slate-600">{item.notes}</p>}
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>

            {/* Modal Actions Footer */}
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
                onClick={handleSaveStatus}
                disabled={isUpdating}
                className="px-5 py-2 bg-[#0f4c81] hover:bg-[#1c7e9f] text-white font-extrabold rounded-xl text-xs transition-colors shadow-sm cursor-pointer disabled:bg-slate-300"
              >
                {isUpdating ? "Saving Changes..." : "Save Order Changes"}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
