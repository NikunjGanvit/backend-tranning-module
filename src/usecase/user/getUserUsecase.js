const userRepo = require('../../data-access/repositories/userRepository');

const getUserUsecase = async ({ requester, targetId }) => {

  
  if (!requester || typeof requester.id === 'undefined') {
    throw { status: 401, message: 'Unauthenticated request' };
  }

  
  const isAdmin = requester.is_admin === true; // force boolean
  const isOwner = requester.id === targetId;

  if (!isAdmin && !isOwner) {
    throw { status: 403, message: ' You are Not Admin! ' };
  }

  // Fetch user
  const user = await userRepo.findById(targetId);
  if (!user) {
    throw { status: 404, message: 'User not found' };
  }

  delete user.password;
  return user;
};

module.exports = getUserUsecase;
