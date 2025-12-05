const userRepo = require('../../data-access/repositories/userRepository');
const { hashPassword, comparePassword } = require('../../utils/password');

const updatePasswordUsecase = async ({ requester, targetId, old_password, new_password }) => {
  if (!requester.is_admin && requester.id !== targetId) throw { status: 403, message: 'Forbidden' };
  const user = await userRepo.findById(targetId);
  if (!user) throw { status: 404, message: 'User not found' };

  if (!requester.is_admin) {
    const ok = await comparePassword(old_password, user.password);
    if (!ok) throw { status: 401, message: 'Old password incorrect' };
  }

  const hash = await hashPassword(new_password);
  await userRepo.updateById(targetId, { password: hash });
  return { message: 'Password updated' };
};

module.exports = updatePasswordUsecase;
