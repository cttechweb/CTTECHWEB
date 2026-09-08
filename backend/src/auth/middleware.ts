import { Env } from "../env";
import { AuthenticatedUser, D1UserRecord, UserRole } from "../types";
import { verifyFirebaseIdToken } from "./firebaseVerifier";

export interface AuthContext {
  user: AuthenticatedUser;
}

const ADMIN_ALLOWLIST = [
  "admin@cooltech.com", 
  "admin@cooltechuae.com", 
  "ctauhweb@gmail.com",
  "nafalkt7@gmail.com",
  "nafal@gmail.com"
];

export async function extractBearerToken(request: Request): Promise<string | null> {
  const authHeader = request.headers.get("Authorization");
  if (!authHeader) return null;
  const match = authHeader.match(/^Bearer\s+(.+)$/i);
  return match ? match[1].trim() : null;
}

/**
 * Authenticate request using Firebase ID token and fetch/sync D1 user record
 */
export async function authenticateRequest(
  request: Request,
  env: Env
): Promise<AuthenticatedUser> {
  const token = await extractBearerToken(request);
  if (!token) {
    throw new Response(
      JSON.stringify({ error: "Unauthorized", message: "Missing Authorization Bearer token" }),
      { status: 401, headers: { "Content-Type": "application/json" } }
    );
  }

  try {
    const verified = await verifyFirebaseIdToken(token, env.FIREBASE_PROJECT_ID);
    const normalizedEmail = (verified.email || "").toLowerCase();
    const isAllowlistedAdmin = ADMIN_ALLOWLIST.includes(normalizedEmail);

    // Look up or initialize user in D1
    const d1User = await env.DB.prepare("SELECT * FROM users WHERE id = ?")
      .bind(verified.uid)
      .first<D1UserRecord>();

    const isEmailVerified = verified.claims?.email_verified === true ? 1 : 0;

    if (d1User) {
      let currentRole = d1User.role;
      if (isAllowlistedAdmin && currentRole !== "admin" && currentRole !== "superAdmin") {
        currentRole = "admin";
        await env.DB.prepare("UPDATE users SET role = 'admin', updated_at = CURRENT_TIMESTAMP WHERE id = ?")
          .bind(verified.uid)
          .run()
          .catch(() => {});
      }

      // Record last login time and sync email_verified state
      env.DB.prepare("UPDATE users SET last_login_at = CURRENT_TIMESTAMP, email_verified = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?")
        .bind(isEmailVerified, verified.uid)
        .run()
        .catch(() => {});

      return {
        uid: d1User.id,
        email: d1User.email,
        name: d1User.name,
        role: currentRole,
        isVerifiedRetailer: d1User.is_verified_retailer === 1,
        status: d1User.status,
        emailVerified: isEmailVerified === 1,
      };
    } else {
      // Auto-create initial user record in D1 with strict admin allowlist
      const initialRole: UserRole = isAllowlistedAdmin ? "admin" : "customer";
      const initialName = verified.name || (verified.email ? verified.email.split("@")[0] : "Valued User");

      await env.DB.prepare(`
        INSERT INTO users (id, email, name, role, is_verified_retailer, status, email_verified, created_at, updated_at, last_login_at)
        VALUES (?, ?, ?, ?, 0, 'active', ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      `)
        .bind(verified.uid, verified.email || "", initialName, initialRole, isEmailVerified)
        .run();

      return {
        uid: verified.uid,
        email: verified.email,
        name: initialName,
        role: initialRole,
        isVerifiedRetailer: false,
        status: "active",
        emailVerified: isEmailVerified === 1,
      };
    }
  } catch (err: any) {
    const message = err?.message || "Invalid authentication token";
    throw new Response(
      JSON.stringify({ error: "Unauthorized", message }),
      { status: 401, headers: { "Content-Type": "application/json" } }
    );
  }
}

/**
 * Optional authentication middleware for public endpoints with personalized responses
 */
export async function optionalAuthenticate(
  request: Request,
  env: Env
): Promise<AuthenticatedUser | null> {
  const token = await extractBearerToken(request);
  if (!token) return null;

  try {
    return await authenticateRequest(request, env);
  } catch {
    return null;
  }
}

/**
 * Guard that enforces specific role permissions
 */
export function requireRole(user: AuthenticatedUser, allowedRoles: UserRole[]) {
  if (!allowedRoles.includes(user.role)) {
    throw new Response(
      JSON.stringify({
        error: "Forbidden",
        message: `User role '${user.role}' is not authorized for this operation. Required: [${allowedRoles.join(", ")}]`,
      }),
      { status: 403, headers: { "Content-Type": "application/json" } }
    );
  }
}
