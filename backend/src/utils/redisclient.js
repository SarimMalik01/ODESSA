// redisClient.js
import Redis from "ioredis";

const redis = new Redis({
  host: process.env.REDIS_HOST,
  port: Number(process.env.REDIS_PORT),
  maxRetriesPerRequest: null
});

redis.on("connect", () => {
  console.log("✅ Redis connected (scan engine)");
});

redis.on("error", (err) => {
  console.error("❌ Redis error (scan engine)", err);
});

export default redis;
