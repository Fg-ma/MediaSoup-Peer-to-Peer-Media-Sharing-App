import uWS from "uWebSockets.js";
import { v4 as uuidv4 } from "uuid";
import busboy from "busboy";
import { broadcaster, tableTopCeph, tableTopMongo } from "../index";
import Utils from "./lib/Utils";
import {
  contentTypeBucketMap,
  mimeToExtension,
  mimeTypeContentTypeMap,
  StaticMimeTypes,
} from "../typeConstant";
import {
  defaultApplicationEffectsStyles,
  defaultApplicationEffects,
  defaultAudioEffects,
  defaultImageEffectsStyles,
  defaultImageEffects,
  defaultSvgEffectsStyles,
  defaultSvgEffects,
  defaultVideoEffectsStyles,
  defaultVideoEffects,
} from "../../../universal/effectsTypeConstant";
import {
  ContentStateTypes,
  StaticContentTypes,
} from "../../../universal/contentTypeConstant";
import { getEmbedding } from "./embedding";
import { uploadEmbeddingToQdrant } from "./qdrant";

const tableStaticContentUtils = new Utils();

const uploadSessions = new Map<
  string,
  | {
      direction: "toTable";
      table_id: string;
      contentId: string;
      instanceId: string;
      state: ContentStateTypes[];
    }
  | {
      direction: "reupload";
      table_id: string;
      contentId: string;
    }
  | {
      direction: "toTabled";
      table_id: string;
      contentId: string;
      state: ContentStateTypes[];
    }
  | {
      direction: "toMuteStyle";
      table_id: string;
      contentId: string;
      state: ContentStateTypes[];
    }
>();

class Posts {
  constructor(app: uWS.TemplatedApp) {
    app.post("/upload-meta", (res, req) => {
      let buffer = "";

      res.cork(() => {
        res.writeHeader(
          "Access-Control-Allow-Origin",
          "https://localhost:8080"
        );
      });

      // Required to prevent crash if the client disconnects early
      let aborted = false;
      res.onAborted(() => {
        aborted = true;
        console.warn("Request aborted by client");
      });

      res.onData((chunk, isLast) => {
        buffer += Buffer.from(chunk).toString();

        if (isLast) {
          if (aborted) return;

          try {
            const metadata = JSON.parse(buffer);
            const { table_id, contentId, instanceId, direction, state } =
              metadata;

            const uploadId = uuidv4();

            uploadSessions.set(uploadId, {
              table_id,
              contentId,
              instanceId,
              direction,
              state,
            });

            res.cork(() => {
              res
                .writeStatus("200 OK")
                .writeHeader("Content-Type", "application/json")
                .end(JSON.stringify({ uploadId }));
            });
          } catch (err) {
            console.error("Error in /upload-meta:", err);
            res.cork(() => {
              res
                .writeStatus("400 Bad Request")
                .writeHeader("Content-Type", "application/json")
                .end(
                  JSON.stringify({ error: "Invalid JSON or missing fields" })
                );
            });
          }
        }
      });
    });

    app.post("/upload-file/:uploadId", (res, req) => {
      res.cork(() => {
        res.writeHeader(
          "Access-Control-Allow-Origin",
          "https://localhost:8080"
        );
      });

      const uploadId = req.getParameter(0);

      if (!uploadId) {
        res.cork(() => {
          res.writeStatus("404 Not Found").end("Upload session not found");
        });
        return;
      }

      const session = uploadSessions.get(uploadId);

      if (!session) {
        res.cork(() => {
          res.writeStatus("404 Not Found").end("Upload session not found");
        });
        return;
      }

      const headers: { [header: string]: string } = {};
      req.forEach((key, value) => {
        headers[key] = value;
      });

      const bb = busboy({ headers });

      bb.on("file", (_, file, info) => {
        const { mimeType, filename } = info;

        const sanitizedFilename = tableStaticContentUtils.sanitizeString(
          filename.slice(0, -4)
        );
        const sanitizedMimeType =
          tableStaticContentUtils.sanitizeMimeType(mimeType);
        const completeFilename = `${sanitizedFilename}${
          mimeToExtension[sanitizedMimeType as StaticMimeTypes]
        }`;
        const staticContentType =
          mimeTypeContentTypeMap[mimeType as StaticMimeTypes] ?? ".bin";

        // Save file
        tableTopCeph
          .uploadFile(
            contentTypeBucketMap[staticContentType],
            completeFilename,
            file
          )
          .then(async () => {
            switch (session.direction) {
              case "toTable":
                await this.handleToTable(
                  staticContentType,
                  session.table_id,
                  session.contentId,
                  session.instanceId,
                  mimeType as StaticMimeTypes,
                  completeFilename,
                  session.state
                );
                break;
              case "reupload":
                this.handleReupload(
                  staticContentType,
                  session.table_id,
                  session.contentId
                );
                break;
              case "toTabled":
                await this.handleToTabled(
                  staticContentType,
                  session.table_id,
                  session.contentId,
                  mimeType as StaticMimeTypes,
                  completeFilename,
                  session.state
                );
                break;
            }

            // Cleanup session
            uploadSessions.delete(uploadId);
          });

        file.on("error", (err) => {
          console.error(`Error writing file:`, err);
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
        }
      });

      res.onAborted(() => {
        bb.destroy();
        uploadSessions.delete(uploadId);
      });
    });

    // app.post("/upload/*", (res, req) => {
    //   const url = req.getUrl();
    //   const split = url.split("/");
    //   const table_id = split[2];
    //   const contentId = split[3];
    //   const instanceId = split[4];
    //   const direction = split[5];
    //   const tabled = split[6] !== "false";

    //   res.cork(() => {
    //     res.writeHeader(
    //       "Access-Control-Allow-Origin",
    //       "https://localhost:8080"
    //     );
    //   });

    //   const headers: { [header: string]: string } = {};
    //   req.forEach((key, value) => {
    //     headers[key] = value;
    //   });

    //   const bb = busboy({ headers });

    //   bb.on("file", (name, file, info) => {
    //     const { mimeType, filename } = info;

    //     const sanitizedFilename = tableStaticContentUtils.sanitizeString(
    //       filename.slice(0, -4)
    //     );
    //     const sanitizedMimeType =
    //       tableStaticContentUtils.sanitizeMimeType(mimeType);

    //     const completeFilename = `${sanitizedFilename}${
    //       mimeToExtension[sanitizedMimeType as StaticMimeTypes]
    //     }`;
    //     const staticContentType =
    //       mimeTypeContentTypeMap[mimeType as StaticMimeTypes] ?? ".bin";

    //     tableTopCeph
    //       .uploadFile(
    //         contentTypeBucketMap[staticContentType],
    //         completeFilename,
    //         file
    //       )
    //       .then(async () => {
    //         switch (direction) {
    //           case "toTable":
    //             await this.handleToTable(
    //               staticContentType,
    //               table_id,
    //               contentId,
    //               instanceId,
    //               mimeType as StaticMimeTypes,
    //               completeFilename,
    //               tabled
    //             );
    //             break;
    //           case "reupload":
    //             this.handleReupload(staticContentType, table_id, contentId);
    //             break;
    //           case "toTabled":
    //             await this.handleToTabled(
    //               staticContentType,
    //               table_id,
    //               contentId,
    //               mimeType as StaticMimeTypes,
    //               completeFilename,
    //               tabled
    //             );
    //             break;
    //           default:
    //             break;
    //         }
    //       });

    //     file.on("error", (err) => {
    //       console.error(`Error writing file ${completeFilename}:`, err);
    //     });
    //   });

    //   bb.on("close", () => {
    //     res.cork(() => {
    //       console.log("Upload complete");
    //       res.writeStatus("200 OK").end("That's all folks!");
    //     });
    //   });

    //   let bodyBuffer = Buffer.alloc(0);

    //   res.onData((chunk, isLast) => {
    //     bodyBuffer = Buffer.concat([bodyBuffer, Buffer.from(chunk)]);

    //     if (isLast) {
    //       bb.end(bodyBuffer);
    //     } else {
    //       bb.write(bodyBuffer);
    //       bodyBuffer = Buffer.alloc(0);
    //     }
    //   });

    //   res.onAborted(() => {
    //     bb.destroy();
    //   });
    // });
  }

  private handleToTable = async (
    staticContentType: StaticContentTypes,
    table_id: string,
    contentId: string,
    instanceId: string,
    mimeType: StaticMimeTypes,
    completeFilename: string,
    state: ContentStateTypes[]
  ) => {
    switch (staticContentType) {
      case "video":
        await this.handleMongoVideoUploads(
          table_id,
          contentId,
          instanceId,
          mimeType,
          completeFilename,
          state
        );

        broadcaster.broadcastToTable(table_id, {
          type: "videoUploadedToTable",
          header: {
            contentId,
            instanceId,
          },
          data: {
            filename: completeFilename,
            mimeType,
            state,
          },
        });

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
        break;
      case "image":
        await this.handleMongoImageUploads(
          table_id,
          contentId,
          instanceId,
          mimeType,
          completeFilename,
          state
        );

        broadcaster.broadcastToTable(table_id, {
          type: "imageUploadedToTable",
          header: { contentId, instanceId },
          data: { filename: completeFilename, mimeType, state },
        });
        break;
      case "svg":
        await this.handleMongoSvgUploads(
          table_id,
          contentId,
          instanceId,
          mimeType,
          completeFilename,
          state
        );

        broadcaster.broadcastToTable(table_id, {
          type: "svgUploadedToTable",
          header: { contentId, instanceId },
          data: { filename: completeFilename, mimeType, state },
        });
        break;
      case "soundClip":
        await this.handleMongoSoundClipUploads(
          table_id,
          contentId,
          instanceId,
          mimeType,
          completeFilename,
          state
        );

        broadcaster.broadcastToTable(table_id, {
          type: "soundClipUploadedToTable",
          header: { contentId, instanceId },
          data: { filename: completeFilename, mimeType, state },
        });
        break;
      case "application":
        await this.handleMongoApplicationUploads(
          table_id,
          contentId,
          instanceId,
          mimeType,
          completeFilename,
          state
        );

        broadcaster.broadcastToTable(table_id, {
          type: "applicationUploadedToTable",
          header: { contentId, instanceId },
          data: { filename: completeFilename, mimeType, state },
        });
        break;
      case "text":
        await this.handleMongoTextUploads(
          table_id,
          contentId,
          instanceId,
          mimeType,
          completeFilename,
          state
        );

        broadcaster.broadcastToTable(table_id, {
          type: "textUploadedToTable",
          header: { contentId, instanceId },
          data: { filename: completeFilename, mimeType, state },
        });
        break;
      default:
        console.warn(`Unsupported file type uploaded: ${mimeType}`);
        break;
    }
  };

  private handleReupload = (
    staticContentType: StaticContentTypes,
    table_id: string,
    contentId: string
  ) => {
    switch (staticContentType) {
      case "video":
        broadcaster.broadcastToTable(table_id, {
          type: "videoReupload",
          header: { contentId },
        });
        break;
      case "image":
        broadcaster.broadcastToTable(table_id, {
          type: "imageReupload",
          header: { contentId },
        });
        break;
      case "svg":
        broadcaster.broadcastToTable(table_id, {
          type: "svgReuploaded",
          header: { contentId },
        });
        break;
      case "soundClip":
        broadcaster.broadcastToTable(table_id, {
          type: "soundClipReupload",
          header: { contentId },
        });
        break;
      case "application":
        broadcaster.broadcastToTable(table_id, {
          type: "applicationReupload",
          header: { contentId },
        });
        break;
      case "text":
        broadcaster.broadcastToTable(table_id, {
          type: "textReupload",
          header: { contentId },
        });
        break;
      default:
        break;
    }
  };

  private handleToTabled = async (
    staticContentType: StaticContentTypes,
    table_id: string,
    contentId: string,
    mimeType: StaticMimeTypes,
    completeFilename: string,
    state: ContentStateTypes[]
  ) => {
    switch (staticContentType) {
      case "video":
        await this.handleMongoVideoUploads(
          table_id,
          contentId,
          undefined,
          mimeType,
          completeFilename,
          state
        );

        broadcaster.broadcastToTable(table_id, {
          type: "videoUploadedToTabled",
          header: {
            contentId,
          },
          data: {
            filename: completeFilename,
            mimeType,
            state,
          },
        });

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
        break;
      case "image":
        await this.handleMongoImageUploads(
          table_id,
          contentId,
          undefined,
          mimeType,
          completeFilename,
          state
        );

        broadcaster.broadcastToTable(table_id, {
          type: "imageUploadedToTabled",
          header: { contentId },
          data: { filename: completeFilename, mimeType, state },
        });
        break;
      case "svg":
        await this.handleMongoSvgUploads(
          table_id,
          contentId,
          undefined,
          mimeType,
          completeFilename,
          state
        );

        broadcaster.broadcastToTable(table_id, {
          type: "svgUploadedToTabled",
          header: { contentId },
          data: { filename: completeFilename, mimeType, state },
        });
        break;
      case "soundClip":
        await this.handleMongoSoundClipUploads(
          table_id,
          contentId,
          undefined,
          mimeType,
          completeFilename,
          state
        );

        broadcaster.broadcastToTable(table_id, {
          type: "soundClipUploadedToTabled",
          header: { contentId },
          data: { filename: completeFilename, mimeType, state },
        });
        break;
      case "application":
        await this.handleMongoApplicationUploads(
          table_id,
          contentId,
          undefined,
          mimeType,
          completeFilename,
          state
        );

        broadcaster.broadcastToTable(table_id, {
          type: "applicationUploadedToTabled",
          header: { contentId },
          data: { filename: completeFilename, mimeType },
        });
        break;
      case "text":
        await this.handleMongoTextUploads(
          table_id,
          contentId,
          undefined,
          mimeType,
          completeFilename,
          state
        );

        broadcaster.broadcastToTable(table_id, {
          type: "textUploadedToTabled",
          header: { contentId },
          data: { filename: completeFilename, mimeType, state },
        });
        break;
      default:
        console.warn(`Unsupported file type uploaded: ${mimeType}`);
        break;
    }
  };

  private handleMongoVideoUploads = async (
    table_id: string,
    contentId: string,
    instanceId: string | undefined,
    mimeType: StaticMimeTypes,
    filename: string,
    state: ContentStateTypes[]
  ) => {
    await tableTopMongo.tableVideos?.uploads.uploadMetaData({
      table_id,
      videoId: contentId,
      filename,
      mimeType,
      state,
      instances: instanceId
        ? [
            {
              videoInstanceId: instanceId,
              positioning: {
                position: {
                  left: 32.5,
                  top: 32.5,
                },
                scale: {
                  x: 25,
                  y: 25,
                },
                rotation: 0,
              },
              effects: structuredClone(defaultVideoEffects),
              effectStyles: structuredClone(defaultVideoEffectsStyles),
              videoPosition: 0,
            },
          ]
        : [],
    });
  };

  private handleMongoImageUploads = async (
    table_id: string,
    contentId: string,
    instanceId: string | undefined,
    mimeType: StaticMimeTypes,
    filename: string,
    state: ContentStateTypes[]
  ) => {
    await tableTopMongo.tableImages?.uploads.uploadMetaData({
      table_id,
      imageId: contentId,
      filename,
      mimeType,
      state,
      instances: instanceId
        ? [
            {
              imageInstanceId: instanceId,
              positioning: {
                position: {
                  left: 32.5,
                  top: 32.5,
                },
                scale: {
                  x: 25,
                  y: 25,
                },
                rotation: 0,
              },
              effects: structuredClone(defaultImageEffects),
              effectStyles: structuredClone(defaultImageEffectsStyles),
            },
          ]
        : [],
    });
  };

  private handleMongoSvgUploads = async (
    table_id: string,
    contentId: string,
    instanceId: string | undefined,
    mimeType: StaticMimeTypes,
    filename: string,
    state: ContentStateTypes[]
  ) => {
    await tableTopMongo.tableSvgs?.uploads.uploadMetaData({
      table_id,
      svgId: contentId,
      filename,
      mimeType,
      state,
      instances: instanceId
        ? [
            {
              svgInstanceId: instanceId,
              positioning: {
                position: {
                  left: 32.5,
                  top: 32.5,
                },
                scale: {
                  x: 25,
                  y: 25,
                },
                rotation: 0,
              },
              effects: structuredClone(defaultSvgEffects),
              effectStyles: structuredClone(defaultSvgEffectsStyles),
            },
          ]
        : [],
    });
  };

  private handleMongoSoundClipUploads = async (
    table_id: string,
    contentId: string,
    instanceId: string | undefined,
    mimeType: StaticMimeTypes,
    filename: string,
    state: ContentStateTypes[]
  ) => {
    await tableTopMongo.tableSoundClips?.uploads.uploadMetaData({
      table_id,
      soundClipId: contentId,
      filename,
      mimeType,
      state,
      instances: instanceId
        ? [
            {
              soundClipInstanceId: instanceId,
              positioning: {
                position: {
                  left: 32.5,
                  top: 32.5,
                },
                scale: {
                  x: 25,
                  y: 25,
                },
                rotation: 0,
              },
              effects: structuredClone(defaultAudioEffects),
            },
          ]
        : [],
    });
  };

  private handleMongoApplicationUploads = async (
    table_id: string,
    contentId: string,
    instanceId: string | undefined,
    mimeType: StaticMimeTypes,
    filename: string,
    state: ContentStateTypes[]
  ) => {
    await tableTopMongo.tableApplications?.uploads.uploadMetaData({
      table_id,
      applicationId: contentId,
      filename,
      mimeType,
      state,
      instances: instanceId
        ? [
            {
              applicationInstanceId: instanceId,
              positioning: {
                position: {
                  left: 32.5,
                  top: 32.5,
                },
                scale: {
                  x: 25,
                  y: 25,
                },
                rotation: 0,
              },
              effects: structuredClone(defaultApplicationEffects),
              effectStyles: structuredClone(defaultApplicationEffectsStyles),
            },
          ]
        : [],
    });
  };

  private handleMongoTextUploads = async (
    table_id: string,
    contentId: string,
    instanceId: string | undefined,
    mimeType: StaticMimeTypes,
    filename: string,
    state: ContentStateTypes[]
  ) => {
    await tableTopMongo.tableText?.uploads.uploadMetaData({
      table_id,
      textId: contentId,
      filename,
      mimeType,
      state,
      instances: instanceId
        ? [
            {
              textInstanceId: instanceId,
              positioning: {
                position: {
                  left: 32.5,
                  top: 32.5,
                },
                scale: {
                  x: 25,
                  y: 25,
                },
                rotation: 0,
              },
            },
          ]
        : [],
    });
  };
}

export default Posts;
