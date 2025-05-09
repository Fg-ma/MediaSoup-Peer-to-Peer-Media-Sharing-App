import dotenv from "dotenv";
import path from "path";
import { QdrantClient } from "@qdrant/js-client-rest";

dotenv.config({
  path: path.resolve(__dirname, "../../../.env"),
});

const qdrantUrl = process.env.QDRANT_URL;

export type QdrantCondition = {
  key: string;
  match: { value: string | number };
};

export type QdrantFilter = {
  must?: QdrantCondition[];
  must_not?: QdrantCondition[];
  should?: QdrantCondition[];
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface ScoredPoint<Payload = any> {
  id: string | number;
  version?: number;
  score?: number;
  payload?: Payload;
  vector?: number[];
}

export type SearchParams = {
  vector: { name: string; vector: number[] };
  filter?: QdrantFilter;
  limit?: number;
};

class Qdrant {
  private client: QdrantClient;

  constructor() {
    this.client = new QdrantClient({ url: qdrantUrl });
  }

  addPoint = async (
    collection: string,
    id: string,
    vector: number[],
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    payload?: Record<string, any>
  ) => {
    await this.client.upsert(collection, {
      points: [
        {
          id,
          vector,
          payload,
        },
      ],
    });
  };

  deletePoint = async (collection: string, id: string) => {
    await this.client.delete(collection, {
      points: [id],
    });
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  search = async <Payload = any>(
    collection: string,
    params: SearchParams
  ): Promise<ScoredPoint<Payload>[]> => {
    return (await this.client.search(
      collection,
      params
    )) as ScoredPoint<Payload>[];
  };
}

export default Qdrant;
