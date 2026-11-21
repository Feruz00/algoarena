const { Contests } = require("../models");
const { getRedis } = require("../config/redis");

const getContestCache = async (contestId) => {
  const redis = getRedis();
  const cacheKey = `data-contest-${contestId}`;

  const cached = await redis.get(cacheKey);

  if (cached) {
    return JSON.parse(cached);
  }

  const contest = await Contests.findByPk(contestId);

  if (!contest) return null;

  const data = contest.toJSON();

  await redis.set(
    cacheKey,
    JSON.stringify(data),
    "EX",
    Math.max(60, 3600 * (data.duration || 1)),
  );

  return data;
};

const invalidateContestCache = async (contestId) => {
  const redis = getRedis();
  await redis.del(`data-contest-${contestId}`);
};

module.exports = {
  getContestCache,
  invalidateContestCache,
};
