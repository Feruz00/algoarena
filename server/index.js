// require("dotenv").config();
require("dotenv").config({ path: require("path").resolve(__dirname, ".env") });
const http = require("http");

const PORT = process.env.PORT || 3001;
const app = require("./app");
const server = http.createServer(app);
const {
  connectRedis,
  closeRedis,
  getRedis,
  addOnlineUser,
  getOnlineUsers,
  removeOnlineUser,
} = require("./config/redis");
const db = require("./models");
const { initializeSocket } = require("./socket");
const { runKafka } = require("./kafka/worker");
const { recoverRunningContests } = require("./queue/contestRecovery");
// const cronJob = require("./cron");

async function startServer() {
  try {
    await connectRedis();
    await db.sequelize.authenticate();
    console.log("✅ Database connected successfully.");
    await recoverRunningContests();

    console.log("🚀 Starting contest worker...");
    require("./queue/contestWorker");

    console.log("✅ Contest worker initialized.");
    const io = await initializeSocket(server);

    io.on("connection", async (socket) => {
      const userId = socket.handshake.query.id;
      const normalizedUserId = userId;

      console.log(
        `User with ID ${normalizedUserId} connected with ${socket.id}`,
      );

      socket.join(normalizedUserId);
      await addOnlineUser(normalizedUserId);

      socket.emit("onlineUsers", await getOnlineUsers());
      socket.broadcast.emit("userOnline", normalizedUserId);

      socket.on("disconnect", async () => {
        console.log(`Client disconnected ${userId}: ${socket.id}`);
        const room = io.sockets.adapter.rooms.get(normalizedUserId);
        if (!room || room.size === 0) {
          await removeOnlineUser(normalizedUserId);

          // Tell everyone that the user is offline
          socket.broadcast.emit("userOffline", normalizedUserId);
        }
      });
    });

    runKafka();
    // cronJob();
    server.listen(PORT, "0.0.0.0", () => {
      console.log(`🚀 Server started on port ${PORT}`);
    });
  } catch (error) {
    console.error("❌ Unable to connect to the database:", error.message);
    console.log(error);
    console.log("⏳ Retrying server start in 5s...");
  }
}

startServer();

async function gracefulShutdown() {
  console.log("🛑 Gracefully shutting down...");

  try {
    const redis = getRedis();

    if (process.env.NODE_ENV !== "production") {
      await redis.flushdb();
      console.log("🧹 Redis DB flushed.");
    }

    await closeRedis();
    await db.sequelize.close();

    process.exit(0);
  } catch (err) {
    console.error("Shutdown error:", err);
    process.exit(1);
  }
}

process.on("SIGINT", gracefulShutdown);
process.on("SIGTERM", gracefulShutdown);

process.on("unhandledRejection", (reason) => {
  console.error("⚠️ Unhandled Rejection:", reason);
  gracefulShutdown();
});

process.on("uncaughtException", (err) => {
  console.error("💥 Uncaught Exception:", err);
  gracefulShutdown();
});
