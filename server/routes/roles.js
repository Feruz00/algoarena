const express = require("express");

const {
  getRoles,
  getRole,
  updateRole,
  deleteRole,
  deleteRoles,
  deleteRolePermanently,
  deleteRolesPermanently,
  createRole,
} = require("../controller/roles");
const { Roles } = require("../models");
const { protect, restrictTo } = require("../middleware/auth");
const { restoreData } = require("../controller/handleFactory");

const router = express.Router();

router.use(protect);

router.use(restrictTo("admin:access"));
router
  .route("/")
  .get(restrictTo("get:role"), getRoles)
  .post(restrictTo("create:role"), createRole)
  .delete(restrictTo("delete:role"), deleteRoles);

router
  .route("/:id")
  .get(restrictTo("get:role"), getRole)
  .patch(restrictTo("update:role"), updateRole)
  .delete(restrictTo("delete:role"), deleteRole);

router
  .route("/restore/:id")
  .delete(restrictTo("update:role"), restoreData(Roles));

router
  .route("/permenantly/:id")
  .delete(restrictTo("delete:role"), deleteRolePermanently);

router
  .route("/permenantly")
  .delete(restrictTo("delete:role"), deleteRolesPermanently);

module.exports = router;
