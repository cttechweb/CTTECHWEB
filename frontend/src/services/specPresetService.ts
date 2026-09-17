/* ─────────────────────────────────────────────────────────────────
   Cool Technologies — Specification Parameter Template Service
   Manages user-created parameter presets with zero dummy data
───────────────────────────────────────────────────────────────── */

import { SpecTemplate } from "../types";

const STORAGE_KEY = "cooltech_spec_parameter_templates_v1";

/**
 * Retrieve all saved specification parameter templates
 * Starts empty ([]) - zero dummy or mock templates.
 */
export function getSpecTemplates(): SpecTemplate[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch (e) {
    console.error("Failed to load saved specification templates:", e);
  }
  return [];
}

/**
 * Save templates array to localStorage and notify listeners
 */
export function saveSpecTemplates(templates: SpecTemplate[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(templates));
    window.dispatchEvent(
      new CustomEvent("cooltech_spec_templates_updated", { detail: templates })
    );
  } catch (e) {
    console.error("Failed to save specification templates:", e);
  }
}

/**
 * Create a new parameter template
 */
export function createSpecTemplate(
  name: string,
  parameters: string[],
  isDefault: boolean = false
): SpecTemplate {
  const cleanName = name.trim();
  const cleanParams = parameters
    .map((p) => p.trim())
    .filter(Boolean);

  const existing = getSpecTemplates();

  // If this new template is marked as default, clear default from others
  const updatedExisting = isDefault
    ? existing.map((t) => ({ ...t, isDefault: false }))
    : existing;

  const newTemplate: SpecTemplate = {
    id: `template_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
    name: cleanName,
    parameters: cleanParams,
    isDefault,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const updatedList = [...updatedExisting, newTemplate];
  saveSpecTemplates(updatedList);
  return newTemplate;
}

/**
 * Update an existing template's name and/or parameters
 */
export function updateSpecTemplate(
  id: string,
  name: string,
  parameters: string[]
): SpecTemplate | null {
  const existing = getSpecTemplates();
  const index = existing.findIndex((t) => t.id === id);
  if (index === -1) return null;

  const cleanName = name.trim();
  const cleanParams = parameters
    .map((p) => p.trim())
    .filter(Boolean);

  const updated: SpecTemplate = {
    ...existing[index],
    name: cleanName || existing[index].name,
    parameters: cleanParams.length > 0 ? cleanParams : existing[index].parameters,
    updatedAt: new Date().toISOString(),
  };

  existing[index] = updated;
  saveSpecTemplates(existing);
  return updated;
}

/**
 * Delete a template by ID
 */
export function deleteSpecTemplate(id: string): void {
  const existing = getSpecTemplates();
  const updated = existing.filter((t) => t.id !== id);
  saveSpecTemplates(updated);
}

/**
 * Set a template as the default (or null to clear default)
 */
export function setDefaultTemplate(id: string | null): void {
  const existing = getSpecTemplates();
  const updated = existing.map((t) => ({
    ...t,
    isDefault: id !== null && t.id === id,
  }));
  saveSpecTemplates(updated);
}

/**
 * Get the active default template, if any
 */
export function getDefaultTemplate(): SpecTemplate | null {
  const existing = getSpecTemplates();
  return existing.find((t) => t.isDefault) || null;
}
