import {
  S3Client,
  ListObjectsCommand,
  GetObjectCommand,
  HeadObjectCommand,
  ListObjectsV2Command,
  ListObjectsV2CommandInput,
  ListMultipartUploadsCommand,
  ListMultipartUploadsCommandOutput,
} from "@aws-sdk/client-s3";

class Gets {
  constructor(private s3Client: S3Client) {}

  listBucketContents = async (bucketName: string) => {
    const params = {
      Bucket: bucketName,
    };

    try {
      const result = await this.s3Client.send(new ListObjectsCommand(params));
      console.log("Bucket Contents:", result.Contents);
    } catch (_) {
      return;
    }
  };

  getContent = async (bucketName: string, key: string, range?: string) => {
    const params = {
      Bucket: bucketName,
      Key: key,
      ...(range ? { Range: range } : {}),
    };

    try {
      return await this.s3Client.send(new GetObjectCommand(params));
    } catch (_) {
      return;
    }
  };

  getHead = async (bucketName: string, key: string) => {
    const params = { Bucket: bucketName, Key: key };

    try {
      return await this.s3Client.send(new HeadObjectCommand(params));
    } catch (_) {
      return;
    }
  };

  listObjects = async (bucketName: string, prefix: string) => {
    const params: ListObjectsV2CommandInput = {
      Bucket: bucketName,
      Prefix: prefix,
    };

    try {
      const result = await this.s3Client.send(new ListObjectsV2Command(params));
      return result.Contents || [];
    } catch (err) {
      console.error("Error listing objects:", err);
      return [];
    }
  };

  listAllMultipartUploads = async (bucketName: string) => {
    const uploads: ListMultipartUploadsCommandOutput["Uploads"] = [];
    let keyMarker: string | undefined;
    let uploadIdMarker: string | undefined;

    while (true) {
      const command = new ListMultipartUploadsCommand({
        Bucket: bucketName,
        KeyMarker: keyMarker,
        UploadIdMarker: uploadIdMarker,
      });

      const result = await this.s3Client.send(command);

      if (result.Uploads) {
        uploads.push(...result.Uploads);
      }

      if (result.IsTruncated) {
        keyMarker = result.NextKeyMarker;
        uploadIdMarker = result.NextUploadIdMarker;
      } else {
        break;
      }
    }

    console.log(uploads);
  };
}

export default Gets;
