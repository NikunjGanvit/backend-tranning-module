
const userRepo = require('../../data-access/repositories/userRepository');
const { comparePassword } = require('../../utils/password');
const { signJwt } = require('../../utils/jwt');
const config = require('../../config');

const loginUsecase = async ({ username, password }) => {
  const user = await userRepo.findByUsername(username);
  if (!user || user.is_deleted) throw { status: 401, message: 'Invalid credentials' };

  const ok = await comparePassword(password, user.password);
  if (!ok) throw { status: 401, message: 'Invalid credentials' };

  const token = signJwt({ id: user.id, username: user.username, is_admin: user.is_admin }, config.jwtExpiresIn);
  return { token, user: { id: user.id, username: user.username, is_admin: user.is_admin } };
};

module.exports = loginUsecase;
