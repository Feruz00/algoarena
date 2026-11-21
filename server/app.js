require("dotenv").config();
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const path = require("path");
const cookieParser = require("cookie-parser");
const errorHandler = require("./utils/errorHandler");

const rateLimit = require("express-rate-limit");
const helmet = require("helmet");
const xss = require("xss");
const hpp = require("hpp");
const compression = require("compression");

const AppError = require("./utils/appError");

const app = express();

app.enable("trust proxy");

app.use(cookieParser());

const allowedOrigins =
  process.env.NODE_ENV === "production"
    ? "*"
    : ["http://localhost:5173", "http://localhost:3000"];

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  }),
);

app.use(morgan("dev"));

app.use((req, res, next) => {
  if (req.body) req.body = JSON.parse(xss(JSON.stringify(req.body)));
  if (req.params) req.params = JSON.parse(xss(JSON.stringify(req.params)));
  if (req.query) {
    const sanitizedQuery = {};
    for (const key in req.query) {
      sanitizedQuery[key] = xss(req.query[key]);
    }
    req.query = sanitizedQuery;
  }
  next();
});

app.use(express.urlencoded({ extended: false }));
app.use(express.json({ limit: "50mb" }));

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use(
  hpp({
    whitelist: ["page", "limit"],
  }),
);

app.use(compression());
// pages

app.use("/api/auth", require("./routes/auth"));
app.use("/api/permissions", require("./routes/permissions"));

app.use("/api/upload", require("./routes/files"));

app.use("/api/roles", require("./routes/roles"));
app.use("/api/users", require("./routes/users"));
app.use("/api/groups", require("./routes/groups"));

app.use("/api/contests", require("./routes/contests"));
app.use("/api/sources", require("./routes/sources"));

app.use("/api/problems", require("./routes/problems"));
app.use("/api/test-groups", require("./routes/test-groups"));
app.use("/api/test-cases", require("./routes/test-cases"));
app.use("/api/tags", require("./routes/tags"));
app.use("/api/submissions", require("./routes/submissions"));
app.use("/api/my", require("./routes/my"));
app.use("/api/contest-results", require("./routes/contest-result"));
app.use("/api/notifications", require("./routes/notifications"));
app.use("/api/dashboard", require("./routes/dashboard"));

app.use("/api/logs", require("./routes/logs"));
app.use("/api/restore", require("./routes/restore"));

app.use((req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(errorHandler);

module.exports = app;
