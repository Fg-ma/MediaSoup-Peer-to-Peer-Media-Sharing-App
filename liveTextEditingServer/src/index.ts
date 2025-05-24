import uWS from "uWebSockets.js";
import { Buffer } from "buffer";
import { TableWebSocket, SocketData, tables } from "./typeConstant";
import Broadcaster from "./lib/Broadcaster";
import LiveTextEditingController from "./lib/LiveTextEditingController";
import handleMessage from "./lib/websocketMessages";
import TableTopMongo from "../../mongoServer/src/TableTopMongo";
import TableTopRedis from "../../redisServer/src/TableTopRedis";

export const tableTopRedis = new TableTopRedis();
export const tableTopMongo = new TableTopMongo();
export const broadcaster = new Broadcaster();
export const liveTextEditingController = new LiveTextEditingController(
  broadcaster
);

const sslOptions = {
  key_file_name: "../certs/tabletop-table-server-key.pem",
  cert_file_name: "../certs/tabletop-table-server.pem",
};

uWS
  .SSLApp(sslOptions)
  .ws<SocketData>("/*", {
    message: (ws, message) => {
      const tableWS = ws as TableWebSocket;

      try {
        const msg = JSON.parse(Buffer.from(message).toString());
        handleMessage(tableWS, msg);
      } catch (error) {
        console.error("Failed to parse message:", error);
      }
    },

    close: (ws) => {
      const tableWS = ws as TableWebSocket;
      const { tableId, username, instance } = tableWS;

      if (
        tables[tableId] &&
        tables[tableId][username] &&
        tables[tableId][username][instance]
      ) {
        delete tables[tableId][username][instance];

        if (Object.keys(tables[tableId][username]).length === 0) {
          delete tables[tableId][username];

          if (Object.keys(tables[tableId]).length === 0) {
            delete tables[tableId];
          }
        }
      }
    },
  })
  .listen(8093, (token) => {
    if (token) {
      console.log(
        "uWebSockets.js live text editing server listening on port 8093"
      );
    } else {
      console.error("Failed to start server");
    }
  });
