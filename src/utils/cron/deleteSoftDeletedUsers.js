const cron = require("node-cron");
const { sequelize } = require('../../../models'); // adjust path
const { QueryTypes } = require("sequelize");

cron.schedule("0 0 * * *", async () => {
  console.log("Cron Job Started: Hard deleting soft-deleted users...");

  try {
    const sql = `
      DELETE FROM "Users"
      WHERE is_deleted = true
        AND deleted_at <= NOW() - INTERVAL '1 day'
      RETURNING id;
    `;

    // Run delete query
    const deletedRows = await sequelize.query(sql, { type: QueryTypes.DELETE });

    // deletedRows returned by DELETE is not an array, so run a SELECT COUNT instead:
    const countSql = `
      SELECT COUNT(*)::int AS total
      FROM "Users"
      WHERE is_deleted = true
        AND deleted_at <= NOW() - INTERVAL '1 day'
    `;

    console.log(`Hard deleted soft-deleted users (24+ hours old).`);

  } catch (err) {
    console.error("Cron Job Error:", err);
  }
});
