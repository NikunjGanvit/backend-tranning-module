const repo = require('../../data-access/repositories/permissionModuleRepository');

const updatePermissionModuleUsecase = async ({ module_code, patch }) => {
  const [updated] = await repo.updateByCode(module_code, patch);
  if (!updated) throw { status: 404, message: 'Not found' };
  return repo.findByCode(module_code);
};

module.exports = updatePermissionModuleUsecase;
