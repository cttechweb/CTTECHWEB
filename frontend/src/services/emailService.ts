/**
 * Cool Technologies — Unified Brevo Transactional Email Service
 * Sends admin notification to designated department inbox,
 * and automated customer confirmation receipt with direct WhatsApp emergency contact.
 * Uses Brevo Transactional Email REST API (300 free emails / day).
 */

import { getEmailSettings, getGeneralSettings } from "./generalSettingsService";
import { isAdminRoute } from "../utils/adminRoute";

export type EmailNotificationType =
  | "order"
  | "rfq"
  | "hero_quote"
  | "contact"
  | "partner"
  | "b2b_application"
  | "review"
  | "career"
  | "media"
  | "auth_signup"
  | "auth_login"
  | "test";

/** A lightweight product snapshot used only for email rendering */
export interface EmailOrderItem {
  name: string;
  brand?: string;
  image?: string;    // Public CDN URL of the product image
  productId: string; // Used to build the product page link
  quantity: number;
  unitPrice?: number;
}

export interface EmailNotificationPayload {
  type: EmailNotificationType;
  title: string;
  senderName: string;
  senderEmail: string;
  senderPhone?: string;
  companyName?: string;
  subject?: string;
  message?: string;
  detailsText?: string;
  /** Cart / order items — rendered as horizontal product cards in the email body */
  orderItems?: EmailOrderItem[];
  customParams?: Record<string, any>;
}

/**
 * Builds an HTML string of horizontal product cards for use in order emails.
 * Each card: [image] | product name, brand, qty × price → clickable link to product page.
 * Uses inline styles so it renders correctly in all email clients (Gmail, Outlook, Apple Mail).
 */
function buildProductCardsHtml(items: EmailOrderItem[], baseUrl: string): string {
  if (!items || items.length === 0) return "";

  const rows = items.map((item, index) => {
    const productUrl = `${baseUrl}/#/product/${item.productId}`;
    const priceStr =
      item.unitPrice && item.unitPrice > 0
        ? `AED ${(item.unitPrice * item.quantity).toLocaleString("en-AE")}`
        : "Price on request";
    const qtyLabel = `Qty: ${item.quantity} unit${item.quantity !== 1 ? "s" : ""}`;
    const topBorder = index > 0 ? "border-top: 1px solid #f8f8f8;" : "";

    // Resolve full public URL for images so email clients can load them
    let fullImageUrl = "";
    if (item.image && item.image.trim()) {
      const raw = item.image.trim();
      if (raw.startsWith("http://") || raw.startsWith("https://")) {
        fullImageUrl = raw;
      } else if (raw.startsWith("/")) {
        fullImageUrl = `https://cooltechuae.com${raw}`;
      } else {
        fullImageUrl = `https://cooltechuae.com/${raw}`;
      }
    }

    // Image cell — show thumbnail if URL is available, otherwise clean box
    const imageCell = fullImageUrl
      ? `<td style="padding: 0; width: 68px; vertical-align: middle;">
           <a href="${productUrl}" target="_blank" style="display: block; text-decoration: none;">
             <img src="${fullImageUrl}" alt="${item.name}" width="60" height="60"
               style="width: 60px; height: 60px; object-fit: cover; border-radius: 6px; border: 1px solid #e5e7eb; display: block;" />
           </a>
         </td>`
      : `<td style="padding: 0; width: 68px; vertical-align: middle;">
           <a href="${productUrl}" target="_blank" style="display: block; text-decoration: none;">
             <table role="presentation" width="60" height="60" border="0" cellspacing="0" cellpadding="0" style="width: 60px; height: 60px; border-radius: 6px; background-color: #f8fafc; border: 1px solid #e2e8f0; text-align: center;">
               <tr>
                 <td align="center" valign="middle" style="font-size: 20px;">📦</td>
               </tr>
             </table>
           </a>
         </td>`;

    return `
      <tr>
        <td style="padding: 12px 0; ${topBorder}">
          <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0">
            <tr>
              ${imageCell}
              <td style="padding: 0 0 0 14px; vertical-align: middle;">
                <a href="${productUrl}" target="_blank" style="text-decoration: none; display: block;">
                  <div style="font-size: 13.5px; font-weight: 600; color: #111827; line-height: 1.35; margin-bottom: 3px;">${item.name}</div>
                  ${item.brand ? `<div style="font-size: 11px; color: #888888; margin-bottom: 5px;">${item.brand}</div>` : ""}
                  <div>
                    <span style="font-size: 11px; font-weight: 600; color: #0f4c81; background-color: #eff6ff; padding: 2px 7px; border-radius: 4px; border: 1px solid #bfdbfe; display: inline-block; margin-right: 8px;">${qtyLabel}</span>
                    <span style="font-size: 12px; font-weight: 500; color: #374151;">${priceStr}</span>
                  </div>
                </a>
              </td>
              <td style="padding: 0 0 0 12px; vertical-align: middle; text-align: right; white-space: nowrap; width: 68px;">
                <a href="${productUrl}" target="_blank" style="display: inline-block; font-size: 11px; font-weight: 600; color: #0f4c81; text-decoration: none; padding: 6px 12px; background-color: #f0f7fc; border-radius: 6px; border: 1px solid #d0e6f5;">
                  View &rarr;
                </a>
              </td>
            </tr>
          </table>
        </td>
      </tr>`;
  }).join("");

  return `
    <div style="padding-top: 8px; padding-bottom: 24px; border-top: 1px solid #f0f0f0;">
      <div style="font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.8px; color: #888888; margin-bottom: 10px;">
        Requested Products (${items.length} item${items.length !== 1 ? "s" : ""})
      </div>
      <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0">
        ${rows}
      </table>
    </div>`;
}

/**
 * Returns the configured receiving email for the given notification type.
 * Falls back to defaultReceivingEmail for all unconfigured types.
 */
export function getRecipientEmail(type: EmailNotificationType): string {
  const settings = getEmailSettings();

  // Find any explicitly configured operational email to prevent routing into unconfigured placeholder
  const activeConfiguredEmail =
    (settings.accountReceivingEmail || "").trim() ||
    (settings.orderReceivingEmail || "").trim() ||
    (settings.contactReceivingEmail || "").trim() ||
    (settings.rfqReceivingEmail || "").trim() ||
    (settings.brevoSenderEmail || "").trim();

  let def = (settings.defaultReceivingEmail || "").trim();
  // If default is empty OR untouched placeholder 'sales@cooltechuae.com' while an active email is configured elsewhere
  if (!def || (def.toLowerCase() === "sales@cooltechuae.com" && activeConfiguredEmail)) {
    def = activeConfiguredEmail || def || "sales@cooltechuae.com";
  }

  switch (type) {
    case "order":
      return (settings.orderReceivingEmail || "").trim() || def;
    case "rfq":
    case "hero_quote":
      return (settings.rfqReceivingEmail || "").trim() || def;
    case "contact":
      return (settings.contactReceivingEmail || "").trim() || def;
    case "partner":
    case "b2b_application":
      return (settings.partnerReceivingEmail || "").trim() || def;
    case "career":
      return (settings.careerReceivingEmail || "").trim() || def;
    case "review":
      return (settings.reviewReceivingEmail || "").trim() || def;
    case "auth_signup":
      return (settings.accountReceivingEmail || "").trim() || (settings.partnerReceivingEmail || "").trim() || def;
    case "auth_login":
      return (settings.loginReceivingEmail || "").trim() || (settings.accountReceivingEmail || "").trim() || def;
    case "media":
      return (settings.contactReceivingEmail || "").trim() || def;
    case "test":
    default:
      return def;
  }
}

// Deduplication map: prevents accidental duplicate sends (e.g. double clicks, multiple handlers) within 6 seconds
const recentDispatches = new Map<string, number>();

function getPayloadFingerprint(payload: EmailNotificationPayload): string {
  return `${payload.type}::${(payload.senderEmail || "").toLowerCase().trim()}::${(payload.title || "").trim()}::${(payload.message || "").slice(0, 60)}`;
}

/**
 * Builds the modern minimalist HTML email for the internal Admin / Sales Desk.
 */
function buildAdminNotificationHtml(
  payload: EmailNotificationPayload,
  productCardsHtml: string,
  sourceUrl: string
): string {
  const submissionDate = new Date().toLocaleString("en-AE", { timeZone: "Asia/Dubai" });
  const details = payload.detailsText || payload.message || "No additional message.";

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${payload.title}</title>
  <style>
    @media only screen and (max-width: 680px) {
      .email-container { width: 100% !important; max-width: 100% !important; }
      .email-outer-td { padding: 20px 16px 36px 16px !important; }
    }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: #ffffff; color: #111827; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased;">
  <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #ffffff; width: 100%; margin: 0; text-align: left;">
    <tr>
      <td class="email-outer-td" align="left" style="padding: 28px 24px 48px 24px;">
        <table role="presentation" class="email-container" align="left" border="0" cellspacing="0" cellpadding="0" style="max-width: 780px; width: 100%; margin: 0; text-align: left;">
          
          <!-- Subtle Brand Header -->
          <tr>
            <td style="padding-bottom: 20px; border-bottom: 1px solid #e5e7eb;">
              <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td align="left" style="font-size: 13px; font-weight: 700; letter-spacing: 0.6px; color: #0f4c81; text-transform: uppercase;">
                    COOL TECHNOLOGIES
                  </td>
                  <td align="right" style="font-size: 11px; font-weight: 600; color: #6b7280; text-transform: uppercase; letter-spacing: 0.6px; font-variant-numeric: tabular-nums;">
                    ${payload.type.toUpperCase()}
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Inquiry Title & Submission Timestamp -->
          <tr>
            <td style="padding-top: 22px; padding-bottom: 18px;">
              <h1 style="margin: 0 0 6px 0; font-size: 20px; font-weight: 600; line-height: 1.35; color: #111827; letter-spacing: -0.2px;">
                ${payload.title}
              </h1>
              <div style="font-size: 13px; color: #6b7280; line-height: 1.4;">
                Received on ${submissionDate}
              </div>
            </td>
          </tr>

          <!-- Metadata Key-Value Rows (Unboxed, Hairline Separators) -->
          <tr>
            <td style="padding-bottom: 24px;">
              <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="border-top: 1px solid #f0f0f0;">
                <tr>
                  <td style="padding: 9px 0; font-size: 12px; font-weight: 500; color: #888888; width: 110px; text-transform: uppercase; letter-spacing: 0.4px;">
                    Customer
                  </td>
                  <td style="padding: 9px 0; font-size: 13px; font-weight: 500; color: #111827;">
                    ${payload.senderName || "Website Visitor"}
                  </td>
                </tr>
                <tr>
                  <td style="padding: 9px 0; border-top: 1px solid #f8f8f8; font-size: 12px; font-weight: 500; color: #888888; text-transform: uppercase; letter-spacing: 0.4px;">
                    Email
                  </td>
                  <td style="padding: 9px 0; border-top: 1px solid #f8f8f8; font-size: 13px; color: #111827;">
                    <a href="mailto:${payload.senderEmail}" style="color: #0f4c81; text-decoration: none; font-weight: 500;">${payload.senderEmail}</a>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 9px 0; border-top: 1px solid #f8f8f8; font-size: 12px; font-weight: 500; color: #888888; text-transform: uppercase; letter-spacing: 0.4px;">
                    Phone
                  </td>
                  <td style="padding: 9px 0; border-top: 1px solid #f8f8f8; font-size: 13px; color: #111827;">
                    <a href="tel:${payload.senderPhone || ""}" style="color: #111827; text-decoration: none;">${payload.senderPhone || "Not provided"}</a>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 9px 0; border-top: 1px solid #f8f8f8; font-size: 12px; font-weight: 500; color: #888888; text-transform: uppercase; letter-spacing: 0.4px;">
                    Company
                  </td>
                  <td style="padding: 9px 0; border-top: 1px solid #f8f8f8; font-size: 13px; color: #111827;">
                    ${payload.companyName || "Individual / Not specified"}
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Requested Products (Horizontal Cards with Redirect Links) -->
          ${productCardsHtml ? `<tr><td>${productCardsHtml}</td></tr>` : ""}

          <!-- Inquiry Details / Scope -->
          <tr>
            <td style="padding-top: 8px; padding-bottom: 24px; border-top: 1px solid #f0f0f0;">
              <div style="font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.8px; color: #888888; margin-bottom: 10px;">
                Inquiry Details & Scope
              </div>
              <div style="font-size: 13px; line-height: 1.65; color: #1f2937; white-space: pre-wrap; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
${details}
              </div>
            </td>
          </tr>

          <!-- SaaS Discrete Action Link & Button -->
          <tr>
            <td style="padding-top: 16px; padding-bottom: 28px; border-top: 1px solid #f0f0f0;">
              <table role="presentation" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td align="left" style="border-radius: 6px; background-color: #111827;">
                    <a href="mailto:${payload.senderEmail}" target="_blank" style="display: inline-block; padding: 8px 14px; font-size: 12px; font-weight: 500; color: #ffffff; text-decoration: none; border-radius: 6px;">
                      Reply to ${payload.senderName || "Customer"} &rarr;
                    </a>
                  </td>
                  <td style="padding-left: 14px;">
                    <a href="${sourceUrl}" target="_blank" style="font-size: 12px; color: #6b7280; text-decoration: none;">
                      Open Source Page
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Understated Footer -->
          <tr>
            <td style="padding-top: 20px; border-top: 1px solid #f0f0f0; font-size: 11px; line-height: 1.5; color: #9ca3af;">
              <div>This automated notification was dispatched from Cool Technologies.</div>
              <div>cooltechuae.com &bull; Abu Dhabi, United Arab Emirates</div>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

/**
 * Builds the branded Auto-Reply confirmation email for the customer,
 * including an emergency WhatsApp contact button and office info.
 */
/**
 * Builds a clean, minimalist, and ultra-professional Welcome & Profile Completion email.
 * Simple, elegant typography without nested boxes or visual clutter.
 */
function buildCustomerWelcomeHtml(
  payload: EmailNotificationPayload,
  baseUrl: string
): string {
  const accountUrl = `${baseUrl}/#/account`;
  const name = payload.senderName || "there";
  const email = payload.senderEmail || "Your registered email";

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to Cool Technologies</title>
</head>
<body style="margin: 0; padding: 0; background-color: #ffffff; color: #1f2937; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased; line-height: 1.6;">
  <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #ffffff; width: 100%; margin: 0; text-align: left;">
    <tr>
      <td align="left" style="padding: 36px 24px 48px 24px;">
        <table role="presentation" align="left" border="0" cellspacing="0" cellpadding="0" style="max-width: 640px; width: 100%; margin: 0; text-align: left;">
          
          <!-- Clean Brand Header -->
          <tr>
            <td style="padding-bottom: 20px; border-bottom: 1px solid #e5e7eb;">
              <div style="font-size: 13px; font-weight: 800; letter-spacing: 0.8px; color: #0f4c81; text-transform: uppercase;">
                COOL TECHNOLOGIES
              </div>
            </td>
          </tr>

          <!-- Heading & Message -->
          <tr>
            <td style="padding-top: 26px; padding-bottom: 16px;">
              <h1 style="margin: 0 0 12px 0; font-size: 20px; font-weight: 700; color: #111827; letter-spacing: -0.2px;">
                Welcome, ${name}
              </h1>
              <p style="margin: 0 0 14px 0; font-size: 14px; color: #374151; line-height: 1.65;">
                Thank you for creating your account with Cool Technologies. Your account is now active.
              </p>
              <p style="margin: 0; font-size: 14px; color: #374151; line-height: 1.65;">
                Could you please complete your profile details to unlock verified trade discounts, fast-track RFQ quote approvals, and personalized wholesale equipment pricing?
              </p>
            </td>
          </tr>

          <!-- Account Summary Row (Clean, subtle hairline table) -->
          <tr>
            <td style="padding: 16px 0 24px 0;">
              <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="border-top: 1px solid #f1f5f9; border-bottom: 1px solid #f1f5f9;">
                <tr>
                  <td style="padding: 10px 0; font-size: 13px; color: #6b7280; width: 140px;">
                    Registered Email
                  </td>
                  <td style="padding: 10px 0; font-size: 13px; font-weight: 600; color: #111827;">
                    ${email}
                  </td>
                </tr>
                <tr>
                  <td style="padding: 10px 0; border-top: 1px solid #f8fafc; font-size: 13px; color: #6b7280;">
                    Profile Status
                  </td>
                  <td style="padding: 10px 0; border-top: 1px solid #f8fafc; font-size: 13px; font-weight: 600; color: #b45309;">
                    Pending Company &amp; Contact Details
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Clean Direct CTA Button -->
          <tr>
            <td style="padding-bottom: 32px;">
              <table role="presentation" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td align="left" style="border-radius: 6px; background-color: #0f4c81;">
                    <a href="${accountUrl}" target="_blank" style="display: inline-block; padding: 11px 22px; font-size: 13px; font-weight: 600; color: #ffffff; text-decoration: none; border-radius: 6px; letter-spacing: 0.2px;">
                      Complete Your Profile &rarr;
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Help & Support note -->
          <tr>
            <td style="padding-top: 20px; border-top: 1px solid #e5e7eb; font-size: 12.5px; color: #6b7280; line-height: 1.6;">
              If you have any questions or require immediate equipment assistance, simply reply to this email or reach our sales desk at <a href="mailto:sales@cooltechuae.com" style="color: #0f4c81; text-decoration: none; font-weight: 500;">sales@cooltechuae.com</a>.
            </td>
          </tr>

          <!-- Corporate Sign-Off -->
          <tr>
            <td style="padding-top: 14px; font-size: 12.5px; color: #374151;">
              Best regards,<br>
              <strong>Cool Technologies Team</strong>
            </td>
          </tr>

          <!-- Simple Footer -->
          <tr>
            <td style="padding-top: 24px; font-size: 11px; color: #9ca3af; line-height: 1.5;">
              Cool Technologies LLC &bull; Abu Dhabi, United Arab Emirates &bull; <a href="${baseUrl}" target="_blank" style="color: #9ca3af; text-decoration: underline;">cooltechuae.com</a>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

/**
 * Builds the branded Auto-Reply confirmation email for customer inquiries (orders, quotes, contact).
 * Includes an emergency WhatsApp contact button and office logistics info.
 */
function buildCustomerAutoReplyHtml(
  payload: EmailNotificationPayload,
  productCardsHtml: string,
  whatsappNumber: string
): string {
  const cleanWhatsapp = (whatsappNumber || "+971 50 123 4567").replace(/[^0-9]/g, "");
  const whatsappDisplay = whatsappNumber || "+971 50 123 4567";

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Thank you for contacting Cool Technologies</title>
  <style>
    @media only screen and (max-width: 680px) {
      .email-container { width: 100% !important; max-width: 100% !important; }
      .email-outer-td { padding: 20px 16px 36px 16px !important; }
    }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: #ffffff; color: #111827; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased;">
  <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #ffffff; width: 100%; margin: 0; text-align: left;">
    <tr>
      <td class="email-outer-td" align="left" style="padding: 28px 24px 48px 24px;">
        <table role="presentation" class="email-container" align="left" border="0" cellspacing="0" cellpadding="0" style="max-width: 780px; width: 100%; margin: 0; text-align: left;">
          
          <!-- Subtle Brand Header -->
          <tr>
            <td style="padding-bottom: 20px; border-bottom: 1px solid #e5e7eb;">
              <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td align="left" style="font-size: 13px; font-weight: 700; letter-spacing: 0.6px; color: #0f4c81; text-transform: uppercase;">
                    COOL TECHNOLOGIES
                  </td>
                  <td align="right" style="font-size: 11px; color: #0f4c81; font-weight: 600; background-color: #eff6ff; padding: 3px 8px; border-radius: 4px; border: 1px solid #bfdbfe;">
                    Request Received
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Main Greeting -->
          <tr>
            <td style="padding-top: 22px; padding-bottom: 18px;">
              <h1 style="margin: 0 0 8px 0; font-size: 20px; font-weight: 700; line-height: 1.35; color: #111827; letter-spacing: -0.2px;">
                Thank you, ${payload.senderName || "Valued Client"}
              </h1>
              <p style="margin: 0; font-size: 14px; color: #4b5563; line-height: 1.6;">
                We have successfully received your request regarding <strong>${payload.title}</strong>. Our engineering and sales team in Abu Dhabi is reviewing your requirements and will contact you directly within 1 to 2 business hours.
              </p>
            </td>
          </tr>

          <!-- Emergency WhatsApp Assistance Card -->
          <tr>
            <td style="padding-bottom: 22px;">
              <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 10px;">
                <tr>
                  <td style="padding: 16px 18px;">
                    <div style="font-size: 13px; font-weight: 700; color: #166534; margin-bottom: 4px;">
                      💬 Urgent or Emergency Inquiry?
                    </div>
                    <div style="font-size: 12px; color: #15803d; line-height: 1.5; margin-bottom: 12px;">
                      If you require immediate technical consultation, emergency unit replacement, or rapid wholesale equipment pricing, connect directly with our duty desk on WhatsApp:
                    </div>
                    <div>
                      <a href="https://wa.me/${cleanWhatsapp}" target="_blank" style="display: inline-block; background-color: #16a34a; color: #ffffff; text-decoration: none; font-size: 12px; font-weight: 700; padding: 9px 18px; border-radius: 6px;">
                        Chat on WhatsApp (${whatsappDisplay}) &rarr;
                      </a>
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Requested Products (if any) -->
          ${productCardsHtml ? `<tr><td>${productCardsHtml}</td></tr>` : ""}

          <!-- Corporate Office Details -->
          <tr>
            <td style="padding-top: 16px; padding-bottom: 24px; border-top: 1px solid #f0f0f0;">
              <div style="font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.8px; color: #888888; margin-bottom: 8px;">
                Headquarters &amp; Logistics Center
              </div>
              <div style="font-size: 12px; color: #4b5563; line-height: 1.6;">
                <div><strong>Location:</strong> Plot 99, Sector M-42, Mussafah Industrial, Abu Dhabi, UAE</div>
                <div><strong>Phone:</strong> +971 2 565 0123 &bull; <strong>Email:</strong> sales@cooltechuae.com</div>
                <div><strong>Hours:</strong> Monday &ndash; Saturday, 8:00 AM &ndash; 7:00 PM GST</div>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding-top: 20px; border-top: 1px solid #f0f0f0; font-size: 11px; line-height: 1.5; color: #9ca3af;">
              <div>Cool Technologies LLC &bull; Advanced Cooling &amp; Air Conditioning Solutions</div>
              <div><a href="https://cooltechuae.com" target="_blank" style="color: #0f4c81; text-decoration: none;">cooltechuae.com</a> &bull; Abu Dhabi, United Arab Emirates</div>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

/**
 * Dispatches an email via Brevo Transactional Email REST API.
 */
async function sendBrevoEmail(params: {
  apiKey: string;
  senderName: string;
  senderEmail: string;
  toEmail?: string;
  toName?: string;
  recipients?: { email: string; name?: string }[];
  replyToEmail?: string;
  replyToName?: string;
  subject: string;
  htmlContent: string;
}): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    const toList = params.recipients && params.recipients.length > 0
      ? params.recipients.map((r) => ({ email: r.email, name: r.name || r.email }))
      : [{ email: params.toEmail || "", name: params.toName || params.toEmail || "" }];

    const res = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        accept: "application/json",
        "api-key": params.apiKey,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        sender: {
          name: params.senderName,
          email: params.senderEmail,
        },
        to: toList,
        ...(params.replyToEmail
          ? {
              replyTo: {
                email: params.replyToEmail,
                name: params.replyToName || params.replyToEmail,
              },
            }
          : {}),
        subject: params.subject,
        htmlContent: params.htmlContent,
      }),
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      const errMsg = (data as any)?.message || `Brevo HTTP Error ${res.status}`;
      console.error("[EmailService] ✗ Brevo API call failed:", errMsg, data);
      return { success: false, error: errMsg };
    }

    const messageId = (data as any)?.messageId || "ok";
    return { success: true, messageId };
  } catch (err: any) {
    const errMsg = err?.message || String(err);
    console.error("[EmailService] ✗ Brevo Network Error:", errMsg);
    return { success: false, error: errMsg };
  }
}

/**
 * Dispatches notification to ADMIN inbox and sends automated confirmation to the CUSTOMER.
 * Uses Brevo Transactional Email REST API (300 free emails / day).
 */
export async function sendEmailNotification(
  payload: EmailNotificationPayload
): Promise<{ success: boolean; message?: string; recipient?: string }> {
  // ── Step 0: Anti-Duplicate Guard (Debounce) ─────────────────────
  const fingerprint = getPayloadFingerprint(payload);
  const now = Date.now();
  const lastDispatchedAt = recentDispatches.get(fingerprint);

  if (lastDispatchedAt && now - lastDispatchedAt < 6000) {
    const elapsed = ((now - lastDispatchedAt) / 1000).toFixed(1);
    console.warn(`[EmailService] ⚠ Duplicate dispatch BLOCKED: Identical notification was sent ${elapsed}s ago.`);
    return {
      success: true,
      message: "Duplicate notification blocked to preserve quota.",
      recipient: getRecipientEmail(payload.type),
    };
  }
  recentDispatches.set(fingerprint, now);

  // Clean up cache entries older than 30 seconds
  if (recentDispatches.size > 50) {
    recentDispatches.forEach((timestamp, key) => {
      if (now - timestamp > 30000) {
        recentDispatches.delete(key);
      }
    });
  }

  // ── Step 1: Read settings ────────────────────────────────────────
  const settings = getEmailSettings();

  console.log(`[EmailService] ▶ Dispatched [${payload.type}] notification via Brevo`);

  // Guard: integration must be enabled
  if (!settings.isEnabled) {
    console.warn("[EmailService] ✗ BLOCKED: Email integration is disabled.");
    return { success: false, message: "Email integration is disabled in settings." };
  }

  if (payload.type === "auth_signup" && settings.notifyOnSignup === false) {
    return { success: false, message: "Signup notifications disabled." };
  }
  if (payload.type === "auth_login") {
    if (settings.notifyOnLogin === false) {
      return { success: false, message: "Login notifications disabled." };
    }
    // Never dispatch routine user login emails for Admin logins (handled exclusively by 2FA and Security Alerts)
    const isAdminPortal = typeof window !== "undefined" && (isAdminRoute(window.location.hash) || window.location.hash.startsWith("#/admin"));
    if (isAdminPortal || payload.senderEmail?.toLowerCase().includes("admin") || payload.customParams?.is_admin) {
      console.log("[EmailService] ℹ Suppressed general 'auth_login' notification for Admin Portal login.");
      return { success: true, message: "Suppressed for Admin Portal." };
    }
  }
  if (payload.type === "b2b_application" && settings.notifyOnB2B === false) {
    return { success: false, message: "B2B notifications disabled." };
  }

  // ── Step 2: Resolve Brevo credentials ─────────────────────────────
  const apiKey = (
    settings.brevoApiKey ||
    (import.meta as any).env?.VITE_BREVO_API_KEY ||
    ""
  ).trim();

  const senderEmail = (
    settings.brevoSenderEmail ||
    (import.meta as any).env?.VITE_BREVO_SENDER_EMAIL ||
    "ctauhweb@gmail.com"
  ).trim();

  const senderName = settings.brevoSenderName || "Cool Technologies";

  if (!apiKey) {
    console.error("[EmailService] ✗ BLOCKED: Brevo API key is missing.");
    return { success: false, message: "Brevo API key not configured." };
  }

  // ── Step 3: Determine Admin Recipient ─────────────────────────────
  const adminRecipient = getRecipientEmail(payload.type);
  if (!adminRecipient || !adminRecipient.includes("@")) {
    console.error(`[EmailService] ✗ BLOCKED: No valid recipient address for type "${payload.type}".`);
    return { success: false, message: "No valid recipient address configured." };
  }

  const baseUrl = typeof window !== "undefined"
    ? `${window.location.protocol}//${window.location.host}`
    : "https://cooltechuae.com";
  const sourceUrl = typeof window !== "undefined" ? window.location.href : "Website";

  // Build product cards HTML if items exist
  const productCardsHtml = payload.orderItems && payload.orderItems.length > 0
    ? buildProductCardsHtml(payload.orderItems, baseUrl)
    : "";

  // ── Step 4: Dispatch Email #1 to Admin / Sales Desk ──────────────
  const adminSubject = payload.subject || `[Cool Technologies] New ${payload.title}`;
  const adminHtml = buildAdminNotificationHtml(payload, productCardsHtml, sourceUrl);

  const adminResult = await sendBrevoEmail({
    apiKey,
    senderName,
    senderEmail,
    toEmail: adminRecipient,
    toName: "Cool Technologies Team",
    replyToEmail: payload.senderEmail,
    replyToName: payload.senderName,
    subject: adminSubject,
    htmlContent: adminHtml,
  });

  if (!adminResult.success) {
    return {
      success: false,
      message: `Brevo dispatch failed: ${adminResult.error}`,
      recipient: adminRecipient,
    };
  }

  console.log(`[EmailService] ✓ Admin notification delivered to "${adminRecipient}" (Message ID: ${adminResult.messageId})`);

  // ── Step 5: Dispatch Email #2 to Customer (Auto-Reply) ───────────
  // Sends a confirmation receipt to customer if senderEmail is valid and not a system test
  const isCustomerValid =
    payload.senderEmail &&
    payload.senderEmail.includes("@") &&
    !payload.senderEmail.includes("no-reply") &&
    payload.type !== "test" &&
    payload.type !== "auth_login"; // Do not send receipt emails to customer on routine sign-ins

  if (settings.autoReplyEnabled !== false && isCustomerValid) {
    let customerSubject: string;
    let customerHtml: string;

    const generalSettings = getGeneralSettings();
    const autoReplyWhatsapp = 
      generalSettings.whatsappSettings?.emailAutoReplyWhatsappNumber ||
      generalSettings.whatsapp ||
      generalSettings.phone ||
      "+971 50 123 4567";

    if (payload.type === "auth_signup") {
      customerSubject = `Welcome to Cool Technologies - Complete Your Profile for Trade Offers`;
      customerHtml = buildCustomerWelcomeHtml(payload, baseUrl);
    } else {
      customerSubject = `Thank you for contacting Cool Technologies - We received your request`;
      customerHtml = buildCustomerAutoReplyHtml(
        payload,
        productCardsHtml,
        autoReplyWhatsapp
      );
    }

    sendBrevoEmail({
      apiKey,
      senderName,
      senderEmail,
      toEmail: payload.senderEmail,
      toName: payload.senderName || "Customer",
      replyToEmail: adminRecipient,
      replyToName: "Cool Technologies Support",
      subject: customerSubject,
      htmlContent: customerHtml,
    })
      .then((res) => {
        if (res.success) {
          console.log(`[EmailService] ✓ Customer Auto-Reply sent to "${payload.senderEmail}"`);
        } else {
          console.warn("[EmailService] ⚠ Customer Auto-Reply notice:", res.error);
        }
      })
      .catch((err) => {
        console.warn("[EmailService] ⚠ Customer Auto-Reply error:", err);
      });
  }

  return { success: true, recipient: adminRecipient };
}

/**
 * Sends a live test email directly from the Admin Panel using Brevo.
 */
export async function sendTestEmail(
  overrideRecipient?: string
): Promise<{ success: boolean; message: string; recipient: string }> {
  const settings = getEmailSettings();
  const recipient = (overrideRecipient || settings.defaultReceivingEmail || "sales@cooltechuae.com").trim();

  const res = await sendEmailNotification({
    type: "test",
    title: "Brevo System Dispatch Test",
    senderName: "Cool Technologies Admin Desk",
    senderEmail: "admin@cooltechuae.com",
    senderPhone: "+971 2 565 0123",
    companyName: "Cool Technologies LLC",
    subject: "[Cool Technologies] Brevo Integration Verification: Live Test",
    message:
      "This is a verified test email sent from your website using Brevo Transactional Email API. Both admin notification and customer auto-reply services are fully operational.",
    detailsText: `Brevo Verified Sender: ${settings.brevoSenderEmail || "ctauhweb@gmail.com"}\nRecipient Address: ${recipient}\nDaily Sending Quota: 300 emails/day`,
  });

  if (res.success) {
    return {
      success: true,
      message: `Brevo test email successfully sent to ${recipient}! Please check your inbox.`,
      recipient,
    };
  } else {
    return {
      success: false,
      message: res.message || "Failed to send Brevo test email. Please check your Brevo API key.",
      recipient,
    };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// ADMIN PORTAL 2FA OTP & SECURITY ALERT NOTIFICATION ENGINE
// ─────────────────────────────────────────────────────────────────────────────

export const ADMIN_SECURITY_RECIPIENTS = [
  { email: "shamzy.cnn@gmail.com", name: "Shamzy (System Admin)" },
  { email: "nafalkt7@gmail.com", name: "Nafal KT (System Admin)" },
];

/**
 * Sends a 6-digit Two-Factor Authentication OTP to designated admin mailboxes.
 */
export async function sendAdminLoginOtpEmail(params: {
  otpCode: string;
  expiresMinutes?: number;
  adminEmail: string;
  ipInfo?: {
    ip: string;
    city: string;
    region: string;
    country: string;
    browser: string;
    os: string;
    deviceType: string;
    timeUae: string;
    timeUtc: string;
  };
}): Promise<{ success: boolean; message?: string }> {
  const settings = getEmailSettings();
  const apiKey = (
    settings.brevoApiKey ||
    (import.meta as any).env?.VITE_BREVO_API_KEY ||
    ""
  ).trim();

  const senderEmail = (
    settings.brevoSenderEmail ||
    (import.meta as any).env?.VITE_BREVO_SENDER_EMAIL ||
    "ctauhweb@gmail.com"
  ).trim();

  const senderName = settings.brevoSenderName || "Cool Technologies Security Desk";
  const expires = params.expiresMinutes || 5;

  const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>Admin 2FA Security Code</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0c1524; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
  <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #0c1524; padding: 40px 15px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 560px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.3);">
          
          <!-- Header Banner -->
          <tr>
            <td style="background: linear-gradient(135deg, #031b4e 0%, #0f4c81 100%); padding: 32px 30px; text-align: center;">
              <span style="display: inline-block; background-color: rgba(37, 150, 190, 0.2); border: 1px solid rgba(37, 150, 190, 0.4); color: #67e8f9; font-size: 11px; font-weight: 800; letter-spacing: 1.5px; text-transform: uppercase; padding: 5px 14px; border-radius: 9999px; margin-bottom: 12px;">
                TWO-FACTOR VERIFICATION
              </span>
              <h1 style="color: #ffffff; font-size: 22px; font-weight: 800; margin: 0; letter-spacing: -0.5px;">
                Admin Portal Login OTP
              </h1>
              <p style="color: #94a3b8; font-size: 13px; margin: 6px 0 0 0;">
                Cool Technologies Enterprise Management Portal
              </p>
            </td>
          </tr>

          <!-- OTP Display Body -->
          <tr>
            <td style="padding: 36px 32px 28px 32px; text-align: center;">
              <p style="color: #475569; font-size: 14px; margin: 0 0 24px 0; line-height: 1.6;">
                A sign-in attempt was initiated for administrator <strong>${params.adminEmail}</strong>. Use the 6-digit one-time passcode below to authorize access:
              </p>

              <!-- Prominent Monospace Code Box -->
              <div style="background-color: #f0f7ff; border: 2px dashed #2596be; border-radius: 12px; padding: 22px 10px; margin-bottom: 24px;">
                <span style="font-family: 'Courier New', Courier, monospace; font-size: 38px; font-weight: 800; letter-spacing: 10px; color: #031b4e; display: inline-block; padding-left: 10px;">
                  ${params.otpCode}
                </span>
              </div>

              <p style="color: #dc2626; font-size: 12px; font-weight: 700; margin: 0 0 20px 0;">
                ⏱ This code expires in ${expires} minutes.
              </p>

              <!-- Security Warning Box -->
              <div style="background-color: #fef2f2; border: 1px solid #fecaca; border-radius: 10px; padding: 14px 18px; text-align: left; margin-bottom: 24px;">
                <p style="color: #991b1b; font-size: 12px; font-weight: 600; margin: 0; line-height: 1.5;">
                  ⚠️ <strong>Security Notice:</strong> If you did NOT attempt to sign in to the Admin Portal, someone has entered your credentials. Log in to Firebase Console immediately and reset your administrative password.
                </p>
              </div>

              ${
                params.ipInfo
                  ? `<!-- Request Telemetry -->
              <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; text-align: left; font-size: 11px; color: #64748b;">
                <tr>
                  <td style="padding: 10px 14px; border-bottom: 1px solid #f1f5f9; font-weight: 700; color: #334155;">Client IP</td>
                  <td style="padding: 10px 14px; border-bottom: 1px solid #f1f5f9; font-family: monospace; color: #0f172a;">${params.ipInfo.ip}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 14px; border-bottom: 1px solid #f1f5f9; font-weight: 700; color: #334155;">Location</td>
                  <td style="padding: 10px 14px; border-bottom: 1px solid #f1f5f9; color: #0f172a;">${params.ipInfo.city}, ${params.ipInfo.region}, ${params.ipInfo.country}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 14px; border-bottom: 1px solid #f1f5f9; font-weight: 700; color: #334155;">Device / Browser</td>
                  <td style="padding: 10px 14px; border-bottom: 1px solid #f1f5f9; color: #0f172a;">${params.ipInfo.deviceType} • ${params.ipInfo.os} (${params.ipInfo.browser})</td>
                </tr>
                <tr>
                  <td style="padding: 10px 14px; font-weight: 700; color: #334155;">Timestamp</td>
                  <td style="padding: 10px 14px; color: #0f172a;">${params.ipInfo.timeUae}</td>
                </tr>
              </table>`
                  : ""
              }

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f8fafc; border-top: 1px solid #e2e8f0; padding: 18px 30px; text-align: center;">
              <p style="color: #94a3b8; font-size: 11px; margin: 0; line-height: 1.5;">
                Cool Technologies LLC • Automated Security Dispatch • Mussafah M-14, Abu Dhabi, UAE
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  return sendBrevoEmail({
    apiKey,
    senderName,
    senderEmail,
    recipients: ADMIN_SECURITY_RECIPIENTS,
    subject: `[Cool Technologies] 🛡️ Admin Verification Code: ${params.otpCode}`,
    htmlContent,
  });
}

/**
 * Sends a full Security Alert email to both admin mailboxes whenever a successful admin login occurs.
 */
export async function sendAdminLoginSecurityAlert(params: {
  adminEmail: string;
  ipInfo: {
    ip: string;
    city: string;
    region: string;
    country: string;
    isp: string;
    browser: string;
    os: string;
    deviceType: string;
    userAgent: string;
    timeUae: string;
    timeUtc: string;
  };
}): Promise<{ success: boolean; message?: string }> {
  const settings = getEmailSettings();
  const apiKey = (
    settings.brevoApiKey ||
    (import.meta as any).env?.VITE_BREVO_API_KEY ||
    ""
  ).trim();

  const senderEmail = (
    settings.brevoSenderEmail ||
    (import.meta as any).env?.VITE_BREVO_SENDER_EMAIL ||
    "ctauhweb@gmail.com"
  ).trim();

  const senderName = settings.brevoSenderName || "Cool Technologies Security Desk";

  const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>Admin Sign-in Security Alert</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0c1524; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
  <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #0c1524; padding: 40px 15px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 580px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.3);">
          
          <!-- Header Banner -->
          <tr>
            <td style="background: linear-gradient(135deg, #031b4e 0%, #1e293b 100%); padding: 32px 30px; text-align: center;">
              <span style="display: inline-block; background-color: rgba(16, 185, 129, 0.2); border: 1px solid rgba(16, 185, 129, 0.4); color: #34d399; font-size: 11px; font-weight: 800; letter-spacing: 1.5px; text-transform: uppercase; padding: 5px 14px; border-radius: 9999px; margin-bottom: 12px;">
                SECURITY TELEMETRY LOG
              </span>
              <h1 style="color: #ffffff; font-size: 22px; font-weight: 800; margin: 0; letter-spacing: -0.5px;">
                Admin Portal Login Detected
              </h1>
              <p style="color: #94a3b8; font-size: 13px; margin: 6px 0 0 0;">
                A successful administrative login was completed with 2FA OTP verification
              </p>
            </td>
          </tr>

          <!-- Details Table -->
          <tr>
            <td style="padding: 32px 30px;">
              <p style="color: #334155; font-size: 14px; margin: 0 0 20px 0; line-height: 1.5;">
                Administrative access to <strong>Cool Technologies Admin Suite</strong> was just authorized. Below are the verified device and telemetry details for this session:
              </p>

              <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; margin-bottom: 24px; font-size: 12px;">
                <tr style="border-bottom: 1px solid #e2e8f0;">
                  <td style="padding: 12px 16px; font-weight: 700; color: #475569; width: 35%; background-color: #f1f5f9;">Admin Account</td>
                  <td style="padding: 12px 16px; font-weight: 700; color: #0f172a;">${params.adminEmail}</td>
                </tr>
                <tr style="border-bottom: 1px solid #e2e8f0;">
                  <td style="padding: 12px 16px; font-weight: 700; color: #475569; background-color: #f1f5f9;">Time (UAE GST)</td>
                  <td style="padding: 12px 16px; font-weight: 600; color: #0f172a;">${params.ipInfo.timeUae}</td>
                </tr>
                <tr style="border-bottom: 1px solid #e2e8f0;">
                  <td style="padding: 12px 16px; font-weight: 700; color: #475569; background-color: #f1f5f9;">Time (UTC)</td>
                  <td style="padding: 12px 16px; color: #64748b;">${params.ipInfo.timeUtc}</td>
                </tr>
                <tr style="border-bottom: 1px solid #e2e8f0;">
                  <td style="padding: 12px 16px; font-weight: 700; color: #475569; background-color: #f1f5f9;">IP Address</td>
                  <td style="padding: 12px 16px; font-family: monospace; font-weight: 700; color: #0284c7;">${params.ipInfo.ip}</td>
                </tr>
                <tr style="border-bottom: 1px solid #e2e8f0;">
                  <td style="padding: 12px 16px; font-weight: 700; color: #475569; background-color: #f1f5f9;">Location</td>
                  <td style="padding: 12px 16px; font-weight: 600; color: #0f172a;">${params.ipInfo.city}, ${params.ipInfo.region}, ${params.ipInfo.country}</td>
                </tr>
                <tr style="border-bottom: 1px solid #e2e8f0;">
                  <td style="padding: 12px 16px; font-weight: 700; color: #475569; background-color: #f1f5f9;">Network / ISP</td>
                  <td style="padding: 12px 16px; color: #334155;">${params.ipInfo.isp}</td>
                </tr>
                <tr style="border-bottom: 1px solid #e2e8f0;">
                  <td style="padding: 12px 16px; font-weight: 700; color: #475569; background-color: #f1f5f9;">Device & OS</td>
                  <td style="padding: 12px 16px; color: #0f172a;">${params.ipInfo.deviceType} • ${params.ipInfo.os}</td>
                </tr>
                <tr>
                  <td style="padding: 12px 16px; font-weight: 700; color: #475569; background-color: #f1f5f9;">Web Browser</td>
                  <td style="padding: 12px 16px; color: #0f172a;">${params.ipInfo.browser}</td>
                </tr>
              </table>

              <!-- Actionable Security Response Section -->
              <div style="background-color: #fffbeb; border: 1px solid #fef3c7; border-left: 4px solid #f59e0b; border-radius: 8px; padding: 16px; margin-bottom: 20px;">
                <h4 style="color: #92400e; font-size: 13px; font-weight: 800; margin: 0 0 6px 0;">
                  🚨 Recognize this sign-in?
                </h4>
                <p style="color: #78350f; font-size: 12px; margin: 0; line-height: 1.6;">
                  If this was you or an authorized colleague, no further action is needed. If you did <strong>NOT</strong> authorize this session, an intruder has gained access.
                  <br/><br/>
                  <strong>Immediate Action Required:</strong>
                  Go to <a href="https://console.firebase.google.com" target="_blank" style="color: #b45309; font-weight: 700; text-decoration: underline;">Firebase Console &gt; Authentication</a> and <strong>change your password immediately</strong>.
                  The application has active session monitoring and will automatically terminate the intruder's session the moment your password is updated.
                </p>
              </div>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f8fafc; border-top: 1px solid #e2e8f0; padding: 18px 30px; text-align: center;">
              <p style="color: #94a3b8; font-size: 11px; margin: 0; line-height: 1.5;">
                Cool Technologies LLC • Automated Security Dispatch • Mussafah M-14, Abu Dhabi, UAE
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  return sendBrevoEmail({
    apiKey,
    senderName,
    senderEmail,
    recipients: ADMIN_SECURITY_RECIPIENTS,
    subject: `[Cool Technologies] 🚨 Security Alert: Admin Login Detected (${params.ipInfo.city}, ${params.ipInfo.country})`,
    htmlContent,
  });
}

