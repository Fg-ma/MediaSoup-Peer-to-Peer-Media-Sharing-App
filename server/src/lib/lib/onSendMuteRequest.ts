import { Server as SocketIOServer } from "socket.io";

const onSendMuteRequest = (
  event: {
    type: string;
    roomName: string;
    username: string;
  },
  io: SocketIOServer
) => {
  const msg = {
    type: "muteRequest",
  };
  io.to(`${event.roomName}_${event.username}`).emit("message", msg);
};

export default onSendMuteRequest;
