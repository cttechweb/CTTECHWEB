import { authenticateRequest, requireRole } from "../auth/middleware";
import { Env } from "../env";

function formatWorkflow(row: any): any {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    description: row.description || "",
    displayMode: row.display_mode || "text",
    image: row.image_url || "",
    imagePosition: row.image_position || "50% 50%",
    badge: row.badge || "",
    iconName: row.icon_name || "Sparkles",
    targetCategory: row.target_category || "",
    steps: typeof row.steps_json === "string" ? JSON.parse(row.steps_json || "[]") : (row.steps_json || []),
    isActive: row.is_active === 1,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function handleGetWorkflows(request: Request, env: Env): Promise<Response> {
  const { results } = await env.DB.prepare(
    "SELECT * FROM workflows WHERE is_active = 1 ORDER BY name ASC"
  ).all<any>();

  const formatted = (results || []).map(formatWorkflow);

  return new Response(JSON.stringify({ status: "success", count: formatted.length, workflows: formatted }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}

export async function handleGetWorkflowById(workflowId: string, env: Env): Promise<Response> {
  const workflow = await env.DB.prepare("SELECT * FROM workflows WHERE id = ?").bind(workflowId).first<any>();

  if (!workflow) {
    return new Response(
      JSON.stringify({ error: "Not Found", message: `Workflow '${workflowId}' not found` }),
      { status: 404, headers: { "Content-Type": "application/json" } }
    );
  }

  return new Response(JSON.stringify({ status: "success", workflow: formatWorkflow(workflow) }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}

export async function handleGetWorkflowBySlug(slug: string, env: Env): Promise<Response> {
  const workflow = await env.DB.prepare("SELECT * FROM workflows WHERE slug = ? AND is_active = 1").bind(slug).first<any>();

  if (!workflow) {
    return new Response(
      JSON.stringify({ error: "Not Found", message: `Workflow with slug '${slug}' not found` }),
      { status: 404, headers: { "Content-Type": "application/json" } }
    );
  }

  return new Response(JSON.stringify({ status: "success", workflow: formatWorkflow(workflow) }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}

export async function handleSaveWorkflow(request: Request, env: Env, targetId?: string): Promise<Response> {
  const user = await authenticateRequest(request, env);
  requireRole(user, ["admin", "superAdmin", "sales"]);

  const body = (await request.json()) as any;
  const id = targetId || body.id || `wf_${Date.now()}`;
  const name = (body.name || "").trim();
  const slug = (body.slug || name.toLowerCase().replace(/[^a-z0-9]+/g, "-")).trim();
  const description = (body.description || "").trim();
  const targetCategory = (body.targetCategory || body.target_category || "").trim();
  const stepsJson = typeof body.steps === "string" ? body.steps : JSON.stringify(body.steps || []);

  if (!name) {
    return new Response(
      JSON.stringify({ error: "Bad Request", message: "Workflow name is required." }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  await env.DB.prepare(`
    INSERT INTO workflows (id, name, slug, description, target_category, steps_json, is_active, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    ON CONFLICT(id) DO UPDATE SET
      name = excluded.name,
      slug = excluded.slug,
      description = excluded.description,
      target_category = excluded.target_category,
      steps_json = excluded.steps_json,
      is_active = 1,
      updated_at = CURRENT_TIMESTAMP
  `)
    .bind(id, name, slug, description, targetCategory, stepsJson)
    .run();

  const saved = await env.DB.prepare("SELECT * FROM workflows WHERE id = ?").bind(id).first<any>();

  return new Response(
    JSON.stringify({ status: "success", message: "Workflow saved to D1", workflow: formatWorkflow(saved) }),
    { status: 200, headers: { "Content-Type": "application/json" } }
  );
}

export async function handleDeactivateWorkflow(workflowId: string, request: Request, env: Env): Promise<Response> {
  const user = await authenticateRequest(request, env);
  requireRole(user, ["admin", "superAdmin"]);

  await env.DB.prepare("UPDATE workflows SET is_active = 0, updated_at = CURRENT_TIMESTAMP WHERE id = ?")
    .bind(workflowId)
    .run();

  return new Response(
    JSON.stringify({ status: "success", message: `Workflow '${workflowId}' deactivated` }),
    { status: 200, headers: { "Content-Type": "application/json" } }
  );
}
