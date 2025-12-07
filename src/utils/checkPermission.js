'use strict';

const userPermissionRepo = require('../data-access/repositories/userPermissionRepository');
const userRepo = require('../data-access/repositories/userRepository'); // repo you showed earlier

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
      if (!requester) return res.status(401).json({ message: 'Authentication required' });

      // Admin bypass for permission checks (but still check soft-delete in usecase if you want)
      if (requester.is_admin) {
        return next();
      }

      const requesterId = Number(requester.id);
      if (!requesterId) return res.status(401).json({ message: 'Invalid authenticated user' });

      // If route contains a target id, check the target user exists and is not soft-deleted.
      const targetId = req.params?.id ? Number(req.params.id) : null;
      if (targetId) {
        const targetUser = await userRepo.findById(targetId);
        if (!targetUser) {
          // hide existence from non-admins — treat as Not Found
          return res.status(404).json({ message: 'User not found' });
        }
        if (targetUser.is_deleted) {
          // non-admins must not access soft-deleted users
          return res.status(404).json({ message: 'User not found' });
        }

        // If requester is the owner (self) and target is active, allow
        if (targetId === requesterId) {
          return next();
        }
      }

      // At this point: either no targetId (e.g., POST /api/users) or requesting another user's data.
      // Check the requester's permissions record.
      const perm = await userPermissionRepo.findById(requesterId);

      if (!perm || !perm[permissionField]) {
        return res.status(403).json({ message: 'Access denied (insufficient permissions)' });
      }

      return next();
    } catch (err) {
      console.error('authorizePermission error', err);
      return res.status(500).json({ message: 'Internal server error' });
    }
  };
};
