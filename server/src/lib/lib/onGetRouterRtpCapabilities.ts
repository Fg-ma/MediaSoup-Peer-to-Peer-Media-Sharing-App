import { Router } from "mediasoup/node/lib/types";
import { MediasoupSocket } from "../mediasoupTypes";

const onGetRouterRtpCapabilities = (
  socket: MediasoupSocket,
  mediasoupRouter: Router
) => {
  socket.emit("message", {
    type: "routerCapabilities",
    rtpCapabilities: mediasoupRouter.rtpCapabilities,
  });
};

export default onGetRouterRtpCapabilities;
