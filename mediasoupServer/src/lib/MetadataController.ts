import { z } from "zod";
import {
  onBundleMetadataResponseType,
  onRequestBundleMetadataType,
  onRequestCatchUpDataType,
  onResponseCatchUpDataType,
  ProducerTypesArray,
} from "../typeConstant";
import Broadcaster from "./Broadcaster";
import { sanitizationUtils } from "src";
import {
  UserEffectsSchema,
  UserEffectsStylesSchema,
} from "../../../universal/effectsTypeConstant";

class MetadataController {
  constructor(private broadcaster: Broadcaster) {}

  private requestBundleMetadataSchema = z.object({
    type: z.literal("requestBundleMetadata"),
    header: z.object({
      tableId: z.string(),
      inquiringUsername: z.string(),
      inquiringInstance: z.string(),
      inquiredUsername: z.string(),
      inquiredInstance: z.string(),
    }),
  });

  onRequestBundleMetadata = (event: onRequestBundleMetadataType) => {
    const safeEvent = sanitizationUtils.sanitizeObject(
      event
    ) as onRequestBundleMetadataType;
    const validation = this.requestBundleMetadataSchema.safeParse(safeEvent);
    if (!validation.success) {
      console.log("Warning, ", event.type, " failed to validate event");
      return;
    }
    const {
      tableId,
      inquiringUsername,
      inquiringInstance,
      inquiredUsername,
      inquiredInstance,
    } = safeEvent.header;

    const msg = {
      type: "bundleMetadataRequested",
      header: {
        inquiringUsername,
        inquiringInstance,
      },
    };

    this.broadcaster.broadcastToInstance(
      tableId,
      inquiredUsername,
      inquiredInstance,
      msg
    );
  };

  private bundleMetadataResponseSchema = z.object({
    type: z.literal("bundleMetadataResponse"),
    header: z.object({
      tableId: z.string(),
      inquiringUsername: z.string(),
      inquiringInstance: z.string(),
      inquiredUsername: z.string(),
      inquiredInstance: z.string(),
    }),
    data: z.object({
      clientMute: z.boolean(),
      streamEffects: UserEffectsSchema,
      userEffectsStyles: UserEffectsStylesSchema,
    }),
  });

  onBundleMetadataResponse = (event: onBundleMetadataResponseType) => {
    const safeEvent = sanitizationUtils.sanitizeObject(
      event
    ) as onBundleMetadataResponseType;
    const validation = this.bundleMetadataResponseSchema.safeParse(safeEvent);
    if (!validation.success) {
      console.log("Warning, ", event.type, " failed to validate event");
      return;
    }
    const {
      tableId,
      inquiringUsername,
      inquiringInstance,
      inquiredUsername,
      inquiredInstance,
    } = safeEvent.header;
    const { clientMute, streamEffects, userEffectsStyles } = safeEvent.data;

    const msg = {
      type: "bundleMetadataResponsed",
      header: {
        inquiredUsername,
        inquiredInstance,
      },
      data: {
        clientMute,
        streamEffects,
        userEffectsStyles,
      },
    };

    this.broadcaster.broadcastToInstance(
      tableId,
      inquiringUsername,
      inquiringInstance,
      msg
    );
  };

  private requestCatchUpDataSchema = z.object({
    type: z.literal("requestCatchUpData"),
    header: z.object({
      tableId: z.string(),
      inquiringUsername: z.string(),
      inquiringInstance: z.string(),
      inquiredUsername: z.string(),
      inquiredInstance: z.string(),
      inquiredType: z.enum(ProducerTypesArray),
      inquiredProducerId: z.string().optional(),
    }),
  });

  onRequestCatchUpData = (event: onRequestCatchUpDataType) => {
    const safeEvent = sanitizationUtils.sanitizeObject(
      event
    ) as onRequestCatchUpDataType;
    const validation = this.requestCatchUpDataSchema.safeParse(safeEvent);
    if (!validation.success) {
      console.log("Warning, ", event.type, " failed to validate event");
      return;
    }
    const {
      tableId,
      inquiringUsername,
      inquiringInstance,
      inquiredUsername,
      inquiredInstance,
      inquiredType,
      inquiredProducerId,
    } = safeEvent.header;

    const msg = {
      type: "requestedCatchUpData",
      header: {
        inquiringUsername,
        inquiringInstance,
        inquiredType,
        inquiredProducerId,
      },
    };

    this.broadcaster.broadcastToInstance(
      tableId,
      inquiredUsername,
      inquiredInstance,
      msg
    );
  };

  private responseCatchUpDataSchema = z.object({
    type: z.literal("responseCatchUpData"),
    header: z.object({
      tableId: z.string(),
      inquiringUsername: z.string(),
      inquiringInstance: z.string(),
      inquiredUsername: z.string(),
      inquiredInstance: z.string(),
      inquiredType: z.enum(ProducerTypesArray),
      inquiredProducerId: z.string().optional(),
    }),
    data: z
      .object({
        paused: z.boolean(),
        timeEllapsed: z.number(),
        positioning: z.object({
          position: z
            .object({
              left: z.number(),
              top: z.number(),
            })
            .optional(),
          scale: z
            .object({
              x: z.number(),
              y: z.number(),
            })
            .optional(),
          rotation: z.number().optional(),
        }),
      })
      .or(
        z.object({
          positioning: z.object({
            position: z
              .object({
                left: z.number(),
                top: z.number(),
              })
              .optional(),
            scale: z
              .object({
                x: z.number(),
                y: z.number(),
              })
              .optional(),
            rotation: z.number().optional(),
          }),
        })
      )
      .optional(),
  });

  onResponseCatchUpData = (event: onResponseCatchUpDataType) => {
    const safeEvent = sanitizationUtils.sanitizeObject(
      event
    ) as onResponseCatchUpDataType;
    const validation = this.responseCatchUpDataSchema.safeParse(safeEvent);
    if (!validation.success) {
      console.log("Warning, ", event.type, " failed to validate event");
      return;
    }
    const {
      tableId,
      inquiringUsername,
      inquiringInstance,
      inquiredUsername,
      inquiredInstance,
      inquiredType,
      inquiredProducerId,
    } = safeEvent.header;

    const msg = {
      type: "responsedCatchUpData",
      header: {
        inquiredUsername,
        inquiredInstance,
        inquiredType,
        inquiredProducerId,
      },
      data: safeEvent.data,
    };

    this.broadcaster.broadcastToInstance(
      tableId,
      inquiringUsername,
      inquiringInstance,
      msg
    );
  };
}

export default MetadataController;
