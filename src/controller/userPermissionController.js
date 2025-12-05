const createUserPermissionUsecase = require('../usecase/userPermission/createUserPermissionUsecase');
const updateUserPermissionUsecase = require('../usecase/userPermission/updateUserPermissionUsecase');

const create = async (req, res, next) => {
  try {
    const out = await createUserPermissionUsecase({ requester: req.user, payload: req.body });
    return res.status(201).json(out);
  } catch (err) { next(err); }
};

const update = async (req, res, next) => {
  try {
    const out = await updateUserPermissionUsecase({ id: Number(req.params.id), patch: req.body, requester: req.user });
    return res.json(out);
  } catch (err) { next(err); }
};

module.exports = { create, update };

