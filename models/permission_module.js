'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class PermissionModule extends Model {
    static associate(models) {
      PermissionModule.hasMany(models.UserPermission, { foreignKey: 'module_code', sourceKey: 'module_code' });
      PermissionModule.belongsTo(models.User, { foreignKey: 'created_by' });
    }
  }
  PermissionModule.init({
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    module_code: { type: DataTypes.STRING, allowNull: false, unique: true },
    module_description: DataTypes.STRING,
    is_active: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
    created_by: { type: DataTypes.INTEGER, allowNull: true }
  }, {
    sequelize,
    modelName: 'PermissionModule',
    tableName: 'Permission_modules',
    timestamps: true
  });
  return PermissionModule;
};
