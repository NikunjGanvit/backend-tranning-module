const userRepo = require('../../data-access/repositories/userRepository');  
const { hashPassword } = require('../../utils/password');

const createUserUsecase = async ({ requester, username, password, address1, address2, phone_number }) => {

  if (!requester || typeof requester.id === 'undefined') {
    throw { status: 401, message: 'Unauthenticated request' };
  }

  // Check uniqueness (uses old findByUsername—migrate later if needed)
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
    address1, 
    address2, 
    phone_number, 
    is_admin: false  // Default non-admin
  });

  // user is now plain object, but your return only uses basics—no issue
  return { id: user.id, username: user.username, createdAt: user.createdAt };
};

module.exports = createUserUsecase;