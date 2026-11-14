import { SparePart } from "../types";

export const DEFAULT_SPARE_PARTS: SparePart[] = [
  {
    id: "sp-akv-10p0-valve",
    partNumber: "068F5000",
    title: "“AKV 10P0 Valve ODF-ODF 3/8-1/2inch MU18”",
    brand: "Danfoss",
    category: "Refrigeration Circuit Components",
    subCategory: "Expansion Valves",
    description: "Request availability and compatibility for “AKV 10P0 Valve ODF-ODF 3/8-1/2inch MU18”. Precision pulse-width modulated electronic expansion valve with built-in 100μm strainer for commercial refrigeration and air conditioning.",
    compatibility: "R410A, R134a, R404A, R507, R407C Chillers & Cold Rooms",
    specs: {
      inlet: "3/8\" ODF Solder",
      outlet: "1/2\" ODF Solder",
      coilVoltage: "220-240V AC 50/60Hz or 24V DC",
      maxWorkingPressure: "52 bar / 754 psi"
    },
    image: "/images/spare-parts/akv-10p0-valve.jpg",
    inStock: true,
    price: 385,
    badge: "OEM Genuine",
    order: 1
  },
  {
    id: "sp-akv-10p2-valve",
    partNumber: "068F5002",
    title: "“AKV 10P2 Valve ODF-ODF 3/8-1/2inch MU18”",
    brand: "Danfoss",
    category: "Refrigeration Circuit Components",
    subCategory: "Expansion Valves",
    description: "Request availability and compatibility for “AKV 10P2 Valve ODF-ODF 3/8-1/2inch MU18”. Fast-acting solenoid and expansion orifice for precise evaporator superheat management.",
    compatibility: "Danfoss ADAP-KOOL Systems, Commercial Supermarket Display Units",
    specs: {
      inlet: "3/8\" ODF",
      outlet: "1/2\" ODF",
      orificeSize: "10P2 Rated",
      orificeExchangeable: "Yes"
    },
    image: "/images/spare-parts/akv-10p2-valve.jpg",
    inStock: true,
    price: 395,
    badge: "Featured",
    order: 2
  },
  {
    id: "sp-akv-10p5-valve",
    partNumber: "068F5005",
    title: "“AKV 10P5 Valve ODF-ODF 3/8-1/2inch MU18”",
    brand: "Danfoss",
    category: "Refrigeration Circuit Components",
    subCategory: "Expansion Valves",
    description: "Request availability and compatibility for “AKV 10P5 Valve ODF-ODF 3/8-1/2inch MU18”. High-capacity electronic metering valve designed for tropical ambient UAE temperature demands.",
    compatibility: "Medium to High Capacity Commercial AC & Refrigeration Chillers",
    specs: {
      inlet: "3/8\" ODF",
      outlet: "1/2\" ODF",
      refrigerants: "HFC / HCFC / R744 (CO2)",
      mopProtection: "Available"
    },
    image: "/images/spare-parts/akv-10p5-valve.jpg",
    inStock: true,
    price: 420,
    badge: "In Stock",
    order: 3
  },
  {
    id: "sp-akv-10p6-valve",
    partNumber: "068F5006",
    title: "“AKV 10P6 Valve ODF-ODF 3/8-1/2inch MU18”",
    brand: "Danfoss",
    category: "Refrigeration Circuit Components",
    subCategory: "Expansion Valves",
    description: "Request availability and compatibility for “AKV 10P6 Valve ODF-ODF 3/8-1/2inch MU18”. Long-life cycle valve with replaceable internal components.",
    compatibility: "Carrier, York, Trane, Danfoss Multi-Compressor Packs",
    specs: {
      connection: "ODF Solder 3/8 x 1/2 in",
      temperatureRange: "-50°C to +60°C",
      kvValue: "0.25 m3/h"
    },
    image: "/images/spare-parts/akv-10p6-valve.jpg",
    inStock: true,
    price: 435,
    badge: "OEM Genuine",
    order: 4
  },
  {
    id: "sp-danfoss-te12-r134a",
    partNumber: "067B3210",
    title: "“Danfoss TE12 Power Assy R134A (wide range)”",
    brand: "Danfoss",
    category: "Refrigeration Circuit Components",
    subCategory: "Thermostatic Expansion Valves",
    description: "Request availability and compatibility for “Danfoss TE12 Power Assy R134A (wide range)”. Stainless steel thermostatic power element with capillary tube and sensing bulb for large AC systems.",
    compatibility: "R134a Commercial Air Conditioning & Water Chiller Systems",
    specs: {
      bulbDiameter: "1/2\" / 12mm",
      capillaryLength: "3.0 m",
      equalization: "1/4\" ODF External Equalization",
      range: "-40°C to +10°C (N charge)"
    },
    image: "/images/spare-parts/danfoss-te12-r134a.jpg",
    inStock: true,
    price: 520,
    badge: "Top Seller",
    order: 5
  },
  {
    id: "sp-danfoss-te12-r404a",
    partNumber: "067B3211",
    title: "“Danfoss TE12 Power Assy R404A (LT MOP)”",
    brand: "Danfoss",
    category: "Refrigeration Circuit Components",
    subCategory: "Thermostatic Expansion Valves",
    description: "Request availability and compatibility for “Danfoss TE12 Power Assy R404A (LT MOP)”. Power assembly engineered for low-temperature refrigeration systems with compressor motor overload protection.",
    compatibility: "R404A / R507 Low-Temp Cold Rooms, Walk-ins, Process Cooling",
    specs: {
      refrigerant: "R404A / R507",
      chargeType: "NM / LT MOP -20°C",
      capillaryLength: "3.0 m"
    },
    image: "/images/spare-parts/danfoss-te12-r404a.jpg",
    inStock: true,
    price: 535,
    badge: "In Stock",
    order: 6
  },
  {
    id: "sp-copeland-capacitor",
    partNumber: "014-0061-04",
    title: "“Copeland Motor Start Capacitor 014-0061-04”",
    brand: "Copeland",
    category: "AC Capacitors",
    subCategory: "Start Capacitors",
    description: "Request availability and compatibility for “Copeland Motor Start Capacitor 014-0061-04”. Heavy-duty electrolyte start capacitor designed for high starting torque on Copeland scroll and reciprocating compressors.",
    compatibility: "Copeland CR, ZR, ZP Compressors 2.0 to 5.0 HP",
    specs: {
      capacitance: "88-106 MFD / μF",
      voltageRating: "330 VAC 50/60Hz",
      resistor: "Bleeder Resistor Fitted",
      housing: "Round Phenolic Flame Retardant"
    },
    image: "/images/spare-parts/copeland-capacitor.jpg",
    inStock: true,
    price: 125,
    badge: "Fast Dispatch",
    order: 7
  },
  {
    id: "sp-carrier-fan-motor",
    partNumber: "5KCP39HGS635C",
    title: "“Carrier Condenser Fan Motor 5KCP39HGS635C”",
    brand: "Carrier",
    category: "AC Fan Motors",
    subCategory: "Condenser Motors",
    description: "Request availability and compatibility for “Carrier Condenser Fan Motor 5KCP39HGS635C”. High-efficiency sealed ball bearing fan motor engineered for tropical rooftop ambient loads.",
    compatibility: "Carrier 38TKB, 38YCC, Totaline Condenser Units 2.5 - 5.0 Ton",
    specs: {
      power: "1/3 HP / 250W",
      speed: "1075 RPM Single Speed",
      voltage: "208-230V ~ 50/60Hz",
      shaft: "1/2\" x 3.5\" with Flat"
    },
    image: "/images/spare-parts/carrier-fan-motor.jpg",
    inStock: true,
    price: 380,
    badge: "OEM Genuine",
    order: 8
  },
  {
    id: "sp-universal-fan-motor",
    partNumber: "YSK120-105-6A",
    title: "“Universal Window & Split AC Fan Motor 1/7 HP”",
    brand: "Daikin",
    category: "AC Fan Motors",
    subCategory: "Universal Replacement Motors",
    description: "Request availability and compatibility for “Universal Window & Split AC Fan Motor 1/7 HP”. 6-pole dual-shaft fan motor for indoor/outdoor blower replacements.",
    compatibility: "Daikin, Gree, Midea, Super General, O General 1.5 - 2.0 Ton Units",
    specs: {
      power: "105W / 1/7 HP",
      voltage: "220-240V 50Hz",
      speed: "950 RPM 3-Speed Tap",
      rotation: "Reversible CW/CCW"
    },
    image: "/images/spare-parts/fan-motor-universal.jpg",
    inStock: true,
    price: 195,
    badge: "Universal Fit",
    order: 9
  },
  {
    id: "sp-danfoss-maneurop-compressor",
    partNumber: "MT64HM4CVE",
    title: "“Danfoss Maneurop Reciprocating Compressor MT64”",
    brand: "Danfoss",
    category: "AC Compressors",
    subCategory: "Hermetic Reciprocating",
    description: "Request availability and compatibility for “Danfoss Maneurop Reciprocating Compressor MT64”. Heavy-duty hermetic compressor for commercial air conditioning and chiller applications across the Middle East.",
    compatibility: "R22 / R417A Commercial Chillers, Package AC & Cold Storage",
    specs: {
      displacement: "107.7 cm3/rev",
      powerSupply: "380-400V 3Ph 50Hz / 460V 3Ph 60Hz",
      nominalCapacity: "5.5 HP / 16.5 kW",
      oilType: "Mineral Oil 160P"
    },
    image: "/images/spare-parts/danfoss-reciprocating-compressor.jpg",
    inStock: true,
    price: 2650,
    badge: "OEM Heavy Duty",
    order: 10
  },
  {
    id: "sp-industrial-scroll-compressor",
    partNumber: "SC75-460-3PH",
    title: "“Industrial Heavy-Duty Scroll Compressor 75HP R410A”",
    brand: "Copeland",
    category: "AC Compressors",
    subCategory: "Commercial Scroll Compressors",
    description: "Request availability and compatibility for “Industrial Heavy-Duty Scroll Compressor 75HP R410A”. High-efficiency tandem-ready scroll compressor for district cooling and commercial rooftop installations.",
    compatibility: "Carrier, York, Trane, Daikin Applied Chiller Plants",
    specs: {
      power: "75 HP / 460V 3-Phase 60Hz",
      refrigerant: "R410A High Efficiency",
      soundEnclosure: "Low-Vibration Acoustic Shell",
      crankcaseHeater: "Internal 100W"
    },
    image: "/images/hvac_compressor_1784350840924.jpg",
    inStock: true,
    price: 4950,
    badge: "B2B Commercial",
    order: 11
  },
  {
    id: "sp-smart-digital-thermostat",
    partNumber: "T6861-24V-FCU",
    title: "“Smart Digital LCD Touchscreen Thermostat 24V”",
    brand: "Honeywell",
    category: "Controls, Sensors & Thermostats",
    subCategory: "Digital Fan Coil Thermostats",
    description: "Request availability and compatibility for “Smart Digital LCD Touchscreen Thermostat 24V”. Large blue backlight display, energy-saving algorithm, 3-speed fan control, and motorized valve output.",
    compatibility: "Fan Coil Units (FCU), Ducted Split Units, District Cooling Heat Exchangers",
    specs: {
      powerSupply: "24 VAC or 220 VAC Models",
      setpointRange: "10°C to 32°C",
      accuracy: "±0.5°C Precision Sensor",
      fanRelayRating: "5A @ 250 VAC"
    },
    image: "/images/hvac_thermostat_1784350856402.jpg",
    inStock: true,
    price: 180,
    badge: "Top Seller",
    order: 12
  },
  {
    id: "sp-industrial-coils-assembly",
    partNumber: "CAR-COIL-C92",
    title: "“Industrial Condenser & Evaporator Coil Assembly”",
    brand: "Carrier",
    category: "Refrigeration Circuit Components",
    subCategory: "Heat Exchangers",
    description: "Request availability and compatibility for “Industrial Condenser & Evaporator Coil Assembly”. Heavy-gauge seamless copper tubes mechanically expanded into corrugated aluminum fins with blue-fin anti-corrosion coating.",
    compatibility: "Air-cooled Chillers, AHUs, Rooftop Package Units",
    specs: {
      tubeMaterial: "Deoxidized High Residual Phosphorus Copper",
      finCoating: "Hydrophilic Blue-Fin Epoxy",
      testPressure: "45 bar Nitrogen Factory Sealed"
    },
    image: "/images/hvac_coils_1784350888537.jpg",
    inStock: true,
    price: 1450,
    badge: "Custom OEM",
    order: 13
  },
  {
    id: "sp-danfoss-te5-r134a",
    partNumber: "067B3250",
    title: "“Danfoss TE5 Power Assy R134A (wide range)”",
    brand: "Danfoss",
    category: "Refrigeration Circuit Components",
    subCategory: "Thermostatic Expansion Valves",
    description: "Request availability and compatibility for “Danfoss TE5 Power Assy R134A (wide range)”. Modular thermostatic valve power assembly with interchangeable orifice and flare/solder flanges.",
    compatibility: "Commercial Air Conditioners, Cold Storage Rooms, Milk Coolers",
    specs: {
      refrigerant: "R134a",
      capillaryLength: "1.5 m",
      equalization: "1/4\" Solder External Equalization"
    },
    image: "/images/spare-parts/danfoss-te5-r134a.jpg",
    inStock: true,
    price: 460,
    badge: "OEM Genuine",
    order: 14
  },
  {
    id: "sp-danfoss-tex2-r22",
    partNumber: "068Z3209",
    title: "“Danfoss TX Valve TEX2 R22 Solder”",
    brand: "Danfoss",
    category: "Refrigeration Circuit Components",
    subCategory: "Thermostatic Expansion Valves",
    description: "Request availability and compatibility for “Danfoss TX Valve TEX2 R22 Solder”. Compact brass-body expansion valve with interchangeable orifice insert.",
    compatibility: "R22 Split ACs, Rooftops, Precision Air Handlers",
    specs: {
      inletOutlet: "3/8\" x 1/2\" Solder",
      equalization: "1/4\" Solder External Equalization",
      mop: "Without MOP"
    },
    image: "/images/spare-parts/danfoss-tex2-r22.png",
    inStock: true,
    price: 215,
    badge: "In Stock",
    order: 15
  },
  {
    id: "sp-danfoss-tuae-r404a",
    partNumber: "068U2205",
    title: "“Danfoss TX Valve TUAE R404A MOP”",
    brand: "Danfoss",
    category: "Refrigeration Circuit Components",
    subCategory: "Thermostatic Expansion Valves",
    description: "Request availability and compatibility for “Danfoss TX Valve TUAE R404A MOP”. All-stainless steel hermetic thermostatic valve offering ultra-high corrosion resistance and bi-metal solder connections.",
    compatibility: "Supermarket Cabinets, Walk-in Freezers, Chilled Display Units",
    specs: {
      material: "100% Stainless Steel Construction",
      connections: "Bi-metal solder joints",
      charge: "MOP Protected"
    },
    image: "/images/spare-parts/danfoss-tuae-r404a.png",
    inStock: true,
    price: 340,
    badge: "OEM Genuine",
    order: 16
  },
  {
    id: "sp-samsung-pcb-db93",
    partNumber: "DB93-14197A",
    title: "“Samsung Inverter Main PCB Assembly”",
    brand: "Samsung",
    category: "PCBs & Control Boards",
    subCategory: "Outdoor Inverter Board",
    description: "Request availability and compatibility for “Samsung Inverter Main PCB Assembly”. Original OEM Samsung Inverter Outdoor Control Board engineered for Gulf climates with conformal moisture and heat protective coating.",
    compatibility: "Samsung Multi-V, DVM S, AR24, AR18 Inverter AC Series",
    specs: {
      voltage: "220-240V ~ 50/60Hz",
      origin: "OEM Samsung Electronics Co., Ltd.",
      application: "Outdoor Unit Inverter Control"
    },
    image: "/images/spare-parts/akv-10p0-valve.jpg",
    inStock: true,
    price: 480,
    badge: "OEM Genuine",
    order: 17
  },
  {
    id: "sp-lg-smart-inverter-pcb",
    partNumber: "EBR83584801",
    title: "“LG Dual Inverter Indoor Main PCB Board”",
    brand: "LG",
    category: "PCBs & Control Boards",
    subCategory: "Indoor Control Board",
    description: "Request availability and compatibility for “LG Dual Inverter Indoor Main PCB Board”. Genuine LG Dual Inverter logic motherboard with integrated ThinQ receiver and fuse protection block.",
    compatibility: "LG DualCool, Artcool, S4-W18, S4-W24 Inverter Series",
    specs: {
      mcu: "LG Smart Microcontroller v4.2",
      supply: "220V 50Hz Single Phase",
      boardCoating: "Dual Urethane Hydrophobic"
    },
    image: "/images/spare-parts/akv-10p2-valve.jpg",
    inStock: true,
    price: 420,
    badge: "OEM Genuine",
    order: 18
  }
];

const LOCAL_STORAGE_KEY = "cooltech_spare_parts_v2";

// In-memory catalog cache for the full 10,046 spare parts
let inMemoryCatalog: SparePart[] | null = null;
let catalogLoadingPromise: Promise<SparePart[]> | null = null;

/**
 * Asynchronously load the full scraped catalog (10,046 parts) from /data/spare-parts.json
 * Cached in memory for instant client-side search, filtering and pagination.
 */
export async function loadAllSpareParts(): Promise<SparePart[]> {
  if (inMemoryCatalog && inMemoryCatalog.length > 0) {
    return inMemoryCatalog;
  }
  if (catalogLoadingPromise) {
    return catalogLoadingPromise;
  }

  catalogLoadingPromise = (async () => {
    try {
      const res = await fetch("/data/spare-parts.json");
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          // Merge custom items created in localStorage by Admin
          const localStored = getLocalStoredSpareParts();
          const customAdminParts = localStored.filter(
            p => !p.id.startsWith("theaccompany-") && !p.id.startsWith("sp-")
          );
          inMemoryCatalog = [...customAdminParts, ...data];
          return inMemoryCatalog;
        }
      }
    } catch (err) {
      console.warn("Could not load /data/spare-parts.json, falling back to local dataset", err);
    }

    const fallback = getLocalStoredSpareParts();
    inMemoryCatalog = fallback;
    return fallback;
  })();

  return catalogLoadingPromise;
}

/**
 * Synchronous getter: returns memory catalog if ready, otherwise localStorage / defaults
 */
function getLocalStoredSpareParts(): SparePart[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.warn("Failed reading spare parts from localStorage", err);
  }
  return DEFAULT_SPARE_PARTS;
}

/**
 * Retrieve all spare parts from memory cache, localStorage or fallback to defaults
 */
export function getSpareParts(): SparePart[] {
  if (inMemoryCatalog && inMemoryCatalog.length > 0) {
    return inMemoryCatalog;
  }
  return getLocalStoredSpareParts();
}

/**
 * Persist spare parts to localStorage and dispatch update events
 */
export function saveSpareParts(parts: SparePart[]): void {
  try {
    inMemoryCatalog = parts;
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(parts.slice(0, 100))); // Avoid localStorage quota overflow
    window.dispatchEvent(new CustomEvent("cooltech_spare_parts_updated", { detail: parts }));
  } catch (err) {
    console.error("Failed saving spare parts to localStorage", err);
  }
}

/**
 * Add a new spare part
 */
export function addSparePart(part: Omit<SparePart, "id"> & { id?: string }): SparePart {
  const parts = getSpareParts();
  const newPart: SparePart = {
    ...part,
    id: part.id || `sp-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    order: part.order ?? parts.length + 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  const updated = [newPart, ...parts];
  saveSpareParts(updated);
  return newPart;
}

/**
 * Update an existing spare part
 */
export function updateSparePart(id: string, updates: Partial<SparePart>): SparePart | null {
  const parts = getSpareParts();
  const idx = parts.findIndex(p => p.id === id);
  if (idx === -1) return null;
  const updatedPart: SparePart = {
    ...parts[idx],
    ...updates,
    updatedAt: new Date().toISOString()
  };
  parts[idx] = updatedPart;
  saveSpareParts(parts);
  return updatedPart;
}

/**
 * Delete a spare part
 */
export function deleteSparePart(id: string): boolean {
  const parts = getSpareParts();
  const filtered = parts.filter(p => p.id !== id);
  if (filtered.length !== parts.length) {
    saveSpareParts(filtered);
    return true;
  }
  return false;
}

/**
 * Bulk import spare parts (e.g., from Excel/CSV)
 */
export function bulkImportSpareParts(newParts: Partial<SparePart>[], replaceAll: boolean = false): number {
  const current = replaceAll ? [] : getSpareParts();
  const processed: SparePart[] = newParts.map((item, idx) => ({
    id: item.id || `sp-${Date.now()}-${idx}-${Math.random().toString(36).substring(2, 6)}`,
    partNumber: item.partNumber || `PN-${Math.floor(100000 + Math.random() * 900000)}`,
    title: item.title || "HVAC Replacement Part",
    brand: item.brand || "Universal OEM",
    category: item.category || "General Spare Parts",
    subCategory: item.subCategory,
    description: item.description || "Original quality replacement spare part for commercial and residential air conditioners.",
    compatibility: item.compatibility || "Universal Split & Package Units",
    specs: item.specs || {},
    image: item.image || "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=700&q=80",
    inStock: item.inStock !== false,
    price: typeof item.price === "number" ? item.price : 0,
    badge: item.badge,
    order: item.order ?? (current.length + idx + 1),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }));

  const combined = replaceAll ? processed : [...processed, ...current];
  saveSpareParts(combined);
  return processed.length;
}

/**
 * Reset back to factory default spare parts
 */
export function resetDefaultSpareParts(): SparePart[] {
  saveSpareParts(DEFAULT_SPARE_PARTS);
  return DEFAULT_SPARE_PARTS;
}
