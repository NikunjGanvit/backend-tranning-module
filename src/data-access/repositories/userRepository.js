const { User } = require('../models');

const create = async (payload) => {
  return User.create(payload);
};

const findByUsername = async (username) => {
  return User.findOne({ where: { username }});
};

const findById = async (id) => {
  return User.findByPk(id);
};

const updateById = async (id, patch) => {
  return User.update(patch, { where: { id }});
};

const softDelete = async (id, deletedBy) => {
  return User.update({ is_deleted: true, deleted_by: deletedBy, deleted_at: new Date() }, { where: { id }});
};

module.exports = { create, findByUsername, findById, updateById, softDelete };
