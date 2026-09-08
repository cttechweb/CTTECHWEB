import { Env } from "./env";
import { handleUpload } from "./routes/upload";
import { handleHealth } from "./routes/health";
import { handleAuthMe, handleAuthSync } from "./routes/auth";
import { handleGetProfile, handleUpdateProfile, handleListUsers } from "./routes/users";
import { 
  handleGetProducts, 
  handleGetProductById, 
  handleCreateOrUpdateProduct, 
  handleDeactivateProduct, 
  handleBulkImportProducts 
} from "./routes/products";
import {
  handleGetCategories,
  handleGetCategoryById,
  handleCreateOrUpdateCategory,
  handleDeactivateCategory,
  handleReorderCategories
} from "./routes/categories";
import {
  handleGetBrands,
  handleGetBrandById,
  handleCreateOrUpdateBrand,
  handleDeactivateBrand
} from "./routes/brands";
import { 
  handleSubmitQuote, 
  handleGetMyQuotes, 
  handleListAllQuotes,
  handleGetQuoteById,
  handleUpdateQuote
} from "./routes/quotes";
import {
  handleCreateOrder,
  handleGetMyOrders,
  handleGetOrderById,
  handleUpdateOrder,
  handleListAllOrders
} from "./routes/orders";
import {
  handleListCompanies,
  handleGetMyCompany,
  handleGetCompanyById,
  handleCreateOrUpdateCompany
} from "./routes/companies";
import {
  handleRetailerApply,
  handleGetMyRetailerApplication,
  handleListRetailerApplications,
  handleGetRetailerApplicationById,
  handleReviewRetailerApplication
} from "./routes/retailerApplications";
import { 
  handleGetWorkflows, 
  handleGetWorkflowById, 
  handleGetWorkflowBySlug, 
  handleSaveWorkflow, 
  handleDeactivateWorkflow 
} from "./routes/workflows";
import { 
  handleGetServices, 
  handleGetServiceById, 
  handleCreateOrUpdateService, 
  handleDeactivateService 
} from "./routes/services";
import {
  handleGetBlogs,
  handleGetBlogById,
  handleGetBlogBySlug,
  handleCreateOrUpdateBlog,
  handleDeleteBlog
} from "./routes/blogs";
import {
  handleGetReviews,
  handleGetReviewById,
  handleSubmitReview,
  handleUpdateReview,
  handleDeleteReview
} from "./routes/reviews";
import {
  handleGetJobs,
  handleGetJobById,
  handleCreateOrUpdateJob,
  handleDeleteJob,
  handleGetCareersConfig,
  handleSaveCareersConfig
} from "./routes/jobs";
import {
  handleGetApplications,
  handleGetApplicationById,
  handleSubmitApplication,
  handleUpdateApplication,
  handleDeleteApplication
} from "./routes/jobApplications";
import {
  handleSubmitEnquiry,
  handleListEnquiries,
  handleGetEnquiryById,
  handleUpdateEnquiryStatus,
  handleDeleteEnquiry
} from "./routes/enquiries";
import { handleCrmWebhook } from "./crm/webhookHandler";
import { handleGetCrmStatus } from "./routes/crmStatus";

function getCorsHeaders(origin: string | null, env: Env): HeadersInit {
  const allowedOrigin = env.CORS_ORIGIN || "*";
  return {
    "Access-Control-Allow-Origin": allowedOrigin === "*" ? (origin || "*") : allowedOrigin,
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Requested-With",
    "Access-Control-Max-Age": "86400",
  };
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);
    const path = url.pathname;
    const method = request.method.toUpperCase();
    const origin = request.headers.get("Origin");

    // 1. Handle CORS Preflight
    if (method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: getCorsHeaders(origin, env),
      });
    }

    // 2. Dispatch Routes
    let response: Response;

    try {
      if (path === "/api/health" && method === "GET") {
        response = await handleHealth(request, env);
      } else if ((path === "/api/upload" || path === "/api/upload/file") && method === "POST") {
        response = await handleUpload(request, env);
      } else if (path === "/api/auth/me" && method === "GET") {
        response = await handleAuthMe(request, env);
      } else if (path === "/api/auth/sync" && method === "POST") {
        response = await handleAuthSync(request, env);
      } else if (path === "/api/users/profile" && method === "GET") {
        response = await handleGetProfile(request, env);
      } else if (path === "/api/users/profile" && method === "PUT") {
        response = await handleUpdateProfile(request, env);
      } else if (path === "/api/users" && method === "GET") {
        response = await handleListUsers(request, env);
      } else if (path === "/api/products" && method === "GET") {
        response = await handleGetProducts(request, env);
      } else if (path === "/api/products/bulk" && method === "POST") {
        response = await handleBulkImportProducts(request, env);
      } else if (path.startsWith("/api/products/") && method === "GET") {
        const productId = path.replace("/api/products/", "");
        response = await handleGetProductById(productId, env);
      } else if (path.startsWith("/api/products/") && method === "PUT") {
        const productId = path.replace("/api/products/", "");
        response = await handleCreateOrUpdateProduct(request, env, productId);
      } else if (path.startsWith("/api/products/") && method === "DELETE") {
        const productId = path.replace("/api/products/", "");
        response = await handleDeactivateProduct(productId, request, env);
      } else if (path === "/api/products" && method === "POST") {
        response = await handleCreateOrUpdateProduct(request, env);
      } else if (path === "/api/categories" && method === "GET") {
        response = await handleGetCategories(request, env);
      } else if (path === "/api/categories/reorder" && method === "POST") {
        response = await handleReorderCategories(request, env);
      } else if (path.startsWith("/api/categories/") && method === "GET") {
        const categoryId = path.replace("/api/categories/", "");
        response = await handleGetCategoryById(categoryId, env);
      } else if (path.startsWith("/api/categories/") && method === "PUT") {
        const categoryId = path.replace("/api/categories/", "");
        response = await handleCreateOrUpdateCategory(request, env, categoryId);
      } else if (path.startsWith("/api/categories/") && method === "DELETE") {
        const categoryId = path.replace("/api/categories/", "");
        response = await handleDeactivateCategory(categoryId, request, env);
      } else if (path === "/api/categories" && method === "POST") {
        response = await handleCreateOrUpdateCategory(request, env);
      } else if (path === "/api/brands" && method === "GET") {
        response = await handleGetBrands(request, env);
      } else if (path.startsWith("/api/brands/") && method === "GET") {
        const brandId = path.replace("/api/brands/", "");
        response = await handleGetBrandById(brandId, env);
      } else if (path.startsWith("/api/brands/") && method === "PUT") {
        const brandId = path.replace("/api/brands/", "");
        response = await handleCreateOrUpdateBrand(request, env, brandId);
      } else if (path.startsWith("/api/brands/") && method === "DELETE") {
        const brandId = path.replace("/api/brands/", "");
        response = await handleDeactivateBrand(brandId, request, env);
      } else if (path === "/api/brands" && method === "POST") {
        response = await handleCreateOrUpdateBrand(request, env);
      } else if ((path === "/api/quotes" || path === "/api/rfqs") && method === "POST") {
        response = await handleSubmitQuote(request, env);
      } else if ((path === "/api/quotes/my" || path === "/api/rfqs/my") && method === "GET") {
        response = await handleGetMyQuotes(request, env);
      } else if ((path.startsWith("/api/quotes/") || path.startsWith("/api/rfqs/")) && method === "GET") {
        const quoteId = path.replace("/api/quotes/", "").replace("/api/rfqs/", "");
        response = await handleGetQuoteById(quoteId, request, env);
      } else if ((path.startsWith("/api/quotes/") || path.startsWith("/api/rfqs/")) && method === "PUT") {
        const quoteId = path.replace("/api/quotes/", "").replace("/api/rfqs/", "");
        response = await handleUpdateQuote(quoteId, request, env);
      } else if ((path === "/api/quotes" || path === "/api/rfqs") && method === "GET") {
        response = await handleListAllQuotes(request, env);
      } else if (path === "/api/orders" && method === "POST") {
        response = await handleCreateOrder(request, env);
      } else if (path === "/api/orders/my" && method === "GET") {
        response = await handleGetMyOrders(request, env);
      } else if (path.startsWith("/api/orders/") && method === "GET") {
        const orderId = path.replace("/api/orders/", "");
        response = await handleGetOrderById(orderId, request, env);
      } else if (path.startsWith("/api/orders/") && method === "PUT") {
        const orderId = path.replace("/api/orders/", "");
        response = await handleUpdateOrder(orderId, request, env);
      } else if (path === "/api/orders" && method === "GET") {
        response = await handleListAllOrders(request, env);
      } else if (path === "/api/companies/my" && method === "GET") {
        response = await handleGetMyCompany(request, env);
      } else if (path === "/api/companies" && method === "GET") {
        response = await handleListCompanies(request, env);
      } else if (path === "/api/companies" && method === "POST") {
        response = await handleCreateOrUpdateCompany(request, env);
      } else if (path.startsWith("/api/companies/") && method === "GET") {
        const companyId = path.replace("/api/companies/", "");
        response = await handleGetCompanyById(companyId, request, env);
      } else if (path.startsWith("/api/companies/") && method === "PUT") {
        const companyId = path.replace("/api/companies/", "");
        response = await handleCreateOrUpdateCompany(request, env, companyId);
      } else if ((path === "/api/retailer/apply" || path === "/api/retailer-applications") && method === "POST") {
        response = await handleRetailerApply(request, env);
      } else if ((path === "/api/retailer/my-application" || path === "/api/retailer-applications/my") && method === "GET") {
        response = await handleGetMyRetailerApplication(request, env);
      } else if ((path === "/api/retailer/applications" || path === "/api/retailer-applications") && method === "GET") {
        response = await handleListRetailerApplications(request, env);
      } else if ((path.startsWith("/api/retailer/applications/") || path.startsWith("/api/retailer-applications/")) && method === "GET") {
        const appId = path.replace("/api/retailer/applications/", "").replace("/api/retailer-applications/", "");
        response = await handleGetRetailerApplicationById(appId, request, env);
      } else if ((path.startsWith("/api/retailer/applications/") || path.startsWith("/api/retailer-applications/")) && method === "PUT") {
        const appId = path.replace("/api/retailer/applications/", "").replace("/api/retailer-applications/", "");
        response = await handleReviewRetailerApplication(appId, request, env);
      } else if (path === "/api/workflows" && method === "GET") {
        response = await handleGetWorkflows(request, env);
      } else if (path.startsWith("/api/workflows/slug/") && method === "GET") {
        const slug = path.replace("/api/workflows/slug/", "");
        response = await handleGetWorkflowBySlug(slug, env);
      } else if (path.startsWith("/api/workflows/") && method === "GET") {
        const workflowId = path.replace("/api/workflows/", "");
        response = await handleGetWorkflowById(workflowId, env);
      } else if (path.startsWith("/api/workflows/") && method === "PUT") {
        const workflowId = path.replace("/api/workflows/", "");
        response = await handleSaveWorkflow(request, env, workflowId);
      } else if (path.startsWith("/api/workflows/") && method === "DELETE") {
        const workflowId = path.replace("/api/workflows/", "");
        response = await handleDeactivateWorkflow(workflowId, request, env);
      } else if (path === "/api/workflows" && method === "POST") {
        response = await handleSaveWorkflow(request, env);
      } else if (path === "/api/services" && method === "GET") {
        response = await handleGetServices(request, env);
      } else if (path.startsWith("/api/services/") && method === "GET") {
        const serviceId = path.replace("/api/services/", "");
        response = await handleGetServiceById(serviceId, env);
      } else if (path.startsWith("/api/services/") && method === "PUT") {
        const serviceId = path.replace("/api/services/", "");
        response = await handleCreateOrUpdateService(request, env, serviceId);
      } else if (path.startsWith("/api/services/") && method === "DELETE") {
        const serviceId = path.replace("/api/services/", "");
        response = await handleDeactivateService(serviceId, request, env);
      } else if (path === "/api/services" && method === "POST") {
        response = await handleCreateOrUpdateService(request, env);
      } else if (path === "/api/blogs" && method === "GET") {
        response = await handleGetBlogs(request, env);
      } else if (path.startsWith("/api/blogs/slug/") && method === "GET") {
        const slug = path.replace("/api/blogs/slug/", "");
        response = await handleGetBlogBySlug(slug, env);
      } else if (path.startsWith("/api/blogs/") && method === "GET") {
        const blogId = path.replace("/api/blogs/", "");
        response = await handleGetBlogById(blogId, env);
      } else if (path.startsWith("/api/blogs/") && method === "PUT") {
        const blogId = path.replace("/api/blogs/", "");
        response = await handleCreateOrUpdateBlog(request, env, blogId);
      } else if (path.startsWith("/api/blogs/") && method === "DELETE") {
        const blogId = path.replace("/api/blogs/", "");
        response = await handleDeleteBlog(blogId, request, env);
      } else if (path === "/api/blogs" && method === "POST") {
        response = await handleCreateOrUpdateBlog(request, env);
      } else if (path === "/api/reviews" && method === "GET") {
        response = await handleGetReviews(request, env);
      } else if (path.startsWith("/api/reviews/") && method === "GET") {
        const reviewId = path.replace("/api/reviews/", "");
        response = await handleGetReviewById(reviewId, env);
      } else if (path.startsWith("/api/reviews/") && method === "PUT") {
        const reviewId = path.replace("/api/reviews/", "");
        response = await handleUpdateReview(reviewId, request, env);
      } else if (path.startsWith("/api/reviews/") && method === "DELETE") {
        const reviewId = path.replace("/api/reviews/", "");
        response = await handleDeleteReview(reviewId, request, env);
      } else if (path === "/api/reviews" && method === "POST") {
        response = await handleSubmitReview(request, env);
      } else if (path === "/api/jobs" && method === "GET") {
        response = await handleGetJobs(request, env);
      } else if (path.startsWith("/api/jobs/") && method === "GET") {
        const jobId = path.replace("/api/jobs/", "");
        response = await handleGetJobById(jobId, env);
      } else if (path.startsWith("/api/jobs/") && method === "PUT") {
        const jobId = path.replace("/api/jobs/", "");
        response = await handleCreateOrUpdateJob(request, env, jobId);
      } else if (path.startsWith("/api/jobs/") && method === "DELETE") {
        const jobId = path.replace("/api/jobs/", "");
        response = await handleDeleteJob(jobId, request, env);
      } else if (path === "/api/jobs" && method === "POST") {
        response = await handleCreateOrUpdateJob(request, env);
      } else if (path === "/api/careers/config" && method === "GET") {
        response = await handleGetCareersConfig(request, env);
      } else if (path === "/api/careers/config" && (method === "POST" || method === "PUT")) {
        response = await handleSaveCareersConfig(request, env);
      } else if (path === "/api/applications" && method === "GET") {
        response = await handleGetApplications(request, env);
      } else if (path.startsWith("/api/applications/") && method === "GET") {
        const appId = path.replace("/api/applications/", "");
        response = await handleGetApplicationById(appId, request, env);
      } else if (path.startsWith("/api/applications/") && method === "PUT") {
        const appId = path.replace("/api/applications/", "");
        response = await handleUpdateApplication(appId, request, env);
      } else if (path.startsWith("/api/applications/") && method === "DELETE") {
        const appId = path.replace("/api/applications/", "");
        response = await handleDeleteApplication(appId, request, env);
      } else if (path === "/api/applications" && method === "POST") {
        response = await handleSubmitApplication(request, env);
      } else if (path === "/api/enquiries" && method === "GET") {
        response = await handleListEnquiries(request, env);
      } else if (path === "/api/enquiries" && method === "POST") {
        response = await handleSubmitEnquiry(request, env);
      } else if (path.startsWith("/api/enquiries/") && method === "GET") {
        const enquiryId = path.replace("/api/enquiries/", "");
        response = await handleGetEnquiryById(enquiryId, request, env);
      } else if (path.startsWith("/api/enquiries/") && method === "PUT") {
        const enquiryId = path.replace("/api/enquiries/", "");
        response = await handleUpdateEnquiryStatus(enquiryId, request, env);
      } else if (path.startsWith("/api/enquiries/") && method === "DELETE") {
        const enquiryId = path.replace("/api/enquiries/", "");
        response = await handleDeleteEnquiry(enquiryId, request, env);
      } else if ((path === "/api/admin/crm/health" || path === "/api/crm/status") && method === "GET") {
        response = await handleGetCrmStatus(request, env);
      } else if ((path === "/api/webhooks/crm" || path === "/api/crm/webhook") && method === "POST") {
        response = await handleCrmWebhook(request, env);
      } else {
        response = new Response(
          JSON.stringify({ error: "Not Found", message: `Endpoint '${method} ${path}' does not exist` }),
          { status: 404, headers: { "Content-Type": "application/json" } }
        );
      }
    } catch (err: any) {
      if (err instanceof Response) {
        response = err;
      } else {
        console.error(`[Worker API Error] ${method} ${path}:`, err);
        response = new Response(
          JSON.stringify({ error: "Internal Server Error", message: err?.message || "An unexpected error occurred" }),
          { status: 500, headers: { "Content-Type": "application/json" } }
        );
      }
    }

    // 3. Attach CORS headers to response
    const corsHeaders = getCorsHeaders(origin, env);
    const newHeaders = new Headers(response.headers);
    Object.entries(corsHeaders).forEach(([k, v]) => newHeaders.set(k, v));

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: newHeaders,
    });
  },
};
