/**
 * Admin Portal Route Configuration
 * Obfuscated URL slug to protect administrative access from public discovery and crawler probes.
 */

// Primary secret admin URL hash
export const PRIMARY_ADMIN_ROUTE = "#/ct-portal";

// Supported administrative route aliases (memorable for team, opaque to public)
export const ADMIN_ROUTES = [
  "#/ct-portal",
  "#/ct-ops",
  "#/operations-hub",
];

/**
 * Checks whether the current URL hash corresponds to the administrative portal.
 */
export function isAdminRoute(hash: string): boolean {
  if (!hash) return false;
  const cleanHash = hash.toLowerCase().split("?")[0];
  return ADMIN_ROUTES.some((route) => cleanHash === route || cleanHash.startsWith(route + "/"));
}
