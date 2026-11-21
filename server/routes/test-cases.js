const router = require("express").Router();

const {
  deleteManyData,
  deleteData,
  restoreData,
  deleteDataPermanently,
  deleteManyDataPermanently,
  changeOrder,
} = require("../controller/handleFactory");

const {
  getTestCases,
  getTestCase,
  createTestCase,
  updateTestCase,
  changeTestCaseOrder,
} = require("../controller/test-cases");

const { protect, restrictTo } = require("../middleware/auth");
const { TestCases } = require("../models");

router.use(protect);
router.use(restrictTo("admin:access"));

router
  .route("/")
  .get(restrictTo("get:test-case"), getTestCases)
  .post(restrictTo("create:test-case"), createTestCase)
  .delete(restrictTo("delete:test-case"), deleteManyData(TestCases));

router
  .route("/permenantly")
  .delete(restrictTo("delete:test-case"), deleteManyDataPermanently(TestCases));

router
  .route("/restore/:id")
  .delete(restrictTo("update:test-case"), restoreData(TestCases));

router
  .route("/permenantly/:id")
  .delete(restrictTo("delete:test-case"), deleteDataPermanently(TestCases));

router
  .route("/order/:groupId")
  .patch(restrictTo("update:test-case"), changeTestCaseOrder);

router
  .route("/:id")
  .get(restrictTo("get:test-case"), getTestCase)
  .patch(restrictTo("update:test-case"), updateTestCase)
  .delete(restrictTo("delete:test-case"), deleteData(TestCases));

module.exports = router;
