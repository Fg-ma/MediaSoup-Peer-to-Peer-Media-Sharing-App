import { z } from "zod";
import { sanitizationUtils } from "src";
import { onClientMuteType } from "../typeConstant";
import Broadcaster from "./Broadcaster";

class MuteController {
  constructor(private broadcaster: Broadcaster) {}

  private clientMuteSchema = z.object({
    type: z.literal("clientMute"),
    header: z.object({
      tableId: z.string(),
      username: z.string(),
      instance: z.string(),
      producerType: z.enum(["audio", "screenAudio"]),
      producerId: z.string().optional(),
    }),
    data: z.object({
      clientMute: z.boolean(),
    }),
  });

  onClientMute = (event: onClientMuteType) => {
    const safeEvent = sanitizationUtils.sanitizeObject(
      event
    ) as onClientMuteType;
    const validation = this.clientMuteSchema.safeParse(safeEvent);
    if (!validation.success) {
      console.log("Warning, ", event.type, " failed to validate event");
      return;
    }
    const { tableId, username, instance, producerType, producerId } =
      safeEvent.header;
    const { clientMute } = safeEvent.data;

    const msg = {
      type: "clientMuteChange",
      header: {
        username,
        instance,
        producerType,
        producerId,
      },
      data: {
        clientMute,
      },
    };

    this.broadcaster.broadcastToTable(tableId, msg);
  };
}

export default MuteController;
