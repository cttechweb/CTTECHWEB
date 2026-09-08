import { Env } from "../env";

export async function handleHealth(request: Request, env: Env): Promise<Response> {
  const startTime = Date.now();
  let dbStatus = "connected";
  let tableCount = 0;

  try {
    const result = await env.DB.prepare(
      "SELECT count(*) as count FROM sqlite_master WHERE type='table' AND name NOT LIKE '_cf_%' AND name NOT LIKE 'sqlite_%'"
    ).first<{ count: number }>();
    tableCount = result?.count || 0;
  } catch (err: any) {
    dbStatus = `error: ${err?.message || "connection failed"}`;
  }

  const responsePayload = {
    status: "ok",
    service: "Cool Technologies Cloudflare Worker API",
    database: "Cloudflare D1 (cooltech_db)",
    database_status: dbStatus,
    tables_active: tableCount,
    firebase_auth_bridge: {
      project_id: env.FIREBASE_PROJECT_ID,
      jwks_endpoint: "https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com",
    },
    latency_ms: Date.now() - startTime,
    timestamp: new Date().toISOString(),
  };

  return new Response(JSON.stringify(responsePayload, null, 2), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}
