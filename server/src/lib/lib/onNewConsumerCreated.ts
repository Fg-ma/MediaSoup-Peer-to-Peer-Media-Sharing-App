import { Server as SocketIOServer } from "socket.io";

const onNewConsumerCreated = (
  event: {
    type: string;
    username: string;
    table_id: string;
    producerUsername: string;
    consumerId?: string;
    consumerType: string;
  },
  io: SocketIOServer
) => {
  const msg = {
    type: "newConsumerWasCreated",
    producerUsername: event.producerUsername,
    consumerId: event.consumerId,
    consumerType: event.consumerType,
  };
  io.to(`${event.table_id}_${event.username}`).emit("message", msg);
};

export default onNewConsumerCreated;
