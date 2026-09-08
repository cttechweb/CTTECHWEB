import { authenticateRequest } from "../auth/middleware";
import { Env } from "../env";
import { D1UserRecord } from "../types";

export async function handleAuthMe(request: Request, env: Env): Promise<Response> {
  const user = await authenticateRequest(request, env);

  const fullProfile = await env.DB.prepare("SELECT * FROM users WHERE id = ?")
    .bind(user.uid)
    .first<D1UserRecord>();

  return new Response(
    JSON.stringify({
      status: "success",
      user: {
        uid: user.uid,
        email: user.email,
        name: fullProfile?.name || user.name,
        role: user.role,
        isVerifiedRetailer: user.isVerifiedRetailer,
        status: user.status,
        emailVerified: (fullProfile?.email_verified ?? (user.emailVerified ? 1 : 0)) === 1,
        phone: fullProfile?.phone || null,
        companyName: fullProfile?.company_name || null,
        address: fullProfile?.address || null,
        designation: fullProfile?.designation || null,
        defaultShippingAddress: fullProfile?.default_shipping_address || null,
        billingAddress: fullProfile?.billing_address || null,
        taxId: fullProfile?.tax_id || null,
        tier: fullProfile?.tier || "Standard",
        discountRate: fullProfile?.discount_rate || 0.0,
        createdAt: fullProfile?.created_at,
        lastLoginAt: fullProfile?.last_login_at,
      },
    }),
    { status: 200, headers: { "Content-Type": "application/json" } }
  );
}

export async function handleAuthSync(request: Request, env: Env): Promise<Response> {
  const user = await authenticateRequest(request, env);
  let body: any = {};
  try {
    body = await request.json();
  } catch {}

  const displayName = body.name || user.name;
  if (displayName) {
    await env.DB.prepare("UPDATE users SET name = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?")
      .bind(displayName.trim(), user.uid)
      .run();
  }

  return handleAuthMe(request, env);
}
