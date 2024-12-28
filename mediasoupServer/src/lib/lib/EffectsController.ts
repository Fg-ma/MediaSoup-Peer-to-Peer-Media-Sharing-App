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
    } = event.header;
    const {
      effect,
      blockStateChange,
      style,
      hideBackgroundStyle,
      hideBackgroundColor,
      postProcessStyle,
    } = event.data;

    const msg = {
      type: "effectChangeRequested",
      header: {
        requestedProducerType,
        requestedProducerId,
      },
      data: {
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
    const { table_id, username, instance, producerType, producerId } =
      event.header;
    const { effect, effectStyle, blockStateChange } = event.data;

    const msg = {
      type: "clientEffectChanged",
      header: {
        username,
        instance,
        producerType,
        producerId,
      },
      data: {
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
    const { table_id, username, instance, producerType, producerId } =
      event.header;
    const { effect, active } = event.data;

    const msg = {
      type: "clientMixEffectActivityChanged",
      header: {
        username,
        instance,
        producerType,
        producerId,
      },
      data: {
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
    } = event.header;
    const { effect, active } = event.data;

    const msg = {
      type: "mixEffectActivityChangeRequested",
      header: {
        requestedProducerType,
        requestedProducerId,
      },
      data: {
        effect,
        active,
      },
    };

    this.io
      .to(`instance_${table_id}_${requestedUsername}_${requestedInstance}`)
      .emit("message", msg);
  };

  onClientMixEffectValueChange = (event: onClientMixEffectValueChangeType) => {
    const { table_id, username, instance, producerType, producerId } =
      event.header;
    const { effect, option, value, styleValue } = event.data;

    const msg = {
      type: "clientMixEffectValueChanged",
      header: {
        username,
        instance,
        producerType,
        producerId,
      },
      data: {
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
    } = event.header;
    const { effect, option, value, styleValue } = event.data;

    const msg = {
      type: "mixEffectValueChangeRequested",
      header: {
        requestedProducerType,
        requestedProducerId,
      },
      data: {
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
