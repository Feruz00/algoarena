const { Kafka, logLevel } = require("kafkajs");
const { getIO } = require("../socket");
const { Contests, Submissions, ContestUsers } = require("../models");
const { getRedis } = require("../config/redis");
const dayjs = require("dayjs");
const { getContestCache } = require("../utils/contestCache");
const { setContestPenalty } = require("../utils/contestPenalty");

const KAFKA_BROKER = process.env.KAFKA_BROKER || "localhost:9092";
const TOPIC = "judge.events";

// const failedVerdicts = ["WA", "TLE", "RE", "MLE", "CE", "PE"];

// Temporary in-memory deduplication.
// Use a database uniqueness constraint for production.
const finished = new Set();

const kafka = new Kafka({
  clientId: "backend",
  brokers: [KAFKA_BROKER],
  logLevel: logLevel.INFO,
});

const consumer = kafka.consumer({
  groupId: "backend-judge-events",
});

const runKafka = async () => {
  try {
    console.log("[Kafka] Connecting to:", KAFKA_BROKER);

    await consumer.connect();
    console.log("[Kafka] Consumer connected");

    await consumer.subscribe({
      topic: TOPIC,
      fromBeginning: false,
    });

    console.log(`[Kafka] Subscribed to topic: ${TOPIC}`);

    consumer.on(consumer.events.CRASH, ({ payload }) => {
      console.error("[Kafka] Consumer crashed:", payload.error);
    });

    await consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        try {
          if (!message.value) {
            console.warn("[Kafka] Empty message received");
            return;
          }

          const ev = JSON.parse(message.value.toString());

          // console.log("[Kafka] Message received:", {
          //   topic,
          //   partition,
          //   key: message.key?.toString(),
          //   event: ev,
          // });

          if (!ev.submissionId || !ev.userId || !ev.problemId) {
            console.warn("[Kafka] Missing data:", ev);
            return;
          }

          // console.log(ev);
          const data = await Submissions.findOne({
            where: {
              id: ev.submissionId,
            },
          });

          if (ev.status === "COMPILING") {
            await data.update({ status: "compiling" });
          } else if (ev.status === "RUNNING" && data.status === "compiling") {
            await data.update({ status: "running" });
          }
          if (ev.status === "FINISHED") {
            const saved = {};
            if (ev.log) {
              saved.log = ev.log;
            }
            if (ev.verdict === "WA") {
              saved.log = `${ev.failedTest.testgroup}_${ev.failedTest.testcase}`;
            }
            saved.timeMs = ev.timeMs || 0;
            saved.memoryKb = ev.memoryKb || 0;
            saved.status = "finished";
            saved.verdict = ev.verdict;
            saved.score = ev.score || 0;
            // console.log(saved);
            await data.update(saved);

            if (data.contestId) {
              const redis = getRedis();

              // Reuse contest cache
              const contestData = await getContestCache(data.contestId);

              // Apply penalty
              const failedVerdicts = new Set(["WA", "TLE", "RE", "MLE", "PE"]);
              // const failedVerdicts = ["WA", "TLE", "RE", "MLE", "CE", "PE"];
              // console.log(ev.verdict);
              if (data.contestId && data.duringContest) {
                const contestData = await getContestCache(data.contestId);

                const penaltyMinutes = Number(contestData?.penaltyMinutes || 0);

                const verdict = String(ev.verdict).toUpperCase();

                if (failedVerdicts.has(verdict) && penaltyMinutes > 0) {
                  await setContestPenalty(
                    data.contestId,
                    data.userId,
                    penaltyMinutes,
                  );

                  console.log(
                    `[Penalty] User ${data.userId} cannot submit for ${penaltyMinutes} minutes`,
                  );
                }
              }

              // Get contest participants
              const cacheKey = `results-${data.contestId}`;

              let ids;
              const cachedUsers = await redis.get(cacheKey);

              if (cachedUsers) {
                ids = JSON.parse(cachedUsers);
              } else {
                const users = await ContestUsers.findAll({
                  where: {
                    contestId: data.contestId,
                  },
                  attributes: ["userId"],
                });

                ids = users.map((row) => row.userId);

                await redis.set(cacheKey, JSON.stringify(ids), "EX", 3600 * 60);
              }

              const io = getIO();

              const time = contestData?.startTime
                ? dayjs(data.createdAt).diff(dayjs(contestData.startTime))
                : 0;

              ids.forEach((id) => {
                io.to(`${id}`).emit("contest:results:update", {
                  ...ev,
                  contestId: data.contestId,
                  time,
                });
              });
            }

            // if (data.contestId) {
            //   const redis = getRedis();

            //   const contestCacheKey = `data-contest-${ev.contestId}`;
            //   let contestData;
            //   const cachedContest = await redis.get(contestCacheKey);

            //   if (cachedContest) {
            //     contestData = JSON.parse(cachedContest);
            //   } else {
            //     const contest = await Contests.findByPk(data.contestId);
            //     if (contest) {
            //       contestData = contest.toJSON();
            //       await redis.set(
            //         contestCacheKey,
            //         JSON.stringify(contestData),
            //         "Ex",
            //         3600 * contestData.duration,
            //       );
            //     }
            //   }

            //   const cacheKey = `results-${ev.contestId}`;
            //   const cachedUser = await redis.get(cacheKey);
            //   let ids;
            //   if (cachedUser) {
            //     ids = JSON.parse(cachedUser);
            //   } else {
            //     const users = await ContestUsers.findAll({
            //       where: {
            //         contestId: data.contestId,
            //       },
            //     });
            //     ids = users.map((row) => row.userId);
            //     await redis.set(cacheKey, JSON.stringify(ids), "Ex", 3600 * 60);
            //   }

            //   const io = getIO();
            //   console.log("gitmeli adamlara:", ids);
            //   let time;
            //   if (contestData) {
            //     time = dayjs(data.createdAt).diff(dayjs(contestData.startTime));
            //   }
            //   console.log(time);
            //   ids.forEach((id) => {
            //     io.to(`${id}`).emit("contest:results:update", {
            //       ...ev,
            //       contestId: data.contestId,
            //       time,
            //     });
            //   });
            // }
          }

          const io = getIO();

          io.to(`${ev.userId}`).emit("judge:update", ev);
        } catch (error) {
          console.error("[Kafka] Message processing failed:", error);
        }
      },
    });
  } catch (error) {
    console.error("[Kafka] Startup failed:", error);
    throw error;
  }
};

module.exports = { runKafka };
