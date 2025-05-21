import Redis from "ioredis";
import dotenv from "dotenv";
import path from "path";

dotenv.config({
  path: path.resolve(__dirname, "../../.env"),
});

const redisHost = process.env.REDIS_HOST;
const redisPort = process.env.REDIS_PORT;

class TableTopRedis {
  private redis: Redis;

  constructor() {
    this.redis = new Redis({
      host: redisHost,
      port: parseInt(redisPort || "6379", 10),
      db: 0,
    });
  }

  async save(
    prefix: string,
    id: string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    data: any,
    ttlSeconds = 1800
  ): Promise<void> {
    await this.redis.set(
      `${prefix}:${id}`,
      JSON.stringify(data),
      "EX",
      ttlSeconds
    );
  }

  async get(prefix: string, id: string) {
    const data = await this.redis.get(`${prefix}:${id}`);
    return data ? JSON.parse(data) : null;
  }

  async delete(deletes: { prefix: string; id: string }[]): Promise<number> {
    const keys = deletes.map(({ prefix, id }) => `${prefix}:${id}`);
    return await this.redis.del(...keys);
  }

  async extendLife(
    prefix: string,
    id: string,
    ttlSeconds: number
  ): Promise<boolean> {
    const result = await this.redis.expire(`${prefix}:${id}`, ttlSeconds);
    return result === 1;
  }
}

export default TableTopRedis;
