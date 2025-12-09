const repo = require('../../data-access/repositories/userPermissionRepository');

const updateUserPermissionUsecase = async ({ id, patch, requester }) => {
  // Basic check
  if (Object.keys(patch).length === 0) {
    throw { status: 400, message: 'No update data provided' };
  }

  // Validate patch keys (e.g., only perms)
  const allowedKeys = ['can_create', 'can_update', 'can_delete', 'can_view'];
  const invalidKeys = Object.keys(patch).filter(key => !allowedKeys.includes(key));
  if (invalidKeys.length > 0) {
    throw { status: 400, message: `Invalid fields: ${invalidKeys.join(', ')}` };
  }

  const updated = await repo.updateById(id, { ...patch, assigned_by: requester.id });  // Plain object
  if (!updated) {
    throw { status: 404, message: 'Not found' };
  }

  return updated;
};

module.exports = updateUserPermissionUsecase;