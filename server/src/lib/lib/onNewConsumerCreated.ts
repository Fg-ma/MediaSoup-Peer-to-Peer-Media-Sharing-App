import { Server as SocketIOServer } from "socket.io";

const onNewConsumerCreated = (
  event: {
    type: string;
    username: string;
    roomName: string;
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
  io.to(`${event.roomName}_${event.username}`).emit("message", msg);
};

export default onNewConsumerCreated;
