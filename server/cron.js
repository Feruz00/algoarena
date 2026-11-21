const cron = require("node-cron");
const { Logs } = require("./models");
const { Op } = require("sequelize");
const dayjs = require("dayjs");

const cronJob = () => {
  cron.schedule("0 12 * * *", async () => {
    try {
      const cutoff = dayjs().subtract(15, "day").toDate();

      const deleted = await Logs.destroy({
        where: {
          createdAt: {
            [Op.lt]: cutoff,
          },
        },
      });

      console.log(
        `[CRON] Deleted ${deleted} logs older than 15 days (${dayjs().format()})`,
      );
    } catch (err) {
      console.error("[CRON] Failed to clean old logs:", err);
    }
  });
};

module.exports = cronJob;
