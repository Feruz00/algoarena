const router = require("express").Router();

const {
  getContests,
  startContest,
  stopContest,
  registerContest,
  registerManualUsersToContest,
  blockContestUser,
  createContest,
  getContest,
  updateContest,
  usersByContest,
  cancelContestRegistration,
  cancelManualContestRegistration,
  getClientContests,
  getClientContest,
} = require("../controller/contest");
const {
  deleteData,
  deleteManyData,
  restoreData,
  deleteDataPermanently,
  deleteManyDataPermanently,
} = require("../controller/handleFactory");
const { getClientContestProblems } = require("../controller/problems");

const { protect, restrictTo } = require("../middleware/auth");
const { Contests } = require("../models");
router.use(protect);

router
  .route("/client")
  .get(restrictTo("client:access", "use:contests"), getClientContests);

router
  .route("/client/:id")
  .get(restrictTo("client:access", "use:contests"), getClientContest);

router
  .route("/client/:id/problems")
  .get(
    restrictTo("client:access", "use:contests", "use:problems"),
    getClientContestProblems,
  );

router
  .route("/client/:id/register")
  .post(restrictTo("client:access", "use:contests"), registerContest);

router
  .route("/")
  .get(restrictTo("get:contest"), getContests)
  .post(restrictTo("create:contest"), createContest)
  .delete(restrictTo("delete:contest"), deleteManyData(Contests));

router
  .route("/:id")
  .delete(restrictTo("delete:contest"), deleteData(Contests))
  .get(restrictTo("get:contest"), getContest)
  .patch(restrictTo("update:contest"), updateContest);

router.route("/:id/start").post(restrictTo("update:contest"), startContest);

router.route("/:id/stop").post(restrictTo("update:contest"), stopContest);

router
  .route("/:id/users")
  .get(restrictTo("get:user", "get:contest"), usersByContest);

router
  .route("/:id/manual")
  .post(restrictTo("get:contest"), registerManualUsersToContest);

router
  .route("/:id/cancel-registration")
  .post(restrictTo("get:contest"), cancelContestRegistration);

router
  .route("/:id/cancel-manual-registration")
  .post(restrictTo("get:contest"), cancelManualContestRegistration);

router
  .route("/:id/cancel-user-registration")
  .post(restrictTo("update:contest"), cancelManualContestRegistration);

router
  .route("/restore/:id")
  .delete(restrictTo("update:user"), restoreData(Contests));

router
  .route("/permenantly/:id")
  .delete(restrictTo("delete:user"), deleteDataPermanently(Contests));

router
  .route("/permenantly")
  .delete(restrictTo("delete:user"), deleteManyDataPermanently(Contests));

module.exports = router;
