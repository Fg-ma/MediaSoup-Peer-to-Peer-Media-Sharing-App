import { Server as SocketIOServer } from "socket.io";

const onAcceptMuteLock = (
  event: {
    type: string;
    table_id: string;
    username: string;
    producerUsername: string;
  },
  io: SocketIOServer
) => {
  const msg = {
    type: "acceptedMuteLock",
    producerUsername: event.producerUsername,
  };
  io.to(`${event.table_id}_${event.username}`).emit("message", msg);
};

export default onAcceptMuteLock;
