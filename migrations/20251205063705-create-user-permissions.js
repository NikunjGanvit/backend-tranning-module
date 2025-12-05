'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('User_permissions', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      module_code: {
        type: Sequelize.STRING,
        allowNull: false
      },
      can_create: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      can_update: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      can_delete: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      can_view: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      assigned_by: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('NOW()')
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('NOW()')
      }
    });

    // composite unique so same user cannot have duplicate row for same module
    await queryInterface.addConstraint('User_permissions', {
      fields: ['user_id', 'module_code'],
      type: 'unique',
      name: 'user_module_unique'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeConstraint('User_permissions', 'user_module_unique');
    await queryInterface.dropTable('User_permissions');
  }
};
