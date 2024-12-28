import { Router } from "mediasoup/node/lib/Router";
import { Server as SocketIOServer } from "socket.io";
import { workersMap } from "../mediasoupVars";
import { getNextWorker, getWorkerByIdx } from "../workerManager";
import { onGetRouterRtpCapabilitiesType } from "../mediasoupTypes";

const onGetRouterRtpCapabilities = (
  event: onGetRouterRtpCapabilitiesType,
  io: SocketIOServer
) => {
  const { table_id, username, instance } = event.header;

  // Get the next available worker and router if one doesn't already exist
  let mediasoupRouter: Router;
  if (!workersMap[table_id]) {
    const { router, workerIdx } = getNextWorker();
    workersMap[table_id] = workerIdx;
    mediasoupRouter = router;
  } else {
    const { router } = getWorkerByIdx(workersMap[table_id]);
    mediasoupRouter = router;
  }

  const msg = {
    type: "routerCapabilities",
    data: {
      rtpCapabilities: mediasoupRouter.rtpCapabilities,
    },
  };

  io.to(`instance_${table_id}_${username}_${instance}`).emit("message", msg);
};

export default onGetRouterRtpCapabilities;
