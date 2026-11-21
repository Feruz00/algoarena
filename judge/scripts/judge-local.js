// Judge a job file WITHOUT RabbitMQ / Kafka. Prints the events.
//   node scripts/judge-local.js samples/jobs/ac-cpp17.json
const fs = require('fs');
const { judge } = require('../src/judge');

const file = process.argv[2];
if (!file) {
  console.error('usage: node scripts/judge-local.js <job.json>');
  process.exit(1);
}
judge(JSON.parse(fs.readFileSync(file, 'utf8')), async (e) => console.log(JSON.stringify(e)), 0).catch((e) => {
  console.error(e);
  process.exit(1);
});
