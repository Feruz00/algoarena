const { Op } = require("sequelize");
const { Roles, Permissions, RolesToPermissions } = require("../models");

const { catchAsync } = require("../utils/catchAsync");

exports.createRole = catchAsync(async (req, res, next) => {
  const { label, maxCount = 15, time = 7, permissions = [] } = req.body;

  if (!label || typeof label !== "string" || !label.trim()) {
    return res.status(400).json({
      success: false,
      message: "Label name is required",
    });
  }

  const existingRole = await Roles.findOne({
    where: {
      label: label.trim(),
    },
  });

  if (existingRole) {
    return res.status(409).json({
      success: false,
      message: "Role with this label already exists",
    });
  }

  const parsedMaxCount = Number(maxCount);

  if (!Number.isInteger(parsedMaxCount) || parsedMaxCount < 0) {
    return res.status(400).json({
      success: false,
      message: "maxCount must be a valid positive integer",
    });
  }

  const parsedTime = Number(time);

  if (!Number.isInteger(parsedTime) || parsedTime < 0) {
    return res.status(400).json({
      success: false,
      message: "time must be a valid positive integer",
    });
  }

  if (!Array.isArray(permissions)) {
    return res.status(400).json({
      success: false,
      message: "Permissions must be an array",
    });
  }

  const uniquePermissionIds = [
    ...new Set(
      permissions.map((id) => Number(id)).filter((id) => Number.isInteger(id)),
    ),
  ];

  if (uniquePermissionIds.length > 0) {
    const permissions = await Permissions.findAll({
      where: {
        id: {
          [Op.in]: uniquePermissionIds,
        },
      },
    });

    if (permissions.length !== uniquePermissionIds.length) {
      return res.status(400).json({
        success: false,
        message: "One or more permissions do not exist",
      });
    }
  }

  // Create role
  const role = await Roles.create({
    label: label.trim(),
    maxCount: parsedMaxCount,
    time: parsedTime,
  });

  // Assign permissions
  if (uniquePermissionIds.length > 0) {
    await role.setPermissions(uniquePermissionIds);
  }

  // Return created role with permissions
  const createdRole = await Roles.findByPk(role.id, {
    include: [
      {
        model: Permissions,
        as: "permissions",
        through: {
          attributes: [],
        },
      },
    ],
  });

  res.status(201).json({
    success: true,
    message: "Role created successfully",
    data: createdRole,
  });
});

exports.getRoles = catchAsync(async (req, res, next) => {
  let { page, limit, label, sort = "createdAt", order = "DESC" } = req.query;
  const queryOptions = {
    where: {},
    distinct: true,
    include: [
      {
        model: Permissions,
        as: "permissions",
        through: {
          model: RolesToPermissions,
          attributes: [],
        },
      },
    ],
  };

  if (page && limit) {
    page = parseInt(page, 10);
    limit = parseInt(limit, 10);

    if (page < 1 || Number.isNaN(page)) {
      page = 1;
    }

    if (limit < 1 || limit > 100 || Number.isNaN(limit)) {
      limit = 10;
    }

    const offset = (page - 1) * limit;
    queryOptions.limit = limit;
    queryOptions.offset = offset;
  }

  if (label && label.trim()) {
    queryOptions.where.label = {
      [Op.like]: `%${label.trim()}%`,
    };
  }
  if (req.user?.id !== 1) {
    queryOptions.where.id = {
      [Op.ne]: 1,
    };
  }
  const allowedSortFields = [
    "id",
    "label",
    "maxCount",
    "time",
    "createdAt",
    "updatedAt",
  ];

  const allowedOrder = ["ASC", "DESC"];

  if (!allowedSortFields.includes(sort)) {
    sort = "createdAt";
  }

  order = order.toUpperCase();

  if (!allowedOrder.includes(order)) {
    order = "DESC";
  }

  queryOptions.order = [[sort, order]];

  const { rows, count } = await Roles.findAndCountAll(queryOptions);

  res.status(200).json({
    success: true,
    data: rows,
    count,
  });
});

exports.getRole = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const role = await Roles.findByPk(id, {
    include: [
      {
        model: Permissions,
        as: "permissions",
        through: {
          attributes: [],
        },
      },
    ],
  });

  if (!role) {
    return res.status(404).json({
      success: false,
      message: "Role not found",
    });
  }

  res.status(200).json({
    success: true,
    data: role,
  });
});

exports.updateRole = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const { label, maxCount, time, permissions } = req.body;

  console.log(req.body);

  const role = await Roles.findByPk(id);

  if (!role) {
    return res.status(404).json({
      success: false,
      message: "Role not found",
    });
  }

  if (label !== undefined) {
    if (typeof label !== "string" || !label.trim()) {
      return res.status(400).json({
        success: false,
        message: "Label name is required",
      });
    }

    role.label = label.trim();
  }

  if (maxCount !== undefined) {
    const parsedMaxCount = Number(maxCount);

    if (!Number.isInteger(parsedMaxCount) || parsedMaxCount < 0) {
      return res.status(400).json({
        success: false,
        message: "maxCount must be a valid positive integer",
      });
    }

    role.maxCount = parsedMaxCount;
  }

  if (time !== undefined) {
    const parsedTime = Number(time);

    if (!Number.isInteger(parsedTime) || parsedTime < 0) {
      return res.status(400).json({
        success: false,
        message: "time must be a valid positive integer",
      });
    }

    role.time = parsedTime;
  }

  if (label !== undefined) {
    const existingRole = await Roles.findOne({
      where: {
        label: role.label,
        id: {
          [Op.ne]: id,
        },
      },
    });

    if (existingRole) {
      return res.status(409).json({
        success: false,
        message: "Role with this label already exists",
      });
    }
  }

  await role.save();

  if (permissions !== undefined) {
    if (!Array.isArray(permissions)) {
      return res.status(400).json({
        success: false,
        message: "permissions must be an array",
      });
    }

    const uniquePermissionIds = [
      ...new Set(
        permissions
          .map((id) => Number(id))
          .filter((id) => Number.isInteger(id)),
      ),
    ];

    if (uniquePermissionIds.length > 0) {
      const permissions = await Permissions.findAll({
        where: {
          id: {
            [Op.in]: uniquePermissionIds,
          },
        },
      });

      if (permissions.length !== uniquePermissionIds.length) {
        return res.status(400).json({
          success: false,
          message: "One or more permissions do not exist",
        });
      }
    }

    await role.setPermissions(uniquePermissionIds);
  }

  res.status(200).json({
    success: true,
    message: "Role updated successfully",
  });
});

exports.deleteRole = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const role = await Roles.findByPk(id);

  if (!role) {
    return res.status(404).json({
      success: false,
      message: "Role not found",
    });
  }

  await role.destroy({ user: req.user });

  res.status(200).json({
    success: true,
    message: "Role deleted successfully",
  });
});

exports.deleteRoles = catchAsync(async (req, res, next) => {
  const { ids } = req.body;

  if (!Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json({
      success: false,
      message: "ids must be a non-empty array",
    });
  }

  const roleIds = [
    ...new Set(
      ids.map((id) => Number(id)).filter((id) => Number.isInteger(id)),
    ),
  ];

  if (roleIds.length === 0) {
    return res.status(400).json({
      success: false,
      message: "No valid role IDs provided",
    });
  }

  const deletedCount = await Roles.destroy({
    where: {
      id: {
        [Op.in]: roleIds,
      },
    },
    user: req.user,
  });

  res.status(200).json({
    success: true,
    message: `${deletedCount} role(s) deleted successfully`,
    deletedCount,
  });
});

exports.deleteRolePermanently = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const role = await Roles.findByPk(id, {
    paranoid: false,
  });

  if (!role) {
    return res.status(404).json({
      success: false,
      message: "Role not found",
    });
  }

  await RolesToPermissions.destroy({
    where: {
      roleId: id,
    },
  });

  await role.destroy({
    force: true,
  });

  res.status(200).json({
    success: true,
    message: "Role permanently deleted",
  });
});

exports.deleteRolesPermanently = catchAsync(async (req, res, next) => {
  const { ids } = req.body;

  if (!Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json({
      success: false,
      message: "ids must be a non-empty array",
    });
  }

  const roleIds = [
    ...new Set(
      ids.map((id) => Number(id)).filter((id) => Number.isInteger(id)),
    ),
  ];

  if (roleIds.length === 0) {
    return res.status(400).json({
      success: false,
      message: "No valid role IDs provided",
    });
  }

  await RolesToPermissions.destroy({
    where: {
      roleId: {
        [Op.in]: roleIds,
      },
    },
  });
  const deletedCount = await Roles.destroy({
    where: {
      id: {
        [Op.in]: roleIds,
      },
    },
    force: true,
  });

  res.status(200).json({
    success: true,
    message: `${deletedCount} role(s) permanently deleted`,
    deletedCount,
  });
});
