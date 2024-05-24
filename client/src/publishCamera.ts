import * as mediasoup from "mediasoup-client";
import { Socket } from "socket.io-client";

const publishCamera = (
  handleDisableEnableBtns: (disabled: boolean) => void,
  isWebcam: React.MutableRefObject<boolean>,
  setWebcamActive: (value: React.SetStateAction<boolean>) => void,
  socket: React.MutableRefObject<Socket>,
  device: React.MutableRefObject<mediasoup.types.Device | undefined>,
  roomName: React.MutableRefObject<string>,
  username: React.MutableRefObject<string>,
  cameraCount: React.MutableRefObject<number>,
  cameraStreams: React.MutableRefObject<{
    [webcamId: string]: MediaStream;
  }>
) => {
  if (!roomName.current || !username.current) {
    console.error("Missing roomName or username!");
    return;
  }
  handleDisableEnableBtns(true);
  isWebcam.current = !isWebcam.current;
  setWebcamActive((prev) => !prev);

  if (isWebcam.current) {
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
  } else if (!isWebcam.current) {
    for (let i = cameraCount.current; i >= 0; i--) {
      const streamKey = `${username.current}_camera_stream_${i}`;

      if (streamKey in cameraStreams.current) {
        const msg = {
          type: "removeProducer",
          roomName: roomName.current,
          username: username.current,
          producerType: "webcam",
          producerId: `${username.current}_camera_stream_${i}`,
        };
        socket.current.emit("message", msg);
        break;
      }
    }
  }
};

export default publishCamera;
