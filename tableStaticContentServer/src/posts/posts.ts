import uWS from "uWebSockets.js";
import { v4 as uuidv4 } from "uuid";
import busboy from "busboy";
import { broadcaster, tableTopCeph, tableTopMongo } from "../index";
import Utils from "./lib/Utils";
import { contentTypeBucketMap, mimeToExtension } from "../typeConstant";
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
  TableContentStateTypes,
  StaticContentTypes,
  StaticMimeTypes,
  mimeTypeContentTypeMap,
} from "../../../universal/contentTypeConstant";
import { getEmbedding } from "./embedding";
import { uploadEmbeddingToQdrant } from "./qdrant";
import { ChunkState, UploadSession } from "./lib/typeConstant";

const tableStaticContentUtils = new Utils();

class Posts {
  private chunkStates = new Map<string, ChunkState>();
  private uploadSessions = new Map<string, UploadSession>();

  constructor(app: uWS.TemplatedApp) {
    app.post("/upload-one-shot-file", (res, req) => {
      res.cork(() => {
        res.writeHeader(
          "Access-Control-Allow-Origin",
          "https://localhost:8080"
        );
      });

      const headers: { [header: string]: string } = {};
      req.forEach((key, value) => {
        headers[key] = value;
      });

      const bb = busboy({ headers });

      let metadata: {
        tableId: string;
        contentId: string;
        instanceId: string;
        direction: string;
        state: TableContentStateTypes[];
        initPositioning?: {
          position: { top: number; left: number };
          scale: { x: number; y: number };
          rotation: number;
        };
      } | null = null;

      bb.on("field", (fieldname, val) => {
        if (fieldname === "metadata") {
          try {
            metadata = JSON.parse(val);
          } catch (e) {
            console.error("Invalid JSON in metadata field", e);
          }
        }
      });

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
            if (!metadata) return;

            switch (metadata.direction) {
              case "toTable":
                await this.handleToTable(
                  staticContentType,
                  metadata.tableId,
                  metadata.contentId,
                  metadata.instanceId,
                  mimeType as StaticMimeTypes,
                  completeFilename,
                  metadata.state,
                  metadata.initPositioning
                );
                break;
              case "reupload":
                this.handleReupload(
                  staticContentType,
                  metadata.tableId,
                  metadata.contentId
                );
                break;
              case "toTabled":
                await this.handleToTabled(
                  staticContentType,
                  metadata.tableId,
                  metadata.contentId,
                  mimeType as StaticMimeTypes,
                  completeFilename,
                  metadata.state
                );
                break;
              default:
                break;
            }
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
      });
    });

    app.post("/upload-chunk-meta", (res, req) => {
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

      res.onData(async (chunk, isLast) => {
        buffer += Buffer.from(chunk).toString();

        if (isLast) {
          if (aborted) return;

          try {
            const metadata = JSON.parse(buffer);
            const {
              tableId,
              contentId,
              instanceId,
              direction,
              state,
              filename,
              mimeType,
            } = metadata;

            const staticContentType =
              mimeTypeContentTypeMap[mimeType as StaticMimeTypes];

            const parts = filename.split(".");
            const baseName = parts.slice(0, -1).join(".");
            const extension = parts[parts.length - 1];
            const sanitizedFilename =
              tableStaticContentUtils.sanitizeString(baseName);
            const sanitizedExtension =
              tableStaticContentUtils.sanitizeString(extension);
            const sanitizedName = `${sanitizedFilename}.${sanitizedExtension}`;

            const uploadId = await tableTopCeph.createMultipartUpload(
              contentTypeBucketMap[staticContentType as StaticContentTypes],
              sanitizedName
            );
            if (!uploadId) return;

            this.chunkStates.set(uploadId, { uploadId, parts: [] });

            const sessionData = {
              direction,
              tableId,
              contentId,
              filename: sanitizedName,
              staticContentType,
              mimeType,
            };

            if (direction === "toTable") {
              Object.assign(sessionData, { instanceId, state });
            } else if (direction === "toTabled") {
              Object.assign(sessionData, { state });
            }

            this.uploadSessions.set(uploadId, sessionData);

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

    app.post("/upload-chunk/:uploadId", (res, req) => {
      res.cork(() => {
        res.writeHeader(
          "Access-Control-Allow-Origin",
          "https://localhost:8080"
        );
      });

      const uploadId = req.getParameter(0);
      if (!uploadId) {
        res.cork(() => {
          res.writeStatus("404").end("No upload id");
        });
        return;
      }

      const session = this.uploadSessions.get(uploadId);
      if (!session) {
        res.cork(() => {
          res.writeStatus("404").end("No session");
        });
        return;
      }

      const bb = busboy({ headers: this.collectHeaders(req) });
      let chunkIndex = -1,
        totalChunks = -1;
      let buffer = Buffer.alloc(0);

      bb.on("field", (name, val) => {
        if (name === "chunkIndex") chunkIndex = parseInt(val, 10);
        if (name === "totalChunks") totalChunks = parseInt(val, 10);
      });

      bb.on("file", (_fn, stream, info) => {
        const { mimeType } = info;

        stream.on("data", (d) => (buffer = Buffer.concat([buffer, d])));

        stream.on("end", async () => {
          let state = this.chunkStates.get(uploadId);
          if (!state) return;

          // upload this part
          const ETag = await tableTopCeph.uploadPart(
            contentTypeBucketMap[session.staticContentType],
            session.filename,
            chunkIndex + 1,
            uploadId,
            buffer
          );
          if (!ETag) return;
          state.parts.push({ PartNumber: chunkIndex + 1, ETag });

          res.cork(() => {
            res.writeStatus("200 OK").end("Chunk received");
          });

          // if last chunk, complete
          if (state.parts.length === totalChunks) {
            tableTopCeph
              .completeMultipartUpload(
                contentTypeBucketMap[session.staticContentType],
                session.filename,
                uploadId,
                state.parts
              )
              .then(async () => {
                switch (session.direction) {
                  case "toTable":
                    await this.handleToTable(
                      session.staticContentType,
                      session.tableId,
                      session.contentId,
                      session.instanceId,
                      mimeType as StaticMimeTypes,
                      session.filename,
                      session.state
                    );
                    break;
                  case "reupload":
                    this.handleReupload(
                      session.staticContentType,
                      session.tableId,
                      session.contentId
                    );
                    break;
                  case "toTabled":
                    await this.handleToTabled(
                      session.staticContentType,
                      session.tableId,
                      session.contentId,
                      mimeType as StaticMimeTypes,
                      session.filename,
                      session.state
                    );
                    break;
                  default:
                    break;
                }

                // Cleanup session
                this.uploadSessions.delete(uploadId);
                this.chunkStates.delete(uploadId);
              });
          }
        });
      });

      this.pipeReqToBusboy(res, bb, uploadId);
    });
  }

  private collectHeaders(req: uWS.HttpRequest) {
    const h: Record<string, string> = {};
    req.forEach((k, v) => (h[k] = v));
    return h;
  }

  private pipeReqToBusboy(
    res: uWS.HttpResponse,
    bb: busboy.Busboy,
    uploadId: string
  ) {
    let buffer = Buffer.alloc(0);
    res.onData((chunk, isLast) => {
      buffer = Buffer.concat([buffer, Buffer.from(chunk)]);
      if (isLast) {
        bb.end(buffer);
      }
    });

    res.onAborted(() => {
      bb.destroy();
      this.uploadSessions.delete(uploadId);
    });
  }

  private handleToTable = async (
    staticContentType: StaticContentTypes,
    tableId: string,
    contentId: string,
    instanceId: string,
    mimeType: StaticMimeTypes,
    filename: string,
    state: TableContentStateTypes[],
    initPositioning?:
      | {
          position: {
            top: number;
            left: number;
          };
          scale: {
            x: number;
            y: number;
          };
          rotation: number;
        }
      | undefined
  ) => {
    switch (staticContentType) {
      case "video":
        await this.handleMongoVideoUploads(
          tableId,
          contentId,
          instanceId,
          mimeType,
          filename,
          state,
          initPositioning
        );

        broadcaster.broadcastToTable(tableId, {
          type: "videoUploadedToTable",
          header: {
            contentId,
            instanceId,
          },
          data: {
            filename,
            mimeType,
            state,
            initPositioning,
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

        //   tableContentController.setContent(tableId, "video", contentId, [
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
        //   broadcaster.broadcastToTable(tableId, dashVideoMessage);
        // } catch (error) {
        //   console.error("Error during video processing:", error);
        // }
        break;
      case "image":
        await this.handleMongoImageUploads(
          tableId,
          contentId,
          instanceId,
          mimeType,
          filename,
          state,
          initPositioning
        );

        broadcaster.broadcastToTable(tableId, {
          type: "imageUploadedToTable",
          header: { contentId, instanceId },
          data: { filename, mimeType, state, initPositioning },
        });
        break;
      case "svg":
        await this.handleMongoSvgUploads(
          tableId,
          contentId,
          instanceId,
          mimeType,
          filename,
          state,
          initPositioning
        );

        broadcaster.broadcastToTable(tableId, {
          type: "svgUploadedToTable",
          header: { contentId, instanceId },
          data: { filename, mimeType, state, initPositioning },
        });
        break;
      case "soundClip":
        await this.handleMongoSoundClipUploads(
          tableId,
          contentId,
          instanceId,
          mimeType,
          filename,
          state,
          initPositioning
        );

        broadcaster.broadcastToTable(tableId, {
          type: "soundClipUploadedToTable",
          header: { contentId, instanceId },
          data: { filename, mimeType, state, initPositioning },
        });
        break;
      case "application":
        await this.handleMongoApplicationUploads(
          tableId,
          contentId,
          instanceId,
          mimeType,
          filename,
          state,
          initPositioning
        );

        broadcaster.broadcastToTable(tableId, {
          type: "applicationUploadedToTable",
          header: { contentId, instanceId },
          data: { filename, mimeType, state, initPositioning },
        });
        break;
      case "text":
        await this.handleMongoTextUploads(
          tableId,
          contentId,
          instanceId,
          mimeType,
          filename,
          state,
          initPositioning
        );

        broadcaster.broadcastToTable(tableId, {
          type: "textUploadedToTable",
          header: { contentId, instanceId },
          data: { filename, mimeType, state, initPositioning },
        });
        break;
      default:
        console.warn(`Unsupported file type uploaded: ${mimeType}`);
        break;
    }
  };

  private handleReupload = (
    staticContentType: StaticContentTypes,
    tableId: string,
    contentId: string
  ) => {
    switch (staticContentType) {
      case "video":
        broadcaster.broadcastToTable(tableId, {
          type: "videoReupload",
          header: { contentId },
        });
        break;
      case "image":
        broadcaster.broadcastToTable(tableId, {
          type: "imageReupload",
          header: { contentId },
        });
        break;
      case "svg":
        broadcaster.broadcastToTable(tableId, {
          type: "svgReuploaded",
          header: { contentId },
        });
        break;
      case "soundClip":
        broadcaster.broadcastToTable(tableId, {
          type: "soundClipReupload",
          header: { contentId },
        });
        break;
      case "application":
        broadcaster.broadcastToTable(tableId, {
          type: "applicationReupload",
          header: { contentId },
        });
        break;
      case "text":
        broadcaster.broadcastToTable(tableId, {
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
    tableId: string,
    contentId: string,
    mimeType: StaticMimeTypes,
    completeFilename: string,
    state: TableContentStateTypes[]
  ) => {
    switch (staticContentType) {
      case "video":
        await this.handleMongoVideoUploads(
          tableId,
          contentId,
          undefined,
          mimeType,
          completeFilename,
          state
        );

        broadcaster.broadcastToTable(tableId, {
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

        //   tableContentController.setContent(tableId, "video", contentId, [
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
        //   broadcaster.broadcastToTable(tableId, dashVideoMessage);
        // } catch (error) {
        //   console.error("Error during video processing:", error);
        // }
        break;
      case "image":
        await this.handleMongoImageUploads(
          tableId,
          contentId,
          undefined,
          mimeType,
          completeFilename,
          state
        );

        broadcaster.broadcastToTable(tableId, {
          type: "imageUploadedToTabled",
          header: { contentId },
          data: { filename: completeFilename, mimeType, state },
        });
        break;
      case "svg":
        await this.handleMongoSvgUploads(
          tableId,
          contentId,
          undefined,
          mimeType,
          completeFilename,
          state
        );

        broadcaster.broadcastToTable(tableId, {
          type: "svgUploadedToTabled",
          header: { contentId },
          data: { filename: completeFilename, mimeType, state },
        });
        break;
      case "soundClip":
        await this.handleMongoSoundClipUploads(
          tableId,
          contentId,
          undefined,
          mimeType,
          completeFilename,
          state
        );

        broadcaster.broadcastToTable(tableId, {
          type: "soundClipUploadedToTabled",
          header: { contentId },
          data: { filename: completeFilename, mimeType, state },
        });
        break;
      case "application":
        await this.handleMongoApplicationUploads(
          tableId,
          contentId,
          undefined,
          mimeType,
          completeFilename,
          state
        );

        broadcaster.broadcastToTable(tableId, {
          type: "applicationUploadedToTabled",
          header: { contentId },
          data: { filename: completeFilename, mimeType },
        });
        break;
      case "text":
        await this.handleMongoTextUploads(
          tableId,
          contentId,
          undefined,
          mimeType,
          completeFilename,
          state
        );

        broadcaster.broadcastToTable(tableId, {
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
    tableId: string,
    contentId: string,
    instanceId: string | undefined,
    mimeType: StaticMimeTypes,
    filename: string,
    state: TableContentStateTypes[],
    initPositioning?:
      | {
          position: {
            top: number;
            left: number;
          };
          scale: {
            x: number;
            y: number;
          };
          rotation: number;
        }
      | undefined
  ) => {
    await tableTopMongo.tableVideos?.uploads.uploadMetaData({
      tableId,
      videoId: contentId,
      filename,
      mimeType,
      state,
      instances: instanceId
        ? [
            {
              videoInstanceId: instanceId,
              positioning: initPositioning
                ? initPositioning
                : {
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
    tableId: string,
    contentId: string,
    instanceId: string | undefined,
    mimeType: StaticMimeTypes,
    filename: string,
    state: TableContentStateTypes[],
    initPositioning?:
      | {
          position: {
            top: number;
            left: number;
          };
          scale: {
            x: number;
            y: number;
          };
          rotation: number;
        }
      | undefined
  ) => {
    await tableTopMongo.tableImages?.uploads.uploadMetaData({
      tableId,
      imageId: contentId,
      filename,
      mimeType,
      state,
      instances: instanceId
        ? [
            {
              imageInstanceId: instanceId,
              positioning: initPositioning
                ? initPositioning
                : {
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
    tableId: string,
    contentId: string,
    instanceId: string | undefined,
    mimeType: StaticMimeTypes,
    filename: string,
    state: TableContentStateTypes[],
    initPositioning?:
      | {
          position: {
            top: number;
            left: number;
          };
          scale: {
            x: number;
            y: number;
          };
          rotation: number;
        }
      | undefined
  ) => {
    await tableTopMongo.tableSvgs?.uploads.uploadMetaData({
      tableId,
      svgId: contentId,
      filename,
      mimeType,
      state,
      instances: instanceId
        ? [
            {
              svgInstanceId: instanceId,
              positioning: initPositioning
                ? initPositioning
                : {
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
    tableId: string,
    contentId: string,
    instanceId: string | undefined,
    mimeType: StaticMimeTypes,
    filename: string,
    state: TableContentStateTypes[],
    initPositioning?:
      | {
          position: {
            top: number;
            left: number;
          };
          scale: {
            x: number;
            y: number;
          };
          rotation: number;
        }
      | undefined
  ) => {
    await tableTopMongo.tableSoundClips?.uploads.uploadMetaData({
      tableId,
      soundClipId: contentId,
      filename,
      mimeType,
      state,
      instances: instanceId
        ? [
            {
              soundClipInstanceId: instanceId,
              positioning: initPositioning
                ? initPositioning
                : {
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
    tableId: string,
    contentId: string,
    instanceId: string | undefined,
    mimeType: StaticMimeTypes,
    filename: string,
    state: TableContentStateTypes[],
    initPositioning?:
      | {
          position: {
            top: number;
            left: number;
          };
          scale: {
            x: number;
            y: number;
          };
          rotation: number;
        }
      | undefined
  ) => {
    await tableTopMongo.tableApplications?.uploads.uploadMetaData({
      tableId,
      applicationId: contentId,
      filename,
      mimeType,
      state,
      instances: instanceId
        ? [
            {
              applicationInstanceId: instanceId,
              positioning: initPositioning
                ? initPositioning
                : {
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
    tableId: string,
    contentId: string,
    instanceId: string | undefined,
    mimeType: StaticMimeTypes,
    filename: string,
    state: TableContentStateTypes[],
    initPositioning?:
      | {
          position: {
            top: number;
            left: number;
          };
          scale: {
            x: number;
            y: number;
          };
          rotation: number;
        }
      | undefined
  ) => {
    await tableTopMongo.tableText?.uploads.uploadMetaData({
      tableId,
      textId: contentId,
      filename,
      mimeType,
      state,
      instances: instanceId
        ? [
            {
              textInstanceId: instanceId,
              positioning: initPositioning
                ? initPositioning
                : {
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
