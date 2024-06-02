import { Server as SocketIOServer } from "socket.io";

const onMuteLock = (
  event: {
    type: string;
    isMuteLock: boolean;
    table_id: string;
    username: string;
  },
  io: SocketIOServer
) => {
  const msg = {
    type: "muteLockChange",
    isMuteLock: event.isMuteLock,
    username: event.username,
  };
  io.to(event.table_id).emit("message", msg);
};

export default onMuteLock;
