import Redis from "ioredis";

class Gets {
  constructor(private redis: Redis) {}

  async get(prefix: string, id: string) {
    const data = await this.redis.get(`${prefix}:${id}`);
    return data ? JSON.parse(data) : null;
  }
}

export default Gets;
