import { Server as SocketIOServer } from "socket.io";
import { MediasoupSocket } from "../mediasoupTypes";
import MediasoupCleanup from "./MediasoupCleanup";

class Tables {
  private mediasoupCleanup: MediasoupCleanup;

  constructor(private socket: MediasoupSocket, private io: SocketIOServer) {
    this.mediasoupCleanup = new MediasoupCleanup();
  }

  join(table_id: string, username: string, instance: string) {
    this.socket.join(`table_${table_id}`);
    this.socket.join(`user_${table_id}_${username}`);
    this.socket.join(`instance_${table_id}_${username}_${instance}`);

    this.socket.table_id = table_id;
    this.socket.username = username;
    this.socket.instance = instance;
  }

  leave(table_id: string, username: string, instance: string) {
    this.socket.leave(`table_${table_id}`);
    this.socket.leave(`user_${table_id}_${username}`);
    this.socket.leave(`instance_${table_id}_${username}_${instance}`);

    this.socket.table_id = "";
    this.socket.username = "";
    this.socket.instance = "";

    this.mediasoupCleanup.deleteProducerTransports(
      table_id,
      username,
      instance
    );

    this.mediasoupCleanup.deleteConsumerTransport(table_id, username, instance);

    this.mediasoupCleanup.releaseWorkers(table_id);

    this.mediasoupCleanup.deleteProducer(table_id, username, instance);

    this.mediasoupCleanup.deleteConsumer(table_id, username, instance);

    this.io.to(`table_${table_id}`).emit("userLeftTable", username);
  }

  disconnect() {
    if (
      !this.socket.table_id ||
      !this.socket.username ||
      !this.socket.instance
    ) {
      return;
    }

    this.socket.leave(`table_${this.socket.table_id}`);
    this.socket.leave(`user_${this.socket.table_id}_${this.socket.username}`);
    this.socket.leave(
      `instance_${this.socket.table_id}_${this.socket.username}_${this.socket.instance}`
    );

    this.mediasoupCleanup.deleteProducerTransports(
      this.socket.table_id,
      this.socket.username,
      this.socket.instance
    );

    this.mediasoupCleanup.deleteConsumerTransport(
      this.socket.table_id,
      this.socket.username,
      this.socket.instance
    );

    this.mediasoupCleanup.releaseWorkers(this.socket.table_id);

    this.mediasoupCleanup.deleteProducer(
      this.socket.table_id,
      this.socket.username,
      this.socket.instance
    );

    this.mediasoupCleanup.deleteConsumer(
      this.socket.table_id,
      this.socket.username,
      this.socket.instance
    );

    this.io
      .to(`table_${this.socket.table_id}`)
      .emit("userDisconnected", this.socket.username, this.socket.instance);
  }
}

export default Tables;
