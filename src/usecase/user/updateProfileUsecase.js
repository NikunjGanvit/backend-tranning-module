const userRepo = require('../../data-access/repositories/userRepository');
const userPermissionRepo = require('../../data-access/repositories/userPermissionRepository'); 

const updateProfileUsecase = async ({ requester, targetId, patch }) => {

  if (!requester || typeof requester.id === 'undefined') {
    throw { status: 401, message: 'Unauthenticated request' };
  }

  const isAdmin = requester.is_admin === true; // force boolean
  const isOwner = requester.id === targetId;

  if (isAdmin || isOwner) {
    // Admins can update any user; owners can update their own
  } else {
    // Check if requester has can_update permission for the 'user' module
    const userPermission = await userPermissionRepo.findById(requester.id); 
    if (!userPermission || !userPermission.can_update) {
      throw { status: 403, message: 'You are not Admin and lack update permission for users!' };
    }
  }

  await userRepo.updateById(targetId, patch);
  const user = await userRepo.findById(targetId);
  if (!user) {
    throw { status: 404, message: 'Not found' };
  }

  return (({ id, username, address1, address2, phone_number, updatedAt }) => ({ id, username, address1, address2, phone_number, updatedAt }))(user);
};

module.exports = updateProfileUsecase;