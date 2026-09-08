/* ─────────────────────────────────────────────────────────────────
   Cool Technologies — Request For Quotation (RFQ) Service
   Database: Cloudflare D1 (via Cloudflare Worker API)
───────────────────────────────────────────────────────────────── */

import { RfqRequest, RfqStatus, RfqItem, StatusHistoryItem } from "../types";
import { apiClient } from "./apiClient";

const LOCAL_STORAGE_KEY = "cooltech_rfqs_v1";

function getLocalRfqsCache(): RfqRequest[] {
  try {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
}

function saveLocalRfqsCache(rfqs: RfqRequest[]) {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(rfqs));
    window.dispatchEvent(new CustomEvent("cooltech_rfqs_updated", { detail: rfqs }));
  } catch {}
}

/**
 * Generate a safe unique RFQ identifier: RFQ-YYYY-XXXXXX
 */
export function generateRfqNumber(): string {
  const year = new Date().getFullYear();
  const randomNum = Math.floor(100000 + Math.random() * 900000);
  return `RFQ-${year}-${randomNum}`;
}

export interface CreateRfqInput {
  name: string;
  email: string;
  company: string;
  phone: string;
  projectLocation?: string;
  timeline?: string;
  loadRequirements?: string;
  projectDescription?: string;
  products?: { productName: string; quantity: number }[];
  companyId?: string;
  userId?: string;
}

/**
 * Create a persistent RFQ in Cloudflare D1
 */
export async function createRfqRequest(input: CreateRfqInput): Promise<RfqRequest> {
  const rfqId = `rfq-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  const rfqNumber = generateRfqNumber();
  const now = new Date().toISOString();

  const formattedProducts: RfqItem[] = (input.products || []).map((p) => ({
    productName: p.productName,
    quantity: p.quantity || 1,
  }));

  const initialStatusHistory: StatusHistoryItem = {
    status: "NEW",
    timestamp: now,
    updatedBy: input.name || "Customer RFQ Form",
    notes: "Project quotation request submitted via online portal.",
  };

  const newRfq: RfqRequest = {
    id: rfqId,
    rfqNumber,
    companyId: input.companyId || "",
    userId: input.userId || "",
    name: input.name.trim(),
    email: input.email.trim(),
    company: input.company.trim(),
    phone: input.phone.trim(),
    projectLocation: input.projectLocation || "UAE",
    timeline: input.timeline || "immediate",
    loadRequirements: input.loadRequirements || "",
    projectDescription: input.projectDescription || "",
    products: formattedProducts,
    status: "NEW",
    assignedTo: "",
    internalNotes: "",
    statusHistory: [initialStatusHistory],
    createdAt: now,
    updatedAt: now,
  };

  // 1. Update local storage cache for instant UI feedback
  const cached = getLocalRfqsCache();
  saveLocalRfqsCache([newRfq, ...cached]);

  // 2. Persist to Cloudflare D1
  try {
    const res = await apiClient.submitQuote({
      id: rfqNumber,
      rfqNumber,
      name: newRfq.name,
      email: newRfq.email,
      phone: newRfq.phone,
      company: newRfq.company,
      companyId: newRfq.companyId,
      userId: newRfq.userId,
      deliveryAddress: newRfq.projectLocation,
      projectLocation: newRfq.projectLocation,
      timeline: newRfq.timeline,
      loadRequirements: newRfq.loadRequirements,
      projectDescription: newRfq.projectDescription,
      items: formattedProducts.map((p) => ({
        productName: p.productName,
        quantity: p.quantity,
      })),
    });
    if (res?.quote) {
      return {
        ...newRfq,
        ...res.quote,
        id: res.quote.id || rfqNumber,
        rfqNumber: res.quote.rfqNumber || rfqNumber,
      };
    }
  } catch (err) {
    console.warn("[RFQ Service] Error submitting quote to Cloudflare D1:", err);
  }

  return newRfq;
}

/**
 * Fetch all RFQs from Cloudflare D1 (Admin / Sales)
 */
export async function getRfqs(filters?: {
  status?: RfqStatus;
  search?: string;
}): Promise<RfqRequest[]> {
  try {
    const res = await apiClient.listAllQuotes();
    if (res?.quotes && Array.isArray(res.quotes)) {
      const list: RfqRequest[] = res.quotes.map((q: any) => ({
        id: q.id,
        rfqNumber: q.id,
        companyId: q.companyId || "",
        userId: q.userId || "",
        name: q.customerName || q.name || "Customer",
        email: q.customerEmail || q.email || "",
        company: q.companyName || q.company || "",
        phone: q.customerPhone || q.phone || "",
        projectLocation: q.deliveryAddress || q.projectLocation || "UAE",
        timeline: q.timeline || "standard",
        loadRequirements: q.loadRequirements || "",
        projectDescription: q.projectDescription || "",
        products: (q.items || q.products || []).map((i: any) => ({
          productName: i.productName || i.name || "Equipment Item",
          productId: i.productId,
          quantity: i.quantity || 1,
          notes: i.notes || "",
        })),
        status: (q.status as RfqStatus) || "NEW",
        assignedTo: q.assignedTo || "",
        internalNotes: q.adminNotes || q.internalNotes || "",
        proposalPrice: q.quotedAmount || q.proposalPrice,
        statusHistory: q.statusHistory || [],
        createdAt: q.createdAt || new Date().toISOString(),
        updatedAt: q.updatedAt || new Date().toISOString(),
      }));

      saveLocalRfqsCache(list);
      return applyRfqFilters(list, filters);
    }
  } catch (err: any) {
    if (err?.status !== 401) {
      console.warn("[RFQ Service] Error fetching RFQs from Cloudflare D1:", err);
    }
  }

  return applyRfqFilters(getLocalRfqsCache(), filters);
}

/**
 * Real-time / dynamic listener for RFQ requests
 */
export function subscribeToRfqs(
  onUpdate: (rfqs: RfqRequest[]) => void
): () => void {
  const initial = getLocalRfqsCache();
  onUpdate(initial);

  getRfqs().then((fresh) => {
    if (Array.isArray(fresh) && fresh.length > 0) {
      onUpdate(fresh);
    }
  });

  const handleUpdate = (e: any) => {
    if (e?.detail && Array.isArray(e.detail)) {
      onUpdate(e.detail);
    }
  };

  window.addEventListener("cooltech_rfqs_updated", handleUpdate);
  return () => {
    window.removeEventListener("cooltech_rfqs_updated", handleUpdate);
  };
}

/**
 * Update RFQ status in Cloudflare D1
 */
export async function updateRfqStatus(
  rfqId: string,
  newStatus: RfqStatus,
  notes: string = "",
  updatedBy: string = "Admin / Estimator"
): Promise<boolean> {
  const now = new Date().toISOString();

  const historyEntry: StatusHistoryItem = {
    status: newStatus,
    timestamp: now,
    updatedBy,
    notes: notes || `RFQ status updated to ${newStatus}`,
  };

  const cached = getLocalRfqsCache();
  const updated = cached.map((r) => {
    if (r.id === rfqId || r.rfqNumber === rfqId) {
      return {
        ...r,
        status: newStatus,
        updatedAt: now,
        statusHistory: [...(r.statusHistory || []), historyEntry],
      };
    }
    return r;
  });
  saveLocalRfqsCache(updated);

  try {
    await apiClient.updateQuote(rfqId, {
      status: newStatus,
      adminNotes: notes,
    });
  } catch (err) {
    console.warn("[RFQ Service] Error updating RFQ status in Cloudflare D1:", err);
  }

  return true;
}

/**
 * Update proposal price and internal notes for RFQ in Cloudflare D1
 */
export async function updateRfqProposal(
  rfqId: string,
  proposalPrice: number,
  internalNotes?: string,
  assignedTo?: string
): Promise<boolean> {
  const now = new Date().toISOString();
  const payload: any = { proposalPrice, updatedAt: now };
  if (internalNotes !== undefined) payload.internalNotes = internalNotes;
  if (assignedTo !== undefined) payload.assignedTo = assignedTo;

  const cached = getLocalRfqsCache();
  const updated = cached.map((r) => (r.id === rfqId || r.rfqNumber === rfqId ? { ...r, ...payload } : r));
  saveLocalRfqsCache(updated);

  try {
    await apiClient.updateQuote(rfqId, {
      quotedAmount: proposalPrice,
      proposalPrice,
      adminNotes: internalNotes,
      assignedTo,
    });
  } catch (err) {
    console.warn("[RFQ Service] Error updating RFQ proposal in Cloudflare D1:", err);
  }

  return true;
}

function applyRfqFilters(
  list: RfqRequest[],
  filters?: { status?: RfqStatus; search?: string }
): RfqRequest[] {
  if (!filters) return list;

  return list.filter((rfq) => {
    if (filters.status && rfq.status !== filters.status) return false;
    if (filters.search) {
      const q = filters.search.toLowerCase();
      const matchNumber = rfq.rfqNumber.toLowerCase().includes(q);
      const matchName = rfq.name.toLowerCase().includes(q);
      const matchCompany = rfq.company.toLowerCase().includes(q);
      const matchEmail = rfq.email.toLowerCase().includes(q);
      return matchNumber || matchName || matchCompany || matchEmail;
    }
    return true;
  });
}
