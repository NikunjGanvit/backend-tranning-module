const userRepo = require('../../data-access/repositories/userRepository');  // Adjust path


const getUserUsecase = async ({ requester, targetId }) => {

  if (!requester || typeof requester.id === 'undefined') {
    throw { status: 401, message: 'Unauthenticated request' };
  }
  
  // Fetch user (now plain object from repo)
  const user = await userRepo.findById(targetId);
  if (!user) {
    throw { status: 404, message: 'User not found' };
  }
 
  // delete user.password;

  return user;
};

module.exports = getUserUsecase;