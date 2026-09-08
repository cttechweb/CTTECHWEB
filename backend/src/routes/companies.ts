import { authenticateRequest, requireRole } from "../auth/middleware";
import { Env } from "../env";

function formatCompany(row: any): any {
  return {
    id: row.id,
    name: row.name,
    legalName: row.legal_name || row.name,
    taxId: row.tax_id || "",
    email: row.email || "",
    phone: row.phone || "",
    address: row.address || "",
    city: row.city || "Abu Dhabi",
    country: row.country || "UAE",
    tier: row.tier || "Standard",
    status: row.status || "active",
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function handleListCompanies(request: Request, env: Env): Promise<Response> {
  const user = await authenticateRequest(request, env);
  requireRole(user, ["admin", "superAdmin", "sales"]);

  const { results } = await env.DB.prepare(
    "SELECT * FROM companies ORDER BY created_at DESC"
  ).all<any>();

  const formatted = (results || []).map(formatCompany);

  return new Response(JSON.stringify({ status: "success", count: formatted.length, companies: formatted }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}

export async function handleGetMyCompany(request: Request, env: Env): Promise<Response> {
  const user = await authenticateRequest(request, env);

  // Look up user profile to find company_id or match by user_id/email
  const userRecord = await env.DB.prepare("SELECT company_id, company_name FROM users WHERE id = ?").bind(user.uid).first<any>();
  let comp: any = null;

  if (userRecord?.company_id) {
    comp = await env.DB.prepare("SELECT * FROM companies WHERE id = ?").bind(userRecord.company_id).first<any>();
  }

  if (!comp && user.email) {
    comp = await env.DB.prepare("SELECT * FROM companies WHERE email = ? LIMIT 1").bind(user.email).first<any>();
  }

  if (!comp && userRecord?.company_name) {
    comp = await env.DB.prepare("SELECT * FROM companies WHERE name = ? LIMIT 1").bind(userRecord.company_name).first<any>();
  }

  return new Response(JSON.stringify({ status: "success", company: comp ? formatCompany(comp) : null }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}

export async function handleGetCompanyById(companyId: string, request: Request, env: Env): Promise<Response> {
  const user = await authenticateRequest(request, env);

  const comp = await env.DB.prepare("SELECT * FROM companies WHERE id = ?").bind(companyId).first<any>();

  if (!comp) {
    return new Response(
      JSON.stringify({ error: "Not Found", message: `Company with ID '${companyId}' not found` }),
      { status: 404, headers: { "Content-Type": "application/json" } }
    );
  }

  return new Response(JSON.stringify({ status: "success", company: formatCompany(comp) }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}

export async function handleCreateOrUpdateCompany(request: Request, env: Env, targetId?: string): Promise<Response> {
  const user = await authenticateRequest(request, env);
  const body = (await request.json()) as any;

  const id = targetId || body.id || `comp-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  const name = (body.name || "").trim();
  const legalName = (body.legalName || body.legal_name || name).trim();
  const taxId = (body.taxId || body.tax_id || "").trim();
  const email = (body.email || user.email || "").trim();
  const phone = (body.phone || "").trim();
  const address = (body.address || "").trim();
  const city = (body.city || "Abu Dhabi").trim();
  const country = (body.country || "UAE").trim();
  const tier = body.tier || "Standard";
  const status = body.status || "active";

  if (!name) {
    return new Response(
      JSON.stringify({ error: "Bad Request", message: "Company Name is required." }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  await env.DB.prepare(`
    INSERT INTO companies (
      id, name, legal_name, tax_id, email, phone, address, city, country, tier, status, created_at, updated_at
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    ON CONFLICT(id) DO UPDATE SET
      name = excluded.name,
      legal_name = excluded.legal_name,
      tax_id = excluded.tax_id,
      email = excluded.email,
      phone = excluded.phone,
      address = excluded.address,
      city = excluded.city,
      country = excluded.country,
      tier = excluded.tier,
      status = excluded.status,
      updated_at = CURRENT_TIMESTAMP
  `)
    .bind(id, name, legalName, taxId, email, phone, address, city, country, tier, status)
    .run();

  const saved = await env.DB.prepare("SELECT * FROM companies WHERE id = ?").bind(id).first<any>();

  return new Response(JSON.stringify({ status: "success", message: "Company saved to D1", company: formatCompany(saved) }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}
