const userRepo = require('../../data-access/repositories/userRepository');
const userPermissionRepo = require('../../data-access/repositories/userPermissionRepository');
const { hashPassword } = require('../../utils/password');

const createUserUsecase = async ({ requester, username, password, address1, address2, phone_number }) => {

  if (!requester || typeof requester.id === 'undefined') {
    throw { status: 401, message: 'Unauthenticated request' };
  }

  const isAdmin = requester.is_admin === true; // force boolean

  if (isAdmin) {
    // Admins can create users
  } else {
    // Check if requester has can_create permission for the 'user' module
    const userPermission = await userPermissionRepo.findById(requester.id); 
    if (!userPermission || !userPermission.can_create) {
      throw { status: 403, message: 'Forbidden - lack create permission for users!' };
    }
  }

  const existing = await userRepo.findByUsername(username);
  if (existing) {
    throw { status: 409, message: 'Username already taken' };
  }
  if (!password || typeof password !== 'string' || password.trim() === '') {
    throw { status: 400, message: 'password is required' };
  }

  const hash = await hashPassword(password);
  const user = await userRepo.create({ username, password: hash, address1, address2, phone_number, is_admin: false });
  return { id: user.id, username: user.username, createdAt: user.createdAt };
};

module.exports = createUserUsecase;