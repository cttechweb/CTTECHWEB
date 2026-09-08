import { Workflow } from "../types";

export const INITIAL_WORKFLOWS: Workflow[] = [
  {
    id: "wf-rac",
    name: "Room Air Conditioner (DX RAC)",
    slug: "dx-rac",
    description: "Decision tree for Split, Cassette, Ducted, and Floor Standing ACs for residential and commercial spaces.",
    image: "/src/assets/images/hvac_air_conditioner_1784350824930.jpg",
    badge: "MOST POPULAR",
    iconName: "Wind",
    targetCategory: "air-conditioners",
    steps: [
      {
        id: "rac-step-1",
        stepNumber: 1,
        title: "1. What is the Application?",
        subtitle: "Select the primary space type requiring cooling.",
        displayMode: "text",
        inputType: "cards",
        options: [
          { id: "app-home", label: "Home (Villa / Apartment)", description: "Residential living spaces", iconName: "Home" },
          { id: "app-office", label: "Commercial Office", description: "Standard business space", iconName: "Building2" },
          { id: "app-shop", label: "Retail Shop", description: "High foot-traffic store", iconName: "Store" },
          { id: "app-restaurant", label: "Restaurant", description: "High internal thermal heat load", iconName: "Utensils" },
          { id: "app-hospital", label: "Hospital / Clinic", description: "Clean air & precise temp control", iconName: "Activity" },
          { id: "app-server", label: "Server Room", description: "Critical 24/7 IT infrastructure", iconName: "Server", badge: "Precision AC" },
          { id: "app-warehouse", label: "Warehouse", description: "Large open space cooling", iconName: "Boxes" },
          { id: "app-hall", label: "Large Hall / Open Space", description: "High volume assembly area", iconName: "Maximize", badge: "Floor Standing" }
        ]
      },
      {
        id: "rac-step-2",
        stepNumber: 2,
        title: "2. Is Outdoor Unit Installation Possible?",
        subtitle: "Do you have access to a balcony, exterior wall, or roof slab for the condenser?",
        inputType: "yesno",
        options: [
          { id: "outdoor-yes", label: "YES — Outdoor Space Available", description: "Proceed with Split system selection", iconName: "Check" },
          { id: "outdoor-no", label: "NO — No Outdoor Access", description: "Requires Portable AC or Window AC", iconName: "X" }
        ]
      },
      {
        id: "rac-step-3",
        stepNumber: 3,
        title: "3. What Type of Indoor Installation is Possible?",
        subtitle: "Select your preferred architectural indoor unit mounting style.",
        image: "/src/assets/images/hvac_air_conditioner_1784350824930.jpg",
        displayMode: "image",
        inputType: "cards",
        options: [
          { 
            id: "mount-wall", 
            label: "Wall Mounted Split AC", 
            description: "Standard wall bracket installation", 
            image: "/src/assets/images/hvac_air_conditioner_1784350824930.jpg",
            badge: "Most Common"
          },
          { 
            id: "mount-cassette", 
            label: "Ceiling Cassette AC", 
            description: "Recessed 4-way flush false ceiling unit", 
            image: "/src/assets/images/hvac_hero_banner_1784350809012.jpg",
            badge: "360° Airflow"
          },
          { 
            id: "mount-ducted", 
            label: "Concealed Ducted Split AC", 
            description: "Hidden in false ceiling with linear grilles", 
            image: "/src/assets/images/hvac_coils_1784350888537.jpg",
            badge: "Architectural"
          },
          { 
            id: "mount-floor", 
            label: "Floor Standing Tower AC", 
            description: "High airflow commercial floor tower", 
            image: "/src/assets/images/hvac_pipes_1784350907486.jpg",
            badge: "Heavy Duty"
          },
          { 
            id: "mount-suspended", 
            label: "Ceiling Suspended AC", 
            description: "Direct concrete slab under-ceiling mount", 
            image: "/src/assets/images/hvac_compressor_1784350840924.jpg" 
          }
        ]
      },
      {
        id: "rac-step-4",
        stepNumber: 4,
        title: "4. What is the Room / Area Size?",
        subtitle: "Select the total floor area to determine required cooling capacity (TR).",
        inputType: "cards",
        options: [
          { id: "area-15", label: "Up to 15 m²", description: "Recommended: 0.75 - 1.0 TR (3.5 kW)", capacityKwMultiplier: 3.5 },
          { id: "area-25", label: "15 – 25 m²", description: "Recommended: 1.5 TR (5.2 kW)", capacityKwMultiplier: 5.2 },
          { id: "area-40", label: "25 – 40 m²", description: "Recommended: 2.0 TR (7.1 kW)", capacityKwMultiplier: 7.1 },
          { id: "area-60", label: "40 – 60 m²", description: "Recommended: 2.5 - 3.0 TR (10.5 kW)", capacityKwMultiplier: 10.5 },
          { id: "area-60-plus", label: "Above 60 m²", description: "Recommended: Above 3.0 TR (14.0+ kW)", capacityKwMultiplier: 14.0 }
        ]
      },
      {
        id: "rac-step-5",
        stepNumber: 5,
        title: "5. Average Operating Hours Per Day?",
        subtitle: "How many hours will this AC unit run daily?",
        inputType: "cards",
        options: [
          { id: "hrs-less-6", label: "Less than 6 Hours", description: "Fixed Speed compressor acceptable" },
          { id: "hrs-6-10", label: "6 – 10 Hours", description: "Standard Inverter recommended" },
          { id: "hrs-10-18", label: "10 – 18 Hours", description: "High Efficiency Inverter recommended" },
          { id: "hrs-18-24", label: "18 – 24 Hours", description: "Heavy Duty Tropical Inverter required" },
          { id: "hrs-24", label: "24 Hours Continuous", description: "Precision 24/7 Heavy Duty Unit", badge: "24/7 Continuous" }
        ]
      },
      {
        id: "rac-step-6",
        stepNumber: 6,
        title: "6. Is Low Electricity Cost Important?",
        subtitle: "Prioritize upfront purchase price or long-term energy savings.",
        inputType: "cards",
        options: [
          { id: "eff-highest", label: "YES — Highest Efficiency Inverter", description: "Lowest running cost & maximum energy savings", badge: "Max Savings" },
          { id: "eff-standard", label: "NO — Standard Preference", description: "Balanced purchase price and efficiency" },
          { id: "eff-lowest", label: "Lowest Purchase Price", description: "Fixed Speed entry-level price" }
        ]
      },
      {
        id: "rac-step-7",
        stepNumber: 7,
        title: "7. Customer Budget Tier?",
        subtitle: "Select preferred price tier for the equipment.",
        inputType: "cards",
        options: [
          { id: "budget-economy", label: "Economy Tier", description: "Entry-level window or standard split" },
          { id: "budget-medium", label: "Medium Tier", description: "Standard Inverter Split from leading brands" },
          { id: "budget-premium", label: "Premium Tier", description: "High-end Inverter with Smart Wi-Fi features" }
        ]
      },
      {
        id: "rac-step-8",
        stepNumber: 8,
        title: "8. Is High Ambient T3 (>50°C) Rating Required?",
        subtitle: "Essential for Middle East summer heat waves up to 52°C outdoor ambient.",
        inputType: "yesno",
        options: [
          { id: "t3-yes", label: "YES — T3 Tropical Rating Required", description: "Continuous cooling at >52°C outdoor heat", badge: "T3 Tropical" },
          { id: "t3-no", label: "NO — Standard T1 Rating", description: "Standard climate up to 43°C" }
        ]
      }
    ]
  },

  {
    id: "wf-chiller",
    name: "Chiller Units & Central Plants",
    slug: "chiller-units",
    description: "Decision tree for Air-Cooled & Water-Cooled Scroll, Screw, Centrifugal, and Absorption Chillers.",
    image: "/src/assets/images/hvac_chiller_1784350873395.jpg",
    badge: "COMMERCIAL / INDUSTRIAL",
    iconName: "Snowflake",
    targetCategory: "hvac-systems",
    steps: [
      {
        id: "chiller-step-1",
        stepNumber: 1,
        title: "1. What is the Application?",
        subtitle: "Select building or industrial process application.",
        inputType: "cards",
        options: [
          { id: "ch-comm", label: "Commercial Office Tower", description: "Centralized comfort cooling", iconName: "Building2" },
          { id: "ch-hotel", label: "Hotel / Resort", description: "24/7 continuous chilled water", iconName: "Hotel" },
          { id: "ch-hospital", label: "Hospital / Healthcare", description: "Critical temperature & humidity control", iconName: "Activity" },
          { id: "ch-process", label: "Industrial Process Cooling", description: "Factory / chemical process", iconName: "Factory" },
          { id: "ch-datacenter", label: "Data Center", description: "High density server rack cooling", iconName: "Server" },
          { id: "ch-mall", label: "Shopping Mall / Retail", description: "Large tonnage open spaces", iconName: "ShoppingBag" }
        ]
      },
      {
        id: "chiller-step-2",
        stepNumber: 2,
        title: "2. Where Will the Chiller Be Installed?",
        subtitle: "Select physical plant installation environment.",
        inputType: "cards",
        options: [
          { id: "loc-indoor", label: "Indoor Machine Room", description: "Enclosed plant room basement" },
          { id: "loc-outdoor", label: "Outdoor Open Area", description: "Ground yard installation" },
          { id: "loc-rooftop", label: "Rooftop Deck", description: "Compact footprint installation" },
          { id: "loc-coastal", label: "Corrosive / Coastal Area", description: "Marine grade anti-corrosion protection" }
        ]
      },
      {
        id: "chiller-step-3",
        stepNumber: 3,
        title: "3. Required Cooling Capacity Range?",
        subtitle: "Select required total cooling load in Tons of Refrigeration (TR).",
        inputType: "cards",
        options: [
          { id: "cap-50", label: "Up to 50 TR (176 kW)", capacityKwMultiplier: 176 },
          { id: "cap-150", label: "50 – 150 TR (176 – 528 kW)", capacityKwMultiplier: 528 },
          { id: "cap-300", label: "150 – 300 TR (528 – 1055 kW)", capacityKwMultiplier: 1055 },
          { id: "cap-600", label: "300 – 600 TR (1055 – 2110 kW)", capacityKwMultiplier: 2110 },
          { id: "cap-1000", label: "600 – 1000 TR (2110 – 3517 kW)", capacityKwMultiplier: 3517 },
          { id: "cap-1000-plus", label: "Above 1000 TR (Above 3517 kW)", capacityKwMultiplier: 5000 }
        ]
      },
      {
        id: "chiller-step-4",
        stepNumber: 4,
        title: "4. Condenser Cooling Medium?",
        subtitle: "Do you have access to a cooling tower or water source for heat rejection?",
        inputType: "yesno",
        options: [
          { id: "cond-water", label: "YES — Water Cooled (Cooling Tower)", description: "Select Water Cooled Screw / Centrifugal", badge: "Highest Efficiency" },
          { id: "cond-air", label: "NO — Air Cooled (Ambient Air)", description: "Select Air Cooled Scroll / Screw" }
        ]
      }
    ]
  },

  {
    id: "wf-fcu",
    name: "Fan Coil Units (FCU)",
    slug: "fan-coil-units",
    description: "Decision tree for Wall Mounted, Concealed Ducted, Cassette, and Floor Standing FCUs.",
    image: "/src/assets/images/hvac_coils_1784350888537.jpg",
    badge: "HYDRONIC TERMINAL",
    iconName: "Droplet",
    targetCategory: "hvac-systems",
    steps: [
      {
        id: "fcu-step-1",
        stepNumber: 1,
        title: "1. Installation Environment?",
        subtitle: "Where will the FCU terminal unit be installed?",
        displayMode: "image",
        inputType: "cards",
        options: [
          { 
            id: "fcu-wall", 
            label: "Wall Mounted FCU", 
            description: "Exposed architectural wall installation",
            image: "/src/assets/images/hvac_air_conditioner_1784350824930.jpg"
          },
          { 
            id: "fcu-cassette", 
            label: "Cassette FCU", 
            description: "Recessed in false ceiling grid",
            image: "/src/assets/images/hvac_hero_banner_1784350809012.jpg"
          },
          { 
            id: "fcu-ducted", 
            label: "Ducted Concealed FCU", 
            description: "Behind grille / ceiling plenum",
            image: "/src/assets/images/hvac_coils_1784350888537.jpg"
          },
          { 
            id: "fcu-floor", 
            label: "Floor Standing FCU", 
            description: "Floor cabinet installation",
            image: "/src/assets/images/hvac_pipes_1784350907486.jpg"
          }
        ]
      },
      {
        id: "fcu-step-2",
        stepNumber: 2,
        title: "2. Hydronic Piping System?",
        subtitle: "Select chilled water piping configuration.",
        inputType: "cards",
        options: [
          { id: "pipe-2", label: "2-Pipe System", description: "Single coil for cooling or heating changeover" },
          { id: "pipe-4", label: "4-Pipe System", description: "Separate cooling & heating coils for simultaneous control", badge: "Simultaneous Control" }
        ]
      }
    ]
  },

  {
    id: "wf-rooftop",
    name: "Rooftop Package AC Units",
    slug: "rooftop-package",
    description: "Decision tree for Heavy-Duty Packaged Rooftop Climate Systems.",
    image: "/src/assets/images/hvac_hero_banner_1784350809012.jpg",
    badge: "ALL-IN-ONE COMPACT",
    iconName: "Shield",
    targetCategory: "air-conditioners",
    steps: [
      {
        id: "rt-step-1",
        stepNumber: 1,
        title: "1. Building Built-Up Area?",
        subtitle: "Select area to determine required tonnage.",
        inputType: "cards",
        options: [
          { id: "rt-500", label: "Up to 500 m² (170 TR)", capacityKwMultiplier: 600 },
          { id: "rt-1000", label: "500 – 1000 m² (340 TR)", capacityKwMultiplier: 1200 },
          { id: "rt-2000", label: "1000 – 2000 m² (680 TR)", capacityKwMultiplier: 2400 },
          { id: "rt-4000", label: "Above 2000 m² (1360+ TR)", capacityKwMultiplier: 4800 }
        ]
      },
      {
        id: "rt-step-2",
        stepNumber: 2,
        title: "2. Is Roof Space Available for Installation?",
        subtitle: "Flat roof with adequate load-bearing structural strength.",
        inputType: "yesno",
        options: [
          { id: "rt-roof-yes", label: "YES — Roof Space Available", description: "Proceed with Rooftop Packaged Unit" },
          { id: "rt-roof-no", label: "NO — No Roof Access", description: "Redirect to VRF or Chilled Water System" }
        ]
      }
    ]
  },

  {
    id: "wf-ducted-split",
    name: "Ducted Split AC Systems",
    slug: "ducted-split",
    description: "Decision tree for concealed duct split units with custom static pressure and zoning dampers.",
    image: "/src/assets/images/hvac_compressor_1784350840924.jpg",
    badge: "CONCEALED COOLING",
    iconName: "Layers",
    targetCategory: "air-conditioners",
    steps: [
      {
        id: "ds-step-1",
        stepNumber: 1,
        title: "1. Ceiling Plenum Space Available?",
        subtitle: "Select available clearance height in ceiling.",
        inputType: "cards",
        options: [
          { id: "ds-slim", label: "Limited Space (< 300 mm)", description: "Low Profile Slim Ducted Unit" },
          { id: "ds-std", label: "Standard Space (300 – 450 mm)", description: "Standard Ducted Unit (Medium Static)" },
          { id: "ds-high", label: "High Plenum (> 450 mm)", description: "High Static Ducted Unit", badge: "High Static ESP" }
        ]
      },
      {
        id: "ds-step-2",
        stepNumber: 2,
        title: "2. Is Individual Room Zoning Required?",
        subtitle: "Multi-zone damper control with smart room thermostats.",
        inputType: "yesno",
        options: [
          { id: "ds-zone-yes", label: "YES — Individual Room Zoning", description: "Multi-Zone kit with motorized dampers", badge: "Zone Dampers" },
          { id: "ds-zone-no", label: "NO — Centralized Single Zone", description: "Standard central thermostat controller" }
        ]
      }
    ]
  },

  {
    id: "wf-vrf",
    name: "VRF (Variable Refrigerant Flow)",
    slug: "vrf-systems",
    description: "Decision tree for multi-zone VRF / VRV systems connecting multiple indoor units to central outdoor modular blocks.",
    image: "/src/assets/images/hvac_pipes_1784350907486.jpg",
    badge: "ULTRA EFFICIENT",
    iconName: "Zap",
    targetCategory: "air-conditioners",
    steps: [
      {
        id: "vrf-step-1",
        stepNumber: 1,
        title: "1. How Many Indoor Units Are Required?",
        subtitle: "Select total number of conditioned rooms/zones.",
        inputType: "cards",
        options: [
          { id: "vrf-mini", label: "2 – 5 Units (Mini VRF)", description: "Residential / Small Office", capacityKwMultiplier: 25 },
          { id: "vrf-small", label: "6 – 15 Units (Small VRF)", description: "Medium commercial floor", capacityKwMultiplier: 75 },
          { id: "vrf-med", label: "16 – 30 Units (Medium VRF)", description: "Corporate building", capacityKwMultiplier: 180 },
          { id: "vrf-large", label: "31 – 64 Units (Large VRF)", description: "Hotel / Hospital", capacityKwMultiplier: 380 },
          { id: "vrf-super", label: "Above 64 Units (Modular VRF Block)", description: "Mega tower development", capacityKwMultiplier: 760 }
        ]
      },
      {
        id: "vrf-step-2",
        stepNumber: 2,
        title: "2. Control & Energy Billing Requirement?",
        subtitle: "Individual tenant power allocation and BACnet BMS integration.",
        inputType: "cards",
        options: [
          { id: "vrf-ctrl-bms", label: "BMS / BACnet Integration", description: "Central building management system gateway", badge: "BACnet Gateway" },
          { id: "vrf-ctrl-wifi", label: "Wi-Fi Cloud Control", description: "Mobile App multi-zone management" },
          { id: "vrf-ctrl-billing", label: "Tenant Power Billing", description: "Individual power consumption calculation" }
        ]
      }
    ]
  }
];
