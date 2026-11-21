const dayjs = require("dayjs");

const calculateProblemScore = ({
  initialScore,
  startTime,
  submittedAt,
  penaltyMinutes,
  penaltyScore,
}) => {
  if (!penaltyMinutes || !penaltyScore || !startTime) {
    return initialScore;
  }

  const elapsedMinutes = Math.max(
    0,
    dayjs(submittedAt).diff(dayjs(startTime), "minute"),
  );

  const penaltyCount = Math.floor(elapsedMinutes / penaltyMinutes);

  const deduction = penaltyCount * penaltyScore;

  return Math.max(0, Math.min(initialScore, initialScore - deduction));
};

module.exports = calculateProblemScore;
