// Remove Sequelize
// const { sequelize, Role } = require('../../../models');
// const { QueryTypes, Op } = require('sequelize');

const pool = require('../../config/db');  // Adjust path to your pool

/**
 * Find role by ID
 */
const findById = async (role_id) => {
  const sql = `
    SELECT *
    FROM "Roles"
    WHERE role_id = $1
    LIMIT 1;
  `;

  try {
    const res = await pool.query(sql, [role_id]);
    return res.rows[0] || null;  // Plain object
  } catch (err) {
    console.error('Find role by ID error:', err);
    throw err;
  }
};

/**
 * List all roles (search + pagination)
 */
const findAll = async ({ page = 1, limit = 20, search = null }) => {
  const offset = (page - 1) * limit;

  // WHERE clause building
  let whereClause = '';
  const params = [];
  let paramIndex = 1;

  if (search) {
    whereClause = `WHERE role_name ILIKE '%' || $${paramIndex} || '%'`;
    params.push(search);
    paramIndex++;
  }

  // 1️⃣ Count total
  const countSql = `
    SELECT COUNT(*) AS total
    FROM "Roles"
    ${whereClause};
  `;

  const countRes = await pool.query(countSql, params);
  const total = Number(countRes.rows[0].total);

  // 2️⃣ Paginated data
  const sql = `
    SELECT *
    FROM "Roles"
    ${whereClause}
    ORDER BY role_id ASC
    OFFSET $${paramIndex} LIMIT $${paramIndex + 1};
  `;

  params.push(offset, limit);
  const dataRes = await pool.query(sql, params);

  return {
    meta: {
      total,
      page,
      limit,
      pages: Math.ceil(total / limit)
    },
    data: dataRes.rows  // Array of plain objects
  };
};

const create = async (record) => {
  const sql = `
    INSERT INTO "Roles"
      (role_name, can_create, can_update, can_delete, can_view, created_by, "createdAt", "updatedAt")
    VALUES
      ($1, $2, $3, $4, $5, $6, NOW(), NOW())
    RETURNING *;
  `;

  const values = [
    record.role_name.trim(),
    record.can_create ?? false,
    record.can_update ?? false,
    record.can_delete ?? false,
    record.can_view ?? false,
    record.created_by
  ];

  try {
    const res = await pool.query(sql, values);
    return res.rows[0];  // Plain object
  } catch (err) {
    console.error('Create role error:', err);
    throw err;
  }
};

/**
 * Update by ID (dynamic SET)
 */
const updateById = async (role_id, patch = {}) => {
  const allowed = [
    'role_name',
    'can_create',
    'can_update',
    'can_delete',
    'can_view'
  ];

  const sets = [];
  const values = [role_id];  // $1 for WHERE
  let paramIndex = 2;

  for (const key of allowed) {
    if (Object.prototype.hasOwnProperty.call(patch, key)) {
      sets.push(`"${key}" = $${paramIndex}`);
      values.push(patch[key]);
      paramIndex++;
    }
  }

  if (sets.length === 0) {
    return null;  // Nothing to update
  }

  const sql = `
    UPDATE "Roles"
    SET ${sets.join(', ')}, "updatedAt" = NOW()
    WHERE role_id = $1
    RETURNING *;
  `;

  try {
    const res = await pool.query(sql, values);
    return res.rows[0] || null;  // Plain object
  } catch (err) {
    console.error('Update role by ID error:', err);
    throw err;
  }
};

/**
 * Delete by ID
 */
const deleteById = async (role_id) => {
  const sql = `
    DELETE FROM "Roles"
    WHERE role_id = $1;
  `;

  try {
    const res = await pool.query(sql, [role_id]);
    return res.rowCount > 0;  // True if deleted
  } catch (err) {
    console.error('Delete role by ID error:', err);
    throw err;
  }
};

module.exports = {
  findById,
  findAll,
  create,
  updateById,
  deleteById
};