// controllers/roleAssignController.js
const { assignRoleUsecase } = require('../usecase/assignRole/assignroleUsecase');

const assign = async (req, res, next) => {
  try {
    const payload = req.body;
    const { created, assignment } = await assignRoleUsecase({ requester: req.user, payload });

    // created -> 201, already existed -> 200
    if (created) {
      return res.status(201).json(assignment);
    } else {
      return res.status(200).json(assignment);
    }
  } catch (err) {
    return next(err);
  }
};

module.exports = { assign };
