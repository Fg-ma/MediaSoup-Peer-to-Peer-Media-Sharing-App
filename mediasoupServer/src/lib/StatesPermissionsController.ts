import { z } from "zod";
import Broadcaster from "./Broadcaster";
import {
  onPermissionsResponseType,
  onRequestPermissionsType,
} from "../typeConstant";
import { sanitizationUtils } from "src";

class StatesPermissionsController {
  constructor(private broadcaster: Broadcaster) {}

  private requestPermissionsSchema = z.object({
    type: z.literal("requestPermissions"),
    header: z.object({
      tableId: z.string(),
      inquiringUsername: z.string(),
      inquiringInstance: z.string(),
      inquiredUsername: z.string(),
      inquiredInstance: z.string(),
    }),
  });

  onRequestPermissions = (event: onRequestPermissionsType) => {
    const safeEvent = sanitizationUtils.sanitizeObject(
      event
    ) as onRequestPermissionsType;
    const validation = this.requestPermissionsSchema.safeParse(safeEvent);
    if (!validation.success) return;
    const {
      tableId,
      inquiringUsername,
      inquiringInstance,
      inquiredUsername,
      inquiredInstance,
    } = safeEvent.header;

    const msg = {
      type: "permissionsRequested",
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

  private permissionsResponseSchema = z.object({
    type: z.literal("permissionsResponse"),
    header: z.object({
      tableId: z.string(),
      inquiringUsername: z.string(),
      inquiringInstance: z.string(),
      inquiredUsername: z.string(),
      inquiredInstance: z.string(),
    }),
    data: z.object({
      permissions: z.object({
        acceptsCameraEffects: z.boolean(),
        acceptsScreenEffects: z.boolean(),
        acceptsAudioEffects: z.boolean(),
        acceptsPositionScaleRotationManipulation: z.boolean(),
      }),
    }),
  });

  onPermissionsResponse(event: onPermissionsResponseType) {
    const safeEvent = sanitizationUtils.sanitizeObject(
      event
    ) as onPermissionsResponseType;
    const validation = this.permissionsResponseSchema.safeParse(safeEvent);
    if (!validation.success) return;
    const {
      tableId,
      inquiringUsername,
      inquiringInstance,
      inquiredUsername,
      inquiredInstance,
    } = safeEvent.header;
    const { permissions } = safeEvent.data;

    const msg = {
      type: "permissionsResponsed",
      header: {
        inquiredUsername,
        inquiredInstance,
      },
      data: {
        permissions,
      },
    };

    this.broadcaster.broadcastToInstance(
      tableId,
      inquiringUsername,
      inquiringInstance,
      msg
    );
  }
}

export default StatesPermissionsController;
