const { Op } = require("sequelize");

const { Contests, ContestRegistrations } = require("../models");

const { scheduleContestFinish, removeContestJobs } = require("./contestQueue");

const { emitContestFinished } = require("../socket/contest");

async function recoverRunningContests() {
  console.log("🔄 Checking running contests...");

  const contests = await Contests.findAll({
    where: {
      status: "running",
    },
  });

  let finishedCount = 0;
  let scheduledCount = 0;

  for (const contest of contests) {
    try {
      if (!contest.startedAt || !contest.duration) {
        console.warn(`⚠️ Contest ${contest.id} has invalid start information.`);
        continue;
      }

      const expectedFinishAt =
        new Date(contest.startedAt).getTime() +
        Number(contest.duration) * 60 * 1000;

      if (!Number.isFinite(expectedFinishAt)) {
        console.warn(`⚠️ Contest ${contest.id} has invalid finish time.`);
        continue;
      }

      // Contest should already have finished.
      if (expectedFinishAt <= Date.now()) {
        const [updated] = await Contests.update(
          {
            status: "finished",
            finishedAt: new Date(expectedFinishAt),
          },
          {
            where: {
              id: contest.id,
              status: "running",
              startedAt: contest.startedAt,
              duration: contest.duration,
            },
          },
        );

        if (updated) {
          await contest.reload();

          const registrations = await ContestRegistrations.findAll({
            where: {
              contestId: contest.id,
              status: "registered",
            },
            attributes: ["userId"],
          });

          const userIds = registrations.map((item) => item.userId);

          await emitContestFinished(contest, userIds);

          finishedCount++;

          console.log(
            `✅ Contest ${contest.id} recovered and marked as finished.`,
          );
        }

        // Remove any outdated start/finish jobs.
        await removeContestJobs(contest.id);

        continue;
      }

      // Contest is still running. Ensure its finish job exists.
      await scheduleContestFinish(contest);

      scheduledCount++;

      console.log(
        `⏰ Contest ${contest.id} finish job scheduled for ${new Date(
          expectedFinishAt,
        ).toISOString()}`,
      );
    } catch (error) {
      console.error(`❌ Could not recover contest ${contest.id}:`, error);
    }
  }

  console.log("✅ Contest recovery completed:", {
    checked: contests.length,
    finished: finishedCount,
    scheduled: scheduledCount,
  });
}

module.exports = {
  recoverRunningContests,
};
