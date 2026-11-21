const router = require("express").Router();

const {
  deleteManyData,
  deleteData,
  restoreData,
  deleteDataPermanently,
  deleteManyDataPermanently,
} = require("../controller/handleFactory");
const {
  getSources,
  getSource,
  getSourceParents,
  createSource,
  updateSource,
  getClientSources,
  getClientSource,
} = require("../controller/sources");
const { protect, restrictTo } = require("../middleware/auth");
const { Sources } = require("../models");

router.use(protect);

router
  .route("/client")
  .get(restrictTo("client:access", "use:sources"), getClientSources);
router
  .route("/client/:id")
  .get(restrictTo("client:access", "use:sources"), getClientSource);

router.use(restrictTo("admin:access"));
router
  .route("/")
  .get(restrictTo("get:source"), getSources)
  .post(restrictTo("create:source"), createSource)
  .delete(restrictTo("delete:source"), deleteManyData(Sources));

router.route("/:id/parents").get(restrictTo("get:source"), getSourceParents);
router
  .route("/:id")
  .get(restrictTo("get:source"), getSource)
  .patch(restrictTo("update:source"), updateSource)
  .delete(restrictTo("delete:source"), deleteData(Sources));

router
  .route("/restore/:id")
  .delete(restrictTo("update:source"), restoreData(Sources));

router
  .route("/permenantly/:id")
  .delete(restrictTo("delete:source"), deleteDataPermanently(Sources));

router
  .route("/permenantly")
  .delete(restrictTo("delete:source"), deleteManyDataPermanently(Sources));

module.exports = router;
