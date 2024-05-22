import * as mediasoup from "mediasoup-client";
import { Socket } from "socket.io-client";

const publishCamera = (
  isWebcam: React.MutableRefObject<boolean>,
  webcamBtnRef: React.RefObject<HTMLButtonElement>,
  screenBtnRef: React.RefObject<HTMLButtonElement>,
  audioBtnRef: React.RefObject<HTMLButtonElement>,
  setWebcamActive: (value: React.SetStateAction<boolean>) => void,
  socket: React.MutableRefObject<Socket>,
  device: React.MutableRefObject<mediasoup.types.Device | undefined>,
  roomName: React.MutableRefObject<string>,
  username: React.MutableRefObject<string>
) => {
  if (!roomName.current || !username.current) {
    console.error("Missing roomName or username!");
    return;
  }
  webcamBtnRef.current!.disabled = true;
  screenBtnRef.current!.disabled = true;
  audioBtnRef.current!.disabled = true;
  isWebcam.current = !isWebcam.current;
  setWebcamActive((prev) => !prev);

  if (isWebcam.current) {
    if (device.current) {
      const msg = {
        type: "createProducerTransport",
        forceTcp: false,
        rtpCapabilities: device.current.rtpCapabilities,
        producerType: "webcam",
        roomName: roomName.current,
        username: username.current,
      };
      socket.current.emit("message", msg);
    }
  } else if (!isWebcam.current) {
    const msg = {
      type: "removeProducer",
      roomName: roomName.current,
      username: username.current,
      producerType: "webcam",
    };
    socket.current.emit("message", msg);
  }
};

export default publishCamera;
