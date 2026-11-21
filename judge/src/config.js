try {
  require("dotenv").config();
} catch {
  /* dotenv optional: plain environment variables also work */
}
const path = require("path");
const abs = (p) => path.resolve(process.cwd(), p);

module.exports = {
  rabbitUrl: process.env.RABBIT_URL || "amqp://guest:guest@localhost:5672",
  submissionQueue: process.env.SUBMISSION_QUEUE || "judge.submissions",
  kafkaBrokers: (process.env.KAFKA_BROKER || "localhost:9092").split(","),
  eventsTopic: process.env.EVENTS_TOPIC || "judge.events",

  sandbox: process.env.SANDBOX || "docker",
  sandboxImage: process.env.SANDBOX_IMAGE || "judge-sandbox:latest",

  workDir: abs(process.env.WORK_DIR || "./tmp"),

  concurrency: parseInt(process.env.CONCURRENCY || "1", 10),
  boxIdBase: parseInt(process.env.BOX_ID_BASE || "0", 10),
  timeBin: process.env.TIME_BIN || "/usr/bin/time", // GNU time (apt install time)
  maxOutputMb: parseInt(process.env.MAX_OUTPUT_MB || "64", 10),
  compileTimeMs: parseInt(process.env.COMPILE_TIME_MS || "60000", 10),
};
