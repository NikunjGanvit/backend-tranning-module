const {
  getRoleUsecase,
  listRolesUsecase,
  createRoleUsecase,
  updateRoleUsecase,
  deleteRoleUsecase
} = require('../usecase/role/roleUsecases');

const getById = async (req, res, next) => {
  try {
    const role_id = Number(req.params.role_id);
    if (!Number.isInteger(role_id)) return next({ status: 400, message: 'Invalid role_id' });

    const out = await getRoleUsecase({ requester: req.user, role_id });
    return res.json(out);
  } catch (err) { next(err); }
};

const list = async (req, res, next) => {
  try {
    const query = {
      page: req.query.page,
      limit: req.query.limit,
      search: req.query.search
    };
    const out = await listRolesUsecase({ requester: req.user, query });
    return res.json(out);
  } catch (err) { next(err); }
};

const create = async (req, res, next) => {
  try {
    const payload = req.body;
    const out = await createRoleUsecase({ requester: req.user, payload });
    return res.status(201).json(out);
  } catch (err) { next(err); }
};

const update = async (req, res, next) => {
  try {
    const role_id = Number(req.params.role_id);
    if (!Number.isInteger(role_id)) return next({ status: 400, message: 'Invalid role_id' });

    const payload = req.body;
    const out = await updateRoleUsecase({ requester: req.user, role_id, payload });
    return res.json(out);
  } catch (err) { next(err); }
};

const remove = async (req, res, next) => {
  try {
    const role_id = Number(req.params.role_id);
    if (!Number.isInteger(role_id)) return next({ status: 400, message: 'Invalid role_id' });

    await deleteRoleUsecase({ requester: req.user, role_id });
    return res.status(204).send();
  } catch (err) { next(err); }
};

module.exports = {
  getById,
  list,
  create,
  update,
  remove
};