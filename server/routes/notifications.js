const router = require("express").Router();

const { getAll, update } = require("../controller/notifications");
const { protect, restrictTo } = require("../middleware/auth");

router.use(protect, restrictTo("client:access"));

router.route("/").get(getAll).put(update);

module.exports = router;
