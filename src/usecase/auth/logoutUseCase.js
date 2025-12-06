const userRepo = require('../../data-access/repositories/userRepository');

const logoutUsecase = async ({ id }) => {
  const user = await userRepo.findById(id);
  if (!user || user.is_deleted) throw { status: 401, message: 'Invalid session' };

  return { 
    id: user.id,
    message: 'Logged out successfully'
  };
};

module.exports = logoutUsecase;