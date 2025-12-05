const { UserPermission } = require('../models');

const findByUserAndModule = async (user_id, module_code) => {
  return UserPermission.findOne({ where: { user_id, module_code }});
};

const create = async (payload) => UserPermission.create(payload);

const updateById = async (id, patch) => {
  const perm = await UserPermission.findByPk(id);
  if (!perm) return null;
  return perm.update(patch);
};

const upsert = async (user_id, module_code, payload) => {
  const [row, created] = await UserPermission.findOrCreate({
    where: { user_id, module_code },
    defaults: payload
  });
  if (!created) await row.update(payload);
  return row;
};

module.exports = { findByUserAndModule, create, updateById, upsert };
