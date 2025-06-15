import { z } from "zod";
import { v4 as uuidv4 } from "uuid";
import Broadcaster from "./Broadcaster";
import MediasoupCleanup from "./MediasoupCleanup";
import { MediasoupWebSocket, onJoinTableType, tables } from "../typeConstant";
import { sanitizationUtils } from "src";

class Tables {
  constructor(
    private broadcaster: Broadcaster,
    private mediasoupCleanup: MediasoupCleanup
  ) {}

  private joinTableSchema = z.object({
    type: z.literal("joinTable"),
    header: z.object({
      tableId: z.string(),
      username: z.string(),
      instance: z.string(),
    }),
  });

  joinTable = (mediasoupWS: MediasoupWebSocket, event: onJoinTableType) => {
    const safeEvent = sanitizationUtils.sanitizeObject(
      event
    ) as onJoinTableType;
    const validation = this.joinTableSchema.safeParse(safeEvent);
    if (!validation.success) return;
    const { tableId, username, instance } = safeEvent.header;

    mediasoupWS.id = uuidv4();
    mediasoupWS.tableId = tableId;
    mediasoupWS.username = username;
    mediasoupWS.instance = instance;

    if (!tables[tableId]) {
      tables[tableId] = {};
    }
    if (!tables[tableId][username]) {
      tables[tableId][username] = {};
    }

    tables[tableId][username][instance] = mediasoupWS;
  };

  leaveTable = (tableId: string, username: string, instance: string) => {
    if (
      tables[tableId] &&
      tables[tableId][username] &&
      tables[tableId][username][instance]
    ) {
      delete tables[tableId][username][instance];

      if (Object.keys(tables[tableId][username]).length === 0) {
        delete tables[tableId][username];

        if (Object.keys(tables[tableId]).length === 0) {
          delete tables[tableId];
        }
      }
    }

    this.mediasoupCleanup.deleteProducerTransports(tableId, username, instance);

    this.mediasoupCleanup.deleteConsumerTransport(tableId, username, instance);

    this.mediasoupCleanup.releaseWorkers(tableId);

    this.mediasoupCleanup.deleteProducerInstance(tableId, username, instance);

    this.mediasoupCleanup.deleteConsumerInstance(tableId, username, instance);

    this.broadcaster.broadcastToTable(tableId, {
      type: "userLeftTable",
      header: {
        username,
        instance,
      },
    });
  };
}

export default Tables;
