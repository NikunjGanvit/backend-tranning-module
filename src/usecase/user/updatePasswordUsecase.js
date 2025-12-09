const userRepo = require('../../data-access/repositories/userRepository');
const userPermissionRepo = require('../../data-access/repositories/userPermissionRepository'); 
const { hashPassword, comparePassword } = require('../../utils/password');


const updatePasswordUsecase = async ({ requester, targetId, old_password, new_password }) => {

  if (!requester || typeof requester.id === 'undefined') {
    throw { status: 401, message: 'Unauthenticated request' };
  }

  const isAdmin = requester.is_admin === true; // force boolean
  const isOwner = requester.id == targetId;  // Loose ==

  if (isAdmin || isOwner) {
    // Admins/owners can update
  } else {
    // Check if requester has can_update permission for the 'user' module
    const userPermission = await userPermissionRepo.findById(requester.id);
    if (!userPermission || !userPermission.can_update) {
      throw { status: 403, message: 'Forbidden - lack update permission for users!' };
    }
  }

  const user = await userRepo.findById(targetId);  // Plain object
  if (!user) {
    throw { status: 404, message: 'User not found' };
  }

  if (!isAdmin && isOwner) {
    const ok = await comparePassword(old_password, user.password);  
    if (!ok) {
      throw { status: 401, message: 'Old password incorrect' };
    }
  }


  if (!new_password || typeof new_password !== 'string' || new_password.trim().length < 8) {
    throw { status: 400, message: 'New password must be at least 8 characters' };
  }

  const hash = await hashPassword(new_password);
  await userRepo.updateById(targetId, { password: hash });  

  return { message: 'Password updated successfully' };
};

module.exports = updatePasswordUsecase;