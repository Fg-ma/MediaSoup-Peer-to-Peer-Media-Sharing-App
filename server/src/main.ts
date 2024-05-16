import express from "express";
import * as http from "http";
import { Server } from "socket.io";
import SocketIOConnection from "./lib/mediasoupSocket";
import cors from "cors";

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

  SocketIOConnection(io);

  const port = 8000;

  server.listen(port, () => {
    console.log("Server started on port ", port);
  });
};

export { main };
