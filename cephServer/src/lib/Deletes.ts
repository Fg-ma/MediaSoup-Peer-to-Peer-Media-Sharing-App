import {
  S3Client,
  ListObjectsCommand,
  DeleteObjectCommand,
  DeleteObjectsCommand,
  ListMultipartUploadsCommand,
  AbortMultipartUploadCommand,
} from "@aws-sdk/client-s3";

class Deletes {
  constructor(private s3Client: S3Client) {}

  deleteFile = async (bucketName: string, key: string) => {
    const params = {
      Bucket: bucketName,
      Key: key,
    };

    try {
      await this.s3Client.send(new DeleteObjectCommand(params));
    } catch (_) {
      return;
    }
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

  abortAllMultipartUploads = async (bucketName: string) => {
    let isTruncated = true;
    let keyMarker: string | undefined;
    let uploadIdMarker: string | undefined;

    while (isTruncated) {
      const listResp = await this.s3Client.send(
        new ListMultipartUploadsCommand({
          Bucket: bucketName,
          KeyMarker: keyMarker,
          UploadIdMarker: uploadIdMarker,
        })
      );

      const uploads = listResp.Uploads || [];

      for (const upload of uploads) {
        await this.s3Client.send(
          new AbortMultipartUploadCommand({
            Bucket: bucketName,
            Key: upload.Key!,
            UploadId: upload.UploadId!,
          })
        );
      }

      isTruncated = listResp.IsTruncated ?? false;
      keyMarker = listResp.NextKeyMarker;
      uploadIdMarker = listResp.NextUploadIdMarker;
    }
  };
}

export default Deletes;
