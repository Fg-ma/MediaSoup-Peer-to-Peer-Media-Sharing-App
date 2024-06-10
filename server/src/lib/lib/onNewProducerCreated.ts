import { Server as SocketIOServer } from "socket.io";

const onNewProducerCreated = (
  event: {
    type: string;
    username: string;
    table_id: string;
    producerType: "webcam" | "screen" | "audio";
    producerId: string | undefined;
  },
  io: SocketIOServer
) => {
  const msg = {
    type: "newProducerWasCreated",
    producerType: event.producerType,
    producerId: event.producerId,
  };
  io.to(`${event.table_id}_${event.username}`).emit("message", msg);
};

export default onNewProducerCreated;
