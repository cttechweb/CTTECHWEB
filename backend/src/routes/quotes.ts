import { authenticateRequest, optionalAuthenticate, requireRole } from "../auth/middleware";
import { Env } from "../env";
import { QuoteRecord } from "../types";
import { syncQuoteToCrm } from "../crm/crmService";

function formatQuote(row: any, items: any[] = []): any {
  let fallbackItems: any[] = [];
  try {
    if (row.products_json) {
      fallbackItems = typeof row.products_json === "string" ? JSON.parse(row.products_json) : row.products_json;
    }
  } catch {}

  const finalItems = (items && items.length > 0) ? items.map((i: any) => ({
    productId: i.product_id,
    productName: i.product_name,
    brand: i.brand || "",
    category: i.category || "",
    unitPrice: i.unit_price || 0,
    quantity: i.quantity || 1,
    subtotal: i.subtotal || ((i.unit_price || 0) * (i.quantity || 1)),
    notes: i.notes || "",
  })) : fallbackItems;

  let statusHistory: any[] = [];
  try {
    if (row.status_history_json) {
      statusHistory = typeof row.status_history_json === "string" ? JSON.parse(row.status_history_json) : row.status_history_json;
    }
  } catch {}

  return {
    id: row.id,
    rfqNumber: row.id,
    orderNumber: row.id,
    userId: row.user_id,
    companyId: row.company_id || "",
    customerName: row.customer_name || "",
    name: row.customer_name || "",
    customerEmail: row.customer_email || "",
    email: row.customer_email || "",
    customerPhone: row.customer_phone || "",
    phone: row.customer_phone || "",
    companyName: row.company_name || "",
    company: row.company_name || "",
    deliveryAddress: row.delivery_address || row.project_location || "",
    projectLocation: row.project_location || row.delivery_address || "",
    timeline: row.timeline || "immediate",
    loadRequirements: row.load_requirements || "",
    projectDescription: row.project_description || "",
    items: finalItems,
    products: finalItems,
    status: row.status || "Pending",
    quotedAmount: row.quoted_amount,
    proposalPrice: row.quoted_amount,
    adminNotes: row.admin_notes || "",
    internalNotes: row.admin_notes || "",
    assignedTo: row.assigned_to || "",
    statusHistory,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function handleSubmitQuote(request: Request, env: Env): Promise<Response> {
  const authUser = await optionalAuthenticate(request, env);
  const body = (await request.json()) as any;

  const id = body.id || body.orderNumber || body.rfqNumber || `RFQ-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;
  const userId = authUser ? authUser.uid : (body.userId || "anonymous");
  const companyId = body.companyId || "";
  const customerName = (body.customerName || body.name || body.customerSnapshot?.name || authUser?.name || "").trim() || "Valued Contractor";
  const customerEmail = (body.customerEmail || body.email || body.customerSnapshot?.email || authUser?.email || "").trim();
  const customerPhone = (body.customerPhone || body.phone || body.customerSnapshot?.phone || "").trim();
  const companyName = (body.companyName || body.company || body.customerSnapshot?.companyName || "").trim();
  const deliveryAddress = (body.deliveryAddress || body.address || body.projectLocation || body.customerSnapshot?.shippingAddress || "").trim();
  const projectLocation = (body.projectLocation || deliveryAddress || "UAE").trim();
  const timeline = (body.timeline || "immediate").trim();
  const loadRequirements = (body.loadRequirements || "").trim();
  const projectDescription = (body.projectDescription || body.notes || "").trim();
  const items = body.items || body.products || [];

  if (!items || !Array.isArray(items) || items.length === 0) {
    return new Response(
      JSON.stringify({ error: "Bad Request", message: "At least one product must be selected for the request." }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  // Format products snapshot
  const formattedItems = items.map((item: any) => ({
    productId: item.productId || item.product?.id || item.id || "custom-product",
    productName: item.productName || item.product?.name || item.name || "Commercial Equipment",
    quantity: typeof item.quantity === "number" && item.quantity > 0 ? item.quantity : 1,
    unitPrice: item.unitPrice || item.price || item.product?.price || 0,
    brand: item.brand || item.product?.brand || "General",
    category: item.category || item.product?.category || "Equipment",
    notes: item.notes || "",
  }));

  const productsJson = JSON.stringify(formattedItems);
  const now = new Date().toISOString();
  const initialStatusHistory = JSON.stringify([
    {
      status: "NEW",
      timestamp: now,
      updatedBy: customerName,
      notes: "Project quotation request submitted via online portal.",
    },
  ]);

  // 1. Insert/Upsert into quotes table
  await env.DB.prepare(`
    INSERT INTO quotes (
      id, user_id, customer_name, customer_email, customer_phone, company_name,
      delivery_address, project_description, products_json, status, created_at, updated_at
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'NEW', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    ON CONFLICT(id) DO UPDATE SET
      customer_name = excluded.customer_name,
      customer_email = excluded.customer_email,
      customer_phone = excluded.customer_phone,
      company_name = excluded.company_name,
      delivery_address = excluded.delivery_address,
      project_description = excluded.project_description,
      products_json = excluded.products_json,
      updated_at = CURRENT_TIMESTAMP
  `)
    .bind(
      id,
      userId,
      customerName,
      customerEmail,
      customerPhone,
      companyName,
      deliveryAddress,
      projectDescription,
      productsJson
    )
    .run();

  // Try updating optional columns if migration 0004 applied
  try {
    await env.DB.prepare(`
      UPDATE quotes 
      SET company_id = ?, project_location = ?, timeline = ?, load_requirements = ?, status_history_json = ?
      WHERE id = ?
    `)
      .bind(companyId, projectLocation, timeline, loadRequirements, initialStatusHistory, id)
      .run();
  } catch {}

  // 2. Insert into relational quote_items table if exists
  try {
    for (const item of formattedItems) {
      const itemId = `qi-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
      const subtotal = item.unitPrice * item.quantity;
      await env.DB.prepare(`
        INSERT INTO quote_items (
          id, quote_id, product_id, product_name, brand, category, unit_price, quantity, subtotal, notes, created_at
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
      `)
        .bind(
          itemId,
          id,
          item.productId,
          item.productName,
          item.brand,
          item.category,
          item.unitPrice,
          item.quantity,
          subtotal,
          item.notes
        )
        .run();
    }
  } catch {}

  const saved = await env.DB.prepare("SELECT * FROM quotes WHERE id = ?").bind(id).first<QuoteRecord>();

  // 3. Dispatch vendor-neutral outbound event to CRM (resilient)
  try {
    await syncQuoteToCrm("quote.created", {
      quote_id: id,
      user_id: userId,
      customer_name: customerName,
      customer_email: customerEmail,
      customer_phone: customerPhone,
      company_name: companyName,
      delivery_address: deliveryAddress,
      project_description: projectDescription,
      products: formattedItems,
      status: "NEW",
      quoted_amount: null,
      created_at: now,
    }, env);
  } catch (err) {
    console.warn("[Quote Sync] Non-blocking CRM sync error:", err);
  }

  return new Response(
    JSON.stringify({
      status: "success",
      message: "B2B Product request submitted successfully to Cloudflare D1",
      quote: formatQuote(saved, formattedItems),
    }),
    { status: 201, headers: { "Content-Type": "application/json" } }
  );
}

export async function handleGetMyQuotes(request: Request, env: Env): Promise<Response> {
  const user = await authenticateRequest(request, env);

  const { results: quotes } = await env.DB.prepare(
    "SELECT * FROM quotes WHERE user_id = ? ORDER BY created_at DESC"
  )
    .bind(user.uid)
    .all<QuoteRecord>();

  const formatted = [];
  for (const q of quotes || []) {
    let items: any[] = [];
    try {
      const { results: qItems } = await env.DB.prepare("SELECT * FROM quote_items WHERE quote_id = ?").bind(q.id).all<any>();
      items = qItems || [];
    } catch {}
    formatted.push(formatQuote(q, items));
  }

  return new Response(JSON.stringify({ status: "success", count: formatted.length, quotes: formatted }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}

export async function handleGetQuoteById(quoteId: string, request: Request, env: Env): Promise<Response> {
  const user = await authenticateRequest(request, env);

  const quote = await env.DB.prepare("SELECT * FROM quotes WHERE id = ?").bind(quoteId).first<QuoteRecord>();

  if (!quote) {
    return new Response(
      JSON.stringify({ error: "Not Found", message: `Quotation request '${quoteId}' not found` }),
      { status: 404, headers: { "Content-Type": "application/json" } }
    );
  }

  // User isolation: only owner or admin/sales can view
  const isOwner = quote.user_id === user.uid;
  const isStaff = user.role === "admin" || user.role === "superAdmin" || user.role === "sales";

  if (!isOwner && !isStaff) {
    return new Response(
      JSON.stringify({ error: "Forbidden", message: "You do not have permission to view this request" }),
      { status: 403, headers: { "Content-Type": "application/json" } }
    );
  }

  let items: any[] = [];
  try {
    const { results: qItems } = await env.DB.prepare("SELECT * FROM quote_items WHERE quote_id = ?").bind(quote.id).all<any>();
    items = qItems || [];
  } catch {}

  return new Response(JSON.stringify({ status: "success", quote: formatQuote(quote, items) }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}

export async function handleUpdateQuote(quoteId: string, request: Request, env: Env): Promise<Response> {
  const user = await authenticateRequest(request, env);
  requireRole(user, ["admin", "superAdmin", "sales"]);

  const body = (await request.json()) as any;
  const status = body.status || "Pending";
  const quotedAmount = typeof body.quotedAmount === "number" ? body.quotedAmount : typeof body.quoted_amount === "number" ? body.quoted_amount : typeof body.proposalPrice === "number" ? body.proposalPrice : null;
  const adminNotes = body.adminNotes || body.admin_notes || body.internalNotes || "";
  const assignedTo = body.assignedTo !== undefined ? body.assignedTo : null;

  await env.DB.prepare(`
    UPDATE quotes 
    SET status = ?, quoted_amount = ?, admin_notes = ?, updated_at = CURRENT_TIMESTAMP 
    WHERE id = ?
  `)
    .bind(status, quotedAmount, adminNotes, quoteId)
    .run();

  if (assignedTo !== null) {
    try {
      await env.DB.prepare("UPDATE quotes SET assigned_to = ? WHERE id = ?").bind(assignedTo, quoteId).run();
    } catch {}
  }

  const updated = await env.DB.prepare("SELECT * FROM quotes WHERE id = ?").bind(quoteId).first<QuoteRecord>();
  let items: any[] = [];
  try {
    const { results: qItems } = await env.DB.prepare("SELECT * FROM quote_items WHERE quote_id = ?").bind(quoteId).all<any>();
    items = qItems || [];
  } catch {}

  // Dispatch quote update to CRM
  try {
    if (updated) {
      await syncQuoteToCrm("quote.updated", {
        quote_id: updated.id,
        user_id: updated.user_id,
        customer_name: updated.customer_name || "",
        customer_email: updated.customer_email || "",
        customer_phone: updated.customer_phone,
        company_name: updated.company_name,
        delivery_address: updated.delivery_address,
        project_description: updated.project_description,
        products: items.map((it: any) => ({
          productId: it.product_id,
          productName: it.product_name,
          quantity: it.quantity,
          unitPrice: it.unit_price,
          brand: it.brand,
          category: it.category,
          notes: it.notes,
        })),
        status: updated.status,
        quoted_amount: updated.quoted_amount,
        created_at: updated.created_at,
      }, env);
    }
  } catch (err) {
    console.warn("[Quote Update Sync] Non-blocking CRM sync error:", err);
  }

  return new Response(JSON.stringify({ status: "success", message: "Quotation updated in D1", quote: formatQuote(updated, items) }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}

export async function handleListAllQuotes(request: Request, env: Env): Promise<Response> {
  const user = await authenticateRequest(request, env);
  requireRole(user, ["admin", "superAdmin", "sales"]);

  const { results: quotes } = await env.DB.prepare(
    "SELECT * FROM quotes ORDER BY created_at DESC"
  ).all<QuoteRecord>();

  const formatted = [];
  for (const q of quotes || []) {
    let items: any[] = [];
    try {
      const { results: qItems } = await env.DB.prepare("SELECT * FROM quote_items WHERE quote_id = ?").bind(q.id).all<any>();
      items = qItems || [];
    } catch {}
    formatted.push(formatQuote(q, items));
  }

  return new Response(JSON.stringify({ status: "success", count: formatted.length, quotes: formatted }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}
