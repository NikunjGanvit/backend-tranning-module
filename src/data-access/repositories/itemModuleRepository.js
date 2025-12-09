
const pool = require('../../config/db'); // Adjust path to your pool

// const create = async (payload, options = {}) => {

//   const sql = `
//     INSERT INTO "Item_module"
//       (item_code, description, item_pictures, length, breadth, height, version, created_by, "createdAt", "updatedAt")
//     VALUES
//       ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())
//     RETURNING *;
//   `;

//   const values = [
//     payload.item_code,
//     payload.description ?? null,
//     payload.item_pictures ? JSON.stringify(payload.item_pictures) : null,  // Assume array stored as JSONB or text[]
//     payload.length ?? null,
//     payload.breadth ?? null,
//     payload.height ?? null,
//     payload.version ?? 1,
//     payload.created_by ?? null
//   ];

//   try {
//     const res = await pool.query(sql, values);
//     return res.rows[0] || null;  // Plain object
//   } catch (err) {
//     console.error('Create item error:', err);
//     throw err;
//   }
// };

const create = async (payload) => {
  const { item_code, description, item_pictures, length, breadth, height, version, created_by } = payload;
  
  // Log for debug (remove later)
  console.log('Inserting item_pictures:', item_pictures, 'Type:', typeof item_pictures, 'IsArray:', Array.isArray(item_pictures));
  
  if (!Array.isArray(item_pictures)) {
    throw new Error('item_pictures must be an array');
  }

  const query = `
    INSERT INTO "Item_module" (
      "item_code", "description", "item_pictures", "length", "breadth", 
      "height", "version", "created_by"
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    RETURNING *;
  `;
  const values = [item_code, description, item_pictures, length, breadth, height, version, created_by];
  // pg auto-converts array to {path1,path2}
  
  return await pool.query(query, values);
};

const findLatestByItemCode = async (item_code, options = {}) => {
  const sql = `
    SELECT *
    FROM "Item_module"
    WHERE item_code = $1
    ORDER BY version DESC
    LIMIT 1;
  `;

  try {
    const res = await pool.query(sql, [item_code]);
    return res.rows[0] || null;
  } catch (err) {
    console.error('Find latest by item_code error:', err);
    throw err;
  }
};

const findByItemCodeAndVersion = async (item_code, version, options = {}) => {
  const sql = `
    SELECT *
    FROM "Item_module"
    WHERE item_code = $1 AND version = $2
    LIMIT 1;
  `;

  try {
    const res = await pool.query(sql, [item_code, version]);
    return res.rows[0] || null;
  } catch (err) {
    console.error('Find by item_code/version error:', err);
    throw err;
  }
};

const getLatestForAll = async (opts = {}) => {
  const page = Number(opts.page) || 1;
  const limit = Number(opts.limit) || null;
  const order = opts.order?.toUpperCase() === "DESC" ? "DESC" : "ASC";

  let sql = `
    SELECT *
    FROM (
      SELECT *,
        ROW_NUMBER() OVER (PARTITION BY item_code ORDER BY version DESC) AS rn
      FROM "Item_module"
    ) AS s
    WHERE rn = 1
    ORDER BY item_code ${order}
  `;

  const params = [];  // No params here

  if (limit) {
    const offset = (page - 1) * limit;
    sql += ` LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(limit, offset);
  }

  try {
    const res = await pool.query(sql, params);
    return res.rows;  // Array of plain objects
  } catch (err) {
    console.error('Get latest for all error:', err);
    throw err;
  }
};

const getAllVersionsForItemCode = async (item_code, options = {}) => {
  if (!item_code) {
    const err = new Error('item_code is required');
    err.status = 400;
    throw err;
  }

  const limit = options.limit ?? null;
  const offset = options.offset ?? null;
  let sql = `
    SELECT *
    FROM "Item_module"
    WHERE item_code = $1
    ORDER BY version DESC
  `;

  const params = [item_code];

  if (limit) {
    sql += ` LIMIT $${params.length + 1}`;
    params.push(limit);
  }
  if (offset) {
    sql += ` OFFSET $${params.length + 1}`;
    params.push(offset);
  }

  try {
    const res = await pool.query(sql, params);
    return res.rows;  // Array of plain objects
  } catch (err) {
    console.error('Get all versions error:', err);
    throw err;
  }
};

const updateByItemCode = async (item_code, patch = {}, opts = {}) => {
  // Basic validation: don't allow patch to change protected fields
  const forbidden = ['id', 'created_at', 'updated_at', 'item_code', 'version'];
  for (const f of forbidden) {
    if (Object.prototype.hasOwnProperty.call(patch, f)) {
      const err = new Error(`Cannot change field: ${f}`);
      err.status = 400;
      throw err;
    }
  }

  const client = await pool.connect();  // For transaction
  try {
    await client.query('BEGIN');

    // Find latest version and lock it (FOR UPDATE)
    const findSql = `
      SELECT *
      FROM "Item_module"
      WHERE item_code = $1
      ORDER BY version DESC
      LIMIT 1
      FOR UPDATE;
    `;

    const latestRes = await client.query(findSql, [item_code]);
    const latest = latestRes.rows[0];

    if (!latest) {
      const err = new Error(`No item found with item_code: ${item_code}`);
      err.status = 404;
      throw err;
    }

    // Build next version from plain object (exclude protected)
    const base = { ...latest };
    delete base.id;  // Don't copy ID

    const nextVersion = (Number(base.version) || 0) + 1;

    const newData = {
      ...base,
      ...patch,  // Overlays updates (e.g., new item_pictures)
      item_code,
      version: nextVersion
      // No updated_by
    };

    // Log for debug (like in create)
    console.log('Updating item_pictures:', newData.item_pictures, 'Type:', typeof newData.item_pictures, 'IsArray:', Array.isArray(newData.item_pictures));

    if (newData.item_pictures && !Array.isArray(newData.item_pictures)) {
      throw new Error('item_pictures must be an array');
    }

    // Create new row—let defaults handle created_at / updated_at
    const insertSql = `
      INSERT INTO "Item_module" (
        "item_code", "description", "item_pictures", "length", "breadth", 
        "height", "version", "created_by"
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *;
    `;

    const insertValues = [
      newData.item_code,
      newData.description ?? null,
      newData.item_pictures,  // Raw array—no stringify!
      parseFloat(newData.length) ?? null,  // Ensure number
      parseFloat(newData.breadth) ?? null,
      parseFloat(newData.height) ?? null,
      newData.version,
      newData.created_by ?? null
    ];

    const createdRes = await client.query(insertSql, insertValues);
    const created = createdRes.rows[0];

    await client.query('COMMIT');
    return created;  // Plain object
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Update by item_code error:', err);
    throw err;
  } finally {
    client.release();
  }
};

module.exports = {
  create,
  findLatestByItemCode,
  findByItemCodeAndVersion,
  getLatestForAll,
  getAllVersionsForItemCode,
  updateByItemCode
};