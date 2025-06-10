import Redis from "ioredis";

class Posts {
  constructor(private redis: Redis) {}

  rename = async (oldKey: string, newKey: string): Promise<void> => {
    try {
      await this.redis.rename(oldKey, newKey);
    } catch (_) {
      return;
    }
  };

  copy = async (oldKey: string, newKey: string): Promise<void> => {
    try {
      await this.redis.copy(oldKey, newKey);
    } catch (_) {
      return;
    }
  };

  post = async (
    prefix: string,
    id: string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    data: any,
    ttlSeconds = 1800
  ): Promise<void> => {
    if (ttlSeconds !== -1) {
      await this.redis.set(
        `${prefix}:${id}`,
        JSON.stringify(data),
        "EX",
        ttlSeconds
      );
    } else {
      await this.redis.set(`${prefix}:${id}`, JSON.stringify(data));
    }
  };

  set = async (
    key: string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    data: any,
    ttlSeconds = 1800
  ): Promise<void> => {
    if (ttlSeconds !== -1) {
      await this.redis.set(key, data, "EX", ttlSeconds);
    } else {
      await this.redis.set(key, data);
    }
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

  expire = async (key: string, ttl: number) => {
    return this.redis.expire(key, ttl);
  };

  persist = async (key: string) => {
    return this.redis.persist(key);
  };
}

export default Posts;
