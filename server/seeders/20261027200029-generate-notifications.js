"use strict";

const { randomInt } = require("crypto");
const dayjs = require("dayjs");

const randomItem = (items) => items[randomInt(items.length)];

const templates = [
  {
    type: "success",
    titleEn: "Contest Started",
    titleRu: "Соревнование началось",
    titleTm: "Bäsleşik başlandy",
    messageEn: (contest) =>
      `The contest "${contest.title}" has started. Good luck!`,
    messageRu: (contest) => `Соревнование «${contest.title}» началось. Удачи!`,
    messageTm: (contest) =>
      `"${contest.title}" bäsleşigi başlandy. Üstünlik arzuw edýäris!`,
  },
  {
    type: "success",
    titleEn: "Contest Finished",
    titleRu: "Соревнование завершено",
    titleTm: "Bäsleşik tamamlandy",
    messageEn: (contest) =>
      `The contest "${contest.title}" has ended. Check the final standings.`,
    messageRu: (contest) =>
      `Соревнование «${contest.title}» завершилось. Проверьте итоговую таблицу результатов.`,
    messageTm: (contest) =>
      `"${contest.title}" bäsleşigi tamamlandy. Jemleýji netijeleri barlaň.`,
  },
  {
    type: "warning",
    titleEn: "Contest Issue Reported",
    titleRu: "Сообщено о проблеме",
    titleTm: "Mesele barada habar berildi",
    messageEn: (contest) =>
      `An issue was reported during "${contest.title}". Please check the contest details.`,
    messageRu: (contest) =>
      `Во время соревнования «${contest.title}» сообщено о проблеме. Проверьте информацию о соревновании.`,
    messageTm: (contest) =>
      `"${contest.title}" bäsleşiginiň dowamynda mesele barada habar berildi. Bäsleşigiň maglumatlaryny barlaň.`,
  },
  {
    type: "error",
    titleEn: "Contest Error",
    titleRu: "Ошибка соревнования",
    titleTm: "Bäsleşikde ýalňyşlyk",
    messageEn: (contest) =>
      `A problem occurred during "${contest.title}". Please review it.`,
    messageRu: (contest) =>
      `Во время соревнования «${contest.title}» возникла проблема. Пожалуйста, проверьте её.`,
    messageTm: (contest) =>
      `"${contest.title}" bäsleşiginiň dowamynda näsazlyk ýüze çykdy. Ony barlaň.`,
  },
  {
    type: "info",
    titleEn: "Contest Announcement",
    titleRu: "Объявление соревнования",
    titleTm: "Bäsleşik habarnamasy",
    messageEn: (contest) =>
      `There is an update regarding "${contest.title}". Check the contest page for details.`,
    messageRu: (contest) =>
      `Появилось обновление по соревнованию «${contest.title}». Подробности смотрите на странице соревнования.`,
    messageTm: (contest) =>
      `"${contest.title}" bäsleşigi barada täzelenme bar. Maglumat üçin bäsleşigiň sahypasyny barlaň.`,
  },
];

const generalTemplates = [
  {
    type: "info",
    titleEn: "Welcome",
    titleRu: "Добро пожаловать",
    titleTm: "Hoş geldiňiz",
    messageEn: () =>
      "Welcome to the Online Judge! Practice problems and improve your programming skills.",
    messageRu: () =>
      "Добро пожаловать в Online Judge! Решайте задачи и улучшайте навыки программирования.",
    messageTm: () =>
      "Online Judge ulgamyna hoş geldiňiz! Meseleleri çözüň we programmirleme başarnyklaryňyzy ösdürin.",
  },
  {
    type: "success",
    titleEn: "Keep Learning",
    titleRu: "Продолжайте обучение",
    titleTm: "Öwrenmegi dowam ediň",
    messageEn: () =>
      "Keep practicing and solving problems to improve your programming skills.",
    messageRu: () =>
      "Продолжайте решать задачи, чтобы улучшить навыки программирования.",
    messageTm: () =>
      "Programmirleme başarnyklaryňyzy ösdürmek üçin meseleleri çözmegi dowam ediň.",
  },
];

module.exports = {
  async up(queryInterface, Sequelize) {
    const sequelize = queryInterface.sequelize;
    const transaction = await sequelize.transaction();

    try {
      const users = await sequelize.query(
        "SELECT id FROM tbl_users ORDER BY id ASC",
        {
          type: Sequelize.QueryTypes.SELECT,
          transaction,
        },
      );

      const contests = await sequelize.query(
        "SELECT id, title FROM tbl_contests ORDER BY id ASC",
        {
          type: Sequelize.QueryTypes.SELECT,
          transaction,
        },
      );

      if (users.length === 0) {
        console.log("No users found. Notification seeder skipped.");
        await transaction.commit();
        return;
      }

      const notifications = [];
      const now = Date.now();
      const daysBack = 30 * 24 * 60 * 60 * 1000;

      // Generate 2–5 notifications for each user.
      for (const user of users) {
        const count = randomInt(2, 6);

        for (let i = 0; i < count; i++) {
          const hasContests = contests.length > 0;

          const template = hasContests
            ? randomItem(templates)
            : randomItem(generalTemplates);

          const contest = hasContests
            ? randomItem(contests)
            : { title: "Online Judge" };

          const createdAt = dayjs(
            randomInt(
              dayjs().subtract(30, "day").valueOf(),
              dayjs().valueOf() + 1,
            ),
          ).toDate();
          notifications.push({
            userId: user.id,

            titleEn: template.titleEn,
            titleRu: template.titleRu,
            titleTm: template.titleTm,

            messageEn: template.messageEn(contest),
            messageRu: template.messageRu(contest),
            messageTm: template.messageTm(contest),

            type: template.type,
            read: Math.random() < 0.5,

            createdAt,
            updatedAt: createdAt,
          });
        }
      }
      // cnpm onsole.log(notifications);
      await queryInterface.bulkInsert("tbl_notifications", notifications, {
        transaction,
      });

      await transaction.commit();

      console.log(
        `Created ${notifications.length} notifications for ${users.length} users.`,
      );
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  },

  async down() {
    // Intentionally preserve notifications.
    // This seeder does not track which records it created.
  },
};
