'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    try {
      await queryInterface.removeConstraint('Roles', 'fk_roles_module_code_permission_modules');
    } catch (err) {
      // If the constraint name is different or doesn't exist, ignore error but log for visibility
      console.warn('Warning: removeConstraint failed (maybe constraint not present or different name):', err.message || err);
    }

    // 2) drop column module_code (if present)
    //    Using try/catch so migration won't fail if column already removed
    try {
      await queryInterface.removeColumn('Roles', 'module_code');
    } catch (err) {
      console.warn('Warning: removeColumn module_code failed (maybe column not present):', err.message || err);
    }

    // 3) add permission boolean columns (default false)
    await queryInterface.addColumn('Roles', 'can_create', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false
    });

    await queryInterface.addColumn('Roles', 'can_update', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false
    });

    await queryInterface.addColumn('Roles', 'can_delete', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false
    });

    await queryInterface.addColumn('Roles', 'can_view', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false
    });

    // 4) (optional) if you want created_by to be NOT NULL you can alter it here.
    //    I'm leaving created_by as-is (nullable) to match your earlier setup.
  },

  async down(queryInterface, Sequelize) {
    // revert: remove new permission columns
    await queryInterface.removeColumn('Roles', 'can_view');
    await queryInterface.removeColumn('Roles', 'can_delete');
    await queryInterface.removeColumn('Roles', 'can_update');
    await queryInterface.removeColumn('Roles', 'can_create');

    // re-add module_code column (nullable by default to avoid data issues)
    await queryInterface.addColumn('Roles', 'module_code', {
      type: Sequelize.STRING,
      allowNull: true
    });

    // re-create FK constraint pointing to permission_modules.module_code
    // NOTE: change table name if your permission modules table is named differently
    await queryInterface.addConstraint('Roles', {
      fields: ['module_code'],
      type: 'foreign key',
      name: 'fk_roles_module_code_permission_modules',
      references: {
        table: 'Permission_modules',
        field: 'module_code'
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT'
    });
  }
};
