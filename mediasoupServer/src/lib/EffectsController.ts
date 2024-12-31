import {
  onClientEffectChangeType,
  onClientMixEffectActivityChangeType,
  onClientMixEffectValueChangeType,
  onRequestEffectChangeType,
  onRequestMixEffectActivityChangeType,
  onRequestMixEffectValueChangeType,
} from "../typeConstant";
import Broadcaster from "./Broadcaster";

class EffectsController {
  constructor(private broadcaster: Broadcaster) {}

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

    this.broadcaster.broadcastToInstance(
      table_id,
      requestedUsername,
      requestedInstance,
      msg
    );
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

    this.broadcaster.broadcastToTable(table_id, msg);
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

    this.broadcaster.broadcastToTable(table_id, msg);
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

    this.broadcaster.broadcastToInstance(
      table_id,
      requestedUsername,
      requestedInstance,
      msg
    );
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

    this.broadcaster.broadcastToTable(table_id, msg);
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

    this.broadcaster.broadcastToInstance(
      table_id,
      requestedUsername,
      requestedInstance,
      msg
    );
  };
}

export default EffectsController;
