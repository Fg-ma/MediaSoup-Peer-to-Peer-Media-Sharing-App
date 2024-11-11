import { Server as SocketIOServer } from "socket.io";

class Mute {
  constructor(private io: SocketIOServer) {}

  onClientMute(event: {
    type: string;
    table_id: string;
    username: string;
    instance: string;
    clientMute: boolean;
  }) {
    const msg = {
      type: "clientMuteChange",
      username: event.username,
      instance: event.instance,
      clientMute: event.clientMute,
    };
    this.io.to(`table_${event.table_id}`).emit("message", msg);
  }
}

export default Mute;
