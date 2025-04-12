import * as grpc from "@grpc/grpc-js";
import * as protoLoader from "@grpc/proto-loader";
import path from "path";

const PROTO_PATH = path.resolve(
  __dirname,
  "../../../semanticSearch/embedding/embed.proto"
);

const packageDef = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});

const grpcObj = grpc.loadPackageDefinition(packageDef) as any;
const client = new grpcObj.embed.Embedder(
  "localhost:50051",
  grpc.credentials.createInsecure()
);

export function getEmbedding(text: string): Promise<number[]> {
  return new Promise((resolve, reject) => {
    client.EmbedText({ text }, (err: any, response: any) => {
      if (err) return reject(err);
      resolve(response.embedding);
    });
  });
}
