import * as mediasoup from "mediasoup-client";

const onRouterCapabilities = async (
  event: {
    type: "routerCapabilities";
    rtpCapabilities: mediasoup.types.RtpCapabilities;
  },
  device: React.MutableRefObject<mediasoup.types.Device | undefined>
) => {
  try {
    device.current = new mediasoup.Device();
  } catch (error: any) {
    if (error.name === "UnsupportedError") {
      console.error("Browser not supported");
    } else {
      console.error("Error loading device: ", error);
    }
    return;
  }
  await device.current?.load({ routerRtpCapabilities: event.rtpCapabilities });
};

export default onRouterCapabilities;
