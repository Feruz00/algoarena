const router = require("express").Router();
const { getRegistrationsCount, getProfilePage } = require("../controller/my");
const { protect, restrictTo } = require("../middleware/auth");

router.use(protect);

router.use(restrictTo("client:access", "use:home"));

router.route("/registration-count").get(getRegistrationsCount);
router.route("/home").get(getProfilePage);

module.exports = router;
