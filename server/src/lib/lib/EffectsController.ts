import { Server as SocketIOServer } from "socket.io";
import {
  onClientEffectChangeType,
  onClientMixEffectActivityChangeType,
  onClientMixEffectValueChangeType,
  onRequestEffectChangeType,
  onRequestMixEffectActivityChangeType,
  onRequestMixEffectValueChangeType,
} from "../mediasoupTypes";

class EffectsController {
  constructor(private io: SocketIOServer) {}

  onRequestEffectChange = (event: onRequestEffectChangeType) => {
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
  };

  onClientEffectChange = (event: onClientEffectChangeType) => {
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
  };

  onClientMixEffectActivityChange = (
    event: onClientMixEffectActivityChangeType
  ) => {
    const msg = {
      type: "clientMixEffectActivityChanged",
      username: event.username,
      instance: event.instance,
      producerType: event.producerType,
      producerId: event.producerId,
      effect: event.effect,
      active: event.active,
    };

    this.io.to(`table_${event.table_id}`).emit("message", msg);
  };

  onRequestMixEffectActivityChange = (
    event: onRequestMixEffectActivityChangeType
  ) => {
    const msg = {
      type: "mixEffectActivityChangeRequested",
      requestedProducerType: event.requestedProducerType,
      requestedProducerId: event.requestedProducerId,
      effect: event.effect,
      active: event.active,
    };

    this.io
      .to(
        `instance_${event.table_id}_${event.requestedUsername}_${event.requestedInstance}`
      )
      .emit("message", msg);
  };

  onClientMixEffectValueChange = (event: onClientMixEffectValueChangeType) => {
    const msg = {
      type: "clientMixEffectValueChanged",
      username: event.username,
      instance: event.instance,
      producerType: event.producerType,
      producerId: event.producerId,
      effect: event.effect,
      option: event.option,
      value: event.value,
      styleValue: event.styleValue,
    };

    this.io.to(`table_${event.table_id}`).emit("message", msg);
  };

  onRequestMixEffectValueChange = (
    event: onRequestMixEffectValueChangeType
  ) => {
    const msg = {
      type: "mixEffectValueChangeRequested",
      requestedProducerType: event.requestedProducerType,
      requestedProducerId: event.requestedProducerId,
      effect: event.effect,
      option: event.option,
      value: event.value,
      styleValue: event.styleValue,
    };

    this.io
      .to(
        `instance_${event.table_id}_${event.requestedUsername}_${event.requestedInstance}`
      )
      .emit("message", msg);
  };
}

export default EffectsController;
