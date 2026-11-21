const express = require("express");
const router = express.Router();
const { protect, restrictTo } = require("../middleware/auth"); // adjust path
const {
  getDashboardStats,
  getRecentContests,
  getRecentSubmissions,
} = require("../controller/dashboard");

router.use(protect);
// Optional: only admins
router.use(restrictTo("admin:access"));

router.get("/stats", getDashboardStats);
router.get("/recent-contests", getRecentContests);
router.get("/recent-submissions", getRecentSubmissions);

module.exports = router;
