import { onClientMuteType } from "../typeConstant";
import Broadcaster from "./Broadcaster";

class MuteController {
  constructor(private broadcaster: Broadcaster) {}

  onClientMute = (event: onClientMuteType) => {
    const { table_id, username, instance } = event.header;
    const { clientMute } = event.data;

    const msg = {
      type: "clientMuteChange",
      header: {
        username,
        instance,
      },
      data: {
        clientMute,
      },
    };

    this.broadcaster.broadcastToTable(table_id, msg);
  };
}

export default MuteController;
