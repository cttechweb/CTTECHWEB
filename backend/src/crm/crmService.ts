/* ─────────────────────────────────────────────────────────────────
   Cool Technologies — Vendor-Neutral Outbound CRM Integration Dispatcher
   Architecture: Server-Side Cloudflare Worker Integration Layer
   
   Resilient Design Principles:
   1. Cloudflare D1 persistence is primary and authoritative.
   2. CRM dispatch executes asynchronously/resiliently after D1 writes.
   3. If CRM is unavailable or unconfigured, D1 transactions are never
      rolled back, and the client receives a successful response.
   4. No CRM secrets, tokens, or internal errors are exposed to the browser.
───────────────────────────────────────────────────────────────── */

import { Env } from "../env";
import { 
  CrmOutboundEvent, 
  CrmEntityType, 
  CrmEventType, 
  buildCrmOutboundEvent,
  RetailerApplicationCrmPayload,
  EnquiryCrmPayload,
  CustomerCrmPayload,
  CompanyCrmPayload,
  OrderCrmPayload,
  QuoteCrmPayload
} from "./contract";

export interface CrmSyncResult {
  success: boolean;
  isConfigured: boolean;
  status: "synced" | "pending" | "failed";
  crmRecordId?: string;
  error?: string;
  eventId?: string;
}

/**
 * Core vendor-neutral outbound event dispatcher
 */
export async function dispatchEventToCrm<T>(
  event: CrmOutboundEvent<T>,
  env: Env
): Promise<CrmSyncResult> {
  const crmBaseUrl = env.CRM_API_BASE_URL?.trim();
  const apiKey = env.CRM_API_KEY?.trim();

  // If CRM is not configured on this server, record stays marked as pending in D1
  if (!crmBaseUrl || !apiKey) {
    return {
      success: true,
      isConfigured: false,
      status: "pending",
      crmRecordId: undefined,
      eventId: event.event_id,
    };
  }

  try {
    const endpoint = `${crmBaseUrl.replace(/\/$/, "")}/api/v1/events`;
    
    // Create an abort controller with a 5-second timeout to avoid worker hanging
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
        "X-Idempotency-Key": event.idempotency_key,
        "X-Event-ID": event.event_id,
        "X-Event-Type": event.event_type,
        "X-Integration-Source": "cooltech-platform",
      },
      body: JSON.stringify(event),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text().catch(() => "CRM Server Error");
      // Sanitize error text to avoid logging sensitive data
      const sanitizedError = errorText.substring(0, 200).replace(/key=[^&\s]+/gi, "key=***");
      console.warn(`[CRM Outbound] Non-2xx from CRM (${response.status}) for ${event.event_type} [${event.entity_id}]: ${sanitizedError}`);
      
      return {
        success: false,
        isConfigured: true,
        status: "failed",
        error: `CRM Error (HTTP ${response.status})`,
        eventId: event.event_id,
      };
    }

    const data = (await response.json().catch(() => ({}))) as any;
    const crmRecordId = data.crm_record_id || data.crm_id || data.record_id || data.id;

    return {
      success: true,
      isConfigured: true,
      status: "synced",
      crmRecordId: crmRecordId ? String(crmRecordId) : undefined,
      eventId: event.event_id,
    };
  } catch (err: any) {
    const isTimeout = err?.name === "AbortError";
    const errorMessage = isTimeout ? "CRM Connection Timeout (5s)" : (err?.message || "CRM Network Error");
    console.error(`[CRM Outbound] Exception dispatching event ${event.event_type} [${event.entity_id}]:`, errorMessage);
    
    return {
      success: false,
      isConfigured: true,
      status: "failed",
      error: errorMessage,
      eventId: event.event_id,
    };
  }
}

/**
 * 1. Dispatch Retailer Application Event
 */
export async function syncRetailerApplicationToCrm(
  eventType: "retailer.application.created" | "retailer.application.updated" | "retailer.application.approved" | "retailer.application.rejected",
  payload: RetailerApplicationCrmPayload,
  env: Env
): Promise<CrmSyncResult> {
  const event = buildCrmOutboundEvent(eventType, "retailer_application", payload.application_id, payload);
  return dispatchEventToCrm(event, env);
}

/**
 * 2. Dispatch General Enquiry Event
 */
export async function syncEnquiryToCrm(
  eventType: "enquiry.created" | "enquiry.updated",
  payload: EnquiryCrmPayload,
  env: Env
): Promise<CrmSyncResult> {
  const event = buildCrmOutboundEvent(eventType, "enquiry", payload.enquiry_id, payload);
  return dispatchEventToCrm(event, env);
}

/**
 * 3. Dispatch Order Event
 */
export async function syncOrderToCrm(
  eventType: "order.created" | "order.updated",
  payload: OrderCrmPayload,
  env: Env
): Promise<CrmSyncResult> {
  const event = buildCrmOutboundEvent(eventType, "order", payload.order_id, payload);
  return dispatchEventToCrm(event, env);
}

/**
 * 4. Dispatch Quotation / RFQ Event
 */
export async function syncQuoteToCrm(
  eventType: "quote.created" | "quote.updated",
  payload: QuoteCrmPayload,
  env: Env
): Promise<CrmSyncResult> {
  const event = buildCrmOutboundEvent(eventType, "quote", payload.quote_id, payload);
  return dispatchEventToCrm(event, env);
}

/**
 * 5. Dispatch Customer Profile Event
 */
export async function syncCustomerToCrm(
  eventType: "customer.created" | "customer.updated",
  payload: CustomerCrmPayload,
  env: Env
): Promise<CrmSyncResult> {
  const event = buildCrmOutboundEvent(eventType, "customer", payload.user_id, payload);
  return dispatchEventToCrm(event, env);
}

/**
 * 6. Dispatch Company Event
 */
export async function syncCompanyToCrm(
  eventType: "company.created" | "company.updated",
  payload: CompanyCrmPayload,
  env: Env
): Promise<CrmSyncResult> {
  const event = buildCrmOutboundEvent(eventType, "company", payload.company_id, payload);
  return dispatchEventToCrm(event, env);
}

/**
 * Backward compatibility helper for legacy syncRecordToCrm calls
 */
export async function syncRecordToCrm(
  entityType: "retailer_application" | "order_request" | "enquiry" | "quote_request",
  payload: Record<string, any>,
  env: Env
): Promise<CrmSyncResult> {
  const eventTypeMap: Record<string, CrmEventType> = {
    retailer_application: "retailer.application.created",
    enquiry: "enquiry.created",
    order_request: "order.created",
    quote_request: "quote.created",
  };

  const entityTypeMap: Record<string, CrmEntityType> = {
    retailer_application: "retailer_application",
    enquiry: "enquiry",
    order_request: "order",
    quote_request: "quote",
  };

  const crmEntityType = entityTypeMap[entityType] || "enquiry";
  const crmEventType = eventTypeMap[entityType] || "enquiry.created";
  const entityId = payload.id || payload.order_id || payload.order_number || payload.application_id || `rec_${Date.now()}`;

  const event = buildCrmOutboundEvent(crmEventType, crmEntityType, entityId, payload);
  return dispatchEventToCrm(event, env);
}
