import { Env } from "../env";
import { authenticateRequest, requireRole } from "../auth/middleware";

/**
 * Ensure the site_settings table exists in D1 database
 */
async function ensureSettingsTable(env: Env) {
  try {
    await env.DB.prepare(`
      CREATE TABLE IF NOT EXISTS site_settings (
        id TEXT PRIMARY KEY DEFAULT 'default',
        settings_json TEXT NOT NULL,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP
      );
    `).run();
  } catch (err) {
    console.warn("[SiteSettings] ensureSettingsTable notice:", err);
  }
}

/**
 * Public: Fetch global site & contact center settings from D1
 * Accessible by anyone so public website, incognito, and fresh browsers render live settings.
 */
export async function handleGetSiteSettings(request: Request, env: Env): Promise<Response> {
  await ensureSettingsTable(env);

  try {
    const row = await env.DB.prepare(
      "SELECT settings_json, updated_at FROM site_settings WHERE id = 'default' LIMIT 1"
    ).first<{ settings_json: string; updated_at: string }>();

    if (row && row.settings_json) {
      const parsed = JSON.parse(row.settings_json);
      return new Response(
        JSON.stringify({
          status: "success",
          settings: parsed,
          updatedAt: row.updated_at
        }),
        {
          status: 200,
          headers: {
            "Content-Type": "application/json",
            "Cache-Control": "public, max-age=15, stale-while-revalidate=60"
          }
        }
      );
    }
  } catch (err: any) {
    console.error("[SiteSettings] Error fetching settings from D1:", err);
    return new Response(
      JSON.stringify({
        status: "error",
        message: err?.message || "Failed to query settings from database"
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }

  // No custom record in database yet
  return new Response(
    JSON.stringify({
      status: "success",
      settings: null,
      message: "No custom settings saved yet"
    }),
    { status: 200, headers: { "Content-Type": "application/json" } }
  );
}

/**
 * Admin: Save global site & contact center settings to D1
 * Requires admin authentication.
 */
export async function handleSaveSiteSettings(request: Request, env: Env): Promise<Response> {
  const user = await authenticateRequest(request, env);
  requireRole(user, ["admin", "superAdmin"]);

  const body = (await request.json()) as any;
  const settingsData = body?.settings !== undefined ? body.settings : body;

  if (!settingsData || typeof settingsData !== "object") {
    return new Response(
      JSON.stringify({
        error: "Bad Request",
        message: "A valid settings object is required."
      }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  await ensureSettingsTable(env);

  const jsonStr = JSON.stringify(settingsData);

  try {
    await env.DB.prepare(`
      INSERT INTO site_settings (id, settings_json, updated_at)
      VALUES ('default', ?, CURRENT_TIMESTAMP)
      ON CONFLICT(id) DO UPDATE SET
        settings_json = excluded.settings_json,
        updated_at = CURRENT_TIMESTAMP
    `)
      .bind(jsonStr)
      .run();

    return new Response(
      JSON.stringify({
        status: "success",
        message: "Site settings updated successfully in D1 database",
        settings: settingsData
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (err: any) {
    console.error("[SiteSettings] Error saving settings to D1:", err);
    return new Response(
      JSON.stringify({
        error: "Database Error",
        message: err?.message || "Failed to persist settings to D1 database."
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
