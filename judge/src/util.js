const { spawn } = require('child_process');
const fs = require('fs');

// Run a process, capture (capped) stdout/stderr, optional timeout.
function exec(cmd, args, opts = {}) {
  return new Promise((resolve) => {
    const p = spawn(cmd, args, {
      cwd: opts.cwd,
      env: opts.env || process.env,
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    let stdout = '';
    let stderr = '';
    let timedOut = false;
    const cap = (s, d) => (s.length < 65536 ? s + d : s);
    p.stdout.on('data', (d) => (stdout = cap(stdout, d)));
    p.stderr.on('data', (d) => (stderr = cap(stderr, d)));
    const timer = opts.timeoutMs
      ? setTimeout(() => {
          timedOut = true;
          if (opts.onTimeout) opts.onTimeout();
          else p.kill('SIGKILL');
        }, opts.timeoutMs)
      : null;
    p.on('error', (e) => {
      clearTimeout(timer);
      resolve({ code: -1, signal: null, stdout, stderr: String(e), timedOut });
    });
    p.on('close', (code, signal) => {
      clearTimeout(timer);
      resolve({ code, signal, stdout, stderr, timedOut });
    });
  });
}

// Read at most `n` bytes of a file, '' if it does not exist.
async function readSmall(file, n = 2048) {
  try {
    const fh = await fs.promises.open(file, 'r');
    try {
      const buf = Buffer.alloc(n);
      const { bytesRead } = await fh.read(buf, 0, n, 0);
      return buf.slice(0, bytesRead).toString('utf8');
    } finally {
      await fh.close();
    }
  } catch {
    return '';
  }
}

const exists = (p) => fs.promises.access(p).then(() => true, () => false);

module.exports = { exec, readSmall, exists };
