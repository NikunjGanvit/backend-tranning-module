const repo = require('../../data-access/repositories/userPermissionRepository');

const updateUserPermissionUsecase = async ({ id, patch, requester }) => {
  const updated = await repo.updateById(id, { ...patch, assigned_by: requester.id });
  if (!updated) throw { status: 404, message: 'Not found' };
  return updated;
};

module.exports = updateUserPermissionUsecase;
