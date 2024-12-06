import { Server as SocketIOServer } from "socket.io";
import {
  onClientEffectChangeType,
  onRequestEffectChangeType,
} from "../mediasoupTypes";

class EffectsController {
  constructor(private io: SocketIOServer) {}

  onRequestEffectChange(event: onRequestEffectChangeType) {
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

  onClientEffectChange(event: onClientEffectChangeType) {
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

export default EffectsController;
