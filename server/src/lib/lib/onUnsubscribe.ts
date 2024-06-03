import { Server as SocketIOServer } from "socket.io";
import {
  roomConsumerTransports,
  roomConsumers,
  roomProducerTransports,
  workersMap,
} from "../mediasoupVars";
import { releaseWorker } from "../workerManager";

const onUnsubscribe = (
  event: {
    type: string;
    table_id: string;
    username: string;
  },
  io: SocketIOServer
) => {
  if (
    roomConsumerTransports[event.table_id] &&
    roomConsumerTransports[event.table_id][event.username]
  ) {
    delete roomConsumerTransports[event.table_id][event.username];
  }

  if (
    (!roomProducerTransports ||
      (roomProducerTransports[event.table_id] &&
        Object.keys(roomProducerTransports[event.table_id]).length === 0)) &&
    (!roomConsumerTransports ||
      (roomConsumerTransports[event.table_id] &&
        Object.keys(roomConsumerTransports[event.table_id]).length === 0))
  ) {
    releaseWorker(workersMap[event.table_id]);
    delete workersMap[event.table_id];
  }

  if (
    roomConsumers[event.table_id] &&
    roomConsumers[event.table_id][event.username]
  ) {
    delete roomConsumers[event.table_id][event.username];
  }

  const msg = {
    type: "unsubscribed",
  };
  io.to(`${event.table_id}_${event.username}`).emit("message", msg);
};

export default onUnsubscribe;
