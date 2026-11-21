const {
  deleteDataPermanently,
  deleteManyDataPermanently,
  restoreData,
} = require("../controller/handleFactory");
const {
  getUsers,
  createUser,
  deleteUsers,
  getUser,
  updateUser,
  deleteUser,
  exportUsers,
  importUsers,
  updatePasswordsByExcel,
  changePassword,
  updateMyData,
  getUsername,
} = require("../controller/users");
const { protect, restrictTo } = require("../middleware/auth");
const excelUpload = require("../middleware/excel-upload");
const { Users } = require("../models");
const router = require("express").Router();

router.use(protect);

router
  .route("/client")
  .patch(restrictTo("client:access", "use:settings"), changePassword)
  .put(restrictTo("client:access", "use:settings"), updateMyData);
router.get("/client/:username", restrictTo("client:access"), getUsername);

router.use(restrictTo("admin:access"));

router
  .route("/")
  .get(restrictTo("get:user"), getUsers)
  .post(restrictTo("create:user"), createUser)
  .delete(restrictTo("delete:user"), deleteUsers);

router.get("/export", restrictTo("get:user"), exportUsers);
router.post(
  "/import",
  restrictTo("create:user"),
  excelUpload.single("file"),
  importUsers,
);
router.post(
  "/update-passwords",
  restrictTo("update:user"), // or whatever permission you prefer
  excelUpload.single("file"),
  updatePasswordsByExcel,
);
router
  .route("/:id")
  .get(restrictTo("get:user"), getUser)
  .patch(restrictTo("update:user"), updateUser)
  .delete(restrictTo("delete:user"), deleteUser);

router
  .route("/restore/:id")
  .delete(restrictTo("update:user"), restoreData(Users));

router
  .route("/permenantly/:id")
  .delete(restrictTo("delete:user"), deleteDataPermanently(Users));

router
  .route("/permenantly")
  .delete(restrictTo("delete:user"), deleteManyDataPermanently(Users));

module.exports = router;
