import { Server as SocketIOServer } from "socket.io";
import { onClientMuteType } from "../mediasoupTypes";

class MuteController {
  constructor(private io: SocketIOServer) {}

  onClientMute = (event: onClientMuteType) => {
    const msg = {
      type: "clientMuteChange",
      username: event.username,
      instance: event.instance,
      clientMute: event.clientMute,
    };
    this.io.to(`table_${event.table_id}`).emit("message", msg);
  };
}

export default MuteController;
