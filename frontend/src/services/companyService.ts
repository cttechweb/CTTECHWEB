/* ─────────────────────────────────────────────────────────────────
   Cool Technologies — Company & B2B Customer Service
   Database: Cloudflare D1 (via Cloudflare Worker API)
───────────────────────────────────────────────────────────────── */

import { Company } from "../types";
import { apiClient } from "./apiClient";

const LOCAL_STORAGE_KEY = "cooltech_companies_v1";

// Helper: load local cache fallback
function getLocalCompaniesCache(): Company[] {
  try {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
}

// Helper: save local cache
function saveLocalCompaniesCache(companies: Company[]) {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(companies));
  } catch {}
}

/**
 * Fetch a company record by ID from Cloudflare D1
 */
export async function getCompanyById(companyId: string): Promise<Company | null> {
  try {
    const res = await apiClient.getCompanyById(companyId);
    if (res?.company) {
      return res.company as Company;
    }
  } catch (err) {
    console.warn("[Company Service] Error fetching company by ID from D1:", err);
  }

  // Fallback to local cache
  const cached = getLocalCompaniesCache().find((c) => c.id === companyId);
  return cached || null;
}

/**
 * Fetch the authenticated user's linked company from Cloudflare D1
 */
export async function getMyCompany(): Promise<Company | null> {
  try {
    const res = await apiClient.getMyCompany();
    if (res?.company) {
      return res.company as Company;
    }
  } catch (err) {
    console.warn("[Company Service] Error fetching my company from D1:", err);
  }

  return null;
}

/**
 * Find or create a company record based on name / taxId in Cloudflare D1
 */
export async function getOrCreateCompany(data: {
  name: string;
  legalName?: string;
  taxId?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
}): Promise<Company> {
  const normalizedName = data.name.trim();

  // Try to find in existing cache first
  const existing = getLocalCompaniesCache().find(
    (c) => c.name.toLowerCase() === normalizedName.toLowerCase() || (data.taxId && c.taxId === data.taxId.trim())
  );
  if (existing) {
    return existing;
  }

  // Generate ID and payload
  const companyId = `comp-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  const now = new Date().toISOString();

  const newCompany: Company = {
    id: companyId,
    name: normalizedName,
    legalName: data.legalName || normalizedName,
    taxId: data.taxId || "",
    email: data.email || "",
    phone: data.phone || "",
    address: data.address || "",
    city: data.city || "Abu Dhabi",
    country: "UAE",
    tier: "Standard",
    status: "active",
    createdAt: now,
    updatedAt: now,
  };

  // Update local cache immediately
  const cached = getLocalCompaniesCache();
  saveLocalCompaniesCache([newCompany, ...cached.filter((c) => c.id !== companyId)]);

  // Persist to Cloudflare D1
  try {
    const res = await apiClient.createCompany(newCompany);
    if (res?.company) {
      return res.company as Company;
    }
  } catch (err) {
    console.warn("[Company Service] Error creating company in Cloudflare D1:", err);
  }

  return newCompany;
}

/**
 * List all companies (Admin) from Cloudflare D1
 */
export async function listCompanies(): Promise<Company[]> {
  try {
    const res = await apiClient.listCompanies();
    if (res?.companies && Array.isArray(res.companies)) {
      saveLocalCompaniesCache(res.companies);
      return res.companies as Company[];
    }
  } catch (err) {
    console.warn("[Company Service] Error listing companies from D1:", err);
  }

  return getLocalCompaniesCache();
}

/**
 * Update company record in Cloudflare D1
 */
export async function updateCompany(companyId: string, updates: Partial<Company>): Promise<boolean> {
  const now = new Date().toISOString();
  const payload = { ...updates, updatedAt: now };

  const cached = getLocalCompaniesCache();
  const updated = cached.map((c) => (c.id === companyId ? { ...c, ...payload } : c));
  saveLocalCompaniesCache(updated);

  try {
    await apiClient.updateCompany(companyId, payload);
    return true;
  } catch (err) {
    console.warn("[Company Service] Error updating company in D1:", err);
    return false;
  }
}
