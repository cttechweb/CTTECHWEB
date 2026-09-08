/* ─────────────────────────────────────────────────────────────────
   Cool Technologies — User Profile & Role Management Service
   Application Database: Cloudflare D1 (via Cloudflare Worker API)
───────────────────────────────────────────────────────────────── */

import { UserProfile, UserRole, UserStatus } from "../types";
import { apiClient } from "./apiClient";

const LOCAL_STORAGE_KEY = "cooltech_admin_users_v2";

function getLocalUsersCache(): UserProfile[] {
  try {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
}

function saveLocalUsersCache(users: UserProfile[]) {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(users));
  } catch {}
}

function mapRawUserToProfile(rawUser: any): UserProfile {
  return {
    uid: rawUser.id || rawUser.uid,
    email: rawUser.email || "",
    name: rawUser.name || rawUser.email?.split("@")[0] || "Valued User",
    phone: rawUser.phone || undefined,
    address: rawUser.address || undefined,
    designation: rawUser.designation || undefined,
    defaultShippingAddress: rawUser.default_shipping_address || rawUser.defaultShippingAddress || undefined,
    billingAddress: rawUser.billing_address || rawUser.billingAddress || undefined,
    companyName: rawUser.company_name || rawUser.companyName || undefined,
    companyId: rawUser.company_id || rawUser.companyId || undefined,
    taxId: rawUser.tax_id || rawUser.taxId || undefined,
    role: rawUser.role || "customer",
    isVerifiedRetailer: rawUser.is_verified_retailer === 1 || rawUser.isVerifiedRetailer === true,
    status: rawUser.status || "active",
    emailVerified: rawUser.email_verified === 1 || rawUser.emailVerified === true,
    createdAt: rawUser.created_at || rawUser.createdAt,
    updatedAt: rawUser.updated_at || rawUser.updatedAt,
    lastLoginAt: rawUser.last_login_at || rawUser.lastLoginAt,
  };
}

/**
 * Get current authenticated user profile from Cloudflare D1
 */
export async function getUserProfile(uid?: string): Promise<UserProfile | null> {
  try {
    const res = await apiClient.getProfile();
    if (res?.profile) {
      return mapRawUserToProfile(res.profile);
    }
  } catch (err) {
    console.warn("[UserService] Error fetching user profile from D1:", err);
  }

  if (uid) {
    const cached = getLocalUsersCache().find((u) => u.uid === uid);
    if (cached) return cached;
  }
  return null;
}

/**
 * List all users from Cloudflare D1 (Admin / Sales only)
 */
export async function listUsers(): Promise<UserProfile[]> {
  try {
    const res = await apiClient.get<{ status: string; users: any[] }>("/api/users", { requiresAuth: true });
    if (res?.users && Array.isArray(res.users)) {
      const list = res.users.map(mapRawUserToProfile);
      saveLocalUsersCache(list);
      return list;
    }
  } catch (err) {
    console.warn("[UserService] Error fetching user directory from D1:", err);
  }

  return getLocalUsersCache();
}

/**
 * Update user profile in Cloudflare D1
 */
export async function updateUserProfile(
  uid: string,
  updates: Partial<UserProfile>
): Promise<boolean> {
  try {
    const payload = {
      name: updates.name || "",
      phone: updates.phone,
      address: updates.address,
      company_name: updates.companyName,
    };
    await apiClient.updateProfile(payload);
    return true;
  } catch (err) {
    console.warn("[UserService] Error updating user in D1:", err);
    return false;
  }
}

/**
 * Set user role (Admin / SuperAdmin)
 */
export async function setUserRole(uid: string, role: UserRole): Promise<boolean> {
  return updateUserProfile(uid, { role });
}

/**
 * Set user account status (active / pending / suspended)
 */
export async function setUserStatus(uid: string, status: UserStatus): Promise<boolean> {
  return updateUserProfile(uid, { status });
}

/**
 * Approve or revoke verified B2B retailer status
 */
export async function verifyRetailer(uid: string, isVerified: boolean): Promise<boolean> {
  return updateUserProfile(uid, {
    isVerifiedRetailer: isVerified,
    role: isVerified ? "retailer" : "customer",
    status: "active",
  });
}
