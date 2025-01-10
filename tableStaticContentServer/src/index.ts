import uWS from "uWebSockets.js";
import { tables, TableStaticContentWebSocket } from "./typeConstant";
import Broadcaster from "./lib/Broadcaster";
import handlePosts from "./lib/posts";
import handleGets from "./lib/gets";
import handleMessage from "./lib/websocketMessages";
import TablesController from "./lib/TablesController";
import MetadataController from "./lib/MetadataController";
import TableContentController from "./lib/TableContentController";

export const broadcaster = new Broadcaster();
export const tablesController = new TablesController(broadcaster);
export const metadataController = new MetadataController(broadcaster);
export const tableContentController = new TableContentController();

const sslOptions = {
  key_file_name: "../certs/tabletop-table-static-content-server-key.pem",
  cert_file_name: "../certs/tabletop-table-static-content-server.pem",
};

const app = uWS.SSLApp(sslOptions);

app
  .ws("/*", {
    compression: uWS.SHARED_COMPRESSOR,
    maxPayloadLength: 16 * 1024 * 1024, // 16 MB
    idleTimeout: 60,
    message: (ws, message) => {
      const tableWS = ws as TableStaticContentWebSocket;

      try {
        const msg = JSON.parse(Buffer.from(message).toString());
        handleMessage(tableWS, msg);
      } catch (error) {
        console.error("Failed to parse message:", error);
      }
    },

    close: (ws) => {
      const tableWS = ws as TableStaticContentWebSocket;
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
  .options("/*", (res, req) => {
    res.cork(() => {
      res
        .writeHeader("Access-Control-Allow-Origin", "https://localhost:8080")
        .writeHeader("Access-Control-Allow-Methods", "POST, OPTIONS")
        .writeHeader("Access-Control-Allow-Headers", "Content-Type")
        .writeStatus("204 No Content")
        .end();
    });
  })
  .listen(8045, (token) => {
    if (token) {
      console.log("Listening on https://localhost:8045");
    }
  });

handlePosts(app);
handleGets(app);
