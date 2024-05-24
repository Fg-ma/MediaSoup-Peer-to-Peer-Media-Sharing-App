import * as mediasoup from "mediasoup-client";
import { Socket } from "socket.io-client";

const publishNewCamera = (
  newCameraBtnRef: React.RefObject<HTMLButtonElement>,
  webcamBtnRef: React.RefObject<HTMLButtonElement>,
  screenBtnRef: React.RefObject<HTMLButtonElement>,
  audioBtnRef: React.RefObject<HTMLButtonElement>,
  cameraCount: React.MutableRefObject<number>,
  socket: React.MutableRefObject<Socket>,
  device: React.MutableRefObject<mediasoup.types.Device | undefined>,
  roomName: React.MutableRefObject<string>,
  username: React.MutableRefObject<string>
) => {
  if (!roomName.current || !username.current) {
    console.error("Missing roomName or username!");
    return;
  }
  newCameraBtnRef.current!.disabled = true;
  webcamBtnRef.current!.disabled = true;
  screenBtnRef.current!.disabled = true;
  audioBtnRef.current!.disabled = true;
  cameraCount.current = cameraCount.current + 1;

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
};

export default publishNewCamera;
