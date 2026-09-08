/* ─────────────────────────────────────────────────────────────────
   Cool Technologies — Category Tag Color System
   Ensures:
   1. Each unique category TAG has one single, consistent, suitable color
      (e.g., all "ROOM A/C" share one color, all "COMMERCIAL A/C" share one color)
   2. When a new category is added with a new tag, it dynamically receives
      a new distinct color from the curated palette
   3. ONLY the tag badge pill is colored (no card borders/surroundings)
───────────────────────────────────────────────────────────────── */

export interface CategoryColorTheme {
  id: string;
  name: string;
  badge: string; // Background, text, and border for tag badge pill
  icon: string;  // Matching icon color
  dot: string;   // Colored dot for filters and indicators
}

/**
 * Curated Executive B2B Colors for HVAC & Industrial Equipment Tags
 * Soft pastel backgrounds, bold legible text, crisp tag borders, matching icons.
 */
export const CATEGORY_COLOR_PALETTES: CategoryColorTheme[] = [
  {
    id: "sky",
    name: "Sky Blue",
    badge: "bg-sky-50 text-sky-800 border-sky-200/90",
    icon: "text-sky-600",
    dot: "bg-sky-500",
  },
  {
    id: "indigo",
    name: "Royal Indigo",
    badge: "bg-indigo-50 text-indigo-800 border-indigo-200/90",
    icon: "text-indigo-600",
    dot: "bg-indigo-500",
  },
  {
    id: "emerald",
    name: "Emerald Green",
    badge: "bg-emerald-50 text-emerald-800 border-emerald-200/90",
    icon: "text-emerald-600",
    dot: "bg-emerald-500",
  },
  {
    id: "cyan",
    name: "Cyan Aqua",
    badge: "bg-cyan-50 text-cyan-800 border-cyan-200/90",
    icon: "text-cyan-600",
    dot: "bg-cyan-500",
  },
  {
    id: "teal",
    name: "Marine Teal",
    badge: "bg-teal-50 text-teal-800 border-teal-200/90",
    icon: "text-teal-600",
    dot: "bg-teal-500",
  },
  {
    id: "slate",
    name: "Steel Slate",
    badge: "bg-slate-100 text-slate-800 border-slate-300/90",
    icon: "text-slate-600",
    dot: "bg-slate-500",
  },
  {
    id: "amber",
    name: "Warm Amber",
    badge: "bg-amber-50 text-amber-800 border-amber-200/90",
    icon: "text-amber-600",
    dot: "bg-amber-500",
  },
  {
    id: "purple",
    name: "Purple",
    badge: "bg-purple-50 text-purple-800 border-purple-200/90",
    icon: "text-purple-600",
    dot: "bg-purple-500",
  },
  {
    id: "rose",
    name: "Coral Rose",
    badge: "bg-rose-50 text-rose-800 border-rose-200/90",
    icon: "text-rose-600",
    dot: "bg-rose-500",
  },
  {
    id: "orange",
    name: "Orange Bronze",
    badge: "bg-orange-50 text-orange-800 border-orange-200/90",
    icon: "text-orange-600",
    dot: "bg-orange-500",
  },
  {
    id: "blue",
    name: "Azure Blue",
    badge: "bg-blue-50 text-blue-800 border-blue-200/90",
    icon: "text-blue-600",
    dot: "bg-blue-500",
  },
  {
    id: "fuchsia",
    name: "Fuchsia",
    badge: "bg-fuchsia-50 text-fuchsia-800 border-fuchsia-200/90",
    icon: "text-fuchsia-600",
    dot: "bg-fuchsia-500",
  },
  {
    id: "lime",
    name: "Lime Green",
    badge: "bg-lime-50 text-lime-900 border-lime-200/90",
    icon: "text-lime-700",
    dot: "bg-lime-500",
  },
  {
    id: "pink",
    name: "Pink",
    badge: "bg-pink-50 text-pink-800 border-pink-200/90",
    icon: "text-pink-600",
    dot: "bg-pink-500",
  },
  {
    id: "violet",
    name: "Violet",
    badge: "bg-violet-50 text-violet-800 border-violet-200/90",
    icon: "text-violet-600",
    dot: "bg-violet-500",
  },
  {
    id: "yellow",
    name: "Warm Gold",
    badge: "bg-yellow-50 text-yellow-800 border-yellow-200/90",
    icon: "text-yellow-600",
    dot: "bg-yellow-500",
  }
];

/**
 * Stable string hash to pick a deterministic palette index for any dynamically added tag
 */
export function getHashPaletteIndex(seed: string): number {
  if (!seed) return 0;
  const clean = seed.trim().toLowerCase();
  let hash = 5381;
  for (let i = 0; i < clean.length; i++) {
    hash = ((hash << 5) + hash) + clean.charCodeAt(i);
  }
  return Math.abs(hash) % CATEGORY_COLOR_PALETTES.length;
}

/**
 * Map known category tag groups to their intuitive, suitable B2B colors
 */
function getKnownTagColorId(tagStr: string): string | null {
  const lower = tagStr.toLowerCase().trim();

  // 1. Room A/C: Sky Blue (clean residential cooling)
  if (lower.includes("room")) {
    return "sky";
  }

  // 2. Commercial A/C: Royal Indigo (heavy commercial/VRF)
  if (lower.includes("commercial") || lower.includes("vrf") || lower.includes("vrv")) {
    return "indigo";
  }

  // 3. Air Cooling & Treatment / Evaporative: Emerald Green (fresh airflow)
  if (lower.includes("air cooling") || lower.includes("treatment") || lower.includes("evaporative")) {
    return "emerald";
  }

  // 4. Water Coolers & Dispensers: Cyan Aqua (drinking water)
  if (lower.includes("water cooler") || lower.includes("dispenser")) {
    return "cyan";
  }

  // 5. Overhead Tank & Pool Chillers: Marine Teal (specialized chilling)
  if (lower.includes("over head") || lower.includes("swimming") || lower.includes("pool") || lower.includes("tank chiller")) {
    return "teal";
  }

  // 6. Centralized Water Cooling & Bulk Industrial: Steel Slate (heavy mechanical plants)
  if (lower.includes("centralized") || lower.includes("bulk") || lower.includes("industrial water chiller")) {
    return "slate";
  }

  // 7. Ice Machines, Freezers, Refrigerators: Warm Amber (commercial refrigeration)
  if (lower.includes("ice") || lower.includes("freezer") || lower.includes("refrigerator") || lower.includes("upright")) {
    return "amber";
  }

  // 8. Industrial Ventilation & Water Tanks / GRP: Purple (ventilation & storage)
  if (lower.includes("ventilation") || lower.includes("purification") || lower.includes("water tank") || lower.includes("poly") || lower.includes("grp")) {
    return "purple";
  }

  // 9. Compressors: Coral Rose
  if (lower.includes("compressor")) {
    return "rose";
  }

  // 10. Coils & Heat Exchangers: Orange Bronze
  if (lower.includes("coil") || lower.includes("heat exchanger")) {
    return "orange";
  }

  // 11. Piping & Valves: Azure Blue
  if (lower.includes("piping") || lower.includes("pipe") || lower.includes("valve") || lower.includes("fitting")) {
    return "blue";
  }

  // 12. Controls & Automation: Violet
  if (lower.includes("control") || lower.includes("thermostat") || lower.includes("automation") || lower.includes("bms")) {
    return "violet";
  }

  return null;
}

/**
 * Get the color theme for a category TAG.
 * Ensures:
 * - All categories with the same tag share the exact same single color
 * - Different tags have different colors
 * - Newly added tags automatically receive a distinct color dynamically
 */
export function getCategoryColorTheme(
  categoryOrTag: { tag?: string; name?: string; color?: string } | string
): CategoryColorTheme {
  // If an object was passed, extract the tag (or fallback to name)
  let tagString = "";
  let explicitColor = "";

  if (typeof categoryOrTag === "string") {
    tagString = categoryOrTag;
  } else if (categoryOrTag && typeof categoryOrTag === "object") {
    tagString = categoryOrTag.tag || categoryOrTag.name || "";
    explicitColor = categoryOrTag.color || "";
  }

  // 1. If explicit color was chosen by admin
  if (explicitColor) {
    const match = CATEGORY_COLOR_PALETTES.find((p) => p.id === explicitColor);
    if (match) return match;
  }

  // 2. Known semantic tag mapping
  const knownId = getKnownTagColorId(tagString);
  if (knownId) {
    const match = CATEGORY_COLOR_PALETTES.find((p) => p.id === knownId);
    if (match) return match;
  }

  // 3. Dynamic hash for any brand new tag added in the future
  const hashIdx = getHashPaletteIndex(tagString);
  return CATEGORY_COLOR_PALETTES[hashIdx];
}
