const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('Item_module', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    item_code: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: "unique_itemcode_version"
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    item_pictures: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      allowNull: true
    },
    length: {
      type: DataTypes.DOUBLE,
      allowNull: true
    },
    breadth: {
      type: DataTypes.DOUBLE,
      allowNull: true
    },
    height: {
      type: DataTypes.DOUBLE,
      allowNull: true
    },
    version: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
      unique: "unique_itemcode_version"
    },
    created_by: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id'
      }
    }
  }, {
    sequelize,
    tableName: 'Item_module',
    schema: 'public',
    timestamps: true,
    indexes: [
      {
        name: "Item_module_pkey",
        unique: true,
        fields: [
          { name: "id" },
        ]
      },
      {
        name: "unique_itemcode_version",
        unique: true,
        fields: [
          { name: "item_code" },
          { name: "version" },
        ]
      },
    ]
  });
};
