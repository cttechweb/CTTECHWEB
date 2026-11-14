/* ─────────────────────────────────────────────────────────────────
   Cool Technologies — Brand Service (Dynamic D1 CRUD & Sync)
   Database: Cloudflare D1 (via Cloudflare Worker API)
───────────────────────────────────────────────────────────────── */

import { BrandPartner } from "../types";
import { DEFAULT_BRAND_PARTNERS } from "./generalSettingsService";
import { apiClient } from "./apiClient";
import { db, doc, getDoc, setDoc, onSnapshot } from "../lib/firebase";

const LOCAL_STORAGE_KEY = "cooltech_brands_v2";
const SETTINGS_KEY = "cooltech_general_settings_v1";

/**
 * Standardize brand partner object ensuring both `logo` and `logoUrl` match
 */
export function normalizeBrand(brand: BrandPartner): BrandPartner {
  const logo = (brand.logo || (brand as any).logoUrl || "").trim() || undefined;
  return {
    ...brand,
    logo,
    logoUrl: logo,
    isActive: brand.isActive !== false,
    displayType: brand.logoSvg ? "svg" : logo ? "image" : (brand.displayType || "text")
  };
}

/**
 * Read local brands or initialize with defaults
 */
export function getLocalBrands(): BrandPartner[] {
  try {
    // 1. Check dedicated brands storage key
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length >= 40) {
        return parsed.map(normalizeBrand);
      }
    }

    // 2. Check general settings storage key
    const savedSettings = localStorage.getItem(SETTINGS_KEY);
    if (savedSettings) {
      const parsedSettings = JSON.parse(savedSettings);
      if (parsedSettings.brandPartners && Array.isArray(parsedSettings.brandPartners) && parsedSettings.brandPartners.length >= 40) {
        const normalized = parsedSettings.brandPartners.map(normalizeBrand);
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(normalized));
        return normalized;
      }
    }

    // 3. Fallback to default partners
    const defaults = DEFAULT_BRAND_PARTNERS.map(normalizeBrand);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(defaults));
    return defaults;
  } catch {
    return DEFAULT_BRAND_PARTNERS.map(normalizeBrand);
  }
}

/**
 * Save brands to local storage, sync with general settings, and notify listeners
 */
export function saveLocalBrands(brands: BrandPartner[]) {
  try {
    const normalized = brands.map(normalizeBrand);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(normalized));

    // Also sync to general settings cache so any component reading getGeneralSettings() has identical brands
    const settingsRaw = localStorage.getItem(SETTINGS_KEY);
    if (settingsRaw) {
      try {
        const parsed = JSON.parse(settingsRaw);
        parsed.brandPartners = normalized;
        parsed.updatedAt = new Date().toISOString();
        localStorage.setItem(SETTINGS_KEY, JSON.stringify(parsed));
      } catch {}
    }

    // Notify all listening components
    window.dispatchEvent(new CustomEvent("cooltech_brands_updated", { detail: normalized }));
    window.dispatchEvent(new Event("cooltech_settings_updated"));
    window.dispatchEvent(new Event("cooltech_general_settings_updated"));

    // Sync to Cloudflare D1 in background
    syncBrandsToRemote(normalized).catch(() => {});
  } catch (err) {
    console.warn("[BrandService] Error saving local brands:", err);
  }
}

/**
 * Synchronize brands list to Firebase Firestore and Cloudflare D1
 */
export async function syncBrandsToRemote(brands: BrandPartner[]): Promise<boolean> {
  let anySuccess = false;

  // 1. Persist directly to Firebase Firestore for instant global real-time synchronization
  try {
    const docRef = doc(db, "site_settings", "general");
    await setDoc(docRef, { brandPartners: brands, updatedAt: new Date().toISOString() }, { merge: true });
    anySuccess = true;
  } catch (fsErr) {
    console.warn("[BrandService] Notice syncing brands to Firestore:", fsErr);
  }

  // 2. Persist to Cloudflare D1 Worker
  try {
    const promises = brands.map((b) => {
      const payload = {
        id: b.id,
        name: b.name,
        logo: b.logo || b.logoUrl || "",
        logo_url: b.logo || b.logoUrl || "",
        description: b.tagline || "",
        tagline: b.tagline || "",
        website_url: b.websiteUrl || "",
        display_type: b.displayType || (b.logo ? "image" : "text"),
        order: b.order,
        display_order: b.order,
        is_active: b.isActive !== false ? 1 : 0
      };
      return apiClient.createBrand(payload).catch(() => {
        return apiClient.updateBrand(b.id, payload).catch(() => {});
      });
    });

    await Promise.allSettled(promises);
    anySuccess = true;
  } catch (err) {
    console.warn("[BrandService] Error syncing brands to remote D1:", err);
  }

  return anySuccess;
}

/**
 * Fetch all active brands from Firestore / Cloudflare D1
 */
export async function getBrands(): Promise<BrandPartner[]> {
  try {
    // 1. Try reading from Firebase Firestore first (universal cloud storage across all domains & devices)
    try {
      const docRef = doc(db, "site_settings", "general");
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        const data = snap.data();
        if (data?.brandPartners && Array.isArray(data.brandPartners) && data.brandPartners.length >= 40) {
          const sorted = data.brandPartners
            .map(normalizeBrand)
            .sort((a: BrandPartner, b: BrandPartner) => (a.order ?? 0) - (b.order ?? 0));
          localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(sorted));
          return sorted;
        }
      }
    } catch (fsErr) {
      console.warn("[BrandService] Notice checking Firestore brands:", fsErr);
    }

    // 2. Try Cloudflare D1 Worker API
    const res = await apiClient.getBrands();
    if (res?.brands && Array.isArray(res.brands) && res.brands.length >= 40) {
      const sorted = res.brands
        .map(normalizeBrand)
        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(sorted));
      return sorted;
    }
  } catch (err) {
    console.warn("[BrandService] Error fetching brands from remote:", err);
  }

  return getLocalBrands();
}

// Live real-time listener for brand updates across all connected browsers & origins
if (typeof window !== "undefined") {
  try {
    const docRef = doc(db, "site_settings", "general");
    onSnapshot(docRef, (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        if (data?.brandPartners && Array.isArray(data.brandPartners) && data.brandPartners.length >= 40) {
          const sorted = data.brandPartners
            .map(normalizeBrand)
            .sort((a: BrandPartner, b: BrandPartner) => (a.order ?? 0) - (b.order ?? 0));
          
          const currentLocal = localStorage.getItem(LOCAL_STORAGE_KEY);
          if (currentLocal !== JSON.stringify(sorted)) {
            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(sorted));
            window.dispatchEvent(new CustomEvent("cooltech_brands_updated", { detail: sorted }));
            window.dispatchEvent(new Event("cooltech_settings_updated"));
          }
        }
      }
    });
  } catch {}
}

/**
 * Save or update a single brand in Cloudflare D1 and LocalStorage
 */
export async function saveBrand(brand: BrandPartner): Promise<boolean> {
  const now = new Date().toISOString();
  const current = getLocalBrands();
  const existingIdx = current.findIndex((b) => b.id === brand.id);

  const payload = normalizeBrand({
    ...brand,
    isActive: brand.isActive !== false,
    order: brand.order !== undefined ? brand.order : (existingIdx >= 0 ? current[existingIdx].order : current.length + 1),
    updatedAt: now,
    createdAt: brand.createdAt || now,
  });

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
    await apiClient.createBrand(payload).catch(() => apiClient.updateBrand(payload.id, payload));
  } catch (err) {
    console.warn("[BrandService] Error saving brand to Cloudflare D1:", err);
  }

  return true;
}

/**
 * Deactivate / delete a brand in Cloudflare D1 and LocalStorage
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
