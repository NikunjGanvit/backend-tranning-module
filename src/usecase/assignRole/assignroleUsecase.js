const assignRoleRepo = require('../../data-access/repositories/assignRoleRepository');
const roleRepo = require('../../data-access/repositories/roleRepository');
const userRepo = require('../../data-access/repositories/userRepository');  // Migrated—plain objects

const validatePayload = (payload) => {
  const errors = [];
  if (!payload || typeof payload !== 'object') {
    errors.push('payload required');
    throw { status: 400, message: 'Validation error', details: errors };
  }

  const user_id = Number(payload.user_id);
  const role_id = Number(payload.role_id);

  if (!Number.isInteger(user_id) || user_id <= 0) errors.push('user_id must be a positive integer');
  if (!Number.isInteger(role_id) || role_id <= 0) errors.push('role_id must be a positive integer');

  if (errors.length) throw { status: 400, message: 'Validation error', details: errors };

  return { user_id, role_id };
};


const assignRoleUsecase = async ({ requester, payload }) => {

  if (!requester || typeof requester.id === 'undefined') {
    throw { status: 401, message: 'Unauthenticated request' };
  }

  const { user_id, role_id } = validatePayload(payload);

  // Check role existence (plain object from migrated repo)
  const role = await roleRepo.findById(role_id);
  if (!role) throw { status: 404, message: 'Role not found' };

  // Check user existence (use migrated userRepo—no more Sequelize)
  const user = await userRepo.findById(user_id);  // Plain object
  if (!user) throw { status: 404, message: 'User not found' };

  const result = await assignRoleRepo.create({ role_id, user_id, assigned_by: requester.id });  

  if (!result || !result.row) throw { status: 500, message: 'Failed to assign role' };

  return { created: result.created, assignment: result.row };  // row is plain object
};

module.exports = { assignRoleUsecase };