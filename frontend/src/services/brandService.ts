/* ─────────────────────────────────────────────────────────────────
   Cool Technologies — Brand Service (Dynamic D1 CRUD & Sync)
   Database: Cloudflare D1 (via Cloudflare Worker API)
───────────────────────────────────────────────────────────────── */

import { BrandPartner } from "../types";
import { DEFAULT_BRAND_PARTNERS } from "./generalSettingsService";
import { apiClient } from "./apiClient";

const LOCAL_STORAGE_KEY = "cooltech_brands_v1";

/**
 * Read local brands or initialize with defaults
 */
export function getLocalBrands(): BrandPartner[] {
  try {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(DEFAULT_BRAND_PARTNERS));
    return DEFAULT_BRAND_PARTNERS;
  } catch {
    return DEFAULT_BRAND_PARTNERS;
  }
}

/**
 * Save brands to local storage and notify listeners
 */
export function saveLocalBrands(brands: BrandPartner[]) {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(brands));
    window.dispatchEvent(new CustomEvent("cooltech_brands_updated", { detail: brands }));
  } catch {}
}

/**
 * Fetch all active brands from Cloudflare D1 via Worker API
 */
export async function getBrands(): Promise<BrandPartner[]> {
  try {
    const res = await apiClient.getBrands();
    if (res?.brands && Array.isArray(res.brands) && res.brands.length > 0) {
      saveLocalBrands(res.brands);
      return res.brands;
    }
  } catch (err) {
    console.warn("[BrandService] Error fetching brands from D1:", err);
  }

  return getLocalBrands();
}

/**
 * Save or update a single brand in Cloudflare D1
 */
export async function saveBrand(brand: BrandPartner): Promise<boolean> {
  const now = new Date().toISOString();
  const current = getLocalBrands();
  const existingIdx = current.findIndex((b) => b.id === brand.id);

  const payload: BrandPartner = {
    ...brand,
    isActive: brand.isActive !== false,
    order: brand.order !== undefined ? brand.order : (existingIdx >= 0 ? current[existingIdx].order : current.length),
    updatedAt: now,
    createdAt: brand.createdAt || now,
  };

  let updated: BrandPartner[];
  if (existingIdx >= 0) {
    updated = [...current];
    updated[existingIdx] = payload;
  } else {
    updated = [...current, payload];
  }

  updated.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  saveLocalBrands(updated);

  try {
    if (existingIdx >= 0) {
      await apiClient.updateBrand(payload.id, payload);
    } else {
      await apiClient.createBrand(payload);
    }
  } catch (err) {
    console.warn("[BrandService] Error saving brand to Cloudflare D1:", err);
  }

  return true;
}

/**
 * Deactivate / delete a brand in Cloudflare D1
 */
export async function deleteBrand(brandId: string): Promise<boolean> {
  const current = getLocalBrands();
  const updated = current.filter((b) => b.id !== brandId);
  saveLocalBrands(updated);

  try {
    await apiClient.deactivateBrand(brandId);
  } catch (err) {
    console.warn("[BrandService] Error deactivating brand in D1:", err);
  }

  return true;
}
