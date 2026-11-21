const router = require("express").Router();

const getLogs = require("../controller/logs");
const { protect, restrictTo } = require("../middleware/auth");
router.use(protect, restrictTo("admin:access"));

router.route("/").get(restrictTo("log:access"), getLogs);

module.exports = router;
