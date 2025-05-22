import Redis from "ioredis";

class Posts {
  constructor(private redis: Redis) {}

  async post(
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

  async extendLife(
    prefix: string,
    id: string,
    ttlSeconds: number
  ): Promise<boolean> {
    const result = await this.redis.expire(`${prefix}:${id}`, ttlSeconds);
    return result === 1;
  }
}

export default Posts;
