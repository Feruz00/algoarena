const router = require("express").Router();

const {
  deleteManyData,
  deleteData,
  restoreData,
  deleteDataPermanently,
  deleteManyDataPermanently,
} = require("../controller/handleFactory");

const {
  getTestGroups,
  getTestGroup,
  createTestGroup,
  updateTestGroup,
  changeTestGroupOrder,
} = require("../controller/test-groups");

const { protect, restrictTo } = require("../middleware/auth");
const { TestGroups } = require("../models");

router.use(protect);
router.use(restrictTo("admin:access"));

router
  .route("/")
  .get(restrictTo("get:test-group"), getTestGroups)
  .post(restrictTo("create:test-group"), createTestGroup)
  .delete(restrictTo("delete:test-group"), deleteManyData(TestGroups));

router
  .route("/permenantly")
  .delete(
    restrictTo("delete:test-group"),
    deleteManyDataPermanently(TestGroups),
  );

router
  .route("/order/:problemId")
  .patch(restrictTo("update:test-group"), changeTestGroupOrder);

router
  .route("/restore/:id")
  .delete(restrictTo("update:test-group"), restoreData(TestGroups));

router
  .route("/permenantly/:id")
  .delete(restrictTo("delete:test-group"), deleteDataPermanently(TestGroups));

router
  .route("/:id")
  .get(restrictTo("get:test-group"), getTestGroup)
  .patch(restrictTo("update:test-group"), updateTestGroup)
  .delete(restrictTo("delete:test-group"), deleteData(TestGroups));

module.exports = router;
