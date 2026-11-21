const { getIO } = require("../socket");
const { Notifications } = require("../models");

const emitContestStarted = async (contest, userIds) => {
  const io = getIO();

  const notification = {
    titleEn: "Competition Started",
    titleRu: "Соревнование началось",
    titleTm: "Bäsleşik başlady",

    messageEn: `${contest.title} competition has begun.`,
    messageRu: `Соревнование ${contest.title} началось.`,
    messageTm: `${contest.title} bäsleşik başlady.`,

    type: "success",
  };

  for (const userId of userIds) {
    await Notifications.create({
      userId,
      ...notification,
    });

    io.to(String(userId)).emit("notification", {
      contestId: contest.id,
      ...notification,
      read: false,
    });
  }

  io.emit("contest:started", {
    contestId: contest.id,
    title: contest.title,
    startedAt: contest.startedAt,
    type: "success",
  });
};

const emitContestFinished = async (contest, userIds) => {
  const io = getIO();

  const notification = {
    titleEn: "Competition Finished",
    titleRu: "Соревнование завершено",
    titleTm: "Bäsleşik tamamlandy",

    messageEn: `${contest.title} competition has finished.`,
    messageRu: `Соревнование ${contest.title} завершено.`,
    messageTm: `${contest.title} bäsleşik tamamlandy.`,

    type: "info",
  };

  for (const userId of userIds) {
    await Notifications.create({
      userId,
      ...notification,
    });

    io.to(String(userId)).emit("notification", {
      contestId: contest.id,
      ...notification,
      read: false,
    });
  }

  io.emit("contest:finished", {
    contestId: contest.id,
    title: contest.title,
    finishedAt: contest.finishedAt,
    type: "info",
  });
};

const emitContestBlocked = async (contestId, userId) => {
  const io = getIO();

  io.to(String(userId)).emit("contest:blocked", {
    contestId,
    userId,
  });
};

module.exports = {
  emitContestStarted,
  emitContestFinished,
  emitContestBlocked,
};
