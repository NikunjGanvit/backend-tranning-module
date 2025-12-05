const repo = require('../../data-access/repositories/permissionModuleRepository');

const createPermissionModuleUsecase = async ({ requester, payload }) => {
  // only admin allowed by controller middleware but double-check possible
  const existing = await repo.findByCode(payload.module_code);
  if (existing) throw { status: 409, message: 'module_code exists' };
  const created = await repo.create({ ...payload, created_by: requester.id });
  return created;
};

module.exports = createPermissionModuleUsecase;
