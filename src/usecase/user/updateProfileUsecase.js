const userRepo = require('../../data-access/repositories/userRepository');  

const updateProfileUsecase = async ({ requester, targetId, patch }) => {

  if (!requester || typeof requester.id === 'undefined') {
    throw { status: 401, message: 'Unauthenticated request' };
  }

  const allowedPatchKeys = ['username', 'address1', 'address2', 'phone_number'];  // Exclude sensitive like password/is_admin
  const invalidKeys = Object.keys(patch).filter(key => !allowedPatchKeys.includes(key));
  if (invalidKeys.length > 0) {
    throw { status: 400, message: `Invalid fields: ${invalidKeys.join(', ')}` };
  }

  await userRepo.updateById(targetId, patch);

  const user = await userRepo.findById(targetId);
  if (!user) {
    throw { status: 404, message: 'Not found' };
  }

  const { id, username, address1, address2, phone_number, updatedAt } = user;
  return { id, username, address1, address2, phone_number, updatedAt };
};

module.exports = updateProfileUsecase;