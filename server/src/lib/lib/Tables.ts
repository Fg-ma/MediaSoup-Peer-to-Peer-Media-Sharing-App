import { Server as SocketIOServer } from "socket.io";
import { MediasoupSocket } from "../mediasoupTypes";
import {
  roomProducerTransports,
  roomConsumerTransports,
  roomProducers,
  roomConsumers,
  workersMap,
} from "../mediasoupVars";
import { releaseWorker } from "../workerManager";

class Tables {
  private socket: MediasoupSocket;
  private io: SocketIOServer;

  constructor(socket: MediasoupSocket, io: SocketIOServer) {
    this.socket = socket;
    this.io = io;
  }

  join(table_id: string, username: string) {
    this.socket.join(table_id);
    this.socket.join(`${table_id}_${username}`);

    this.socket.table_id = table_id;
    this.socket.username = username;
  }

  leave(table_id: string, username: string) {
    this.socket.leave(table_id);
    this.socket.leave(`${table_id}_${username}`);

    this.socket.table_id = "";
    this.socket.username = "";

    if (
      roomProducerTransports[table_id] &&
      roomProducerTransports[table_id][username]
    ) {
      delete roomProducerTransports[table_id][username];
    }

    if (
      roomConsumerTransports[table_id] &&
      roomConsumerTransports[table_id][username]
    ) {
      delete roomConsumerTransports[table_id][username];
    }

    if (
      (!roomProducerTransports ||
        (roomProducerTransports[table_id] &&
          Object.keys(roomProducerTransports[table_id]).length === 0)) &&
      (!roomConsumerTransports ||
        (roomConsumerTransports[table_id] &&
          Object.keys(roomConsumerTransports[table_id]).length === 0))
    ) {
      releaseWorker(workersMap[table_id]);
      delete workersMap[table_id];
    }

    if (roomProducers[table_id] && roomProducers[table_id][username]) {
      delete roomProducers[table_id][username];
    }

    if (roomConsumers[table_id] && roomConsumers[table_id][username]) {
      delete roomConsumers[table_id][username];
    }

    for (const username in roomConsumers[table_id]) {
      for (const producerUsername in roomConsumers[table_id][username]) {
        if (
          producerUsername === username &&
          roomConsumers[table_id] &&
          roomConsumers[table_id][username]
        ) {
          delete roomConsumers[table_id][username][username];
        }
      }
    }

    this.io.to(table_id).emit("userLeftTable", username);
  }

  disconnect() {
    if (this.socket.table_id && this.socket.username) {
      this.socket.leave(this.socket.table_id);
      this.socket.leave(`${this.socket.table_id}_${this.socket.username}`);

      if (
        roomProducerTransports[this.socket.table_id] &&
        roomProducerTransports[this.socket.table_id][this.socket.username]
      ) {
        delete roomProducerTransports[this.socket.table_id][
          this.socket.username
        ];
      }

      if (
        roomConsumerTransports[this.socket.table_id] &&
        roomConsumerTransports[this.socket.table_id][this.socket.username]
      ) {
        delete roomConsumerTransports[this.socket.table_id][
          this.socket.username
        ];
      }

      if (
        (!roomProducerTransports ||
          (roomProducerTransports[this.socket.table_id] &&
            Object.keys(roomProducerTransports[this.socket.table_id]).length ===
              0)) &&
        (!roomConsumerTransports ||
          (roomConsumerTransports[this.socket.table_id] &&
            Object.keys(roomConsumerTransports[this.socket.table_id]).length ===
              0))
      ) {
        releaseWorker(workersMap[this.socket.table_id]);
        delete workersMap[this.socket.table_id];
      }

      if (
        roomProducers[this.socket.table_id] &&
        roomProducers[this.socket.table_id][this.socket.username]
      ) {
        delete roomProducers[this.socket.table_id][this.socket.username];
      }

      if (
        roomConsumers[this.socket.table_id] &&
        roomConsumers[this.socket.table_id][this.socket.username]
      ) {
        delete roomConsumers[this.socket.table_id][this.socket.username];
      }

      for (const username in roomConsumers[this.socket.table_id]) {
        for (const producerUsername in roomConsumers[this.socket.table_id][
          username
        ]) {
          if (
            producerUsername === this.socket.username &&
            roomConsumers[this.socket.table_id] &&
            roomConsumers[this.socket.table_id][username]
          ) {
            delete roomConsumers[this.socket.table_id][username][
              this.socket.username
            ];
          }
        }
      }

      this.io
        .to(this.socket.table_id)
        .emit("userDisconnected", this.socket.username);
    }
  }
}

export default Tables;
