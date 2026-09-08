import { authenticateRequest, optionalAuthenticate, requireRole } from "../auth/middleware";
import { Env } from "../env";

function formatReview(row: any): any {
  return {
    id: row.id,
    authorName: row.name,
    authorRole: row.role || "Client",
    location: row.location || row.project_type || "UAE",
    rating: typeof row.rating === "number" ? row.rating : 5,
    comment: row.text,
    target: row.target || (row.service_title ? "service" : "homepage"),
    serviceTitle: row.service_title || "",
    authorAvatar: row.author_avatar || "",
    status: row.status || "approved",
    createdAt: row.created_at,
    verifiedBooking: row.verified === 1,
  };
}

export async function handleGetReviews(request: Request, env: Env): Promise<Response> {
  const authUser = await optionalAuthenticate(request, env);
  const isStaff = authUser && (authUser.role === "admin" || authUser.role === "superAdmin" || authUser.role === "sales");

  let query = "SELECT * FROM reviews WHERE status = 'approved' ORDER BY created_at DESC";
  if (isStaff) {
    query = "SELECT * FROM reviews ORDER BY created_at DESC";
  }

  const { results } = await env.DB.prepare(query).all<any>();
  const formatted = (results || []).map(formatReview);

  return new Response(JSON.stringify({ status: "success", count: formatted.length, reviews: formatted }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}

export async function handleGetReviewById(reviewId: string, env: Env): Promise<Response> {
  const review = await env.DB.prepare("SELECT * FROM reviews WHERE id = ?").bind(reviewId).first<any>();

  if (!review) {
    return new Response(
      JSON.stringify({ error: "Not Found", message: `Review '${reviewId}' not found` }),
      { status: 404, headers: { "Content-Type": "application/json" } }
    );
  }

  return new Response(JSON.stringify({ status: "success", review: formatReview(review) }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}

export async function handleSubmitReview(request: Request, env: Env): Promise<Response> {
  const authUser = await optionalAuthenticate(request, env);
  const isStaff = authUser && (authUser.role === "admin" || authUser.role === "superAdmin" || authUser.role === "sales");

  const body = (await request.json()) as any;
  const id = body.id || `rev-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  const authorName = (body.authorName || body.name || authUser?.name || "Verified Customer").trim();
  const authorRole = (body.authorRole || body.role || "Client").trim();
  const company = (body.company || "").trim();
  const location = (body.location || body.projectType || "UAE").trim();
  const rating = typeof body.rating === "number" && body.rating >= 1 && body.rating <= 5 ? body.rating : 5;
  const comment = (body.comment || body.text || "").trim();
  const target = body.target || (body.serviceTitle ? "service" : "homepage");
  const serviceTitle = (body.serviceTitle || body.service || "").trim();
  const authorAvatar = (body.authorAvatar || "").trim();
  const verified = body.verifiedBooking || body.verified ? 1 : 1;

  // Moderation: normal submissions are 'pending', admin submissions can be 'approved'
  const status = isStaff ? (body.status || "approved") : "pending";

  if (!comment) {
    return new Response(
      JSON.stringify({ error: "Bad Request", message: "Review comment text is required." }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  // 1. Insert into reviews table
  await env.DB.prepare(`
    INSERT INTO reviews (
      id, name, company, role, rating, text, project_type, verified, status, created_at
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    ON CONFLICT(id) DO UPDATE SET
      name = excluded.name,
      company = excluded.company,
      role = excluded.role,
      rating = excluded.rating,
      text = excluded.text,
      project_type = excluded.project_type,
      verified = excluded.verified,
      status = excluded.status
  `)
    .bind(
      id,
      authorName,
      company,
      authorRole,
      rating,
      comment,
      location,
      verified,
      status
    )
    .run();

  // Try updating optional columns from migration 0005 if applied
  try {
    await env.DB.prepare(`
      UPDATE reviews 
      SET location = ?, target = ?, service_title = ?, author_avatar = ?
      WHERE id = ?
    `)
      .bind(location, target, serviceTitle, authorAvatar, id)
      .run();
  } catch {}

  const saved = await env.DB.prepare("SELECT * FROM reviews WHERE id = ?").bind(id).first<any>();

  return new Response(
    JSON.stringify({
      status: "success",
      message: status === "approved" ? "Review published successfully" : "Review submitted for moderation",
      review: formatReview(saved),
    }),
    { status: 201, headers: { "Content-Type": "application/json" } }
  );
}

export async function handleUpdateReview(reviewId: string, request: Request, env: Env): Promise<Response> {
  const user = await authenticateRequest(request, env);
  requireRole(user, ["admin", "superAdmin", "sales"]);

  const body = (await request.json()) as any;
  const review = await env.DB.prepare("SELECT * FROM reviews WHERE id = ?").bind(reviewId).first<any>();

  if (!review) {
    return new Response(
      JSON.stringify({ error: "Not Found", message: `Review '${reviewId}' not found` }),
      { status: 404, headers: { "Content-Type": "application/json" } }
    );
  }

  const name = body.authorName || body.name || review.name;
  const role = body.authorRole || body.role || review.role;
  const rating = typeof body.rating === "number" ? body.rating : review.rating;
  const text = body.comment || body.text || review.text;
  const status = body.status || review.status;
  const verified = body.verifiedBooking !== undefined ? (body.verifiedBooking ? 1 : 0) : (body.verified !== undefined ? (body.verified ? 1 : 0) : review.verified);

  await env.DB.prepare(`
    UPDATE reviews 
    SET name = ?, role = ?, rating = ?, text = ?, status = ?, verified = ?
    WHERE id = ?
  `)
    .bind(name, role, rating, text, status, verified, reviewId)
    .run();

  const updated = await env.DB.prepare("SELECT * FROM reviews WHERE id = ?").bind(reviewId).first<any>();

  return new Response(
    JSON.stringify({ status: "success", message: "Review updated in D1", review: formatReview(updated) }),
    { status: 200, headers: { "Content-Type": "application/json" } }
  );
}

export async function handleDeleteReview(reviewId: string, request: Request, env: Env): Promise<Response> {
  const user = await authenticateRequest(request, env);
  requireRole(user, ["admin", "superAdmin"]);

  await env.DB.prepare("DELETE FROM reviews WHERE id = ?").bind(reviewId).run();

  return new Response(
    JSON.stringify({ status: "success", message: `Review '${reviewId}' deleted from D1` }),
    { status: 200, headers: { "Content-Type": "application/json" } }
  );
}
