const multer = require("multer");
const multerStorage = multer.memoryStorage();
const router = require("express").Router();

const {
  createSubmission,
  getSubmissions,
} = require("../controller/submissions");
const { protect, restrictTo } = require("../middleware/auth");

const multerFilter = (req, file, cb) => {
  const filetypes = /text|txt|cpp|c|py|java|pas/;
  if (filetypes.test(file.mimetype)) return cb(null, true);

  return cb(new Error("Must be only programming language files"));
};

const desc = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

router.use(protect);
router
  .route("/client")
  .post(restrictTo("client:access"), desc.single("file"), createSubmission)
  .get(restrictTo("client:access"), getSubmissions);

module.exports = router;
