import {
  onClientClearEffectsType,
  onClientEffectChangeType,
  onClientMixEffectActivityChangeType,
  onClientMixEffectValueChangeType,
  onRequestClearEffectsType,
  onRequestEffectChangeType,
  onRequestMixEffectActivityChangeType,
  onRequestMixEffectValueChangeType,
} from "../typeConstant";
import Broadcaster from "./Broadcaster";

class EffectsController {
  constructor(private broadcaster: Broadcaster) {}

  onRequestEffectChange = (event: onRequestEffectChangeType) => {
    const {
      tableId,
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
      tableId,
      requestedUsername,
      requestedInstance,
      msg
    );
  };

  onClientEffectChange = (event: onClientEffectChangeType) => {
    const { tableId, username, instance, producerType, producerId } =
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

    this.broadcaster.broadcastToTable(tableId, msg);
  };

  onClientMixEffectActivityChange = (
    event: onClientMixEffectActivityChangeType
  ) => {
    const { tableId, username, instance, producerType, producerId } =
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

    this.broadcaster.broadcastToTable(tableId, msg);
  };

  onRequestMixEffectActivityChange = (
    event: onRequestMixEffectActivityChangeType
  ) => {
    const {
      tableId,
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
      tableId,
      requestedUsername,
      requestedInstance,
      msg
    );
  };

  onClientMixEffectValueChange = (event: onClientMixEffectValueChangeType) => {
    const { tableId, username, instance, producerType, producerId } =
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

    this.broadcaster.broadcastToTable(tableId, msg);
  };

  onRequestMixEffectValueChange = (
    event: onRequestMixEffectValueChangeType
  ) => {
    const {
      tableId,
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
      tableId,
      requestedUsername,
      requestedInstance,
      msg
    );
  };

  onRequestClearEffects = (event: onRequestClearEffectsType) => {
    const {
      tableId,
      requestedUsername,
      requestedInstance,
      requestedProducerType,
      requestedProducerId,
    } = event.header;

    const msg = {
      type: "requestedClearEffects",
      header: {
        requestedProducerType,
        requestedProducerId,
      },
    };

    this.broadcaster.broadcastToInstance(
      tableId,
      requestedUsername,
      requestedInstance,
      msg
    );
  };

  onClientClearEffects = (event: onClientClearEffectsType) => {
    const { tableId, username, instance, producerType, producerId } =
      event.header;

    const msg = {
      type: "clientClearedEffects",
      header: {
        username,
        instance,
        producerType,
        producerId,
      },
    };

    this.broadcaster.broadcastToTable(tableId, msg);
  };
}

export default EffectsController;
