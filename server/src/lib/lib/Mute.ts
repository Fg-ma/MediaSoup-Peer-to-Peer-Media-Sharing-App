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

  onClientMuteStateResponse(event: {
    type: string;
    table_id: string;
    username: string;
    instance: string;
    producerUsername: string;
    producerInstance: string;
  }) {
    const msg = {
      type: "clientMuteStateResponsed",
      producerUsername: event.producerUsername,
      producerInstance: event.producerInstance,
    };
    this.io
      .to(`instance_${event.table_id}_${event.username}_${event.instance}`)
      .emit("message", msg);
  }

  onRequestClientMuteState(event: {
    type: string;
    table_id: string;
    username: string;
    instance: string;
    producerUsername: string;
    producerInstance: string;
  }) {
    const msg = {
      type: "clientMuteStateRequested",
      username: event.username,
      instance: event.instance,
    };
    this.io
      .to(
        `instance_${event.table_id}_${event.producerUsername}_${event.producerInstance}`
      )
      .emit("message", msg);
  }

  onSendLocalMuteChange(event: {
    type: string;
    table_id: string;
    username: string;
    instance: string;
  }) {
    const msg = {
      type: "localMuteChange",
    };
    this.io
      .to(`instance_${event.table_id}_${event.username}_${event.instance}`)
      .emit("message", msg);
  }
}

export default Mute;
