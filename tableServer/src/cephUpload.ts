import { exec } from "child_process";
import * as fs from "fs";
import * as path from "path";

// Function to upload file to Ceph cluster using radosgw-admin
async function uploadFileToCeph(
  filePath: string,
  bucketName: string,
  objectKey: string
): Promise<void> {
  return new Promise((resolve, reject) => {
    // Check if the file exists
    if (!fs.existsSync(filePath)) {
      reject("File not found");
      return;
    }

    // Define the command to upload the file using radosgw-admin
    const command = `radosgw-admin object put --bucket=${bucketName} --object=${objectKey} --file=${filePath}`;

    // Execute the command
    exec(command, (error, stdout, stderr) => {
      if (error) {
        reject(`Error uploading file: ${stderr || error.message}`);
        return;
      }
      resolve(stdout);
    });
  });
}

// Example usage of the upload function
const filePath = path.join(__dirname, "../../test.txt");
const bucketName = "your-bucket-name"; // Your Ceph bucket name
const objectKey = "test.txt"; // The object name in Ceph (e.g., the file name in the bucket)

uploadFileToCeph(filePath, bucketName, objectKey)
  .then(() => {
    console.log("File uploaded successfully!");
  })
  .catch((error) => {
    console.error("Failed to upload file:", error);
  });
