import { tableTopMongo } from "src";
import { onMuteStylesRequestType } from "../typeConstant";
import Broadcaster from "./Broadcaster";

class MetadataController {
  constructor(private broadcaster: Broadcaster) {}

  onMuteStylesRequest = async (event: onMuteStylesRequestType) => {
    const { userId, instance } = event.header;

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
}

export default MetadataController;
