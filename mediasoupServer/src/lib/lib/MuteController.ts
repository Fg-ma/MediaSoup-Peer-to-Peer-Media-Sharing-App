import { Server as SocketIOServer } from "socket.io";
import { onClientMuteType } from "../mediasoupTypes";

class MuteController {
  constructor(private io: SocketIOServer) {}

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

    this.io.to(`table_${table_id}`).emit("message", msg);
  };
}

export default MuteController;
