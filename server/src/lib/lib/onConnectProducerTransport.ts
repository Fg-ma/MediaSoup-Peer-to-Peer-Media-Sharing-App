import { DtlsParameters } from "mediasoup/node/lib/types";
import { Server as SocketIOServer } from "socket.io";
import { roomProducerTransports } from "../mediasoupVars";

const onConnectProducerTransport = async (
  event: {
    type: string;
    dtlsParameters: DtlsParameters;
    roomName: "string";
    username: "string";
  },
  io: SocketIOServer
) => {
  if (
    !roomProducerTransports[event.roomName] ||
    !roomProducerTransports[event.roomName][event.username]
  ) {
    console.error("No producer transport found for: ", event.username);
    return;
  }

  await roomProducerTransports[event.roomName][event.username].connect({
    dtlsParameters: event.dtlsParameters,
  });
  io.to(`${event.roomName}_${event.username}`).emit("message", {
    type: "producerConnected",
    data: "producer connected",
  });
};

export default onConnectProducerTransport;
