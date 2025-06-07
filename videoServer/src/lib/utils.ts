import fs from "fs";
import { exec } from "child_process";
import ffmpeg from "fluent-ffmpeg";
import path from "path";

// Utility to check if an MP4 file is corrupt
function checkIfFileIsCorrupt(filePath: string): Promise<boolean> {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(filePath, (err, metadata) => {
      if (err) {
        console.error("File appears to be corrupt:", err.message);
        resolve(true); // File is corrupt
      } else {
        console.log("File passed integrity check.");
        resolve(false); // File is valid
      }
    });
  });
}

// Utility to repair the file using FFmpeg
function repairFile(
  moovBuffer: ArrayBuffer,
  inputPath: string,
  outputPath: string
): Promise<void> {
  return new Promise((resolve, reject) => {
    console.log("Repairing corrupt MP4 file...");

    // Step 1: Write the moov buffer to a temporary file
    const tempMoovPath = path.join(__dirname, "temp_moov.mp4");
    fs.writeFileSync(tempMoovPath, Buffer.from(moovBuffer));

    // Step 2: Combine the moov atom with the broken file into a new temporary file
    const combinedFilePath = path.join(__dirname, "combined_temp.mp4");
    const inputFileBuffer = fs.readFileSync(inputPath);
    const combinedBuffer = Buffer.concat([
      fs.readFileSync(tempMoovPath),
      inputFileBuffer,
    ]);
    fs.writeFileSync(combinedFilePath, combinedBuffer);

    // Step 3: Use FFmpeg to fix the file and write the output
    const command = `ffmpeg -i "${combinedFilePath}" -vcodec copy -acodec copy -movflags faststart "${outputPath}"`;

    exec(command, (error, stdout, stderr) => {
      // Cleanup temporary files
      fs.unlinkSync(tempMoovPath);
      fs.unlinkSync(combinedFilePath);

      if (error) {
        console.error("Error repairing file:", stderr || error.message);
        if (stderr.includes("moov atom not found")) {
          console.error(
            "The input file is missing the moov atom and cannot be repaired."
          );
        }
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
    const tempFilePath = `${outputPath.slice(
      0,
      outputPath.lastIndexOf(".")
    )}_temp.mp4`; // Temporary path for intermediate file

    // Write the initial truncated MP4
    const dataBuffer = Buffer.from(data);
    fs.writeFileSync(tempFilePath, dataBuffer);

    // Check if the file is corrupt
    const isCorrupt = await checkIfFileIsCorrupt(tempFilePath);
    console.log(isCorrupt);
    if (isCorrupt) {
      console.log("Repairing corrupt MP4 file...");
      await repairFile(metadata.moov, tempFilePath, outputPath);
    } else {
      console.log("MP4 file is valid. Saving directly...");
      fs.renameSync(tempFilePath, outputPath); // Rename the temp file to final output
    }
  } catch (error) {
    console.error("An error occurred:", error);
  }
}
