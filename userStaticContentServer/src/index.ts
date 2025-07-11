import uWS from "uWebSockets.js";
import dotenv from "dotenv";
import path from "path";
import { userConnections, UserStaticContentWebSocket } from "./typeConstant";
import Broadcaster from "./lib/Broadcaster";
import handleMessage from "./lib/websocketMessages";
import TablesController from "./lib/TablesController";
import MetadataController from "./lib/MetadataController";
import Cleanup from "./lib/Cleanup";
import Gets from "./gets/Gets";
import Posts from "./posts/Posts";
import TableTopMongo from "../../mongoServer/src/TableTopMongo";
import TableTopCeph from "../../cephServer/src/TableTopCeph";
import TableTopRedis from "../../redisServer/src/TableTopRedis";
import Search from "./lib/Search";
import SanitizationUtils from "../../universal/SanitizationUtils";

dotenv.config({
  path: path.resolve(__dirname, "../../.env"),
});
export const clientBaseUrl = process.env.CLIENT_BASE_URL;

export const sanitizationUtils = new SanitizationUtils();
export const tableTopRedis = new TableTopRedis();
export const tableTopCeph = new TableTopCeph();
export const tableTopMongo = new TableTopMongo();
export const broadcaster = new Broadcaster();
export const search = new Search(broadcaster);
export const tablesController = new TablesController();
export const metadataController = new MetadataController(broadcaster);
export const gets = new Gets(broadcaster);
export const cleanup = new Cleanup();

const SOCKET_MAX_PAYLOAD = 16 * 1024 * 1024;
export const CEPH_CHUNK_MAX_SIZE = 1024 * 1024 * 10;
export const CEPH_MAX_SIZE = 1024 * 1024 * 1024;

// tableTopCeph.emptyBucket("user-svgs");
// tableTopCeph.emptyBucket("user-images");
// tableTopCeph.listBucketContents("user-svgs");

const sslOptions = {
  key_file_name: "../certs/tabletop-user-static-content-server-key.pem",
  cert_file_name: "../certs/tabletop-user-static-content-server.pem",
  dh_params_file_name:
    "../certs/tabletop-user-static-content-server-dhparam.pem",
  ssl_prefer_server_ciphers: true,
  ssl_options: ["NO_SSLv3", "NO_TLSv1", "NO_TLSv1_1"],
};

const app = uWS.SSLApp(sslOptions);

app
  .ws("/*", {
    compression: uWS.SHARED_COMPRESSOR,
    maxPayloadLength: SOCKET_MAX_PAYLOAD,
    idleTimeout: 60,
    message: (ws, message) => {
      const tableWS = ws as UserStaticContentWebSocket;

      try {
        const msg = JSON.parse(Buffer.from(message).toString());
        handleMessage(tableWS, msg);
      } catch (error) {
        console.error("Failed to parse message:", error);
      }
    },

    close: (ws) => {
      const tableWS = ws as UserStaticContentWebSocket;
      const { userId, instance } = tableWS;

      if (userConnections[userId] && userConnections[userId][instance]) {
        delete userConnections[userId][instance];

        if (Object.keys(userConnections[userId]).length === 0) {
          delete userConnections[userId];
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
  .listen("127.0.0.1", 8049, (token) => {
    if (token) {
      console.log("Listening on https://localhost:8049");
    }
  });

export const posts = new Posts(app);
