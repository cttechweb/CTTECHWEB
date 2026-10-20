import { Product, ServiceItem } from "../types";

/**
 * Normalizes text for resilient search matching (removes accents, normalizes A/C to AC, etc.)
 */
function normalizeText(text: string): string {
  if (!text) return "";
  return text
    .toLowerCase()
    .replace(/a\/c/g, "ac")
    .replace(/air\s+conditioner[s]?/g, "ac air conditioner")
    .replace(/[\s\-_/\\,.:;()]+/g, " ")
    .trim();
}

/**
 * Deep extraction of all searchable text from a Product
 */
export function extractProductSearchableText(product: Product): string {
  const parts: string[] = [];

  // Core fields
  if (product.name) parts.push(product.name);
  if (product.brand) parts.push(product.brand);
  if (product.category) parts.push(product.category);
  if (product.categoryId) parts.push(product.categoryId);
  if (product.description) parts.push(product.description);
  if (product.modelId) parts.push(product.modelId);
  if (product.series) parts.push(product.series);
  if (product.sku) parts.push(product.sku);
  if (product.applications) parts.push(product.applications);
  if (product.sourcingChannel) parts.push(product.sourcingChannel);
  if (product.certification) parts.push(product.certification);
  if (product.primaryRegion) parts.push(product.primaryRegion);
  if (product.warranty) parts.push(product.warranty);
  if (product.badge) parts.push(product.badge);
  if (product.stockStatus) parts.push(product.stockStatus);

  // Price (raw number, formatted with commas, and with currency prefix)
  if (typeof product.price === "number" && product.price > 0) {
    parts.push(String(product.price));
    parts.push(product.price.toLocaleString("en-US"));
    parts.push(`aed ${product.price}`);
  }

  // Tags array
  if (Array.isArray(product.tags)) {
    product.tags.forEach((t) => {
      if (t) parts.push(t);
    });
  }

  // Features array
  if (Array.isArray(product.features)) {
    product.features.forEach((f) => {
      if (f) parts.push(f);
    });
  }

  // All Technical Specifications (both key names and values)
  if (product.specifications && typeof product.specifications === "object") {
    Object.entries(product.specifications).forEach(([key, val]) => {
      if (key && !key.startsWith("_")) {
        parts.push(key);
        if (typeof val === "string" || typeof val === "number") {
          parts.push(String(val));
        }
      }
    });
  }

  return normalizeText(parts.join(" "));
}

/**
 * Checks if a Product matches a multi-token search query
 */
export function matchesProductSearch(product: Product, query: string): boolean {
  if (!query || !query.trim()) return true;

  const normalizedQuery = normalizeText(query);
  if (!normalizedQuery) return true;

  const searchableText = extractProductSearchableText(product);

  // Exact whole phrase match first
  if (searchableText.includes(normalizedQuery)) {
    return true;
  }

  // Multi-token match: every search term word must match somewhere in the product's attributes
  const tokens = normalizedQuery.split(" ").filter((t) => t.length > 0);
  if (tokens.length === 0) return true;

  return tokens.every((token) => searchableText.includes(token));
}

/**
 * Deep extraction of all searchable text from a ServiceItem
 */
export function extractServiceSearchableText(service: ServiceItem): string {
  const parts: string[] = [];

  if (service.title) parts.push(service.title);
  if (service.category) parts.push(service.category);
  if (service.tagline) parts.push(service.tagline);
  if (service.description) parts.push(service.description);
  if (service.iconName) parts.push(service.iconName);

  // Features
  if (Array.isArray(service.features)) {
    service.features.forEach((f) => {
      if (f) parts.push(f);
    });
  }

  // Process steps
  if (Array.isArray(service.processSteps)) {
    service.processSteps.forEach((s) => {
      if (typeof s === "string") parts.push(s);
      else if (s && typeof s === "object" && (s as any).title) parts.push((s as any).title);
    });
  }

  // Specifications
  if (service.specifications && typeof service.specifications === "object") {
    Object.entries(service.specifications).forEach(([k, v]) => {
      parts.push(k);
      if (typeof v === "string" || typeof v === "number") parts.push(String(v));
    });
  }

  return normalizeText(parts.join(" "));
}

/**
 * Checks if a ServiceItem matches a multi-token search query
 */
export function matchesServiceSearch(service: ServiceItem, query: string): boolean {
  if (!query || !query.trim()) return true;

  const normalizedQuery = normalizeText(query);
  if (!normalizedQuery) return true;

  const searchableText = extractServiceSearchableText(service);

  if (searchableText.includes(normalizedQuery)) {
    return true;
  }

  const tokens = normalizedQuery.split(" ").filter((t) => t.length > 0);
  if (tokens.length === 0) return true;

  return tokens.every((token) => searchableText.includes(token));
}
