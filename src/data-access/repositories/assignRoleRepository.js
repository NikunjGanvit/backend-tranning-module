const pool = require('../../config/db');  // Adjust path to your pool


const create = async ({ role_id, user_id }) => {
  const client = await pool.connect();  // For transaction
  try {
    await client.query('BEGIN');


    const findSql = `
      SELECT *
      FROM "UserRoles" 
      WHERE user_id = $1 AND role_id = $2
      FOR UPDATE;
    `;

    const foundRes = await client.query(findSql, [user_id, role_id]);
    const existing = foundRes.rows[0];

    let row;
    let created = false;

    if (!existing) {
      // Step 2: Insert new
      const insertSql = `
        INSERT INTO "UserRoles"
          (user_id, role_id)
        VALUES
          ($1, $2)
        RETURNING *;
      `;

      const insertValues = [user_id, role_id];  // assigned_by optional; set in use case if needed

      const insertRes = await client.query(insertSql, insertValues);
      row = insertRes.rows[0];
      created = true;
    } else {
      // Step 3: Return existing (optional: UPDATE assigned_at if needed)
      row = existing;
    }

    await client.query('COMMIT');
    return { created, row };  // row is plain object
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Assign role error:', err);
    throw err;
  } finally {
    client.release();
  }
};

module.exports = {
  create
};