import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

const s3Client = new S3Client({
  region: "us-east-1", // Replace with your Ceph region
  endpoint: "http://<ceph-rgw-ip>:7480", // Ceph RadosGW endpoint
  credentials: {
    accessKeyId: "<your-access-key>",
    secretAccessKey: "<your-secret-key>",
  },
  forcePathStyle: true,
});

async function uploadFile(
  bucketName: string,
  key: string,
  fileContent: Buffer
) {
  const params = {
    Bucket: bucketName,
    Key: key,
    Body: fileContent,
  };

  try {
    const result = await s3Client.send(new PutObjectCommand(params));
    console.log("File uploaded successfully:", result);
  } catch (err) {
    console.error("Error uploading file:", err);
  }
}

// Example usage
const fileContent = Buffer.from("Hello, Ceph!");
uploadFile("my-bucket", "example.txt", fileContent);
