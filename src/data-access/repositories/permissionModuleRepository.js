const { PermissionModule } = require('../models');

const create = async (payload) => PermissionModule.create(payload);
const findByCode = async (module_code) => PermissionModule.findOne({ where: { module_code }});
const updateByCode = async (module_code, patch) => PermissionModule.update(patch, { where: { module_code }});
const disableByCode = async (module_code) => PermissionModule.update({ is_active: false }, { where: { module_code }});

module.exports = { create, findByCode, updateByCode, disableByCode };
