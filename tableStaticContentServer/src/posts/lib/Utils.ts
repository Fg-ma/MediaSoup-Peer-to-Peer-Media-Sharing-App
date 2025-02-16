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

  sanitizeFilename = (filename: string) => {
    const baseName = path.basename(filename);

    let sanitized = baseName.replace(/[^a-zA-Z0-9._-]/g, "_");

    if (sanitized.length > 255) {
      sanitized = sanitized.substring(0, 255);
    }

    return sanitized;
  };
}

export default Utils;
