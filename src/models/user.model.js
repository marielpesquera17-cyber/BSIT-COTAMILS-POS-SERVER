import db from "../config/db.js";
class UserModel {
  async findByEmail(email) {
    const sql = `SELECT
                    s.staff_id AS "staffId",
                    s.name,
                    s.email,
                    s.password_hash AS "password",
                    r.role_name AS "role",
                    s.status,
                    s.image_url AS "image",
                    s.created_at AS createdAt
                FROM staff s
                LEFT JOIN roles r ON r.role_id = s.role_id
                WHERE s.email = $1
                `;
    const { rows } = await db.query(sql, [email]);
    return rows[0];
  }

  async findById(id) {
    const sql = `SELECT
                    s.staff_id AS "staffId",
                    s.name,
                    s.email,
                    r.role_name AS "role",
                    s.status,
                    s.image_url AS "image",
                    s.created_at AS "createdAt"
                FROM staff s
                LEFT JOIN roles r ON r.role_id = s.role_id
                WHERE s.staff_id = $1
                `;
    const { rows } = await db.query(sql, [id]);
    return rows[0];
  }
}

export default new UserModel();
