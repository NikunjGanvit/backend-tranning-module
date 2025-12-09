const pool = require('../../config/db');  

const findByUserAndModule = async (user_id, module_code) => {
  const sql = `
    SELECT *
    FROM "User_permissions"
    WHERE user_id = $1
      AND module_code = $2
    LIMIT 1;
  `;

  try {
    const res = await pool.query(sql, [user_id, module_code]);
    return res.rows[0] || null;  // Plain object
  } catch (err) {
    console.error('Find by user/module error:', err);
    throw err;
  }
};

/* ============================
   FIND by user_id
=============================== */
const findById = async (user_id) => {
  const sql = `
    SELECT *
    FROM "User_permissions"
    WHERE user_id = $1
    LIMIT 1;
  `;

  try {
    const res = await pool.query(sql, [user_id]);
    return res.rows[0] || null;
  } catch (err) {
    console.error('Find by user_id error:', err);
    throw err;
  }
};

/* ============================
   CREATE
=============================== */
const create = async (payload) => {
  const sql = `
    INSERT INTO "User_permissions"
      (user_id, module_code,
       can_create, can_update, can_delete, can_view,
       assigned_by,
       "createdAt", "updatedAt")
    VALUES
      ($1, $2,
       $3, $4, $5, $6,
       $7,
       NOW(), NOW())
    RETURNING *;
  `;

  const values = [
    payload.user_id,
    payload.module_code,
    payload.can_create ?? false,
    payload.can_update ?? false,
    payload.can_delete ?? false,
    payload.can_view ?? false,
    payload.assigned_by ?? null
  ];

  try {
    const res = await pool.query(sql, values);
    return res.rows[0] || null;
  } catch (err) {
    console.error('Create user permission error:', err);
    throw err;
  }
};

const updateById = async (id, patch = {}) => {
  // Build dynamic SET clause
  const allowed = [
    "can_create", "can_update", "can_delete", "can_view",
    "assigned_by"
  ];

  const sets = [];
  const values = [id];  // $1 for WHERE
  let paramIndex = 2;

  for (const key of allowed) {
    if (Object.prototype.hasOwnProperty.call(patch, key)) {
      sets.push(`"${key}" = $${paramIndex}`);
      values.push(patch[key]);
      paramIndex++;
    }
  }

  if (sets.length === 0) {
    // Nothing to update—fetch current
    return findRawByPk(id);
  }

  sets.push(`"updatedAt" = NOW()`);

  const sql = `
    UPDATE "User_permissions"
    SET ${sets.join(', ')}
    WHERE id = $1
    RETURNING *;
  `;

  try {
    const res = await pool.query(sql, values);
    return res.rows[0] || null;
  } catch (err) {
    console.error('Update by ID error:', err);
    throw err;
  }
};

/* Helper to fetch single row by PK (not exposed) */
const findRawByPk = async (id) => {
  const sql = `
    SELECT *
    FROM "User_permissions"
    WHERE id = $1
    LIMIT 1;
  `;

  try {
    const res = await pool.query(sql, [id]);
    return res.rows[0] || null;
  } catch (err) {
    console.error('Find raw by PK error:', err);
    throw err;
  }
};

/* ============================
   UPSERT (with transaction)
=============================== */
const upsert = async (user_id, module_code, payload) => {
  const client = await pool.connect();  // For transaction
  try {
    await client.query('BEGIN');

    // Step 1: Lookup existing row (FOR UPDATE to lock)
    const findSql = `
      SELECT *
      FROM "User_permissions"
      WHERE user_id = $1
        AND module_code = $2
      LIMIT 1
      FOR UPDATE;
    `;

    const foundRes = await client.query(findSql, [user_id, module_code]);
    const existing = foundRes.rows[0];

    let result;

    // Step 2: Create if not exists
    if (!existing) {
      const sqlInsert = `
        INSERT INTO "User_permissions"
          (user_id, module_code,
           can_create, can_update, can_delete, can_view,
           assigned_by,
           "createdAt", "updatedAt")
        VALUES
          ($1, $2,
           $3, $4, $5, $6,
           $7,
           NOW(), NOW())
        RETURNING *;
      `;

      const insertValues = [
        user_id,
        module_code,
        payload.can_create ?? false,
        payload.can_update ?? false,
        payload.can_delete ?? false,
        payload.can_view ?? false,
        payload.assigned_by ?? null
      ];

      const insertRes = await client.query(sqlInsert, insertValues);
      result = insertRes.rows[0];
    } else {
      // Step 3: Update existing
      const sets = [];
      const values = [existing.id];  // $1 for WHERE
      let paramIndex = 2;

      const editable = [
        "can_create", "can_update", "can_delete", "can_view", "assigned_by"
      ];

      for (const key of editable) {
        if (payload[key] !== undefined) {
          sets.push(`"${key}" = $${paramIndex}`);
          values.push(payload[key]);
          paramIndex++;
        }
      }

      if (sets.length > 0) {  // Only update if changes
        sets.push(`"updatedAt" = NOW()`);

        const sqlUpdate = `
          UPDATE "User_permissions"
          SET ${sets.join(', ')}
          WHERE id = $1
          RETURNING *;
        `;

        const updateRes = await client.query(sqlUpdate, values);
        result = updateRes.rows[0];
      } else {
        result = existing;  // No changes
      }
    }

    await client.query('COMMIT');
    return result || null;
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Upsert user permission error:', err);
    throw err;
  } finally {
    client.release();
  }
};

module.exports = {
  findByUserAndModule,
  findById,
  create,
  updateById,
  upsert
};