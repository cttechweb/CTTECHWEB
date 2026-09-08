/**
 * Central API Client for Cool Technologies Cloudflare Worker Backend
 * Base URL: https://cooltech-api-worker.ctauhweb.workers.dev
 * Handles automatic Firebase ID token retrieval, authorization headers, and error parsing.
 */

import { auth } from "../lib/firebase";
import { sendEmailNotification } from "./emailService";

export class ApiError extends Error {
  status: number;
  statusText: string;
  data: any;

  constructor(status: number, statusText: string, message: string, data?: any) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.statusText = statusText;
    this.data = data;
  }
}

export interface RequestOptions extends RequestInit {
  requiresAuth?: boolean;
  params?: Record<string, string | number | boolean | undefined | null>;
}

const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL || "https://cooltech-api-worker.ctauhweb.workers.dev"
).replace(/\/+$/, "");

/**
 * Obtain the currently active Firebase user's ID token
 */
export async function getFirebaseIdToken(forceRefresh = false): Promise<string | null> {
  const currentUser = auth.currentUser;
  if (!currentUser) return null;
  try {
    return await currentUser.getIdToken(forceRefresh);
  } catch (error) {
    console.error("[ApiClient] Error fetching Firebase ID token:", error);
    return null;
  }
}

/**
 * Core request dispatcher
 */
async function request<T = any>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const { requiresAuth = false, params, headers = {}, ...customConfig } = options;

  let url = endpoint.startsWith("http") ? endpoint : `${API_BASE_URL}${endpoint.startsWith("/") ? "" : "/"}${endpoint}`;

  if (params) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, String(value));
      }
    });
    const queryString = searchParams.toString();
    if (queryString) {
      url += (url.includes("?") ? "&" : "?") + queryString;
    }
  }

  const reqHeaders: Record<string, string> = {
    "Content-Type": "application/json",
    ...(headers as Record<string, string>),
  };

  // Attach Firebase ID token if authenticated or requested
  if (requiresAuth || auth.currentUser) {
    const token = await getFirebaseIdToken();
    if (token) {
      reqHeaders["Authorization"] = `Bearer ${token}`;
    } else if (requiresAuth) {
      throw new ApiError(401, "Unauthorized", "User is not authenticated. Please log in.");
    }
  }

  const config: RequestInit = {
    ...customConfig,
    headers: reqHeaders,
  };

  try {
    const response = await fetch(url, config);

    // Handle 204 No Content
    if (response.status === 204) {
      return null as any;
    }

    let responseData: any;
    const contentType = response.headers.get("content-type") || "";

    if (contentType.includes("application/json")) {
      responseData = await response.json();
    } else {
      responseData = await response.text();
    }

    if (!response.ok) {
      const errorMessage =
        (typeof responseData === "object" && (responseData?.message || responseData?.error)) ||
        response.statusText ||
        "An error occurred while communicating with the server.";

      throw new ApiError(response.status, response.statusText, errorMessage, responseData);
    }

    return responseData as T;
  } catch (err: any) {
    if (err instanceof ApiError) {
      throw err;
    }
    // Network failure / connection refused
    console.error(`[ApiClient Error] ${config.method || "GET"} ${url}:`, err);
    throw new ApiError(0, "Network Error", err?.message || "Failed to connect to the backend API.");
  }
}

export const apiClient = {
  get: <T = any>(endpoint: string, options?: RequestOptions) =>
    request<T>(endpoint, { ...options, method: "GET" }),

  post: <T = any>(endpoint: string, body?: any, options?: RequestOptions) =>
    request<T>(endpoint, {
      ...options,
      method: "POST",
      body: body ? JSON.stringify(body) : undefined,
    }),

  put: <T = any>(endpoint: string, body?: any, options?: RequestOptions) =>
    request<T>(endpoint, {
      ...options,
      method: "PUT",
      body: body ? JSON.stringify(body) : undefined,
    }),

  delete: <T = any>(endpoint: string, options?: RequestOptions) =>
    request<T>(endpoint, { ...options, method: "DELETE" }),

  // High-level typed API endpoints
  health: () => apiClient.get("/api/health"),

  // Auth & Profile
  getMe: () => apiClient.get("/api/auth/me", { requiresAuth: true }),
  syncAuth: (name?: string) => apiClient.post("/api/auth/sync", { name }, { requiresAuth: true }),
  getProfile: () => apiClient.get("/api/users/profile", { requiresAuth: true }),
  updateProfile: (profile: {
    name: string;
    phone?: string;
    address?: string;
    company_name?: string;
    companyName?: string;
    designation?: string;
    default_shipping_address?: string;
    defaultShippingAddress?: string;
    billing_address?: string;
    billingAddress?: string;
  }) => apiClient.put("/api/users/profile", profile, { requiresAuth: true }),

  // Products
  getProducts: (params?: { category?: string; brand?: string; search?: string; limit?: number }) =>
    apiClient.get("/api/products", { params }),
  getProductById: (id: string) => apiClient.get(`/api/products/${id}`),
  createProduct: (product: any) => apiClient.post("/api/products", product, { requiresAuth: true }),
  updateProduct: (id: string, product: any) => apiClient.put(`/api/products/${id}`, product, { requiresAuth: true }),
  deactivateProduct: (id: string) => apiClient.delete(`/api/products/${id}`, { requiresAuth: true }),
  deleteProduct: (id: string) => apiClient.delete(`/api/products/${id}`, { requiresAuth: true }),
  bulkImportProducts: (products: any[]) => apiClient.post("/api/products/bulk", { products }, { requiresAuth: true }),

  // Categories
  getCategories: () => apiClient.get("/api/categories"),
  getCategoryById: (id: string) => apiClient.get(`/api/categories/${id}`),
  createCategory: (category: any) => apiClient.post("/api/categories", category, { requiresAuth: true }),
  updateCategory: (id: string, category: any) => apiClient.put(`/api/categories/${id}`, category, { requiresAuth: true }),
  deactivateCategory: (id: string) => apiClient.delete(`/api/categories/${id}`, { requiresAuth: true }),
  reorderCategories: (orderedIds: string[]) => apiClient.post("/api/categories/reorder", { orderedIds }, { requiresAuth: true }),

  // Brands
  getBrands: () => apiClient.get("/api/brands"),
  getBrandById: (id: string) => apiClient.get(`/api/brands/${id}`),
  createBrand: (brand: any) => apiClient.post("/api/brands", brand, { requiresAuth: true }),
  updateBrand: (id: string, brand: any) => apiClient.put(`/api/brands/${id}`, brand, { requiresAuth: true }),
  deactivateBrand: (id: string) => apiClient.delete(`/api/brands/${id}`, { requiresAuth: true }),

  // Quotes / Sourcing Requests / RFQs
  submitQuote: (quoteData: any) => apiClient.post("/api/quotes", quoteData),
  getMyQuotes: () => apiClient.get("/api/quotes/my", { requiresAuth: true }),
  getQuoteById: (id: string) => apiClient.get(`/api/quotes/${id}`, { requiresAuth: true }),
  updateQuote: (id: string, updateData: any) => apiClient.put(`/api/quotes/${id}`, updateData, { requiresAuth: true }),
  listAllQuotes: () => apiClient.get("/api/quotes", { requiresAuth: true }),

  // B2B Orders
  createOrder: (orderData: any) => apiClient.post("/api/orders", orderData),
  getMyOrders: () => apiClient.get("/api/orders/my", { requiresAuth: true }),
  getOrderById: (id: string) => apiClient.get(`/api/orders/${id}`, { requiresAuth: true }),
  updateOrder: (id: string, updateData: any) => apiClient.put(`/api/orders/${id}`, updateData, { requiresAuth: true }),
  listAllOrders: () => apiClient.get("/api/orders", { requiresAuth: true }),

  // Companies
  listCompanies: () => apiClient.get("/api/companies", { requiresAuth: true }),
  getMyCompany: () => apiClient.get("/api/companies/my", { requiresAuth: true }),
  getCompanyById: (id: string) => apiClient.get(`/api/companies/${id}`, { requiresAuth: true }),
  createCompany: (company: any) => apiClient.post("/api/companies", company, { requiresAuth: true }),
  updateCompany: (id: string, company: any) => apiClient.put(`/api/companies/${id}`, company, { requiresAuth: true }),

  // B2B Retailer Applications
  applyRetailer: async (applicationData: any) => {
    const res = await apiClient.post("/api/retailer/apply", applicationData, { requiresAuth: true });
    try {
      const companyName = applicationData.companyName || applicationData.legalName || "B2B Trade Client";
      const contactPerson = applicationData.contactPerson || companyName;
      const email = applicationData.email || "";
      const phone = applicationData.phone || applicationData.whatsappNumber || "Not provided";
      
      sendEmailNotification({
        type: "b2b_application",
        title: `B2B Portal Submission: ${companyName}`,
        senderName: contactPerson,
        senderEmail: email,
        senderPhone: phone,
        companyName: companyName,
        subject: `[Cool Technologies] B2B Wholesale Application - ${companyName}`,
        message: `A new commercial trade partner application has been submitted via the B2B portal.`,
        detailsText: `Company Legal Name: ${companyName}\nTrade License No: ${applicationData.tradeLicenseNumber || "Not provided"}\nBusiness Type: ${applicationData.businessType || "LLC"}\nContact Person: ${contactPerson} (${applicationData.designation || "Executive"})\nPhone: ${phone}\nEmail: ${email}\nLocation: ${applicationData.address || ""}, ${applicationData.city || ""}, ${applicationData.emirate || "UAE"}\nAnnual Volume Estimate: ${applicationData.annualVolumeEstimate || "N/A"}\nPayment Terms Requested: ${applicationData.paymentTermsRequested || "Advance / Credit"}\nInterested Products: ${Array.isArray(applicationData.interestedCategories) ? applicationData.interestedCategories.join(", ") : applicationData.interestedCategories || "All HVAC Equipment"}\nLicense Document: ${applicationData.tradeLicenseFileUrl || "Attached in portal"}`,
        customParams: {
          license_number: applicationData.tradeLicenseNumber || "",
          volume_estimate: applicationData.annualVolumeEstimate || "",
          emirate: applicationData.emirate || "UAE"
        }
      }).catch((e) => console.warn("[APIClient] B2B email alert error:", e));
    } catch {}
    return res;
  },
  getMyRetailerApplication: () =>
    apiClient.get("/api/retailer/my-application", { requiresAuth: true }),
  listRetailerApplications: () =>
    apiClient.get("/api/retailer/applications", { requiresAuth: true }),
  getRetailerApplicationById: (id: string) =>
    apiClient.get(`/api/retailer/applications/${id}`, { requiresAuth: true }),
  reviewRetailerApplication: (id: string, reviewData: { status: string; rejectionReason?: string }) =>
    apiClient.put(`/api/retailer/applications/${id}`, reviewData, { requiresAuth: true }),

  // Engineering Services
  getServices: () => apiClient.get("/api/services"),
  getServiceById: (id: string) => apiClient.get(`/api/services/${id}`),
  createService: (service: any) => apiClient.post("/api/services", service, { requiresAuth: true }),
  updateService: (id: string, service: any) => apiClient.put(`/api/services/${id}`, service, { requiresAuth: true }),
  deleteService: (id: string) => apiClient.delete(`/api/services/${id}`, { requiresAuth: true }),

  // Selection Workflows
  getWorkflows: () => apiClient.get("/api/workflows"),
  getWorkflowById: (id: string) => apiClient.get(`/api/workflows/${id}`),
  getWorkflowBySlug: (slug: string) => apiClient.get(`/api/workflows/slug/${slug}`),
  saveWorkflow: (workflow: any) => apiClient.post("/api/workflows", workflow, { requiresAuth: true }),
  updateWorkflow: (id: string, workflow: any) => apiClient.put(`/api/workflows/${id}`, workflow, { requiresAuth: true }),
  deleteWorkflow: (id: string) => apiClient.delete(`/api/workflows/${id}`, { requiresAuth: true }),

  // Blogs & Technical Articles
  getBlogs: () => apiClient.get("/api/blogs"),
  getBlogById: (id: string) => apiClient.get(`/api/blogs/${id}`),
  getBlogBySlug: (slug: string) => apiClient.get(`/api/blogs/slug/${slug}`),
  createBlog: (blog: any) => apiClient.post("/api/blogs", blog, { requiresAuth: true }),
  updateBlog: (id: string, blog: any) => apiClient.put(`/api/blogs/${id}`, blog, { requiresAuth: true }),
  deleteBlog: (id: string) => apiClient.delete(`/api/blogs/${id}`, { requiresAuth: true }),

  // Customer Reviews
  getReviews: () => apiClient.get("/api/reviews"),
  getReviewById: (id: string) => apiClient.get(`/api/reviews/${id}`),
  submitReview: (review: any) => apiClient.post("/api/reviews", review),
  updateReview: (id: string, review: any) => apiClient.put(`/api/reviews/${id}`, review, { requiresAuth: true }),
  deleteReview: (id: string) => apiClient.delete(`/api/reviews/${id}`, { requiresAuth: true }),

  // Careers & Job Vacancies
  getJobs: () => apiClient.get("/api/jobs"),
  getJobById: (id: string) => apiClient.get(`/api/jobs/${id}`),
  createJob: (job: any) => apiClient.post("/api/jobs", job, { requiresAuth: true }),
  updateJob: (id: string, job: any) => apiClient.put(`/api/jobs/${id}`, job, { requiresAuth: true }),
  deleteJob: (id: string) => apiClient.delete(`/api/jobs/${id}`, { requiresAuth: true }),

  // Careers Page Configuration
  getCareersConfig: () => apiClient.get("/api/careers/config"),
  saveCareersConfig: (config: any) => apiClient.post("/api/careers/config", config, { requiresAuth: true }),

  // Job Applications
  getApplications: () => apiClient.get("/api/applications", { requiresAuth: true }),
  getApplicationById: (id: string) => apiClient.get(`/api/applications/${id}`, { requiresAuth: true }),
  submitApplication: (application: any) => apiClient.post("/api/applications", application),
  updateApplication: (id: string, application: any) => apiClient.put(`/api/applications/${id}`, application, { requiresAuth: true }),
  deleteApplication: (id: string) => apiClient.delete(`/api/applications/${id}`, { requiresAuth: true }),

  // General Enquiries (Unified Website Inquiries)
  submitEnquiry: (enquiry: any) => apiClient.post("/api/enquiries", enquiry),
  listEnquiries: (params?: { search?: string; source?: string; status?: string; type?: string }) =>
    apiClient.get("/api/enquiries", { params, requiresAuth: true }),
  getEnquiryById: (id: string) => apiClient.get(`/api/enquiries/${id}`, { requiresAuth: true }),
  updateEnquiryStatus: (id: string, updateData: { status: string; crmRecordId?: string; crmSyncStatus?: string }) =>
    apiClient.put(`/api/enquiries/${id}`, updateData, { requiresAuth: true }),
  deleteEnquiry: (id: string) => apiClient.delete(`/api/enquiries/${id}`, { requiresAuth: true }),

  // CRM Integration Health & Status (Admin Only)
  getCrmHealthStatus: () => apiClient.get("/api/admin/crm/health", { requiresAuth: true }),
};

export default apiClient;
