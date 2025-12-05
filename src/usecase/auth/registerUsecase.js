const userRepo = require('../../data-access/repositories/userRepository');
const { hashPassword } = require('../../utils/password');

const registerUsecase = async ({ username, password, address1, address2, phone_number }) => {
  const existing = await userRepo.findByUsername(username);
  if (existing) throw { status: 409, message: 'Username already taken' };
  if (!password || typeof password !== 'string' || password.trim() === '') {
    throw { status: 400, message: 'password is required' };
  }

  const hash = await hashPassword(password);
  const user = await userRepo.create({ username, password: hash, address1, address2, phone_number, is_admin: false });
  return { id: user.id, username: user.username, createdAt: user.createdAt };
};

module.exports = registerUsecase;
