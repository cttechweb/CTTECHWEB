import { authenticateRequest, optionalAuthenticate, requireRole } from "../auth/middleware";
import { Env } from "../env";

function formatJob(row: any): any {
  return {
    id: row.id,
    title: row.title,
    department: row.department,
    location: row.location || "Abu Dhabi, UAE",
    type: row.type || "Full-Time",
    experience: row.experience || "2-4 Years",
    summary: row.summary || "",
    responsibilities: typeof row.responsibilities_json === "string" ? JSON.parse(row.responsibilities_json || "[]") : (row.responsibilities_json || []),
    requirements: typeof row.requirements_json === "string" ? JSON.parse(row.requirements_json || "[]") : (row.requirements_json || []),
    salaryRange: row.salary_range || "Competitive / Based on Experience",
    isUrgent: row.is_urgent === 1,
    isActive: row.is_active === 1,
    order: row.display_order || 0,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function handleGetJobs(request: Request, env: Env): Promise<Response> {
  const authUser = await optionalAuthenticate(request, env);
  const isStaff = authUser && (authUser.role === "admin" || authUser.role === "superAdmin" || authUser.role === "sales");

  let query = "SELECT * FROM jobs WHERE is_active = 1 ORDER BY display_order ASC, created_at DESC";
  if (isStaff) {
    query = "SELECT * FROM jobs ORDER BY display_order ASC, created_at DESC";
  }

  const { results } = await env.DB.prepare(query).all<any>();
  const formatted = (results || []).map(formatJob);

  return new Response(JSON.stringify({ status: "success", count: formatted.length, jobs: formatted }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}

export async function handleGetJobById(jobId: string, env: Env): Promise<Response> {
  const job = await env.DB.prepare("SELECT * FROM jobs WHERE id = ?").bind(jobId).first<any>();

  if (!job) {
    return new Response(
      JSON.stringify({ error: "Not Found", message: `Job vacancy '${jobId}' not found` }),
      { status: 404, headers: { "Content-Type": "application/json" } }
    );
  }

  return new Response(JSON.stringify({ status: "success", job: formatJob(job) }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}

export async function handleCreateOrUpdateJob(request: Request, env: Env, targetId?: string): Promise<Response> {
  const user = await authenticateRequest(request, env);
  requireRole(user, ["admin", "superAdmin", "sales"]);

  const body = (await request.json()) as any;
  const id = targetId || body.id || `job-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  const title = (body.title || "").trim();
  const department = (body.department || "Engineering").trim();
  const location = (body.location || "Abu Dhabi, UAE").trim();
  const type = (body.type || "Full-Time").trim();
  const experience = (body.experience || "2-4 Years").trim();
  const summary = (body.summary || "").trim();
  const responsibilitiesJson = JSON.stringify(body.responsibilities || []);
  const requirementsJson = JSON.stringify(body.requirements || []);
  const salaryRange = (body.salaryRange || body.salary_range || "Competitive / Based on Experience").trim();
  const isUrgent = body.isUrgent ? 1 : 0;
  const isActive = body.isActive !== undefined ? (body.isActive ? 1 : 0) : 1;
  const displayOrder = typeof body.order === "number" ? body.order : (typeof body.displayOrder === "number" ? body.displayOrder : 0);

  if (!title || !department) {
    return new Response(
      JSON.stringify({ error: "Bad Request", message: "Job title and department are required." }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  await env.DB.prepare(`
    INSERT INTO jobs (
      id, title, department, location, type, experience, summary,
      responsibilities_json, requirements_json, salary_range, is_urgent, is_active, display_order,
      created_at, updated_at
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    ON CONFLICT(id) DO UPDATE SET
      title = excluded.title,
      department = excluded.department,
      location = excluded.location,
      type = excluded.type,
      experience = excluded.experience,
      summary = excluded.summary,
      responsibilities_json = excluded.responsibilities_json,
      requirements_json = excluded.requirements_json,
      salary_range = excluded.salary_range,
      is_urgent = excluded.is_urgent,
      is_active = excluded.is_active,
      display_order = excluded.display_order,
      updated_at = CURRENT_TIMESTAMP
  `)
    .bind(
      id,
      title,
      department,
      location,
      type,
      experience,
      summary,
      responsibilitiesJson,
      requirementsJson,
      salaryRange,
      isUrgent,
      isActive,
      displayOrder
    )
    .run();

  const saved = await env.DB.prepare("SELECT * FROM jobs WHERE id = ?").bind(id).first<any>();

  return new Response(
    JSON.stringify({ status: "success", message: "Job vacancy saved to D1", job: formatJob(saved) }),
    { status: 200, headers: { "Content-Type": "application/json" } }
  );
}

export async function handleDeleteJob(jobId: string, request: Request, env: Env): Promise<Response> {
  const user = await authenticateRequest(request, env);
  requireRole(user, ["admin", "superAdmin"]);

  await env.DB.prepare("DELETE FROM jobs WHERE id = ?").bind(jobId).run();

  return new Response(
    JSON.stringify({ status: "success", message: `Job vacancy '${jobId}' deleted from D1` }),
    { status: 200, headers: { "Content-Type": "application/json" } }
  );
}

export async function handleGetCareersConfig(request: Request, env: Env): Promise<Response> {
  const row = await env.DB.prepare("SELECT * FROM careers_config WHERE id = 'default'").first<any>();

  let config: any = null;
  if (row) {
    config = {
      heroTitle: row.hero_title || "Careers at Cool Technologies",
      heroSubtitle: row.hero_subtitle || "Join a team dedicated to innovation and industrial cooling solutions.",
      heroBadge: row.hero_badge || "JOIN OUR TEAM",
      hrEmail: row.hr_email || "careers@cooltech.ae",
      hrPhone: row.hr_phone || "+971 2 565 0123",
      hrAddress: row.hr_address || "Plot-99, Sector M-42, Mussafah Industrial Area, Abu Dhabi, UAE",
      hrWorkingHours: row.hr_working_hours || "Mon - Sat: 8:00 AM - 6:00 PM",
      allowGeneralApplications: row.allow_general_applications === 1,
      equalOpportunityText: row.equal_opportunity_text || "Cool Technologies is an Equal Opportunity Employer.",
      benefits: typeof row.benefits_json === "string" ? JSON.parse(row.benefits_json || "[]") : (row.benefits_json || []),
      updatedAt: row.updated_at,
    };
  }

  return new Response(JSON.stringify({ status: "success", config }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}

export async function handleSaveCareersConfig(request: Request, env: Env): Promise<Response> {
  const user = await authenticateRequest(request, env);
  requireRole(user, ["admin", "superAdmin"]);

  const body = (await request.json()) as any;
  const heroTitle = (body.heroTitle || "Careers at Cool Technologies").trim();
  const heroSubtitle = (body.heroSubtitle || "").trim();
  const heroBadge = (body.heroBadge || "JOIN OUR TEAM").trim();
  const hrEmail = (body.hrEmail || "careers@cooltech.ae").trim();
  const hrPhone = (body.hrPhone || "+971 2 565 0123").trim();
  const hrAddress = (body.hrAddress || "Abu Dhabi, UAE").trim();
  const hrWorkingHours = (body.hrWorkingHours || "Mon - Sat: 8:00 AM - 6:00 PM").trim();
  const allowGeneralApplications = body.allowGeneralApplications ? 1 : 0;
  const equalOpportunityText = (body.equalOpportunityText || "").trim();
  const benefitsJson = JSON.stringify(body.benefits || []);

  await env.DB.prepare(`
    INSERT INTO careers_config (
      id, hero_title, hero_subtitle, hero_badge, hr_email, hr_phone, hr_address,
      hr_working_hours, allow_general_applications, equal_opportunity_text, benefits_json, updated_at
    )
    VALUES ('default', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    ON CONFLICT(id) DO UPDATE SET
      hero_title = excluded.hero_title,
      hero_subtitle = excluded.hero_subtitle,
      hero_badge = excluded.hero_badge,
      hr_email = excluded.hr_email,
      hr_phone = excluded.hr_phone,
      hr_address = excluded.hr_address,
      hr_working_hours = excluded.hr_working_hours,
      allow_general_applications = excluded.allow_general_applications,
      equal_opportunity_text = excluded.equal_opportunity_text,
      benefits_json = excluded.benefits_json,
      updated_at = CURRENT_TIMESTAMP
  `)
    .bind(
      heroTitle,
      heroSubtitle,
      heroBadge,
      hrEmail,
      hrPhone,
      hrAddress,
      hrWorkingHours,
      allowGeneralApplications,
      equalOpportunityText,
      benefitsJson
    )
    .run();

  return new Response(
    JSON.stringify({ status: "success", message: "Careers configuration saved to D1" }),
    { status: 200, headers: { "Content-Type": "application/json" } }
  );
}
