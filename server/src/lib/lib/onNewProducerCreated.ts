import { Server as SocketIOServer } from "socket.io";

const onNewProducerCreated = (
  event: {
    type: string;
    username: string;
    roomName: string;
    producerType: "webcam" | "screen" | "audio";
  },
  io: SocketIOServer
) => {
  const msg = {
    type: "newProducerWasCreated",
    producerType: event.producerType,
  };
  io.to(`${event.roomName}_${event.username}`).emit("message", msg);
};

export default onNewProducerCreated;
