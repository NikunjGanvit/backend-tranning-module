'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addConstraint('Permission_modules', {
      fields: ['created_by'],
      type: 'foreign key',
      name: 'permissionmodules_fk_created_by_userid',
      references: {
        table: 'Users',
        field: 'id'
      },
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeConstraint('Permission_modules', 'permissionmodules_fk_created_by_userid');
  }
};
