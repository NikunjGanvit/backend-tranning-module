const userRepo = require('../../data-access/repositories/userRepository');

const softDeleteUserUsecase = async ({ requester, targetId }) => {
  if (!requester.is_admin) throw { status: 403, message: 'Forbidden' };
  await userRepo.softDelete(targetId, requester.id);
  return { message: 'User soft-deleted' };
};

module.exports = softDeleteUserUsecase;
