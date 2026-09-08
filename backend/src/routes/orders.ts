import { authenticateRequest, optionalAuthenticate, requireRole } from "../auth/middleware";
import { Env } from "../env";
import { syncOrderToCrm } from "../crm/crmService";

function formatOrder(row: any, items: any[] = []): any {
  let statusHistory: any[] = [];
  try {
    if (row.status_history_json) {
      statusHistory = typeof row.status_history_json === "string" ? JSON.parse(row.status_history_json) : row.status_history_json;
    }
  } catch {}

  const formattedItems = (items || []).map((item: any) => ({
    productId: item.product_id,
    productSnapshot: {
      id: item.product_id,
      name: item.product_name,
      modelId: item.model_id || "",
      brand: item.brand || "",
      category: item.category || "",
      image: item.image_url || "",
      unitPrice: item.unit_price || 0,
      minOrderQty: 1,
    },
    quantity: item.quantity,
    unitPrice: item.unit_price,
    subtotal: item.subtotal || (item.unit_price * item.quantity),
  }));

  return {
    id: row.id,
    orderNumber: row.order_number || row.id,
    companyId: row.company_id || "",
    userId: row.user_id,
    customerSnapshot: {
      name: row.customer_name,
      email: row.customer_email,
      phone: row.customer_phone,
      companyName: row.company_name,
      taxId: row.tax_id || "",
      shippingAddress: row.shipping_address,
      city: row.city || "Abu Dhabi",
    },
    items: formattedItems,
    itemCount: row.item_count || formattedItems.length,
    totalUnits: row.total_units || formattedItems.reduce((acc, i) => acc + i.quantity, 0),
    subtotal: row.subtotal,
    discountRate: row.discount_rate || 0,
    discountAmount: row.discount_amount || 0,
    estimatedTotal: row.estimated_total,
    poNumber: row.po_number || "",
    paymentTerm: row.payment_term || "net30",
    source: row.source || "web_cart",
    status: row.status || "NEW",
    notes: row.customer_notes || "",
    internalNotes: row.admin_notes || "",
    assignedTo: row.assigned_to || "",
    statusHistory,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function handleCreateOrder(request: Request, env: Env): Promise<Response> {
  const authUser = await optionalAuthenticate(request, env);
  const body = (await request.json()) as any;

  const id = body.id || `order-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  const orderNumber = body.orderNumber || `OT-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;
  const userId = authUser ? authUser.uid : (body.userId || "anonymous");
  const companyId = body.companyId || "";
  const customer = body.customerSnapshot || {};
  const customerName = (customer.name || body.customerName || authUser?.name || "Valued Contractor").trim();
  const customerEmail = (customer.email || body.customerEmail || authUser?.email || "").trim();
  const customerPhone = (customer.phone || body.customerPhone || "").trim();
  const companyName = (customer.companyName || body.companyName || "").trim();
  const taxId = (customer.taxId || body.taxId || "").trim();
  const shippingAddress = (customer.shippingAddress || body.shippingAddress || body.deliveryAddress || "UAE").trim();
  const city = (customer.city || body.city || "Abu Dhabi").trim();
  const poNumber = (body.poNumber || "").trim();
  const paymentTerm = body.paymentTerm || "net30";
  const source = body.source || "web_cart";
  const customerNotes = (body.notes || body.customerNotes || "").trim();

  const items = body.items || [];
  if (!Array.isArray(items) || items.length === 0) {
    return new Response(
      JSON.stringify({ error: "Bad Request", message: "An order must contain at least one item." }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  let subtotal = 0;
  let totalUnits = 0;
  for (const item of items) {
    const qty = typeof item.quantity === "number" && item.quantity > 0 ? item.quantity : 1;
    const price = typeof item.unitPrice === "number" ? item.unitPrice : 0;
    subtotal += price * qty;
    totalUnits += qty;
  }

  const discountRate = typeof body.discountRate === "number" ? body.discountRate : 0;
  const discountAmount = subtotal * discountRate;
  const estimatedTotal = subtotal - discountAmount;
  const now = new Date().toISOString();

  const initialStatusHistory = JSON.stringify([
    {
      status: "NEW",
      timestamp: now,
      updatedBy: customerName,
      notes: "Order request submitted via corporate procurement cart.",
    },
  ]);

  // 1. Insert into orders table
  await env.DB.prepare(`
    INSERT INTO orders (
      id, order_number, user_id, company_id, customer_name, customer_email, customer_phone,
      company_name, tax_id, shipping_address, city, po_number, payment_term, source,
      status, subtotal, discount_rate, discount_amount, estimated_total, item_count,
      total_units, customer_notes, admin_notes, status_history_json, created_at, updated_at
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'NEW', ?, ?, ?, ?, ?, ?, ?, '', ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
  `)
    .bind(
      id,
      orderNumber,
      userId,
      companyId,
      customerName,
      customerEmail,
      customerPhone,
      companyName,
      taxId,
      shippingAddress,
      city,
      poNumber,
      paymentTerm,
      source,
      subtotal,
      discountRate,
      discountAmount,
      estimatedTotal,
      items.length,
      totalUnits,
      customerNotes,
      initialStatusHistory
    )
    .run();

  // 2. Insert into order_items table
  for (const item of items) {
    const itemId = `oi-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const productId = item.productId || item.product?.id || item.id || "prod-generic";
    const productName = item.productSnapshot?.name || item.productName || item.name || "Equipment";
    const modelId = item.productSnapshot?.modelId || item.modelId || "";
    const brand = item.productSnapshot?.brand || item.brand || "";
    const category = item.productSnapshot?.category || item.category || "";
    const imageUrl = item.productSnapshot?.image || item.image || "";
    const unitPrice = typeof item.unitPrice === "number" ? item.unitPrice : 0;
    const quantity = typeof item.quantity === "number" && item.quantity > 0 ? item.quantity : 1;
    const itemSubtotal = unitPrice * quantity;

    await env.DB.prepare(`
      INSERT INTO order_items (
        id, order_id, product_id, product_name, model_id, brand, category, image_url, unit_price, quantity, subtotal, created_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    `)
      .bind(
        itemId,
        id,
        productId,
        productName,
        modelId,
        brand,
        category,
        imageUrl,
        unitPrice,
        quantity,
        itemSubtotal
      )
      .run();
  }

  const saved = await env.DB.prepare("SELECT * FROM orders WHERE id = ?").bind(id).first<any>();
  const savedItems = await env.DB.prepare("SELECT * FROM order_items WHERE order_id = ?").bind(id).all<any>();

  // 3. Dispatch vendor-neutral outbound event to CRM (resilient)
  try {
    const crmResult = await syncOrderToCrm("order.created", {
      order_id: id,
      order_number: orderNumber,
      user_id: userId,
      company_id: companyId,
      customer_name: customerName,
      customer_email: customerEmail,
      customer_phone: customerPhone,
      company_name: companyName,
      tax_id: taxId,
      shipping_address: shippingAddress,
      city,
      po_number: poNumber,
      payment_term: paymentTerm,
      source,
      status: "NEW",
      subtotal,
      discount_rate: discountRate,
      discount_amount: discountAmount,
      estimated_total: estimatedTotal,
      item_count: items.length,
      total_units: totalUnits,
      customer_notes: customerNotes,
      items: (savedItems.results || []).map((it: any) => ({
        product_id: it.product_id,
        product_name: it.product_name,
        model_id: it.model_id,
        brand: it.brand,
        category: it.category,
        unit_price: it.unit_price,
        quantity: it.quantity,
        subtotal: it.subtotal,
      })),
      created_at: now,
    }, env);

    if (crmResult.success && crmResult.crmRecordId) {
      await env.DB.prepare(`
        UPDATE orders
        SET crm_record_id = ?, crm_sync_status = 'synced', crm_last_synced_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `)
        .bind(crmResult.crmRecordId, id)
        .run();
    } else if (!crmResult.success) {
      await env.DB.prepare(`
        UPDATE orders
        SET crm_sync_status = 'failed', crm_sync_error = ?
        WHERE id = ?
      `)
        .bind(crmResult.error || "CRM sync failed", id)
        .run();
    }
  } catch (syncErr) {
    console.warn("[Order Sync] Non-blocking CRM sync error:", syncErr);
  }

  return new Response(
    JSON.stringify({
      status: "success",
      message: "Order request created successfully in Cloudflare D1",
      order: formatOrder(saved, savedItems.results || []),
    }),
    { status: 201, headers: { "Content-Type": "application/json" } }
  );
}

export async function handleGetMyOrders(request: Request, env: Env): Promise<Response> {
  const user = await authenticateRequest(request, env);

  const { results: orders } = await env.DB.prepare(
    "SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC"
  )
    .bind(user.uid)
    .all<any>();

  const formattedOrders = [];
  for (const o of orders || []) {
    const { results: items } = await env.DB.prepare(
      "SELECT * FROM order_items WHERE order_id = ?"
    )
      .bind(o.id)
      .all<any>();
    formattedOrders.push(formatOrder(o, items || []));
  }

  return new Response(
    JSON.stringify({ status: "success", count: formattedOrders.length, orders: formattedOrders }),
    { status: 200, headers: { "Content-Type": "application/json" } }
  );
}

export async function handleGetOrderById(orderId: string, request: Request, env: Env): Promise<Response> {
  const user = await authenticateRequest(request, env);

  const order = await env.DB.prepare("SELECT * FROM orders WHERE id = ? OR order_number = ?")
    .bind(orderId, orderId)
    .first<any>();

  if (!order) {
    return new Response(
      JSON.stringify({ error: "Not Found", message: `Order '${orderId}' not found` }),
      { status: 404, headers: { "Content-Type": "application/json" } }
    );
  }

  const isOwner = order.user_id === user.uid;
  const isStaff = user.role === "admin" || user.role === "superAdmin" || user.role === "sales";

  if (!isOwner && !isStaff) {
    return new Response(
      JSON.stringify({ error: "Forbidden", message: "You do not have permission to view this order" }),
      { status: 403, headers: { "Content-Type": "application/json" } }
    );
  }

  const { results: items } = await env.DB.prepare("SELECT * FROM order_items WHERE order_id = ?")
    .bind(order.id)
    .all<any>();

  return new Response(
    JSON.stringify({ status: "success", order: formatOrder(order, items || []) }),
    { status: 200, headers: { "Content-Type": "application/json" } }
  );
}

export async function handleUpdateOrder(orderId: string, request: Request, env: Env): Promise<Response> {
  const user = await authenticateRequest(request, env);
  requireRole(user, ["admin", "superAdmin", "sales"]);

  const body = (await request.json()) as any;
  const order = await env.DB.prepare("SELECT * FROM orders WHERE id = ? OR order_number = ?")
    .bind(orderId, orderId)
    .first<any>();

  if (!order) {
    return new Response(
      JSON.stringify({ error: "Not Found", message: `Order '${orderId}' not found` }),
      { status: 404, headers: { "Content-Type": "application/json" } }
    );
  }

  const status = body.status || order.status;
  const adminNotes = body.internalNotes || body.adminNotes || order.admin_notes || "";
  const assignedTo = body.assignedTo !== undefined ? body.assignedTo : order.assigned_to;
  const now = new Date().toISOString();

  let history = [];
  try {
    history = JSON.parse(order.status_history_json || "[]");
  } catch {}

  if (body.status && body.status !== order.status) {
    history.push({
      status: body.status,
      timestamp: now,
      updatedBy: user.name || user.email || "Admin",
      notes: body.notes || `Order status updated to ${body.status}`,
    });
  }

  await env.DB.prepare(`
    UPDATE orders 
    SET status = ?, admin_notes = ?, assigned_to = ?, status_history_json = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `)
    .bind(status, adminNotes, assignedTo, JSON.stringify(history), order.id)
    .run();

  const updated = await env.DB.prepare("SELECT * FROM orders WHERE id = ?").bind(order.id).first<any>();
  const { results: items } = await env.DB.prepare("SELECT * FROM order_items WHERE order_id = ?").bind(order.id).all<any>();

  // Dispatch order update to CRM
  try {
    await syncOrderToCrm("order.updated", {
      order_id: updated.id,
      order_number: updated.order_number,
      user_id: updated.user_id,
      company_id: updated.company_id,
      customer_name: updated.customer_name,
      customer_email: updated.customer_email,
      customer_phone: updated.customer_phone,
      company_name: updated.company_name,
      tax_id: updated.tax_id,
      shipping_address: updated.shipping_address,
      city: updated.city,
      po_number: updated.po_number,
      payment_term: updated.payment_term,
      source: updated.source,
      status: updated.status,
      subtotal: updated.subtotal,
      discount_rate: updated.discount_rate,
      discount_amount: updated.discount_amount,
      estimated_total: updated.estimated_total,
      item_count: updated.item_count,
      total_units: updated.total_units,
      customer_notes: updated.customer_notes,
      items: (items || []).map((it: any) => ({
        product_id: it.product_id,
        product_name: it.product_name,
        model_id: it.model_id,
        brand: it.brand,
        category: it.category,
        unit_price: it.unit_price,
        quantity: it.quantity,
        subtotal: it.subtotal,
      })),
      created_at: updated.created_at,
    }, env);
  } catch (err) {
    console.warn("[Order Update Sync] Non-blocking CRM sync error:", err);
  }

  return new Response(
    JSON.stringify({ status: "success", message: "Order updated in D1", order: formatOrder(updated, items || []) }),
    { status: 200, headers: { "Content-Type": "application/json" } }
  );
}

export async function handleListAllOrders(request: Request, env: Env): Promise<Response> {
  const user = await authenticateRequest(request, env);
  requireRole(user, ["admin", "superAdmin", "sales"]);

  const { results: orders } = await env.DB.prepare(
    "SELECT * FROM orders ORDER BY created_at DESC"
  ).all<any>();

  const formattedOrders = [];
  for (const o of orders || []) {
    const { results: items } = await env.DB.prepare(
      "SELECT * FROM order_items WHERE order_id = ?"
    )
      .bind(o.id)
      .all<any>();
    formattedOrders.push(formatOrder(o, items || []));
  }

  return new Response(
    JSON.stringify({ status: "success", count: formattedOrders.length, orders: formattedOrders }),
    { status: 200, headers: { "Content-Type": "application/json" } }
  );
}
