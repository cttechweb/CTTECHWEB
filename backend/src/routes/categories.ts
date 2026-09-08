import { authenticateRequest, requireRole } from "../auth/middleware";
import { Env } from "../env";

function formatCategory(row: any): any {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    subtitle: row.description || "",
    description: row.description || "",
    image: row.image_url || "",
    imageUrl: row.image_url || "",
    icon: row.icon || "",
    tag: row.tag || row.icon || "",
    sortOrder: row.display_order ?? 0,
    status: row.is_active === 1 ? "active" : "inactive",
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function handleGetCategories(request: Request, env: Env): Promise<Response> {
  const { results } = await env.DB.prepare(
    "SELECT * FROM categories WHERE is_active = 1 ORDER BY display_order ASC, name ASC"
  ).all<any>();

  const formatted = (results || []).map(formatCategory);

  return new Response(JSON.stringify({ status: "success", count: formatted.length, categories: formatted }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}

export async function handleGetCategoryById(categoryId: string, env: Env): Promise<Response> {
  const cat = await env.DB.prepare("SELECT * FROM categories WHERE id = ?").bind(categoryId).first<any>();

  if (!cat) {
    return new Response(
      JSON.stringify({ error: "Not Found", message: `Category '${categoryId}' not found` }),
      { status: 404, headers: { "Content-Type": "application/json" } }
    );
  }

  return new Response(JSON.stringify({ status: "success", category: formatCategory(cat) }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}

export async function handleCreateOrUpdateCategory(request: Request, env: Env, targetId?: string): Promise<Response> {
  const user = await authenticateRequest(request, env);
  requireRole(user, ["admin", "superAdmin"]);

  const body = (await request.json()) as any;
  const id = targetId || body.id || `cat-${Date.now()}`;
  const name = body.name?.trim();
  const slug = (body.slug?.trim() || name.toLowerCase().replace(/[^a-z0-9]+/g, "-")).replace(/^-|-$/g, "");
  const description = body.description?.trim() || body.subtitle?.trim() || "";
  const imageUrl = body.image || body.image_url || body.imageUrl || "";
  const icon = body.tag || body.icon || "";
  const displayOrder = typeof body.sortOrder === "number" ? body.sortOrder : typeof body.display_order === "number" ? body.display_order : 0;
  const isActive = body.status === "inactive" || body.is_active === 0 ? 0 : 1;

  if (!name) {
    return new Response(
      JSON.stringify({ error: "Bad Request", message: "Category Name is required." }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  await env.DB.prepare(`
    INSERT INTO categories (id, name, slug, description, icon, image_url, display_order, is_active, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    ON CONFLICT(id) DO UPDATE SET
      name = excluded.name,
      slug = excluded.slug,
      description = excluded.description,
      icon = excluded.icon,
      image_url = excluded.image_url,
      display_order = excluded.display_order,
      is_active = excluded.is_active,
      updated_at = CURRENT_TIMESTAMP
  `)
    .bind(id, name, slug, description, icon, imageUrl, displayOrder, isActive)
    .run();

  const saved = await env.DB.prepare("SELECT * FROM categories WHERE id = ?").bind(id).first<any>();

  return new Response(JSON.stringify({ status: "success", message: "Category saved to D1", category: formatCategory(saved) }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}

export async function handleDeactivateCategory(categoryId: string, request: Request, env: Env): Promise<Response> {
  const user = await authenticateRequest(request, env);
  requireRole(user, ["admin", "superAdmin"]);

  await env.DB.prepare("UPDATE categories SET is_active = 0, updated_at = CURRENT_TIMESTAMP WHERE id = ?")
    .bind(categoryId)
    .run();

  return new Response(JSON.stringify({ status: "success", message: `Category '${categoryId}' deactivated successfully in D1` }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}

export async function handleReorderCategories(request: Request, env: Env): Promise<Response> {
  const user = await authenticateRequest(request, env);
  requireRole(user, ["admin", "superAdmin"]);

  const body = (await request.json()) as any;
  const orderedIds: string[] = Array.isArray(body) ? body : body.orderedIds;

  if (!Array.isArray(orderedIds) || orderedIds.length === 0) {
    return new Response(
      JSON.stringify({ error: "Bad Request", message: "Array of category IDs is required for reordering." }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  const statements = orderedIds.map((id, index) =>
    env.DB.prepare("UPDATE categories SET display_order = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?").bind(index, id)
  );

  await env.DB.batch(statements);

  return new Response(JSON.stringify({ status: "success", message: "Categories reordered successfully in D1" }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}
