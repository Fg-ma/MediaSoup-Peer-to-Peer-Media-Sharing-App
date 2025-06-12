import Redis from "ioredis";
import dotenv from "dotenv";
import path from "path";
import { tableTopCeph } from "../TableTopRedis";

dotenv.config({
  path: path.resolve(__dirname, "../../.env"),
});

const redisHost = process.env.REDIS_HOST;
const redisPort = process.env.REDIS_PORT;

class TableTopSubscriber {
  private readonly encodedCephBucketMap: { [encodedBucket: string]: string } = {
    ta: "table-applications",
    ti: "table-images",
    tsc: "table-sound-clips",
    ts: "table-svgs",
    tt: "table-text",
    tv: "table-videos",
    ua: "user-applications",
    ui: "user-images",
    usc: "user-sound-clips",
    us: "user-svgs",
    ut: "user-text",
    uv: "user-videos",
  };

  private sub: Redis;

  constructor() {
    this.sub = new Redis({
      host: redisHost,
      port: parseInt(redisPort || "6379", 10),
      db: 0,
    });

    this.initSubscriber();
  }

  initSubscriber = async () => {
    // Subscribe to expired events for all keys in DB 0
    await this.sub.psubscribe("__keyevent@0__:expired");

    this.sub.on("pmessage", async (_pattern, _channel, expiredKey) => {
      const split = expiredKey.split(":");

      switch (split[0]) {
        case "TSCUS": {
          const encodedCephBucket = split[1];
          const contentId = split[2];
          const uploadId = split[3];

          await tableTopCeph.posts.abortMultipartUpload(
            this.encodedCephBucketMap[encodedCephBucket],
            contentId,
            uploadId
          );
          break;
        }
        case "USCUS": {
          const encodedCephBucket = split[1];
          const contentId = split[2];
          const uploadId = split[3];

          await tableTopCeph.posts.abortMultipartUpload(
            this.encodedCephBucketMap[encodedCephBucket],
            contentId,
            uploadId
          );
          break;
        }
        case "VUS": {
          const contentId = split[1];
          const uploadId = split[2];

          await tableTopCeph.posts.abortMultipartUpload(
            "table-videos",
            contentId,
            uploadId
          );
          break;
        }
        default:
          break;
      }
    });
  };
}

export default TableTopSubscriber;
