"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const roles = [
      {
        label: "superadmin",
      },
      {
        label: "admin",
      },
      {
        label: "user",
      },
      {
        label: "participate",
      },
    ];
    await queryInterface.bulkInsert(
      "tbl_roles",
      roles.map((row) => ({
        ...row,
        createdAt: new Date(),
        updatedAt: new Date(),
      })),
      {},
    );
    const roleToPer = [];
    for (let i = 1; i <= 53; i++) {
      roleToPer.push({
        roleId: 1,
        permissionId: i,
      });
    }

    for (let i = 9; i <= 37; i++) {
      roleToPer.push({
        roleId: 2,
        permissionId: i,
      });
    }

    for (let i = 42; i <= 48; i++) {
      roleToPer.push({
        roleId: 3,
        permissionId: i,
      });
    }
    let ids = [38, 51, 52, 53];
    ids.forEach((id) => {
      roleToPer.push({
        roleId: 3,
        permissionId: id,
      });
    });

    for (let i = 42; i <= 43; i++) {
      roleToPer.push({
        roleId: 4,
        permissionId: i,
      });
    }
    ids = [38, 49, 50];

    ids.forEach((id) => {
      roleToPer.push({
        roleId: 4,
        permissionId: id,
      });
    });

    await queryInterface.bulkInsert(
      "tbl_roles_to_permissions",
      roleToPer.map((row) => ({
        ...row,
        createdAt: new Date(),
        updatedAt: new Date(),
      })),
      {},
    );

    /**
     * Add seed commands here.
     *
     * Example:
     * await queryInterface.bulkInsert('People', [{
     *   name: 'John Doe',
     *   isBetaMember: false
     * }], {});
     */
  },

  async down(queryInterface, Sequelize) {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});

    */
    await queryInterface.bulkDelete("tbl_roles_to_permissions", null, {});
    await queryInterface.bulkDelete("tbl_roles", null, {});
  },
};
