const repo = require('../../data-access/repositories/userPermissionRepository');
const userRepo = require('../../data-access/repositories/userRepository');
const pmRepo = require('../../data-access/repositories/permissionModuleRepository');

const createUserPermissionUsecase = async ({ requester, payload }) => {
  const { user_id, module_code, can_create, can_update, can_delete, can_view } = payload;

  if (!module_code || typeof module_code !== 'string' || module_code.trim() === '') {
    throw { status: 400, message: 'module_code is required' };
  }

  // Fetch user (plain object)
  const user = await userRepo.findById(user_id);
  if (!user) {
    throw { status: 404, message: 'User not found' };
  }

  // Fetch module (plain object)
  const pm = await pmRepo.findByCode(module_code);
  if (!pm) {
    throw { status: 404, message: 'Module not found' };
  }


  if(!pm.is_active) {
    throw {status:400, message: 'Module disabled'};
  }

  const row = await repo.upsert(user_id, module_code, {
    can_create: !!can_create,
    can_update: !!can_update,
    can_delete: !!can_delete,
    can_view: !!can_view,
    assigned_by: requester.id
  });  // Plain object

  return row;  // Full row, e.g., { id: 1, user_id: 2, module_code: 'user', can_create: true, ... }
};

module.exports = createUserPermissionUsecase;