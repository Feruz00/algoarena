// Example of YOUR backend side:
//   POST /submit        -> publish job to RabbitMQ (your job format)
//   Kafka judge.events  -> Socket.IO room "submission:<id>" -> frontend
// Replace the in-memory parts with your database.
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const { Kafka, logLevel } = require('kafkajs');
const amqp = require('amqplib');

const RABBIT_URL = process.env.RABBIT_URL || 'amqp://guest:guest@localhost:5672';
const KAFKA_BROKER = process.env.KAFKA_BROKER || 'localhost:9092';
const QUEUE = 'judge.submissions';
const TOPIC = 'judge.events';

const app = express();
app.use(express.json({ limit: '1mb' }));
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

io.on('connection', (socket) => {
  // frontend: socket.emit('subscribe', submissionId)
  socket.on('subscribe', (id) => socket.join(`submission:${id}`));
});

const finished = new Set(); // idempotency: RabbitMQ can redeliver. Use your DB instead.

async function start() {
  const conn = await amqp.connect(RABBIT_URL);
  const ch = await conn.createChannel();
  await ch.assertQueue(QUEUE, { durable: true });

  app.post('/submit', (req, res) => {
    // body: { code, lang, time, memory, type: 'exact'|'tokens', testgroup: { id, testcases: [{ id, input, expectedOutput }] } }
    // TODO: authenticate, validate, save the submission row in your DB -> real id,
    //       load the testgroup from your DB instead of trusting the client
    const submissionId = String(Date.now());
    const job = { ...req.body, submissionId };
    ch.sendToQueue(QUEUE, Buffer.from(JSON.stringify(job)), { persistent: true });
    res.json({ submissionId });
  });

  const kafka = new Kafka({ clientId: 'backend', brokers: [KAFKA_BROKER], logLevel: logLevel.WARN });
  const consumer = kafka.consumer({ groupId: 'backend-judge-events' });
  await consumer.connect();
  await consumer.subscribe({ topic: TOPIC, fromBeginning: false });
  await consumer.run({
    eachMessage: async ({ message }) => {
      const ev = JSON.parse(message.value.toString());
      if (ev.status === 'FINISHED') {
        if (finished.has(ev.submissionId)) return; // duplicate final event
        finished.add(ev.submissionId);
        // TODO: save ev.verdict, ev.timeMs, ev.memoryKb, ev.failedTest to your DB
      }
      io.to(`submission:${ev.submissionId}`).emit('judge:update', ev);
    },
  });

  server.listen(3000, () => console.log('backend example on :3000'));
}
start().catch((e) => { console.error(e); process.exit(1); });
