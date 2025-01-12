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
      const { table_id, username, instance } = tableWS;

      if (
        tables[table_id] &&
        tables[table_id][username] &&
        tables[table_id][username][instance]
      ) {
        delete tables[table_id][username][instance];

        if (Object.keys(tables[table_id][username]).length === 0) {
          delete tables[table_id][username];

          if (Object.keys(tables[table_id]).length === 0) {
            delete tables[table_id];
          }
        }
      }

      if (tablesUserData[table_id] && tablesUserData[table_id][username]) {
        delete tablesUserData[table_id][username];

        if (Object.keys(tablesUserData[table_id]).length === 0) {
          delete tablesUserData[table_id];
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
