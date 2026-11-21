const express = require("express");
const {
  getTags,
  getTag,
  createTag,
  updateTag,
  deleteTag,
} = require("../controller/tags");

const router = express.Router();

const { protect, restrictTo } = require("../middleware/auth");
const { Tags } = require("../models");
const {
  deleteManyData,
  deleteData,
  restoreData,
  deleteDataPermanently,
  deleteManyDataPermanently,
} = require("../controller/handleFactory");

router.use(protect);

router.use(restrictTo("admin:access"));
router
  .route("/")
  .get(restrictTo("get:tag"), getTags)
  .post(restrictTo("create:tag"), createTag)
  .delete(restrictTo("delete:tag"), deleteManyData(Tags));

router
  .route("/:id")
  .get(restrictTo("get:tag"), getTag)
  .patch(restrictTo("update:tag"), updateTag)
  .delete(restrictTo("delete:tag"), deleteData(Tags));

router
  .route("/restore/:id")
  .delete(restrictTo("update:tag"), restoreData(Tags));

router
  .route("/permenantly/:id")
  .delete(restrictTo("delete:tag"), deleteDataPermanently(Tags));

router
  .route("/permenantly")
  .delete(restrictTo("delete:tag"), deleteManyDataPermanently(Tags));

module.exports = router;
