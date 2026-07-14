import db from "../config/db.js";

class MenuModel {
  async findAll(category = null, search = null) {
    let sql = `
    SELECT
      mi.item_id AS "itemId",
      mi.name AS "name",
      JSON_BUILD_OBJECT(
        'categoryId', mc.category_id,
        'categoryName', mc.category_name
      ) AS "category",
      mi.description AS "description",
      mi.image_url AS "imageUrl",
      mi.is_active AS "isActive",
      (
        SELECT COALESCE(
          JSON_AGG(
            JSON_BUILD_OBJECT(
              'variantId', miv.variant_id,
              'label', miv.label,
              'price', miv.price::float,
              'isAvailable', miv.is_available
            )
          ), '[]'::json
        )
        FROM menu_item_variants miv
        WHERE miv.item_id = mi.item_id
      ) AS "variants"
    FROM menu_items mi
    LEFT JOIN menu_categories mc
      ON mi.category_id = mc.category_id
    WHERE mi.is_active = TRUE`;

    const queryParams = [];

    if (category) {
      queryParams.push(category);
      sql += ` AND mc.category_name = $${queryParams.length}`;
    }

    if (search) {
      queryParams.push(`%${search}%`);
      sql += ` AND (
      mi.name ILIKE $${queryParams.length} OR
      mi.description ILIKE $${queryParams.length} OR
      mc.category_name ILIKE $${queryParams.length}
    )`;
    }

    sql += ` ORDER BY mi.created_at DESC`;

    const { rows } = await db.query(sql, queryParams);
    return rows;
  }

  async findById(client = db, itemId) {
    const sql = `
        SELECT
            mi.item_id AS "itemId",
            mi.name AS "name",
            JSON_BUILD_OBJECT(
                'categoryId', mc.category_id,
                'categoryName', mc.category_name
            ) AS "category",
            mi.description AS "description",
            mi.image_url AS "imageUrl",
            mi.is_active AS "isActive",
            (
                SELECT COALESCE(
                JSON_AGG(
                    JSON_BUILD_OBJECT(
                    'variantId', miv.variant_id,
                    'label', miv.label,
                    'price', miv.price::float,
                    'isAvailable', miv.is_available
                    )
                ), '[]'::json
                )
                FROM menu_item_variants miv
                WHERE miv.item_id = mi.item_id
            ) AS "variants"
        FROM menu_items mi
        LEFT JOIN menu_categories mc
            ON mi.category_id = mc.category_id
        WHERE mi.item_id = $1;
    `;

    const { rows } = await client.query(sql, [itemId]);
    return rows[0];
  }

  async menuCategories() {
    const sql = `
    SELECT
      category_id AS "categoryId",
      category_name AS "categoryName"
    FROM menu_categories
    WHERE is_active = TRUE
    ORDER BY category_id ASC`;
    const { rows } = await db.query(sql);
    return rows;
  }

  async createMenu(client, name, categoryId, description, imageUrl) {
    const sql = `
    INSERT INTO menu_items (name, category_id, description, image_url)
    VALUES($1, $2, $3, $4)
    RETURNING item_id AS "itemId"`;
    const values = [name, categoryId, description, imageUrl];
    const { rows } = await client.query(sql, values);
    return rows[0];
  }

  async createMenuVariant(client, itemId, label, price) {
    const sql = `
    INSERT INTO menu_item_variants (item_id, label, price)
    VALUES($1, $2, $3)`;
    const values = [itemId, label, price];
    await client.query(sql, values);
  }

  async findByIdAndUpdate(
    client,
    itemId,
    name,
    categoryId,
    description,
    imageUrl,
    isActive,
  ) {
    const sql = `
      UPDATE menu_items
      SET
        name        = $1,
        category_id = $2,
        description = $3,
        image_url   = $4,
        is_active   = $5,
        updated_at  = NOW()
      WHERE item_id = $6
    `;
    const values = [name, categoryId, description, imageUrl, isActive, itemId];
    await client.query(sql, values);
  }

  async deleteVariant(client = db, itemId) {
    const sql = `
      DELETE FROM menu_item_variants
      WHERE item_id = $1
    `;
    await client.query(sql, [itemId]);
  }

  async findByIdAndDelete(itemId) {
    const sql = `
            DELETE FROM menu_items
            WHERE item_id = $1`;
    await db.query(sql, [itemId]);
  }

  async updateVariantAvailability(itemId, variantId, isAvailable) {
    const sql = `
            UPDATE menu_item_variants
            SET is_available = $1
            WHERE variant_id = $2 AND item_id = $3`;
    await db.query(sql, [isAvailable, variantId, itemId]);
  }
}

export default new MenuModel();
