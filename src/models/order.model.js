import db from "../config/db.js";

class OrderModel {
  async findOrderById(client = db, orderId) {
    const sql = `
            SELECT
              o.order_id AS "orderId",
              o.order_number AS "orderNumber",
              o.order_type AS "orderType",
              o.status AS "status",
              o.total_amount::float AS "totalAmount",
              op.payment_method AS "paymentMethod",
              op.amount_received::float AS "amountReceived",
              op.change_amount::float AS "changeAmount",
              JSON_BUILD_OBJECT(
                'staffId', s.staff_id,
                'name', s.name
              ) AS "cashier",
              (
                SELECT COALESCE(
                  JSON_AGG(
                    JSON_BUILD_OBJECT(
                      'name', mi.name,
                      'variantLabel', miv.label,
                      'quantity', oi.quantity::int,
                      'subtotal', oi.subtotal::float
                    )
                  ), '[]'::json
                )
                FROM order_items oi
                JOIN menu_items mi ON oi.item_id = mi.item_id
                JOIN menu_item_variants miv ON oi.variant_id = miv.variant_id
                WHERE oi.order_id = o.order_id
              ) AS "items",
              o.created_at AS "createdAt"
            FROM orders o
            LEFT JOIN order_payments op
              ON o.order_id = op.order_id
            LEFT JOIN staff s
              ON o.staff_id = s.staff_id
            WHERE o.order_id = $1`;
    const { rows } = await client.query(sql, [orderId]);
    return rows[0];
  }

  async orderNumberExists(client = db, orderNumber) {
    const sql = `SELECT EXISTS(SELECT 1 FROM orders WHERE order_number = $1 AND created_at = CURRENT_DATE)`;
    const { rows } = await client.query(sql, client, [orderNumber]);
    return rows[0];
  }

  async createOrder(client, staffId, orderType, totalAmount) {
    const sql = `
    INSERT INTO orders (staff_id, order_type, total_amount)
    VALUES($1, $2, $3)
    RETURNING order_id AS "orderId", order_number AS "orderNumber"`;
    const { rows } = await client.query(sql, [staffId, orderType, totalAmount]);
    return rows[0];
  }

  async createOrderItem(
    client,
    orderId,
    itemId,
    variantId,
    itemName,
    variantLabel,
    unitPrice,
    quantity,
    subtotal,
  ) {
    const sql = `
    INSERT INTO order_items
    (order_id, item_id, variant_id, item_name, variant_label, unit_price, quantity, subtotal)
    VALUES($1, $2, $3, $4, $5, $6, $7, $8)`;
    await client.query(sql, [
      orderId,
      itemId,
      variantId,
      itemName,
      variantLabel,
      unitPrice,
      quantity,
      subtotal,
    ]);
  }

  async createOrderLogs(client, orderId, status, changedBy) {
    const sql = `
    INSERT INTO order_status_logs (order_id, status, changed_by)
    VALUES($1, $2, $3)`;
    await client.query(sql, [orderId, status, changedBy]);
  }

  async createOrderPayment(
    client,
    orderId,
    paymentMethod,
    amountReceived,
    changeAmount,
  ) {
    const sql = `
    INSERT INTO order_payments
    (order_id, payment_method, amount_received, change_amount)
    VALUES($1, $2, $3, $4)`;
    await client.query(sql, [
      orderId,
      paymentMethod,
      amountReceived,
      changeAmount,
    ]);
  }

  async kpis() {
    const sql = `
            SELECT
            COALESCE(SUM(CASE WHEN created_at::date = CURRENT_DATE AND status = 'Completed' THEN total_amount ELSE 0 END), 0)::float AS "todaySales",
            COALESCE(COUNT(CASE WHEN created_at::date = CURRENT_DATE AND status = 'Completed' THEN 1 END), 0)::int AS "todayOrders",
            COALESCE(SUM(CASE WHEN status = 'Completed' AND DATE_TRUNC('week', created_at) = DATE_TRUNC('week', CURRENT_DATE) THEN total_amount ELSE 0 END), 0)::float AS "weeklyRevenue",
            (
                SELECT COALESCE(COUNT(*), 0)
                FROM inventory_items
                WHERE current_stock <= reorder_level
            )::int AS "lowStockCount"
            FROM orders`;
    const { rows } = await db.query(sql);
    return rows[0];
  }

  async dailyRevenue() {
    const sql = `
            SELECT
              d::date AS "date",
              COALESCE(SUM(o.total_amount), 0)::float AS "revenue"
            FROM generate_series(
              CURRENT_DATE - INTERVAL '6 days',
              CURRENT_DATE,
              INTERVAL '1 day'
            ) AS d
            LEFT JOIN orders o
              ON o.created_at::date = d::date
              AND o.status = 'Completed'
            GROUP BY d
            ORDER BY d ASC`;
    const { rows } = await db.query(sql);
    return rows;
  }

  async peakHours() {
    const sql = `
            SELECT
              TO_CHAR(d, 'HH12AM') AS "hour",
              COALESCE(COUNT(o.order_id), 0)::int AS "orders",
              COALESCE(SUM(o.total_amount), 0)::float AS "revenue"
            FROM generate_series(
              DATE_TRUNC('day', NOW()) + '8 hours',
              DATE_TRUNC('day', NOW()) + '21 hours',
              INTERVAL '1 hour'
            ) AS d
            LEFT JOIN orders o
              ON DATE_TRUNC('hour', created_at) = d
              AND o.status = 'Completed'
              AND o.created_at::date = CURRENT_DATE
            GROUP BY d
            ORDER BY d ASC`;
    const { rows } = await db.query(sql);
    return rows;
  }

  async categoryRevenue() {
    const sql = `
            SELECT
              mc.category_name AS "category",
              COALESCE(SUM(oi.subtotal), 0)::float AS "revenue"
            FROM menu_categories mc
            LEFT JOIN menu_items mi
              ON mc.category_id = mi.category_id
            LEFT JOIN order_items oi
              ON mi.item_id = oi.item_id
            LEFT JOIN orders o
              ON oi.order_id = o.order_id
              AND o.status = 'Completed'
              AND o.created_at::date = CURRENT_DATE
            GROUP BY mc.category_name
            ORDER BY revenue`;
    const { rows } = await db.query(sql);
    return rows;
  }

  async bestSeller() {
    const sql = `
            SELECT
                mi.item_id AS "itemId",
                mi.name AS "name",
                COALESCE(SUM(oi.quantity), 0) AS "quantitySold",
                COALESCE(SUM(oi.subtotal), 0)::float AS "revenue"
            FROM menu_items mi
            LEFT JOIN order_items oi
                ON mi.item_id = oi.item_id
            LEFT JOIN orders o
                ON oi.order_id = o.order_id
                AND o.status = 'Completed'
                AND o.created_at::date = CURRENT_DATE
            GROUP BY mi.item_id, mi.name
            ORDER BY "revenue" DESC`;
    const { rows } = await db.query(sql);
    return rows;
  }

  async findAll(search, status, limit) {
    let sql = `
      SELECT
        r.order_id AS "orderId",
        r.order_number AS "orderNumber",
        r.order_type AS "orderType",
        r.total_amount::float AS "totalAmount",
        op.payment_method AS "paymentMethod",
        r.status AS "status",
        s.name AS "cashier",
        r.created_at AS "createdAt"
      FROM orders r
      LEFT JOIN order_payments op
        ON r.order_id = op.order_id
      LEFT JOIN staff s
        ON r.staff_id = s.staff_id
    `;

    const queryParams = [];
    const conditions = [];

    if (search) {
      queryParams.push(`%${search}%`);
      conditions.push(
        `(r.order_number::text ILIKE $${queryParams.length} OR s.name ILIKE $${queryParams.length})`,
      );
    }

    if (status) {
      queryParams.push(`%${status}%`);
      conditions.push(`r.status ILIKE $${queryParams.length}`);
    }

    if (conditions.length > 0) {
      sql += ` WHERE ${conditions.join(" AND ")}`;
    }

    queryParams.push(limit);
    sql += ` ORDER BY r.created_at DESC LIMIT $${queryParams.length}`;

    const { rows } = await db.query(sql, queryParams);
    return rows;
  }

  async findById(orderId) {
    const sql = `
            SELECT
              o.order_id AS "orderId",
              o.order_number AS "orderNumber",
              o.order_type AS "orderType",
              o.status AS "status",
              o.total_amount::float AS "totalAmount",
              op.payment_method AS "paymentMethod",
              op.amount_received::float AS "amountReceived",
              op.change_amount::float AS "changeAmount",
              s.name AS "name",
              (
                SELECT COALESCE(
                  JSON_AGG(
                    JSON_BUILD_OBJECT(
                      'name', mi.name,
                      'variantLabel', miv.label,
                      'quantity', oi.quantity::int,
                      'subtotal', oi.subtotal::float
                    )
                  ), '[]'::json
                )
                FROM order_items oi
                JOIN menu_items mi ON oi.item_id = mi.item_id
                JOIN menu_item_variants miv ON oi.variant_id = miv.variant_id
                WHERE oi.order_id = o.order_id
              ) AS "items",
              o.created_at AS "createdAt"
            FROM orders o
            LEFT JOIN order_payments op
              ON o.order_id = op.order_id
            LEFT JOIN staff s
              ON o.staff_id = s.staff_id
            WHERE o.order_id = $1`;
    const { rows } = await db.query(sql, [orderId]);
    return rows[0] || null;
  }
}

export default new OrderModel();
