import { ReviewItem } from "../types/review";

export const INITIAL_REVIEWS: ReviewItem[] = [
  // Homepage Reviews
  {
    id: "rev-hp-1",
    authorName: "Mohamed Moled",
    authorRole: "Procurement Manager",
    location: "UAE",
    rating: 5,
    comment: "Great service from Cool Technologies. The new AC unit purchased for the office has met all my expectations. Branded, quality product and the rate is pretty good compared to the market price. Yes again, they have a nice sales and support team too.",
    target: "homepage",
    status: "approved",
    createdAt: "2026-07-20T10:00:00Z",
    verifiedBooking: true
  },
  {
    id: "rev-hp-2",
    authorName: "Muhammad Fazith",
    authorRole: "Commercial Buyer",
    location: "UAE",
    rating: 5,
    comment: "If you are looking for efficient and reliable air coolers at affordable prices, I recommend the refrigeration systems from Cool Technologies. They sell branded products with variable capacities and features like auto-swing louvers, honeycomb cooling, auto-drain function etc.",
    target: "homepage",
    status: "approved",
    createdAt: "2026-07-22T14:30:00Z",
    verifiedBooking: true
  },
  
  // Service Directory Reviews
  {
    id: "rev-svc-1",
    authorName: "Tariq Al Mansoori",
    authorRole: "Facility Director",
    location: "Dubai Marina Heights, UAE",
    rating: 5,
    comment: "We contracted Cool Technologies for deep chemical foam cleaning across 45 residential units. The cooling output improved immediately and air odor completely vanished. Extremely punctual and clean work with floor protection mats used throughout.",
    target: "service",
    serviceTitle: "AC Deep Chemical Cleaning & Sanitization",
    status: "approved",
    createdAt: "2026-07-18T09:15:00Z",
    verifiedBooking: true
  },
  {
    id: "rev-svc-2",
    authorName: "Sarah Jenkins",
    authorRole: "Villa Resident",
    location: "Saadiyat Island, Abu Dhabi",
    rating: 5,
    comment: "During peak July heat, our water tank was reaching unlivable temperatures. Cool Technologies installed a 3 Ton tank chiller within 24 hours of my call. The water temperature is now a refreshing 22°C continuously. Outstanding service!",
    target: "service",
    serviceTitle: "Water Tank Chiller Installation & Servicing",
    status: "approved",
    createdAt: "2026-07-12T11:45:00Z",
    verifiedBooking: true
  },
  {
    id: "rev-svc-3",
    authorName: "Vikram Patel",
    authorRole: "Senior Operations Lead",
    location: "JAFZA Logistics Hub, Dubai",
    rating: 5,
    comment: "Their sheet metal engineering team fabricated custom PI ducts for our 12,000 sq ft logistics office with precision. Anemometer balancing reports were provided upon completion showing uniform airflow in every zone.",
    target: "service",
    serviceTitle: "GI / Pre-Insulated Duct Fabrication & Air Balancing",
    status: "approved",
    createdAt: "2026-06-29T16:20:00Z",
    verifiedBooking: true
  },
  {
    id: "rev-svc-4",
    authorName: "Ahmed Hassan",
    authorRole: "Hotel Maintenance Manager",
    location: "Business Bay, Dubai",
    rating: 5,
    comment: "Our rooftop chiller package unit tripped at 2:00 AM on a Friday night. Their mobile emergency van arrived in under 45 minutes, replaced a faulty contactor & capacitor, and restored full cooling before guest disruption occurred.",
    target: "service",
    serviceTitle: "24/7 Emergency AC Repair & Diagnostics",
    status: "approved",
    createdAt: "2026-06-21T02:40:00Z",
    verifiedBooking: true
  },
  {
    id: "rev-svc-5",
    authorName: "Elena Rostova",
    authorRole: "General Manager",
    location: "Downtown Dubai",
    rating: 5,
    comment: "Regular descaling and seal maintenance by Cool Technologies has kept our restaurant walk-in freezer running at -18°C reliably without ice buildup. Highly trustworthy team for commercial food safety compliance.",
    target: "service",
    serviceTitle: "Cold Room & Ice Machine Maintenance",
    status: "approved",
    createdAt: "2026-06-14T13:10:00Z",
    verifiedBooking: true
  },
  {
    id: "rev-svc-6",
    authorName: "Marcus Vance",
    authorRole: "MEP Project Manager",
    location: "Yas Island, Abu Dhabi",
    rating: 5,
    comment: "We renewed our annual PPM contract for the 3rd year with Cool Technologies. Their digital inspection logs and quarterly preventive checks have reduced breakdown calls by over 80%. Top tier HVAC partner in the region.",
    target: "service",
    serviceTitle: "Annual Maintenance Contracts (AMC & PPM)",
    status: "approved",
    createdAt: "2026-05-30T10:00:00Z",
    verifiedBooking: true
  }
];
