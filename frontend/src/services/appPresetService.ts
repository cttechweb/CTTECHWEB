/* ─────────────────────────────────────────────────────────────────
   Cool Technologies — Target Application Template Preset Service
   Manages user-created target application presets with zero dummy data
───────────────────────────────────────────────────────────────── */

import { AppTemplate } from "../types";

const STORAGE_KEY = "cooltech_app_parameter_templates_v1";

/**
 * Retrieve all saved target application templates
 * Starts empty ([]) - zero dummy or mock templates.
 */
export function getAppTemplates(): AppTemplate[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch (e) {
    console.error("Failed to load saved application templates:", e);
  }
  return [];
}

/**
 * Save application templates array to localStorage and notify listeners
 */
export function saveAppTemplates(templates: AppTemplate[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(templates));
    window.dispatchEvent(
      new CustomEvent("cooltech_app_templates_updated", { detail: templates })
    );
  } catch (e) {
    console.error("Failed to save application templates:", e);
  }
}

/**
 * Create a new target application template
 */
export function createAppTemplate(
  name: string,
  applicationsText: string,
  isDefault: boolean = false
): AppTemplate {
  const cleanName = name.trim();
  const cleanApps = applicationsText.trim();

  const existing = getAppTemplates();

  // If this new template is marked as default, clear default from others
  const updatedExisting = isDefault
    ? existing.map((t) => ({ ...t, isDefault: false }))
    : existing;

  const newTemplate: AppTemplate = {
    id: `app_template_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
    name: cleanName,
    applicationsText: cleanApps,
    isDefault,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const updatedList = [...updatedExisting, newTemplate];
  saveAppTemplates(updatedList);
  return newTemplate;
}

/**
 * Update an existing application template
 */
export function updateAppTemplate(
  id: string,
  name: string,
  applicationsText: string
): AppTemplate | null {
  const existing = getAppTemplates();
  const index = existing.findIndex((t) => t.id === id);
  if (index === -1) return null;

  const cleanName = name.trim();
  const cleanApps = applicationsText.trim();

  const updated: AppTemplate = {
    ...existing[index],
    name: cleanName || existing[index].name,
    applicationsText: cleanApps !== undefined ? cleanApps : existing[index].applicationsText,
    updatedAt: new Date().toISOString(),
  };

  existing[index] = updated;
  saveAppTemplates(existing);
  return updated;
}

/**
 * Delete an application template by ID
 */
export function deleteAppTemplate(id: string): void {
  const existing = getAppTemplates();
  const updated = existing.filter((t) => t.id !== id);
  saveAppTemplates(updated);
}

/**
 * Set an application template as the default (or null to clear)
 */
export function setDefaultAppTemplate(id: string | null): void {
  const existing = getAppTemplates();
  const updated = existing.map((t) => ({
    ...t,
    isDefault: id !== null && t.id === id,
  }));
  saveAppTemplates(updated);
}

/**
 * Get the active default application template, if any
 */
export function getDefaultAppTemplate(): AppTemplate | null {
  const existing = getAppTemplates();
  return existing.find((t) => t.isDefault) || null;
}
