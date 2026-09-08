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

export const SERVICES: ServiceItem[] = [
  {
    id: "ac-cleaning",
    category: "cleaning",
    title: "AC Deep Chemical Cleaning & Sanitization",
    tagline: "Eco-friendly antibacterial deep foam wash & coil restoration",
    description: "Comprehensive high-pressure antibacterial chemical wash for indoor fan coils, outdoor condenser units, blower wheels, and drainage trays. Eliminates mold, dust buildup, odors, and restores cooling efficiency by up to 30%.",
    iconName: "Sparkles",
    features: [
      "Indoor Fan Coil Chemical Pressure Washing",
      "Outdoor Condenser Jet Cleaning & Fins Alignment",
      "Antibacterial Fogging & Mold Eradication Treatment",
      "Drainage Line High-Pressure Flush & Anti-Clogging Tablets",
      "Washable Air Filters Deep Sanitization"
    ],
    specs: {
      sla: "Same-Day / 24-Hour Dispatch",
      warranty: "30-Day Service Guarantee",
      targetAudience: "Villas, Apartments, Offices & Retail Outlets",
      certifiedFor: "All Split, Cassette, Ducted & Package Units"
    },
    image: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: "ac-installation",
    category: "installation",
    title: "AC System Installation & Commissioning",
    tagline: "Precision OEM-standard mounting, copper piping & testing",
    description: "Turnkey installation of Split ACs, Ducted Mini-Splits, Cassette Units, VRF multi-zone systems, and Package Units. Performed strictly according to manufacturer specifications with nitrogen pressure testing and vacuum dehydration.",
    iconName: "Wrench",
    features: [
      "Rigorous Site Load & Electrical Capacity Verification",
      "Insulated Copper Refrigerant Line Piping",
      "Nitrogen Pressure Leak Testing (24-Hour Hold)",
      "Vacuum Evacuation & Precision Gas Charging",
      "Air Velocity Balancing & Digital Commissioning Log"
    ],
    specs: {
      sla: "Scheduled Within 48 Hours",
      warranty: "1-Year Workmanship Warranty",
      targetAudience: "Residential & Commercial Developments",
      certifiedFor: "Daikin, Carrier, Midea, York, LG & O General"
    },
    image: "https://images.unsplash.com/photo-1581094288338-2314dddb7ece?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: "amc-maintenance",
    category: "maintenance",
    title: "Annual Maintenance Contracts (AMC & PPM)",
    tagline: "Scheduled quarterly preventive checks & emergency response",
    description: "Customized Planned Preventive Maintenance (PPM) packages for commercial towers, residential compounds, hotels, and industrial facilities. Includes regular mechanical inspections, zero labor charges for emergency breakdowns, and priority response.",
    iconName: "RefreshCw",
    features: [
      "Scheduled Quarterly Comprehensive Preventive Maintenance",
      "24/7 Priority Breakdown Emergency Response SLA",
      "Free Labor on All Routine Mechanical & Electrical Repairs",
      "Refrigerant Level Monitoring & Pressure Audits",
      "Detailed Digital Asset Health & SLA Inspection Reports"
    ],
    specs: {
      sla: "2-Hour Emergency Breakdown SLA",
      warranty: "Continuous Annual Coverage",
      targetAudience: "Hotels, Malls, Towers & Villa Estates",
      certifiedFor: "Full Building HVAC Infrastructure"
    },
    image: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: "emergency-repair",
    category: "maintenance",
    title: "24/7 Emergency AC Repair & Diagnostics",
    tagline: "Rapid response diagnostics for sudden cooling failures & tripping",
    description: "Immediate emergency response for compressor tripping, refrigerant leaks, PCB control board errors, capacitor failures, and fan motor burnt-outs. Our mobile service vans carry genuine OEM spare parts for fast resolution.",
    iconName: "Zap",
    features: [
      "24/7 On-Call Emergency Technical Response",
      "Electronic Refrigerant Gas Leak Detection & Repair",
      "Compressor Replacement & Oil Flushing",
      "PCB Control Board Diagnostics & Soldering",
      "Thermostat Calibration & Sensor Replacements"
    ],
    specs: {
      sla: "Under 2 Hours Response in Urban Zones",
      warranty: "90-Day Parts & Workmanship Warranty",
      targetAudience: "Urgent Residential & Business Needs",
      certifiedFor: "OEM Direct Certified Spare Parts"
    },
    image: "https://images.unsplash.com/photo-1621905252507-b35492cc74b4?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: "water-tank-chiller",
    category: "chillers",
    title: "Water Tank Chiller Installation & Servicing",
    tagline: "Heavy-duty tank cooling for GCC summer temperature control",
    description: "Specialized installation, gas refilling, compressor servicing, and descaling for residential and commercial water tank chillers. Keeps domestic water supply at a comfortable, safe 20°C to 25°C even during extreme peak summer heats.",
    iconName: "Droplet",
    features: [
      "High-Efficiency Tank Chiller Installation",
      "Titanium / Stainless Steel Heat Exchanger Descaling",
      "Water Circulation Pump Overhaul & Replacement",
      "Digital Waterproof Thermostat Calibration",
      "Anti-Freeze Thermostat Protection Setup"
    ],
    specs: {
      sla: "24 to 48 Hours Turnaround",
      warranty: "1-Year Equipment & Install Warranty",
      targetAudience: "Private Villas, Hotels & Worker Camps",
      certifiedFor: "1.5 Ton to 10 Ton Tank Chillers"
    },
    image: "https://images.unsplash.com/photo-1542013936693-884638332954?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: "duct-ventilation",
    category: "ducting",
    title: "GI / Pre-Insulated Duct Fabrication & Air Balancing",
    tagline: "Custom duct fabrication, insulation, air balancing & HEPA filtration",
    description: "End-to-end air distribution engineering including Galvanized Iron (GI) or Pre-Insulated Panel (PI) duct design, fabrication, acoustic lining, air volume balancing, and HEPA filter assembly for clean indoor air quality.",
    iconName: "Wind",
    features: [
      "Custom CNC Sheet Metal & PI Panel Duct Fabrication",
      "Acoustic & Thermal Insulation (Fiberglass / Nitrile)",
      "Robotic Video Inspection & Duct Cleaning",
      "Air Velocity & Anemometer Flow Balancing",
      "Fresh Air Handling Unit (FAHU) Integration"
    ],
    specs: {
      sla: "Project Based Timeline",
      warranty: "2-Year Structural Duct Warranty",
      targetAudience: "Commercial Kitchens, Hospitals & Factories",
      certifiedFor: "SMACNA & ASHRAE Standards"
    },
    image: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: "cold-room-ice-machine",
    category: "chillers",
    title: "Cold Room & Ice Machine Maintenance",
    tagline: "Sub-zero refrigeration repairs & commercial freezer tuning",
    description: "Specialized maintenance for commercial ice cube machines, walk-in chillers, cold storage rooms, and blast freezers. Includes polyurethane panel sealing, defrost timer calibration, and eco-refrigerant top-ups.",
    iconName: "Snowflake",
    features: [
      "Walk-In Chiller & Freezer Door Seal Replacement",
      "Evaporator Fan Motor & Defrost Heater Diagnostics",
      "Ice Cube Machine Condenser Descaling & Sanitization",
      "Sub-Zero Compressor Overhauls (R404a / R410a)",
      "Digital Temperature Data Logging Setup"
    ],
    specs: {
      sla: "4-Hour Emergency Response",
      warranty: "6-Month Service Warranty",
      targetAudience: "Supermarkets, Restaurants & Fisheries",
      certifiedFor: "HACCP Food Safety Standards"
    },
    image: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: "industrial-chiller-plant",
    category: "chillers",
    title: "Industrial Chiller Plant Retrofitting & Overhaul",
    tagline: "Large-capacity air-cooled & water-cooled centrifugal chiller overhauls",
    description: "Full mechanical overhauls for central chiller plants, condenser tube mechanical brushing, chiller oil analysis, refrigerant recovery, and PLC control panel upgrades for high-tonnage industrial installations.",
    iconName: "Thermometer",
    features: [
      "Condenser & Evaporator Tube Mechanical Brushing",
      "Spectrographic Compressor Oil & Moisture Testing",
      "VFD Inverter Drive Retrofitting for Energy Savings",
      "Refrigerant Recovery & Environmental Disposal",
      "BMS Integration & Remote Fault Telemetry"
    ],
    specs: {
      sla: "Scheduled Maintenance Window",
      warranty: "1-Year Plant Workmanship Warranty",
      targetAudience: "High-Rise Towers, Malls & Factories",
      certifiedFor: "Centrifugal, Screw & Scroll Chillers"
    },
    image: "https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: "vrf-system-servicing",
    category: "maintenance",
    title: "VRF / VRV Multi-Zone System Maintenance",
    tagline: "Variable Refrigerant Flow diagnostics, inverter PCB tuning & coil care",
    description: "Specialized servicing for multi-zone VRF/VRV central AC systems. Features computer diagnostics for electronic expansion valves, inverter PCB control boards, subcooling calibrations, and oil return cycle optimization.",
    iconName: "RefreshCw",
    features: [
      "Electronic Expansion Valve (EEV) Calibration",
      "Inverter Compressor Phase & Amperage Testing",
      "Centralized Touch Controller Programming",
      "Branch Selector (BS) Box Leak & Valve Inspection",
      "Refrigerant R410a / R32 Auto-Charging & Balancing"
    ],
    specs: {
      sla: "Same-Day Technical Dispatch",
      warranty: "180-Day Diagnostics Warranty",
      targetAudience: "Luxury Villas, Hotels & Office Complexes",
      certifiedFor: "Daikin VRV, Mitsubishi Electric & LG Multi V"
    },
    image: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: "indoor-air-quality",
    category: "cleaning",
    title: "Indoor Air Quality & Duct Microbiological Sanitization",
    tagline: "UV-C light installation, HEPA scrubbing & antibacterial fogging",
    description: "Comprehensive air purity enhancement for commercial and residential spaces. Includes robotic video inspection inside air ducts, HEPA filtration scrubbing, UV-C germicidal light installation, and eco-friendly fogging.",
    iconName: "Sparkles",
    features: [
      "Robotic Video Duct Inspection & Contaminant Audit",
      "HEPA Air Scrubber Negative Air Pressure Extraction",
      "German Bio-Safe Antibacterial Aerosol Fogging",
      "UV-C Germicidal Air Sanitizer Lamp Retrofitting",
      "Post-Cleaning Air Particle Count Certification"
    ],
    specs: {
      sla: "Scheduled Booking Within 24 Hours",
      warranty: "6-Month Air Purity Guarantee",
      targetAudience: "Hospitals, Schools, Daycares & Residences",
      certifiedFor: "NADCA & World Health Air Guidelines"
    },
    image: "https://images.unsplash.com/photo-1581094288338-2314dddb7ece?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: "compressor-overhaul",
    category: "maintenance",
    title: "Heavy Compressor Overhaul & Motor Rewinding",
    tagline: "Precision re-machining, valve plate replacement & stator rewinding",
    description: "Complete repair and remanufacturing center for semi-hermetic, scroll, and screw compressors. We perform precision crankshaft grinding, valve plate swapping, coil stator rewinding, and nitrogen leak pressure testing.",
    iconName: "Wrench",
    features: [
      "Semi-Hermetic & Screw Compressor Disassembly",
      "High-Class H Stator Motor Coil Rewinding",
      "Suction & Discharge Valve Plate Replacement",
      "Synthetic Compressor Oil Flush & Dehydration",
      "Dynamometer Load & Amperage Test Bench Benchmarking"
    ],
    specs: {
      sla: "3 to 5 Days Shop Turnaround",
      warranty: "1-Year Remanufacturer Warranty",
      targetAudience: "Industrial Plants, Cold Storage & MEP Firms",
      certifiedFor: "Copeland, Bitzer, Carrier Carlyle & Trane"
    },
    image: "https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: "fahu-ahu-servicing",
    category: "installation",
    title: "Fresh Air Handling Unit (FAHU & AHU) Overhaul",
    tagline: "Heat recovery wheel servicing, belt alignment & fan assembly",
    description: "Turnkey maintenance and installation of Fresh Air Handling Units (FAHU) and Air Handling Units (AHU). Includes thermal energy recovery wheel restoration, V-belt tensioning, coil descaling, and motorized damper testing.",
    iconName: "Wind",
    features: [
      "Enthalpy Energy Recovery Wheel Cleaning & Drive Belt Fix",
      "Primary, Secondary & HEPA Filter Replacement",
      "Centrifugal Blower Motor Bearing Lubrication",
      "Chilled Water Modulating Control Valve Calibration",
      "Condensate Drain Pan Stainless Steel Refurbishment"
    ],
    specs: {
      sla: "Scheduled Shutdown Service",
      warranty: "1-Year Service Warranty",
      targetAudience: "Commercial Buildings, Malls & Cleanrooms",
      certifiedFor: "Eurovent & AHRI Certified AHUs"
    },
    image: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: "kitchen-exhaust-degreasing",
    category: "ducting",
    title: "Commercial Kitchen Hood & Exhaust Duct Degreasing",
    tagline: "Heavy-duty grease removal, fire-hazard prevention & ecology unit care",
    description: "NFPA-96 compliant deep degreasing for commercial kitchen exhaust hoods, vertical risers, roof fans, and electrostatic precipitator (ESP) ecology units. Prevents kitchen fire risks and maintains municipality hygiene compliance.",
    iconName: "Wind",
    features: [
      "Caustic Chemical Foam Spray & Steam Scraping",
      "Exhaust Fan Belt, Impeller & Housing Degreasing",
      "Electrostatic Precipitator (ESP) Cell Washing",
      "Access Panel Installation on Vertical Duct Risers",
      "Certificate of Compliance for Civil Defense Audits"
    ],
    specs: {
      sla: "Night Shift Execution Available",
      warranty: "Compliance Certificate Included",
      targetAudience: "Restaurants, Hotel Kitchens & Food Courts",
      certifiedFor: "UAE Civil Defense & Municipality Standards"
    },
    image: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: "smart-thermostat-bms",
    category: "installation",
    title: "Smart Thermostat & BMS Automation Retrofitting",
    tagline: "BACnet / Modbus protocol integration & mobile app climate controls",
    description: "Upgrade legacy manual thermostats to smart Wi-Fi / BACnet digital controllers. Enables remote scheduling, energy consumption tracking, occupancy sensing, and seamless integration into Building Management Systems (BMS).",
    iconName: "Zap",
    features: [
      "Smart Digital Thermostat Mounting & Wiring",
      "Modbus / BACnet BMS Gateway Configuration",
      "Mobile App Remote Monitoring Setup",
      "Multi-Stage Compressor & Fan Speed Tuning",
      "Occupancy Sensor Energy Saving Schedules"
    ],
    specs: {
      sla: "Same-Day Installation",
      warranty: "2-Year Hardware & Install Warranty",
      targetAudience: "Offices, Commercial Spaces & Smart Homes",
      certifiedFor: "Honeywell, Nest, Ecobee & Schneider BMS"
    },
    image: "https://images.unsplash.com/photo-1621905252507-b35492cc74b4?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: "refrigerant-recovery",
    category: "cleaning",
    title: "Eco Refrigerant Gas Recovery & Pressure Flushing",
    tagline: "EPA-certified refrigerant recovery, vacuum drying & oil separation",
    description: "Eco-friendly recovery of R22, R410a, R134a, and R32 refrigerants during major repairs. Includes solvent flushing of contaminated copper piping after motor burnouts to protect new compressor lifespans.",
    iconName: "Droplet",
    features: [
      "Closed-Loop EPA Refrigerant Recovery Machine Usage",
      "Rx11-Flush Solvent Line Pressure Washing",
      "Double-Stage Vacuum Evacuation Below 500 Microns",
      "Filter Drier Replacement & Moisture Indicator Check",
      "Exact Weight Refrigerant Gas Re-Charging"
    ],
    specs: {
      sla: "24-Hour Dispatch",
      warranty: "100% Leak-Free Guarantee",
      targetAudience: "Commercial Chillers, Supermarkets & Offices",
      certifiedFor: "R410A, R134A, R407C, R32 & R404A"
    },
    image: "https://images.unsplash.com/photo-1542013936693-884638332954?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: "anti-corrosion-coil-coating",
    category: "cleaning",
    title: "Anti-Corrosion Hydrophilic Coil Coating Application",
    tagline: "Specialized coastal protective coating for severe salt & humidity protection",
    description: "Application of polyurethane anti-corrosion barrier coatings (Blygold / Heresite OEM equivalent) on cooling coils operating near coastal areas. Extends coil lifespan by up to 300% in high-salinity GCC marine climates.",
    iconName: "Sparkles",
    features: [
      "Chemical Degreasing & Coil Oxidation Stripping",
      "High-Durability Spray Application of Protective Barrier",
      "Hydrophilic Finish for Fast Condensate Water Shedding",
      "Non-Insulating Thermal Transfer Preservation Formula",
      "Salt Spray Corrosion Resistance Certified (3000+ Hours)"
    ],
    specs: {
      sla: "Shop Coating or On-Site Application",
      warranty: "3-Year Corrosion Warranty",
      targetAudience: "Coastal Resorts, Seafront Villas & Marine Assets",
      certifiedFor: "Blygold & Heresite Grade Protective Standards"
    },
    image: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: "cooling-tower-servicing",
    category: "chillers",
    title: "Cooling Tower Cleaning & Water Chemical Treatment",
    tagline: "PVC drift eliminator descaling, basin cleaning & Legionella prevention",
    description: "Preventive maintenance for induced-draft and forced-draft cooling towers. Includes PVC fill pack descaling, basin sludge flushing, mechanical fan drive alignment, and biological Legionella water disinfection.",
    iconName: "Thermometer",
    features: [
      "Cooling Tower Basin Sludge Extraction & Disinfection",
      "PVC Fill Media Descaling & Replacement Panels",
      "Biocide & Anti-Scale Chemical Dosing System Tuning",
      "Fan Shaft Pulley Alignment & Gearbox Oil Change",
      "Legionella Water Quality Testing & Compliance Certification"
    ],
    specs: {
      sla: "Scheduled Maintenance Window",
      warranty: "Water Quality Compliance Guarantee",
      targetAudience: "District Cooling Plants, Hospitals & Factories",
      certifiedFor: "Baltimore Aircoil, Marley & Evapco"
    },
    image: "https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: "chilled-water-pump-overhaul",
    category: "chillers",
    title: "Chilled Water Circulation Pump Repair & Balancing",
    tagline: "Mechanical seal replacement, laser shaft alignment & impeller balancing",
    description: "Overhaul services for primary and secondary chilled water pumps. Includes silicon carbide mechanical seal replacement, SKF bearing replacement, dynamic impeller balancing, and laser shaft alignment.",
    iconName: "Droplet",
    features: [
      "In-Line & End-Suction Centrifugal Pump Disassembly",
      "Silicon-Carbide Mechanical Seal & Gasket Replacement",
      "PrecisionSKF / NSK Bearing Press Fitting",
      "Laser Optical Shaft & Pulley Alignment",
      "Vibration & Noise Harmonic Frequency Audit"
    ],
    specs: {
      sla: "24 to 48 Hours Emergency Service",
      warranty: "1-Year Pump Overhaul Warranty",
      targetAudience: "Central HVAC Systems & High-Rise Buildings",
      certifiedFor: "Grundfos, Wilo, Armstrong & Bell & Gossett"
    },
    image: "https://images.unsplash.com/photo-1542013936693-884638332954?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: "sound-attenuator-install",
    category: "ducting",
    title: "Acoustic Duct Sound Attenuator & Noise Control",
    tagline: "Custom duct silencer fabrication for low decibel HVAC operation",
    description: "Acoustic noise reduction engineering for HVAC air supply and return ducts. We design, build, and install custom duct silencers, sound attenuators, and anti-vibration spring isolators to eliminate motor hums and airflow noise.",
    iconName: "Wind",
    features: [
      "Acoustic Noise Frequency Spectrum Audit",
      "Custom Dissipative Duct Silencer Fabrication",
      "Perforated Galvanized Steel Baffle Panels",
      "Anti-Vibration Spring Hangers & Flexible Canvas Joints",
      "Post-Installation Decibel (dB) Sound Testing"
    ],
    specs: {
      sla: "Custom Project Turnaround",
      warranty: "2-Year Acoustic Performance Warranty",
      targetAudience: "Cinemas, Sound Studios, Offices & Residential",
      certifiedFor: "ISO 7235 & ASHRAE Acoustic Guidelines"
    },
    image: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: "energy-audit-thermal",
    category: "maintenance",
    title: "HVAC Energy Performance Auditing & Thermal Imaging",
    tagline: "FLIR infrared thermography, duct leak testing & energy saving reports",
    description: "Certified energy engineering audit for commercial and industrial cooling plants. Uses FLIR infrared thermal cameras to detect insulation loss, duct air leaks, short-cycling, and power factor inefficiencies.",
    iconName: "Zap",
    features: [
      "FLIR Thermal Infrared Envelope & Duct Inspection",
      "Duct Leakage Testing (Duct Blaster Pressure Rig)",
      "Compressor EER / COP Efficiency Calculations",
      "ROI Energy Saving Retrofit Recommendation Roadmap",
      "DEWA / ADDC Utility Billing Optimization Analysis"
    ],
    specs: {
      sla: "Complete Audit in 3 Business Days",
      warranty: "Guaranteed ROI Identification Report",
      targetAudience: "Facility Managers, Commercial Buildings & Hotels",
      certifiedFor: "ASHRAE Level 1, 2 & 3 Energy Audits"
    },
    image: "https://images.unsplash.com/photo-1621905252507-b35492cc74b4?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: "cassette-ac-servicing",
    category: "cleaning",
    title: "Ceiling Cassette & Concealed Split AC Tune-Up",
    tagline: "Drainage pump flushing, 4-way louver alignment & coil washing",
    description: "Specialized maintenance for recessed 4-way ceiling cassette units and concealed ducted splits. Includes built-in condensate drain pump testing, floating switch verification, filter washing, and coil sanitization.",
    iconName: "Sparkles",
    features: [
      "4-Way Airflow Auto-Louver Servo Motor Calibration",
      "Internal Submersible Drain Pump Disassembly & Flush",
      "Float Safety Switch Water Overflow Audit",
      "Deep Antibacterial Coil Wash & Mold Treatment",
      "Wireless Infrared Remote Controller Tuning"
    ],
    specs: {
      sla: "Same-Day Dispatch",
      warranty: "30-Day Service Guarantee",
      targetAudience: "Showrooms, Offices, Restaurants & Luxury Homes",
      certifiedFor: "All Brands Ceiling Cassette Units"
    },
    image: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: "package-unit-replacement",
    category: "installation",
    title: "Rooftop Package Unit Replacement & Crane Rigging",
    tagline: "Turnkey rooftop AC replacement, curb adapter fitment & crane ops",
    description: "Full replacement of obsolete rooftop package units. Includes crane rigging logistics, custom sheet metal curb adapter fabrication, gas piping, and complete electrical tie-in with zero downtime for business operations.",
    iconName: "Wrench",
    features: [
      "Rigging & Heavy Mobile Crane Permitting Logistics",
      "Custom Galvanized Roof Curb Transition Fabrication",
      "Heavy Duty Vibration Isolation Pad Fitting",
      "High-Amperage Circuit Breaker & Electrical Cable Tie-In",
      "Safety Interlock & Air Volume Testing"
    ],
    specs: {
      sla: "48-Hour Weekend Execution Option",
      warranty: "1-Year Installation & Crane Operations Warranty",
      targetAudience: "Warehouses, Retail Malls & Industrial Plants",
      certifiedFor: "Carrier, York, Trane, Zamil & Rheem Package Units"
    },
    image: "https://images.unsplash.com/photo-1581094288338-2314dddb7ece?auto=format&fit=crop&w=800&q=80"
  }
];

