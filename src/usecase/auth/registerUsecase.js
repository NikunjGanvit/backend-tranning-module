const userRepo = require('../../data-access/repositories/userRepository');  // Adjust if path differs
const { hashPassword } = require('../../utils/password');

const registerUsecase = async ({ username, password, address1, address2, phone_number }) => {
  // Check uniqueness (now plain object from raw)
  const existing = await userRepo.findByUsername(username);
  if (existing) {
    throw { status: 409, message: 'Username already taken' };
  }

  if (!password || typeof password !== 'string' || password.trim() === '') {
    throw { status: 400, message: 'password is required' };
  }

  const hash = await hashPassword(password);
  const user = await userRepo.create({ 
    username, 
    password: hash, 
    address1: address1 ?? null, 
    address2: address2 ?? null, 
    phone_number: phone_number ?? null, 
    is_admin: false 
  });  // Plain object

  return { id: user.id, username: user.username, createdAt: user.createdAt };
};

module.exports = registerUsecase;