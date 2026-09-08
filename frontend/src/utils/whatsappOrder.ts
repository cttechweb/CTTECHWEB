/* ─────────────────────────────────────────────────────────────────
   Cool Technologies — WhatsApp Ordering & Direct Inquiries Utility
   Routes product, service, and procurement cart inquiries directly
   to the official WhatsApp number configured in the Admin Panel.
───────────────────────────────────────────────────────────────── */

import { getGeneralSettings } from "../services/generalSettingsService";
import { Product, CartItem } from "../types";

/**
 * Retrieve the clean international digits of the configured WhatsApp number
 * from Admin Contact & Comms Center -> WhatsApp Integration.
 */
export function getCleanWhatsAppNumber(): string {
  try {
    const settings = getGeneralSettings();
    const rawNumber =
      settings.whatsappSettings?.floatingPhoneNumber ||
      settings.whatsappSettings?.contactPageWhatsappNumber ||
      settings.whatsapp ||
      "+971 50 123 4567";

    let digits = rawNumber.replace(/[^0-9]/g, "");
    // If UAE local format starting with 0 (e.g., 0501234567), prepend country code 971
    if (digits.startsWith("0") && digits.length === 10) {
      digits = "971" + digits.slice(1);
    }
    return digits || "971501234567";
  } catch (e) {
    return "971501234567";
  }
}

/**
 * Open WhatsApp chat with pre-formatted product order / quotation text.
 */
export function openProductWhatsAppOrder(
  product: Pick<Product, "name" | "category"> & {
    id?: string;
    modelId?: string;
    sku?: string;
    price?: number;
  },
  quantity: number = 1
) {
  const phone = getCleanWhatsAppNumber();
  const model = product.modelId || product.sku || product.id || "N/A";
  const priceDisplay =
    product.price && product.price > 0
      ? `$${product.price.toLocaleString()} / Unit`
      : "Wholesale Rate on Request";

  const message = 
`*NEW EQUIPMENT ORDER / INQUIRY*
━━━━━━━━━━━━━━━━━━━━━━
*Product:* ${product.name}
*Model ID:* ${model}
*Category:* ${product.category || "Commercial HVAC"}
*Quantity:* ${quantity} Unit(s)
*Unit Price:* ${priceDisplay}
━━━━━━━━━━━━━━━━━━━━━━
Hello Cool Technologies Team, I would like to place an order / request an official quotation for this product. Please confirm availability, delivery timeline, and commercial terms.`;

  const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
  window.open(url, "_blank", "noopener,noreferrer");
}

/**
 * Open WhatsApp chat with pre-formatted engineering service inquiry / booking text.
 */
export function openServiceWhatsAppOrder(service: {
  title: string;
  category?: string;
  id?: string;
}) {
  const phone = getCleanWhatsAppNumber();

  const message =
`*SERVICE BOOKING & INQUIRY*
━━━━━━━━━━━━━━━━━━━━━━
*Service:* ${service.title}
*Category:* ${service.category || "HVAC Engineering Services"}
━━━━━━━━━━━━━━━━━━━━━━
Hello Cool Technologies Engineering Desk, I would like to inquire about booking this engineering service. Please provide technical team availability, scope details, and an official commercial quotation.`;

  const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
  window.open(url, "_blank", "noopener,noreferrer");
}

/**
 * Open WhatsApp chat with pre-formatted procurement cart / bill of quantities.
 */
export function openCartWhatsAppOrder(cart: CartItem[]) {
  if (!cart || cart.length === 0) return;
  const phone = getCleanWhatsAppNumber();

  const totalUnits = cart.reduce((sum, item) => sum + item.quantity, 0);
  const itemsText = cart
    .map((item, idx) => {
      const p = item.product;
      const model = p.modelId || p.sku || p.id || "";
      const priceStr =
        p.price && p.price > 0
          ? `$${(p.price * item.quantity).toLocaleString()}`
          : "Quote Required";
      return `${idx + 1}. *${p.name}* ${model ? `(${model})` : ""}\n   • Qty: ${item.quantity} Unit(s) | Subtotal: ${priceStr}`;
    })
    .join("\n\n");

  const message =
`*B2B PROCUREMENT ORDER / CART INQUIRY*
━━━━━━━━━━━━━━━━━━━━━━
*Total Equipment Models:* ${cart.length} Model(s)
*Total Procurement Volume:* ${totalUnits} Unit(s)
━━━━━━━━━━━━━━━━━━━━━━
*ITEMIZED BILL OF QUANTITIES:*

${itemsText}

━━━━━━━━━━━━━━━━━━━━━━
Hello Cool Technologies Sales Team, I would like to submit our procurement list directly via WhatsApp. Please review these items and send an official commercial quotation, stock availability, and delivery schedule.`;

  const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
  window.open(url, "_blank", "noopener,noreferrer");
}
