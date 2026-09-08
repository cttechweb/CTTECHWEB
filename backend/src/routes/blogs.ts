import { authenticateRequest, optionalAuthenticate, requireRole } from "../auth/middleware";
import { Env } from "../env";

function formatBlog(row: any): any {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    category: row.category || "Engineering",
    author: row.author || "Cool Technologies Engineering Team",
    authorRole: row.author_role || "HVAC Solutions Specialist",
    excerpt: row.excerpt || "",
    intro: row.excerpt || "",
    contentHtml: row.content_html || "",
    image: row.image_url || "",
    readTime: row.read_time || "5 min read",
    status: row.status || "published",
    sections: typeof row.sections_json === "string" ? JSON.parse(row.sections_json || "[]") : (row.sections_json || []),
    seoSettings: typeof row.seo_json === "string" ? JSON.parse(row.seo_json || "{}") : (row.seo_json || {}),
    date: row.created_at,
    lastUpdated: row.updated_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function handleGetBlogs(request: Request, env: Env): Promise<Response> {
  const authUser = await optionalAuthenticate(request, env);
  const isStaff = authUser && (authUser.role === "admin" || authUser.role === "superAdmin" || authUser.role === "sales");

  let query = "SELECT * FROM blogs WHERE status = 'published' ORDER BY created_at DESC";
  if (isStaff) {
    query = "SELECT * FROM blogs ORDER BY created_at DESC";
  }

  const { results } = await env.DB.prepare(query).all<any>();
  const formatted = (results || []).map(formatBlog);

  return new Response(JSON.stringify({ status: "success", count: formatted.length, blogs: formatted }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}

export async function handleGetBlogById(blogId: string, env: Env): Promise<Response> {
  const blog = await env.DB.prepare("SELECT * FROM blogs WHERE id = ?").bind(blogId).first<any>();

  if (!blog) {
    return new Response(
      JSON.stringify({ error: "Not Found", message: `Blog post '${blogId}' not found` }),
      { status: 404, headers: { "Content-Type": "application/json" } }
    );
  }

  return new Response(JSON.stringify({ status: "success", blog: formatBlog(blog) }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}

export async function handleGetBlogBySlug(slug: string, env: Env): Promise<Response> {
  const blog = await env.DB.prepare("SELECT * FROM blogs WHERE slug = ?").bind(slug).first<any>();

  if (!blog) {
    return new Response(
      JSON.stringify({ error: "Not Found", message: `Blog post with slug '${slug}' not found` }),
      { status: 404, headers: { "Content-Type": "application/json" } }
    );
  }

  return new Response(JSON.stringify({ status: "success", blog: formatBlog(blog) }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}

export async function handleCreateOrUpdateBlog(request: Request, env: Env, targetId?: string): Promise<Response> {
  const user = await authenticateRequest(request, env);
  requireRole(user, ["admin", "superAdmin", "sales"]);

  const body = (await request.json()) as any;
  const id = targetId || body.id || `blog-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  const title = (body.title || "").trim();
  const slug = (body.slug || title.toLowerCase().replace(/[^a-z0-9]+/g, "-")).trim();
  const category = (body.category || "HVAC Engineering").trim();
  const author = (body.author || user.name || "Cool Technologies Engineering Team").trim();
  const authorRole = (body.authorRole || body.author_role || "Technical Lead").trim();
  const excerpt = (body.excerpt || body.intro || "").trim();
  const contentHtml = body.contentHtml || body.content_html || "";
  const imageUrl = (body.image || body.imageUrl || body.image_url || "").trim();
  const readTime = (body.readTime || body.read_time || "5 min read").trim();
  const status = body.status || "published";
  const sectionsJson = JSON.stringify(body.sections || []);
  const seoJson = JSON.stringify(body.seoSettings || body.seo_json || {});

  if (!title || !slug) {
    return new Response(
      JSON.stringify({ error: "Bad Request", message: "Blog title and slug are required." }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  await env.DB.prepare(`
    INSERT INTO blogs (
      id, slug, title, category, author, author_role, excerpt, content_html, image_url,
      read_time, status, sections_json, seo_json, created_at, updated_at
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    ON CONFLICT(id) DO UPDATE SET
      slug = excluded.slug,
      title = excluded.title,
      category = excluded.category,
      author = excluded.author,
      author_role = excluded.author_role,
      excerpt = excluded.excerpt,
      content_html = excluded.content_html,
      image_url = excluded.image_url,
      read_time = excluded.read_time,
      status = excluded.status,
      sections_json = excluded.sections_json,
      seo_json = excluded.seo_json,
      updated_at = CURRENT_TIMESTAMP
  `)
    .bind(
      id,
      slug,
      title,
      category,
      author,
      authorRole,
      excerpt,
      contentHtml,
      imageUrl,
      readTime,
      status,
      sectionsJson,
      seoJson
    )
    .run();

  const saved = await env.DB.prepare("SELECT * FROM blogs WHERE id = ?").bind(id).first<any>();

  return new Response(
    JSON.stringify({ status: "success", message: "Blog post saved to D1", blog: formatBlog(saved) }),
    { status: 200, headers: { "Content-Type": "application/json" } }
  );
}

export async function handleDeleteBlog(blogId: string, request: Request, env: Env): Promise<Response> {
  const user = await authenticateRequest(request, env);
  requireRole(user, ["admin", "superAdmin"]);

  await env.DB.prepare("DELETE FROM blogs WHERE id = ?").bind(blogId).run();

  return new Response(
    JSON.stringify({ status: "success", message: `Blog post '${blogId}' deleted from D1` }),
    { status: 200, headers: { "Content-Type": "application/json" } }
  );
}
