import { authenticateRequest, requireRole } from "../auth/middleware";
import { Env } from "../env";
import { D1UserRecord } from "../types";

export async function handleGetProfile(request: Request, env: Env): Promise<Response> {
  const user = await authenticateRequest(request, env);

  const profile = await env.DB.prepare("SELECT * FROM users WHERE id = ?")
    .bind(user.uid)
    .first<D1UserRecord>();

  if (!profile) {
    return new Response(
      JSON.stringify({ error: "Not Found", message: "User profile not found in D1" }),
      { status: 404, headers: { "Content-Type": "application/json" } }
    );
  }

  return new Response(JSON.stringify({ status: "success", profile }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}

export async function handleUpdateProfile(request: Request, env: Env): Promise<Response> {
  const user = await authenticateRequest(request, env);
  const body = (await request.json()) as any;

  const name = (body.name ?? "").trim();
  const phone = body.phone?.trim() || null;
  const address = body.address?.trim() || null;
  const companyName = (body.companyName || body.company_name)?.trim() || null;
  const designation = body.designation?.trim() || null;
  const defaultShippingAddress = (body.defaultShippingAddress || body.default_shipping_address)?.trim() || null;
  const billingAddress = (body.billingAddress || body.billing_address)?.trim() || null;

  if (!name) {
    return new Response(
      JSON.stringify({ error: "Bad Request", message: "Full Name is required and cannot be empty." }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  // Strictly update user-editable columns for the verified Firebase UID
  await env.DB.prepare(`
    UPDATE users 
    SET name = ?, phone = ?, address = ?, company_name = ?, designation = ?, default_shipping_address = ?, billing_address = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `)
    .bind(name, phone, address, companyName, designation, defaultShippingAddress, billingAddress, user.uid)
    .run();

  const updatedProfile = await env.DB.prepare("SELECT * FROM users WHERE id = ?")
    .bind(user.uid)
    .first<D1UserRecord>();

  return new Response(
    JSON.stringify({
      status: "success",
      message: "Profile updated successfully in Cloudflare D1",
      profile: updatedProfile,
    }),
    { status: 200, headers: { "Content-Type": "application/json" } }
  );
}

export async function handleListUsers(request: Request, env: Env): Promise<Response> {
  const user = await authenticateRequest(request, env);
  requireRole(user, ["admin", "superAdmin", "sales"]);

  const { results } = await env.DB.prepare(
    "SELECT id, email, name, phone, designation, address, default_shipping_address, billing_address, company_name, tax_id, role, is_verified_retailer, status, tier, email_verified, created_at, updated_at, last_login_at FROM users ORDER BY created_at DESC"
  ).all<D1UserRecord>();

  return new Response(JSON.stringify({ status: "success", count: results.length, users: results }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}
