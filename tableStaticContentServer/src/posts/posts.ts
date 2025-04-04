import uWS from "uWebSockets.js";
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
import { StaticContentTypes } from "../../../universal/typeConstant";

const tableStaticContentUtils = new Utils();

class Posts {
  constructor(app: uWS.TemplatedApp) {
    app.post("/upload/*", (res, req) => {
      const url = req.getUrl();
      const split = url.split("/");
      const table_id = split[2];
      const contentId = split[3];
      const instanceId = split[4];
      const direction = split[5];
      const tabled = split[6] !== "false";

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

      bb.on("file", (name, file, info) => {
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

        tableTopCeph
          .uploadFile(
            contentTypeBucketMap[staticContentType],
            completeFilename,
            file
          )
          .then(async () => {
            switch (direction) {
              case "toTable":
                await this.handleToTable(
                  staticContentType,
                  table_id,
                  contentId,
                  instanceId,
                  mimeType as StaticMimeTypes,
                  completeFilename,
                  tabled
                );
                break;
              case "reupload":
                this.handleReupload(staticContentType, table_id, contentId);
                break;
              case "toTabled":
                await this.handleToTabled(
                  staticContentType,
                  table_id,
                  contentId,
                  mimeType as StaticMimeTypes,
                  completeFilename,
                  tabled
                );
                break;
              default:
                break;
            }
          });

        file.on("error", (err) => {
          console.error(`Error writing file ${completeFilename}:`, err);
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
  }

  private handleToTable = async (
    staticContentType: StaticContentTypes,
    table_id: string,
    contentId: string,
    instanceId: string,
    mimeType: StaticMimeTypes,
    completeFilename: string,
    tabled: boolean
  ) => {
    switch (staticContentType) {
      case "video":
        await this.handleMongoVideoUploads(
          table_id,
          contentId,
          instanceId,
          mimeType,
          completeFilename,
          tabled
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
          tabled
        );

        broadcaster.broadcastToTable(table_id, {
          type: "imageUploadedToTable",
          header: { contentId, instanceId },
          data: { filename: completeFilename, mimeType },
        });
        break;
      case "svg":
        await this.handleMongoSvgUploads(
          table_id,
          contentId,
          instanceId,
          mimeType,
          completeFilename,
          tabled
        );

        broadcaster.broadcastToTable(table_id, {
          type: "svgUploadedToTable",
          header: { contentId, instanceId },
          data: { filename: completeFilename, mimeType },
        });
        break;
      case "soundClip":
        await this.handleMongoSoundClipUploads(
          table_id,
          contentId,
          instanceId,
          mimeType,
          completeFilename,
          tabled
        );

        broadcaster.broadcastToTable(table_id, {
          type: "soundClipUploadedToTable",
          header: { contentId, instanceId },
          data: { filename: completeFilename, mimeType },
        });
        break;
      case "application":
        await this.handleMongoApplicationUploads(
          table_id,
          contentId,
          instanceId,
          mimeType,
          completeFilename,
          tabled
        );

        broadcaster.broadcastToTable(table_id, {
          type: "applicationUploadedToTable",
          header: { contentId, instanceId },
          data: { filename: completeFilename, mimeType },
        });
        break;
      case "text":
        await this.handleMongoTextUploads(
          table_id,
          contentId,
          instanceId,
          mimeType,
          completeFilename,
          tabled
        );

        broadcaster.broadcastToTable(table_id, {
          type: "textUploadedToTable",
          header: { contentId, instanceId },
          data: { filename: completeFilename, mimeType },
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
    tabled: boolean
  ) => {
    switch (staticContentType) {
      case "video":
        await this.handleMongoVideoUploads(
          table_id,
          contentId,
          undefined,
          mimeType,
          completeFilename,
          tabled
        );

        broadcaster.broadcastToTable(table_id, {
          type: "videoUploadedToTabled",
          header: {
            contentId,
          },
          data: {
            filename: completeFilename,
            mimeType,
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
          tabled
        );

        broadcaster.broadcastToTable(table_id, {
          type: "imageUploadedToTabled",
          header: { contentId },
          data: { filename: completeFilename, mimeType },
        });
        break;
      case "svg":
        await this.handleMongoSvgUploads(
          table_id,
          contentId,
          undefined,
          mimeType,
          completeFilename,
          tabled
        );

        broadcaster.broadcastToTable(table_id, {
          type: "svgUploadedToTabled",
          header: { contentId },
          data: { filename: completeFilename, mimeType },
        });
        break;
      case "soundClip":
        await this.handleMongoSoundClipUploads(
          table_id,
          contentId,
          undefined,
          mimeType,
          completeFilename,
          tabled
        );

        broadcaster.broadcastToTable(table_id, {
          type: "soundClipUploadedToTabled",
          header: { contentId },
          data: { filename: completeFilename, mimeType },
        });
        break;
      case "application":
        await this.handleMongoApplicationUploads(
          table_id,
          contentId,
          undefined,
          mimeType,
          completeFilename,
          tabled
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
          tabled
        );

        broadcaster.broadcastToTable(table_id, {
          type: "textUploadedToTabled",
          header: { contentId },
          data: { filename: completeFilename, mimeType },
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
    tabled: boolean
  ) => {
    await tableTopMongo.tableVideos?.uploads.uploadMetaData({
      table_id,
      videoId: contentId,
      filename,
      mimeType,
      tabled,
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
    tabled: boolean
  ) => {
    await tableTopMongo.tableImages?.uploads.uploadMetaData({
      table_id,
      imageId: contentId,
      filename,
      mimeType,
      tabled,
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
    tabled: boolean
  ) => {
    await tableTopMongo.tableSvgs?.uploads.uploadMetaData({
      table_id,
      svgId: contentId,
      filename,
      mimeType,
      tabled,
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
    tabled: boolean
  ) => {
    await tableTopMongo.tableSoundClips?.uploads.uploadMetaData({
      table_id,
      soundClipId: contentId,
      filename,
      mimeType,
      tabled,
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
    tabled: boolean
  ) => {
    await tableTopMongo.tableApplications?.uploads.uploadMetaData({
      table_id,
      applicationId: contentId,
      filename,
      mimeType,
      tabled,
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
    tabled: boolean
  ) => {
    await tableTopMongo.tableText?.uploads.uploadMetaData({
      table_id,
      textId: contentId,
      filename,
      mimeType,
      tabled,
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
