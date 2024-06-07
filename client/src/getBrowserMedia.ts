import * as mediasoup from "mediasoup-client";

const getBrowserMedia = async (
  type: string,
  device: React.MutableRefObject<mediasoup.types.Device | undefined>,
  handleDisableEnableBtns: (disabled: boolean) => void,
  isScreen: React.MutableRefObject<boolean>,
  setScreenActive: React.Dispatch<React.SetStateAction<boolean>>,
  isWebcam: React.MutableRefObject<boolean>,
  setWebcamActive: React.Dispatch<React.SetStateAction<boolean>>,
  userCameraStreams: React.MutableRefObject<{
    [webcamId: string]: MediaStream;
  }>,
  userScreenStreams: React.MutableRefObject<{
    [screenId: string]: MediaStream;
  }>
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
    let stream;
    if (type === "webcam" || type === "audio") {
      stream = await navigator.mediaDevices.getUserMedia(constraints);
    } else if (type === "screen") {
      stream = await navigator.mediaDevices.getDisplayMedia(constraints);
    } else {
      throw new Error("Invalid media type");
    }

    return stream;
  } catch (error) {
    handleDisableEnableBtns(false);
    if (
      type === "screen" &&
      Object.keys(userScreenStreams.current).length === 0
    ) {
      isScreen.current = false;
      setScreenActive(false);
    }
    if (
      type === "webcam" &&
      Object.keys(userCameraStreams.current).length === 0
    ) {
      isWebcam.current = false;
      setWebcamActive(false);
    }
    console.error("Error accessing media devices:", error);
    return;
  }
};

export default getBrowserMedia;
