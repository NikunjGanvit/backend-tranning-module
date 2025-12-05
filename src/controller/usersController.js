const getUserUsecase = require('../usecase/user/getUserUsecase');
const updateProfileUsecase = require('../usecase/user/updateProfileUsecase');
const updatePasswordUsecase = require('../usecase/user/updatePasswordUsecase');
const softDeleteUserUsecase = require('../usecase/user/softDeleteUserUsecase');

const getById = async (req, res, next) => {
  try {
    const out = await getUserUsecase({ requester: req.user, targetId: Number(req.params.id) });
    return res.json(out);
  } catch (err) { next(err); }
};

const updateProfile = async (req, res, next) => {
  try {
    const patch = (({ address1, address2, phone_number }) => ({ address1, address2, phone_number }))(req.body);
    const out = await updateProfileUsecase({ requester: req.user, targetId: Number(req.params.id), patch });
    return res.json(out);
  } catch (err) { next(err); }
};

const updatePassword = async (req, res, next) => {
  try {
    const { old_password, new_password } = req.body;
    const out = await updatePasswordUsecase({ requester: req.user, targetId: Number(req.params.id), old_password, new_password });
    return res.json(out);
  } catch (err) { next(err); }
};

const softDelete = async (req, res, next) => {
  try {
    const out = await softDeleteUserUsecase({ requester: req.user, targetId: Number(req.params.id) });
    return res.json(out);
  } catch (err) { next(err); }
};

module.exports = { getById, updateProfile, updatePassword, softDelete };
