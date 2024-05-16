import * as mediasoup from "mediasoup-client";

const getBrowserMedia = async (
  type: string,
  device: React.MutableRefObject<mediasoup.types.Device | undefined>
) => {
  if (device.current && !device.current.canProduce("video")) {
    console.error("Cannot produce video");
    return;
  }

  const constraints: MediaStreamConstraints =
    type === "webcam" ? { video: true, audio: true } : { video: true };

  try {
    const stream = await (type === "webcam"
      ? navigator.mediaDevices.getUserMedia(constraints)
      : navigator.mediaDevices.getDisplayMedia(constraints));

    return stream;
  } catch (error) {
    console.error("Error accessing media devices:", error);
    return;
  }
};

export default getBrowserMedia;
