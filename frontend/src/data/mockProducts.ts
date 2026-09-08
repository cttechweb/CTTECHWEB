import { Product } from "../types";

/**
 * ─────────────────────────────────────────────────────────────────
 * TEMPORARY TEST PRODUCTS (DEVELOPMENT ONLY)
 * ─────────────────────────────────────────────────────────────────
 * These 20 products are allocated across appropriate categories
 * for UI verification and development.
 *
 * NOTE: These are NOT stored in the database. When development is
 * complete, this file can be cleared or set to an empty array.
 * ─────────────────────────────────────────────────────────────────
 */

export const TEST_PRODUCTS: Product[] = [
  {
    id: "test-prod-01",
    name: "Daikin 2.0-Ton Tropical Inverter Window A/C",
    category: "Window A/C",
    brand: "Daikin",
    price: 1450,
    rating: 4.8,
    image: "/src/assets/images/hvac_air_conditioner_1784350824930.jpg",
    description: "High-efficiency tropical T3 rotary inverter window air conditioner engineered for harsh Middle East summers with low power consumption and quiet performance.",
    inStock: true,
    minOrderQty: 2,
    status: "active",
    specifications: {
      "Cooling Capacity": "24,000 BTU/h (2.0 Ton)",
      "Compressor Type": "Tropical Inverter Rotary",
      "Refrigerant": "R-410A Eco-Friendly",
      "Power Supply": "220-240V / 50Hz / 1Ph",
      "Energy Efficiency": "5-Star ESMA Certified"
    },
    features: [
      "Tropical T3 compressor rated up to 55°C ambient",
      "Gold Fin anti-corrosive hydrophilic coating",
      "Sleep mode & 24-hour programmable timer",
      "Washable antibacterial air filter"
    ],
    tags: ["Residential", "Office", "Window A/C"]
  },
  {
    id: "test-prod-02",
    name: "Mitsubishi Heavy Industries 8-Ton KXZ Tropical VRF Outdoor Unit",
    category: "VRF System",
    brand: "Mitsubishi Heavy Industries",
    price: 8900,
    rating: 4.9,
    badge: "Best Seller",
    image: "/src/assets/images/hvac_chiller_1784350873395.jpg",
    description: "High-capacity modular VRF system delivering supreme seasonal efficiency, multi-zone indoor connectivity, and smart variable refrigerant temperature control.",
    inStock: true,
    minOrderQty: 1,
    status: "active",
    specifications: {
      "Cooling Capacity": "96,000 BTU/h (8 Ton)",
      "Max Indoor Units": "Up to 16 Units",
      "Compressor": "DC Twin Rotary Inverter",
      "Refrigerant": "R-410A",
      "Piping Length": "Up to 1,000m Total"
    },
    features: [
      "Continuous cooling operation up to 52°C ambient",
      "Multi-zone intelligent temperature management",
      "High static pressure fan for multi-story installations",
      "BMS Modbus & BACnet integration ready"
    ],
    tags: ["Commercial", "VRF", "Best Seller"]
  },
  {
    id: "test-prod-03",
    name: "Midea 5.0-Ton High-Static Tropical Ducted Split A/C",
    category: "Ducted Split A/C",
    brand: "Midea",
    price: 3200,
    rating: 4.8,
    badge: "Featured",
    image: "/src/assets/images/hvac_air_conditioner_1784350824930.jpg",
    description: "Concealed ducted split unit with high external static pressure, designed for seamless architectural integration in luxury villas, showrooms, and commercial halls.",
    inStock: true,
    minOrderQty: 1,
    status: "active",
    specifications: {
      "Cooling Capacity": "60,000 BTU/h (5.0 Ton)",
      "Static Pressure": "Up to 200 Pa",
      "Airflow Volume": "2,200 CFM",
      "Refrigerant": "R-410A",
      "Power Supply": "380-415V / 50Hz / 3Ph"
    },
    features: [
      "Ultra-slim indoor chassis for shallow ceiling voids",
      "Built-in high-lift condensate drain pump (750mm)",
      "Wired touch controller with child lock & diagnostics",
      "Heavy-duty tropical scroll compressor"
    ],
    tags: ["Commercial", "Ducted", "Featured"]
  },
  {
    id: "test-prod-04",
    name: "Carrier WeatherMaker 10-Ton Rooftop Packaged Unit",
    category: "Package Units",
    brand: "Carrier",
    price: 12500,
    rating: 4.9,
    image: "/src/assets/images/hvac_chiller_1784350873395.jpg",
    description: "Self-contained commercial rooftop packaged unit providing dependable cooling and ventilation for shopping malls, hypermarkets, warehouses, and factories.",
    inStock: true,
    minOrderQty: 1,
    status: "active",
    specifications: {
      "Cooling Capacity": "120,000 BTU/h (10 Ton)",
      "Compressor": "Dual Scroll Compressors",
      "Cabinet": "Pre-painted Galvanized Steel, 1000-hr Salt Spray",
      "Refrigerant": "Puron (R-410A)",
      "Power Supply": "380-415V / 50Hz / 3Ph"
    },
    features: [
      "Factory assembled, piped, wired, and fully tested",
      "Hinged access panels for easy serviceability",
      "Direct-drive high-efficiency indoor EC plug fans",
      "Economizer ready with motorized dampers"
    ],
    tags: ["Industrial", "Package Units", "Rooftop"]
  },
  {
    id: "test-prod-05",
    name: "Panasonic 3.0-Ton Inverter 4-Way Ceiling Cassette A/C",
    category: "Ceiling Cassette A/C",
    brand: "Panasonic",
    price: 2750,
    rating: 4.7,
    badge: "New",
    image: "/src/assets/images/hvac_air_conditioner_1784350824930.jpg",
    description: "Modern 360-degree uniform airflow ceiling cassette featuring nanoe™ X air purification technology, ideal for open-plan offices, restaurants, and retail spaces.",
    inStock: true,
    minOrderQty: 1,
    status: "active",
    specifications: {
      "Cooling Capacity": "36,000 BTU/h (3.0 Ton)",
      "Airflow": "360-Degree Wide Angle",
      "Purification": "nanoe™ X Air Purification Generator",
      "Drain Pump Lift": "Up to 850mm",
      "Refrigerant": "R-410A"
    },
    features: [
      "nanoe™ X inhibits airborne bacteria and neutralizes odors",
      "Individual 4-flap angle control via wireless remote",
      "Quiet operation down to 32 dB(A)",
      "High ambient tropical outdoor condensing unit"
    ],
    tags: ["Commercial", "Cassette", "New"]
  },
  {
    id: "test-prod-06",
    name: "LG 4.0-Ton Dual-Inverter Floor Standing Tower A/C",
    category: "Floor Standing A/C",
    brand: "LG",
    price: 3850,
    rating: 4.8,
    image: "/src/assets/images/hvac_air_conditioner_1784350824930.jpg",
    description: "Powerful aesthetic tower air conditioner providing high-velocity 20-meter airflow throw, engineered for large reception lobbies, conference halls, and banquet spaces.",
    inStock: true,
    minOrderQty: 1,
    status: "active",
    specifications: {
      "Cooling Capacity": "48,000 BTU/h (4.0 Ton)",
      "Airflow Range": "Up to 20 Meters Throw",
      "Compressor": "Dual Inverter Tropical Compressor",
      "Refrigerant": "R-410A",
      "Display": "Touch LED Panel with Smart Diagnostics"
    },
    features: [
      "Dual Inverter technology saves up to 40% energy",
      "Power cooling mode for rapid space temperature drop",
      "Gold Fin anti-corrosive coating on outdoor coils",
      "4-way motorized auto-swing louvers"
    ],
    tags: ["Commercial", "Floor Standing", "LG"]
  },
  {
    id: "test-prod-07",
    name: "Midea 1.5-Ton Heavy-Duty Portable Air Conditioner",
    category: "Portable A/C",
    brand: "Midea",
    price: 950,
    rating: 4.6,
    image: "/src/assets/images/hvac_air_conditioner_1784350824930.jpg",
    description: "Plug-and-play mobile cooling unit with high-output rotary compressor, omnidirectional caster wheels, and smart auto-evaporation exhaust hose system.",
    inStock: true,
    minOrderQty: 3,
    status: "active",
    specifications: {
      "Cooling Capacity": "18,000 BTU/h (1.5 Ton)",
      "Dehumidification": "2.8 Liters/Hour",
      "Exhaust Hose": "1.5m Flexible Duct Included",
      "Refrigerant": "R-410A Eco-Safe",
      "Noise Level": "52 dB(A)"
    },
    features: [
      "No drainage required in normal cooling conditions (Auto-Evaporative)",
      "3-in-1 Cool, Dehumidify & Fan modes",
      "Full-function remote controller with timer",
      "Heavy-duty casters for effortless portability"
    ],
    tags: ["Portable", "Midea", "Residential"]
  },
  {
    id: "test-prod-08",
    name: "York Modular Central Air Handling Unit (AHU) with Heat Recovery",
    category: "Air Handling Units (AHUs)",
    brand: "York",
    price: 16800,
    rating: 4.9,
    image: "/src/assets/images/hvac_coils_1784350888537.jpg",
    description: "Double-skin modular air handling unit with thermal break aluminum profile, high-efficiency EC plug fans, and integrated sensible rotary heat wheel.",
    inStock: false,
    minOrderQty: 1,
    status: "active",
    specifications: {
      "Air Volume": "5,000 - 15,000 CFM",
      "Casing Construction": "50mm Double Skin Polyurethane Panel",
      "Heat Wheel Efficiency": "Up to 78% Thermal Recovery",
      "Filtration": "G4 Pre-Filter + F9 Bag Filter + HEPA Ready",
      "Fans": "Direct Drive High-Efficiency EC Plug Fans"
    },
    features: [
      "Eurovent certified air leakage and casing strength",
      "Thermal bridge factor TB2 / Thermal transmittance T2",
      "Stainless steel drain pan with dual slope drainage",
      "Integrated BMS DDC controller with pressure monitoring"
    ],
    tags: ["Industrial", "AHU", "Ventilation"]
  },
  {
    id: "test-prod-09",
    name: "Symphony Industrial 70L Heavy-Duty Evaporative Air Cooler",
    category: "Portable Air Coolers",
    brand: "General",
    price: 1150,
    rating: 4.7,
    image: "/src/assets/images/hvac_hero_banner_1784350809012.jpg",
    description: "High-velocity industrial desert cooler with 70-liter heavy-duty water tank, 3-sided high-density honeycomb pads, and ultra-durable submersible water pump.",
    inStock: true,
    minOrderQty: 2,
    status: "active",
    specifications: {
      "Air Delivery": "7,500 m³/h",
      "Water Tank Capacity": "70 Liters + Continuous Float Valve Feed",
      "Cooling Media": "3-Side High Density Aspen/Honeycomb Pads",
      "Power Consumption": "380 Watts Only",
      "Coverage Area": "Up to 800 Sq. Ft."
    },
    features: [
      "Engineered for open air workshops, terraces, and warehouses",
      "Continuous auto water-fill inlet with float shutoff",
      "Heavy-duty all-terrain locking swivel wheels",
      "Low power consumption compared to conventional AC"
    ],
    tags: ["Air Cooler", "Evaporative", "Industrial"]
  },
  {
    id: "test-prod-10",
    name: "Master Industrial 18,000 CFM Roof-Mounted Desert Evaporative Cooler",
    category: "Evaporative Air Coolers",
    brand: "General",
    price: 3400,
    rating: 4.8,
    image: "/src/assets/images/hvac_chiller_1784350873395.jpg",
    description: "Heavy-duty top/bottom discharge industrial evaporative cooler with corrosion-resistant fiberglass polymer casing and inverter variable-speed fan drive.",
    inStock: true,
    minOrderQty: 1,
    status: "active",
    specifications: {
      "Airflow Capacity": "18,000 m³/h (10,600 CFM)",
      "Motor Power": "1.5 kW 3-Phase Inverter Controlled",
      "Discharge Type": "Bottom / Down Discharge for Roof Ducts",
      "Pad Thickness": "100mm High-Performance Cellulose Pads",
      "Water Auto-Clean": "Automatic drain and wash cycle timer"
    },
    features: [
      "Reduces factory ambient temperature by 8°C - 12°C",
      "UV-resistant anti-corrosion polymer cabinet",
      "Variable 16-speed digital wall controller",
      "Low maintenance with automatic water drainage purge valve"
    ],
    tags: ["Industrial", "Desert Cooler", "Commercial"]
  },
  {
    id: "test-prod-11",
    name: "CoolTech Industrial 30-Inch High-Velocity Oscillating Mist Fan",
    category: "Mist Fans",
    brand: "General",
    price: 680,
    rating: 4.7,
    image: "/src/assets/images/hvac_air_conditioner_1784350824930.jpg",
    description: "High-pressure centrifugal misting fan with integrated 45-liter water tank, heavy-duty cast copper motor, and adjustable fine aerosol misting volume.",
    inStock: true,
    minOrderQty: 2,
    status: "active",
    specifications: {
      "Fan Blade Diameter": "30 Inches (750mm)",
      "Water Tank Capacity": "45 Liters (Up to 8 Hours Run)",
      "Motor Type": "100% Copper Core 3-Speed Motor",
      "Oscillation": "90° Auto-Oscillation with 30° Tilt",
      "Drop Range": "Cools surrounding air by 4°C - 8°C"
    },
    features: [
      "Nozzle-free centrifugal mist plate prevents lime clogging",
      "Adjustable mist volume knob for indoor/outdoor tuning",
      "Reinforced heavy-duty rolling base with brakes",
      "Ideal for outdoor restaurants, sports grounds, and pools"
    ],
    tags: ["Mist Fan", "Outdoor Cooling", "Hospitality"]
  },
  {
    id: "test-prod-12",
    name: "Daikin Streamer Commercial HEPA Air Purifier & Dehumidifier",
    category: "Air Purifiers & Dehumidifiers",
    brand: "Daikin",
    price: 1890,
    rating: 4.9,
    image: "/src/assets/images/hvac_air_conditioner_1784350824930.jpg",
    description: "Dual-function commercial grade air purifier and refrigerant dehumidifier featuring electrostatic HEPA filtration and patented Daikin Flash Streamer discharge.",
    inStock: true,
    minOrderQty: 1,
    status: "active",
    specifications: {
      "CADR (Clean Air Rate)": "450 m³/h",
      "Dehumidification": "30 Liters / 24 Hours",
      "Filter System": "Electrostatic True HEPA + Active Carbon",
      "Streamer Tech": "Plasma oxidation breaks down allergens & VOCs",
      "Coverage": "Up to 85 m² (915 sq. ft.)"
    },
    features: [
      "Eliminates 99.97% of fine particles down to 0.3 microns",
      "Digital humidity target control (40% - 70% RH)",
      "Continuous drainage hose port included",
      "Whisper-quiet night mode (19 dB(A))"
    ],
    tags: ["Air Quality", "Dehumidifier", "Healthcare"]
  },
  {
    id: "test-prod-13",
    name: "CoolTech 4-Tap Heavy Duty Commercial Stainless Steel Water Cooler 100 USG",
    category: "Stainless Steel Water Cooler with 2-5 Taps (Faucets) & 25-250 USG Cooling Capacity",
    brand: "General",
    price: 2200,
    rating: 4.9,
    badge: "Popular",
    image: "/src/assets/images/hvac_compressor_1784350840924.jpg",
    description: "Food-grade stainless steel AISI 304 commercial drinking water cooler with 100 US Gallon storage tank, four push-taps, and heavy-duty tropical condensing unit.",
    inStock: true,
    minOrderQty: 1,
    status: "active",
    specifications: {
      "Tank Storage Capacity": "100 US Gallons (378 Liters)",
      "Cooling Capacity": "85 Liters/Hour Chilled Water Output",
      "Taps / Faucets": "4 Heavy Duty Chrome-Plated Brass Faucets",
      "Material": "Food-Grade Stainless Steel AISI 304 Interior & Exterior",
      "Compressor": "Copeland / Tecumseh High-Ambient Tropical"
    },
    features: [
      "Delivers continuous 10°C to 15°C cold drinking water in 50°C heat",
      "Sealed hygienic water tank prevents contamination",
      "Adjustable mechanical thermostat with auto shutoff",
      "Installed in major GCC worker camps, schools, and mosques"
    ],
    tags: ["Water Cooler", "Commercial", "Popular"]
  },
  {
    id: "test-prod-14",
    name: "Panasonic Bottom-Loading Hot & Cold Water Dispenser",
    category: "Bottled Water Dispenser (Hot and Cold)",
    brand: "Panasonic",
    price: 420,
    rating: 4.7,
    image: "/src/assets/images/hvac_pipes_1784350907486.jpg",
    description: "Ergonomic bottom-loading 5-gallon water dispenser with stainless steel hot and cold water tanks, child safety lock, and low-water warning sensor.",
    inStock: true,
    minOrderQty: 3,
    status: "active",
    specifications: {
      "Cold Water Temp": "≤ 10°C (Output 2.5 L/hr)",
      "Hot Water Temp": "≥ 85°C (Output 4.0 L/hr)",
      "Loading Method": "Bottom Drawer Concealed Bottle",
      "Tank Material": "Stainless Steel SUS 304",
      "Compressor Cooling": "High-Efficiency Hermetic Compressor"
    },
    features: [
      "No lifting heavy water bottles (Bottom load pump)",
      "Three spout dispensing: Hot, Ambient, and Cold Water",
      "Double safety device to prevent overheat dry-burn",
      "Sleek fingerprint-resistant black & stainless finish"
    ],
    tags: ["Office", "Water Dispenser", "Panasonic"]
  },
  {
    id: "test-prod-15",
    name: "CoolTech 2.0-Ton Domestic Water Tank Chiller System",
    category: "Domestic Water Chillers",
    brand: "General",
    price: 2450,
    rating: 4.8,
    image: "/src/assets/images/hvac_chiller_1784350873395.jpg",
    description: "Compact domestic water chiller designed for residential villas to maintain roof tank water at an enjoyable 24°C to 28°C during peak scorching GCC summer temperatures.",
    inStock: true,
    minOrderQty: 1,
    status: "active",
    specifications: {
      "Cooling Capacity": "24,000 BTU/h (2.0 Ton)",
      "Target Tank Volume": "500 to 1,500 Gallons",
      "Heat Exchanger": "Coaxial Pure Titanium Tube (Anti-Corrosive)",
      "Water Pump": "Integrated Low-Noise Circulation Pump",
      "Controller": "Waterproof Digital LED Wall Controller"
    },
    features: [
      "Pure titanium heat exchanger resistant to chlorinated water",
      "Fully automatic temperature regulation with auto-start",
      "Low noise rotary tropical compressor (R-410A)",
      "Quick plug-and-play installation with bypass valves"
    ],
    tags: ["Villa", "Tank Chiller", "Domestic"]
  },
  {
    id: "test-prod-16",
    name: "CoolTech 5.0-Ton Overhead Heavy-Duty Industrial Water Tank Chiller",
    category: "Tank Chillers",
    brand: "General",
    price: 4950,
    rating: 4.9,
    image: "/src/assets/images/hvac_chiller_1784350873395.jpg",
    description: "High-performance outdoor water chiller for large commercial compounds, staff accommodations, and industrial processing plants with dual circulation pump.",
    inStock: true,
    minOrderQty: 1,
    status: "active",
    specifications: {
      "Cooling Capacity": "60,000 BTU/h (5.0 Ton)",
      "Target Tank Volume": "Up to 5,000 Gallons",
      "Compressor": "Copeland Scroll Compressor (High Ambient 55°C)",
      "Circulation Flow Rate": "65 Liters / Minute",
      "Protection": "High/Low Pressure Switches & Phase Failure Relay"
    },
    features: [
      "Maintains cold water supply across hundreds of building occupants",
      "Marine-grade aluminum casing with anti-UV powder coating",
      "Shell-and-tube titanium heat exchanger with anti-freeze sensor",
      "Complete electrical safety control panel with digital thermostat"
    ],
    tags: ["Commercial", "Tank Chiller", "Industrial"]
  },
  {
    id: "test-prod-17",
    name: "Hayward 20kW Commercial Swimming Pool Chiller & Inverter Heat Pump",
    category: "Swimming Pool Chillers with Heat Pumps",
    brand: "General",
    price: 6400,
    rating: 4.9,
    image: "/src/assets/images/hvac_chiller_1784350873395.jpg",
    description: "Dual-mode pool chiller and heat pump keeping residential and resort swimming pools at a refreshing 27°C in summer and comfortable warm temperature in winter.",
    inStock: true,
    minOrderQty: 1,
    status: "active",
    specifications: {
      "Cooling Capacity": "14.5 kW",
      "Heating Capacity": "21.0 kW",
      "Pool Water Volume": "Up to 85,000 Liters (85 m³)",
      "Heat Exchanger": "Twisted Spiral Titanium Tube in PVC Shell",
      "COP (Efficiency)": "Up to 11.2 Inverter Efficiency"
    },
    features: [
      "Dual Heating & Cooling capability for year-round swimming comfort",
      "Full inverter variable-speed compressor and silent DC fan",
      "Built-in Wi-Fi module for remote smartphone app control",
      "Resistant to saltwater chlorination and pool sanitizing chemicals"
    ],
    tags: ["Pool Chiller", "Hospitality", "Resort"]
  },
  {
    id: "test-prod-18",
    name: "Scotsman Prodigy Commercial Modular Cube Ice Maker 250kg/Day",
    category: "Ice Machines",
    brand: "General",
    price: 4950,
    rating: 4.8,
    image: "/src/assets/images/hvac_compressor_1784350840924.jpg",
    description: "High-yield commercial ice cuber machine engineered for hotels, restaurants, bars, and food catering with AutoAlert™ indicator lights and WaterSense adaptive purge.",
    inStock: true,
    minOrderQty: 1,
    status: "active",
    specifications: {
      "Daily Production": "250 kg / 24 Hours",
      "Ice Form": "Gourmet Crystal Clear Medium Cube",
      "Condenser Type": "Air-Cooled with Front-Facing Exhaust",
      "Refrigerant": "R-404A / R-452A",
      "Power Supply": "230V / 50Hz / 1Ph"
    },
    features: [
      "AutoAlert™ external indicator lights display operating status",
      "WaterSense adaptive purge control reduces scale buildup",
      "AgION™ antimicrobial protection molded directly into key components",
      "Compatible with all standard Scotsman stainless storage bins"
    ],
    tags: ["Ice Machine", "Hospitality", "Commercial"]
  },
  {
    id: "test-prod-19",
    name: "Midea Commercial Double Glass Door Reach-In Display Refrigerator 800L",
    category: "Freezers and Refrigerators",
    brand: "Midea",
    price: 2850,
    rating: 4.8,
    image: "/src/assets/images/hvac_air_conditioner_1784350824930.jpg",
    description: "Heavy-duty commercial vertical upright display refrigerator with double tempered heated glass doors, digital temperature control, and illuminated canopy.",
    inStock: true,
    minOrderQty: 1,
    status: "active",
    specifications: {
      "Net Capacity": "800 Liters (28.2 Cu. Ft.)",
      "Temperature Range": "+1°C to +8°C",
      "Door Type": "Double Layer Low-E Heated Tempered Glass",
      "Shelving": "8 Heavy Duty PVC-Coated Adjustable Wire Shelves",
      "Refrigerant": "R-290 Eco-Friendly Natural Gas"
    },
    features: [
      "Dynamic ventilated cooling system with fast pull-down time",
      "Anti-condensation heated glass door with magnetic gasket",
      "Vertical internal LED side lighting for maximum product visibility",
      "Self-closing door with stay-open feature for easy restocking"
    ],
    tags: ["Refrigeration", "Retail", "Supermarket"]
  },
  {
    id: "test-prod-20",
    name: "Systemair High-Static Pressure Industrial Centrifugal Roof Exhaust Fan",
    category: "Industrial Ventilation Products",
    brand: "General",
    price: 1750,
    rating: 4.8,
    image: "/src/assets/images/hvac_coils_1784350888537.jpg",
    description: "Vertical discharge centrifugal roof extraction fan designed for harsh commercial kitchen exhaust, chemical fume extract, and industrial plant ventilation.",
    inStock: true,
    minOrderQty: 1,
    status: "active",
    specifications: {
      "Airflow Volume": "4,500 m³/h (2,650 CFM)",
      "Static Pressure": "Up to 550 Pa",
      "Max Medium Temp": "Up to 120°C Continuous (Kitchen Exhaust Rated)",
      "Impeller Type": "Backward-Curved High Efficiency Welded Steel",
      "Motor Protection": "IP55 Enclosure with Class F Insulation"
    },
    features: [
      "Motor located outside the airstream (VDI 2052 Kitchen compliant)",
      "Integrated grease drain pan and oil drainage outlet",
      "Heavy gauge seawater-resistant aluminum casing (AlMg3)",
      "Swing-out motor casing for rapid inspection and cleaning"
    ],
    tags: ["Ventilation", "Kitchen Exhaust", "Industrial"]
  }
];
