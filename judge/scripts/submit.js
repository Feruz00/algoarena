// Publish a job file to RabbitMQ (what your backend does).
//   node scripts/submit.js samples/jobs/ac-cpp17.json [submissionId]
const fs = require('fs');
const amqp = require('amqplib');
const cfg = require('../src/config');

(async () => {
  const [, , file, id] = process.argv;
  if (!file) {
    console.error('usage: node scripts/submit.js <job.json> [submissionId]');
    process.exit(1);
  }
  const job = JSON.parse(fs.readFileSync(file, 'utf8'));
  job.submissionId = id || String(Date.now());
  const conn = await amqp.connect(cfg.rabbitUrl);
  const ch = await conn.createChannel();
  await ch.assertQueue(cfg.submissionQueue, { durable: true });
  ch.sendToQueue(cfg.submissionQueue, Buffer.from(JSON.stringify(job)), { persistent: true });
  console.log('queued submission', job.submissionId);
  await ch.close();
  await conn.close();
})().catch((e) => { console.error(e); process.exit(1); });
