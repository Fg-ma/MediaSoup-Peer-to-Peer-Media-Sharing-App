import { MediasoupSocket } from "../mediasoupTypes";
import { getNextWorker } from "../workerManager";

const onGetRouterRtpCapabilities = (socket: MediasoupSocket) => {
  // Get the next available worker and router
  const { router: mediasoupRouter } = getNextWorker();

  socket.emit("message", {
    type: "routerCapabilities",
    rtpCapabilities: mediasoupRouter.rtpCapabilities,
  });
};

export default onGetRouterRtpCapabilities;
