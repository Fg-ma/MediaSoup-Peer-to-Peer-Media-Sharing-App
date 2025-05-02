import { onClientMuteType } from "../typeConstant";
import Broadcaster from "./Broadcaster";

class MuteController {
  constructor(private broadcaster: Broadcaster) {}

  onClientMute = (event: onClientMuteType) => {
    const { tableId, username, instance, producerType, producerId } =
      event.header;
    const { clientMute } = event.data;

    const msg = {
      type: "clientMuteChange",
      header: {
        username,
        instance,
        producerType,
        producerId,
      },
      data: {
        clientMute,
      },
    };

    this.broadcaster.broadcastToTable(tableId, msg);
  };
}

export default MuteController;
