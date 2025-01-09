import uWS from "uWebSockets.js";
import { randomFillSync } from "crypto";
import fs from "fs";
import path from "path";
import busboy from "busboy";
import { exec } from "child_process";
import {
  MessageTypes,
  tables,
  TableStaticContentWebSocket,
} from "./typeConstant";
import Broadcaster from "./lib/Broadcaster";
import TablesController from "./lib/TablesController";

const broadcaster = new Broadcaster();
const tablesController = new TablesController(broadcaster);

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
      const tableWS = ws as TableStaticContentWebSocket;

      try {
        const msg = JSON.parse(Buffer.from(message).toString());
        handleMessage(tableWS, msg);
      } catch (error) {
        console.error("Failed to parse message:", error);
      }
    },

    close: (ws) => {
      const tableWS = ws as TableStaticContentWebSocket;
      const { table_id, username, instance } = tableWS;

      if (
        tables[table_id] &&
        tables[table_id][username] &&
        tables[table_id][username][instance]
      ) {
        delete tables[table_id][username][instance];

        if (Object.keys(tables[table_id][username]).length === 0) {
          delete tables[table_id][username];

          if (Object.keys(tables[table_id]).length === 0) {
            delete tables[table_id];
          }
        }
      }
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
  .get("/processed/*", (res, req) => {
    const requestedFile = req.getUrl().substring("/processed/".length);
    const filePath = path.join(processedDir, requestedFile);

    res.cork(() => {
      res.writeHeader("Access-Control-Allow-Origin", "https://localhost:8080");
      res.writeHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
      res.writeHeader("Access-Control-Allow-Headers", "Content-Type");
    });

    if (fs.existsSync(filePath)) {
      const fileStream = fs.createReadStream(filePath);
      res.writeHeader("Content-Type", "application/dash+xml"); // Set for .mpd files

      fileStream.on("data", (chunk) => res.write(chunk));
      fileStream.on("end", () => res.end());
      fileStream.on("error", (err) => {
        console.error("Error reading file:", err);
        res.writeStatus("500 Internal Server Error").end("Error reading file.");
      });
    } else {
      res.writeStatus("404 Not Found").end("File not found.");
    }
  })
  .post("/upload/*", (res, req) => {
    const url = req.getUrl();
    const table_id = url.split("/")[2];
    const videoId = url.split("/")[3];

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
      const saveTo = path.join(uploadsDir, filename);
      const writeStream = fs.createWriteStream(saveTo);

      file.on("data", (chunk) => {});

      file.pipe(writeStream);

      file.on("end", async () => {
        // Notify clients that the original file is ready
        const originalVideoUrl = `https://localhost:8044/uploads/${filename}`;
        const originalVideoMessage = {
          type: "originalVideoReady",
          header: {
            videoId,
          },
          data: {
            filename,
            url: originalVideoUrl,
          },
        };

        broadcaster.broadcastToTable(table_id, originalVideoMessage);

        // Process video into DASH format in the background
        try {
          await processVideoWithABR(saveTo, processedDir, filename);

          // Notify clients to switch to the DASH stream
          const dashVideoUrl = `https://localhost:8044/processed/${filename.slice(
            0,
            -4
          )}.mpd`;
          const dashVideoMessage = {
            type: "dashVideoReady",
            header: {
              videoId,
            },
            data: {
              filename,
              url: dashVideoUrl,
            },
          };

          broadcaster.broadcastToTable(table_id, dashVideoMessage);
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
  .listen(8045, (token) => {
    if (token) {
      console.log("Listening on https://localhost:8045");
    }
  });

const handleMessage = (
  ws: TableStaticContentWebSocket,
  event: MessageTypes
) => {
  switch (event.type) {
    case "joinTable":
      tablesController.onJoinTable(ws, event);
      break;
    case "leaveTable":
      tablesController.onLeaveTable(event);
      break;
    default:
      break;
  }
};
