import { authenticateRequest, requireRole } from "../auth/middleware";
import { Env } from "../env";

function formatBrand(row: any): any {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    logo: row.logo_url || "",
    logoUrl: row.logo_url || "",
    description: row.description || "",
    tagline: row.description || "",
    websiteUrl: row.website_url || "",
    displayType: row.display_type || "image",
    order: row.display_order ?? 0,
    isActive: row.is_active === 1,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function handleGetBrands(request: Request, env: Env): Promise<Response> {
  const { results } = await env.DB.prepare(
    "SELECT * FROM brands WHERE is_active = 1 ORDER BY display_order ASC, name ASC"
  ).all<any>();

  const formatted = (results || []).map(formatBrand);

  return new Response(JSON.stringify({ status: "success", count: formatted.length, brands: formatted }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}

export async function handleGetBrandById(brandId: string, env: Env): Promise<Response> {
  const brand = await env.DB.prepare("SELECT * FROM brands WHERE id = ?").bind(brandId).first<any>();

  if (!brand) {
    return new Response(
      JSON.stringify({ error: "Not Found", message: `Brand '${brandId}' not found` }),
      { status: 404, headers: { "Content-Type": "application/json" } }
    );
  }

  return new Response(JSON.stringify({ status: "success", brand: formatBrand(brand) }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}

export async function handleCreateOrUpdateBrand(request: Request, env: Env, targetId?: string): Promise<Response> {
  const user = await authenticateRequest(request, env);
  requireRole(user, ["admin", "superAdmin"]);

  const body = (await request.json()) as any;
  const id = targetId || body.id || `brand-${Date.now()}`;
  const name = body.name?.trim();
  const slug = (body.slug?.trim() || name.toLowerCase().replace(/[^a-z0-9]+/g, "-")).replace(/^-|-$/g, "");
  const logoUrl = body.logo || body.logo_url || body.logoUrl || "";
  const description = body.description?.trim() || body.tagline?.trim() || "";
  const websiteUrl = body.websiteUrl?.trim() || body.website_url?.trim() || "";
  const displayType = body.displayType || body.display_type || "image";
  const displayOrder = typeof body.order === "number" ? body.order : typeof body.display_order === "number" ? body.display_order : 0;
  const isActive = body.isActive === false || body.is_active === 0 ? 0 : 1;

  if (!name) {
    return new Response(
      JSON.stringify({ error: "Bad Request", message: "Brand Name is required." }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  await env.DB.prepare(`
    INSERT INTO brands (id, name, slug, logo_url, description, website_url, display_type, display_order, is_active, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    ON CONFLICT(id) DO UPDATE SET
      name = excluded.name,
      slug = excluded.slug,
      logo_url = excluded.logo_url,
      description = excluded.description,
      website_url = excluded.website_url,
      display_type = excluded.display_type,
      display_order = excluded.display_order,
      is_active = excluded.is_active,
      updated_at = CURRENT_TIMESTAMP
  `)
    .bind(id, name, slug, logoUrl, description, websiteUrl, displayType, displayOrder, isActive)
    .run();

  const saved = await env.DB.prepare("SELECT * FROM brands WHERE id = ?").bind(id).first<any>();

  return new Response(JSON.stringify({ status: "success", message: "Brand saved to D1", brand: formatBrand(saved) }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}

export async function handleDeactivateBrand(brandId: string, request: Request, env: Env): Promise<Response> {
  const user = await authenticateRequest(request, env);
  requireRole(user, ["admin", "superAdmin"]);

  await env.DB.prepare("UPDATE brands SET is_active = 0, updated_at = CURRENT_TIMESTAMP WHERE id = ?")
    .bind(brandId)
    .run();

  return new Response(JSON.stringify({ status: "success", message: `Brand '${brandId}' deactivated successfully in D1` }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}
