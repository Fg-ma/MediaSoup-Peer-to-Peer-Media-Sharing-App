import { Server as SocketIOServer } from "socket.io";
import { roomConsumerTransports, roomConsumers } from "../mediasoupVars";

const onUnsubscribe = (
  event: {
    type: string;
    roomName: string;
    username: string;
  },
  io: SocketIOServer
) => {
  if (
    roomConsumerTransports[event.roomName] &&
    roomConsumerTransports[event.roomName][event.username]
  ) {
    delete roomConsumerTransports[event.roomName][event.username];
  }

  if (
    roomConsumers[event.roomName] &&
    roomConsumers[event.roomName][event.username]
  ) {
    delete roomConsumers[event.roomName][event.username];
  }

  const msg = {
    type: "unsubscribed",
  };
  io.to(`${event.roomName}_${event.username}`).emit("message", msg);
};

export default onUnsubscribe;
