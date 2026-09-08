/* ─────────────────────────────────────────────────────────────────
   Cool Technologies — Category Service (Dynamic D1 CRUD & Sync)
   Database: Cloudflare D1 (via Cloudflare Worker API)
───────────────────────────────────────────────────────────────── */

import { Category } from "../types";
import { CATEGORIES } from "../data";
import { apiClient } from "./apiClient";

const LOCAL_STORAGE_KEY = "cooltech_categories_v2";

/**
 * Read local categories or initialize with defaults
 */
export function getLocalCategories(): Category[] {
  try {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.sort((a, b) => (a.sortOrder ?? 999) - (b.sortOrder ?? 999));
      }
    }

    // Auto-migrate from v1 if present
    const v1Saved = localStorage.getItem("cooltech_categories_v1");
    if (v1Saved) {
      try {
        const v1Parsed: Category[] = JSON.parse(v1Saved);
        if (Array.isArray(v1Parsed) && v1Parsed.length > 0) {
          const merged = [...CATEGORIES];
          v1Parsed.forEach((oldCat) => {
            const exists = merged.find((m) => m.id === oldCat.id || m.slug === oldCat.slug);
            if (!exists) {
              merged.push({
                ...oldCat,
                sortOrder: oldCat.sortOrder ?? merged.length + 1,
                tag: oldCat.tag || oldCat.name
              });
            }
          });
          merged.sort((a, b) => (a.sortOrder ?? 999) - (b.sortOrder ?? 999));
          saveLocalCategories(merged);
          return merged;
        }
      } catch {}
    }

    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(CATEGORIES));
    return CATEGORIES;
  } catch {
    return CATEGORIES;
  }
}

/**
 * Save categories to local storage and notify listeners
 */
export function saveLocalCategories(categories: Category[]) {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(categories));
    window.dispatchEvent(new CustomEvent("cooltech_categories_updated", { detail: categories }));
  } catch {}
}

/**
 * Fetch all active categories from Cloudflare D1 via Worker API
 */
export async function getCategories(): Promise<Category[]> {
  try {
    const res = await apiClient.getCategories();
    if (res?.categories && Array.isArray(res.categories) && res.categories.length > 0) {
      saveLocalCategories(res.categories);
      return res.categories;
    }
  } catch (err) {
    console.warn("[CategoryService] Error fetching categories from D1:", err);
  }

  return getLocalCategories();
}

/**
 * Save or update a single category in Cloudflare D1
 */
export async function saveCategory(category: Category): Promise<boolean> {
  const now = new Date().toISOString();
  const current = getLocalCategories();
  const existingIdx = current.findIndex((c) => c.id === category.id);

  const payload: Category = {
    ...category,
    status: category.status || "active",
    sortOrder: category.sortOrder !== undefined ? category.sortOrder : (existingIdx >= 0 ? current[existingIdx].sortOrder : current.length),
    updatedAt: now,
    createdAt: category.createdAt || now,
  };

  let updated: Category[];
  if (existingIdx >= 0) {
    updated = [...current];
    updated[existingIdx] = payload;
  } else {
    updated = [...current, payload];
  }
  
  updated.sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
  saveLocalCategories(updated);

  try {
    if (existingIdx >= 0) {
      await apiClient.updateCategory(payload.id, payload);
    } else {
      await apiClient.createCategory(payload);
    }
  } catch (err) {
    console.warn("[CategoryService] Error saving category to Cloudflare D1:", err);
  }

  return true;
}

/**
 * Deactivate / delete a category in Cloudflare D1
 */
export async function deleteCategory(categoryId: string): Promise<boolean> {
  const current = getLocalCategories();
  const updated = current.filter((c) => c.id !== categoryId);
  saveLocalCategories(updated);

  try {
    await apiClient.deactivateCategory(categoryId);
  } catch (err) {
    console.warn("[CategoryService] Error deactivating category in D1:", err);
  }

  return true;
}

/**
 * Reorder categories in Cloudflare D1
 */
export async function reorderCategories(orderedIds: string[]): Promise<boolean> {
  const current = getLocalCategories();
  const updated = orderedIds
    .map((id, index) => {
      const cat = current.find((c) => c.id === id);
      if (cat) {
        return { ...cat, sortOrder: index, updatedAt: new Date().toISOString() };
      }
      return null;
    })
    .filter(Boolean) as Category[];

  saveLocalCategories(updated);

  try {
    await apiClient.reorderCategories(orderedIds);
  } catch (err) {
    console.warn("[CategoryService] Error reordering categories in D1:", err);
  }

  return true;
}

/**
 * Reset all categories to default seed
 */
export async function resetCategoriesToDefault(): Promise<Category[]> {
  const seeded: Category[] = CATEGORIES.map((cat, idx) => ({
    ...cat,
    status: "active",
    sortOrder: idx,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }));

  saveLocalCategories(seeded);
  return seeded;
}
