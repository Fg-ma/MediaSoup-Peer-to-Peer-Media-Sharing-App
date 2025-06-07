import { v4 as uuidv4 } from "uuid";
import {
  onJoinTableType,
  onLeaveTableType,
  tables,
  TableStaticContentWebSocket,
} from "../typeConstant";
import Broadcaster from "./Broadcaster";

class TablesController {
  constructor(private broadcaster: Broadcaster) {}

  onJoinTable = (ws: TableStaticContentWebSocket, event: onJoinTableType) => {
    const { tableId, username, instance } = event.header;

    ws.id = uuidv4();
    ws.tableId = tableId;
    ws.username = username;
    ws.instance = instance;

    if (!tables[tableId]) {
      tables[tableId] = {};
    }
    if (!tables[tableId][username]) {
      tables[tableId][username] = {};
    }

    tables[tableId][username][instance] = ws;

    this.broadcaster.broadcastToTable(tableId, {
      type: "userJoinedTable",
      header: {
        tableId,
        username,
        instance,
      },
    });
  };

  onLeaveTable = (event: onLeaveTableType) => {
    const { tableId, username, instance } = event.header;

    if (
      tables[tableId] &&
      tables[tableId][username] &&
      tables[tableId][username][instance]
    ) {
      tables[tableId][username][instance].close();
    }

    this.broadcaster.broadcastToTable(tableId, {
      type: "userLeftTable",
      header: { tableId, username, instance },
    });
  };
}

export default TablesController;
