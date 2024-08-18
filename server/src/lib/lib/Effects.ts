import { Server as SocketIOServer } from "socket.io";

class Effects {
  private io: SocketIOServer;

  constructor(io: SocketIOServer) {
    this.io = io;
  }

  onRequestEffect(event: {
    type: string;
    effect: string;
    table_id: string;
    username: string;
    producerId: string;
  }) {
    const msg = {
      type: "acceptEffect",
      effect: event.effect,
      producerId: event.producerId,
    };
    this.io.to(`user_${event.table_id}_${event.username}`).emit("message", msg);
  }
}

export default Effects;
