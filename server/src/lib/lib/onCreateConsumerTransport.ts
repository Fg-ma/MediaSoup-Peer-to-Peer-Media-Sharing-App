import { Router } from "mediasoup/node/lib/types";
import { Server as SocketIOServer } from "socket.io";
import createWebRtcTransport from "../createWebRtcTransport";
import { roomConsumerTransports } from "../mediasoupVars";

const onCreateConsumerTransport = async (
  event: {
    type: string;
    forceTcp: boolean;
    roomName: string;
    username: string;
  },
  io: SocketIOServer,
  mediasoupRouter: Router
) => {
  try {
    const { transport, params } = await createWebRtcTransport(mediasoupRouter);

    if (!roomConsumerTransports[event.roomName]) {
      roomConsumerTransports[event.roomName] = {};
    }

    roomConsumerTransports[event.roomName][event.username] = transport;

    io.to(`${event.roomName}_${event.username}`).emit("message", {
      type: "consumerTransportCreated",
      params: params,
    });
  } catch (error) {
    console.error(error);
    io.to(`${event.roomName}_${event.username}`).emit("error", error);
  }
};

export default onCreateConsumerTransport;
