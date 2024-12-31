import { v4 as uuidv4 } from "uuid";
import Broadcaster from "./Broadcaster";
import MediasoupCleanup from "./MediasoupCleanup";
import { MediasoupWebSocket, onJoinTableType, tables } from "../typeConstant";

class Tables {
  constructor(
    private broadcaster: Broadcaster,
    private mediasoupCleanup: MediasoupCleanup
  ) {}

  joinTable = (mediasoupWS: MediasoupWebSocket, event: onJoinTableType) => {
    const { table_id, username, instance } = event.header;

    mediasoupWS.id = uuidv4();
    mediasoupWS.table_id = table_id;
    mediasoupWS.username = username;
    mediasoupWS.instance = instance;

    if (!tables[table_id]) {
      tables[table_id] = {};
    }
    if (!tables[table_id][username]) {
      tables[table_id][username] = {};
    }

    tables[table_id][username][instance] = mediasoupWS;
  };

  leaveTable = (table_id: string, username: string, instance: string) => {
    if (
      tables[table_id] &&
      tables[table_id][username] &&
      tables[table_id][username][instance]
    ) {
      delete tables[table_id][username][instance];

      if (Object.keys(tables[table_id][username]).length === 0) {
        delete tables[table_id][username];

        if (Object.keys(tables[table_id]).length === 0) {
          delete tables[table_id];
        }
      }
    }

    this.mediasoupCleanup.deleteProducerTransports(
      table_id,
      username,
      instance
    );

    this.mediasoupCleanup.deleteConsumerTransport(table_id, username, instance);

    this.mediasoupCleanup.releaseWorkers(table_id);

    this.mediasoupCleanup.deleteProducerInstance(table_id, username, instance);

    this.mediasoupCleanup.deleteConsumerInstance(table_id, username, instance);

    this.broadcaster.broadcastToTable(table_id, {
      type: "userLeftTable",
      header: {
        username,
        instance,
      },
    });
  };
}

export default Tables;
