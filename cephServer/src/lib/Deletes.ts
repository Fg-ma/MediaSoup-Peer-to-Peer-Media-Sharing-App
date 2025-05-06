import {
  S3Client,
  ListObjectsCommand,
  DeleteObjectCommand,
  DeleteObjectsCommand,
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

export default Deletes;
