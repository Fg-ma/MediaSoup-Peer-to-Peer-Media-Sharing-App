import Redis from "ioredis";

class Gets {
  constructor(private redis: Redis) {}

  async get(prefix: string, id: string) {
    const data = await this.redis.get(`${prefix}:${id}`);
    return data ? JSON.parse(data) : null;
  }

  async getKey(key: string) {
    const data = await this.redis.get(key);
    return data ? JSON.parse(data) : null;
  }

  lrange = async (prefix: string, start: number = 0, end: number = -1) => {
    try {
      return await this.redis.lrange(prefix, start, end);
    } catch {
      return null;
    }
  };

  lindex = async (prefix: string, idx: number) => {
    return await this.redis.lindex(prefix, idx);
  };

  scanAllKeys = async (match: string): Promise<string[]> => {
    let cursor = "0";
    const allKeys: string[] = [];

    do {
      const [nextCursor, keys] = await this.redis.scan(cursor, "MATCH", match);
      cursor = nextCursor;
      allKeys.push(...keys);
    } while (cursor !== "0");

    return allKeys;
  };

  mget = async (keys: string[]): Promise<(string | null)[]> => {
    try {
      return await this.redis.mget(...keys);
    } catch {
      return [];
    }
  };
}

export default Gets;
