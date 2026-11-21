// Print every event from Kafka (what your backend consumer receives).
const { Kafka, logLevel } = require('kafkajs');
const cfg = require('../src/config');

(async () => {
  const kafka = new Kafka({ clientId: 'judge-watch', brokers: cfg.kafkaBrokers, logLevel: logLevel.WARN });
  const consumer = kafka.consumer({ groupId: 'judge-watch-' + Date.now() });
  await consumer.connect();
  await consumer.subscribe({ topic: cfg.eventsTopic, fromBeginning: false });
  await consumer.run({ eachMessage: async ({ message }) => console.log(message.value.toString()) });
  console.log('watching', cfg.eventsTopic, '...');
})().catch((e) => { console.error(e); process.exit(1); });
