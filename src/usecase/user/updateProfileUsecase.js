const userRepo = require('../../data-access/repositories/userRepository');

const updateProfileUsecase = async ({ requester, targetId, patch }) => {
  if (!requester.is_admin && requester.id !== targetId) throw { status: 403, message: 'Forbidden' };
  await userRepo.updateById(targetId, patch);
  const user = await userRepo.findById(targetId);
  if (!user) throw { status: 404, message: 'Not found' };
  return (({ id, username, address1, address2, phone_number, updatedAt }) => ({ id, username, address1, address2, phone_number, updatedAt }))(user);
};

module.exports = updateProfileUsecase;
