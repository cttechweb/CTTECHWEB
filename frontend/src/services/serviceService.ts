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

export const DEFAULT_SERVICES: ServiceItem[] = [
  {
    id: "ac-maintenance",
    title: "AC Maintenance",
    description: "Preventive AC maintenance, inspection, cleaning, and performance checks for reliable cooling.",
    image: "/images/services/ac_maintenance.jpg",
    badge: "Maintenance",
    category: "Maintenance",
    isActive: true,
    order: 1
  },
  {
    id: "ac-repair",
    title: "AC Repair",
    description: "AC repair support for cooling issues, electrical faults, leakage, compressor concerns, and urgent breakdowns.",
    image: "/images/services/ac_repair.jpg",
    badge: "Repair",
    category: "Maintenance",
    isActive: true,
    order: 2
  },
  {
    id: "ac-installation",
    title: "AC Installation",
    description: "Professional AC installation for homes, villas, offices, and commercial spaces across the UAE.",
    image: "/images/services/ac_installation.jpg",
    badge: "Installation",
    category: "Installation",
    isActive: true,
    order: 3
  },
  {
    id: "ac-gas-refilling",
    title: "AC Gas Refilling",
    description: "AC gas refilling and refrigerant support with diagnosis for leaks and cooling performance.",
    image: "/images/services/ac_gas_refilling.jpg",
    badge: "Gas Refill",
    category: "Maintenance",
    isActive: true,
    order: 4
  },
  {
    id: "annual-maintenance-contract",
    title: "Annual Maintenance Contract",
    description: "AMC plans for residential, commercial, and multi-site HVAC maintenance requirements.",
    image: "/images/services/ac_amc_contract.jpg",
    badge: "Contract",
    category: "Maintenance",
    isActive: true,
    order: 5
  },
  {
    id: "duct-cleaning",
    title: "Duct Cleaning",
    description: "Duct cleaning support for better airflow, healthier indoor air, and improved HVAC efficiency.",
    image: "/images/services/duct_cleaning.jpg",
    badge: "Ducting",
    category: "Ducting",
    isActive: true,
    order: 6
  },
  {
    id: "hvac-consultation",
    title: "HVAC Consultation",
    description: "HVAC consultation for product selection, project planning, and commercial cooling needs.",
    image: "/images/services/hvac_consultation.jpg",
    badge: "Consultation",
    category: "Consultation",
    isActive: true,
    order: 7
  },
  {
    id: "indoor-air-quality-duct-sanitization",
    title: "Indoor Air Quality & Duct Microbiological Sanitization",
    description: "UV-C light installation, HEPA scrubbing & antibacterial fogging for sterile indoor climate environments.",
    image: "/images/services/air_quality_sanitization.jpg",
    badge: "Cleaning",
    category: "Cleaning",
    isActive: true,
    order: 8
  },
  {
    id: "heavy-compressor-overhaul",
    title: "Heavy Compressor Overhaul & Motor Rewinding",
    description: "Precision re-machining, valve plate replacement & stator rewinding for commercial compressors.",
    image: "/images/services/compressor_overhaul.jpg",
    badge: "Maintenance",
    category: "Maintenance",
    isActive: true,
    order: 9
  },
  {
    id: "industrial-chiller-plant-overhaul",
    title: "Industrial Chiller Plant Overhaul",
    description: "Turnkey overhaul, tube bundle descaling, and condenser servicing for air and water cooled chillers.",
    image: "/images/services/chiller_overhaul.jpg",
    badge: "Chillers",
    category: "Chillers",
    isActive: true,
    order: 10
  },
  {
    id: "vrf-system-servicing",
    title: "VRF / VRV System Servicing",
    description: "Specialized diagnostics, branch controller inspection, and inverter tuning for multi-zone VRF systems.",
    image: "/images/services/vrf_servicing.jpg",
    badge: "Installation",
    category: "Installation",
    isActive: true,
    order: 11
  }
];

const LOCAL_STORAGE_KEY_V5 = "cooltech_services_v5";

export function getLocalServicesCache(): ServiceItem[] {
  try {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY_V5);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length >= 7) {
        return parsed;
      }
    }
  } catch {}

  // Automatically save and return complete DEFAULT_SERVICES
  saveLocalServicesCache(DEFAULT_SERVICES);
  return DEFAULT_SERVICES;
}

export function saveLocalServicesCache(services: ServiceItem[]) {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY_V5, JSON.stringify(services));
    localStorage.setItem("cooltech_services_v4", JSON.stringify(services));
    localStorage.setItem("cooltech_services_v2", JSON.stringify(services));
    localStorage.setItem("cooltech_services_v1", JSON.stringify(services));
    window.dispatchEvent(new CustomEvent("cooltech_services_updated", { detail: services }));
  } catch {}
}

export function resetDefaultServices(): ServiceItem[] {
  saveLocalServicesCache(DEFAULT_SERVICES);
  return DEFAULT_SERVICES;
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
