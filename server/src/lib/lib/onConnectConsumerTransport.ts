import { DtlsParameters } from "mediasoup/node/lib/types";
import { Server as SocketIOServer } from "socket.io";
import { roomConsumerTransports } from "../mediasoupVars";

const onConnectConsumerTransport = async (
  event: {
    type: string;
    transportId: string;
    dtlsParameters: DtlsParameters;
    roomName: string;
    username: string;
  },
  io: SocketIOServer
) => {
  if (
    !roomConsumerTransports[event.roomName] ||
    !roomConsumerTransports[event.roomName][event.username]
  ) {
    console.error("No consumer transport found for: ", event.username);
    return;
  }

  await roomConsumerTransports[event.roomName][event.username].connect({
    dtlsParameters: event.dtlsParameters,
  });

  io.to(`${event.roomName}_${event.username}`).emit("message", {
    type: "consumerTransportConnected",
    data: "consumer transport connected",
  });
};

export default onConnectConsumerTransport;
