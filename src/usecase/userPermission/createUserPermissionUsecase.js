const repo = require('../../data-access/repositories/userPermissionRepository');
const userRepo = require('../../data-access/repositories/userRepository');
const pmRepo = require('../../data-access/repositories/permissionModuleRepository');

const createUserPermissionUsecase = async ({ requester, payload }) => {
  const { user_id, module_code, can_create, can_update, can_delete, can_view } = payload;
  const user = await userRepo.findById(user_id);
  if (!user) throw { status: 404, message: 'User not found' };
  const pm = await pmRepo.findByCode(module_code);
  if (!pm) throw { status: 404, message: 'Module not found' };

  const row = await repo.upsert(user_id, module_code, {
    can_create: !!can_create,
    can_update: !!can_update,
    can_delete: !!can_delete,
    can_view: !!can_view,
    assigned_by: requester.id
  });
  return row;
};

module.exports = createUserPermissionUsecase;
