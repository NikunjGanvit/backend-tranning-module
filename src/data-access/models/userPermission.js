'use strict';
module.exports = (sequelize, DataTypes) => {
  const UserPermission = sequelize.define('UserPermission', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    user_id: { type: DataTypes.INTEGER, allowNull: false },
    module_code: { type: DataTypes.STRING, allowNull: false },
    can_create: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
    can_update: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
    can_delete: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
    can_view: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
    assigned_by: { type: DataTypes.INTEGER, allowNull: true }
  }, {
    tableName: 'User_permissions',
    timestamps: true,
    indexes: [
      { unique: true, fields: ['user_id', 'module_code'] }
    ]
  });

  UserPermission.associate = (models) => {
    UserPermission.belongsTo(models.User, { foreignKey: 'user_id' });
    UserPermission.belongsTo(models.PermissionModule, { foreignKey: 'module_code', targetKey: 'module_code' });
  };

  return UserPermission;
};
