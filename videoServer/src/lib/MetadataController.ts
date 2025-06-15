import { z } from "zod";
import { tableTopMongo, tableTopRedis, sanitizationUtils } from "src";
import {
  onDeleteUploadSessionType,
  onRequestCatchUpVideoMetadataType,
  onSignalReuploadStartType,
  onUpdateVideoMetadataType,
} from "../typeConstant";
import Broadcaster from "./Broadcaster";
import { UploadSession } from "../posts/lib/typeConstant";

class MetadataController {
  constructor(private broadcaster: Broadcaster) {}

  private updateVideoMetadataSchema = z.object({
    type: z.literal("updateVideoMetadata"),
    header: z.object({
      tableId: z.string(),
      contentId: z.string(),
      instanceId: z.string(),
    }),
    data: z.object({
      isPlaying: z.boolean(),
      videoPosition: z.number(),
      videoPlaybackSpeed: z.number(),
      ended: z.boolean(),
    }),
  });

  onUpdateVideoMetadata = async (event: onUpdateVideoMetadataType) => {
    const safeEvent = sanitizationUtils.sanitizeObject(
      event
    ) as onUpdateVideoMetadataType;
    const validation = this.updateVideoMetadataSchema.safeParse(safeEvent);
    if (!validation.success) return;
    const { tableId, contentId, instanceId } = safeEvent.header;
    const { isPlaying, videoPosition, videoPlaybackSpeed, ended } =
      safeEvent.data;

    const data = {
      isPlaying,
      lastKnownPosition: videoPosition,
      videoPlaybackSpeed,
      ended,
      lastUpdatedAt: Date.now(),
    };

    await tableTopRedis.posts.post(
      "VVM",
      `${tableId}:${contentId}:${instanceId}`,
      data,
      -1
    );

    const msg = {
      type: "updatedVideoMetadata",
      header: { contentId, instanceId },
      data,
    };
    this.broadcaster.broadcastToTable(tableId, msg);
  };

  private requestCatchUpVideoMetadataSchema = z.object({
    type: z.literal("requestCatchUpVideoMetadata"),
    header: z.object({
      tableId: z.string(),
      username: z.string(),
      instance: z.string(),
      contentId: z.string(),
      instanceId: z.string(),
    }),
  });

  onRequestCatchUpVideoMetadata = async (
    event: onRequestCatchUpVideoMetadataType
  ) => {
    const safeEvent = sanitizationUtils.sanitizeObject(
      event
    ) as onRequestCatchUpVideoMetadataType;
    const validation =
      this.requestCatchUpVideoMetadataSchema.safeParse(safeEvent);
    if (!validation.success) return;
    const { tableId, username, instance, contentId, instanceId } =
      safeEvent.header;

    const redisData = await tableTopRedis.gets.getKey(
      `VVM:${tableId}:${contentId}:${instanceId}`
    );

    if (redisData !== null) {
      this.broadcaster.broadcastToInstance(tableId, username, instance, {
        type: "respondedCatchUpVideoMetadata",
        header: {
          contentId,
          instanceId,
        },
        data: redisData,
      });
    } else {
      const mongoData =
        await tableTopMongo.tableVideos?.gets.getVideoMetaDataBy_TID_VID(
          tableId,
          contentId
        );

      if (mongoData) {
        const instanceData = mongoData.instances.find(
          (ins) => ins.videoInstanceId === instanceId
        );

        if (instanceData) {
          const finalData = {
            isPlaying: instanceData.meta.isPlaying,
            lastKnownPosition: instanceData.meta.lastKnownPosition,
            videoPlaybackSpeed: instanceData.meta.videoPlaybackSpeed,
            ended: instanceData.meta.ended,
            lastUpdatedAt: Date.now(),
          };

          await tableTopRedis.posts.post(
            "VVM",
            `${tableId}:${contentId}:${instanceId}`,
            finalData,
            -1
          );

          this.broadcaster.broadcastToInstance(tableId, username, instance, {
            type: "respondedCatchUpVideoMetadata",
            header: {
              contentId,
              instanceId,
            },
            data: finalData,
          });
        }
      }
    }
  };

  private deleteUploadSessionSchema = z.object({
    type: z.literal("deleteUploadSession"),
    header: z.object({
      uploadId: z.string(),
      contentId: z.string(),
    }),
  });

  onDeleteUploadSession = async (event: onDeleteUploadSessionType) => {
    const safeEvent = sanitizationUtils.sanitizeObject(
      event
    ) as onDeleteUploadSessionType;
    const validation = this.deleteUploadSessionSchema.safeParse(safeEvent);
    if (!validation.success) return;
    const { uploadId, contentId } = safeEvent.header;

    const session = (await tableTopRedis.gets.get(
      "VUS",
      `${contentId}:${uploadId}`
    )) as UploadSession;

    await tableTopRedis.deletes.delete(
      [
        { prefix: "VUS", id: `${contentId}:${uploadId}` },
        { prefix: "VCS", id: uploadId },
        session?.direction === "reupload"
          ? { prefix: "VRU", id: session.contentId }
          : undefined,
      ].filter((del) => del !== undefined)
    );
  };

  private signalReuploadStartSchema = z.object({
    type: z.literal("signalReuploadStart"),
    header: z.object({
      tableId: z.string(),
      contentId: z.string(),
    }),
  });

  onSignalReuploadStart = async (event: onSignalReuploadStartType) => {
    const safeEvent = sanitizationUtils.sanitizeObject(
      event
    ) as onSignalReuploadStartType;
    const validation = this.signalReuploadStartSchema.safeParse(safeEvent);
    if (!validation.success) return;
    const { tableId, contentId } = safeEvent.header;

    this.broadcaster.broadcastToTable(tableId, {
      type: "reuploadStarted",
      header: {
        contentId: contentId,
      },
    });
  };
}

export default MetadataController;
