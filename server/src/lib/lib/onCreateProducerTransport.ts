import { RtpCapabilities } from "mediasoup/node/lib/types";
import { Server as SocketIOServer } from "socket.io";
import { roomProducerTransports, workersMap } from "../mediasoupVars";
import createWebRtcTransport from "../createWebRtcTransport";
import { getNextWorker, getWorkerByIdx } from "../workerManager";

const onCreateProducerTransport = async (
  event: {
    type: string;
    forceTcp: boolean;
    rtpCapabilities: RtpCapabilities;
    producerType: string;
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

    if (
      !roomProducerTransports[event.table_id] ||
      !roomProducerTransports[event.table_id][event.username]
    ) {
      const { transport, params } = await createWebRtcTransport(
        mediasoupRouter
      );
      if (!roomProducerTransports[event.table_id]) {
        roomProducerTransports[event.table_id] = {};
      }

      roomProducerTransports[event.table_id][event.username] = transport;
      io.to(`${event.table_id}_${event.username}`).emit("message", {
        type: "producerTransportCreated",
        params: params,
      });
    } else if (
      roomProducerTransports[event.table_id] &&
      roomProducerTransports[event.table_id][event.username]
    ) {
      const msg = {
        type: "newProducer",
        producerType: event.producerType,
      };
      io.to(`${event.table_id}_${event.username}`).emit("message", msg);
    }
  } catch (error) {
    console.error(error);
    io.to(`${event.table_id}_${event.username}`).emit("message", {
      type: "producerTransportCreated",
      error,
    });
  }
};

export default onCreateProducerTransport;
