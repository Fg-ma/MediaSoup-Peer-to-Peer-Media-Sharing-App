import { Router } from "mediasoup/node/lib/Router";
import { getNextWorker, getWorkerByIdx } from "./workerManager";
import { workersMap, onGetRouterRtpCapabilitiesType } from "../typeConstant";
import { broadcaster } from "../index";

const onGetRouterRtpCapabilities = (event: onGetRouterRtpCapabilitiesType) => {
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

  broadcaster.broadcastToInstance(table_id, username, instance, msg);
};

export default onGetRouterRtpCapabilities;
