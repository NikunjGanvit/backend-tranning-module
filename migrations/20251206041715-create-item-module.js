'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {

    await queryInterface.createTable('Item_module', {

      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },

      item_code: {
        type: Sequelize.STRING,
        allowNull: false
      },

      description: {
        type: Sequelize.TEXT,
        allowNull: true
      },

      item_pictures: {
        type: Sequelize.ARRAY(Sequelize.STRING),   
        allowNull: true
      },

      length: {
        type: Sequelize.FLOAT,
        allowNull: true
      },

      breadth: {
        type: Sequelize.FLOAT,
        allowNull: true
      },

      height: {
        type: Sequelize.FLOAT,
        allowNull: true
      },

      version: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 1
      },

      created_by: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Users',   
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },

      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });

    await queryInterface.addConstraint('Item_module', {
      fields: ['item_code', 'version'],
      type: 'unique',
      name: 'unique_itemcode_version'
    });

  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Item_module');
  }
};
