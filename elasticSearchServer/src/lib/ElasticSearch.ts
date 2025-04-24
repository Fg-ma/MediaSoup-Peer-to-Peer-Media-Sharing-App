// elasticClient.ts
import { Client } from "@elastic/elasticsearch";
import dotenv from "dotenv";
import path from "path";
import fs from "fs";

dotenv.config({
  path: path.resolve(__dirname, "../../../.env"),
});

const caPath = process.env.CA_PATH;

const elasticUrl = process.env.ELASTIC_URL;
const elasticUsername = process.env.ELASTIC_USERNAME;
const elasticPassword = process.env.ELASTIC_PASSWORD;
const elasticCrtPath = process.env.ELASTIC_CRT_PATH;
const elasticKeyPath = process.env.ELASTIC_KEY_PATH;

class ElasticSearch {
  private client: Client;

  constructor() {
    this.client = new Client({
      node: elasticUrl,
      auth: {
        username: elasticUsername,
        password: elasticPassword,
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

  async addDocument(index: string, id: string, doc: Record<string, any>) {
    const res = await this.client.index({
      index,
      id,
      body: doc,
      refresh: "wait_for",
    });
    return res;
  }

  async deleteDocument(index: string, id: string) {
    const res = await this.client.delete({
      index,
      id,
      refresh: "wait_for",
    });
    return res;
  }

  async search(index: string, query: Record<string, any>) {
    const res = await this.client.search({
      index,
      body: {
        query,
      },
    });
    return res.hits.hits;
  }
}

export default ElasticSearch;
