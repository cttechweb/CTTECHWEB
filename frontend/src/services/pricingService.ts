/* ─────────────────────────────────────────────────────────────────
   Cool Technologies — Pricing Service
   Centralized B2B pricing, wholesale discounts, and tax calculations
───────────────────────────────────────────────────────────────── */

export const UAE_STANDARD_VAT_RATE = 0.05; // 5% UAE VAT

export const TIER_DISCOUNT_RATES = {
  Standard: 0.0,
  Silver: 0.05,    // 5% discount
  Gold: 0.10,      // 10% discount
  Platinum: 0.15,  // 15% discount
  Retailer: 0.10,  // Verified contractor / retailer base discount
};

export interface PricingCalculationResult {
  basePrice: number;
  discountRate: number;
  unitPriceAfterDiscount: number;
  quantity: number;
  subtotal: number;
  vatAmount: number;
  totalWithVat: number;
}

/**
 * Calculates B2B price with tier discounts and VAT
 */
export function calculateItemPricing(
  basePrice: number,
  quantity: number,
  tier: keyof typeof TIER_DISCOUNT_RATES | string = "Standard",
  isVerifiedRetailer: boolean = false
): PricingCalculationResult {
  let discountRate = 0;

  if (isVerifiedRetailer) {
    discountRate = TIER_DISCOUNT_RATES.Retailer;
  } else if (tier in TIER_DISCOUNT_RATES) {
    discountRate = TIER_DISCOUNT_RATES[tier as keyof typeof TIER_DISCOUNT_RATES];
  }

  const unitPriceAfterDiscount = Math.round(basePrice * (1 - discountRate) * 100) / 100;
  const subtotal = Math.round(unitPriceAfterDiscount * quantity * 100) / 100;
  const vatAmount = Math.round(subtotal * UAE_STANDARD_VAT_RATE * 100) / 100;
  const totalWithVat = Math.round((subtotal + vatAmount) * 100) / 100;

  return {
    basePrice,
    discountRate,
    unitPriceAfterDiscount,
    quantity,
    subtotal,
    vatAmount,
    totalWithVat,
  };
}

/**
 * Calculates complete order total summary
 */
export function calculateCartSummary(
  items: { price: number; quantity: number }[],
  discountRate: number = 0
) {
  const rawSubtotal = items.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const discountAmount = Math.round(rawSubtotal * discountRate * 100) / 100;
  const subtotalAfterDiscount = rawSubtotal - discountAmount;
  const vatAmount = Math.round(subtotalAfterDiscount * UAE_STANDARD_VAT_RATE * 100) / 100;
  const estimatedTotal = subtotalAfterDiscount + vatAmount;

  return {
    rawSubtotal,
    discountAmount,
    subtotalAfterDiscount,
    vatAmount,
    estimatedTotal,
  };
}
