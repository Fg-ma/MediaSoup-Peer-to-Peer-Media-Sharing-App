import Redis from "ioredis";

class Posts {
  constructor(private redis: Redis) {}

  post = async (
    prefix: string,
    id: string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    data: any,
    ttlSeconds = 1800
  ): Promise<void> => {
    await this.redis.set(
      `${prefix}:${id}`,
      JSON.stringify(data),
      "EX",
      ttlSeconds
    );
  };

  extendLife = async (
    prefix: string,
    id: string,
    ttlSeconds: number
  ): Promise<boolean> => {
    const result = await this.redis.expire(`${prefix}:${id}`, ttlSeconds);
    return result === 1;
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  rpush = async (prefix: string, data: any) => {
    await this.redis.rpush(prefix, data);
  };
}

export default Posts;
