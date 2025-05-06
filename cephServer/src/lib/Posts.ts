import { Upload } from "@aws-sdk/lib-storage";
import {
  S3Client,
  CreateMultipartUploadCommand,
  UploadPartCommand,
  CompleteMultipartUploadCommand,
} from "@aws-sdk/client-s3";
import internal from "stream";

class Posts {
  constructor(private s3Client: S3Client) {}

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
}

export default Posts;
