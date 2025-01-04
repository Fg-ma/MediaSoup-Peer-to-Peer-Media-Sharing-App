import uWS from "uWebSockets.js";
import { randomFillSync } from "crypto";
import fs from "fs";
import path from "path";
import busboy from "busboy";

// Ensure the uploads folder exists
const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
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

uWS
  .SSLApp(sslOptions)
  .ws("/*", {
    compression: uWS.SHARED_COMPRESSOR,
    maxPayloadLength: 16 * 1024 * 1024, // 16 MB
    idleTimeout: 60,
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
      const startMessage = JSON.stringify({
        type: "fileStart",
        filename: info.filename,
      });
      connectedClients.forEach((client) => {
        client.send(startMessage, false);
      });

      const saveTo = path.join(uploadsDir, `${random()}-${info.filename}`);
      const writeStream = fs.createWriteStream(saveTo);

      file.on("data", (chunk) => {
        connectedClients.forEach((client) => {
          client.send(chunk, true); // Send chunk as binary
        });
      });

      file.pipe(writeStream);

      file.on("end", () => {
        const completionMessage = JSON.stringify({ type: "fileEnd" });
        connectedClients.forEach((client) => {
          client.send(completionMessage, false);
        });
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
    } else {
      console.log("Failed to start the server");
    }
  });
