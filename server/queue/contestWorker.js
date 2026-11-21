const { Worker } = require("bullmq");
const { getRedis } = require("../config/redis");

const {
  START_JOB,
  FINISH_JOB,
  scheduleContestFinish,
} = require("./contestQueue");

const { Contests, ContestRegistrations, Problems } = require("../models");

const {
  emitContestStarted,
  emitContestFinished,
} = require("../socket/contest");

const worker = new Worker(
  "contest",
  async (job) => {
    const { contestId } = job.data;

    console.log("Processing contest job:", {
      name: job.name,
      id: job.id,
      contestId,
      data: job.data,
    });

    if (job.name === START_JOB) {
      await startContestFromQueue(contestId, job.data);
      return;
    }

    if (job.name === FINISH_JOB) {
      await finishContestFromQueue(contestId, job.data);
    }
  },
  {
    connection: getRedis(),
  },
);

worker.on("ready", () => {
  console.log("Contest worker is ready");
});

worker.on("completed", (job) => {
  console.log(`Contest job completed: ${job.id}`);
});

worker.on("failed", (job, error) => {
  console.error(`Contest job failed: ${job?.id}`, error);
});

worker.on("error", (error) => {
  console.error("Contest worker error:", error);
});

async function startContestFromQueue(contestId, data) {
  const contest = await Contests.findByPk(contestId);

  if (!contest) {
    console.log("Contest not found:", contestId);
    return;
  }

  if (contest.status !== "scheduled") {
    console.log("Contest is not scheduled:", contest.status);
    return;
  }

  const actualStartTime = new Date(contest.startTime).getTime();

  // Ignore an outdated job.
  if (actualStartTime !== Number(data.expectedStartTime)) {
    console.log("Ignoring outdated start job:", contestId);
    return;
  }

  // Protect against early execution.
  if (actualStartTime > Date.now()) {
    console.log("Contest start job executed early:", contestId);
    return;
  }

  // Atomic status transition prevents duplicate starts.
  const [updated] = await Contests.update(
    {
      status: "running",
      startedAt: new Date(),
      finishedAt: null,
    },
    {
      where: {
        id: contestId,
        status: "scheduled",
      },
    },
  );

  if (!updated) {
    console.log("Contest was already started:", contestId);
    return;
  }

  await contest.reload();

  await Problems.update(
    { status: "active" },
    {
      where: {
        contestId,
      },
    },
  );

  const registrations = await ContestRegistrations.findAll({
    where: {
      contestId,
      status: "registered",
    },
    attributes: ["userId"],
  });

  const userIds = registrations.map((item) => item.userId);

  await emitContestStarted(contest, userIds);

  await scheduleContestFinish(contest);

  console.log("Contest successfully started:", contestId);
}

async function finishContestFromQueue(contestId, data) {
  const contest = await Contests.findByPk(contestId);

  if (!contest || contest.status !== "running") {
    return;
  }

  const actualFinishAt =
    new Date(contest.startedAt).getTime() +
    Number(contest.duration) * 60 * 1000;

  // Ignore old finish jobs after duration changes.
  if (actualFinishAt !== Number(data.expectedFinishAt)) {
    console.log("Ignoring outdated finish job:", contestId);
    return;
  }

  if (actualFinishAt > Date.now()) {
    console.log("Finish job executed early:", contestId);
    return;
  }

  const [updated] = await Contests.update(
    {
      status: "finished",
      finishedAt: new Date(),
    },
    {
      where: {
        id: contestId,
        status: "running",
      },
    },
  );

  if (!updated) return;

  await contest.reload();

  const registrations = await ContestRegistrations.findAll({
    where: {
      contestId,
      status: "registered",
    },
    attributes: ["userId"],
  });

  const userIds = registrations.map((item) => item.userId);

  await emitContestFinished(contest, userIds);

  console.log("Contest successfully finished:", contestId);
}

module.exports = worker;
