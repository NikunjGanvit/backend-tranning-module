const cron = require("node-cron");
const { User } = require("../../data-access/models/user"); // adjust path as needed
const { Op } = require("sequelize");

cron.schedule("0 0 * * *", async () => {
  console.log("Cron Job Started: Hard deleting soft-deleted users...");

  try {
    const deleted = await User.destroy({
      where: {
        is_deleted: true,
        deleted_at: {
          [Op.lte]: new Date(new Date() - 24 * 60 * 60 * 1000) 
        }
      },
      force: true 
    });

    console.log(`Hard deleted ${deleted} soft-deleted users.`);
  } catch (err) {
    console.error("Cron Job Error:", err);
  }
});
