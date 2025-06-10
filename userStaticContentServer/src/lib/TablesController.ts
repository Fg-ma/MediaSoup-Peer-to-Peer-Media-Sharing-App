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

  onConnect = (ws: UserStaticContentWebSocket, event: onConnectType) => {
    const safeEvent = sanitizationUtils.sanitizeObject(event) as onConnectType;
    const { userId, instance } = safeEvent.header;

    ws.id = uuidv4();
    ws.userId = userId;
    ws.instance = instance;

    if (!userConnections[userId]) {
      userConnections[userId] = {};
    }

    userConnections[userId][instance] = ws;
  };

  onDisconnect = (event: onDisconnectType) => {
    const safeEvent = sanitizationUtils.sanitizeObject(
      event
    ) as onDisconnectType;
    const { userId, instance } = safeEvent.header;

    if (userConnections[userId] && userConnections[userId][instance]) {
      userConnections[userId][instance].close();
    }
  };
}

export default TablesController;
