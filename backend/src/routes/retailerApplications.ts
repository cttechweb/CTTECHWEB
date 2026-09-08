import { authenticateRequest, requireRole } from "../auth/middleware";
import { Env } from "../env";
import { syncRetailerApplicationToCrm } from "../crm/crmService";

function formatApplication(row: any): any {
  return {
    id: row.id,
    userId: row.user_id,
    companyName: row.company_name,
    legalName: row.legal_name || row.company_name,
    tradeLicenseNumber: row.trade_license_number || "",
    taxRegistrationNumber: row.tax_registration_number || "",
    contactPerson: row.contact_person,
    email: row.email,
    phone: row.phone,
    city: row.city,
    emirate: row.emirate || row.city || "",
    address: row.address || "",
    designation: row.designation || "",
    whatsappNumber: row.whatsapp_number || "",
    annualVolumeEstimate: row.annual_volume_estimate || "",
    businessType: row.business_type || "contractor",
    interestedCategories: row.interested_categories || "",
    paymentTermsRequested: row.payment_terms_requested || "",
    tradeLicenseDocUrl: row.trade_license_doc_url || row.trade_license_file_url || "",
    taxCertificateDocUrl: row.tax_certificate_doc_url || row.tax_certificate_file_url || "",
    tradeLicenseFileUrl: row.trade_license_file_url || row.trade_license_doc_url || "",
    taxCertificateFileUrl: row.tax_certificate_file_url || row.tax_certificate_doc_url || "",
    applicationPayloadJson: row.application_payload_json || null,
    status: row.status || "pending",
    rejectionReason: row.rejection_reason || "",
    reviewedBy: row.reviewed_by || "",
    reviewedAt: row.reviewed_at || "",
    crmRecordId: row.crm_record_id || null,
    crmSyncStatus: row.crm_sync_status || "pending",
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function handleRetailerApply(request: Request, env: Env): Promise<Response> {
  const user = await authenticateRequest(request, env);
  const body = (await request.json()) as any;

  const id = `APP-2026-${Math.floor(100000 + Math.random() * 900000)}`;
  const companyName = (body.companyName || body.company || "").trim();
  const legalName = (body.legalName || body.legal_name || companyName).trim();
  const tradeLicenseNumber = (body.tradeLicenseNumber || body.trade_license_number || "").trim();
  const taxRegistrationNumber = (body.taxRegistrationNumber || body.tax_registration_number || body.taxId || "").trim();
  const contactPerson = (body.contactPerson || body.contactName || body.name || user.name || "").trim();
  const email = (body.email || user.email || "").trim();
  const phone = (body.phone || "").trim();
  const city = (body.city || "Abu Dhabi").trim();
  const emirate = (body.emirate || body.city || "Abu Dhabi").trim();
  const address = (body.address || "").trim();
  const designation = (body.designation || "").trim();
  const whatsappNumber = (body.whatsappNumber || body.whatsapp_number || phone).trim();
  const annualVolumeEstimate = (body.annualVolumeEstimate || body.annual_volume_estimate || body.volume || "").trim();
  const businessType = (body.businessType || body.business_type || "contractor").trim();
  const interestedCategories = Array.isArray(body.interestedCategories)
    ? JSON.stringify(body.interestedCategories)
    : (body.interestedCategories || body.interested_categories || "").trim();
  const paymentTermsRequested = (body.paymentTermsRequested || body.payment_terms_requested || "Standard Trade").trim();
  const tradeLicenseFileUrl = (body.tradeLicenseFileUrl || body.trade_license_file_url || body.tradeLicenseDocUrl || "").trim();
  const taxCertificateFileUrl = (body.taxCertificateFileUrl || body.tax_certificate_file_url || body.taxCertificateDocUrl || "").trim();
  const applicationPayloadJson = body.applicationPayloadJson
    ? (typeof body.applicationPayloadJson === "string" ? body.applicationPayloadJson : JSON.stringify(body.applicationPayloadJson))
    : (body.customFields ? JSON.stringify(body.customFields) : null);

  if (!companyName || !phone) {
    return new Response(
      JSON.stringify({ error: "Bad Request", message: "Company Name and Contact Phone are required." }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  // Duplicate Application Protection: Check if user already has an active pending/under_review or approved application
  const existingApp = await env.DB.prepare(
    "SELECT * FROM retailer_applications WHERE user_id = ? ORDER BY created_at DESC LIMIT 1"
  )
    .bind(user.uid)
    .first<any>();

  if (existingApp) {
    if (existingApp.status === "pending" || existingApp.status === "under_review") {
      return new Response(
        JSON.stringify({
          error: "Conflict",
          message: `You already have an active B2B Retailer Application (${existingApp.status.replace("_", " ")}). Please allow our team time to complete verification.`,
          application: formatApplication(existingApp),
        }),
        { status: 409, headers: { "Content-Type": "application/json" } }
      );
    }
    if (existingApp.status === "approved" || user.isVerifiedRetailer) {
      return new Response(
        JSON.stringify({
          error: "Conflict",
          message: "Your account is already an approved Cool Technologies B2B Partner.",
          application: formatApplication(existingApp),
        }),
        { status: 409, headers: { "Content-Type": "application/json" } }
      );
    }
  }

  // 1. Insert application in D1 (strictly force status to 'pending')
  await env.DB.prepare(`
    INSERT INTO retailer_applications (
      id, user_id, company_name, legal_name, trade_license_number, tax_registration_number,
      contact_person, email, phone, city, emirate, address, designation, whatsapp_number,
      annual_volume_estimate, business_type, interested_categories, payment_terms_requested,
      trade_license_doc_url, tax_certificate_doc_url, trade_license_file_url, tax_certificate_file_url,
      application_payload_json, status, created_at, updated_at
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
  `)
    .bind(
      id,
      user.uid,
      companyName,
      legalName,
      tradeLicenseNumber,
      taxRegistrationNumber,
      contactPerson,
      email,
      phone,
      city,
      emirate,
      address,
      designation,
      whatsappNumber,
      annualVolumeEstimate,
      businessType,
      interestedCategories,
      paymentTermsRequested,
      tradeLicenseFileUrl,
      taxCertificateFileUrl,
      tradeLicenseFileUrl,
      taxCertificateFileUrl,
      applicationPayloadJson
    )
    .run();

  // 2. Also ensure company record exists
  const companyId = `comp-${user.uid.substring(0, 10)}`;
  await env.DB.prepare(`
    INSERT INTO companies (
      id, name, legal_name, tax_id, email, phone, city, address, tier, status, created_at, updated_at
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'Standard', 'active', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    ON CONFLICT(id) DO UPDATE SET
      name = excluded.name,
      tax_id = excluded.tax_id,
      phone = excluded.phone,
      city = excluded.city,
      updated_at = CURRENT_TIMESTAMP
  `)
    .bind(companyId, companyName, legalName, taxRegistrationNumber, email, phone, city, address)
    .run();

  // 3. Link user in users table
  await env.DB.prepare(`
    UPDATE users SET company_name = ?, company_id = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?
  `)
    .bind(companyName, companyId, user.uid)
    .run();

  const saved = await env.DB.prepare("SELECT * FROM retailer_applications WHERE id = ?").bind(id).first<any>();

  // 4. Dispatch vendor-neutral outbound event to CRM (resilient & non-blocking)
  try {
    const crmResult = await syncRetailerApplicationToCrm("retailer.application.created", {
      application_id: id,
      user_id: user.uid,
      company_name: companyName,
      legal_name: legalName,
      trade_license_number: tradeLicenseNumber,
      tax_registration_number: taxRegistrationNumber,
      business_type: businessType,
      emirate: emirate || city,
      address,
      city,
      contact_person: contactPerson,
      designation,
      email,
      phone,
      whatsapp_number: whatsappNumber,
      interested_categories: interestedCategories,
      annual_volume_estimate: annualVolumeEstimate,
      payment_terms_requested: paymentTermsRequested,
      trade_license_url: tradeLicenseFileUrl,
      tax_certificate_url: taxCertificateFileUrl,
      status: "pending",
      created_at: saved?.created_at || new Date().toISOString(),
      updated_at: saved?.updated_at || new Date().toISOString(),
    }, env);

    if (crmResult.success && crmResult.crmRecordId) {
      await env.DB.prepare(`
        UPDATE retailer_applications
        SET crm_record_id = ?, crm_sync_status = 'synced', crm_last_synced_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `)
        .bind(crmResult.crmRecordId, id)
        .run();
    } else if (!crmResult.success) {
      await env.DB.prepare(`
        UPDATE retailer_applications
        SET crm_sync_status = 'failed', crm_sync_error = ?
        WHERE id = ?
      `)
        .bind(crmResult.error || "CRM sync failed", id)
        .run();
    }
  } catch (syncErr) {
    console.warn("[Retailer App Sync] Non-blocking CRM sync error:", syncErr);
  }

  return new Response(
    JSON.stringify({
      status: "success",
      message: "B2B Retailer Application submitted successfully to Cloudflare D1",
      application: formatApplication(saved),
    }),
    { status: 201, headers: { "Content-Type": "application/json" } }
  );
}

export async function handleGetMyRetailerApplication(request: Request, env: Env): Promise<Response> {
  const user = await authenticateRequest(request, env);

  const application = await env.DB.prepare(
    "SELECT * FROM retailer_applications WHERE user_id = ? ORDER BY created_at DESC LIMIT 1"
  )
    .bind(user.uid)
    .first<any>();

  return new Response(JSON.stringify({ status: "success", application: application ? formatApplication(application) : null }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}

export async function handleListRetailerApplications(request: Request, env: Env): Promise<Response> {
  const user = await authenticateRequest(request, env);
  requireRole(user, ["admin", "superAdmin", "sales"]);

  const { results } = await env.DB.prepare(
    "SELECT * FROM retailer_applications ORDER BY created_at DESC"
  ).all<any>();

  const formatted = (results || []).map(formatApplication);

  return new Response(JSON.stringify({ status: "success", count: formatted.length, applications: formatted }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}

export async function handleGetRetailerApplicationById(appId: string, request: Request, env: Env): Promise<Response> {
  const user = await authenticateRequest(request, env);

  const app = await env.DB.prepare("SELECT * FROM retailer_applications WHERE id = ?").bind(appId).first<any>();

  if (!app) {
    return new Response(
      JSON.stringify({ error: "Not Found", message: `Application '${appId}' not found` }),
      { status: 404, headers: { "Content-Type": "application/json" } }
    );
  }

  // Isolation check: owner or admin
  if (app.user_id !== user.uid && user.role !== "admin" && user.role !== "superAdmin" && user.role !== "sales") {
    return new Response(
      JSON.stringify({ error: "Forbidden", message: "You do not have permission to view this application" }),
      { status: 403, headers: { "Content-Type": "application/json" } }
    );
  }

  return new Response(JSON.stringify({ status: "success", application: formatApplication(app) }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}

export async function handleReviewRetailerApplication(appId: string, request: Request, env: Env): Promise<Response> {
  const user = await authenticateRequest(request, env);
  requireRole(user, ["admin", "superAdmin"]);

  const body = (await request.json()) as any;
  const status = body.status || "approved"; // 'approved', 'rejected', 'under_review'
  const rejectionReason = body.rejectionReason || body.rejection_reason || "";

  await env.DB.prepare(`
    UPDATE retailer_applications 
    SET status = ?, rejection_reason = ?, reviewed_by = ?, reviewed_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `)
    .bind(status, rejectionReason, user.email, appId)
    .run();

  // If approved, grant verified retailer status and role; if rejected, revoke it
  const app = await env.DB.prepare("SELECT * FROM retailer_applications WHERE id = ?").bind(appId).first<any>();
  if (app) {
    if (status === "approved") {
      await env.DB.prepare(`
        UPDATE users 
        SET is_verified_retailer = 1, role = 'retailer', updated_at = CURRENT_TIMESTAMP 
        WHERE id = ?
      `)
        .bind(app.user_id)
        .run();
    } else if (status === "rejected") {
      await env.DB.prepare(`
        UPDATE users 
        SET is_verified_retailer = 0, role = CASE WHEN role = 'retailer' THEN 'customer' ELSE role END, updated_at = CURRENT_TIMESTAMP 
        WHERE id = ?
      `)
        .bind(app.user_id)
        .run();
    }

    // Dispatch status change to CRM
    try {
      const eventType = status === "approved" 
        ? "retailer.application.approved" 
        : status === "rejected" 
        ? "retailer.application.rejected" 
        : "retailer.application.updated";

      await syncRetailerApplicationToCrm(eventType, {
        application_id: app.id,
        user_id: app.user_id,
        company_name: app.company_name,
        legal_name: app.legal_name,
        trade_license_number: app.trade_license_number,
        tax_registration_number: app.tax_registration_number,
        business_type: app.business_type,
        emirate: app.emirate || app.city,
        address: app.address,
        city: app.city,
        contact_person: app.contact_person,
        designation: app.designation,
        email: app.email,
        phone: app.phone,
        whatsapp_number: app.whatsapp_number,
        interested_categories: app.interested_categories,
        annual_volume_estimate: app.annual_volume_estimate,
        payment_terms_requested: app.payment_terms_requested,
        trade_license_url: app.trade_license_file_url || app.trade_license_doc_url,
        tax_certificate_url: app.tax_certificate_file_url || app.tax_certificate_doc_url,
        status: status as any,
        created_at: app.created_at,
        updated_at: new Date().toISOString(),
      }, env);
    } catch (err) {
      console.warn("[Retailer Review Sync] Non-blocking CRM sync error:", err);
    }
  }

  return new Response(JSON.stringify({ status: "success", message: `Application '${appId}' marked as ${status}` }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}
