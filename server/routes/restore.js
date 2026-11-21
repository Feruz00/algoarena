const router = require("express").Router();

const {
  getDeletedItems,
  restoreItem,
  forceDeleteItem,
  forceDeleteMany,
} = require("../controller/restore");
const { protect, restrictTo } = require("../middleware/auth");

router.use(protect, restrictTo("admin:access", "restore:access"));
router.route("/").get(getDeletedItems).delete(forceDeleteMany);

router.route("/:id/:key").patch(restoreItem).delete(forceDeleteItem);

module.exports = router;
