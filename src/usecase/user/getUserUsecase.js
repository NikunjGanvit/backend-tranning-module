const userRepo = require('../../data-access/repositories/userRepository');
const userPermissionRepo = require('../../data-access/repositories/userPermissionRepository'); // Assuming this repo exists; adjust path as needed

const getUserUsecase = async ({ requester, targetId }) => {

  
  if (!requester || typeof requester.id === 'undefined') {
    throw { status: 401, message: 'Unauthenticated request' };
  }

  
  const isAdmin = requester.is_admin === true; // force boolean
  const isOwner = requester.id === targetId;

  if (isAdmin) {
    // Admins can always view any user
  } else if (isOwner) {
    // Owners can view their own profile
  } else {
    // Check if requester has can_view permission for the 'user' module
    const userPermission = await userPermissionRepo.findById(requester.id); 
    if (!userPermission || !userPermission.can_view) {
      throw { status: 403, message: 'You are Not Admin and lack view permission for users!' };
    }
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