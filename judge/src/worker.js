// RabbitMQ (judge.submissions) -> judge -> Kafka (judge.events)
const amqp = require("amqplib");
const { Kafka, logLevel } = require("kafkajs");
const cfg = require("./config");
const { judge } = require("./judge");

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function connectRabbit() {
  for (let attempt = 1; ; attempt++) {
    try {
      return await amqp.connect(cfg.rabbitUrl);
    } catch (e) {
      console.error(`RabbitMQ not ready (attempt ${attempt}): ${e.message}`);
      await sleep(Math.min(1000 * attempt, 10000));
    }
  }
}

async function main() {
  const kafka = new Kafka({
    clientId: "judge-worker",
    brokers: cfg.kafkaBrokers,
    logLevel: logLevel.WARN,
  });
  const producer = kafka.producer({ allowAutoTopicCreation: true });
  await producer.connect();

  // submissionId is the key -> all events of one submission stay in order
  const emit = (event) =>
    producer.send({
      topic: cfg.eventsTopic,
      messages: [
        {
          key: String(event.submissionId),
          value: JSON.stringify({ ...event, ts: Date.now() }),
        },
      ],
    });
  const conn = await connectRabbit();
  const ch = await conn.createChannel();
  await ch.assertQueue(cfg.submissionQueue, { durable: true });
  ch.prefetch(cfg.concurrency);

  const freeBoxes = Array.from(
    { length: cfg.concurrency },
    (_, i) => cfg.boxIdBase + i,
  );
  if (cfg.sandbox === "docker")
    await require("./sandbox/docker").cleanupStale(freeBoxes);
  let inflight = 0;
  let stopping = false;

  const { consumerTag } = await ch.consume(cfg.submissionQueue, async (msg) => {
    if (!msg) return;
    let job;
    try {
      job = JSON.parse(msg.content.toString());
    } catch {
      console.error("dropping malformed message");
      return ch.ack(msg);
    }

    inflight++;
    const boxId = freeBoxes.pop();
    try {
      console.log(
        `judging submission ${job.submissionId ?? job.id} (${job.lang ?? job.language})`,
      );
      // console.log(job);

      await judge(job, emit, boxId);
      ch.ack(msg); // ack ONLY after the final verdict was published
    } catch (err) {
      console.error(`submission ${job.submissionId ?? job.id} failed:`, err);
      if (!msg.fields.redelivered) {
        ch.nack(msg, false, true); // retry once
      } else {
        await emit({
          submissionId: job.submissionId ?? job.id,
          status: "FINISHED",
          verdict: "SE",
        }).catch(() => {});
        ch.ack(msg);
      }
    } finally {
      freeBoxes.push(boxId);
      inflight--;
    }
  });

  console.log(
    `judge worker ready (sandbox=${cfg.sandbox}, concurrency=${cfg.concurrency})`,
  );

  const shutdown = async () => {
    if (stopping) return;
    stopping = true;
    console.log("shutting down, waiting for running jobs...");
    await ch.cancel(consumerTag).catch(() => {});
    while (inflight > 0) await sleep(200);
    await producer.disconnect().catch(() => {});
    await conn.close().catch(() => {});
    process.exit(0);
  };
  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);

  // let systemd / pm2 / docker restart us
  conn.on("close", () => {
    if (!stopping) {
      console.error("RabbitMQ connection closed");
      process.exit(1);
    }
  });
  conn.on("error", (e) => console.error("RabbitMQ error", e.message));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
