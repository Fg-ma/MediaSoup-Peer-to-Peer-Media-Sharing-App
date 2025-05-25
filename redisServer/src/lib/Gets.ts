import Redis from "ioredis";

class Gets {
  constructor(private redis: Redis) {}

  async get(prefix: string, id: string) {
    const data = await this.redis.get(`${prefix}:${id}`);
    return data ? JSON.parse(data) : null;
  }

  lrange = async (prefix: string, start: number = 0, end: number = -1) => {
    return await this.redis.lrange(prefix, start, end);
  };
}

export default Gets;
