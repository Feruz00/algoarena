# judge-system

Online judge worker in Node.js.

```
Backend ──► RabbitMQ (judge.submissions) ──► judge worker ──► Kafka (judge.events) ──► Backend ──► Socket.IO ──► Frontend
                                             │ compile once
                                             │ run every testcase in a sandbox
                                             └ compare: exact / tokens
```

Languages (`src/languages.js`): C++14/17/20/23, Python 3, Free Pascal, Go, Java 11/17/21.
Verdicts: `AC WA PE RE CE TLE MLE` and `SE` (system error / bad job: not the user's fault).

## Job format (RabbitMQ queue `judge.submissions`, persistent JSON)

```json
{
  "submissionId": "123",
  "code": "...",
  "lang": "cpp17",
  "time": 1000,
  "memory": 256,
  "type": "exact",
  "testgroup": {
    "id": 5,
    "testcases": [
      { "id": 11, "input": "1 2\n", "expectedOutput": "3\n" },
      { "id": 12, "input": "-5 5\n", "expectedOutput": "0\n" }
    ]
  }
}
```

- `submissionId` is required (it is the Kafka key and how your backend matches events). `id` also works.
- `time` = milliseconds per testcase, `memory` = megabytes. Defaults 1000 / 256.
- `lang`: `cpp14 cpp17 cpp20 cpp23 python3 pascal go java11 java17 java21`
  (aliases: `c++17`, `python`, `py`, `java` = java17, `golang`, ...).
- `type`:
  - `exact` – every line must be equal (CRLF and trailing empty lines are ignored).
    Same tokens but different whitespace = **PE**, different tokens = WA.
  - `tokens` – whitespace is ignored completely, tokens are compared. AC or WA.
- `testcases` may also be an object `{ "<id>": { input, expectedOutput } }`.
- `expectedOutput` stays in the worker, it is never copied into the sandbox. The program only sees `input.txt`.

Testcases run in the given order and judging stops at the first failure.

## Events (Kafka topic `judge.events`, key = submissionId)

```json
{ "submissionId": "123", "testgroupId": 5, "status": "COMPILING" }
{ "submissionId": "123", "testgroupId": 5, "status": "RUNNING", "testcase": 2, "total": 20, "testcaseId": 12 }
{ "submissionId": "123", "testgroupId": 5, "status": "FINISHED", "verdict": "AC", "timeMs": 120, "memoryKb": 3400 }
{ "submissionId": "123", "testgroupId": 5, "status": "FINISHED", "verdict": "WA", "failedTest": 2, "failedTestId": 12, "timeMs": 40, "memoryKb": 3300 }
{ "submissionId": "123", "testgroupId": 5, "status": "FINISHED", "verdict": "CE", "log": "compiler output" }
```

`backend-example/server.js` shows the backend side (publish job, consume Kafka, Socket.IO room per submission,
ignore duplicate FINISHED events).

## Sandboxes (`SANDBOX=` in `.env`)

| value     | use                         | notes                                                                               |
| --------- | --------------------------- | ----------------------------------------------------------------------------------- |
| `docker`  | development (Windows / WSL) | **one container per submission**, compile and every testcase run with `docker exec` |
| `isolate` | production (Ubuntu)         | accurate CPU time and memory via cgroups                                            |
| `local`   | pipeline testing only       | **unsafe**, no isolation, refused when `NODE_ENV=production`                        |

### How the Docker sandbox works

```
docker run -d ... sleep infinity      once per submission
docker exec  compile                  once
docker exec  test 1, test 2, ...      each followed by a tiny cleanup exec (kill leftovers, clear /tmp)
docker rm -f                          once
```

Container: no network, all capabilities dropped, read-only root, `--pids-limit`, programs run as uid 1000.
CPU time and peak memory are measured inside by GNU `time`; wall time is enforced by `timeout -s KILL`.
Because the container is shared by compile and all tests, the container memory cap is `max(1 GB, limit + runtime overhead)`.
The per-test memory limit is enforced by `ulimit -v` (C++/Python/Pascal), `-Xmx` (Java), a peak-RSS check, and the OOM killer.
That is a bit less strict than one container per run, which is fine for development. Use `isolate` for production.
A crashed worker's leftover containers are removed on the next start (label `judge.box`).

## 1. Development (Windows 11)

Easiest: run everything inside your Ubuntu WSL with Docker Desktop WSL integration enabled.

```bash
npm install
cp .env.example .env

docker compose up -d                                                  # RabbitMQ, Kafka, Redis
docker build -f docker/sandbox.Dockerfile -t judge-sandbox:latest .   # all compilers (takes a while)

docker build --no-cache \
  --build-arg HTTP_PROXY=http://host.docker.internal:10808 \
  --build-arg HTTPS_PROXY=http://host.docker.internal:10808 \
  -f docker/sandbox.Dockerfile \
  -t judge-sandbox:latest .


# 1) judge one job file without RabbitMQ / Kafka:
node scripts/judge-local.js samples/jobs/ac-cpp17.json

# 2) the full pipeline (3 terminals):
node scripts/watch-events.js                                          # prints Kafka events
npm start                                                             # the worker
node scripts/submit.js samples/jobs/ac-python.json                    # sends a job
```

`samples/jobs/` has ready jobs: `ac-*` (C++, Python, Java, Go, Pascal), `wa-`, `pe-` (exact), `ce-`, `re-`, `tle-`, `mle-`.
Run the unit tests with `npm test`.

## 2. Production (Ubuntu / WSL Ubuntu)

WSL2 needs systemd: add to `/etc/wsl.conf`

```
[boot]
systemd=true
```

then `wsl --shutdown` in Windows.

```bash
sudo bash deploy/install-ubuntu.sh   # compilers + isolate + node, sets SANDBOX=isolate, starts the systemd service
journalctl -u judge-worker -f
```

Edit `/opt/judge-system/.env` (RABBIT_URL, KAFKA_BROKER ...) and `sudo systemctl restart judge-worker`.
Alternative to systemd: `pm2 start ecosystem.config.js`.

Scaling: run more workers (other machines, or processes with a different `BOX_ID_BASE`).
Keep `CONCURRENCY=1` per dedicated CPU core; parallel runs on a busy CPU cause false TLEs.
RabbitMQ / Kafka / Redis can be the same `docker-compose.yml` on Ubuntu or apt packages; only `.env` changes.

## 3. Notes

- The message is acked only after the final verdict is published. On an unexpected error the job is retried once,
  then `SE` is published. A malformed job gets `SE` with a `message` listing what is wrong.
- Java: the public class must be called `Main`. Java and Go get extra memory for their runtimes
  (`extraMemMb` in `languages.js`). JDK paths assume amd64; edit `JAVA()` in `languages.js` for arm64.
- The Docker image needs the `time` package (included in `docker/sandbox.Dockerfile`).
- **Tested:** compile / run / verdict logic (AC, WA, PE, CE, RE, TLE, MLE) for C++14/17/20 and Python with the
  `local` sandbox, the one-container `docker exec` flow against a stand-in `docker` command, and the unit tests.
  **Not run for real:** the actual Docker daemon, `isolate`, Java, Go, Pascal, RabbitMQ and Kafka (no Docker or network
  where this was written). Expect small fixes on the first run, especially `isolate` flags and JDK paths.
