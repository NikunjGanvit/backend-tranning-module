'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addConstraint('User_permissions', {
      fields: ['user_id'],
      type: 'foreign key',
      name: 'userpermissions_fk_user_id',
      references: {
        table: 'Users',
        field: 'id'
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE'
    });

    // module_code FK -> Permission_modules.module_code
    await queryInterface.addConstraint('User_permissions', {
      fields: ['module_code'],
      type: 'foreign key',
      name: 'userpermissions_fk_module_code',
      references: {
        table: 'Permission_modules',
        field: 'module_code'
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeConstraint('User_permissions', 'userpermissions_fk_module_code');
    await queryInterface.removeConstraint('User_permissions', 'userpermissions_fk_user_id');
  }
};
