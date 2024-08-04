import { Server as SocketIOServer } from "socket.io";

class Mute {
  private io: SocketIOServer;

  constructor(io: SocketIOServer) {
    this.io = io;
  }

  onClientMute(event: {
    type: string;
    table_id: string;
    username: string;
    clientMute: boolean;
  }) {
    const msg = {
      type: "clientMuteChange",
      username: event.username,
      clientMute: event.clientMute,
    };
    this.io.to(event.table_id).emit("message", msg);
  }

  onClientMuteStateResponse(event: {
    type: string;
    table_id: string;
    username: string;
    producerUsername: string;
  }) {
    const msg = {
      type: "clientMuteStateResponsed",
      producerUsername: event.producerUsername,
    };
    this.io.to(`${event.table_id}_${event.username}`).emit("message", msg);
  }

  onRequestClientMuteState(event: {
    type: string;
    table_id: string;
    username: string;
    producerUsername: string;
  }) {
    const msg = {
      type: "clientMuteStateRequested",
      username: event.username,
    };
    this.io
      .to(`${event.table_id}_${event.producerUsername}`)
      .emit("message", msg);
  }

  onSendLocalMuteChange(event: {
    type: string;
    table_id: string;
    username: string;
  }) {
    const msg = {
      type: "localMuteChange",
    };
    this.io.to(`${event.table_id}_${event.username}`).emit("message", msg);
  }
}

export default Mute;
