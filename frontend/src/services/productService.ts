/* ─────────────────────────────────────────────────────────────────
   Cool Technologies — Product Service
   Application Database: Cloudflare D1 (via Cloudflare Worker API)
───────────────────────────────────────────────────────────────── */

import { Product } from "../types";
import { apiClient } from "./apiClient";
import { TEST_PRODUCTS } from "../data/mockProducts";

const LOCAL_STORAGE_KEY = "cooltech_products_v3";
const BADGES_CACHE_KEY = "cooltech_product_badges_v1";

export function getProductOverrides(): Record<string, { badge?: string; isFeatured?: boolean; hidePrice?: boolean }> {
  try {
    const raw = localStorage.getItem(BADGES_CACHE_KEY);
    const parsed = raw ? JSON.parse(raw) : {};
    // Seed test a from admin screenshot if not set
    if (!parsed["prod-1787896560795"]) {
      parsed["prod-1787896560795"] = { badge: "Popular", isFeatured: false };
    }
    return parsed;
  } catch {
    return { "prod-1787896560795": { badge: "Popular", isFeatured: false } };
  }
}

export function saveProductOverride(productId: string, meta: { badge?: string; isFeatured?: boolean; hidePrice?: boolean }) {
  try {
    const current = getProductOverrides();
    current[productId] = { ...current[productId], ...meta };
    localStorage.setItem(BADGES_CACHE_KEY, JSON.stringify(current));
  } catch {}
}

export function enrichProduct(p: Product): Product {
  if (!p) return p;
  const overrides = getProductOverrides()[p.id];
  const specs = (p.specifications || {}) as Record<string, any>;

  let badge = p.badge || overrides?.badge || specs._badge || undefined;
  if (!badge && Array.isArray(p.tags)) {
    const found = p.tags.find((t: string) => {
      const l = t.toLowerCase();
      return l.includes("best") || l.includes("featured") || l.includes("new") || l.includes("popular");
    });
    if (found) badge = found;
  }
  if (badge === "None" || badge === "") badge = undefined;

  const isFeatured = p.isFeatured ?? overrides?.isFeatured ?? (specs._isFeatured === "true" || specs._isFeatured === true) ?? (badge === "Featured");
  const hidePrice = p.hidePrice ?? overrides?.hidePrice ?? (specs._hidePrice === "true" || specs._hidePrice === true);

  return {
    ...p,
    badge,
    isFeatured,
    hidePrice,
  };
}

/**
 * Merge Cloudflare D1 persistent products with development test products.
 * Database products always take precedence over test products.
 */
function mergeProductsWithTestCatalog(dbProducts: Product[]): Product[] {
  const map = new Map<string, Product>();

  // 1. Load temporary development test products first
  for (const item of TEST_PRODUCTS) {
    if (item && item.id) {
      map.set(item.id, enrichProduct(item));
    }
  }

  // 2. Overlay live Cloudflare D1 products (real products take priority)
  for (const item of dbProducts) {
    if (item && item.id) {
      map.set(item.id, enrichProduct(item));
    }
  }

  return Array.from(map.values());
}

export function getLocalProductsCache(): Product[] {
  try {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (saved !== null) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return mergeProductsWithTestCatalog(parsed);
      }
    }
  } catch {}
  return mergeProductsWithTestCatalog([]);
}

export function saveLocalProductsCache(products: Product[]) {
  try {
    // Deduplicate by ID before caching and broadcasting
    const seen = new Set<string>();
    const deduplicated: Product[] = [];
    for (const p of products) {
      if (p && p.id && !seen.has(p.id)) {
        seen.add(p.id);
        deduplicated.push(enrichProduct(p));
      }
    }
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(deduplicated));
    window.dispatchEvent(new CustomEvent("cooltech_products_updated", { detail: deduplicated }));
  } catch {}
}

/**
 * Fetch all active products from Cloudflare D1 via Worker API
 */
export async function getProducts(params?: { category?: string; brand?: string; search?: string }): Promise<Product[]> {
  try {
    const res = await apiClient.getProducts(params);
    if (res?.products && Array.isArray(res.products)) {
      const merged = mergeProductsWithTestCatalog(res.products);
      saveLocalProductsCache(merged);
      return merged;
    }
  } catch (err) {
    console.warn("[ProductService] Error fetching products from Cloudflare D1:", err);
  }

  return getLocalProductsCache();
}

/**
 * Fetch single product details by ID from Cloudflare D1
 */
export async function getProductById(productId: string): Promise<Product | null> {
  try {
    const res = await apiClient.getProductById(productId);
    if (res?.product) {
      return enrichProduct(res.product);
    }
  } catch (err) {
    console.warn(`[ProductService] Error fetching product ${productId} from D1:`, err);
  }

  const cached = getLocalProductsCache().find((p) => p.id === productId);
  return cached ? enrichProduct(cached) : null;
}

/**
 * Subscribe to product updates across components
 */
export function subscribeToProducts(onUpdate: (products: Product[]) => void): () => void {
  // Initial load from cache
  const initial = getLocalProductsCache();
  onUpdate(initial);

  // Fetch fresh catalog from Cloudflare D1
  getProducts().then((fresh) => {
    if (Array.isArray(fresh)) {
      onUpdate(fresh);
    }
  });

  const handleUpdateEvent = (e: any) => {
    if (e?.detail && Array.isArray(e.detail)) {
      onUpdate(e.detail);
    }
  };

  window.addEventListener("cooltech_products_updated", handleUpdateEvent);
  return () => {
    window.removeEventListener("cooltech_products_updated", handleUpdateEvent);
  };
}

/**
 * Save / update product in Cloudflare D1 (Admin only)
 */
export async function saveProduct(product: Product): Promise<boolean> {
  const now = new Date().toISOString();
  const payload: Product = {
    ...product,
    status: product.status || "active",
    updatedAt: now,
    createdAt: product.createdAt || now,
  };

  saveProductOverride(payload.id, {
    badge: payload.badge,
    isFeatured: payload.isFeatured,
    hidePrice: payload.hidePrice,
  });

  const current = getLocalProductsCache();
  const existingIdx = current.findIndex((p) => p.id === product.id);

  // 1. Perform persistent database write first via Cloudflare Worker API
  if (existingIdx >= 0) {
    await apiClient.updateProduct(payload.id, payload);
  } else {
    await apiClient.createProduct(payload);
  }

  // 2. Only update local cache upon successful D1 write confirmation
  let updated: Product[];
  if (existingIdx >= 0) {
    updated = [...current];
    updated[existingIdx] = payload;
  } else {
    updated = [payload, ...current];
  }
  saveLocalProductsCache(updated);

  return true;
}

export const createProduct = saveProduct;
export const updateProduct = (id: string, product: Product) => saveProduct({ ...product, id });

/**
 * Permanently delete product from Cloudflare D1 (Admin only)
 */
export async function deleteProductFromDb(productId: string): Promise<boolean> {
  // 1. Perform persistent database deletion first via Worker API
  await apiClient.deleteProduct(productId);

  // 2. Update local cache only upon successful D1 deletion
  const current = getLocalProductsCache();
  const updated = current.filter((p) => p.id !== productId);
  saveLocalProductsCache(updated);

  return true;
}

export const deleteProduct = deleteProductFromDb;
export const archiveProduct = deleteProductFromDb;

/**
 * Bulk save products (Excel/CSV importer to Cloudflare D1)
 */
export async function bulkSaveProducts(products: Product[]): Promise<number> {
  if (!products || products.length === 0) return 0;

  try {
    await apiClient.bulkImportProducts(products);
    const current = getLocalProductsCache();
    const existingMap = new Map(current.map((p) => [p.id, p]));
    products.forEach((p) => existingMap.set(p.id, p));
    const merged = Array.from(existingMap.values());
    saveLocalProductsCache(merged);
    return products.length;
  } catch (err) {
    console.warn("[ProductService] Error bulk importing products to D1:", err);
    throw err;
  }
}

export async function seedInitialProducts(): Promise<void> {
  // No-op
}
