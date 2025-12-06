const { ItemModule, sequelize } = require('../models');

const create = async (payload, options = {}) => {
  return ItemModule.create(payload, options);
};

const findLatestByItemCode = async (item_code, options = {}) => {
  return ItemModule.findOne({
    where: { item_code },
    order: [['version', 'DESC']],
    ...options
  });
};

const findByItemCodeAndVersion = async (item_code, version, options = {}) => {
  return ItemModule.findOne({
    where: { item_code, version },
    ...options
  });
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

  if (limit) {
    const offset = (page - 1) * limit;
    sql += ` LIMIT ${limit} OFFSET ${offset}`;
  }
  
  const results = await sequelize.query(sql, {
    model: ItemModule,
    mapToModel: true
  });

  return results;  // always an array
};

const getAllVersionsForItemCode = async (item_code, options = {}) => {
  if (!item_code) {
    const err = new Error('item_code is required');
    err.status = 400;
    throw err;
  }

  // default options: order by version desc
  const opts = {
    where: { item_code },
    order: [['version', 'DESC']],
    raw: true,             // return plain objects
    ...options
  };

  return ItemModule.findAll(opts);
};


const updateByItemCode = async (item_code, patch = {}, opts = {}) => {
  // Basic validation: don't allow patch to change protected fields
  const forbidden = ['id', 'createdAt', 'updatedAt', 'item_code', 'version'];
  for (const f of forbidden) {
    if (Object.prototype.hasOwnProperty.call(patch, f)) {
      const err = new Error(`Cannot change field: ${f}`);
      err.status = 400;
      throw err;
    }
  }

  return sequelize.transaction(async (t) => {
    // Find latest version and lock it for update
    const latest = await ItemModule.findOne({
      where: { item_code },
      order: [['version', 'DESC']],
      transaction: t,
      lock: t.LOCK ? t.LOCK.UPDATE : Sequelize.Transaction.LOCK.UPDATE // safe fallback
    });

    if (!latest) {
      const err = new Error(`No item found with item_code: ${item_code}`);
      err.status = 404;
      throw err;
    }

    // Build next version from plain object (exclude protected fields)
    const base = latest.get({ plain: true });
    delete base.id;
    delete base.createdAt;
    delete base.updatedAt;

    const nextVersion = (Number(base.version) || 0) + 1;

    const newData = {
      ...base,
      ...patch,  // Includes new item_pictures if files uploaded
      item_code,
      version: nextVersion,
      updated_by: opts.requester?.id  // Optional: Track who updated
    };

    // Create new row within same transaction
    const created = await ItemModule.create(newData, { transaction: t });

    // Optionally: return created.get({ plain: true });
    return created;
  });
};
module.exports = {
  create,
  findLatestByItemCode,
  findByItemCodeAndVersion,
  getLatestForAll,
  getAllVersionsForItemCode,
  updateByItemCode
};
