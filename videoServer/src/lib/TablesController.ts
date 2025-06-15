import { z } from "zod";
import { v4 as uuidv4 } from "uuid";
import {
  onJoinTableType,
  onLeaveTableType,
  tables,
  VideoWebSocket,
} from "../typeConstant";
import Broadcaster from "./Broadcaster";
import { sanitizationUtils } from "src";

class TablesController {
  constructor(private broadcaster: Broadcaster) {}

  private joinTableSchema = z.object({
    type: z.literal("joinTable"),
    header: z.object({
      tableId: z.string(),
      username: z.string(),
      instance: z.string(),
    }),
  });

  onJoinTable = (ws: VideoWebSocket, event: onJoinTableType) => {
    const safeEvent = sanitizationUtils.sanitizeObject(
      event
    ) as onJoinTableType;
    const validation = this.joinTableSchema.safeParse(safeEvent);
    if (!validation.success) return;
    const { tableId, username, instance } = safeEvent.header;

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

  private leaveTableSchema = z.object({
    type: z.literal("leaveTable"),
    header: z.object({
      tableId: z.string(),
      username: z.string(),
      instance: z.string(),
    }),
  });

  onLeaveTable = (event: onLeaveTableType) => {
    const safeEvent = sanitizationUtils.sanitizeObject(
      event
    ) as onLeaveTableType;
    const validation = this.leaveTableSchema.safeParse(safeEvent);
    if (!validation.success) return;
    const { tableId, username, instance } = safeEvent.header;

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
