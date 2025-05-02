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
  StaticContentTypes,
  UserContentStateTypes,
} from "../../../universal/contentTypeConstant";
import { getEmbedding } from "./embedding";
import { uploadEmbeddingToQdrant } from "./qdrant";

const tableStaticContentUtils = new Utils();

const uploadSessions = new Map<
  string,
  | {
      direction: "toMuteStyle";
      userId: string;
      contentId: string;
      state: UserContentStateTypes[];
    }
  | {
      direction: "toUserContent";
      userId: string;
      contentId: string;
      state: UserContentStateTypes[];
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
            const { userId, contentId, direction, state } = metadata;

            const uploadId = uuidv4();

            switch (direction) {
              case "toMuteStyle":
                uploadSessions.set(uploadId, {
                  direction,
                  userId,
                  contentId,
                  state,
                });
                break;
              case "toUserContent":
                uploadSessions.set(uploadId, {
                  direction,
                  userId,
                  contentId,
                  state,
                });
                break;
              default:
                break;
            }

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
              case "toMuteStyle":
                if (staticContentType === "svg") {
                  await this.handleToMuteStyle(
                    session.userId,
                    session.contentId,
                    mimeType as StaticMimeTypes,
                    completeFilename,
                    session.state
                  );
                }
                break;
              case "toUserContent":
                await this.handleToUserContent(
                  staticContentType,
                  session.userId,
                  session.contentId,
                  mimeType as StaticMimeTypes,
                  completeFilename,
                  session.state
                );
                break;
              default:
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
  }

  private handleToMuteStyle = async (
    userId: string,
    contentId: string,
    mimeType: StaticMimeTypes,
    completeFilename: string,
    state: UserContentStateTypes[]
  ) => {
    await this.handleMongoSvgUploads(
      userId,
      contentId,
      mimeType,
      completeFilename,
      state
    );

    broadcaster.broadcastToUser(userId, {
      type: "svgUploadedToUserContent",
      header: { contentId },
      data: { filename: completeFilename, mimeType, state },
    });
  };

  private handleToUserContent = async (
    staticContentType: StaticContentTypes,
    userId: string,
    contentId: string,
    mimeType: StaticMimeTypes,
    completeFilename: string,
    state: UserContentStateTypes[]
  ) => {
    switch (staticContentType) {
      case "video":
        await this.handleMongoVideoUploads(
          userId,
          contentId,
          mimeType,
          completeFilename,
          state
        );

        broadcaster.broadcastToUser(userId, {
          type: "videoUploadedToUserContent",
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
          userId,
          contentId,
          mimeType,
          completeFilename,
          state
        );

        broadcaster.broadcastToUser(userId, {
          type: "imageUploadedToUserContent",
          header: { contentId },
          data: { filename: completeFilename, mimeType, state },
        });
        break;
      case "svg":
        await this.handleMongoSvgUploads(
          userId,
          contentId,
          mimeType,
          completeFilename,
          state
        );

        broadcaster.broadcastToUser(userId, {
          type: "svgUploadedToUserContent",
          header: { contentId },
          data: { filename: completeFilename, mimeType, state },
        });
        break;
      case "soundClip":
        await this.handleMongoSoundClipUploads(
          userId,
          contentId,
          mimeType,
          completeFilename,
          state
        );

        broadcaster.broadcastToUser(userId, {
          type: "soundClipUploadedToUserContent",
          header: { contentId },
          data: { filename: completeFilename, mimeType, state },
        });
        break;
      case "application":
        await this.handleMongoApplicationUploads(
          userId,
          contentId,
          mimeType,
          completeFilename,
          state
        );

        broadcaster.broadcastToUser(userId, {
          type: "applicationUploadedToUserContent",
          header: { contentId },
          data: { filename: completeFilename, mimeType },
        });
        break;
      case "text":
        await this.handleMongoTextUploads(
          userId,
          contentId,
          mimeType,
          completeFilename,
          state
        );

        broadcaster.broadcastToUser(userId, {
          type: "textUploadedToUserContent",
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
    userId: string,
    contentId: string,
    mimeType: StaticMimeTypes,
    filename: string,
    state: UserContentStateTypes[]
  ) => {
    await tableTopMongo.userVideos?.uploads.uploadMetaData({
      userId,
      videoId: contentId,
      filename,
      mimeType,
      state,
    });
  };

  private handleMongoImageUploads = async (
    userId: string,
    contentId: string,
    mimeType: StaticMimeTypes,
    filename: string,
    state: UserContentStateTypes[]
  ) => {
    await tableTopMongo.userImages?.uploads.uploadMetaData({
      userId,
      imageId: contentId,
      filename,
      mimeType,
      state,
    });
  };

  private handleMongoSvgUploads = async (
    userId: string,
    contentId: string,
    mimeType: StaticMimeTypes,
    filename: string,
    state: UserContentStateTypes[]
  ) => {
    await tableTopMongo.userSvgs?.uploads.uploadMetaData({
      userId,
      svgId: contentId,
      filename,
      mimeType,
      state,
    });
  };

  private handleMongoSoundClipUploads = async (
    userId: string,
    contentId: string,
    mimeType: StaticMimeTypes,
    filename: string,
    state: UserContentStateTypes[]
  ) => {
    await tableTopMongo.userSoundClips?.uploads.uploadMetaData({
      userId,
      soundClipId: contentId,
      filename,
      mimeType,
      state,
    });
  };

  private handleMongoApplicationUploads = async (
    userId: string,
    contentId: string,
    mimeType: StaticMimeTypes,
    filename: string,
    state: UserContentStateTypes[]
  ) => {
    await tableTopMongo.userApplications?.uploads.uploadMetaData({
      userId,
      applicationId: contentId,
      filename,
      mimeType,
      state,
    });
  };

  private handleMongoTextUploads = async (
    userId: string,
    contentId: string,
    mimeType: StaticMimeTypes,
    filename: string,
    state: UserContentStateTypes[]
  ) => {
    await tableTopMongo.userText?.uploads.uploadMetaData({
      userId,
      textId: contentId,
      filename,
      mimeType,
      state,
    });
  };
}

export default Posts;
