import * as Y from "yjs";
import { v4 as uuidv4 } from "uuid";
import {
  onDocSaveType,
  onDocUpdateType,
  onGetInitialDocStateType,
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

  onGetInitialDocState = async (event: onGetInitialDocStateType) => {
    const { tableId, username, instance, contentId, instanceId } = event.header;

    const ops = await tableTopRedis.gets.lrange(
      `LTE:${tableId}:${contentId}:${instanceId}`
    );

    if (ops.length === 0) {
      const headerObj = {
        type: "initialDocResponded",
        header: { contentId, instanceId },
      };
      const headerStr = JSON.stringify(headerObj);
      const encoder = new TextEncoder();
      const headerBytes = encoder.encode(headerStr);
      const headerLen = headerBytes.length;

      // 2) Allocate a buffer: 1 for prefix + 4 bytes for length + header + data
      const message = new Uint8Array(4 + headerLen);

      // 3) Write header length LE
      new DataView(message.buffer).setUint32(0, headerLen, true);

      // 4) Copy in the header bytes, then the data bytes
      message.set(headerBytes, 4);

      this.broadcaster.broadcastToInstance(
        tableId,
        username,
        instance,
        message,
        true
      );
      return;
    }

    const ydoc = new Y.Doc();
    for (const op of ops) {
      try {
        const updateObj = JSON.parse(op);
        const update = Uint8Array.from(Object.values(updateObj));
        Y.applyUpdate(ydoc, update);
      } catch (_e) {
        console.warn("Invalid Yjs update in Redis:", op);
      }
    }

    const payload = Y.encodeStateAsUpdate(ydoc);

    // 1) Build the JSON header
    const headerObj = {
      type: "initialDocResponded",
      header: { contentId, instanceId },
    };
    const headerStr = JSON.stringify(headerObj);
    const encoder = new TextEncoder();
    const headerBytes = encoder.encode(headerStr);
    const headerLen = headerBytes.length;

    // 2) Allocate a buffer: 1 for prefix + 4 bytes for length + header + data
    const message = new Uint8Array(4 + headerLen + payload.length);

    // 3) Write header length LE
    new DataView(message.buffer).setUint32(0, headerLen, true);

    // 4) Copy in the header bytes, then the data bytes
    message.set(headerBytes, 4);
    message.set(payload, 4 + headerLen);

    this.broadcaster.broadcastToInstance(
      tableId,
      username,
      instance,
      message,
      true
    );
  };

  onDocUpdate = async (event: onDocUpdateType) => {
    const { tableId, username, instance, contentId, instanceId } = event.header;
    const { payload } = event.data;

    // 1) Build the JSON header
    const headerObj = { type: "docUpdated", header: { contentId, instanceId } };
    const headerStr = JSON.stringify(headerObj);
    const encoder = new TextEncoder();
    const headerBytes = encoder.encode(headerStr);
    const headerLen = headerBytes.length;

    // 2) Allocate a buffer: 1 for prefix + 4 bytes for length + header + data
    const message = new Uint8Array(4 + headerLen + payload.length);

    // 3) Write header length LE
    new DataView(message.buffer).setUint32(0, headerLen, true);

    // 4) Copy in the header bytes, then the data bytes
    message.set(headerBytes, 4);
    message.set(payload, 4 + headerLen);

    await tableTopRedis.posts.rpush(
      `LTE:${tableId}:${contentId}:${instanceId}`,
      JSON.stringify(payload)
    );

    this.broadcaster.broadcastToTable(
      tableId,
      message,
      [{ username, instance }],
      true
    );
  };

  onDocSave = async (event: onDocSaveType) => {
    const { tableId, contentId, instanceId } = event.header;

    const ops = await tableTopRedis.gets.lrange(
      `LTE:${tableId}:${contentId}:${instanceId}`
    );
    console.log(ops);
    // save to ceph here

    this.broadcaster.broadcastToTable(tableId, {
      type: "docSaved",
      header: { contentId },
    });
  };
}

export default LiveTextEditingController;
