const roleRepo = require('../../data-access/repositories/roleRepository');

/**
 * Helpers (unchanged)
 */
const ensureAuthenticated = (requester) => {
  if (!requester || typeof requester.id === 'undefined') {
    throw { status: 401, message: 'Unauthenticated request' };
  }
};

const ensureAdmin = (requester) => {
  ensureAuthenticated(requester);
  if (requester.is_admin !== true) {
    throw { status: 403, message: 'Admin permission required' };
  }
};

const validateRolePayloadOnCreate = (payload) => {
  const errors = [];
  if (!payload || typeof payload !== 'object') {
    errors.push('payload required');
  } else {
    if (!payload.role_name || typeof payload.role_name !== 'string' || !payload.role_name.trim()) {
      errors.push('role_name is required and must be a non-empty string');
    }
    ['can_create','can_update','can_delete','can_view'].forEach(k => {
      if (payload[k] !== undefined && typeof payload[k] !== 'boolean') {
        errors.push(`${k} must be boolean`);
      }
    });
  }

  if (errors.length) {
    throw { status: 400, message: 'Validation error', details: errors };
  }
};

const validateRolePayloadOnUpdate = (payload) => {
  if (!payload || typeof payload !== 'object') {
    throw { status: 400, message: 'payload required' };
  }
  const allowed = ['role_name','can_create','can_update','can_delete','can_view'];
  const patch = {};
  for (const k of allowed) {
    if (Object.prototype.hasOwnProperty.call(payload, k)) {
      if ((k === 'role_name' && (typeof payload[k] !== 'string' || !payload[k].trim())) ||
          (k !== 'role_name' && typeof payload[k] !== 'boolean')) {
        throw { status: 400, message: `Invalid value for ${k}` };
      }
      patch[k] = (k === 'role_name') ? payload[k].trim() : payload[k];
    }
  }
  if (Object.keys(patch).length === 0) {
    throw { status: 400, message: 'No updatable fields provided' };
  }
  return patch;
};

/**
 * Usecases (minor tweaks for plain objects)
 */
const getRoleUsecase = async ({ requester, role_id }) => {
  ensureAuthenticated(requester);
  if (!requester.is_admin) throw { status: 403, message: 'Admin required' };

  const role = await roleRepo.findById(role_id);  // Plain object
  if (!role) throw { status: 404, message: 'Role not found' };

  return role;
};

const listRolesUsecase = async ({ requester, query = {} }) => {
  ensureAuthenticated(requester);
  if (!requester.is_admin) throw { status: 403, message: 'Admin required' };

  const page = Number(query.page) > 0 ? Number(query.page) : 1;
  const limit = Number(query.limit) > 0 ? Number(query.limit) : 20;
  const search = query.search ? String(query.search) : null;

  const out = await roleRepo.findAll({ page, limit, search });  // { meta, data: [] } with plain
  return out;
};

const createRoleUsecase = async ({ requester, payload }) => {
  ensureAdmin(requester);

  validateRolePayloadOnCreate(payload);

  const record = {
    role_name: payload.role_name.trim(),
    can_create: !!payload.can_create,
    can_update: !!payload.can_update,
    can_delete: !!payload.can_delete,
    can_view: !!payload.can_view,
    created_by: requester.id
  };

  const created = await roleRepo.create(record);  // Plain object

  return created;
};

const updateRoleUsecase = async ({ requester, role_id, payload }) => {
  ensureAdmin(requester);

  const patch = validateRolePayloadOnUpdate(payload);

  const updated = await roleRepo.updateById(role_id, patch);  // Plain object
  if (!updated) throw { status: 404, message: 'Role not found or nothing updated' };

  return updated;
};

const deleteRoleUsecase = async ({ requester, role_id }) => {
  ensureAdmin(requester);

  const role = await roleRepo.findById(role_id);  // Plain object
  if (!role) throw { status: 404, message: 'Role not found' };

  // Optional: prevent deleting system roles
  // if (role.role_name === 'Admin') throw { status: 403, message: 'Cannot delete Admin role' };

  const deleted = await roleRepo.deleteById(role_id);
  if (!deleted) throw { status: 404, message: 'Role not found' };

  return;
};

module.exports = {
  getRoleUsecase,
  listRolesUsecase,
  createRoleUsecase,
  updateRoleUsecase,
  deleteRoleUsecase
};