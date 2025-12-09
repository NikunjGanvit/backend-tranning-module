'use strict';

const userPermissionRepo = require('../data-access/repositories/userPermissionRepository');
const userRepo = require('../data-access/repositories/userRepository');

const pool = require('../config/db');

const ACTION_TO_FIELD = {
  create: 'can_create',
  view:   'can_view',
  update: 'can_update',
  delete: 'can_delete'
};

module.exports = function authorizePermission(action) {
  if (!ACTION_TO_FIELD[action]) {
    throw new Error(`Unknown action "${action}"`);
  }

  const permissionField = ACTION_TO_FIELD[action];

  return async (req, res, next) => {
    try {
      const requester = req.user;
      console.log('=== PERM DEBUG START ===');
      console.log('Action:', action, 'Field:', permissionField);
      console.log('Requester:', { id: requester?.id, is_admin: requester?.is_admin });
      if (!requester) {
        console.log('Fail: No requester');
        return res.status(401).json({ message: 'Authentication required' });
      }

      // Admin bypass
      if (requester.is_admin) {
        console.log('Pass: Admin bypass');
        return next();
      }

      const requesterId = Number(requester.id);
      if (!requesterId) {
        console.log('Fail: Invalid ID');
        return res.status(401).json({ message: 'Invalid authenticated user' });
      }

      // Target user check (if /:id route)
      const targetId = req.params?.id ? Number(req.params.id) : null;
      if (targetId) {
        console.log('Target ID:', targetId);
        const targetUser = await userRepo.findById(targetId);
        console.log('Target user exists?', !!targetUser, 'Deleted?', targetUser?.is_deleted);
        if (!targetUser || targetUser.is_deleted) {
          console.log('Fail: Target not found/active');
          return res.status(404).json({ message: 'User not found' });
        }
        if (targetId === requesterId) {
          console.log('Pass: Self access');
          return next();
        }
      }

      // Explicit user perms
      const perm = await userPermissionRepo.findById(requesterId);
      console.log('Explicit perm row:', !!perm, 'Field value:', perm?.[permissionField]);
      if (perm && perm[permissionField]) {
        console.log('Pass: Explicit perm');
        return next();
      }

      // Role-based (full query log)
      console.log('Checking roles for ID:', requesterId);
      const sql = `
        SELECT r.role_id, r.role_name
        FROM "UserRoles" ur
        JOIN "Roles" r ON ur.role_id = r.role_id
        WHERE ur.user_id = $1
          AND r."${permissionField}" = TRUE
        LIMIT 1;
      `;
      console.log('Role SQL:', sql);
      const rows = await pool.query(sql, [requesterId]);
      console.log('Role query result:', { rowCount: rows.rowCount, rows: rows.rows });

      if (rows.rowCount > 0) {
        console.log('Pass: Role perm granted');
        return next();
      }

      console.log('Fail: No perms found');
      return res.status(403).json({ message: 'Access denied (insufficient permissions)' });
    } catch (err) {
      console.error('authorizePermission error', err);
      return res.status(500).json({ message: 'Internal server error' });
    }
  };
};