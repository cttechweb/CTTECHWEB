/* ─────────────────────────────────────────────────────────────────
   Cool Technologies — Admin CRM Health & Integration Status Route
   Endpoint: GET /api/admin/crm/health
   Access: Admin / SuperAdmin Only
───────────────────────────────────────────────────────────────── */

import { Env } from "../env";
import { authenticateRequest, requireRole } from "../auth/middleware";

export async function handleGetCrmStatus(request: Request, env: Env): Promise<Response> {
  const user = await authenticateRequest(request, env);
  requireRole(user, ["admin", "superAdmin"]);

  const isOutboundConfigured = Boolean(env.CRM_API_BASE_URL && env.CRM_API_KEY);
  const isInboundConfigured = Boolean(env.CRM_WEBHOOK_SECRET);

  // Safe host display (never returns tokens or full paths with query params)
  let safeBaseHost: string | null = null;
  if (env.CRM_API_BASE_URL) {
    try {
      const u = new URL(env.CRM_API_BASE_URL);
      safeBaseHost = `${u.protocol}//${u.host}`;
    } catch {
      safeBaseHost = "configured (custom url)";
    }
  }

  // Query D1 sync status distribution across entities
  let enquiriesSync = { pending: 0, synced: 0, failed: 0 };
  let applicationsSync = { pending: 0, synced: 0, failed: 0 };
  let ordersSync = { pending: 0, synced: 0, failed: 0 };
  let lastSyncTimestamp: string | null = null;

  try {
    const enqCounts = await env.DB.prepare(`
      SELECT 
        SUM(CASE WHEN crm_sync_status = 'pending' OR crm_sync_status IS NULL THEN 1 ELSE 0 END) as pending,
        SUM(CASE WHEN crm_sync_status = 'synced' THEN 1 ELSE 0 END) as synced,
        SUM(CASE WHEN crm_sync_status = 'failed' THEN 1 ELSE 0 END) as failed,
        MAX(crm_last_synced_at) as last_synced
      FROM enquiries
    `).first<any>();

    if (enqCounts) {
      enquiriesSync = {
        pending: Number(enqCounts.pending || 0),
        synced: Number(enqCounts.synced || 0),
        failed: Number(enqCounts.failed || 0),
      };
      if (enqCounts.last_synced) lastSyncTimestamp = enqCounts.last_synced;
    }
  } catch {}

  try {
    const appCounts = await env.DB.prepare(`
      SELECT 
        SUM(CASE WHEN crm_sync_status = 'pending' OR crm_sync_status IS NULL THEN 1 ELSE 0 END) as pending,
        SUM(CASE WHEN crm_sync_status = 'synced' THEN 1 ELSE 0 END) as synced,
        SUM(CASE WHEN crm_sync_status = 'failed' THEN 1 ELSE 0 END) as failed,
        MAX(crm_last_synced_at) as last_synced
      FROM retailer_applications
    `).first<any>();

    if (appCounts) {
      applicationsSync = {
        pending: Number(appCounts.pending || 0),
        synced: Number(appCounts.synced || 0),
        failed: Number(appCounts.failed || 0),
      };
      if (appCounts.last_synced && (!lastSyncTimestamp || appCounts.last_synced > lastSyncTimestamp)) {
        lastSyncTimestamp = appCounts.last_synced;
      }
    }
  } catch {}

  try {
    const ordCounts = await env.DB.prepare(`
      SELECT 
        SUM(CASE WHEN crm_sync_status = 'pending' OR crm_sync_status IS NULL THEN 1 ELSE 0 END) as pending,
        SUM(CASE WHEN crm_sync_status = 'synced' THEN 1 ELSE 0 END) as synced,
        SUM(CASE WHEN crm_sync_status = 'failed' THEN 1 ELSE 0 END) as failed,
        MAX(crm_last_synced_at) as last_synced
      FROM orders
    `).first<any>();

    if (ordCounts) {
      ordersSync = {
        pending: Number(ordCounts.pending || 0),
        synced: Number(ordCounts.synced || 0),
        failed: Number(ordCounts.failed || 0),
      };
      if (ordCounts.last_synced && (!lastSyncTimestamp || ordCounts.last_synced > lastSyncTimestamp)) {
        lastSyncTimestamp = ordCounts.last_synced;
      }
    }
  } catch {}

  const totalPending = enquiriesSync.pending + applicationsSync.pending + ordersSync.pending;
  const totalSynced = enquiriesSync.synced + applicationsSync.synced + ordersSync.synced;
  const totalFailed = enquiriesSync.failed + applicationsSync.failed + ordersSync.failed;

  return new Response(
    JSON.stringify({
      status: "success",
      crmIntegration: {
        isConfigured: isOutboundConfigured,
        provider: "vendor_neutral",
        outboundConfigured: isOutboundConfigured,
        inboundWebhookConfigured: isInboundConfigured,
        endpointHost: safeBaseHost,
        contractVersion: "1.0",
        supportedEntities: [
          "retailer_application",
          "enquiry",
          "customer",
          "company",
          "order",
          "quote"
        ],
        healthMessage: isOutboundConfigured
          ? "CRM integration is configured and active."
          : "CRM integration foundation is ready. No external CRM is connected.",
      },
      synchronizationMetrics: {
        totalPending,
        totalSynced,
        totalFailed,
        lastSuccessfulSync: lastSyncTimestamp,
        entityBreakdown: {
          retailerApplications: applicationsSync,
          enquiries: enquiriesSync,
          orders: ordersSync,
        },
      },
    }),
    { status: 200, headers: { "Content-Type": "application/json" } }
  );
}
