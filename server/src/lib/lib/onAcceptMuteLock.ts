import { Server as SocketIOServer } from "socket.io";

const onAcceptMuteLock = (
  event: {
    type: string;
    roomName: string;
    username: string;
    producerUsername: string;
  },
  io: SocketIOServer
) => {
  const msg = {
    type: "acceptedMuteLock",
    producerUsername: event.producerUsername,
  };
  io.to(`${event.roomName}_${event.username}`).emit("message", msg);
};

export default onAcceptMuteLock;
