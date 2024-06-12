import { Server as SocketIOServer } from "socket.io";

const onRequestEffect = (
  event: {
    type: string;
    effect: string;
    table_id: string;
    username: string;
    producerId: string;
  },
  io: SocketIOServer
) => {
  const msg = {
    type: "acceptEffect",
    effect: event.effect,
    producerId: event.producerId,
  };
  io.to(`${event.table_id}_${event.username}`).emit("message", msg);
};

export default onRequestEffect;
