// @ts-expect-error bullmq types missing
import { Queue } from "bullmq";

export const videoTranscodeQueue = new Queue("videoTranscodeQueue", {
  connection: {
    host: "localhost",
    port: 6379,
  },
});
