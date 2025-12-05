'use strict';
module.exports = (sequelize, DataTypes) => {
  const PermissionModule = sequelize.define('PermissionModule', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    module_code: { type: DataTypes.STRING, allowNull: false, unique: true },
    module_description: DataTypes.STRING,
    is_active: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
    created_by: { type: DataTypes.INTEGER, allowNull: true }
  }, {
    tableName: 'Permission_modules',
    timestamps: true
  });

  PermissionModule.associate = (models) => {
    PermissionModule.hasMany(models.UserPermission, { foreignKey: 'module_code', sourceKey: 'module_code' });
    PermissionModule.belongsTo(models.User, { foreignKey: 'created_by' });
  };

  return PermissionModule;
};
