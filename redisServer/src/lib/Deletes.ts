import Redis from "ioredis";

class Deletes {
  constructor(private redis: Redis) {}

  async delete(deletes: { prefix: string; id: string }[]): Promise<number> {
    const keys = deletes.map(({ prefix, id }) => `${prefix}:${id}`);
    return await this.redis.del(...keys);
  }

  async deleteKeys(deletes: string[]): Promise<number> {
    if (deletes.length !== 0) {
      return await this.redis.del(...deletes);
    } else {
      return 0;
    }
  }
}

export default Deletes;
