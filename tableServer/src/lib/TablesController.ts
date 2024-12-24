import { v4 as uuidv4 } from "uuid";
import {
  onChangeTableBackgroundType,
  onJoinTableType,
  onLeaveTableType,
  tables,
  TableWebSocket,
} from "../typeConstant";
import Broadcaster from "./Broadcaster";

class TablesController {
  constructor(private broadcaster: Broadcaster) {}

  onJoinTable = (ws: TableWebSocket, event: onJoinTableType) => {
    const { table_id, username, instance } = event.header;

    if (!tables[table_id]) {
      tables[table_id] = {};
    }
    if (!tables[table_id][username]) {
      tables[table_id][username] = {};
    }

    tables[table_id][username][instance] = ws;

    ws.id = uuidv4();
    ws.table_id = table_id;
    ws.username = username;
    ws.instance = instance;

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

  onChangeTableBackgroundType = (event: onChangeTableBackgroundType) => {
    const { table_id, username, instance } = event.header;
    const { background } = event.data;

    this.broadcaster.broadcastToTable(
      table_id,
      {
        type: "tableBackgroundChanged",
        data: { background },
      },
      [{ username, instance }]
    );
  };
}

export default TablesController;
