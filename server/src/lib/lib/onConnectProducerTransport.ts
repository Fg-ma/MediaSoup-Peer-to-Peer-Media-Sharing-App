import { DtlsParameters } from "mediasoup/node/lib/types";
import { Server as SocketIOServer } from "socket.io";
import { roomProducerTransports } from "../mediasoupVars";

const onConnectProducerTransport = async (
  event: {
    type: string;
    dtlsParameters: DtlsParameters;
    table_id: "string";
    username: "string";
  },
  io: SocketIOServer
) => {
  if (
    !roomProducerTransports[event.table_id] ||
    !roomProducerTransports[event.table_id][event.username]
  ) {
    console.error("No producer transport found for: ", event.username);
    return;
  }

  await roomProducerTransports[event.table_id][event.username].connect({
    dtlsParameters: event.dtlsParameters,
  });
  io.to(`${event.table_id}_${event.username}`).emit("message", {
    type: "producerConnected",
    data: "producer connected",
  });
};

export default onConnectProducerTransport;
