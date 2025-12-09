const getUserUsecase = require('../usecase/user/getUserUsecase');
const updateProfileUsecase = require('../usecase/user/updateProfileUsecase');
const updatePasswordUsecase = require('../usecase/user/updatePasswordUsecase');
const softDeleteUserUsecase = require('../usecase/user/softDeleteUserUsecase');
const createUserUsecase = require('../usecase/user/createUserUsecase');

const getById = async (req, res, next) => {
  try {
    const targetId = Number(req.params.id);  // Coerce to number
    
    if (!Number.isInteger(targetId) || targetId <= 0) {
      return next({ status: 400, message: 'Invalid user ID' });
    }

    const out = await getUserUsecase({ 
      requester: req.user,  // From middleware
      targetId 
    });
    return res.json(out);
  } catch (err) {
    next(err);  // To error handler
  }
};

const createUser = async (req, res, next) => {
  try {
    const { username, password, address1, address2, phone_number } = req.body;
    
    if (!username || !password) {
      return next({ status: 400, message: 'Username and password required' });
    }

    const out = await createUserUsecase({ 
      requester: req.user, 
      username, 
      password, 
      address1, 
      address2, 
      phone_number 
    });
    return res.status(201).json(out);
  } catch (err) {
    next(err);  
  }
};


const updateProfile = async (req, res, next) => {
  try {
    const targetId = Number(req.params.id);
    
    if (!Number.isInteger(targetId) || targetId <= 0) {
      return next({ status: 400, message: 'Invalid user ID' });
    }

    const patch = req.body;  // e.g., { address1: "New St", phone_number: "555-9999" }
    
    // Basic check: Ensure some data to update
    if (Object.keys(patch).length === 0) {
      return next({ status: 400, message: 'No update data provided' });
    }

    const out = await updateProfileUsecase({ 
      requester: req.user,
      targetId,
      patch 
    });
    return res.json(out);
  } catch (err) {
    next(err);
  }
};



const updatePassword = async (req, res, next) => {
  try {
    const targetId = Number(req.params.id);
    
    if (!Number.isInteger(targetId) || targetId <= 0) {
      return next({ status: 400, message: 'Invalid user ID' });
    }

    const { old_password, new_password } = req.body;
    
    if (!old_password || !new_password) {
      return next({ status: 400, message: 'Old and new passwords required' });
    }

    const out = await updatePasswordUsecase({ 
      requester: req.user,
      targetId,
      old_password,
      new_password 
    });
    return res.json(out);
  } catch (err) {
    next(err);
  }
};

const softDelete = async (req, res, next) => {
  try {
    const targetId = Number(req.params.id);
    
    if (!Number.isInteger(targetId) || targetId <= 0) {
      return next({ status: 400, message: 'Invalid user ID' });
    }

    const out = await softDeleteUserUsecase({ 
      requester: req.user,
      targetId 
    });
    return res.status(200).json(out);  
  } catch (err) {
    next(err);
  }
};

module.exports = { getById, updateProfile, updatePassword, softDelete, createUser };
