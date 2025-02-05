import { Upload } from "@aws-sdk/lib-storage";
import {
  S3Client,
  ListObjectsCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  DeleteObjectsCommand,
} from "@aws-sdk/client-s3";
import internal, { PassThrough } from "stream";
import dotenv from "dotenv";

dotenv.config();

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

      upload.on("httpUploadProgress", (progress) => {
        console.log(progress);
      });

      // Wait for the upload to complete
      const result = await upload.done();
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

  streamFileToClient = async (bucketName: string, key: string, res: any) => {
    const params = {
      Bucket: bucketName,
      Key: key,
    };

    try {
      const data = await this.s3Client.send(new GetObjectCommand(params));
      if (data.Body) {
        res.setHeader(
          "Content-Type",
          data.ContentType || "application/octet-stream"
        );
        const passThrough = new PassThrough();
        data.Body.pipe(passThrough).pipe(res);
      } else {
        res.status(404).send("File not found");
      }
    } catch (err) {
      res.status(500).send("Error streaming file");
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
