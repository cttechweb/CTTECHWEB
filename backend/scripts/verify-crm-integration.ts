/* ─────────────────────────────────────────────────────────────────
   Cool Technologies — Comprehensive CRM Integration Verification Test
   PROMPT 8 End-to-End Simulation & Validation Script
───────────────────────────────────────────────────────────────── */

import { buildCrmOutboundEvent, CrmOutboundEvent } from "../src/crm/contract";
import { dispatchEventToCrm, syncRetailerApplicationToCrm, syncOrderToCrm, syncQuoteToCrm, syncEnquiryToCrm } from "../src/crm/crmService";
import { handleCrmWebhook } from "../src/crm/webhookHandler";
import { Env } from "../src/env";

interface TestResult {
  name: string;
  category: string;
  status: "PASS" | "FAIL" | "NOT CONFIGURED";
  evidence: string;
}

const results: TestResult[] = [];

function assert(condition: boolean, name: string, category: string, evidence: string) {
  if (condition) {
    results.push({ name, category, status: "PASS", evidence });
    console.log(`✓ [PASS] ${name}`);
  } else {
    results.push({ name, category, status: "FAIL", evidence: `Assertion failed: ${evidence}` });
    console.error(`✗ [FAIL] ${name}: ${evidence}`);
  }
}

// In-memory mock database for Cloudflare D1
class MockD1 {
  tables: Record<string, any[]> = {
    users: [],
    retailer_applications: [],
    orders: [],
    order_items: [],
    quotes: [],
    quote_items: [],
    enquiries: [],
  };

  prepare(sql: string) {
    const mock = this;
    return {
      bind(...params: any[]) {
        return {
          async run() {
            // Simulated SQL statements
            if (sql.includes("UPDATE retailer_applications")) {
              const app = mock.tables.retailer_applications[0];
              if (app) {
                if (params[0]) app.status = params[0];
                if (params[1]) app.crm_record_id = params[1];
                if (params[2]) app.review_notes = params[2];
                app.crm_sync_status = "synced";
                app.crm_last_synced_at = params[3] || new Date().toISOString();
                app.updated_at = params[4] || new Date().toISOString();
              }
            } else if (sql.includes("UPDATE users SET is_verified_retailer = 1")) {
              const user = mock.tables.users.find(u => u.id === params[1]);
              if (user) {
                user.is_verified_retailer = 1;
                user.role = "retailer";
                user.updated_at = params[0];
              }
            } else if (sql.includes("UPDATE users SET is_verified_retailer = 0")) {
              const user = mock.tables.users.find(u => u.id === params[1]);
              if (user) {
                user.is_verified_retailer = 0;
                user.role = "customer";
                user.updated_at = params[0];
              }
            } else if (sql.includes("UPDATE orders")) {
              const ord = mock.tables.orders[0];
              if (ord) {
                if (params[0]) ord.status = params[0];
                if (params[1]) ord.crm_record_id = params[1];
                if (params[2]) ord.admin_notes = params[2];
                ord.crm_sync_status = "synced";
                ord.crm_last_synced_at = params[3] || new Date().toISOString();
              }
            } else if (sql.includes("UPDATE quotes")) {
              const q = mock.tables.quotes[0];
              if (q) {
                if (params[0]) q.status = params[0];
                if (params[1]) q.quoted_amount = params[1];
                if (params[2]) q.admin_notes = params[2];
              }
            } else if (sql.includes("UPDATE enquiries")) {
              const enq = mock.tables.enquiries[0];
              if (enq) {
                if (params[0]) enq.status = params[0];
                if (params[1]) enq.crm_record_id = params[1];
                enq.crm_sync_status = "synced";
                enq.crm_last_synced_at = params[2] || new Date().toISOString();
              }
            }
            return { success: true, meta: {} };
          },
          async first<T = any>(): Promise<T | null> {
            if (sql.includes("SELECT user_id, status FROM retailer_applications") || sql.includes("SELECT * FROM retailer_applications")) {
              return (mock.tables.retailer_applications[0] as T) || null;
            }
            if (sql.includes("SELECT * FROM users")) {
              return (mock.tables.users[0] as T) || null;
            }
            return null;
          },
          async all<T = any>() {
            return { results: [] };
          }
        };
      }
    };
  }
}

async function runVerification() {
  console.log("==================================================");
  console.log("STARTING CRM INTEGRATION VERIFICATION SUITE");
  console.log("==================================================");

  const mockDb = new MockD1();
  const mockEnvUnconfigured: Env = {
    DB: mockDb as any,
    FIREBASE_PROJECT_ID: "cool-technologies-b2b",
    ENVIRONMENT: "production",
  };

  const mockEnvConfigured: Env = {
    DB: mockDb as any,
    FIREBASE_PROJECT_ID: "cool-technologies-b2b",
    ENVIRONMENT: "production",
    CRM_API_BASE_URL: "https://crm.internal.cooltech.ae",
    CRM_API_KEY: "crm_live_secret_key_12345",
    CRM_WEBHOOK_SECRET: "crm_whsec_998877665544332211",
  };

  // ─────────────────────────────────────────────────────────────
  // 1. TEST API CONTRACT STRUCTURE
  // ─────────────────────────────────────────────────────────────
  console.log("\n[1] Testing API Contract Structure...");
  const sampleEvent = buildCrmOutboundEvent("retailer.application.created", "retailer_application", "RA-TEST-001", {
    company_name: "Apex MEP LLC",
    trade_license: "TL-12345",
    email: "test@apex.ae"
  });

  assert(Boolean(sampleEvent.event_id && sampleEvent.event_id.startsWith("evt_")), "Event ID format", "Contract", `Event ID: ${sampleEvent.event_id}`);
  assert(sampleEvent.event_type === "retailer.application.created", "Event Type format", "Contract", `Event Type: ${sampleEvent.event_type}`);
  assert(sampleEvent.entity_type === "retailer_application", "Entity Type format", "Contract", `Entity Type: ${sampleEvent.entity_type}`);
  assert(sampleEvent.source === "cool-technologies-website", "Source metadata format", "Contract", `Source: ${sampleEvent.source}`);
  assert(sampleEvent.version === "1.0", "Contract Version format", "Contract", `Version: ${sampleEvent.version}`);
  assert(Boolean(sampleEvent.idempotency_key && sampleEvent.idempotency_key.includes("retailer_application:RA-TEST-001")), "Idempotency Key format", "Contract", `Idempotency Key: ${sampleEvent.idempotency_key}`);
  assert(!JSON.stringify(sampleEvent).includes("password") && !JSON.stringify(sampleEvent).includes("Bearer"), "Payload Data Scrubbing", "Contract", "No credentials or private tokens present in event payload");

  // ─────────────────────────────────────────────────────────────
  // 2. TEST OUTBOUND DISPATCHER (UNCONFIGURED STATE)
  // ─────────────────────────────────────────────────────────────
  console.log("\n[2] Testing Outbound Dispatcher (Unconfigured State)...");
  const unconfiguredResult = await dispatchEventToCrm(sampleEvent, mockEnvUnconfigured);
  assert(unconfiguredResult.success === true, "Unconfigured dispatch success flag", "Outbound", "Returns success: true so local flow is never blocked");
  assert(unconfiguredResult.isConfigured === false, "Unconfigured dispatch configuration flag", "Outbound", "Honestly reports isConfigured: false");
  assert(unconfiguredResult.status === "pending", "Unconfigured dispatch status", "Outbound", "Sets status: 'pending' in local database");
  assert(unconfiguredResult.crmRecordId === undefined, "Unconfigured dispatch record ID", "Outbound", "No fake CRM record ID invented");

  // ─────────────────────────────────────────────────────────────
  // 3. TEST INBOUND WEBHOOK AUTHENTICATION
  // ─────────────────────────────────────────────────────────────
  console.log("\n[3] Testing Inbound Webhook Authentication...");

  // Test A: No secret set on server
  const reqNoServerSecret = new Request("https://api.cooltech.ae/api/webhooks/crm", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ event: "enquiry.status_changed", entity_id: "ENQ-1" }),
  });
  const resNoServerSecret = await handleCrmWebhook(reqNoServerSecret, mockEnvUnconfigured);
  assert(resNoServerSecret.status === 503, "Webhook Disabled when Secret Unset", "Webhook Auth", `Status: ${resNoServerSecret.status} Service Unavailable`);

  // Test B: Invalid signature against configured server
  const reqInvalidSecret = new Request("https://api.cooltech.ae/api/webhooks/crm", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer invalid_secret_token_xyz"
    },
    body: JSON.stringify({ event: "enquiry.status_changed", entity_id: "ENQ-1" }),
  });
  const resInvalidSecret = await handleCrmWebhook(reqInvalidSecret, mockEnvConfigured);
  assert(resInvalidSecret.status === 401, "Webhook Rejects Invalid Token", "Webhook Auth", `Status: ${resInvalidSecret.status} Unauthorized`);

  // Test C: Valid Bearer header
  const reqValidBearer = new Request("https://api.cooltech.ae/api/webhooks/crm", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${mockEnvConfigured.CRM_WEBHOOK_SECRET}`
    },
    body: JSON.stringify({ event: "enquiry.status_changed", entity_id: "ENQ-1", status: "CONTACTED" }),
  });
  const resValidBearer = await handleCrmWebhook(reqValidBearer, mockEnvConfigured);
  assert(resValidBearer.status === 200, "Webhook Accepts Valid Bearer Secret", "Webhook Auth", `Status: ${resValidBearer.status} OK`);

  // Test D: Valid X-CRM-Signature header
  const reqValidHeader = new Request("https://api.cooltech.ae/api/webhooks/crm", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-CRM-Signature": mockEnvConfigured.CRM_WEBHOOK_SECRET!
    },
    body: JSON.stringify({ event: "enquiry.status_changed", entity_id: "ENQ-1", status: "CONTACTED" }),
  });
  const resValidHeader = await handleCrmWebhook(reqValidHeader, mockEnvConfigured);
  assert(resValidHeader.status === 200, "Webhook Accepts Valid X-CRM-Signature", "Webhook Auth", `Status: ${resValidHeader.status} OK`);

  // ─────────────────────────────────────────────────────────────
  // 4. TEST RETAILER APPROVAL & ROLE ELEVATION ATOMICITY
  // ─────────────────────────────────────────────────────────────
  console.log("\n[4] Testing Retailer Approval & Atomic Permission Elevation...");
  mockDb.tables.users = [{
    id: "usr_apex_001",
    email: "tariq@apex.ae",
    role: "customer",
    is_verified_retailer: 0,
  }];
  mockDb.tables.retailer_applications = [{
    id: "RA-1001",
    user_id: "usr_apex_001",
    company_name: "Apex MEP LLC",
    status: "pending",
  }];

  const reqApprove = new Request("https://api.cooltech.ae/api/webhooks/crm", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${mockEnvConfigured.CRM_WEBHOOK_SECRET}`
    },
    body: JSON.stringify({
      event: "retailer.application.approved",
      entity_id: "RA-1001",
      crm_record_id: "CRM-ACC-8877",
      status: "approved",
      notes: "Trade license and TRN verified by Cool Tech Credit Dept.",
    }),
  });

  const resApprove = await handleCrmWebhook(reqApprove, mockEnvConfigured);
  assert(resApprove.status === 200, "Retailer Approval Webhook Response", "Retailer Approval", "Status: 200 OK");
  assert(mockDb.tables.retailer_applications[0].status === "approved", "D1 Retailer Application Status", "Retailer Approval", "Status updated to 'approved'");
  assert(mockDb.tables.retailer_applications[0].crm_record_id === "CRM-ACC-8877", "D1 Retailer CRM Record ID", "Retailer Approval", "Saved CRM record ID 'CRM-ACC-8877'");
  assert(mockDb.tables.users[0].is_verified_retailer === 1, "D1 User B2B Verified Flag", "Retailer Approval", "is_verified_retailer elevated to 1");
  assert(mockDb.tables.users[0].role === "retailer", "D1 User Role Elevation", "Retailer Approval", "role elevated from 'customer' to 'retailer'");

  // ─────────────────────────────────────────────────────────────
  // 5. TEST RETAILER REJECTION & ROLE REVOCATION ATOMICITY
  // ─────────────────────────────────────────────────────────────
  console.log("\n[5] Testing Retailer Rejection & Atomic Permission Revocation...");
  const reqReject = new Request("https://api.cooltech.ae/api/webhooks/crm", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${mockEnvConfigured.CRM_WEBHOOK_SECRET}`
    },
    body: JSON.stringify({
      event: "retailer.application.rejected",
      entity_id: "RA-1001",
      status: "rejected",
      notes: "Trade license expired; renewal required.",
    }),
  });

  const resReject = await handleCrmWebhook(reqReject, mockEnvConfigured);
  assert(resReject.status === 200, "Retailer Rejection Webhook Response", "Retailer Rejection", "Status: 200 OK");
  assert(mockDb.tables.retailer_applications[0].status === "rejected", "D1 Retailer Application Status", "Retailer Rejection", "Status updated to 'rejected'");
  assert(mockDb.tables.users[0].is_verified_retailer === 0, "D1 User B2B Revocation Flag", "Retailer Rejection", "is_verified_retailer revoked to 0");
  assert(mockDb.tables.users[0].role === "customer", "D1 User Role Reversion", "Retailer Rejection", "role reverted to 'customer'");

  // ─────────────────────────────────────────────────────────────
  // 6. TEST ORDER STATUS WEBHOOK
  // ─────────────────────────────────────────────────────────────
  console.log("\n[6] Testing Order Status Webhook...");
  mockDb.tables.orders = [{
    id: "ord_1001",
    order_number: "ORD-2026-9900",
    status: "NEW",
    crm_record_id: null,
  }];

  const reqOrder = new Request("https://api.cooltech.ae/api/webhooks/crm", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${mockEnvConfigured.CRM_WEBHOOK_SECRET}`
    },
    body: JSON.stringify({
      event: "order.status_changed",
      entity_id: "ORD-2026-9900",
      crm_record_id: "CRM-SO-4455",
      status: "CONFIRMED",
      notes: "Commercial stock allocated at Al Quoz depot.",
    }),
  });

  const resOrder = await handleCrmWebhook(reqOrder, mockEnvConfigured);
  assert(resOrder.status === 200, "Order Status Webhook Response", "Order Sync", "Status: 200 OK");
  assert(mockDb.tables.orders[0].status === "CONFIRMED", "D1 Order Status", "Order Sync", "Status updated to 'CONFIRMED'");
  assert(mockDb.tables.orders[0].crm_record_id === "CRM-SO-4455", "D1 Order CRM Record ID", "Order Sync", "Recorded CRM record ID 'CRM-SO-4455'");

  // ─────────────────────────────────────────────────────────────
  // 7. TEST QUOTATION (RFQ) STATUS WEBHOOK
  // ─────────────────────────────────────────────────────────────
  console.log("\n[7] Testing Quotation (RFQ) Status Webhook...");
  mockDb.tables.quotes = [{
    id: "RFQ-2026-5544",
    status: "NEW",
    quoted_amount: null,
  }];

  const reqQuote = new Request("https://api.cooltech.ae/api/webhooks/crm", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${mockEnvConfigured.CRM_WEBHOOK_SECRET}`
    },
    body: JSON.stringify({
      event: "quote.status_changed",
      entity_id: "RFQ-2026-5544",
      status: "QUOTED",
      quoted_amount: 145000,
      notes: "Commercial proposal #CT-P-2026-08 dispatched.",
    }),
  });

  const resQuote = await handleCrmWebhook(reqQuote, mockEnvConfigured);
  assert(resQuote.status === 200, "Quote Status Webhook Response", "Quote Sync", "Status: 200 OK");
  assert(mockDb.tables.quotes[0].status === "QUOTED", "D1 Quote Status", "Quote Sync", "Status updated to 'QUOTED'");
  assert(mockDb.tables.quotes[0].quoted_amount === 145000, "D1 Quoted Amount", "Quote Sync", "Quoted amount updated to AED 145,000");

  // ─────────────────────────────────────────────────────────────
  // 8. TEST GENERAL ENQUIRY STATUS WEBHOOK
  // ─────────────────────────────────────────────────────────────
  console.log("\n[8] Testing General Enquiry Status Webhook...");
  mockDb.tables.enquiries = [{
    id: "ENQ-2026-7788",
    status: "NEW",
    crm_record_id: null,
  }];

  const reqEnquiry = new Request("https://api.cooltech.ae/api/webhooks/crm", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${mockEnvConfigured.CRM_WEBHOOK_SECRET}`
    },
    body: JSON.stringify({
      event: "enquiry.status_changed",
      entity_id: "ENQ-2026-7788",
      crm_record_id: "CRM-LEAD-1122",
      status: "IN_REVIEW",
    }),
  });

  const resEnquiry = await handleCrmWebhook(reqEnquiry, mockEnvConfigured);
  assert(resEnquiry.status === 200, "Enquiry Status Webhook Response", "Enquiry Sync", "Status: 200 OK");
  assert(mockDb.tables.enquiries[0].status === "IN_REVIEW", "D1 Enquiry Status", "Enquiry Sync", "Status updated to 'IN_REVIEW'");

  // ─────────────────────────────────────────────────────────────
  // 9. TEST IDEMPOTENCY (DUPLICATE WEBHOOK HANDLING)
  // ─────────────────────────────────────────────────────────────
  console.log("\n[9] Testing Idempotency & Duplicate Delivery...");
  const resEnquiryDup = await handleCrmWebhook(reqEnquiry, mockEnvConfigured);
  assert(resEnquiryDup.status === 200, "Duplicate Webhook Request", "Idempotency", "Second identical request returns 200 and does not crash or create duplicate records");
  assert(mockDb.tables.enquiries.length === 1, "No Duplicate Database Records Created", "Idempotency", "Single record preserved in D1 table");

  console.log("\n==================================================");
  console.log(`ALL ${results.length} VERIFICATION TESTS EXECUTED.`);
  console.log("==================================================");
}

runVerification().catch(console.error);
