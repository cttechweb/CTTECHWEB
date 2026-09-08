import { authenticateRequest, requireRole } from "../auth/middleware";
import { Env } from "../env";
import { ProductRecord } from "../types";

function formatProduct(row: any): any {
  let specifications: any = {};
  let features: string[] = [];
  let tags: string[] = [];

  try {
    if (row.specifications_json) {
      specifications = typeof row.specifications_json === "string" ? JSON.parse(row.specifications_json) : row.specifications_json;
    }
  } catch {}

  try {
    if (row.features_json) {
      features = typeof row.features_json === "string" ? JSON.parse(row.features_json) : row.features_json;
    }
  } catch {}

  try {
    if (row.tags_json) {
      tags = typeof row.tags_json === "string" ? JSON.parse(row.tags_json) : row.tags_json;
    }
  } catch {}

  // Parse promo badge & featured flags
  let badge: string | undefined = specifications?._badge || row.badge || undefined;
  if (!badge && Array.isArray(tags)) {
    const promoMatch = tags.find((t: string) => {
      const lower = t.toLowerCase();
      return lower.includes("best") || lower.includes("featured") || lower.includes("new") || lower.includes("popular");
    });
    if (promoMatch) badge = promoMatch;
  }
  if (badge === "None" || badge === "") badge = undefined;

  const isFeatured = Boolean(specifications?._isFeatured === true || specifications?._isFeatured === "true" || row.is_featured === 1 || badge === "Featured");
  const hidePrice = Boolean(specifications?._hidePrice === true || specifications?._hidePrice === "true" || row.hide_price === 1);

  return {
    id: row.id,
    name: row.name,
    slug: row.slug || undefined,
    category: row.category,
    categoryId: row.category_id || undefined,
    brand: row.brand,
    price: row.price,
    image: row.image_url || "",
    imageUrl: row.image_url || "",
    inStock: row.in_stock === 1,
    rating: row.rating ?? 4.8,
    minOrderQty: row.min_order_qty ?? 1,
    description: row.description || "",
    badge,
    isFeatured,
    hidePrice,
    specifications,
    features,
    tags,
    status: row.is_active === 1 ? "active" : "archived",
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function handleGetProducts(request: Request, env: Env): Promise<Response> {
  const url = new URL(request.url);
  const category = url.searchParams.get("category");
  const brand = url.searchParams.get("brand");
  const search = url.searchParams.get("search");
  const limit = parseInt(url.searchParams.get("limit") || "100", 10);

  let query = "SELECT * FROM products WHERE is_active = 1";
  const params: any[] = [];

  if (category && category !== "All Equipment") {
    query += " AND category = ?";
    params.push(category);
  }

  if (brand && brand !== "All Brands") {
    query += " AND brand = ?";
    params.push(brand);
  }

  if (search) {
    query += " AND (name LIKE ? OR brand LIKE ? OR category LIKE ?)";
    const searchWildcard = `%${search}%`;
    params.push(searchWildcard, searchWildcard, searchWildcard);
  }

  query += " ORDER BY name ASC LIMIT ?";
  params.push(limit);

  const stmt = env.DB.prepare(query);
  const boundStmt = params.length > 0 ? stmt.bind(...params) : stmt;
  const { results } = await boundStmt.all<ProductRecord>();

  const formatted = (results || []).map(formatProduct);

  return new Response(JSON.stringify({ status: "success", count: formatted.length, products: formatted }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}

export async function handleGetProductById(productId: string, env: Env): Promise<Response> {
  const product = await env.DB.prepare("SELECT * FROM products WHERE id = ?")
    .bind(productId)
    .first<ProductRecord>();

  if (!product) {
    return new Response(
      JSON.stringify({ error: "Not Found", message: `Product with ID '${productId}' not found` }),
      { status: 404, headers: { "Content-Type": "application/json" } }
    );
  }

  return new Response(JSON.stringify({ status: "success", product: formatProduct(product) }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}

export async function handleCreateOrUpdateProduct(request: Request, env: Env, targetId?: string): Promise<Response> {
  const user = await authenticateRequest(request, env);
  requireRole(user, ["admin", "superAdmin"]);

  const body = (await request.json()) as any;
  const id = targetId || body.id || `prod_${Date.now()}`;
  const name = body.name?.trim();
  const category = body.category || "HVAC Equipment";
  const brand = body.brand || "General";
  const price = typeof body.price === "number" ? body.price : parseFloat(body.price) || 0;
  const imageUrl = body.image || body.image_url || body.imageUrl || "";
  const inStock = body.inStock === false || body.in_stock === 0 ? 0 : 1;
  const rating = typeof body.rating === "number" ? body.rating : 4.8;
  const specsObj = typeof body.specifications === "object" && body.specifications !== null ? { ...body.specifications } : {};
  if (body.badge !== undefined) specsObj._badge = body.badge;
  if (body.isFeatured !== undefined) specsObj._isFeatured = body.isFeatured;
  if (body.hidePrice !== undefined) specsObj._hidePrice = body.hidePrice;
  const specsJson = JSON.stringify(specsObj);

  const featuresJson = Array.isArray(body.features) ? JSON.stringify(body.features) : body.features_json || "[]";

  let tagsList: string[] = [];
  if (Array.isArray(body.tags)) {
    tagsList = [...body.tags];
  } else if (Array.isArray(body.applications)) {
    tagsList = [...body.applications];
  } else if (typeof body.tags_json === "string") {
    try { tagsList = JSON.parse(body.tags_json); } catch {}
  }
  if (body.badge && body.badge.trim() && body.badge.toLowerCase() !== "none" && !tagsList.includes(body.badge.trim())) {
    tagsList.push(body.badge.trim());
  }
  const tagsJson = JSON.stringify(tagsList);
  const description = body.description || name;

  if (!name) {
    return new Response(
      JSON.stringify({ error: "Bad Request", message: "Product Name is required." }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  await env.DB.prepare(`
    INSERT INTO products (
      id, name, slug, category, brand, price, image_url, in_stock, rating,
      min_order_qty, description, specifications_json, features_json, tags_json,
      is_active, created_at, updated_at
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    ON CONFLICT(id) DO UPDATE SET
      name = excluded.name,
      slug = excluded.slug,
      category = excluded.category,
      brand = excluded.brand,
      price = excluded.price,
      image_url = excluded.image_url,
      in_stock = excluded.in_stock,
      rating = excluded.rating,
      min_order_qty = excluded.min_order_qty,
      description = excluded.description,
      specifications_json = excluded.specifications_json,
      features_json = excluded.features_json,
      tags_json = excluded.tags_json,
      is_active = 1,
      updated_at = CURRENT_TIMESTAMP
  `)
    .bind(
      id,
      name,
      body.slug || null,
      category,
      brand,
      price,
      imageUrl,
      inStock,
      rating,
      minOrderQty,
      description,
      specsJson,
      featuresJson,
      tagsJson
    )
    .run();

  const saved = await env.DB.prepare("SELECT * FROM products WHERE id = ?").bind(id).first<ProductRecord>();

  return new Response(JSON.stringify({ status: "success", message: "Product saved to Cloudflare D1", product: formatProduct(saved) }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}

export async function handleDeleteProduct(productId: string, request: Request, env: Env): Promise<Response> {
  const user = await authenticateRequest(request, env);
  requireRole(user, ["admin", "superAdmin"]);

  // Permanently delete from D1 products table
  const result = await env.DB.prepare("DELETE FROM products WHERE id = ?")
    .bind(productId)
    .run();

  return new Response(JSON.stringify({ 
    status: "success", 
    message: `Product '${productId}' deleted successfully from D1`,
    changes: result.meta?.changes ?? 1
  }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}

export const handleDeactivateProduct = handleDeleteProduct;

export async function handleBulkImportProducts(request: Request, env: Env): Promise<Response> {
  const user = await authenticateRequest(request, env);
  requireRole(user, ["admin", "superAdmin"]);

  const body = (await request.json()) as any;
  const items = Array.isArray(body) ? body : body.products;

  if (!items || !Array.isArray(items) || items.length === 0) {
    return new Response(
      JSON.stringify({ error: "Bad Request", message: "An array of product items is required for bulk import." }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  // Enforce batch size limit for safety
  const maxBatch = 100;
  const batch = items.slice(0, maxBatch);
  let importedCount = 0;

  const statements = batch.map((item: any) => {
    const id = item.id || `prod_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const name = (item.name || "").trim() || "Untitled Product";
    const category = item.category || "HVAC Equipment";
    const brand = item.brand || "General";
    const price = typeof item.price === "number" ? item.price : parseFloat(item.price) || 0;
    const imageUrl = item.image || item.image_url || "";
    const inStock = item.inStock === false ? 0 : 1;
    const specsJson = typeof item.specifications === "object" ? JSON.stringify(item.specifications) : item.specifications_json || "{}";
    const featuresJson = Array.isArray(item.features) ? JSON.stringify(item.features) : item.features_json || "[]";
    const tagsJson = Array.isArray(item.applications) ? JSON.stringify(item.applications) : item.tags_json || "[]";
    const description = item.description || name;

    return env.DB.prepare(`
      INSERT INTO products (
        id, name, slug, category, brand, price, image_url, in_stock, rating,
        min_order_qty, description, specifications_json, features_json, tags_json,
        is_active, created_at, updated_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 4.8, 1, ?, ?, ?, ?, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      ON CONFLICT(id) DO UPDATE SET
        name = excluded.name,
        category = excluded.category,
        brand = excluded.brand,
        price = excluded.price,
        image_url = excluded.image_url,
        in_stock = excluded.in_stock,
        description = excluded.description,
        specifications_json = excluded.specifications_json,
        features_json = excluded.features_json,
        tags_json = excluded.tags_json,
        is_active = 1,
        updated_at = CURRENT_TIMESTAMP
    `).bind(
      id,
      name,
      item.slug || null,
      category,
      brand,
      price,
      imageUrl,
      inStock,
      description,
      specsJson,
      featuresJson,
      tagsJson
    );
  });

  await env.DB.batch(statements);
  importedCount = statements.length;

  return new Response(JSON.stringify({ status: "success", message: `Successfully imported ${importedCount} products into D1`, count: importedCount }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}
