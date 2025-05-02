import { v4 as uuidv4 } from "uuid";
import {
  onConnectType,
  onDisconnectType,
  userConnections,
  UserStaticContentWebSocket,
} from "../typeConstant";

class TablesController {
  constructor() {}

  onConnect = (ws: UserStaticContentWebSocket, event: onConnectType) => {
    const { userId, instance } = event.header;

    ws.id = uuidv4();
    ws.userId = userId;
    ws.instance = instance;

    if (!userConnections[userId]) {
      userConnections[userId] = {};
    }

    userConnections[userId][instance] = ws;
  };

  onDisconnect = (event: onDisconnectType) => {
    const { userId, instance } = event.header;

    if (userConnections[userId] && userConnections[userId][instance]) {
      userConnections[userId][instance].close();
    }
  };
}

export default TablesController;
