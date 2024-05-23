import { Server as SocketIOServer } from "socket.io";

const onRequestMuteLock = (
  event: {
    type: string;
    roomName: string;
    username: string;
    producerUsername: string;
  },
  io: SocketIOServer
) => {
  const msg = {
    type: "requestedMuteLock",
    username: event.username,
  };
  io.to(`${event.roomName}_${event.producerUsername}`).emit("message", msg);
};

export default onRequestMuteLock;
