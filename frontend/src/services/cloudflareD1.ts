import { Workflow, Product, ServiceItem } from "../types";

/* ─────────────────────────────────────────────────────────────────
   [LEGACY / ARCHIVED] Cloudflare D1 Database Connector
   NOTE: As per the production architecture decision, Cloud Firestore
   is the single authoritative source of truth for Cool Technologies.
   This file is preserved for reference.
───────────────────────────────────────────────────────────────── */

export const CLOUDFLARE_D1_CONFIG = {
  databaseId: "044aed24-d4fa-49c8-9551-3bc83ac336ae",
  accountId: (import.meta as any).env?.VITE_CLOUDFLARE_ACCOUNT_ID || "",
  apiToken: (import.meta as any).env?.VITE_CLOUDFLARE_API_TOKEN || "",
  workerUrl: (import.meta as any).env?.VITE_CLOUDFLARE_WORKER_URL || "",
};

/** Execute SQL Query via Cloudflare D1 REST API or Worker Proxy */
export async function executeD1Query(sql: string, params: any[] = []) {
  const { accountId, apiToken, databaseId, workerUrl } = CLOUDFLARE_D1_CONFIG;

  if (workerUrl) {
    try {
      const response = await fetch(`${workerUrl}/api/query`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sql, params }),
      });
      return await response.json();
    } catch (err) {
      console.warn("Worker API unreachable, using local fallback:", err);
      return null;
    }
  }

  if (accountId && apiToken) {
    try {
      const url = `https://api.cloudflare.com/client/v4/accounts/${accountId}/d1/database/${databaseId}/query`;
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ sql, params }),
      });
      const data = await response.json();
      return data.result?.[0]?.results || [];
    } catch (err) {
      console.warn("Cloudflare D1 REST API call failed:", err);
      return null;
    }
  }

  return null;
}

/* ── Workflows CRUD ── */
export async function saveWorkflowToD1(workflow: Workflow): Promise<boolean> {
  const sql = `
    INSERT INTO workflows (id, name, slug, description, target_category, steps_json, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    ON CONFLICT(id) DO UPDATE SET
      name = excluded.name,
      slug = excluded.slug,
      description = excluded.description,
      target_category = excluded.target_category,
      steps_json = excluded.steps_json,
      updated_at = CURRENT_TIMESTAMP;
  `;
  const params = [
    workflow.id,
    workflow.name,
    workflow.slug,
    workflow.description,
    workflow.targetCategory,
    JSON.stringify(workflow.steps),
  ];
  const res = await executeD1Query(sql, params);
  return res !== null;
}

export async function loadWorkflowsFromD1(): Promise<Workflow[] | null> {
  const sql = `SELECT * FROM workflows ORDER BY updated_at DESC;`;
  const rows = await executeD1Query(sql);
  if (!rows || !Array.isArray(rows)) return null;

  return rows.map((row: any) => ({
    id: row.id,
    name: row.name,
    slug: row.slug,
    description: row.description,
    iconName: "Wind",
    targetCategory: row.target_category,
    steps: JSON.parse(row.steps_json || "[]"),
  }));
}

/* ── Products CRUD ── */
export async function saveProductToD1(product: Product): Promise<boolean> {
  const sql = `
    INSERT INTO products (id, name, category, brand, price, image_url, specifications_json)
    VALUES (?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET
      name = excluded.name,
      category = excluded.category,
      brand = excluded.brand,
      price = excluded.price,
      image_url = excluded.image_url,
      specifications_json = excluded.specifications_json;
  `;
  const params = [
    product.id,
    product.name,
    product.category,
    product.brand,
    product.price,
    product.image,
    JSON.stringify(product.specifications || {}),
  ];
  const res = await executeD1Query(sql, params);
  return res !== null;
}

export async function loadProductsFromD1(): Promise<Product[] | null> {
  const sql = `SELECT * FROM products ORDER BY name ASC;`;
  const rows = await executeD1Query(sql);
  if (!rows || !Array.isArray(rows)) return null;

  return rows.map((row: any) => ({
    id: row.id,
    name: row.name,
    category: row.category,
    brand: row.brand,
    price: row.price,
    image: row.image_url,
    inStock: true,
    description: row.name,
    rating: 4.8,
    minOrderQty: 1,
    features: ["Energy Efficient", "UAE Certified"],
    specifications: JSON.parse(row.specifications_json || "{}"),
  }));
}

/* ── Services CRUD ── */
export async function saveServiceToD1(service: ServiceItem): Promise<boolean> {
  const sql = `
    INSERT INTO services (id, title, category, tagline, description, sla, image_url)
    VALUES (?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET
      title = excluded.title,
      category = excluded.category,
      tagline = excluded.tagline,
      description = excluded.description,
      sla = excluded.sla,
      image_url = excluded.image_url;
  `;
  const params = [
    service.id,
    service.title,
    service.category,
    service.tagline,
    service.description,
    service.specs?.sla || "24/7",
    service.image,
  ];
  const res = await executeD1Query(sql, params);
  return res !== null;
}

export async function loadServicesFromD1(): Promise<ServiceItem[] | null> {
  const sql = `SELECT * FROM services ORDER BY title ASC;`;
  const rows = await executeD1Query(sql);
  if (!rows || !Array.isArray(rows)) return null;

  return rows.map((row: any) => ({
    id: row.id,
    title: row.title,
    category: row.category,
    tagline: row.tagline,
    description: row.description,
    iconName: "Wrench",
    features: [],
    specs: { sla: row.sla || "24/7", warranty: "1 Year", targetAudience: "Commercial", certifiedFor: "UAE" },
    image: row.image_url,
  }));
}

/* ── User Accounts CRUD ── */
export async function saveUserToD1(user: { id: string; email: string; name: string; companyName?: string; taxId?: string; tier?: string }): Promise<boolean> {
  const sql = `
    INSERT INTO users (id, email, name, company_name, tax_id, tier, discount_rate)
    VALUES (?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET
      name = excluded.name,
      company_name = excluded.company_name,
      tax_id = excluded.tax_id,
      tier = excluded.tier;
  `;
  const discountRate = user.tier === "Platinum" ? 0.15 : user.tier === "Gold" ? 0.10 : 0.05;
  const params = [user.id, user.email, user.name, user.companyName || "", user.taxId || "", user.tier || "Silver", discountRate];
  const res = await executeD1Query(sql, params);
  return res !== null;
}

/* ── Quotation Requests CRUD ── */
export async function saveQuoteToD1(quote: { id: string; userId?: string; companyName: string; phone: string; projectDescription: string; products: any[] }): Promise<boolean> {
  const sql = `
    INSERT INTO quotes (id, user_id, company_name, phone, project_description, products_json, status)
    VALUES (?, ?, ?, ?, ?, ?, 'Pending');
  `;
  const params = [quote.id, quote.userId || "anonymous", quote.companyName, quote.phone, quote.projectDescription, JSON.stringify(quote.products)];
  const res = await executeD1Query(sql, params);
  return res !== null;
}
