import { z } from "zod";
import { sanitizationUtils } from "src";
import {
  onClientClearEffectsType,
  onClientEffectChangeType,
  onClientMixEffectActivityChangeType,
  onClientMixEffectValueChangeType,
  onRequestClearEffectsType,
  onRequestEffectChangeType,
  onRequestMixEffectActivityChangeType,
  onRequestMixEffectValueChangeType,
  ProducerTypesArray,
} from "../typeConstant";
import Broadcaster from "./Broadcaster";
import {
  audioEffectStylesSchema,
  AudioMixEffectsTypeArray,
  cameraEffectStylesSchema,
  HideBackgroundEffectTypesArray,
  PostProcessEffectTypesArray,
  screenEffectStylesSchema,
} from "../../../universal/effectsTypeConstant";

class EffectsController {
  constructor(private broadcaster: Broadcaster) {}

  private requestEffectChangeSchema = z.object({
    type: z.literal("requestEffectChange"),
    header: z.object({
      tableId: z.string(),
      requestedUsername: z.string(),
      requestedInstance: z.string(),
      requestedProducerType: z.enum(ProducerTypesArray),
      requestedProducerId: z.string().optional(),
    }),
    data: z.object({
      effect: z.string(),
      blockStateChange: z.boolean(),
      style: z
        .union([
          cameraEffectStylesSchema,
          screenEffectStylesSchema,
          audioEffectStylesSchema,
        ])
        .optional(),
      hideBackgroundStyle: z.enum(HideBackgroundEffectTypesArray).optional(),
      hideBackgroundColor: z.string().optional(),
      postProcessStyle: z.enum(PostProcessEffectTypesArray).optional(),
    }),
  });

  onRequestEffectChange = (event: onRequestEffectChangeType) => {
    const safeEvent = sanitizationUtils.sanitizeObject(event, undefined, [
      "hideBackgroundColor",
      "color",
    ]) as onRequestEffectChangeType;
    const validation = this.requestEffectChangeSchema.safeParse(safeEvent);
    if (!validation.success) {
      console.log("Warning, ", event.type, " failed to validate event");
      return;
    }
    const {
      tableId,
      requestedUsername,
      requestedInstance,
      requestedProducerType,
      requestedProducerId,
    } = safeEvent.header;
    const {
      effect,
      blockStateChange,
      style,
      hideBackgroundStyle,
      hideBackgroundColor,
      postProcessStyle,
    } = safeEvent.data;

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

  private clientEffectChangeSchema = z.object({
    type: z.literal("clientEffectChange"),
    header: z.object({
      tableId: z.string(),
      username: z.string(),
      instance: z.string(),
      producerType: z.enum(ProducerTypesArray),
      producerId: z.string().optional(),
    }),
    data: z.object({
      effect: z.string(),
      effectStyle: z
        .union([
          cameraEffectStylesSchema,
          screenEffectStylesSchema,
          audioEffectStylesSchema,
        ])
        .optional(),
      blockStateChange: z.boolean(),
    }),
  });

  onClientEffectChange = (event: onClientEffectChangeType) => {
    const safeEvent = sanitizationUtils.sanitizeObject(event, undefined, [
      "color",
    ]) as onClientEffectChangeType;
    const validation = this.clientEffectChangeSchema.safeParse(safeEvent);
    if (!validation.success) {
      console.log("Warning, ", event.type, " failed to validate event");
      return;
    }
    const { tableId, username, instance, producerType, producerId } =
      safeEvent.header;
    const { effect, effectStyle, blockStateChange } = safeEvent.data;

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

  private clientMixEffectActivityChangeSchema = z.object({
    type: z.literal("clientMixEffectActivityChange"),
    header: z.object({
      tableId: z.string(),
      username: z.string(),
      instance: z.string(),
      producerType: z.enum(["audio", "screenAudio"]),
      producerId: z.string().optional(),
    }),
    data: z.object({
      effect: z.enum(AudioMixEffectsTypeArray),
      active: z.boolean(),
    }),
  });

  onClientMixEffectActivityChange = (
    event: onClientMixEffectActivityChangeType
  ) => {
    const safeEvent = sanitizationUtils.sanitizeObject(
      event
    ) as onClientMixEffectActivityChangeType;
    const validation =
      this.clientMixEffectActivityChangeSchema.safeParse(safeEvent);
    if (!validation.success) {
      console.log("Warning, ", event.type, " failed to validate event");
      return;
    }
    const { tableId, username, instance, producerType, producerId } =
      safeEvent.header;
    const { effect, active } = safeEvent.data;

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

  private requestMixEffectActivityChangeSchema = z.object({
    type: z.literal("requestMixEffectActivityChange"),
    header: z.object({
      tableId: z.string(),
      requestedUsername: z.string(),
      requestedInstance: z.string(),
      requestedProducerType: z.enum(["audio", "screenAudio"]),
      requestedProducerId: z.string().optional(),
    }),
    data: z.object({
      effect: z.enum(AudioMixEffectsTypeArray),
      active: z.boolean(),
    }),
  });

  onRequestMixEffectActivityChange = (
    event: onRequestMixEffectActivityChangeType
  ) => {
    const safeEvent = sanitizationUtils.sanitizeObject(
      event
    ) as onRequestMixEffectActivityChangeType;
    const validation =
      this.requestMixEffectActivityChangeSchema.safeParse(safeEvent);
    if (!validation.success) {
      console.log("Warning, ", event.type, " failed to validate event");
      return;
    }
    const {
      tableId,
      requestedUsername,
      requestedInstance,
      requestedProducerType,
      requestedProducerId,
    } = safeEvent.header;
    const { effect, active } = safeEvent.data;

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

  private clientMixEffectValueChangeSchema = z.object({
    type: z.literal("clientMixEffectValueChange"),
    header: z.object({
      tableId: z.string(),
      username: z.string(),
      instance: z.string(),
      producerType: z.enum(["audio", "screenAudio"]),
      producerId: z.string().optional(),
    }),
    data: z.object({
      effect: z.enum(AudioMixEffectsTypeArray),
      option: z.string(),
      value: z.number(),
      styleValue: z.number(),
    }),
  });

  onClientMixEffectValueChange = (event: onClientMixEffectValueChangeType) => {
    const safeEvent = sanitizationUtils.sanitizeObject(
      event
    ) as onClientMixEffectValueChangeType;
    const validation =
      this.clientMixEffectValueChangeSchema.safeParse(safeEvent);
    if (!validation.success) {
      console.log("Warning, ", event.type, " failed to validate event");
      return;
    }
    const { tableId, username, instance, producerType, producerId } =
      safeEvent.header;
    const { effect, option, value, styleValue } = safeEvent.data;

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

  private requestMixEffectValueChangeSchema = z.object({
    type: z.literal("requestMixEffectValueChange"),
    header: z.object({
      tableId: z.string(),
      requestedUsername: z.string(),
      requestedInstance: z.string(),
      requestedProducerType: z.enum(["audio", "screenAudio"]),
      requestedProducerId: z.string().optional(),
    }),
    data: z.object({
      effect: z.enum(AudioMixEffectsTypeArray),
      option: z.string(),
      value: z.number(),
      styleValue: z.number(),
    }),
  });

  onRequestMixEffectValueChange = (
    event: onRequestMixEffectValueChangeType
  ) => {
    const safeEvent = sanitizationUtils.sanitizeObject(
      event
    ) as onRequestMixEffectValueChangeType;
    const validation =
      this.requestMixEffectValueChangeSchema.safeParse(safeEvent);
    if (!validation.success) {
      console.log("Warning, ", event.type, " failed to validate event");
      return;
    }
    const {
      tableId,
      requestedUsername,
      requestedInstance,
      requestedProducerType,
      requestedProducerId,
    } = safeEvent.header;
    const { effect, option, value, styleValue } = safeEvent.data;

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

  private requestClearEffectsSchema = z.object({
    type: z.literal("requestClearEffects"),
    header: z.object({
      tableId: z.string(),
      requestedUsername: z.string(),
      requestedInstance: z.string(),
      requestedProducerType: z.enum(ProducerTypesArray),
      requestedProducerId: z.string().optional(),
    }),
  });

  onRequestClearEffects = (event: onRequestClearEffectsType) => {
    const safeEvent = sanitizationUtils.sanitizeObject(
      event
    ) as onRequestClearEffectsType;
    const validation = this.requestClearEffectsSchema.safeParse(safeEvent);
    if (!validation.success) {
      console.log("Warning, ", event.type, " failed to validate event");
      return;
    }
    const {
      tableId,
      requestedUsername,
      requestedInstance,
      requestedProducerType,
      requestedProducerId,
    } = safeEvent.header;

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

  private clientClearEffectsSchema = z.object({
    type: z.literal("clientClearEffects"),
    header: z.object({
      tableId: z.string(),
      username: z.string(),
      instance: z.string(),
      producerType: z.enum(ProducerTypesArray),
      producerId: z.string().optional(),
    }),
  });

  onClientClearEffects = (event: onClientClearEffectsType) => {
    const safeEvent = sanitizationUtils.sanitizeObject(
      event
    ) as onClientClearEffectsType;
    const validation = this.clientClearEffectsSchema.safeParse(safeEvent);
    if (!validation.success) {
      console.log("Warning, ", event.type, " failed to validate event");
      return;
    }
    const { tableId, username, instance, producerType, producerId } =
      safeEvent.header;

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
