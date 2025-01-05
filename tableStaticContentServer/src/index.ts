import uWS from "uWebSockets.js";
import { randomFillSync } from "crypto";
import fs from "fs";
import path from "path";
import busboy from "busboy";
import { exec } from "child_process"; // For running shell commands (to invoke Shaka Packager)

// Ensure the uploads folder exists
const uploadsDir = path.join(__dirname, "../../nginxServer/uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Ensure the output folder for processed videos exists
const processedDir = path.join(__dirname, "../../nginxServer/processed");
if (!fs.existsSync(processedDir)) {
  fs.mkdirSync(processedDir, { recursive: true });
}

const sslOptions = {
  key_file_name: "../certs/tabletop-table-static-content-server-key.pem",
  cert_file_name: "../certs/tabletop-table-static-content-server.pem",
};

const random = (() => {
  const buf = Buffer.alloc(16);
  return () => randomFillSync(buf).toString("hex");
})();

const connectedClients = new Set<uWS.WebSocket<unknown>>(); // Store WebSocket clients

// Function to process the uploaded video using Shaka Packager
const processVideoWithABR = (
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

uWS
  .SSLApp(sslOptions)
  .ws("/*", {
    compression: uWS.SHARED_COMPRESSOR,
    maxPayloadLength: 16 * 1024 * 1024, // 16 MB
    idleTimeout: 60,
    message: (ws, message) => {
            try {
        const msg = JSON.parse(Buffer.from(message).toString());
       if (msg.type === "")
      } catch (error) {
        console.error("Failed to parse message:", error);
      }
    },

    open: (ws) => {
      connectedClients.add(ws);
      console.log("WebSocket client connected");
    },
    close: (ws) => {
      connectedClients.delete(ws);
      console.log("WebSocket client disconnected");
    },
  })
  .options("/*", (res, req) => {
    res.cork(() => {
      res
        .writeHeader("Access-Control-Allow-Origin", "https://localhost:8080")
        .writeHeader("Access-Control-Allow-Methods", "POST, OPTIONS")
        .writeHeader("Access-Control-Allow-Headers", "Content-Type")
        .writeStatus("204 No Content")
        .end();
    });
  })
  .post("/*", (res, req) => {
    res.cork(() => {
      res.writeHeader("Access-Control-Allow-Origin", "https://localhost:8080");
    });

    const headers: { [header: string]: string } = {};
    req.forEach((key, value) => {
      headers[key] = value;
    });

    const bb = busboy({ headers });

    bb.on("file", (name, file, info) => {
      const filename = `${random()}.mp4`;
      const originalVideoUrl = `https://localhost:8044/uploads/${filename}`;
      const saveTo = path.join(uploadsDir, filename);
      const writeStream = fs.createWriteStream(saveTo);

      file.pipe(writeStream);

      setTimeout(() => {
        // Notify clients that the original file is ready
        const originalVideoMessage = JSON.stringify({
          type: "fileStartedUploading",
          filename: filename,
        });

        connectedClients.forEach((client) => {
          client.send(originalVideoMessage, false);
        });
      }, 2000);

      file.on("end", async () => {
        // Notify clients that the original file is ready
        const originalVideoMessage = JSON.stringify({
          type: "originalVideoReady",
          filename: filename,
          url: originalVideoUrl,
        });

        connectedClients.forEach((client) => {
          client.send(originalVideoMessage, false);
        });

        // Process video into DASH format in the background
        try {
          await processVideoWithABR(saveTo, processedDir, filename);

          // Notify clients to switch to the DASH stream
          const dashVideoUrl = `https://localhost:8044/processed/${filename.slice(
            0,
            -4
          )}.mpd`;
          const dashVideoMessage = JSON.stringify({
            type: "dashVideoReady",
            filename: filename,
            url: dashVideoUrl,
          });

          connectedClients.forEach((client) => {
            client.send(dashVideoMessage, false);
          });
        } catch (error) {
          console.error("Error during video processing:", error);
        }
      });
      file.on("error", (err) => {
        console.error(`Error writing file ${info.filename}:`, err);
      });
    });

    bb.on("close", () => {
      res.cork(() => {
        console.log("Upload complete");
        res.writeStatus("200 OK").end("That's all folks!");
      });
    });

    let bodyBuffer = Buffer.alloc(0);

    res.onData((chunk, isLast) => {
      bodyBuffer = Buffer.concat([bodyBuffer, Buffer.from(chunk)]);

      if (isLast) {
        bb.end(bodyBuffer);
      } else {
        bb.write(bodyBuffer);
        bodyBuffer = Buffer.alloc(0);
      }
    });

    res.onAborted(() => {
      console.log("Request aborted");
      bb.destroy();
    });
  })
  .get("/video/:filename", (res, req) => {
    const filename = req.getParameter(0);
    if (!filename) return;
    const filePath = path.join(uploadsDir, filename);
    const range = req.getHeader("Range");
    console.log("Received Range:", range);
    if (range) {
      const [start, end] = range
        .replace("bytes=", "")
        .split("-")
        .map((val) => parseInt(val, 10));

      const fileStream = fs.createReadStream(filePath, { start, end });

      res.writeStatus("206 Partial Content");
      res.writeHeader(
        "Content-Range",
        `bytes ${start}-${end}/${fileBuffer.length}`
      );
      fileStream.pipe(res);
    } else {
      // Serve the whole file if no range is requested
      const fileStream = fs.createReadStream(filePath);
      fileStream.pipe(res);
    }
  })
  .listen(8045, (token) => {
    if (token) {
      console.log("Listening on https://localhost:8045");
    } else {
      console.log("Failed to start the server");
    }
  });
