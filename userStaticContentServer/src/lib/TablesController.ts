import { z } from "zod";
import { v4 as uuidv4 } from "uuid";
import {
  onConnectType,
  onDisconnectType,
  userConnections,
  UserStaticContentWebSocket,
} from "../typeConstant";
import { sanitizationUtils } from "src";

class TablesController {
  constructor() {}

  private connectSchema = z.object({
    type: z.literal("connect"),
    header: z.object({
      userId: z.string(),
      instance: z.string(),
    }),
  });

  onConnect = (ws: UserStaticContentWebSocket, event: onConnectType) => {
    const safeEvent = sanitizationUtils.sanitizeObject(event) as onConnectType;
    const validation = this.connectSchema.safeParse(safeEvent);
    if (!validation.success) {
      console.log("Warning, ", event.type, " failed to validate event");
      return;
    }
    const { userId, instance } = safeEvent.header;

    ws.id = uuidv4();
    ws.userId = userId;
    ws.instance = instance;

    if (!userConnections[userId]) {
      userConnections[userId] = {};
    }

    userConnections[userId][instance] = ws;
  };

  private disconnectSchema = z.object({
    type: z.literal("disconnect"),
    header: z.object({
      userId: z.string(),
      instance: z.string(),
    }),
  });

  onDisconnect = (event: onDisconnectType) => {
    const safeEvent = sanitizationUtils.sanitizeObject(
      event
    ) as onDisconnectType;
    const validation = this.disconnectSchema.safeParse(safeEvent);
    if (!validation.success) {
      console.log("Warning, ", event.type, " failed to validate event");
      return;
    }
    const { userId, instance } = safeEvent.header;

    if (userConnections[userId] && userConnections[userId][instance]) {
      userConnections[userId][instance].close();
    }
  };
}

export default TablesController;
