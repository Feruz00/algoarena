const fs = require("fs");
const path = require("path");
const cfg = require("../config");
const { readSmall } = require("../util");

// Parse GNU time output: %U %S %M
function parseTimeMeta(text = "") {
  const result = {
    cpuMs: 0,
    memoryKb: 0,
    exitCode: 0,
    signal: null,
    found: false,
  };

  for (const line of text.split("\n")) {
    let match;

    if ((match = line.match(/^Command terminated by signal (\d+)/))) {
      result.signal = Number(match[1]);
    } else if (
      (match = line.match(/^Command exited with non-zero status (\d+)/))
    ) {
      result.exitCode = Number(match[1]);
    } else if ((match = line.match(/^([\d.]+) ([\d.]+) (\d+)\s*$/))) {
      result.cpuMs = Math.round((Number(match[1]) + Number(match[2])) * 1000);
      result.memoryKb = Number(match[3]);
      result.found = true;
    }
  }

  return result;
}

function decide(raw, lang, limits, stderr = "") {
  if (raw.timedOut) return { verdict: "TLE" };
  if (raw.oomKilled) return { verdict: "MLE" };

  if (raw.cpuMs > limits.timeMs) {
    return { verdict: "TLE" };
  }

  if (raw.memoryKb > (limits.memMb + (lang.extraMemMb || 0)) * 1024) {
    return { verdict: "MLE" };
  }

  if (raw.sigkillIsOom && raw.signal === 9) {
    return { verdict: "MLE" };
  }

  const crashed = Boolean(raw.signal) || raw.exitCode !== 0;

  if (
    crashed &&
    /OutOfMemoryError|bad_alloc|MemoryError|cannot allocate memory/i.test(
      stderr,
    )
  ) {
    return { verdict: "MLE" };
  }

  if (crashed) {
    const reason = raw.signal
      ? `signal ${raw.signal}`
      : `exit code ${raw.exitCode}`;

    return { verdict: "RE", message: reason };
  }

  return { verdict: "OK" };
}

class BaseSandbox {
  constructor(boxId) {
    this.boxId = boxId;
    this.dir = null;
  }

  get outputPath() {
    return path.join(this.dir, "output.txt");
  }

  async writeSource(lang, code) {
    await fs.promises.writeFile(path.join(this.dir, lang.src), code, {
      mode: 0o644,
    });
  }
  async writeInput(text) {
    if (!this.dir) {
      throw new Error("Sandbox directory is not initialized");
    }

    await fs.promises.writeFile(path.join(this.dir, "input.txt"), text, {
      mode: 0o644,
    });
  }
  // async writeInput(text) {
  //   await fs.promises.writeFile(path.join(this.dir, "input.txt"), text, {
  //     mode: 0o644,
  //   });
  // }

  async compile(lang) {
    if (!lang.compile) {
      return { ok: true, log: "" };
    }

    const { code, timedOut } = await this._compile(lang);

    let log = await readSmall(path.join(this.dir, "compile.log"), 4096);

    if (timedOut) {
      log = `${log}\n[Compilation exceeded the time limit of ${
        cfg.compileTimeMs ?? 60000
      } ms]`;
    }

    return {
      ok: code === 0 && !timedOut,
      log,
    };
    // let log = await readSmall(path.join(this.dir, "compile.log"), 4096);

    // if (timedOut) {
    //   log += "\n[compilation time limit exceeded]";
    // }

    // return {
    //   ok: code === 0 && !timedOut,
    //   log,
    // };
  }

  async run(lang, limits) {
    for (const file of ["output.txt", "stderr.txt", "meta.txt"]) {
      await fs.promises.rm(path.join(this.dir, file), {
        force: true,
      });
    }

    const raw = await this._run(lang, limits);

    const stderr = await readSmall(path.join(this.dir, "stderr.txt"), 2048);

    const decision = decide(raw, lang, limits, stderr);

    const timeMs =
      decision.verdict === "TLE"
        ? Math.max(raw.cpuMs || 0, limits.timeMs)
        : raw.cpuMs || 0;

    return {
      verdict: decision.verdict,
      message: decision.message,
      timeMs,
      memoryKb: raw.memoryKb || 0,
      stderr,
    };
  }

  /**
   * Build a command that executes the already-compiled program.
   *
   * Resource controls:
   * - Docker's --pids-limit controls the container's process count.
   * - ulimit -v limits virtual memory where supported and appropriate.
   * - ulimit -f limits output file size.
   * - GNU time records CPU usage and peak RSS.
   * - timeout enforces a wall-clock limit.
   *
   * Do not use `ulimit -u` here. It introduces an additional per-user
   * process limit and can prevent Bash from starting the program.
   */

  _runScript(lang, limits, { memUlimit = false } = {}) {
    const fsizeKb = Math.max(1, Math.floor(cfg.maxOutputMb * 1024));

    const wallSec = (limits.timeMs * 3 + 2000) / 1000;
    const command = lang.run(limits.memMb);

    const lines = [
      "set -f",
      `ulimit -f ${fsizeKb}`,
      "ulimit -c 0",
      "ulimit -s 262144 2>/dev/null || true",
    ];

    // Apply virtual-memory limits only to languages configured for them.
    if (memUlimit && lang.extraMemMb === 0) {
      lines.push(`ulimit -v ${Math.floor(limits.memMb * 1024)}`);
    }

    // Run the already-compiled program exactly once per testcase.
    lines.push(
      `exec timeout --signal=TERM --kill-after=1s ${wallSec}s ` +
        `${cfg.timeBin} -f '%U %S %M' -o meta.txt ` +
        `${command} < input.txt > output.txt 2> stderr.txt`,
    );

    // IMPORTANT: each shell command must be separated by a semicolon.
    return lines.join(";\n");
  }
}

module.exports = {
  BaseSandbox,
  parseTimeMeta,
  decide,
};
