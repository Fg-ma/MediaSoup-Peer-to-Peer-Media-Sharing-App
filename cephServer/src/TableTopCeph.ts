import { Upload } from "@aws-sdk/lib-storage";
import {
  S3Client,
  CreateMultipartUploadCommand,
  UploadPartCommand,
  CompleteMultipartUploadCommand,
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

      // Wait for the upload to complete
      await upload.done();
    } catch (error) {
      console.log(error);
    }
  };

  createMultipartUpload = async (bucketName: string, key: string) => {
    try {
      const command = new CreateMultipartUploadCommand({
        Bucket: bucketName,
        Key: key,
      });
      const response = await this.s3Client.send(command);
      return response.UploadId;
    } catch (error) {
      console.log(error);
    }
  };

  uploadPart = async (
    bucketName: string,
    key: string,
    partNumber: number,
    uploadId: string,
    body: Buffer<ArrayBuffer>
  ) => {
    try {
      const command = new UploadPartCommand({
        Bucket: bucketName,
        Key: key,
        PartNumber: partNumber,
        UploadId: uploadId,
        Body: body,
      });
      const response = await this.s3Client.send(command);
      return response.ETag;
    } catch (error) {
      console.log(error);
    }
  };

  completeMultipartUpload = async (
    bucketName: string,
    key: string,
    uploadId: string,

    parts: { PartNumber: number; ETag: string }[]
  ) => {
    try {
      const command = new CompleteMultipartUploadCommand({
        Bucket: bucketName,
        Key: key,
        UploadId: uploadId,
        MultipartUpload: { Parts: parts },
      });

      await this.s3Client.send(command);
    } catch (error) {
      console.log(error);
    }
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
