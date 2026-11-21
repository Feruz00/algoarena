module.exports = {
  apps: [
    {
      name: "server",
      script: "index.js",
      instances: 5,
      exec_mode: "cluster",
      env_file: ".env", // ← try this
      cwd: "/home/user/projects/judge/server",
    },
  ],
};
