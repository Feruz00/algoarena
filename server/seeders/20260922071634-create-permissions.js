"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const keys = [
      {
        name: "Ygtyýarlyk",
        key: "role",
        sub: 1,
        main: 1,
      },
      {
        name: "Ulanyjy",
        key: "user",
        sub: 2,
        main: 1,
      },
      {
        name: "Bäsleşik",
        key: "contest",
        sub: 3,
        main: 1,
      },
      {
        name: "Mesele",
        key: "problem",
        sub: 4,
        main: 1,
      },
      {
        name: "Çeşme",
        key: "source",
        sub: 5,
        main: 1,
      },
      {
        name: "Toparlar",
        key: "group",
        sub: 6,
        main: 1,
      },

      {
        name: "Test toparlary",
        key: "test-group",
        sub: 7,
        main: 1,
      },
      {
        name: "Testler",
        key: "test-case",
        sub: 8,
        main: 1,
      },
      {
        name: "Tegler",
        key: "tag",
        sub: 9,
        main: 1,
      },
    ];
    const words = [
      {
        name: "döretmek",
        key: "create",
      },
      {
        name: "görmek",
        key: "get",
      },
      {
        name: "üýtgetmek",
        key: "update",
      },
      {
        name: "pozmak",
        key: "delete",
      },
    ];
    const permissions = [];
    for (const key of keys) {
      words.forEach((word) => {
        permissions.push({
          label: `${key.name} ${word.name}`,
          name: `${word.key}:${key.key}`,
          sub: key.sub,
          main: key.main,
        });
      });
    }
    // permissions.push({
    //   label: "Ähli bäsleşiklere gatnaşyp bilmek",
    //   name: "contest:access",
    //   sub: 2,
    //   main: 1,
    // });
    // permissions.push({
    //   label: "Ähli çeşmelerden peýdalanyp bilmek",
    //   name: "source:access",
    //   sub: 2,
    //   main: 1,
    // });
    permissions.push({
      label: "Admin tarapa rugsat",
      name: "admin:access",
      sub: 10,
      main: 1,
    });
    permissions.push({
      label: "Ulanyjy tarapa rugsat",
      name: "client:access",
      sub: 10,
      main: 1,
    });
    permissions.push({
      label: "Hasabatlary görmek",
      name: "report:view",
      sub: 10,
      main: 1,
    });

    permissions.push({
      label: "Pozulanlaryň üstünde amallar",
      name: "restore:access",
      sub: 10,
      main: 1,
    });
    permissions.push({
      label: "Ulgama edilen synanyşyklary görmek",
      name: "log:access",
      sub: 10,
      main: 1,
    });

    const clientSide = [
      {
        label: "Bäsleşikleri görmek",
        name: "use:contests",
        sub: 1,
        main: 2,
      },
      {
        label: "Meseleleri görmek",
        name: "use:problems",
        sub: 2,
        main: 2,
      },
      {
        label: "Çeşmeleri görmek",
        name: "use:sources",
        sub: 3,
        main: 2,
      },
      {
        label: "Ulanyjylary görmek",
        name: "use:users",
        sub: 4,
        main: 2,
      },

      {
        label: "Tegleri görmek",
        name: "use:tags",
        sub: 4,
        main: 2,
      },
      {
        label: "Reýting sahypana rugsat",
        name: "use:rating",
        sub: 4,
        main: 2,
      },
      {
        label: "Sazlamalardan peýdalanmak",
        name: "use:settings",
        sub: 4,
        main: 2,
      },
      {
        label: "Diňe bir ýerden girmeklik",
        name: "use:oneLogin",
        sub: 4,
        main: 2,
      },
      {
        label: "Diňe toparyna degişli maglumatlary görmeklik",
        name: "use:onlyGroup",
        sub: 4,
        main: 2,
      },
      {
        label: "Ähli ugratmalaryň sanawyny görmeklik",
        name: "use:showSubmission",
        sub: 4,
        main: 2,
      },
      {
        label: "Ugratmadaky çözüwleri görmek",
        name: "use:showSolution",
        sub: 4,
        main: 2,
      },
      {
        label: "Öz gatnaşyklarymy görmek",
        name: "use:home",
        sub: 4,
        main: 2,
      },
    ];

    await queryInterface.bulkInsert(
      "tbl_permissions",
      [...permissions, ...clientSide].map((row) => ({
        ...row,
        createdAt: new Date(),
        updatedAt: new Date(),
      })),
      {},
    );
  },

  async down(queryInterface, Sequelize) {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */

    await queryInterface.bulkDelete("tbl_permissions", null, {});
  },
};
