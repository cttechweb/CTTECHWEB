/* ─────────────────────────────────────────────────────────────────
   Cool Technologies — B2B Order Request Service
   Database: Cloudflare D1 (via Cloudflare Worker API)
───────────────────────────────────────────────────────────────── */

import { OrderRequest, OrderStatus, OrderItem, OrderCustomerSnapshot, StatusHistoryItem } from "../types";
import { calculateCartSummary } from "./pricingService";
import { apiClient } from "./apiClient";

const LOCAL_STORAGE_KEY = "cooltech_orders_v1";

function getLocalOrdersCache(): OrderRequest[] {
  try {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
}

function saveLocalOrdersCache(orders: OrderRequest[]) {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(orders));
    window.dispatchEvent(new CustomEvent("cooltech_orders_updated", { detail: orders }));
  } catch {}
}

/**
 * Generate a safe unique B2B Order Identifier: OT-YYYY-XXXXXX
 */
export function generateOrderNumber(): string {
  const year = new Date().getFullYear();
  const randomNum = Math.floor(100000 + Math.random() * 900000);
  return `OT-${year}-${randomNum}`;
}

export interface CreateOrderRequestInput {
  companyId?: string;
  userId?: string;
  customerSnapshot: OrderCustomerSnapshot;
  items: OrderItem[];
  paymentTerm?: string;
  poNumber?: string;
  notes?: string;
  discountRate?: number;
  source?: "web_cart" | "sales_rep" | "phone" | "manual_admin";
}

/**
 * Create a persistent B2B Order Request in Cloudflare D1
 */
export async function createOrderRequest(input: CreateOrderRequestInput): Promise<OrderRequest> {
  const orderId = `order-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  const orderNumber = generateOrderNumber();
  const now = new Date().toISOString();

  const pricing = calculateCartSummary(
    input.items.map((i) => ({ price: i.unitPrice, quantity: i.quantity })),
    input.discountRate || 0
  );

  const totalUnits = input.items.reduce((acc, item) => acc + item.quantity, 0);

  const initialStatusHistory: StatusHistoryItem = {
    status: "NEW",
    timestamp: now,
    updatedBy: input.customerSnapshot.name || "Customer Web Submission",
    notes: "Order request submitted via corporate procurement cart.",
  };

  const newOrder: OrderRequest = {
    id: orderId,
    orderNumber,
    companyId: input.companyId || "",
    userId: input.userId || "",
    customerSnapshot: input.customerSnapshot,
    items: input.items,
    itemCount: input.items.length,
    totalUnits,
    subtotal: pricing.rawSubtotal,
    discountRate: input.discountRate || 0,
    discountAmount: pricing.discountAmount,
    estimatedTotal: pricing.estimatedTotal,
    poNumber: input.poNumber || "",
    paymentTerm: input.paymentTerm || "net30",
    source: input.source || "web_cart",
    status: "NEW",
    notes: input.notes || "",
    internalNotes: "",
    statusHistory: [initialStatusHistory],
    createdAt: now,
    updatedAt: now,
  };

  // 1. Update local storage cache
  const cached = getLocalOrdersCache();
  saveLocalOrdersCache([newOrder, ...cached]);

  // 2. Persist to Cloudflare D1 orders API
  try {
    const res = await apiClient.createOrder({
      id: orderId,
      orderNumber,
      companyId: input.companyId,
      customerSnapshot: input.customerSnapshot,
      items: input.items,
      paymentTerm: input.paymentTerm,
      poNumber: input.poNumber,
      notes: input.notes,
      discountRate: input.discountRate,
      source: input.source,
    });
    if (res?.order) {
      return res.order as OrderRequest;
    }
  } catch (err) {
    console.warn("[Order Service] Error submitting order request to Cloudflare D1:", err);
  }

  return newOrder;
}

/**
 * Fetch all order requests (Admin / Sales) from Cloudflare D1
 */
export async function getOrders(filters?: {
  status?: OrderStatus;
  companyId?: string;
  search?: string;
}): Promise<OrderRequest[]> {
  try {
    const res = await apiClient.listAllOrders();
    if (res?.orders && Array.isArray(res.orders)) {
      saveLocalOrdersCache(res.orders);
      return applyOrderFilters(res.orders, filters);
    }
  } catch (err: any) {
    if (err?.status !== 401) {
      console.warn("[Order Service] Error fetching orders from Cloudflare D1:", err);
    }
  }

  return applyOrderFilters(getLocalOrdersCache(), filters);
}

/**
 * Real-time / dynamic listener for order requests
 */
export function subscribeToOrders(
  onUpdate: (orders: OrderRequest[]) => void
): () => void {
  const initial = getLocalOrdersCache();
  onUpdate(initial);

  getOrders().then((fresh) => {
    if (Array.isArray(fresh) && fresh.length > 0) {
      onUpdate(fresh);
    }
  });

  const handleUpdate = (e: any) => {
    if (e?.detail && Array.isArray(e.detail)) {
      onUpdate(e.detail);
    }
  };

  window.addEventListener("cooltech_orders_updated", handleUpdate);
  return () => {
    window.removeEventListener("cooltech_orders_updated", handleUpdate);
  };
}

/**
 * Update order status with audit history in Cloudflare D1
 */
export async function updateOrderStatus(
  orderId: string,
  newStatus: OrderStatus,
  notes: string = "",
  updatedBy: string = "Admin / Sales Team"
): Promise<boolean> {
  const now = new Date().toISOString();

  const historyEntry: StatusHistoryItem = {
    status: newStatus,
    timestamp: now,
    updatedBy,
    notes: notes || `Status updated to ${newStatus}`,
  };

  const cached = getLocalOrdersCache();
  const updated = cached.map((o) => {
    if (o.id === orderId || o.orderNumber === orderId) {
      return {
        ...o,
        status: newStatus,
        updatedAt: now,
        statusHistory: [...(o.statusHistory || []), historyEntry],
      };
    }
    return o;
  });
  saveLocalOrdersCache(updated);

  try {
    await apiClient.updateOrder(orderId, {
      status: newStatus,
      internalNotes: notes,
    });
  } catch (err) {
    console.warn("[Order Service] Error updating order status in Cloudflare D1:", err);
  }

  return true;
}

/**
 * Update internal admin notes or assignment in Cloudflare D1
 */
export async function updateOrderInternalNotes(
  orderId: string,
  internalNotes: string,
  assignedTo?: string
): Promise<boolean> {
  const now = new Date().toISOString();
  const payload: any = { internalNotes, updatedAt: now };
  if (assignedTo !== undefined) payload.assignedTo = assignedTo;

  const cached = getLocalOrdersCache();
  const updated = cached.map((o) => (o.id === orderId || o.orderNumber === orderId ? { ...o, ...payload } : o));
  saveLocalOrdersCache(updated);

  try {
    await apiClient.updateOrder(orderId, {
      internalNotes,
      assignedTo,
    });
  } catch (err) {
    console.warn("[Order Service] Error updating order notes in Cloudflare D1:", err);
  }

  return true;
}

function applyOrderFilters(
  list: OrderRequest[],
  filters?: { status?: OrderStatus; companyId?: string; search?: string }
): OrderRequest[] {
  if (!filters) return list;

  return list.filter((order) => {
    if (filters.status && order.status !== filters.status) return false;
    if (filters.companyId && order.companyId !== filters.companyId) return false;
    if (filters.search) {
      const q = filters.search.toLowerCase();
      const matchNumber = order.orderNumber.toLowerCase().includes(q);
      const matchCustomer = order.customerSnapshot.name.toLowerCase().includes(q);
      const matchCompany = order.customerSnapshot.companyName.toLowerCase().includes(q);
      const matchEmail = order.customerSnapshot.email.toLowerCase().includes(q);
      return matchNumber || matchCustomer || matchCompany || matchEmail;
    }
    return true;
  });
}
