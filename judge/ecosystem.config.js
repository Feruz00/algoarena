// module.exports = {
//   apps: [
//     {
//       name: "judge-system",
//       script: "src/worker.js",
//       instances: 5,
//       exec_mode: "cluster", // or 'fork' if you prefer
//       watch: false,
//       max_memory_restart: "1G",
//       env: {
//         NODE_ENV: "production",
//       },
//       env_development: {
//         NODE_ENV: "development",
//       },
//       // Optional: useful for a worker
//       autorestart: true,
//       max_restarts: 10,
//       min_uptime: "10s",
//       // Uncomment if you want logs in a specific place
//       // error_file: './logs/err.log',
//       // out_file: './logs/out.log',
//       // log_date_format: 'YYYY-MM-DD HH:mm:ss',
//     },
//   ],
// };
module.exports = {
  apps: [
    {
      name: "judge-system",
      script: "./src/worker.js",

      instances: 5,
      exec_mode: "cluster",

      env: {
        BOXES_PER_INSTANCE: 4,
        ISOLATE_BOX_BASE: 0,
      },
    },
  ],
};
