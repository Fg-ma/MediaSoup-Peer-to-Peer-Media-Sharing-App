import uWS from "uWebSockets.js";
import {
  TableWebSocket,
  SocketData,
  tables,
  MessageTypes,
} from "./typeConstant";
import Broadcaster from "./lib/Broadcaster";
import LiveTextEditingController from "./lib/LiveTextEditingController";
import handleMessage from "./lib/websocketMessages";
import TableTopMongo from "../../mongoServer/src/TableTopMongo";
import TableTopRedis from "../../redisServer/src/TableTopRedis";
import TableTopCeph from "../../cephServer/src/TableTopCeph";
import Gets from "./gets/Gets";
import SanitizationUtils from "../../universal/SanitizationUtils";

export const sanitizationUtils = new SanitizationUtils();
export const tableTopRedis = new TableTopRedis();
export const tableTopMongo = new TableTopMongo();
export const tableTopCeph = new TableTopCeph();
export const broadcaster = new Broadcaster();
export const gets = new Gets(broadcaster);
export const liveTextEditingController = new LiveTextEditingController(
  broadcaster
);

const sslOptions = {
  key_file_name: "../certs/tabletop-table-server-key.pem",
  cert_file_name: "../certs/tabletop-table-server.pem",
};

export const DEAD_TEXT_TTL = 60 * 5;
export const REDIS_INITIAL_CHUNK_SIZE = 0.25 * 1024 * 1024;

uWS
  .SSLApp(sslOptions)
  .ws<SocketData>("/*", {
    message: (ws, message) => {
      const tableWS = ws as TableWebSocket;

      const buf = new Uint8Array(message);
      const prefix = buf[0];

      let msg: MessageTypes | undefined = undefined;

      try {
        if (prefix === 0x00) {
          const jsonStr = new TextDecoder().decode(buf.subarray(1));
          msg = JSON.parse(jsonStr);
        } else if (prefix === 0x01) {
          const view = new DataView(buf.buffer, buf.byteOffset);

          // 1) Read first 4 bytes for JSON length
          const headerLen = view.getUint32(1, true);

          // 2) Slice out the JSON header
          const headerBytes = buf.subarray(5, 5 + headerLen);
          const headerText = new TextDecoder().decode(headerBytes);
          const header = JSON.parse(headerText);

          // 3) The rest of file chunk
          const fileBuffer = buf.subarray(5 + headerLen);

          switch (header.type) {
            case "docUpdate":
              msg = {
                type: header.type,
                header: {
                  tableId: header.header.tableId as string,
                  contentId: header.header.contentId as string,
                  instanceId: header.header.instanceId as string,
                },
                data: {
                  payload: fileBuffer,
                },
              };
              break;
            default:
              return;
          }
        }

        if (msg) handleMessage(tableWS, msg);
      } catch (error) {
        console.error("Failed to parse message:", error);
      }
    },

    close: async (ws) => {
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

            const tableKeys = await tableTopRedis.gets.scanAllKeys(
              `LTE:${tableId}:*:*`
            );

            const promises = [];
            for (const key of tableKeys) {
              promises.push(tableTopRedis.posts.expire(key, DEAD_TEXT_TTL));
            }
            await Promise.all(promises);
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
