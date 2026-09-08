/* ─────────────────────────────────────────────────────────────────
   Cool Technologies — Vendor-Neutral CRM Synchronization Contract
   Architecture: Server-Side Cloudflare Worker Integration Layer
   
   This contract defines the unified, standard data structures for:
   1. Outbound synchronization events (Website -> Future CRM)
   2. Inbound webhook event payloads (Future CRM -> Website)
   3. Entity mapping schemas for Retailers, Enquiries, Customers,
      Companies, Orders, and Quotations (RFQs).
───────────────────────────────────────────────────────────────── */

export type CrmEntityType =
  | "retailer_application"
  | "enquiry"
  | "customer"
  | "company"
  | "order"
  | "quote";

export type CrmEventType =
  // Retailer Applications
  | "retailer.application.created"
  | "retailer.application.updated"
  | "retailer.application.approved"
  | "retailer.application.rejected"
  | "retailer.application.status_changed"
  // General Enquiries
  | "enquiry.created"
  | "enquiry.updated"
  | "enquiry.status_changed"
  // Customers & Users
  | "customer.created"
  | "customer.updated"
  // Companies / Accounts
  | "company.created"
  | "company.updated"
  // B2B Orders
  | "order.created"
  | "order.updated"
  | "order.status_changed"
  // RFQ / Quotation Requests
  | "quote.created"
  | "quote.updated"
  | "quote.status_changed";

/**
 * Vendor-Neutral Outbound CRM Event Contract
 */
export interface CrmOutboundEvent<T = Record<string, any>> {
  event_id: string;
  event_type: CrmEventType;
  entity_type: CrmEntityType;
  entity_id: string;
  occurred_at: string; // ISO 8601 string
  source: "cool-technologies-website";
  version: "1.0";
  idempotency_key: string;
  data: T;
}

/**
 * Entity Payload: Retailer Application -> CRM Retailer / Account Application
 */
export interface RetailerApplicationCrmPayload {
  application_id: string;
  user_id: string;
  company_name: string;
  legal_name?: string | null;
  trade_license_number: string;
  tax_registration_number?: string | null;
  business_type?: string | null;
  emirate?: string | null;
  address?: string | null;
  city?: string | null;
  contact_person: string;
  designation?: string | null;
  email: string;
  phone?: string | null;
  whatsapp_number?: string | null;
  interested_categories?: string[] | string | null;
  annual_volume_estimate?: string | null;
  payment_terms_requested?: string | null;
  trade_license_url?: string | null;
  tax_certificate_url?: string | null;
  status: "pending" | "under_review" | "approved" | "rejected";
  created_at: string;
  updated_at: string;
}

/**
 * Entity Payload: General Enquiry -> CRM Lead / Enquiry
 */
export interface EnquiryCrmPayload {
  enquiry_id: string;
  source: string;
  type: string;
  name: string;
  email: string;
  phone?: string | null;
  company_name?: string | null;
  subject?: string | null;
  message: string;
  metadata?: Record<string, any>;
  status: string;
  created_at: string;
}

/**
 * Entity Payload: Customer User -> CRM Contact
 */
export interface CustomerCrmPayload {
  user_id: string;
  email: string;
  name: string;
  phone?: string | null;
  designation?: string | null;
  company_name?: string | null;
  company_id?: string | null;
  address?: string | null;
  default_shipping_address?: string | null;
  billing_address?: string | null;
  role: string;
  is_verified_retailer: boolean;
  status: string;
  created_at: string;
}

/**
 * Entity Payload: Company -> CRM Account
 */
export interface CompanyCrmPayload {
  company_id: string;
  name: string;
  legal_name?: string | null;
  tax_id?: string | null;
  email?: string | null;
  phone?: string | null;
  city?: string | null;
  address?: string | null;
  status: string;
  created_at: string;
}

/**
 * Entity Payload: Order -> CRM Sales Order
 */
export interface OrderCrmPayload {
  order_id: string;
  order_number: string;
  user_id: string;
  company_id?: string | null;
  customer_name: string;
  customer_email: string;
  customer_phone?: string | null;
  company_name?: string | null;
  tax_id?: string | null;
  shipping_address?: string | null;
  city?: string | null;
  po_number?: string | null;
  payment_term?: string | null;
  source: string;
  status: string;
  subtotal: number;
  discount_rate: number;
  discount_amount: number;
  estimated_total: number;
  item_count: number;
  total_units: number;
  customer_notes?: string | null;
  items: Array<{
    product_id: string;
    product_name: string;
    model_id?: string;
    brand?: string;
    category?: string;
    unit_price: number;
    quantity: number;
    subtotal: number;
  }>;
  created_at: string;
}

/**
 * Entity Payload: Quotation / RFQ -> CRM Deal / Project Quote Request
 */
export interface QuoteCrmPayload {
  quote_id: string;
  user_id: string;
  customer_name: string;
  customer_email: string;
  customer_phone?: string | null;
  company_name?: string | null;
  delivery_address?: string | null;
  project_description?: string | null;
  products: Array<{
    productId: string;
    productName: string;
    quantity: number;
    unitPrice?: number;
    brand?: string;
    category?: string;
    notes?: string;
  }>;
  status: string;
  quoted_amount?: number | null;
  created_at: string;
}

/**
 * Helper to build a standard CrmOutboundEvent
 */
export function buildCrmOutboundEvent<T>(
  eventType: CrmEventType,
  entityType: CrmEntityType,
  entityId: string,
  data: T
): CrmOutboundEvent<T> {
  const eventId = `evt_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  const now = new Date().toISOString();
  const idempotencyKey = `${entityType}:${entityId}:${eventType}:${now.substring(0, 10)}`;

  return {
    event_id: eventId,
    event_type: eventType,
    entity_type: entityType,
    entity_id: entityId,
    occurred_at: now,
    source: "cool-technologies-website",
    version: "1.0",
    idempotency_key: idempotencyKey,
    data,
  };
}
