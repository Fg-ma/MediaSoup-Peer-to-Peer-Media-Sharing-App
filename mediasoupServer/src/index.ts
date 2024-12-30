import express from "express";
import path from "path";
import * as https from "https";
import fs from "fs";
import { Server } from "socket.io";
import cors from "cors";
import { initializeWorkers } from "./lib/workerManager";
import mediasoupSocket from "./lib/mediasoupSocket";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const main = async () => {
  const app = express();
  app.use(cors());

  app.use(express.static(path.join(__dirname, "../client")));

  // Load SSL/TLS Certificates
  const privateKey = fs.readFileSync(
    "../certs/tabletop-mediasoup-server-key.pem",
    "utf8"
  );
  const certificate = fs.readFileSync(
    "../certs/tabletop-mediasoup-server.pem",
    "utf8"
  );

  const credentials = { key: privateKey, cert: certificate };

  // Create HTTPS server
  const server = https.createServer(credentials, app);

  const io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  try {
    // Initialize workers
    await initializeWorkers();
  } catch (error) {
    console.error("Error initializing workers:", error);
  }

  try {
    // Establish socket connection
    mediasoupSocket(io);
  } catch (error) {
    console.error("Error establishing socket connection:", error);
  }

  const port = 8000;

  server.listen(port, () => {
    console.log("Server started on port ", port);
  });
};

main();
