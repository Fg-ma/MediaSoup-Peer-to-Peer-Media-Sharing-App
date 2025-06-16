import { z } from "zod";
import { Router } from "mediasoup/node/lib/types";
import { getNextWorker, getWorkerByIdx } from "./workerManager";
import { workersMap, onGetRouterRtpCapabilitiesType } from "../typeConstant";
import { broadcaster, sanitizationUtils } from "../index";

const getRouterRtpCapabilitiesSchema = z.object({
  type: z.literal("getRouterRtpCapabilities"),
  header: z.object({
    tableId: z.string(),
    username: z.string(),
    instance: z.string(),
  }),
});

const onGetRouterRtpCapabilities = (event: onGetRouterRtpCapabilitiesType) => {
  const safeEvent = sanitizationUtils.sanitizeObject(
    event
  ) as onGetRouterRtpCapabilitiesType;
  const validation = getRouterRtpCapabilitiesSchema.safeParse(safeEvent);
  if (!validation.success) {
    console.log("Warning, ", event.type, " failed to validate event");
    return;
  }
  const { tableId, username, instance } = safeEvent.header;

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
