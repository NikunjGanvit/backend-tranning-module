const userRepo = require('../../data-access/repositories/userRepository');
const userPermissionRepo = require('../../data-access/repositories/userPermissionRepository'); 

const softDeleteUserUsecase = async ({ requester, targetId }) => {

  if (!requester || typeof requester.id === 'undefined') {
    throw { status: 401, message: 'Unauthenticated request' };
  }

  const isAdmin = requester.is_admin === true; // force boolean

  if (isAdmin) {
    // Admins can delete any user (subject to self-check below)
  } else {
    // Check if requester has can_delete permission for the 'user' module
    const userPermission = await userPermissionRepo.findById(requester.id); 
    if (!userPermission || !userPermission.can_delete) {
      throw { status: 403, message: 'Forbidden - lack delete permission for users!' };
    }
  }

  // Prevent from deleting themselves
  if (requester.id === targetId) {
    throw { status: 400, message: 'Cannot delete own account' };
  }

  await userRepo.softDelete(targetId, requester.id);
  return { message: 'User soft-deleted' };
};

module.exports = softDeleteUserUsecase;