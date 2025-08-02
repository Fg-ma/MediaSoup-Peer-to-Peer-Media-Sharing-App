import { z } from "zod";
import * as Y from "yjs";
import { v4 as uuidv4 } from "uuid";
import {
  onDocSaveType,
  onDocUpdateType,
  onGetInitialDocStateType,
  onGetSavedOpsType,
  onJoinTableType,
  onLeaveTableType,
  tables,
  TableWebSocket,
} from "../typeConstant";
import Broadcaster from "./Broadcaster";
import {
  REDIS_INITIAL_CHUNK_SIZE,
  sanitizationUtils,
  tableTopCeph,
  tableTopMongo,
  tableTopRedis,
} from "src";
import { Readable } from "stream";

class LiveTextEditingController {
  constructor(private broadcaster: Broadcaster) {}

  private joinTableSchema = z.object({
    type: z.literal("joinTable"),
    header: z.object({
      tableId: z.string(),
      username: z.string(),
      instance: z.string(),
    }),
  });

  onJoinTable = async (ws: TableWebSocket, event: onJoinTableType) => {
    const safeEvent = sanitizationUtils.sanitizeObject(
      event
    ) as onJoinTableType;
    const validation = this.joinTableSchema.safeParse(safeEvent);
    if (!validation.success) {
      console.log("Warning, ", event.type, " failed to validate event");
      return;
    }
    const { tableId, username, instance } = safeEvent.header;

    ws.id = uuidv4();
    ws.tableId = tableId;
    ws.username = username;
    ws.instance = instance;

    if (!tables[tableId]) {
      tables[tableId] = {};

      const tableKeys = await tableTopRedis.gets.scanAllKeys(
        `LTE:${tableId}:*:*`
      );

      const promises = [];
      for (const key of tableKeys) {
        promises.push(tableTopRedis.posts.persist(key));
      }
      await Promise.all(promises);
    }
    if (!tables[tableId][username]) {
      tables[tableId][username] = {};
    }

    tables[tableId][username][instance] = ws;
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
    if (!validation.success) {
      console.log("Warning, ", event.type, " failed to validate event");
      return;
    }
    const { tableId, username, instance } = safeEvent.header;

    if (
      tables[tableId] &&
      tables[tableId][username] &&
      tables[tableId][username][instance]
    ) {
      tables[tableId][username][instance].close();
    }
  };

  private getInitialDocStateSchema = z.object({
    type: z.literal("getInitialDocState"),
    header: z.object({
      tableId: z.string(),
      username: z.string(),
      instance: z.string(),
      contentId: z.string(),
      instanceId: z.string(),
    }),
  });

  onGetInitialDocState = async (event: onGetInitialDocStateType) => {
    const safeEvent = sanitizationUtils.sanitizeObject(
      event
    ) as onGetInitialDocStateType;
    const validation = this.getInitialDocStateSchema.safeParse(safeEvent);
    if (!validation.success) {
      console.log("Warning, ", event.type, " failed to validate event");
      return;
    }
    const { tableId, username, instance, contentId, instanceId } =
      safeEvent.header;

    const redisOps = await tableTopRedis.gets.lrange(
      `LTE:${tableId}:${contentId}:${instanceId}`
    );

    if (!redisOps || redisOps.length === 0) {
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

    const ops = redisOps.map((op) =>
      Uint8Array.from(Object.values(JSON.parse(op)))
    );

    let i = 0;
    while (i < ops.length) {
      let totalLength = 0;
      let j = i;

      while (j < ops.length) {
        const op = ops[j];
        const opLength = 4 + op.length;
        if (totalLength + opLength > REDIS_INITIAL_CHUNK_SIZE) break;
        totalLength += opLength;
        j++;
      }

      const sendOps = ops.slice(i, j);

      const opsPayload = new Uint8Array(totalLength);
      let offset = 0;
      for (const op of sendOps) {
        new DataView(opsPayload.buffer).setUint32(offset, op.length, true);
        opsPayload.set(op, offset + 4);
        offset += 4 + op.length;
      }

      const chunkHeaderObj = {
        type: "initialDocResponded",
        header: {
          contentId,
          instanceId,
          lastOps: j >= ops.length,
        },
      };

      const chunkHeaderStr = JSON.stringify(chunkHeaderObj);
      const encoder = new TextEncoder();
      const chunkHeaderBytes = encoder.encode(chunkHeaderStr);
      const chunkHeaderLen = chunkHeaderBytes.length;

      const chunkMessage = new Uint8Array(
        4 + chunkHeaderLen + opsPayload.length
      );
      new DataView(chunkMessage.buffer).setUint32(0, chunkHeaderLen, true);
      chunkMessage.set(chunkHeaderBytes, 4);
      chunkMessage.set(opsPayload, 4 + chunkHeaderLen);

      this.broadcaster.broadcastToInstance(
        tableId,
        username,
        instance,
        chunkMessage,
        true
      );

      i = j;
    }
  };

  private docUpdateSchema = z.object({
    type: z.literal("docUpdate"),
    header: z.object({
      tableId: z.string(),
      username: z.string(),
      instance: z.string(),
      contentId: z.string(),
      instanceId: z.string(),
    }),
    data: z.object({
      payload: z.instanceof(Uint8Array),
    }),
  });

  onDocUpdate = async (event: onDocUpdateType) => {
    const safeEvent = sanitizationUtils.sanitizeObject(
      event
    ) as onDocUpdateType;
    const validation = this.docUpdateSchema.safeParse(safeEvent);
    if (!validation.success) {
      console.log("Warning, ", event.type, " failed to validate event");
      return;
    }
    const { tableId, username, instance, contentId, instanceId } =
      safeEvent.header;
    const { payload } = safeEvent.data;

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

  private getSavedOpsSchema = z.object({
    type: z.literal("getSavedOps"),
    header: z.object({
      tableId: z.string(),
      username: z.string(),
      instance: z.string(),
      contentId: z.string(),
      instanceId: z.string(),
    }),
  });

  onGetSavedOps = async (event: onGetSavedOpsType) => {
    const safeEvent = sanitizationUtils.sanitizeObject(
      event
    ) as onGetSavedOpsType;
    const validation = this.getSavedOpsSchema.safeParse(safeEvent);
    if (!validation.success) {
      console.log("Warning, ", event.type, " failed to validate event");
      return;
    }
    const { tableId, username, instance, contentId, instanceId } =
      safeEvent.header;

    const opsRedisKey = `LTE:${tableId}:${contentId}:${instanceId}`;
    const ops = await tableTopRedis.gets.lrange(opsRedisKey);

    if (ops && ops.length !== 0)
      await this.sendSavedOps(
        "savedOps",
        ops,
        tableId,
        username,
        instance,
        contentId,
        instanceId
      );
  };

  private docSaveSchema = z.object({
    type: z.literal("docSave"),
    header: z.object({
      tableId: z.string(),
      contentId: z.string(),
      instanceId: z.string(),
    }),
  });

  onDocSave = async (event: onDocSaveType) => {
    const safeEvent = sanitizationUtils.sanitizeObject(event) as onDocSaveType;
    const validation = this.docSaveSchema.safeParse(safeEvent);
    if (!validation.success) {
      console.log("Warning, ", event.type, " failed to validate event");
      return;
    }
    const { tableId, contentId, instanceId } = safeEvent.header;

    const savingSessionsKey = `LTE:SS:${tableId}:${contentId}:${instanceId}`;

    const savingSession = await tableTopRedis.gets.getKey(savingSessionsKey);

    if (savingSession) {
      return;
    } else {
      await tableTopRedis.posts.post(
        `LTE:SS:${tableId}:${contentId}`,
        instanceId,
        "true",
        -1
      );
    }

    const opsRedisKey = `LTE:${tableId}:${contentId}:${instanceId}`;

    const ops = await tableTopRedis.gets.lrange(opsRedisKey);
    if (!ops) {
      await tableTopRedis.deletes.deleteKeys([
        `LTE:SS:${tableId}:${contentId}:${instanceId}`,
      ]);

      this.broadcaster.broadcastToTable(tableId, {
        type: "docSavedFail",
        header: { contentId, instanceId },
      });
      return;
    }
    await tableTopRedis.posts.expire(opsRedisKey, 60);

    await this.sendSavedOps(
      "savedOps",
      ops,
      tableId,
      undefined,
      undefined,
      contentId,
      instanceId
    );

    const data = await tableTopCeph.gets.getContent("table-text", contentId);

    if (data?.Body instanceof Readable) {
      const stream = data.Body as Readable;

      const chunks: Buffer[] = [];

      stream
        .on("data", async (chunk: Buffer) => {
          chunks.push(chunk);
        })
        .on("end", async () => {
          const update = Buffer.concat(chunks);

          const ydoc = new Y.Doc();

          Y.applyUpdate(ydoc, update);

          for (const op of ops) {
            const update = Uint8Array.from(Object.values(JSON.parse(op)));
            Y.applyUpdate(ydoc, update);
          }

          const fullUpdate = Y.encodeStateAsUpdate(ydoc);

          const mongo =
            await tableTopMongo.tableText?.gets.getTextMetadataBy_TID_XID(
              tableId,
              contentId
            );

          if (mongo?.state.includes("tabled")) {
            const newContentId = uuidv4();

            await tableTopCeph.posts.uploadFile(
              "table-text",
              newContentId,
              Buffer.from(fullUpdate)
            );

            const instance = mongo.instances.find(
              (instance) => instance.textInstanceId === instanceId
            );
            if (instance) {
              tableTopMongo.tableText?.uploads.uploadMetadata({
                tableId,
                textId: newContentId,
                filename: mongo.filename,
                mimeType: mongo.mimeType,
                state: [],
                instances: [instance],
              });
              tableTopMongo.tableText?.deletes.deleteInstanceBy_TID_XID_XIID(
                tableId,
                contentId,
                instanceId
              );
            }

            await tableTopRedis.deletes.deleteKeys([
              `LTE:SS:${tableId}:${contentId}:${instanceId}`,
            ]);

            this.broadcaster.broadcastToTable(tableId, {
              type: "docSavedNewContent",
              header: { oldContentId: contentId, newContentId, instanceId },
            });
          } else {
            await tableTopCeph.posts.uploadFile(
              "table-text",
              contentId,
              Buffer.from(fullUpdate)
            );

            await tableTopRedis.deletes.deleteKeys([
              `LTE:SS:${tableId}:${contentId}:${instanceId}`,
            ]);

            this.broadcaster.broadcastToTable(tableId, {
              type: "docSaved",
              header: { contentId, instanceId },
            });
          }
        })
        .on("error", async () => {
          await tableTopRedis.deletes.deleteKeys([
            `LTE:SS:${tableId}:${contentId}:${instanceId}`,
          ]);

          this.broadcaster.broadcastToTable(tableId, {
            type: "docSavedFail",
            header: { contentId, instanceId },
          });
        });
    } else {
      await tableTopRedis.deletes.deleteKeys([
        `LTE:SS:${tableId}:${contentId}:${instanceId}`,
      ]);

      this.broadcaster.broadcastToTable(tableId, {
        type: "docSavedFail",
        header: { contentId, instanceId },
      });
    }
  };

  private sendSavedOps = async (
    eventType: "savedOps" | "getSavedOpsResponse",
    redisOps: string[],
    tableId: string,
    username: string | undefined,
    instance: string | undefined,
    contentId: string,
    instanceId: string
  ) => {
    if (redisOps.length === 0) return;

    const ops = redisOps.map((op) =>
      Uint8Array.from(Object.values(JSON.parse(op)))
    );

    let i = 0;
    while (i < ops.length) {
      let totalLength = 0;
      let j = i;

      while (j < ops.length) {
        const op = ops[j];
        const opLength = 4 + op.length;
        if (totalLength + opLength > REDIS_INITIAL_CHUNK_SIZE) break;
        totalLength += opLength;
        j++;
      }

      const sendOps = ops.slice(i, j);

      const opsPayload = new Uint8Array(totalLength);
      let offset = 0;
      for (const op of sendOps) {
        new DataView(opsPayload.buffer).setUint32(offset, op.length, true);
        opsPayload.set(op, offset + 4);
        offset += 4 + op.length;
      }

      const chunkHeaderObj = {
        type: eventType,
        header: {
          contentId,
          instanceId,
          lastOps: j >= ops.length,
        },
      };

      const chunkHeaderStr = JSON.stringify(chunkHeaderObj);
      const encoder = new TextEncoder();
      const chunkHeaderBytes = encoder.encode(chunkHeaderStr);
      const chunkHeaderLen = chunkHeaderBytes.length;

      const chunkMessage = new Uint8Array(
        4 + chunkHeaderLen + opsPayload.length
      );
      new DataView(chunkMessage.buffer).setUint32(0, chunkHeaderLen, true);
      chunkMessage.set(chunkHeaderBytes, 4);
      chunkMessage.set(opsPayload, 4 + chunkHeaderLen);

      if (username && instance) {
        this.broadcaster.broadcastToInstance(
          tableId,
          username,
          instance,
          chunkMessage,
          true
        );
      } else {
        this.broadcaster.broadcastToTable(
          tableId,
          chunkMessage,
          undefined,
          true
        );
      }

      i = j;
    }
  };
}

export default LiveTextEditingController;
