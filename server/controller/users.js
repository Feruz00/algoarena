const { catchAsync } = require("../utils/catchAsync");
const {
  Groups,
  Users,
  Roles,
  sequelize,
  GroupsToUser,
  Sources,
  Contests,
  Problems,
  Permissions,
  Submissions,
} = require("../models");
const { Op, fn, col, literal } = require("sequelize");
const AppError = require("../utils/appError");
const { toHash, compare } = require("../utils/password");
const XLSX = require("xlsx");
const { getRedis } = require("../config/redis");

const normalizeIds = (ids) => {
  if (ids === undefined || ids === null) return [];

  if (!Array.isArray(ids)) {
    throw new AppError("Groups must be an array", 400);
  }

  return [...new Set(ids.map(Number))];
};

const getValidatedGroups = async (groupIds, transaction) => {
  if (!groupIds.length) return [];

  const groups = await Groups.findAll({
    where: {
      id: { [Op.in]: groupIds },
    },
    transaction,
  });

  if (groups.length !== groupIds.length) {
    throw new AppError("One or more groups were not found", 400);
  }

  return groups;
};

const getUsers = catchAsync(async (req, res, next) => {
  const {
    page = 1,
    limit = 10,
    sort = "id",
    order = "desc",
    fullName,
    username,
    roleId,
    status,
  } = req.query;

  const allowedSortFields = [
    "id",
    "username",
    "fullName",
    "email",
    "createdAt",
    "lastLogin",
    "status",
  ];

  const sortField = allowedSortFields.includes(sort) ? sort : "id";
  const sortOrder = order.toLowerCase() === "asc" ? "ASC" : "DESC";

  const pageNumber = Math.max(1, parseInt(page, 10) || 1);
  const pageLimit = Math.min(100, Math.max(1, parseInt(limit, 10) || 10));

  const options = {
    where: {},
    order: [[sortField, sortOrder]],
    offset: (pageNumber - 1) * pageLimit,
    limit: pageLimit,
    distinct: true,
  };

  if (username) {
    options.where.username = {
      [Op.like]: `%${username}%`,
    };
  }

  if (fullName) {
    options.where.fullName = {
      [Op.like]: `%${fullName}%`,
    };
  }

  if (status) {
    options.where.status = status;
  }

  if (roleId) {
    const roleIds = roleId
      .split(",")
      .map(Number)
      .filter((id) => Number.isInteger(id) && id > 0);

    if (roleIds.length) {
      options.where.roleId = {
        [Op.in]: roleIds,
      };
    }
  }

  const { count, rows } = await Users.findAndCountAll(options);

  const data = await Users.findAll({
    where: {
      id: {
        [Op.in]: rows.map((user) => user.id),
      },
    },
    order: options.order,
    attributes: {
      exclude: ["password"],
    },
    include: [
      {
        model: Roles,
        as: "role",
        attributes: ["id", "label"],
      },
    ],
  });

  return res.status(200).json({
    count,
    data,
  });
});

const getUser = catchAsync(async (req, res, next) => {
  const options = {
    where: {
      id: req.params.id,
    },
    attributes: {
      exclude: ["password"],
    },
    include: [
      {
        model: Roles,
        as: "role",
        attributes: ["id", "label"],
      },
      {
        model: Groups,
        as: "groups",
        through: {
          model: GroupsToUser,
          attributes: [],
        },
      },
    ],
  };

  const data = await Users.findOne(options);
  if (!data) {
    return next(new AppError("Data not found", 404)); // Fixed error message
  }
  return res.status(200).json({ data });
});

const createUser = catchAsync(async (req, res, next) => {
  const transaction = await sequelize.transaction();

  try {
    const { groups, password, ...userData } = req.body;

    if (!password) {
      throw new AppError("Password is required", 400);
    }

    const groupIds = normalizeIds(groups);
    const groupsData = await getValidatedGroups(groupIds, transaction);

    const hashPassword = await toHash(password);

    const user = await Users.create(
      {
        ...userData,
        password: hashPassword,
      },
      { transaction },
    );

    await user.setGroups(groupsData, { transaction });

    await transaction.commit();

    return res.status(201).json({
      data: user,
    });
  } catch (error) {
    if (!transaction.finished) {
      await transaction.rollback();
    }

    return next(error);
  }
});

const updateUser = catchAsync(async (req, res, next) => {
  const transaction = await sequelize.transaction();

  try {
    const { groups, password, ...others } = req.body;

    const user = await Users.findByPk(req.params.id, {
      transaction,
    });

    if (!user) {
      throw new AppError("User not found", 404);
    }

    const updateData = { ...others };

    if (password) {
      updateData.password = await toHash(password);
    }

    // Only update groups if the client actually sends them.
    if (groups !== undefined) {
      const groupIds = normalizeIds(groups);
      const groupsData = await getValidatedGroups(groupIds, transaction);

      await user.setGroups(groupsData, { transaction });
    }

    await user.update(updateData, { transaction });

    await transaction.commit();

    const updatedUser = await Users.findByPk(user.id, {
      attributes: { exclude: ["password"] },
      include: [
        {
          model: Roles,
          as: "role",
          attributes: ["id", "label"],
        },
        {
          model: Groups,
          as: "groups",
          through: { attributes: [] },
        },
      ],
    });

    return res.status(200).json({
      data: updatedUser,
    });
  } catch (error) {
    if (!transaction.finished) {
      await transaction.rollback();
    }

    return next(error);
  }
});

const deleteUser = catchAsync(async (req, res, next) => {
  const user = await Users.findByPk(req.params.id);

  if (!user) {
    return next(new AppError("User not found", 404));
  }

  if (Number(user.id) === Number(req.user.id)) {
    return next(new AppError("You cannot delete yourself", 400));
  }

  await user.destroy({
    user: req.user,
  });

  return res.status(204).json({});
});

const deleteUsers = catchAsync(async (req, res, next) => {
  const ids = req.body.ids;

  if (!Array.isArray(ids) || !ids.length) {
    return next(new AppError("Please provide user IDs", 400));
  }

  const normalizedIds = [...new Set(ids.map(Number))].filter(
    (id) => Number.isInteger(id) && id > 0 && id !== Number(req.user.id),
  );

  if (!normalizedIds.length) {
    return next(new AppError("No valid users to delete", 400));
  }

  const transaction = await sequelize.transaction();

  try {
    const users = await Users.findAll({
      where: {
        id: { [Op.in]: normalizedIds },
      },
      transaction,
    });

    for (const user of users) {
      await user.destroy({
        user: req.user,
        transaction,
      });
    }

    await transaction.commit();

    return res.status(204).json({});
  } catch (error) {
    if (!transaction.finished) {
      await transaction.rollback();
    }

    return next(error);
  }
});
const exportUsers = catchAsync(async (req, res, next) => {
  const users = await Users.findAll({
    attributes: [
      "username",
      "email",
      "github",
      "fullName",
      "organization",
      "website",
      "bio",
      "status",
      "lastLogin",
      "createdAt",
    ],
    include: [
      {
        model: Roles,
        as: "role",
        attributes: ["label"],
      },
      {
        model: Groups,
        as: "groups",
        attributes: ["title"],
        through: { attributes: [] },
      },
    ],
    order: [["id", "DESC"]],
  });

  const rows = users.map((user) => ({
    username: user.username,
    email: user.email,
    github: user.github,
    fullName: user.fullName,
    roleName: user.role?.label || "",
    groupName: user.groups?.map((group) => group.title).join(", ") || "",
    organization: user.organization || "",
    website: user.website || "",
    bio: user.bio || "",
    status: user.status,
    lastLogin: user.lastLogin || "",
    createdAt: user.createdAt || "",
  }));

  const worksheet = XLSX.utils.json_to_sheet(rows);

  worksheet["!cols"] = [
    { wch: 20 }, // username
    { wch: 30 }, // email
    { wch: 25 }, // github
    { wch: 25 }, // fullName
    { wch: 20 }, // roleName
    { wch: 35 }, // groupName
    { wch: 25 }, // organization
    { wch: 30 }, // website
    { wch: 40 }, // bio
    { wch: 12 }, // status
    { wch: 22 }, // lastLogin
    { wch: 22 }, // createdAt
  ];

  const workbook = XLSX.utils.book_new();

  XLSX.utils.book_append_sheet(workbook, worksheet, "Users");

  const buffer = XLSX.write(workbook, {
    type: "buffer",
    bookType: "xlsx",
  });

  res.setHeader("Content-Disposition", 'attachment; filename="users.xlsx"');

  res.setHeader(
    "Content-Type",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  );

  return res.send(buffer);
});
const getExcelValue = (row, field) => {
  const key = Object.keys(row).find(
    (key) => key.toLowerCase().trim() === field.toLowerCase(),
  );

  return key ? String(row[key] ?? "").trim() : "";
};

const normalizeText = (value) => value.toLowerCase().trim();

const importUsers = catchAsync(async (req, res, next) => {
  if (!req.file) {
    return next(new AppError("Excel file is required", 400));
  }

  const workbook = XLSX.read(req.file.buffer, { type: "buffer" });

  if (!workbook.SheetNames.length) {
    return next(new AppError("Excel file is empty", 400));
  }

  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json(sheet, {
    defval: "",
    raw: false,
  });

  if (!rows.length) {
    return next(new AppError("Excel file is empty", 400));
  }

  // Load roles and groups.
  const [allRoles, allGroups] = await Promise.all([
    Roles.findAll({
      attributes: ["id", "label"],
    }),
    Groups.findAll({
      attributes: ["id", "title"],
    }),
  ]);

  const roleMap = new Map(
    allRoles.map((role) => [normalizeText(role.label), role.id]),
  );

  const groupMap = new Map(
    allGroups.map((group) => [normalizeText(group.title), group.id]),
  );

  const errors = [];
  const usersToCreate = [];

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const rowNum = i + 2;

    const username = getExcelValue(row, "username");
    const email = getExcelValue(row, "email").toLowerCase();
    const github = getExcelValue(row, "github");
    const password = getExcelValue(row, "password");
    const fullName = getExcelValue(row, "fullName");
    const roleName =
      getExcelValue(row, "roleName") || getExcelValue(row, "role");
    const groupNameRaw =
      getExcelValue(row, "groupName") || getExcelValue(row, "groups");

    const organization = getExcelValue(row, "organization");
    const website = getExcelValue(row, "website");
    const bio = getExcelValue(row, "bio");

    let hasError = false;

    // Username validation
    if (!username) {
      errors.push(`Row ${rowNum}: Username is required`);
      hasError = true;
    } else if (username.length < 3 || username.length > 50) {
      errors.push(`Row ${rowNum}: Username must be 3-50 characters`);
      hasError = true;
    } else if (!/^[a-zA-Z0-9_.-]+$/.test(username)) {
      errors.push(
        `Row ${rowNum}: Username can only contain letters, numbers, _, - and .`,
      );
      hasError = true;
    }

    // Email validation
    if (!email) {
      errors.push(`Row ${rowNum}: Email is required`);
      hasError = true;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.push(`Row ${rowNum}: Invalid email`);
      hasError = true;
    }

    // GitHub validation
    if (!github) {
      errors.push(`Row ${rowNum}: GitHub username is required`);
      hasError = true;
    } else if (github.length > 255) {
      errors.push(`Row ${rowNum}: GitHub username is too long`);
      hasError = true;
    }

    // Password validation
    if (!password) {
      errors.push(`Row ${rowNum}: Password is required`);
      hasError = true;
    } else if (password.length < 8) {
      errors.push(`Row ${rowNum}: Password must contain at least 8 characters`);
      hasError = true;
    }

    // Full name validation
    if (!fullName) {
      errors.push(`Row ${rowNum}: Full name is required`);
      hasError = true;
    } else if (fullName.length < 2 || fullName.length > 100) {
      errors.push(`Row ${rowNum}: Full name must be 2-100 characters`);
      hasError = true;
    }

    // Role validation
    if (!roleName) {
      errors.push(`Row ${rowNum}: Role name is required`);
      hasError = true;
    }

    const roleId = roleMap.get(normalizeText(roleName));

    if (roleName && !roleId) {
      errors.push(`Row ${rowNum}: Role "${roleName}" not found`);
      hasError = true;
    }

    // Group validation
    const groupIds = [];

    if (groupNameRaw) {
      const groupNames = groupNameRaw
        .split(",")
        .map((name) => name.trim())
        .filter(Boolean);

      for (const name of groupNames) {
        const groupId = groupMap.get(normalizeText(name));

        if (!groupId) {
          errors.push(`Row ${rowNum}: Group "${name}" not found`);
          hasError = true;
        } else if (!groupIds.includes(groupId)) {
          groupIds.push(groupId);
        }
      }
    }

    if (hasError) continue;

    usersToCreate.push({
      username,
      email,
      github,
      password,
      fullName,
      roleId,
      groupIds,
      organization: organization || null,
      website: website || null,
      bio: bio || null,
      status: "active",
    });
  }

  if (errors.length) {
    return next(new AppError(errors.join("; "), 400));
  }

  if (!usersToCreate.length) {
    return next(new AppError("No valid users found in Excel file", 400));
  }

  // Check duplicates inside Excel.
  const checkDuplicates = (items, field) => {
    const values = items.map((item) => normalizeText(item[field]));

    return new Set(values).size !== values.length;
  };

  if (checkDuplicates(usersToCreate, "username")) {
    return next(new AppError("Duplicate usernames found in Excel file", 400));
  }

  if (checkDuplicates(usersToCreate, "email")) {
    return next(new AppError("Duplicate emails found in Excel file", 400));
  }

  if (checkDuplicates(usersToCreate, "github")) {
    return next(
      new AppError("Duplicate GitHub usernames found in Excel file", 400),
    );
  }

  // Check existing users in database.
  const existingUsers = await Users.findAll({
    where: {
      [Op.or]: [
        {
          username: {
            [Op.in]: usersToCreate.map((user) => user.username),
          },
        },
        {
          email: {
            [Op.in]: usersToCreate.map((user) => user.email),
          },
        },
        {
          github: {
            [Op.in]: usersToCreate.map((user) => user.github),
          },
        },
      ],
    },
    attributes: ["username", "email", "github"],
  });

  if (existingUsers.length) {
    const duplicateDetails = existingUsers.map(
      (user) => `${user.username} (${user.email}, GitHub: ${user.github})`,
    );

    return next(
      new AppError(
        `These users already exist: ${duplicateDetails.join("; ")}`,
        400,
      ),
    );
  }

  // Create users and their group relations transactionally.
  const transaction = await sequelize.transaction();

  try {
    const createdUsers = [];

    for (const item of usersToCreate) {
      const { groupIds, password, ...userData } = item;

      const hashedPassword = await toHash(password);

      const user = await Users.create(
        {
          ...userData,
          password: hashedPassword,
        },
        { transaction },
      );

      if (groupIds.length) {
        const groupsData = await Groups.findAll({
          where: {
            id: {
              [Op.in]: groupIds,
            },
          },
          transaction,
        });

        await user.setGroups(groupsData, { transaction });
      }

      createdUsers.push(user.id);
    }

    await transaction.commit();

    return res.status(201).json({
      message: `${createdUsers.length} users imported successfully`,
      count: createdUsers.length,
    });
  } catch (error) {
    if (!transaction.finished) {
      await transaction.rollback();
    }

    return next(error);
  }
});

const updatePasswordsByExcel = catchAsync(async (req, res, next) => {
  if (!req.file) {
    return next(new AppError("Excel file is required", 400));
  }

  const workbook = XLSX.read(req.file.buffer, { type: "buffer" });

  if (!workbook.SheetNames.length) {
    return next(new AppError("Excel file is empty", 400));
  }

  const sheet = workbook.Sheets[workbook.SheetNames[0]];

  const rows = XLSX.utils.sheet_to_json(sheet, {
    defval: "",
    raw: false,
  });

  if (!rows.length) {
    return next(new AppError("Excel file is empty", 400));
  }

  const errors = [];
  const updates = [];

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const rowNum = i + 2;

    const username = getExcelValue(row, "username");
    const password = getExcelValue(row, "password");

    let hasError = false;

    if (!username) {
      errors.push(`Row ${rowNum}: Username is required`);
      hasError = true;
    }

    if (!password) {
      errors.push(`Row ${rowNum}: Password is required`);
      hasError = true;
    } else if (password.length < 8) {
      errors.push(`Row ${rowNum}: Password must contain at least 8 characters`);
      hasError = true;
    }

    if (!hasError) {
      updates.push({
        username,
        password,
      });
    }
  }

  if (errors.length) {
    return next(new AppError(errors.join("; "), 400));
  }

  if (!updates.length) {
    return next(new AppError("No valid password updates found", 400));
  }

  // Check duplicate usernames.
  const usernames = updates.map((item) => normalizeText(item.username));

  if (new Set(usernames).size !== usernames.length) {
    return next(new AppError("Duplicate usernames found in Excel file", 400));
  }

  const transaction = await sequelize.transaction();

  try {
    // Find all users with one query.
    const users = await Users.findAll({
      where: {
        username: {
          [Op.in]: updates.map((item) => item.username),
        },
      },
      transaction,
    });

    const userMap = new Map(
      users.map((user) => [normalizeText(user.username), user]),
    );

    const updated = [];
    const notFound = [];

    for (const item of updates) {
      const user = userMap.get(normalizeText(item.username));

      if (!user) {
        notFound.push(item.username);
        continue;
      }

      const hashedPassword = await toHash(item.password);

      await user.update(
        {
          password: hashedPassword,
        },
        { transaction },
      );

      updated.push(user.username);
    }

    await transaction.commit();

    return res.status(200).json({
      message: `${updated.length} password(s) updated successfully`,
      updated: updated.length,
      updatedUsers: updated,
      notFound,
    });
  } catch (error) {
    if (!transaction.finished) {
      await transaction.rollback();
    }

    return next(error);
  }
});
const changePassword = catchAsync(async (req, res, next) => {
  const { newPassword, oldPassword, confirmPassword } = req.body;
  const user = await Users.findByPk(req.user.id);
  if (!user) {
    return next(new AppError("User not found", 404));
  }
  const isMatch = await compare(user.password, oldPassword);

  if (!isMatch) {
    return next(new AppError("Old password is incorrect", 400));
  }
  if (newPassword !== confirmPassword) {
    return next(
      new AppError("New password and confirm password do not match", 400),
    );
  }
  const hashPassword = await toHash(newPassword);
  await user.update({ password: hashPassword });
  return res.status(200).json({ message: "Password updated successfully" });
});
const updateMyData = catchAsync(async (req, res, next) => {
  const allowedFields = [
    "email",
    "fullName",
    "website",
    "bio",
    "github",
    "organization",
  ];

  const data = {};

  for (const field of allowedFields) {
    if (Object.hasOwn(req.body, field)) {
      data[field] = req.body[field];
    }
  }

  const user = await Users.findByPk(req.user.id);

  if (!user) {
    return next(new AppError("User not found", 404));
  }

  await user.update(data);

  const result = await Users.findByPk(req.user.id, {
    attributes: { exclude: ["password"] },
    include: [
      {
        model: Roles,
        as: "role",
        attributes: ["label", "maxCount", "time"],
        include: [
          {
            model: Permissions,
            as: "permissions",
            attributes: ["name"],
            through: { attributes: [] },
          },
        ],
      },
    ],
  });

  const redis = getRedis();

  await redis.del(`user-${req.user.id}`);

  return res.status(200).json({
    data: result,
  });
});

const getCurrentStreak = (dates) => {
  if (!dates.length) return 0;

  const dateSet = new Set(dates.map((d) => String(d).slice(0, 10)));

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const formatDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  };

  // A streak can continue from yesterday if the user hasn't submitted today.
  if (!dateSet.has(formatDate(today))) {
    today.setDate(today.getDate() - 1);

    if (!dateSet.has(formatDate(today))) {
      return 0;
    }
  }

  let streak = 0;

  while (dateSet.has(formatDate(today))) {
    streak++;
    today.setDate(today.getDate() - 1);
  }

  return streak;
};

const getUsername = catchAsync(async (req, res, next) => {
  const { username } = req.params;

  const user = await Users.findOne({
    where: { username },
    attributes: [
      "id",
      "username",
      "fullName",
      "createdAt",
      "organization",
      "website",
      "github",
      "bio",
    ],
  });

  if (!user) {
    return next(new AppError("User not found", 404));
  }

  const userId = user.id;

  const submissionWhere = {
    userId,
    deletedAt: null,
  };

  const finishedWhere = {
    ...submissionWhere,
    status: "finished",
  };

  const [
    totalSubmissions,
    acceptedSubmissions,
    solvedProblems,
    contestsParticipated,
    recentSubmissions,
    activity,
  ] = await Promise.all([
    // Total submissions
    Submissions.count({
      where: submissionWhere,
    }),

    // Accepted submissions
    Submissions.count({
      where: {
        ...finishedWhere,
        verdict: "AC",
      },
    }),

    // Unique solved problems
    Submissions.count({
      where: {
        ...finishedWhere,
        verdict: "AC",
      },
      distinct: true,
      col: "problemId",
    }),

    // Unique contests participated in
    Submissions.count({
      where: {
        ...submissionWhere,
        contestId: {
          [Op.ne]: null,
        },
      },
      distinct: true,
      col: "contestId",
    }),

    // Latest submissions
    Submissions.findAll({
      where: submissionWhere,
      attributes: [
        "id",
        "problemId",
        "contestId",
        "sourceId",
        "verdict",
        "status",
        "lang",
        "score",
        "timeMs",
        "memoryKb",
        "createdAt",
      ],
      include: [
        {
          model: Problems,
          as: "problem",
          // attributes: ["id", "titleEn"],
        },
        {
          model: Sources,
          as: "source",
          // attributes: ["id", "name"],
        },
      ],
      order: [["createdAt", "DESC"]],
      limit: 10,
    }),

    // Group submissions by date for the activity calendar
    Submissions.findAll({
      where: {
        ...finishedWhere,
      },
      attributes: [
        [fn("DATE", col("createdAt")), "date"],
        [fn("COUNT", col("id")), "count"],
      ],
      group: [fn("DATE", col("createdAt"))],
      order: [[literal("date"), "DESC"]],
      raw: true,
    }),
  ]);

  const activityDates = activity.map((item) => String(item.date).slice(0, 10));

  const activityMap = Object.fromEntries(
    activity.map((item) => [
      String(item.date).slice(0, 10),
      Number(item.count),
    ]),
  );

  // Last 84 days of activity
  const activityCalendar = Array.from({ length: 84 }, (_, index) => {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() - (83 - index));

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    const dateString = `${year}-${month}-${day}`;

    return {
      date: dateString,
      count: activityMap[dateString] || 0,
    };
  });

  const streak = getCurrentStreak(activityDates);

  res.status(200).json({
    status: "success",
    data: {
      user,
      stats: {
        totalSubmissions,
        acceptedSubmissions,
        solvedProblems,
        contestsParticipated,
        streak,
      },
      activity: activityCalendar,
      recentSubmissions,
    },
  });
});

module.exports = {
  getUsername,
  getUsers,
  getUser,
  updateUser,
  createUser,
  deleteUser,
  deleteUsers,
  exportUsers,
  importUsers,
  changePassword,
  updatePasswordsByExcel,
  updateMyData,
};
