import { Server as SocketIOServer } from "socket.io";

class Effects {
  constructor(private io: SocketIOServer) {}

  onRequestEffectChange(event: {
    type: "requestEffectChange";
    table_id: string;
    requestedUsername: string;
    requestedInstance: string;
    requestedProducerType: "camera" | "screen" | "audio";
    requestedProducerId: string | undefined;
    effect: string;
    blockStateChange: boolean;
    data: {
      style: string;
      hideBackgroundStyle?: string;
      hideBackgroundColor?: string;
      postProcessStyle?: string;
    };
  }) {
    const msg = {
      type: "effectChangeRequested",
      requestedProducerType: event.requestedProducerType,
      requestedProducerId: event.requestedProducerId,
      effect: event.effect,
      blockStateChange: event.blockStateChange,
      data: event.data,
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
    producerType: "camera" | "screen" | "audio";
    producerId: string | undefined;
    effect: string;
    effectStyle: string;
    blockStateChange: boolean;
  }) {
    const msg = {
      type: "clientEffectChanged",
      username: event.username,
      instance: event.instance,
      producerType: event.producerType,
      producerId: event.producerId,
      effect: event.effect,
      effectStyle: event.effectStyle,
      blockStateChange: event.blockStateChange,
    };

    this.io.to(`table_${event.table_id}`).emit("message", msg);
  }
}

export default Effects;
