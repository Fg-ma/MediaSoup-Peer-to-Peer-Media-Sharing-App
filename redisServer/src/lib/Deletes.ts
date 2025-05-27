import Redis from "ioredis";

class Deletes {
  constructor(private redis: Redis) {}

  async delete(deletes: { prefix: string; id: string }[]): Promise<number> {
    const keys = deletes.map(({ prefix, id }) => `${prefix}:${id}`);
    return await this.redis.del(...keys);
  }

  async deleteKeys(deletes: string[]): Promise<number> {
    return await this.redis.del(...deletes);
  }
}

export default Deletes;
