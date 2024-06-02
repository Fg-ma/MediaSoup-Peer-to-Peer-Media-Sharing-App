import { DtlsParameters } from "mediasoup/node/lib/types";
import { Server as SocketIOServer } from "socket.io";
import { roomConsumerTransports } from "../mediasoupVars";

const onConnectConsumerTransport = async (
  event: {
    type: string;
    transportId: string;
    dtlsParameters: DtlsParameters;
    table_id: string;
    username: string;
  },
  io: SocketIOServer
) => {
  if (
    !roomConsumerTransports[event.table_id] ||
    !roomConsumerTransports[event.table_id][event.username]
  ) {
    console.error("No consumer transport found for: ", event.username);
    return;
  }

  await roomConsumerTransports[event.table_id][event.username].connect({
    dtlsParameters: event.dtlsParameters,
  });

  io.to(`${event.table_id}_${event.username}`).emit("message", {
    type: "consumerTransportConnected",
    data: "consumer transport connected",
  });
};

export default onConnectConsumerTransport;
