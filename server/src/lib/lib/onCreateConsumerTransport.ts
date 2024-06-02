import { Server as SocketIOServer } from "socket.io";
import createWebRtcTransport from "../createWebRtcTransport";
import { roomConsumerTransports, workersMap } from "../mediasoupVars";
import { getNextWorker, getWorkerByIdx } from "../workerManager";

const onCreateConsumerTransport = async (
  event: {
    type: string;
    forceTcp: boolean;
    table_id: string;
    username: string;
  },
  io: SocketIOServer
) => {
  try {
    // Get the next available worker and router if one doesn't already exist
    let mediasoupRouter;
    if (!workersMap[event.table_id]) {
      const { router, workerIdx } = getNextWorker();
      workersMap[event.table_id] = workerIdx;
      mediasoupRouter = router;
    } else {
      const { router } = getWorkerByIdx(workersMap[event.table_id]);
      mediasoupRouter = router;
    }

    const { transport, params } = await createWebRtcTransport(mediasoupRouter);

    if (!roomConsumerTransports[event.table_id]) {
      roomConsumerTransports[event.table_id] = {};
    }

    roomConsumerTransports[event.table_id][event.username] = transport;

    io.to(`${event.table_id}_${event.username}`).emit("message", {
      type: "consumerTransportCreated",
      params: params,
    });
  } catch (error) {
    console.error(error);
    io.to(`${event.table_id}_${event.username}`).emit("error", error);
  }
};

export default onCreateConsumerTransport;
