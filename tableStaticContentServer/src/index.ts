import uWS from "uWebSockets.js";
import { randomFillSync } from "crypto";
import fs from "fs";
import http from "http";
import path from "path";
import busboy from "busboy";
import https from "https";
import socketIo from "socket.io";

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

http
  .createServer((req, res) => {
    if (req.method === "POST") {
      const bb = busboy({ headers: req.headers });

      bb.on("file", (name, file, info) => {
        const saveTo = path.join(uploadsDir, `${random()}`);
        file.pipe(fs.createWriteStream(saveTo));

        file.on("data", (chunk) => {
          console.log(chunk.length);
        });
      });

      bb.on("close", () => {
        res.writeHead(200, { Connection: "close" });
        res.end(`That's all folks!`);
      });
      req.pipe(bb);
      return;
    }
    res.writeHead(404);
    res.end();
  })
  .listen(8045, () => {
    console.log("Listening for requests");
  });

uWS
  .SSLApp(sslOptions) // Use SSLApp for HTTPS server
  .post("/*", (res, req) => {
    const headers = {};
    req.forEach((key, value) => {
      headers[key] = value;
    });

    const bb = busboy({ headers });

    bb.on("file", (name, file, info) => {
      const saveTo = path.join(uploadsDir, `${random()}-${info.filename}`);
      file.pipe(fs.createWriteStream(saveTo));

      file.on("data", (chunk) => {
        console.log(chunk.length);
      });

      file.on("pause", () => {
        console.log("pause");
      });

      file.on("close", () => {
        console.log("close");
      });

      file.on("resume", () => {
        console.log("resume");
      });

      file.on("readable", () => {
        console.log("readable");
      });

      file.on("end", () => {
        console.log(`File ${info.filename} written to ${saveTo}`);
      });

      file.on("error", (err) => {
        console.error(`Error writing file ${info.filename}:`, err);
      });
    });

    bb.on("close", () => {
      console.log("Upload complete");
      res.writeStatus("200 OK").end(`That's all folks!`);
    });

    bb.on("error", (err) => {
      console.error("Busboy error:", err);
      res.writeStatus("500 Internal Server Error").end("File upload failed.");
    });

    res.onData((chunk, isLast) => {
      try {
        const bufferChunk = Buffer.from(chunk);
        bb.write(bufferChunk);

        if (isLast) {
          bb.end();
        }
      } catch (err) {
        console.error("Error processing chunk:", err);
        res
          .writeStatus("500 Internal Server Error")
          .end("Failed to process upload.");
      }
    });

    res.onAborted(() => {
      console.log("Request aborted");
      if (currentFileStream) {
        currentFileStream.destroy();
      }
      bb.destroy();
    });
  })
  .listen(8046, (token) => {
    if (token) {
      console.log("Listening on https://localhost:8046");
    } else {
      console.log("Failed to start the server");
    }
  });

const sslOptions2 = {
  key: fs.readFileSync("../certs/tabletop-table-static-content-server-key.pem"),
  cert: fs.readFileSync("../certs/tabletop-table-static-content-server.pem"),
};

const server = https.createServer(sslOptions2, (req, res) => {
  if (req.method === "POST") {
    const bb = busboy({ headers: req.headers });

    bb.on("file", (name, file, info) => {
      const saveTo = path.join(uploadsDir, `${random()}-${info.filename}`);
      const writeStream = fs.createWriteStream(saveTo);
      file.pipe(writeStream);

      file.on("data", (chunk) => {
        console.log(`Received chunk of size: ${chunk.length}`);
      });

      file.on("end", () => {
        console.log(`File ${info.filename} written to ${saveTo}`);
      });

      file.on("error", (err) => {
        console.error(`Error while receiving file ${info.filename}:`, err);
      });
    });

    bb.on("close", () => {
      res.writeHead(200, { Connection: "close" });
      res.end("Upload complete");
    });

    req.pipe(bb);
  } else {
    res.writeHead(404);
    res.end();
  }
});

// Set up Socket.IO server
const io = socketIo(server);

io.on("connection", (socket) => {
  console.log("A user connected");

  socket.on("uploadFile", (fileData) => {
    console.log("Received file data via Socket.IO");
    const saveTo = path.join(uploadsDir, `${random()}-uploaded-via-socket.mp3`);
    const writeStream = fs.createWriteStream(saveTo);

    writeStream.write(fileData, (err) => {
      if (err) {
        console.error("Error writing to file:", err);
        socket.emit("uploadError", "File upload failed.");
      } else {
        console.log("File uploaded successfully");
        socket.emit("uploadSuccess", "File uploaded successfully.");
      }
    });
  });

  socket.on("disconnect", () => {
    console.log("User disconnected");
  });
});

// Start the server
server.listen(8047, () => {
  console.log("HTTPS server listening on https://localhost:8047");
});
