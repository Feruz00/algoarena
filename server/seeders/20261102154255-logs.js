"use strict";

const dayjs = require("dayjs");

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const logs = [];
    const usernames = ["admin", "judge1", "judge2", "operator", "testuser"];
    const ips = ["192.168.1.10", "10.0.0.5", "172.16.0.22", "203.0.113.45"];

    // Generate logs for the last 30 days
    for (let i = 0; i < 30; i++) {
      const date = dayjs().subtract(i, "day");

      // 1 success login
      logs.push({
        username: usernames[i % usernames.length],
        password: null,
        ip: ips[i % ips.length],
        action: "login_success",
        status: "success",
        userId: (i % 5) + 1,
        message: "User logged in successfully",
        createdAt: date.hour(9).minute(15).toDate(),
        updatedAt: date.hour(9).minute(15).toDate(),
      });

      // 1 failed login
      logs.push({
        username: usernames[(i + 1) % usernames.length],
        password: "wrongpass123",
        ip: ips[(i + 1) % ips.length],
        action: "login_failed",
        status: "failed",
        userId: null,
        message: "Invalid credentials",
        createdAt: date.hour(11).minute(30).toDate(),
        updatedAt: date.hour(11).minute(30).toDate(),
      });

      // 1 logout
      logs.push({
        username: usernames[i % usernames.length],
        password: null,
        ip: ips[i % ips.length],
        action: "logout",
        status: "success",
        userId: (i % 5) + 1,
        message: "User logged out",
        createdAt: date.hour(18).minute(0).toDate(),
        updatedAt: date.hour(18).minute(0).toDate(),
      });
    }

    await queryInterface.bulkInsert("tbl_logs", logs);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("tbl_logs", null, {});
  },
};
