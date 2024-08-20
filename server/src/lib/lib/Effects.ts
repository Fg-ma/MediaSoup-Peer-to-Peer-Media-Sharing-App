import { Server as SocketIOServer } from "socket.io";

class Effects {
  private io: SocketIOServer;

  constructor(io: SocketIOServer) {
    this.io = io;
  }

  onRequestEffectChange(event: {
    type: "requestEffectChange";
    table_id: string;
    requestedUsername: string;
    requestedInstance: string;
    requestedProducerId: string;
    effect: string;
    effectStyle: any;
  }) {
    const msg = {
      type: "effectChangeRequested",
      requestedProducerId: event.requestedProducerId,
      effect: event.effect,
      effectStyle: event.effectStyle,
    };

    this.io
      .to(
        `instance_${event.table_id}_${event.requestedUsername}_${event.requestedInstance}`
      )
      .emit("message", msg);
  }

  onClientEffectChange(event: {
    type: "clientEffectChange";
    table_id: string;
    username: string;
    instance: string;
    producerId: string;
    effect: string;
    effectStyle: any;
  }) {
    const msg = {
      type: "clientEffectChanged",
      username: event.username,
      instance: event.instance,
      producerId: event.producerId,
      effect: event.effect,
      effectStyle: event.effectStyle,
    };

    this.io.to(`table_${event.table_id}`).emit("message", msg);
  }
}

export default Effects;
