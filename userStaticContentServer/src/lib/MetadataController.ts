import { z } from "zod";
import { tableTopMongo, tableTopRedis, sanitizationUtils } from "src";
import {
  contentTypeBucketMap,
  encodedCephBucketMap,
  onDeleteUploadSessionType,
  onMuteStylesRequestType,
} from "../typeConstant";
import Broadcaster from "./Broadcaster";
import { StaticContentTypesArray } from "../../../universal/contentTypeConstant";

class MetadataController {
  constructor(private broadcaster: Broadcaster) {}

  private muteStylesRequestSchema = z.object({
    type: z.literal("muteStylesRequest"),
    header: z.object({
      userId: z.string(),
      instance: z.string(),
    }),
  });

  onMuteStylesRequest = async (event: onMuteStylesRequestType) => {
    const safeEvent = sanitizationUtils.sanitizeObject(
      event
    ) as onMuteStylesRequestType;
    const validation = this.muteStylesRequestSchema.safeParse(safeEvent);
    if (!validation.success) {
      console.log("Warning, ", event.type, " failed to validate event");
      return;
    }
    const { userId, instance } = safeEvent.header;
    const userSvgs = await tableTopMongo.userSvgs?.gets.getAllBy_UID(userId);

    if (userSvgs)
      this.broadcaster.broadcastToInstance(userId, instance, {
        type: "muteStylesResponse",
        data: {
          svgs: userSvgs.filter((userSvg) =>
            userSvg.state.includes("muteStyle")
          ),
        },
      });
  };

  private deleteUploadSessionSchema = z.object({
    type: z.literal("deleteUploadSession"),
    header: z.object({
      uploadId: z.string(),
      contentId: z.string(),
      contentType: z.enum(StaticContentTypesArray),
    }),
  });

  onDeleteUploadSession = async (event: onDeleteUploadSessionType) => {
    const safeEvent = sanitizationUtils.sanitizeObject(
      event
    ) as onDeleteUploadSessionType;
    const validation = this.deleteUploadSessionSchema.safeParse(safeEvent);
    if (!validation.success) {
      console.log("Warning, ", event.type, " failed to validate event");
      return;
    }
    const { uploadId, contentId, contentType } = safeEvent.header;

    await tableTopRedis.deletes.delete([
      {
        prefix: "USCUS",
        id: `${
          encodedCephBucketMap[contentTypeBucketMap[contentType]]
        }:${contentId}:${uploadId}`,
      },
      { prefix: "USCCS", id: uploadId },
    ]);
  };
}

export default MetadataController;
