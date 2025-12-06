'use strict';

module.exports = (sequelize, DataTypes) => {
  const ItemModule = sequelize.define('ItemModule', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },

    item_code: {
      type: DataTypes.STRING,
      allowNull: false 
    },

    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },

    item_pictures: {
      // Stores MinIO URLs or object keys. Use ARRAY of strings for Postgres.
      type: DataTypes.ARRAY(DataTypes.STRING),
      allowNull: true,
      defaultValue: []
    },

    length: {
      type: DataTypes.FLOAT,
      allowNull: true
    },

    breadth: {
      type: DataTypes.FLOAT,
      allowNull: true
    },

    height: {
      type: DataTypes.FLOAT,
      allowNull: true
    },

    version: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1
    },

    created_by: {
      type: DataTypes.INTEGER,
      allowNull: true
    },

    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: sequelize.literal('CURRENT_TIMESTAMP')
    }
  }, {
    tableName: 'Item_module',
    timestamps: false,
    underscored: true,

  });
  
  

  /**
   * Instance & association setup
   */
  ItemModule.associate = function(models) {
    // creator (user who created this version)
    ItemModule.belongsTo(models.User, {
      foreignKey: 'created_by',
      as: 'creator',
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    });

    // If you ever add `updated_by` or other user references, add belongsTo associations similarly.

    // Example: if you have a PermissionModule model and want to attach it (not recommended), you'd do:
    // ItemModule.belongsTo(models.PermissionModule, { foreignKey: 'module_code', targetKey: 'module_code' });
  };

  return ItemModule;
};
