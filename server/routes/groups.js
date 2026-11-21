const router = require("express").Router();
const {
  getGroups,
  createGroup,
  getGroup,
  updateGroup,
  exportGroups,
  importGroups,
} = require("../controller/group");
const {
  deleteManyData,
  deleteData,
  restoreData,
  deleteDataPermanently,
  deleteManyDataPermanently,
} = require("../controller/handleFactory");
const { protect, restrictTo } = require("../middleware/auth");
const excelUpload = require("../middleware/excel-upload");
const { Groups } = require("../models");

router.use(protect);

router.use(restrictTo("admin:access"));

router
  .route("/")
  .get(restrictTo("get:group"), getGroups)
  .post(restrictTo("create:group"), createGroup)
  .delete(restrictTo("delete:group"), deleteManyData(Groups));

router.get("/export", restrictTo("get:group"), exportGroups);
router.post(
  "/import",
  restrictTo("create:group"),
  excelUpload.single("file"),
  importGroups,
);

router
  .route("/:id")
  .get(restrictTo("get:group"), getGroup)
  .patch(restrictTo("update:group"), updateGroup)
  .delete(restrictTo("delete:group"), deleteData(Groups));

router
  .route("/restore/:id")
  .delete(restrictTo("update:group"), restoreData(Groups));

router
  .route("/permenantly/:id")
  .delete(restrictTo("delete:group"), deleteDataPermanently(Groups));

router
  .route("/permenantly")
  .delete(restrictTo("delete:group"), deleteManyDataPermanently(Groups));

module.exports = router;
