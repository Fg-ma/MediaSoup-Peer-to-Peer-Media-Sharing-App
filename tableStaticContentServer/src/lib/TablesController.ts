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
    const { table_id, username, instance } = event.header;

    ws.id = uuidv4();
    ws.table_id = table_id;
    ws.username = username;
    ws.instance = instance;

    if (!tables[table_id]) {
      tables[table_id] = {};
    }
    if (!tables[table_id][username]) {
      tables[table_id][username] = {};
    }

    tables[table_id][username][instance] = ws;

    this.broadcaster.broadcastToTable(table_id, {
      type: "userJoinedTable",
      header: {
        table_id,
        username,
        instance,
      },
    });
  };

  onLeaveTable = (event: onLeaveTableType) => {
    const { table_id, username, instance } = event.header;

    if (
      tables[table_id] &&
      tables[table_id][username] &&
      tables[table_id][username][instance]
    ) {
      tables[table_id][username][instance].close();
    }

    this.broadcaster.broadcastToTable(table_id, {
      type: "userLeftTable",
      header: { table_id, username, instance },
    });
  };
}

export default TablesController;
