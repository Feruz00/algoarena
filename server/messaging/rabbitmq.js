const amqp = require("amqplib");

const RABBIT_URL =
  process.env.RABBIT_URL || "amqp://guest:guest@localhost:5672";
const QUEUE = "judge.submissions";
const sendSubmission = async (job) => {
  const conn = await amqp.connect(RABBIT_URL);
  const ch = await conn.createChannel();
  await ch.assertQueue(QUEUE, { durable: true });

  ch.sendToQueue(QUEUE, Buffer.from(JSON.stringify(job)), { persistent: true });
};

module.exports = { sendSubmission };
