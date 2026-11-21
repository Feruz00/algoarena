const { Queue } = require("bullmq");
const { getRedis } = require("../config/redis");

const START_JOB = "contest-start";
const FINISH_JOB = "contest-finish";

let queue;

function contestQueue() {
  if (!queue) {
    queue = new Queue("contest", {
      connection: getRedis(),
    });
  }

  return queue;
}

// Remove old waiting/delayed jobs for a particular contest.
// Active jobs are allowed to finish; the worker validates their schedule.
const removeContestJobsByName = async (contestId, jobName) => {
  const q = contestQueue();

  const jobs = await q.getJobs(["waiting", "delayed", "paused", "prioritized"]);

  const matchingJobs = jobs.filter(
    (job) =>
      job.name === jobName && String(job.data.contestId) === String(contestId),
  );

  await Promise.all(
    matchingJobs.map(async (job) => {
      try {
        await job.remove();
      } catch (error) {
        console.error("Could not remove contest job:", job.id, error.message);
      }
    }),
  );
};

const removeContestStartJob = async (contestId) => {
  await removeContestJobsByName(contestId, START_JOB);
};

const removeContestFinishJob = async (contestId) => {
  await removeContestJobsByName(contestId, FINISH_JOB);
};

const scheduleContestStart = async (contest) => {
  await removeContestStartJob(contest.id);

  if (contest.status !== "scheduled" || !contest.startTime) {
    return;
  }

  const expectedStartTime = new Date(contest.startTime).getTime();

  if (!Number.isFinite(expectedStartTime)) {
    throw new Error(`Invalid contest startTime: ${contest.startTime}`);
  }

  const delay = Math.max(0, expectedStartTime - Date.now());

  const jobId = `contest-start-${contest.id}-${expectedStartTime}-${Date.now()}`;

  const job = await contestQueue().add(
    START_JOB,
    {
      contestId: contest.id,
      expectedStartTime,
    },
    {
      jobId,
      delay,
      removeOnComplete: true,
      removeOnFail: false,
    },
  );

  console.log("Contest start scheduled:", {
    contestId: contest.id,
    jobId: job.id,
    startTime: new Date(expectedStartTime).toISOString(),
    delay,
  });

  return job;
};

const scheduleContestFinish = async (contest) => {
  await removeContestFinishJob(contest.id);

  if (contest.status !== "running" || !contest.startedAt || !contest.duration) {
    return;
  }

  const expectedFinishAt =
    new Date(contest.startedAt).getTime() +
    Number(contest.duration) * 60 * 1000;

  const delay = Math.max(0, expectedFinishAt - Date.now());

  const jobId = `contest-finish-${contest.id}-${expectedFinishAt}-${Date.now()}`;

  const job = await contestQueue().add(
    FINISH_JOB,
    {
      contestId: contest.id,
      expectedFinishAt,
    },
    {
      jobId,
      delay,
      removeOnComplete: true,
      removeOnFail: false,
    },
  );

  console.log("Contest finish scheduled:", {
    contestId: contest.id,
    jobId: job.id,
    finishAt: new Date(expectedFinishAt).toISOString(),
    delay,
  });

  return job;
};

const removeContestJobs = async (contestId) => {
  await Promise.all([
    removeContestStartJob(contestId),
    removeContestFinishJob(contestId),
  ]);
};

module.exports = {
  contestQueue,
  START_JOB,
  FINISH_JOB,
  scheduleContestStart,
  scheduleContestFinish,
  removeContestStartJob,
  removeContestFinishJob,
  removeContestJobs,
};
