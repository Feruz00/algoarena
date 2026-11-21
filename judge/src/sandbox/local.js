// UNSAFE: runs user code directly on this machine with only ulimit + timeout.
// Only for quickly testing the judge pipeline on your own code. Never use for real users.
const fs = require('fs');
const os = require('os');
const path = require('path');
const cfg = require('../config');
const { exec, readSmall } = require('../util');
const { BaseSandbox, parseTimeMeta } = require('./base');

class LocalSandbox extends BaseSandbox {
  constructor(boxId) {
    super(boxId);
    if (process.env.NODE_ENV === 'production') {
      throw new Error('SANDBOX=local is unsafe and refused in production');
    }
  }

  async init() { // eslint-disable-line no-unused-vars
    await fs.promises.mkdir(cfg.workDir, { recursive: true });
    this.dir = await fs.promises.mkdtemp(path.join(cfg.workDir, `local-${this.boxId}-`));
  }

  _env(lang) {
    return { PATH: process.env.PATH, HOME: os.tmpdir(), ...lang.env };
  }

  async _compile(lang) {
    return exec('bash', ['-c', `${lang.compile} > compile.log 2>&1`], {
      cwd: this.dir, env: this._env(lang), timeoutMs: cfg.compileTimeMs,
    });
  }

  async _run(lang, limits) {
    const script = this._runScript(lang, limits, { memUlimit: true });
    const r = await exec('bash', ['-c', script], {
      cwd: this.dir, env: this._env(lang), timeoutMs: limits.timeMs * 3 + 5000,
    });
    const meta = parseTimeMeta(await readSmall(path.join(this.dir, 'meta.txt'), 4096));
    return {
      timedOut: !meta.found && (r.code === 124 || r.code === 137),
      oomKilled: false,
      sigkillIsOom: true,
      exitCode: meta.found ? meta.exitCode : r.code,
      signal: meta.signal,
      cpuMs: meta.cpuMs,
      memoryKb: meta.memoryKb,
    };
  }

  async cleanup() {
    if (this.dir) await fs.promises.rm(this.dir, { recursive: true, force: true }).catch(() => {});
  }
}

module.exports = { LocalSandbox };
