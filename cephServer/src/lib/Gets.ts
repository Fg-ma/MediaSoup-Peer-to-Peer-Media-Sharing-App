import {
  S3Client,
  ListObjectsCommand,
  GetObjectCommand,
  HeadObjectCommand,
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
}

export default Gets;
