import Redis from "ioredis";
import dotenv from "dotenv";
import path from "path";
import Gets from "./lib/Gets";
import Posts from "./lib/Posts";
import Deletes from "./lib/Deletes";

dotenv.config({
  path: path.resolve(__dirname, "../../.env"),
});

const redisHost = process.env.REDIS_HOST;
const redisPort = process.env.REDIS_PORT;

class TableTopRedis {
  private redis: Redis;
  gets: Gets;
  posts: Posts;
  deletes: Deletes;

  constructor() {
    this.redis = new Redis({
      host: redisHost,
      port: parseInt(redisPort || "6379", 10),
      db: 0,
    });

    this.gets = new Gets(this.redis);
    this.posts = new Posts(this.redis);
    this.deletes = new Deletes(this.redis);
  }
}

export default TableTopRedis;
