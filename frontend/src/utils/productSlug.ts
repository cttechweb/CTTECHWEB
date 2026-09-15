import { Product } from "../types";

/**
 * Generate a clean, SEO-friendly URL slug from a product's name or slug field.
 * e.g., "CoolAir Pro 1.5 Ton Inverter Split AC – CAI-18X" -> "coolair-pro-1-5-ton-inverter-split-ac-cai-18x"
 */
export function getProductSlug(product: { name?: string; slug?: string; id?: string }): string {
  if (product.slug && product.slug.trim()) {
    return product.slug.trim();
  }
  if (!product.name) {
    return product.id || "product";
  }
  return product.name
    .toLowerCase()
    .replace(/[–—]/g, "-") // handle en-dash / em-dash
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Check if a route identifier matches a product by its slug, ID, or generated name slug.
 */
export function matchesProductIdentifier(product: Product, identifier: string): boolean {
  if (!identifier || !product) return false;
  const decoded = decodeURIComponent(identifier).trim().toLowerCase();
  if (product.id && product.id.toLowerCase() === decoded) return true;
  if (product.slug && product.slug.toLowerCase() === decoded) return true;
  const generated = getProductSlug(product).toLowerCase();
  return generated === decoded;
}
