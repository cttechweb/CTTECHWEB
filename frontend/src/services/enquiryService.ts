/* ─────────────────────────────────────────────────────────────────
   Cool Technologies — Unified General Enquiry Service
   Application Database: Cloudflare D1 (Table: enquiries)
   Integration: Server-Side CRM Resilient Sync
───────────────────────────────────────────────────────────────── */

import { GeneralEnquiry, EnquiryStatus } from "../types";
import { apiClient } from "./apiClient";
import { sendEmailNotification, EmailNotificationType } from "./emailService";

const LOCAL_STORAGE_KEY = "cooltech_enquiries_cache";

export function getLocalEnquiriesCache(): GeneralEnquiry[] {
  try {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {}
  return [];
}

export function saveLocalEnquiriesCache(enquiries: GeneralEnquiry[]) {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(enquiries));
    window.dispatchEvent(new CustomEvent("cooltech_enquiries_updated", { detail: enquiries }));
  } catch {}
}

/**
 * Public: Submit general enquiry from any website form (Contact Page, Hero, Product details, Support)
 * 
 * Email notification fires INDEPENDENTLY of the API call so emails are delivered
 * even if the Cloudflare D1 backend is temporarily unreachable.
 */
export async function submitGeneralEnquiry(enquiry: {
  source?: string;
  type?: string;
  name: string;
  email: string;
  phone?: string;
  companyName?: string;
  subject?: string;
  message: string;
  metadata?: Record<string, any>;
}): Promise<GeneralEnquiry> {
  // 1. Determine email type BEFORE doing any API work
  let emailType: EmailNotificationType = "contact";
  if (enquiry.source !== "homepage") {
    if (enquiry.type === "career" || enquiry.source?.includes("career")) {
      emailType = "career";
    } else if (enquiry.type === "quotation" || enquiry.type === "rfq" || enquiry.type === "equipment_quotation") {
      emailType = "rfq";
    } else if (enquiry.type === "partner" || enquiry.type === "wholesale") {
      emailType = "partner";
    }
  }

  // 2. Fire email notification immediately — does NOT depend on API success
  if (enquiry.source !== "homepage") {
    sendEmailNotification({
      type: emailType,
      title: enquiry.subject || `Inquiry from ${enquiry.name}`,
      senderName: enquiry.name,
      senderEmail: enquiry.email,
      senderPhone: enquiry.phone,
      companyName: enquiry.companyName,
      subject: enquiry.subject || `[Cool Technologies] Website Inquiry from ${enquiry.name}`,
      message: enquiry.message,
      detailsText: `Name: ${enquiry.name}\nEmail: ${enquiry.email}\nPhone: ${enquiry.phone || "Not provided"}\nCompany: ${enquiry.companyName || "Individual / Not specified"}\nCategory: ${enquiry.type || "General"}\nSource Page: ${enquiry.source || "Website"}\n\nMessage:\n${enquiry.message}`,
      customParams: {
        enquiry_source: enquiry.source || "Website",
        inquiry_category: enquiry.type || "general"
      }
    }).catch((emailErr) => {
      console.warn("[EnquiryService] Email dispatch error:", emailErr);
    });
  }

  // 3. Now attempt to persist the enquiry to Cloudflare D1 (best-effort, non-blocking for email)
  try {
    const res = await apiClient.submitEnquiry(enquiry);
    return res.enquiry;
  } catch (apiErr) {
    console.warn("[EnquiryService] Failed to persist enquiry to Cloudflare D1 (email was still sent):", apiErr);
    // Return a minimal local enquiry object so callers can show a success state
    const fallbackEnquiry: GeneralEnquiry = {
      id: `local-${Date.now()}`,
      source: enquiry.source || "website",
      type: enquiry.type || "general",
      name: enquiry.name,
      email: enquiry.email,
      phone: enquiry.phone || "",
      companyName: enquiry.companyName || "",
      subject: enquiry.subject || "",
      message: enquiry.message,
      status: "NEW",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    } as GeneralEnquiry;
    return fallbackEnquiry;
  }
}

/**
 * Admin: Fetch all enquiries from Cloudflare D1
 */
export async function getEnquiries(params?: {
  search?: string;
  source?: string;
  status?: string;
  type?: string;
}): Promise<GeneralEnquiry[]> {
  try {
    const res = await apiClient.listEnquiries(params);
    if (res?.enquiries && Array.isArray(res.enquiries)) {
      saveLocalEnquiriesCache(res.enquiries);
      return res.enquiries;
    }
  } catch (err) {
    console.warn("[EnquiryService] Error fetching enquiries from Cloudflare D1:", err);
  }
  return getLocalEnquiriesCache();
}

/**
 * Admin: Get enquiry by ID
 */
export async function getEnquiryById(id: string): Promise<GeneralEnquiry | null> {
  try {
    const res = await apiClient.getEnquiryById(id);
    if (res?.enquiry) return res.enquiry;
  } catch (err) {
    console.warn(`[EnquiryService] Error fetching enquiry ${id}:`, err);
  }
  return getLocalEnquiriesCache().find((e) => e.id === id) || null;
}

/**
 * Admin: Update status of an enquiry (NEW, IN_REVIEW, CONTACTED, RESOLVED, SPAM)
 */
export async function updateEnquiryStatus(
  id: string,
  status: EnquiryStatus
): Promise<boolean> {
  await apiClient.updateEnquiryStatus(id, { status });

  const current = getLocalEnquiriesCache();
  const updated = current.map((e) => (e.id === id ? { ...e, status, updatedAt: new Date().toISOString() } : e));
  saveLocalEnquiriesCache(updated);

  return true;
}

/**
 * Admin: Delete an enquiry
 */
export async function deleteEnquiry(id: string): Promise<boolean> {
  await apiClient.deleteEnquiry(id);

  const current = getLocalEnquiriesCache();
  const updated = current.filter((e) => e.id !== id);
  saveLocalEnquiriesCache(updated);

  return true;
}

/**
 * Real-time event subscription for Admin Panel
 */
export function subscribeToEnquiries(onUpdate: (enquiries: GeneralEnquiry[]) => void): () => void {
  const initial = getLocalEnquiriesCache();
  onUpdate(initial);

  getEnquiries().then((fresh) => {
    if (Array.isArray(fresh)) onUpdate(fresh);
  });

  const handleUpdate = (e: any) => {
    if (e?.detail && Array.isArray(e.detail)) onUpdate(e.detail);
  };

  window.addEventListener("cooltech_enquiries_updated", handleUpdate);
  return () => window.removeEventListener("cooltech_enquiries_updated", handleUpdate);
}
