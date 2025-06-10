import { tableTopMongo, tableTopRedis, sanitizationUtils } from "src";
import {
  onDeleteUploadSessionType,
  onMuteStylesRequestType,
} from "../typeConstant";
import Broadcaster from "./Broadcaster";

class MetadataController {
  constructor(private broadcaster: Broadcaster) {}

  onMuteStylesRequest = async (event: onMuteStylesRequestType) => {
    const safeEvent = sanitizationUtils.sanitizeObject(
      event
    ) as onMuteStylesRequestType;
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

  onDeleteUploadSession = async (event: onDeleteUploadSessionType) => {
    const safeEvent = sanitizationUtils.sanitizeObject(
      event
    ) as onDeleteUploadSessionType;
    const { uploadId } = safeEvent.header;

    await tableTopRedis.deletes.delete([
      { prefix: "USCUS", id: uploadId },
      { prefix: "USCCS", id: uploadId },
    ]);
  };
}

export default MetadataController;
