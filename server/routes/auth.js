const { currentUser, loginUser, logoutUser } = require("../controller/auth");
const { protect } = require("../middleware/auth");
const authRateLimiter = require("../middleware/rate-limitter");

const router = require("express").Router();

router.get("/", protect, currentUser);
router.post("/login", loginUser);
router.post("/logout", protect, logoutUser);

module.exports = router;
