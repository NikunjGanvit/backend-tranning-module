const pool = require('../../config/db'); 

const create = async (payload) => {
  const sql = `
    INSERT INTO "Users"
      (username, password, address1, address2, phone_number, is_deleted, deleted_by, deleted_at, is_admin, "createdAt", "updatedAt")
    VALUES
      ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW())
    RETURNING *;
  `;

  const values = [
    payload.username,
    payload.password,
    payload.address1 ?? null,
    payload.address2 ?? null,
    payload.phone_number ?? null,
    payload.is_deleted ?? false,
    payload.deleted_by ?? null,
    payload.deleted_at ?? null,
    payload.is_admin ?? false
  ];

  try {
    const res = await pool.query(sql, values);
    return res.rows[0] || null;  // Plain object, e.g., { id: 1, username: 'foo', ... }
  } catch (err) {
    console.error('Create user error:', err);
    throw err;  // Let use case handle (e.g., unique violation -> 409)
  }
};

const findById = async (id) => {
  const sql = `
    SELECT *
    FROM "Users"
    WHERE id = $1
    LIMIT 1;
  `;

  try {
    const res = await pool.query(sql, [id]);
    return res.rows[0] || null;  // Plain object, e.g., { id: 1, username: 'foo', ... }
  } catch (err) {
    console.error('Find by ID error:', err);
    throw err;
  }
};

const updateById = async (id, patch = {}) => {
  const allowed = [
    'username', 'password', 'address1', 'address2', 'phone_number',
    'is_deleted', 'deleted_by', 'deleted_at', 'is_admin'
  ];

  const sets = [];
  const values = [id];  // $1 is always id for WHERE
  let paramIndex = 2;  // $2+ for dynamic fields

  for (const key of allowed) {
    const value = patch[key];

    // Skip if value is undefined → do NOT update this field
    if (value === undefined) continue;

    sets.push(`"${key}" = $${paramIndex}`);
    values.push(value);
    paramIndex++;
  }

  if (sets.length === 0) {
    // No changes: just return current user
    return await findById(id);
  }

  sets.push(`"updatedAt" = NOW()`);

  const sql = `
    UPDATE "Users"
    SET ${sets.join(', ')}
    WHERE id = $1
    RETURNING *;
  `;

  try {
    const res = await pool.query(sql, values);
    return res.rows[0] || null;  // Plain object
  } catch (err) {
    console.error('Update by ID error:', err);
    throw err;
  }
};

const softDelete = async (id, deletedBy) => {
  const sql = `
    UPDATE "Users"
    SET is_deleted = true,
        deleted_by = $2,
        deleted_at = NOW(),
        "updatedAt" = NOW()
    WHERE id = $1
    RETURNING *;
  `;

  const values = [id, deletedBy ?? null];

  try {
    const res = await pool.query(sql, values);
    return res.rows[0] || null;  // Plain object
  } catch (err) {
    console.error('Soft delete error:', err);
    throw err;
  }
};

const findByUsername = async (username) => {
  const sql = `
    SELECT *
    FROM "Users"
    WHERE username = $1
    AND "is_deleted" = false  
    LIMIT 1;
  `;

  try {
    const res = await pool.query(sql, [username]);
    return res.rows[0] || null;  // Plain object
  } catch (err) {
    console.error('Find by username error:', err);
    throw err;
  }
};

module.exports = {
  create,
  findByUsername,
  findById,
  updateById,
  softDelete
};