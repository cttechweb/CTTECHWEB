import { Category, Product, ServiceItem } from "./types";

export const CATEGORIES: Category[] = [
  {
    id: "room-air-conditioners",
    name: "Room Air Conditioners",
    tag: "Room Air Conditioner",
    subtitle: "Split, Window, Portable & Inverter Units",
    description: "High-efficiency residential and light commercial room cooling systems including wall split, ceiling cassette, and tropical T3 units.",
    image: "/src/assets/images/hvac_air_conditioner_1784350824930.jpg",
    slug: "room-air-conditioners",
    sortOrder: 1,
    status: "active"
  },
  {
    id: "air-coolers",
    name: "Air Coolers",
    tag: "Air Cooler",
    subtitle: "Evaporative, Desert & Portable Heavy-Duty Coolers",
    description: "Eco-friendly high-volume evaporative coolers and industrial desert cooling solutions designed for open spaces, patios, and workshops.",
    image: "/src/assets/images/hvac_hero_banner_1784350809012.jpg",
    slug: "air-coolers",
    sortOrder: 2,
    status: "active"
  },
  {
    id: "commercial-ac-vrf",
    name: "Commercial AC & VRF",
    tag: "Commercial HVAC",
    subtitle: "VRF/VRV Systems, Ducted Splits, Rooftop Packages",
    description: "Multi-zone modular VRF systems, ducted split units, and rooftop packaged heat pumps engineered for commercial towers and complexes.",
    image: "/src/assets/images/hvac_air_conditioner_1784350824930.jpg",
    slug: "commercial-ac-vrf",
    sortOrder: 3,
    status: "active"
  },
  {
    id: "chillers-central-plants",
    name: "Chillers & Central Plants",
    tag: "Chillers & Plants",
    subtitle: "Air-Cooled & Water-Cooled Chillers, Heat Pumps",
    description: "Centralized climate solutions including air-cooled screw chillers, centrifugal systems, and district cooling heat exchangers.",
    image: "/src/assets/images/hvac_chiller_1784350873395.jpg",
    slug: "chillers-central-plants",
    sortOrder: 4,
    status: "active"
  },
  {
    id: "air-handling-fcu",
    name: "Air Handling & FCU",
    tag: "Ventilation & FCU",
    subtitle: "AHU, FCU, Fresh Air & Ecology Units",
    description: "Fresh air handling units (FAHU), concealed ceiling fan coils (FCU), and kitchen ecology electrostatic exhaust systems.",
    image: "/src/assets/images/hvac_coils_1784350888537.jpg",
    slug: "air-handling-fcu",
    sortOrder: 5,
    status: "active"
  },
  {
    id: "compressors",
    name: "Compressors",
    tag: "Compressors",
    subtitle: "Variable, Scroll, Reciprocating & Screw",
    description: "Industrial refrigeration and HVAC compressors engineered for efficiency, lower acoustics, and maximum durability under GCC climates.",
    image: "/src/assets/images/hvac_compressor_1784350840924.jpg",
    slug: "compressors",
    sortOrder: 6,
    status: "active"
  },
  {
    id: "coils",
    name: "Coils & Heat Exchangers",
    tag: "Heat Exchangers",
    subtitle: "Condenser Coils, Evaporator Coils, Plate Type",
    description: "High-grade copper-aluminum and microchannel coils providing optimal heat transfer and coastal anti-corrosion protection.",
    image: "/src/assets/images/hvac_coils_1784350888537.jpg",
    slug: "coils-heat-exchangers",
    sortOrder: 7,
    status: "active"
  },
  {
    id: "pipes-fittings",
    name: "Pipes & Fittings",
    tag: "Piping & Valves",
    subtitle: "Copper Pipes, Insulation, Valves & Brass",
    description: "Seamless copper tubes, premium elastomeric insulation, pressure valves, and B2B plumbing components.",
    image: "/src/assets/images/hvac_pipes_1784350907486.jpg",
    slug: "pipes-fittings",
    sortOrder: 8,
    status: "active"
  },
  {
    id: "controls",
    name: "Controls & Thermostats",
    tag: "Controls & Automation",
    subtitle: "Smart Thermostats, Sensors, BMS Systems",
    description: "Smart digital thermostats, room sensors, and complete building automation management interfaces.",
    image: "/src/assets/images/hvac_thermostat_1784350856402.jpg",
    slug: "controls-thermostats",
    sortOrder: 9,
    status: "active"
  }
];

export const BRANDS = [
  { name: "Daikin", logoUrl: "https://upload.wikimedia.org/wikipedia/commons/0/00/Daikin_logo.svg" },
  { name: "Midea", logoUrl: "https://upload.wikimedia.org/wikipedia/commons/e/e9/Midea-Logo.svg" },
  { name: "Panasonic", logoUrl: "https://upload.wikimedia.org/wikipedia/commons/e/ee/Panasonic_logo_2.svg" },
  { name: "Mitsubishi Heavy Industries", logoUrl: "" },
  { name: "LG", logoUrl: "https://upload.wikimedia.org/wikipedia/commons/b/bf/LG_logo_%282015%29.svg" },
];

import { TEST_PRODUCTS } from "./data/mockProducts";
export { TEST_PRODUCTS };
export const PRODUCTS: Product[] = TEST_PRODUCTS;

export const SERVICES: ServiceItem[] = [];
