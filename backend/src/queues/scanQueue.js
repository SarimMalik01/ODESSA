// queues/scanQueue.js
import { Queue } from "bullmq";

const REDIS_CONNECTION = {
  host: process.env.REDIS_HOST || "localhost",
  port: process.env.REDIS_PORT || 6379
};

export const scanQueue = new Queue("scanQueue", {
  connection: REDIS_CONNECTION,
  defaultJobOptions: {
    removeOnComplete: true,
    removeOnFail: false
  }
});
