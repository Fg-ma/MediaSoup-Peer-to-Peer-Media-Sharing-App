import uWS from "uWebSockets.js";
import { Buffer } from "buffer";
import {
  TableWebSocket,
  SocketData,
  tables,
  tablesUserData,
} from "./typeConstant";
import Broadcaster from "./lib/Broadcaster";
import TablesController from "./lib/TablesController";
import handleMessage from "./lib/websocketMessages";
import TableTopMongo from "../../mongoServer/src/TableTopMongo";
import SanitizationUtils from "../../universal/SanitizationUtils";

export const sanitizationUtils = new SanitizationUtils();
export const tableTopMongo = new TableTopMongo();
export const broadcaster = new Broadcaster();
export const tablesController = new TablesController(broadcaster);

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

      if (tablesUserData[tableId] && tablesUserData[tableId][username]) {
        delete tablesUserData[tableId][username];

        if (Object.keys(tablesUserData[tableId]).length === 0) {
          delete tablesUserData[tableId];
        }
      }
    },
  })
  .listen(8043, (token) => {
    if (token) {
      console.log("uWebSockets.js table server listening on port 8043");
    } else {
      console.error("Failed to start server");
    }
  });
