"use strict";

const { turkmenToLatin } = require("../utils/functions");
const { toHash } = require("../utils/password");

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const password = await toHash("test12345");
    const users = [
      {
        fullName: "superadmin",
        username: "superadmin",
        password: password,
        roleId: 1,
        status: "active",
        createdAt: new Date(),
        updatedAt: new Date(),
      },

      {
        fullName: "admin",
        username: "admin",
        password: password,
        roleId: 2,
        status: "active",
        createdAt: new Date(),
        updatedAt: new Date(),
      },

      {
        fullName: "user",
        username: "user",
        password: password,
        roleId: 3,
        status: "active",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ].map((row) => ({
      ...row,
      email: `${row.username}@gmail.com`,
      github: `${row.username}-dev`,
      organization: "S.Seydi adyndaky TDMI",
      website: `${row.username}.dev.com`,
      bio: `Software engineer`,
    }));

    const names = ["Myrat", "Begenç", "Dovran", "Hoja", "Ata"];
    const surnames = [
      "Geldimyradow",
      "Nuryýew",
      "Türkmenow",
      "Şükürow",
      "Serdarow",
      "Annagulyýew",
    ];

    const namesLength = names.length;
    const surnamesLength = surnames.length;

    let k = 50;

    while (k--) {
      const surname = surnames[Math.floor(Math.random() * surnamesLength)];
      const name = names[Math.floor(Math.random() * namesLength)];
      const fullName = `${surname} ${name}`;
      const username = `${turkmenToLatin(surname)}_${turkmenToLatin(name)}_${k}`;

      users.push({
        fullName: fullName,
        username: username,
        password: password,
        roleId: 3,
        email: `${username}@gmail.com`,
        github: `${username}-dev`,
        organization: "S.Seydi adyndaky TDMI",
        website: `${username}.dev.com`,
        bio: `Software engineer`,
        status: "active",
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }

    for (let group = 501; group <= 506; group++) {
      k = 15;
      while (k--) {
        const surname = surnames[Math.floor(Math.random() * surnamesLength)];
        const name = names[Math.floor(Math.random() * namesLength)];
        const fullName = `${surname} ${name}`;
        const username = `${group}_${k}`;

        users.push({
          fullName: fullName,
          username: username,
          password: password,
          email: `${username}@gmail.com`,
          github: `${username}-dev`,
          organization: "S.Seydi adyndaky TDMI",
          website: `${username}.dev.com`,
          bio: `Software engineer`,

          roleId: 4,
          status: "active",
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      }
    }

    await queryInterface.bulkInsert("tbl_users", users, {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("tbl_users", null, {});
  },
};
