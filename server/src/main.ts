import express from "express";
import * as http from "http";
import { Server } from "socket.io";
import SocketIOConnection from "./lib/mediasoupSocket";
import cors from "cors";
import { initializeWorkers } from "./lib/workerManager";

const main = async () => {
  const app = express();
  app.use(cors());
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
    SocketIOConnection(io);
  } catch (error) {
    console.error("Error establishing socket connection:", error);
  }

  const port = 8000;

  server.listen(port, () => {
    console.log("Server started on port ", port);
  });
};

export { main };
