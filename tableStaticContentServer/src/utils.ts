import fs from "fs";
import { exec } from "child_process";
import ffmpeg from "fluent-ffmpeg";

// Utility to check if an MP4 file is corrupt
function checkIfFileIsCorrupt(filePath: string): Promise<boolean> {
  return new Promise((resolve, reject) => {
    ffmpeg(filePath)
      .on("error", (err) => {
        console.error("File appears to be corrupt:", err.message);
        resolve(true); // File is corrupt
      })
      .on("end", () => {
        console.log("File passed integrity check.");
        resolve(false); // File is valid
      })
      .ffprobe(); // Perform integrity check
  });
}

// Utility to repair the file using FFmpeg
function repairFile(inputPath: string, outputPath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const command = `ffmpeg -i "${inputPath}" -c copy -movflags faststart "${outputPath}"`;

    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error("Error repairing file:", error.message);
        reject(error);
      } else {
        console.log(`File repaired successfully: ${outputPath}`);
        resolve();
      }
    });
  });
}

// Utility to write an MP4 file with modified metadata
export async function createTruncatedMP4(
  metadata: {
    ftyp: {
      majorBrand: string;
      minorVersion: number;
      compatibleBrands: string;
    };
    moov: ArrayBuffer;
  },
  data: ArrayBuffer,
  outputPath: string
): Promise<void> {
  try {
    const tempFilePath = `${outputPath.slice(0, -4)}_temp_truncated.mp4`; // Temporary path for intermediate file

    // Write the initial truncated MP4
    const dataBuffer = Buffer.from(data);
    fs.writeFileSync(tempFilePath, dataBuffer);

    // Check if the file is corrupt
    const isCorrupt = await checkIfFileIsCorrupt(tempFilePath);

    if (isCorrupt) {
      console.log("Repairing corrupt MP4 file...");
      await repairFile(tempFilePath, outputPath);
    } else {
      console.log("MP4 file is valid. Saving directly...");
      fs.renameSync(tempFilePath, outputPath); // Rename the temp file to final output
    }
  } catch (error) {
    console.error("An error occurred:", error);
  }
}
