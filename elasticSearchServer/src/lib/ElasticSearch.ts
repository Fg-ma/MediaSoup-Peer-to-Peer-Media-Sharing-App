import { Client } from "@elastic/elasticsearch";
import dotenv from "dotenv";
import path from "path";

dotenv.config({
  path: path.resolve(__dirname, "../../../.env"),
});

const caPath = process.env.CA_PATH;

const elasticUrl = process.env.ELASTIC_URL;
const elasticUsername = process.env.ELASTIC_USERNAME;
const elasticPassword = process.env.ELASTIC_PASSWORD;

class ElasticSearch {
  private client: Client;

  constructor() {
    this.client = new Client({
      node: elasticUrl,
      auth: {
        username: elasticUsername ?? "",
        password: elasticPassword ?? "",
      },
      tls: {
        ca: caPath!,
        rejectUnauthorized: false,
      },
      headers: {
        accept: "application/vnd.elasticsearch+json; compatible-with=7",
        "content-type": "application/vnd.elasticsearch+json; compatible-with=7",
      },
      sniffOnStart: false,
      sniffInterval: false,
    });
  }

  addDocument = async (
    index: string,
    id: string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    doc: Record<string, any>
  ) => {
    const res = await this.client.index({
      index,
      id,
      body: doc,
      refresh: "wait_for",
    });
    return res;
  };

  deleteDocument = async (index: string, id: string) => {
    const res = await this.client.delete({
      index,
      id,
      refresh: "wait_for",
    });
    return res;
  };

  search = async (
    index: string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    query: Record<string, any>
  ) => {
    const res = await this.client.search({
      index,
      query,
    });
    return res.hits.hits;
  };
}

export default ElasticSearch;
