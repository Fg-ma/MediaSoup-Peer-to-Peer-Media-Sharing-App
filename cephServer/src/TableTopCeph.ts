import { S3Client } from "@aws-sdk/client-s3";
import dotenv from "dotenv";
import path from "path";
import Deletes from "./lib/Deletes";
import Gets from "./lib/Gets";
import Posts from "./lib/Posts";

dotenv.config({
  path: path.resolve(__dirname, "../../.env"),
});

const cephRegion = process.env.CEPH_REGION;
const cephEndpoint = process.env.CEPH_ENDPOINT;
const cephAccessKeyId = process.env.CEPH_ACCESS_KEY_ID;
const cephSecretAccessKey = process.env.CEPH_SECRET_ACCESS_KEY;

class TableTopCeph {
  private s3Client = new S3Client({
    region: cephRegion ?? "",
    endpoint: cephEndpoint ?? "",
    credentials: {
      accessKeyId: cephAccessKeyId ?? "",
      secretAccessKey: cephSecretAccessKey ?? "",
    },
    forcePathStyle: true,
  });
  deletes: Deletes;
  posts: Posts;
  gets: Gets;

  constructor() {
    this.deletes = new Deletes(this.s3Client);
    this.posts = new Posts(this.s3Client);
    this.gets = new Gets(this.s3Client);
  }
}

export default TableTopCeph;
