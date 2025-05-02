import { Router } from "mediasoup/node/lib/Router";
import { getNextWorker, getWorkerByIdx } from "./workerManager";
import { workersMap, onGetRouterRtpCapabilitiesType } from "../typeConstant";
import { broadcaster } from "../index";

const onGetRouterRtpCapabilities = (event: onGetRouterRtpCapabilitiesType) => {
  const { tableId, username, instance } = event.header;

  // Get the next available worker and router if one doesn't already exist
  let mediasoupRouter: Router;
  if (!workersMap[tableId]) {
    const { router, workerIdx } = getNextWorker();
    workersMap[tableId] = workerIdx;
    mediasoupRouter = router;
  } else {
    const { router } = getWorkerByIdx(workersMap[tableId]);
    mediasoupRouter = router;
  }

  const msg = {
    type: "routerCapabilities",
    data: {
      rtpCapabilities: mediasoupRouter.rtpCapabilities,
    },
  };

  broadcaster.broadcastToInstance(tableId, username, instance, msg);
};

export default onGetRouterRtpCapabilities;
