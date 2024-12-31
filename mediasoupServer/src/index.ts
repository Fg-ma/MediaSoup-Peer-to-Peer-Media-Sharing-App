import uWS from "uWebSockets.js";
import { Buffer } from "buffer";
import { initializeWorkers } from "./lib/workerManager";
import mediasoupSocket, { leaveTable } from "./mediasoupSocket";
import { MediasoupWebSocket, SocketData } from "./typeConstant";

const main = async () => {
  try {
    // Initialize workers
    await initializeWorkers();
  } catch (error) {
    console.error("Error initializing workers:", error);
  }

  const sslOptions = {
    key_file_name: "../certs/tabletop-mediasoup-server-key.pem",
    cert_file_name: "../certs/tabletop-mediasoup-server.pem",
  };

  // Create uWebSocket server
  uWS
    .SSLApp(sslOptions)
    .ws<SocketData>("/*", {
      message: (ws, message) => {
        const mediasoupWS = ws as MediasoupWebSocket;

        const event = JSON.parse(Buffer.from(message).toString());
        mediasoupSocket(mediasoupWS, event);
      },
      close: (ws) => {
        const mediasoupWS = ws as MediasoupWebSocket;
        const { table_id, username, instance } = mediasoupWS;

        leaveTable(table_id, username, instance);
      },
    })
    .listen(8000, (token) => {
      if (token) {
        console.log("Server started on port 8000");
      } else {
        console.error("Server failed to start");
      }
    });
};

main();
