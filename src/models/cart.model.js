import db from "../config/db.js";
class CartModel {
  async findLatestCart(staffId) {
    const sql = `
      SELECT 
          c.cart_id AS "cartId",
          c.order_type AS "orderType",
          COALESCE(
              JSON_AGG(
                  JSON_BUILD_OBJECT(
                      'cartItemId', ci.cart_item_id,
                      'itemId', mi.item_id,
                      'name', mi.name,
                      'variantId', miv.variant_id,
                      'variantLabel', miv.label,
                      'unitPrice', ci.unit_price::float,
                      'quantity', ci.quantity::int,
                      'subtotal', ci.subtotal::float
                  )
              ) FILTER (WHERE ci.cart_item_id IS NOT NULL), '[]'::json
          ) AS "items"
      FROM carts c
      LEFT JOIN cart_items ci ON c.cart_id = ci.cart_id
      LEFT JOIN menu_items mi ON ci.item_id = mi.item_id
      LEFT JOIN menu_item_variants miv ON ci.variant_id = miv.variant_id
      WHERE c.staff_id = $1
      GROUP BY c.cart_id, c.created_at
      ORDER BY c.created_at DESC LIMIT 1`;

    const { rows } = await db.query(sql, [staffId]);
    return rows[0] || null;
  }

  async findItemById(client, cartItemId) {
    const sql = `
        SELECT
            ci.cart_item_id AS "cartItemId",
            mi.name AS "name",
            miv.label AS "variantLabel",
            ci.unit_price::float AS "unitPrice",
            ci.quantity::int AS "quantity",
            ci.subtotal::float AS "subtotal"
        FROM cart_items ci
        JOIN menu_items mi ON ci.item_id = mi.item_id
        JOIN menu_item_variants miv ON ci.variant_id = miv.variant_id
        WHERE ci.cart_item_id = $1`;
    const { rows } = await client.query(sql, [cartItemId]);
    return rows[0];
  }

  async createCart(client, staffId) {
    const sql = `INSERT INTO carts (staff_id) VALUES ($1) RETURNING cart_id AS "cartId"`;
    const { rows } = await client.query(sql, [staffId]);
    return rows[0];
  }

  async createCartItem(
    client,
    cartId,
    itemId,
    variantId,
    quantity,
    unitPrice,
    subtotal,
  ) {
    const sql = `
        INSERT INTO cart_items (cart_id, item_id, variant_id, quantity, unit_price, subtotal)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING cart_item_id AS "cartItemId"`;
    const { rows } = await client.query(sql, [
      cartId,
      itemId,
      variantId,
      quantity,
      unitPrice,
      subtotal,
    ]);
    return rows[0];
  }

  async updateCartItem(client, cartItemId, quantity) {
    const sql = `
            UPDATE cart_items
            SET quantity = $1,
                subtotal = unit_price * $1
            WHERE cart_item_id = $2`;
    await client.query(sql, [quantity, cartItemId]);
  }

  async deleteCartItem(cartItemId) {
    const sql = `DELETE FROM cart_items
                 WHERE cart_item_id = $1`;
    await db.query(sql, [cartItemId]);
  }

  async deleteAllCartItems(cartId) {
    const sql = `DELETE FROM cart_items WHERE cart_id = $1`;
    await db.query(sql, [cartId]);
  }

  async deleteCart(client = db, cartId) {
    const sql = `DELETE FROM cart_items WHERE cart_id = $1`;
    await client.query(sql, [cartId]);
  }

  async updateCartOrderType(cartId, orderType) {
    const sql = `
            UPDATE carts
            SET order_type = $1
            WHERE cart_id = $2`;
    await db.query(sql, [orderType, cartId]);
  }
}
export default new CartModel();
