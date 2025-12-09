

const pool = require('../../config/db');

const create = async (payload) => {
  const sql = `
    INSERT INTO "Permission_modules"
      (module_code, module_description, is_active, created_by, "createdAt", "updatedAt")
    VALUES
      ($1, $2, $3, $4, NOW(), NOW())
    RETURNING *;
  `;

  const values = [
    payload.module_code,
    payload.module_description ?? null,
    payload.is_active ?? true,
    payload.created_by ?? null
  ];

  try {
    const res = await pool.query(sql, values);
    return res.rows[0] || null;
  } catch (err) {
    console.error('Create permission module error:', err);
    throw err;
  }
};

/**
 * Find a permission module by module_code
 * returns: plain object or null
 */
const findByCode = async (module_code) => {
  const sql = `
    SELECT *
    FROM "Permission_modules"
    WHERE module_code = $1
    LIMIT 1;
  `;

  try {
    const res = await pool.query(sql, [module_code]);
    return res.rows[0] || null;
  } catch (err) {
    console.error('Find by code error:', err);
    throw err;
  }
};

/**
 * Update a permission module by module_code (partial update)
 * patch: object with allowed fields: module_description, is_active, created_by
 * returns: updated plain object or null
 */
const updateByCode = async (module_code, patch = {}) => {
  const allowed = ['module_description', 'is_active', 'created_by'];
  const sets = [];
  const values = [module_code];  // $1 for WHERE
  let paramIndex = 2;

  for (const key of allowed) {
    if (Object.prototype.hasOwnProperty.call(patch, key)) {
      sets.push(`"${key}" = $${paramIndex}`);
      values.push(patch[key]);
      paramIndex++;
    }
  }

  if (sets.length === 0) {
    // Nothing to update—return current
    return findByCode(module_code);
  }

  sets.push(`"updatedAt" = NOW()`);

  const sql = `
    UPDATE "Permission_modules"
    SET ${sets.join(', ')}
    WHERE module_code = $1
    RETURNING *;
  `;

  try {
    const res = await pool.query(sql, values);
    return res.rows[0] || null;
  } catch (err) {
    console.error('Update by code error:', err);
    throw err;
  }
};

/**
 * Disable a permission module (set is_active = false)
 * returns: updated plain object or null
 */
const disableByCode = async (module_code) => {
  const sql = `
    UPDATE "Permission_modules"
    SET is_active = false,
        "updatedAt" = NOW()
    WHERE module_code = $1
    RETURNING *;
  `;

  try {
    const res = await pool.query(sql, [module_code]);
    return res.rows[0] || null;
  } catch (err) {
    console.error('Disable by code error:', err);
    throw err;
  }
};

module.exports = {
  create,
  findByCode,
  updateByCode,
  disableByCode
};