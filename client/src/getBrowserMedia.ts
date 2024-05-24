import * as mediasoup from "mediasoup-client";

const getBrowserMedia = async (
  type: string,
  device: React.MutableRefObject<mediasoup.types.Device | undefined>,
  newCameraBtnRef: React.RefObject<HTMLButtonElement>,
  webcamBtnRef: React.RefObject<HTMLButtonElement>,
  screenBtnRef: React.RefObject<HTMLButtonElement>,
  audioBtnRef: React.RefObject<HTMLButtonElement>,
  isScreen: React.MutableRefObject<boolean>,
  setScreenActive: React.Dispatch<React.SetStateAction<boolean>>
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
    if (webcamBtnRef.current) webcamBtnRef.current.disabled = false;
    if (screenBtnRef.current) screenBtnRef.current.disabled = false;
    if (audioBtnRef.current) audioBtnRef.current.disabled = false;
    if (newCameraBtnRef.current) newCameraBtnRef.current.disabled = false;
    if (type === "screen") {
      isScreen.current = false;
      setScreenActive(false);
    }
    console.error("Error accessing media devices:", error);
    return;
  }
};

export default getBrowserMedia;
