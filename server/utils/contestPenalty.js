const { getRedis } = require("../config/redis");

const getPenaltyKey = (contestId, userId) =>
  `contest-penalty:${contestId}:${userId}`;

const setContestPenalty = async (contestId, userId, minutes) => {
  const seconds = Math.ceil(Number(minutes) * 60);

  if (!contestId || !userId || !Number.isFinite(seconds) || seconds <= 0) {
    return;
  }

  const redis = await getRedis();

  const key = getPenaltyKey(contestId, userId);

  await redis.set(key, "1", "EX", seconds);
};

const getContestPenalty = async (contestId, userId) => {
  if (!contestId || !userId) return 0;

  const redis = await getRedis();

  const key = getPenaltyKey(contestId, userId);

  const remainingSeconds = await redis.ttl(key);

  return remainingSeconds > 0 ? remainingSeconds : 0;
};

module.exports = {
  setContestPenalty,
  getContestPenalty,
};
