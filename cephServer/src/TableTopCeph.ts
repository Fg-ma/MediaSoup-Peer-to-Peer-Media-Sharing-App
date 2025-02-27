import { Upload } from "@aws-sdk/lib-storage";
import {
  S3Client,
  ListObjectsCommand,
  DeleteObjectCommand,
  DeleteObjectsCommand,
} from "@aws-sdk/client-s3";
import internal from "stream";
import dotenv from "dotenv";
import path from "path";

dotenv.config({
  path: path.resolve(__dirname, "../../.env"),
});

const cephRegion = process.env.CEPH_REGION;
const cephEndpoint = process.env.CEPH_ENDPOINT;
const cephAccessKeyId = process.env.CEPH_ACCESS_KEY_ID;
const cephSecretAccessKey = process.env.CEPH_SECRET_ACCESS_KEY;

class TableTopCeph {
  s3Client = new S3Client({
    region: cephRegion ?? "",
    endpoint: cephEndpoint ?? "",
    credentials: {
      accessKeyId: cephAccessKeyId ?? "",
      secretAccessKey: cephSecretAccessKey ?? "",
    },
    forcePathStyle: true,
  });

  uploadFile = async (
    bucketName: string,
    key: string,
    fileStream: internal.Readable & {
      truncated?: boolean;
    }
  ) => {
    try {
      const upload = new Upload({
        client: this.s3Client,
        params: {
          Bucket: bucketName,
          Key: key,
          Body: fileStream,
        },
      });

      upload.on("httpUploadProgress", (progress) => {});

      // Wait for the upload to complete
      await upload.done();
    } catch (error) {}
  };

  listBucketContents = async (bucketName: string) => {
    const params = {
      Bucket: bucketName,
    };

    try {
      const result = await this.s3Client.send(new ListObjectsCommand(params));
      console.log("Bucket Contents:", result.Contents);
    } catch (err) {
      console.error("Error listing contents:", err);
    }
  };

  deleteFile = async (bucketName: string, key: string) => {
    const params = {
      Bucket: bucketName,
      Key: key,
    };

    try {
      await this.s3Client.send(new DeleteObjectCommand(params));
    } catch (err) {}
  };

  emptyBucket = async (bucketName: string) => {
    try {
      // List all objects in the bucket
      const listResponse = await this.s3Client.send(
        new ListObjectsCommand({ Bucket: bucketName })
      );

      if (listResponse.Contents && listResponse.Contents.length > 0) {
        const deleteParams = {
          Bucket: bucketName,
          Delete: {
            Objects: listResponse.Contents.map((object) => ({
              Key: object.Key,
            })),
          },
        };

        // Delete the objects
        await this.s3Client.send(new DeleteObjectsCommand(deleteParams));
        console.log(`Bucket ${bucketName} emptied successfully.`);
      } else {
        console.log(`Bucket ${bucketName} is already empty.`);
      }
    } catch (error) {
      console.error("Error emptying bucket:", error);
    }
  };
}

export default TableTopCeph;
