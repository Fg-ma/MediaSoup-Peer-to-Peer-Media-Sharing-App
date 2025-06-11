import { Worker, Job } from "bullmq";
import path from "path";
import fs from "fs/promises";
import { spawn } from "child_process";
import { broadcaster, tableTopCeph, tableTopMongo, tableTopRedis } from "src";
import {
  StaticMimeTypes,
  TableContentStateTypes,
} from "../../../../universal/contentTypeConstant";
import {
  defaultVideoEffects,
  defaultVideoEffectsStyles,
} from "../../../../universal/effectsTypeConstant";
import { redisConnection } from "./queues";

const handleToTable = async (
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
  await handleMongoVideoUploads(
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
};

const handleReupload = (tableId: string, contentId: string) => {
  broadcaster.broadcastToTable(tableId, {
    type: "contentReuploaded",
    header: { contentId },
  });
};

const handleToTabled = async (
  tableId: string,
  contentId: string,
  mimeType: StaticMimeTypes,
  completeFilename: string,
  state: TableContentStateTypes[]
) => {
  await handleMongoVideoUploads(
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
};

const handleMongoVideoUploads = async (
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
            meta: {
              isPlaying: false,
              lastKnownPosition: 0,
              videoPlaybackSpeed: 1,
              ended: true,
            },
          },
        ]
      : [],
  });
};

const isReencodingNeeded = async (filePath: string): Promise<boolean> => {
  return new Promise((resolve, reject) => {
    const probe = spawn("ffprobe", [
      "-v",
      "error",
      "-select_streams",
      "v:0",
      "-show_entries",
      "stream=codec_name",
      "-of",
      "default=noprint_wrappers=1:nokey=1",
      filePath,
    ]);

    let codec = "";
    probe.stdout.on("data", (data) => {
      codec += data.toString();
    });

    probe.on("close", () => {
      resolve(codec.trim() !== "h264");
    });

    probe.on("error", reject);
  });
};

enum TranscodeStep {
  Start = "Start",
  CheckEncoding = "CheckEncoding",
  ReEncode = "ReEncode",
  TranscodeHLS = "TranscodeHLS",
  GenerateThumbnail = "GenerateThumbnail",
  UploadHLS = "UploadHLS",
  UploadMP4 = "UploadMP4",
  UploadThumbnail = "UploadThumbnail",
}

new Worker(
  "videoTranscodeQueue",
  async (
    job: Job<{
      tableId: string;
      username: string;
      instance: string;
      uploadId: string | undefined;
      tmpDir: string;
      fileExtension: string;
      contentId: string;
      filename: string;
      direction: "toTable" | "reupload" | "toTabled";
      mimeType: StaticMimeTypes;
      instanceId: string;
      state: [];
    }>
  ) => {
    let currentStep: TranscodeStep = TranscodeStep.Start;

    const checkAbort = async () => {
      const videoJob = await tableTopRedis.gets.getKey(`VVJ:${contentId}`);

      if (videoJob && videoJob.state === "cancelled") {
        throw new Error(`Aborted at step: ${currentStep}`);
      }
    };

    const {
      tableId,
      username,
      instance,
      uploadId,
      tmpDir,
      fileExtension,
      contentId,
      filename,
      direction,
      ...sessionMeta
    } = job.data;

    broadcaster.broadcastToInstance(tableId, username, instance, {
      type: "processingProgress",
      header: { contentId },
      data: { progress: 0 },
    });

    const inputPath = path.join(tmpDir, `input${fileExtension}`);
    const hlsDir = path.join(tmpDir, "hls");
    const mp4Path = path.join(tmpDir, "output.mp4");
    const thumbnailPath = path.join(tmpDir, "thumbnail.jpg");

    try {
      await fs.mkdir(hlsDir);

      currentStep = TranscodeStep.CheckEncoding;
      const needsEncoding = await isReencodingNeeded(inputPath);
      await checkAbort();

      broadcaster.broadcastToInstance(tableId, username, instance, {
        type: "processingProgress",
        header: { contentId },
        data: { progress: 0.1 },
      });

      // Re-encode only if needed
      if (needsEncoding) {
        currentStep = TranscodeStep.ReEncode;
        await new Promise((resolve, reject) => {
          const ffmpeg = spawn("ffmpeg", [
            "-i",
            inputPath,
            "-vf",
            "scale=trunc(iw/2)*2:trunc(ih/2)*2",
            "-c:v",
            "libx264",
            "-preset",
            "veryfast",
            "-crf",
            "28",
            "-c:a",
            "aac",
            "-b:a",
            "96k",
            "-movflags",
            "+faststart",
            mp4Path,
          ]);
          ffmpeg.on("close", (code) => {
            if (code !== 0) {
              return reject(new Error(`FFmpeg exited with code ${code}`));
            }
            resolve(null);
          });
          ffmpeg.on("error", (error) => {
            return reject(new Error(`FFmpeg exited with error ${error}`));
          });
        });
        await checkAbort();
      } else {
        await fs.copyFile(inputPath, mp4Path);
      }

      broadcaster.broadcastToInstance(tableId, username, instance, {
        type: "processingProgress",
        header: { contentId },
        data: { progress: 0.4 },
      });

      currentStep = TranscodeStep.TranscodeHLS;
      await new Promise((resolve, reject) => {
        const ffmpeg = spawn("ffmpeg", [
          "-i",
          mp4Path,
          "-preset",
          "veryfast",
          "-crf",
          "28",
          "-g",
          "48",
          "-sc_threshold",
          "0",
          "-c:v",
          "libx264",
          "-c:a",
          "aac",
          "-b:a",
          "96k",
          "-f",
          "hls",
          "-hls_time",
          "6",
          "-hls_playlist_type",
          "vod",
          path.join(hlsDir, "index.m3u8"),
        ]);
        ffmpeg.on("close", resolve);
        ffmpeg.on("error", reject);
      });
      await checkAbort();

      broadcaster.broadcastToInstance(tableId, username, instance, {
        type: "processingProgress",
        header: { contentId },
        data: { progress: 0.7 },
      });

      currentStep = TranscodeStep.GenerateThumbnail;
      await new Promise((resolve, reject) => {
        const ffmpeg = spawn("ffmpeg", [
          "-ss",
          "00:00:01", // 1 second in
          "-i",
          mp4Path,
          "-vf",
          "scale=iw*sar:ih",
          "-frames:v",
          "1",
          "-q:v",
          "2", // quality
          thumbnailPath,
        ]);
        ffmpeg.on("close", (code) => {
          if (code !== 0) {
            return reject(
              new Error(`Thumbnail FFmpeg exited with code ${code}`)
            );
          }
          resolve(null);
        });
        ffmpeg.on("error", (error) => {
          return reject(new Error(`Thumbnail FFmpeg error: ${error}`));
        });
      });
      await checkAbort();

      broadcaster.broadcastToInstance(tableId, username, instance, {
        type: "processingProgress",
        header: { contentId },
        data: { progress: 0.8 },
      });

      // Upload to Ceph
      currentStep = TranscodeStep.UploadHLS;
      const files = await fs.readdir(hlsDir);
      for (const file of files) {
        const content = await fs.readFile(path.join(hlsDir, file));
        await tableTopCeph.posts.uploadFile(
          "table-videos",
          `${contentId}/hls/${file}`,
          content
        );
      }
      await checkAbort();

      broadcaster.broadcastToInstance(tableId, username, instance, {
        type: "processingProgress",
        header: { contentId },
        data: { progress: 0.9 },
      });

      currentStep = TranscodeStep.UploadMP4;
      const mp4Content = await fs.readFile(mp4Path);
      await tableTopCeph.posts.uploadFile(
        "table-videos",
        `${contentId}/video.mp4`,
        mp4Content
      );
      await checkAbort();

      broadcaster.broadcastToInstance(tableId, username, instance, {
        type: "processingProgress",
        header: { contentId },
        data: { progress: 0.925 },
      });

      currentStep = TranscodeStep.UploadThumbnail;
      const thumbBuffer = await fs.readFile(thumbnailPath);
      await tableTopCeph.posts.uploadFile(
        "table-videos",
        `${contentId}/thumbnail.jpg`,
        thumbBuffer
      );
      await checkAbort();

      broadcaster.broadcastToInstance(tableId, username, instance, {
        type: "processingProgress",
        header: { contentId },
        data: { progress: 0.95 },
      });

      switch (direction) {
        case "toTable":
          await handleToTable(
            tableId,
            contentId,
            sessionMeta.instanceId,
            sessionMeta.mimeType,
            filename,
            sessionMeta.state
          );
          break;
        case "reupload":
          handleReupload(tableId, contentId);
          break;
        case "toTabled":
          await handleToTabled(
            tableId,
            contentId,
            sessionMeta.mimeType,
            filename,
            sessionMeta.state
          );
          break;
      }

      broadcaster.broadcastToInstance(tableId, username, instance, {
        type: "processingProgress",
        header: { contentId },
        data: { progress: 0.975 },
      });

      // Cleanup
      await fs.rm(tmpDir, { recursive: true, force: true });

      const redisDeletes = [
        { prefix: "VVJ", id: contentId },
        ...(uploadId
          ? [
              { prefix: "VUS", id: uploadId },
              { prefix: "VCS", id: uploadId },
            ]
          : []),
        direction === "reupload" ? { prefix: "VRU", id: contentId } : undefined,
      ].filter((del) => del !== undefined);
      await tableTopRedis.deletes.delete(redisDeletes);

      broadcaster.broadcastToInstance(tableId, username, instance, {
        type: "processingFinished",
        header: { contentId },
      });
    } catch {
      const cleanupHLS = async () => {
        const files = await fs.readdir(hlsDir);
        for (const file of files) {
          await tableTopCeph.deletes.deleteFile(
            "table-videos",
            `${contentId}/hls/${file}`
          );
        }
      };

      const cleanupMP4 = async () => {
        await tableTopCeph.deletes.deleteFile(
          "table-videos",
          `${contentId}/video.mp4`
        );
      };

      const cleanupThumbnail = async () => {
        await tableTopCeph.deletes.deleteFile(
          "table-videos",
          `${contentId}/thumbnail.jpg`
        );
      };

      switch (currentStep) {
        case TranscodeStep.Start:
          break;
        case TranscodeStep.CheckEncoding:
          break;
        case TranscodeStep.ReEncode:
          break;
        case TranscodeStep.TranscodeHLS:
          break;
        case TranscodeStep.GenerateThumbnail:
          break;
        case TranscodeStep.UploadHLS:
          await cleanupHLS();
          break;
        case TranscodeStep.UploadMP4:
          await cleanupHLS();
          await cleanupMP4();
          break;
        case TranscodeStep.UploadThumbnail:
          await cleanupHLS();
          await cleanupMP4();
          await cleanupThumbnail();
          break;
        default:
          break;
      }

      await fs.rm(tmpDir, { recursive: true, force: true });

      const redisDeletes = [
        { prefix: "VVJ", id: contentId },
        ...(uploadId
          ? [
              { prefix: "VUS", id: uploadId },
              { prefix: "VCS", id: uploadId },
            ]
          : []),
        direction === "reupload" ? { prefix: "VRU", id: contentId } : undefined,
      ].filter((del) => del !== undefined);
      await tableTopRedis.deletes.delete(redisDeletes);
    }
  },
  { connection: redisConnection }
);
