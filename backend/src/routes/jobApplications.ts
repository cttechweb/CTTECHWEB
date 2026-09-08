import { authenticateRequest, optionalAuthenticate, requireRole } from "../auth/middleware";
import { Env } from "../env";

function formatApplication(row: any): any {
  return {
    id: row.id,
    jobId: row.job_id,
    jobTitle: row.job_title,
    fullName: row.full_name,
    email: row.email,
    phone: row.phone,
    coverMessage: row.cover_message || "",
    resumeUrl: row.resume_url || "",
    resumeFileName: row.resume_file_name || "",
    status: row.status || "new",
    notes: row.notes || "",
    submittedAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function handleGetApplications(request: Request, env: Env): Promise<Response> {
  const user = await authenticateRequest(request, env);
  requireRole(user, ["admin", "superAdmin", "sales"]);

  const { results } = await env.DB.prepare(
    "SELECT * FROM job_applications ORDER BY created_at DESC"
  ).all<any>();

  const formatted = (results || []).map(formatApplication);

  return new Response(JSON.stringify({ status: "success", count: formatted.length, applications: formatted }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}

export async function handleGetApplicationById(appId: string, request: Request, env: Env): Promise<Response> {
  const user = await authenticateRequest(request, env);
  requireRole(user, ["admin", "superAdmin", "sales"]);

  const app = await env.DB.prepare("SELECT * FROM job_applications WHERE id = ?").bind(appId).first<any>();

  if (!app) {
    return new Response(
      JSON.stringify({ error: "Not Found", message: `Job application '${appId}' not found` }),
      { status: 404, headers: { "Content-Type": "application/json" } }
    );
  }

  return new Response(JSON.stringify({ status: "success", application: formatApplication(app) }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}

export async function handleSubmitApplication(request: Request, env: Env): Promise<Response> {
  const authUser = await optionalAuthenticate(request, env);

  const body = (await request.json()) as any;
  const id = body.id || `app-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  const jobId = (body.jobId || body.job_id || "general").trim();
  const jobTitle = (body.jobTitle || body.job_title || "General Application").trim();
  const fullName = (body.fullName || body.full_name || authUser?.name || "").trim();
  const email = (body.email || authUser?.email || "").trim();
  const phone = (body.phone || "").trim();
  const coverMessage = (body.coverMessage || body.cover_message || body.message || "").trim();
  const resumeUrl = (body.resumeUrl || body.resume_url || "").trim();
  const resumeFileName = (body.resumeFileName || body.resume_file_name || "").trim();

  if (!fullName || !email || !phone) {
    return new Response(
      JSON.stringify({ error: "Bad Request", message: "Full Name, Email, and Phone number are required." }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  await env.DB.prepare(`
    INSERT INTO job_applications (
      id, job_id, job_title, full_name, email, phone, cover_message,
      resume_url, resume_file_name, status, notes, created_at, updated_at
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'new', '', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
  `)
    .bind(
      id,
      jobId,
      jobTitle,
      fullName,
      email,
      phone,
      coverMessage,
      resumeUrl,
      resumeFileName
    )
    .run();

  const saved = await env.DB.prepare("SELECT * FROM job_applications WHERE id = ?").bind(id).first<any>();

  return new Response(
    JSON.stringify({
      status: "success",
      message: "Job application submitted successfully to Cool Technologies HR",
      application: formatApplication(saved),
    }),
    { status: 201, headers: { "Content-Type": "application/json" } }
  );
}

export async function handleUpdateApplication(appId: string, request: Request, env: Env): Promise<Response> {
  const user = await authenticateRequest(request, env);
  requireRole(user, ["admin", "superAdmin", "sales"]);

  const body = (await request.json()) as any;
  const app = await env.DB.prepare("SELECT * FROM job_applications WHERE id = ?").bind(appId).first<any>();

  if (!app) {
    return new Response(
      JSON.stringify({ error: "Not Found", message: `Job application '${appId}' not found` }),
      { status: 404, headers: { "Content-Type": "application/json" } }
    );
  }

  const status = body.status || app.status;
  const notes = body.notes !== undefined ? body.notes : app.notes;

  await env.DB.prepare(`
    UPDATE job_applications 
    SET status = ?, notes = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `)
    .bind(status, notes, appId)
    .run();

  const updated = await env.DB.prepare("SELECT * FROM job_applications WHERE id = ?").bind(appId).first<any>();

  return new Response(
    JSON.stringify({ status: "success", message: "Application updated in D1", application: formatApplication(updated) }),
    { status: 200, headers: { "Content-Type": "application/json" } }
  );
}

export async function handleDeleteApplication(appId: string, request: Request, env: Env): Promise<Response> {
  const user = await authenticateRequest(request, env);
  requireRole(user, ["admin", "superAdmin"]);

  await env.DB.prepare("DELETE FROM job_applications WHERE id = ?").bind(appId).run();

  return new Response(
    JSON.stringify({ status: "success", message: `Job application '${appId}' deleted from D1` }),
    { status: 200, headers: { "Content-Type": "application/json" } }
  );
}
