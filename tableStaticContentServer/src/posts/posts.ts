import uWS from "uWebSockets.js";
import busboy from "busboy";
import {
  broadcaster,
  tableContentController,
  tableTopCeph,
  tableTopMongo,
} from "../index";
import Utils from "./lib/Utils";
import { TableTopStaticMimeType } from "src/typeConstant";

const utils = new Utils();

const handlePosts = (app: uWS.TemplatedApp) => {
  app.post("/upload/*", (res, req) => {
    const url = req.getUrl();
    const table_id = url.split("/")[2];
    const contentId = url.split("/")[3];

    res.cork(() => {
      res.writeHeader("Access-Control-Allow-Origin", "https://localhost:8080");
    });

    const headers: { [header: string]: string } = {};
    req.forEach((key, value) => {
      headers[key] = value;
    });

    const bb = busboy({ headers });

    bb.on("file", (name, file, info) => {
      const { mimeType } = info;

      // Map MIME types to file extensions
      const mimeToExtension: { [key: string]: string } = {
        "image/jpeg": ".jpg",
        "image/png": ".png",
        "image/webp": ".webp",
        "video/mp4": ".mp4",
        "video/mpeg": ".mpeg",
        "image/gif": ".gif",
        "application/pdf": ".pdf",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
          ".docx",
      };

      const extension = mimeToExtension[mimeType] || ".bin";
      const filename = `${utils.random()}${extension}`;

      tableTopCeph.uploadFile("mybucket", filename, file).then(async () => {
        const url = `https://localhost:8045/stream/${filename}`;

        // Differentiate handling based on file type
        if (mimeType.startsWith("video/")) {
          tableContentController.setContent(table_id, "video", contentId, [
            { property: "url", value: url },
            { property: "mimeType", value: mimeType as TableTopStaticMimeType },
          ]);

          await tableTopMongo.tableVideos?.uploads.uploadMetaData({
            table_id,
            videoId: contentId,
            positioning: {
              position: {
                left: 50,
                top: 50,
              },
              scale: {
                x: 25,
                y: 25,
              },
              rotation: 0,
            },
            effects: {
              postProcess: false,
              hideBackground: false,
              blur: false,
              tint: false,
              glasses: false,
              beards: false,
              mustaches: false,
              masks: false,
              hats: false,
              pets: false,
            },
            effectStyles: {
              postProcess: {
                style: "prismaColors",
              },
              hideBackground: {
                style: "beach",
                color: "#d40213",
              },
              glasses: {
                style: "defaultGlasses",
              },
              beards: {
                style: "classicalCurlyBeard",
              },
              mustaches: {
                style: "mustache1",
              },
              masks: {
                style: "baseMask",
              },
              hats: {
                style: "stylishHat",
              },
              pets: {
                style: "beardedDragon",
              },
            },
          });

          const originalVideoMessage = {
            type: "originalVideoReady",
            header: {
              videoId: contentId,
            },
            data: {
              filename,
              url,
              mimeType,
            },
          };
          broadcaster.broadcastToTable(table_id, originalVideoMessage);

          // Process video into DASH format in the background
          // try {
          //   // await processVideoWithABR(saveTo, processedDir, filename);

          //   // Notify clients to switch to the DASH stream
          //   const dashVideoUrl = `https://localhost:8045/processed/${filename.slice(
          //     0,
          //     -4
          //   )}.mpd`;

          //   tableContentController.setContent(table_id, "video", contentId, [
          //     { property: "dashURL", value: dashVideoUrl },
          //   ]);

          //   const dashVideoMessage = {
          //     type: "dashVideoReady",
          //     header: {
          //       videoId: contentId,
          //     },
          //     data: {
          //       filename,
          //       url: dashVideoUrl,
          //     },
          //   };
          //   broadcaster.broadcastToTable(table_id, dashVideoMessage);
          // } catch (error) {
          //   console.error("Error during video processing:", error);
          // }
        } else if (mimeType.startsWith("image/")) {
          await tableTopMongo.tableImages?.uploads.uploadMetaData({
            table_id,
            imageId: contentId,
            positioning: {
              position: {
                left: 50,
                top: 50,
              },
              scale: {
                x: 25,
                y: 25,
              },
              rotation: 0,
            },
            effects: {
              postProcess: false,
              hideBackground: false,
              blur: false,
              tint: false,
              glasses: false,
              beards: false,
              mustaches: false,
              masks: false,
              hats: false,
              pets: false,
            },
            effectStyles: {
              postProcess: {
                style: "prismaColors",
              },
              hideBackground: {
                style: "beach",
                color: "#d40213",
              },
              glasses: {
                style: "defaultGlasses",
              },
              beards: {
                style: "classicalCurlyBeard",
              },
              mustaches: {
                style: "mustache1",
              },
              masks: {
                style: "baseMask",
              },
              hats: {
                style: "stylishHat",
              },
              pets: {
                style: "beardedDragon",
              },
            },
          });

          tableContentController.setContent(table_id, "image", contentId, [
            { property: "url", value: url },
            { property: "mimeType", value: mimeType as TableTopStaticMimeType },
          ]);

          broadcaster.broadcastToTable(table_id, {
            type: "imageReady",
            header: { contentId },
            data: { filename: filename, url, mimeType },
          });
        } else {
          console.warn(`Unsupported file type uploaded: ${mimeType}`);
        }
      });

      file.on("error", (err) => {
        console.error(`Error writing file ${info.filename}:`, err);
      });
    });

    bb.on("close", () => {
      res.cork(() => {
        console.log("Upload complete");
        res.writeStatus("200 OK").end("That's all folks!");
      });
    });

    let bodyBuffer = Buffer.alloc(0);

    res.onData((chunk, isLast) => {
      bodyBuffer = Buffer.concat([bodyBuffer, Buffer.from(chunk)]);

      if (isLast) {
        bb.end(bodyBuffer);
      } else {
        bb.write(bodyBuffer);
        bodyBuffer = Buffer.alloc(0);
      }
    });

    res.onAborted(() => {
      bb.destroy();
    });
  });
};

export default handlePosts;
