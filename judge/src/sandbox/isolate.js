const fs = require("fs");
const os = require("os");
const path = require("path");
const crypto = require("crypto");

const cfg = require("../config");
const { exec, readSmall } = require("../util");
const { BaseSandbox } = require("./base");

const PATH_ENV = "/usr/local/bin:/usr/bin:/bin";
const DIRS = ["--dir=/etc", "--dir=/tmp:tmp"];

const MAX_META_SIZE = 16 * 1024;

function parseMeta(text = "") {
  const meta = {};

  for (const line of text.split(/\r?\n/)) {
    const i = line.indexOf(":");

    if (i > 0) {
      meta[line.slice(0, i).trim()] = line.slice(i + 1).trim();
    }
  }

  return meta;
}

function numberOrZero(value) {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

function parseInteger(value, fallback = 0) {
  const n = Number.parseInt(value, 10);
  return Number.isFinite(n) ? n : fallback;
}

function shellQuote(value) {
  return `'${String(value).replace(/'/g, "'\\''")}'`;
}

function seconds(ms) {
  return Math.max(0.1, ms / 1000).toFixed(3);
}

class IsolateSandbox extends BaseSandbox {
  constructor(boxId) {
    super(boxId);

    this.root = null;
    this.dir = null;
    this.metaPath = null;
    this.initialized = false;
  }

  async _readMeta() {
    try {
      return parseMeta(await readSmall(this.metaPath, MAX_META_SIZE));
    } catch (err) {
      if (err.code === "ENOENT") return {};
      throw err;
    }
  }

  async init({ lang, limits } = {}) {
    if (this.initialized) {
      throw new Error("Isolate sandbox is already initialized");
    }

    // Remove leftovers from a previous crashed worker run.
    const cleanup = await exec(
      "isolate",
      [`--box-id=${this.boxId}`, "--cg", "--cleanup"],
      { timeoutMs: 15000 },
    );

    if (cleanup.code !== 0) {
      throw new Error(
        `isolate pre-cleanup failed: ${cleanup.stderr || cleanup.stdout}`,
      );
    }

    const result = await exec(
      "isolate",
      [`--box-id=${this.boxId}`, "--cg", "--init"],
      { timeoutMs: 15000 },
    );

    if (result.code !== 0) {
      throw new Error(
        `isolate --init failed: ${result.stderr || result.stdout}`,
      );
    }

    this.root = result.stdout.trim();
    this.dir = path.join(this.root, "box");

    // Keep metadata files outside the sandbox.
    this.metaPath = path.join(
      os.tmpdir(),
      `isolate-meta-${this.boxId}-${crypto.randomBytes(6).toString("hex")}.txt`,
    );

    try {
      await fs.promises.access(this.dir, fs.constants.R_OK | fs.constants.W_OK);
      this.initialized = true;
    } catch (err) {
      await exec("isolate", [`--box-id=${this.boxId}`, "--cg", "--cleanup"], {
        timeoutMs: 15000,
      }).catch(() => {});

      throw new Error(
        `Isolate box is not accessible at ${this.dir}: ${err.message}`,
      );
    }
  }

  _common(lang) {
    const env = {
      PATH: PATH_ENV,
      HOME: "/tmp",
      LANG: "C.UTF-8",
      LC_ALL: "C.UTF-8",
      ...(lang.env || {}),
    };

    return [
      `--box-id=${this.boxId}`,
      "--cg",
      "--silent",
      ...DIRS,
      ...Object.entries(env).map(([key, value]) => {
        if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(key)) {
          throw new Error(`Invalid environment variable name: ${key}`);
        }

        return `--env=${key}=${String(value)}`;
      }),
    ];
  }

  async _execute(script, lang, limits, options = {}) {
    const {
      timeMs,
      wallMs,
      memMb,
      processes,
      fileSizeKb,
      stdin,
      stdout,
      stderr,
      compile = false,
    } = options;

    const args = [
      ...this._common(lang),
      "--run",
      `--time=${seconds(timeMs)}`,
      `--wall-time=${seconds(wallMs)}`,
      "--extra-time=0.3",
      `--cg-mem=${Math.ceil(memMb * 1024)}`,
      `--processes=${processes}`,
      `--fsize=${fileSizeKb}`,
      ...(stdin ? [`--stdin=${stdin}`] : []),
      ...(stdout ? [`--stdout=${stdout}`] : []),
      ...(stderr ? [`--stderr=${stderr}`] : []),
      `--meta=${this.metaPath}`,
      "--",
      "/bin/bash",
      "-lc",
      script,
    ];

    // Ensure stale metadata can never be mistaken for this run's result.
    await fs.promises.rm(this.metaPath, { force: true });

    const result = await exec("isolate", args, {
      timeoutMs: Math.max(wallMs + 10000, 15000),
    });

    const meta = await this._readMeta();

    if (meta.status === "XX") {
      throw new Error(
        `Isolate internal error${meta.message ? `: ${meta.message}` : ""}` +
          (result.stderr ? `; ${result.stderr}` : ""),
      );
    }
    const hasExecutionMetadata =
      meta.exitcode !== undefined ||
      meta.exitsig !== undefined ||
      meta.status !== undefined;

    if (!hasExecutionMetadata) {
      if (result.timedOut) {
        return {
          timedOut: true,
          oomKilled: false,
          exitCode: null,
          signal: null,
          cpuMs: 0,
          memoryKb: 0,
          code: result.code,
          log: result.stderr || "",
        };
      }

      throw new Error(
        `Missing isolate metadata. Exit=${result.code}; ` +
          `metaPath=${this.metaPath}; ` +
          `meta=${JSON.stringify(meta)}; ` +
          `stdout=${result.stdout || ""}; stderr=${result.stderr || ""}`,
      );
    }

    const exitCode =
      meta.exitcode !== undefined ? parseInteger(meta.exitcode, null) : null;

    const memoryKb = parseInteger(meta["cg-mem"] || meta["max-rss"] || "0");

    const cpuMs = Math.round(numberOrZero(meta.time) * 1000);

    return {
      timedOut: meta.status === "TO" || Boolean(result.timedOut),
      oomKilled: meta["cg-oom-killed"] === "1",
      exitCode,
      signal: meta.exitsig ? parseInteger(meta.exitsig, null) : null,
      cpuMs,
      memoryKb,
      code: result.code,
      status: meta.status,
      log: result.stderr || "",
    };
  }

  async _compile(lang) {
    const timeoutMs = cfg.compileTimeMs;
    const script = `${lang.compile} > compile.log 2>&1`;

    const result = await this._execute(
      script,
      lang,
      {},
      {
        timeMs: timeoutMs,
        wallMs: timeoutMs * 2,
        memMb: 1024,
        processes: 256,
        fileSizeKb: 262144,
        compile: true,
      },
    );

    if (result.timedOut) {
      return {
        code: 124,
        timedOut: true,
        log: await readSmall(path.join(this.dir, "compile.log"), 65536),
      };
    }

    return {
      code: result.exitCode ?? result.code,
      timedOut: false,
      log: await readSmall(path.join(this.dir, "compile.log"), 65536),
    };
  }

  async _run(lang, limits) {
    const memMb = limits.memMb + (lang.extraMemMb || 0);

    const result = await this._execute(lang.run(limits.memMb), lang, limits, {
      timeMs: limits.timeMs,
      wallMs: limits.timeMs * 3 + 2000,
      memMb,
      processes: lang.pids || 64,
      fileSizeKb: cfg.maxOutputMb * 1024,
      stdin: "input.txt",
      stdout: "output.txt",
      stderr: "stderr.txt",
    });

    return {
      timedOut: result.timedOut,
      oomKilled: result.oomKilled,
      sigkillIsOom: false,
      exitCode: result.exitCode,
      signal: result.signal,
      cpuMs: result.cpuMs,
      memoryKb: result.memoryKb,
    };
  }

  async cleanup() {
    try {
      if (this.initialized) {
        const result = await exec(
          "isolate",
          [`--box-id=${this.boxId}`, "--cg", "--cleanup"],
          { timeoutMs: 15000 },
        );

        if (result.code !== 0) {
          console.error(
            `[isolate] cleanup failed for box ${this.boxId}: ` +
              (result.stderr || result.stdout),
          );
        }
      }
    } finally {
      if (this.metaPath) {
        await fs.promises.rm(this.metaPath, { force: true }).catch(() => {});
      }

      this.root = null;
      this.dir = null;
      this.metaPath = null;
      this.initialized = false;
    }
  }
}

module.exports = { IsolateSandbox };
