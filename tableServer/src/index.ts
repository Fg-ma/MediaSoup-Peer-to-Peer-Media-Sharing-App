import uWS from "uWebSockets.js";
import { Buffer } from "buffer";
import {
  TableWebSocket,
  MessageTypes,
  SocketData,
  tables,
} from "./typeConstant";
import Broadcaster from "./lib/Broadcaster";
import TablesController from "./lib/TablesController";

const broadcaster = new Broadcaster();
const tablesController = new TablesController(broadcaster);

uWS
  .App()
  .ws<SocketData>("/*", {
    message: (ws, message, _isBinary) => {
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
    },
  })
  .listen(8043, (token) => {
    if (token) {
      console.log("uWebSockets.js table server listening on port 8043");
    } else {
      console.error("Failed to start server");
    }
  });

const handleMessage = (ws: TableWebSocket, event: MessageTypes) => {
  switch (event.type) {
    case "joinTable":
      tablesController.onJoinTable(ws, event);
      break;
    case "leaveTable":
      tablesController.onLeaveTable(event);
      break;
    case "changeTableBackground":
      tablesController.onChangeTableBackgroundType(event);
      break;
    default:
      break;
  }
};
