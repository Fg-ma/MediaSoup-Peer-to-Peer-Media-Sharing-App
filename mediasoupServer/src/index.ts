import uWS from "uWebSockets.js";
import { Buffer } from "buffer";
import { initializeWorkers } from "./lib/workerManager";
import handleMessage from "./lib/websocketMessages";
import { MediasoupWebSocket, SocketData } from "./typeConstant";
import ProducersController from "./lib/ProducersController";
import ConsumersController from "./lib/ConsumersController";
import MuteController from "./lib/MuteController";
import EffectsController from "./lib/EffectsController";
import Tables from "./lib/Tables";
import StatesPermissionsController from "./lib/StatesPermissionsController";
import MetadataController from "./lib/MetadataController";
import Broadcaster from "./lib/Broadcaster";
import MediasoupCleanup from "./lib/MediasoupCleanup";

export const broadcaster = new Broadcaster();
export const mediasoupCleanup = new MediasoupCleanup();
export const tables = new Tables(broadcaster, mediasoupCleanup);
export const producersController = new ProducersController(
  broadcaster,
  mediasoupCleanup
);
export const consumersController = new ConsumersController(
  broadcaster,
  mediasoupCleanup
);
export const muteController = new MuteController(broadcaster);
export const effectsController = new EffectsController(broadcaster);
export const statesPermissionsController = new StatesPermissionsController(
  broadcaster
);
export const metadataController = new MetadataController(broadcaster);

const sslOptions = {
  key_file_name: "../certs/tabletop-mediasoup-server-key.pem",
  cert_file_name: "../certs/tabletop-mediasoup-server.pem",
};

const main = async () => {
  await initializeWorkers();

  uWS
    .SSLApp(sslOptions)
    .ws<SocketData>("/*", {
      message: (ws, message) => {
        const mediasoupWS = ws as MediasoupWebSocket;

        const event = JSON.parse(Buffer.from(message).toString());
        handleMessage(mediasoupWS, event);
      },
      close: (ws) => {
        const mediasoupWS = ws as MediasoupWebSocket;
        const { table_id, username, instance } = mediasoupWS;

        tables.leaveTable(table_id, username, instance);
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
