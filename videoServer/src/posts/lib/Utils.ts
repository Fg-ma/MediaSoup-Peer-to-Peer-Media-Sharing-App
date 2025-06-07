import { randomFillSync } from "crypto";
import path from "path";
import { exec } from "child_process";

class Utils {
  random = (() => {
    const buf = Buffer.alloc(16);
    return () => randomFillSync(buf).toString("hex");
  })();

  // Function to process the uploaded video using Shaka Packager
  processVideoWithABR = (
    inputFile: string,
    outputDir: string,
    filename: string
  ): Promise<void> => {
    return new Promise((resolve, reject) => {
      const baseName = path.basename(filename, path.extname(filename));
      const video500kPath = path.join(outputDir, `${baseName}_500k.mp4`);
      const video1MPath = path.join(outputDir, `${baseName}_1M.mp4`);
      const video2MPath = path.join(outputDir, `${baseName}_2M.mp4`);
      const audioPath = path.join(outputDir, `${baseName}_audio.mp4`);
      const outputPath = path.join(outputDir, `${baseName}.mpd`);

      const packagerCommand = `packager-win-x64.exe \
      "in=${inputFile},stream=video,bandwidth=500000,output=${video500kPath}" \
      "in=${inputFile},stream=video,bandwidth=1000000,output=${video1MPath}" \
      "in=${inputFile},stream=video,bandwidth=2000000,output=${video2MPath}" \
      "in=${inputFile},stream=audio,output=${audioPath}" \
      --mpd_output "${outputPath}"`;

      const childProcess = exec(packagerCommand);

      let stderrBuffer = "";
      let stdoutBuffer = "";

      childProcess.stdout?.on("data", (data) => {
        stdoutBuffer += data;
      });

      childProcess.stderr?.on("data", (data) => {
        stderrBuffer += data;
      });

      childProcess.on("close", (code) => {
        if (code !== 0) {
          console.error(
            `Shaka Packager failed with exit code ${code}. stderr: ${stderrBuffer}`
          );
          reject(new Error(`Shaka Packager failed with exit code ${code}`));
        } else {
          resolve();
        }
      });

      childProcess.on("error", (err) => {
        console.error("Error running Shaka Packager:", err);
        reject(err);
      });
    });
  };

  /**
   * Sanitizes a string by removing unsafe characters.
   *
   * @param input - The string to sanitize
   * @returns A sanitized and safe string
   */
  sanitizeString = (input: string) => {
    // Normalize and remove unsafe characters
    let sanitized = input.normalize("NFKC").replace(/[^a-zA-Z0-9._-]/g, "");

    // Prevent empty or hidden strings
    if (!sanitized || sanitized.startsWith(".")) {
      sanitized = "ihearttabletop";
    }

    return sanitized;
  };

  ALLOWED_MIME_TYPES = new Set([
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/gif",
    "image/bmp",
    "image/tiff",
    "image/svg+xml",
    "video/mp4",
    "video/mpeg",
    "video/webm",
    "video/ogg",
    "video/x-msvideo",
    "audio/mpeg",
    "audio/ogg",
    "audio/wav",
    "audio/webm",
    "application/pdf",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "application/vnd.ms-powerpoint",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "text/plain",
  ] as const);

  /**
   * Sanitizes and validates a MIME type against the allowed list.
   *
   * @param mimeType - The MIME type to check
   * @returns A valid MIME type or `null` if invalid
   */
  sanitizeMimeType = (mimeType: string) => {
    // Normalize input by trimming whitespace
    const sanitized = mimeType.trim().toLowerCase();

    // Check if it's in the allowed list
    return this.ALLOWED_MIME_TYPES.has(sanitized as any)
      ? sanitized
      : undefined;
  };
}

export default Utils;
