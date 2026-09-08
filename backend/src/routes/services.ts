import { authenticateRequest, requireRole } from "../auth/middleware";
import { Env } from "../env";

function formatService(row: any): any {
  return {
    id: row.id,
    title: row.title,
    category: row.category,
    tagline: row.tagline || "",
    description: row.description || "",
    iconName: row.icon_name || "Wrench",
    sla: row.sla || "24/7",
    image: row.image_url || "",
    specs: typeof row.specs_json === "string" ? JSON.parse(row.specs_json || "{}") : (row.specs_json || {}),
    features: typeof row.features_json === "string" ? JSON.parse(row.features_json || "[]") : (row.features_json || []),
    isActive: row.is_active === 1,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function handleGetServices(request: Request, env: Env): Promise<Response> {
  const { results } = await env.DB.prepare(
    "SELECT * FROM services WHERE is_active = 1 ORDER BY title ASC"
  ).all<any>();

  const formatted = (results || []).map(formatService);

  return new Response(JSON.stringify({ status: "success", count: formatted.length, services: formatted }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}

export async function handleGetServiceById(serviceId: string, env: Env): Promise<Response> {
  const service = await env.DB.prepare("SELECT * FROM services WHERE id = ?").bind(serviceId).first<any>();

  if (!service) {
    return new Response(
      JSON.stringify({ error: "Not Found", message: `Service '${serviceId}' not found` }),
      { status: 404, headers: { "Content-Type": "application/json" } }
    );
  }

  return new Response(JSON.stringify({ status: "success", service: formatService(service) }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}

export async function handleCreateOrUpdateService(request: Request, env: Env, targetId?: string): Promise<Response> {
  const user = await authenticateRequest(request, env);
  requireRole(user, ["admin", "superAdmin", "sales"]);

  const body = (await request.json()) as any;
  const id = targetId || body.id || `srv-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  const title = (body.title || "").trim();
  const category = (body.category || "General").trim();
  const tagline = (body.tagline || "").trim();
  const description = (body.description || "").trim();
  const sla = (body.specs?.sla || body.sla || "24/7").trim();
  const imageUrl = (body.image || body.imageUrl || "").trim();
  const specsJson = JSON.stringify(body.specs || {});
  const featuresJson = JSON.stringify(body.features || []);

  if (!title) {
    return new Response(
      JSON.stringify({ error: "Bad Request", message: "Service title is required." }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  await env.DB.prepare(`
    INSERT INTO services (
      id, title, category, tagline, description, sla, image_url, specs_json, features_json, is_active, created_at, updated_at
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    ON CONFLICT(id) DO UPDATE SET
      title = excluded.title,
      category = excluded.category,
      tagline = excluded.tagline,
      description = excluded.description,
      sla = excluded.sla,
      image_url = excluded.image_url,
      specs_json = excluded.specs_json,
      features_json = excluded.features_json,
      is_active = 1,
      updated_at = CURRENT_TIMESTAMP
  `)
    .bind(id, title, category, tagline, description, sla, imageUrl, specsJson, featuresJson)
    .run();

  const saved = await env.DB.prepare("SELECT * FROM services WHERE id = ?").bind(id).first<any>();

  return new Response(
    JSON.stringify({ status: "success", message: "Service saved to D1", service: formatService(saved) }),
    { status: 200, headers: { "Content-Type": "application/json" } }
  );
}

export async function handleDeactivateService(serviceId: string, request: Request, env: Env): Promise<Response> {
  const user = await authenticateRequest(request, env);
  requireRole(user, ["admin", "superAdmin"]);

  await env.DB.prepare("UPDATE services SET is_active = 0, updated_at = CURRENT_TIMESTAMP WHERE id = ?")
    .bind(serviceId)
    .run();

  return new Response(
    JSON.stringify({ status: "success", message: `Service '${serviceId}' deactivated` }),
    { status: 200, headers: { "Content-Type": "application/json" } }
  );
}
