const userRepo = require('../../data-access/repositories/userRepository');
const userPermissionRepo = require('../../data-access/repositories/userPermissionRepository'); // Assuming this repo exists; adjust path as needed
const { hashPassword, comparePassword } = require('../../utils/password');

const updatePasswordUsecase = async ({ requester, targetId, old_password, new_password }) => {

  if (!requester || typeof requester.id === 'undefined') {
    throw { status: 401, message: 'Unauthenticated request' };
  }

  const isAdmin = requester.is_admin === true; // force boolean
  const isOwner = requester.id === targetId;

  if (isAdmin || isOwner) {
    // Admins can update any user's password; owners can update their own
  } else {
    // Check if requester has can_update permission for the 'user' module
    const userPermission = await userPermissionRepo.findById(requester.id); // Assuming 'user' is the module_code for user management; adjust as needed
    if (!userPermission || !userPermission.can_update) {
      throw { status: 403, message: 'Forbidden - lack update permission for users!' };
    }
  }

  const user = await userRepo.findById(targetId);
  if (!user) {
    throw { status: 404, message: 'User not found' };
  }

  if (!isAdmin && isOwner) {
    const ok = await comparePassword(old_password, user.password);
    if (!ok) {
      throw { status: 401, message: 'Old password incorrect' };
    }
  }

  const hash = await hashPassword(new_password);
  await userRepo.updateById(targetId, { password: hash });
  return { message: 'Password updated' };
};

module.exports = updatePasswordUsecase;