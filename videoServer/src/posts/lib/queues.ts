import { Queue } from "bullmq";

export const redisConnection = {
  host: "localhost",
  port: 6379,
};

export const videoTranscodeQueue = new Queue("videoTranscodeQueue", {
  connection: redisConnection,
});
