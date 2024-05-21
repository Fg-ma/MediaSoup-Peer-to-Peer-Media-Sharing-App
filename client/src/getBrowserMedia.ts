import * as mediasoup from "mediasoup-client";

const getBrowserMedia = async (
  type: string,
  device: React.MutableRefObject<mediasoup.types.Device | undefined>
) => {
  if (
    type === "webcam" &&
    device.current &&
    !device.current.canProduce("video")
  ) {
    console.error("Cannot produce video");
    return;
  }

  if (
    type === "audio" &&
    device.current &&
    !device.current.canProduce("audio")
  ) {
    console.error("Cannot produce audio");
    return;
  }

  const constraints: MediaStreamConstraints =
    type === "webcam" || type === "screen"
      ? { video: true, audio: false }
      : { video: false, audio: true };

  try {
    const stream = await (type === "webcam"
      ? navigator.mediaDevices.getUserMedia(constraints)
      : type === "screen"
      ? navigator.mediaDevices.getDisplayMedia(constraints)
      : navigator.mediaDevices.getUserMedia(constraints));
    return stream;
  } catch (error) {
    console.error("Error accessing media devices:", error);
    return;
  }
};

export default getBrowserMedia;
