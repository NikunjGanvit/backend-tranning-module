const createPermissionModuleUsecase = require('../usecase/permissionModule/createPermissionModuleUsecase');
const updatePermissionModuleUsecase = require('../usecase/permissionModule/updatePermissionModuleUsecase');
const disablePermissionModuleUsecase = require('../usecase/permissionModule/disablePermissionModuleUsecase');

const create = async (req, res, next) => {
  try {
    const out = await createPermissionModuleUsecase({ requester: req.user, payload: req.body });
    return res.status(201).json(out);
  } catch (err) { next(err); }
};

const update = async (req, res, next) => {
  try {
    const out = await updatePermissionModuleUsecase({ module_code: req.params.module_code, patch: req.body });
    return res.json(out);
  } catch (err) { next(err); }
};

const remove = async (req, res, next) => {
  try {
    const out = await disablePermissionModuleUsecase({ module_code: req.params.module_code });
    return res.json(out);
  } catch (err) { next(err); }
};

module.exports = { create, update, remove };
