const fs = require("fs");
const path = require("path");
const amqp = require("amqplib");
const { Kafka, logLevel } = require("kafkajs");

// Usage:
// node stress-judge.js ./solutions.cpp 100

const FILE = path.resolve(process.argv[2] || "./solution.cpp");
const CONCURRENCY = Number(process.argv[3] || 10);

const RABBIT_URL =
  process.env.RABBIT_URL || "amqp://guest:guest@localhost:5672";

const KAFKA_BROKER = process.env.KAFKA_BROKER || "localhost:9092";

const QUEUE = "judge.submissions";
const TOPIC = "judge.events";

const LANG = process.env.JUDGE_LANG || "cpp";
const TIME_MS = Number(process.env.JUDGE_TIME_MS || 2000);
const MEMORY_MB = Number(process.env.JUDGE_MEMORY_MB || 256);

const USER_ID = Number(process.env.JUDGE_USER_ID || 1);
const PROBLEM_ID = Number(process.env.JUDGE_PROBLEM_ID || 1);

const TYPE = "exact";

const INPUT = "5 10\n";
const EXPECTED = "15\n";

const TIMEOUT_MS = Number(process.env.STRESS_TIMEOUT_MS || 300000);

const code = fs.readFileSync(FILE, "utf8");

if (!Number.isInteger(CONCURRENCY) || CONCURRENCY < 1 || CONCURRENCY > 999) {
  throw new Error("Concurrency must be between 1 and 999");
}

if (!code.trim()) {
  throw new Error("C++ source file is empty");
}

const runId = Date.now();
const submissions = new Map();

for (let i = 0; i < CONCURRENCY; i++) {
  const id = runId * 1000 + i;

  submissions.set(String(id), {
    id,
    index: i + 1,
    status: "WAITING",
    compileStarted: null,
    compileMs: null,
    started: null,
    finished: null,
    verdict: null,
    timeMs: 0,
    memoryKb: 0,
    log: "",
  });
}

const kafka = new Kafka({
  clientId: `judge-stress-${runId}`,
  brokers: [KAFKA_BROKER],
  logLevel: logLevel.ERROR,
});

const consumer = kafka.consumer({
  groupId: `judge-stress-${runId}`,
});

function createJob(id) {
  return {
    id,
    submissionId: id,
    userId: USER_ID,
    problemId: PROBLEM_ID,
    username: "stress-test",

    type: TYPE,
    time: TIME_MS,
    memory: MEMORY_MB,

    lang: LANG,
    code,

    testgroups: [
      {
        id: 1,
        order: 1,
        score: 100,
        testcases: Array.from({ length: 100 }, (_, index) => ({
          order: index + 1,
          input: INPUT,
          expectedOutput: EXPECTED,
        })),
      },
    ],
  };
}

function printProgress() {
  const values = [...submissions.values()];

  const finished = values.filter((s) => s.status === "FINISHED").length;

  const compiling = values.filter((s) => s.status === "COMPILING").length;

  const running = values.filter((s) => s.status === "RUNNING").length;

  process.stdout.write(
    `\rFinished: ${finished}/${CONCURRENCY} | ` +
      `Compiling: ${compiling} | Running: ${running}   `,
  );
}

function handleEvent(ev) {
  const submission = submissions.get(String(ev.submissionId));

  if (!submission) return;

  const now = Date.now();

  if (ev.status === "COMPILING") {
    submission.status = "COMPILING";
    submission.compileStarted = now;
  }

  if (ev.status === "RUNNING") {
    if (!submission.started) {
      submission.started = now;

      if (submission.compileStarted) {
        submission.compileMs = submission.started - submission.compileStarted;
      }
    }

    submission.status = "RUNNING";
  }

  if (ev.status === "FINISHED") {
    submission.status = "FINISHED";
    submission.finished = now;
    submission.verdict = ev.verdict || "UNKNOWN";
    submission.timeMs = ev.timeMs || 0;
    submission.memoryKb = ev.memoryKb || 0;
    submission.log = ev.log || "";

    if (submission.compileStarted && !submission.compileMs) {
      submission.compileMs = now - submission.compileStarted;
    }
  }

  printProgress();

  if ([...submissions.values()].every((s) => s.status === "FINISHED")) {
    finishResolve();
  }
}

let finishResolve;

const allFinished = new Promise((resolve) => {
  finishResolve = resolve;
});

async function waitForKafkaGroup() {
  let resolveJoin;

  const joined = new Promise((resolve) => {
    resolveJoin = resolve;
  });

  consumer.on(consumer.events.GROUP_JOIN, () => {
    resolveJoin();
  });

  await consumer.run({
    eachMessage: async ({ message }) => {
      if (!message.value) return;

      try {
        const ev = JSON.parse(message.value.toString());
        handleEvent(ev);
      } catch (err) {
        console.error("\nKafka event error:", err.message);
      }
    },
  });

  await Promise.race([
    joined,
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error("Kafka group join timeout")), 15000),
    ),
  ]);
}

async function main() {
  let connection;
  let channel;

  const startedAt = Date.now();

  try {
    console.log("\n========== JUDGE STRESS TEST ==========");
    console.log("File:", FILE);
    console.log("Language:", LANG);
    console.log("Concurrent submissions:", CONCURRENCY);
    console.log("Time limit:", TIME_MS, "ms");
    console.log("Memory limit:", MEMORY_MB, "MB");
    console.log("RabbitMQ:", RABBIT_URL);
    console.log("Kafka:", KAFKA_BROKER);
    console.log("=======================================\n");

    // Start Kafka listener BEFORE publishing submissions.
    await consumer.connect();
    await consumer.subscribe({
      topic: TOPIC,
      fromBeginning: false,
    });

    await waitForKafkaGroup();

    console.log("[Kafka] Listening for judge results");

    connection = await amqp.connect(RABBIT_URL);
    channel = await connection.createConfirmChannel();

    await channel.assertQueue(QUEUE, {
      durable: true,
    });

    console.log("[RabbitMQ] Connected");

    const publishStarted = Date.now();

    // Publish all jobs without waiting for individual completions.
    for (const submission of submissions.values()) {
      const job = createJob(submission.id);

      channel.sendToQueue(QUEUE, Buffer.from(JSON.stringify(job)), {
        persistent: true,
      });
    }

    await channel.waitForConfirms();

    const publishFinished = Date.now();

    console.log(
      `\n[Published] ${CONCURRENCY} submissions in ` +
        `${publishFinished - publishStarted}ms`,
    );

    console.log("\nWaiting for results...\n");

    let timedOut = false;

    await Promise.race([
      allFinished,
      new Promise((resolve) =>
        setTimeout(() => {
          timedOut = true;
          resolve();
        }, TIMEOUT_MS),
      ),
    ]);

    const totalTime = Date.now() - startedAt;
    const results = [...submissions.values()];

    console.log("\n\n========== RESULTS ==========\n");

    console.table(
      results.map((s) => ({
        ID: s.id,
        Status: s.status,
        Verdict: s.verdict || "-",
        CompileMs: s.compileMs ?? "-",
        ExecutionMs: s.timeMs,
        MemoryMB: (s.memoryKb / 1024).toFixed(2),
        WallMs:
          s.finished && s.compileStarted ? s.finished - s.compileStarted : "-",
      })),
    );

    const finished = results.filter((s) => s.status === "FINISHED");

    const compiled = results.filter(
      (s) =>
        s.started !== null || (s.status === "FINISHED" && s.verdict !== "CE"),
    );

    const accepted = results.filter((s) => s.verdict === "AC");

    const compileErrors = results.filter((s) => s.verdict === "CE");

    const compileTimes = results
      .map((s) => s.compileMs)
      .filter((n) => n !== null);

    const averageCompile = compileTimes.length
      ? Math.round(
          compileTimes.reduce((a, b) => a + b, 0) / compileTimes.length,
        )
      : 0;

    console.log("\n========== SUMMARY ==========\n");

    console.log("Submitted:", CONCURRENCY);
    console.log("Finished:", finished.length);
    console.log("Still pending:", CONCURRENCY - finished.length);
    console.log("Compiled:", compiled.length);
    console.log("Accepted:", accepted.length);
    console.log("Compilation errors:", compileErrors.length);
    console.log("Average compile time:", averageCompile, "ms");
    console.log("Total wall time:", totalTime, "ms");

    if (timedOut) {
      console.log("\nWARNING: Some submissions did not finish in time.");
    }

    for (const s of results) {
      if (s.log) {
        console.log(`\n[Submission ${s.id}] ${s.verdict}\n${s.log}`);
      }
    }

    console.log("\n=============================\n");
  } finally {
    await consumer.disconnect().catch(() => {});
    await channel?.close().catch(() => {});
    await connection?.close().catch(() => {});
  }
}

main().catch((err) => {
  console.error("\nStress test failed:", err);
  process.exitCode = 1;
});
// node test/stress-judge.js test/solution.cpp 100
