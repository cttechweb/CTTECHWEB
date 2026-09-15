/* ─────────────────────────────────────────────────────────────────
   Cool Technologies — Engineering Services Service
   Database: Cloudflare D1 (via Cloudflare Worker API)
───────────────────────────────────────────────────────────────── */

import { ServiceItem } from "../types";
import { SERVICES as STATIC_SERVICES } from "../data";
import { apiClient } from "./apiClient";

const TEMPLATE_SERVICE_IDS = new Set([
  "ac-cleaning", "ac-installation", "amc-maintenance", "emergency-repair",
  "water-tank-chiller", "duct-ventilation", "cold-room-ice-machine",
  "industrial-chiller-plant", "vrf-system-servicing", "heavy-compressor-overhaul",
  "fahu-ahu-servicing", "kitchen-exhaust-degreasing", "smart-thermostat-bms",
  "refrigerant-recovery", "anti-corrosion-coil-coating", "cooling-tower-servicing",
  "chilled-water-pump-overhaul", "sound-attenuator-install", "energy-audit-thermal",
  "cassette-ac-servicing", "package-unit-replacement"
]);

const LOCAL_STORAGE_KEY = "cooltech_services_v1";

export function getLocalServicesCache(): ServiceItem[] {
  try {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) {
        return parsed.filter((s: ServiceItem) => s && s.id && !TEMPLATE_SERVICE_IDS.has(s.id));
      }
    }
    return STATIC_SERVICES;
  } catch {
    return STATIC_SERVICES;
  }
}

function saveLocalServicesCache(services: ServiceItem[]) {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(services));
    window.dispatchEvent(new CustomEvent("cooltech_services_updated", { detail: services }));
  } catch {}
}

/**
 * Fetch all active services from Cloudflare D1
 */
export async function getServices(): Promise<ServiceItem[]> {
  try {
    const res = await apiClient.getServices();
    if (res?.services && Array.isArray(res.services) && res.services.length > 0) {
      saveLocalServicesCache(res.services);
      return res.services as ServiceItem[];
    }
  } catch (err) {
    console.warn("[Service Service] Error fetching services from D1:", err);
  }

  return getLocalServicesCache();
}

/**
 * Real-time / dynamic listener for services
 */
export function subscribeToServices(
  onUpdate: (services: ServiceItem[]) => void
): () => void {
  const initial = getLocalServicesCache();
  onUpdate(initial);

  getServices().then((fresh) => {
    if (Array.isArray(fresh) && fresh.length > 0) {
      onUpdate(fresh);
    }
  });

  const handleUpdate = (e: any) => {
    if (e?.detail && Array.isArray(e.detail)) {
      onUpdate(e.detail);
    }
  };

  window.addEventListener("cooltech_services_updated", handleUpdate);
  return () => {
    window.removeEventListener("cooltech_services_updated", handleUpdate);
  };
}

/**
 * Create or save a service in Cloudflare D1 (Admin)
 */
export async function createService(service: ServiceItem): Promise<ServiceItem> {
  const cached = getLocalServicesCache();
  const updated = [service, ...cached.filter((s) => s.id !== service.id)];
  saveLocalServicesCache(updated);

  try {
    const res = await apiClient.createService(service);
    if (res?.service) {
      return res.service as ServiceItem;
    }
  } catch (err) {
    console.warn("[Service Service] Error creating service in D1:", err);
  }

  return service;
}

/**
 * Update a service in Cloudflare D1 (Admin)
 */
export async function updateService(service: ServiceItem): Promise<ServiceItem> {
  const cached = getLocalServicesCache();
  const updated = cached.map((s) => (s.id === service.id ? service : s));
  saveLocalServicesCache(updated);

  try {
    const res = await apiClient.updateService(service.id, service);
    if (res?.service) {
      return res.service as ServiceItem;
    }
  } catch (err) {
    console.warn("[Service Service] Error updating service in D1:", err);
  }

  return service;
}

/**
 * Deactivate / delete a service in Cloudflare D1 (Admin)
 */
export async function deleteService(serviceId: string): Promise<boolean> {
  const cached = getLocalServicesCache();
  const updated = cached.filter((s) => s.id !== serviceId);
  saveLocalServicesCache(updated);

  try {
    await apiClient.deleteService(serviceId);
    return true;
  } catch (err) {
    console.warn("[Service Service] Error deleting service in D1:", err);
    return false;
  }
}
