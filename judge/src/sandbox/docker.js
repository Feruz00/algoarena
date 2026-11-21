const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const { spawn } = require("child_process");

const cfg = require("../config");
const { readSmall } = require("../util");
const { BaseSandbox, parseTimeMeta } = require("./base");

const USER = "1000:1000";

function envArgs(env = {}) {
  return Object.entries(env).flatMap(([key, value]) => [
    "-e",
    `${key}=${String(value)}`,
  ]);
}

function shellQuote(value) {
  return `'${String(value).replace(/'/g, "'\\''")}'`;
}

/**
 * Run a Docker CLI command without a shell.
 * Resolves on normal completion; rejects on spawn errors or timeout.
 */
function dockerCommand(args, { timeoutMs = 15000, onTimeout } = {}) {
  return new Promise((resolve, reject) => {
    const started = Date.now();
    let stdout = "";
    let stderr = "";
    let settled = false;
    let timedOut = false;

    const child = spawn("docker", args, {
      shell: false,
      windowsHide: true,
      stdio: ["ignore", "pipe", "pipe"],
    });

    const finish = (err, result) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);

      if (err) return reject(err);
      resolve({
        ...result,
        durationMs: Date.now() - started,
      });
    };

    // Keep diagnostic output bounded.
    const MAX_OUTPUT = 1024 * 1024;

    child.stdout.on("data", (chunk) => {
      if (stdout.length < MAX_OUTPUT) {
        stdout += chunk.toString().slice(0, MAX_OUTPUT - stdout.length);
      }
    });

    child.stderr.on("data", (chunk) => {
      if (stderr.length < MAX_OUTPUT) {
        stderr += chunk.toString().slice(0, MAX_OUTPUT - stderr.length);
      }
    });

    child.once("error", (err) => finish(err));

    const timer = setTimeout(() => {
      timedOut = true;

      try {
        onTimeout?.();
      } catch {}

      child.kill("SIGKILL");
    }, timeoutMs);

    child.once("close", (code, signal) => {
      if (timedOut) {
        const err = new Error(
          `Docker command timed out after ${timeoutMs}ms: docker ${args.join(" ")}`,
        );
        err.code = "DOCKER_TIMEOUT";
        err.stdout = stdout;
        err.stderr = stderr;
        err.signal = signal;
        return finish(err);
      }

      finish(null, {
        code: code ?? 1,
        signal,
        stdout,
        stderr,
      });
    });
  });
}

async function removeContainer(name) {
  if (!name) return;

  try {
    await dockerCommand(["rm", "-f", name], { timeoutMs: 8000 });
  } catch (err) {
    console.error(`[sandbox] could not remove ${name}: ${err.message}`);
  }
}

// Call once when the worker starts.
async function cleanupStale(boxIds) {
  for (const boxId of boxIds) {
    const result = await dockerCommand(
      ["ps", "-aq", "--filter", `label=judge.box=${boxId}`],
      { timeoutMs: 10000 },
    );

    if (result.code !== 0) {
      throw new Error(`docker ps failed: ${result.stderr}`);
    }

    const ids = result.stdout.split(/\r?\n/).filter(Boolean);
    if (ids.length) {
      const removed = await dockerCommand(["rm", "-f", ...ids], {
        timeoutMs: 15000,
      });

      if (removed.code !== 0) {
        throw new Error(`stale container cleanup failed: ${removed.stderr}`);
      }
    }
  }
}

class DockerSandbox extends BaseSandbox {
  async init({ lang, limits }) {
    this.dir = path.join(
      cfg.workDir,
      `box-${this.boxId}-${crypto.randomBytes(6).toString("hex")}`,
    );

    await fs.promises.mkdir(this.dir, { recursive: true });
    await fs.promises.chmod(this.dir, 0o777);

    this.name = `judge-${this.boxId}-${crypto.randomBytes(6).toString("hex")}`;

    const memMb = Math.max(1024, limits.memMb + lang.extraMemMb);

    try {
      const result = await dockerCommand(
        [
          "run",
          "-d",
          "--name",
          this.name,
          "--label",
          `judge.box=${this.boxId}`,
          "--network",
          "none",
          "--memory",
          `${memMb}m`,
          "--memory-swap",
          `${memMb}m`,
          "--pids-limit",
          "128",
          "--cpus",
          "1",
          "--read-only",
          "--tmpfs",
          "/tmp:rw,exec,nosuid,size=256m",
          "--cap-drop",
          "ALL",
          "--security-opt",
          "no-new-privileges",
          "-v",
          `${this.dir}:/box`,
          "-w",
          "/box",
          cfg.sandboxImage,
          "sleep",
          "infinity",
        ],
        { timeoutMs: 20000 },
      );

      console.log(`[sandbox] created ${this.name} in ${result.durationMs}ms`);

      if (result.code !== 0) {
        throw new Error(`docker run failed: ${result.stderr}`);
      }
    } catch (err) {
      await removeContainer(this.name);
      await fs.promises.rm(this.dir, { recursive: true, force: true });
      throw err;
    }
  }

  async _exec(script, env = {}, wallMs = 5000) {
    if (!this.name) throw new Error("Sandbox container is not initialized");

    const outerMs = Math.max(5000, wallMs + 5000);

    try {
      const result = await dockerCommand(
        [
          "exec",
          "--user",
          USER,
          "-w",
          "/box",
          ...envArgs({ HOME: "/tmp", ...env }),
          this.name,
          "bash",
          "-c",
          script,
        ],
        {
          timeoutMs: outerMs,
          onTimeout: () => {
            // Kill the sandbox asynchronously if the Docker CLI hangs.
            void removeContainer(this.name);
          },
        },
      );

      console.log(
        `[sandbox] exec ${result.durationMs}ms (exit=${result.code})`,
      );

      // A nonzero exit status can be a legitimate program result.
      // Do not treat it automatically as a Docker failure.
      return result;
    } catch (err) {
      if (err.code === "DOCKER_TIMEOUT") {
        await removeContainer(this.name);
        this.destroyed = true;
      }
      throw err;
    }
  }

  async _compile(lang) {
    const sec = Math.max(1, Math.ceil(cfg.compileTimeMs / 1000));

    // Quote the compiler command as one argument to the inner shell.
    const script =
      `timeout --signal=TERM --kill-after=1s ${sec}s ` +
      `bash -lc ${shellQuote(`${lang.compile} > compile.log 2>&1`)}`;

    const result = await this._exec(script, lang.env, cfg.compileTimeMs);

    return {
      code: result.code,
      timedOut: result.code === 124 || result.code === 137,
    };
  }

  async _run(lang, limits) {
    const wallMs = limits.timeMs * 3 + 2000;

    const script = this._runScript(lang, limits, {
      memUlimit: true,
      pidsUlimit: true,
    });

    const result = await this._exec(script, lang.env, wallMs);

    const meta = parseTimeMeta(
      await readSmall(path.join(this.dir, "meta.txt"), 4096),
    );

    const timedOut =
      !meta.found && (result.code === 124 || result.code === 137);

    if (!meta.found && !timedOut && [126, 127].includes(result.code)) {
      throw new Error(
        `Program failed to start (exit ${result.code}). Check the runtime and GNU time installation.`,
      );
    }

    // Clear temporary runtime files without touching /box/main or test data.
    await this._exec(
      "find /tmp -mindepth 1 -maxdepth 1 -exec rm -rf -- {} +",
      {},
      5000,
    ).catch((err) => {
      console.warn("[sandbox] tmp cleanup failed:", err.message);
    });

    return {
      timedOut,
      oomKilled: false,
      sigkillIsOom: true,
      exitCode: meta.found ? meta.exitCode : result.code,
      signal: meta.signal,
      cpuMs: meta.cpuMs,
      memoryKb: meta.memoryKb,
    };
  }

  async cleanup() {
    if (this.name && !this.destroyed) {
      // Stop/remove the container before removing its host directory.
      await removeContainer(this.name);
    }

    if (this.dir) {
      await fs.promises
        .rm(this.dir, { recursive: true, force: true })
        .catch((err) => {
          console.error(
            `[sandbox] could not remove ${this.dir}: ${err.message}`,
          );
        });
    }

    this.name = null;
    this.dir = null;
  }
}

module.exports = { DockerSandbox, cleanupStale };
