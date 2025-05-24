import { v4 as uuidv4 } from "uuid";
import {
  onDocSaveType,
  onDocUpdateType,
  onJoinTableType,
  onLeaveTableType,
  tables,
  TableWebSocket,
} from "../typeConstant";
import Broadcaster from "./Broadcaster";
import { tableTopRedis } from "src";

class LiveTextEditingController {
  constructor(private broadcaster: Broadcaster) {}

  onJoinTable = (ws: TableWebSocket, event: onJoinTableType) => {
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
  };

  onDocUpdate = async (event: onDocUpdateType) => {
    const { tableId, contentId } = event.header;
    const { payload } = event.data;

    await redis.rpush(`LTE:${docId}:ops`, JSON.stringify(payload));
    await tableTopRedis.posts.post(
      `LTE:${tableId}:${contentId}`,
      JSON.stringify(payload)
    );

    this.broadcaster.broadcastToTable(tableId, payload);
  };

  onDocSave = async (event: onDocSaveType) => {
    // On user-triggered save, fetch ops and dump full content to Ceph
    if (!docId) return;
    const allOps = await redis.lrange(`doc:${docId}:ops`, 0, -1);
    // For simplicity, assume payload contains full text
    const content = payload.fullText;
    await saveToCeph(docId, content);
    ws.send(JSON.stringify({ type: "saved", docId }));
  };
}

export default LiveTextEditingController;
