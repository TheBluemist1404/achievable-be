import "dotenv/config";
import { createClient } from "redis";

const redisUrl = process.env.REDIS_URL ?? "redis://localhost:6379";

export const redisClient = createClient({ url: redisUrl });

redisClient.on("error", (error) => {
  console.error("Redis client error", error);
});

export const connectRedis = async (): Promise<void> => {
  if (!redisClient.isOpen) {
    await redisClient.connect();
  }

  console.log("Redis connected!");
};
