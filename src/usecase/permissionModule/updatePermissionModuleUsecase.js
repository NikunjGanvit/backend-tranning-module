const repo = require('../../data-access/repositories/permissionModuleRepository');

const updatePermissionModuleUsecase = async ({ module_code, patch }) => {
  // Basic check (extra safety)
  if (Object.keys(patch).length === 0) {
    throw { status: 400, message: 'No update data provided' };
  }

  // Update (returns updated or null)
  const updated = await repo.updateByCode(module_code, patch);
  if (!updated) {
    throw { status: 404, message: 'Permission module does not exist' };
  }

  // Refetch full (plain object)
  return await repo.findByCode(module_code);
};

module.exports = updatePermissionModuleUsecase;
