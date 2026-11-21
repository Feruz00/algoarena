const router = require("express").Router();

const {
  deleteManyData,
  deleteData,
  restoreData,
  deleteDataPermanently,
  deleteManyDataPermanently,
} = require("../controller/handleFactory");

const {
  getProblems,
  getProblem,
  createProblem,
  updateProblem,
  getClientProblems,
  getClientProblem,
} = require("../controller/problems");

const { protect, restrictTo } = require("../middleware/auth");
const { Problems } = require("../models");

router.use(protect);

router
  .route("/client")
  .get(restrictTo("client:access", "use:problems"), getClientProblems);

router
  .route("/client/:id")
  .get(restrictTo("client:access", "use:problems"), getClientProblem);

router.use(restrictTo("admin:access"));

router
  .route("/")
  .get(restrictTo("get:problem"), getProblems)
  .post(restrictTo("create:problem"), createProblem)
  .delete(restrictTo("delete:problem"), deleteManyData(Problems));

router
  .route("/permenantly")
  .delete(restrictTo("delete:problem"), deleteManyDataPermanently(Problems));

router
  .route("/restore/:id")
  .delete(restrictTo("update:problem"), restoreData(Problems));

router
  .route("/permenantly/:id")
  .delete(restrictTo("delete:problem"), deleteDataPermanently(Problems));

router
  .route("/:id")
  .get(restrictTo("get:problem"), getProblem)
  .patch(restrictTo("update:problem"), updateProblem)
  .delete(restrictTo("delete:problem"), deleteData(Problems));

module.exports = router;
