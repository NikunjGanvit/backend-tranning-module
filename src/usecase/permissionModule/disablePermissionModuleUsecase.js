const repo = require('../../data-access/repositories/permissionModuleRepository');

const disablePermissionModuleUsecase = async ({ module_code }) => {
  const updated = await repo.disableByCode(module_code);  // Now single plain obj, not array
  if (!updated) {
    throw { status: 404, message: 'Not found' };
  }
  return { message: 'Permission module disabled' };
};

module.exports = disablePermissionModuleUsecase;