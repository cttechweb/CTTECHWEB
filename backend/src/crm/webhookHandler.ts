/* ─────────────────────────────────────────────────────────────────
   Cool Technologies — Inbound CRM Webhook Handler
   Endpoints: POST /api/webhooks/crm & POST /api/crm/webhook
   Security: Server-Side Secret Verification (Bearer / HMAC Signature)
───────────────────────────────────────────────────────────────── */

import { Env } from "../env";

/**
 * Constant-time string comparison to prevent timing side-channel attacks
 */
function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let mismatch = 0;
  for (let i = 0; i < a.length; i++) {
    mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return mismatch === 0;
}

/**
 * Handle incoming webhooks dispatched from the future CRM system.
 */
export async function handleCrmWebhook(request: Request, env: Env): Promise<Response> {
  if (request.method !== "POST") {
    return new Response(
      JSON.stringify({ error: "Method Not Allowed", message: "Only POST requests are permitted for CRM webhooks." }),
      { status: 405, headers: { "Content-Type": "application/json" } }
    );
  }

  // 1. Verify Webhook Secret Authenticity
  const webhookSecret = env.CRM_WEBHOOK_SECRET?.trim();
  if (!webhookSecret) {
    return new Response(
      JSON.stringify({
        error: "Service Unavailable",
        message: "Inbound CRM webhook endpoint is disabled: server secret is not configured.",
      }),
      { status: 503, headers: { "Content-Type": "application/json" } }
    );
  }

  const authHeader = request.headers.get("Authorization")?.trim();
  const signatureHeader = (
    request.headers.get("X-CRM-Signature") ||
    request.headers.get("X-Webhook-Secret") ||
    request.headers.get("X-Hub-Signature-256") ||
    ""
  ).trim();

  const bearerToken = authHeader?.startsWith("Bearer ") ? authHeader.substring(7).trim() : null;
  const isBearerValid = bearerToken ? safeEqual(bearerToken, webhookSecret) : false;
  const isSignatureValid = signatureHeader ? safeEqual(signatureHeader, webhookSecret) : false;

  if (!isBearerValid && !isSignatureValid) {
    return new Response(
      JSON.stringify({
        error: "Unauthorized",
        message: "Invalid or missing CRM webhook secret / signature header.",
      }),
      { status: 401, headers: { "Content-Type": "application/json" } }
    );
  }

  // 2. Parse and Validate Webhook Payload
  try {
    const rawBody = await request.text();
    let body: any = {};
    try {
      body = JSON.parse(rawBody);
    } catch {
      return new Response(
        JSON.stringify({ error: "Bad Request", message: "Invalid JSON webhook payload." }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const event = body.event || body.event_type;
    const entityId = body.entity_id || body.id || body.application_id || body.order_id || body.enquiry_id;
    const crmRecordId = body.crm_record_id || body.crm_id || body.record_id || null;
    const incomingStatus = body.status ? String(body.status).toLowerCase().trim() : null;
    const notes = body.notes || body.review_notes || body.admin_notes || body.rejection_reason || null;
    const quotedAmount = typeof body.quoted_amount === "number" ? body.quoted_amount : null;

    if (!event || !entityId) {
      return new Response(
        JSON.stringify({
          error: "Bad Request",
          message: "Missing required webhook fields: 'event' (or 'event_type') and 'entity_id'.",
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const now = new Date().toISOString();

    // 3. Process Specific CRM Event Types
    switch (event) {
      // ──────── RETAILER APPLICATION STATUS EVENTS ────────
      case "retailer.application.status_changed":
      case "retailer.application.approved":
      case "retailer.application.rejected":
      case "retailer_application.updated": {
        let finalStatus = incomingStatus;
        if (event === "retailer.application.approved") finalStatus = "approved";
        if (event === "retailer.application.rejected") finalStatus = "rejected";

        const validStatuses = ["pending", "under_review", "approved", "rejected"];
        const sanitizedStatus = finalStatus && validStatuses.includes(finalStatus) ? finalStatus : null;

        await env.DB.prepare(`
          UPDATE retailer_applications
          SET status = COALESCE(?, status),
              crm_record_id = COALESCE(?, crm_record_id),
              review_notes = COALESCE(?, review_notes),
              crm_sync_status = 'synced',
              crm_last_synced_at = ?,
              updated_at = ?
          WHERE id = ? OR crm_record_id = ?
        `)
          .bind(sanitizedStatus, crmRecordId, notes, now, now, entityId, entityId)
          .run();

        // Atomic User Role & B2B Verification Synchronization
        const app = await env.DB.prepare(
          "SELECT user_id, status FROM retailer_applications WHERE id = ? OR crm_record_id = ? LIMIT 1"
        )
          .bind(entityId, entityId)
          .first<any>();

        if (app?.user_id) {
          if (sanitizedStatus === "approved" || app.status === "approved") {
            await env.DB.prepare(
              "UPDATE users SET is_verified_retailer = 1, role = 'retailer', updated_at = ? WHERE id = ?"
            )
              .bind(now, app.user_id)
              .run();
          } else if (sanitizedStatus === "rejected") {
            await env.DB.prepare(
              "UPDATE users SET is_verified_retailer = 0, role = CASE WHEN role = 'retailer' THEN 'customer' ELSE role END, updated_at = ? WHERE id = ?"
            )
              .bind(now, app.user_id)
              .run();
          }
        }
        break;
      }

      // ──────── B2B ORDER STATUS EVENTS ────────
      case "order.status_changed":
      case "order.updated":
      case "order_request.status_changed": {
        await env.DB.prepare(`
          UPDATE orders
          SET status = COALESCE(?, status),
              crm_record_id = COALESCE(?, crm_record_id),
              admin_notes = COALESCE(?, admin_notes),
              crm_sync_status = 'synced',
              crm_last_synced_at = ?,
              updated_at = ?
          WHERE id = ? OR order_number = ? OR crm_record_id = ?
        `)
          .bind(incomingStatus, crmRecordId, notes, now, now, entityId, entityId, entityId)
          .run();
        break;
      }

      // ──────── GENERAL ENQUIRY STATUS EVENTS ────────
      case "enquiry.status_changed":
      case "enquiry.updated": {
        await env.DB.prepare(`
          UPDATE enquiries
          SET status = COALESCE(?, status),
              crm_record_id = COALESCE(?, crm_record_id),
              crm_sync_status = 'synced',
              crm_last_synced_at = ?,
              updated_at = ?
          WHERE id = ? OR crm_record_id = ?
        `)
          .bind(incomingStatus?.toUpperCase() || incomingStatus, crmRecordId, now, now, entityId, entityId)
          .run();
        break;
      }

      // ──────── QUOTATION / RFQ STATUS EVENTS ────────
      case "quote.status_changed":
      case "quote.updated":
      case "quote_request.status_changed": {
        await env.DB.prepare(`
          UPDATE quotes
          SET status = COALESCE(?, status),
              quoted_amount = COALESCE(?, quoted_amount),
              admin_notes = COALESCE(?, admin_notes),
              updated_at = ?
          WHERE id = ?
        `)
          .bind(incomingStatus, quotedAmount, notes, now, entityId)
          .run();
        break;
      }

      default:
        console.log(`[CRM Inbound Webhook] Unhandled event received: ${event} for entity ${entityId}`);
    }

    return new Response(
      JSON.stringify({
        status: "success",
        message: `CRM event '${event}' processed successfully.`,
        entity_id: entityId,
        processed_at: now,
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (err: any) {
    console.error("[CRM Inbound Webhook] Uncaught processing error:", err);
    return new Response(
      JSON.stringify({
        error: "Internal Server Error",
        message: "An error occurred while processing the CRM webhook event.",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
