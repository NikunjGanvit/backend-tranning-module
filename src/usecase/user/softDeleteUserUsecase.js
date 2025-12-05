const userRepo = require('../../data-access/repositories/userRepository');

const softDeleteUserUsecase = async ({ requester, targetId }) => {
  // Only admin can delete users
  if (!requester.is_admin) {
    throw { status: 403, message: 'Forbidden' };
  }

  // Prevent admin from deleting themselves
  if (requester.id === targetId) {
    throw { status: 400, message: 'Admin cannot delete their own account' };
  }

  await userRepo.softDelete(targetId, requester.id);
  return { message: 'User soft-deleted' };
};

module.exports = softDeleteUserUsecase;
