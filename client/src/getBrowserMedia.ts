import * as mediasoup from "mediasoup-client";

const getBrowserMedia = async (
  type: "camera" | "screen" | "audio",
  device: React.MutableRefObject<mediasoup.types.Device | undefined>,
  handleDisableEnableBtns: (disabled: boolean) => void,
  isScreen: React.MutableRefObject<boolean>,
  setScreenActive: React.Dispatch<React.SetStateAction<boolean>>,
  isCamera: React.MutableRefObject<boolean>,
  setCameraActive: React.Dispatch<React.SetStateAction<boolean>>,
  userStreams: React.MutableRefObject<{
    camera: {
      [cameraId: string]: MediaStream;
    };
    screen: {
      [screenId: string]: MediaStream;
    };
    audio: MediaStream | undefined;
  }>
) => {
  if (
    type === "camera" &&
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
    type === "camera" || type === "screen"
      ? { video: true, audio: false }
      : { video: false, audio: true };

  try {
    let stream;
    if (type === "camera" || type === "audio") {
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
      type === "camera" &&
      Object.keys(userStreams.current.camera).length === 0
    ) {
      isCamera.current = false;
      setCameraActive(false);
    }
    if (
      type === "screen" &&
      Object.keys(userStreams.current.screen).length === 0
    ) {
      isScreen.current = false;
      setScreenActive(false);
    }
    console.error("Error accessing media devices:", error);
    return;
  }
};

export default getBrowserMedia;
