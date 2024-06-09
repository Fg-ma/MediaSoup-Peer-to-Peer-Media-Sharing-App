import { Server as SocketIOServer } from "socket.io";

const onRequestBlur = (
  event: {
    type: string;
    table_id: string;
    username: string;
    producerId: string;
  },
  io: SocketIOServer
) => {
  const msg = {
    type: "acceptBlur",
    producerId: event.producerId,
  };
  io.to(`${event.table_id}_${event.username}`).emit("message", msg);
};

export default onRequestBlur;
