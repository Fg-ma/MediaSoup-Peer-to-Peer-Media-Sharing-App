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
    const {
      table_id,
      requestedUsername,
      requestedInstance,
      requestedProducerType,
      requestedProducerId,
      effect,
      blockStateChange,
      style,
      hideBackgroundStyle,
      hideBackgroundColor,
      postProcessStyle,
    } = event.data;

    const msg = {
      type: "effectChangeRequested",
      data: {
        requestedProducerType,
        requestedProducerId,
        effect,
        blockStateChange,
        style,
        hideBackgroundStyle,
        hideBackgroundColor,
        postProcessStyle,
      },
    };

    this.io
      .to(`instance_${table_id}_${requestedUsername}_${requestedInstance}`)
      .emit("message", msg);
  };

  onClientEffectChange = (event: onClientEffectChangeType) => {
    const {
      table_id,
      username,
      instance,
      producerType,
      producerId,
      effect,
      effectStyle,
      blockStateChange,
    } = event.data;

    const msg = {
      type: "clientEffectChanged",
      data: {
        username,
        instance,
        producerType,
        producerId,
        effect,
        effectStyle,
        blockStateChange,
      },
    };

    this.io.to(`table_${table_id}`).emit("message", msg);
  };

  onClientMixEffectActivityChange = (
    event: onClientMixEffectActivityChangeType
  ) => {
    const {
      table_id,
      username,
      instance,
      producerType,
      producerId,
      effect,
      active,
    } = event.data;

    const msg = {
      type: "clientMixEffectActivityChanged",
      data: {
        username,
        instance,
        producerType,
        producerId,
        effect,
        active,
      },
    };

    this.io.to(`table_${table_id}`).emit("message", msg);
  };

  onRequestMixEffectActivityChange = (
    event: onRequestMixEffectActivityChangeType
  ) => {
    const {
      table_id,
      requestedUsername,
      requestedInstance,
      requestedProducerType,
      requestedProducerId,
      effect,
      active,
    } = event.data;

    const msg = {
      type: "mixEffectActivityChangeRequested",
      data: {
        requestedProducerType,
        requestedProducerId,
        effect,
        active,
      },
    };

    this.io
      .to(`instance_${table_id}_${requestedUsername}_${requestedInstance}`)
      .emit("message", msg);
  };

  onClientMixEffectValueChange = (event: onClientMixEffectValueChangeType) => {
    const {
      table_id,
      username,
      instance,
      producerType,
      producerId,
      effect,
      option,
      value,
      styleValue,
    } = event.data;

    const msg = {
      type: "clientMixEffectValueChanged",
      data: {
        username,
        instance,
        producerType,
        producerId,
        effect,
        option,
        value,
        styleValue,
      },
    };

    this.io.to(`table_${table_id}`).emit("message", msg);
  };

  onRequestMixEffectValueChange = (
    event: onRequestMixEffectValueChangeType
  ) => {
    const {
      table_id,
      requestedUsername,
      requestedInstance,
      requestedProducerType,
      requestedProducerId,
      effect,
      option,
      value,
      styleValue,
    } = event.data;

    const msg = {
      type: "mixEffectValueChangeRequested",
      data: {
        requestedProducerType,
        requestedProducerId,
        effect,
        option,
        value,
        styleValue,
      },
    };

    this.io
      .to(`instance_${table_id}_${requestedUsername}_${requestedInstance}`)
      .emit("message", msg);
  };
}

export default EffectsController;
