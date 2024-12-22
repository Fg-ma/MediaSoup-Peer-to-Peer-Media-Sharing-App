import { Server as SocketIOServer } from "socket.io";
import { onClientMuteType } from "../mediasoupTypes";

class MuteController {
  constructor(private io: SocketIOServer) {}

  onClientMute = (event: onClientMuteType) => {
    const { table_id, username, instance, clientMute } = event.data;

    const msg = {
      type: "clientMuteChange",
      data: {
        username,
        instance,
        clientMute,
      },
    };

    this.io.to(`table_${table_id}`).emit("message", msg);
  };
}

export default MuteController;
