/* ─────────────────────────────────────────────────────────────────
   Cool Technologies — Unified Enquiries Route Handler
   Database: Cloudflare D1 (Table: enquiries)
   Integration: Server-Side Future CRM Sync
───────────────────────────────────────────────────────────────── */

import { Env } from "../env";
import { authenticateRequest, requireRole } from "../auth/middleware";
import { syncRecordToCrm } from "../crm/crmService";

export interface EnquiryRecord {
  id: string;
  source: string;
  type: string;
  name: string;
  email: string;
  phone: string | null;
  company_name: string | null;
  subject: string | null;
  message: string;
  metadata_json: string | null;
  status: string;
  crm_record_id: string | null;
  crm_sync_status: string | null;
  crm_last_synced_at: string | null;
  crm_sync_error: string | null;
  created_at: string;
  updated_at: string;
}

function formatEnquiry(row: EnquiryRecord) {
  let metadata: Record<string, any> = {};
  try {
    if (row.metadata_json) metadata = JSON.parse(row.metadata_json);
  } catch {}

  return {
    id: row.id,
    source: row.source,
    type: row.type,
    name: row.name,
    email: row.email,
    phone: row.phone || undefined,
    companyName: row.company_name || undefined,
    subject: row.subject || undefined,
    message: row.message,
    metadata,
    status: row.status,
    crmRecordId: row.crm_record_id || undefined,
    crmSyncStatus: row.crm_sync_status || "pending",
    crmLastSyncedAt: row.crm_last_synced_at || undefined,
    crmSyncError: row.crm_sync_error || undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

/**
 * Public: Submit general enquiry from any website form
 * POST /api/enquiries
 */
export async function handleSubmitEnquiry(request: Request, env: Env): Promise<Response> {
  try {
    const body = (await request.json()) as any;
    const {
      source = "contact_page",
      type = "general",
      name,
      email,
      phone,
      company_name,
      companyName,
      subject,
      message,
      metadata = {},
    } = body || {};

    if (!name || !email || !message) {
      return new Response(
        JSON.stringify({ error: "Bad Request", message: "Name, email, and message are required." }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const id = `ENQ-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;
    const now = new Date().toISOString();
    const resolvedCompanyName = company_name || companyName || null;
    const metadataJson = typeof metadata === "object" ? JSON.stringify(metadata) : "{}";

    // 1. Insert into authoritative Cloudflare D1 database
    await env.DB.prepare(`
      INSERT INTO enquiries (
        id, source, type, name, email, phone, company_name, subject, message,
        metadata_json, status, crm_sync_status, created_at, updated_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'NEW', 'pending', ?, ?)
    `)
      .bind(
        id,
        source,
        type,
        name.trim(),
        email.trim().toLowerCase(),
        phone ? phone.trim() : null,
        resolvedCompanyName ? resolvedCompanyName.trim() : null,
        subject ? subject.trim() : null,
        message.trim(),
        metadataJson,
        now,
        now
      )
      .run();

    // 2. Dispatch to future CRM integration layer (asynchronously / resiliently)
    const crmResult = await syncRecordToCrm("enquiry", {
      id,
      source,
      type,
      name,
      email,
      phone,
      companyName: resolvedCompanyName,
      subject,
      message,
      metadata,
      createdAt: now,
    }, env);

    if (crmResult.success && crmResult.crmRecordId) {
      await env.DB.prepare(`
        UPDATE enquiries
        SET crm_record_id = ?, crm_sync_status = 'synced', crm_last_synced_at = ?
        WHERE id = ?
      `)
        .bind(crmResult.crmRecordId, new Date().toISOString(), id)
        .run();
    } else if (!crmResult.success) {
      await env.DB.prepare(`
        UPDATE enquiries
        SET crm_sync_status = 'failed', crm_sync_error = ?
        WHERE id = ?
      `)
        .bind(crmResult.error || "CRM sync failed", id)
        .run();
    }

    const saved = await env.DB.prepare("SELECT * FROM enquiries WHERE id = ?").bind(id).first<EnquiryRecord>();

    return new Response(
      JSON.stringify({
        status: "success",
        message: "Your enquiry has been received. Our engineering team will contact you shortly.",
        enquiry: saved ? formatEnquiry(saved) : { id },
      }),
      { status: 201, headers: { "Content-Type": "application/json" } }
    );
  } catch (err: any) {
    console.error("[Enquiries] Error submitting enquiry:", err);
    return new Response(
      JSON.stringify({ error: "Internal Error", message: err?.message || "Failed to submit enquiry." }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

/**
 * Admin: List all website enquiries with search & filters
 * GET /api/enquiries
 */
export async function handleListEnquiries(request: Request, env: Env): Promise<Response> {
  const user = await authenticateRequest(request, env);
  requireRole(user, ["admin", "superAdmin", "sales"]);

  const url = new URL(request.url);
  const search = url.searchParams.get("search") || "";
  const source = url.searchParams.get("source") || "";
  const status = url.searchParams.get("status") || "";
  const type = url.searchParams.get("type") || "";

  let query = "SELECT * FROM enquiries WHERE 1=1";
  const params: any[] = [];

  if (search) {
    query += " AND (name LIKE ? OR email LIKE ? OR company_name LIKE ? OR subject LIKE ? OR message LIKE ? OR id LIKE ?)";
    const wildcard = `%${search}%`;
    params.push(wildcard, wildcard, wildcard, wildcard, wildcard, wildcard);
  }

  if (source && source !== "all") {
    query += " AND source = ?";
    params.push(source);
  }

  if (status && status !== "all") {
    query += " AND status = ?";
    params.push(status);
  }

  if (type && type !== "all") {
    query += " AND type = ?";
    params.push(type);
  }

  query += " ORDER BY created_at DESC LIMIT 200";

  const stmt = env.DB.prepare(query);
  const { results } = params.length > 0 ? await stmt.bind(...params).all<EnquiryRecord>() : await stmt.all<EnquiryRecord>();

  return new Response(
    JSON.stringify({
      status: "success",
      count: results.length,
      enquiries: results.map(formatEnquiry),
    }),
    { status: 200, headers: { "Content-Type": "application/json" } }
  );
}

/**
 * Admin: Get single enquiry details
 * GET /api/enquiries/:id
 */
export async function handleGetEnquiryById(enquiryId: string, request: Request, env: Env): Promise<Response> {
  const user = await authenticateRequest(request, env);
  requireRole(user, ["admin", "superAdmin", "sales"]);

  const row = await env.DB.prepare("SELECT * FROM enquiries WHERE id = ?").bind(enquiryId).first<EnquiryRecord>();

  if (!row) {
    return new Response(
      JSON.stringify({ error: "Not Found", message: `Enquiry '${enquiryId}' not found.` }),
      { status: 404, headers: { "Content-Type": "application/json" } }
    );
  }

  return new Response(
    JSON.stringify({ status: "success", enquiry: formatEnquiry(row) }),
    { status: 200, headers: { "Content-Type": "application/json" } }
  );
}

/**
 * Admin: Update enquiry status
 * PUT /api/enquiries/:id
 */
export async function handleUpdateEnquiryStatus(enquiryId: string, request: Request, env: Env): Promise<Response> {
  const user = await authenticateRequest(request, env);
  requireRole(user, ["admin", "superAdmin", "sales"]);

  const body = (await request.json()) as any;
  const { status, crmRecordId, crmSyncStatus } = body || {};

  if (!status) {
    return new Response(
      JSON.stringify({ error: "Bad Request", message: "Status is required." }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  const now = new Date().toISOString();

  await env.DB.prepare(`
    UPDATE enquiries
    SET status = ?,
        crm_record_id = COALESCE(?, crm_record_id),
        crm_sync_status = COALESCE(?, crm_sync_status),
        updated_at = ?
    WHERE id = ?
  `)
    .bind(status, crmRecordId || null, crmSyncStatus || null, now, enquiryId)
    .run();

  const updated = await env.DB.prepare("SELECT * FROM enquiries WHERE id = ?").bind(enquiryId).first<EnquiryRecord>();

  return new Response(
    JSON.stringify({
      status: "success",
      message: `Enquiry status updated to '${status}'.`,
      enquiry: updated ? formatEnquiry(updated) : null,
    }),
    { status: 200, headers: { "Content-Type": "application/json" } }
  );
}

/**
 * Admin: Delete enquiry
 * DELETE /api/enquiries/:id
 */
export async function handleDeleteEnquiry(enquiryId: string, request: Request, env: Env): Promise<Response> {
  const user = await authenticateRequest(request, env);
  requireRole(user, ["admin", "superAdmin"]);

  await env.DB.prepare("DELETE FROM enquiries WHERE id = ?").bind(enquiryId).run();

  return new Response(
    JSON.stringify({ status: "success", message: `Enquiry '${enquiryId}' deleted successfully.` }),
    { status: 200, headers: { "Content-Type": "application/json" } }
  );
}
