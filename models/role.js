'use strict';
module.exports = (sequelize, DataTypes) => {
  const Role = sequelize.define('Role', {
    role_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    role_name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    can_create: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    can_update: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    can_delete: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    can_view: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    created_by: {
      type: DataTypes.INTEGER,
      allowNull: true
    }
    // Note: createdAt and updatedAt are handled automatically by timestamps: true
  }, {
    tableName: 'Roles',
    timestamps: true
  });

  Role.associate = (models) => {
    // Role -> UserRole
    Role.hasMany(models.UserRole, { foreignKey: 'role_id' });

    Role.belongsTo(models.User, {
      foreignKey: 'created_by',
      targetKey: 'id',
      as: 'creator'
    });
  };

  return Role;
};
