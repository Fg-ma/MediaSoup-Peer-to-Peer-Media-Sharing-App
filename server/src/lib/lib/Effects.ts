import { Server as SocketIOServer } from "socket.io";

class Effects {
  private io: SocketIOServer;

  constructor(io: SocketIOServer) {
    this.io = io;
  }

  onRequestEffect(event: {
    type: "requestEffect";
    effect: string;
    table_id: string;
    username: string;
    producerId: string;
  }) {
    const msg = {
      type: "acceptEffect",
      effect: event.effect,
      producerId: event.producerId,
    };
    this.io.to(`user_${event.table_id}_${event.username}`).emit("message", msg);
  }

  onRequestEffectPermissions(event: {
    type: "requestEffectPermissions";
    table_id: string;
    username: string;
    instance: string;
    producerUsername: string;
    producerInstance: string;
  }) {
    const msg = {
      type: "effectPermissionRequest",
      username: event.username,
      instance: event.instance,
    };
    this.io
      .to(
        `instance_${event.table_id}_${event.producerUsername}_${event.producerInstance}`
      )
      .emit("message", msg);
  }
}

export default Effects;
