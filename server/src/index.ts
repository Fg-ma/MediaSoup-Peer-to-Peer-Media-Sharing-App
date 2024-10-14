import express from "express";
import path from "path";
import * as http from "http";
import { Server } from "socket.io";
import cors from "cors";
import { initializeWorkers } from "./lib/workerManager";
import mediasoupSocket from "./lib/mediasoupSocket";

const main = async () => {
  const app = express();
  app.use(cors());

  app.use(express.static(path.join(__dirname, "../client")));

  const server = http.createServer(app);
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
