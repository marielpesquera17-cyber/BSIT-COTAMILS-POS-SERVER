import db from "../config/db.js";

class InventoryModel {
  async findAll(search, category) {
    let sql = `
            SELECT 
                COALESCE(JSON_AGG(
                        JSON_BUILD_OBJECT(
                            'itemId', ii.item_id,
                            'name', ii.name,
                            'category', JSON_BUILD_OBJECT(
                                'categoryId', ic.category_id,
                                'categoryName', ic.category_name
                            ),
                            'currentStock', ii.current_stock,
                            'unit', ii.unit,
                            'reorderLevel', ii.reorder_level::int,
                            'lastRestocked', ii.last_restocked,
                            'isLowStock', ii.current_stock <= ii.reorder_level
                        )
                        ORDER BY ii.created_at DESC
                    ), '[]'::json) AS items,
                    (SELECT COUNT(*) FROM inventory_items)::int AS total
                FROM inventory_items ii
                LEFT JOIN inventory_categories ic
                    ON ii.category_id = ic.category_id`;

    const queryParams = [];
    if (search) {
      sql += `WHERE ii.name ILIKE ${queryParams.length}`;
      queryParams.push(search);
    }

    if (search) {
      sql += `WHERE ii.name ILIKE ${queryParams.length}`;
      queryParams.push(category);
    }

    const { rows } = await db.query(sql, queryParams);
    return rows[0];
  }

  async findAllAlerts() {
    const sql = `
            SELECT
                item_id AS "itemId",
                name,
                current_stock::float AS "currentStock",
                reorder_level::int AS "reorderLevel",
                unit
            FROM inventory_items
            WHERE current_stock <= reorder_level`;
    const { rows } = await db.query(sql);
    return rows || [];
  }

  async findById(client = db, itemId) {
    const sql = `
            SELECT
                ii.item_id AS "itemId",
                ii.name,
                JSON_BUILD_OBJECT(
                    'categoryId', ic.category_id,
                    'categoryName', ic.category_name
                ) AS "category",
                ii.current_stock::float AS "currentStock",
                ii.reorder_level::int AS "reorderLevel",
                ii.unit
            FROM inventory_items ii
            LEFT JOIN inventory_categories ic
                ON ii.category_id = ic.category_id
            WHERE ii.item_id = $1`;
    const { rows } = await db.query(sql, [itemId]);
    return rows[0] || null;
  }

  async inventoryCategories() {
    const sql = `
        SELECT
        category_id AS "categoryId",
        category_name AS "categoryName"
        FROM inventory_categories
        ORDER BY category_id ASC`;
    const { rows } = await db.query(sql);
    return rows;
  }

  async createInventoryItem(
    name,
    categoryId,
    currentStock,
    unit,
    reorderLevel,
  ) {
    const sql = `
            INSERT INTO inventory_items
            (name, category_id, current_stock, unit, reorder_level)
            VALUES($1, $2, $3, $4, $5)
            RETURNING item_id AS "itemId"`;
    const values = [name, categoryId, currentStock, unit, reorderLevel];
    const { rows } = await db.query(sql, values);
    return rows[0];
  }

  async findByIdAndUpdate(
    client = db,
    name,
    categoryId,
    currentStock,
    unit,
    reorderLevel,
  ) {
    const sql = `
        UPDATE inventory_items
        SET name = $1, category_id = $2, current_stock = $3, unit = $4, reorder_level = $5, updated_at = CURRENT_DATE
        RETURNING item_id AS "itemId"`;
    const values = [name, categoryId, currentStock, unit, reorderLevel];
    const { rows } = await db.query(sql, values);
    return rows[0];
  }

  async findByIdAndDelete(itemId) {
    const sql = `DELETE FROM inventory_items
                 WHERE item_id = $1`;
    await db.query(sql, [itemId]);
  }

  async createTransactionInventory(
    client,
    itemId,
    staff_id,
    type,
    quantity,
    note,
  ) {
    const sql = `
        INSERT INTO inventory_transactions
        (item_id, staff_id, type, quantity, note)
        VALUES($1, $2, $3, $4, $5)`;
    const values = [itemId, staff_id, type, quantity, note];
    await db.query(sql, values);
  }
}

export default new InventoryModel();
