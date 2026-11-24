const { getLang } = require("./languages");
const { createSandbox } = require("./sandbox");
const { check } = require("./checkers");
const boxPool = require("./box-pool");

// Job sent by the backend:
// {
//   submissionId, code, lang,
//   time: 1000,            // ms per testcase
//   memory: 256,           // MB
//   type: "exact" | "tokens",
//   testgroup: { id, testcases: [ { id?, input, expectedOutput }, ... ] }
// }

function normalizeJob(job) {
  const errors = [];

  const submissionId = job.submissionId ?? job.id;
  if (submissionId === undefined || submissionId === null) {
    errors.push("submissionId is missing");
  }

  const lang = getLang(job.lang ?? job.language);
  if (!lang) {
    errors.push(`unknown language "${job.lang ?? job.language}"`);
  }

  const type =
    job.type === "tokens" || job.type === "token" ? "token" : job.type;

  if (type !== "exact" && type !== "token") {
    errors.push('type must be "exact" or "tokens"');
  }

  if (typeof job.code !== "string" || job.code.trim() === "") {
    errors.push("code is empty");
  }

  const timeMs = Number(job.time);
  const memMb = Number(job.memory);

  return {
    errors,
    submissionId,
    userId: job.userId,
    problemId: job.problemId,
    lang,
    type,
    code: job.code,
    testgroups: job.testgroups,
    // testcases,

    limits: {
      timeMs: Number.isFinite(timeMs) && timeMs > 0 ? timeMs : 1000,
      memMb: Number.isFinite(memMb) && memMb > 0 ? memMb : 256,
    },
  };
}

async function judge(rawJob, emit) {
  const boxId = await boxPool.acquire();
  // console.log("geldim");
  try {
    return await judgeWithBox(rawJob, emit, boxId);
  } finally {
    boxPool.release(boxId);
  }
}

// emit(event): publish progress (Kafka). boxId: sandbox slot owned by this run.
async function judgeWithBox(rawJob, emit, boxId = 0) {
  // console.log("geldim");
  const job = normalizeJob(rawJob);
  // console.log("normal job", job);

  const base = {
    submissionId: job.submissionId,
    userId: job.userId,
    problemId: job.problemId,
    username: job.username,
    // contestId: job.contestId,
  };
  const finish = (extra) => emit({ ...base, status: "FINISHED", ...extra });

  if (job.errors.length)
    return finish({ verdict: "SE", message: job.errors.join("; ") });

  const { lang, limits, testgroups } = job;
  const sb = createSandbox(boxId);
  // console.log("step 1");
  try {
    await sb.init({ lang, limits }); // docker: starts THE container for this submission
    // console.log("step 2");
    await emit({ ...base, status: "COMPILING" });
    // console.log("step 2.1");

    await sb.writeSource(lang, job.code);
    const c = await sb.compile(lang);
    // console.log("barlag", c);
    // console.log("step 3: barlag netijesi", c);
    if (!c.ok) return finish({ status: "FINISHED", verdict: "CE", log: c.log });
    // console.log("step 4");
    let maxTime = 0;
    let maxMem = 0;
    let score = 0;
    for (let j = 0; j < testgroups.length; j++) {
      let group = testgroups[j];
      const testcases = group.testcases;

      for (let i = 0; i < testcases.length; i++) {
        const tc = testcases[i];

        await emit({
          ...base,
          status: "RUNNING",
          testcase: tc.order,
          testgroup: group.order,
          ...(tc.id !== undefined ? { testcaseId: tc.id } : {}),
        });
        // console.log("step 5");
        await sb.writeInput(String(tc.input ?? ""));
        const r = await sb.run(lang, limits);
        // console.log(r);
        let verdict = r.verdict;
        if (verdict === "OK")
          verdict = await check(
            job.type,
            sb.outputPath,
            String(tc.expectedOutput ?? ""),
          );

        maxTime = Math.max(maxTime, r.timeMs);
        maxMem = Math.max(maxMem, r.memoryKb);
        // console.log(verdict);
        if (verdict !== "AC") {
          // stop at the first failing testcase
          return finish({
            verdict,
            failedTest: {
              testcase: tc.order,
              testgroup: group.order,
            },
            ...(tc.id !== undefined ? { failedTestId: tc.id } : {}),
            timeMs: maxTime,
            memoryKb: maxMem,
            score,
          });
        }
      }
      score += testgroups[j].score ?? 0;
    }

    return finish({ verdict: "AC", timeMs: maxTime, memoryKb: maxMem, score });
  } finally {
    await sb.cleanup().catch((e) => console.error("cleanup failed", e));
  }
}

module.exports = { judge, normalizeJob };
