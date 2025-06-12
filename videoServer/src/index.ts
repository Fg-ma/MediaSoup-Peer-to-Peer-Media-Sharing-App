import dotenv from "dotenv";
import path from "path";
import uWS from "uWebSockets.js";
import { tables, VideoWebSocket } from "./typeConstant";
import Broadcaster from "./lib/Broadcaster";
import handleMessage from "./lib/websocketMessages";
import TablesController from "./lib/TablesController";
import MetadataController from "./lib/MetadataController";
import Gets from "./gets/Gets";
import Posts from "./posts/Posts";
import TableTopMongo from "../../mongoServer/src/TableTopMongo";
import TableTopCeph from "../../cephServer/src/TableTopCeph";
import TableTopRedis from "../../redisServer/src/TableTopRedis";
import "./posts/lib/videoTranscodeQueue.worker.ts";
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
export const tablesController = new TablesController(broadcaster);
export const metadataController = new MetadataController(broadcaster);

const SOCKET_MAX_PAYLOAD = 16 * 1024 * 1024;
export const CEPH_CHUNK_MAX_SIZE = 1024 * 1024 * 16;
export const CEPH_MAX_SIZE = 1024 * 1024 * 100;

// tableTopCeph.deletes.emptyBucket("table-svgs");
// tableTopCeph.deletes.emptyBucket("table-images");
// tableTopCeph.deletes.emptyBucket("table-videos");
// tableTopCeph.deletes.emptyBucket("table-applications");
// tableTopCeph.deletes.emptyBucket("table-text");
// tableTopCeph.deletes.abortAllMultipartUploads("table-svgs");
// tableTopCeph.deletes.abortAllMultipartUploads("table-images");
// tableTopCeph.deletes.abortAllMultipartUploads("table-videos");
// tableTopCeph.deletes.abortAllMultipartUploads("table-applications");
// tableTopCeph.deletes.abortAllMultipartUploads("table-text");
// tableTopCeph.gets.listAllMultipartUploads("table-svgs");
// tableTopCeph.gets.listAllMultipartUploads("table-images");
// tableTopCeph.gets.listAllMultipartUploads("table-videos");
// tableTopCeph.gets.listAllMultipartUploads("table-applications");
// tableTopCeph.gets.listAllMultipartUploads("table-text");
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
  key_file_name: "../certs/tabletop-video-server-key.pem",
  cert_file_name: "../certs/tabletop-video-server.pem",
};

const app = uWS.SSLApp(sslOptions);

app
  .ws("/*", {
    compression: uWS.SHARED_COMPRESSOR,
    maxPayloadLength: SOCKET_MAX_PAYLOAD,
    idleTimeout: 60,
    message: (ws, message) => {
      const tableWS = ws as VideoWebSocket;

      try {
        const msg = JSON.parse(Buffer.from(message).toString());
        handleMessage(tableWS, msg);
      } catch (error) {
        console.error("Failed to parse message:", error);
      }
    },

    close: async (ws) => {
      const tableWS = ws as VideoWebSocket;
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
              `VVM:${tableId}:*:*`
            );

            const tableValues = await tableTopRedis.gets.mget(tableKeys);

            const results: Record<string, string | null> = tableKeys.reduce(
              (acc, key, index) => {
                acc[key] = tableValues[index];
                return acc;
              },
              {} as Record<string, string | null>
            );

            await tableTopRedis.deletes.deleteKeys(tableKeys);

            await Promise.all(
              Object.entries(results).map(async ([key, val]) => {
                if (!val) return;

                const [, , videoId, instanceId] = key.split(":");
                const meta = JSON.parse(val) as {
                  isPlaying: boolean;
                  lastKnownPosition: number;
                  videoPlaybackSpeed: number;
                  ended: boolean;
                  lastUpdatedAt: number;
                };

                await tableTopMongo.tableVideos?.uploads.editMetaData(
                  { tableId, videoId },
                  {
                    instances: [
                      {
                        videoInstanceId: instanceId,
                        meta: {
                          isPlaying: false,
                          lastKnownPosition:
                            (meta.isPlaying
                              ? ((Date.now() - meta.lastUpdatedAt) / 1000) *
                                meta.videoPlaybackSpeed
                              : 0) + meta.lastKnownPosition,
                          videoPlaybackSpeed: meta.videoPlaybackSpeed,
                          ended: true,
                        },
                      },
                    ],
                  }
                );
              })
            );
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
  });

export const posts = new Posts(app, broadcaster);
export const gets = new Gets(app);

app.listen(8099, (token) => {
  if (token) {
    console.log("Listening on https://localhost:8099");
  }
});
