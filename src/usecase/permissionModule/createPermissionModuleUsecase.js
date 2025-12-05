const repo = require('../../data-access/repositories/permissionModuleRepository');

const createPermissionModuleUsecase = async ({ requester, payload }) => {
  
  if (!payload || !payload.module_code) {
    throw { status: 400, message: 'module_code is required' };
  }

  const existing = await repo.findByCode(payload.module_code);
  if (existing) throw { status: 409, message: 'module_code exists' };

  const created = await repo.create({
    ...payload,
    created_by: requester.id
  });

  return created;
};

module.exports = createPermissionModuleUsecase;
