import { tableTopMongo, tableTopRedis } from "src";
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

  onUpdateVideoMetadata = async (event: onUpdateVideoMetadataType) => {
    const { tableId, contentId, instanceId } = event.header;
    const { isPlaying, videoPosition, videoPlaybackSpeed } = event.data;

    const data = {
      isPlaying,
      lastKnownPosition: videoPosition,
      videoPlaybackSpeed,
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

  onRequestCatchUpVideoMetadata = async (
    event: onRequestCatchUpVideoMetadataType
  ) => {
    const { tableId, username, instance, contentId, instanceId } = event.header;

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

  onDeleteUploadSession = async (event: onDeleteUploadSessionType) => {
    const { uploadId } = event.header;

    const session = (await tableTopRedis.gets.get(
      "VUS",
      uploadId
    )) as UploadSession;

    await tableTopRedis.deletes.delete(
      [
        { prefix: "VUS", id: uploadId },
        { prefix: "VCS", id: uploadId },
        session?.direction === "reupload"
          ? { prefix: "VRU", id: session.contentId }
          : undefined,
      ].filter((del) => del !== undefined)
    );
  };

  onSignalReuploadStart = async (event: onSignalReuploadStartType) => {
    const { tableId, contentId, contentType } = event.header;

    this.broadcaster.broadcastToTable(tableId, {
      type: "reuploadStarted",
      header: {
        contentType: contentType,
        contentId: contentId,
      },
    });
  };
}

export default MetadataController;
