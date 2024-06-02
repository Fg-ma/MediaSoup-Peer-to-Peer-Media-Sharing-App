import { Server as SocketIOServer } from "socket.io";

const onSendMuteRequest = (
  event: {
    type: string;
    table_id: string;
    username: string;
  },
  io: SocketIOServer
) => {
  const msg = {
    type: "muteRequest",
  };
  io.to(`${event.table_id}_${event.username}`).emit("message", msg);
};

export default onSendMuteRequest;
