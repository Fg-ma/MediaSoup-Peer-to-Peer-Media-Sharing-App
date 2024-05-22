import { Server as SocketIOServer } from "socket.io";
import { roomConsumerTransports, roomConsumers } from "../mediasoupVars";

const onMuteLock = (
  event: {
    type: string;
    isMuteLock: boolean;
    roomName: string;
    username: string;
  },
  io: SocketIOServer
) => {
  const msg = {
    type: "muteLockChange",
    isMuteLock: event.isMuteLock,
    username: event.username,
  };
  io.to(event.roomName).emit("message", msg);
};

export default onMuteLock;
