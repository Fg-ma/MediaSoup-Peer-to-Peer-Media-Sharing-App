import { Router } from "mediasoup/node/lib/Router";
import { Server as SocketIOServer } from "socket.io";
import { workersMap } from "../mediasoupVars";
import { getNextWorker, getWorkerByIdx } from "../workerManager";

const onGetRouterRtpCapabilities = (
  event: { type: string; table_id: string; username: string; instance: string },
  io: SocketIOServer
) => {
  // Get the next available worker and router if one doesn't already exist
  let mediasoupRouter: Router;
  if (!workersMap[event.table_id]) {
    const { router, workerIdx } = getNextWorker();
    workersMap[event.table_id] = workerIdx;
    mediasoupRouter = router;
  } else {
    const { router } = getWorkerByIdx(workersMap[event.table_id]);
    mediasoupRouter = router;
  }

  const msg = {
    type: "routerCapabilities",
    rtpCapabilities: mediasoupRouter.rtpCapabilities,
  };

  io.to(`instance_${event.table_id}_${event.username}_${event.instance}`).emit(
    "message",
    msg
  );
};

export default onGetRouterRtpCapabilities;
