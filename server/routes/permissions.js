const { getPermissions } = require("../controller/permissions");
const { protect, restrictTo } = require("../middleware/auth");

const router = require("express").Router();

router.use(protect, restrictTo("get:role"));

router.route("/").get(getPermissions);

module.exports = router;
