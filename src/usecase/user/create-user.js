const userRepo = require('../../data-access/repositories/userRepository');

const getUserUsecase = async ({ requester, targetId }) => {
  if (!requester.is_admin && requester.id !== targetId) throw { status: 403, message: 'Forbidden' };
  const user = await userRepo.findById(targetId);
  if (!user) throw { status: 404, message: 'User not found' };
  const safe = (({ id, username, address1, address2, phone_number, createdAt, is_admin, is_deleted, deleted_by, deleted_at }) => 
    ({ id, username, address1, address2, phone_number, createdAt, is_admin, is_deleted, deleted_by, deleted_at }))(user);
  return safe;
};

module.exports = getUserUsecase;
//$2b$10$9BdFN.Ik9r12bHW2zPjekO9W9L74/CfoeTV9I1/ZwenHA.GJ91EgW