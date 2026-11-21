const router = require("express").Router();

const {
  getContestResults,
  getClientContestStaticts,
  exportContestResults,
} = require("../controller/contest-result");

const { protect, restrictTo } = require("../middleware/auth");

router.use(protect);

router.get(
  "/:id/results",
  restrictTo("admin:access", "get:contest"),
  getContestResults,
);
router.get(
  "/:id/client",
  restrictTo("client:access", "use:contests"),
  getClientContestStaticts,
);

router.get(
  "/:id/export",
  restrictTo("admin:access", "get:contest"),
  exportContestResults,
);

module.exports = router;
