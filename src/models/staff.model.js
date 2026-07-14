import db from "../config/db.js";

class StaffModel {
  async findAll(search, role) {
    let sql = `
            SELECT
                s.staff_id AS "staffId",
                s.name AS "name",
                r.role_name AS "role",
                s.email AS "email",
                s.status AS "status",
                s.image_url AS "imageUrl",
                s.created_at AS "createdAt"
            FROM staff s
            LEFT JOIN roles r
                ON s.role_id = r.role_id`;

    const queryParams = [];

    if (search) {
      queryParams.push(search);
      sql += `WHERE s.name ILIKE = ${queryParams.length} OR
                      s.email ILIKE = ${queryParams.length}`;
    }

    if (role) {
      queryParams.push(role);
      sql += `WHERE r.role_name = ${queryParams.length}`;
    }

    const { rows } = await db.query(sql, queryParams);
    return rows || [];
  }

  async findById(client = db, staffId) {
    const sql = `
          SELECT
                s.staff_id AS "staffId",
                s.name AS "name",
                r.role_name AS "role",
                s.email AS "email",
                s.status AS "status",
                s.image_url AS "imageUrl",
                s.created_at AS "createdAt"
            FROM staff s
            LEFT JOIN roles r
                ON s.role_id = r.role_id
            WHERE s.staff_id = $1`;

    const { rows } = await client.query(sql, [staffId]);
    return rows[0] || null;
  }

  async findByEmail(client = db, email, excludeStaffId = null) {
    const sql = excludeStaffId
      ? `SELECT EXISTS(SELECT 1 FROM staff WHERE email = $1 AND staff_id != $2) AS "exists"`
      : `SELECT EXISTS(SELECT 1 FROM staff WHERE email = $1) AS "exists"`;
    const values = excludeStaffId ? [email, excludeStaffId] : [email];
    const { rows } = await client.query(sql, values);
    return rows[0]?.exists || false;
  }

  async findRoleByName(client = db, roleName) {
    const sql = `SELECT role_id AS "roleId", role_name AS "roleName" FROM roles WHERE role_name = $1`;
    const { rows } = await client.query(sql, [roleName]);
    return rows[0] || null;
  }

  async createRole(client, role, description) {
    const sql = `
        INSERT INTO roles
        (role_name, description)
        VALUES ($1, $2)
        RETURNING role_id AS "roleId", role_name AS "roleName"`;

    const { rows } = await client.query(sql, [role, description]);
    return rows[0];
  }

  async createStaff(
    client,
    name,
    email,
    passwordHash,
    roleId,
    status,
    imageUrl,
  ) {
    const sql = `
        INSERT INTO staff
        (name, email, password_hash, role_id, status, image_url)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING staff_id AS "staffId"`;

    const values = [name, email, passwordHash, roleId, status, imageUrl];
    const { rows } = await client.query(sql, values);
    return rows[0];
  }

  async findByIdAndUpdate(
    client,
    staffId,
    name,
    email,
    roleId,
    status,
    imageUrl,
  ) {
    const sql = `
      UPDATE staff
      SET name = $1, email = $2, role_id = $3, status = $4, image_url = $5, updated_at = CURRENT_DATE
      WHERE staff_id = $6
      RETURNING staff_id AS "staffId"`;
    const values = [name, email, roleId, status, imageUrl, staffId];
    await client.query(sql, values);
  }

  async findByIdAndDelete(staffId) {
    const sql = `DELETE FROM staff
                 WHERE staff_id = $1`;
    await db.query(sql, [staffId]);
  }

  async findByIdAndUpdateStatus(staffId, status) {
    const sql = `
          UPDATE staff
          SET status = $1, updated_at = CURRENT_DATE
          WHERE staff_id = $2`;
    await db.query(sql, [status, staffId]);
  }
}

export default new StaffModel();
