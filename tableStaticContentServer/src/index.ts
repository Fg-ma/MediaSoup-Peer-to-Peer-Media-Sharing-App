import dotenv from "dotenv";
import path from "path";
import uWS from "uWebSockets.js";
import { tables, TableStaticContentWebSocket } from "./typeConstant";
import Broadcaster from "./lib/Broadcaster";
import handleMessage from "./lib/websocketMessages";
import TablesController from "./lib/TablesController";
import MetadataController from "./lib/MetadataController";
import Cleanup from "./lib/Cleanup";
import Gets from "./gets/Gets";
import Posts from "./posts/posts";
import TableTopMongo from "../../mongoServer/src/TableTopMongo";
import TableTopCeph from "../../cephServer/src/TableTopCeph";
import Search from "./lib/Search";

dotenv.config({
  path: path.resolve(__dirname, "../../.env"),
});
export const clientBaseUrl = process.env.CLIENT_BASE_URL;

export const tableTopCeph = new TableTopCeph();
export const tableTopMongo = new TableTopMongo();
export const broadcaster = new Broadcaster();
export const search = new Search(broadcaster);
export const tablesController = new TablesController(broadcaster);
export const metadataController = new MetadataController(broadcaster);
export const gets = new Gets(broadcaster);
export const cleanup = new Cleanup(broadcaster);

// tableTopCeph.deletes.emptyBucket("table-svgs");
// tableTopCeph.deletes.emptyBucket("table-images");
// tableTopCeph.deletes.emptyBucket("table-videos");
// tableTopCeph.deletes.emptyBucket("table-applications");
// tableTopCeph.deletes.emptyBucket("table-text");
// tableTopCeph.gets.listBucketContents("table-svgs");
// tableTopCeph.gets.listBucketContents("table-videos");
// tableTopCeph.gets.listBucketContents("table-images");
// tableTopCeph.gets.listBucketContents("table-applications");
// tableTopCeph.gets.listBucketContents("table-text");
// tableTopCeph.deletes.emptyBucket("user-svgs");
// tableTopCeph.deletes.emptyBucket("user-images");
// tableTopCeph.deletes.emptyBucket("user-videos");
// tableTopCeph.deletes.emptyBucket("user-applications");
// tableTopCeph.deletes.emptyBucket("user-text");
// tableTopCeph.gets.listBucketContents("user-svgs");
// tableTopCeph.gets.listBucketContents("user-videos");
// tableTopCeph.gets.listBucketContents("user-images");
// tableTopCeph.gets.listBucketContents("user-applications");
// tableTopCeph.gets.listBucketContents("user-text");

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
  .options("/*", (res, _req) => {
    if (!clientBaseUrl) {
      res.cork(() => {
        res.writeStatus("403 Forbidden");
        res.writeHeader("Content-Type", "text/plain");
        res.end("Origin header missing - request blocked");
      });
    } else {
      res.cork(() => {
        res
          .writeHeader("Access-Control-Allow-Origin", clientBaseUrl)
          .writeHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
          .writeHeader("Access-Control-Allow-Headers", "Content-Type")
          .end();
      });
    }
  })
  .listen(8045, (token) => {
    if (token) {
      console.log("Listening on https://localhost:8045");
    }
  });

export const posts = new Posts(app);
